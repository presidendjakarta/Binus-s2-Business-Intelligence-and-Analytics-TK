# 📖 Kamus Istilah Data Mining & Cheat Sheet Sidang Dosen
## Panduan Istilah & Template Jawaban Sidang: Multinomial Naive Bayes Mobile JKN

Dokumen ini adalah **"senjata rahasia"** untuk persiapan menghadapi ujian / sidang presentasi skripsi/tesis. Semua istilah teknis dijelaskan dengan **bahasa manusiawi yang sangat mudah dipahami**, dilengkapi analogi nyata dan template cara menjawab pertanyaan dosen.

---

## 📑 Daftar Isi
1. [Konsep Dasar Data Mining & NLP](#1-konsep-dasar-data-mining--nlp)
2. [Tahapan Preprocessing Teks & Emoji](#2-tahapan-preprocessing-teks--emoji)
3. [Ekstraksi Fitur TF-IDF](#3-ekstraksi-fitur-tf-idf)
4. [Klasifikasi Machine Learning (Multinomial Naive Bayes)](#4-klasifikasi-machine-learning-multinomial-naive-bayes)
5. [Metrik Evaluasi Model (Confusion Matrix)](#5-metrik-evaluasi-model-confusion-matrix)
6. [Istilah Khusus Studi Kasus Mobile JKN & Anomali](#6-istilah-khusus-studi-kasus-mobile-jkn--anomali)
7. [🎯 Cheat Sheet: 8 Pertanyaan Favorit Dosen & Cara Menjawabnya](#7--cheat-sheet-8-pertanyaan-favorit-dosen--cara-menjawabnya)

---

## 1. Konsep Dasar Data Mining & NLP

### 🔹 Data Mining (Penambangan Data)
- **Artinya**: Proses otomatis mengekstrak pola, informasi berguna, dan wawasan tersembunyi dari sekumpulan data mentah yang sangat besar (5.000 ulasan Play Store).
- **Analogi**: Menambang emas di sungai — memisahkan butiran pasir tak berguna (komentar spam/huruf acak) untuk mendapatkan emas murni (keluhan nyata masyarakat tentang BPJS).

### 🔹 NLP (Natural Language Processing)
- **Artinya**: Cabang kecerdasan buatan (AI) yang membuat komputer mampu membaca, memahami tata bahasa gaul, singkatan, emoji, dan emosi di balik kalimat manusia.

### 🔹 Sentiment Analysis (Analisis Sentimen / Opinion Mining)
- **Artinya**: Klasifikasi komputasional untuk menentukan apakah suatu ulasan bernada **Positif** (puas/senang), **Negatif** (kecewa/marah), atau **Netral**.

### 🔹 Supervised Learning (Pembelajaran Terawasi)
- **Artinya**: Metode Machine Learning di mana model dilatih menggunakan contoh soal yang sudah ada kunci jawabannya (*Ground Truth*).

### 🔹 Ground Truth (Kunci Jawaban Sebenarnya)
- **Artinya**: Label sentimen yang sebenarnya dari suatu ulasan setelah dikoreksi secara objektif dari anomali rating bintang.

---

## 2. Tahapan Preprocessing Teks & Emoji

### 🔹 Emoji Semantic Translation
- **Artinya**: Menerjemahkan icon emoji ke dalam token representatif (`👍` $\rightarrow$ `emoji_jempol_bagus`, `🔪` $\rightarrow$ `emoji_bahaya_ancaman`) sebelum tanda baca dibersihkan.

### 🔹 Case Folding
- **Artinya**: Mengubah semua huruf menjadi huruf kecil (*lowercase*).
- **Contoh**: `"APLIKASI JELEK BANGET"` ➔ `"aplikasi jelek banget"`.

### 🔹 Data Cleansing (Pembersihan Regex)
- **Artinya**: Menghapus karakter yang tidak bermakna seperti URL website, angka, dan simbol liar non-alfanumerik.

### 🔹 Karakter Reduksi (Repetition Reduction)
- **Artinya**: Menormalkan huruf yang diketik berulang-ulang karena emosi pengguna.
- **Contoh**: `"baguuussss"` ➔ `"bagus"`, `"erorrr"` ➔ `"error"`.

### 🔹 Normalisasi Slang (Slang Normalization)
- **Artinya**: Mengubah bahasa gaul, singkatan chatting, dan typo menjadi kata baku bahasa Indonesia.
- **Contoh**: `"bgus"` ➔ `"bagus"`, `"gak"` ➔ `"tidak"`, `"molo"` ➔ `"terus"`, `"wuelek"` ➔ `"buruk"`.

### 🔹 Sastrawi Morphological Stemming
- **Artinya**: Mengubah kata berimbuhan bahasa Indonesia menjadi kata dasar dengan algoritma Nazief-Adriani (*"mempermudah"* $\rightarrow$ *"mudah"*, *"antrean"* $\rightarrow$ *"antri"*).

### 🔹 Tokenisasi (Tokenization)
- **Artinya**: Memotong kalimat panjang menjadi potongan kata-kata tunggal (*token*).

### 🔹 N-Gram (Unigram & Bigram)
- **Artinya**: Menggabungkan pasangan kata bersebelahan agar makna konteks tidak hilang (`"tidak_bisa"`, `"sangat_membantu"`).

### 🔹 Stopword Removal Terpilih
- **Artinya**: Membuang kata-kata sambung umum yang tidak menentukan emosi (*"dan", "di", "ke", "pada"*), tetapi **tetap mempertahankan kata negasi** (*"tidak", "bukan", "belum"*).

---

## 3. Ekstraksi Fitur TF-IDF

### 🔹 Term Frequency (TF)
- **Artinya**: Seberapa sering suatu kata muncul di dalam sebuah ulasan.

### 🔹 Inverse Document Frequency (IDF)
- **Artinya**: Faktor kelangkaan kata di seluruh 5.000 ulasan. Kata umum diberi bobot kecil, kata unik/kritis diberi bobot besar.

### 🔹 TF-IDF Weighting & L2 Normalization
- **Artinya**: Penggabungan bobot $TF \times IDF$ yang dinormalisasi ke panjang unit 1 agar panjang teks tidak membiaskan probabilitas.

### 🔹 Vocabulary (Perbendaharaan Kata Fitur)
- **Artinya**: Daftar seluruh kata unik yang dipelajari model dari data latih (**5.537 fitur unik**).

---

## 4. Klasifikasi Machine Learning (Multinomial Naive Bayes)

### 🔹 Multinomial Naive Bayes (MNB)
- **Artinya**: Algoritma klasifikasi berbasis Teorema Probabilitas Bayes yang menghitung peluang suatu ulasan masuk kelas Positif atau Negatif berdasarkan bobot frekuensi kemunculan kata-kata di dalamnya.
- **Keunggulan**: Sangat ringan, akurasi tinggi pada teks, dan kecepatan proses kilat (< 0.05 ms/ulasan).

### 🔹 Prior Probability ($P(C)$)
- **Artinya**: Peluang dasar kemunculan kelas sentimen sebelum membaca isi ulasan ($P(Pos) = 53.3\%$, $P(Neg) = 46.7\%$).

### 🔹 Likelihood ($P(W \mid C)$)
- **Artinya**: Peluang munculnya kata tertentu jika kelas sentimennya Positif atau Negatif.

### 🔹 Laplace Smoothing ($\alpha = 1.0$)
- **Artinya**: Teknik penambahan angka 1 pada pembilang agar kata baru pada data uji tidak menghasilkan nilai probabilitas nol ($P=0$) yang dapat membatalkan perkalian Bayes (*Zero Probability Trap*).

---

## 5. Metrik Evaluasi Model (Confusion Matrix)

### 🔹 Confusion Matrix (Tabel Evaluasi)
| Istilah | Kepanjangan | Maksudnya | Nilai Data Uji (1.000 Ulasan) |
| :--- | :--- | :--- | :---: |
| **TP** | *True Positive* | Aslinya Positif, model menebak **Positif** (Tebakan Benar). | **491** |
| **TN** | *True Negative* | Aslinya Negatif, model menebak **Negatif** (Tebakan Benar). | **414** |
| **FP** | *False Positive* | Aslinya Negatif, tapi model salah menebak **Positif** (Salah Tuduh). | **28** |
| **FN** | *False Negative* | Aslinya Positif, tapi model salah menebak **Negatif** (Kelewatan). | **39** |

- **Akurasi (Accuracy)**: **90.50%** — Persentase total tebakan benar dari seluruh data uji.
- **Presisi (Precision)**: **94.24% (Positif)** — Dari seluruh ulasan yang ditebak Positif, 94.24% terbukti benar Positif.
- **Perolehan (Recall)**: **92.64% (Positif) & 93.67% (Negatif)** — Kemampuan model menjaring komplain negatif masyarakat.
- **F1-Score**: **93.43% (Positif) & 89.90% (Negatif)** — Rata-rata harmonik seimbang antara Precision dan Recall.

---

## 6. Istilah Khusus Studi Kasus Mobile JKN & Anomali

### 🔹 Rating-Text Inconsistency (Ketidaksesuaian Rating vs Teks)
- **Artinya**: Fenomena di mana bintang yang diklik pengguna bertolak belakang dengan isi teks ulasannya.
- **Temuan Riset**: Terdapat **211 ulasan anomali (4.2%)** pada 5.000 data ulasan Mobile JKN.

### 🔹 Taktik "Bintang 5 Biar Dibaca Developer" (83 Kasus)
- **Artinya**: Pengguna sengaja memberi ⭐5 padahal isinya keluhan keras, agar ulasannya naik ke urutan teratas Play Store.

### 🔹 Sarcastic Reviews / Sarkasme (128 Kasus)
- **Artinya**: Pengguna menggunakan kata pujian untuk menyindir kegagalan sistem (*"Terima kasih sudah melatih kesabaran saya..."*).

---

## 7. 🎯 Cheat Sheet: 8 Pertanyaan Favorit Dosen & Cara Menjawabnya

### 💬 Q1: *"Mengapa memilih Multinomial Naive Bayes dibandingkan SVM atau Deep Learning?"*
> **Template Jawaban Anda:**
> *"Multinomial Naive Bayes dipilih karena efisiensi komputasinya yang sangat tinggi $O(N \cdot |V|)$, kebutuhan memori sangat ringan (<50MB), dan performanya sangat optimal pada dimensi teks tinggi (5.537 fitur). Model ini mencapai akurasi 90.50% dalam waktu pelatihan < 2 detik."*

---

### 💬 Q2: *"Apa fungsi Laplace Smoothing (alpha = 1)?"*
> **Template Jawaban Anda:**
> *"Laplace Smoothing berfungsi mengatasi masalah Zero Probability Trap. Jika muncul kata baru di data uji yang belum tercatat pada kelas tertentu di data latih, Laplace Smoothing memberikan nilai dasar kecil sehingga perkalian probabilitas tidak menjadi nol."*

---

### 💬 Q3: *"Mengapa perlu Sastrawi Stemmer?"*
> **Template Jawaban Anda:**
> *"Bahasa Indonesia memiliki banyak variasi afiksasi (misal: 'mempermudah', 'kemudahan'). Sastrawi Stemmer mereduksi seluruh kata berimbuhan ke kata dasar 'mudah', sehingga memperkecil dimensi matriks fitur dan meningkatkan kekuatan bobot kata kunci utama."*

---

### 💬 Q4: *"Bagaimana sistem menangani ulasan yang hanya berisi emoji seperti 👍 atau 🔪?"*
> **Template Jawaban Anda:**
> *"Kami menambahkan modul Emoji Semantic Translation yang memetakan emoji menjadi token sentimen (misal: `emoji_jempol_bagus` atau `emoji_bahaya_ancaman`) sebelum proses pembersihan teks, sehingga emoji tersebut memperoleh bobot TF-IDF dan diklasifikasikan secara akurat oleh Naive Bayes."*

---

### 💬 Q5: *"Bagaimana jika ulasan hanya berisi simbol netral seperti 📐 atau spasi kosong?"*
> **Template Jawaban Anda:**
> *"Untuk ulasan tanpa token kata atau emoji sentimen, sistem menerapkan mekanisme Score-Aware Fallback di mana sentimen merujuk langsung pada rating bintang pengguna dengan confidence 95% tanpa memicu false anomaly."*

---

### 💬 Q6: *"Bagaimana cara Naive Bayes mendeteksi taktik bintang 5 komplain?"*
> **Template Jawaban Anda:**
> *"Model kami menganalisis fitur TF-IDF dari teks ulasan. Ketika ulasan bintang 5 memuat kata keluhan kuat seperti 'sering_error' atau 'tidak_bisa_login', probabilitas posterior $P(Negatif \mid X)$ akan mengalahkan $P(Positif \mid X)$, sehingga anomali berhasil terdeteksi."*

---

### 💬 Q7: *"Mengapa akurasi kelas Netral bernilai 0% pada laporan klasifikasi?"*
> **Template Jawaban Anda:**
> *"Dalam domain ulasan aplikasi seluler, kelas Netral memiliki jumlah data yang sangat sedikit (hanya 28 dari 1.000 data uji) dan kalimatnya cenderung bermakna ganda. Naive Bayes secara statistik condong mengalokasikan data ke kelas mayoritas Positif atau Negatif yang memiliki bukti kata lebih kuat."*

---

### 💬 Q8: *"Apa kontribusi praktis penelitian ini bagi BPJS Kesehatan?"*
> **Template Jawaban Anda:**
> *"Penelitian ini menghasilkan Executive BI Dashboard yang mampu memfilter ribuan ulasan secara instan, mengidentifikasi 5 akar masalah utama pengguna (OTP, login, biometrik, kuota antrean, sinkronisasi NIK), serta mendeteksi 211 anomali rating yang sebelumnya luput dari pantauan."*
