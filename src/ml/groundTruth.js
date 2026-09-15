const path = require('path');
const { loadGroundTruthRules } = require('../nlp/csvLoader');

// Load rules from master_data/ground_truth_rules.csv with lazy loading / singleton cache
let cachedRules = null;

function getRules(customMasterDataDir) {
  if (cachedRules && !customMasterDataDir) {
    return cachedRules;
  }
  const dir = customMasterDataDir || path.join(__dirname, '../../master_data');
  try {
    cachedRules = loadGroundTruthRules(dir);
  } catch (err) {
    // Fallback default rules if master_data is not reachable
    cachedRules = {
      strongNegativePatterns: [
        'kecewa parah', 'sangat buruk', 'parah banget', 'tidak berguna', 'jelek sekali',
        'eror terus', 'error terus', 'gagal terus', 'aplikasi sampah', 'hancur', 'tidak membantu',
        'tidak bisa login', 'gabisa login', 'sulit login', 'dipersulit', 'sangat mengecewakan'
      ],
      strongPositivePatterns: [
        'sangat membantu', 'sangat bagus', 'terima kasih bpjs', 'luar biasa', 'mantap sekali',
        'terbaik', 'bintang lima', 'sangat mudah', 'sangat puas'
      ],
      posIndicators: ['mudah', 'bagus', 'bantu', 'puas', 'cepat', 'lancar', 'baik', 'senang', 'praktis', 'hebat'],
      negIndicators: ['sulit', 'antri', 'lemot', 'susah', 'gagal', 'kurang', 'lambat', 'rumit', 'eror', 'rusak', 'error', 'ribet', 'kecewa']
    };
  }
  return cachedRules;
}

/**
 * Assigns Ground Truth sentiment label based on Play Store Star Rating & Key Lexicon from master_data
 * @param {number} score User rating (1-5)
 * @param {string} text Raw or cleaned review text
 * @param {string} [masterDataDir] Optional custom master_data folder path
 * @returns {'Positif' | 'Negatif'}
 */
function determineGroundTruth(score, text = '', masterDataDir = null) {
  const lower = (text || '').toLowerCase();
  const rules = getRules(masterDataDir);
  
  const hasNegation = /tidak|bukan|belum|kurang|jangan|gak|nggak|ngga|tdk|tida|ndak/.test(lower);

  // 1. Strong negative keywords override high ratings (sarcasm/mistaken 5 stars)
  for (const pat of rules.strongNegativePatterns) {
    if (lower.includes(pat)) {
      return 'Negatif';
    }
  }

  // 2. Strong positive keywords override low ratings (only if NOT negated)
  if (!hasNegation) {
    for (const pat of rules.strongPositivePatterns) {
      if (lower.includes(pat)) {
        return 'Positif';
      }
    }
  }

  // 3. Standard Star Rating Mapping
  if (score >= 4) {
    return 'Positif';
  } else if (score <= 2) {
    return 'Negatif';
  } else {
    // 4. Rating 3: Count positive vs negative lexicon indicators from master_data
    let posCount = 0;
    let negCount = 0;
    for (const w of rules.posIndicators) if (lower.includes(w)) posCount++;
    for (const w of rules.negIndicators) if (lower.includes(w)) negCount++;

    return posCount >= negCount ? 'Positif' : 'Negatif';
  }
}

module.exports = {
  determineGroundTruth,
  getRules
};
