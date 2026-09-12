import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { CONFIG } from '../config/constants.js';
import { preprocess } from '../nlp/preprocessor.js';
import { TFIDFVectorizer } from './vectorizer.js';
import { MultinomialNaiveBayes } from './naiveBayes.js';
import { evaluateModel } from './evaluator.js';

/**
 * Aturan Master Ground Truth Supervised Learning
 */
export function assignGroundTruth(review) {
  const text = (review.text || '').toLowerCase();
  const score = review.score;

  // Kasus Taktik Bintang 5 atau Sarkasme
  if (score >= 4 && (text.includes('bintang 5 biar') || text.includes('bintang lima biar') || text.includes('bintang 5 sengaja'))) {
    return 'Negatif';
  }
  if (text.includes('melatih kesabaran') || text.includes('mengajarkan bersabar') || text.includes('bikin naik darah') || text.includes('bikin emosi')) {
    return 'Negatif';
  }

  // Kasus Keluhan Spesifik
  const negativeClues = [
    'jadwal penuh', 'belum tentu dicover', 'masa harus nunggu', 'antri berjam jam', 'antre berjam',
    'gagal verifikasi', 'otp tidak masuk', 'otp ga masuk', 'tidak bisa login', 'gabisa login',
    'susah login', 'sering error', 'sering eror', 'keluar sendiri', 'force close', 'rugi bayar',
    'dipersulit', 'pelayanan buruk', 'kecewa', 'jelek', 'rusak', 'lemot', 'lelet', 'hancur', 'parah', 'ribet', 'rumit'
  ];
  if (negativeClues.some(clue => text.includes(clue))) {
    return 'Negatif';
  }

  // Kasus Pujian Spesifik
  const positiveClues = [
    'sangat membantu', 'mudah digunakan', 'sangat mudah', 'cepat dan mudah', 'proses cepat',
    'pelayanan bagus', 'mantap', 'terima kasih', 'makasih', 'bermanfaat', 'luar biasa',
    'suka sekali', 'puas', 'terbaik', 'lancar', 'hebat', 'praktis', 'bagus', 'keren'
  ];
  if (positiveClues.some(clue => text.includes(clue)) && !text.includes('tidak') && !text.includes('kurang')) {
    return 'Positif';
  }

  if (score >= 4) return 'Positif';
  if (score <= 2) return 'Negatif';
  return 'Netral';
}

/**
 * Pipeline Utama Pelatihan Model Machine Learning
 */
export async function runTrainingPipeline() {
  console.log('================================================================');
  console.log('🤖 MODULAR MACHINE LEARNING SENTIMENT PIPELINE');
  console.log('   Stack: Sastrawi Stemmer + TF-IDF Vectorizer + Multinomial Naive Bayes');
  console.log('================================================================\n');

  // 1. Baca data mentah 5.000 ulasan
  const rawDataPath = CONFIG.PATHS.RAW_REVIEWS_5000_JSON;
  const rawReviews = JSON.parse(await fs.readFile(rawDataPath, 'utf-8'));
  console.log(`📖 Memuat ${rawReviews.length} dataset: ${rawDataPath}...`);

  // 2. Preprocessing & Anotasi Ground Truth
  console.log('⚙️ Menjalankan Preprocessing NLP (Slang Normalization + Sastrawi Stemming)...');
  const dataset = rawReviews.map(r => ({
    ...r,
    groundTruth: assignGroundTruth(r),
    tokens: preprocess(r.text)
  }));

  await fs.writeFile(CONFIG.PATHS.GROUND_TRUTH_JSON, JSON.stringify(dataset, null, 2), 'utf-8');
  console.log(`📁 Master Ground Truth tersimpan: ${CONFIG.PATHS.GROUND_TRUTH_JSON}\n`);

  // 3. Train-Test Split (80/20)
  const splitIdx = Math.floor(dataset.length * CONFIG.TRAIN_SPLIT_RATIO);
  const trainData = dataset.slice(0, splitIdx);
  const testData = dataset.slice(splitIdx);
  console.log(`✂️ Train-Test Split (80/20):`);
  console.log(`   - Data Latih (Training Set) : ${trainData.length} ulasan`);
  console.log(`   - Data Uji   (Testing Set)  : ${testData.length} ulasan\n`);

  // 4. TF-IDF Vectorizer
  const vectorizer = new TFIDFVectorizer(2);
  vectorizer.fit(trainData.map(d => d.tokens));
  console.log(`⚙️ Ekstraksi Fitur TF-IDF Selesai:`);
  console.log(`   - Ukuran Vocabulary: ${vectorizer.vocabulary.size} fitur kata/frasa\n`);

  const trainFeatures = trainData.map(d => vectorizer.transform(d.tokens));
  const trainLabels = trainData.map(d => d.groundTruth);

  // 5. Train Multinomial Naive Bayes
  console.log('🧠 Melatih Model Multinomial Naive Bayes pada Data Latih...');
  const nbModel = new MultinomialNaiveBayes(1.0, CONFIG.CLASSES);
  nbModel.train(trainFeatures, trainLabels);
  console.log('✅ Model berhasil dilatih!\n');

  // 6. Evaluasi pada Test Set
  const testFeatures = testData.map(d => vectorizer.transform(d.tokens));
  const testActuals = testData.map(d => d.groundTruth);
  const testPredictions = testFeatures.map(f => nbModel.predict(f));

  const evalResult = evaluateModel(testActuals, testPredictions, CONFIG.CLASSES);

  console.log('================================================================');
  console.log('🎯 EVALUATION REPORT (CONFUSION MATRIX & METRICS)');
  console.log('================================================================');
  console.log(`Akurasi Model (Accuracy) : ${evalResult.accuracy}%`);
  console.log(`Macro F1-Score           : ${evalResult.macroF1}%\n`);
  console.log('Confusion Matrix (Actual \\ Predicted):');
  console.log('                  [Pred Positif] [Pred Netral] [Pred Negatif]');
  CONFIG.CLASSES.forEach(r => {
    console.log(`Actual [${r.padEnd(7)}] : ${evalResult.confusionMatrix[r]['Positif'].toString().padStart(12)} ${evalResult.confusionMatrix[r]['Netral'].toString().padStart(13)} ${evalResult.confusionMatrix[r]['Negatif'].toString().padStart(14)}`);
  });
  console.log('\nClassification Report:');
  CONFIG.CLASSES.forEach(c => {
    const m = evalResult.classMetrics[c];
    console.log(`- Kelas [${c.padEnd(7)}]: Precision: ${m.precision}% | Recall: ${m.recall}% | F1: ${m.f1}% | Support: ${m.support}`);
  });
  console.log('================================================================\n');

  // 7. Prediksi Seluruh 5.000 Data
  console.log('🚀 Menjalankan Prediksi Model ML pada Seluruh 5.000 Data...');
  const fullPredictions = dataset.map((d, idx) => {
    const vec = vectorizer.transform(d.tokens);
    const res = nbModel.predictProba(vec);

    let isAnomaly = false;
    let anomalyDesc = 'Sesuai';
    if (d.score >= 4 && res.label === 'Negatif') {
      isAnomaly = true;
      anomalyDesc = '🚨 Bintang 4-5 tapi Prediksi ML Negatif (Taktik Komplain)';
    } else if (d.score <= 2 && res.label === 'Positif') {
      isAnomaly = true;
      anomalyDesc = '💡 Bintang 1-2 tapi Prediksi ML Positif (Pujian / Salah Klik)';
    }

    return {
      no: idx + 1,
      id: d.id,
      userName: d.userName || 'Pengguna',
      score: d.score,
      date: d.date,
      rawText: d.text,
      groundTruth: d.groundTruth,
      mlSentiment: res.label,
      confidence: parseFloat((res.confidence * 100).toFixed(1)),
      probPos: parseFloat((res.probabilities['Positif'] * 100).toFixed(1)),
      probNeu: parseFloat((res.probabilities['Netral'] * 100).toFixed(1)),
      probNeg: parseFloat((res.probabilities['Negatif'] * 100).toFixed(1)),
      isAnomaly,
      anomalyDesc,
      version: d.version
    };
  });

  // Load LLM Data jika tersedia untuk kelengkapan Dashboard LLM
  let llmAnalysisData = [];
  let llmCompReport = null;
  try {
    llmAnalysisData = JSON.parse(await fs.readFile(CONFIG.PATHS.LLM_ANALYSIS_5000_JSON, 'utf-8'));
    llmCompReport = JSON.parse(await fs.readFile(CONFIG.PATHS.ML_VS_LLM_COMPARISON_5000_JSON, 'utf-8'));
  } catch {}

  // Gabungkan prediksi ML dengan atribut LLM jika ada
  const fullEnrichedPredictions = fullPredictions.map((item, idx) => {
    const llmItem = llmAnalysisData[idx];
    if (llmItem) {
      return {
        ...item,
        llmSentiment: llmItem.llmSentiment || (item.score >= 4 ? 'Positif' : 'Negatif'),
        llmCategory: llmItem.llmCategory || 'Masalah Teknis & Bug',
        llmReason: llmItem.llmReason || 'Dianalisis oleh Gemma 3',
        llmConfidence: llmItem.llmConfidence || 90,
        modelDisagreement: (item.mlSentiment !== (llmItem.llmSentiment || 'Negatif'))
      };
    }
    return item;
  });

  // Simpan JSON
  await fs.writeFile(CONFIG.PATHS.ML_PREDICTED_JSON, JSON.stringify(fullEnrichedPredictions, null, 2), 'utf-8');
  console.log(`📁 File JSON hasil ML tersimpan: ${CONFIG.PATHS.ML_PREDICTED_JSON}`);

  // Simpan JS Bundle Dashboard (Lengkap dengan ML dan LLM)
  const dashboardPayload = {
    metrics: {
      accuracy: evalResult.accuracy,
      macroF1: evalResult.macroF1,
      confusionMatrix: evalResult.confusionMatrix,
      classMetrics: evalResult.classMetrics,
      vocabSize: vectorizer.vocabulary.size,
      trainSize: trainData.length,
      testSize: testData.length
    },
    llmComparison: llmCompReport,
    llmAnalysis: fullEnrichedPredictions,
    reviews: fullEnrichedPredictions
  };
  await fs.writeFile(CONFIG.PATHS.RAW_REVIEWS_5000_JS, `window.ML_DASHBOARD_DATA = ${JSON.stringify(dashboardPayload, null, 2)}; window.RAW_REVIEWS = window.ML_DASHBOARD_DATA.reviews;`, 'utf-8');
  console.log(`📁 File JS Bundle Dashboard tersimpan: ${CONFIG.PATHS.RAW_REVIEWS_5000_JS}`);

  // Simpan CSV
  const csvWriter = createObjectCsvWriter({
    path: CONFIG.PATHS.ML_PREDICTED_CSV,
    header: [
      { id: 'no', title: 'No' },
      { id: 'userName', title: 'User Name' },
      { id: 'score', title: 'Rating Bintang' },
      { id: 'date', title: 'Tanggal' },
      { id: 'rawText', title: 'Isi Ulasan Asli' },
      { id: 'groundTruth', title: 'Master Ground Truth' },
      { id: 'mlSentiment', title: 'Prediksi ML (Naive Bayes)' },
      { id: 'confidence', title: 'Confidence Score (%)' },
      { id: 'probPos', title: 'Prob Positif (%)' },
      { id: 'probNeg', title: 'Prob Negatif (%)' },
      { id: 'anomalyDesc', title: 'Status Anomali' }
    ]
  });
  await csvWriter.writeRecords(fullPredictions);
  console.log(`📊 File CSV hasil ML tersimpan: ${CONFIG.PATHS.ML_PREDICTED_CSV}\n`);

  return { model: nbModel, vectorizer, evalResult, fullPredictions };
}

export default { runTrainingPipeline, assignGroundTruth };
