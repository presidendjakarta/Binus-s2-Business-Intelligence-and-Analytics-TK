# 📚 Dokumentasi Lengkap Proyek Play Store Mining & Multinomial Naive Bayes
## Analisis Sentimen & Deteksi Anomali 5.000 Ulasan Mobile JKN (BPJS Kesehatan)

Folder ini berisi dokumentasi akademik dan teknis komprehensif untuk penelitian Data Mining & Natural Language Processing pada 5.000 ulasan **Mobile JKN (BPJS Kesehatan)** menggunakan algoritma **Multinomial Naive Bayes (MNB)** yang diintegrasikan dengan **TF-IDF Vectorizer**, **Emoji-to-Token Semantic Translation**, dan **Sastrawi Morphological Stemmer**:

---

## 📑 Daftar Dokumen Akademik & Panduan Teknis

| No | Dokumen | Keterangan & Cakupan Materi |
| :---: | :--- | :--- |
| 1 | 📐 **[naive_bayes.md](file:///x:/laragon/kuliah/playstore-mining/docs/naive_bayes.md)** | **Rujukan Utama Naive Bayes**: Teorema Bayes, TF-IDF + L2, Laplace Smoothing ($\alpha=1$), Log-Likelihood, integrasi Sastrawi, simulasi manual, penanganan emoji/simbol, dan 7 cheat sheet sidang dosen. |
| 2 | 📖 **[cara_pakai.md](file:///x:/laragon/kuliah/playstore-mining/docs/cara_pakai.md)** | **Panduan Penggunaan Lengkap**: Step-by-step cara menjalankan dashboard, melatih model Naive Bayes, scraping ulasan, cheat sheet NPM, dan troubleshooting. |
| 3 | 🔬 **[metodologi_penelitian.md](file:///x:/laragon/kuliah/playstore-mining/docs/metodologi_penelitian.md)** | **Bahan Bab 3**: Kerangka kerja ilmiah CRISP-DM, teknik sampling 5.000 ulasan, Master Ground Truth, Train-Test Split (80:20), dan arsitektur ML. |
| 4 | 📊 **[analisis_dan_temuan.md](file:///x:/laragon/kuliah/playstore-mining/docs/analisis_dan_temuan.md)** | **Bahan Bab 4**: Pembahasan hasil riset 5.000 data, analisis anomali rating vs teks, Top 5 keluhan, dan rekomendasi strategis BPJS Kesehatan. |
| 5 | 📐 **[algoritma.md](file:///x:/laragon/kuliah/playstore-mining/docs/algoritma.md)** | **Landasan Teori Matematis**: Rumus TF-IDF, Sastrawi Stemmer, Multinomial Naive Bayes, Laplace Smoothing ($\alpha=1$), dan Confusion Matrix. |
| 6 | 🔄 **[flowchart.md](file:///x:/laragon/kuliah/playstore-mining/docs/flowchart.md)** | **Diagram Alir Visual**: 5 Diagram Flowchart Mermaid untuk seluruh alur: Scraping, NLP Preprocessing, ML Training, Deteksi Anomali, dan Dashboard. |
| 7 | 📖 **[kamus.md](file:///x:/laragon/kuliah/playstore-mining/docs/kamus.md)** | **Kamus Istilah & Cheat Sheet Sidang Dosen**: Glosarium bahasa manusiawi istilah teknis + 8 template cara menjawab pertanyaan dosen penguji tanpa gugup. |

---

## 🚀 Panduan Eksekusi Skrip Proyek

```bash
# 1. Menjalankan Server Web & Membuka Dashboard Naive Bayes
npm start
# -> Membuka http://localhost:3000/dashboard.html di peramban web

# 2. Melatih Ulang Model Naive Bayes (Emoji + Sastrawi + TF-IDF + MNB)
npm run train

# 3. Scraping 5.000 ulasan Play Store Mobile JKN
npm run scrape

# 4. Menjalankan Uji Unit Modul NLP & Preprocessing
npm test
```
