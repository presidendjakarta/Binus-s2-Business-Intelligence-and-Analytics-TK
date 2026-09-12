# 🔬 Metodologi Penelitian Data Mining & Hybrid AI

Dokumen ini menyajikan kerangka kerja metodologi ilmiah standar (*CRISP-DM / KDD Framework*) yang dapat langsung diadopsi ke dalam penyusunan **Bab 3 (Metodologi Penelitian) Skripsi / Tugas Akhir**.

---

## 📑 Daftar Isi
1. [Kerangka Kerja Penelitian (CRISP-DM)](#1-kerangka-kerja-penelitian-crisp-dm)
2. [Objek & Sumber Data Penelitian](#2-objek--sumber-data-penelitian)
3. [Teknik Pengumpulan Data (Scraping)](#3-teknik-pengumpulan-data-scraping)
4. [Teknik Anotasi & Pembuatan Ground Truth](#4-teknik-anotasi--pembuatan-ground-truth)
5. [Tahapan Pengolahan Data & Pemodelan Hybrid](#5-tahapan-pengolahan-data--pemodelan-hybrid)
6. [Instrumen & Lingkungan Pengembangan](#6-instrumen--lingkungan-pengembangan)

---

## 1. Kerangka Kerja Penelitian (CRISP-DM)

Penelitian ini mengadopsi standar **CRISP-DM (*Cross-Industry Standard Process for Data Mining*)** yang diperluas dengan paradigma **Hybrid Intelligence (Classical ML + Generative LLM)**:

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ 1. Business/Problem     │ ──> │ 2. Data Understanding   │
│    Understanding        │     │    (Scraping Play Store)│
└─────────────────────────┘     └────────────┬────────────┘
                                             │
                                             ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ 4. Dual-Engine Modeling │ <── │ 3. Data Preparation     │
│  - Multinomial NB (ML)  │     │    (NLP Preprocessing   │
│  - LLM Gemma 3 (GenAI)  │     │     & Ground Truth)     │
└────────────┬────────────┘     └─────────────────────────┘
             │
             ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ 5. Comparative          │ ──> │ 6. Deployment           │
│    Evaluation           │     │    (Dual Executive      │
│    (Accuracy & Metrics) │     │     BI Dashboards)      │
└─────────────────────────┘     └─────────────────────────┘
```

1. **Business/Problem Understanding**:
   - Menganalisis fenomena ketidaksesuaian (*inconsistency*) antara rating bintang dan isi teks ulasan pengguna aplikasi Mobile JKN (BPJS Kesehatan).
   - Menjawab pertanyaan riset: *Bagaimana akurasi komparatif antara Supervised Machine Learning (Multinomial Naive Bayes) dan Generative Large Language Model (Gemma 3) dalam memetakan kepuasan masyarakat?*
2. **Data Understanding**:
   - Pengumpulan dataset ulasan aktual dari Google Play Store sebanyak 5.000 ulasan.
3. **Data Preparation**:
   - Pembersihan teks (*Case folding, regex cleansing, character reduction, tokenization, slang normalization, selective stopword removal, negation preservation*).
   - Pembentukan Master Ground Truth dataset teranotasi.
4. **Dual-Engine Modeling**:
   - **Engine 1**: Pembagian data 80:20 (*Train-Test Split*), ekstraksi fitur TF-IDF (5.574 vocabulary), dan pelatihan Multinomial Naive Bayes dengan Laplace Smoothing ($\alpha=1$).
   - **Engine 2**: Zero-Shot Schema-Constrained Prompting menggunakan LLM lokal Google Gemma 3 (3.3 GB) via Ollama API.
5. **Comparative Evaluation**:
   - Pengujian Confusion Matrix pada data uji 1.000 ulasan (Naive Bayes).
   - Evaluasi akurasi komparatif, tingkat kesepakatan (*model agreement*), serta analisis kualitatif kasus perbedaan pendapat (*disagreement cases*).
6. **Deployment**:
   - Pembuatan 2 Dashboard Interaktif:
     - `dashboard.html` (Executive Machine Learning Dashboard)
     - `dashboard_llm.html` (Generative AI & LLM Intelligence Hub dengan Live Ollama Tester)

---

## 2. Objek & Sumber Data Penelitian

- **Nama Aplikasi**: Mobile JKN
- **Developer**: BPJS Kesehatan
- **Package ID**: `app.bpjs.mobile`
- **Sumber Data**: Google Play Store Indonesia (`lang: 'id', country: 'id'`)
- **Total Populasi Sampel**: 5.000 Ulasan Pengguna
- **Rentang Periode Ulasan**: 05 Agustus 2026 s/d 11 September 2026

---

## 3. Teknik Pengumpulan Data (Scraping)

Pengambilan data dilakukan menggunakan automated API scraper berbasis Node.js (`google-play-scraper`) dengan spesifikasi:
- **Metode Sortir**: `gplay.sort.NEWEST` (Ulasan terbaru secara kronologis).
- **Pagination Control**: Menggunakan token rekursif (*nextPaginationToken*) dengan batch 150 ulasan per request hingga mencapai kuota 5.000 ulasan.
- **Rate-Limiting Protection**: Jeda interval 300 ms per request untuk menjaga stabilitas koneksi.

---

## 4. Teknik Anotasi & Pembuatan Ground Truth

Untuk menghindari bias rating bintang (seperti taktik *"Bintang 5 biar dibaca"* atau salah klik), dibangun **Master Ground Truth Dataset**:
1. **Kelas Sentimen**:
   - `Positif`: Ulasan berisi apresiasi, kepuasan, kemudahan antrean faskes, atau fungsi aplikasi yang berjalan baik.
   - `Negatif`: Ulasan berisi keluhan pendaftaran, kegagalan OTP, antrean penuh, bug server, atau kritik tajam.
   - `Netral`: Ulasan tanpa muatan emosional khusus atau pernyataan umum singkat.
2. **Kaidah Khusus Anotasi**:
   - Frasa taktik (*"bintang 5 biar dibaca"*) wajib dianotasi sebagai `Negatif`.
   - Frasa sarkasme (*"terima kasih mengajarkan kesabaran"*) wajib dianotasi sebagai `Negatif`.
   - Keluhan layanan tersirat (*"jadwal dokter spesialis penuh berhari-hari"*) wajib dianotasi sebagai `Negatif`.

---

## 5. Tahapan Pengolahan Data & Pemodelan Hybrid

### A. Pembagian Data Machine Learning (Train-Test Split)
Dataset 5.000 ulasan dibagi secara acak terdistribusi (*stratified*):
- **Data Latih (Training Set)**: 80% (4.000 ulasan) — Digunakan untuk pembobotan TF-IDF dan parameter probabilitas Naive Bayes.
- **Data Uji (Testing Set)**: 20% (1.000 ulasan) — Digunakan untuk validasi Confusion Matrix (*unseen data*).

### B. Konfigurasi Inferensi LLM Gemma 3 (Ollama)
- **Model**: `gemma3:latest` (Parameter 3.3 GB)
- **Host Endpoint**: `http://localhost:11434`
- **Metode**: Zero-Shot Structured JSON Formatting
- **Parameter Hyperparameter**: Temperature $T = 0.1$, Top-P = $0.9$.
- **Format Output**: `{"sentiment", "category", "reason", "confidence"}`

---

## 6. Instrumen & Lingkungan Pengembangan

- **Sistem Operasi**: Windows 11 (GPU Accelerated)
- **Runtime & Bahasa**: Node.js (v22.22.0) & Python (v3.13.0)
- **Inference Engine LLM**: Ollama v0.5+ (Running `gemma3:latest` di Local GPU)
- **Library Utama**:
  - `google-play-scraper` (Data Mining Play Store)
  - `csv-writer` & `fs/promises` (Manipulasi File Dataset)
  - `Bootstrap 5`, `jQuery 3.7`, `DataTables 2.0`, `Chart.js` (Visualisasi Dashboard)
  - `Scikit-Learn`, `Pandas`, `NumPy` (Skrip Python Ekuivalen)
