# 📖 Panduan Penggunaan Lengkap (Cara Pakai)
## Proyek Business Intelligence & Sentiment Analytics: Mobile JKN (Multinomial Naive Bayes)

Dokumen ini berisi panduan langkah demi langkah (*step-by-step user manual*) untuk menginstalasi, mengonfigurasi, melatih model Naive Bayes, dan mengoperasikan Dashboard Analisis Sentimen & Deteksi Anomali.

---

## 📑 Daftar Isi
1. [Prasyarat Sistem (Prerequisites)](#1-prasyarat-sistem-prerequisites)
2. [Instalasi Proyek](#2-instalasi-proyek)
3. [Menjalankan Dashboard & Web Server](#3-menjalankan-dashboard--web-server)
4. [Menjalankan Pipeline Machine Learning (Naive Bayes)](#4-menjalankan-pipeline-machine-learning-naive-bayes)
5. [Scraping Data Ulasan Baru Google Play Store](#5-scraping-data-ulasan-baru-google-play-store)
6. [Fitur-Fitur Dashboard Analisis Sentimen](#6-fitur-fitur-dashboard-analisis-sentimen)
7. [Daftar Lengkap Perintah NPM (Cheat Sheet)](#7-daftar-lengkap-perintah-npm-cheat-sheet)
8. [Troubleshooting & Solusi Kendala](#8-troubleshooting--solusi-kendala)

---

## 1. Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan perangkat Anda memiliki:
* **Node.js**: Versi `18.0.0` atau yang lebih baru ([Unduh Node.js](https://nodejs.org/)).
* **NPM**: Bawaan dari instalasi Node.js.
* **Peramban Web (Browser)**: Google Chrome, Microsoft Edge, atau Mozilla Firefox.

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
2. Otomatis membuka peramban web pada [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html).

---

## 4. Menjalankan Pipeline Machine Learning (Naive Bayes)

Untuk melatih ulang model **Multinomial Naive Bayes + TF-IDF Vectorizer + Sastrawi Stemmer + Emoji Translation** pada seluruh 5.000 ulasan:

```bash
npm run train
```

### ⚙️ Apa yang Terjadi Saat Perintah Ini Dijalankan?
1. Membaca 5.000 data ulasan dari [`data/mobile_jkn_reviews_5000.json`](file:///x:/laragon/kuliah/playstore-mining/data/mobile_jkn_reviews_5000.json).
2. Menjalankan pemetaan emoji sentimen (`👍` $\rightarrow$ `emoji_jempol_bagus`, `🔪` $\rightarrow$ `emoji_bahaya_ancaman`), normalisasi kamus slang Indonesia, dan *morphological stemming* Sastrawi.
3. Melakukan *Train-Test Split* (80% Training: 4.000 data | 20% Testing: 1.000 data).
4. Mengekstraksi 5.537 fitur kosakata TF-IDF (Unigram + Bigram).
5. Melatih model Multinomial Naive Bayes dengan Laplace Smoothing ($\alpha=1.0$).
6. Mengevaluasi performa model pada data uji (**Akurasi 90.50% | F1-Score 61.11%**).
7. Menghitung probabilitas inferensi pada seluruh 5.000 ulasan dan mendeteksi anomali.
8. Menyimpan hasil prediksi ke file CSV, JSON, dan bundle dashboard JS.

---

## 5. Scraping Data Ulasan Baru Google Play Store

Untuk mengambil ulasan terbaru aplikasi Mobile JKN langsung dari Google Play Store:

```bash
npm run scrape
```
Data mentah akan tersimpan di `data/mobile_jkn_reviews_5000.json` dan `data/mobile_jkn_reviews_5000.csv`.

---

## 6. Fitur-Fitur Dashboard Analisis Sentimen

Dashboard (`dashboard.html`) dirancang dengan standar **Enterprise Business Intelligence** (gaya Power BI / Tableau):

1. **Executive KPI Scorecards**: Total ulasan teranalisis, akurasi model ML (90.50%), proporsi sentimen (Positif vs Negatif), dan jumlah anomali terdeteksi.
2. **Grafik Komparasi 3 Parameter**: Membandingkan distribusi sentimen antara Rating Play Store, Master Ground Truth, dan Prediksi Machine Learning.
3. **Confusion Matrix Interaktif**: Menampilkan metrik data uji 1.000 ulasan (True Positives, False Positives, Recall, Precision, dan F1-Score).
4. **Top 10 TF-IDF Issue Drivers**: Menampilkan kata kunci dan frasa pendorong ulasan positif (pujian) dan negatif (keluhan).
5. **Interactive DataTables (5.000 Ulasan)**:
   - Filter Sentimen ML (Semua, Positif, Negatif).
   - Filter Rating Bintang (⭐ 1 sampai ⭐ 5).
   - Filter Anomali (Hanya tampilkan taktik komplain bintang 5 atau pujian bintang 1).
   - Filter Skor Keyakinan Tinggi (Confidence $\ge 90\%$).
   - Fitur Pencarian Cepat (*Instant Search*).
   - Export CSV & Print PDF.

---

## 7. Daftar Lengkap Perintah NPM (Cheat Sheet)

| Perintah NPM | Fungsi Utama | File yang Dijalankan |
| :--- | :--- | :--- |
| `npm start` | Menjalankan server web & membuka Dashboard | `server.js` |
| `npm run train` | Melatih ulang model Machine Learning Naive Bayes | `scripts/train.js` |
| `npm run scrape` | Scraping 5.000 ulasan terbaru dari Google Play Store | `scripts/scrape.js` |
| `npm test` | Uji fungsionalitas modul NLP (Sastrawi + Tokenizer) | `scripts/test_nlp.js` |
| `npm run dashboard`| Membuka dashboard di browser bawaan | `scripts/open_dashboard.js` |

---

## 8. Troubleshooting & Solusi Kendala

### ❓ Kendala 1: Port 3000 Sudah Terpakai
**Pesan Error:** `Error: listen EADDRINUSE: address already in use :::3000`  
**Solusi:**
```bash
# Jalankan dengan port alternatif, misalnya port 3005:
PORT=3005 node server.js
```

### ❓ Kendala 2: Data di Dashboard Tidak Muncul
**Penyebab:** File `data/mobile_jkn_reviews_5000.js` belum terbentuk.  
**Solusi:** Jalankan perintah pelatihan model untuk membuat bundle data:
```bash
npm run train
```
