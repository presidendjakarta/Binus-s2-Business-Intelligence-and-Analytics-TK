# 📐 Dokumentasi Algoritma & Landasan Teori
## Formulasi Matematis Multinomial Naive Bayes, Sastrawi Stemming, TF-IDF, dan Evaluasi Metrik

Dokumen ini menjelaskan secara matematis dan konseptual seluruh algoritma yang digunakan dalam proyek **Data Mining & Analisis Sentimen Ulasan Mobile JKN di Google Play Store**.

---

## 📑 Daftar Isi
1. [Pipeline Text Preprocessing (NLP) & Emoji Translation](#1-pipeline-text-preprocessing-nlp--emoji-translation)
2. [Ekstraksi Fitur: TF-IDF (Term Frequency - Inverse Document Frequency)](#2-ekstraksi-fitur-tf-idf)
3. [Algoritma Klasifikasi: Multinomial Naive Bayes (MNB)](#3-algoritma-klasifikasi-multinomial-naive-bayes)
4. [Laplace Smoothing & Underflow Prevention (Log-Likelihood)](#4-laplace-smoothing--underflow-prevention-log-likelihood)
5. [Metrik Evaluasi Model (Confusion Matrix, Precision, Recall, F1-Score)](#5-metrik-evaluasi-model)
6. [Algoritma Deteksi Anomali Rating vs Teks](#6-algoritma-deteksi-anomali-rating-vs-teks)

---

## 1. Pipeline Text Preprocessing (NLP) & Emoji Translation

Tahap pembersihan data mentah ulasan agar siap diolah oleh model Machine Learning:

```
[Teks Mentah Ulasan] 
    │
    ▼ 1. Emoji Semantic Translation (👍 -> emoji_jempol_bagus, 🔪 -> emoji_bahaya_ancaman)
    ▼ 2. Case Folding (Mengubah ke huruf kecil semua)
    ▼ 3. Data Cleansing (Regex: hapus URL, tanda baca, simbol aneh)
    ▼ 4. Karakter Reduksi (Regex: "baguuusss" -> "bagus", "errorrr" -> "error")
    ▼ 5. Normalisasi Slang (Kamus gaul/singkatan: "bgus"->"bagus", "gak"->"tidak")
    ▼ 6. Sastrawi Morphological Stemming (Reduksi kata berimbuhan: "mempermudah" -> "mudah")
    ▼ 7. Stopword Removal Terpilih (Menghapus kata tidak bermakna tanpa menghapus negasi)
    ▼ 8. N-Gram Feature Extraction (Membuat unigram + bigram: "tidak_bisa", "sangat_mudah")
    │
[Teks Bersih (Clean Feature Tokens)]
```

### Aturan Khusus Preprocessing:
- **Emoji-to-Token Semantic Mapping**: Emoji sentimen dipetakan ke token khusus sehingga memiliki bobot TF-IDF otomatis.
- **Negation Preservation**: Kata negasi seperti *tidak, bukan, belum, jangan, kurang* dipertahankan karena menentukan polaritas kalimat.
- **N-Gram Generator**: Menggabungkan pasangan kata berdampingan (contoh: `tidak_bisa`, `sering_error`, `sangat_membantu`) agar konteks tersirat tidak hilang.

---

## 2. Ekstraksi Fitur: TF-IDF

**TF-IDF** digunakan untuk mengubah kumpulan token teks ulasan $d$ menjadi vektor angka representatif berbobot statistik dalam korpus $D$.

### A. Term Frequency ($TF$)
Menghitung seberapa sering suatu kata/token $t$ muncul dalam dokumen ulasan $d$:

$$TF(t, d) = \frac{f_{t, d}}{\sum_{t' \in d} f_{t', d}}$$

*Di mana $f_{t, d}$ adalah frekuensi kemunculan term $t$ pada dokumen $d$.*

### B. Inverse Document Frequency ($IDF$)
Menghitung kelangkaan kata $t$ di seluruh koleksi dokumen ulasan ($N$ ulasan data latih):

$$IDF(t) = \ln\left(\frac{N + 1}{DF(t) + 1}\right) + 1$$

*Di mana $N$ adalah total dokumen data latih ($4.000$), dan $DF(t)$ adalah jumlah dokumen yang memuat term $t$.*

### C. Pembobotan Akhir ($TF\text{-}IDF$) & Normalisasi L2

$$W(t, d) = TF(t, d) \times IDF(t)$$

Untuk memastikan panjang pendeknya teks ulasan tidak mendominasi perhitungan probabilitas, diterapkan normalisasi vektor Euclidean ($L_2\text{-Norm}$):

$$\mathbf{v}_{\text{norm}} = \frac{\mathbf{v}}{\|\mathbf{v}\|_2} = \frac{\mathbf{v}}{\sqrt{\sum_{i=1}^{M} v_i^2}}$$

---

## 3. Algoritma Klasifikasi: Multinomial Naive Bayes

**Multinomial Naive Bayes (MNB)** adalah algoritma pembelajaran terawasi (*Supervised Learning*) berbasis probabilitas bersyarat Teorema Bayes:

### A. Teorema Bayes Dasar
Untuk mengklasifikasikan dokumen teks $d$ ke dalam kelas sentimen $c \in \{\text{Positif}, \text{Negatif}, \text{Netral}\}$:

$$P(c \mid d) = \frac{P(c) \cdot P(d \mid c)}{P(d)}$$

Penentuan kelas terbaik ($\hat{c}$) dicari dengan nilai Maximum A Posteriori (MAP):

$$\hat{c} = \arg\max_{c \in C} \left[ \ln P(c) + \sum_{i=1}^{n} \ln P(w_i \mid c) \right]$$

### B. Prior Probability ($P(c)$)
Probabilitas awal kemunculan kelas $c$ dalam data latih:

$$P(c) = \frac{N_c}{N_{\text{total}}}$$

---

## 4. Laplace Smoothing & Underflow Prevention (Log-Likelihood)

### A. Likelihood dengan Laplace Add-One Smoothing ($P(w_i \mid c)$)
Untuk menghindari probabilitas nol ($P=0$) jika ada kata baru di data uji yang belum tercatat pada data latih:

$$P(w_i \mid c) = \frac{\sum_{d \in D_c} TF\text{-}IDF(w_i, d) + \alpha}{\sum_{w \in V} \sum_{d \in D_c} TF\text{-}IDF(w, d) + \alpha \cdot |V|}$$

*Di mana $\alpha = 1.0$ dan $|V| = 5.537$ adalah ukuran vocabulary unik.*

### B. Mencegah Floating-Point Underflow
Perkalian angka desimal kecil diubah menjadi penjumlahan logaritma:

$$\text{LogPosterior}(c) = \ln P(c) + \sum_{i=1}^{n} w_i \cdot \ln P(w_i \mid c)$$

### C. Kalibrasi Probabilitas dengan Softmax
Skor log-posterior diubah kembali ke persentase keyakinan (*confidence score* 0–100%):

$$P(\text{Kelas } k \mid d) = \frac{\exp\left(\text{LogPosterior}(k) - \max_j \text{LogPosterior}(j)\right)}{\sum_{c \in C} \exp\left(\text{LogPosterior}(c) - \max_j \text{LogPosterior}(j)\right)}$$

---

## 5. Metrik Evaluasi Model

Model dievaluasi menggunakan **Confusion Matrix** pada data uji ($1.000$ ulasan terpisah):

```
                   ┌──────────────────────────────────────────────┐
                   │               PREDIKSI MODEL                 │
                   │    Positif        Netral         Negatif     │
┌─────────┬────────┼──────────────┬──────────────┬────────────────┤
│         │Positif │  TP (491)    │      0       │   FN (39)      │
│ AKTUAL  │Netral  │      2       │      0       │     26         │
│(Ground) │Negatif │   FP (28)    │      0       │   TN (414)     │
└─────────┴────────┴──────────────┴──────────────┴────────────────┘
```

### Rumus-Rumus Metrik:
1. **Akurasi (Accuracy)**:
   $$\text{Accuracy} = \frac{\sum \text{Prediksi Benar}}{N_{\text{total}}} = \frac{491 + 0 + 414}{1000} = \mathbf{90.50\%}$$

2. **Presisi (Precision)**:
   $$\text{Precision} = \frac{TP}{TP + FP} = \frac{491}{491 + 28} = \mathbf{94.24\%} \quad (\text{Kelas Positif})$$

3. **Perolehan (Recall / Sensitivity)**:
   $$\text{Recall} = \frac{TP}{TP + FN} = \frac{491}{491 + 39} = \mathbf{92.64\%} \quad (\text{Kelas Positif})$$
   $$\text{Recall} = \frac{TN}{TN + FP} = \frac{414}{414 + 28} = \mathbf{93.67\%} \quad (\text{Kelas Negatif})$$

4. **F1-Score**:
   $$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}} = \mathbf{93.43\%} \quad (\text{Kelas Positif})$$

---

## 6. Algoritma Deteksi Anomali Rating vs Teks

Algoritma mendeteksi ketidaksesuaian (*mismatch*) antara **Rating Bintang Play Store ($S \in \{1,2,3,4,5\}$)** dan **Prediksi Sentimen Teks Machine Learning ($\hat{c}$)**:

$$\text{Status}(S, \hat{c}) = \begin{cases}
\text{🚨 Bintang 4-5 tapi Prediksi ML Negatif (Taktik Komplain)}, & \text{jika } S \ge 4 \land \hat{c} = \text{"Negatif"} \\
\text{💡 Bintang 1-2 tapi Prediksi ML Positif (Pujian / Salah Klik)}, & \text{jika } S \le 2 \land \hat{c} = \text{"Positif"} \land \text{HasPositiveClues} \\
\text{Sesuai}, & \text{lainnya}
\end{cases}$$
