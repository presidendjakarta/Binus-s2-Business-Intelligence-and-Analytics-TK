const TfidfVectorizer = require('./vectorizer');
const MultinomialNaiveBayes = require('./naiveBayes');

class ModelEvaluator {
  /**
   * Computes classification metrics from actual and predicted arrays
   * @param {string[]} actual 
   * @param {string[]} predicted 
   * @param {string[]} [classList]
   */
  static computeMetrics(actual, predicted, classList = ['Positif', 'Negatif']) {
    const total = actual.length;
    if (total === 0) {
      return {
        totalSamples: 0,
        accuracy: 0,
        macroPrecision: 0,
        macroRecall: 0,
        macroF1: 0,
        confusionMatrix: { tp: 0, fp: 0, tn: 0, fn: 0, matrix: {} },
        classMetrics: {}
      };
    }

    const classes = [...new Set([...classList, ...actual, ...predicted])];

    // Build Confusion Matrix
    const matrix = {};
    for (const a of classes) {
      matrix[a] = {};
      for (const p of classes) {
        matrix[a][p] = 0;
      }
    }

    let correctTotal = 0;
    for (let i = 0; i < total; i++) {
      const act = actual[i];
      const pred = predicted[i];
      if (matrix[act] && matrix[act][pred] !== undefined) {
        matrix[act][pred]++;
      }
      if (act === pred) {
        correctTotal++;
      }
    }

    const accuracy = total > 0 ? correctTotal / total : 0;
    const classMetrics = {};
    let sumPrecision = 0;
    let sumRecall = 0;
    let sumF1 = 0;
    let validClassCount = 0;

    for (const c of classes) {
      const tp = matrix[c][c];
      
      let fp = 0;
      for (const a of classes) {
        if (a !== c) fp += matrix[a][c];
      }

      let fn = 0;
      for (const p of classes) {
        if (p !== c) fn += matrix[c][p];
      }

      const support = tp + fn;
      const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
      const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      classMetrics[c] = {
        support,
        tp,
        fp,
        fn,
        precision: Number((precision * 100).toFixed(2)),
        recall: Number((recall * 100).toFixed(2)),
        f1: Number((f1 * 100).toFixed(2))
      };

      if (support > 0 || (tp + fp) > 0) {
        sumPrecision += precision;
        sumRecall += recall;
        sumF1 += f1;
        validClassCount++;
      }
    }

    const divisor = validClassCount > 0 ? validClassCount : classes.length;
    const macroPrecision = sumPrecision / divisor;
    const macroRecall = sumRecall / divisor;
    const macroF1 = sumF1 / divisor;

    return {
      totalSamples: total,
      accuracy: Number((accuracy * 100).toFixed(2)),
      macroPrecision: Number((macroPrecision * 100).toFixed(2)),
      macroRecall: Number((macroRecall * 100).toFixed(2)),
      macroF1: Number((macroF1 * 100).toFixed(2)),
      confusionMatrix: {
        matrix,
        tp: (matrix.Positif && matrix.Positif.Positif) || 0,
        fp: (matrix.Negatif && matrix.Negatif.Positif) || 0,
        tn: (matrix.Negatif && matrix.Negatif.Negatif) || 0,
        fn: (matrix.Positif && matrix.Positif.Negatif) || 0
      },
      classMetrics
    };
  }

  /**
   * Performs K-Fold Cross Validation
   * @param {Array<string[]>} tokenizedDocs 
   * @param {string[]} labels 
   * @param {number} k Folds (e.g. 5)
   * @param {string[]} [classes]
   */
  static crossValidate(tokenizedDocs, labels, k = 5, classes = ['Positif', 'Negatif']) {
    const n = tokenizedDocs.length;
    if (n < k * 2) {
      return this.evaluateTrainTest(tokenizedDocs, labels, 0.8, classes);
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

      const vectorizer = new TfidfVectorizer({ minDf: 2, sublinearTf: true });
      const trainX = vectorizer.fitTransform(trainDocs);
      const testX = vectorizer.transform(testDocs);

      const nb = new MultinomialNaiveBayes({ alpha: 1.0, classes });
      nb.train(trainX, trainLabels, vectorizer.vocabulary.size);

      const preds = nb.predict(testX).map(p => p.label);
      allActual.push(...testLabels);
      allPredicted.push(...preds);

      foldMetrics.push(this.computeMetrics(testLabels, preds, classes));
    }

    const overall = this.computeMetrics(allActual, allPredicted, classes);
    return {
      k,
      overall,
      foldMetrics
    };
  }

  /**
   * Evaluates with 80/20 Train-Test split
   */
  static evaluateTrainTest(tokenizedDocs, labels, trainRatio = 0.8, classes = ['Positif', 'Negatif']) {
    const n = tokenizedDocs.length;
    const splitIndex = Math.floor(n * trainRatio);

    const trainDocs = tokenizedDocs.slice(0, splitIndex);
    const trainLabels = labels.slice(0, splitIndex);
    const testDocs = tokenizedDocs.slice(splitIndex);
    const testLabels = labels.slice(splitIndex);

    const vectorizer = new TfidfVectorizer({ minDf: 2, sublinearTf: true });
    const trainX = vectorizer.fitTransform(trainDocs);
    const testX = vectorizer.transform(testDocs);

    const nb = new MultinomialNaiveBayes({ alpha: 1.0, classes });
    nb.train(trainX, trainLabels, vectorizer.vocabulary.size);

    const preds = nb.predict(testX).map(p => p.label);
    const metrics = this.computeMetrics(testLabels, preds, classes);

    return {
      k: 1,
      overall: metrics,
      foldMetrics: [metrics]
    };
  }
}

module.exports = ModelEvaluator;
