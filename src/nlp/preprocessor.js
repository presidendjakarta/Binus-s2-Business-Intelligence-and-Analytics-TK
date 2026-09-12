import { SLANG_DICTIONARY } from './slangDictionary.js';
import { INDONESIAN_STOPWORDS } from './stopwords.js';
import { translateEmojis } from './emojiDictionary.js';
import { stem } from './stemmer.js';

/**
 * Pipeline Preprocessing Teks Lengkap:
 * 1. Emoji Sentiment Translation (👍 -> emoji_jempol_bagus, 😡 -> emoji_marah_kesal)
 * 2. Case Folding (huruf kecil)
 * 3. URL & Special Characters Cleaning
 * 4. Repetition Removal (e.g. baguuus -> bagus)
 * 5. Slang Normalization (bahasa gaul -> baku)
 * 6. Sastrawi Morphological Stemming
 * 7. Stopwords Removal
 * 8. Unigram & Bigram Feature Extraction
 *
 * @param {string} text - Teks mentah ulasan
 * @returns {Array<string>} - Array token fitur unigram + bigram
 */
export function preprocess(text) {
  if (!text || typeof text !== 'string') return [];

  // 1. Terjemahkan Emoji ke Token Sentimen
  const withEmojis = translateEmojis(text);

  const cleaned = withEmojis.toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/(.)\1{2,}/g, '$1');

  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  
  // Normalisasi Slang & Stemming Sastrawi
  const normalizedTokens = rawTokens.map(w => {
    const slangReplaced = SLANG_DICTIONARY[w] || w;
    return stem(slangReplaced);
  });

  // Ekstraksi Unigram + Bigram
  const filteredTokens = [];
  for (let i = 0; i < normalizedTokens.length; i++) {
    const w = normalizedTokens[i];
    if (!INDONESIAN_STOPWORDS.has(w) && w.length > 2) {
      filteredTokens.push(w);
    }
    // Bigram (e.g., tidak_bisa, sering_error, sangat_bantu)
    if (i < normalizedTokens.length - 1) {
      const nextW = normalizedTokens[i + 1];
      if (w.length > 2 && nextW.length > 2) {
        filteredTokens.push(`${w}_${nextW}`);
      }
    }
  }

  return filteredTokens;
}

export default { preprocess };
