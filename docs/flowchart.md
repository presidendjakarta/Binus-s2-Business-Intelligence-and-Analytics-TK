# 🔄 Dokumentasi Diagram Alir (Flowchart) Sistem

Dokumen ini memuat diagram alir (*flowchart*) seluruh tahapan dalam sistem **Play Store Mining & Hybrid AI Sentiment Analytics Mobile JKN**.

---

## 📑 Daftar Diagram
1. [Flowchart 1: Alur Keseluruhan Sistem (End-to-End Pipeline)](#1-alur-keseluruhan-sistem-end-to-end-pipeline)
2. [Flowchart 2: Alur Scraping Data Google Play Store](#2-alur-scraping-data-google-play-store)
3. [Flowchart 3: Alur Text Preprocessing & Ekstraksi Fitur TF-IDF](#3-alur-text-preprocessing--ekstraksi-fitur-tf-idf)
4. [Flowchart 4: Alur Pelatihan & Evaluasi Model Machine Learning](#4-alur-pelatihan--evaluasi-model-machine-learning)
5. [Flowchart 5: Alur Deteksi Anomali & Visualisasi Dashboard](#5-alur-deteksi-anomali--visualisasi-dashboard)
6. [Flowchart 6: Alur Hybrid AI & Studi Komparatif LLM Gemma 3 vs Naive Bayes](#6-alur-hybrid-ai--studi-komparatif-llm-gemma-3-vs-naive-bayes)

---

## 1. Alur Keseluruhan Sistem (End-to-End Pipeline)

```mermaid
flowchart TD
    Start(["Mulai Proyek"]) --> Step1["1. Data Acquisition / Web Scraping Play Store (5.000 Ulasan)"]
    Step1 --> Step2["2. Penyimpanan Dataset Mentah JSON dan CSV"]
    Step2 --> Step3["3. Pembentukan Master Ground Truth Dataset Teranotasi"]
    Step3 --> Step4["4. Pipeline Text Preprocessing & Normalisasi Slang"]
    Step4 --> Step5["5. Dual-Engine Modeling: Supervised ML & Generative LLM"]
    Step5 --> Step6["6. Pembagian Data ML: 80% Train dan 20% Test"]
    Step6 --> Step7["7. Ekstraksi Fitur TF-IDF & Pelatihan Multinomial Naive Bayes"]
    Step7 --> Step8["8. Inferensi LLM Gemma 3 via Ollama (5.000 Data)"]
    Step8 --> Step9["9. Evaluasi Komparatif & Deteksi Anomali Ulasan"]
    Step9 --> Step10["10. Deployment Dual Dashboard: ML Dashboard & LLM Hub"]
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

## 3. Alur Text Preprocessing & Ekstraksi Fitur TF-IDF

```mermaid
flowchart TD
    RawText[/"Input: Teks Ulasan Mentah Pengguna"/] --> CaseFold["1. Case Folding: Ubah semua karakter ke huruf kecil"]
    CaseFold --> CleanRegex["2. Data Cleansing: Hapus URL, Tanda Baca Aneh, Emotikon Khusus"]
    CleanRegex --> ReduceChar["3. Reduksi Karakter Repetitif: 'baguuuss' -> 'bagus', 'erorrr' -> 'error'"]
    ReduceChar --> Tokenize["4. Tokenisasi: Pemisahan kalimat menjadi array kata"]
    Tokenize --> NormalizeSlang["5. Normalisasi Slang: Mengganti kata gaul/singkatan dengan kata baku"]
    NormalizeSlang --> FormBigram["6. Pembentukan Unigram + Bigram: 'tidak' + 'bisa' -> 'tidak_bisa'"]
    FormBigram --> RemoveStopwords["7. Stopword Filtering: Hapus kata umum tanpa menghapus kata negasi"]
    
    RemoveStopwords --> CleanTokens[/"Output: Cleaned Tokens"/]
    CleanTokens --> CalcTF["Hitung Term Frequency (TF) per Dokumen"]
    CalcTF --> CalcIDF["Hitung Inverse Document Frequency (IDF) Korpus"]
    CalcIDF --> CalcTFIDF["Hitung Bobot TF-IDF = TF x IDF"]
    CalcTFIDF --> L2Norm["Terapkan Normalisasi Euclidean L2-Norm"]
    L2Norm --> OutVec[/"Output: Vektor Fitur Numerik Machine Learning"/]
```

---

## 4. Alur Pelatihan & Evaluasi Model Machine Learning

```mermaid
flowchart TD
    Dataset[/"Dataset Master Ground Truth (5.000 Data)"/] --> Split["Train-Test Split: 80% Training dan 20% Testing"]
    
    Split --> TrainSet["Data Latih: 4.000 Ulasan"]
    Split --> TestSet["Data Uji: 1.000 Ulasan"]
    
    TrainSet --> FitTFIDF["Fit TF-IDF Vectorizer: Ukuran Vocabulary 5.574 Fitur"]
    FitTFIDF --> TransformTrain["Transform Data Latih ke Matriks Vektor TF-IDF"]
    
    TransformTrain --> TrainMNB["Hitung Prior P(C) dan Likelihood P(W, C) dengan Laplace Smoothing (alpha=1)"]
    TrainMNB --> ModelReady["Model Multinomial Naive Bayes Terlatih"]
    
    TestSet --> TransformTest["Transform Data Uji ke Matriks Vektor TF-IDF"]
    TransformTest --> PredictTest["Model Memprediksi Data Uji (y_pred)"]
    ModelReady --> PredictTest
    
    PredictTest --> EvalConfusion["Hitung Confusion Matrix: TP, FP, TN, FN"]
    EvalConfusion --> CalcMetrics["Hitung Akurasi: 88.00%, Precision: 93.59%, Recall: 88.95%, F1: 91.21%"]
    CalcMetrics --> EvalReport[/"Output: Evaluation and Classification Report"/]
```

---

## 5. Alur Deteksi Anomali & Visualisasi Dashboard

```mermaid
flowchart TD
    ReviewInput[/"Data Ulasan: Rating Bintang Play Store dan Prediksi ML"/] --> CheckAnomaly{"Cek Kondisi Anomali"}
    
    CheckAnomaly -- "Rating >= 4 DAN ML Negatif" --> AnomalyHigh["🚨 Anomali Taktik: Bintang 5 Komplain Keras"]
    CheckAnomaly -- "Rating <= 2 DAN ML Positif" --> AnomalyLow["💡 Anomali Human Error: Bintang 1-2 Pujian / Sarkasme"]
    CheckAnomaly -- "Rating dan ML Selaras" --> MatchStatus["✓ Status Sesuai / Match"]
    
    AnomalyHigh --> BundleData["Kompilasi Bundle Dataset JS dan JSON"]
    AnomalyLow --> BundleData
    MatchStatus --> BundleData
    
    BundleData --> RenderDashboard["Muat di dashboard.html"]
    RenderDashboard --> CardMetrics["Render KPI Cards: Akurasi 88%, Precision, Recall, Total Ulasan"]
    RenderDashboard --> ChartMatrix["Render Confusion Matrix Heatmap"]
    RenderDashboard --> ChartComp["Render Bar Chart: Rating vs Ground Truth vs Prediksi ML"]
    RenderDashboard --> ChartKeywords["Render Top TF-IDF Features Negatif dan Positif"]
    RenderDashboard --> DataTable["Render Tabel Interaktif: Live Search, Filter Bintang, Filter Anomali"]
```

---

## 6. Alur Hybrid AI & Studi Komparatif LLM Gemma 3 vs Naive Bayes

```mermaid
flowchart TD
    RawData[/"5.000 Ulasan Mentah Mobile JKN"/] --> SplitBranch{"Pemisahan Pipeline Analisis"}
    
    subgraph Classical_ML [Pipeline 1: Supervised ML]
        SplitBranch -->|Kecepatan Tinggi| Preproc["Preprocessing Manual: Slang & Stopwords"]
        Preproc --> TFIDF["TF-IDF Feature Extractor"]
        TFIDF --> MNB["Multinomial Naive Bayes Model"]
        MNB --> PredML["Prediksi Sentimen: Positif vs Negatif (Latency < 0.05ms)"]
    end
    
    subgraph Generative_AI [Pipeline 2: Local LLM Gemma 3]
        SplitBranch -->|Penalaran Dalam| LLM_Prompt["Zero-Shot Schema Constrained Prompt"]
        LLM_Prompt --> Ollama["Local Ollama API (gemma3:latest)"]
        Ollama --> JSON_Out["Structured Output: Sentiment, Category, Reasoning"]
    end
    
    PredML --> Benchmark["Evaluator Head-to-Head Comparative Study (5.000 Data)"]
    JSON_Out --> Benchmark
    
    Benchmark --> Metrics["Metrik: Akurasi MNB (88.0%) vs LLM (92.6%), Kesepakatan (95.6%)"]
    Benchmark --> Issues["Ekstraksi Kategori Isu: Bug 38.7%, Apresiasi 48.3%, Fitur 8.7%, Layanan 3.9%"]
    Benchmark --> Dash["Visualisasi di dashboard_llm.html & Live AI Playground"]
```
