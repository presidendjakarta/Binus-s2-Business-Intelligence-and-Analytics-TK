import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// =========================================================================
// MINI ENTERPRISE SERVER & OLLAMA CORS PROXY (ZERO DEPENDENCIES)
// =========================================================================

const PORT = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const BASE_DIR = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // Add Universal CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Proxy API Ollama (/api/generate)
  if (req.url === '/api/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const ollamaRes = await fetch(`${OLLAMA_HOST}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body
        });

        const data = await ollamaRes.text();
        res.writeHead(ollamaRes.status, { 'Content-Type': 'application/json' });
        res.end(data);
      } catch (err) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Gagal terhubung ke Ollama lokal di port 11434.',
          details: err.message,
          tip: 'Pastikan aplikasi Ollama sudah dijalankan di komputer Anda.'
        }));
      }
    });
    return;
  }

  // 2. Static File Server
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/dashboard_llm.html';

  const filePath = path.join(BASE_DIR, reqPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h3>404 Not Found: ${reqPath}</h3>`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Server Error: ${err.message}`);
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/dashboard_llm.html`;
  console.log('================================================================');
  console.log(`🚀 SERVER MOBILE JKN ANALYTICS BERJALAN DI: http://localhost:${PORT}`);
  console.log(`🧠 Dashboard LLM : http://localhost:${PORT}/dashboard_llm.html`);
  console.log(`📊 Dashboard ML  : http://localhost:${PORT}/dashboard.html`);
  console.log(`📡 Proxy Ollama  : http://localhost:${PORT}/api/generate -> ${OLLAMA_HOST}`);
  console.log('================================================================\n');

  // Buka browser otomatis
  exec(`start "" "${url}"`, () => {});
});
