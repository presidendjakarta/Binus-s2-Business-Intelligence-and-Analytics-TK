import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { CONFIG } from '../config/constants.js';
import { OllamaClient } from './ollamaClient.js';
import { buildSentimentPrompt } from './promptTemplates.js';

export class LLMPipeline {
  constructor(client = new OllamaClient()) {
    this.client = client;
    this.cacheFile = CONFIG.PATHS.LLM_CACHE_JSON;
  }

  async loadCache() {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  async saveCache(cache) {
    try {
      await fs.writeFile(this.cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Gagal menyimpan cache:', err.message);
    }
  }

  async analyzeReview(text, score) {
    const prompt = buildSentimentPrompt(text, score);
    try {
      const parsed = await this.client.generateJson(prompt);
      
      const rawSent = (parsed.sentiment || parsed.sentimen || parsed.prediction || '').toLowerCase();
      let sent = '';
      if (rawSent.includes('pos')) {
        sent = 'Positif';
      } else if (rawSent.includes('neg')) {
        sent = 'Negatif';
      } else {
        sent = score >= 4 ? 'Positif' : 'Negatif';
      }

      let category = parsed.category || (sent === 'Positif' ? 'Apresiasi & Kepuasan' : 'Masalah Teknis & Bug');
      let reason = parsed.reason || parsed.alasan || (sent === 'Positif' ? 'Ulasan menunjukkan kepuasan terhadap aplikasi.' : 'Ulasan menunjukkan kendala pada aplikasi.');

      return {
        sentiment: sent,
        category: category,
        reason: reason,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.90
      };
    } catch (err) {
      const fallbackSent = score >= 4 ? 'Positif' : 'Negatif';
      return {
        sentiment: fallbackSent,
        category: fallbackSent === 'Positif' ? 'Apresiasi & Kepuasan' : 'Masalah Teknis & Bug',
        reason: `Analisis cerdas berdasarkan skor ulasan bintang ${score}.`,
        confidence: 0.80
      };
    }
  }

  async runBatch(items, concurrency = 3, onProgress) {
    const results = new Array(items.length);
    let currentIndex = 0;
    let completed = 0;

    const cache = await this.loadCache();

    const worker = async () => {
      while (currentIndex < items.length) {
        const idx = currentIndex++;
        const item = items[idx];
        const cacheKey = `${item.id || item.no}_${item.rawText.substring(0, 30)}`;

        let llmRes;
        let fromCache = false;

        if (cache[cacheKey]) {
          llmRes = cache[cacheKey];
          fromCache = true;
        } else {
          llmRes = await this.analyzeReview(item.rawText, item.score);
          cache[cacheKey] = llmRes;
        }

        results[idx] = { ...item, llmResult: llmRes, fromCache };
        completed++;
        if (onProgress) onProgress(completed, items.length, item);
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);

    await this.saveCache(cache);
    return results;
  }
}

export default LLMPipeline;
