import gplay from 'google-play-scraper';
import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { CONFIG } from '../config/constants.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class PlayStoreScraper {
  constructor(appId = CONFIG.APP_ID) {
    this.appId = appId;
  }

  async scrapeReviews(targetCount = CONFIG.DEFAULT_SAMPLE_SIZE, onProgress) {
    console.log(`🚀 Memulai scraping ulasan untuk: ${this.appId} (Target: ${targetCount} ulasan)...`);
    
    let allReviews = [];
    const seenIds = new Set();
    let nextPaginationToken = undefined;
    let batchIndex = 1;
    const batchSize = 150;

    while (allReviews.length < targetCount) {
      try {
        const remaining = targetCount - allReviews.length;
        const fetchNumber = Math.min(batchSize, remaining);

        const opts = {
          appId: this.appId,
          lang: 'id',
          country: 'id',
          sort: gplay.sort.NEWEST,
          num: fetchNumber
        };

        if (nextPaginationToken) {
          opts.nextPaginationToken = nextPaginationToken;
        }

        const result = await gplay.reviews(opts);

        if (!result.data || result.data.length === 0) {
          console.log('⚠️ Tidak ada ulasan baru yang ditemukan dari API.');
          break;
        }

        let newInBatch = 0;
        for (const rev of result.data) {
          if (!seenIds.has(rev.id) && rev.text && rev.text.trim().length > 0) {
            seenIds.add(rev.id);
            allReviews.push({
              no: allReviews.length + 1,
              id: rev.id,
              userName: rev.userName || 'Pengguna',
              score: rev.score,
              date: rev.date ? new Date(rev.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              text: rev.text.trim().replace(/[\r\n]+/g, ' '),
              thumbsUp: rev.thumbsUp || 0,
              replyDate: rev.replyDate || '',
              replyText: rev.replyText || '',
              version: rev.version || '4.18.0'
            });
            newInBatch++;
          }
        }

        if (onProgress) {
          onProgress(allReviews.length, targetCount, batchIndex, newInBatch);
        }

        nextPaginationToken = result.nextPaginationToken;
        batchIndex++;

        if (!nextPaginationToken) {
          console.log('🏁 Mencapai halaman terakhir (tidak ada pagination token lagi).');
          break;
        }

        await sleep(500);
      } catch (err) {
        console.error(`❌ Error pada batch ${batchIndex}:`, err.message);
        break;
      }
    }

    return allReviews;
  }

  async saveToFile(reviews, jsonPath = CONFIG.PATHS.RAW_REVIEWS_5000_JSON, csvPath = CONFIG.PATHS.RAW_REVIEWS_5000_CSV) {
    // Simpan JSON
    await fs.writeFile(jsonPath, JSON.stringify(reviews, null, 2), 'utf-8');
    console.log(`📁 File JSON tersimpan: ${jsonPath}`);

    // Simpan CSV
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'no', title: 'No' },
        { id: 'userName', title: 'User Name' },
        { id: 'score', title: 'Rating Bintang' },
        { id: 'date', title: 'Tanggal' },
        { id: 'text', title: 'Isi Ulasan' },
        { id: 'thumbsUp', title: 'Thumbs Up' },
        { id: 'replyDate', title: 'Tanggal Balasan' },
        { id: 'replyText', title: 'Isi Balasan' },
        { id: 'version', title: 'Versi Aplikasi' }
      ]
    });

    await csvWriter.writeRecords(reviews);
    console.log(`📊 File CSV tersimpan: ${csvPath}`);
  }
}

export default PlayStoreScraper;
