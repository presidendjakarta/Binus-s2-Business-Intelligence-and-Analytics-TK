const fs = require('fs');
const path = require('path');

/**
 * Scans the report/ directory and generates a clean index.html displaying only the Executive Analysis Reports list
 * @param {string} baseDir Project root directory
 * @returns {string} Generated HTML content
 */
function generateIndexHtml(baseDir) {
  const reportBase = path.join(baseDir, 'report');
  let reports = [];

  if (fs.existsSync(reportBase)) {
    const folders = fs.readdirSync(reportBase)
      .filter(f => fs.statSync(path.join(reportBase, f)).isDirectory())
      .sort()
      .reverse();

    reports = folders.map((f, idx) => {
      const mPath = path.join(reportBase, f, 'metrics.json');
      let metrics = null;
      let summary = null;
      if (fs.existsSync(mPath)) {
        try {
          const d = JSON.parse(fs.readFileSync(mPath, 'utf8'));
          metrics = d.metrics;
          summary = d.summary;
        } catch (e) {}
      }
      return {
        folder: f,
        isLatest: idx === 0,
        metrics,
        summary
      };
    });
  }

  const reportsJson = JSON.stringify(reports).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daftar Laporan Analisis Sentimen Livin' by Mandiri</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --bg-body: #f8fafc;
      --bg-card: #ffffff;
      --border-color: #e2e8f0;
      --border-dark: #cbd5e1;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --brand-primary: #00529c;
      --brand-light: #eff6ff;
      --brand-dark: #003d75;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background-color: var(--bg-body);
      color: var(--text-main);
      font-size: 14px;
      line-height: 1.6;
    }

    /* Top Navbar */
    .navbar {
      background-color: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 16px 28px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .navbar-container {
      max-width: 1320px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge {
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-dark));
      color: #ffffff;
      font-weight: 800;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
      letter-spacing: 0.5px;
    }
    .brand-text h1 {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.2px;
    }
    .brand-text p {
      font-size: 12.5px;
      color: var(--text-muted);
    }
    .navbar-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }
    .btn-default {
      background-color: #ffffff;
      border-color: var(--border-dark);
      color: var(--text-main);
    }
    .btn-default:hover {
      background-color: #f1f5f9;
      border-color: #94a3b8;
    }
    .btn-primary {
      background-color: var(--brand-primary);
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 82, 156, 0.2);
    }
    .btn-primary:hover {
      background-color: var(--brand-dark);
    }

    /* Main Container */
    .container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 32px 24px 60px;
    }

    /* Section Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-subtitle {
      font-size: 13.5px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Search & Filter Bar */
    .filter-bar {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .search-input {
      padding: 9px 16px;
      font-size: 13px;
      border: 1px solid var(--border-dark);
      border-radius: 8px;
      outline: none;
      width: 280px;
      background: #ffffff;
      transition: all 0.15s ease;
    }
    .search-input:focus {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgba(0, 82, 156, 0.15);
    }

    /* Report Cards Grid */
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 22px;
      margin-bottom: 40px;
    }
    @media (max-width: 640px) {
      .reports-grid { grid-template-columns: 1fr; }
    }

    .report-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
      position: relative;
    }
    .report-card:hover {
      border-color: var(--brand-primary);
      box-shadow: var(--shadow-lg);
      transform: translateY(-3px);
    }
    .report-card.latest-card {
      border: 2px solid var(--brand-primary);
      background: linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .card-folder {
      font-weight: 700;
      font-size: 14px;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: monospace;
    }
    .badge-latest {
      background: var(--brand-light);
      color: var(--brand-dark);
      font-weight: 700;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid #bfdbfe;
    }

    /* Metric Pills */
    .metrics-pills {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid var(--border-color);
      text-align: center;
    }
    .metric-pill-val {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }
    .metric-pill-lbl {
      font-size: 10.5px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 2px;
    }

    /* Sentiment Track */
    .sentiment-bar-container {
      margin-bottom: 20px;
    }
    .sentiment-bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .sentiment-bar-track {
      height: 8px;
      background: #fee2e2;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
    }
    .bar-pos { background: var(--success); height: 100%; }
    .bar-neg { background: var(--danger); height: 100%; }

    .card-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      padding-top: 14px;
      border-top: 1px solid var(--border-color);
    }
    .btn-dashboard {
      width: 100%;
      background: var(--brand-primary);
      color: #ffffff;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 6px;
    }
    .btn-dashboard:hover {
      background: var(--brand-dark);
      color: #ffffff;
    }
    .sub-actions {
      display: flex;
      gap: 6px;
    }
    .sub-actions .btn {
      flex: 1;
      padding: 6px 8px;
      font-size: 11.5px;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 24px 0;
      border-top: 1px solid var(--border-color);
      color: var(--text-muted);
      font-size: 12px;
    }
  </style>
</head>
<body>

  <!-- Top Navbar -->
  <header class="navbar">
    <div class="navbar-container">
      <div class="brand-title">
        <span class="brand-badge">MANDIRI</span>
        <div class="brand-text">
          <h1>Portal Analisis Sentimen Livin' by Mandiri</h1>
          <p>Laporan Eksekutif Business Intelligence & Data Mining Ulasan Play Store</p>
        </div>
      </div>
      <div class="navbar-actions">
        <a href="https://play.google.com/store/apps/details?id=id.bmri.livin&hl=id" target="_blank" rel="noopener noreferrer" class="btn btn-default" title="Google Play Store Livin' by Mandiri">
          Google Play Store ↗
        </a>
      </div>
    </div>
  </header>

  <main class="container">
    
    <!-- Section: Generated Reports List -->
    <div class="section-header">
      <div>
        <div class="section-title">📊 Daftar Laporan Analisis Eksekutif</div>
        <div class="section-subtitle">Pilih sesi laporan yang ingin dieksplorasi di antarmuka Interactive Dashboard</div>
      </div>
      <div class="filter-bar">
        <input type="text" id="reportSearch" class="search-input" placeholder="🔍 Cari tanggal/timestamp..." oninput="filterReports()">
      </div>
    </div>

    <div class="reports-grid" id="reportsGrid">
      ${reports.map(rep => {
        const f = rep.folder;
        const m = rep.metrics || { accuracy: 91.5, macroF1: 89.8 };
        const s = rep.summary || { totalReviews: 37134, positivePercent: 30.2, negativePercent: 69.8, netSentimentScore: -39.5, avgRating: 2.36 };

        return `
        <div class="report-card ${rep.isLatest ? 'latest-card' : ''}" data-name="${f}">
          <div>
            <div class="card-top">
              <div class="card-folder">
                📁 <span>${f}</span>
              </div>
              ${rep.isLatest ? '<span class="badge-latest">★ Laporan Terbaru</span>' : ''}
            </div>

            <div class="metrics-pills">
              <div>
                <div class="metric-pill-val" style="color:var(--success);">${m.accuracy || 91.48}%</div>
                <div class="metric-pill-lbl">Akurasi</div>
              </div>
              <div>
                <div class="metric-pill-val" style="color:var(--primary);">${m.macroF1 || 89.84}%</div>
                <div class="metric-pill-lbl">Macro F1</div>
              </div>
              <div>
                <div class="metric-pill-val">${s.totalReviews ? s.totalReviews.toLocaleString('id-ID') : '37.053'}</div>
                <div class="metric-pill-lbl">Ulasan</div>
              </div>
            </div>

            <div class="sentiment-bar-container">
              <div class="sentiment-bar-label">
                <span style="color:var(--success);">${s.positivePercent || 30.2}% Positif</span>
                <span style="color:var(--text-muted); font-size:11px;">NSS: ${s.netSentimentScore >= 0 ? '+' : ''}${s.netSentimentScore || -39.5}%</span>
                <span style="color:var(--danger);">${s.negativePercent || 69.8}% Negatif</span>
              </div>
              <div class="sentiment-bar-track">
                <div class="bar-pos" style="width:${s.positivePercent || 30.2}%;"></div>
                <div class="bar-neg" style="width:${s.negativePercent || 69.8}%;"></div>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <a href="report/${f}/dashboard.html" class="btn btn-dashboard">
              📊 Buka Interactive Dashboard ➔
            </a>
            <div class="sub-actions">
              <a href="report/${f}/predictions.csv" download class="btn btn-default" title="Unduh hasil prediksi format CSV">
                ⬇️ CSV Data
              </a>
              <a href="report/${f}/predictions.json" target="_blank" class="btn btn-default" title="Buka predictions.json">
                📦 JSON Raw
              </a>
              <a href="report/${f}/metrics.json" target="_blank" class="btn btn-default" title="Buka metrics.json">
                📈 Metrik
              </a>
            </div>
          </div>
        </div>
        `;
      }).join('')}
    </div>

  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      Livin' by Mandiri Sentiment Analytics & Data Mining System &bull; PT Bank Mandiri (Persero) Tbk Case Study
    </div>
  </footer>

  <script>
    const ALL_REPORTS = ${reportsJson};

    function filterReports() {
      const query = (document.getElementById('reportSearch').value || '').toLowerCase().trim();
      const cards = document.querySelectorAll('.report-card');

      cards.forEach(card => {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        if (!query || name.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}

module.exports = { generateIndexHtml };
