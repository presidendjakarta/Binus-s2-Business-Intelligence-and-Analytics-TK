# 🚀 Prompt Phase Generator (`promt_phase.md`)

File ini berisi kumpulan prompt siap pakai yang diawali dengan perintah `/goal`. Anda dapat langsung menyalin (*copy-paste*) prompt di bawah ini satu per satu ke chat untuk memerintahkan AI menyelesaikan dokumentasi per fase secara tuntas dan mendalam.

---

## 📌 Cara Penggunaan:
1. Pilih fase yang ingin Anda buat atau perbarui.
2. Salin seluruh teks di dalam blok kode (termasuk `/goal`).
3. Tempel (*paste*) ke kolom input chat Antigravity / AI Assistant, lalu tekan **Enter**.

---

### 🔹 Prompt Phase 1: Metodologi CRISP-DM
```markdown
/goal Tolong buatkan dan sempurnakan dokumen "X:\laragon\kuliah\playstore-mining\docs\01_metodologi_crisp_dm.md". Dokumen ini harus menjelaskan secara mendalam implementasi 6 Fase CRISP-DM (Business Understanding, Data Understanding, Data Preparation, Modeling, Evaluation, Deployment) pada proyek analisis sentimen ulasan Livin' by Mandiri. Sertakan diagram Mermaid CRISP-DM, tujuan bisnis, 4 aspek operasional JKN, formula Net Sentiment Score, kriteria keberhasilan akurasi/F1, tahapan NLP, parameter Naive Bayes Laplace smoothing, validasi 5-Fold CV, fitur Executive Dashboard, dan tabel pemetaan menyeluruh antara setiap fase dengan file kode sumber dalam proyek. Buat dengan gaya penulisan ilmiah standar Bab 3 Skripsi/Tesis.
```

---

### 🔹 Prompt Phase 2: Algoritma & Formula Matematika
```markdown
/goal Tolong buatkan dan lengkapi dokumen "X:\laragon\kuliah\playstore-mining\docs\02_algoritma_dan_matematika.md". Dokumen ini harus berisi seluruh formulasi matematis lengkap dengan notasi LaTeX, algoritma, dan pseudo-code untuk: (1) NLP Preprocessing meliputi penerjemahan semantik emoji, normalisasi idiom retoris, pembobotan klausa bertingkat adversatif/konsesif, aturan multi-step negation binding (tidak_bisa), dan algoritma morfologis Nazief-Adriani Sastrawi dengan kamus domain Bank Mandiri; (2) TF-IDF Vectorizer meliputi Sublinear Term Frequency (1 + ln(TF)), Smooth Inverse Document Frequency (ln((1+N)/(1+DF)) + 1), dan normalisasi vektor Euclidean L2-Norm; (3) Multinomial Naive Bayes meliputi Class Prior P(c), Conditional Word Likelihood dengan Laplace Add-One Smoothing (alpha=1.0), Log-Likelihood accumulation (anti-underflow), dan Softmax Posterior Probability Calibration; (4) Metrik Evaluasi Confusion Matrix, Accuracy, Precision, Recall, dan Macro F1-Score; serta (5) Net Sentiment Score (NSS). Buat dengan standar akademis Bab 2 dan Bab 4.
```

---

### 🔹 Prompt Phase 3: Flowchart & Diagram Arsitektur
```markdown
/goal Tolong buatkan dokumen visual "X:\laragon\kuliah\playstore-mining\docs\03_flowchart_dan_arsitektur.md". Buat diagram-diagram Mermaid yang sangat lengkap, rapi, dan mudah dibaca untuk: (1) Diagram Arsitektur Sistem End-to-End (dari Google Play Store scraper, local data storage, NLP preprocessor, TF-IDF vectorizer, Naive Bayes classifier, evaluator, hingga Executive Dashboard HTML); (2) Flowchart Detail NLP Preprocessing Pipeline (tahapan penanganan emoji, regex cleansing, slang dictionary, clause splitting, negation binding, Nazief-Adriani stemmer, dan stopword removal); (3) Flowchart Training & Inference Machine Learning (fit transform, MNB training dengan Laplace smoothing, log-likelihood calculation, dan softmax output); (4) Data Flow Diagram (DFD Level 0 Context Diagram dan DFD Level 1); serta (5) Flowchart Interaksi UI Executive Dashboard (DataTables search, multi-column filter, modal dialog, dan export CSV/Excel). Sertakan narasi teknis penjelas di bawah setiap diagram.
```

---

### 🔹 Prompt Phase 4: Kamus Data & Spesifikasi Skema
```markdown
/goal Tolong buatkan dokumen "X:\laragon\kuliah\playstore-mining\docs\04_kamus_data_dan_skema.md". Dokumen ini harus mendokumentasikan spesifikasi skema data dan kamus data secara menyeluruh untuk: (1) Raw Data Input di folder data/ (reviews.json, reviews.csv, meta.json) dengan tabel tipe data, deskripsi kolom id, userName, score 1-5, date, thumbsUp, version, dan raw text; (2) Master Data Kamus di master_data/ meliputi emojis.csv (emoji ke semantik teks), slang.csv (860+ kata gaul ke baku), stopwords.csv (kata tugas non-sentimen dengan proteksi negasi), dan kbbi_wordlist.txt; (3) Processed Data & Feature Matrix (struktur sparse vector TF-IDF dan vocabulary index map); (4) Output Prediksi di report/ (predictions.json, predictions.csv) dengan atribut hasil NLP (cleanedText, tokens), aspek operasional, actualLabel ground truth, predictedLabel, confidence score, class probabilities, dan flag isAnomaly; serta (5) Metrics Report (metrics.json) berisi confusion matrix dan ringkasan eksekutif. Sertakan contoh snippet JSON/CSV untuk setiap skema.
```

---

### 🔹 Prompt Phase 5: Evaluasi Model & Eksperimen
```markdown
/goal Tolong buatkan dokumen analisis empiris "X:\laragon\kuliah\playstore-mining\docs\05_evaluasi_dan_eksperimen.md". Dokumen ini harus menyajikan pembahasan evaluasi model secara komprehensif untuk Bab 4 Skripsi/Tesis: (1) Metodologi pengujian 5-Fold Stratified Cross Validation pada dataset ulasan; (2) Tabel rincian hasil evaluasi per fold (Fold 1 sampai Fold 5) beserta rata-rata keseluruhan; (3) Analisis mendalam Confusion Matrix (True Positive, False Positive, True Negative, False Negative) lengkap dengan matriks tabel visual; (4) Perhitungan metrik Accuracy, Precision, Recall, dan Macro F1-Score; (5) Analisis Salah Klasifikasi (Misclassification Error Analysis) yang membedah contoh kasus nyata ulasan ambigu, sarkasme kompleks, dan kata berimbuhan ganda; (6) Pembahasan keunggulan Macro F1-score dibanding Akurasi biasa pada data sentimen imbalanced; serta (7) Analisis Deteksi Anomali / Rating-Sentiment Mismatch (bintang 5 bernada keluhan vs bintang 1 bernada pujian).
```

---

### 🔹 Prompt Phase 6: Analisis Bisnis & Rekomendasi Manajerial
```markdown
/goal Tolong buatkan dokumen strategis "X:\laragon\kuliah\playstore-mining\docs\06_analisis_bisnis_rekomendasi.md". Dokumen ini berfokus pada Bab 5 (Pembahasan Bisnis & Rekomendasi Manajerial untuk PT Bank Mandiri (Persero) Tbk): (1) Analisis Voice of Customer dan indeks kepuasan publik menggunakan Net Sentiment Score (NSS); (2) Deep-dive analisis sentimen pada 4 Pilar Aspek Operasional Livin' by Mandiri (Autentikasi & Akun, Transaksi & Pembayaran, Kinerja & Server, serta Layanan & Fitur Finansial), membedah akar penyebab keluhan utama pada masing-masing pilar; (3) Analisis tren sentimen dan rating berdasarkan lini masa (timeline bulanan) dan versi rilis aplikasi Livin' by Mandiri; (4) Ekstraksi Top 15 Kata Kunci Positif dan Negatif penentu persepsi publik; serta (5) Actionable Recommendations & Prioritas Solusi Strategis (Matrix Dampak vs Kemudahan Implementasi) bagi manajemen PT Bank Mandiri (Persero) Tbk untuk peningkatan kualitas aplikasi.
```

---

### 🔹 Prompt Phase 7: Cheat Sheet Sidang Q&A & Glosarium
```markdown
/goal Tolong buatkan dokumen persiapan ujian "X:\laragon\kuliah\playstore-mining\docs\07_cheat_sheet_sidang_qna.md". Dokumen ini berisi: (1) 12+ Pertanyaan kritis yang paling sering diajukan dosen penguji sidang skripsi/tesis data mining beserta jawaban ilmiah berlandaskan teori dan kode (contoh: Kenapa memilih Multinomial Naive Bayes dibanding SVM/BERT? Kenapa menggunakan Laplace Add-One Smoothing alpha=1.0? Bagaimana cara sistem mengatasi kata negasi agar tidak bocor jadi positif? Bagaimana sistem mendeteksi sarkasme bintang 5? Kenapa butuh 5-Fold Cross Validation? Kenapa menggunakan Macro F1 bukan Micro F1? Apa fungsi Sublinear TF dan Smooth IDF?); (2) Panduan tips menghadapi sanggahan penguji terkait keterbatasan data ulasan; serta (3) Glosarium komprehensif istilah data mining, machine learning, dan NLP (Term Frequency, Inverse Document Frequency, Confusion Matrix, Macro F1, Tokenisasi, Stemming, Stopwords, Overfitting, Generalization, Ground Truth, dll).
```

---

### 🔹 Prompt Phase 8: Panduan Penggunaan CLI & User Manual
```markdown
/goal Tolong buatkan dokumen panduan teknis "X:\laragon\kuliah\playstore-mining\docs\08_panduan_penggunaan_cli.md". Dokumen ini harus menjadi User Manual lengkap yang memandu pengguna langkah demi langkah: (1) Prasyarat Sistem (Node.js v18+, NPM, OS Windows/Linux/macOS); (2) Instalasi proyek (clone repo, npm install); (3) Panduan eksekusi CLI lengkap: (a) Scraping ulasan Play Store (npm run scrape atau node scrap-livin.js data=5000) dengan opsi parameter data, limit, count; (b) Menjalankan pipeline analisis NLP & ML (npm run analyze atau node run-analisa.js folder=data/timestamp); (c) Membuka Executive Dashboard (npm run report atau node open-report.js); (d) Menjalankan Unit Testing NLP (npm test); (4) Penjelasan struktur folder output data/ dan report/; (5) Panduan fitur interaktif antarmuka Dashboard HTML (pencarian DataTables, filter multi-aspek, sortir rating, modal ulasan, dan ekspor CSV/Excel/Print); serta (6) Troubleshooting umum (error dependensi, koneksi rate-limit scraper, file reviews.json kosong).
```

---

### 🔹 Prompt Phase 9: Dokumentasi Kode & Script
```markdown
/goal Tolong buatkan dan lengkapi dokumen teknis "X:\laragon\kuliah\playstore-mining\docs\09_dokumentasi_kode_dan_script.md". Dokumen ini harus membedah arsitektur seluruh modul dan file script JavaScript (.js) dalam repositori: (1) Dependency graph antar modul script; (2) Skrip root runner (scrap-livin.js, run-analisa.js beserta fungsi detectAspects, open-report.js, test-nlp.js); (3) Modul scraper src/scraper/playstoreScraper.js (algoritma pagination, rotation, jitter); (4) Modul NLP src/nlp/ (csvLoader.js, stemmer.js dengan domain dictionary dan memoization cache, preprocessor.js dengan 8 tahap NLP); (5) Modul ML src/ml/ (groundTruth.js untuk mitigasi rating anomali/sarkasme, vectorizer.js dengan Sublinear TF dan Smooth IDF, naiveBayes.js dengan Laplace smoothing dan Softmax, evaluator.js dengan 5-fold CV dan confusion matrix); (6) Modul report src/report/dashboardTemplate.js (generator HTML standalone dashboard); (7) Modul utilitas src/utils/helpers.js; serta (8) Tabel matriks referensi API seluruh fungsi (nama fungsi, parameter masukan, nilai return, deskripsi). Buat secara detail dan terstruktur.
```
