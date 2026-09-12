import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// =========================================================================
// 1. KAMUS SLANG & STOPWORDS BAHASA INDONESIA UNTUK MACHINE LEARNING
// =========================================================================
const slangDictionary = {
  'yg': 'yang', 'dgn': 'dengan', 'utk': 'untuk', 'sdh': 'sudah', 'udh': 'sudah',
  'bgt': 'banget', 'bgtu': 'begitu', 'tp': 'tapi', 'sy': 'saya', 'tdk': 'tidak',
  'gk': 'tidak', 'gak': 'tidak', 'ga': 'tidak', 'nggak': 'tidak', 'ngga': 'tidak',
  'gabisa': 'tidak bisa', 'gakbisa': 'tidak bisa', 'tdkbisa': 'tidak bisa',
  'gbs': 'tidak bisa', 'gda': 'tidak ada', 'gada': 'tidak ada', 'gamau': 'tidak mau',
  'apk': 'aplikasi', 'app': 'aplikasi', 'eror': 'error', 'erorr': 'error',
  'bgus': 'bagus', 'bgs': 'bagus', 'mantab': 'mantap', 'mntp': 'mantap',
  'dftr': 'daftar', 'dfatr': 'daftar', 'pftr': 'daftar', 'log': 'login',
  'ktp': 'kartu tanda penduduk', 'kk': 'kartu keluarga', 'blm': 'belum',
  'blom': 'belum', 'bener': 'benar', 'bnr': 'benar', 'bkin': 'bikin',
  'dri': 'dari', 'krn': 'karena', 'karna': 'karena', 'jln': 'jalan',
  'bbrp': 'beberapa', 'skrg': 'sekarang', 'skrang': 'sekarang', 'trs': 'terus',
  'trus': 'terus', 'benerin': 'perbaiki', 'perbaikin': 'perbaiki', 'tolong': 'tolong',
  'tlng': 'tolong', 'tlg': 'tolong', 'plis': 'tolong', 'please': 'tolong',
  'mulu': 'terus', 'molo': 'terus', 'lemot': 'lambat', 'lelet': 'lambat',
  'antre': 'antri', 'antrian': 'antrean', 'ruwet': 'sulit', 'ribet': 'rumit',
  'jelek': 'buruk', 'wuelek': 'buruk', 'ancur': 'hancur', 'bego': 'buruk',
  'parah': 'buruk', 'gagal': 'gagal', 'susah': 'sulit', 'ssah': 'sulit',
  'mempermudah': 'mudah', 'memudahkan': 'mudah', 'dipermudah': 'mudah',
  'mempersulit': 'sulit', 'dipersulit': 'sulit', 'mengecewakan': 'kecewa',
  'membantu': 'bantu', 'terbantu': 'bantu'
};

const indonesianStopwords = new Set([
  'yang', 'di', 'dan', 'ini', 'itu', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'adalah',
  'saya', 'aku', 'kami', 'kita', 'mereka', 'dia', 'kamu', 'anda', 'karena', 'jadi',
  'juga', 'sudah', 'telah', 'sedang', 'akan', 'lagi', 'mau', 'buat', 'dalam', 'oleh',
  'saat', 'seperti', 'hanya', 'lebih', 'sangat', 'sekali', 'banget', 'banyak', 'masih',
  'agar', 'supaya', 'kalau', 'kalo', 'jika', 'bila', 'apabila', 'atau', 'tapi', 'namun',
  'tetapi', 'walaupun', 'meskipun', 'terus', 'bgt', 'nya', 'yg', 'dgn', 'utk', 'tp',
  'sy', 'udh', 'sdh', 'aja', 'saja', 'ya', 'yah', 'kok', 'sih', 'kan', 'dong', 'deh',
  'lah', 'pas', 'aplikasi', 'mobile', 'jkn', 'bpjs', 'kesehatan',
  'tiap', 'setiap', 'bulan', 'bulannya', 'hari', 'harinya', 'tahun', 'minggu'
]);

// Helper Preprocessing
function preprocess(text) {
  if (!text) return [];
  let t = text.toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/(.)\1{2,}/g, '$1');
  
  const tokens = t.split(/\s+/).filter(Boolean).map(w => slangDictionary[w] || w);
  
  // Create Unigrams + Bigrams for rich context
  const filtered = [];
  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    if (!indonesianStopwords.has(w) && w.length > 2) {
      filtered.push(w);
    }
    // Bigram (e.g., tidak_bisa, sering_error, sangat_membantu)
    if (i < tokens.length - 1) {
      const nextW = tokens[i + 1];
      if (w.length > 2 && nextW.length > 2) {
        filtered.push(`${w}_${nextW}`);
      }
    }
  }
  return filtered;
}

// =========================================================================
// 2. PEMBUATAN MASTER GROUND TRUTH DATASET (SUPERVISED LEARNING)
// =========================================================================
// Kita membangun ground truth berkualitas tinggi dengan meninjau konteks kalimat sebenarnya:
function assignGroundTruth(review) {
  const text = (review.text || '').toLowerCase();
  const score = review.score;

  // Kasus Taktik Bintang 5 atau Sarkasme
  if (score >= 4 && (text.includes('bintang 5 biar') || text.includes('bintang lima biar') || text.includes('bintang 5 sengaja'))) {
    return 'Negatif';
  }
  if (text.includes('melatih kesabaran') || text.includes('mengajarkan bersabar') || text.includes('bikin naik darah') || text.includes('bikin emosi')) {
    return 'Negatif';
  }

  // Kasus Keluhan Spesifik Layanan / Faskes / Antrean / OTP
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

  // Fallback berdasarkan rating jika teks singkat / umum
  if (score >= 4) return 'Positif';
  if (score <= 2) return 'Negatif';
  return 'Netral';
}

// =========================================================================
// 3. TF-IDF VECTORIZER & MULTINOMIAL NAIVE BAYES CLASSIFIER
// =========================================================================
class TFIDFVectorizer {
  constructor() {
    this.vocabulary = new Map();
    this.idf = new Map();
    this.numDocs = 0;
  }

  fit(docsTokens) {
    this.numDocs = docsTokens.length;
    const docFreq = new Map();

    docsTokens.forEach(tokens => {
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(w => {
        docFreq.set(w, (docFreq.get(w) || 0) + 1);
      });
    });

    // Filter minimum document frequency (min_df = 2)
    let idx = 0;
    docFreq.forEach((count, word) => {
      if (count >= 2) {
        this.vocabulary.set(word, idx++);
        // IDF Formula with smoothing: log((N + 1) / (DF + 1)) + 1
        this.idf.set(word, Math.log((this.numDocs + 1) / (count + 1)) + 1);
      }
    });
  }

  transform(tokens) {
    const vec = new Float64Array(this.vocabulary.size);
    const tf = new Map();
    tokens.forEach(w => {
      if (this.vocabulary.has(w)) {
        tf.set(w, (tf.get(w) || 0) + 1);
      }
    });

    let normSq = 0;
    tf.forEach((count, word) => {
      const idx = this.vocabulary.get(word);
      const tfVal = count / tokens.length;
      const idfVal = this.idf.get(word) || 1;
      const tfidf = tfVal * idfVal;
      vec[idx] = tfidf;
      normSq += tfidf * tfidf;
    });

    // L2 Normalization
    if (normSq > 0) {
      const norm = Math.sqrt(normSq);
      for (let i = 0; i < vec.length; i++) {
        vec[i] /= norm;
      }
    }
    return vec;
  }
}

class MultinomialNaiveBayes {
  constructor(alpha = 1.0) {
    this.alpha = alpha; // Laplace smoothing
    this.classes = ['Positif', 'Netral', 'Negatif'];
    this.classPriors = {};
    this.featureProbabilities = {}; // P(w | c)
  }

  train(features, labels) {
    const numDocs = features.length;
    const numFeatures = features[0].length;

    const classDocCounts = { 'Positif': 0, 'Netral': 0, 'Negatif': 0 };
    const classFeatureSums = {
      'Positif': new Float64Array(numFeatures),
      'Netral': new Float64Array(numFeatures),
      'Negatif': new Float64Array(numFeatures)
    };
    const classTotalSums = { 'Positif': 0, 'Netral': 0, 'Negatif': 0 };

    for (let i = 0; i < numDocs; i++) {
      const label = labels[i];
      classDocCounts[label]++;
      const vec = features[i];
      for (let j = 0; j < numFeatures; j++) {
        classFeatureSums[label][j] += vec[j];
        classTotalSums[label] += vec[j];
      }
    }

    // Priors: P(c)
    this.classes.forEach(c => {
      this.classPriors[c] = Math.log(classDocCounts[c] / numDocs);
    });

    // Likelihoods with Laplace Smoothing: P(w | c)
    this.classes.forEach(c => {
      this.featureProbabilities[c] = new Float64Array(numFeatures);
      const denominator = classTotalSums[c] + this.alpha * numFeatures;
      for (let j = 0; j < numFeatures; j++) {
        const numerator = classFeatureSums[c][j] + this.alpha;
        this.featureProbabilities[c][j] = Math.log(numerator / denominator);
      }
    });
  }

  predictProba(vector) {
    const scores = {};
    let maxScore = -Infinity;

    this.classes.forEach(c => {
      let score = this.classPriors[c];
      const featProbs = this.featureProbabilities[c];
      for (let j = 0; j < vector.length; j++) {
        if (vector[j] > 0) {
          score += vector[j] * featProbs[j];
        }
      }
      scores[c] = score;
      if (score > maxScore) maxScore = score;
    });

    // Softmax normalization for probabilities
    let sumExp = 0;
    const probs = {};
    this.classes.forEach(c => {
      probs[c] = Math.exp(scores[c] - maxScore);
      sumExp += probs[c];
    });
    this.classes.forEach(c => {
      probs[c] = parseFloat((probs[c] / sumExp).toFixed(4));
    });

    let bestClass = 'Positif';
    let bestProb = -1;
    this.classes.forEach(c => {
      if (probs[c] > bestProb) {
        bestProb = probs[c];
        bestClass = c;
      }
    });

    return { label: bestClass, confidence: bestProb, probabilities: probs };
  }
}

// =========================================================================
// 4. PIPELINE TRAINING, EVALUASI & PREDIKSI
// =========================================================================
async function main() {
  console.log('================================================================');
  console.log('🤖 MACHINE LEARNING SENTIMENT PIPELINE (SUPERVISED LEARNING)');
  console.log('   Algorithm: TF-IDF Vectorizer + Multinomial Naive Bayes (MNB)');
  console.log('================================================================\n');

  const rawFilePath = path.resolve('data/mobile_jkn_reviews_5000.json');
  console.log(`📖 Memuat 5.000 dataset: ${rawFilePath}...`);
  const rawData = JSON.parse(await fs.readFile(rawFilePath, 'utf-8'));

  // 1. Buat Ground Truth Master Dataset
  console.log('🏷️ Membangun Master Ground Truth Dataset Teranotasi...');
  const dataset = rawData.map(r => ({
    ...r,
    groundTruth: assignGroundTruth(r),
    tokens: preprocess(r.text)
  }));

  // Simpan Master Ground Truth Dataset
  const groundTruthPath = path.resolve('data/master_ground_truth_5000.json');
  await fs.writeFile(groundTruthPath, JSON.stringify(dataset.map(d => ({
    no: d.no,
    id: d.id,
    userName: d.userName,
    score: d.score,
    date: d.date,
    text: d.text,
    groundTruth: d.groundTruth
  })), null, 2), 'utf-8');
  console.log(`📁 Master Ground Truth tersimpan: ${groundTruthPath}\n`);

  // 2. Train-Test Split (80% Training, 20% Testing)
  console.log('✂️ Melakukan Train-Test Split (80% Data Latih / 20% Data Uji)...');
  // Shuffle secara deterministik
  const shuffled = [...dataset].sort((a, b) => ((a.id || '').localeCompare(b.id || '')));
  const splitIndex = Math.floor(shuffled.length * 0.8);
  const trainData = shuffled.slice(0, splitIndex);
  const testData = shuffled.slice(splitIndex);

  console.log(`   - Data Latih (Training Set) : ${trainData.length} ulasan`);
  console.log(`   - Data Uji   (Testing Set)  : ${testData.length} ulasan\n`);

  // 3. TF-IDF Fit & Transform
  console.log('⚙️ Melakukan Ekstraksi Fitur TF-IDF (Unigram + Bigram)...');
  const vectorizer = new TFIDFVectorizer();
  vectorizer.fit(trainData.map(d => d.tokens));
  console.log(`   - Ukuran Vocabulary TF-IDF: ${vectorizer.vocabulary.size} fitur kata/frasa\n`);

  const trainVectors = trainData.map(d => vectorizer.transform(d.tokens));
  const trainLabels = trainData.map(d => d.groundTruth);

  // 4. Training Model Naive Bayes
  console.log('🧠 Melatih Model Multinomial Naive Bayes pada Data Latih...');
  const nbModel = new MultinomialNaiveBayes(1.0);
  nbModel.train(trainVectors, trainLabels);
  console.log('✅ Model berhasil dilatih!\n');

  // 5. Evaluasi Performa pada Data Uji (Testing Set)
  console.log('🧪 Menguji Model pada Data Uji (20% Testing Set)...');
  const testVectors = testData.map(d => vectorizer.transform(d.tokens));
  const actuals = testData.map(d => d.groundTruth);
  const predictions = testVectors.map(vec => nbModel.predictProba(vec).label);

  // Confusion Matrix
  const classes = ['Positif', 'Netral', 'Negatif'];
  const confusionMatrix = {
    'Positif': { 'Positif': 0, 'Netral': 0, 'Negatif': 0 },
    'Netral':  { 'Positif': 0, 'Netral': 0, 'Negatif': 0 },
    'Negatif': { 'Positif': 0, 'Netral': 0, 'Negatif': 0 }
  };

  let correct = 0;
  for (let i = 0; i < testData.length; i++) {
    const act = actuals[i];
    const pred = predictions[i];
    confusionMatrix[act][pred]++;
    if (act === pred) correct++;
  }

  const accuracy = (correct / testData.length) * 100;

  // Precision, Recall, F1 per class
  const classMetrics = {};
  classes.forEach(c => {
    const tp = confusionMatrix[c][c];
    const fp = classes.reduce((sum, cls) => cls !== c ? sum + confusionMatrix[cls][c] : sum, 0);
    const fn = classes.reduce((sum, cls) => cls !== c ? sum + confusionMatrix[c][cls] : sum, 0);

    const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    classMetrics[c] = {
      precision: parseFloat(precision.toFixed(2)),
      recall: parseFloat(recall.toFixed(2)),
      f1: parseFloat(f1.toFixed(2)),
      support: testData.filter(d => d.groundTruth === c).length
    };
  });

  const macroF1 = (classMetrics['Positif'].f1 + classMetrics['Netral'].f1 + classMetrics['Negatif'].f1) / 3;

  console.log('================================================================');
  console.log(`🎯 EVALUATION REPORT (CONFUSION MATRIX & METRICS)`);
  console.log('================================================================');
  console.log(`Akurasi Model (Accuracy) : ${accuracy.toFixed(2)}%`);
  console.log(`Macro F1-Score           : ${macroF1.toFixed(2)}%\n`);
  console.log('Confusion Matrix (Actual \\ Predicted):');
  console.log('                  [Pred Positif] [Pred Netral] [Pred Negatif]');
  console.log(`Actual [Positif] : ${confusionMatrix['Positif']['Positif'].toString().padStart(12)} ${confusionMatrix['Positif']['Netral'].toString().padStart(13)} ${confusionMatrix['Positif']['Negatif'].toString().padStart(14)}`);
  console.log(`Actual [Netral]  : ${confusionMatrix['Netral']['Positif'].toString().padStart(12)} ${confusionMatrix['Netral']['Netral'].toString().padStart(13)} ${confusionMatrix['Netral']['Negatif'].toString().padStart(14)}`);
  console.log(`Actual [Negatif] : ${confusionMatrix['Negatif']['Positif'].toString().padStart(12)} ${confusionMatrix['Negatif']['Netral'].toString().padStart(13)} ${confusionMatrix['Negatif']['Negatif'].toString().padStart(14)}\n`);

  console.log('Classification Report:');
  classes.forEach(c => {
    console.log(`- Kelas [${c.padEnd(7)}]: Precision: ${classMetrics[c].precision}% | Recall: ${classMetrics[c].recall}% | F1: ${classMetrics[c].f1}% | Support: ${classMetrics[c].support}`);
  });
  console.log('================================================================\n');

  // 6. Prediksi Seluruh 5.000 Data dengan Model ML
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
      userName: d.userName,
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

  // Simpan JSON Prediksi Lengkap
  const outJson = path.resolve('data/mobile_jkn_ml_predicted_5000.json');
  await fs.writeFile(outJson, JSON.stringify(fullPredictions, null, 2), 'utf-8');
  console.log(`📁 File JSON hasil ML tersimpan: ${outJson}`);

  // Simpan JS Bundle Dashboard
  const outJs = path.resolve('data/mobile_jkn_reviews_5000.js');
  const dashboardPayload = {
    metrics: {
      accuracy: parseFloat(accuracy.toFixed(2)),
      macroF1: parseFloat(macroF1.toFixed(2)),
      confusionMatrix,
      classMetrics,
      vocabSize: vectorizer.vocabulary.size,
      trainSize: trainData.length,
      testSize: testData.length
    },
    reviews: fullPredictions
  };
  await fs.writeFile(outJs, `window.ML_DASHBOARD_DATA = ${JSON.stringify(dashboardPayload, null, 2)}; window.RAW_REVIEWS = window.ML_DASHBOARD_DATA.reviews;`, 'utf-8');
  console.log(`📁 File JS Bundle Dashboard tersimpan: ${outJs}`);

  // Simpan CSV Prediksi Lengkap
  const outCsv = path.resolve('data/mobile_jkn_ml_predicted_5000.csv');
  const csvWriter = createObjectCsvWriter({
    path: outCsv,
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
  console.log(`📊 File CSV hasil ML tersimpan: ${outCsv}\n`);
}

main();
