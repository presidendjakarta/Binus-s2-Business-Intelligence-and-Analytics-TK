class TfidfVectorizer {
  constructor(options = {}) {
    this.minDf = options.minDf !== undefined ? options.minDf : 1;
    this.maxDfRatio = options.maxDfRatio || 0.95;
    this.sublinearTf = options.sublinearTf !== false; // default true
    this.ngramRange = options.ngramRange || [1, 2]; // default Unigrams + Bigrams
    this.vocabulary = new Map(); // token -> index
    this.featureNames = []; // index -> token
    this.idf = []; // index -> idf value
    this.docCount = 0;
  }

  /**
   * Generates n-grams from a token array according to ngramRange
   * @param {string[]} tokens
   * @returns {string[]}
   */
  _extractNgrams(tokens) {
    if (!tokens || tokens.length === 0) return [];
    if (!this.ngramRange || (this.ngramRange[0] === 1 && this.ngramRange[1] === 1)) {
      return tokens;
    }
    const result = [...tokens];
    const maxN = this.ngramRange[1] || 2;
    if (maxN >= 2 && tokens.length >= 2) {
      for (let i = 0; i < tokens.length - 1; i++) {
        result.push(`${tokens[i]}_${tokens[i + 1]}`);
      }
    }
    return result;
  }

  /**
   * Learns vocabulary and IDF from a collection of tokenized documents
   * @param {Array<string[]>} tokenizedDocs Array of token arrays
   */
  fit(tokenizedDocs) {
    this.docCount = tokenizedDocs.length;
    const docFreq = new Map();

    // 1. Calculate Document Frequency (DF) across n-grams
    for (const tokens of tokenizedDocs) {
      const expandedTokens = this._extractNgrams(tokens);
      const uniqueTokens = new Set(expandedTokens);
      for (const token of uniqueTokens) {
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
      }
    }

    // 2. Filter vocabulary by minDf and maxDfRatio
    const maxDf = Math.max(1, Math.floor(this.docCount * this.maxDfRatio));
    this.vocabulary.clear();
    this.featureNames = [];
    this.idf = [];

    let index = 0;
    for (const [token, df] of docFreq.entries()) {
      if (df >= this.minDf && df <= maxDf) {
        this.vocabulary.set(token, index);
        this.featureNames.push(token);

        // Standard smooth IDF: ln((1 + N) / (1 + DF)) + 1
        const idfVal = Math.log((1 + this.docCount) / (1 + df)) + 1;
        this.idf.push(idfVal);
        index++;
      }
    }

    return this;
  }

  /**
   * Transforms tokenized document into sparse TF-IDF vector { [index]: weight }
   * @param {string[]} tokens 
   * @returns {{ [index: number]: number }}
   */
  transformDoc(tokens) {
    const expandedTokens = this._extractNgrams(tokens);
    // 1. Calculate Term Frequencies (TF)
    const tfMap = new Map();
    for (const token of expandedTokens) {
      const idx = this.vocabulary.get(token);
      if (idx !== undefined) {
        tfMap.set(idx, (tfMap.get(idx) || 0) + 1);
      }
    }

    if (tfMap.size === 0) return {};

    // 2. Calculate TF-IDF with optional sublinear scaling
    const vector = {};
    let sumSquares = 0;

    for (const [idx, tf] of tfMap.entries()) {
      const tfVal = this.sublinearTf ? 1 + Math.log(tf) : tf;
      const tfidf = tfVal * this.idf[idx];
      vector[idx] = tfidf;
      sumSquares += tfidf * tfidf;
    }

    // 3. L2 Normalization
    const norm = Math.sqrt(sumSquares);
    if (norm > 0) {
      for (const idx in vector) {
        vector[idx] = vector[idx] / norm;
      }
    }

    return vector;
  }

  /**
   * Transforms multiple tokenized documents
   * @param {Array<string[]>} tokenizedDocs 
   * @returns {Array<{ [index: number]: number }>}
   */
  transform(tokenizedDocs) {
    return tokenizedDocs.map(tokens => this.transformDoc(tokens));
  }

  /**
   * Convenience fit and transform
   */
  fitTransform(tokenizedDocs) {
    this.fit(tokenizedDocs);
    return this.transform(tokenizedDocs);
  }

  /**
   * Returns top keywords with their average TF-IDF scores
   */
  getTopFeatures(vectors, topN = 15) {
    const featureScores = new Float64Array(this.featureNames.length);
    for (const vec of vectors) {
      for (const [idxStr, val] of Object.entries(vec)) {
        const idx = Number(idxStr);
        featureScores[idx] += val;
      }
    }

    const scored = this.featureNames.map((token, idx) => ({
      word: token,
      score: featureScores[idx]
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN);
  }
}

module.exports = TfidfVectorizer;
