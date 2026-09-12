# 🔄 Dokumentasi Diagram Alir (Flowchart) Sistem
## Arsitektur Pipeline Data Mining & Multinomial Naive Bayes Mobile JKN

Dokumen ini memuat diagram alir (*flowchart*) seluruh tahapan dalam sistem **Play Store Mining & Multinomial Naive Bayes Sentiment Analytics**.

---

## 📑 Daftar Diagram
1. [Flowchart 1: Alur Keseluruhan Sistem (End-to-End Pipeline)](#1-alur-keseluruhan-sistem-end-to-end-pipeline)
2. [Flowchart 2: Alur Scraping Data Google Play Store](#2-alur-scraping-data-google-play-store)
3. [Flowchart 3: Alur Text Preprocessing (Emoji + Sastrawi + TF-IDF)](#3-alur-text-preprocessing-emoji--sastrawi--tf-idf)
4. [Flowchart 4: Alur Pelatihan & Evaluasi Model Multinomial Naive Bayes](#4-alur-pelatihan--evaluasi-model-multinomial-naive-bayes)
5. [Flowchart 5: Alur Deteksi Anomali & Executive Dashboard](#5-alur-deteksi-anomali--executive-dashboard)

---

## 1. Alur Keseluruhan Sistem (End-to-End Pipeline)

```mermaid
flowchart TD
    Start(["Mulai Proyek"]) --> Step1["1. Web Scraping Play Store (5.000 Ulasan Kronologis)"]
    Step1 --> Step2["2. Penyimpanan Dataset Mentah JSON dan CSV"]
    Step2 --> Step3["3. Pembentukan Master Ground Truth Dataset"]
    Step3 --> Step4["4. NLP Preprocessing: Emoji Mapping + Slang + Sastrawi Stemming"]
    Step4 --> Step5["5. Pembagian Data: 80% Training (4.000) & 20% Testing (1.000)"]
    Step5 --> Step6["6. Ekstraksi Fitur TF-IDF (5.537 Fitur Vocabulary)"]
    Step6 --> Step7["7. Pelatihan Multinomial Naive Bayes + Laplace Smoothing (alpha=1.0)"]
    Step7 --> Step8["8. Evaluasi Model pada Data Uji (Confusion Matrix, Akurasi 90.50%)"]
    Step8 --> Step9["9. Prediksi Seluruh 5.000 Data & Deteksi Anomali Rating vs Teks"]
    Step9 --> Step10["10. Deployment Executive BI Dashboard (dashboard.html)"]
    Step10 --> End(["Selesai"])
```

---

## 2. Alur Scraping Data Google Play Store

```mermaid
flowchart TD
    StartScrape(["Mulai Scraping"]) --> SetTarget["Tentukan Target: App ID 'app.bpjs.mobile' dan 5.000 Ulasan"]
    SetTarget --> ReqAppInfo["Request Metadata Aplikasi Play Store (Title, Dev, Rating, Update)"]
    ReqAppInfo --> InitBatch["Inisialisasi: allReviews = Kosong, Token = Null, Batch = 1"]
    
    InitBatch --> LoopStart{"Apakah Total Ulasan < 5.000?"}
    LoopStart -- "Ya" --> FetchReview["Request Batch Ulasan Play Store (num: 150, paginate: true, sort: NEWEST)"]
    FetchReview --> PushReviews["Tambahkan Batch ke allReviews"]
    PushReviews --> CheckToken{"Ada Next Pagination Token?"}
    CheckToken -- "Ya" --> Delay["Delay 300ms (Anti Rate Limit)"]
    Delay --> NextLoop["Update Token dan Batch++"]
    NextLoop --> LoopStart
    CheckToken -- "Tidak" --> BreakLoop["Selesai Loop Pagination"]
    LoopStart -- "Tidak" --> BreakLoop
    
    BreakLoop --> FormatData["Pembersihan Format: No, User, Rating, Tanggal, Text, ThumbsUp"]
    FormatData --> SaveFiles["Simpan File: mobile_jkn_reviews_5000.json dan .csv"]
    SaveFiles --> EndScrape(["Selesai Scraping"])
```

---

## 3. Alur Text Preprocessing (Emoji + Sastrawi + TF-IDF)

```mermaid
flowchart TD
    RawText[/"Input: Teks Ulasan Mentah Pengguna"/] --> EmojiMap["1. Emoji Translation: 👍 -> emoji_jempol_bagus, 🔪 -> emoji_bahaya_ancaman"]
    EmojiMap --> CaseFold["2. Case Folding: Ubah semua karakter ke huruf kecil"]
    CaseFold --> CleanRegex["3. Data Cleansing: Hapus URL, Tanda Baca, Karakter Non-Alfanumerik"]
    CleanRegex --> ReduceChar["4. Reduksi Karakter Repetitif: 'baguuuss' -> 'bagus', 'erorrr' -> 'error'"]
    ReduceChar --> Tokenize["5. Tokenisasi: Pemisahan kalimat menjadi array kata"]
    Tokenize --> NormalizeSlang["6. Normalisasi Slang: Ganti kata gaul ('bgus' -> 'bagus', 'gak' -> 'tidak')"]
    NormalizeSlang --> Stemming["7. Sastrawi Stemming: Reduksi morfologi kata ('mempermudah' -> 'mudah')"]
    Stemming --> FormBigram["8. Pembentukan Unigram + Bigram: 'tidak' + 'bisa' -> 'tidak_bisa'"]
    FormBigram --> RemoveStopwords["9. Stopword Filtering: Hapus kata umum tanpa menghapus kata negasi"]
    
    RemoveStopwords --> CleanTokens[/"Output: Cleaned Tokens"/]
    CleanTokens --> CalcTF["Hitung Term Frequency (TF) per Dokumen"]
    CalcTF --> CalcIDF["Hitung Inverse Document Frequency (IDF) Korpus Latih"]
    CalcIDF --> CalcTFIDF["Hitung Bobot TF-IDF = TF x IDF"]
    CalcTFIDF --> L2Norm["Terapkan Normalisasi Euclidean L2-Norm"]
    L2Norm --> OutVec[/"Output: Vektor Fitur Numerik Machine Learning"/]
```

---

## 4. Alur Pelatihan & Evaluasi Model Multinomial Naive Bayes

```mermaid
flowchart TD
    Dataset[/"Dataset Master Ground Truth (5.000 Data)"/] --> Split["Train-Test Split: 80% Training (4.000) dan 20% Testing (1.000)"]
    
    Split --> TrainSet["Data Latih: 4.000 Ulasan"]
    Split --> TestSet["Data Uji: 1.000 Ulasan"]
    
    TrainSet --> FitTFIDF["Fit TF-IDF Vectorizer: Ukuran Vocabulary 5.537 Fitur"]
    FitTFIDF --> TransformTrain["Transform Data Latih ke Matriks Vektor TF-IDF"]
    
    TransformTrain --> TrainMNB["Hitung Prior P(C) dan Likelihood P(W|C) dengan Laplace Smoothing (alpha=1.0)"]
    TrainMNB --> ModelReady["Model Multinomial Naive Bayes Terlatih"]
    
    TestSet --> TransformTest["Transform Data Uji ke Matriks Vektor TF-IDF"]
    TransformTest --> PredictTest["Model Memprediksi Data Uji (y_pred)"]
    ModelReady --> PredictTest
    
    PredictTest --> EvalConfusion["Evaluasi Confusion Matrix (Actual vs Predicted)"]
    EvalConfusion --> CalcMetrics["Hitung Akurasi (90.50%), Precision (94.24%), Recall (93.67%), F1-Score (93.43%)"]
    CalcMetrics --> EvalDone(["Evaluasi Selesai"])
```

---

## 5. Alur Deteksi Anomali & Executive Dashboard

```mermaid
flowchart TD
    Full5000[/"5.000 Ulasan Dataset Play Store"/] --> PreprocessAll["Jalankan Preprocessing NLP pada 5.000 Data"]
    PreprocessAll --> VectorizeAll["Transform ke Vektor TF-IDF"]
    VectorizeAll --> PredictProba["Inferensi Naive Bayes: Hitung Posterior & Softmax Confidence"]
    
    PredictProba --> CheckTokenLength{"Apakah Token Kosong / Simbol 📐?"}
    CheckTokenLength -- "Ya (Simbol / Spasi)" --> FallbackScore["Score-Aware Fallback: Ikuti Rating Bintang (95% Conf, Sesuai)"]
    CheckTokenLength -- "Tidak" --> CheckAnomaly{"Bandingkan Rating Bintang vs Prediksi ML"}
    
    CheckAnomaly -- "Rating 4-5 & Prediksi Negatif" --> Anomaly1["🚨 Bintang 4-5 tapi Prediksi ML Negatif (Taktik Komplain)"]
    CheckAnomaly -- "Rating 1-2 & Prediksi Positif (Ada Kata Positif)" --> Anomaly2["💡 Bintang 1-2 tapi Prediksi ML Positif (Pujian / Salah Klik)"]
    CheckAnomaly -- "Konsisten / Sesuai" --> Match["Status: Sesuai"]
    
    FallbackScore --> SavePayload["Kompilasi ke mobile_jkn_reviews_5000.js & .json & .csv"]
    Anomaly1 --> SavePayload
    Anomaly2 --> SavePayload
    Match --> SavePayload
    
    SavePayload --> RenderDashboard["Render Executive BI Dashboard (dashboard.html)"]
    RenderDashboard --> UserInteract["Interaksi User: Filter Multi-Kriteria, Search, Export CSV, Print PDF"]
```
