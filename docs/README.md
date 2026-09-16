# 📚 Dokumentasi Analisis Sentimen & Data Mining Livin' by Mandiri

Selamat datang di pusat dokumentasi resmi proyek **Livin' by Mandiri Sentiment Analytics & Text Mining System**. 

Proyek ini merupakan sistem *end-to-end data mining* yang mengolah ribuan data ulasan pengguna dari Google Play Store (`id.bmri.livin`) menggunakan metodologi standar **CRISP-DM (*Cross-Industry Standard Process for Data Mining*)**, pipeline pemrosesan bahasa alami (**NLP Sastrawi, KBBI, & Lexicon-based**), pembobotan fitur **TF-IDF**, klasifikasi cerdas **Multinomial Naive Bayes (MNB)** dengan *Lidstone Smoothing* ($\alpha=0.25$), serta visualisasi **Executive Business Intelligence Dashboard**.

---

## 🗺️ Peta Navigasi & Struktur Dokumen

Dokumentasi ini disusun secara modular menjadi 9 dokumen utama yang siap digunakan untuk penyusunan laporan akademis (Tugas Besar / Skripsi), presentasi sidang, maupun implementasi teknis:

```
X:\laragon\kuliah\playstore-mining\docs/
├── README.md                           # Peta navigasi & ringkasan seluruh dokumentasi (Dokumen ini)
├── tugas_dashboard_tableau_data_storytelling_livin_mandiri.md # Dokumen Tugas G.A.M.E. Storytelling Tableau
├── 01_metodologi_crisp_dm.md           # [Bab 3] 6 Tahapan CRISP-DM lengkap & pemetaan kode
├── 02_algoritma_dan_matematika.md      # [Bab 2 & 4] Rumus matematis TF-IDF, MNB, Laplace, Softmax, Stemmer
├── 03_flowchart_dan_arsitektur.md      # Diagram visual Mermaid: Arsitektur, NLP Pipeline, & DFD
├── 04_kamus_data_dan_skema.md          # Spesifikasi skema data input/output, kamus data & metadata
├── 05_evaluasi_dan_eksperimen.md       # [Bab 4] 5-Fold Cross Validation, Confusion Matrix & Error Analysis
├── 06_analisis_bisnis_rekomendasi.md   # [Bab 5] Voice of Customer, Analisis 4 Aspek Livin Mandiri, & Action Plan
├── 07_cheat_sheet_sidang_qna.md        # 12+ Tanya-Jawab Kritis Ujian Sidang & Glosarium Data Mining
├── 08_panduan_penggunaan_cli.md        # Panduan teknis menjalankan scraper, analisis, dan dashboard
├── 09_dokumentasi_kode_dan_script.md   # [Teknis] Bedah arsitektur seluruh modul kode, algoritma, & API
└── 10_studi_kasus_sarkasme_dan_anomali.md # [Studi Kasus] Bedah kasus ulasan sarkasme, ground truth & MNB
```

---

## 📑 Ringkasan Isi Setiap Dokumen

| Dokumen | Relevansi Akademis | Fokus Utama |
| :--- | :--- | :--- |
| **[01. Metodologi CRISP-DM](01_metodologi_crisp_dm.md)** | **Bab 3 (Metodologi Penelitian)** | Menguraikan 6 fase CRISP-DM dari *Business Understanding* hingga *Deployment* beserta pemetaan langsung ke file kode sumber. |
| **[02. Algoritma & Matematika](02_algoritma_dan_matematika.md)** | **Bab 2 (Landasan Teori) & Bab 4** | Penurunan rumus TF-IDF (*Sublinear TF, Smooth IDF, $L_2$*), Naive Bayes (*Prior, Likelihood, Log-Likelihood, Softmax*), dan Stemming Nazief-Adriani. |
| **[03. Flowchart & Arsitektur](03_flowchart_dan_arsitektur.md)** | **Bab 3 & Bab 4 (Perancangan Sistem)** | Visualisasi flowchart alur sistem global, pipeline pembersihan teks (NLP), training-testing model, dan diagram aliran data. |
| **[04. Kamus Data & Skema](04_kamus_data_dan_skema.md)** | **Bab 3 & Lampiran Data** | Spesifikasi lengkap atribut dataset mentah (`reviews.json`), kamus leksikon (`master_data/`), serta format output hasil prediksi (`predictions.json/csv`). |
| **[05. Evaluasi & Eksperimen](05_evaluasi_dan_eksperimen.md)** | **Bab 4 (Hasil dan Pembahasan)** | Detail hasil pengujian *5-Fold Cross Validation*, Confusion Matrix ($TP, FP, TN, FN$), Akurasi, Presisi, Recall, Macro F1, serta analisis salah klasifikasi. |
| **[06. Analisis Bisnis & Rekomendasi](06_analisis_bisnis_rekomendasi.md)** | **Bab 5 (Kesimpulan & Saran Bisnis)** | *Insights* manajerial seputar 4 aspek operasional (Akun, Transaksi, Server, Tagihan), *Net Sentiment Score* (NSS), tren per versi, dan rekomendasi aksi bagi Bank Mandiri. |
| **[07. Cheat Sheet Sidang Q&A](07_cheat_sheet_sidang_qna.md)** | **Persiapan Ujian / Sidang Akhir** | Tanya-jawab ilmiah terhadap pertanyaan kritis dosen penguji (alasan pemilihan algoritma, penanganan negasi, Laplace smoothing, dan sarkasme). |
| **[08. Panduan Penggunaan CLI](08_panduan_penggunaan_cli.md)** | **User Manual / Petunjuk Teknis** | Langkah instalasi dependensi, panduan eksekusi perintah CLI (`npm run scrape`, `analyze`, `report`, `test`), dan troubleshooting. |
| **[09. Dokumentasi Kode & Script](09_dokumentasi_kode_dan_script.md)** | **Teknis & Arsitektur Perangkat Lunak** | Penjelasan mendalam seluruh skrip kode (`.js`), parameter fungsi, arsitektur modul NLP/ML, dan kamus API internal. |
| **[10. Studi Kasus Sarkasme & Anomali](10_studi_kasus_sarkasme_dan_anomali.md)** | **Bab 4 & Bahan Sidang Ujian** | Bedah tuntas ulasan sarkasme nyata, evaluasi aturan ground truth, komputasi log-likelihood MNB, dan analisis kesalahan klasifikasi. |

---

## 🚀 Quick Start (Perintah Cepat)

```bash
# 1. Masuk ke direktori proyek
cd X:\laragon\kuliah\playstore-mining

# 2. Ambil data ulasan terbaru dari Google Play Store (contoh 1.000 data)
npm run scrape

# 3. Jalankan pipeline NLP, Training Naive Bayes, & Evaluasi Model
npm run analyze

# 4. Buka Executive Business Intelligence Dashboard di Browser
npm run report
```

---
*Dokumentasi ini dikembangkan untuk mendukung transparansi data mining, keandalan analitik bisnis, dan standar keilmuan akademis tingkat tinggi.*
