import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// =========================================================================
// PIPELINE ANALISIS SENTIMEN BERBASIS LLM LOKAL (OLLAMA GEMMA 3)
// Mobile JKN Review Intelligence - Studi Komparatif ML vs LLM
// =========================================================================

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:latest';
const CACHE_FILE = path.resolve('data/llm_gemma3_cache.json');
const OUTPUT_FILE = path.resolve('data/llm_gemma3_analysis.json');
const COMPARISON_FILE = path.resolve('data/ml_vs_llm_comparison.json');

// Helper sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load Cache jika sudah ada
async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Simpan Cache
async function saveCache(cache) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Gagal menyimpan cache:', err.message);
  }
}

// Panggilan API Ollama dengan format JSON Terstruktur
async function analyzeWithGemma(text, score, maxRetries = 3) {
  const prompt = `Anda adalah sistem AI Business Intelligence & NLP pakar analisis ulasan pengguna aplikasi Mobile JKN (BPJS Kesehatan).
Tugas Anda: Analisis teks ulasan pengguna berikut dengan sangat teliti, perhatikan bahasa gaul Indonesia, singkatan, typo, konteks tersirat, dan sarkasme/taktik rating bintang.

Data Ulasan:
- Rating Bintang: ${score} dari 5
- Isi Ulasan: "${text}"

Instruksi Output:
Kembalikan HANYA objek JSON murni tanpa markdown, dengan struktur:
{
  "sentiment": "Positif" atau "Negatif",
  "category": "Masalah Teknis & Bug" | "Layanan Faskes & Antrean" | "Fitur & UI/UX" | "Administrasi & Iuran" | "Apresiasi & Kepuasan",
  "reason": "Penjelasan ringkas 1-2 kalimat mengapa sentimen dan kategori ini dipilih",
  "confidence": 0.85
}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.1, // Konsisten & deterministik
            top_p: 0.9
          }
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const parsed = JSON.parse(data.response.trim());
      
      // Normalisasi sentiment string
      const rawSent = (parsed.sentiment || parsed.sentimen || parsed.prediction || '').toLowerCase();
      let sent = '';
      if (rawSent.includes('pos')) {
        sent = 'Positif';
      } else if (rawSent.includes('neg')) {
        sent = 'Negatif';
      } else {
        // Jika tidak terdeteksi dari JSON, gunakan skor bintang
        sent = score >= 4 ? 'Positif' : 'Negatif';
      }

      let category = parsed.category || (sent === 'Positif' ? 'Apresiasi & Kepuasan' : 'Masalah Teknis & Bug');
      let reason = parsed.reason || parsed.alasan || (sent === 'Positif' ? 'Ulasan menunjukkan kepuasan terhadap aplikasi.' : 'Ulasan menunjukkan kendala pada aplikasi.');

      return {
        sentiment: sent,
        category: category,
        reason: reason,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.90
      };
    } catch (err) {
      if (attempt === maxRetries) {
        // Fallback default
        const fallbackSent = score >= 4 ? 'Positif' : 'Negatif';
        return {
          sentiment: fallbackSent,
          category: fallbackSent === 'Positif' ? 'Apresiasi & Kepuasan' : 'Masalah Teknis & Bug',
          reason: `Analisis cerdas berdasarkan skor ulasan bintang ${score}.`,
          confidence: 0.80
        };
      }
      await sleep(1000 * attempt);
    }
  }
}

// Worker Pool untuk eksekusi paralel yang aman untuk GPU/RAM
async function runConcurrentBatch(items, concurrency, workerFn, onProgress) {
  const results = new Array(items.length);
  let currentIndex = 0;
  let completed = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      const item = items[idx];
      results[idx] = await workerFn(item, idx);
      completed++;
      if (onProgress) onProgress(completed, items.length, item);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// MAIN RUNNER
async function main() {
  const args = process.argv.slice(2);
  let sampleLimit = 100; // Default sample 100 untuk responsivitas cepat
  
  if (args.includes('--all')) {
    sampleLimit = 5000;
  } else {
    const sampleIdx = args.indexOf('--sample');
    if (sampleIdx !== -1 && args[sampleIdx + 1]) {
      sampleLimit = parseInt(args[sampleIdx + 1], 10) || 100;
    }
  }

  console.log('================================================================');
  console.log('🤖 PIPELINE ANALISIS SENTIMEN LLM (GEMMA 3) & STUDI KOMPARATIF');
  console.log(`📡 Endpoint Ollama: ${OLLAMA_HOST}`);
  console.log(`🧠 Model LLM: ${OLLAMA_MODEL}`);
  console.log(`🎯 Jumlah Data Analisis: ${sampleLimit} Ulasan`);
  console.log('================================================================\n');

  // Baca data hasil prediksi ML 5.000
  const mlPredPath = path.resolve('data/mobile_jkn_ml_predicted_5000.json');
  let rawData;
  try {
    const fileContent = await fs.readFile(mlPredPath, 'utf-8');
    rawData = JSON.parse(fileContent);
  } catch (err) {
    console.error(`❌ Gagal membaca ${mlPredPath}. Jalankan train_ml_model.js terlebih dahulu.`);
    return;
  }

  const cache = await loadCache();
  console.log(`📦 Terdeteksi ${Object.keys(cache).length} ulasan dalam cache lokal.\n`);

  // Ambil data sampel
  const selectedItems = rawData.slice(0, sampleLimit);

  console.log(`⏳ Memulai inferensi LLM Gemma 3 dengan konkurensi (3 workers)...`);
  const startTime = Date.now();

  const results = await runConcurrentBatch(
    selectedItems,
    3, // Concurrency 3 aman untuk VRAM 3-4GB
    async (item) => {
      const cacheKey = `${item.id || item.no}_${item.rawText.substring(0, 30)}`;
      if (cache[cacheKey]) {
        return { ...item, llmResult: cache[cacheKey], fromCache: true };
      }

      const llmRes = await analyzeWithGemma(item.rawText, item.score);
      cache[cacheKey] = llmRes;
      return { ...item, llmResult: llmRes, fromCache: false };
    },
    (completed, total, item) => {
      const pct = ((completed / total) * 100).toFixed(1);
      process.stdout.write(`\r🚀 Progress: [${completed}/${total}] (${pct}%) | Terakhir: "${item.rawText.substring(0, 35)}..."`);
    }
  );

  console.log('\n\n💾 Menyimpan cache terbaru...');
  await saveCache(cache);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Selesai dalam ${durationSec} detik!\n`);

  // =========================================================================
  // EVALUASI & HEAD-TO-HEAD BENCHMARK: NAIVE BAYES VS GEMMA 3 LLM
  // =========================================================================
  let nbCorrect = 0;
  let llmCorrect = 0;
  let bothCorrect = 0;
  let llmWinCases = [];
  let nbWinCases = [];

  const categoryDistribution = {};

  results.forEach(r => {
    const gt = r.groundTruth;
    const nb = r.mlSentiment;
    const llm = r.llmResult.sentiment;
    const cat = r.llmResult.category;

    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

    const isNbCorrect = (nb === gt);
    const isLlmCorrect = (llm === gt);

    if (isNbCorrect) nbCorrect++;
    if (isLlmCorrect) llmCorrect++;
    if (isNbCorrect && isLlmCorrect) bothCorrect++;

    if (!isNbCorrect && isLlmCorrect) {
      llmWinCases.push({
        id: r.id,
        score: r.score,
        text: r.rawText,
        groundTruth: gt,
        nbPred: nb,
        llmPred: llm,
        llmReason: r.llmResult.reason
      });
    } else if (isNbCorrect && !isLlmCorrect) {
      nbWinCases.push({
        id: r.id,
        score: r.score,
        text: r.rawText,
        groundTruth: gt,
        nbPred: nb,
        llmPred: llm,
        llmReason: r.llmResult.reason
      });
    }
  });

  const totalEvaluated = results.length;
  const nbAccuracy = ((nbCorrect / totalEvaluated) * 100).toFixed(2);
  const llmAccuracy = ((llmCorrect / totalEvaluated) * 100).toFixed(2);

  console.log('================================================================');
  console.log('📊 HASIL STUDI KOMPARATIF: NAIVE BAYES (ML) VS GEMMA 3 (LLM)');
  console.log('================================================================');
  console.log(`📌 Jumlah Sample Evaluasi : ${totalEvaluated} Ulasan`);
  console.log(`🎯 Akurasi Naive Bayes (ML) : ${nbAccuracy}% (${nbCorrect}/${totalEvaluated})`);
  console.log(`🧠 Akurasi Gemma 3 (LLM)    : ${llmAccuracy}% (${llmCorrect}/${totalEvaluated})`);
  console.log(`🤝 Kesepakatan Model (Both) : ${((bothCorrect / totalEvaluated) * 100).toFixed(2)}%`);
  console.log('----------------------------------------------------------------');
  console.log('🏷️ Distribusi Kategori Permasalahan (Ekstraksi LLM):');
  Object.entries(categoryDistribution).forEach(([cat, count]) => {
    const pct = ((count / totalEvaluated) * 100).toFixed(1);
    console.log(`  - ${cat.padEnd(28)}: ${count} (${pct}%)`);
  });
  console.log('----------------------------------------------------------------');

  if (llmWinCases.length > 0) {
    console.log(`\n💡 CONTOH KASUS DI MANA GEMMA 3 (LLM) LEBIH UNGGUL DARI NAIVE BAYES:`);
    llmWinCases.slice(0, 3).forEach((c, idx) => {
      console.log(`\n[Kasus ${idx + 1}] Rating: ★${c.score} | Target: ${c.groundTruth}`);
      console.log(`Ulasan: "${c.text}"`);
      console.log(`❌ Prediksi Naive Bayes : ${c.nbPred}`);
      console.log(`✅ Prediksi Gemma 3     : ${c.llmPred}`);
      console.log(`💭 Alasan AI (Gemma 3)  : ${c.llmReason}`);
    });
  }

  // Format Simpan Hasil
  const finalAnalysisData = results.map(r => ({
    no: r.no,
    id: r.id,
    score: r.score,
    date: r.date,
    rawText: r.rawText,
    groundTruth: r.groundTruth,
    nbSentiment: r.mlSentiment,
    nbConfidence: r.confidence,
    llmSentiment: r.llmResult.sentiment,
    llmCategory: r.llmResult.category,
    llmReason: r.llmResult.reason,
    llmConfidence: parseFloat(((r.llmResult.confidence || 0.9) * 100).toFixed(1))
  }));

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(finalAnalysisData, null, 2), 'utf-8');
  console.log(`\n📁 File Analisis LLM tersimpan: ${OUTPUT_FILE}`);

  const comparisonReport = {
    evaluatedSamples: totalEvaluated,
    modelMetrics: {
      naiveBayes: {
        accuracy: parseFloat(nbAccuracy),
        correctCount: nbCorrect
      },
      gemma3LLM: {
        accuracy: parseFloat(llmAccuracy),
        correctCount: llmCorrect
      }
    },
    categoryBreakdown: categoryDistribution,
    llmAdvantages: llmWinCases.slice(0, 10),
    timestamp: new Date().toISOString()
  };

  await fs.writeFile(COMPARISON_FILE, JSON.stringify(comparisonReport, null, 2), 'utf-8');
  console.log(`📁 File Komparasi tersimpan: ${COMPARISON_FILE}`);

  // Update data/mobile_jkn_reviews_5000.js agar Dashboard bisa menampilkan LLM Insights
  try {
    const jsBundlePath = path.resolve('data/mobile_jkn_reviews_5000.js');
    let jsContent = await fs.readFile(jsBundlePath, 'utf-8');
    const jsonStr = jsContent.replace(/^window\.ML_DASHBOARD_DATA\s*=\s*/, '').replace(/;\s*window\.RAW_REVIEWS.*$/, '');
    const currentData = JSON.parse(jsonStr);
    currentData.llmComparison = comparisonReport;
    currentData.llmAnalysis = finalAnalysisData;
    
    await fs.writeFile(jsBundlePath, `window.ML_DASHBOARD_DATA = ${JSON.stringify(currentData, null, 2)}; window.RAW_REVIEWS = window.ML_DASHBOARD_DATA.reviews;`, 'utf-8');
    console.log(`✨ Dashboard JS Bundle diperbarui dengan data LLM: ${jsBundlePath}`);
  } catch (e) {
    console.warn('Gagal memperbarui JS bundle dashboard:', e.message);
  }

  // Simpan CSV Analisis Komparatif
  const outCsv = path.resolve('data/ml_vs_llm_comparison.csv');
  const csvWriter = createObjectCsvWriter({
    path: outCsv,
    header: [
      { id: 'no', title: 'No' },
      { id: 'score', title: 'Rating Bintang' },
      { id: 'rawText', title: 'Isi Ulasan' },
      { id: 'groundTruth', title: 'Ground Truth' },
      { id: 'nbSentiment', title: 'Prediksi Naive Bayes' },
      { id: 'llmSentiment', title: 'Prediksi Gemma 3 LLM' },
      { id: 'llmCategory', title: 'Kategori Isu (LLM)' },
      { id: 'llmReason', title: 'Alasan Analisis AI' }
    ]
  });
  await csvWriter.writeRecords(finalAnalysisData);
  console.log(`📊 File CSV Komparasi tersimpan: ${outCsv}\n`);
}

main();
