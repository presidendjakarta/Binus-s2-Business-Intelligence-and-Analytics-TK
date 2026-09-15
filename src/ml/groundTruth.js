/**
 * Assigns Ground Truth sentiment label purely based on Play Store Star Rating:
 * - Rating 4 & 5 -> 'Positif'
 * - Rating 1, 2, & 3 -> 'Negatif'
 * 
 * @param {number} score User rating (1-5)
 * @param {string} [text] Optional raw or cleaned review text
 * @returns {'Positif' | 'Negatif'}
 */
function determineGroundTruth(score, text = '') {
  const numericScore = Number(score);
  
  if (numericScore >= 4) {
    return 'Positif';
  } else {
    return 'Negatif';
  }
}

module.exports = {
  determineGroundTruth
};
