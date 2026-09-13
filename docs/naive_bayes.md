# Landasan Teori & Formulasi Matematika Multinomial Naive Bayes

Dokumen ini menjelaskan landasan teoritis dan formulasi matematis lengkap dari algoritma **Multinomial Naive Bayes (MNB)** yang diterapkan pada sistem analisis sentimen ulasan aplikasi **Mobile JKN**.

---

## 1. Konsep Dasar Teorema Bayes

Klasifikasi teks bertujuan menentukan kelas sentimen $c in C = {	ext{Positif}, 	ext{Negatif}}$ dari sebuah dokumen teks ulasan $d$. 

Berdasarkan Teorema Bayes:

$$P(c mid d) = rac{P(c) cdot P(d mid c)}{P(d)}$$

Karena penyebut $P(d)$ bernilai konstan untuk semua kelas kandidat $c in C$, keputusan klasifikasi ditentukan menggunakan aturan **Maximum A Posteriori (MAP)**:

$$hat{c} = argmax_{c in C} P(c) cdot P(d mid c)$$

---

## 2. Representasi Fitur Dokumen (TF-IDF Terbobot)

Setiap dokumen ulasan $d$ direpresentasikan sebagai vektor fitur berbasis kata unik $w_1, w_2, dots, w_n$ dengan bobot **TF-IDF (Term Frequency - Inverse Document Frequency)** terskala:

$$	ext{TF-IDF}(t, d, D) = 	ext{TF}(t, d) 	imes 	ext{IDF}(t, D) 	imes eta(t)$$

Di mana:
1. **Sublinear Term Frequency:**
   $$	ext{TF}(t, d) = egin{cases} 1 + ln(f_{t, d}), & 	ext{jika } f_{t, d} > 0 \ 0, & 	ext{lainnya} end{cases}$$

2. **Smooth Inverse Document Frequency:**
   $$	ext{IDF}(t, D) = lnleft(rac{1 + |D|}{1 + 	ext{DF}(t)}ight) + 1$$

3. **Sentiment Polarity Multiplier ($eta$):**
   $$eta(t) = egin{cases} 2.0, & 	ext{jika } t in V_{	ext{sentimen}} cup {	ext{tidak_*}} \ 1.0, & 	ext{lainnya} end{cases}$$
   *Memberikan bobot prioritas pada kata pembawa opini (*kecewa, rusak, bagus, tidak_bisa*) agar tidak terdistorsi oleh kata benda topik institusional (*kantor, administrasi*).*

4. **Normalisasi Vektor Euclidean ($L_2$-Norm):**
   $$ec{v}_{	ext{norm}} = rac{ec{v}}{sqrt{sum_{i=1}^{|V|} v_i^2}}$$

---

## 3. Asumsi Independensi Bersyarat Naive Bayes

Model mengasumsikan bahwa kemunculan setiap fitur kata $w_i$ saling bebas (*conditionally independent*) jika diberikan kelas sentimen $c$:

$$P(d mid c) = prod_{i=1}^{|d|} P(w_i mid c)$$

Sehingga fungsi objektif keputusan menjadi:

$$hat{c} = argmax_{c in C} P(c) prod_{i=1}^{|d|} P(w_i mid c)$$

---

## 4. Estimasi Parameter Probabilitas

### A. Prior Probability $P(c)$
Probabilitas awal kemunculan kelas sentimen $c$:

$$P(c) = rac{N_c + 1}{N + |C|}$$

- $N_c$: Jumlah dokumen berlabel kelas $c$.
- $N$: Total seluruh dokumen latih ($N = 4.985$).
- $|C|$: Jumlah kelas sentimen ($|C| = 2$, Positif & Negatif).

---

### B. Conditional Feature Likelihood dengan Laplace Smoothing ($alpha=1.0$)
Untuk mencegah probabilitas bernilai nol (*zero-frequency problem*) ketika sebuah kata tidak muncul pada salah satu kelas di data latih, diterapkan **Laplace Smoothing**:

$$P(w_i mid c) = rac{sum_{d in D_c} 	ext{TF-IDF}(w_i, d) + alpha}{sum_{w in V} sum_{d in D_c} 	ext{TF-IDF}(w, d) + alpha cdot |V|}$$

Di mana:
- $alpha = 1.0$ (Parameter Laplace Smoothing).
- $|V|$: Total ukuran kosakata fitur (*vocabulary size* $approx 1.440$ fitur kata).
- $D_c$: Himpunan dokumen latih yang termasuk dalam kelas $c$.

---

## 5. Komputasi Log-Likelihood (Pencegahan Arithmetic Underflow)

Untuk mencegah *underflow* akibat perkalian beruntun bilangan desimal yang sangat kecil, perhitungan ditransformasikan ke ruang logaritma natural:

$$ln P(c mid d) = ln P(c) + sum_{i=1}^{|d|} 	ext{TF-IDF}(w_i, d) cdot ln P(w_i mid c)$$

Keputusan kelas akhir:

$$hat{c} = argmax_{c in C} left[ ln P(c) + sum_{i=1}^{|d|} 	ext{TF-IDF}(w_i, d) cdot ln P(w_i mid c) ight]$$

---

## 6. Kalibrasi Probabilitas Posterior (Softmax Normalization)

Untuk menyajikan tingkat keyakinan (*confidence score*) dalam rentang $[0, 1]$ pada dashboard laporan:

$$P(c mid d) = rac{exp(ln P(c mid d) - M)}{sum_{c' in C} exp(ln P(c' mid d) - M)}$$

Di mana $M = max_{c in C} ln P(c mid d)$ untuk menjaga stabilitas numerik eksponensial.

---

## 7. Formulasi Deteksi Anomali (Rating Mismatch)

Ketidaksesuaian (*mismatch*) antara rating bintang $R in [1, 5]$ dengan prediksi model $hat{c}$ didefinisikan sebagai:

$$	ext{isAnomaly}(d) = egin{cases} 
	ext{true (Taktik Komplain)}, & 	ext{jika } R ge 4 	ext{ dan } hat{c} = 	ext{Negatif} \
	ext{true (Pujian / Salah Klik)}, & 	ext{jika } R le 2 	ext{ dan } hat{c} = 	ext{Positif} \
	ext{false (Sesuai)}, & 	ext{lainnya}
end{cases}$$

---

## 8. Metrik Evaluasi Model & Kinerja Proyek

| Metrik | Formulasi Matematis | Hasil Kinerja Model | Interpretasi |
|---|---|:---:|---|
| **Akurasi** | $	ext{Accuracy} = rac{TP + TN}{TP + TN + FP + FN}$ | **91.51%** | Ketepatan klasifikasi total ulasan. |
| **Precision (Pos)** | $	ext{Precision} = rac{TP}{TP + FP}$ | **95.50%** | Tingkat ketepatan saat memprediksi kelas Positif. |
| **Recall (Pos)** | $	ext{Recall} = rac{TP}{TP + FN}$ | **88.29%** | Kemampuan model menjaring seluruh ulasan Positif aktual. |
| **Precision (Neg)** | $	ext{Precision} = rac{TN}{TN + FN}$ | **87.62%** | Tingkat ketepatan saat memprediksi kelas Negatif. |
| **Recall (Neg)** | $	ext{Recall} = rac{TN}{TN + FP}$ | **95.22%** | Kemampuan model menjaring seluruh ulasan Negatif aktual. |
| **Macro F1** | $	ext{Macro F1} = rac{	ext{F1}_{	ext{Pos}} + 	ext{F1}_{	ext{Neg}}}{2}$ | **91.51%** | Rata-rata harmonik performa antar-kelas seimbang. |
| **Confusion Matrix** | $TP=2353, FP=111, TN=2209, FN=312$ | — | Matriks kontingensi 4.985 ulasan. |
