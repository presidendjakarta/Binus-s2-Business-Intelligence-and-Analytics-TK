# 📊 Analisis & Temuan Riset Ulasan Mobile JKN

Dokumen ini memuat temuan empiris, analisis komparatif performa model, dan wawasan bisnis yang dapat langsung diadopsi ke dalam **Bab 4 (Hasil dan Pembahasan) Skripsi / Tugas Akhir**.

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif Temuan (5.000 Ulasan)](#1-ringkasan-eksekutif-temuan)
2. [Analisis Komparasi: Rating Play Store vs Machine Learning](#2-analisis-komparasi-rating-play-store-vs-machine-learning)
3. [Analisis Anomali Ulasan (Rating-Text Inconsistency)](#3-analisis-anomali-ulasan-rating-text-inconsistency)
4. [Analisis Isu Utama Keluhan Pengguna (Top Complaints)](#4-analisis-isu-utama-keluhan-pengguna)
5. [Analisis Aspek Kepuasan Layanan (Top Praise)](#5-analisis-aspek-kepuasan-layanan)
6. [Studi Komparatif: Multinomial Naive Bayes vs LLM Gemma 3 (5.000 Data)](#6-studi-komparatif-multinomial-naive-bayes-vs-llm-gemma-3)
7. [Rekomendasi Strategis untuk Manajemen BPJS Kesehatan](#7-rekomendasi-strategis-untuk-manajemen-bpjs-kesehatan)

---

## 1. Ringkasan Eksekutif Temuan

Berdasarkan penambangan data (*mining*) terhadap **5.000 ulasan pengguna Mobile JKN** periode Agustus - September 2026:

| Parameter Evaluasi | Sentimen Positif | Sentimen Netral | Sentimen Negatif |
| :--- | :---: | :---: | :---: |
| **Parameter 1: Rating Bintang Play Store** | 2.542 (50.8%) | 194 (3.9%) | 2.264 (45.3%) |
| **Parameter 2: Master Ground Truth** | 2.551 (51.0%) | 165 (3.3%) | 2.284 (45.7%) |
| **Parameter 3: Prediksi Machine Learning (Naive Bayes)** | 2.551 (51.0%) | 0 (0.0%) | 2.449 (49.0%) |
| **Parameter 4: Prediksi Generative AI (LLM Gemma 3)** | 2.420 (48.4%) | 0 (0.0%) | 2.580 (51.6%) |

---

## 2. Analisis Komparasi: Rating Play Store vs Machine Learning

Penggunaan **Rating Bintang saja terbukti menimbulkan bias informasi**:
1. **Bias Positif Semu**: Sebanyak **83 ulasan bintang 4 dan 5** sebenarnya memuat kritik keras dan komplain operasional. Jika hanya mengandalkan rating bintang, pengembang akan menganggap pengguna puas padahal mengalami kendala fatal.
2. **Bias Negatif Semu**: Sebanyak **128 ulasan bintang 1 dan 2** memuat kepuasan layanan yang salah diberi bintang atau mengandung sarkasme.

---

## 3. Analisis Anomali Ulasan (Rating-Text Inconsistency)

### A. Taktik "Bintang 5 Biar Dibaca Developer" (83 Kasus)
Pengguna sengaja memberikan rating tertinggi dengan tujuan agar ulasannya mendapatkan visibilitas tinggi di Play Store:
> *"saya kasih bintang 5 biar pada lihat, aplikasi sering error, sering keluar sendiri, sering login ulang kadang sehari bisa 4x, giliran login sering error, susah masuknya... aplikasi udh gak jelas, kecewa"* (Rating: ⭐ 5 | Prediksi ML: Negatif | LLM: Negatif)

### B. Sarkasme & Sindiran Halus (128 Kasus)
Pengguna menggunakan kata-kata pujian atau ucapan terima kasih untuk meluapkan rasa frustrasi:
> *"Alhamdulillah selalu dipersulit ketika menggunakan aplikasi ini... terima kasih kpd bpjs dan jkn yg mengajarkan kami untuk selalu bersabar."* (Rating: ⭐ 1 | Prediksi ML: Negatif | LLM: Negatif)

---

## 4. Analisis Isu Utama Keluhan Pengguna (Top Complaints)

Dari ekstraksi bobot TF-IDF dan kategorisasi semantik LLM, berikut adalah **5 Masalah Terbesar Pengguna Mobile JKN**:

```
1. Kendala Login & Autentikasi (385 Ulasan)
   ├── Sering keluar sendiri (Force Close / Logout Otomatis)
   └── Lupa password yang tidak terkirim link resetnya

2. Pengiriman & Validasi Kode OTP (218 Ulasan)
   ├── SMS OTP tidak masuk / pulsa terpotong tapi kode tidak terkirim
   └── Waktu tunggu hitung mundur (resend OTP) terlalu lama (300 detik)

3. Antrean & Ketersediaan Kuota Faskes (196 Ulasan)
   ├── Jadwal dokter spesialis dan poli di faskes rujukan selalu penuh
   └── Jam buka antrean online tidak sinkron dengan sistem loket fisik RS

4. Verifikasi Biometrik / Pengenalan Wajah (245 Ulasan)
   ├── Gagal deteksi wajah berulang kali meski pencahayaan terang
   └── Tidak dapat melanjutkan pendaftaran anggota baru keluarga

5. Sinkronisasi Data NIK KTP & Kartu Keluarga (412 Ulasan)
   └── Notifikasi "NIK sudah terdaftar" padahal belum pernah membuat akun
```

---

## 5. Analisis Aspek Kepuasan Layanan

Ulasan dengan sentimen positif (48.3% - 51.0%) didorong oleh 3 faktor kunci:
1. **Kemudahan Pendaftaran Antrean Online Faskes**: Menghemat waktu tunggu fisik di Puskesmas dan Rumah Sakit.
2. **Kartu BPJS Digital (KIS Digital)**: Sangat praktis saat kartu fisik hilang atau tertinggal.
3. **Pengecekan Status Kepesertaan & Tagihan Iuran**: Memudahkan pengecekan keaktifan premi secara mandiri.

---

## 6. Studi Komparatif: Multinomial Naive Bayes vs LLM Gemma 3 (5.000 Data)

Sebagai bagian dari inovasi riset S2 Business Intelligence, dilakukan **Studi Komparatif Head-to-Head** pada seluruh **5.000 ulasan** antara algoritma *Classical Machine Learning* (Multinomial Naive Bayes dengan TF-IDF) dan *Large Language Model* (**Google Gemma 3:latest** via Ollama API lokal):

### A. Tabel Matriks Perbandingan Kinerja (5.000 Data Penuh)

| Dimensi Evaluasi | Classical ML (Naive Bayes + TF-IDF) | Generative AI (LLM Gemma 3) |
| :--- | :--- | :--- |
| **Akurasi Sentimen (vs Ground Truth)** | **88.00%** (Testing Set) | **92.60%** (Seluruh 5.000 Data) |
| **Tingkat Kesepakatan Antarmodel** | \multicolumn{2}{c|}{**95.64% (4.782 ulasan diprediksi identik)**} |
| **Ketergantungan Kamus Slang** | **Tinggi** (Perlu kamus slang & stopword manual) | **Nol (Zero)** (Memahami bahasa gaul secara alami) |
| **Deteksi Sarkasme & Emoji** | Terbatas pada kata dalam vocabulary TF-IDF | **Sangat Kuat** (Memahami emoji `🔪` dan negasi bertingkat) |
| **Kecepatan Inferensi (Latency)** | **< 0.05 ms / ulasan** (5.000 data < 1 detik) | **~800 - 1.200 ms / ulasan** di GPU |
| **Kebutuhan Resource Komputasi** | Sangat Ringan (CPU 1 Core, RAM < 50 MB) | Sedang - Tinggi (GPU VRAM 3.3 GB / RAM 8 GB) |
| **Fitur Output Tambahan** | Probabilitas numerik kelas | **Reasoning (Penjelasan Narasi)** + **Kategori Isu Otomatis** |

### B. Distribusi 5 Kategori Masalah Operasional yang Diekstrak LLM
LLM Gemma 3 secara otomatis mengelompokkan 5.000 ulasan ke dalam domain fungsional:
1. **Apresiasi & Kepuasan (48.3% / 2.416 Ulasan)**: Kepuasan akses antrean faskes dan fitur kartu digital.
2. **Masalah Teknis & Bug (38.7% / 1.937 Ulasan)**: Gangguan teknis seperti crash, OTP tidak terkirim, dan kendala login.
3. **Fitur & UI/UX (8.7% / 436 Ulasan)**: Hambatan verifikasi biometrik wajah dan navigasi antarmuka.
4. **Layanan Faskes & Antrean (3.9% / 196 Ulasan)**: Ketidaksinkronan jadwal dokter dan kuota poli RS yang cepat habis.
5. **Administrasi & Iuran (0.3% / 15 Ulasan)**: Pertanyaan seputar denda, tagihan premi, dan autodebet bank.

---

## 7. Rekomendasi Strategis untuk Manajemen BPJS Kesehatan

1. **Perbaikan Sistem OTP**:
   - Sediakan alternatif verifikasi OTP melalui **WhatsApp Official BPJS** atau **Email** di samping SMS konvensional.
2. **Peningkatan Kapasitas Server saat Jam Sibuk**:
   - Optimalisasi arsitektur backend dan caching agar tidak terjadi *crash / force close* saat pagi hari (pukul 07.00 - 09.00 WIB ketika pendaftaran antrean dibuka).
3. **Penyempurnaan Fitur Verifikasi Wajah**:
   - Gunakan algoritma deteksi wajah yang lebih toleran terhadap resolusi kamera smartphone kelas pemula (*entry-level*).
4. **Pemberitahuan Kuota Dokter Real-time**:
   - Tambahkan fitur *push notification* jika kuota antrean dokter spesialis di faskes rujukan telah tersedia.
5. **Implementasi Arsitektur Hybrid AI**:
   - Terapkan **Naive Bayes** untuk pemrosesan sentimen massal *real-time throughput* tinggi pada server production.
   - Terapkan **LLM Gemma 3** untuk modul audit kepuasan eksekutif, penalaran ulasan ambigu, dan kategorisasi tiket otomatis ke divisi IT / Pelayanan Medis.
