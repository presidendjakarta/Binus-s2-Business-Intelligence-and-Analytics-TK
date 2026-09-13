const path = require('path');
const { loadSlangDict, loadEmojiDict, loadStopwords } = require('./csvLoader');
const { stemWord } = require('./stemmer');

const ADVERSATIVE_CONJUNCTIONS = new Set([
  'tapi', 'tetapi', 'namun', 'malah', 'sayang', 'sayangnya', 'cuma', 'hanya', 'sedangkan'
]);

const CONCESSIVE_CONJUNCTIONS = new Set([
  'padahal', 'meskipun', 'walaupun', 'kendati', 'sekalipun'
]);

const NEGATION_WORDS = new Set([
  'tidak', 'tak', 'bukan', 'jangan', 'belum', 'kurang', 'gak', 'nggak', 
  'ngga', 'tdk', 'tida', 'ndak', 'g', 'bkn', 'blm', 'blom'
]);

// Note: 'ada' is NOT a filler adverb, 'tidak ada' is a key complaint token!
const FILLER_ADVERBS = new Set([
  'sangat', 'bgt', 'banget', 'begitu', 'terlalu', 'cukup', 'sanggup', 
  'memberikan', 'beri', 'untuk', 'utk', 'bisa', 'mau', 'yang', 'yg', 'mampu'
]);

const CORE_SENTIMENT_WORDS = new Set([
  'bagus', 'mantap', 'mudah', 'cepat', 'puas', 'baik', 'lancar', 'hebat', 'keren', 'bermanfaat',
  'kecewa', 'buruk', 'parah', 'rusak', 'error', 'sulit', 'rugi', 'lambat', 'lemot', 'ribet', 'rumit',
  'tunggak', 'tunggakan', 'potong', 'tagih', 'tagihan', 'bayar'
]);

class TextPreprocessor {
  constructor(masterDataDir) {
    const dir = masterDataDir || path.join(__dirname, '../../master_data');
    this.slangDict = loadSlangDict(dir);
    this.emojiDict = loadEmojiDict(dir);
    this.stopwords = loadStopwords(dir);
    
    // Sort emojis by length descending to match compound emojis first
    this.sortedEmojiKeys = Object.keys(this.emojiDict).sort((a, b) => b.length - a.length);
  }

  /**
   * Translates emojis and emoticons to Indonesian semantic text
   */
  replaceEmojis(text) {
    if (!text) return '';
    let result = text;
    for (const emoji of this.sortedEmojiKeys) {
      if (result.includes(emoji)) {
        const translation = this.emojiDict[emoji];
        result = result.split(emoji).join(` ${translation} `);
      }
    }
    return result;
  }

  /**
   * Cleans text: lowercase, normalize rhetorical idioms, remove URLs, mentions, symbols
   */
  cleanText(text) {
    if (!text || typeof text !== 'string') return '';

    // 1. Replace Emojis first
    let cleaned = this.replaceEmojis(text);

    // 2. Lowercase
    cleaned = cleaned.toLowerCase();

    // 3. Normalize Rhetorical Idioms & Phrases
    cleaned = cleaned
      .replace(/apa gunanya|apa guna|buat apa|gak guna|ga guna|kaga guna|nggak guna/g, ' tidak berguna ')
      .replace(/sama saja bohong|sama aja bohong|ujung ujungnya ke kantor/g, ' kecewa ')
      .replace(/tidak memberikan solusi|tidak ada solusi|gada solusi|gaada solusi/g, ' kecewa tidak solusi ')
      .replace(/gak ada|ga ada|kaga ada|ngga ada|nggak ada/g, ' tidak ada ');

    // 4. Remove URLs
    cleaned = cleaned.replace(/https?:\/\/\S+|www\.\S+/g, ' ');

    // 5. Remove Email/Usernames/Hashtags
    cleaned = cleaned.replace(/[@#]\w+/g, ' ');

    // 6. Replace punctuation and non-alphanumeric with space (keep letters and spaces)
    cleaned = cleaned.replace(/[^a-z0-9\s]/g, ' ');

    // 7. Normalize elongated characters (e.g. "baguuuus" -> "bagus", "lemmooot" -> "lemot")
    cleaned = cleaned.replace(/(.)\1{2,}/g, '$1$1');

    // 8. Collapse whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * Full NLP preprocessing pipeline
   * @param {string} text Raw review string
   * @returns {{ raw: string, cleaned: string, tokens: string[], processedText: string }}
   */
  preprocess(text) {
    const cleaned = this.cleanText(text);
    if (!cleaned) {
      return { raw: text, cleaned: '', tokens: [], processedText: '' };
    }

    // 1. Initial tokenize
    let rawTokens = cleaned.split(/\s+/).filter(w => w.length > 1);

    // 2. Slang normalization
    const normalizedWords = [];
    for (const w of rawTokens) {
      const replaced = this.slangDict[w] || w;
      const subTokens = replaced.split(/\s+/).filter(Boolean);
      normalizedWords.push(...subTokens);
    }

    // 3. Clause Splitting
    let advIdx = normalizedWords.findIndex(w => ADVERSATIVE_CONJUNCTIONS.has(w));
    let concIdx = normalizedWords.findIndex(w => CONCESSIVE_CONJUNCTIONS.has(w));

    const processClauseTokens = (tokenList, weightMultiplier = 1) => {
      const result = [];
      const skipIndices = new Set();

      // Multi-step Negation
      for (let i = 0; i < tokenList.length; i++) {
        const current = tokenList[i];
        if (NEGATION_WORDS.has(current)) {
          let targetIdx = i + 1;
          while (targetIdx < tokenList.length && FILLER_ADVERBS.has(tokenList[targetIdx]) && targetIdx - i <= 2) {
            targetIdx++;
          }
          if (targetIdx < tokenList.length) {
            const rawTarget = tokenList[targetIdx];
            // Do not bind negation to pronouns or stopwords (e.g. tidak_saya, tidak_kak)
            if (!this.stopwords.has(rawTarget) && rawTarget !== 'saya' && rawTarget !== 'aku' && rawTarget !== 'kak') {
              const targetStemmed = stemWord(rawTarget);
              if (targetStemmed.length >= 2) {
                const compound = `tidak_${targetStemmed}`;
                const totalRep = weightMultiplier * 2;
                for (let m = 0; m < totalRep; m++) {
                  result.push(compound);
                }
                skipIndices.add(targetIdx);
                i = targetIdx;
                continue;
              }
            }
          }
        }
      }

      // Unigram
      for (let i = 0; i < tokenList.length; i++) {
        const current = tokenList[i];
        if (!skipIndices.has(i) && !NEGATION_WORDS.has(current)) {
          const stemmed = stemWord(current);
          if (stemmed && stemmed.length > 1 && !this.stopwords.has(stemmed)) {
            const isSentiment = CORE_SENTIMENT_WORDS.has(stemmed);
            const totalRep = isSentiment ? weightMultiplier * 2 : weightMultiplier;
            for (let m = 0; m < totalRep; m++) {
              result.push(stemmed);
            }
          }
        }
      }
      return result;
    };

    let finalTokens = [];
    if (advIdx !== -1 && advIdx < normalizedWords.length - 1) {
      // Adversative ('tapi'): boost AFTER
      const pre = normalizedWords.slice(0, advIdx);
      const post = normalizedWords.slice(advIdx + 1);
      finalTokens = [...processClauseTokens(pre, 1), ...processClauseTokens(post, 2)];
    } else if (concIdx !== -1 && concIdx > 0) {
      // Concessive ('padahal'): boost BEFORE (main complaint)
      const pre = normalizedWords.slice(0, concIdx);
      const post = normalizedWords.slice(concIdx + 1);
      finalTokens = [...processClauseTokens(pre, 2), ...processClauseTokens(post, 1)];
    } else {
      finalTokens = processClauseTokens(normalizedWords, 1);
    }

    return {
      raw: text,
      cleaned,
      tokens: finalTokens,
      processedText: finalTokens.join(' ')
    };
  }

  /**
   * Generates unigrams + bigrams for TF-IDF feature extraction
   */
  extractNgrams(tokens, maxN = 2) {
    const ngrams = [...tokens];
    if (maxN >= 2 && tokens.length >= 2) {
      for (let i = 0; i < tokens.length - 1; i++) {
        ngrams.push(`${tokens[i]}_${tokens[i + 1]}`);
      }
    }
    return ngrams;
  }
}

module.exports = TextPreprocessor;
