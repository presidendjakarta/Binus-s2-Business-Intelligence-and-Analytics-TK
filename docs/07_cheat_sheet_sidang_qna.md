# 🎓 FASE 7: CHEAT SHEET SIDANG Q&A & GLOSARIUM DATA MINING
## Panduan Lengkap Menghadapi Ujian Sidang Skripsi / Tesis

---

## 📌 Daftar Isi
1. [Pengantar Persiapan Sidang](#1-pengantar-persiapan-sidang)
2. [14 Tanya-Jawab Kritis Dosen Penguji & Jawaban Ilmiah](#2-14-tanya-jawab-kritis-dosen-penguji--jawaban-ilmiah)
   - [Q1: Pemilihan Multinomial Naive Bayes](#q1-mengapa-memilih-multinomial-naive-bayes-dibanding-svm-atau-bert)
   - [Q2: Asumsi Independensi Naive Bayes & Mitigasinya](#q2-apa-kelemahan-asumsi-naive-dan-bagaimana-memitigasinya)
   - [Q3: Fungsi Laplace Add-One Smoothing (α=1.0)](#q3-mengapa-menggunakan-laplace-add-one-smoothing-α10)
   - [Q4: Penanganan Negasi (Negation Binding)](#q4-bagaimana-sistem-menangani-kebocoran-kata-negasi)
   - [Q5: Penanganan Sarkasme & Koreksi Bintang 5 Komplain](#q5-bagaimana-sistem-menangani-sarkasme-dan-anomali-rating)
   - [Q6: Justifikasi Sublinear TF & Smooth IDF](#q6-mengapa-menggunakan-sublinear-tf-dan-smooth-idf)
   - [Q7: Alasan Pemilihan 5-Fold Stratified Cross Validation](#q7-mengapa-menggunakan-5-fold-stratified-cross-validation)
   - [Q8: Keunggulan Macro F1-Score dibanding Akurasi](#q8-mengapa-macro-f1-score-lebih-valid-dibanding-akurasi)
   - [Q9: Pencegahan Kebocoran Data (Data Leakage)](#q9-bagaimana-anda-menjamin-tidak-ada-data-leakage)
   - [Q10: Akumulasi Log-Likelihood & Softmax Calibration](#q10-apa-fungsi-log-likelihood-dan-softmax-calibration)
   - [Q11: Stemmer Nazief-Adriani & Kamus Domain BPJS](#q11-bagaimana-stemmer-sastrawi-dioptimasi-untuk-domain-bpjs)
   - [Q12: Penentuan 4 Aspek Operasional Mobile JKN](#q12-bagaimana-sistem-mengelompokkan-4-aspek-operasional)
   - [Q13: Interpretasi Skor Net Sentiment Score (NSS = -17.2%)](#q13-apa-arti-skor-net-sentiment-score-172)
   - [Q14: Pemrosesan Semantik Emoji & Emotikon](#q14-bagaimana-sistem-memproses-emoji-dan-emotikon)
3. [Strategi Menghadapi Sanggahan Penguji (Defense Tactics)](#3-strategi-menghadapi-sanggahan-penguji-defense-tactics)
4. [Glosarium Komprehensif Data Mining & Machine Learning](#4-glosarium-komprehensif-data-mining--machine-learning)

---

## 1. Pengantar Persiapan Sidang

Dokumen ini disusun khusus sebagai **panduan pertahanan ilmiah (*defense cheat sheet*)** bagi mahasiswa atau peneliti saat menghadapi sesi tanya-jawab dengan dosen penguji atau reviewer profesional. Setiap jawaban telah diselaraskan dengan teori akademis buku teks, perumusan matematika, dan bukti implementasi kode sumber dalam repositori.

---

## 2. 14 Tanya-Jawab Kritis Dosen Penguji & Jawaban Ilmiah

---

### Q1: Mengapa memilih Multinomial Naive Bayes dibanding SVM atau BERT?
> **Pertanyaan Penguji**: *"Mengapa Anda memilih algoritma klasik Multinomial Naive Bayes (MNB) untuk klasifikasi sentimen, bukan Support Vector Machine (SVM) atau Deep Learning Transformer modern seperti IndoBERT?"*

**Jawaban Akademis**:
1. **Efisiensi Komputasi & Latensi Sangat Rendah**: MNB memiliki kompleksitas komputasi pelatihan linear $\mathcal{O}(N \cdot |V|)$ yang mampu melatih ribuan ulasan dalam hitungan milidetik tanpa memerlukan GPU atau infrastruktur server mahal.
2. **Kesesuaian dengan Karakteristik Teks Pendek (Short Text)**: Pada korpus teks ulasan berdimensi tinggi (*sparse text*), MNB terbukti memiliki performa kompetitif dengan akurasi $\mathbf{92.20\%}$ dan Macro F1 $\mathbf{92.05\%}$.
3. **Transparansi & *Explainability* (White-Box Model)**: Setiap keputusan klasifikasi MNB dapat dilacak secara matematis melalui akumulasi log-likelihood bobot TF-IDF per kata, berbeda dengan Deep Learning (*Black-Box*) yang sulit diaudit oleh pihak manajemen BPJS Kesehatan.
4. **Portabilitas Standalone Dashboard**: MNB memungkinkan seluruh model, parameter bobot kata, dan inferensi dibundel ke dalam satu berkas HTML mandiri (*zero-dependency*).

---

### Q2: Apa kelemahan asumsi Naive dan bagaimana memitigasinya?
> **Pertanyaan Penguji**: *"Naive Bayes mengasumsikan seluruh kata saling bebas (independen secara bersyarat). Padahal dalam bahasa alami, urutan kata sangat menentukan makna (misal: 'tidak' + 'bisa'). Bukankah asumsi ini keliru?"*

**Jawaban Akademis**:
- **Benar**, asumsi independensi fitur (*Conditional Independence Assumption*) merupakan penyederhanaan yang menjadi kelemahan mendasar model *Bag-of-Words*.
- **Mitigasi yang Kami Terapkan**:
  1. **Multi-Step Negation Binding**: Kami mengikat kata negasi dengan kata sifat/kerja setelahnya menjadi satu token gabungan (*compound token*, misal: *"tidak"* + *"bisa"* $\rightarrow$ `tidak_bisa`, *"belum"* + *"bantu"* $\rightarrow$ `tidak_bantu`).
  2. **Clause Splitting & Conjunction Weighting**: Kami memberikan bobot $2\times$ pada klausa utama setelah konjungsi adversatif (*tapi, namun*) untuk mempertahankan struktur logika kalimat majemuk.
  3. Dengan teknik tersebut, ketergantungan antar-kata kritis telah terakomodasi sebelum data masuk ke model Naive Bayes.

---

### Q3: Mengapa menggunakan Laplace Add-One Smoothing (α=1.0)?
> **Pertanyaan Penguji**: *"Apa fungsi parameter Laplace Smoothing ($\alpha=1.0$) pada kode Anda di `naiveBayes.js`?"*

**Jawaban Akademis**:
- Laplace Smoothing digunakan untuk mengatasi **Zero-Frequency Problem** (atau *Zero Probability Problem*).
- Jika ada kata baru pada data uji yang belum pernah muncul pada dokumen kelas tertentu saat training, probabilitas kondisional $P(w_i|c)$ akan bernilai $0$. Dalam perkalian probabilitas Bayes, nilai nol tunggal akan menghapus seluruh probabilitas kelas menjadi $0$:
  $$P(d|c) = \prod_{i} P(w_i|c) = 0$$
- Dengan menambahkan $\alpha = 1.0$ pada pembilang dan $\alpha \cdot |V|$ pada penyebut:
  $$P(w_i | c) = \frac{\sum w_{i, d} + 1}{\sum \text{total\_weight} + |V|}$$
  Setiap kata dijamin memiliki probabilitas kecil non-nol yang proporsional terhadap ukuran kosakata $|V|$.

---

### Q4: Bagaimana sistem menangani kebocoran kata negasi?
> **Pertanyaan Penguji**: *"Jika ada ulasan 'Pelayanan ini tidak memuaskan', bagaimana cara Anda mencegah kata 'memuaskan' terhitung sebagai sentimen positif?"*

**Jawaban Akademis**:
- Pada pipeline preprocessing biasa, kata *"tidak"* akan dihapus oleh stopword removal, meninggalkan kata *"memuaskan"* yang berbobot positif tinggi (*negation leakage*).
- **Solusi dalam Kode ([`src/nlp/preprocessor.js`](file:///x:/laragon/kuliah/playstore-mining/src/nlp/preprocessor.js))**:
  1. Kata negasi (*tidak, bukan, belum, kurang, jangan*) **dikecualikan 100% dari daftar stopwords**.
  2. Algoritma mencari target kata sifat setelah kata negasi (melewati *filler adverb* seperti *"sangat"*, *"terlalu"*).
  3. Kata target di-stem menjadi kata dasar (`puas`), lalu digabungkan menjadi token `tidak_puas`.
  4. Token `tidak_puas` dipelajari oleh model MNB sebagai fitur independen yang memiliki korelasi probabilitas sangat tinggi terhadap kelas **Negatif**.

---

### Q5: Bagaimana sistem menangani sarkasme dan anomali rating?
> **Pertanyaan Penguji**: *"Pengguna sering memberi rating bintang 5 tetapi isinya komplain keras agar dibaca pengembang. Bagaimana model Anda tidak terkecoh?"*

**Jawaban Akademis**:
- Kami membangun modul **Ground Truth Refinement & Anomaly Detection** ([`src/ml/groundTruth.js`](file:///x:/laragon/kuliah/playstore-mining/src/ml/groundTruth.js)).
- Sistem tidak menelan mentah-mentah skor rating bintang sebagai label pelatihan.
- **Aturan Heuristik**:
  - Jika rating bintang $\ge 4$ tetapi teks memuat frasa komplain kuat (*"kecewa parah"*, *"aplikasi sampah"*, *"tidak berguna"*, *"eror terus"*), label acuan (*ground truth*) **otomatis dikoreksi menjadi Negatif**.
  - Jika rating bintang $\le 2$ tetapi teks memuat pujian murni tanpa negasi (*"sangat membantu"*, *"terbaik"*), label dikoreksi menjadi **Positif**.
- Pada dashboard, kasus ini diberi tanda bendera ⚠️ **Mismatch / Anomaly** untuk memudahkan audit data oleh manajemen.

---

### Q6: Mengapa menggunakan Sublinear TF dan Smooth IDF?
> **Pertanyaan Penguji**: *"Mengapa Anda tidak menggunakan TF-IDF standar (raw frequency), melainkan Sublinear TF dan Smooth IDF?"*

**Jawaban Akademis**:
1. **Sublinear TF ($\text{TF} = 1 + \ln(\text{count})$)**: Dalam psikolinguistik teks ulasan, pengguna yang mengulang kata *"error"* sebanyak 10 kali tidak berarti memiliki kemarahan 10 kali lipat dibanding yang menulis 1 kali. Penskalaan logaritmik meredam dominasi frekuensi kata yang ekstrem.
2. **Smooth IDF ($\text{IDF} = \ln((1+N)/(1+\text{DF})) + 1$)**: Mencegah terjadinya pembagian dengan nol jika ada term yang tidak ditemukan, serta memastikan term yang muncul di seluruh dokumen ($\text{DF} = N$) tetap memiliki bobot positif $\text{IDF} = 1.0$, bukan nol.
3. **Normalisasi $L_2$-Norm**: Memastikan dokumen panjang dan pendek berada pada skala magnitudo vektor yang setara ($\|\vec{v}\|_2 = 1.0$).

---

### Q7: Mengapa menggunakan 5-Fold Stratified Cross Validation?
> **Pertanyaan Penguji**: *"Mengapa Anda menguji model menggunakan 5-Fold Cross Validation daripada Simple Train-Test Split (80:20) biasa?"*

**Jawaban Akademis**:
- *Simple Train-Test Split* rentan terhadap bias pemilihan data (*sampling bias*), di mana performa model bisa tampak sangat tinggi hanya karena kebetulan subset data ujinya mudah diprediksi.
- **5-Fold Stratified Cross Validation**:
  1. Membagi data menjadi 5 lipatan dengan proporsi kelas sentimen yang seimbang (*stratified*).
  2. Setiap data ulasan diuji tepat satu kali sebagai data *unseen test set*.
  3. Menghasilkan rata-rata akurasi **$92.20\%$** dengan standar deviasi sangat kecil **$\sigma = \pm 0.33\%$**, membuktikan bahwa performa model stabil dan tidak bergantung pada partisi data tertentu.

---

### Q8: Mengapa Macro F1-Score lebih valid dibanding Akurasi?
> **Pertanyaan Penguji**: *"Akurasi model Anda $92.20\%$. Mengapa Anda masih menekankan metrik Macro F1-Score ($92.05\%$)? Bukankah Akurasi sudah cukup?"*

**Jawaban Akademis**:
- Dataset ulasan Mobile JKN memiliki distribusi kelas yang tidak seimbang (*class imbalance*), yaitu **$58.6\%$ Negatif** dan **$41.4\%$ Positif**.
- Pada data yang tidak seimbang, metrik Akurasi dapat menipu (*accuracy paradox*). Model yang memprediksi seluruh data sebagai kelas mayoritas (Negatif) akan tetap memperoleh akurasi $58.6\%$, padahal model tersebut gagal total mengenali ulasan Positif.
- **Macro F1-Score** menghitung rata-rata harmonik antara Presisi dan Recall untuk setiap kelas secara independen tanpa memandang jumlah sampel, sehingga memberikan penilaian objektif atas performa kedua kelas sentimen.

---

### Q9: Bagaimana Anda menjamin tidak ada Data Leakage?
> **Pertanyaan Penguji**: *"Dalam proses Cross-Validation, apakah proses TF-IDF Vectorizer dilakukan sebelum atau sesudah data di-split?"*

**Jawaban Akademis**:
- Kami menjamin **bebas 100% dari kebocoran data (*zero data leakage*)**.
- Pada modul [`src/ml/evaluator.js`](file:///x:/laragon/kuliah/playstore-mining/src/ml/evaluator.js#L120-L122):
  1. Data dipecah terlebih dahulu menjadi `trainDocs` dan `testDocs`.
  2. Fungsi `fitTransform` **hanya dijalankan pada `trainDocs`** untuk membentuk kosakata (*vocabulary*) dan menghitung nilai IDF.
  3. Pada `testDocs`, kami hanya memanggil fungsi `transform` murni menggunakan parameter kosakata dan IDF yang sudah terkunci dari data latih.

---

### Q10: Apa fungsi Log-Likelihood dan Softmax Calibration?
> **Pertanyaan Penguji**: *"Mengapa pada file `naiveBayes.js` Anda menggunakan fungsi logaritma dan Softmax?"*

**Jawaban Akademis**:
1. **Log-Likelihood (Anti-Underflow)**: Mengalikan puluhan nilai probabilitas kecil ($10^{-3} \times 10^{-4} \dots$) pada sistem komputer akan menghasilkan angka di bawah batas presisi *floating point* ($0.0000000$), yang disebut *Arithmetic Underflow*. Mengubah perkalian menjadi penjumlahan logaritma ($\ln P(c) + \sum w_i \ln P(w_i|c)$) menjamin operasi komputasi tetap stabil dan akurat.
2. **Softmax Normalization**: Digunakan untuk mengubah nilai log-likelihood yang bernilai negatif menjadi distribusi probabilitas persentase ($0.0 \text{ s.d. } 1.0$) yang merepresentasikan tingkat keyakinan (*confidence score*) model.

---

### Q11: Bagaimana Stemmer Sastrawi dioptimasi untuk domain BPJS?
> **Pertanyaan Penguji**: *"Bagaimana cara Anda mencegah kesalahan pemotongan kata (over-stemming) pada istilah khusus BPJS seperti 'faskes', 'antrean', atau 'rujukan'?"*

**Jawaban Akademis**:
- Pada modul [`src/nlp/stemmer.js`](file:///x:/laragon/kuliah/playstore-mining/src/nlp/stemmer.js):
  1. Kami memperluas kamus dasar standar Sastrawi (29.932 kata) dengan **26 istilah domain spesifik BPJS**: `faskes`, `bpjs`, `jkn`, `kis`, `nik`, `otp`, `fktp`, `autodebet`, `skrining`, `antrean`, `rujukan`, `iuran`, `puskesmas`.
  2. Kata-kata tersebut didaftarkan sebagai kata dasar terlindungi, sehingga tidak dipotong secara keliru oleh algoritma derivasi awalan/akhiran.
  3. Kami menambahkan **Memoization Cache (`Map`)** untuk menyimpan kata yang sudah pernah distem, mempercepat proses NLP hingga $300\%$.

---

### Q12: Bagaimana sistem mengelompokkan 4 Aspek Operasional?
> **Pertanyaan Penguji**: *"Bagaimana mekanisme sistem dalam mengelompokkan ulasan ke dalam 4 aspek operasional (Akun, Antrean, Server, Iuran)?"*

**Jawaban Akademis**:
- Melalui fungsi `detectAspects` pada [`run-analisa.js`](file:///x:/laragon/kuliah/playstore-mining/run-analisa.js#L13-L34).
- Sistem memindai kombinasi teks mentah dan token hasil stemming terhadap taksonomi leksikon kata kunci operasional:
  - **Autentikasi & Akun**: `login`, `daftar`, `otp`, `sms`, `password`, `nik`, `ktp`, `lupa_sandi`, `tidak_bisa_masuk`.
  - **Antrean & Faskes**: `antre`, `faskes`, `puskesmas`, `rs`, `kuota`, `dokter`, `poli`, `rujuk`, `obat`.
  - **Kinerja & Server**: `error`, `lemot`, `lambat`, `crash`, `force_close`, `server`, `jaringan`, `bug`, `loading`.
  - **Iuran & Layanan**: `iuran`, `bayar`, `tagihan`, `autodebet`, `kis`, `kartu`, `mutasi`, `pbi`, `denda`.
- Ulasan dapat memiliki lebih dari satu aspek (*multi-aspect labeling*).

---

### Q13: Apa arti skor Net Sentiment Score (-17.2%)?
> **Pertanyaan Penguji**: *"Rata-rata rating bintang Play Store adalah 2.84 dari 5.0. Mengapa skor Net Sentiment Score (NSS) bernilai negatif (-17.2%)?"*

**Jawaban Akademis**:
- Rating bintang sering kali bias dan terdistorsi oleh pengguna yang memberi bintang 3 (netral) atau bintang 5 palsu (komplain taktis).
- **Net Sentiment Score (NSS)** mengevaluasi sentimen teks riil:
  $$\text{NSS} = \left( \frac{\text{Positif } (41.4\%) - \text{Negatif } (58.6\%)}{\text{Total } (100\%)} \right) = \mathbf{-17.2\%}$$
- Nilai negatif ini secara jujur merefleksikan bahwa sentimen komplain publik $17.2\%$ lebih banyak daripada sentimen pujian, mengindikasikan bahwa persepsi publik berada pada level **Kritis** yang membutuhkan intervensi pada sistem antrean dan OTP.

---

### Q14: Bagaimana sistem memproses emoji dan emotikon?
> **Pertanyaan Penguji**: *"Banyak pengguna ulasan hanya mengekspresikan emosi lewat simbol emoji 👍 atau 😡. Bagaimana model memprosesnya?"*

**Jawaban Akademis**:
- Sebelum pembersihan teks (regex cleansing) dijalankan, fungsi `replaceEmojis` memetakan karakter Unicode emoji menjadi representasi kata leksikal bahasa Indonesia:
  - `👍` $\rightarrow$ `emoji_jempol_bagus`
  - `😡` $\rightarrow$ `emoji_marah_kesal`
  - `🙏` $\rightarrow$ `emoji_terima_kasih`
- Token emoji ini kemudian diproses layaknya kata biasa, diekstraksi bobot TF-IDF-nya, dan menjadi fitur sentimen yang sangat kuat bagi model Naive Bayes.

---

## 3. Strategi Menghadapi Sanggahan Penguji (Defense Tactics)

| Tipe Sanggahan Dosen Penguji | Respon Ilmiah & Taktik Bertahan |
| :--- | :--- |
| *"Data ulasan Play Store tidak mewakili seluruh peserta BPJS di pelosok desa yang tidak punya smartphone."* | *"Benar. Batasan penelitian ini secara eksplisit berfokus pada **User Experience (UX) kanal layanan digital Mobile JKN**, bukan seluruh populasi peserta BPJS luring. Analisis ini ditujukan khusus untuk pengembangan produk digital BPJS."* |
| *"Kenapa tidak menambahkan kelas Netral?"* | *"Dalam evaluasi kepuasan layanan publik, polaritas biner (Positif vs Negatif) memberikan sinyal aksi manajerial yang lebih tegas (*actionable*). Rating 3 telah diurai menggunakan analisis leksikon untuk menetapkan kecenderungan polaritasnya."* |
| *"Apakah scraping ulasan Play Store melanggar privasi pengguna?"* | *"Tidak. Data ulasan Google Play Store bersifat publik (*publicly accessible data*). Selain itu, sistem menerapkan **prinsip sanitasi privasi** dengan menyamarkan identitas pengguna dan membatasi frekuensi request (*rate-limiting delay*). "* |

---

## 4. Glosarium Komprehensif Data Mining & Machine Learning

| Istilah | Definisi Konseptual |
| :--- | :--- |
| **Accuracy** | Rasio total prediksi benar ($TP + TN$) terhadap keseluruhan dokumen sampel. |
| **Bag of Words (BoW)** | Model representasi teks sederhana yang menghitung frekuensi kata tanpa mempertahankan tata bahasa dan urutan kata. |
| **Case Folding** | Tahap NLP yang menyeragamkan seluruh karakter teks menjadi huruf kecil (*lowercase*). |
| **Class Imbalance** | Kondisi dataset di mana jumlah sampel pada satu kelas jauh lebih mendominasi dibanding kelas lainnya. |
| **Confidence Score** | Nilai derajat kepastian model atas label kelas yang diprediksinya ($0.50 \le \text{confidence} \le 1.00$). |
| **Confusion Matrix** | Tabel kontingensi $2\times 2$ yang memetakan perbandingan antara label aktual (*ground truth*) dengan label prediksi model. |
| **CRISP-DM** | *Cross-Industry Standard Process for Data Mining*, kerangka kerja metodologis standar 6 fase dalam proyek data mining. |
| **Document Frequency (DF)** | Jumlah dokumen dalam korpus yang memuat suatu kata tertentu setidaknya satu kali. |
| **False Negative (FN)** | Kesalahan tipe II di mana dokumen aktual Positif salah diprediksi sebagai Negatif. |
| **False Positive (FP)** | Kesalahan tipe I di mana dokumen aktual Negatif salah diprediksi sebagai Positif. |
| **Ground Truth** | Label acuan nilai kebenaran sebenarnya dari sebuah data sampel yang dijadikan patokan evaluasi. |
| **Inverse Document Frequency (IDF)** | Bobot pengukur kelangkaan kata; semakin jarang kata muncul di dokumen lain, semakin tinggi nilai informasinya. |
| **Laplace Smoothing** | Teknik penambahan konstanta $\alpha$ untuk mencegah probabilitas nol pada distribusi Multinomial. |
| **Macro F1-Score** | Rata-rata aritmatika nilai F1-Score dari setiap kelas dengan bobot yang setara untuk mengatasi bias kelas. |
| **Multinomial Naive Bayes** | Varian algoritma Naive Bayes khusus untuk data diskrit/frekuensi kata berbobot pada klasifikasi teks. |
| **Net Sentiment Score (NSS)** | Selisih persentase ulasan positif dikurangi persentase ulasan negatif terhadap total ulasan. |
| **Precision** | Proporsi dokumen yang benar-benar relevan dari seluruh dokumen yang diprediksi masuk ke kelas tersebut. |
| **Recall (Sensitivitas)** | Kemampuan model dalam menemukan kembali seluruh dokumen relevan yang ada pada dataset. |
| **Softmax Function** | Fungsi matematika yang memetakan vektor bilangan real ke dalam distribusi probabilitas bernilai $0$ hingga $1$. |
| **Stemming** | Proses morfologis untuk menghilangkan afiks (awalan, akhiran, sisipan) guna memperoleh bentuk kata dasar. |
| **Stopwords** | Kata-kata fungsional umum (seperti *yang, di, dari*) yang dieliminasi karena tidak membawa bobot makna sentimen. |
| **Sublinear TF** | Transformasi logaritmik $1 + \ln(\text{TF})$ untuk meredam pengaruh frekuensi kemunculan kata yang berulang ekstrem. |
| **TF-IDF** | *Term Frequency - Inverse Document Frequency*, teknik pembobotan statistik pengukur signifikansi kata pada dokumen. |
| **True Negative (TN)** | Jumlah dokumen aktual Negatif yang berhasil diprediksi secara tepat sebagai Negatif. |
| **True Positive (TP)** | Jumlah dokumen aktual Positif yang berhasil diprediksi secara tepat sebagai Positif. |

---
*Dokumen ini merupakan pedoman pertahanan akademis dan glosarium resmi proyek Mobile JKN Sentiment Analytics.*
