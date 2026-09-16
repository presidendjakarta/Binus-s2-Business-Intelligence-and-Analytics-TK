# Livin' by Mandiri Sentiment Analytics — Multinomial Naive Bayes

Aplikasi Data Mining dan Analisis Sentimen Ulasan **Livin' by Mandiri (PT Bank Mandiri Tbk)** dari Google Play Store menggunakan **Sastrawi Stemmer + KBBI Lexicon**, **TF-IDF Vectorizer**, dan **Multinomial Naive Bayes Classifier**.

---

## 🚀 Fitur Utama

1. **Scraper Play Store Cepat:** Mengambil ribuan ulasan Livin' by Mandiri langsung dari Play Store beserta rating, tanggal, dan nama pengguna (dengan filter tahun 2026).
2. **Master Data Berbasis CSV & KBBI:** Kamus bahasa gaul (*slang*), terjemahan emoji, *stopwords*, dan 67.000+ kata dasar KBBI disimpan dalam format yang dapat dibuka dan diedit di **Microsoft Excel** / teks.
3. **Pipeline NLP Lengkap:**
   - Case folding & sanitasi teks
   - Translasi emoji ke makna sentimen bahasa Indonesia
   - Normalisasi bahasa gaul & singkatan perbankan/fintech
   - Penanganan frasa negasi (*misal: tidak bisa -> tidak_bisa*)
   - Penghapusan stopwords
   - Stemming kata dasar bahasa Indonesia berbasis **ts-sastrawi + KBBI + Domain Banking Overrides**
4. **TF-IDF & Multinomial Naive Bayes:** Pembobotan teks *sublinear* dengan *Lidstone Smoothing* ($\alpha=0.25$) dan probabilitas posterior *Softmax*.
5. **Evaluasi 5-Fold Cross Validation:** Menghasilkan Akurasi, Precision, Recall, Macro F1, dan Confusion Matrix lengkap.
6. **Executive BI Dashboard Mandiri (`dashboard.html`):** Visualisasi interaktif mandiri (Chart.js & DataTables) tanpa perlu server lokal.

---

## 🛠️ Cara Penggunaan Singkat

### 1. Ambil Data Ulasan Play Store (Tahun 2026)
```bash
node scrap-livin.js data=5000 year=2026
```
*Output tersimpan di: `data/YYYY-MM-DD_HH-mm/`*

### 2. Jalankan Analisis Sentimen
```bash
node run-analisa.js
```
*Atau pilih folder spesifik:*
```bash
node run-analisa.js folder=data/2026-09-16_13-39
```
*Output tersimpan di: `report/YYYY-MM-DD_HH-mm/`*

### 3. Buka Dashboard Interaktif
```bash
node open-report.js
```
*Atau double-click langsung file `report/YYYY-MM-DD_HH-mm/dashboard.html` di file explorer.*

---

## 📂 Struktur Direktori

```
playstore-mining/
├── master_data/                 # Master Data Kamus NLP (CSV & KBBI)
│   ├── slang.csv                # Kamus bahasa gaul & singkatan
│   ├── emojis.csv               # Kamus translasi emoji
│   ├── stopwords.csv            # Kamus kata stopword
│   └── kbbi_wordlist.txt        # 67.000+ kosakata KBBI
├── src/
│   ├── nlp/                     # Modul NLP & Preprocessing
│   ├── ml/                      # TF-IDF, Naive Bayes, & Evaluator
│   ├── scraper/                 # Scraper Google Play Store
│   ├── report/                  # Generator Dashboard HTML
│   └── utils/                   # Helper & Utilities
├── data/                        # Penyimpanan Dataset Mentah
│   └── YYYY-MM-DD_HH-mm/        # Folder batch data ulasan (JSON & CSV)
├── report/                      # Penyimpanan Laporan & Dashboard
│   └── YYYY-MM-DD_HH-mm/        # Folder output analisis
├── docs/                        # Dokumentasi Tugas & Data Storytelling
│   ├── tugas_dashboard_tableau_data_storytelling_livin_mandiri.md # Dokumen Tugas G.A.M.E.
│   ├── cara_pakai.md            # Panduan lengkap penggunaan
│   ├── naive_bayes.md           # Landasan teori matematika
│   ├── algoritma.md             # Arsitektur & alur algoritma
│   └── flowchart.md             # Diagram alir sistem
├── scrap-livin.js               # CLI Script Scraping Livin' by Mandiri
├── run-analisa.js               # CLI Script Analisis Sentimen
├── open-report.js               # CLI Script Buka Laporan
├── test-nlp.js                  # Unit Test NLP & ML
└── package.json
```

---

## 📖 Dokumentasi Lengkap
- [Dokumen Tugas Tableau & Data Storytelling Livin' by Mandiri](docs/tugas_dashboard_tableau_data_storytelling_livin_mandiri.md)
- [Panduan Cara Pakai](docs/cara_pakai.md)
- [Landasan Teori Naive Bayes](docs/naive_bayes.md)
- [Arsitektur Algoritma](docs/algoritma.md)
- [Diagram Alir Sistem (Flowchart)](docs/flowchart.md)
