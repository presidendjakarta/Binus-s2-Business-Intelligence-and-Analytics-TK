import gplay from 'google-play-scraper';

async function main() {
  const appId = 'com.spotify.music'; // Ganti dengan package id aplikasi yang diinginkan
  console.log(`🔍 Mengambil detail aplikasi untuk: ${appId}...\n`);

  try {
    const appData = await gplay.app({
      appId: appId,
      lang: 'id', // Bahasa ulasan/deskripsi (id = Indonesia, en = Inggris)
      country: 'id' // Lokasi Play Store (id = Indonesia)
    });

    console.log('====================================');
    console.log(`📱 Judul Aplikasi : ${appData.title}`);
    console.log(`🏢 Developer      : ${appData.developer}`);
    console.log(`⭐ Rating         : ${appData.scoreText} (${appData.ratings} ulasan)`);
    console.log(`📥 Total Download : ${appData.installs}`);
    console.log(`🏷️ Kategori       : ${appData.genre}`);
    console.log(`💰 Gratis/Berbayar: ${appData.free ? 'Gratis' : 'Berbayar'}`);
    console.log(`🔗 URL Play Store : ${appData.url}`);
    console.log(`📅 Terakhir Update: ${appData.updated ? new Date(appData.updated).toLocaleDateString('id-ID') : '-'}`);
    console.log('====================================\n');
    console.log('📝 Ringkasan Deskripsi:');
    console.log(appData.summary || appData.description?.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error.message);
  }
}

main();
