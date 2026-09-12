import path from 'path';

export const CONFIG = {
  APP_ID: 'app.bpjs.mobile',
  DEFAULT_SAMPLE_SIZE: 5000,
  TRAIN_SPLIT_RATIO: 0.8,
  
  // Paths
  PATHS: {
    DATA_DIR: path.resolve('data'),
    RAW_REVIEWS_5000_JSON: path.resolve('data/mobile_jkn_reviews_5000.json'),
    RAW_REVIEWS_5000_CSV: path.resolve('data/mobile_jkn_reviews_5000.csv'),
    RAW_REVIEWS_5000_JS: path.resolve('data/mobile_jkn_reviews_5000.js'),
    GROUND_TRUTH_JSON: path.resolve('data/master_ground_truth_5000.json'),
    ML_PREDICTED_JSON: path.resolve('data/mobile_jkn_ml_predicted_5000.json'),
    ML_PREDICTED_CSV: path.resolve('data/mobile_jkn_ml_predicted_5000.csv')
  },
  
  // Classification Classes
  CLASSES: ['Positif', 'Netral', 'Negatif']
};

export default CONFIG;
