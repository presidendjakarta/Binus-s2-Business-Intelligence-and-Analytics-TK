# Google Play Store Scraper & Mining Toolkit 🚀

Proyek ini menggunakan library [`google-play-scraper`](https://github.com/facundoolano/google-play-scraper) untuk mengambil data aplikasi dan ulasan (*reviews*) dari Google Play Store. Sangat cocok untuk keperluan tugas kuliah, riset, analisis sentimen (*sentiment analysis*), dan *data mining*.

---

## 📦 Persiapan & Instalasi

Project ini sudah terinstal dependensi `google-play-scraper` dan `csv-writer`. Jika ingin menginstal ulang dependensi di masa mendatang:

```bash
npm install
```

---

## 🛠️ Contoh Skrip yang Tersedia

Kami telah menyiapkan 4 skrip siap pakai:

### 1. 📱 Mengambil Detail / Metadata Aplikasi
Mengambil info lengkap seperti judul, deskripsi, developer, kategori, jumlah unduhan, dan rating.
```bash
npm run detail
# atau: node 1_detail_app.js
```
> **Tips:** Edit `appId` pada file [1_detail_app.js](file:///x:/laragon/kuliah/playstore-mining/1_detail_app.js) untuk mengganti aplikasi target.

---

### 2. 💬 Scraping Ulasan / Reviews (Export ke CSV & JSON)
Mengambil ratusan ulasan pengguna, menampilkan ringkasan rating, serta otomatis menyimpan ke file CSV dan JSON di folder `data/`.
```bash
npm run reviews
# atau: node 2_scrape_reviews.js
```
Hasil file ulasan tersimpan di:
- CSV: `data/<package_id>_reviews.csv` (Dapat langsung dibuka di Excel, SPSS, Python Pandas, RapidMiner)
- JSON: `data/<package_id>_reviews.json`

---

### 3. 🔍 Pencarian Aplikasi Berdasarkan Kata Kunci
Mencari aplikasi di Play Store untuk menemukan `Package ID` (contoh: mencari "e-wallet" atau "marketplace").
```bash
npm run search
# atau: node 3_search_apps.js
```

---

### 4. 🎮 Skrip Interaktif CLI (Sangat Mudah Digunakan)
Skrip interaktif yang meminta Anda memasukkan kata kunci / Package ID dan jumlah ulasan langsung di terminal:
```bash
npm run interactive
# atau: node 4_interactive_scraper.js
```

---

## 📚 Panduan Singkat Method `google-play-scraper`

Berikut fungsi-fungsi utama yang disediakan oleh library ini:

| Fungsi | Kegunaan | Contoh Parameter |
| :--- | :--- | :--- |
| `gplay.app({ appId })` | Mengambil detail metadata 1 aplikasi | `lang: 'id'`, `country: 'id'` |
| `gplay.reviews({ appId, num, sort })` | Mengambil ulasan pengguna | `sort: gplay.sort.NEWEST`, `paginate: true` |
| `gplay.search({ term, num })` | Mencari aplikasi berdasarkan kata kunci | `term: 'mobile banking'`, `num: 10` |
| `gplay.developer({ devId })` | Mengambil daftar aplikasi dari developer | `devId: 'Google LLC'` |
| `gplay.similar({ appId })` | Mengambil daftar aplikasi serupa | `appId: 'com.whatsapp'` |
| `gplay.permissions({ appId })` | Melihat hak akses / permission aplikasi | `lang: 'id'` |
| `gplay.datasafety({ appId })` | Melihat laporan keamanan data aplikasi | `lang: 'id'` |

### 5. 🤖 Machine Learning & Scraping Mobile JKN
```bash
# Scraping 5.000 ulasan Mobile JKN
npm run jkn

# Melatih Model Machine Learning (TF-IDF + Naive Bayes) & Evaluasi Confusion Matrix
npm run train

# Membuka Dashboard Visualisasi di Browser
npm run dashboard
```

---

## 📚 Dokumentasi Akademik & Riset (Folder `docs/`)

Dokumentasi lengkap untuk keperluan skripsi/tugas kuliah tersedia di folder [docs/](file:///x:/laragon/kuliah/playstore-mining/docs):
- 📐 **[docs/algoritma.md](file:///x:/laragon/kuliah/playstore-mining/docs/algoritma.md)**: Teori matematis, rumus TF-IDF, Naive Bayes, Laplace Smoothing, dan Confusion Matrix.
- 🔄 **[docs/flowchart.md](file:///x:/laragon/kuliah/playstore-mining/docs/flowchart.md)**: Diagram alir sistem (*Mermaid*) dari scraping, preprocessing, training, hingga dashboard.
- 🔬 **[docs/metodologi_penelitian.md](file:///x:/laragon/kuliah/playstore-mining/docs/metodologi_penelitian.md)**: Metodologi ilmiah CRISP-DM, sampling, dan anotasi ground truth.
- 📊 **[docs/analisis_dan_temuan.md](file:///x:/laragon/kuliah/playstore-mining/docs/analisis_dan_temuan.md)**: Pembahasan temuan riset, analisis komparasi, anomali, dan rekomendasi strategis.
- 📖 **[docs/kamus.md](file:///x:/laragon/kuliah/playstore-mining/docs/kamus.md)**: Kamus istilah lengkap + Cheat Sheet 7 pertanyaan favorit dosen penguji & cara menjawabnya.

---

## 📂 Struktur Folder Proyek

```text
playstore-mining/
├── docs/                       # Dokumentasi akademik lengkap (algoritma, flowchart, metodologi)
│   ├── README.md
│   ├── algoritma.md
│   ├── flowchart.md
│   ├── metodologi_penelitian.md
│   └── analisis_dan_temuan.md
├── data/                       # Dataset ulasan CSV, JSON, Ground Truth, dan ML Predictions
├── scrape_jkn.js               # Skrip scraping 5.000 ulasan Mobile JKN
├── train_ml_model.js           # Pipeline Supervised ML (TF-IDF + Naive Bayes)
├── ml_sentiment_pipeline.py    # Pipeline Python Scikit-Learn ekuivalen
├── dashboard.html              # Dashboard visualisasi interaktif
├── package.json
└── README.md
```
