# Analisis Sentimen Ulasan Mobile JKN Menggunakan Hybrid AI & NLP 🚀

Proyek penelitian **Data Mining & Natural Language Processing (NLP)** untuk menganalisis sentimen 5.000 ulasan pengguna aplikasi **Mobile JKN (BPJS Kesehatan)** di Google Play Store menggunakan pendekatan **Hybrid AI (Supervised Machine Learning + Large Language Model Gemma 3)**.

---

## 🎯 Ringkasan Hasil Model Machine Learning (Sastrawi + Naive Bayes)

- **Dataset**: 5.000 Ulasan Google Play Store (`app.bpjs.mobile`)
- **Pembagian Data**: 80% Data Latih (4.000 ulasan) & 20% Data Uji (1.000 ulasan)
- **Akurasi Model (Accuracy)**: **90.40%** 🎯
- **Precision (Kelas Positif)**: **94.08%** (Recall: 92.50% | F1-Score: **93.28%**)
- **Recall (Kelas Negatif)**: **93.62%** (Precision: 86.34% | F1-Score: **89.84%**)
- **TF-IDF Vocabulary**: **5.495 fitur kata & bigram unik (dengan Stemming Sastrawi)**

---

## 📖 Panduan Penggunaan Lengkap (Cara Pakai)

👉 **[Buka Panduan Lengkap: docs/cara_pakai.md](file:///x:/laragon/kuliah/playstore-mining/docs/cara_pakai.md)**

---

## 🚀 Perintah Utama (Quick Start)

```bash
# 1. Menjalankan Server Web & Live AI Dashboard (Rekomendasi Utama)
npm start
# -> Membuka http://localhost:3000/dashboard_llm.html & mengaktifkan Proxy AI bebas CORS

# 2. Melatih Ulang Model ML (Sastrawi + TF-IDF + Naive Bayes)
npm run train

# 3. Menjalankan Pipeline Analisis LLM (Ollama Gemma 3) & Studi Komparatif
npm run llm

# 4. Mengambil Ulasan Terbaru dari Google Play Store (5.000 Ulasan)
npm run scrape

# 5. Menjalankan Uji Unit Modul NLP
npm test
```

---

## 📚 Dokumentasi Akademik & Riset (Folder `docs/`)

Dokumentasi lengkap terstruktur untuk keperluan skripsi, tesis, dan laporan tugas kuliah tersedia di folder [docs/](file:///x:/laragon/kuliah/playstore-mining/docs):

1. 📖 **[docs/cara_pakai.md](file:///x:/laragon/kuliah/playstore-mining/docs/cara_pakai.md)**: Panduan langkah demi langkah cara instalasi, eksekusi CLI, mengoperasikan Live AI Playground, dan troubleshooting.
2. 🔬 **[docs/metodologi_penelitian.md](file:///x:/laragon/kuliah/playstore-mining/docs/metodologi_penelitian.md)**: **Bahan Bab 3**: Kerangka kerja ilmiah CRISP-DM, teknik sampling 5.000 ulasan, Ground Truth, Train-Test Split (80:20), dan arsitektur Hybrid AI.
3. 📊 **[docs/analisis_dan_temuan.md](file:///x:/laragon/kuliah/playstore-mining/docs/analisis_dan_temuan.md)**: **Bahan Bab 4**: Pembahasan hasil riset 5.000 data, studi komparatif Naive Bayes vs Gemma 3, analisis anomali ulasan, Top 5 keluhan, dan rekomendasi strategis BPJS.
4. 📐 **[docs/algoritma.md](file:///x:/laragon/kuliah/playstore-mining/docs/algoritma.md)**: **Landasan Teori Matematis**: Rumus TF-IDF, Sastrawi Stemmer, Multinomial Naive Bayes, Laplace Smoothing ($\alpha=1$), Confusion Matrix, dan LLM Structured JSON.
5. 🔄 **[docs/flowchart.md](file:///x:/laragon/kuliah/playstore-mining/docs/flowchart.md)**: **Diagram Alir Visual**: 6 Diagram Flowchart Mermaid untuk seluruh alur: Scraping, NLP Preprocessing, ML Training, Deteksi Anomali, dan Pipeline LLM.
6. 📖 **[docs/kamus.md](file:///x:/laragon/kuliah/playstore-mining/docs/kamus.md)**: **Kamus Istilah & Cheat Sheet Sidang Dosen**: Glosarium bahasa manusiawi istilah teknis + 8 template cara menjawab pertanyaan dosen penguji tanpa gugup.

---

## 📂 Struktur Arsitektur Modular

```text
playstore-mining/
├── src/                                      # Core Source Code Modular
│   ├── config/constants.js                   # Konfigurasi & path terpusat
│   ├── nlp/                                  # Slang dictionary, stopwords, Sastrawi stemmer, preprocessor
│   ├── ml/                                   # TF-IDF vectorizer, Naive Bayes, evaluator, trainer
│   ├── llm/                                  # Ollama client, prompt templates, LLM batch pipeline
│   ├── scraper/                              # Play Store scraper engine
│   └── index.js                              # Unified export
├── scripts/                                  # CLI execution scripts
│   ├── train.js                              # npm run train
│   ├── run_llm.js                            # npm run llm
│   ├── scrape.js                             # npm run scrape
│   ├── test_nlp.js                           # npm test
│   ├── open_dashboard.js                     # npm run dashboard
│   └── open_dashboard_llm.js                 # npm run dashboard:llm
├── docs/                                     # Dokumentasi akademik & panduan (Bab 3, Bab 4, Kamus, Panduan)
├── data/                                     # Dataset 5.000 ulasan & hasil komparasi
├── dashboard.html                            # Dashboard Supervised ML
├── dashboard_llm.html                        # Dashboard Dedicated Generative AI LLM
├── server.js                                 # Web Server & Proxy CORS
└── package.json                              # Project manifest & dependencies
```
