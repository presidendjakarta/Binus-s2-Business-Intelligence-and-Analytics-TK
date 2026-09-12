import { CONFIG } from '../config/constants.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Client REST API untuk Ollama LLM Lokal
 */
export class OllamaClient {
  constructor(host = CONFIG.OLLAMA_HOST, model = CONFIG.OLLAMA_MODEL) {
    this.host = host;
    this.model = model;
  }

  async isAvailable() {
    try {
      const res = await fetch(`${this.host}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateJson(prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(`${this.host}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.model,
            prompt: prompt,
            stream: false,
            format: 'json',
            options: {
              temperature: 0.1,
              top_p: 0.9
            }
          }),
          signal: AbortSignal.timeout(30000)
        });

        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        return JSON.parse(data.response.trim());
      } catch (err) {
        if (attempt === maxRetries) {
          throw err;
        }
        await sleep(1000 * attempt);
      }
    }
  }
}

export default OllamaClient;
