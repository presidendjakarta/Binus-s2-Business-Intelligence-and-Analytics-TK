# 🔬 Metodologi Penelitian Data Mining & NLP

Dokumen ini menyajikan kerangka kerja metodologi ilmiah standar (*CRISP-DM / KDD Framework*) yang dapat langsung diadopsi ke dalam penyusunan **Bab 3 (Metodologi Penelitian) Skripsi / Tugas Akhir**.

---

## 📑 Daftar Isi
1. [Kerangka Kerja Penelitian (CRISP-DM)](#1-kerangka-kerja-penelitian-crisp-dm)
2. [Objek & Sumber Data Penelitian](#2-objek--sumber-data-penelitian)
3. [Teknik Pengumpulan Data (Scraping)](#3-teknik-pengumpulan-data-scraping)
4. [Teknik Anotasi & Pembuatan Ground Truth](#4-teknik-anotasi--pembuatan-ground-truth)
5. [Tahapan Pengolahan Data & Pemodelan](#5-tahapan-pengolahan-data--pemodelan)
6. [Instrumen & Lingkungan Pengembangan](#6-instrumen--lingkungan-pengembangan)

---

## 1. Kerangka Kerja Penelitian (CRISP-DM)

Penelitian ini mengadopsi standar **CRISP-DM (*Cross-Industry Standard Process for Data Mining*)**:

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ 1. Business/Problem     │ ──> │ 2. Data Understanding   │
│    Understanding        │     │    (Scraping Play Store)│
└─────────────────────────┘     └────────────┬────────────┘
                                             │
                                             ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ 4. Modeling (TF-IDF &   │ <── │ 3. Data Preparation     │
│    Multinomial NB)      │     │    (NLP Preprocessing)  │
└────────────┬────────────┘     └─────────────────────────┘
             │
             ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ 5. Evaluation           │ ──> │ 6. Deployment           │
│    (Confusion Matrix)   │     │    (Interactive Web App)│
└─────────────────────────┘     └─────────────────────────┘
```

1. **Business/Problem Understanding**:
   - Menganalisis fenomena ketidaksesuaian (*inconsistency*) antara rating bintang dan teks ulasan pengguna aplikasi Mobile JKN (BPJS Kesehatan).
   - Menjawab pertanyaan riset: *Apakah rating bintang Play Store cukup valid sebagai tolok ukur sentimen tanpa analisis NLP?*
2. **Data Understanding**:
   - Pengumpulan dataset ulasan aktual dari Google Play Store sebanyak 5.000 ulasan.
3. **Data Preparation**:
   - Tahap pembersihan (*Case folding, cleansing, slang normalization, stopword filtering, unigram + bigram*).
   - Pembuatan Master Ground Truth dataset teranotasi.
4. **Modeling**:
   - Pembagian data 80:20 (*Train-Test Split*).
   - Ekstraksi fitur statistik TF-IDF dan pelatihan model Multinomial Naive Bayes.
5. **Evaluation**:
   - Menguji performa model dengan *Confusion Matrix, Accuracy, Precision, Recall, dan F1-Score*.
6. **Deployment**:
   - Pembuatan Dashboard Visualisasi Web interaktif (`dashboard.html`).

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

Pengambilan data dilakukan menggunakan protokol automated API scraper berbasis Node.js (`google-play-scraper`) dengan spesifikasi:
- **Metode Sortir**: `gplay.sort.NEWEST` (Ulasan terbaru secara kronologis).
- **Pagination Control**: Menggunakan token rekursif (*nextPaginationToken*) dengan limit 150 ulasan per batch.
- **Rate-Limiting Protection**: Penambahan jeda interval 300 ms per request untuk menjaga integritas koneksi.

---

## 4. Teknik Anotasi & Pembuatan Ground Truth

Untuk menghindari bias rating bintang (seperti taktik "Bintang 5 biar dibaca" atau salah klik), dibangun **Master Ground Truth Dataset**:
1. **Kelas Sentimen**:
   - `Positif`: Ulasan berisi apresiasi, kepuasan, kemudahan antrean faskes, atau fungsi aplikasi yang berjalan baik.
   - `Negatif`: Ulasan berisi keluhan pendaftaran, kegagalan OTP, antrean penuh, bug server, atau kritik tajam.
   - `Netral`: Ulasan tanpa muatan emosional khusus atau pernyataan umum singkat.
2. **Kaidah Khusus Anotasi**:
   - Frasa taktik (*"bintang 5 biar dibaca"*) wajib dianotasi sebagai `Negatif`.
   - Frasa sarkasme (*"terima kasih mengajarkan kesabaran"*) wajib dianotasi sebagai `Negatif`.
   - Keluhan layanan tersirat (*"jadwal dokter spesialis penuh berhari-hari"*) wajib dianotasi sebagai `Negatif`.

---

## 5. Tahapan Pengolahan Data & Pemodelan

### Pembagian Data (Train-Test Split)
Dataset 5.000 ulasan dibagi secara acak terdistribusi (*stratified*):
- **Data Latih (Training Set)**: 80% (4.000 ulasan) — Digunakan untuk melatih kamus fitur TF-IDF dan parameter probabilitas Naive Bayes.
- **Data Uji (Testing Set)**: 20% (1.000 ulasan) — Digunakan khusus untuk pengujian murni tanpa campur tangan data latih (*unseen data*).

---

## 6. Instrumen & Lingkungan Pengembangan

- **Sistem Operasi**: Windows 11
- **Bahasa Pemrograman**: Node.js (v22.22.0) & Python (v3.13.0)
- **Library Utama**:
  - `google-play-scraper` (Data Mining Play Store)
  - `csv-writer` & `fs/promises` (Manipulasi File Dataset)
  - `Chart.js` & `Lucide Icons` (Visualisasi Dashboard)
  - `Scikit-Learn`, `Pandas`, `NumPy` (Ekuivalen Script Python ML)
