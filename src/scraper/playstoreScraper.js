const rawGplay = require('google-play-scraper');
const gplay = rawGplay.default || rawGplay;
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const DEFAULT_APP_ID = 'id.bmri.livin'; // Livin' by Mandiri

/**
 * Scrapes Google Play Store reviews for a specified App ID
 * @param {number} targetCount Number of reviews to fetch (e.g. 5000)
 * @param {string} appId Target app package ID (default: 'id.bmri.livin')
 * @param {function} onProgress Progress callback
 */
async function scrapeReviews(targetCount = 1000, appId = DEFAULT_APP_ID, onProgress = null) {
  console.log(`[SCRAPER] Memulai scraping Play Store (${appId})... Target: ${targetCount.toLocaleString('id-ID')} ulasan`);
  
  let allReviews = [];
  const seenIds = new Set();
  let paginateToken = undefined;
  let batchNum = 1;
  const batchSize = Math.min(150, targetCount);

  // Cycle sort options: newest, rating, helpfulness
  const sorts = [gplay.sort.NEWEST, gplay.sort.HELPFULNESS, gplay.sort.RATING];
  let sortIndex = 0;

  while (allReviews.length < targetCount) {
    const remaining = targetCount - allReviews.length;
    const fetchNum = Math.min(batchSize, remaining);

    try {
      const result = await gplay.reviews({
        appId: appId,
        lang: 'id',
        country: 'id',
        sort: sorts[sortIndex],
        num: fetchNum,
        paginate: true,
        nextPaginationToken: paginateToken
      });

      const data = result.data || [];
      paginateToken = result.nextPaginationToken;

      let newCount = 0;
      for (const item of data) {
        if (!seenIds.has(item.id) && item.text && item.text.trim().length > 0) {
          seenIds.add(item.id);
          allReviews.push({
            id: item.id,
            userName: item.userName || 'Pengguna Play Store',
            score: item.score || 0,
            date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
            text: item.text.trim(),
            thumbsUp: item.thumbsUp || 0,
            version: item.version || ''
          });
          newCount++;
          if (allReviews.length >= targetCount) break;
        }
      }

      if (onProgress) {
        onProgress(allReviews.length, targetCount);
      } else {
        process.stdout.write(`\r[SCRAPER] Terkumpul: ${allReviews.length}/${targetCount} ulasan...`);
      }

      // If no new reviews returned or no next token, switch sort strategy
      if (newCount === 0 || !paginateToken) {
        sortIndex++;
        paginateToken = undefined;
        if (sortIndex >= sorts.length) {
          console.log(`\n[SCRAPER] Mencapai batas scraping Play Store untuk sort options.`);
          break;
        }
      }

      // Rate limit delay (400ms - 800ms)
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
      batchNum++;
    } catch (err) {
      console.error(`\n[SCRAPER] Peringatan: ${err.message}. Mencoba lagi dalam 2 detik...`);
      await new Promise(r => setTimeout(r, 2000));
      sortIndex = (sortIndex + 1) % sorts.length;
      paginateToken = undefined;
    }
  }

  console.log(`\n[SCRAPER] Selesai! Total ${allReviews.length} ulasan berhasil diambil.`);
  return allReviews;
}

/**
 * Saves scraped reviews to directory as JSON and CSV
 */
async function saveReviews(reviews, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Save JSON
  const jsonPath = path.join(outputDir, 'reviews.json');
  fs.writeFileSync(jsonPath, JSON.stringify(reviews, null, 2), 'utf8');

  // 2. Save CSV
  const csvPath = path.join(outputDir, 'reviews.csv');
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'id', title: 'id' },
      { id: 'userName', title: 'user_name' },
      { id: 'score', title: 'score' },
      { id: 'date', title: 'date' },
      { id: 'thumbsUp', title: 'thumbs_up' },
      { id: 'version', title: 'version' },
      { id: 'text', title: 'text' }
    ]
  });
  await csvWriter.writeRecords(reviews);

  // 3. Save Meta info
  const metaPath = path.join(outputDir, 'meta.json');
  const meta = {
    appId: reviews[0]?.appId || DEFAULT_APP_ID,
    appName: reviews[0]?.appId === 'app.bpjs.mobile' ? 'Mobile JKN (BPJS Kesehatan)' : "Livin' by Mandiri (PT Bank Mandiri Tbk)",
    totalReviews: reviews.length,
    scrapedAt: new Date().toISOString()
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

  return { jsonPath, csvPath, metaPath };
}

module.exports = {
  DEFAULT_APP_ID,
  scrapeReviews,
  scrapeMobileJKN: (count, onProg) => scrapeReviews(count, 'app.bpjs.mobile', onProg),
  saveReviews
};
