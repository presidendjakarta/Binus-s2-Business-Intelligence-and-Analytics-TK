# Diagram Alir Sistem (Flowchart)

Berikut adalah diagram alir proses analisis teks ulasan Mobile JKN dari tahap scraping hingga visualisasi dashboard:

```mermaid
flowchart TD
    Start([Mulai]) --> Scrap[1. Scraping Ulasan Play Store
'node scrap-jkn.js data=5000']
    Scrap --> SaveData[(Simpan Dataset Mentah
'data/YYYY-MM-DD_HH-mm/reviews.json')]
    
    SaveData --> TriggerAnalisa[2. Eksekusi Pipeline Analitik
'node run-analisa.js']
    
    subgraph NLP_Pipeline ["Tahap NLP Preprocessing Berbasis Konteks"]
        TriggerAnalisa --> LoadCSV[Muat Kamus Master Data
'slang.csv, emojis.csv, stopwords.csv']
        LoadCSV --> EmojiTrans[1. Translasi Sentimen Emoji
misal: 👍->bagus, 🙏->tolong]
        EmojiTrans --> CleanText[2. Case Folding & Pembersihan Regex
URL, Mention, Simbol, Elongasi]
        CleanText --> IdiomNorm[3. Normalisasi Idiom Retoris
misal: 'apa gunanya' -> 'tidak_guna']
        IdiomNorm --> SlangNorm[4. Normalisasi Slang 1-to-1
misal: 'apk' -> 'aplikasi', 'lemot' -> 'lambat']
        SlangNorm --> ClauseSplit[5. Contextual Clause Splitting
Adversative 'tapi' vs Concessive 'padahal']
        ClauseSplit --> NegationWindow[6. Multi-Step Negation Windowing
misal: 'tidak bgt membantu' -> 'tidak_bantu']
        NegationWindow --> Stopwords[7. Penyaringan Stopwords & Pronoun Percakapan
misal: 'kak', 'min', 'yang', 'di']
        Stopwords --> Stemming[8. Morphological Stemming ts-sastrawi
+ Proteksi Kata Keluhan 'perbaiki']
    end

    NLP_Pipeline --> Labeling[Supervisi Ground Truth & Rating Bintang]
    Labeling --> TFIDF[3. Pembobotan Vektor TF-IDF Terbobot
Sublinear TF + Smooth IDF + 2x Opinion Boosting]
    
    subgraph MNB_Training ["Model Klasifikasi Multinomial Naive Bayes"]
        TFIDF --> TrainPrior[Hitung Prior Probability P(c)]
        TrainPrior --> TrainLikelihood[Hitung Likelihood P(w|c)
dengan Laplace Smoothing alpha=1.0]
        TrainLikelihood --> LogLikelihood[Akumulasi Log-Likelihood
Pencegahan Underflow Numerik]
        LogLikelihood --> SoftmaxPosterior[Normalisasi Probabilitas Posterior Softmax]
    end

    SoftmaxPosterior --> CrossVal[4. Evaluasi Model (5-Fold Cross-Validation)
Accuracy, Precision, Recall, Macro F1, Confusion Matrix]
    CrossVal --> AnomalyAspect[5. Deteksi Anomali (Mismatch) & Klasifikasi Aspek Operasional]
    AnomalyAspect --> TopKeywords[Ekstraksi Top 15 Kata Kunci Positif & Negatif]
    
    subgraph Output_Generation ["Generasi Laporan & Visualisasi"]
        TopKeywords --> GenJSON[Simpan 'predictions.json' & 'metrics.json']
        GenJSON --> GenCSV[Simpan 'predictions.csv']
        GenCSV --> GenHTML[Embed Dataset ke 'dashboard.html'
Clean Enterprise Admin + DataTables]
    end

    Output_Generation --> OpenDash[6. Buka Dashboard Interaktif
'node open-report.js']
    OpenDash --> End([Selesai])
```
