import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { exec } from 'child_process';
import {
  getProjectsList,
  getProjectData,
  deleteProject,
  createProject,
  lookupPlayStoreApp
} from './src/project/projectManager.js';

// =========================================================================
// ENTERPRISE REST API & STATIC SERVER - MULTI-APP NAIVE BAYES ANALYTICS
// =========================================================================

const PORT = process.env.PORT || 3000;
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
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Format JSON payload tidak valid.'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // Universal CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = reqUrl.pathname;

  // -----------------------------------------------------------------------
  // REST API ENDPOINTS
  // -----------------------------------------------------------------------

  // 1. GET /api/projects - Ambil daftar semua project
  if (pathname === '/api/projects' && req.method === 'GET') {
    try {
      const list = await getProjectsList();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, projects: list }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 2. GET /api/apps/lookup?urlOrId=... - Lookup metadata Play Store app
  if (pathname === '/api/apps/lookup' && req.method === 'GET') {
    const urlOrId = reqUrl.searchParams.get('urlOrId');
    if (!urlOrId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Parameter urlOrId wajib diisi.' }));
      return;
    }

    try {
      const appInfo = await lookupPlayStoreApp(urlOrId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, app: appInfo }));
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 3. GET /api/projects/:id - Ambil data lengkap 1 project (meta + reviews)
  if (pathname.startsWith('/api/projects/') && req.method === 'GET') {
    const projectId = pathname.replace('/api/projects/', '').trim();
    if (!projectId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Project ID wajib disertakan.' }));
      return;
    }

    try {
      const data = await getProjectData(projectId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, ...data }));
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 4. POST /api/projects/create - Buat project baru (scrape -> train Naive Bayes -> evaluate -> save)
  if (pathname === '/api/projects/create' && req.method === 'POST') {
    try {
      const payload = await parseBody(req);
      const { projectName, source, appUrlOrId, sampleSize } = payload;

      if (!appUrlOrId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'URL atau App ID Play Store wajib diisi.' }));
        return;
      }

      console.log(`\n🚀 Memulai pembuatan project baru: "${projectName || appUrlOrId}" (${sampleSize || 1000} ulasan)...`);
      
      const result = await createProject({
        projectName,
        source: source || 'Google Play Store',
        appUrlOrId,
        sampleSize: parseInt(sampleSize) || 1000,
        onProgress: (prog) => {
          console.log(`   [Project Pipeline] ${prog.message}`);
        }
      });

      console.log(`✅ Project '${result.meta.name}' berhasil dibuat dan dilatih!\n`);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, project: result.meta, reviews: result.reviews }));
    } catch (err) {
      console.error(`❌ Gagal membuat project:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 5. DELETE /api/projects/:id - Hapus project
  if (pathname.startsWith('/api/projects/') && req.method === 'DELETE') {
    const projectId = pathname.replace('/api/projects/', '').trim();
    if (!projectId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Project ID wajib disertakan.' }));
      return;
    }

    try {
      const updatedList = await deleteProject(projectId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, projects: updatedList }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // -----------------------------------------------------------------------
  // STATIC FILE SERVER
  // -----------------------------------------------------------------------
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') reqPath = '/dashboard.html';

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
  const url = `http://localhost:${PORT}/dashboard.html`;
  console.log('================================================================');
  console.log(`🚀 SERVER MULTI-APP NAIVE BAYES BERJALAN DI: http://localhost:${PORT}`);
  console.log(`📊 Dashboard Analytics : http://localhost:${PORT}/dashboard.html`);
  console.log(`📡 API Endpoints       : http://localhost:${PORT}/api/projects`);
  console.log('================================================================\n');

  // Buka browser otomatis
  exec(`start "" "${url}"`, () => {});
});
