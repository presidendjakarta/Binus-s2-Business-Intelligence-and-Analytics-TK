const TextPreprocessor = require('./src/nlp/preprocessor');
const TfidfVectorizer = require('./src/ml/vectorizer');
const MultinomialNaiveBayes = require('./src/ml/naiveBayes');

console.log('=== TEST NLP & MACHINE LEARNING PIPELINE ===\n');

const preprocessor = new TextPreprocessor();

const testCases = [
  'Aplikasinya mantap bgt 👍 sangat membantu antrian faskes ga ribet lagi!',
  'Parah bgt, login error mulu gabisa masuk padahal password bener 😡🤮',
  'Pelayanan bpjs kesehatan makin bagus dan ramah bintang 5',
  'Lemot sekali servernya tidak bisa dibuka saat mau berobat, tolong diperbaiki!!'
];

console.log('1. Testing Preprocessing:');
testCases.forEach((text, i) => {
  const res = preprocessor.preprocess(text);
  console.log(`\n[Test Case ${i+1}]`);
  console.log(`  Raw       : ${res.raw}`);
  console.log(`  Cleaned   : ${res.cleaned}`);
  console.log(`  Tokens    : [${res.tokens.join(', ')}]`);
});

console.log('\n2. Testing TF-IDF & Multinomial Naive Bayes:');
const docs = testCases.map(t => preprocessor.preprocess(t).tokens);
const labels = ['Positif', 'Negatif', 'Positif', 'Negatif'];

const vectorizer = new TfidfVectorizer({ minDf: 1 });
const X = vectorizer.fitTransform(docs);
console.log(`  Vocabulary Size: ${vectorizer.vocabulary.size}`);

const nb = new MultinomialNaiveBayes();
nb.train(X, labels, vectorizer.vocabulary.size);

const preds = nb.predict(X);
console.log('\n3. Predictions:');
preds.forEach((p, i) => {
  console.log(`  Doc ${i+1}: Actual=${labels[i]} | Predicted=${p.label} (Conf: ${(p.confidence*100).toFixed(1)}%)`);
});

console.log('\n[✓] NLP & ML Pipeline unit test completed successfully!');
