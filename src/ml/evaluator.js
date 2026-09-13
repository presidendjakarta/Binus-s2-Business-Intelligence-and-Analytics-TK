const TfidfVectorizer = require('./vectorizer');
const MultinomialNaiveBayes = require('./naiveBayes');

class ModelEvaluator {
  /**
   * Computes classification metrics from actual and predicted arrays
   * @param {string[]} actual 
   * @param {string[]} predicted 
   */
  static computeMetrics(actual, predicted) {
    let tp = 0; // Actual Positif, Pred Positif
    let fp = 0; // Actual Negatif, Pred Positif
    let tn = 0; // Actual Negatif, Pred Negatif
    let fn = 0; // Actual Positif, Pred Negatif

    for (let i = 0; i < actual.length; i++) {
      const act = actual[i];
      const pred = predicted[i];

      if (act === 'Positif' && pred === 'Positif') tp++;
      else if (act === 'Negatif' && pred === 'Positif') fp++;
      else if (act === 'Negatif' && pred === 'Negatif') tn++;
      else if (act === 'Positif' && pred === 'Negatif') fn++;
    }

    const total = tp + fp + tn + fn;
    const accuracy = total > 0 ? (tp + tn) / total : 0;

    // Positif Class Metrics
    const precisionPos = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recallPos = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1Pos = (precisionPos + recallPos) > 0 
      ? (2 * precisionPos * recallPos) / (precisionPos + recallPos) 
      : 0;

    // Negatif Class Metrics
    const precisionNeg = (tn + fn) > 0 ? tn / (tn + fn) : 0;
    const recallNeg = (tn + fp) > 0 ? tn / (tn + fp) : 0;
    const f1Neg = (precisionNeg + recallNeg) > 0 
      ? (2 * precisionNeg * recallNeg) / (precisionNeg + recallNeg) 
      : 0;

    // Macro Averages
    const macroPrecision = (precisionPos + precisionNeg) / 2;
    const macroRecall = (recallPos + recallNeg) / 2;
    const macroF1 = (f1Pos + f1Neg) / 2;

    return {
      totalSamples: total,
      confusionMatrix: {
        tp,
        fp,
        tn,
        fn
      },
      accuracy: Number((accuracy * 100).toFixed(2)),
      macroPrecision: Number((macroPrecision * 100).toFixed(2)),
      macroRecall: Number((macroRecall * 100).toFixed(2)),
      macroF1: Number((macroF1 * 100).toFixed(2)),
      classMetrics: {
        Positif: {
          support: tp + fn,
          precision: Number((precisionPos * 100).toFixed(2)),
          recall: Number((recallPos * 100).toFixed(2)),
          f1: Number((f1Pos * 100).toFixed(2))
        },
        Negatif: {
          support: tn + fp,
          precision: Number((precisionNeg * 100).toFixed(2)),
          recall: Number((recallNeg * 100).toFixed(2)),
          f1: Number((f1Neg * 100).toFixed(2))
        }
      }
    };
  }

  /**
   * Performs K-Fold Cross Validation
   * @param {Array<string[]>} tokenizedDocs 
   * @param {string[]} labels 
   * @param {number} k Folds (e.g. 5)
   */
  static crossValidate(tokenizedDocs, labels, k = 5) {
    const n = tokenizedDocs.length;
    if (n < k * 2) {
      // Fallback to 80/20 train test split
      return this.evaluateTrainTest(tokenizedDocs, labels, 0.8);
    }

    const indices = Array.from({ length: n }, (_, i) => i);
    // Deterministic shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = (i * 7 + 13) % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const foldSize = Math.floor(n / k);
    const foldMetrics = [];
    const allActual = [];
    const allPredicted = [];

    for (let fold = 0; fold < k; fold++) {
      const testIndices = new Set(indices.slice(fold * foldSize, (fold + 1) * foldSize));
      const trainDocs = [];
      const trainLabels = [];
      const testDocs = [];
      const testLabels = [];

      for (let i = 0; i < n; i++) {
        const idx = indices[i];
        if (testIndices.has(idx)) {
          testDocs.push(tokenizedDocs[idx]);
          testLabels.push(labels[idx]);
        } else {
          trainDocs.push(tokenizedDocs[idx]);
          trainLabels.push(labels[idx]);
        }
      }

      const vectorizer = new TfidfVectorizer({ minDf: 2 });
      const trainX = vectorizer.fitTransform(trainDocs);
      const testX = vectorizer.transform(testDocs);

      const nb = new MultinomialNaiveBayes({ alpha: 1.0 });
      nb.train(trainX, trainLabels, vectorizer.vocabulary.size);

      const preds = nb.predict(testX).map(p => p.label);
      allActual.push(...testLabels);
      allPredicted.push(...preds);

      foldMetrics.push(this.computeMetrics(testLabels, preds));
    }

    const overall = this.computeMetrics(allActual, allPredicted);
    return {
      k,
      overall,
      foldMetrics
    };
  }

  /**
   * Evaluates with 80/20 Train-Test split
   */
  static evaluateTrainTest(tokenizedDocs, labels, trainRatio = 0.8) {
    const n = tokenizedDocs.length;
    const splitIndex = Math.floor(n * trainRatio);

    const trainDocs = tokenizedDocs.slice(0, splitIndex);
    const trainLabels = labels.slice(0, splitIndex);
    const testDocs = tokenizedDocs.slice(splitIndex);
    const testLabels = labels.slice(splitIndex);

    const vectorizer = new TfidfVectorizer({ minDf: 2 });
    const trainX = vectorizer.fitTransform(trainDocs);
    const testX = vectorizer.transform(testDocs);

    const nb = new MultinomialNaiveBayes({ alpha: 1.0 });
    nb.train(trainX, trainLabels, vectorizer.vocabulary.size);

    const preds = nb.predict(testX).map(p => p.label);
    const metrics = this.computeMetrics(testLabels, preds);

    return {
      k: 1,
      overall: metrics,
      foldMetrics: [metrics]
    };
  }
}

module.exports = ModelEvaluator;
