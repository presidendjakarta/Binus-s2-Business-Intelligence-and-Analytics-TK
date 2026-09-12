# 📖 Kamus Istilah Data Mining & Panduan Menghadapi Dosen Penguji

Dokumen ini adalah **"Senjata Rahasia"** Anda untuk memahami setiap istilah teknis, konsep matematis, dan cara menjawab pertanyaan dosen penguji saat seminar proposal, sidang skripsi, atau presentasi tugas kuliah tanpa ragu-ragu.

---

## 📑 Daftar Isi
1. [Istilah Dasar Data Mining & NLP](#1-istilah-dasar-data-mining--nlp)
2. [Istilah Tahap Text Preprocessing](#2-istilah-tahap-text-preprocessing)
3. [Istilah Pembobotan Kata (TF-IDF)](#3-istilah-pembobotan-kata-tf-idf)
4. [Istilah Machine Learning & Pemodelan](#4-istilah-machine-learning--pemodelan)
5. [Istilah Evaluasi Model & Confusion Matrix](#5-istilah-evaluasi-model--confusion-matrix)
6. [Istilah Khusus Studi Kasus Mobile JKN](#6-istilah-khusus-studi-kasus-mobile-jkn)
7. [🎯 Cheat Sheet: 7 Pertanyaan Favorit Dosen & Cara Menjawabnya](#7--cheat-sheet-7-pertanyaan-favorit-dosen--cara-menjawabnya)

---

## 1. Istilah Dasar Data Mining & NLP

### 🔹 Data Mining
- **Artinya**: Proses menambang atau mengekstrak informasi dan pola berharga dari sekumpulan data mentah yang sangat besar (dalam hal ini, 5.000 ulasan Play Store).
- **Contoh**: Menemukan bahwa keluhan terbanyak masyarakat adalah masalah OTP dan antrean faskes.

### 🔹 NLP (Natural Language Processing)
- **Artinya**: Cabang kecerdasan buatan (AI) yang membuat komputer bisa membaca, memahami arti, dan mengolah bahasa manusia sehari-hari.

### 🔹 Korpus (Corpus)
- **Artinya**: Seluruh kumpulan dokumen teks yang diteliti.
- **Di proyek kita**: Kumpulan 5.000 ulasan teks Mobile JKN adalah korpusnya.

### 🔹 Dokumen (Document)
- **Artinya**: Satu baris ulasan individu dari satu pengguna.

### 🔹 N-Gram (Unigram & Bigram)
- **Artinya**: Potongan rangkaian kata yang berurutan.
  - **Unigram (1 kata)**: `["tidak"]`, `["bisa"]`, `["login"]`
  - **Bigram (2 kata)**: `["tidak_bisa"]`, `["sering_error"]`, `["sangat_membantu"]`
- **Kenapa kita pakai Bigram?**: Karena kata *"bisa"* (positif) berbeda artinya dengan *"tidak_bisa"* (negatif). Bigram menjaga konteks kalimat!

---

## 2. Istilah Tahap Text Preprocessing

### 🔹 Case Folding
- **Artinya**: Menyeragamkan semua huruf menjadi huruf kecil (*lowercase*).
- **Contoh**: `"Aplikasi BAGUS Banget"` $\rightarrow$ `"aplikasi bagus banget"`. Komputer menganggap kata kapital dan kecil sama.

### 🔹 Data Cleansing (Pembersihan Data)
- **Artinya**: Menghapus karakter sampah yang tidak ada artinya untuk sentimen, seperti link URL (`http://...`), angka, tanda baca aneh (`@#$%^&*`), dan emotikon rusak.

### 🔹 Normalisasi Slang (Slang Word Normalization)
- **Artinya**: Mengubah kata gaul, singkatan, atau typo menjadi bahasa baku.
- **Contoh**: `"yg"` $\rightarrow$ `"yang"`, `"gabisa"` $\rightarrow$ `"tidak bisa"`, `"eror"` $\rightarrow$ `"error"`, `"dftr"` $\rightarrow$ `"daftar"`.

### 🔹 Stopword Removal (Penyaringan Kata Stop)
- **Artinya**: Menghapus kata-kata penghubung umum yang sering muncul tapi tidak membawa emosi sentimen (seperti: *dan, yang, di, dari, untuk*).
- **Catatan Penting**: Kata negasi seperti *tidak, belum, bukan* **TIDAK DIHAPUS**, karena kata negasi mengubah makna sentimen!

---

## 3. Istilah Pembobotan Kata (TF-IDF)

### 🔹 TF (Term Frequency)
- **Artinya**: Berapa kali suatu kata muncul dalam satu ulasan tertentu.
- **Intinya**: Semakin sering kata itu disebut oleh seorang pengguna, semakin penting kata itu dalam ulasannya.

### 🔹 IDF (Inverse Document Frequency)
- **Artinya**: Tingkat kelangkaan/keunikan suatu kata di seluruh 5.000 ulasan.
- **Intinya**: Kata yang muncul di semua ulasan (seperti kata *"aplikasi"*) diberi bobot kecil, sedangkan kata keluhan spesifik (seperti *"jadwal_penuh"* atau *"otp"*) diberi bobot tinggi.

### 🔹 TF-IDF
- **Artinya**: Hasil perkalian $TF \times IDF$. Nilai statistik numerik yang mewakili seberapa penting sebuah kata dalam ulasan tersebut.

### 🔹 Normalisasi L2 ($L_2\text{-Norm}$)
- **Artinya**: Menyamakan panjang vektor agar ulasan yang kalimatnya sangat panjang tidak mendominasi atau menenggelamkan ulasan yang singkat.

---

## 4. Istilah Machine Learning & Pemodelan

### 🔹 Supervised Learning (Pembelajaran Terarah / Terawasi)
- **Artinya**: Melatih komputer dengan memberikan contoh soal beserta kunci jawabannya (*Ground Truth*). Setelah komputer pintar, ia disuruh menjawab soal-soal baru secara mandiri.

### 🔹 Master Ground Truth (Kunci Jawaban Anotasi)
- **Artinya**: Dataset master yang sudah diverifikasi dan dilabeli dengan benar (*Positif / Negatif / Netral*) sebagai acuan kebenaran mutlak untuk melatih dan menguji model.

### 🔹 Train-Test Split (80% : 20%)
- **Artinya**: Membagi dataset menjadi dua bagian:
  - **Data Latih (Training Set - 80% / 4.000 data)**: Untuk bahan belajar komputer.
  - **Data Uji (Testing Set - 20% / 1.000 data)**: Soal ujian rahasia yang belum pernah dilihat komputer saat latihan untuk mengukur kepintarannya.

### 🔹 Multinomial Naive Bayes (MNB)
- **Artinya**: Algoritma klasifikasi berbasis probabilitas Teorema Bayes yang sangat cepat dan akurat untuk data berbentuk frekuensi kata/teks.

### 🔹 Prior Probability ($P(C)$)
- **Artinya**: Peluang awal suatu kelas sentimen muncul dalam data latih.

### 🔹 Likelihood ($P(W \mid C)$)
- **Artinya**: Peluang munculnya kata $W$ jika kelasnya adalah $C$. Contoh: *Berapa peluang kata "error" muncul jika sentimennya Negatif?* (Pasti sangat tinggi).

### 🔹 Laplace Smoothing ($\alpha = 1$)
- **Artinya**: Teknik penambahan angka $1$ pada rumus peluang agar tidak terjadi error pembagian dengan nol ($P = 0$) jika ada kata baru di data uji yang belum pernah muncul di data latih.

### 🔹 Confidence Score / Softmax
- **Artinya**: Tingkat keyakinan model terhadap tebakannya dalam bentuk persen ($0\% - 100\%$). Contoh: Model menebak ulasan ini *Negatif* dengan keyakinan *98.5%*.

---

## 5. Istilah Evaluasi Model & Confusion Matrix

### 🔹 Confusion Matrix (Matriks Kebingungan)
- **Artinya**: Tabel rekapitulasi yang membandingkan jawaban asli (*Ground Truth*) vs tebakan model (*Prediksi ML*).

| Istilah | Kepanjangan | Maksudnya |
| :--- | :--- | :--- |
| **TP** | *True Positive* | Aslinya Positif, model menebak **Positif** (Tebakan Benar). |
| **TN** | *True Negative* | Aslinya Negatif, model menebak **Negatif** (Tebakan Benar). |
| **FP** | *False Positive* | Aslinya Negatif, tapi model salah menebak **Positif** (Salah Tuduh). |
| **FN** | *False Negative* | Aslinya Positif, tapi model salah menebak **Negatif** (Kelewatan). |

### 🔹 Akurasi (Accuracy) — **88.00%**
- **Artinya**: Persentase total tebakan benar dari seluruh 1.000 data uji.
- **Rumus**: $\frac{\text{Total Tebakan Benar}}{\text{Total Data Uji}} = \frac{880}{1000} = 88\%$

### 🔹 Presisi (Precision) — **93.59% (Positif)**
- **Artinya**: Dari semua ulasan yang ditebak *Positif* oleh model, berapa persen yang aslinya memang benar-benar *Positif*.
- **Maknanya**: Model kita sangat teliti dan jarang salah melabeli komplain menjadi pujian.

### 🔹 Perolehan (Recall) — **93.44% (Negatif)**
- **Artinya**: Dari semua komplain negatif yang ada di masyarakat, berapa persen yang berhasil dijaring oleh model.
- **Maknanya**: Model berhasil menangkap 93.4% keluhan masyarakat tanpa banyak yang lolos!

### 🔹 F1-Score — **91.21% (Positif) & 87.59% (Negatif)**
- **Artinya**: Rata-rata seimbang (*harmonic mean*) antara Precision dan Recall. Jika F1-Score di atas 80%, model dianggap **sangat prima dan layak publikasi**.

---

## 6. Istilah Khusus Studi Kasus Mobile JKN

### 🔹 Rating-Text Inconsistency (Ketidaksesuaian Rating vs Teks)
- **Artinya**: Fenomena di mana bintang yang diklik pengguna tidak sesuai dengan emosi kata-kata yang ditulisnya.
- **Temuan Riset Kita**: Ada **211 ulasan (4.2%)** yang mengalami anomali ini.

### 🔹 Taktik Bintang 5 Biar Dibaca (83 Kasus)
- **Artinya**: Pengguna sengaja memberi ⭐5 padahal isinya keluhan kasar, agar ulasannya naik ke urutan teratas Play Store dan dibaca developer BPJS.

### 🔹 Sarcastic Reviews / Sarkasme (128 Kasus)
- **Artinya**: Pengguna menggunakan kata sopan/pujian bernada sindiran (*"Terima kasih sudah melatih kesabaran saya..."*).

---

## 7. 🎯 Cheat Sheet: 7 Pertanyaan Favorit Dosen & Cara Menjawabnya

### ❓ Pertanyaan 1: *"Kenapa Anda memilih algoritma Multinomial Naive Bayes, bukan algoritma lain?"*
> **💡 Cara Jawab:**
> *"Izin menjawab Bapak/Ibu Dosen. Algoritma Multinomial Naive Bayes dipilih karena merupakan baseline standar emas (gold standard) untuk klasifikasi teks diskrit berbasis frekuensi kata (TF-IDF). MNB terbukti computationally efficient (sangat cepat), tahan terhadap overfitting pada dataset berdimensi tinggi (5.587 vocabulary), dan pada penelitian ini berhasil menghasilkan akurasi yang sangat baik yaitu **88.00%** dengan F1-Score kelas positif mencapai **91.21%**."*

---

### ❓ Pertanyaan 2: *"Kenapa tidak langsung pakai rating bintang saja sebagai penentu sentimen? Kenapa harus susah-susah pakai Machine Learning?"*
> **💡 Cara Jawab:**
> *"Izin menjelaskan Bapak/Ibu. Berdasarkan eksplorasi data pada 5.000 ulasan Mobile JKN, kami menemukan fenomena **Rating-Text Inconsistency sebesar 4.2% (211 ulasan)**. Banyak masyarakat sengaja memberi bintang 5 padahal isinya komplain berat dengan taktik 'bintang 5 biar dibaca developer', atau memberi bintang 1 karena sarkasme dan salah klik. Jika hanya berpatokan pada rating bintang, manajemen BPJS akan mengalami bias positif semu. Machine Learning membedah langsung isi semantik teks sehingga hasil sentimennya murni dan objektif."*

---

### ❓ Pertanyaan 3: *"Mengapa pembagian data latih dan data ujinya menggunakan rasio 80:20?"*
> **💡 Cara Jawab:**
> *"Rasio 80:20 (Pareto Principle) merupakan rasio standar yang paling umum dan teruji dalam literatur Machine Learning untuk dataset ribuan data (4.000 data latih dan 1.000 data uji). Jumlah 4.000 data latih sudah sangat cukup untuk membentuk distribusi probabilitas vocabulary 5.587 fitur, dan 1.000 data uji sudah memenuhi syarat representasi statistik yang valid untuk menghitung Confusion Matrix."*

---

### ❓ Pertanyaan 4: *"Apa fungsi Laplace Smoothing ($\alpha=1$) pada model Anda?"*
> **💡 Cara Jawab:**
> *"Laplace Smoothing berfungsi untuk mencegah **Zero Probability Problem**. Jika pada data uji muncul kata baru yang belum pernah ditemui pada data latih, tanpa smoothing nilai probabilitasnya akan menjadi nol ($P=0$) yang akan menghanguskan seluruh perkalian probabilitas Teorema Bayes. Dengan menambahkan $\alpha=1$, model tetap dapat melakukan kalkulasi secara stabil."*

---

### ❓ Pertanyaan 5: *"Apa bedanya TF (Term Frequency) dengan TF-IDF?"*
> **💡 Cara Jawab:**
> *"Jika hanya memakai TF (frekuensi kata murni), kata-kata umum seperti 'aplikasi' atau 'mobile' akan memiliki skor tertinggi padahal tidak membedakan sentimen. TF-IDF mengatasi hal ini dengan menambahkan faktor IDF (Inverse Document Frequency) yang memberi penalti bobot pada kata yang terlalu sering muncul di semua ulasan, dan menaikkan bobot kata-kata spesifik yang menjadi kunci sentimen seperti 'jadwal_penuh', 'otp', atau 'sangat_membantu'."*

---

### ❓ Pertanyaan 6: *"Bagaimana Anda menangani kalimat seperti 'aplikasinya tidak bagus' agar tidak dianggap positif karena ada kata 'bagus'?"*
> **💡 Cara Jawab:**
> *"Pada tahap Preprocessing, kami menerapkan **Negation Handling** dan pembentukan **Bigram (2 kata berdampingan)**. Kata negasi seperti 'tidak', 'bukan', dan 'belum' kami pertahankan dan digabungkan menjadi token `tidak_bagus`. Model Machine Learning mempelajari fitur `tidak_bagus` ini secara khusus sebagai probabilitas tinggi untuk kelas Negatif."*

---

### ❓ Pertanyaan 7: *"Apa kontribusi praktis dari penelitian ini untuk pihak BPJS Kesehatan?"*
> **💡 Cara Jawab:**
> *"Hasil penambangan data berhasil memetakan **Top 5 Isu Kritis** yang paling dikeluhkan masyarakat secara real-time, yaitu: kegagalan kode OTP via SMS, kendala sinkronisasi NIK KTP, antrean online yang kuotanya cepat habis di faskes rujukan, dan kegagalan deteksi wajah. Rekomendasi strategis kami adalah menyediakan opsi OTP via WhatsApp/Email dan optimalisasi kapasitas server pada jam 07.00-09.00 WIB saat pendaftaran antrean dibuka."*
