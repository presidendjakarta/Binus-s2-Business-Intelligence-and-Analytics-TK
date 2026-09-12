# 📐 Dokumentasi Algoritma & Landasan Teori

Dokumen ini menjelaskan secara matematis dan konseptual seluruh algoritma yang digunakan dalam proyek **Data Mining & Analisis Sentimen Ulasan Mobile JKN di Google Play Store**.

---

## 📑 Daftar Isi
1. [Pipeline Text Preprocessing (NLP)](#1-pipeline-text-preprocessing-nlp)
2. [Ekstraksi Fitur: TF-IDF (Term Frequency - Inverse Document Frequency)](#2-ekstraksi-fitur-tf-idf)
3. [Algoritma Klasifikasi: Multinomial Naive Bayes (MNB)](#3-algoritma-klasifikasi-multinomial-naive-bayes)
4. [Metrik Evaluasi Model (Confusion Matrix, Precision, Recall, F1-Score)](#4-metrik-evaluasi-model)
5. [Algoritma Deteksi Anomali Rating vs Teks](#5-algoritma-deteksi-anomali-rating-vs-teks)

---

## 1. Pipeline Text Preprocessing (NLP)

Tahap pembersihan data mentah ulasan agar siap diolah oleh model Machine Learning:

```
[Teks Mentah] 
    │
    ▼ Case Folding (Mengubah ke huruf kecil semua)
    ▼ Data Cleansing (Regex: hapus URL, angka, tanda baca aneh)
    ▼ Karakter Reduksi (Regex: "baguuusss" -> "bagus", "errorrr" -> "error")
    ▼ Normalisasi Slang (Kamus gaul/singkatan: "yg"->"yang", "gabisa"->"tidak bisa")
    ▼ Tokenisasi & Bigram Formation (Membuat unigram + bigram)
    ▼ Stopword Removal Terpilih (Menghapus kata tidak bermakna tanpa menghapus negasi)
    │
[Teks Bersih (Clean Tokens)]
```

### Aturan Khusus Preprocessing:
- **Negation Preservation**: Kata negasi seperti *tidak, bukan, belum, jangan, kurang* dipertahankan karena menentukan polaritas kalimat.
- **N-Gram Generator**: Menggabungkan pasangan kata berdampingan (contoh: `tidak_bisa`, `sering_error`, `sangat_membantu`) agar konteks tersirat tidak hilang.

---

## 2. Ekstraksi Fitur: TF-IDF

**TF-IDF** digunakan untuk mengubah teks dokumen $d$ menjadi vektor angka representatif berbobot statistik dalam korpus $D$.

### A. Term Frequency ($TF$)
Menghitung seberapa sering suatu kata/token $t$ muncul dalam dokumen ulasan $d$:

$$TF(t, d) = \frac{f_{t, d}}{\sum_{t' \in d} f_{t', d}}$$

*Di mana $f_{t, d}$ adalah frekuensi kemunculan term $t$ pada dokumen $d$.*

### B. Inverse Document Frequency ($IDF$)
Menghitung kelangkaan kata $t$ di seluruh koleksi dokumen ulasan ($N$ ulasan). Kata yang muncul di hampir semua dokumen (seperti kata umum) diberi bobot kecil, sedangkan kata spesifik diberi bobot besar:

$$IDF(t) = \ln\left(\frac{N + 1}{DF(t) + 1}\right) + 1$$

*Di mana $N$ adalah total seluruh dokumen ulasan, dan $DF(t)$ adalah jumlah dokumen yang memuat term $t$.*

### C. Pembobotan Akhir ($TF\text{-}IDF$) & Normalisasi L2

$$W(t, d) = TF(t, d) \times IDF(t)$$

Untuk memastikan panjang pendeknya teks ulasan tidak mendominasi perhitungan probabilitas, diterapkan normalisasi vektor Euclidean ($L_2\text{-Norm}$):

$$\mathbf{v}_{\text{norm}} = \frac{\mathbf{v}}{\|\mathbf{v}\|_2} = \frac{\mathbf{v}}{\sqrt{\sum_{i=1}^{M} v_i^2}}$$

---

## 3. Algoritma Klasifikasi: Multinomial Naive Bayes

**Multinomial Naive Bayes (MNB)** adalah algoritma pembelajaran terawasi (*Supervised Learning*) berbasis probabilitas bersyarat Teorema Bayes yang sangat unggul untuk klasifikasi teks (*Text Categorization*).

### A. Teorema Bayes Dasar
Untuk mengklasifikasikan dokumen teks $d$ ke dalam salah satu kelas sentimen $c \in \{\text{Positif}, \text{Netral}, \text{Negatif}\}$:

$$P(c \mid d) = \frac{P(c) \cdot P(d \mid c)}{P(d)}$$

Karena $P(d)$ bernilai konstan untuk semua kelas, maka penentuan kelas terbaik ($\hat{c}$) dicari dengan nilai Maximum A Posteriori (MAP):

$$\hat{c} = \arg\max_{c \in C} \left[ \ln P(c) + \sum_{i=1}^{n} \ln P(w_i \mid c) \right]$$

### B. Prior Probability ($P(c)$)
Probabilitas awal kemunculan kelas $c$ dalam data latih (*training set*):

$$P(c) = \frac{N_c}{N_{\text{total}}}$$

*Di mana $N_c$ adalah jumlah dokumen berlabel kelas $c$.*

### C. Likelihood dengan Laplace Smoothing ($P(w_i \mid c)$)
Probabilitas munculnya kata $w_i$ pada kelas sentimen $c$. Untuk menghindari probabilitas nol ($P=0$) pada kata yang belum pernah muncul pada data latih, diterapkan **Laplace Smoothing ($\alpha = 1$)**:

$$P(w_i \mid c) = \frac{\sum_{d \in D_c} TF\text{-}IDF(w_i, d) + \alpha}{\sum_{w \in V} \sum_{d \in D_c} TF\text{-}IDF(w, d) + \alpha \cdot |V|}$$

*Di mana $|V|$ adalah ukuran perbendaharaan kata (vocabulary) unik ($5.587$ fitur).*

### D. Probabilitas Softmax / Confidence Score
Untuk menghasilkan skor keyakinan (*confidence probability* $\in [0\%, 100\%]$):

$$P(\text{Kelas } k \mid d) = \frac{e^{\text{Score}_k}}{\sum_{j \in C} e^{\text{Score}_j}}$$

---

## 4. Metrik Evaluasi Model

Model dievaluasi menggunakan **Confusion Matrix** pada data uji ($1.000$ ulasan terpisah):

```
                   ┌──────────────────────────────────────────────┐
                   │               PREDIKSI MODEL                 │
                   │    Positif        Netral         Negatif     │
┌─────────┬────────┼──────────────┬──────────────┬────────────────┤
│         │Positif │  TP (467)    │      0       │   FN (58)      │
│ AKTUAL  │Netral  │      3       │      0       │     30         │
│(Ground) │Negatif │   FP (29)    │      0       │   TN (413)     │
└─────────┴────────┴──────────────┴──────────────┴────────────────┘
```

### Rumus-Rumus Metrik:
1. **Akurasi (Accuracy)**:
   $$\text{Accuracy} = \frac{\sum \text{Prediksi Benar}}{N_{\text{total}}} = \frac{467 + 0 + 413}{1000} = 88.00\%$$

2. **Presisi (Precision)**: Kemampuan model tidak salah melabeli kelas lain.
   $$\text{Precision} = \frac{TP}{TP + FP} = \frac{467}{467 + 29} = 93.59\% \quad (\text{Kelas Positif})$$

3. **Perolehan (Recall / Sensitivity)**: Kemampuan model menjaring seluruh data aktual.
   $$\text{Recall} = \frac{TP}{TP + FN} = \frac{467}{467 + 58} = 88.95\% \quad (\text{Kelas Positif})$$
   $$\text{Recall} = \frac{TN}{TN + FN} = \frac{413}{413 + 29} = 93.44\% \quad (\text{Kelas Negatif})$$

4. **F1-Score**: Rata-rata harmonik antara Precision dan Recall:
   $$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}} = 91.21\% \quad (\text{Kelas Positif})$$

---

## 5. Algoritma Deteksi Anomali Rating vs Teks

Algoritma mendeteksi ketidaksesuaian (*mismatch*) antara **Rating Bintang Play Store ($S \in \{1,2,3,4,5\}$)** dan **Prediksi Sentimen Teks Machine Learning ($\hat{c}$)**:

$$\text{Status}(S, \hat{c}) = \begin{cases}
\text{Anomali Taktik Viral (Bintang 5 Komplain)}, & \text{jika } S \ge 4 \land \hat{c} = \text{"Negatif"} \\
\text{Anomali Human Error/Sarkasme}, & \text{jika } S \le 2 \land \hat{c} = \text{"Positif"} \\
\text{Konsisten (Match)}, & \text{lainnya}
\end{cases}$$
