/**
 * Assigns Ground Truth sentiment label based on Play Store Star Rating & Key Lexicon
 * @param {number} score User rating (1-5)
 * @param {string} text Raw or cleaned review text
 * @returns {'Positif' | 'Negatif'}
 */
function determineGroundTruth(score, text = '') {
  const lower = text.toLowerCase();
  
  const hasNegation = /tidak|bukan|belum|kurang|jangan|gak|nggak|ngga|tdk|tida|ndak/.test(lower);

  // Strong negative keywords override high ratings (sarcasm/mistaken 5 stars)
  const strongNegativePatterns = [
    'kecewa parah', 'sangat buruk', 'parah banget', 'tidak berguna', 'jelek sekali',
    'eror terus', 'error terus', 'gagal terus', 'aplikasi sampah', 'hancur', 'tidak membantu',
    'tidak bisa login', 'gabisa login', 'sulit login', 'dipersulit', 'sangat mengecewakan'
  ];
  for (const pat of strongNegativePatterns) {
    if (lower.includes(pat)) {
      return 'Negatif';
    }
  }

  // Strong positive keywords override low ratings (only if NOT negated)
  if (!hasNegation) {
    const strongPositivePatterns = [
      'sangat membantu', 'sangat bagus', 'terima kasih bpjs', 'luar biasa', 'mantap sekali',
      'terbaik', 'bintang lima', 'sangat mudah', 'sangat puas'
    ];
    for (const pat of strongPositivePatterns) {
      if (lower.includes(pat)) {
        return 'Positif';
      }
    }
  }

  // Standard Star Rating Mapping
  if (score >= 4) {
    return 'Positif';
  } else if (score <= 2) {
    return 'Negatif';
  } else {
    // Rating 3: Count positive vs negative lexicon indicators
    const posIndicators = ['mudah', 'bagus', 'bantu', 'puas', 'cepat', 'lancar', 'baik', 'senang'];
    const negIndicators = ['sulit', 'antri', 'lemot', 'susah', 'gagal', 'kurang', 'lambat', 'rumit', 'eror', 'rusak', 'error'];

    let posCount = 0;
    let negCount = 0;
    for (const w of posIndicators) if (lower.includes(w)) posCount++;
    for (const w of negIndicators) if (lower.includes(w)) negCount++;

    return posCount >= negCount ? 'Positif' : 'Negatif';
  }
}

module.exports = {
  determineGroundTruth
};
