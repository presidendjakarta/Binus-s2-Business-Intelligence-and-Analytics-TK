import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { CONFIG } from '../src/config/constants.js';
import { LLMPipeline } from '../src/llm/llmPipeline.js';

async function main() {
  const args = process.argv.slice(2);
  let sampleLimit = 100;
  
  if (args.includes('--all')) {
    sampleLimit = 5000;
  } else {
    const sampleIdx = args.indexOf('--sample');
    if (sampleIdx !== -1 && args[sampleIdx + 1]) {
      sampleLimit = parseInt(args[sampleIdx + 1], 10) || 100;
    }
  }

  console.log('================================================================');
  console.log('🤖 MODULAR LLM SENTIMENT PIPELINE (GEMMA 3 via OLLAMA)');
  console.log(`📡 Endpoint Ollama: ${CONFIG.OLLAMA_HOST}`);
  console.log(`🧠 Model LLM: ${CONFIG.OLLAMA_MODEL}`);
  console.log(`🎯 Jumlah Data Analisis: ${sampleLimit} Ulasan`);
  console.log('================================================================\n');

  const mlPredData = JSON.parse(await fs.readFile(CONFIG.PATHS.ML_PREDICTED_JSON, 'utf-8'));
  const selectedItems = mlPredData.slice(0, sampleLimit);

  const pipeline = new LLMPipeline();
  const startTime = Date.now();

  const results = await pipeline.runBatch(selectedItems, 3, (completed, total, item) => {
    const pct = ((completed / total) * 100).toFixed(1);
    process.stdout.write(`\r🚀 Progress: [${completed}/${total}] (${pct}%) | Terakhir: "${item.rawText.substring(0, 35)}..."`);
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ Selesai dalam ${durationSec} detik!\n`);

  // Evaluasi Perbandingan
  let nbCorrect = 0;
  let llmCorrect = 0;
  let bothCorrect = 0;
  const categoryDistribution = {};

  results.forEach(r => {
    const gt = r.groundTruth;
    const nb = r.mlSentiment;
    const llm = r.llmResult.sentiment;
    const cat = r.llmResult.category;

    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    if (nb === gt) nbCorrect++;
    if (llm === gt) llmCorrect++;
    if (nb === gt && llm === gt) bothCorrect++;
  });

  const total = results.length;
  console.log('================================================================');
  console.log('📊 HASIL EVALUASI KOMPARATIF: NAIVE BAYES (ML) VS GEMMA 3 (LLM)');
  console.log('================================================================');
  console.log(`📌 Sample Evaluasi          : ${total} Ulasan`);
  console.log(`🎯 Akurasi Naive Bayes (ML) : ${((nbCorrect / total) * 100).toFixed(2)}% (${nbCorrect}/${total})`);
  console.log(`🧠 Akurasi Gemma 3 (LLM)    : ${((llmCorrect / total) * 100).toFixed(2)}% (${llmCorrect}/${total})`);
  console.log(`🤝 Kesepakatan Model (Both) : ${((bothCorrect / total) * 100).toFixed(2)}%`);
  console.log('----------------------------------------------------------------');
  console.log('🏷️ Distribusi Kategori Permasalahan (LLM):');
  Object.entries(categoryDistribution).forEach(([cat, count]) => {
    console.log(`  - ${cat.padEnd(28)}: ${count} (${((count / total) * 100).toFixed(1)}%)`);
  });
  console.log('================================================================\n');

  // Simpan JSON Output
  const finalAnalysis = results.map(r => ({
    no: r.no,
    id: r.id,
    userName: r.userName || 'Pengguna',
    score: r.score,
    date: r.date,
    rawText: r.rawText,
    groundTruth: r.groundTruth,
    nbSentiment: r.mlSentiment,
    confidence: r.confidence,
    probPos: r.probPos,
    probNeu: r.probNeu,
    probNeg: r.probNeg,
    isAnomaly: r.isAnomaly,
    anomalyDesc: r.anomalyDesc,
    version: r.version,
    llmSentiment: r.llmResult.sentiment,
    llmCategory: r.llmResult.category,
    llmReason: r.llmResult.reason,
    llmConfidence: parseFloat(((r.llmResult.confidence || 0.9) * 100).toFixed(1)),
    modelDisagreement: (r.mlSentiment !== r.llmResult.sentiment)
  }));

  await fs.writeFile(CONFIG.PATHS.LLM_ANALYSIS_JSON, JSON.stringify(finalAnalysis, null, 2), 'utf-8');
  console.log(`📁 File Analisis LLM tersimpan: ${CONFIG.PATHS.LLM_ANALYSIS_JSON}`);

  const compReport = {
    evaluatedSamples: total,
    modelMetrics: {
      naiveBayes: { accuracy: parseFloat(((nbCorrect / total) * 100).toFixed(2)), correctCount: nbCorrect },
      gemma3LLM: { accuracy: parseFloat(((llmCorrect / total) * 100).toFixed(2)), correctCount: llmCorrect }
    },
    agreementRate: parseFloat(((bothCorrect / total) * 100).toFixed(2)),
    categoryBreakdown: categoryDistribution,
    timestamp: new Date().toISOString()
  };

  await fs.writeFile(CONFIG.PATHS.ML_VS_LLM_COMPARISON_JSON, JSON.stringify(compReport, null, 2), 'utf-8');
  console.log(`📁 File Komparasi tersimpan: ${CONFIG.PATHS.ML_VS_LLM_COMPARISON_JSON}`);
}

main().catch(err => {
  console.error('❌ LLM Pipeline Error:', err);
  process.exit(1);
});
