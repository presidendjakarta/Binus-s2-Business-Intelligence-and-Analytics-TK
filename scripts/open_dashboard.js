import { exec, spawn } from 'child_process';
import http from 'http';

const URL = 'http://localhost:3000/dashboard.html';

function checkServer(callback) {
  const req = http.get('http://localhost:3000', (res) => {
    callback(true);
  });
  req.on('error', () => {
    callback(false);
  });
  req.setTimeout(500, () => {
    req.abort();
    callback(false);
  });
}

checkServer((isRunning) => {
  if (!isRunning) {
    console.log('🚀 Memulai local server (server.js) di port 3000...');
    const child = spawn('node', ['server.js'], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  }

  setTimeout(() => {
    console.log(`📊 Membuka Dashboard Machine Learning di: ${URL}`);
    exec(`start "" "${URL}"`, (err) => {
      if (err) {
        console.error('Buka browser manual di:', URL);
      } else {
        console.log('✅ Dashboard ML berhasil dibuka!');
      }
    });
  }, 800);
});
