const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    // Simple robust comma splitting with quotes support
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

function loadSlangDict(masterDataDir) {
  const filePath = path.join(masterDataDir, 'slang.csv');
  const rows = parseCSV(filePath);
  const slangMap = {};
  for (const r of rows) {
    const key = (r.slang || r.kata_slang || r.informal || '').toLowerCase().trim();
    const val = (r.formal || r.baku || r.makna || '').toLowerCase().trim();
    if (key && val) {
      slangMap[key] = val;
    }
  }
  return slangMap;
}

function loadEmojiDict(masterDataDir) {
  const filePath = path.join(masterDataDir, 'emojis.csv');
  const rows = parseCSV(filePath);
  const emojiMap = {};
  for (const r of rows) {
    const key = (r.emoji || r.emotikon || '').trim();
    const val = (r.translation || r.token || r.makna || r.arti || '').toLowerCase().trim();
    if (key && val) {
      emojiMap[key] = val;
    }
  }
  return emojiMap;
}

function loadStopwords(masterDataDir) {
  const filePath = path.join(masterDataDir, 'stopwords.csv');
  const rows = parseCSV(filePath);
  const stopSet = new Set();
  for (const r of rows) {
    const word = (r.word || r.stopword || r.kata || '').toLowerCase().trim();
    if (word) {
      stopSet.add(word);
    }
  }
  return stopSet;
}

module.exports = {
  loadSlangDict,
  loadEmojiDict,
  loadStopwords
};
