# 🗺️ Dokumentasi Template Web GIS: INA-SEISMOBI UI Kit

> **Template Antarmuka Web GIS Geospasial Interaktif & Spatial Business Intelligence**  
> *Framework antarmuka siap pakai berbasis **Bootstrap 5.3 (Dark/Light Mode)**, **jQuery 3.7+**, **Leaflet.js**, **Chart.js**, **DataTables.net**, dan **Fisika Gelombang Gempa**.*

---

## 📌 1. Mengapa Perlu Membuat Template Frontend Terlebih Dahulu?

Membuat template frontend terisolasi di folder `template-gis/` sebelum di-embed ke dalam biner Go memberikan sejumlah keuntungan besar:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       KEUNTUNGAN PEMBUATAN TEMPLATE TERPISAH                                │
├─────────────────────────┬───────────────────────────────────────────────────────────────────┤
│ 🚀 Rapid Prototyping    │ Desain antarmuka, tata letak, dan interaktivitas dapat diuji      │
│                         │ secara visual langsung di browser tanpa perlu re-compile Go.      │
├─────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 🎨 UI/UX Validation     │ Memvalidasi transisi *Dark Mode* & *Light Mode*, efek *Glassmorphism*,│
│                         │ animasi gelombang pulsa (*pulsing halo*), dan responsivitas mobile│
├─────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 🔌 Plugin Orchestration │ Memastikan interaksi antara jQuery, DataTables, Flatpickr,        │
│                         │ noUiSlider, SweetAlert2, dan Leaflet.js berjalan harmonis.        │
├─────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 📦 Plug-and-Play Embed  │ Setelah template 100% sempurna, seluruh folder aset tinggal       │
│                         │ disalin ke folder `web/` aplikasi Golang untuk di-embed.          │
└─────────────────────────┴───────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ 2. Arsitektur Tata Letak & Grid System (Layout Blueprint)

Template menggunakan sistem grid responsif 12-kolom Bootstrap 5 dengan konsep **Command Center Dashboard**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌐 NAVBAR: [Logo INA-SEISMOBI] [Status Live 15s] [🌓 Switcher Dark/Light] [📥 Export CSV]  │
├───────────────────┬─────────────────────────────────────────────────┬───────────────────────┤
│ 🎛️ PANEL KONTROL  │ 🗺️ PETA WEB GIS UTAMA (LEAFLET.JS)              │ 📊 DASBOR TELEMETRI   │
│   (col-lg-3)      │   (col-lg-6)                                    │   (col-lg-3)          │
├───────────────────┼─────────────────────────────────────────────────┼───────────────────────┤
│ • Rentang Waktu   │ • Peta CartoDB Dark Matter / Positron           │ • 4 Kartu KPI:        │
│   (Flatpickr)     │ • Marker Gempa Dinamis (Ukuran = Magnitudo)     │   - Total Gempa       │
│                   │ • Garis Patahan Sesar & Megathrust GeoJSON      │   - 24 Jam Terakhir   │
│ • Slider Magnitudo│ • Animasi Pulsing Ring pada gempa terkini       │   - Gempa Terkuat     │
│   [3.0 s/d 9.0]   │                                                 │   - Status Tsunami    │
│   (noUiSlider)    │ ┌── FLOATING WAVE SIMULATOR HUD ──────────────┐ │                       │
│                   │ │ 📍 Lokasi Pengguna: Klik pada Peta          │ │ • Grafik Tren Harian  │
│ • Filter Kedalaman│ │ ⏱️ Lead Time S-Wave: 24.1 Detik (Countdown) │ │   (Chart.js Line)   │
│   [x] Dangkal     │ │ 💥 Estimasi Guncangan: Skala MMI IV         │ │                       │
│   [x] Menengah    │ └─────────────────────────────────────────────┘ │ • Donat Proporsi Zona │
│   [ ] Dalam       │                                                 │   (Chart.js Doughnut) │
├───────────────────┴─────────────────────────────────────────────────┴───────────────────────┤
│ 📑 TABEL DATA INTERAKTIF: DataTables.net (Sort, Search, Filter, Detail Popup)                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚨 REAL-TIME SEISMIC TICKER: Berita berjalan notifikasi gempa bumi mutakhir Indonesia        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧰 3. Matriks Komponen & Plugin yang Diintegrasikan

| Komponen / Plugin | Versi | Sumber Daya / CDN | Fungsi Utama dalam Template |
| :--- | :--- | :--- | :--- |
| **Bootstrap** | `5.3.3` | `bootstrap.min.css & js` | Struktur grid responsif, card, modal, badge, button, dark theme. |
| **jQuery** | `3.7.1` | `jquery.min.js` | Manipulasi DOM cepat, AJAX request, event handling filter. |
| **Leaflet.js** | `1.9.4` | `leaflet.css & js` | Engine Web GIS, layer tile CartoDB, circle marker berbobot. |
| **Chart.js** | `4.4.1` | `chart.umd.min.js` | Grafik visualisasi tren frekuensi, histogram kedalaman, donat klaster. |
| **DataTables.net** | `2.0.2` | `datatables.min.css & js` | Tabel katalog data gempa dengan pencarian instan dan paginasi. |
| **Flatpickr** | `4.6.13` | `flatpickr.min.css & js` | Kalender interaktif untuk pemilihan rentang tanggal kejadian gempa. |
| **noUiSlider** | `15.7.1` | `nouislider.min.css & js`| Slider ganda modern untuk rentang magnitudo ($3.0 - 9.0$). |
| **SweetAlert2** | `11.10.7`| `sweetalert2.all.min.js` | Dialog peringatan bencana & notifikasi visual gempa signifikan. |
| **FontAwesome** | `6.5.1` | `all.min.css` | Ikonografi modern (simbol seismik, ombak tsunami, sesar, alarm). |

---

## 📂 4. Struktur Direktori Template (`template-gis/`)

```text
template-gis/
├── TEMPLATE_DOCS.md                # Dokumentasi Panduan Template (Berkas ini)
├── index.html                      # Halaman Prototipe Template Dashboard Web GIS
├── mock_data.json                  # Data Mock Gempa Bumi Indonesia untuk Pengujian Standalone
├── css/
│   ├── bootstrap.min.css           # Bootstrap 5.3 Framework
│   ├── leaflet.css                 # Leaflet Web GIS CSS
│   ├── datatables.min.css          # DataTables Bootstrap 5 Styling
│   ├── flatpickr.min.css           # Kalender CSS
│   ├── nouislider.min.css          # Slider Magnitudo CSS
│   ├── fontawesome.min.css         # Ikonografi FontAwesome
│   └── style.css                   # Custom Theme Dark/Light Glassmorphism
├── js/
│   ├── jquery.min.js               # jQuery Core
│   ├── bootstrap.bundle.min.js     # Bootstrap 5 Javascript
│   ├── leaflet.js                  # Leaflet.js Web GIS
│   ├── chart.umd.min.js            # Chart.js v4.4
│   ├── datatables.min.js           # DataTables.net
│   ├── flatpickr.min.js            # Datepicker
│   ├── nouislider.min.js           # Range Slider
│   ├── sweetalert2.all.min.js      # Modal Alert
│   ├── theme.js                    # Logika Switcher Dark / Light Mode
│   ├── map.js                      # Logika Inisialisasi Peta & Layer Sesar
│   ├── simulator.js                # Logika Fisika P/S Wave & Lead Time Countdown
│   ├── charts.js                   # Inisialisasi Grafik Chart.js
│   └── app.js                      # Controller Utama & Data Binding
└── assets/
    ├── faults.geojson              # Data Jalur Sesar Aktif & Megathrust Indonesia
    └── favicon.ico                 # Ikon Aplikasi
```

---

## 🌓 5. Fitur Unggulan Template (Key Capabilities)

### 1. Dual Theme System (Dark & Light Mode)
- **Dark Mode**: Basemap *CartoDB Dark Matter*, kartu latar belakang *Navy/Slate Glassmorphism*, teks neon.
- **Light Mode**: Basemap *CartoDB Positron*, kartu latar belakang putih bersih transparan, kontras tinggi.
- Pergantian dilakukan seketika via `data-bs-theme` tanpa *reload* halaman dan tersimpan di `localStorage`.

### 2. Interactive Seismic Wave Simulator
- Pengguna cukup mengklik lokasi manapun di kepulauan Indonesia pada peta.
- Muncul dua lingkaran gelombang fisika yang merambat:
  - 🔵 **Gelombang $P$ (Primer)**: $V_P = 6.0\text{ km/s}$ (Warna Cyan).
  - 🔴 **Gelombang $S$ (Sekunder - Destruktif)**: $V_S = 3.5\text{ km/s}$ (Warna Merah).
- HUD menghitung mundur waktu evakuasi (*Warning Lead Time*) dan mengestimasi skala intensitas guncangan **MMI**.

### 3. Smart Filtering & Instant Telemetry
- Perubahan slider magnitudo atau tanggal langsung memfilter marker di peta Leaflet, baris di DataTables, dan grafik Chart.js secara sinkron (*two-way binding*).

---

## 🚀 6. Langkah Selanjutnya

1. **Pembuatan File Template Lengkap**: Menyusun `index.html`, `style.css`, `app.js`, `map.js`, `simulator.js`, `charts.js`, `theme.js`, dan aset vendor di folder `template-gis/`.
2. **Uji Coba Visual di Browser**: Membuka `template-gis/index.html` langsung di browser untuk menguji seluruh interaksi dan animasi.
3. **Migrasi ke Go Binary**: Menyalin aset yang sudah teruji ke folder `ina-seismobi/web/` untuk di-embed ke dalam biner biner `.exe`.
