class MultinomialNaiveBayes {
  constructor(options = {}) {
    this.alpha = options.alpha !== undefined ? options.alpha : 1.0; // Laplace smoothing
    this.classes = options.classes || ['Positif', 'Negatif'];
    this.classPriors = {}; // class -> P(c)
    this.classLogPriors = {}; // class -> ln P(c)
    this.featureLogProb = {}; // class -> Float64Array (log P(w|c))
    this.vocabSize = 0;
    this.isTrained = false;
  }

  /**
   * Trains the Multinomial Naive Bayes model on sparse TF-IDF vectors and labels
   * @param {Array<Object>} X Array of sparse vectors { [idx]: weight }
   * @param {string[]} y Array of labels ('Positif' | 'Negatif')
   * @param {number} vocabSize Vocabulary size |V|
   */
  train(X, y, vocabSize) {
    if (X.length !== y.length) {
      throw new Error('Input vectors X and labels y must have identical length.');
    }

    this.vocabSize = vocabSize;
    const numDocs = X.length;

    // Count class doc occurrences
    const classDocCounts = {};
    const classTotalWeights = {};
    const classFeatureSums = {};

    for (const c of this.classes) {
      classDocCounts[c] = 0;
      classTotalWeights[c] = 0;
      classFeatureSums[c] = new Float64Array(vocabSize);
      this.featureLogProb[c] = new Float64Array(vocabSize);
    }

    for (const label of y) {
      if (classDocCounts[label] !== undefined) {
        classDocCounts[label]++;
      }
    }

    // Compute priors
    for (const c of this.classes) {
      const prior = (classDocCounts[c] + 1) / (numDocs + this.classes.length);
      this.classPriors[c] = prior;
      this.classLogPriors[c] = Math.log(prior);
    }

    // Accumulate word weights per class
    for (let i = 0; i < numDocs; i++) {
      const doc = X[i];
      const label = y[i];
      if (!this.classes.includes(label)) continue;

      for (const [idxStr, weight] of Object.entries(doc)) {
        const idx = Number(idxStr);
        if (idx < vocabSize) {
          classFeatureSums[label][idx] += weight;
          classTotalWeights[label] += weight;
        }
      }
    }

    // Compute log probabilities with Laplace smoothing
    for (const c of this.classes) {
      const denom = classTotalWeights[c] + this.alpha * vocabSize;
      const logDenom = Math.log(denom);

      for (let w = 0; w < vocabSize; w++) {
        const num = classFeatureSums[c][w] + this.alpha;
        this.featureLogProb[c][w] = Math.log(num) - logDenom;
      }
    }

    this.isTrained = true;
    return this;
  }

  /**
   * Predicts class and calculates posterior probabilities for a sparse vector
   * @param {Object} doc Sparse vector { [idx]: weight }
   * @returns {{ label: string, confidence: number, probabilities: Object, logLikelihood: Object }}
   */
  predictDoc(doc) {
    if (!this.isTrained) {
      throw new Error('Model must be trained before calling predict.');
    }

    const logPosteriors = {};
    let maxLog = -Infinity;

    for (const c of this.classes) {
      let logSum = this.classLogPriors[c];
      for (const [idxStr, weight] of Object.entries(doc)) {
        const idx = Number(idxStr);
        if (idx < this.vocabSize) {
          logSum += weight * this.featureLogProb[c][idx];
        }
      }
      logPosteriors[c] = logSum;
      if (logSum > maxLog) {
        maxLog = logSum;
      }
    }

    // Softmax normalization with numerical stability
    let sumExp = 0;
    const expVals = {};
    for (const c of this.classes) {
      const val = Math.exp(logPosteriors[c] - maxLog);
      expVals[c] = val;
      sumExp += val;
    }

    const probabilities = {};
    const logLikelihood = {};
    let bestLabel = this.classes[0];
    let bestProb = -1;

    for (const c of this.classes) {
      const prob = sumExp > 0 ? expVals[c] / sumExp : 1 / this.classes.length;
      probabilities[c] = Number(prob.toFixed(4));
      logLikelihood[c] = Number(logPosteriors[c].toFixed(4));

      if (prob > bestProb) {
        bestProb = prob;
        bestLabel = c;
      }
    }

    return {
      label: bestLabel,
      confidence: Number(bestProb.toFixed(4)),
      probabilities,
      logLikelihood
    };
  }

  /**
   * Predicts an array of document vectors
   * @param {Array<Object>} docs 
   */
  predict(docs) {
    return docs.map(d => this.predictDoc(d));
  }
}

module.exports = MultinomialNaiveBayes;
