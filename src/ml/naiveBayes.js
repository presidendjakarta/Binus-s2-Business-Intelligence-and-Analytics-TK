class MultinomialNaiveBayes {
  constructor(options = {}) {
    this.alpha = options.alpha !== undefined ? options.alpha : 1.0; // Laplace smoothing
    this.classes = ['Positif', 'Negatif'];
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
    const classDocCounts = { Positif: 0, Negatif: 0 };
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
      this.featureLogProb[c] = new Float64Array(vocabSize);
    }

    // Accumulate word weights per class
    const classTotalWeights = { Positif: 0, Negatif: 0 };
    const classFeatureSums = {
      Positif: new Float64Array(vocabSize),
      Negatif: new Float64Array(vocabSize)
    };

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
   * @returns {{ label: string, confidence: number, probabilities: { Positif: number, Negatif: number }, logLikelihood: { Positif: number, Negatif: number } }}
   */
  predictDoc(doc) {
    if (!this.isTrained) {
      throw new Error('Model must be trained before calling predict.');
    }

    const logPosteriors = {};

    for (const c of this.classes) {
      let logSum = this.classLogPriors[c];
      for (const [idxStr, weight] of Object.entries(doc)) {
        const idx = Number(idxStr);
        if (idx < this.vocabSize) {
          logSum += weight * this.featureLogProb[c][idx];
        }
      }
      logPosteriors[c] = logSum;
    }

    // Softmax normalization for numerical stability
    const maxLog = Math.max(logPosteriors.Positif, logPosteriors.Negatif);
    const expPos = Math.exp(logPosteriors.Positif - maxLog);
    const expNeg = Math.exp(logPosteriors.Negatif - maxLog);
    const sumExp = expPos + expNeg;

    const probPos = expPos / sumExp;
    const probNeg = expNeg / sumExp;

    const label = probPos >= probNeg ? 'Positif' : 'Negatif';
    const confidence = label === 'Positif' ? probPos : probNeg;

    return {
      label,
      confidence: Number(confidence.toFixed(4)),
      probabilities: {
        Positif: Number(probPos.toFixed(4)),
        Negatif: Number(probNeg.toFixed(4))
      },
      logLikelihood: {
        Positif: Number(logPosteriors.Positif.toFixed(4)),
        Negatif: Number(logPosteriors.Negatif.toFixed(4))
      }
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
