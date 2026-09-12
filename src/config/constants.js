import path from 'path';

export const CONFIG = {
  APP_ID: 'app.bpjs.mobile',
  DEFAULT_SAMPLE_SIZE: 5000,
  TRAIN_SPLIT_RATIO: 0.8,
  
  // Ollama Configurations
  OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'gemma3:latest',
  
  // Paths
  PATHS: {
    DATA_DIR: path.resolve('data'),
    RAW_REVIEWS_5000_JSON: path.resolve('data/mobile_jkn_reviews_5000.json'),
    RAW_REVIEWS_5000_CSV: path.resolve('data/mobile_jkn_reviews_5000.csv'),
    RAW_REVIEWS_5000_JS: path.resolve('data/mobile_jkn_reviews_5000.js'),
    GROUND_TRUTH_JSON: path.resolve('data/master_ground_truth_5000.json'),
    ML_PREDICTED_JSON: path.resolve('data/mobile_jkn_ml_predicted_5000.json'),
    ML_PREDICTED_CSV: path.resolve('data/mobile_jkn_ml_predicted_5000.csv'),
    LLM_CACHE_JSON: path.resolve('data/llm_gemma3_cache.json'),
    LLM_ANALYSIS_5000_JSON: path.resolve('data/llm_gemma3_analysis_5000.json'),
    LLM_ANALYSIS_JSON: path.resolve('data/llm_gemma3_analysis.json'),
    ML_VS_LLM_COMPARISON_5000_JSON: path.resolve('data/ml_vs_llm_comparison_5000.json'),
    ML_VS_LLM_COMPARISON_5000_CSV: path.resolve('data/ml_vs_llm_comparison_5000.csv'),
    ML_VS_LLM_COMPARISON_JSON: path.resolve('data/ml_vs_llm_comparison.json'),
    ML_VS_LLM_COMPARISON_CSV: path.resolve('data/ml_vs_llm_comparison.csv')
  },
  
  // Classification Classes
  CLASSES: ['Positif', 'Netral', 'Negatif'],
  
  // LLM Issue Categories
  CATEGORIES: [
    'Masalah Teknis & Bug',
    'Layanan Faskes & Antrean',
    'Fitur & UI/UX',
    'Administrasi & Iuran',
    'Apresiasi & Kepuasan'
  ]
};
