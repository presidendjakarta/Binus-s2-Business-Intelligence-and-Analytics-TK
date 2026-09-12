import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// ==========================================
// 1. KAMUS NORMALISASI SLANG / SINGKATAN ID
// ==========================================
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
  'parah': 'buruk', 'gagal': 'gagal', 'susah': 'sulit', 'ssah': 'sulit'
};

// ==========================================
// 2. KAMUS SENTIMEN KATA POSITIF & NEGATIF ID
// ==========================================
const positiveLexicon = {
  'bagus': 2, 'baik': 2, 'membantu': 3, 'mudah': 2.5, 'cepat': 2.5, 'mantap': 3,
  'memudahkan': 3, 'keren': 2.5, 'puas': 3, 'terbaik': 3, 'lancar': 2.5,
  'hebat': 2.5, 'suka': 2, 'senang': 2, 'terima kasih': 2, 'makasih': 2,
  'bermanfaat': 3, 'praktis': 2.5, 'efisien': 2.5, 'oke': 1.5, 'ok': 1.5,
  'good': 2, 'great': 3, 'love': 3, 'nice': 2, 'recommended': 3, 'rekomen': 2.5,
  'top': 2.5, 'juara': 3, 'sempurna': 3, 'berkualitas': 2.5, 'ramah': 2,
  'jelas': 1.5, 'sukses': 2, 'berhasil': 2, 'aman': 2, 'nyaman': 2.5
};

const negativeLexicon = {
  'kecewa': -3, 'buruk': -3, 'jelek': -3, 'rusak': -3, 'error': -2.5,
  'gagal': -2.5, 'lambat': -2.5, 'lemot': -2.5, 'lelet': -2.5, 'sulit': -2.5,
  'susah': -2.5, 'rumit': -2, 'ribet': -2.5, 'hancur': -3.5, 'sampah': -4,
  'kapok': -3.5, 'parah': -3, 'emosi': -2.5, 'kesal': -2.5, 'pusing': -2,
  'stuck': -2, 'bug': -2, 'mental': -2.5, 'keluar sendiri': -3, 'bohong': -3.5,
  'penipu': -4, 'tipu': -3.5, 'rugi': -3, 'dipersulit': -3.5, 'sulit': -2.5,
  'payah': -3, 'ancur': -3.5, 'ribet': -2.5, 'muak': -3.5, 'tolak': -2,
  'ditolak': -2.5, 'lelet': -2.5, 'hang': -2, 'force close': -3, 'lelet': -2.5,
  'benci': -3.5, 'nyesel': -3, 'menyesal': -3, 'kurang': -1.5, 'lama': -2
};

const negationWords = new Set(['tidak', 'bukan', 'jangan', 'belum', 'kurang', 'tanpa']);

// ==========================================
// 3. FUNGSI PREPROCESSING TEKS
// ==========================================
function preprocessText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.toLowerCase();

  // 1. Hilangkan URL, mentions, dan karakter aneh
  text = text.replace(/https?:\/\/\S+|www\.\S+/g, ' ');
  text = text.replace(/[^\w\s-]/g, ' ');

  // 2. Hilangkan repetisi karakter berlebihan (misal: "baguuuussss" -> "bagus")
  text = text.replace(/(.)\1{2,}/g, '$1');

  // 3. Tokenisasi & Normalisasi Slang
  const words = text.split(/\s+/).filter(Boolean);
  const normalizedWords = words.map(w => slangDictionary[w] || w);

  return normalizedWords.join(' ').trim();
}

// ==========================================
// 4. ANALISIS SENTIMEN & DETEKSI SARKASME
// ==========================================
function analyzeSentiment(cleanedText, rawText, score) {
  const words = cleanedText.split(/\s+/);
  let totalScore = 0;
  let matches = [];
  let isNegated = false;

  // Cek frasa taktik umum "bintang 5 biar dibaca"
  const rawLower = (rawText || '').toLowerCase();
  const isBintang5Tactic = (score >= 4) && (
    rawLower.includes('bintang 5 biar') ||
    rawLower.includes('bintang 5 sengaja') ||
    rawLower.includes('bintang lima biar') ||
    rawLower.includes('bintang 5 spy') ||
    rawLower.includes('bintang 5 supaya') ||
    rawLower.includes('bintang 5 buat') ||
    rawLower.includes('bintang 5 karna')
  );

  // Cek frasa sarkasme umum
  const isSarcasm = (
    rawLower.includes('melatih kesabaran') ||
    rawLower.includes('mengajarkan bersabar') ||
    rawLower.includes('bikin emosi') ||
    rawLower.includes('bikin naik darah') ||
    (rawLower.includes('keren') && rawLower.includes('bintang 1'))
  );

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Cek kata negasi
    if (negationWords.has(word)) {
      isNegated = true;
      continue;
    }

    // 2-gram check (misal: "terima kasih", "keluar sendiri")
    const twoGram = (i < words.length - 1) ? `${word} ${words[i + 1]}` : '';
    if (twoGram && positiveLexicon[twoGram]) {
      const val = positiveLexicon[twoGram];
      totalScore += isNegated ? -val * 0.8 : val;
      matches.push({ phrase: twoGram, score: isNegated ? -val * 0.8 : val });
      isNegated = false;
      i++;
      continue;
    }
    if (twoGram && negativeLexicon[twoGram]) {
      const val = negativeLexicon[twoGram];
      totalScore += isNegated ? -val * 0.5 : val;
      matches.push({ phrase: twoGram, score: isNegated ? -val * 0.5 : val });
      isNegated = false;
      i++;
      continue;
    }

    // Single word check
    if (positiveLexicon[word] !== undefined) {
      const val = positiveLexicon[word];
      const appliedVal = isNegated ? -val * 0.9 : val; // "tidak bagus" jadi bernilai negatif
      totalScore += appliedVal;
      matches.push({ word, score: appliedVal, negated: isNegated });
      isNegated = false;
    } else if (negativeLexicon[word] !== undefined) {
      const val = negativeLexicon[word];
      const appliedVal = isNegated ? -val * 0.5 : val; // "tidak susah" jadi agak positif
      totalScore += appliedVal;
      matches.push({ word, score: appliedVal, negated: isNegated });
      isNegated = false;
    } else {
      // Reset negasi jika bertemu kata netral lebih dari 2 kata
      if (isNegated && i % 2 === 0) isNegated = false;
    }
  }

  // Terapkan penalti jika terdeteksi taktik "bintang 5 biar dibaca" atau sarkasme
  if (isBintang5Tactic) {
    totalScore = -4.0;
  } else if (isSarcasm) {
    totalScore = -3.5;
  }

  // Klasifikasi Sentimen Teks
  let textSentiment = 'Netral';
  if (totalScore > 0.5) {
    textSentiment = 'Positif';
  } else if (totalScore < -0.5) {
    textSentiment = 'Negatif';
  }

  // ==========================================
  // DETEKSI KETIDAKSESUAIAN (MISMATCH)
  // ==========================================
  let mismatchType = 'MATCH';
  let mismatchReason = '';

  const isRatingHigh = (score >= 4);
  const isRatingLow = (score <= 2);

  if (isRatingHigh && textSentiment === 'Negatif') {
    mismatchType = 'MISMATCH_HIGH_RATING';
    mismatchReason = isBintang5Tactic 
      ? 'Taktik Bintang 5 agar ulasan dibaca/naik ke atas' 
      : 'Rating bintang tinggi (4-5), namun isi ulasan memuat kritik/keluhan tajam';
  } else if (isRatingLow && textSentiment === 'Positif') {
    mismatchType = 'MISMATCH_LOW_RATING';
    mismatchReason = isSarcasm 
      ? 'Sarkasme / Sindiran halus (Pujian berkonotasi keluhan)' 
      : 'Salah klik rating / Human error (Isi ulasan berupa pujian murni)';
  }

  return {
    sentimentScore: parseFloat(totalScore.toFixed(2)),
    textSentiment,
    mismatchType,
    mismatchReason,
    isBintang5Tactic,
    isSarcasm
  };
}

// ==========================================
// 5. EKSEKUSI PIPELINE PADA 5.000 DATASET
// ==========================================
async function main() {
  console.log('================================================================');
  console.log('🚀 MEMULAI PIPELINE TEXT PREPROCESSING & SENTIMENT ANALYSIS');
  console.log('================================================================\n');

  const rawFilePath = path.resolve('data/mobile_jkn_reviews_5000.json');
  console.log(`📖 Membaca dataset: ${rawFilePath}...`);
  const rawData = JSON.parse(await fs.readFile(rawFilePath, 'utf-8'));
  console.log(`📊 Total dataset: ${rawData.length} ulasan.\n`);

  console.log('⚙️ Menjalankan pembersihan teks, normalisasi slang, dan analisis sentimen...');
  
  const processedData = rawData.map((r, idx) => {
    const cleanedText = preprocessText(r.text);
    const analysis = analyzeSentiment(cleanedText, r.text, r.score);

    return {
      no: idx + 1,
      id: r.id,
      userName: r.userName,
      score: r.score,
      date: r.date,
      rawText: r.text,
      cleanedText: cleanedText,
      sentimentScore: analysis.sentimentScore,
      textSentiment: analysis.textSentiment,
      mismatchType: analysis.mismatchType,
      mismatchReason: analysis.mismatchReason,
      isBintang5Tactic: analysis.isBintang5Tactic,
      isSarcasm: analysis.isSarcasm,
      thumbsUp: r.thumbsUp,
      version: r.version
    };
  });

  // Statistik Komparasi
  const ratingPositive = processedData.filter(d => d.score >= 4).length;
  const ratingNegative = processedData.filter(d => d.score <= 2).length;
  const ratingNeutral = processedData.filter(d => d.score === 3).length;

  const textPositive = processedData.filter(d => d.textSentiment === 'Positif').length;
  const textNegative = processedData.filter(d => d.textSentiment === 'Negatif').length;
  const textNeutral = processedData.filter(d => d.textSentiment === 'Netral').length;

  const mismatchHigh = processedData.filter(d => d.mismatchType === 'MISMATCH_HIGH_RATING').length;
  const mismatchLow = processedData.filter(d => d.mismatchType === 'MISMATCH_LOW_RATING').length;
  const totalMismatches = mismatchHigh + mismatchLow;

  console.log('================================================================');
  console.log('📊 HASIL KOMPARASI: RATING BINTANG vs SENTIMEN TEKS MURNI');
  console.log('================================================================');
  console.log(`1. Parameter Rating Bintang:`);
  console.log(`   - Positif (⭐4-5) : ${ratingPositive} (${((ratingPositive/processedData.length)*100).toFixed(1)}%)`);
  console.log(`   - Negatif (⭐1-2) : ${ratingNegative} (${((ratingNegative/processedData.length)*100).toFixed(1)}%)`);
  console.log(`   - Netral  (⭐3)   : ${ratingNeutral} (${((ratingNeutral/processedData.length)*100).toFixed(1)}%)`);
  console.log(`\n2. Parameter Sentimen Teks NLP (Setelah Preprocessing):`);
  console.log(`   - Positif (Teks)  : ${textPositive} (${((textPositive/processedData.length)*100).toFixed(1)}%)`);
  console.log(`   - Negatif (Teks)  : ${textNegative} (${((textNegative/processedData.length)*100).toFixed(1)}%)`);
  console.log(`   - Netral  (Teks)  : ${textNeutral} (${((textNeutral/processedData.length)*100).toFixed(1)}%)`);
  console.log(`\n3. Anomali & Ketidaksesuaian (Rating vs Teks Mismatch):`);
  console.log(`   - Total Anomali   : ${totalMismatches} ulasan (${((totalMismatches/processedData.length)*100).toFixed(1)}% dari total)`);
  console.log(`   - Bintang 4-5 tapi Komplain Keras (Taktik Viral) : ${mismatchHigh} ulasan`);
  console.log(`   - Bintang 1-2 tapi Pujian / Sarkasme             : ${mismatchLow} ulasan`);
  console.log('================================================================\n');

  // Simpan JSON
  const outputJson = path.resolve('data/mobile_jkn_sentiment_analyzed_5000.json');
  await fs.writeFile(outputJson, JSON.stringify(processedData, null, 2), 'utf-8');
  console.log(`📁 File JSON hasil analisis tersimpan: ${outputJson}`);

  // Simpan JS Bundle untuk Dashboard
  const outputJs = path.resolve('data/mobile_jkn_reviews_5000.js');
  await fs.writeFile(outputJs, `window.RAW_REVIEWS = ${JSON.stringify(processedData, null, 2)};`, 'utf-8');
  console.log(`📁 File JS Bundle Dashboard tersimpan: ${outputJs}`);

  // Simpan CSV
  const outputCsv = path.resolve('data/mobile_jkn_sentiment_analyzed_5000.csv');
  const csvWriter = createObjectCsvWriter({
    path: outputCsv,
    header: [
      { id: 'no', title: 'No' },
      { id: 'userName', title: 'User Name' },
      { id: 'score', title: 'Rating Bintang' },
      { id: 'date', title: 'Tanggal' },
      { id: 'rawText', title: 'Ulasan Asli' },
      { id: 'cleanedText', title: 'Ulasan Preprocessing' },
      { id: 'sentimentScore', title: 'Skor Sentimen' },
      { id: 'textSentiment', title: 'Sentimen Teks' },
      { id: 'mismatchType', title: 'Status Kesesuaian' },
      { id: 'mismatchReason', title: 'Keterangan Anomali' }
    ]
  });
  await csvWriter.writeRecords(processedData);
  console.log(`📊 File CSV hasil analisis tersimpan: ${outputCsv}\n`);

  console.log('💡 Contoh Kasus Anomali yang Berhasil Ditemukan:');
  const sampleAnomalies = processedData.filter(d => d.mismatchType !== 'MATCH').slice(0, 4);
  sampleAnomalies.forEach((a, i) => {
    console.log(`\n[Contoh ${i + 1}] ⭐ ${a.score} | Sentimen Teks: ${a.textSentiment} (${a.sentimentScore})`);
    console.log(`Teks Asli  : "${a.rawText}"`);
    console.log(`Alasan     : ${a.mismatchReason}`);
  });
}

main();
