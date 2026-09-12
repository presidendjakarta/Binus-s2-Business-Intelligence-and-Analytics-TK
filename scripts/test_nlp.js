import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const natural = require('natural');
const { Stemmer, defaultDictionary } = require('ts-sastrawi');
import { stem } from '../src/nlp/stemmer.js';
import { preprocess } from '../src/nlp/preprocessor.js';

console.log('✅ Natural Library Loaded:', typeof natural.BayesClassifier === 'function');
console.log('✅ Sastrawi Stemmer Loaded:', typeof Stemmer === 'function');

// Demo Sastrawi Stemming Indonesia
const sampleText = 'Aplikasi ini sangat mempermudah dan membantu pelayanan pasien di rumah sakit';
const stemmed = stem(sampleText);
console.log('\n--- UJI SASTRAWI STEMMER INDONESIA ---');
console.log('Original :', sampleText);
console.log('Stemmed  :', stemmed);

// Demo Preprocessing Lengkap (Slang + Stemming + Bigram)
const preprocessedTokens = preprocess('aplikasi nya bgus bgt sangat membantu pelayanan bpjs');
console.log('\n--- UJI PREPROCESSOR MODULAR ---');
console.log('Tokens   :', preprocessedTokens);

// Demo Natural BayesClassifier
const classifier = new natural.BayesClassifier();
classifier.addDocument(stem('aplikasi sangat bagus mantap membantu'), 'Positif');
classifier.addDocument(stem('mudah cepat praktis digunakan'), 'Positif');
classifier.addDocument(stem('aplikasi jelek sering error gagal login'), 'Negatif');
classifier.addDocument(stem('kecewa berat antrean kuota penuh terus'), 'Negatif');

classifier.train();

const testText = 'pelayanan sangat cepat dan memudahkan';
const testStemmed = stem(testText);
const pred = classifier.classify(testStemmed);
console.log('\n--- UJI NATURAL BAYES CLASSIFIER ---');
console.log('Test Text    :', testText);
console.log('Test Stemmed :', testStemmed);
console.log('Prediction   :', pred);
console.log('\n🎉 Semua pengujian NLP modular berhasil!');
