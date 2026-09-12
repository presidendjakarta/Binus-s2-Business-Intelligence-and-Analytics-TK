/**
 * TF-IDF Vectorizer dengan Smoothing dan Normalisasi L2
 * Standar matematis scikit-learn TfidfVectorizer
 */
export class TFIDFVectorizer {
  constructor(minDf = 2) {
    this.minDf = minDf;
    this.vocabulary = new Map();
    this.idf = new Map();
    this.docFreq = new Map();
    this.numDocs = 0;
  }

  fit(docsTokens) {
    this.numDocs = docsTokens.length;
    const docFreq = new Map();

    docsTokens.forEach(tokens => {
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(w => {
        docFreq.set(w, (docFreq.get(w) || 0) + 1);
      });
    });

    this.docFreq = docFreq;

    let idx = 0;
    docFreq.forEach((count, word) => {
      if (count >= this.minDf) {
        this.vocabulary.set(word, idx++);
        // IDF Formula: log((N + 1) / (DF + 1)) + 1
        this.idf.set(word, Math.log((this.numDocs + 1) / (count + 1)) + 1);
      }
    });
  }

  transform(tokens) {
    const vec = new Float64Array(this.vocabulary.size);
    const tf = new Map();
    tokens.forEach(w => {
      if (this.vocabulary.has(w)) {
        tf.set(w, (tf.get(w) || 0) + 1);
      }
    });

    let normSq = 0;
    tf.forEach((count, word) => {
      const idx = this.vocabulary.get(word);
      const tfVal = count / tokens.length;
      const idfVal = this.idf.get(word) || 1;
      const tfidf = tfVal * idfVal;
      vec[idx] = tfidf;
      normSq += tfidf * tfidf;
    });

    // L2 Normalization
    if (normSq > 0) {
      const norm = Math.sqrt(normSq);
      for (let i = 0; i < vec.length; i++) {
        vec[i] /= norm;
      }
    }
    return vec;
  }
}

export default TFIDFVectorizer;
