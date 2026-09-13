# Panduan Penggunaan Sistem Text Mining Mobile JKN

Dokumen ini memandu langkah demi langkah cara mengoperasikan pipeline scraping, analisis sentimen, pengujian model, dan visualisasi dashboard laporan.

---

## 1. Prasyarat Sistem
* **Node.js:** Versi 18.0.0 atau lebih baru (direkomendasikan v20/v22).
* **NPM:** Paket dependensi terinstal (`google-play-scraper`, `ts-sastrawi`, `csv-writer`).
* **Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, atau browser modern lainnya.

---

## 2. Struktur Direktori Proyek

```
new-playstore-mining/
├── data/                       # Repositori data mentah hasil scraping
│   └── 2026-09-13_12-56/       # Folder data mentah berstempel waktu
│       ├── reviews.json        # 5.000 ulasan Play Store mentah (JSON)
│       ├── reviews.csv         # 5.000 ulasan Play Store mentah (CSV)
│       └── meta.json           # Metadata statistik scraping
├── master_data/                # Kamus leksikon & kamus NLP
│   ├── kbbi_wordlist.txt       # Daftar kosakata lema KBBI Wikidepia (105k lema)
│   ├── slang.csv               # Kamus normalisasi bahasa gaul/singkatan (860+ kata)
│   ├── emojis.csv              # Kamus translasi sentimen emoji (80+ emoji)
│   └── stopwords.csv           # Kamus penyaring kata tugas & kata sapaan (700+ kata)
├── src/                        # Kode sumber modular sistem
│   ├── ml/                     # Modul Machine Learning (Naive Bayes, TF-IDF, Evaluator)
│   ├── nlp/                    # Modul NLP (Preprocessor, Stemmer, CSV Loader)
│   ├── report/                 # Generator HTML Dashboard Eksekutif
│   └── scraper/                # Modul Scraper Google Play Store
├── report/                     # Direktori output laporan analisis
│   └── 2026-09-13_15-04/       # Folder laporan berstempel waktu
│       ├── dashboard.html      # Dashboard HTML interaktif mandiri (Standalone)
│       ├── predictions.json    # Hasil klasifikasi & probabilitas per ulasan
│       ├── predictions.csv     # Ekspor hasil prediksi dalam format spreadsheet
│       └── metrics.json        # Skor evaluasi model (Accuracy, F1, Confusion Matrix)
├── run-analisa.js              # Script utama eksekusi pipeline analitik
├── open-report.js              # Helper untuk membuka dashboard laporan terbaru di browser
├── test-nlp.js                 # Script unit test modular NLP & Machine Learning
└── scrap-jkn.js                # Script scraping ulasan terbaru dari Google Play Store
```

---

## 3. Langkah Operasional Utama

### Langkah 1: Scraping Data Ulasan Baru (Opsional)
Untuk mengambil data ulasan terbaru dari Google Play Store:
```powershell
node scrap-jkn.js data=5000
```
*Argumen `data=5000` menentukan target jumlah ulasan yang ingin diambil.*

---

### Langkah 2: Menjalankan Pipeline Analisis Sentimen & ML
Untuk memproses data ulasan, melatih model Naive Bayes, mengevaluasi akurasi, dan menghasilkan dashboard:
```powershell
node run-analisa.js
```

**Output Terminal:**
```text
================================================================
   PIPELINE ANALISIS SENTIMEN & EXECUTIVE BUSINESS INTELLIGENCE 
                 DATA MINING ULASAN MOBILE JKN                  
================================================================
[*] Membaca data dari: data\2026-09-13_12-56
[*] Total ulasan dimuat: 5.000 ulasan
----------------------------------------------------------------
[1/5] Memulai NLP Preprocessing (Slang, Emoji, Negasi, Stopwords, Sastrawi Stemmer)...
      [✓] NLP Selesai (0.1s) — 4.985 ulasan valid.
[2/5] Ekstraksi Fitur Bobot Kata dengan TF-IDF Vectorizer...
      [✓] Ukuran Kosakata Fitur (|V|): 1.440 kata unik.
[3/5] Melatih Model Multinomial Naive Bayes (Laplace Smoothing α=1.0)...
[4/5] Mengklasifikasi Sentimen, Aspek Operasional, & Tren Waktu...
[5/5] Melakukan Evaluasi Model (Confusion Matrix, Accuracy, Precision, Recall, F1)...
================================================================
                     HASIL ANALISIS SENTIMEN                    
================================================================
• Total Ulasan Dianalisis : 4.985
• Rata-rata Rating        : ★ 3.12 / 5.0
• Sentimen Positif        : 2.463 (49.4%)
• Sentimen Negatif        : 2.522 (50.6%)
• Net Sentiment Score     : -1.2%
----------------------------------------------------------------
• Akurasi Model (Cross-Val): 91.51%
• Macro F1-Score           : 91.51%
• Precision / Recall (Pos) : 95.50% / 88.29%
• Precision / Recall (Neg) : 87.62% / 95.22%
----------------------------------------------------------------
• Confusion Matrix         : TP=2353, FP=111, TN=2209, FN=312
================================================================
[✓] Laporan Dashboard Berhasil Dibuat!
    📁 File: report/2026-09-13_15-04/dashboard.html
```

---

### Langkah 3: Membuka Dashboard Laporan Interaktif
Buka dashboard secara otomatis di browser default:
```powershell
node open-report.js
```
Atau klik ganda langsung pada file `report/{timestamp}/dashboard.html`.

---

## 4. Fitur-Fitur Dashboard Eksekutif

1. **Top Navbar:** Informasi aplikasi, versi, tautan langsung ke halaman Google Play Store Mobile JKN, dan tombol dokumentasi metodologi.
2. **Stat Cards:** 4 kartu metrik utama (Total Ulasan, Rata-rata Rating Bintang, Proporsi Sentimen, dan Akurasi Model Naive Bayes).
3. **Kartu Modul Aspek Operasional:** Menampilkan volume & persentase keluhan pada 4 modul utama (*Autentikasi & Akun, Antrean & Faskes, Kinerja & Server, Iuran & Layanan*). **Dapat diklik** untuk memfilter tabel secara instan.
4. **Interactive Visualizations (Chart.js):**
   - Tren Volume Sentimen & Rating Bulanan.
   - Distribusi Sentimen per Rating Bintang (1 s.d. 5).
   - Top 15 Kata Kunci Sentimen Positif & Negatif.
5. **Eksplorasi Ulasan Pengguna (jQuery DataTables):**
   - **Filter Cepat:** Filter berdasarkan Sentimen, Rating Angka (1-5), Modul Aspek, dan Checkbox Khusus Anomali Mismatch.
   - **Pencarian Live (Live Search):** Mencari nama pengguna, teks ulasan, atau token kata kunci secara instan.
   - **Multi-Column Sorting:** Klik header kolom (#, Nama, Rating, Sentimen, Tanggal) untuk mengurutkan data (A-Z / 1-9).
   - **Export Buttons:** Ekspor tabel hasil filter ke format **CSV**, **Excel**, atau **Cetak Laporan (Print)**.
   - **Tautan Langsung Play Store (`↗`):** Membuka ulasan spesifik pengguna di Google Play Store pada tab baru (`target="_blank" rel="noopener noreferrer"`).
   - **Modal Rincian Ulasan:** Klik baris ulasan untuk melihat detail teks, probabilitas Softmax, dan analisis token.

---

## 5. Pengujian Unit NLP & ML
Untuk memverifikasi fungsi normalisasi slang, translasi emoji, multi-step negation, stemmer, dan klasifikasi:
```powershell
node test-nlp.js
```
