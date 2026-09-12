import gplay from 'google-play-scraper';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs/promises';
import path from 'path';

async function scrapeReviews() {
  const appId = 'com.spotify.music'; // Package name aplikasi
  const totalReviews = 100; // Jumlah ulasan yang ingin diambil (misal 100, 500, 1000)
  const lang = 'id'; // Bahasa ulasan (id = Indonesia)
  const country = 'id'; // Wilayah Play Store

  console.log(`🚀 Memulai scraping ulasan untuk: ${appId}`);
  console.log(`🎯 Target: ${totalReviews} ulasan | Bahasa: ${lang} | Wilayah: ${country}\n`);

  try {
    // 1. Mengambil reviews dari Google Play Store
    const result = await gplay.reviews({
      appId: appId,
      sort: gplay.sort.NEWEST, // NEWEST, RATING, HELPFULNESS
      num: totalReviews,
      lang: lang,
      country: country,
      paginate: true // Menghindari batasan limit per request
    });

    const reviews = result.data || result;
    console.log(`✅ Berhasil mengambil ${reviews.length} ulasan!\n`);

    if (reviews.length === 0) {
      console.log('⚠️ Tidak ada ulasan yang ditemukan.');
      return;
    }

    // Buat folder 'data' jika belum ada
    const outputDir = path.resolve('data');
    await fs.mkdir(outputDir, { recursive: true });

    // Format data yang rapi untuk di-export
    const cleanData = reviews.map((r, index) => ({
      no: index + 1,
      id: r.id || '',
      userName: r.userName || 'Anonymous',
      score: r.score || 0,
      date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
      text: (r.text || '').replace(/\r?\n|\r/g, ' '), // bersihkan newline agar rapi di CSV
      thumbsUp: r.thumbsUp || 0,
      replyDate: r.replyDate ? new Date(r.replyDate).toISOString().split('T')[0] : '',
      replyText: (r.replyText || '').replace(/\r?\n|\r/g, ' '),
      version: r.version || '',
      url: r.url || ''
    }));

    // 2. Simpan ke format JSON
    const jsonPath = path.join(outputDir, `${appId}_reviews.json`);
    await fs.writeFile(jsonPath, JSON.stringify(cleanData, null, 2), 'utf-8');
    console.log(`📁 File JSON tersimpan: ${jsonPath}`);

    // 3. Simpan ke format CSV (Sangat cocok untuk Excel, SPSS, Python Pandas, RapidMiner)
    const csvPath = path.join(outputDir, `${appId}_reviews.csv`);
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'no', title: 'No' },
        { id: 'userName', title: 'User Name' },
        { id: 'score', title: 'Rating / Bintang' },
        { id: 'date', title: 'Tanggal Review' },
        { id: 'text', title: 'Isi Review' },
        { id: 'thumbsUp', title: 'Jumlah Like' },
        { id: 'replyDate', title: 'Tanggal Balasan Dev' },
        { id: 'replyText', title: 'Balasan Dev' },
        { id: 'version', title: 'Versi Aplikasi' }
      ]
    });

    await csvWriter.writeRecords(cleanData);
    console.log(`📊 File CSV tersimpan : ${csvPath}\n`);

    // 4. Tampilkan Ringkasan Statistik Rating
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    cleanData.forEach(item => {
      if (ratingCounts[item.score] !== undefined) {
        ratingCounts[item.score]++;
      }
    });

    console.log('📈 Distribusi Rating dari Sample:');
    console.log(`⭐ Bintang 5 : ${ratingCounts[5]} ulasan`);
    console.log(`⭐ Bintang 4 : ${ratingCounts[4]} ulasan`);
    console.log(`⭐ Bintang 3 : ${ratingCounts[3]} ulasan`);
    console.log(`⭐ Bintang 2 : ${ratingCounts[2]} ulasan`);
    console.log(`⭐ Bintang 1 : ${ratingCounts[1]} ulasan`);

    console.log('\n💬 Contoh 3 Ulasan Pertama:');
    cleanData.slice(0, 3).forEach((r) => {
      console.log(`- [⭐ ${r.score}] ${r.userName} (${r.date}): "${r.text.substring(0, 80)}..."`);
    });

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat scraping:', error.message);
  }
}

scrapeReviews();
