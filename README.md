# Analisis Sentimen Ulasan Mobile JKN Menggunakan Multinomial Naive Bayes 🚀
## Natural Language Processing & Anomaly Detection (5.000 Dataset Google Play Store)

Proyek penelitian **Data Mining & Natural Language Processing (NLP)** untuk menganalisis sentimen 5.000 ulasan pengguna aplikasi **Mobile JKN (BPJS Kesehatan)** di Google Play Store menggunakan algoritma **Multinomial Naive Bayes (MNB)** yang diintegrasikan dengan **TF-IDF (Term Frequency - Inverse Document Frequency)**, **Emoji-to-Token Semantic Translation**, dan **Sastrawi Morphological Stemmer**.

---

## 🎯 Ringkasan Fitur & Kemampuan Machine Learning

- **Multi-Project / Custom App Analyzer**: Mampu menganalisis ulasan aplikasi Google Play Store apa pun secara dinamis (Mobile JKN, PLN Mobile, BCA Mobile, Shopee, Tokopedia, Gojek, dll.) hanya dengan memasukkan URL / Package ID.
- **Multinomial Naive Bayes (Laplace Smoothing $\alpha=1.0$)**: Supervised NLP Machine Learning murni berkecepatan tinggi tanpa ketergantungan API pihak ketiga.
- **Sastrawi Indonesian Morphological Stemming**: Normalisasi kata berimbuhan bahasa Indonesia menjadi bentuk dasar kata.
- **Emoji-to-Token Semantic Translation**: Mengubah sentimen emoji (`👍`, `🔪`, `😡`, `⭐`) menjadi token kosakata terukur.
- **Deteksi Anomali Cerdas**: Mendeteksi taktik bintang 5 semu (sarkasme/komplain) & bintang 1 pujian tanpa *false positive* pada simbol/emoji.
- **Dynamic TF-IDF Driver Extraction**: Menampilkan Top 10 kata kunci positif dan negatif yang secara otomatis menyesuaikan dengan domain aplikasi yang dianalisis.
- **Interactive Executive BI Dashboard**: Tampilan visualisasi profesional (Power BI / Tableau style) dengan DataTables lengkap (Search, Filter Rating/Sentimen/Anomali, Export CSV & Print PDF).

---

## 📖 Panduan Penggunaan Lengkap (Cara Pakai)

👉 **[Buka Panduan Lengkap: docs/cara_pakai.md](file:///x:/laragon/kuliah/playstore-mining/docs/cara_pakai.md)**  
👉 **[Buka Panduan Teori & Sidang: docs/naive_bayes.md](file:///x:/laragon/kuliah/playstore-mining/docs/naive_bayes.md)**

---

## 🚀 Perintah Utama (Quick Start)

```bash
# 1. Menjalankan Server Web & Membuka Dashboard Naive Bayes
npm start
# -> Membuka http://localhost:3000/dashboard.html di browser Anda

# 2. Melatih Ulang Model Naive Bayes (Emoji + Sastrawi + TF-IDF + MNB)
npm run train

# 3. Mengambil Ulasan Terbaru dari Google Play Store (5.000 Ulasan)
npm run scrape

# 4. Menjalankan Uji Unit Modul NLP & Preprocessing
npm test
```

---

## 📚 Dokumentasi Akademik & Riset (Folder `docs/`)

Dokumentasi lengkap terstruktur untuk keperluan skripsi, tesis, dan laporan tugas kuliah tersedia di folder [docs/](file:///x:/laragon/kuliah/playstore-mining/docs):

1. 📐 **[docs/naive_bayes.md](file:///x:/laragon/kuliah/playstore-mining/docs/naive_bayes.md)**: **Rujukan Utama Naive Bayes**: Landasan matematis MNB, TF-IDF + L2, Laplace Smoothing ($\alpha=1$), simulasi perhitungan manual, penanganan emoji/simbol, dan 7 template jawaban sidang dosen penguji.
2. 📖 **[docs/cara_pakai.md](file:///x:/laragon/kuliah/playstore-mining/docs/cara_pakai.md)**: Panduan instalasi, eksekusi CLI, analisis aplikasi kustom (Multi-Project), mengoperasikan Dashboard interaktif, filter multi-kriteria, export CSV, dan REST API.
3. 🔬 **[docs/metodologi_penelitian.md](file:///x:/laragon/kuliah/playstore-mining/docs/metodologi_penelitian.md)**: **Bahan Bab 3**: Kerangka kerja ilmiah CRISP-DM, teknik sampling 5.000 ulasan, Ground Truth, Train-Test Split (80:20), dan arsitektur ML.
4. 📊 **[docs/analisis_dan_temuan.md](file:///x:/laragon/kuliah/playstore-mining/docs/analisis_dan_temuan.md)**: **Bahan Bab 4**: Pembahasan hasil riset 5.000 data, analisis anomali rating vs teks, Top 5 keluhan utama, dan rekomendasi strategis manajemen BPJS.
5. 📐 **[docs/algoritma.md](file:///x:/laragon/kuliah/playstore-mining/docs/algoritma.md)**: **Landasan Teori Matematis**: Rumus TF-IDF, Sastrawi Stemmer, Multinomial Naive Bayes, Laplace Smoothing ($\alpha=1$), dan Confusion Matrix.
6. 🔄 **[docs/flowchart.md](file:///x:/laragon/kuliah/playstore-mining/docs/flowchart.md)**: **Diagram Alir Visual**: 5 Diagram Flowchart Mermaid: Scraping, NLP Preprocessing, ML Training, Deteksi Anomali, dan Dashboard Evaluasi.
7. 📖 **[docs/kamus.md](file:///x:/laragon/kuliah/playstore-mining/docs/kamus.md)**: **Kamus Istilah & Cheat Sheet Sidang Dosen**: Glosarium bahasa manusiawi istilah teknis + template cara menjawab pertanyaan dosen penguji tanpa gugup.

---

## 📂 Struktur Arsitektur Modular

```text
playstore-mining/
├── src/                                      # Core Source Code Modular
│   ├── config/constants.js                   # Konfigurasi & path terpusat
│   ├── nlp/                                  # Emoji dictionary, Slang, Stopwords, Sastrawi stemmer, Preprocessor
│   ├── ml/                                   # TF-IDF vectorizer, Multinomial Naive Bayes, Evaluator, Trainer
│   ├── project/                              # Multi-Project Manager (Live Scraper + Pipeline + Persistence)
│   ├── scraper/                              # Google Play Store scraper engine
│   └── index.js                              # Unified export
├── scripts/                                  # CLI execution scripts
│   ├── train.js                              # npm run train
│   ├── scrape.js                             # npm run scrape
│   ├── test_nlp.js                           # npm test
│   └── open_dashboard.js                     # npm run dashboard
├── docs/                                     # Dokumentasi akademik & panduan (Bab 2, Bab 3, Bab 4, Kamus, Panduan)
├── data/                                     # Dataset & Multi-Project storage (data/projects/<id>/)
├── dashboard.html                            # Executive BI Dashboard Multinomial Naive Bayes (Multi-Project)
├── server.js                                 # Web Server & REST API (Zero Dependencies)
└── package.json                              # Project manifest & dependencies
```
