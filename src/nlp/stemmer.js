import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Stemmer, defaultDictionary } = require('ts-sastrawi');

// Inisialisasi Singleton Sastrawi Stemmer
const dictionary = defaultDictionary();
const sastrawiStemmerInstance = new Stemmer(dictionary);

/**
 * Melakukan stemming morfologi kata dasar bahasa Indonesia (Algoritma Nazief-Adriani)
 * @param {string} text - Kata atau kalimat yang akan di-stem
 * @returns {string} - Hasil kata dasar
 */
export function stem(text) {
  if (!text) return '';
  try {
    return sastrawiStemmerInstance.stem(text);
  } catch {
    return text;
  }
}

export const sastrawiStemmer = sastrawiStemmerInstance;
export default { stem, sastrawiStemmer };
