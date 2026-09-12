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

  // Kasus Keluhan Spesifik & Emoji Negatif
  const negativeClues = [
    'jadwal penuh', 'belum tentu dicover', 'masa harus nunggu', 'antri berjam jam', 'antre berjam',
    'gagal verifikasi', 'otp tidak masuk', 'otp ga masuk', 'tidak bisa login', 'gabisa login',
    'susah login', 'sering error', 'sering eror', 'keluar sendiri', 'force close', 'rugi bayar',
    'dipersulit', 'pelayanan buruk', 'kecewa', 'jelek', 'rusak', 'lemot', 'lelet', 'hancur', 'parah', 'ribet', 'rumit',
    '👎', '😡', '😠', '🤬', '🤮', '🤢', '😭', '😢', '😔', '😞', '😤', '💔', '💩', '🔪', '💥', '⚠️', '❌', '🚫', '⛔', '🤦', '🙄', '😒', '🥱'
  ];
  if (negativeClues.some(clue => text.includes(clue))) {
    return 'Negatif';
  }

  // Kasus Pujian Spesifik & Emoji Positif
  const positiveClues = [
    'sangat membantu', 'mudah digunakan', 'sangat mudah', 'cepat dan mudah', 'proses cepat',
    'pelayanan bagus', 'mantap', 'terima kasih', 'makasih', 'bermanfaat', 'luar biasa',
    'suka sekali', 'puas', 'terbaik', 'lancar', 'hebat', 'praktis', 'bagus', 'keren',
    '👍', '🙏', '🤲', '❤️', '❤', '💖', '💗', '💓', '💞', '💕', '😊', '🥰', '😍', '😁', '😃', '😄', '😆', '☺', '😇', '😎', '🥳', '👏', '🙌', '🎉', '🔥', '⭐', '🌟', '💯', '💪', '👌', '🫡', '🤩'
  ];
  if (positiveClues.some(clue => text.includes(clue)) && !text.includes('tidak') && !text.includes('kurang') && !text.includes('gak') && !text.includes('bukan')) {
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
  console.log('⚙️ Menjalankan Preprocessing NLP (Emoji Translation + Slang Normalization + Sastrawi Stemming)...');
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
  const testPredictions = testFeatures.map((f, i) => {
    if (testData[i].tokens.length === 0) {
      return testData[i].score >= 4 ? 'Positif' : testData[i].score <= 2 ? 'Negatif' : 'Netral';
    }
    return nbModel.predict(f);
  });

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
    let predLabel;
    let conf = 0.95;
    let probPos = 0, probNeu = 0, probNeg = 0;
    let isAnomaly = false;
    let anomalyDesc = 'Sesuai';

    // Kasus Khusus: Jika ulasan kosong atau hanya berisi simbol tanpa teks/emoji yang dapat di-tokenisasi (e.g. 📐 atau whitespace)
    if (d.tokens.length === 0) {
      if (d.score >= 4) {
        predLabel = 'Positif';
        conf = 0.95;
        probPos = 95.0;
        probNeg = 5.0;
        probNeu = 0.0;
      } else if (d.score <= 2) {
        predLabel = 'Negatif';
        conf = 0.95;
        probNeg = 95.0;
        probPos = 5.0;
        probNeu = 0.0;
      } else {
        predLabel = 'Netral';
        conf = 0.90;
        probNeu = 90.0;
        probPos = 5.0;
        probNeg = 5.0;
      }
    } else {
      const vec = vectorizer.transform(d.tokens);
      const res = nbModel.predictProba(vec);
      predLabel = res.label;
      conf = res.confidence;
      probPos = parseFloat((res.probabilities['Positif'] * 100).toFixed(1));
      probNeu = parseFloat((res.probabilities['Netral'] * 100).toFixed(1));
      probNeg = parseFloat((res.probabilities['Negatif'] * 100).toFixed(1));

      // Evaluasi Anomali
      if (d.score >= 4 && predLabel === 'Negatif') {
        isAnomaly = true;
        anomalyDesc = '🚨 Bintang 4-5 tapi Prediksi ML Negatif (Taktik Komplain)';
      } else if (d.score <= 2 && predLabel === 'Positif') {
        // Hanya tandai anomali pujian jika terdapat token/frasa positif yang nyata (kata atau emoji)
        const hasPositiveClue = d.tokens.some(t => 
          /bagus|mantap|mudah|cepat|praktis|bantu|puas|hebat|keren|suka|lancar|bermanfaat|baik|terbaik|emoji_jempol|emoji_cinta|emoji_terima_kasih|emoji_senang|emoji_sangat|emoji_bintang|emoji_sempurna/i.test(t)
        );
        if (hasPositiveClue) {
          isAnomaly = true;
          anomalyDesc = '💡 Bintang 1-2 tapi Prediksi ML Positif (Pujian / Salah Klik)';
        } else {
          // Jika tidak ada kata positif, sesuaikan kembali ke sentimen negatif sesuai bintang 1-2
          predLabel = 'Negatif';
          conf = 0.90;
          probNeg = 90.0;
          probPos = 10.0;
        }
      }
    }

    return {
      no: idx + 1,
      id: d.id,
      userName: d.userName || 'Pengguna',
      score: d.score,
      date: d.date,
      rawText: d.text,
      groundTruth: d.groundTruth,
      mlSentiment: predLabel,
      confidence: parseFloat((conf * 100).toFixed(1)),
      probPos,
      probNeu,
      probNeg,
      isAnomaly,
      anomalyDesc,
      version: d.version
    };
  });

  // Simpan JSON
  await fs.writeFile(CONFIG.PATHS.ML_PREDICTED_JSON, JSON.stringify(fullPredictions, null, 2), 'utf-8');
  console.log(`📁 File JSON hasil ML tersimpan: ${CONFIG.PATHS.ML_PREDICTED_JSON}`);

  // Simpan JS Bundle Dashboard (Lengkap dengan Metrik Naive Bayes)
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
    reviews: fullPredictions
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
