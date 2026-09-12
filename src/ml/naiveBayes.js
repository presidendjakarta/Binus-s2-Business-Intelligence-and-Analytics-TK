import { CONFIG } from '../config/constants.js';

/**
 * Klasifikasi Multinomial Naive Bayes (MNB)
 * Dilengkapi Laplace Smoothing (alpha = 1.0) dan Log-Likelihood
 */
export class MultinomialNaiveBayes {
  constructor(alpha = 1.0, classes = CONFIG.CLASSES) {
    this.alpha = alpha;
    this.classes = classes;
    this.classPriors = {};
    this.featureProbabilities = {}; // P(w | c)
  }

  train(features, labels) {
    const numDocs = features.length;
    const numFeatures = features[0].length;

    const classDocCounts = {};
    const classFeatureSums = {};
    const classTotalSums = {};

    this.classes.forEach(c => {
      classDocCounts[c] = 0;
      classFeatureSums[c] = new Float64Array(numFeatures);
      classTotalSums[c] = 0;
    });

    for (let i = 0; i < numDocs; i++) {
      const label = labels[i];
      if (classDocCounts[label] !== undefined) {
        classDocCounts[label]++;
        const vec = features[i];
        for (let j = 0; j < numFeatures; j++) {
          classFeatureSums[label][j] += vec[j];
          classTotalSums[label] += vec[j];
        }
      }
    }

    // Priors: P(c) = log(N_c / N)
    this.classes.forEach(c => {
      const count = classDocCounts[c] || 1;
      this.classPriors[c] = Math.log(count / numDocs);
    });

    // Likelihoods with Laplace Smoothing: P(w | c)
    this.classes.forEach(c => {
      this.featureProbabilities[c] = new Float64Array(numFeatures);
      const denominator = classTotalSums[c] + this.alpha * numFeatures;
      for (let j = 0; j < numFeatures; j++) {
        const numerator = classFeatureSums[c][j] + this.alpha;
        this.featureProbabilities[c][j] = Math.log(numerator / denominator);
      }
    });
  }

  predictProba(featureVec) {
    const logPosteriors = {};
    let maxLogPosterior = -Infinity;

    this.classes.forEach(c => {
      let score = this.classPriors[c];
      const probs = this.featureProbabilities[c];
      for (let j = 0; j < featureVec.length; j++) {
        if (featureVec[j] > 0) {
          score += featureVec[j] * probs[j];
        }
      }
      logPosteriors[c] = score;
      if (score > maxLogPosterior) {
        maxLogPosterior = score;
      }
    });

    // Softmax normalization
    const exps = {};
    let sumExp = 0;
    this.classes.forEach(c => {
      const expVal = Math.exp(logPosteriors[c] - maxLogPosterior);
      exps[c] = expVal;
      sumExp += expVal;
    });

    const probabilities = {};
    let bestClass = this.classes[0];
    let bestProb = -1;

    this.classes.forEach(c => {
      const prob = sumExp > 0 ? exps[c] / sumExp : 1 / this.classes.length;
      probabilities[c] = prob;
      if (prob > bestProb) {
        bestProb = prob;
        bestClass = c;
      }
    });

    return {
      label: bestClass,
      confidence: bestProb,
      probabilities
    };
  }

  predict(featureVec) {
    return this.predictProba(featureVec).label;
  }
}

export default MultinomialNaiveBayes;
