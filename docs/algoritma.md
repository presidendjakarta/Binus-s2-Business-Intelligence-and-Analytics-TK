# Arsitektur Algoritma & Pipeline Sistem Text Mining Mobile JKN

Dokumen ini menyajikan spesifikasi teknis arsitektur sistem, alur pemrosesan data, dan algoritma *Natural Language Processing* (NLP) serta *Machine Learning* (Multinomial Naive Bayes) pada ulasan aplikasi **Mobile JKN**.

---

## 1. Diagram Arsitektur Komponen Sistem

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE PLAY STORE API                           │
│                     (App ID: app.bpjs.mobile)                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │  scrap-jkn.js (Pagination & Jitter Token)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  DATA REPOSITORY (data/{timestamp}/)                   │
│               - reviews.json  - reviews.csv  - meta.json               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │  run-analisa.js
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ADVANCED NLP PREPROCESSING PIPELINE                  │
│  1. Emoji Sentiment Translation (emojis.csv: 🙏->tolong, 👍->bagus)    │
│  2. Case Folding & Text Cleaning (Regex URL, mentions, symbols)        │
│  3. Rhetorical Idiom Normalization ("apa gunanya" -> "tidak berguna") │
│  4. Slang & Typo Normalization (slang.csv - 1-to-1 Mapping)            │
│  5. Contextual Clause Splitting (Adversative 'tapi' vs 'padahal')      │
│  6. Multi-Step Negation Windowing ("tidak bgt membantu" -> tidak_bantu)│
│  7. Stopwords & Pronouns Filtering (stopwords.csv + domain pronouns)   │
│  8. Sastrawi Stemmer + Domain Lexicon + Memoization Cache              │
│  9. Keyword Protection (perbaiki/pembenahan != baik)                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               WEIGHTED FEATURE EXTRACTION (TF-IDF)                     │
│  - Sublinear Term Frequency Scaling: 1 + ln(TF)                        │
│  - Smooth Inverse Document Frequency: ln((1+N)/(1+DF)) + 1             │
│  - Sentiment Polarity Boosting (2x weight for opinion tokens)          │
│  - L2 Vector Normalization                                             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  MULTINOMIAL NAIVE BAYES CLASSIFIER                    │
│  - Class Prior: P(c) dengan Laplace Correction                         │
│  - Feature Likelihood P(w|c) dengan Laplace Smoothing (α=1.0)          │
│  - Log-Likelihood Aggregation (Anti-underflow)                         │
│  - Softmax Posterior Probabilities & Confidence Score                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│              ANOMALY DETECTION & ASPECT CLASSIFICATION                 │
│  - Anomaly Mismatch: Bintang 4-5 tapi Sentimen Negatif (Komplain)      │
│  - Anomaly Mismatch: Bintang 1-2 tapi Sentimen Positif (Salah Rating)  │
│  - Multi-Aspect Categorizer: Autentikasi, Antrean, Kinerja, Iuran      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│           EXECUTIVE BUSINESS INTELLIGENCE DASHBOARD (HTML)             │
│  - Clean Enterprise Admin Theme (Bootstrap 5 + DataTables)             │
│  - KPI Cards, Interactive Charts (Chart.js), Operational Aspect Cards  │
│  - Full jQuery DataTables: Search, Multi-Sort, Export (CSV/Excel/Print)│
│  - Direct Play Store Links (target="_blank" rel="noopener noreferrer") │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tahapan Rinci Pipeline Algoritma

### Tahap 1: Data Ingestion (Scraping Play Store)
- Mengambil ulasan publik dari Google Play Store secara berkala menggunakan library `google-play-scraper`.
- Mengimplementasikan paginasi berbasis token, mekanisme anti-blokir (*request jitter 1-2 detik*), dan deduplikasi ulasan berdasarkan `reviewId`.
- Menyimpan dataset mentah dalam format JSON dan CSV berstempel waktu di `data/{timestamp}/`.

### Tahap 2: Natural Language Preprocessing (NLP) Berbasis Konteks Kalimat
1. **Emoji Sentiment Translation:** Menerjemahkan 80+ emoji visual ke padanan kata sentimen bahasa Indonesia (misal: 👍 $ightarrow$ *bagus*, 😡 $ightarrow$ *marah kesal*, 🙏 $ightarrow$ *tolong/mohon*).
2. **Text Sanitization & Noise Reduction:** Menghapus tautan URL, tanda pagar, mention, karakter non-alfanumerik, serta menormalkan karakter berulang (*elongated words*, misal *"baguuus"* $ightarrow$ *"bagus"*).
3. **Rhetorical Complaint Normalization:** Mengidentifikasi pertanyaan retoris keluhan yang sering salah terbaca sebagai pujian (misal *"apa gunanya"* $ightarrow$ *"tidak_guna"*, *"tidak memberikan solusi"* $ightarrow$ *"kecewa tidak_solusi"*).
4. **Slang & Colloquial Normalization:** Mengonversi 860+ kata gaul/singkatan Play Store menjadi kata baku secara aman (1-to-1) tanpa merusak struktur kata majemuk.
5. **Contextual Clause Splitting & Conjunction Weighting:**
   - **Adversative (*tapi, tetapi, namun, malah*):** Memberikan bobot ganda (2x) pada klausa keluhan **setelah** kata sambung.
   - **Concessive (*padahal, meskipun, walaupun*):** Memberikan bobot ganda (2x) pada klausa utama **sebelum** kata sambung.
6. **Multi-Step Negation Windowing:** Melompati kata keterangan (*sangat, bgt, sanggup, bisa*) hingga 2 kata ke depan untuk mengikat negasi secara tepat (*misal: "tidak bgt membantu"* $ightarrow$ `tidak_bantu`, *"gak ada"* $ightarrow$ `tidak_ada`).
7. **Stopwords & Pronouns Removal:** Menyaring kata tugas dan kata sapaan percakapan (*kak, min, admin, gan, bang, saya, yang, di, ke*) tanpa membuang kata pembawa sentimen.
8. **Sastrawi Morphological Stemming:** Mereduksi kata berimbuhan ke kata dasar menggunakan algoritma Nazief-Adriani dengan kamus 29.932 kata dasar + istilah domain Mobile JKN (*bpjs, jkn, faskes, nik, otp, rujukan, autodebet*).
9. **Complaint Keyword Protection:** Memproteksi kata keluhan kritis seperti `perbaiki`, `perbaikan`, `benahi` agar tidak terpotong menjadi kata positif `baik`.

### Tahap 3: Pembobotan Fitur TF-IDF (Term Frequency - Inverse Document Frequency)
- Menghitung frekuensi kemunculan term ($TF$) dengan skala sublinear: $1 + ln(TF)$.
- Menghitung kebalikan frekuensi dokumen ($IDF$) tersmoothing: $lnleft(rac{1 + N}{1 + DF}ight) + 1$.
- Memberikan bobot ganda (*2x multiplier*) pada token polaritas inti (`tidak_*`, `kecewa`, `buruk`, `rusak`, `error`, `bagus`, `mantap`) agar tidak tenggelam oleh kata benda institusional (*kantor, administrasi*).
- Menormalisasi vektor dokumen dengan norma Euclidean ($L_2$-Norm).

### Tahap 4: Pembelajaran Model Naive Bayes
- Menghitung probabilitas prior kelas $P(	ext{Positif})$ dan $P(	ext{Negatif})$.
- Menghitung *conditional likelihood* $P(w_i mid c)$ dengan **Laplace Smoothing ($alpha=1.0$)** untuk mengatasi masalah nilai nol (*zero-frequency problem*).
- Menjumlahkan bobot log-likelihood untuk mencegah *arithmetic underflow*.
- Menghitung probabilitas posterior terkalibrasi menggunakan fungsi **Softmax Normalization**.

### Tahap 5: Deteksi Anomali & Klasifikasi Aspek Operasional
- **Deteksi Anomali (Mismatch):** Membandingkan kesesuaian antara rating bintang pengguna (1-5) dengan hasil klasifikasi teks Naive Bayes untuk mendeteksi taktik bintang 5 semu atau keluhan salah rating.
- **Klasifikasi Aspek:** Memetakan ulasan ke dalam 5 modul operasional: *Autentikasi & Akun*, *Antrean & Faskes*, *Kinerja & Server*, *Iuran & Layanan*, dan *Lainnya*.

### Tahap 6: Generasi Laporan Dashboard Eksekutif
- Membangun file visualisasi mandiri `dashboard.html` (100% standalone, data tertanam secara statis).
- Menyediakan tabel interaktif **jQuery DataTables** lengkap dengan live search, multi-column sorting, filter aspek/rating/sentimen/anomali, tombol ekspor CSV/Excel/Print, dan link langsung ke ulasan Google Play Store.
