# 📚 Dokumentasi Lengkap Proyek Play Store Mining & NLP

Folder ini berisi dokumentasi akademik dan teknis komprehensif untuk penelitian data mining pada ulasan **Mobile JKN**:

---

## 📑 Daftar Dokumen

| No | Dokumen | Keterangan & Cakupan Materi |
| :---: | :--- | :--- |
| 1 | 📐 **[algoritma.md](file:///x:/laragon/kuliah/playstore-mining/docs/algoritma.md)** | Penjelasan matematis & rumus: Text Preprocessing, TF-IDF Vectorizer, Multinomial Naive Bayes, Laplace Smoothing, Confusion Matrix, dan Deteksi Anomali. |
| 2 | 🔄 **[flowchart.md](file:///x:/laragon/kuliah/playstore-mining/docs/flowchart.md)** | Diagram alir visual lengkap (*Mermaid diagrams*): End-to-End Pipeline, Scraping Pagination, NLP Preprocessing, ML Training, dan Visualisasi Dashboard. |
| 3 | 🔬 **[metodologi_penelitian.md](file:///x:/laragon/kuliah/playstore-mining/docs/metodologi_penelitian.md)** | Kerangka kerja ilmiah standar CRISP-DM, teknik sampling, pembentukan Ground Truth, Train-Test Split (80:20), dan instrumen penelitian (Bahan Bab 3 Skripsi). |
| 4 | 📊 **[analisis_dan_temuan.md](file:///x:/laragon/kuliah/playstore-mining/docs/analisis_dan_temuan.md)** | Hasil dan pembahasan: Analisis bias rating bintang vs ML, temuan anomali ulasan, Top 5 keluhan utama, Top kepuasan, dan rekomendasi strategis (Bahan Bab 4 Skripsi). |
| 5 | 📖 **[kamus.md](file:///x:/laragon/kuliah/playstore-mining/docs/kamus.md)** | **Kamus Istilah & Cheat Sheet Sidang Dosen**: Penjelasan bahasa manusiawi istilah teknis + 7 template cara menjawab pertanyaan dosen penguji tanpa gugup. |

---

## 🚀 Panduan Eksekusi Skrip Proyek

```bash
# 1. Mengambil 5.000 ulasan Play Store Mobile JKN
npm run jkn

# 2. Melatih Model Machine Learning & Menghitung Confusion Matrix
npm run train

# 3. Menjalankan Analisis Sentimen NLP Lexicon & Deteksi Anomali
npm run sentiment

# 4. Membuka Dashboard Visualisasi Interaktif di Browser
npm run dashboard
```
