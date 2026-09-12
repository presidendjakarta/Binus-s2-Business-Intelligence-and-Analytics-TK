# 📖 Panduan Penggunaan Lengkap (Cara Pakai)
## Proyek Business Intelligence & Sentiment Intelligence: Mobile JKN (BPJS Kesehatan)

Dokumen ini berisi panduan langkah demi langkah (*step-by-step user manual*) untuk menginstalasi, mengonfigurasi, melatih model, menjalankan inferensi LLM, dan mengoperasikan kedua dashboard interaktif.

---

## 📑 Daftar Isi
1. [Prasyarat Sistem (Prerequisites)](#1-prasyarat-sistem-prerequisites)
2. [Instalasi Proyek](#2-instalasi-proyek)
3. [Menjalankan Dashboard & Web Server](#3-menjalankan-dashboard--web-server)
4. [Menjalankan Pipeline Machine Learning](#4-menjalankan-pipeline-machine-learning)
5. [Menjalankan Pipeline Generative AI (LLM Gemma 3)](#5-menjalankan-pipeline-generative-ai-llm-gemma-3)
6. [Scraping Data Ulasan Baru Play Store](#6-scraping-data-ulasan-baru-play-store)
7. [Panduan Menggunakan Live AI Playground](#7-panduan-menggunakan-live-ai-playground)
8. [Daftar Lengkap Perintah NPM (Cheat Sheet)](#8-daftar-lengkap-perintah-npm-cheat-sheet)
9. [Troubleshooting & Solusi Kendala](#9-troubleshooting--solusi-kendala)

---

## 1. Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan perangkat Anda memiliki:
* **Node.js**: Versi `18.0.0` atau yang lebih baru ([Unduh Node.js](https://nodejs.org/)).
* **NPM**: Bawaan dari instalasi Node.js.
* **Peramban Web (Browser)**: Google Chrome, Microsoft Edge, atau Mozilla Firefox.
* **Ollama & Model Gemma 3** *(Opsional, hanya untuk fitur Live AI LLM Lokal)*:
  - Unduh Ollama dari [ollama.com](https://ollama.com/).
  - Jalankan di terminal: `ollama run gemma3:latest` (atau `gemma3:4b`).

---

## 2. Instalasi Proyek

Buka terminal (PowerShell / Command Prompt / Terminal VSCode) pada direktori proyek:

```bash
# 1. Pindah ke folder proyek
cd x:/laragon/kuliah/playstore-mining

# 2. Pasang semua dependensi modul (Natural NLP, ts-sastrawi, Google Scraper, dll.)
npm install
```

Verifikasi instalasi modul NLP dengan menjalankan tes otomatis:
```bash
npm test
```
> **Output yang Diharapkan:** Pesan hijau `✅ Natural Library Loaded: true` dan `✅ Sastrawi Stemmer Loaded: true`.

---

## 3. Menjalankan Dashboard & Web Server

### 🚀 Cara Cepat (Rekomendasi Utama)

Jalankan perintah server utama:
```bash
npm start
```
Perintah ini akan:
1. Menjalankan web server lokal pada port `3000` (`http://localhost:3000`).
2. Mengaktifkan **Built-in CORS Reverse Proxy** untuk menghubungkan browser langsung ke Ollama AI secara aman.
3. Otomatis membuka peramban web pada dashboard utama.

---

### 🌐 Tautan Dashboard yang Tersedia:

| Dashboard | URL Akses | Fitur Utama |
| :--- | :--- | :--- |
| **🤖 Dedicated LLM Gemma 3 Dashboard** | [http://localhost:3000/dashboard_llm.html](http://localhost:3000/dashboard_llm.html) | Live AI Playground (Uji Real-time), 5.000 ulasan ber-reasoning AI, Breakdown 5 Kategori Isu, Filter Beda Pendapat ML vs LLM. |
| **📊 Supervised Machine Learning Dashboard** | [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html) | Metrik Akurasi 90.4%, Confusion Matrix, Precision/Recall, Deteksi Anomali Bintang 5 Taktik Komplain, Visualisasi Grafik Chart.js. |

---

## 4. Menjalankan Pipeline Machine Learning

Untuk melatih ulang model **Multinomial Naive Bayes + TF-IDF Vectorizer + Sastrawi Stemmer** pada seluruh 5.000 ulasan:

```bash
npm run train
```

### ⚙️ Apa yang Terjadi Saat Perintah Ini Dijalankan?
1. Membaca 5.000 data ulasan dari [`data/mobile_jkn_reviews_5000.json`](file:///x:/laragon/kuliah/playstore-mining/data/mobile_jkn_reviews_5000.json).
2. Menjalankan pembersihan teks, normalisasi kamus slang Indonesia, dan *morphological stemming* Sastrawi.
3. Melakukan *Train-Test Split* (80% Training: 4.000 data | 20% Testing: 1.000 data).
4. Mengekstraksi 5.495 fitur kosakata TF-IDF (Unigram + Bigram).
5. Melatih model Naive Bayes dan mencetak **Laporan Evaluasi Confusion Matrix**.
6. Menyimpan hasil prediksi ke file CSV, JSON, dan bundle dashboard JS.

---

## 5. Menjalankan Pipeline Generative AI (LLM Gemma 3)

Pipeline LLM digunakan untuk mengevaluasi kecerdasan *Natural Language Understanding* dari model lokal **Gemma 3** via Ollama.

### 🧪 Opsi 1: Menjalankan Sampel Cepat (Default: 100 Ulasan)
```bash
npm run llm
```

### 🎯 Opsi 2: Menentukan Jumlah Sampel Ulasan Tertentu
```bash
# Menguji 50 ulasan pertama
node scripts/run_llm.js --sample 50

# Menguji 250 ulasan pertama
node scripts/run_llm.js --sample 250
```

### ⚡ Opsi 3: Menjalankan Analisis Penuh pada Seluruh 5.000 Data
```bash
node scripts/run_llm.js --all
```

> **Catatan:** Inferensi 5.000 ulasan menggunakan Ollama lokal memerlukan waktu beberapa menit bergantung pada spesifikasi GPU/CPU perangkat Anda. Sistem dilengkapi dengan **Smart Caching** sehingga ulasan yang sudah pernah dianalisis tidak akan diproses ulang.

---

## 6. Scraping Data Ulasan Baru Play Store

Jika Anda ingin memperbarui dataset dengan ulasan terkini dari Google Play Store:

```bash
npm run scrape
```

* **Target Default:** Mengambil 5.000 ulasan terbaru aplikasi Mobile JKN (`app.bpjs.mobile`).
* **Fitur Scraper:** Dilengkapi otomatisasi paginasi (*token pagination*), deduplikasi ID ulasan, dan penyimpanan langsung ke format `.json` dan `.csv`.

---

## 7. Panduan Menggunakan Live AI Playground

Fitur **Live AI Playground** terdapat pada bagian atas [Dashboard LLM](http://localhost:3000/dashboard_llm.html):

1. Buka [http://localhost:3000/dashboard_llm.html](http://localhost:3000/dashboard_llm.html).
2. Pada kotak input teks, ketik kalimat ulasan sembarang (bisa menggunakan bahasa gaul, sarkasme, singkatan, atau komplain tersembunyi).
   * *Contoh 1 (Sarkasme):* `"Bagus banget aplikasinya bintang lima, sampai-sampai mau login aja mental terus mantap!"` (Rating: ⭐ 5)
   * *Contoh 2 (Keluhan Negasi):* `"Susah buat daftar seperti tidak ada perbaikan sama sekali"` (Rating: ⭐ 3)
   * *Contoh 3 (Pujian Singkat):* `"Aplikasi mantap dan mempermudah antrean faskes"` (Rating: ⭐ 5)
3. Pilih **Rating Bintang (1–5)**.
4. Klik tombol ungu **"⚡ Analisis dengan Gemma 3"** (atau klik tombol **"🎲 Coba Contoh Sarkasme"**).
5. Dalam ~1 detik, AI Gemma 3 akan mengembalikan:
   - **Label Sentimen:** `Positif` atau `Negatif`
   - **Kategori Isu:** `Masalah Teknis & Bug`, `Layanan Faskes & Antrean`, `Fitur & UI/UX`, `Administrasi & Iuran`, atau `Apresiasi & Kepuasan`
   - **Alasan Penalaran AI (Reasoning):** Penjelasan cerdas mengapa sentimen tersebut dipilih.
   - **Skor Keyakinan (Confidence) & Waktu Inferensi (Latency).**

---

## 8. Daftar Lengkap Perintah NPM (Cheat Sheet)

| Perintah NPM | Fungsi / Deskripsi | File Script Utama |
| :--- | :--- | :--- |
| `npm start` | Menjalankan server web lokal (port 3000) & proxy bebas CORS | [`server.js`](file:///x:/laragon/kuliah/playstore-mining/server.js) |
| `npm run train` | Melatih ulang model Machine Learning (TF-IDF + Naive Bayes) | [`scripts/train.js`](file:///x:/laragon/kuliah/playstore-mining/scripts/train.js) |
| `npm run llm` | Menjalankan pipeline inferensi LLM Gemma 3 via Ollama | [`scripts/run_llm.js`](file:///x:/laragon/kuliah/playstore-mining/scripts/run_llm.js) |
| `npm run scrape` | Mengambil data ulasan baru dari Google Play Store | [`scripts/scrape.js`](file:///x:/laragon/kuliah/playstore-mining/scripts/scrape.js) |
| `npm test` | Menjalankan uji unit library NLP Sastrawi & Natural | [`scripts/test_nlp.js`](file:///x:/laragon/kuliah/playstore-mining/scripts/test_nlp.js) |
| `npm run dashboard` | Membuka Dashboard Supervised Machine Learning | [`scripts/open_dashboard.js`](file:///x:/laragon/kuliah/playstore-mining/scripts/open_dashboard.js) |
| `npm run dashboard:llm` | Membuka Dashboard Generative AI LLM Gemma 3 | [`scripts/open_dashboard_llm.js`](file:///x:/laragon/kuliah/playstore-mining/scripts/open_dashboard_llm.js) |

---

## 9. Troubleshooting & Solusi Kendala

### ❓ Masalah 1: `Port 3000 already in use (EADDRINUSE)`
* **Penyebab:** Server web `server.js` sudah berjalan di latar belakang (*background task*).
* **Solusi:** Anda tidak perlu menjalankannya lagi. Cukup buka browser dan akses langsung ke [http://localhost:3000/dashboard_llm.html](http://localhost:3000/dashboard_llm.html).

---

### ❓ Masalah 2: Live AI Playground berstatus "Offline" / Indikator Merah
* **Penyebab:** Aplikasi Ollama belum aktif di komputer Anda.
* **Solusi:**
  1. Buka terminal baru dan ketik: `ollama serve` atau `ollama run gemma3:latest`.
  2. Pastikan endpoint [http://localhost:11434](http://localhost:11434) dapat diakses.
  3. Refresh dashboard browser Anda. Indikator akan berubah menjadi hijau **"Online (Ollama Active)"**.

---

### ❓ Masalah 3: Ingin Mengganti Model LLM (misal ke Llama 3 atau Mistral)
* **Solusi:** Buka file konfigurasi [`src/config/constants.js`](file:///x:/laragon/kuliah/playstore-mining/src/config/constants.js) dan ubah baris:
  ```javascript
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'gemma3:latest',
  ```
  Ganti dengan nama model yang telah Anda unduh di Ollama (misalnya `'llama3:latest'` atau `'qwen2.5:latest'`).

---

### 📚 Dokumentasi Terkait Lainnya:
* 📖 [Kamus & Istilah Data Mining / NLP (`docs/kamus.md`)](file:///x:/laragon/kuliah/playstore-mining/docs/kamus.md)
* 📐 [Landasan Rumus & Teori Matematis (`docs/algoritma.md`)](file:///x:/laragon/kuliah/playstore-mining/docs/algoritma.md)
* 🔄 [Flowchart Alur Sistem (`docs/flowchart.md`)](file:///x:/laragon/kuliah/playstore-mining/docs/flowchart.md)
* 🔬 [Metodologi Penelitian CRISP-DM (`docs/metodologi_penelitian.md`)](file:///x:/laragon/kuliah/playstore-mining/docs/metodologi_penelitian.md)
* 📊 [Analisis Hasil & Temuan Penelitian (`docs/analisis_dan_temuan.md`)](file:///x:/laragon/kuliah/playstore-mining/docs/analisis_dan_temuan.md)
