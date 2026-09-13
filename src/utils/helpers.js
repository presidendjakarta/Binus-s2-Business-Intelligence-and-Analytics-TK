const fs = require('fs');
const path = require('path');

function getTimestampFolder() {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD}_${HH}-${mm}`;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getLatestFolder(baseDir) {
  if (!fs.existsSync(baseDir)) return null;
  const entries = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()
    .reverse();
  
  if (entries.length === 0) return null;
  return path.join(baseDir, entries[0]);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.includes('=')) {
      const [key, ...valParts] = arg.split('=');
      const cleanKey = key.replace(/^-+/, '').trim();
      const val = valParts.join('=').trim();
      args[cleanKey] = isNaN(val) ? val : Number(val);
    } else {
      const cleanKey = arg.replace(/^-+/, '').trim();
      args[cleanKey] = true;
    }
  }
  return args;
}

module.exports = {
  getTimestampFolder,
  ensureDir,
  getLatestFolder,
  parseArgs
};
