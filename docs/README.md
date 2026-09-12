# 📚 Dokumentasi Lengkap Proyek Play Store Mining & Hybrid AI NLP

Folder ini berisi dokumentasi akademik dan teknis komprehensif untuk penelitian Data Mining & Analisis Sentimen pada 5.000 ulasan **Mobile JKN (BPJS Kesehatan)** menggunakan pendekatan **Hybrid AI (Supervised Machine Learning + Large Language Model)**:

---

## 📑 Daftar Dokumen Akademik (Bahan Skripsi / Tesis)

| No | Dokumen | Keterangan & Cakupan Materi |
| :---: | :--- | :--- |
| 1 | 🔬 **[metodologi_penelitian.md](file:///x:/laragon/kuliah/playstore-mining/docs/metodologi_penelitian.md)** | **Bahan Bab 3**: Kerangka kerja ilmiah CRISP-DM, teknik sampling 5.000 ulasan, Ground Truth, Train-Test Split (80:20), dan arsitektur Hybrid AI. |
| 2 | 📊 **[analisis_dan_temuan.md](file:///x:/laragon/kuliah/playstore-mining/docs/analisis_dan_temuan.md)** | **Bahan Bab 4**: Pembahasan hasil riset 5.000 data, studi komparatif Naive Bayes vs Gemma 3, analisis anomali ulasan, Top 5 keluhan, dan rekomendasi strategis BPJS. |
| 3 | 📐 **[algoritma.md](file:///x:/laragon/kuliah/playstore-mining/docs/algoritma.md)** | **Landasan Teori Matematis**: Rumus TF-IDF, Multinomial Naive Bayes, Laplace Smoothing ($\alpha=1$), Confusion Matrix, Deteksi Anomali, dan LLM Constrained Decoding. |
| 4 | 🔄 **[flowchart.md](file:///x:/laragon/kuliah/playstore-mining/docs/flowchart.md)** | **Diagram Alir Visual**: 6 Diagram Flowchart Mermaid untuk seluruh alur: Scraping, NLP Preprocessing, ML Training, Deteksi Anomali, dan Pipeline LLM. |
| 5 | 📖 **[kamus.md](file:///x:/laragon/kuliah/playstore-mining/docs/kamus.md)** | **Kamus Istilah & Cheat Sheet Sidang Dosen**: Glosarium bahasa manusiawi istilah teknis + 8 template cara menjawab pertanyaan dosen penguji tanpa gugup. |

---

## 🚀 Panduan Eksekusi Skrip Proyek

```bash
# 1. Scraping 5.000 ulasan Play Store Mobile JKN
npm run scrape

# 2. Melatih Model ML (TF-IDF + Naive Bayes) & Menghitung Confusion Matrix
npm run train

# 3. Menjalankan Pipeline Analisis LLM (Ollama Gemma 3) & Studi Komparatif
npm run llm

# 4. Membuka Dashboard Analitik Machine Learning Klasik (5.000 Ulasan)
npm run dashboard

# 5. Membuka Dashboard Generative AI & LLM Gemma 3 Intelligence Hub (5.000 Ulasan)
npm run dashboard:llm
```
