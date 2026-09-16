const fs = require('fs');
const path = require('path');
const { Stemmer, defaultDictionary, tokenize } = require('ts-sastrawi');

// 1. Initialize official base dictionary (29,932 kata dasar)
const dict = defaultDictionary();

// 2. Load expanded KBBI Wordlist from master_data/kbbi_wordlist.txt (67,000+ words)
try {
  const kbbiPath = path.join(__dirname, '..', '..', 'master_data', 'kbbi_wordlist.txt');
  if (fs.existsSync(kbbiPath)) {
    const kbbiRaw = fs.readFileSync(kbbiPath, 'utf8');
    const kbbiWords = kbbiRaw
      .split(/\r?\n/)
      .map(w => w.trim().toLowerCase())
      .filter(w => /^[a-z]{3,}$/.test(w));
    dict.add(kbbiWords);
  }
} catch (err) {
  // Graceful fallback to defaultDictionary
}

// 3. Load Domain Terms from master_data/domain_terms.csv
try {
  const domainCsvPath = path.join(__dirname, '..', '..', 'master_data', 'domain_terms.csv');
  if (fs.existsSync(domainCsvPath)) {
    const lines = fs.readFileSync(domainCsvPath, 'utf8').split(/\r?\n/);
    const domainTerms = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      const term = parts[0]?.trim().toLowerCase();
      if (term && /^[a-z0-9]+$/.test(term)) {
        domainTerms.push(term);
      }
    }
    if (domainTerms.length > 0) {
      dict.add(domainTerms);
    }
  }
} catch (err) {
  // Graceful fallback
}

const stemmer = new Stemmer(dict);
const stemCache = new Map();

// 4. Load Stemming & Over-Stemming Overrides from master_data/stem_overrides.csv
const stemOverrides = new Map();
try {
  const overridesCsvPath = path.join(__dirname, '..', '..', 'master_data', 'stem_overrides.csv');
  if (fs.existsSync(overridesCsvPath)) {
    const lines = fs.readFileSync(overridesCsvPath, 'utf8').split(/\r?\n/);
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      const original = parts[0]?.trim().toLowerCase();
      const override = parts[1]?.trim().toLowerCase();
      if (original && override) {
        stemOverrides.set(original, override);
      }
    }
  }
} catch (err) {
  // Graceful fallback
}

/**
 * Stems a single word using enhanced dictionary, semantic protection, and memoization
 * @param {string} word 
 * @returns {string}
 */
function stemWord(word) {
  if (!word || typeof word !== 'string') return '';
  const lower = word.toLowerCase().trim();
  if (lower.length === 0) return '';

  // 1. Check explicit semantic protection overrides from master_data/stem_overrides.csv
  if (stemOverrides.has(lower)) {
    return stemOverrides.get(lower);
  }

  // 2. Check memoized cache
  if (stemCache.has(lower)) {
    return stemCache.get(lower);
  }

  // 3. Fallback to Sastrawi Stemmer algorithm
  try {
    const stemmed = stemmer.stem(lower);
    const result = stemmed || lower;
    stemCache.set(lower, result);
    return result;
  } catch (err) {
    stemCache.set(lower, lower);
    return lower;
  }
}

/**
 * Stems a full text sentence or an array of tokens
 * @param {string|string[]} input 
 * @returns {string}
 */
function stemSentence(input) {
  if (Array.isArray(input)) {
    return input.map(w => stemWord(w)).filter(Boolean).join(' ');
  }
  if (typeof input !== 'string') return '';
  const tokens = tokenize(input);
  return tokens.map(w => stemWord(w)).filter(Boolean).join(' ');
}

module.exports = {
  stemmer,
  tokenize,
  stemWord,
  stemSentence,
  dictionarySize: dict.count(),
  overridesCount: stemOverrides.size
};
