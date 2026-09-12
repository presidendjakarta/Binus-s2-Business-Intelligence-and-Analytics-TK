import { CONFIG } from '../config/constants.js';

/**
 * Modul Evaluasi Model Machine Learning
 * Menghitung Accuracy, Precision, Recall, F1-Score, dan Confusion Matrix
 */
export function evaluateModel(actualLabels, predictedLabels, classes = CONFIG.CLASSES) {
  const total = actualLabels.length;
  let correctCount = 0;

  // Inisialisasi Confusion Matrix
  const confusionMatrix = {};
  classes.forEach(r => {
    confusionMatrix[r] = {};
    classes.forEach(c => {
      confusionMatrix[r][c] = 0;
    });
  });

  for (let i = 0; i < total; i++) {
    const act = actualLabels[i];
    const pred = predictedLabels[i];
    if (confusionMatrix[act] && confusionMatrix[act][pred] !== undefined) {
      confusionMatrix[act][pred]++;
    }
    if (act === pred) correctCount++;
  }

  const accuracy = (correctCount / total) * 100;

  // Per-class metrics
  const classMetrics = {};
  let macroF1Sum = 0;

  classes.forEach(c => {
    const tp = confusionMatrix[c][c];
    const fp = classes.reduce((sum, cls) => cls !== c ? sum + confusionMatrix[cls][c] : sum, 0);
    const fn = classes.reduce((sum, cls) => cls !== c ? sum + confusionMatrix[c][cls] : sum, 0);

    const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    classMetrics[c] = {
      precision: parseFloat(precision.toFixed(2)),
      recall: parseFloat(recall.toFixed(2)),
      f1: parseFloat(f1.toFixed(2)),
      support: actualLabels.filter(l => l === c).length
    };

    macroF1Sum += f1;
  });

  const macroF1 = macroF1Sum / classes.length;

  return {
    accuracy: parseFloat(accuracy.toFixed(2)),
    macroF1: parseFloat(macroF1.toFixed(2)),
    correctCount,
    total,
    confusionMatrix,
    classMetrics
  };
}

export default { evaluateModel };
