const fs = require('fs');

function generateDashboardHtml(data) {
  const jsonReportData = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Analisis Sentimen Mobile JKN - BPJS Kesehatan</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- jQuery & DataTables CSS -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css">
  <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.dataTables.min.css">
  
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  
  <!-- jQuery & DataTables JS -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
  <script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
  <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>

  <style>
    :root {
      --bg-body: #f4f6f9;
      --bg-card: #ffffff;
      --border-color: #e3e8ee;
      --border-dark: #cbd5e1;
      --text-main: #212529;
      --text-muted: #6c757d;
      --primary: #0d6efd;
      --success: #198754;
      --danger: #dc3545;
      --warning: #ffc107;
      --bpjs: #059669;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background-color: var(--bg-body);
      color: var(--text-main);
      font-size: 13.5px;
      line-height: 1.5;
    }

    /* Top Navbar */
    .navbar {
      background-color: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 12px 24px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-container {
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-badge {
      background-color: var(--bpjs);
      color: #ffffff;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
    }
    .brand-text h1 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }
    .brand-text p {
      font-size: 12px;
      color: var(--text-muted);
    }
    .navbar-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 12.5px;
      font-weight: 500;
      border-radius: 4px;
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease-in-out;
      font-family: inherit;
    }
    .btn-default { background-color: #ffffff; border-color: var(--border-dark); color: #333333; }
    .btn-default:hover { background-color: #f8f9fa; border-color: #adb5bd; }
    .btn-success { background-color: var(--bpjs); color: #ffffff; border-color: var(--bpjs); }
    .btn-success:hover { background-color: #047857; }
    .btn-primary { background-color: var(--primary); color: #ffffff; border-color: var(--primary); }
    .btn-primary:hover { background-color: #0b5ed7; }
    .btn-sm { padding: 3px 8px; font-size: 11px; border-radius: 3px; }

    /* Main Container */
    .container {
      max-width: 1440px;
      margin: 20px auto;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Cards */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .card-header {
      padding: 12px 18px;
      border-bottom: 1px solid var(--border-color);
      background-color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
    }
    .card-subtitle {
      font-size: 12px;
      color: var(--text-muted);
    }
    .card-body {
      padding: 18px;
    }

    /* Grids */
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .grid-3-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    @media (max-width: 992px) {
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
      .grid-2, .grid-3-1 { grid-template-columns: 1fr; }
    }
    @media (max-width: 576px) {
      .grid-4 { grid-template-columns: 1fr; }
    }

    /* Stat Box (Admin Style) */
    .stat-card {
      padding: 16px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      border-left: 4px solid #adb5bd;
    }
    .stat-card.stat-blue { border-left-color: var(--primary); }
    .stat-card.stat-green { border-left-color: var(--bpjs); }
    .stat-card.stat-amber { border-left-color: #d97706; }
    .stat-card.stat-indigo { border-left-color: #6366f1; }
    .stat-label {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      margin: 4px 0;
    }
    .stat-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Aspect Grid Item */
    .aspect-box {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 14px;
      background: #ffffff;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }
    .aspect-box:hover {
      border-color: var(--primary);
      background-color: #f8faff;
    }
    .aspect-box.active {
      border-color: var(--primary);
      background-color: #f0f7ff;
    }
    .aspect-header {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .progress-bar-wrap {
      height: 8px;
      background-color: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      margin-bottom: 6px;
    }
    .bar-pos { background-color: var(--bpjs); }
    .bar-neg { background-color: var(--danger); }
    .aspect-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      line-height: 1.2;
    }
    .badge-success { background-color: #d1fae5; color: #065f46; }
    .badge-danger { background-color: #fee2e2; color: #991b1b; }
    .badge-info { background-color: #e0f2fe; color: #0369a1; }
    .badge-secondary { background-color: #e2e8f0; color: #334155; }
    .badge-warning { background-color: #fef3c7; color: #92400e; }

    /* Form Controls */
    .form-group { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .form-control, .form-select {
      padding: 6px 10px;
      font-size: 13px;
      border: 1px solid var(--border-dark);
      border-radius: 4px;
      background-color: #ffffff;
      color: var(--text-main);
      font-family: inherit;
      outline: none;
    }
    .form-control:focus, .form-select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(13,110,253,0.15);
    }

    /* DataTables Custom Styling */
    .dataTables_wrapper {
      font-size: 13px;
      color: var(--text-main);
    }
    .dataTables_wrapper .dataTables_length, 
    .dataTables_wrapper .dataTables_filter {
      margin-bottom: 12px;
    }
    .dataTables_wrapper .dataTables_filter input {
      padding: 5px 10px;
      border: 1px solid var(--border-dark);
      border-radius: 4px;
      outline: none;
      font-size: 13px;
    }
    .dataTables_wrapper .dataTables_length select {
      padding: 4px 8px;
      border: 1px solid var(--border-dark);
      border-radius: 4px;
      outline: none;
    }
    table.dataTable {
      border-collapse: collapse !important;
      width: 100% !important;
      border: 1px solid var(--border-color) !important;
    }
    table.dataTable thead th {
      background-color: #f8f9fa !important;
      color: #374151 !important;
      font-weight: 600 !important;
      padding: 10px 12px !important;
      border-bottom: 1px solid var(--border-color) !important;
    }
    table.dataTable tbody td {
      padding: 10px 12px !important;
      border-bottom: 1px solid var(--border-color) !important;
      vertical-align: middle !important;
    }
    table.dataTable tbody tr:hover {
      background-color: #f8fafc !important;
    }
    .dt-buttons {
      margin-bottom: 12px;
      gap: 6px;
      display: flex;
    }
    .dt-button {
      background: #ffffff !important;
      border: 1px solid var(--border-dark) !important;
      color: #374151 !important;
      padding: 5px 12px !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
    }
    .dt-button:hover {
      background: #f1f5f9 !important;
      border-color: #94a3b8 !important;
    }
    .dt-center {
      text-align: center !important;
    }

    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 200;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-overlay.open { display: flex; }
    .modal-dialog {
      background: #ffffff;
      border-radius: 6px;
      max-width: 650px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .modal-header {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-title { font-size: 15px; font-weight: 700; color: #111827; }
    .modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280; }
    .modal-body { padding: 18px; font-size: 13px; line-height: 1.6; }
    .modal-footer {
      padding: 12px 18px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      background-color: #f8f9fa;
    }
    .code-block {
      background: #f8f9fa;
      border: 1px solid var(--border-color);
      padding: 10px 14px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      margin: 8px 0 14px;
    }
  </style>
</head>
<body>
  <!-- Navbar -->
  <header class="navbar">
    <div class="navbar-container">
      <div class="brand-title">
        <span class="brand-badge">BPJS</span>
        <div class="brand-text">
          <h1>Sistem Analisis Sentimen & Aspek Operasional Mobile JKN</h1>
          <p>Dataset: <strong>${data.sourceDataFolder}</strong> | Diproses: ${data.generatedAt}</p>
        </div>
      </div>
      <div class="navbar-actions">
        <a href="https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id" target="_blank" rel="noopener noreferrer" class="btn btn-default" title="Buka aplikasi di Google Play Store">
          Google Play Store ↗
        </a>
        <button class="btn btn-default" onclick="openFormulaModal()">
          Metodologi & Rumus
        </button>
      </div>
    </div>
  </header>

  <main class="container">

    <!-- Row 1: Stat Boxes -->
    <div class="grid-4">
      <div class="stat-card stat-blue">
        <div class="stat-label">Total Ulasan Dianalisis</div>
        <div class="stat-value">${data.summary.totalReviews.toLocaleString('id-ID')}</div>
        <div class="stat-desc">${data.summary.vocabularySize.toLocaleString('id-ID')} Fitur TF-IDF (Unigram + Bigram)</div>
      </div>

      <div class="stat-card stat-amber">
        <div class="stat-label">Rata-rata Rating Pengguna</div>
        <div class="stat-value">${data.summary.avgRating} <span style="font-size:14px; color:var(--text-muted); font-weight:normal;">/ 5.0</span></div>
        <div class="stat-desc">Rating 1: ${(data.ratingCounts[1] || 0).toLocaleString('id-ID')} | Rating 5: ${(data.ratingCounts[5] || 0).toLocaleString('id-ID')}</div>
      </div>

      <div class="stat-card stat-green">
        <div class="stat-label">Polaritas Sentimen</div>
        <div class="stat-value">
          <span style="color:var(--bpjs);">${data.summary.positivePercent}%</span>
          <span style="font-size:16px; color:var(--text-muted); font-weight:normal;">/</span>
          <span style="color:var(--danger);">${data.summary.negativePercent}%</span>
        </div>
        <div class="stat-desc">NSS: ${data.summary.netSentimentScore >= 0 ? '+' : ''}${data.summary.netSentimentScore}% (${data.summary.positiveCount.toLocaleString('id-ID')} Pos vs ${data.summary.negativeCount.toLocaleString('id-ID')} Neg)</div>
      </div>

      <div class="stat-card stat-indigo">
        <div class="stat-label">Akurasi Model Naive Bayes</div>
        <div class="stat-value" style="color:var(--bpjs);">${data.metrics.accuracy}%</div>
        <div class="stat-desc">Precision: ${data.metrics.macroPrecision || data.metrics.precision}% | Recall: ${data.metrics.macroRecall || data.metrics.recall}% (5-Fold CV)</div>
      </div>
    </div>

    <!-- Row 2: Operational Aspects -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Analisis Modul Operasional Mobile JKN</div>
          <div class="card-subtitle">Distribusi sentimen pada pilar layanan aplikasi (Klik kotak aspek untuk filter DataTables)</div>
        </div>
      </div>
      <div class="card-body">
        <div class="grid-4" id="aspect-cards-grid">
          ${['Autentikasi & Akun', 'Antrean & Faskes', 'Kinerja & Server', 'Iuran & Layanan'].map(asp => {
            const stat = data.aspectStats[asp] || { total: 0, Positif: 0, Negatif: 0 };
            const posPct = stat.total > 0 ? ((stat.Positif / stat.total) * 100).toFixed(1) : 0;
            const negPct = stat.total > 0 ? ((stat.Negatif / stat.total) * 100).toFixed(1) : 0;
            return `
            <div class="aspect-box" onclick="selectAspectFilter('${asp}')" id="aspect-card-${asp.replace(/[^a-zA-Z]/g, '')}">
              <div class="aspect-header">
                <span>${asp}</span>
                <span class="badge badge-secondary">${stat.total.toLocaleString('id-ID')} ulasan</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="bar-pos" style="width:${posPct}%;" title="Positif: ${posPct}%"></div>
                <div class="bar-neg" style="width:${negPct}%;" title="Negatif: ${negPct}%"></div>
              </div>
              <div class="aspect-meta">
                <span style="color:var(--bpjs); font-weight:600;">${posPct}% Positif</span>
                <span style="color:var(--danger); font-weight:600;">${negPct}% Negatif</span>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Row 3: Charts -->
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Tren Rating & Volume Sentimen Bulanan</div>
        </div>
        <div class="card-body">
          <div style="height:260px; position:relative;">
            <canvas id="chartTimeline"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Distribusi Sentimen Berdasarkan Nilai Rating (1 - 5)</div>
        </div>
        <div class="card-body">
          <div style="height:260px; position:relative;">
            <canvas id="chartRatingSentiment"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: Top Keywords -->
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Top 10 Kata Kunci Sentimen Positif (Driver Kepuasan)</div>
        </div>
        <div class="card-body">
          <div style="height:260px; position:relative;">
            <canvas id="chartTopPos"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Top 10 Kata Kunci Sentimen Negatif (Keluhan Utama)</div>
        </div>
        <div class="card-body">
          <div style="height:260px; position:relative;">
            <canvas id="chartTopNeg"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 5: Model Evaluation -->
    <div class="grid-3-1">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Matriks Konfusi & Evaluasi Model (5-Fold Stratified Cross-Validation)</div>
        </div>
        <div class="card-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items:center;">
            <div>
              <table class="table" style="width:100%; border-collapse:collapse; border:1px solid var(--border-color); text-align:center;">
                <thead>
                  <tr>
                    <th rowspan="2" style="vertical-align:middle; text-align:center; padding:8px; border:1px solid var(--border-color); background:#f8f9fa;">Aktual</th>
                    <th colspan="2" style="text-align:center; padding:8px; border:1px solid var(--border-color); background:#f8f9fa;">Prediksi Model</th>
                  </tr>
                  <tr>
                    <th style="text-align:center; padding:8px; border:1px solid var(--border-color); background:#f8f9fa;">Positif</th>
                    <th style="text-align:center; padding:8px; border:1px solid var(--border-color); background:#f8f9fa;">Negatif</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th style="text-align:left; background:#f8f9fa; padding:8px; border:1px solid var(--border-color);">Aktual Positif</th>
                    <td style="background:#d1fae5; font-weight:700; color:#065f46; padding:8px; border:1px solid var(--border-color);">${data.metrics.confusionMatrix.tp} <br><span style="font-size:10px; font-weight:normal;">(True Pos)</span></td>
                    <td style="background:#fee2e2; font-weight:700; color:#991b1b; padding:8px; border:1px solid var(--border-color);">${data.metrics.confusionMatrix.fn} <br><span style="font-size:10px; font-weight:normal;">(False Neg)</span></td>
                  </tr>
                  <tr>
                    <th style="text-align:left; background:#f8f9fa; padding:8px; border:1px solid var(--border-color);">Aktual Negatif</th>
                    <td style="background:#fee2e2; font-weight:700; color:#991b1b; padding:8px; border:1px solid var(--border-color);">${data.metrics.confusionMatrix.fp} <br><span style="font-size:10px; font-weight:normal;">(False Pos)</span></td>
                    <td style="background:#d1fae5; font-weight:700; color:#065f46; padding:8px; border:1px solid var(--border-color);">${data.metrics.confusionMatrix.tn} <br><span style="font-size:10px; font-weight:normal;">(True Neg)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table style="width:100%; border-collapse:collapse; font-size:12px; border:1px solid var(--border-color);">
                <thead>
                  <tr style="background:#f8f9fa;">
                    <th style="padding:6px 8px; border:1px solid var(--border-color);">Kelas</th>
                    <th style="padding:6px 8px; border:1px solid var(--border-color);">Precision</th>
                    <th style="padding:6px 8px; border:1px solid var(--border-color);">Recall</th>
                    <th style="padding:6px 8px; border:1px solid var(--border-color);">F1-Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);"><strong>Positif</strong></td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.classMetrics.Positif.precision}%</td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.classMetrics.Positif.recall}%</td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.classMetrics.Positif.f1}%</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);"><strong>Negatif</strong></td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.classMetrics.Negatif.precision}%</td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.classMetrics.Negatif.recall}%</td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.classMetrics.Negatif.f1}%</td>
                  </tr>
                  <tr style="background:#f8f9fa; font-weight:700;">
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">Macro Avg</td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.macroPrecision || data.metrics.precision}%</td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.macroRecall || data.metrics.recall}%</td>
                    <td style="padding:6px 8px; border:1px solid var(--border-color);">${data.metrics.macroF1 || data.metrics.f1}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Parameter Sistem NLP</div>
        </div>
        <div class="card-body" style="font-size:12px;">
          <table style="width:100%; border-collapse:collapse;">
            <tbody>
              <tr><td style="padding:5px 0; color:var(--text-muted);">Algoritma</td><td><strong>Multinomial Naive Bayes</strong></td></tr>
              <tr><td style="padding:5px 0; color:var(--text-muted);">Smoothing</td><td><strong>Laplace (α = 1.0)</strong></td></tr>
              <tr><td style="padding:5px 0; color:var(--text-muted);">Ekstraksi Fitur</td><td><strong>TF-IDF (Sublinear TF)</strong></td></tr>
              <tr><td style="padding:5px 0; color:var(--text-muted);">N-Gram</td><td><strong>Unigram & Bigram (1-2)</strong></td></tr>
              <tr><td style="padding:5px 0; color:var(--text-muted);">Kamus Slang/Emoji</td><td><strong>862 Slang / 228 Emoji</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Row 6: DataTables Review Explorer -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Eksplorasi Ulasan Pengguna (DataTables)</div>
          <div class="card-subtitle">Klik judul kolom untuk sorting (A-Z / 1-9), cari di search box, atau filter berdasarkan sentimen, rating, dan aspek</div>
        </div>
      </div>
      <div class="card-body">
        
        <!-- External Filter Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border-color);">
          <div class="form-group">
            <label style="font-weight:600; font-size:12px; color:var(--text-muted);">Filter Cepat:</label>
            
            <select id="dt-filter-sentiment" class="form-select">
              <option value="">Semua Sentimen</option>
              <option value="Positif">Positif Saja</option>
              <option value="Negatif">Negatif Saja</option>
            </select>

            <select id="dt-filter-rating" class="form-select">
              <option value="">Semua Rating</option>
              <option value="5">Rating 5</option>
              <option value="4">Rating 4</option>
              <option value="3">Rating 3</option>
              <option value="2">Rating 2</option>
              <option value="1">Rating 1</option>
            </select>

            <select id="dt-filter-aspect" class="form-select">
              <option value="">Semua Modul Aspek</option>
              <option value="Autentikasi & Akun">Autentikasi & Akun</option>
              <option value="Antrean & Faskes">Antrean & Faskes</option>
              <option value="Kinerja & Server">Kinerja & Server</option>
              <option value="Iuran & Layanan">Iuran & Layanan</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <label style="font-size:12px; display:flex; align-items:center; gap:5px; cursor:pointer; margin-left:6px;">
              <input type="checkbox" id="dt-filter-anomaly">
              <span>⚠️ Hanya Anomali (Rating Mismatch)</span>
            </label>
          </div>
        </div>

        <!-- DataTable with separated Pengguna and Rating columns -->
        <table id="reviews-datatable" class="display nowrap" style="width:100%">
          <thead>
            <tr>
              <th style="width:40px;">#</th>
              <th>Nama Pengguna</th>
              <th style="width:60px; text-align:center;">Rating</th>
              <th style="width:110px;">Sentimen</th>
              <th style="width:130px;">Aspek Operasional</th>
              <th>Teks Ulasan Asli</th>
              <th>Token Preprocessing</th>
              <th style="width:90px;">Tanggal</th>
              <th style="width:80px; text-align:center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>

      </div>
    </div>

  </main>
  <!-- Formula Modal -->
  <div class="modal-overlay" id="formula-modal" onclick="if(event.target === this) closeFormulaModal()">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">Dokumentasi Metodologi & Formulasi Matematis</div>
        <button class="modal-close" onclick="closeFormulaModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom: 12px; color:var(--text-muted);">
          Berikut adalah perumusan matematis yang digunakan pada pipeline klasifikasi sentimen ulasan Mobile JKN:
        </p>

        <h4 style="font-size:13px; font-weight:700; margin-bottom:4px;">1. Pembobotan Kata TF-IDF (Sublinear & Smooth IDF)</h4>
        <div class="code-block">
          TF(t, d) = 1 + ln(f_{t, d}) (untuk f_{t, d} > 0)<br>
          IDF(t, D) = ln((1 + |D|) / (1 + DF(t))) + 1<br>
          TF-IDF(t, d) = TF(t, d) * IDF(t, D)<br>
          Normalisasi L2: v_norm = v / sqrt(sum(v_i^2))
        </div>

        <h4 style="font-size:13px; font-weight:700; margin-bottom:4px;">2. Likelihood Multinomial Naive Bayes (Laplace Smoothing)</h4>
        <div class="code-block">
          P(t | c) = (sum(TF-IDF_{t, c}) + alpha) / (sum_{t'}(TF-IDF_{t', c}) + alpha * |V|)<br>
          dengan alpha = 1.0, |V| = jumlah kosakata unik.
        </div>

        <h4 style="font-size:13px; font-weight:700; margin-bottom:4px;">3. Maximum A Posteriori (MAP) Decision Rule</h4>
        <div class="code-block">
          c* = argmax_{c in C} [ ln P(c) + sum_{t in d} (TF-IDF_{t, d} * ln P(t | c)) ]
        </div>

        <h4 style="font-size:13px; font-weight:700; margin-bottom:4px;">4. Metrik Evaluasi</h4>
        <div class="code-block">
          Accuracy = (TP + TN) / (TP + TN + FP + FN)<br>
          Precision = TP / (TP + FP) | Recall = TP / (TP + FN)<br>
          F1-Score = 2 * (Precision * Recall) / (Precision + Recall)
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-default" onclick="closeFormulaModal()">Tutup</button>
      </div>
    </div>
  </div>

  <!-- Review Detail Modal -->
  <div class="modal-overlay" id="review-modal" onclick="if(event.target === this) closeReviewModal()">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title" id="modal-user-name">Detail Ulasan</div>
        <button class="modal-close" onclick="closeReviewModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div id="modal-meta-info" style="font-size:12px; color:var(--text-muted); margin-bottom:12px;"></div>
        
        <div style="margin-bottom:14px;">
          <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Teks Ulasan Asli</div>
          <div id="modal-review-text" style="padding:10px; background:#f8f9fa; border:1px solid var(--border-color); border-radius:4px; font-size:13px; line-height:1.5;"></div>
        </div>

        <div style="margin-bottom:14px;">
          <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Token Hasil NLP Preprocessing</div>
          <div id="modal-tokens" style="padding:10px; background:#f8f9fa; border:1px solid var(--border-color); border-radius:4px; font-size:12px; font-family:monospace; word-break:break-word;"></div>
        </div>

        <div>
          <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Probabilitas Model & Aspek</div>
          <div id="modal-probs" style="padding:10px; background:#f8f9fa; border:1px solid var(--border-color); border-radius:4px; font-size:12px;"></div>
        </div>
      </div>
      <div class="modal-footer">
        <a id="modal-playstore-link" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size:12px;">
          Buka Komentar di Play Store ↗
        </a>
        <button class="btn btn-default" onclick="closeReviewModal()">Tutup</button>
      </div>
    </div>
  </div>

  <!-- Client JavaScript -->
  <script>
    const REPORT_DATA = ${jsonReportData};
    const ALL_SAMPLES = REPORT_DATA.samples || [];
    let dataTableInstance = null;
    let selectedAspectCard = null;

    $(document).ready(function() {
      initTimelineChart();
      initRatingSentimentChart();
      initTopKeywordsCharts();
      initDataTables();
    });

    function initTimelineChart() {
      const ctx = document.getElementById('chartTimeline');
      if (!ctx) return;
      const timeline = REPORT_DATA.timelineData || [];
      const labels = timeline.map(t => t.month);
      const posData = timeline.map(t => t.Positif);
      const negData = timeline.map(t => t.Negatif);
      const ratingData = timeline.map(t => t.avgRating);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Avg Rating',
              data: ratingData,
              type: 'line',
              borderColor: '#f59e0b',
              backgroundColor: '#f59e0b',
              borderWidth: 2,
              pointRadius: 3,
              yAxisID: 'yRating',
              tension: 0.2
            },
            {
              label: 'Sentimen Positif',
              data: posData,
              backgroundColor: '#059669',
              yAxisID: 'yCount',
              stack: 'volume'
            },
            {
              label: 'Sentimen Negatif',
              data: negData,
              backgroundColor: '#dc3545',
              yAxisID: 'yCount',
              stack: 'volume'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
            tooltip: {
              callbacks: {
                footer: (items) => {
                  const t = timeline[items[0].dataIndex];
                  return 'Total: ' + t.total + ' ulasan (Pos: ' + t.posPercent + '%, Neg: ' + t.negPercent + '%)';
                }
              }
            }
          },
          scales: {
            yCount: {
              type: 'linear',
              position: 'left',
              stacked: true,
              grid: { color: '#f1f5f9' },
              title: { display: true, text: 'Volume Ulasan', font: { size: 11 } }
            },
            yRating: {
              type: 'linear',
              position: 'right',
              min: 1,
              max: 5,
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Rata-rata Rating', font: { size: 11 } }
            },
            x: { grid: { display: false } }
          }
        }
      });
    }

    function initRatingSentimentChart() {
      const ctx = document.getElementById('chartRatingSentiment');
      if (!ctx) return;
      const ratings = ['1', '2', '3', '4', '5'];
      const posCounts = ratings.map(r => (REPORT_DATA.ratingDistribution[r] ? REPORT_DATA.ratingDistribution[r].Positif : 0));
      const negCounts = ratings.map(r => (REPORT_DATA.ratingDistribution[r] ? REPORT_DATA.ratingDistribution[r].Negatif : 0));

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Rating 1', 'Rating 2', 'Rating 3', 'Rating 4', 'Rating 5'],
          datasets: [
            {
              label: 'Positif',
              data: posCounts,
              backgroundColor: '#059669'
            },
            {
              label: 'Negatif',
              data: negCounts,
              backgroundColor: '#dc3545'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } }
          },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, grid: { color: '#f1f5f9' } }
          }
        }
      });
    }

    function initTopKeywordsCharts() {
      const posCtx = document.getElementById('chartTopPos');
      if (posCtx && REPORT_DATA.topKeywords && REPORT_DATA.topKeywords.Positif) {
        const topPos = REPORT_DATA.topKeywords.Positif.slice(0, 10).reverse();
        new Chart(posCtx, {
          type: 'bar',
          data: {
            labels: topPos.map(k => k.word || k.term),
            datasets: [{
              label: 'Bobot TF-IDF',
              data: topPos.map(k => Number((k.score || 0).toFixed(1))),
              backgroundColor: '#059669',
              borderRadius: 3
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: '#f1f5f9' }, title: { display: true, text: 'Bobot Akumulatif TF-IDF', font: { size: 10 } } },
              y: { grid: { display: false } }
            }
          }
        });
      }

      const negCtx = document.getElementById('chartTopNeg');
      if (negCtx && REPORT_DATA.topKeywords && REPORT_DATA.topKeywords.Negatif) {
        const topNeg = REPORT_DATA.topKeywords.Negatif.slice(0, 10).reverse();
        new Chart(negCtx, {
          type: 'bar',
          data: {
            labels: topNeg.map(k => k.word || k.term),
            datasets: [{
              label: 'Bobot TF-IDF',
              data: topNeg.map(k => Number((k.score || 0).toFixed(1))),
              backgroundColor: '#dc3545',
              borderRadius: 3
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: '#f1f5f9' }, title: { display: true, text: 'Bobot Akumulatif TF-IDF', font: { size: 10 } } },
              y: { grid: { display: false } }
            }
          }
        });
      }
    }

    function initDataTables() {
      // Build row data for DataTables
      const tableData = ALL_SAMPLES.map((item, idx) => {
        const thumbsUpText = item.thumbsUp > 0 ? '<span style="color:#d97706; margin-left:4px;">👍 ' + item.thumbsUp + '</span>' : '';
        const versionText = item.version && item.version !== 'Unspecified' ? '<span class="badge badge-secondary" style="font-size:10px;">v' + escapeHtml(item.version) + '</span>' : '';
        
        // 1. Column Nama Pengguna
        const userHtml = '<div style="font-weight:600; cursor:pointer;" onclick="openReviewDetail(' + idx + ')">' + escapeHtml(item.userName || 'Pengguna') + '</div>' +
          '<div>' + versionText + thumbsUpText + '</div>';

        // 2. Column Rating (Pure Number)
        const ratingHtml = '<div style="font-weight:700; font-size:13.5px; text-align:center;">' + item.score + '</div>';

        // 3. Column Sentimen
        const sentBadge = item.predictedLabel === 'Positif'
          ? '<span class="badge badge-success">Positif (' + ((item.confidence || 0) * 100).toFixed(0) + '%)</span>'
          : '<span class="badge badge-danger">Negatif (' + ((item.confidence || 0) * 100).toFixed(0) + '%)</span>';
        const anomalyText = item.isAnomaly ? '<div style="margin-top:2px;"><span class="badge badge-warning" style="font-size:10px;">⚠️ Mismatch</span></div>' : '';

        // 4. Column Aspek
        const aspectBadges = (item.aspects || ['Lainnya']).map(a => '<span class="badge badge-info">' + a + '</span>').join(' ');

        // 5. Column Teks Ulasan
        const textHtml = '<div style="cursor:pointer; max-width:380px; white-space:normal;" onclick="openReviewDetail(' + idx + ')" title="Klik untuk rincian ulasan">' + escapeHtml(item.text) + '</div>';

        // 6. Column Token
        const tokensStr = (item.tokens || []).slice(0, 6).join(', ');
        const moreTokensStr = (item.tokens && item.tokens.length > 6) ? ', ... (' + item.tokens.length + ' token)' : '';
        const tokensHtml = '<div style="font-size:11px; color:var(--text-muted); font-family:monospace; max-width:200px; white-space:normal;">' + escapeHtml(tokensStr + moreTokensStr) + '</div>';

        // 7. Column Tanggal
        const formattedDate = item.date ? item.date.split('T')[0] : '-';

        // 8. Column Aksi
        const playStoreUrl = 'https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id&reviewId=' + encodeURIComponent(item.id || '');
        const actionHtml = '<a href="' + playStoreUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-default btn-sm" title="Buka komentar ini di Google Play Store">Play Store ↗</a>';

        return [
          idx + 1,
          userHtml,
          ratingHtml,
          sentBadge + anomalyText,
          aspectBadges,
          textHtml,
          tokensHtml,
          formattedDate,
          actionHtml,
          item.predictedLabel, // hidden index 9 for sentiment filter
          item.score,          // hidden index 10 for rating filter
          (item.aspects || []).join(' '), // hidden index 11 for aspect filter
          item.isAnomaly ? 'ANOMALY' : 'NORMAL' // hidden index 12 for anomaly filter
        ];
      });

      // Custom filtering function for DataTables
      $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const item = ALL_SAMPLES[dataIndex];
        if (!item) return true;

        const sentFilter = $('#dt-filter-sentiment').val();
        const rateFilter = $('#dt-filter-rating').val();
        const aspectFilter = $('#dt-filter-aspect').val();
        const anomalyOnly = $('#dt-filter-anomaly').is(':checked');

        // 1. Filter Sentimen
        if (sentFilter && item.predictedLabel !== sentFilter) {
          return false;
        }

        // 2. Filter Rating Bintang
        if (rateFilter && String(item.score) !== String(rateFilter)) {
          return false;
        }

        // 3. Filter Aspek Operasional
        if (aspectFilter) {
          const itemAspects = item.aspects || ['Lainnya'];
          if (!itemAspects.includes(aspectFilter)) {
            return false;
          }
        }

        // 4. Filter Anomali Mismatch
        if (anomalyOnly && !item.isAnomaly) {
          return false;
        }

        return true;
      });

      // Initialize DataTable
      dataTableInstance = $('#reviews-datatable').DataTable({
        data: tableData,
        pageLength: 25,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Semua"]],
        scrollX: true,
        order: [[0, 'asc']],
        dom: '<"dt-buttons-wrapper"B><"dt-search-wrapper"lf>rtip',
        buttons: [
          { extend: 'csvHtml5', text: 'Ekspor CSV', className: 'dt-button', filename: 'mobile_jkn_reviews' },
          { extend: 'excelHtml5', text: 'Ekspor Excel', className: 'dt-button', filename: 'mobile_jkn_reviews' },
          { extend: 'print', text: 'Cetak Laporan', className: 'dt-button' }
        ],
        columnDefs: [
          { targets: [9, 10, 11, 12], visible: false, searchable: false },
          { targets: [0, 2, 8], className: 'dt-center' },
          { targets: [8], orderable: false }
        ],
        language: {
          search: "Pencarian:",
          lengthMenu: "Tampilkan _MENU_ baris",
          info: "Menampilkan _START_ s/d _END_ dari _TOTAL_ ulasan",
          infoEmpty: "Menampilkan 0 ulasan",
          infoFiltered: "(disaring dari _MAX_ total ulasan)",
          zeroRecords: "Tidak ada data ulasan yang cocok",
          paginate: {
            first: "Pertama",
            last: "Terakhir",
            next: "Berikutnya",
            previous: "Sebelumnya"
          }
        }
      });

      // Event listeners for external filters
      $('#dt-filter-sentiment, #dt-filter-rating, #dt-filter-aspect').on('change', function() {
        dataTableInstance.draw();
      });
      $('#dt-filter-anomaly').on('change', function() {
        dataTableInstance.draw();
      });
    }

    function selectAspectFilter(aspectName) {
      const aspectSelect = $('#dt-filter-aspect');
      if (selectedAspectCard === aspectName) {
        selectedAspectCard = null;
        aspectSelect.val('');
      } else {
        selectedAspectCard = aspectName;
        aspectSelect.val(aspectName);
      }
      
      $('.aspect-box').removeClass('active');
      if (selectedAspectCard) {
        const cardId = 'aspect-card-' + selectedAspectCard.replace(/[^a-zA-Z]/g, '');
        $('#' + cardId).addClass('active');
      }

      if (dataTableInstance) {
        dataTableInstance.draw();
      }
    }

    function openReviewDetail(idx) {
      const item = ALL_SAMPLES[idx];
      if (!item) return;

      document.getElementById('modal-user-name').innerText = 'Ulasan Pengguna: ' + (item.userName || 'Anonim');

      const formattedDate = item.date ? new Date(item.date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : '-';
      const versionStr = item.version ? ' | Versi: v' + item.version : '';
      const thumbsStr = item.thumbsUp > 0 ? ' | 👍 ' + item.thumbsUp + ' membantu' : '';

      document.getElementById('modal-meta-info').innerHTML = 'Rating: <strong>' + item.score + ' / 5</strong> | Tanggal: ' + formattedDate + versionStr + thumbsStr;
      document.getElementById('modal-review-text').innerText = item.text || '-';

      const tokens = item.tokens || [];
      document.getElementById('modal-tokens').innerText = tokens.length > 0
        ? '[' + tokens.join(', ') + ']'
        : 'Tidak ada token yang tersisa pasca-stopword.';

      const posProb = item.probabilities && item.probabilities.Positif ? (item.probabilities.Positif * 100).toFixed(2) : '-';
      const negProb = item.probabilities && item.probabilities.Negatif ? (item.probabilities.Negatif * 100).toFixed(2) : '-';
      document.getElementById('modal-probs').innerHTML = 
        '<strong>Prediksi Sentimen:</strong> ' + item.predictedLabel + ' (' + ((item.confidence || 0) * 100).toFixed(1) + '%) &nbsp;|&nbsp; <strong>P(Positif):</strong> ' + posProb + '% &nbsp;|&nbsp; <strong>P(Negatif):</strong> ' + negProb + '% &nbsp;|&nbsp; <strong>Aspek:</strong> ' + (item.aspects || []).join(', ');

      const playStoreLink = document.getElementById('modal-playstore-link');
      playStoreLink.href = 'https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id&reviewId=' + encodeURIComponent(item.id || '');

      document.getElementById('review-modal').classList.add('open');
    }

    function closeReviewModal() {
      document.getElementById('review-modal').classList.remove('open');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function openFormulaModal() {
      document.getElementById('formula-modal').classList.add('open');
    }
    function closeFormulaModal() {
      document.getElementById('formula-modal').classList.remove('open');
    }
  </script>
</body>
</html>`;
}

module.exports = { generateDashboardHtml };
