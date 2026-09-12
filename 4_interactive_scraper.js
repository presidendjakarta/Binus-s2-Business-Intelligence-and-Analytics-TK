import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import gplay from 'google-play-scraper';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log('==================================================');
  console.log('      🎯 GOOGLE PLAY STORE DATA MINER CLI 🚀       ');
  console.log('==================================================\n');

  try {
    const searchOrId = await rl.question('👉 Masukkan Package ID (misal: "id.dana") atau Kata Kunci pencarian: ');
    if (!searchOrId.trim()) {
      console.log('❌ Input tidak boleh kosong.');
      rl.close();
      return;
    }

    let targetAppId = searchOrId.trim();

    // Jika input bukan package ID (tidak mengandung dot), lakukan pencarian otomatis
    if (!targetAppId.includes('.')) {
      console.log(`\n🔍 Mencari aplikasi untuk kata kunci: "${targetAppId}"...`);
      const searchResults = await gplay.search({
        term: targetAppId,
        num: 5,
        lang: 'id',
        country: 'id'
      });

      if (!searchResults || searchResults.length === 0) {
        console.log('❌ Tidak ada aplikasi ditemukan untuk kata kunci tersebut.');
        rl.close();
        return;
      }

      console.log('\nPilih aplikasi:');
      searchResults.forEach((app, i) => {
        console.log(`[${i + 1}] ${app.title} (ID: ${app.appId}) ⭐ ${app.scoreText || app.score}`);
      });

      const choice = await rl.question(`\nMasukkan nomor pilihan (1-${searchResults.length}): `);
      const chosenIndex = parseInt(choice) - 1;

      if (isNaN(chosenIndex) || chosenIndex < 0 || chosenIndex >= searchResults.length) {
        console.log('❌ Pilihan tidak valid.');
        rl.close();
        return;
      }

      targetAppId = searchResults[chosenIndex].appId;
    }

    console.log(`\n📲 Target Aplikasi: ${targetAppId}`);

    const countInput = await rl.question('🔢 Masukkan jumlah ulasan yang ingin diambil (default: 100): ');
    const count = parseInt(countInput) || 100;

    console.log('\nPilih Urutan Ulasan:');
    console.log('1. Terbaru (NEWEST) [Default]');
    console.log('2. Paling Relevan / Membantu (HELPFULNESS)');
    console.log('3. Rating Tertinggi (RATING)');
    const sortInput = await rl.question('Pilihan (1/2/3): ');

    let sortOrder = gplay.sort.NEWEST;
    if (sortInput === '2') sortOrder = gplay.sort.HELPFULNESS;
    else if (sortInput === '3') sortOrder = gplay.sort.RATING;

    console.log(`\n⏳ Sedang mengambil ${count} ulasan dari Google Play Store...`);

    const result = await gplay.reviews({
      appId: targetAppId,
      sort: sortOrder,
      num: count,
      lang: 'id',
      country: 'id',
      paginate: true
    });

    const reviews = result.data || result;
    console.log(`✅ Berhasil mengumpulkan ${reviews.length} ulasan!`);

    if (reviews.length > 0) {
      const outputDir = path.resolve('data');
      await fs.mkdir(outputDir, { recursive: true });

      const cleanData = reviews.map((r, index) => ({
        no: index + 1,
        id: r.id || '',
        userName: r.userName || 'Anonymous',
        score: r.score || 0,
        date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
        text: (r.text || '').replace(/\r?\n|\r/g, ' '),
        thumbsUp: r.thumbsUp || 0,
        replyDate: r.replyDate ? new Date(r.replyDate).toISOString().split('T')[0] : '',
        replyText: (r.replyText || '').replace(/\r?\n|\r/g, ' '),
        version: r.version || '',
        url: r.url || ''
      }));

      // Simpan JSON
      const jsonFile = path.join(outputDir, `${targetAppId}_reviews.json`);
      await fs.writeFile(jsonFile, JSON.stringify(cleanData, null, 2), 'utf-8');

      // Simpan CSV
      const csvFile = path.join(outputDir, `${targetAppId}_reviews.csv`);
      const csvWriter = createObjectCsvWriter({
        path: csvFile,
        header: [
          { id: 'no', title: 'No' },
          { id: 'userName', title: 'User Name' },
          { id: 'score', title: 'Rating' },
          { id: 'date', title: 'Tanggal' },
          { id: 'text', title: 'Ulasan' },
          { id: 'thumbsUp', title: 'Like' },
          { id: 'replyDate', title: 'Tanggal Balasan' },
          { id: 'replyText', title: 'Balasan Developer' },
          { id: 'version', title: 'Versi' }
        ]
      });
      await csvWriter.writeRecords(cleanData);

      console.log('\n💾 File hasil export:');
      console.log(`- 📊 CSV  : ${csvFile}`);
      console.log(`- 📁 JSON : ${jsonFile}`);
    }

  } catch (err) {
    console.error('❌ Terjadi kesalahan:', err.message);
  } finally {
    rl.close();
  }
}

main();
