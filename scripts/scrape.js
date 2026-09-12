import { PlayStoreScraper } from '../src/scraper/playstoreScraper.js';
import { CONFIG } from '../src/config/constants.js';

const scraper = new PlayStoreScraper(CONFIG.APP_ID);

scraper.scrapeReviews(CONFIG.DEFAULT_SAMPLE_SIZE, (completed, total, batch, newCount) => {
  const pct = ((completed / total) * 100).toFixed(1);
  console.log(`📦 Batch ${batch}: +${newCount} ulasan | Total: ${completed}/${total} (${pct}%)`);
})
.then(reviews => scraper.saveToFile(reviews))
.then(() => console.log('🎉 Scraping completed successfully!'))
.catch(err => {
  console.error('❌ Scraper error:', err);
  process.exit(1);
});
