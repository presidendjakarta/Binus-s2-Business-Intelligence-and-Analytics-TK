import gplay from 'google-play-scraper';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs/promises';
import path from 'path';

async function scrapeMobileJKN(targetCount = 500) {
  const appId = 'app.bpjs.mobile';
  const lang = 'id';
  const country = 'id';

  console.log(`====================================================`);
  console.log(`🚀 SCRAPER MOBILE JKN (BPJS KESEHATAN)`);
  console.log(`🆔 App ID : ${appId}`);
  console.log(`🎯 Target : ${targetCount} Ulasan`);
  console.log(`====================================================\n`);

  try {
    // 1. Ambil info/detail aplikasi Mobile JKN
    console.log('📌 Mengambil informasi aplikasi Mobile JKN...');
    const appInfo = await gplay.app({ appId, lang, country });
    console.log(`📱 Nama       : ${appInfo.title}`);
    console.log(`🏢 Developer  : ${appInfo.developer}`);
    console.log(`⭐ Rating     : ${appInfo.scoreText} / 5.0 (${appInfo.ratings?.toLocaleString('id-ID')} ulasan)`);
    console.log(`📥 Unduhan    : ${appInfo.installs}`);
    console.log(`📅 Update     : ${appInfo.updated ? new Date(appInfo.updated).toLocaleDateString('id-ID') : '-'}`);
    console.log(`----------------------------------------------------\n`);

    // 2. Loop Pagination untuk mengambil hingga targetCount ulasan
    console.log(`⏳ Sedang mengumpulkan ulasan (Target: ${targetCount})...`);
    let allReviews = [];
    let nextPaginationToken = null;
    let batchNumber = 1;

    while (allReviews.length < targetCount) {
      const remaining = targetCount - allReviews.length;
      const numToFetch = Math.min(remaining, 150); // Maks 150 per request

      const res = await gplay.reviews({
        appId: appId,
        sort: gplay.sort.NEWEST,
        num: numToFetch,
        lang: lang,
        country: country,
        paginate: true,
        nextPaginationToken: nextPaginationToken || undefined
      });

      const batchData = res.data || (Array.isArray(res) ? res : []);
      if (!batchData || batchData.length === 0) {
        console.log('ℹ️ Tidak ada ulasan tambahan lagi dari server.');
        break;
      }

      allReviews.push(...batchData);
      console.log(`📦 Batch #${batchNumber}: +${batchData.length} ulasan (Total sementara: ${allReviews.length}/${targetCount})`);

      nextPaginationToken = res.nextPaginationToken;
      batchNumber++;

      // Jika tidak ada token berikutnya, selesai
      if (!nextPaginationToken) {
        break;
      }

      // Delay sedikit untuk mencegah rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n🎉 Total ulasan yang berhasil dikumpulkan: ${allReviews.length} ulasan!\n`);

    if (allReviews.length === 0) return;

    // Bersihkan & format data ulasan
    const cleanData = allReviews.map((r, index) => ({
      no: index + 1,
      id: r.id || '',
      userName: r.userName || 'Anonymous',
      score: r.score || 0,
      date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
      text: (r.text || '').replace(/\r?\n|\r/g, ' ').trim(),
      thumbsUp: r.thumbsUp || 0,
      replyDate: r.replyDate ? new Date(r.replyDate).toISOString().split('T')[0] : '',
      replyText: (r.replyText || '').replace(/\r?\n|\r/g, ' ').trim(),
      version: r.version || '',
      url: r.url || ''
    }));

    // Simpan ke folder 'data'
    const outputDir = path.resolve('data');
    await fs.mkdir(outputDir, { recursive: true });

    // 3. Simpan ke JSON & JS Bundle untuk Dashboard
    const jsonPath = path.join(outputDir, `mobile_jkn_reviews_${cleanData.length}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(cleanData, null, 2), 'utf-8');
    console.log(`📁 File JSON tersimpan di : ${jsonPath}`);

    // Update bundle JS untuk dashboard
    const jsPath = path.join(outputDir, `mobile_jkn_reviews_500.js`);
    await fs.writeFile(jsPath, `window.RAW_REVIEWS = ${JSON.stringify(cleanData, null, 2)};`, 'utf-8');

    // 4. Simpan ke CSV
    const csvPath = path.join(outputDir, `mobile_jkn_reviews_${cleanData.length}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'no', title: 'No' },
        { id: 'userName', title: 'User Name' },
        { id: 'score', title: 'Rating / Bintang' },
        { id: 'date', title: 'Tanggal Review' },
        { id: 'text', title: 'Isi Ulasan' },
        { id: 'thumbsUp', title: 'Jumlah Like' },
        { id: 'replyDate', title: 'Tanggal Balasan' },
        { id: 'replyText', title: 'Balasan Developer' },
        { id: 'version', title: 'Versi Aplikasi' }
      ]
    });
    await csvWriter.writeRecords(cleanData);
    console.log(`📊 File CSV tersimpan di  : ${csvPath}\n`);

    // 5. Statistik Rating & Sentimen Awal
    const ratingStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    cleanData.forEach(item => {
      if (ratingStats[item.score] !== undefined) ratingStats[item.score]++;
    });

    console.log('====================================================');
    console.log(`📈 DISTRIBUSI RATING (${cleanData.length} ULASAN):`);
    console.log(`⭐ Bintang 5 : ${ratingStats[5].toString().padStart(4)} ulasan (${((ratingStats[5]/cleanData.length)*100).toFixed(1)}%)`);
    console.log(`⭐ Bintang 4 : ${ratingStats[4].toString().padStart(4)} ulasan (${((ratingStats[4]/cleanData.length)*100).toFixed(1)}%)`);
    console.log(`⭐ Bintang 3 : ${ratingStats[3].toString().padStart(4)} ulasan (${((ratingStats[3]/cleanData.length)*100).toFixed(1)}%)`);
    console.log(`⭐ Bintang 2 : ${ratingStats[2].toString().padStart(4)} ulasan (${((ratingStats[2]/cleanData.length)*100).toFixed(1)}%)`);
    console.log(`⭐ Bintang 1 : ${ratingStats[1].toString().padStart(4)} ulasan (${((ratingStats[1]/cleanData.length)*100).toFixed(1)}%)`);
    console.log('====================================================\n');

    console.log('💬 Contoh 5 Ulasan Terbaru:');
    cleanData.slice(0, 5).forEach(r => {
      console.log(`- [⭐ ${r.score}] ${r.userName} (${r.date}): "${r.text.substring(0, 80)}${r.text.length > 80 ? '...' : ''}"`);
    });

  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error.message);
  }
}

// Target 5000 ulasan
scrapeMobileJKN(5000);
