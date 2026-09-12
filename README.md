# Analisis Sentimen Ulasan Mobile JKN Menggunakan Supervised Machine Learning 🚀

Proyek penelitian **Data Mining & Natural Language Processing (NLP)** untuk menganalisis sentimen 5.000 ulasan pengguna aplikasi **Mobile JKN (BPJS Kesehatan)** di Google Play Store menggunakan pendekatan **Supervised Machine Learning (TF-IDF Vectorizer + Multinomial Naive Bayes)**.

---

## 🎯 Ringkasan Hasil Model Machine Learning

- **Dataset**: 5.000 Ulasan Google Play Store (`app.bpjs.mobile`)
- **Pembagian Data**: 80% Data Latih (4.000 ulasan) & 20% Data Uji (1.000 ulasan)
- **Akurasi Model (Accuracy)**: **88.00%**
- **Precision (Kelas Positif)**: **93.59%** (Recall: 88.95% | F1-Score: **91.21%**)
- **Recall (Kelas Negatif)**: **93.44%** (Precision: 82.44% | F1-Score: **87.59%**)
- **Vocabulary TF-IDF**: **5.587 fitur kata & bigram unik**

---

## 📦 Persiapan & Instalasi

Pastikan telah menginstal [Node.js](https://nodejs.org/) (versi 18+).

```bash
# Instal dependensi proyek
npm install
```

---

## 🚀 Perintah Utama (Main Workflow)

Tersedia 4 perintah utama untuk menjalankan seluruh pipeline:

```bash
# 1. Scraping 5.000 Ulasan Terbaru Mobile JKN dari Google Play Store
npm run scrape

# 2. Melatih Model ML (TF-IDF + Naive Bayes), Evaluasi Confusion Matrix & Prediksi
npm run train

# 3. Menjalankan Pipeline Analisis LLM (Ollama Gemma 3) & Studi Komparatif
npm run llm

# 4. Membuka Dashboard Visualisasi Grafik Interaktif & AI Benchmark di Browser
npm run dashboard
```

---

## 📚 Dokumentasi Akademik & Riset (Folder `docs/`)

Dokumentasi lengkap terstruktur untuk keperluan skripsi, tesis, dan laporan tugas kuliah tersedia di folder [docs/](file:///x:/laragon/kuliah/playstore-mining/docs):

1. 📖 **[docs/kamus.md](file:///x:/laragon/kuliah/playstore-mining/docs/kamus.md)**:
   - Kamus istilah teknis Data Mining, NLP, TF-IDF, dan Machine Learning dalam bahasa mudah dipahami.
   - **Cheat Sheet**: 7 pertanyaan favorit dosen penguji beserta template cara menjawabnya dengan percaya diri.
2. 📐 **[docs/algoritma.md](file:///x:/laragon/kuliah/playstore-mining/docs/algoritma.md)**:
   - Landasan teori matematis dan rumus lengkap: Preprocessing, TF-IDF, Laplace Smoothing ($\alpha=1$), Multinomial Naive Bayes, dan Confusion Matrix.
3. 🔄 **[docs/flowchart.md](file:///x:/laragon/kuliah/playstore-mining/docs/flowchart.md)**:
   - Diagram alir (*Flowchart Mermaid*) untuk seluruh alur sistem: scraping, preprocessing, training model ML, dan dashboard.
4. 🔬 **[docs/metodologi_penelitian.md](file:///x:/laragon/kuliah/playstore-mining/docs/metodologi_penelitian.md)**:
   - Kerangka kerja penelitian standar **CRISP-DM** (Bahan Bab 3 Skripsi).
5. 📊 **[docs/analisis_dan_temuan.md](file:///x:/laragon/kuliah/playstore-mining/docs/analisis_dan_temuan.md)**:
   - Hasil pembahasan riset, analisis bias rating bintang vs ML, temuan anomali, dan rekomendasi perbaikan untuk BPJS Kesehatan (Bahan Bab 4 Skripsi).

---

## 📂 Struktur Repositori

```text
playstore-mining/
├── docs/                                     # Dokumentasi akademik lengkap (Bab 3, Bab 4, Kamus, Flowchart)
│   ├── README.md
│   ├── kamus.md
│   ├── algoritma.md
│   ├── flowchart.md
│   ├── metodologi_penelitian.md
│   └── analisis_dan_temuan.md
├── data/                                     # Dataset penelitian
│   ├── master_ground_truth_5000.json         # Master Ground Truth teranotasi
│   ├── mobile_jkn_ml_predicted_5000.csv      # Hasil prediksi ML 5.000 data (CSV)
│   ├── mobile_jkn_ml_predicted_5000.json     # Hasil prediksi ML 5.000 data (JSON)
│   ├── mobile_jkn_reviews_5000.csv           # Dataset mentah 5.000 ulasan (CSV)
│   ├── mobile_jkn_reviews_5000.json          # Dataset mentah 5.000 ulasan (JSON)
│   └── mobile_jkn_reviews_5000.js            # Bundle data untuk visualisasi dashboard
├── scrape_jkn.js                             # Skrip data mining ulasan Google Play Store
├── train_ml_model.js                         # Pipeline Supervised ML (TF-IDF + Naive Bayes)
├── ml_sentiment_pipeline.py                  # Skrip Python ekuivalen (Scikit-Learn)
├── open_dashboard.js                         # Helper peluncur dashboard
├── dashboard.html                            # Dashboard visualisasi interaktif Chart.js
├── package.json
└── README.md
```
