const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const TextPreprocessor = require('./src/nlp/preprocessor');
const TfidfVectorizer = require('./src/ml/vectorizer');
const MultinomialNaiveBayes = require('./src/ml/naiveBayes');
const ModelEvaluator = require('./src/ml/evaluator');
const { determineGroundTruth } = require('./src/ml/groundTruth');
const { generateDashboardHtml } = require('./src/report/dashboardTemplate');
const { getTimestampFolder, ensureDir, getLatestFolder, parseArgs } = require('./src/utils/helpers');

// Helper to categorize review into Mobile JKN operational aspects
function detectAspects(text, tokens) {
  const combined = (text + ' ' + (tokens || []).join(' ')).toLowerCase();
  const aspects = [];

  const aspectKeywords = {
    'Autentikasi & Akun': ['login', 'masuk', 'daftar', 'registrasi', 'otp', 'sms', 'password', 'sandi', 'pin', 'nik', 'ktp', 'email', 'akun', 'verifikasi', 'tidak_bisa_masuk', 'lupa_sandi'],
    'Antrean & Faskes': ['antre', 'antrean', 'antrian', 'faskes', 'puskesmas', 'pkm', 'rs', 'rumah_sakit', 'klinik', 'kuota', 'dokter', 'poli', 'jadwal', 'rujuk', 'rujukan', 'obat', 'fktp'],
    'Kinerja & Server': ['eror', 'error', 'lemot', 'lambat', 'lola', 'lelet', 'force_close', 'fc', 'crash', 'hang', 'freeze', 'blank', 'server', 'jaringan', 'koneksi', 'update', 'apdet', 'bug', 'rto', 'loading'],
    'Iuran & Layanan': ['iuran', 'bayar', 'tagihan', 'autodebet', 'potong', 'denda', 'kis', 'kartu', 'digital', 'cetak', 'pindah', 'ubah', 'mutasi', 'pbi', 'keluarga', 'bpjs', 'screening', 'klaim']
  };

  for (const [aspect, kws] of Object.entries(aspectKeywords)) {
    for (const kw of kws) {
      if (combined.includes(kw)) {
        aspects.push(aspect);
        break;
      }
    }
  }

  return aspects.length > 0 ? aspects : ['Lainnya'];
}

async function main() {
  console.log('================================================================');
  console.log('   PIPELINE ANALISIS SENTIMEN & EXECUTIVE BUSINESS INTELLIGENCE ');
  console.log('                 DATA MINING ULASAN MOBILE JKN                  ');
  console.log('================================================================');

  const args = parseArgs(process.argv);
  const baseDataDir = path.join(__dirname, 'data');

  // 1. Resolve Data Folder
  let targetDataFolder = null;
  if (args.folder) {
    targetDataFolder = path.isAbsolute(String(args.folder)) 
      ? String(args.folder) 
      : path.join(__dirname, String(args.folder));
  } else if (process.argv[2] && !process.argv[2].startsWith('-') && !process.argv[2].includes('=')) {
    targetDataFolder = path.join(__dirname, process.argv[2]);
  } else {
    targetDataFolder = getLatestFolder(baseDataDir);
  }

  if (!targetDataFolder || !fs.existsSync(targetDataFolder)) {
    console.error(`[!] Folder data tidak ditemukan: ${targetDataFolder || '(tidak ada folder di data/)'}`);
    console.error(`    Silakan jalankan: node scrap-jkn.js data=5000\n`);
    process.exit(1);
  }

  console.log(`[*] Membaca data dari: ${path.relative(__dirname, targetDataFolder)}`);

  // 2. Load Reviews
  const jsonPath = path.join(targetDataFolder, 'reviews.json');
  let rawReviews = [];
  if (fs.existsSync(jsonPath)) {
    rawReviews = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } else {
    console.error(`[!] File reviews.json tidak ditemukan di ${targetDataFolder}`);
    process.exit(1);
  }

  if (rawReviews.length === 0) {
    console.error('[!] Dataset ulasan kosong.');
    process.exit(1);
  }

  console.log(`[*] Total ulasan dimuat: ${rawReviews.length.toLocaleString('id-ID')} ulasan`);
  console.log('----------------------------------------------------------------');

  // 3. Preprocessing with Sastrawi & Dictionaries
  console.log('[1/5] Memulai NLP Preprocessing (Slang, Emoji, Negasi, Stopwords, Sastrawi Stemmer)...');
  const preprocessor = new TextPreprocessor();
  const preprocessedDocs = [];
  const labels = [];
  const validReviews = [];

  const startNlp = Date.now();
  for (let i = 0; i < rawReviews.length; i++) {
    const rev = rawReviews[i];
    const nlpRes = preprocessor.preprocess(rev.text);
    
    // Determine Ground Truth (Rating 4-5: Positif, Rating 1-3: Negatif)
    const groundTruth = determineGroundTruth(rev.score, rev.text);

    if (nlpRes.tokens.length > 0) {
      preprocessedDocs.push(nlpRes.tokens);
      labels.push(groundTruth);
      validReviews.push({
        ...rev,
        cleanedText: nlpRes.cleaned,
        tokens: nlpRes.tokens,
        groundTruth
      });
    }

    if ((i + 1) % 1000 === 0 || i === rawReviews.length - 1) {
      process.stdout.write(`\r      Diproses: ${i + 1}/${rawReviews.length} ulasan...`);
    }
  }
  const nlpDuration = ((Date.now() - startNlp) / 1000).toFixed(1);
  console.log(`\n      [✓] NLP Selesai (${nlpDuration}s) — ${preprocessedDocs.length} ulasan valid.`);

  // 4. Feature Extraction: TF-IDF
  console.log('[2/5] Ekstraksi Fitur Bobot Kata dengan TF-IDF Vectorizer...');
  const vectorizer = new TfidfVectorizer({ minDf: 2, sublinearTf: true });
  const X = vectorizer.fitTransform(preprocessedDocs);
  console.log(`      [✓] Ukuran Kosakata Fitur (|V|): ${vectorizer.vocabulary.size} kata unik.`);

  // 5. Train Multinomial Naive Bayes Model (Positif vs Negatif)
  console.log('[3/5] Melatih Model Multinomial Naive Bayes (Laplace Smoothing α=1.0)...');
  const classes = ['Positif', 'Negatif'];
  const nbModel = new MultinomialNaiveBayes({ alpha: 1.0, classes });
  nbModel.train(X, labels, vectorizer.vocabulary.size);

  // 6. Predict & Classify all samples
  console.log('[4/5] Mengklasifikasi Sentimen, Aspek Operasional, & Tren Waktu...');
  const predictions = nbModel.predict(X);

  const finalSamples = [];
  let posCount = 0;
  let negCount = 0;
  let totalScoreSum = 0;
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const ratingDistribution = { 
    1: { Positif: 0, Negatif: 0 }, 
    2: { Positif: 0, Negatif: 0 }, 
    3: { Positif: 0, Negatif: 0 }, 
    4: { Positif: 0, Negatif: 0 }, 
    5: { Positif: 0, Negatif: 0 } 
  };

  // Timeline aggregation (by Month-Year)
  const timelineMap = {};
  // Aspect aggregation
  const aspectStats = {
    'Autentikasi & Akun': { total: 0, Positif: 0, Negatif: 0 },
    'Antrean & Faskes': { total: 0, Positif: 0, Negatif: 0 },
    'Kinerja & Server': { total: 0, Positif: 0, Negatif: 0 },
    'Iuran & Layanan': { total: 0, Positif: 0, Negatif: 0 },
    'Lainnya': { total: 0, Positif: 0, Negatif: 0 }
  };
  // App Version stats
  const versionStats = {};

  for (let i = 0; i < validReviews.length; i++) {
    const rev = validReviews[i];
    const pred = predictions[i];

    if (pred.label === 'Positif') posCount++;
    else negCount++;

    const score = Math.max(1, Math.min(5, rev.score || 3));
    totalScoreSum += score;
    ratingCounts[score] = (ratingCounts[score] || 0) + 1;
    if (ratingDistribution[score][pred.label] !== undefined) {
      ratingDistribution[score][pred.label]++;
    }

    // Timeline grouping
    const dateObj = rev.date ? new Date(rev.date) : new Date();
    const monthKey = !isNaN(dateObj.getTime()) 
      ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
      : '2026-01';
    
    if (!timelineMap[monthKey]) {
      timelineMap[monthKey] = { month: monthKey, total: 0, Positif: 0, Negatif: 0, scoreSum: 0 };
    }
    timelineMap[monthKey].total++;
    if (timelineMap[monthKey][pred.label] !== undefined) {
      timelineMap[monthKey][pred.label]++;
    }
    timelineMap[monthKey].scoreSum += score;

    // Detect Operational Aspects
    const aspects = detectAspects(rev.text, rev.tokens);
    for (const asp of aspects) {
      if (aspectStats[asp]) {
        aspectStats[asp].total++;
        if (aspectStats[asp][pred.label] !== undefined) {
          aspectStats[asp][pred.label]++;
        }
      }
    }

    // Version stats
    const ver = rev.version || 'Unspecified';
    if (!versionStats[ver]) {
      versionStats[ver] = { version: ver, total: 0, Positif: 0, Negatif: 0 };
    }
    versionStats[ver].total++;
    if (versionStats[ver][pred.label] !== undefined) {
      versionStats[ver][pred.label]++;
    }

    // Anomaly detection: rating vs predicted sentiment divergence
    const isAnomaly = (score >= 4 && pred.label === 'Negatif') || (score <= 2 && pred.label === 'Positif');

    finalSamples.push({
      id: rev.id,
      userName: rev.userName,
      score,
      date: rev.date,
      text: rev.text,
      tokens: rev.tokens,
      thumbsUp: rev.thumbsUp || 0,
      version: rev.version || 'Unspecified',
      aspects,
      actualLabel: rev.groundTruth,
      predictedLabel: pred.label,
      confidence: pred.confidence,
      probabilities: pred.probabilities,
      isAnomaly
    });
  }

  // Format Timeline Array (sorted chronologically)
  const timelineData = Object.values(timelineMap).sort((a, b) => a.month.localeCompare(b.month)).map(item => ({
    ...item,
    avgRating: Number((item.scoreSum / item.total).toFixed(2)),
    posPercent: Number(((item.Positif / item.total) * 100).toFixed(1)),
    negPercent: Number(((item.Negatif / item.total) * 100).toFixed(1))
  }));

  // Top App Versions (sorted by volume)
  const topVersions = Object.values(versionStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // 7. Extract Top Keywords per class
  const posVectors = [];
  const negVectors = [];
  for (let i = 0; i < X.length; i++) {
    if (predictions[i].label === 'Positif') posVectors.push(X[i]);
    else negVectors.push(X[i]);
  }
  const topPosKeywords = vectorizer.getTopFeatures(posVectors, 15);
  const topNegKeywords = vectorizer.getTopFeatures(negVectors, 15);

  // 8. Model Evaluation: 5-Fold Cross Validation
  console.log('[5/5] Melakukan Evaluasi Model (Confusion Matrix, Accuracy, Precision, Recall, F1)...');
  const evalResult = ModelEvaluator.crossValidate(preprocessedDocs, labels, 5, classes);
  const metrics = evalResult.overall;

  // 9. Generate Report Output
  const reportFolderName = getTimestampFolder();
  const reportDir = path.join(__dirname, 'report', reportFolderName);
  ensureDir(reportDir);

  const avgRating = Number((totalScoreSum / finalSamples.length).toFixed(2));
  const netSentimentScore = Number((((posCount - negCount) / finalSamples.length) * 100).toFixed(1));

  // Top influential reviews sorted by thumbsUp
  const topInfluentialReviews = [...finalSamples]
    .sort((a, b) => (b.thumbsUp || 0) - (a.thumbsUp || 0))
    .slice(0, 5);

  const totalThumbsUp = finalSamples.reduce((sum, s) => sum + (s.thumbsUp || 0), 0);

  const reportData = {
    generatedAt: new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }),
    sourceDataFolder: path.relative(__dirname, targetDataFolder),
    summary: {
      totalReviews: finalSamples.length,
      avgRating,
      netSentimentScore,
      positiveCount: posCount,
      positivePercent: Number(((posCount / finalSamples.length) * 100).toFixed(1)),
      negativeCount: negCount,
      negativePercent: Number(((negCount / finalSamples.length) * 100).toFixed(1)),
      vocabularySize: vectorizer.vocabulary.size,
      totalThumbsUp
    },
    topInfluentialReviews,
    ratingCounts,
    ratingDistribution,
    aspectStats,
    timelineData,
    topVersions,
    metrics,
    topKeywords: {
      Positif: topPosKeywords,
      Negatif: topNegKeywords
    },
    samples: finalSamples
  };

  // Save dashboard.html (Standalone)
  const dashboardHtml = generateDashboardHtml(reportData);
  const htmlPath = path.join(reportDir, 'dashboard.html');
  fs.writeFileSync(htmlPath, dashboardHtml, 'utf8');

  // Save predictions.json
  const predJsonPath = path.join(reportDir, 'predictions.json');
  fs.writeFileSync(predJsonPath, JSON.stringify(finalSamples, null, 2), 'utf8');

  // Save metrics.json
  const metricsJsonPath = path.join(reportDir, 'metrics.json');
  fs.writeFileSync(metricsJsonPath, JSON.stringify({ metrics, summary: reportData.summary, aspectStats, ratingDistribution }, null, 2), 'utf8');

  // Save predictions.csv
  const predCsvPath = path.join(reportDir, 'predictions.csv');
  const csvWriter = createObjectCsvWriter({
    path: predCsvPath,
    header: [
      { id: 'id', title: 'id' },
      { id: 'userName', title: 'user_name' },
      { id: 'score', title: 'star_rating' },
      { id: 'date', title: 'date' },
      { id: 'aspects', title: 'operational_aspect' },
      { id: 'actualLabel', title: 'ground_truth' },
      { id: 'predictedLabel', title: 'predicted_sentiment' },
      { id: 'confidence', title: 'confidence' },
      { id: 'text', title: 'raw_review' }
    ]
  });
  await csvWriter.writeRecords(finalSamples.map(s => ({ ...s, aspects: s.aspects.join('; ') })));

  // 10. Print Summary
  console.log('================================================================');
  console.log('                     HASIL ANALISIS SENTIMEN                    ');
  console.log('================================================================');
  console.log(`• Total Ulasan Dianalisis : ${finalSamples.length.toLocaleString('id-ID')}`);
  console.log(`• Rata-rata Rating        : ★ ${avgRating} / 5.0`);
  console.log(`• Sentimen Positif (4-5★) : ${posCount.toLocaleString('id-ID')} (${reportData.summary.positivePercent}%)`);
  console.log(`• Sentimen Negatif (1-3★) : ${negCount.toLocaleString('id-ID')} (${reportData.summary.negativePercent}%)`);
  console.log(`• Net Sentiment Score     : ${netSentimentScore}%`);
  console.log('----------------------------------------------------------------');
  console.log(`• Akurasi Model (5-Fold)  : ${metrics.accuracy}%`);
  console.log(`• Macro F1-Score          : ${metrics.macroF1}%`);
  if (metrics.classMetrics.Positif) {
    console.log(`• Precision / Recall (Pos): ${metrics.classMetrics.Positif.precision}% / ${metrics.classMetrics.Positif.recall}%`);
  }
  if (metrics.classMetrics.Negatif) {
    console.log(`• Precision / Recall (Neg): ${metrics.classMetrics.Negatif.precision}% / ${metrics.classMetrics.Negatif.recall}%`);
  }
  console.log('----------------------------------------------------------------');
  console.log(`• Confusion Matrix         : TP=${metrics.confusionMatrix.tp}, FP=${metrics.confusionMatrix.fp}, TN=${metrics.confusionMatrix.tn}, FN=${metrics.confusionMatrix.fn}`);
  console.log('================================================================');
  console.log(`[✓] Laporan Dashboard Berhasil Dibuat!`);
  console.log(`    📁 File: ${htmlPath}`);
  console.log(`\nBuka dashboard interaktif:`);
  console.log(`  node open-report.js`);
  console.log(`  atau double-click file: report/${reportFolderName}/dashboard.html\n`);
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
