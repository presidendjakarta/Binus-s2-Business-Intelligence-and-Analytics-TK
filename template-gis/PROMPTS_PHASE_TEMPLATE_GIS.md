# 🎯 Prompt Eksekusi per Fase: Web Template GIS

> **Kumpulan Prompt Siap Pakai untuk Menjalankan Setiap Fase Pengembangan Web Template GIS**  
> *Setiap prompt diawali dengan perintah slash command `/goal` agar agen AI bekerja secara tuntas, mendalam, dan tanpa henti sampai seluruh target fase tercapai.*

---

## 📋 Daftar Isi Prompt

- [Prompt All-in-One (Fase 1 s/d 7 Sekaligus)](#-prompt-all-in-one-fase-1-sd-7-sekaligus)
- [Prompt FASE 1: Fondasi Grid & Desain Glassmorphism](#-prompt-fase-1-fondasi-grid--desain-glassmorphism)
- [Prompt FASE 2: Mesin Web GIS & Layer Peta Leaflet](#-prompt-fase-2-mesin-web-gis--layer-peta-leaflet)
- [Prompt FASE 3: Simulator Fisika Gelombang & Lead Time](#-prompt-fase-3-simulator-fisika-gelombang--lead-time)
- [Prompt FASE 4: Dasbor Telemetri & Chart.js](#-prompt-fase-4-dasbor-telemetri--chartjs)
- [Prompt FASE 5: Katalog Data DataTables & Multi-Filter](#-prompt-fase-5-katalog-data-datatables--multi-filter)
- [Prompt FASE 6: Audio Alarm Synthesizer & Ticker Bar](#-prompt-fase-6-audio-alarm-synthesizer--ticker-bar)
- [Prompt FASE 7: Verifikasi Standalone & Embed Handover](#-prompt-fase-7-verifikasi-standalone--embed-handover)

---

## ⚡ PROMPT ALL-IN-ONE (Fase 1 s/d 7 Sekaligus)

Gunakan prompt ini jika ingin membangun **seluruh template frontend secara langsung sampai tuntas 100%** dalam satu perintah:

```markdown
/goal Bangun seluruh template frontend Web GIS INA-SEISMOBI secara lengkap dan mandiri di folder `X:\laragon\kuliah\gempa-bumi\template-gis` dari FASE 1 hingga FASE 7 sesuai rancangan pada `PHASE_TEMPLATE_GIS.md`.

Pastikan seluruh deliverables berikut selesai dan berfungsi penuh saat dibuka langsung di browser:
1. `index.html` dengan tata letak grid Bootstrap 5.3 responsif (Navbar Command Center, Sidebar Filter, Peta Leaflet, Floating Wave Simulator HUD, 4 Kartu KPI, Grafik Chart.js, Tabel DataTables, dan Real-time Ticker Bar).
2. `css/style.css` dengan desain modern Dark & Light Glassmorphism, efek blur, border neon glow, dan animasi denyut pulsing halo.
3. `js/theme.js` untuk peralihan instan tema Dark Mode (CartoDB Dark Matter) <-> Light Mode (CartoDB Positron) tersimpan di localStorage.
4. `js/map.js` untuk inisialisasi peta Leaflet Indonesia, marker dinamis berbobot magnitudo dan warna klaster risiko (Merah, Kuning, Hijau), popup interaktif, dan layer sesar aktif GeoJSON.
5. `assets/faults.geojson` berisi data garis sesar aktif darat dan palung Megathrust Indonesia.
6. `js/simulator.js` untuk simulasi fisika rambat gelombang P-Wave (Cyan 6.0 km/s) dan S-Wave (Merah 3.5 km/s) beranimasi mengembang, hitung mundur detik Warning Lead Time, serta kalkulator intensitas MMI.
7. `js/charts.js` untuk grafik Chart.js tren harian, histogram kedalaman, dan donat klaster risiko.
8. `js/app.js` untuk integrasi DataTables.net, Flatpickr date range, noUiSlider magnitudo, Web Audio API synthesizer alarm 880Hz, SweetAlert2 modal, dan data binding dari `mock_data.json`.
9. `mock_data.json` berisi 50+ data gempa bumi Indonesia komprehensif untuk pengujian offline.
```

---

## 🎨 PROMPT FASE 1: Fondasi Grid & Desain Glassmorphism

```markdown
/goal Kerjakan FASE 1 Pengembangan Web Template GIS di folder `X:\laragon\kuliah\gempa-bumi\template-gis`:
1. Buat struktur dasar `index.html` menggunakan Bootstrap 5.3 semantik dengan sistem grid responsif:
   - Header Navbar terintegrasi tombol switcher tema Dark/Light dan status Live Sync.
   - Kolom kiri untuk panel filter parameter (col-lg-3).
   - Kolom tengah untuk peta Web GIS dan floating HUD simulator (col-lg-6).
   - Kolom kanan untuk 4 KPI card dan panel grafik Chart.js (col-lg-3).
   - Bagian bawah untuk katalog DataTables.net dan live ticker bar.
2. Buat `css/style.css` yang mendefinisikan variabel CSS tema ganda (--bg-dark, --card-bg, --accent-cyan, --accent-red), efek Glassmorphism backdrop-filter blur 12px, border tipis glow, dan typography modern Inter.
3. Buat `js/theme.js` yang menangani peralihan instan data-bs-theme="dark" <-> "light" pada HTML dan menyimpan preferensi tema ke browser localStorage.
```

---

## 🗺️ PROMPT FASE 2: Mesin Web GIS & Layer Peta Leaflet

```markdown
/goal Kerjakan FASE 2 Pengembangan Web Template GIS di folder `X:\laragon\kuliah\gempa-bumi\template-gis`:
1. Buat `assets/faults.geojson` yang memuat koordinat garis sesar aktif tektonik utama Indonesia (Sesar Semangko Sumatra, Sesar Palu-Koro, Sesar Cimandiri, Sesar Matano, Sesar Opak, dan Palung Megathrust Selatan Jawa).
2. Buat `js/map.js` untuk inisialisasi peta Leaflet.js dengan titik koordinat pusat kepulauan Indonesia (lat: -2.5, lon: 118.0, zoom: 5).
3. Integrasikan basemap dinamis CartoDB Dark Matter (untuk Dark Mode) dan CartoDB Positron (untuk Light Mode) yang otomatis berganti saat tema ditukar.
4. Buat fungsi rendering marker lingkaran interaktif di mana radius proporsional magnitudo (r = mag^1.8) dan warna marker sesuai 3 zona risiko K-Means: Merah (#EF4444), Kuning (#F59E0B), Hijau (#10B981).
5. Tambahkan animasi CSS pulsing halo glow pada kejadian gempa paling terkini dan buat popup informasi detail yang kaya data.
```

---

## 🌊 PROMPT FASE 3: Simulator Fisika Gelombang & Lead Time

```markdown
/goal Kerjakan FASE 3 Pengembangan Web Template GIS di folder `X:\laragon\kuliah\gempa-bumi\template-gis`:
1. Buat modul `js/simulator.js` yang mengimplementasikan fisika perambatan gelombang seismik:
   - Rumus Haversine untuk jarak episentral permukaan dan jarak hiposentral 3D: D_hipo = sqrt(D_epi^2 + H^2).
   - Waktu rambat Gelombang Primer P-Wave (Vp = 6.0 km/s) dan Gelombang Sekunder destruktif S-Wave (Vs = 3.5 km/s).
   - Formulasi atenuasi empiris Modified Mercalli Intensity (MMI I - XII).
2. Pasang event listener saat pengguna mengklik lokasi manapun di peta:
   - Munculkan pin target pengguna di koordinat klik.
   - Gambarkan 2 lingkaran gelombang animasi yang membesar secara proporsional waktu rambat (Cyan untuk P-Wave dan Merah untuk S-Wave).
3. Buat widget Floating Glass HUD di atas peta yang menampilkan hitung mundur detik (Warning Lead Time Countdown) hingga gelombang S tiba di lokasi pengguna, disertai estimasi intensitas guncangan MMI dan panduan evakuasi mandiri.
```

---

## 📊 PROMPT FASE 4: Dasbor Telemetri & Chart.js

```markdown
/goal Kerjakan FASE 4 Pengembangan Web Template GIS di folder `X:\laragon\kuliah\gempa-bumi\template-gis`:
1. Buat `js/charts.js` untuk menginisialisasi visualisasi statistik menggunakan Chart.js v4.4 dengan palet warna yang otomatis menyesuaikan tema Dark/Light.
2. Hubungkan 4 Kartu KPI Eksekutif:
   - Total Gempa Terdata.
   - Frekuensi Gempa 24 Jam Terakhir.
   - Rekor Magnitudo Terkuat (M max).
   - Status Peringatan Dini Tsunami Aktif.
3. Buat grafik tren frekuensi gempa harian (Line Chart dengan area gradient fill).
4. Buat grafik donat proporsi klaster risiko 3 zona (Doughnut Chart: Merah, Kuning, Hijau).
5. Buat histogram distribusi kedalaman hiposentrum (Bar Chart: Dangkal <60km, Menengah 60-300km, Dalam >300km).
```

---

## 📑 PROMPT FASE 5: Katalog Data DataTables & Multi-Filter

```markdown
/goal Kerjakan FASE 5 Pengembangan Web Template GIS di folder `X:\laragon\kuliah\gempa-bumi\template-gis`:
1. Integrasikan plugin DataTables.net dengan Bootstrap 5 Dark/Light theme pada tabel katalog gempa bumi di `index.html`.
2. Sediakan kolom tabel: ID Event, Waktu UTC/WIB, Badge Magnitudo, Kedalaman, Wilayah Episentrum, Badge Zona Risiko, Status Tsunami, dan Tombol Aksi Simulasi Cepat.
3. Integrasikan plugin Flatpickr untuk input rentang tanggal kejadian gempa (Date Range Picker).
4. Integrasikan plugin noUiSlider untuk slider ganda rentang magnitudo (M 3.0 hingga M 9.0).
5. Buat logika sinkronisasi filter (two-way binding): saat filter magnitudo, kedalaman, atau tanggal diubah, seluruh marker di peta Leaflet, baris tabel DataTables, dan grafik Chart.js terbarui seketika.
6. Sediakan tombol aksi untuk ekspor data aktif ke format CSV dan GeoJSON.
```

---

## 🔔 PROMPT FASE 6: Audio Alarm Synthesizer & Ticker Bar

```markdown
/goal Kerjakan FASE 6 Pengembangan Web Template GIS di folder `X:\laragon\kuliah\gempa-bumi\template-gis`:
1. Implementasikan Web Audio API Synthesizer di `js/app.js` yang secara otomatis membunyikan alarm osilator nada peringatan (frekuensi 880 Hz / 440 Hz dual-tone beep) saat ada gempa baru dengan kekuatan M >= 5.0 atau berpotensi tsunami.
2. Integrasikan SweetAlert2 untuk modal dialog notifikasi darurat saat gempa signifikan terdeteksi, dengan tombol untuk langsung memusatkan peta (zoom & pan) ke lokasi episentrum.
3. Buat pita teks berjalan (Live Seismic Marquee Ticker Bar) di bagian bawah halaman yang menampilkan rentetan berita guncangan gempa terkini dengan animasi mulus.
```

---

## 🚀 PROMPT FASE 7: Verifikasi Standalone & Embed Handover

```markdown
/goal Kerjakan FASE 7 Pengembangan Web Template GIS di folder `X:\laragon\kuliah\gempa-bumi\template-gis`:
1. Buat berkas `mock_data.json` yang memuat 50+ data gempa bumi realistis di seluruh wilayah kepulauan Indonesia (Sumatra, Jawa, Bali-Nusa Tenggara, Sulawesi, Maluku, Papua) untuk memastikan template dapat diuji secara penuh tanpa ketergantungan backend server.
2. Lakukan pengujian responsivitas dan penataan CSS untuk memastikan tampilan sempurna di layar Desktop lebar (>=1200px), Tablet (768px-1199px), dan Smartphone (<768px dengan bottom drawer).
3. Pastikan seluruh dependensi JavaScript/CSS eksternal (CDN fallback) dan aset lokal tersusun rapi dan siap disalin (copy-paste) ke folder `ina-seismobi/web/` untuk dikompilasi ke biner mandiri Golang //go:embed.
```

---
*Gunakan file ini sebagai referensi promt saat mengeksekusi pengembangan template Web GIS.*
