# 📋 Roadmap & Daftar Fase Dokumentasi Proyek (`docs/`)

Dokumen ini mencatat rencana kerja pembuatan dokumentasi sistem secara bertahap (**1 Phase = 1 Dokumen Markdown**). Setiap fase dirancang untuk melengkapi kebutuhan akademis (Bab 1 s.d. Bab 5 Skripsi/Tesis) dan kebutuhan teknis operasional sistem.

---

## 📊 Status Progres Pembuatan Dokumen (Phase Tracking)

| Fase | File Target | Topik & Fokus Dokumen | Relevansi Akademis / Teknis | Status |
| :---: | :--- | :--- | :--- | :---: |
| **Fase 1** | [`01_metodologi_crisp_dm.md`](01_metodologi_crisp_dm.md) | Kerangka Kerja 6 Tahapan CRISP-DM & Pemetaan Source Code | **Bab 3 (Metodologi Penelitian)** | ✅ **Selesai** |
| **Fase 2** | [`02_algoritma_dan_matematika.md`](02_algoritma_dan_matematika.md) | Penurunan Matematis TF-IDF, MNB, Laplace Smoothing, Softmax, Nazief-Adriani | **Bab 2 (Teori) & Bab 4 (Sistem)** | ✅ **Selesai** |
| **Fase 3** | [`03_flowchart_dan_arsitektur.md`](03_flowchart_dan_arsitektur.md) | Diagram Visual Mermaid: Arsitektur Global, Pipeline NLP, DFD | **Bab 3 & Bab 4 (Perancangan)** | ✅ **Selesai** |
| **Fase 4** | [`04_kamus_data_dan_skema.md`](04_kamus_data_dan_skema.md) | Spesifikasi Skema Data Input/Output, Master Leksikon, & Metadata | **Bab 3 & Lampiran Dataset** | ✅ **Selesai** |
| **Fase 5** | [`05_evaluasi_dan_eksperimen.md`](05_evaluasi_dan_eksperimen.md) | 5-Fold Cross Validation, Confusion Matrix, Error Misclassification | **Bab 4 (Hasil & Pembahasan)** | ✅ **Selesai** |
| **Fase 6** | [`06_analisis_bisnis_rekomendasi.md`](06_analisis_bisnis_rekomendasi.md) | Analisis 4 Aspek JKN, Net Sentiment Score (NSS), Action Plan BPJS | **Bab 5 (Saran & Kesimpulan)** | ✅ **Selesai** |
| **Fase 7** | [`07_cheat_sheet_sidang_qna.md`](07_cheat_sheet_sidang_qna.md) | 12+ Tanya-Jawab Kritis Dosen Penguji Sidang & Glosarium Data Mining | **Persiapan Sidang Akhir** | ✅ **Selesai** |
| **Fase 8** | [`08_panduan_penggunaan_cli.md`](08_panduan_penggunaan_cli.md) | User Manual Lengkap (Scraper, Analisis, Dashboard, Testing) | **Panduan Teknis / Petunjuk** | ✅ **Selesai** |
| **Fase 9** | [`09_dokumentasi_kode_dan_script.md`](09_dokumentasi_kode_dan_script.md) | Bedah Arsitektur Seluruh Modul Script, Fungsi, Algoritma, & API | **Teknis & Arsitektur Kode** | ✅ **Selesai** |
| **Fase 10** | [`10_studi_kasus_sarkasme_dan_anomali.md`](10_studi_kasus_sarkasme_dan_anomali.md) | Bedah Kasus Sarkasme Ulasan, Heuristik Ground Truth vs MNB ML | **Bab 4 & Bahan Sidang Ujian** | ✅ **Selesai** |

---

## 🎯 Rincian Sasaran & Konten per Dokumen

### 🔹 Fase 1: Metodologi CRISP-DM (`01_metodologi_crisp_dm.md`)
- **Tujuan**: Menjelaskan metodologi riset 6 fase standar data mining industri.
- **Isi**: Business Understanding, Data Understanding, Data Preparation, Modeling, Evaluation, Deployment, dan tabel pemetaan file kode.

### 🔹 Fase 2: Algoritma & Formula Matematika (`02_algoritma_dan_matematika.md`)
- **Tujuan**: Membedah seluruh formulasi matematis dan algoritma yang digunakan dalam sistem.
- **Isi**: 
  - Formula TF-IDF: Sublinear TF ($1 + \ln(TF)$), Smooth IDF ($\ln((1+N)/(1+DF)) + 1$), Normalisasi $L_2$-norm Euclidean.
  - Formula Multinomial Naive Bayes: Class Priors $P(c)$, Word Likelihood $P(w|c)$ dengan Laplace Smoothing $\alpha=1.0$, Akumulasi Log-Likelihood $\ln P(c|d)$, dan Softmax Posterior Calibration.
  - Algoritma Stemmer Nazief-Adriani: Aturan afiksasi (prefiks, sufiks, konfiks, infiks) dan kamus dasar domain BPJS.
  - Aturan *Negation Binding* multi-step.

### 🔹 Fase 3: Flowchart & Diagram Arsitektur (`03_flowchart_dan_arsitektur.md`)
- **Tujuan**: Memberikan ilustrasi grafis alur kerja sistem dari awal hingga akhir.
- **Isi**:
  - Global Architecture Diagram.
  - Detailed NLP Preprocessing Flowchart (Emoji $\rightarrow$ Slang $\rightarrow$ Clause $\rightarrow$ Negation $\rightarrow$ Stemmer $\rightarrow$ Stopwords).
  - Machine Learning Training & Inference Flowchart.
  - Data Flow Diagram (DFD Level 0 & Level 1).

### 🔹 Fase 4: Kamus Data & Spesifikasi Skema (`04_kamus_data_dan_skema.md`)
- **Tujuan**: Menjelaskan struktur file dataset, kamus referensi, dan output data secara detail.
- **Isi**:
  - Struktur `reviews.json`, `reviews.csv`, `meta.json`.
  - Spesifikasi kamus `emojis.csv`, `slang.csv`, `stopwords.csv`, `kbbi_wordlist.txt`.
  - Spesifikasi `predictions.json`, `predictions.csv`, `metrics.json`.

### 🔹 Fase 5: Evaluasi Model & Analisis Eksperimen (`05_evaluasi_dan_eksperimen.md`)
- **Tujuan**: Menyajikan analisis performa model klasifikasi secara empiris.
- **Isi**:
  - Metodologi 5-Fold Stratified Cross Validation.
  - Confusion Matrix ($TP, FP, TN, FN$), Akurasi, Precision, Recall, Macro F1-Score.
  - Analisis salah klasifikasi (*Misclassification Error Analysis*) beserta studi kasus ulasan.
  - Pembahasan keunggulan Macro F1 pada dataset sentimen yang tidak seimbang (*imbalanced*).

### 🔹 Fase 6: Analisis Bisnis & Rekomendasi Manajerial (`06_analisis_bisnis_rekomendasi.md`)
- **Tujuan**: Menerjemahkan hasil analitik data mining menjadi wawasan bisnis (*actionable insights*).
- **Isi**:
  - Analisis kepuasan publik berdasarkan *Net Sentiment Score* (NSS).
  - Analisis mendalam 4 Aspek Operasional Mobile JKN (*Akun & Login*, *Antrean & Faskes*, *Kinerja Server*, *Iuran & Tagihan*).
  - Analisis tren ulasan per versi rilis aplikasi.
  - Rekomendasi strategis perbaikan sistem untuk manajemen BPJS Kesehatan.

### 🔹 Fase 7: Cheat Sheet Sidang Q&A & Glosarium (`07_cheat_sheet_sidang_qna.md`)
- **Tujuan**: Membekali penyusun skripsi/tesis menghadapi pertanyaan penguji saat sidang.
- **Isi**:
  - 12+ Pertanyaan kritis dosen penguji & jawaban ilmiah berbasis teori.
  - Glosarium istilah lengkap Data Mining, NLP, dan Machine Learning.

### 🔹 Fase 8: Panduan Penggunaan & User Manual CLI (`08_panduan_penggunaan_cli.md`)
- **Tujuan**: Petunjuk operasional bagi pengguna dan pengembang sistem.
- **Isi**:
  - Kebutuhan lingkungan (Node.js v18+, NPM).
  - Langkah instalasi dependensi.
  - Perintah scraping, analisis data, membuka dashboard, dan unit testing.
  - Panduan interaksi antarmuka Executive BI Dashboard.
