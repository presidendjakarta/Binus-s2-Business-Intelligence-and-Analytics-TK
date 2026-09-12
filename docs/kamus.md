# 📖 Kamus Istilah Data Mining & Cheat Sheet Sidang Dosen

Dokumen ini adalah **"senjata rahasia"** untuk persiapan menghadapi ujian / sidang presentasi dosen. Semua istilah teknis dijelaskan dengan **bahasa manusiawi yang sangat mudah dipahami**, dilengkapi analogi nyata dan template cara menjawab pertanyaan dosen.

---

## 📑 Daftar Isi
1. [Konsep Dasar Data Mining & NLP](#1-konsep-dasar-data-mining--nlp)
2. [Tahapan Preprocessing Teks](#2-tahapan-preprocessing-teks)
3. [Ekstraksi Fitur TF-IDF](#3-ekstraksi-fitur-tf-idf)
4. [Klasifikasi Machine Learning (Naive Bayes)](#4-klasifikasi-machine-learning-naive-bayes)
5. [Generative AI & Large Language Model (Gemma 3)](#5-generative-ai--large-language-model-gemma-3)
6. [Metrik Evaluasi Model (Confusion Matrix)](#6-metrik-evaluasi-model-confusion-matrix)
7. [Istilah Khusus Studi Kasus Mobile JKN](#7-istilah-khusus-studi-kasus-mobile-jkn)
8. [🎯 Cheat Sheet: 8 Pertanyaan Favorit Dosen & Cara Menjawabnya](#8--cheat-sheet-8-pertanyaan-favorit-dosen--cara-menjawabnya)

---

## 1. Konsep Dasar Data Mining & NLP

### 🔹 Data Mining (Penambangan Data)
- **Artinya**: Proses otomatis mengekstrak pola, informasi berguna, dan wawasan tersembunyi dari sekumpulan data mentah yang sangat besar (5.000 ulasan Play Store).
- **Analogi**: Menambang emas di sungai — memisahkan butiran pasir tak berguna (komentar spam/huruf acak) untuk mendapatkan emas murni (keluhan nyata masyarakat tentang BPJS).

### 🔹 NLP (Natural Language Processing)
- **Artinya**: Cabang kecerdasan buatan (AI) yang membuat komputer mampu membaca, memahami tata bahasa gaul, singkatan, dan emosi di balik kalimat manusia.

### 🔹 Sentiment Analysis (Analisis Sentimen / Opinion Mining)
- **Artinya**: Klasifikasi komputasional untuk menentukan apakah suatu ulasan bernada **Positif** (puas/senang), **Negatif** (kecewa/marah), atau **Netral**.

### 🔹 Supervised Learning (Pembelajaran Terawasi)
- **Artinya**: Metode Machine Learning di mana model dilatih menggunakan contoh soal yang sudah ada kunci jawabannya (*Ground Truth*).

### 🔹 Ground Truth (Kunci Jawaban Sebenarnya)
- **Artinya**: Label sentimen yang sebenarnya dari suatu ulasan setelah dikoreksi secara objektif.

---

## 2. Tahapan Preprocessing Teks

### 🔹 Case Folding
- **Artinya**: Mengubah semua huruf menjadi huruf kecil (*lowercase*).
- **Contoh**: `"APLIKASI JELEK BANGET"` ➔ `"aplikasi jelek banget"` (agar komputer mengenali kata yang sama).

### 🔹 Data Cleansing (Pembersihan Regex)
- **Artinya**: Menghapus karakter yang tidak bermakna seperti URL website, angka, tanda baca aneh, dan simbol liar.

### 🔹 Karakter Reduksi (Repetition Reduction)
- **Artinya**: Menormalkan huruf yang diketik berulang-ulang karena emosi pengguna.
- **Contoh**: `"baguuussss"` ➔ `"bagus"`, `"erorrr"` ➔ `"error"`.

### 🔹 Normalisasi Slang (Slang Normalization)
- **Artinya**: Mengubah bahasa gaul, singkatan chatting, dan typo menjadi kata baku bahasa Indonesia.
- **Contoh**: `"yg"` ➔ `"yang"`, `"gakbisa"` ➔ `"tidak bisa"`, `"molo"` ➔ `"terus"`, `"wuelek"` ➔ `"buruk"`.

### 🔹 Tokenisasi (Tokenization)
- **Artinya**: Memotong kalimat panjang menjadi potongan kata-kata tunggal (*token*).

### 🔹 N-Gram (Unigram & Bigram)
- **Artinya**: Menggabungkan pasangan kata bersebelahan agar makna tidak hilang.
- **Contoh Unigram**: `["tidak", "bisa"]`
- **Contoh Bigram**: `["tidak_bisa"]` (sangat penting untuk menangkap negasi).

### 🔹 Stopword Removal Terpilih
- **Artinya**: Membuang kata-kata sambung umum yang tidak menentukan emosi (*"dan", "di", "ke", "pada"*), tetapi **tetap mempertahankan kata negasi** (*"tidak", "bukan", "belum"*).

---

## 3. Ekstraksi Fitur TF-IDF

### 🔹 Term Frequency (TF)
- **Artinya**: Seberapa sering suatu kata muncul di dalam sebuah ulasan.

### 🔹 Inverse Document Frequency (IDF)
- **Artinya**: Faktor kelangkaan kata di seluruh 5.000 ulasan. Kata umum diberi bobot kecil, kata unik/kritis diberi bobot besar.

### 🔹 TF-IDF Weighting
- **Artinya**: Penggabungan bobot $TF \times IDF$. Kata spesifik keluhan seperti `jadwal_penuh` atau `otp` akan mendapatkan nilai bobot statistik yang tinggi.

### 🔹 Vocabulary (Perbendaharaan Kata Fitur)
- **Artinya**: Daftar seluruh kata unik yang dipelajari model dari data latih (**5.574 fitur unik**).

---

## 4. Klasifikasi Machine Learning (Naive Bayes)

### 🔹 Multinomial Naive Bayes (MNB)
- **Artinya**: Algoritma klasifikasi berbasis Teorema Probabilitas Bayes yang menghitung peluang suatu ulasan masuk kelas Positif atau Negatif berdasarkan frekuensi kemunculan kata-kata di dalamnya.
- **Keunggulan**: Sangat ringan, akurasi tinggi pada teks, dan kecepatan proses kilat (< 0.05 ms/ulasan).

### 🔹 Prior Probability ($P(C)$)
- **Artinya**: Peluang dasar kemunculan kelas sentimen sebelum membaca isi ulasan.

### 🔹 Likelihood ($P(W \mid C)$)
- **Artinya**: Peluang munculnya kata tertentu jika kelas sentimennya Positif atau Negatif.

### 🔹 Laplace Smoothing ($\alpha = 1$)
- **Artinya**: Teknik penambahan angka 1 pada pembilang agar kata baru pada data uji tidak menghasilkan nilai probabilitas nol ($P=0$) yang dapat merusak perhitungan perkalian Bayes.

---

## 5. Generative AI & Large Language Model (Gemma 3)

### 🔹 LLM (Large Language Model) — Google Gemma 3
- **Artinya**: Model AI generatif berbasis Transformer yang dilatih pada miliaran token bahasa untuk memahami konteks, struktur semantik, ejaan informal, dan emosi manusia secara mendalam.

### 🔹 Zero-Shot Inference
- **Artinya**: LLM mampu menganalisis ulasan secara langsung tanpa perlu pelatihan ulang (*fine-tuning*) pada dataset lokal.

### 🔹 Constrained JSON Decoding
- **Artinya**: Mengunci struktur jawaban LLM agar selalu menghasilkan JSON valid berisi label sentimen, kategori masalah, dan alasan narasi (*reasoning*).

### 🔹 Multi-Aspect Categorization
- **Artinya**: Kemampuan LLM mengelompokkan ulasan ke dalam domain operasional: *Masalah Teknis & Bug*, *Apresiasi & Kepuasan*, *Fitur & UI/UX*, *Layanan Faskes & Antrean*, dan *Administrasi & Iuran*.

---

## 6. Metrik Evaluasi Model (Confusion Matrix)

### 🔹 Confusion Matrix (Tabel Evaluasi)
| Istilah | Kepanjangan | Maksudnya |
| :--- | :--- | :--- |
| **TP** | *True Positive* | Aslinya Positif, model menebak **Positif** (Tebakan Benar). |
| **TN** | *True Negative* | Aslinya Negatif, model menebak **Negatif** (Tebakan Benar). |
| **FP** | *False Positive* | Aslinya Negatif, tapi model salah menebak **Positif** (Salah Tuduh). |
| **FN** | *False Negative* | Aslinya Positif, tapi model salah menebak **Negatif** (Kelewatan). |

- **Akurasi (Accuracy)**: **88.00% (ML)** / **92.60% (LLM)** — Persentase total tebakan benar dari seluruh data.
- **Presisi (Precision)**: **93.59% (Positif)** — Dari seluruh ulasan yang ditebak Positif, berapa yang memang benar Positif.
- **Perolehan (Recall)**: **88.95% (Positif) & 93.44% (Negatif)** — Kemampuan model menjaring seluruh keluhan negatif masyarakat tanpa ada yang lolos.
- **F1-Score**: **91.21% (Positif)** — Rata-rata harmonik seimbang antara Precision dan Recall.

---

## 7. Istilah Khusus Studi Kasus Mobile JKN

### 🔹 Rating-Text Inconsistency (Ketidaksesuaian Rating vs Teks)
- **Artinya**: Fenomena di mana bintang yang diklik pengguna bertolak belakang dengan isi kata-kata ulasannya.
- **Temuan Riset**: Terdapat **211 ulasan anomali (4.2%)** pada 5.000 data ulasan Mobile JKN.

### 🔹 Taktik "Bintang 5 Biar Dibaca Developer" (83 Kasus)
- **Artinya**: Pengguna sengaja memberi ⭐5 padahal isinya keluhan keras, agar ulasannya naik ke urutan teratas Play Store.

### 🔹 Sarcastic Reviews / Sarkasme (128 Kasus)
- **Artinya**: Pengguna menggunakan kata pujian untuk menyindir kegagalan sistem (*"Terima kasih sudah melatih kesabaran saya..."*).

---

## 8. 🎯 Cheat Sheet: 8 Pertanyaan Favorit Dosen & Cara Menjawabnya

### ❓ Pertanyaan 1: *"Kenapa Anda memilih algoritma Multinomial Naive Bayes?"*
> **💡 Cara Jawab:**
> *"Izin menjawab Bapak/Ibu Dosen. Algoritma Multinomial Naive Bayes dipilih karena merupakan standar baku (gold standard) untuk klasifikasi teks berdimensi tinggi berbasis TF-IDF. MNB sangat efisien secara komputasi (< 0.05 ms per ulasan), tahan terhadap overfitting, dan pada penelitian ini berhasil menghasilkan akurasi **88.00%** dengan F1-Score kelas positif mencapai **91.21%**."*

---

### ❓ Pertanyaan 2: *"Kenapa tidak langsung pakai rating bintang saja sebagai penentu sentimen?"*
> **💡 Cara Jawab:**
> *"Berdasarkan eksplorasi pada 5.000 ulasan Mobile JKN, kami menemukan fenomena **Rating-Text Inconsistency sebesar 4.2% (211 ulasan)**. Banyak masyarakat sengaja memberi bintang 5 padahal isinya komplain berat dengan taktik 'bintang 5 biar dibaca developer', atau memberi bintang 1 karena sarkasme dan salah klik. Jika hanya mengandalkan rating bintang, BPJS Kesehatan akan mengalami bias informasi positif semu."*

---

### ❓ Pertanyaan 3: *"Mengapa pembagian data latih dan data ujinya menggunakan rasio 80:20?"*
> **💡 Cara Jawab:**
> *"Rasio 80:20 (Pareto Principle) merupakan rasio standar yang paling umum dalam literatur Machine Learning untuk dataset ribuan data (4.000 data latih dan 1.000 data uji). Jumlah 4.000 data latih sudah sangat cukup untuk membentuk distribusi probabilitas 5.574 vocabulary, dan 1.000 data uji sudah memenuhi syarat representasi statistik yang valid untuk menghitung Confusion Matrix."*

---

### ❓ Pertanyaan 4: *"Apa fungsi Laplace Smoothing ($\alpha=1$) pada model Anda?"*
> **💡 Cara Jawab:**
> *"Laplace Smoothing berfungsi untuk mencegah **Zero Probability Problem**. Jika pada data uji muncul kata baru yang belum pernah ditemui pada data latih, tanpa smoothing nilai probabilitasnya akan menjadi nol ($P=0$) yang akan membatalkan seluruh perkalian probabilitas Teorema Bayes. Dengan menambahkan $\alpha=1$, model tetap stabil dalam melakukan kalkulasi."*

---

### ❓ Pertanyaan 5: *"Apa bedanya TF (Term Frequency) dengan TF-IDF?"*
> **💡 Cara Jawab:**
> *"Jika hanya memakai TF murni, kata-kata umum seperti 'aplikasi' atau 'mobile' akan memiliki skor tertinggi padahal tidak membedakan sentimen. TF-IDF mengatasi hal ini dengan menambahkan faktor IDF (Inverse Document Frequency) yang memberi penalti bobot pada kata umum dan menaikkan bobot kata-kata spesifik yang menjadi kunci sentimen seperti 'jadwal_penuh', 'otp', atau 'sangat_membantu'."*

---

### ❓ Pertanyaan 6: *"Bagaimana Anda menangani kalimat 'aplikasinya tidak bagus' agar tidak dianggap positif?"*
> **💡 Cara Jawab:**
> *"Pada tahap Preprocessing, kami menerapkan **Negation Preservation** dan pembentukan **Bigram**. Kata negasi seperti 'tidak', 'bukan', dan 'belum' kami pertahankan dan digabungkan menjadi token `tidak_bagus`. Model Machine Learning mempelajari fitur `tidak_bagus` ini sebagai probabilitas tinggi untuk kelas Negatif."*

---

### ❓ Pertanyaan 7: *"Apa kontribusi praktis dari penelitian ini untuk pihak BPJS Kesehatan?"*
> **💡 Cara Jawab:**
> *"Hasil penambangan data berhasil memetakan **Top 5 Isu Kritis** yang paling dikeluhkan masyarakat secara real-time, yaitu: kegagalan kode OTP SMS, kendala sinkronisasi NIK KTP, antrean online yang kuotanya cepat habis di faskes rujukan, dan kegagalan deteksi wajah. Rekomendasi strategis kami adalah menyediakan opsi OTP via WhatsApp/Email dan optimalisasi kapasitas server pada jam 07.00-09.00 WIB saat pendaftaran antrean dibuka."*

---

### ❓ Pertanyaan 8: *"Kenapa Anda juga mengintegrasikan LLM (Gemma 3) dan bagaimana perbandingannya dengan Naive Bayes?"*
> **💡 Cara Jawab:**
> *"Kami melakukan **Studi Komparatif Multidimensi**:*
> *1. **Multinomial Naive Bayes (Supervised ML)** unggul dalam **efisiensi throughput tinggi (< 0.05 ms/ulasan)** sehingga ideal untuk pipeline produksi massal 5.000+ ulasan real-time.*
> *2. **LLM Gemma 3 (Generative AI)** unggul dalam **pemahaman konteks dalam (Zero-Shot)**: mampu menormalisasi bahasa gaul tanpa butuh kamus manual, mengartikan emoji simbolis seperti 🔪 menjadi sentimen negatif, dan memberikan alasan narasi (*reasoning*) serta kategorisasi isu otomatis.*
> *Kombinasi keduanya membentuk arsitektur **Hybrid AI** yang seimbang antara kecepatan komputasi dan kedalaman analisis kontekstual."*
