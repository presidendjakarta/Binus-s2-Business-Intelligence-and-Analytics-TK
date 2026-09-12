/**
 * Entrypoint Script: Play Store Review Scraper
 * Menggunakan Arsitektur Modular src/scraper/playstoreScraper.js
 */
import { PlayStoreScraper } from './src/scraper/playstoreScraper.js';
import { CONFIG } from './src/config/constants.js';

const scraper = new PlayStoreScraper(CONFIG.APP_ID);

scraper.scrapeReviews(CONFIG.DEFAULT_SAMPLE_SIZE, (completed, total, batch, newCount) => {
  const pct = ((completed / total) * 100).toFixed(1);
  console.log(`📦 Batch ${batch}: +${newCount} ulasan baru | Progress: [${completed}/${total}] (${pct}%)`);
})
.then(reviews => scraper.saveToFile(reviews))
.then(() => console.log('🎉 Proses scraping selesai dengan sukses!'))
.catch(err => {
  console.error('❌ Gagal menjalankan scraper:', err);
  process.exit(1);
});
