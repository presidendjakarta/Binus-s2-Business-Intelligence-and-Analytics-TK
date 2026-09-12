# 📊 Analisis & Temuan Riset Ulasan Mobile JKN

Dokumen ini memuat temuan empiris, analisis komparatif, dan wawasan bisnis yang dapat diadopsi ke dalam **Bab 4 (Hasil dan Pembahasan) Skripsi / Tugas Akhir**.

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif Temuan](#1-ringkasan-eksekutif-temuan)
2. [Analisis Komparasi: Rating Bintang vs Prediksi ML](#2-analisis-komparasi-rating-bintang-vs-prediksi-ml)
3. [Analisis Anomali Ulasan (Rating-Text Inconsistency)](#3-analisis-anomali-ulasan-rating-text-inconsistency)
4. [Analisis Isu Utama Keluhan Pengguna (Top Complaints)](#4-analisis-isu-utama-keluhan-pengguna)
5. [Analisis Aspek Kepuasan Layanan (Top Praise)](#5-analisis-aspek-kepuasan-layanan)
6. [Rekomendasi Strategis untuk BPJS Kesehatan](#6-rekomendasi-strategis-untuk-bpjs-kesehatan)

---

## 1. Ringkasan Eksekutif Temuan

Berdasarkan penambangan data (*mining*) terhadap **5.000 ulasan pengguna Mobile JKN** periode Agustus - September 2026:

| Parameter Evaluasi | Sentimen Positif | Sentimen Netral | Sentimen Negatif |
| :--- | :---: | :---: | :---: |
| **Parameter 1: Rating Bintang Play Store** | 2.542 (50.8%) | 194 (3.9%) | 2.264 (45.3%) |
| **Parameter 2: Master Ground Truth** | 2.551 (51.0%) | 165 (3.3%) | 2.284 (45.7%) |
| **Parameter 3: Prediksi Machine Learning (Naive Bayes)** | 2.551 (51.0%) | 0 (0.0%) | 2.449 (49.0%) |

---

## 2. Analisis Komparasi: Rating Bintang vs Prediksi ML

Penggunaan **Rating Bintang saja terbukti menimbulkan bias**:
1. **Bias Positif Semu**: Sebanyak **83 ulasan bintang 4 dan 5** sebenarnya memuat kritik keras dan komplain operasional. Jika hanya mengandalkan rating bintang, pengembang akan menganggap pengguna puas padahal mengalami kendala fatal.
2. **Bias Negatif Semu**: Sebanyak **128 ulasan bintang 1 dan 2** memuat kepuasan layanan yang salah diberi bintang atau mengandung sarkasme.

---

## 3. Analisis Anomali Ulasan (Rating-Text Inconsistency)

### A. Taktik "Bintang 5 Biar Dibaca Developer" (83 Kasus)
Pengguna sengaja memberikan rating tertinggi dengan tujuan agar ulasannya mendapatkan visibilitas tinggi di Play Store:
> *"saya kasih bintang 5 biar pada lihat, aplikasi sering error, sering keluar sendiri, sering login ulang kadang sehari bisa 4x, giliran login sering error, susah masuknya... aplikasi udh gak jelas, kecewa"* (Rating: ⭐ 5 | Prediksi ML: Negatif)

### B. Sarkasme & Sindiran Halus
Pengguna menggunakan kata-kata pujian atau ucapan terima kasih untuk meluapkan rasa frustrasi:
> *"Alhamdulillah selalu dipersulit ketika menggunakan aplikasi ini... terima kasih kpd bpjs dan jkn yg mengajarkan kami untuk selalu bersabar."* (Rating: ⭐ 1 | Prediksi ML: Negatif)

---

## 4. Analisis Isu Utama Keluhan Pengguna

Dari ekstraksi bobot TF-IDF pada ulasan bersentimen negatif, berikut adalah **5 Masalah Terbesar Pengguna Mobile JKN**:

```
1. Kendala Login & Autentikasi (385 Ulasan)
   ├── Sering keluar sendiri (Force Close / Logout Otomatis)
   └── Lupa password yang tidak terkirim link resetnya

2. Pengiriman & Validasi Kode OTP (218 Ulasan)
   ├── SMS OTP tidak masuk / pulsa terpotong tapi kode tidak terkirim
   └── Waktu tunggu hitung mundur (resend OTP) terlalu lama (300 detik)

3. Antrean & Ketersediaan Kuota Faskes (195 Ulasan)
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

Ulasan dengan sentimen positif didorong oleh beberapa faktor kunci:
1. **Kemudahan Pendaftaran Antrean Online Faskes**: Menghemat waktu tunggu fisik di Puskesmas dan Rumah Sakit.
2. **Kartu BPJS Digital (KIS Digital)**: Sangat praktis saat kartu fisik hilang atau tertinggal.
3. **Pengecekan Status Kepesertaan & Tagihan Iuran**: Memudahkan pengecekan keaktifan premi secara mandiri.

---

## 6. Rekomendasi Strategis untuk BPJS Kesehatan

1. **Perbaikan Sistem OTP**:
   - Sediakan alternatif verifikasi OTP melalui **WhatsApp Official BPJS** atau **Email** di samping SMS konvensional.
2. **Peningkatan Kapasitas Server saat Jam Sibuk**:
   - Optimalisasi arsitektur backend dan caching agar tidak terjadi *crash / force close* saat pagi hari (pukul 07.00 - 09.00 WIB ketika pendaftaran antrean dibuka).
3. **Penyempurnaan Fitur Verifikasi Wajah**:
   - Gunakan algoritma deteksi wajah yang lebih toleran terhadap resolusi kamera smartphone kelas pemula (*entry-level*).
4. **Pemberitahuan Kuota Dokter Real-time**:
   - Tambahkan fitur *push notification* jika kuota antrean dokter spesialis di faskes rujukan telah tersedia.
