/**
 * Entrypoint Script: Pelatihan Model Machine Learning (TF-IDF + Multinomial Naive Bayes)
 * Menggunakan Arsitektur Modular src/ml/trainer.js
 */
import { runTrainingPipeline } from './src/ml/trainer.js';

runTrainingPipeline()
  .then(() => {
    console.log('🎉 Pelatihan model selesai dengan sukses!');
  })
  .catch(err => {
    console.error('❌ Gagal menjalankan pipeline pelatihan:', err);
    process.exit(1);
  });
