# 📊 FASE 3: FLOWCHART & DIAGRAM ARSITEKTUR SISTEM
## Analisis Sentimen & Data Mining Ulasan Livin' by Mandiri (PT Bank Mandiri Tbk)

---

## 📌 Daftar Isi
1. [Pengantar & Gambaran Umum Arsitektur](#1-pengantar--gambaran-umum-arsitektur)
2. [Diagram Arsitektur Sistem End-to-End](#2-diagram-arsitektur-sistem-end-to-end)
3. [Flowchart Pipeline Preprocessing NLP](#3-flowchart-pipeline-preprocessing-nlp)
4. [Flowchart Training & Inference Machine Learning](#4-flowchart-training--inference-machine-learning)
5. [Data Flow Diagram (DFD)](#5-data-flow-diagram-dfd)
   - [5.1. DFD Level 0 (Context Diagram)](#51-dfd-level-0-context-diagram)
   - [5.2. DFD Level 1 (Rincian Proses Sistem)](#52-dfd-level-1-rincian-proses-sistem)
6. [Flowchart Interaksi Pengguna pada Executive BI Dashboard](#6-flowchart-interaksi-pengguna-pada-executive-bi-dashboard)

---

## 1. Pengantar & Gambaran Umum Arsitektur

Dokumen ini menyajikan visualisasi grafis dan representasi struktural sistem analisis sentimen ulasan **Livin' by Mandiri**. Diagram disusun menggunakan format **Mermaid Diagram** yang terintegrasi dengan penjelasan naratif teknis. 

Dokumen ini sangat ideal dijadikan rujukan utama untuk **Bab 3 (Perancangan Sistem)** dan **Bab 4 (Implementasi)** pada penulisan karya ilmiah/skripsi/tesis.

---

## 2. Diagram Arsitektur Sistem End-to-End

Diagram di bawah menggambarkan arsitektur sistem secara menyeluruh, mulai dari lapisan pengumpulan data (*Data Ingestion*), pra-pemrosesan (*Data Preparation*), pembelajaran mesin (*Machine Learning & Feature Engineering*), hingga lapisan penyajian data (*Presentation & Business Intelligence*).

```mermaid
flowchart TD
    subgraph Layer_1_Ingestion ["1. Lapisan Pengumpulan Data (Data Acquisition)"]
        A1["Google Play Store<br>(app.Bank Mandiri.mobile)"] -->|scrap-livin.js| A2["google-play-scraper Engine<br>• Pagination Token<br>• Sort Rotation<br>• Request Jitter Delay"]
        A2 --> A3[("Raw Storage (data/)<br>• reviews.json<br>• reviews.csv<br>• meta.json")]
    end

    subgraph Layer_2_Preparation ["2. Lapisan NLP Preprocessing & Ekstraksi Fitur"]
        A3 --> B1["TextPreprocessor (src/nlp/preprocessor.js)"]
        B0[("Master Data Kamus<br>• emojis.csv<br>• slang.csv (860+)<br>• stopwords.csv<br>• kbbi_wordlist.txt")] --> B1
        B1 --> B2["Nazief-Adriani Stemmer<br>(ts-sastrawi + Bank Mandiri Domain)"]
        B2 --> B3["Ground Truth Annotator<br>(src/ml/groundTruth.js)"]
        B3 --> B4["TfidfVectorizer (src/ml/vectorizer.js)<br>• Sublinear TF: 1 + ln(TF)<br>• Smooth IDF: ln((1+N)/(1+DF)) + 1<br>• L2-Norm Normalization"]
    end

    subgraph Layer_3_ML ["3. Lapisan Machine Learning & Evaluasi"]
        B4 --> C1["Matriks Vektor Fitur X<br>& Array Label Ground Truth y"]
        C1 --> C2["Multinomial Naive Bayes<br>(src/ml/naiveBayes.js)<br>• Laplace Smoothing α=1.0<br>• Log-Likelihood (Anti-Underflow)<br>• Softmax Calibration"]
        C1 --> C3["5-Fold Cross Validator<br>(src/ml/evaluator.js)<br>• Stratified K-Fold (k=5)<br>• Confusion Matrix Calculation<br>• Accuracy, Precision, Recall, Macro F1"]
        C2 --> C4["Prediksi Sentimen & Aspek<br>• Label (Positif/Negatif)<br>• Confidence Score<br>• 4 Aspek Operasional JKN<br>• Flag Deteksi Anomali"]
    end

    subgraph Layer_4_Presentation ["4. Lapisan Penyajian & Business Intelligence"]
        C3 --> D1["Laporan Metrik Evaluasi<br>(metrics.json)"]
        C4 --> D2["Dataset Hasil Prediksi<br>(predictions.json / .csv)"]
        C4 --> D3["Executive BI Dashboard<br>(report/<timestamp>/dashboard.html)"]
        D3 --> D4["Fitur Dashboard Interaktif<br>• KPI Scorecards (NSS, Rating, Acc)<br>• Chart.js (Donut, Bar, Line, Matrix)<br>• jQuery DataTables (Search, Filter, Export)"]
    end

    Layer_1_Ingestion --> Layer_2_Preparation
    Layer_2_Preparation --> Layer_3_ML
    Layer_3_ML --> Layer_4_Presentation
```

### 📖 Narasi Teknis Arsitektur:
1. **Data Ingestion**: Skrip `scrap-livin.js` berinteraksi dengan API Google Play Store untuk mengekstrak ribuan ulasan ulasan secara terstruktur. Data mentah diarsipkan di folder `data/<timestamp>/`.
2. **NLP & Feature Engineering**: Modul `preprocessor.js` mengintegrasikan kamus emoji, slang, dan stemmer Nazief-Adriani untuk menghasilkan token kata bersih. Vektor numerik dibentuk melalui `vectorizer.js`.
3. **Machine Learning & Evaluasi**: Modul `naiveBayes.js` melatih model probabilitas dengan Laplace Smoothing, sementara `evaluator.js` menjalankan *5-Fold Cross Validation* untuk menguji stabilitas model.
4. **Executive Dashboard**: Generator `dashboardTemplate.js` menyusun seluruh artefak hasil prediksi menjadi berkas mandiri `dashboard.html` yang dapat langsung dioperasikan di peramban web (*browser*).

---

## 3. Flowchart Pipeline Preprocessing NLP

Diagram berikut menguraikan 8 tahapan terperinci pembersihan teks ulasan informal dari bentuk teks mentah hingga menghasilkan token kata yang siap dibobotkan.

```mermaid
flowchart TD
    Start([Mulai: Teks Ulasan Mentah]) --> Step1["1. Emoji Translation<br>Ganti emoji Unicode dengan token semantik Indonesia<br>(Contoh: 👍 → emoji_jempol_bagus)"]
    Step1 --> Step2["2. Case Folding<br>Ubah seluruh karakter menjadi huruf kecil (lowercase)"]
    Step2 --> Step3["3. Idiom & Rhetorical Normalization<br>Normalisasi frasa retoris & sarkastik<br>(Contoh: 'apa gunanya' → 'tidak berguna')"]
    Step3 --> Step4["4. Regex Cleansing<br>Hapus URL, mention @user, tagar #, dan simbol non-alfanumerik.<br>Reduksi huruf berulang (baguuus → bagus)"]
    Step4 --> Step5["5. Slang & Abbreviation Normalization<br>Cocokkan dan ubah kata gaul/singkatan dengan slang.csv<br>(Contoh: 'bgt' → 'sangat', 'lola' → 'lambat')"]
    
    Step5 --> Step6{"6. Analisis Klausa Bertingkat<br>Apakah terdapat konjungsi<br>Adversatif (tapi) / Konsesif (padahal)?"}
    
    Step6 -->|"Konjungsi 'tapi/namun'"| Step6A["Beri bobot 1x pada klausa sebelum 'tapi'<br>Beri bobot 2x pada klausa setelah 'tapi' (Inti Keluhan)"]
    Step6 -->|"Konjungsi 'padahal/walaupun'"| Step6B["Beri bobot 2x pada klausa sebelum 'padahal' (Inti Masalah)<br>Beri bobot 1x pada klausa setelah 'padahal'"]
    Step6 -->|"Tanpa Konjungsi Khusus"| Step6C["Beri bobot standar 1x pada seluruh klausa"]

    Step6A --> Step7["7. Multi-Step Negation Binding<br>Cari kata negasi (tidak, bukan, belum, kurang, jangan).<br>Lewati kata pengisi (filler) maksimal 2 kata.<br>Ikat dengan kata inti: 'tidak_' + Stem(TargetWord)"]
    Step6B --> Step7
    Step6C --> Step7

    Step7 --> Step8["8. Nazief-Adriani Stemming & Stopwords Filtering<br>• Reduksi kata berimbuhan ke kata dasar (ts-sastrawi)<br>• Proteksi istilah domain Bank Mandiri (Pembayaran, Transaksi, Tagihan)<br>• Hapus stopwords umum non-sentimen (stopwords.csv)"]

    Step8 --> End([Selesai: Array Token Bersih & Berbobot])
```

### 📖 Narasi Teknis Pipeline NLP:
- **Penerjemahan Emoji & Frasa Retoris**: Dijalankan paling awal sebelum simbol dibersihkan oleh Regex agar nilai sentimen emotikon tidak hilang.
- **Slang Normalization**: Mengubah bahasa ulasan non-baku menjadi kata baku bahasa Indonesia sebelum proses morfologi.
- **Clause Splitting & Negation Binding**: Memastikan sentimen tidak terbalik akibat konjungsi majemuk atau kebocoran kata positif yang dinegasikan.
- **Stemming Nazief-Adriani**: Menggunakan kamus dasar 29.932 kata ditambah kamus domain Bank Mandiri untuk menjamin akurasi pemotongan imbuhan (*affix stripping*).

---

## 4. Flowchart Training & Inference Machine Learning

Sistem Machine Learning dibagi menjadi dua alur utama: **Fase Pelatihan (Training Phase)** dan **Fase Inferensi/Prediksi (Inference Phase)**.

```mermaid
flowchart TD
    subgraph Training_Phase ["Fase Pelatihan Model (Training Phase)"]
        T1["Kumpulan Dokumen Token Latih (Train Docs)"] --> T2["Fit TF-IDF Vectorizer<br>• Hitung DF(t) per kata<br>• Hitung Smooth IDF: ln((1+N)/(1+DF)) + 1<br>• Bentuk Matriks Kosakata (Vocabulary)"]
        T2 --> T3["Transform Dokumen Latih<br>• Hitung Sublinear TF: 1 + ln(TF)<br>• Kalikan TF × IDF<br>• Normalisasi Euclidean L2-Norm"]
        T3 --> T4["Vektor Fitur Latih X_train & Label y_train"]
        T4 --> T5["Latih Multinomial Naive Bayes<br>• Hitung Prior Kelas P(Positif) & P(Negatif)<br>• Akumulasi Bobot TF-IDF per Kata per Kelas<br>• Hitung Conditional Likelihood P(w|c) dengan Laplace Smoothing α=1.0"]
        T5 --> T6[("Model MNB Terlatih<br>(Class Log-Priors & Feature Log-Probabilities)")]
    end

    subgraph Inference_Phase ["Fase Prediksi / Inferensi (Inference Phase)"]
        I1["Ulasan Baru / Data Uji (Test Doc)"] --> I2["Preprocessing NLP (Clean Tokens)"]
        I2 --> I3["Transform TF-IDF Vektor Uji (X_test)<br>(Menggunakan Vocabulary & IDF dari Training)"]
        I3 --> I4["Kalkulasi Akumulasi Log-Likelihood<br>ln P(c|d) = ln P(c) + ∑ w_i × ln P(w_i|c)"]
        T6 -.-> I4
        I4 --> I5["Normalisasi Stabil via Softmax<br>P(c|d) = exp(ln P(c|d) - M) / ∑ exp(ln P(c'|d) - M)"]
        I5 --> I6["Keputusan Kelas: argmax P(c|d)<br>Confidence Score = max(P(Positif), P(Negatif))"]
        I6 --> I7["Output Hasil Klasifikasi Sentimen"]
    end
```

### 📖 Narasi Teknis Alur Machine Learning:
- **Pelatihan (Training)**: Model mempelajari distribusi bobot kata per kelas sentimen. Parameter *Laplace Add-One Smoothing* ($\alpha=1.0$) diintegrasikan saat menghitung *Feature Log-Probability* untuk menghindari nilai probabilitas nol.
- **Prediksi (Inference)**: Dokumen baru ditransformasikan menggunakan representasi kosakata (*vocabulary*) yang telah dipelajari sebelumnya, kemudian dievaluasi menggunakan fungsi akumulasi *Log-Likelihood* dan dikalibrasi oleh *Softmax*.

---

## 5. Data Flow Diagram (DFD)

### 5.1. DFD Level 0 (Context Diagram)

Context Diagram menggambarkan batas sistem (*system boundary*) serta interaksi antara sistem dengan entitas eksternal (*external entities*).

```mermaid
flowchart LR
    Entity1["Google Play Store<br>(Penyedia Data Publik)"] -->|Data Mentah Ulasan & Rating| System["(0.0)<br>SISTEM ANALISIS SENTIMEN &<br>DATA MINING Livin' by Mandiri"]
    System -->|Parameter Scraping & Request| Entity1
    
    System -->|Executive BI Dashboard HTML,<br>Laporan Metrik & Tren Kepuasan| Entity2["Manajemen PT Bank Mandiri (Persero) Tbk<br>& Tim Customer Care"]
    
    Entity3["Data Analyst / Peneliti"] -->|Instruksi CLI (Jumlah Data, Eksekusi)| System
    System -->|File Dataset CSV, JSON,<br>Hasil Evaluasi 5-Fold CV| Entity3
```

---

### 5.2. DFD Level 1 (Rincian Proses Sistem)

DFD Level 1 merinci aliran data di antara 5 proses utama dan 5 penyimpanan data (*data stores*).

```mermaid
flowchart TD
    E1["Google Play Store API"] -->|1. Request Scraping| P1["(1.0)<br>Pengumpulan Data<br>(playstoreScraper.js)"]
    P1 -->|2. Simpan Raw Data| DS1[("D1: Raw Reviews Storage<br>(reviews.json, reviews.csv)")]

    DS1 -->|3. Baca Raw Reviews| P2["(2.0)<br>Preprocessing NLP<br>(preprocessor.js, stemmer.js)"]
    DS2[("D2: Master Kamus Leksikon<br>(emojis, slang, stopwords)")] -->|4. Rujukan Kamus| P2
    P2 -->|5. Token Bersih & Ground Truth| DS3[("D3: Clean Tokens & Labels")]

    DS3 -->|6. Baca Token| P3["(3.0)<br>Ekstraksi Fitur TF-IDF<br>(vectorizer.js)"]
    P3 -->|7. Matriks Vektor Fitur X & Vocab| DS4[("D4: TF-IDF Feature Matrix")]

    DS4 -->|8. Vektor Fitur| P4["(4.0)<br>Klasifikasi & Evaluasi MNB<br>(naiveBayes.js, evaluator.js)"]
    DS3 -->|9. Label Aktual| P4
    P4 -->|10. Metrik Akurasi & F1-Score| DS5[("D5: Evaluation Metrics (metrics.json)")]
    P4 -->|11. Hasil Prediksi & Anomali| DS6[("D6: Predictions Data (predictions.json/csv)")]

    DS5 -->|12. Data Metrik| P5["(5.0)<br>Penyusunan Dashboard BI<br>(dashboardTemplate.js)"]
    DS6 -->|13. Data Prediksi & Aspek| P5
    P5 -->|14. Output File HTML| E2["Executive Dashboard HTML<br>(Untuk Manajemen Bank Mandiri)"]
```

---

## 6. Flowchart Interaksi Pengguna pada Executive BI Dashboard

Diagram ini memvisualisasikan bagaimana pengguna (eksekutif atau analis) berinteraksi dengan antarmuka **Executive Business Intelligence Dashboard** ([`src/report/dashboardTemplate.js`](file:///x:/laragon/kuliah/playstore-mining/src/report/dashboardTemplate.js)).

```mermaid
flowchart TD
    StartUI([Pengguna Membuka dashboard.html]) --> Load["Inisialisasi Halaman & Parsing Data JSON Terintegrasi"]
    
    Load --> RenderKPI["1. Render Scorecard KPI Utama<br>• Net Sentiment Score (NSS)<br>• Rata-rata Rating Bintang<br>• Total Ulasan Dianalisis<br>• Akurasi Model & Macro F1"]
    Load --> RenderCharts["2. Inisialisasi Chart.js Visualizations<br>• Donut Chart Distribusi Sentimen<br>• Bar Chart 4 Aspek Operasional JKN<br>• Line Chart Tren Sentimen & Rating Bulanan<br>• Matrix Heatmap Rating vs Sentimen"]
    Load --> RenderDT["3. Inisialisasi jQuery DataTables<br>• Render Tabel Sampel Ulasan Lengkap<br>• Pasang Custom Badge (Positif, Negatif, Aspek, Anomali)"]

    RenderDT --> UserAction{"Pilihan Interaksi Pengguna"}

    UserAction -->|"Pencarian Cepat"| Act1["Ketik Kata Kunci pada Search Bar<br>DataTables memfilter baris secara real-time"]
    UserAction -->|"Filter Dropdown"| Act2["Pilih Filter Spesifik:<br>• Aspek: Autentikasi / Transaksi / Server / Tagihan<br>• Rating: Bintang 1 s.d. 5<br>• Sentimen: Positif / Negatif<br>• Anomali: Ya / Tidak"]
    UserAction -->|"Klik Baris / Tombol Detail"| Act3["Buka Modal Popup Detail Ulasan<br>• Tampilkan Teks Asli & Teks Bersih<br>• Tampilkan Token NLP Hasil Preprocessing<br>• Tampilkan Probabilitas Posterior & Confidence Score"]
    UserAction -->|"Ekspor Data"| Act4["Klik Tombol Ekspor:<br>• Copy to Clipboard<br>• Unduh Berkas CSV / Excel<br>• Cetak Laporan (Print / PDF)"]

    Act1 --> UpdateTable["Perbarui Tampilan Baris Tabel DataTables"]
    Act2 --> UpdateTable
    Act3 --> CloseModal["Tutup Modal Popup & Kembali ke Dashboard"]
    Act4 --> FinishAction["File Berhasil Diunduh / Dicetak"]

    UpdateTable --> UserAction
    CloseModal --> UserAction
    FinishAction --> UserAction
```

### 📖 Narasi Teknis Interaksi Dashboard:
- **Portabilitas Penuh (*Zero Dependency*)**: Dashboard HTML memuat seluruh data prediksi secara terenkapsulasi di dalam berkas HTML itu sendiri, sehingga dapat dibuka langsung pada komputer mana pun tanpa memerlukan koneksi basis data atau server aktif.
- **Responsivitas Tinggi**: Operasi pemfilteran kolom, pencarian kata kunci, dan penyortiran data dijalankan pada memori sisi klien (*client-side memory*) menggunakan pustaka *jQuery DataTables* teroptimasi dengan latensi di bawah 50 milidetik.

---
*Dokumen ini merupakan standar arsitektur dan perancangan visual resmi sistem Livin' by Mandiri Sentiment Analytics.*
