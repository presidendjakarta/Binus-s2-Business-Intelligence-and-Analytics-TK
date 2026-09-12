import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const natural = require('natural');
const { Stemmer, defaultDictionary, defaultStopWord } = require('ts-sastrawi');

console.log('✅ Natural Library Loaded:', typeof natural.BayesClassifier === 'function');
console.log('✅ Sastrawi Stemmer Loaded:', typeof Stemmer === 'function');

// Inisialisasi Sastrawi Stemmer dengan Kamus Dasar Kata Indonesia
const customDictionary = defaultDictionary();
const stemmer = new Stemmer(customDictionary);

const sampleText = 'Aplikasi ini sangat mempermudah dan membantu pelayanan pasien di rumah sakit';
const stemmed = stemmer.stem(sampleText);
console.log('\n--- UJI SASTRAWI STEMMER INDONESIA ---');
console.log('Original :', sampleText);
console.log('Stemmed  :', stemmed);

// Demo Natural BayesClassifier
const classifier = new natural.BayesClassifier();
classifier.addDocument(stemmer.stem('aplikasi sangat bagus mantap membantu'), 'Positif');
classifier.addDocument(stemmer.stem('mudah cepat praktis digunakan'), 'Positif');
classifier.addDocument(stemmer.stem('aplikasi jelek sering error gagal login'), 'Negatif');
classifier.addDocument(stemmer.stem('kecewa berat antrean kuota penuh terus'), 'Negatif');

classifier.train();

const testText = 'pelayanan sangat cepat dan memudahkan';
const testStemmed = stemmer.stem(testText);
const pred = classifier.classify(testStemmed);
console.log('\n--- UJI NATURAL BAYES CLASSIFIER ---');
console.log('Test Text    :', testText);
console.log('Test Stemmed :', testStemmed);
console.log('Prediction   :', pred);
