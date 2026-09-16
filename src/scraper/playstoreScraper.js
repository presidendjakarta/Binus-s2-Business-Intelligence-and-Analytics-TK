const rawGplay = require('google-play-scraper');
const gplay = rawGplay.default || rawGplay;
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const DEFAULT_APP_ID = 'id.bmri.livin'; // Livin' by Mandiri

/**
 * Scrapes Google Play Store reviews for a specified App ID with optional year filter
 * @param {number} targetCount Number of reviews to fetch (e.g. 5000)
 * @param {string} appId Target app package ID (default: 'id.bmri.livin')
 * @param {function} onProgress Progress callback
 * @param {object} options Optional filters (e.g. { year: 2026, minYear: 2026 })
 */
async function scrapeReviews(targetCount = 1000, appId = DEFAULT_APP_ID, onProgress = null, options = {}) {
  const isUnlimited = !isFinite(targetCount) || targetCount <= 0;
  const targetYear = options.year ? Number(options.year) : (options.minYear ? Number(options.minYear) : 2026);
  const targetLabel = isUnlimited ? 'Maksimal / Full (Tanpa Batasan)' : `${targetCount.toLocaleString('id-ID')} ulasan`;
  const yearLog = targetYear ? ` [Target Tahun: ${targetYear}]` : '';

  console.log(`[SCRAPER] Memulai scraping Play Store (${appId})${yearLog}... Target: ${targetLabel}`);
  
  let allReviews = [];
  const seenIds = new Set();
  let paginateToken = undefined;
  let batchNum = 1;
  const batchSize = 150;

  // Cycle sort options: newest, helpfulness, rating
  const sorts = [gplay.sort.NEWEST, gplay.sort.HELPFULNESS, gplay.sort.RATING];
  let sortIndex = 0;

  while (isUnlimited || allReviews.length < targetCount) {
    const remaining = isUnlimited ? batchSize : (targetCount - allReviews.length);
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
      let hitOlderYear = false;

      for (const item of data) {
        if (!seenIds.has(item.id) && item.text && item.text.trim().length > 0) {
          seenIds.add(item.id);
          
          const reviewDate = item.date ? new Date(item.date) : new Date();
          const reviewYear = reviewDate.getFullYear();

          // If target year is specified, filter by year
          if (targetYear) {
            if (options.year && reviewYear !== targetYear) {
              if (sorts[sortIndex] === gplay.sort.NEWEST && reviewYear < targetYear) {
                hitOlderYear = true; // Reached reviews older than target year
              }
              continue;
            }
            if (options.minYear && reviewYear < options.minYear) {
              if (sorts[sortIndex] === gplay.sort.NEWEST) hitOlderYear = true;
              continue;
            }
          }

          allReviews.push({
            id: item.id,
            userName: item.userName || 'Pengguna Play Store',
            score: item.score || 0,
            date: reviewDate.toISOString(),
            text: item.text.trim(),
            thumbsUp: item.thumbsUp || 0,
            version: item.version || ''
          });
          newCount++;
          if (!isUnlimited && allReviews.length >= targetCount) break;
        }
      }

      if (onProgress) {
        onProgress(allReviews.length, isUnlimited ? allReviews.length : targetCount);
      } else {
        if (isUnlimited) {
          process.stdout.write(`\r[SCRAPER] Terkumpul: ${allReviews.length.toLocaleString('id-ID')} ulasan tahun ${targetYear} (Mode Full)...`);
        } else {
          process.stdout.write(`\r[SCRAPER] Terkumpul: ${allReviews.length.toLocaleString('id-ID')}/${targetCount.toLocaleString('id-ID')} ulasan...`);
        }
      }

      // If we hit older years in NEWEST sort, we stop this sort mode
      if (hitOlderYear && sorts[sortIndex] === gplay.sort.NEWEST) {
        console.log(`\n[SCRAPER] Menjangkau batas tahun ${targetYear} pada mode NEWEST. Beralih strategi...`);
        sortIndex++;
        paginateToken = undefined;
        if (sortIndex >= sorts.length) break;
        continue;
      }

      // If no new reviews returned or no next token, switch sort strategy
      if (newCount === 0 || !paginateToken) {
        sortIndex++;
        paginateToken = undefined;
        if (sortIndex >= sorts.length) {
          console.log(`\n[SCRAPER] Mencapai batas seluruh ulasan Play Store untuk tahun ${targetYear}.`);
          break;
        }
      }

      // Rate limit delay (350ms - 650ms)
      await new Promise(r => setTimeout(r, 350 + Math.random() * 300));
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
    appName: "Livin' by Mandiri (PT Bank Mandiri Tbk)",
    totalReviews: reviews.length,
    scrapedAt: new Date().toISOString()
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

  return { jsonPath, csvPath, metaPath };
}

module.exports = {
  DEFAULT_APP_ID,
  scrapeReviews,
  scrapeLivinMandiri: (count, onProg, opt) => scrapeReviews(count, DEFAULT_APP_ID, onProg, opt),
  saveReviews
};
