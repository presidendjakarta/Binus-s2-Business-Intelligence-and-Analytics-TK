const path = require('path');
const { scrapeReviews, saveReviews } = require('./src/scraper/playstoreScraper');
const { getTimestampFolder, ensureDir, parseArgs } = require('./src/utils/helpers');

const APP_ID = 'id.bmri.livin';
const APP_NAME = "Livin' by Mandiri";

async function main() {
  console.log('================================================================');
  console.log('    SCRAPER ULASAN GOOGLE PLAY STORE - LIVIN\' BY MANDIRI       ');
  console.log('================================================================');

  const args = parseArgs(process.argv);
  // Support: node scrap-livin.js data=5000 OR node scrap-livin.js 5000
  let targetCount = 5000;
  if (args.data) targetCount = Number(args.data);
  else if (args.limit) targetCount = Number(args.limit);
  else if (args.count) targetCount = Number(args.count);
  else if (process.argv[2] && !isNaN(process.argv[2])) targetCount = Number(process.argv[2]);

  console.log(`[*] Target Data     : ${targetCount.toLocaleString('id-ID')} ulasan`);
  console.log(`[*] Target App ID   : ${APP_ID} (${APP_NAME})`);

  const folderName = getTimestampFolder();
  const outputDir = path.join(__dirname, 'data', folderName);
  ensureDir(outputDir);

  console.log(`[*] Output Direktori: data/${folderName}/`);
  console.log('----------------------------------------------------------------');

  const startTime = Date.now();
  const reviews = await scrapeReviews(targetCount, APP_ID);

  if (reviews.length === 0) {
    console.error('[!] Gagal mengambil ulasan atau koneksi bermasalah.');
    process.exit(1);
  }

  const { jsonPath, csvPath, metaPath } = await saveReviews(reviews, outputDir);
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('----------------------------------------------------------------');
  console.log(`[✓] Berhasil menyimpan ${reviews.length.toLocaleString('id-ID')} ulasan ${APP_NAME} dalam ${durationSec} detik!`);
  console.log(`    - JSON : ${jsonPath}`);
  console.log(`    - CSV  : ${csvPath}`);
  console.log(`    - Meta : ${metaPath}`);
  console.log('================================================================');
  console.log(`\nLangkah selanjutnya, jalankan analisis sentimen:`);
  console.log(`  node run-analisa.js folder=data/${folderName}\n`);
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
