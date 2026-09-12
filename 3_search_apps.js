import gplay from 'google-play-scraper';

async function searchApps() {
  const keyword = 'e-wallet indonesia'; // Ganti kata kunci pencarian
  const numResults = 5;

  console.log(`🔍 Mencari aplikasi dengan keyword: "${keyword}" (Maks: ${numResults} hasil)...\n`);

  try {
    const results = await gplay.search({
      term: keyword,
      num: numResults,
      lang: 'id',
      country: 'id'
    });

    console.log(`Ditemukan ${results.length} aplikasi:\n`);
    results.forEach((app, index) => {
      console.log(`${index + 1}. 📱 ${app.title}`);
      console.log(`   🆔 Package ID : ${app.appId}`);
      console.log(`   🏢 Developer  : ${app.developer}`);
      console.log(`   ⭐ Rating     : ${app.scoreText || app.score}`);
      console.log(`   💰 Harga      : ${app.free ? 'Gratis' : app.priceText}`);
      console.log('--------------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat mencari:', error.message);
  }
}

searchApps();
