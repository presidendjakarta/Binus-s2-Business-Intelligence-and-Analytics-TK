# Mobile JKN Sentiment Analytics — Multinomial Naive Bayes

Aplikasi Data Mining dan Analisis Sentimen Ulasan **Mobile JKN (BPJS Kesehatan)** dari Google Play Store menggunakan **Sastrawi Stemmer**, **TF-IDF Vectorizer**, dan **Multinomial Naive Bayes Classifier**.

---

## 🚀 Fitur Utama

1. **Scraper Play Store Cepat:** Mengambil ribuan ulasan Mobile JKN langsung dari Play Store beserta rating, tanggal, dan nama pengguna.
2. **Master Data Berbasis CSV:** Kamus bahasa gaul (*slang*), terjemahan emoji, dan *stopwords* disimpan dalam file `.csv` yang dapat dibuka dan diedit di **Microsoft Excel**.
3. **Pipeline NLP Lengkap:**
   - Case folding & sanitasi teks
   - Translasi emoji ke makna sentimen bahasa Indonesia
   - Normalisasi bahasa gaul & singkatan
   - Penanganan frasa negasi (*misal: tidak bisa -> tidak_bisa*)
   - Penghapusan stopwords
   - Stemming kata dasar bahasa Indonesia berbasis **ts-sastrawi**
4. **TF-IDF & Multinomial Naive Bayes:** Pembobotan teks *sublinear* dengan *Laplace Smoothing* ($\alpha=1.0$) dan probabilitas posterior *Softmax*.
5. **Evaluasi 5-Fold Cross Validation:** Menghasilkan Akurasi, Precision, Recall, Macro F1, dan Confusion Matrix lengkap.
6. **Executive BI Dashboard Mandiri (`dashboard.html`):** Visualisasi interaktif mandiri (Chart.js & DataTables) tanpa perlu server lokal.

---

## 🛠️ Cara Penggunaan Singkat

### 1. Ambil Data Ulasan Play Store
```bash
node scrap-jkn.js data=5000
```
*Output tersimpan di: `data/YYYY-MM-DD_HH-mm/`*

### 2. Jalankan Analisis Sentimen
```bash
node run-analisa.js
```
*Atau pilih folder spesifik:*
```bash
node run-analisa.js folder=data/2026-09-12_17-30
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
new-playstore-mining/
├── master_data/                 # Master Data Kamus NLP (CSV)
│   ├── slang.csv                # Kamus bahasa gaul & singkatan
│   ├── emojis.csv               # Kamus translasi emoji
│   └── stopwords.csv            # Kamus kata stopword
├── src/
│   ├── nlp/                     # Modul NLP & Preprocessing
│   ├── ml/                      # TF-IDF, Naive Bayes, & Evaluator
│   ├── scraper/                 # Scraper Google Play Store
│   ├── report/                  # Generator Dashboard HTML
│   └── utils/                   # Helper & Utilities
├── data/                        # Penyimpanan Dataset Mentah
│   └── YYYY-MM-DD_HH-mm/        # Folder batch data ulasan
├── report/                      # Penyimpanan Laporan & Dashboard
│   └── YYYY-MM-DD_HH-mm/        # Folder output analisis
├── docs/                        # Dokumentasi Akademik & Teori
│   ├── cara_pakai.md            # Panduan lengkap penggunaan
│   ├── naive_bayes.md           # Landasan teori matematika
│   ├── algoritma.md             # Arsitektur & alur algoritma
│   └── flowchart.md             # Diagram alir sistem
├── scrap-jkn.js                 # CLI Script Scraping
├── run-analisa.js               # CLI Script Analisis
├── open-report.js               # CLI Script Buka Laporan
├── test-nlp.js                  # Unit Test NLP & ML
└── package.json
```

---

## 📖 Dokumentasi Lengkap
- [Panduan Cara Pakai](docs/cara_pakai.md)
- [Landasan Teori Naive Bayes](docs/naive_bayes.md)
- [Arsitektur Algoritma](docs/algoritma.md)
- [Diagram Alir Sistem (Flowchart)](docs/flowchart.md)
