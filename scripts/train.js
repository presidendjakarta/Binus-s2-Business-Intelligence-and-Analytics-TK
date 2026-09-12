import { runTrainingPipeline } from '../src/ml/trainer.js';

runTrainingPipeline()
  .then(() => console.log('🎉 Training pipeline completed successfully!'))
  .catch(err => {
    console.error('❌ Training error:', err);
    process.exit(1);
  });
