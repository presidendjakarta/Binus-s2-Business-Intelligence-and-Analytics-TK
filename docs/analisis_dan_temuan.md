# 📊 Analisis & Temuan Riset Ulasan Mobile JKN
## Hasil Klasifikasi Sentimen & Deteksi Anomali Menggunakan Multinomial Naive Bayes

Dokumen ini memuat temuan empiris, analisis performa model, dan wawasan bisnis yang dapat langsung diadopsi ke dalam **Bab 4 (Hasil dan Pembahasan) Skripsi / Tugas Akhir / Tesis S2**.

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif Temuan (5.000 Ulasan)](#1-ringkasan-eksekutif-temuan)
2. [Analisis Komparasi: Rating Play Store vs Machine Learning](#2-analisis-komparasi-rating-play-store-vs-machine-learning)
3. [Analisis Anomali Ulasan (Rating-Text Inconsistency)](#3-analisis-anomali-ulasan-rating-text-inconsistency)
4. [Analisis Isu Utama Keluhan Pengguna (Top Complaints)](#4-analisis-isu-utama-keluhan-pengguna)
5. [Analisis Aspek Kepuasan Layanan (Top Praise)](#5-analisis-aspek-kepuasan-layanan)
6. [Evaluasi Performa Multinomial Naive Bayes](#6-evaluasi-performa-multinomial-naive-bayes)
7. [Rekomendasi Strategis untuk Manajemen BPJS Kesehatan](#7-rekomendasi-strategis-untuk-manajemen-bpjs-kesehatan)

---

## 1. Ringkasan Eksekutif Temuan

Berdasarkan penambangan data (*mining*) terhadap **5.000 ulasan pengguna Mobile JKN** periode Agustus - September 2026:

| Parameter Evaluasi | Sentimen Positif | Sentimen Netral | Sentimen Negatif |
| :--- | :---: | :---: | :---: |
| **Parameter 1: Rating Bintang Play Store** | 2.542 (50.8%) | 194 (3.9%) | 2.264 (45.3%) |
| **Parameter 2: Master Ground Truth** | 2.551 (51.0%) | 165 (3.3%) | 2.284 (45.7%) |
| **Parameter 3: Prediksi Multinomial Naive Bayes** | 2.551 (51.0%) | 0 (0.0%) | 2.449 (49.0%) |

---

## 2. Analisis Komparasi: Rating Play Store vs Machine Learning

Penggunaan **Rating Bintang saja terbukti menimbulkan bias informasi**:
1. **Bias Positif Semu**: Sebanyak **83 ulasan bintang 4 dan 5** sebenarnya memuat kritik keras dan komplain operasional. Jika hanya mengandalkan rating bintang, pengembang akan menganggap pengguna puas padahal mengalami kendala fatal.
2. **Bias Negatif Semu**: Sebanyak **128 ulasan bintang 1 dan 2** memuat kepuasan layanan yang salah diberi bintang atau mengandung sarkasme.

---

## 3. Analisis Anomali Ulasan (Rating-Text Inconsistency)

### A. Taktik "Bintang 5 Biar Dibaca Developer" (83 Kasus)
Pengguna sengaja memberikan rating tertinggi dengan tujuan agar ulasannya mendapatkan visibilitas tinggi di Play Store:
> *"saya kasih bintang 5 biar pada lihat, aplikasi sering error, sering keluar sendiri, sering login ulang kadang sehari bisa 4x, giliran login sering error, susah masuknya... aplikasi udh gak jelas, kecewa"* (Rating: ⭐ 5 | Prediksi Naive Bayes: **Negatif** | Status: **🚨 Bintang 4-5 tapi Prediksi ML Negatif**)

### B. Sarkasme & Sindiran Halus (128 Kasus)
Pengguna menggunakan kata-kata pujian atau ucapan terima kasih untuk meluapkan rasa frustrasi:
> *"Alhamdulillah selalu dipersulit ketika menggunakan aplikasi ini... terima kasih kpd bpjs dan jkn yg mengajarkan kami untuk selalu bersabar."* (Rating: ⭐ 1 | Prediksi Naive Bayes: **Negatif** | Status: **Sesuai**)

### C. Ulasan Berbasis Simbol & Emoji Tanpa Teks
* Ulasan seperti `🔪` (User `Noldy Kapia18`, Rating 1) dipetakan ke token `emoji_bahaya_ancaman` dan diklasifikasikan dengan tepat sebagai **Negatif** (Confidence 90.0%).
* Ulasan seperti `👍👍👍` diklasifikasikan dengan tepat sebagai **Positif** (Confidence 98.8%).
* Simbol geometris non-semantis (`📐`, `...`) ditangani melalui mekanisme *Score-Aware Fallback* tanpa memicu *false anomaly*.

---

## 4. Analisis Isu Utama Keluhan Pengguna (Top Complaints)

Dari ekstraksi bobot TF-IDF pada korpus negatif, berikut adalah **5 Masalah Terbesar Pengguna Mobile JKN**:

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

Ulasan dengan sentimen positif (51.0%) didorong oleh 3 faktor kunci:
1. **Kemudahan Pendaftaran Antrean Online Faskes**: Menghemat waktu tunggu fisik di Puskesmas dan Rumah Sakit.
2. **Kartu BPJS Digital (KIS Digital)**: Sangat praktis saat kartu fisik hilang atau tertinggal.
3. **Pengecekan Status Kepesertaan & Tagihan Iuran**: Memudahkan pengecekan keaktifan premi secara mandiri.

---

## 6. Evaluasi Performa Multinomial Naive Bayes

Hasil pengujian pada 1.000 data uji (*testing set*):

* **Akurasi Model (Accuracy)**: **90.50%**
* **Macro F1-Score**: **61.11%**
* **Precision Kelas Positif**: **94.24%** (Recall: **92.64%** | F1: **93.43%**)
* **Precision Kelas Negatif**: **86.43%** (Recall: **93.67%** | F1: **89.90%**)
* **Kecepatan Inferensi**: **< 0.05 ms per ulasan** (5.000 ulasan diproses dalam waktu < 1 detik).

---

## 7. Rekomendasi Strategis untuk Manajemen BPJS Kesehatan

1. **Optimalisasi Gateway SMS OTP**: Bekerja sama dengan aggregator multi-operator untuk menjamin pengiriman OTP dalam waktu $< 15$ detik.
2. **Perbaikan Mekanisme Token Session**: Menambah masa aktif token autentikasi agar pengguna tidak ter-logout otomatis saat sedang mengisi antrean.
3. **Sinkronisasi Kuota Antrean Real-time**: Mengintegrasikan sistem antrean loket SIMRS rumah sakit dengan API Mobile JKN.
4. **Penyederhanaan Modul Biometrik**: Memberikan opsi verifikasi alternatif (misal: kode email / verifikasi manual di faskes) jika verifikasi wajah gagal $> 3$ kali.
