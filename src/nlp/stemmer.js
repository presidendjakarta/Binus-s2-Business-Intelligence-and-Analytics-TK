const { Stemmer, defaultDictionary, tokenize } = require('ts-sastrawi');

// Initialize default dictionary (29,932 pure root words)
const dict = defaultDictionary();

// Add verified Mobile JKN domain root terms
const domainTerms = [
  'faskes', 'bpjs', 'jkn', 'kis', 'nik', 'otp', 'pkm', 'fktp', 'fkrtl', 
  'autodebet', 'skrining', 'antre', 'antrean', 'rujuk', 'rujukan', 'tagihan', 
  'iuran', 'peserta', 'kepesertaan', 'klinik', 'puskesmas', 'perbaiki', 
  'validasi', 'otentikasi', 'reaktivasi', 'unduh'
];
dict.add(domainTerms);

const stemmer = new Stemmer(dict);
const stemCache = new Map();

/**
 * Stems a single word using enhanced dictionary with memoization cache
 * @param {string} word 
 * @returns {string}
 */
function stemWord(word) {
  if (!word || typeof word !== 'string') return '';
  const lower = word.toLowerCase().trim();
  
  // Protect critical complaint keywords from over-stemming to positive roots
  if (['perbaiki', 'perbaikan', 'benahi', 'pembenahan'].includes(lower)) {
    return 'perbaiki';
  }

  if (stemCache.has(lower)) {
    return stemCache.get(lower);
  }
  try {
    const stemmed = stemmer.stem(lower);
    stemCache.set(lower, stemmed || lower);
    return stemmed || lower;
  } catch (err) {
    stemCache.set(lower, lower);
    return lower;
  }
}

/**
 * Stems a full text sentence/array of tokens
 * @param {string|string[]} input 
 * @returns {string}
 */
function stemSentence(input) {
  if (Array.isArray(input)) {
    return input.map(w => stemWord(w)).join(' ');
  }
  if (typeof input !== 'string') return '';
  const tokens = tokenize(input);
  return tokens.map(w => stemWord(w)).join(' ');
}

module.exports = {
  stemmer,
  tokenize,
  stemWord,
  stemSentence,
  dictionarySize: dict.count()
};
