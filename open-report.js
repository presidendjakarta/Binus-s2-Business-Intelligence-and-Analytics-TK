const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getLatestFolder } = require('./src/utils/helpers');

const baseReportDir = path.join(__dirname, 'report');
let targetReportFolder = null;

if (process.argv[2]) {
  targetReportFolder = path.isAbsolute(process.argv[2])
    ? process.argv[2]
    : path.join(__dirname, process.argv[2]);
} else {
  targetReportFolder = getLatestFolder(baseReportDir);
}

if (!targetReportFolder || !fs.existsSync(targetReportFolder)) {
  console.error('[!] Belum ada laporan di direktori report/. Jalankan: node run-analisa.js');
  process.exit(1);
}

const htmlPath = path.join(targetReportFolder, 'dashboard.html');
if (!fs.existsSync(htmlPath)) {
  console.error(`[!] File dashboard.html tidak ditemukan di: ${targetReportFolder}`);
  process.exit(1);
}

console.log(`[✓] Membuka Executive Dashboard: ${htmlPath}`);
exec(`start "" "${htmlPath}"`, (err) => {
  if (err) {
    console.error(`[!] Gagal membuka browser otomatis: ${err.message}`);
    console.log(`    Silakan buka manual file: ${htmlPath}`);
  }
});
