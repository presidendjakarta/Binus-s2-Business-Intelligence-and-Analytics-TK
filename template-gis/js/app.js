/**
 * INA-SEISMOBI: Master Application Controller
 * Style: Digital Twin Earth Observatory & GIS Command Center
 */

const App = {
    earthquakeData: [],
    filteredData: [],
    dataTable: null,
    magSlider: null,
    flatpickrInstance: null,

    init: function () {
        console.log("[App] Initializing Digital Twin Earth Observatory Frontend...");

        // 1. Initialize Map
        MapEngine.init();

        // 2. Initialize Slider & Calendar
        this.initMagnitudeSlider();
        this.initDatePicker();

        // 3. Initialize DataTables
        this.initDataTable();

        // 4. Load Data
        this.loadData();

        // 5. Setup UI Events & Clock
        this.setupEvents();
        this.startClock();

        // 6. Initialize Timeline Engine
        if (typeof TimelineEngine !== 'undefined') {
            TimelineEngine.init();
        }
    },

    loadData: function () {
        const self = this;
        const processData = function (response) {
            self.earthquakeData = response.data || [];
            self.filteredData = [...self.earthquakeData];

            self.updateKPIs(response.summary);
            MapEngine.renderEarthquakes(self.filteredData);
            ChartsManager.renderAllCharts(self.filteredData);
            self.populateDataTable(self.filteredData);
            self.renderFeedList(self.filteredData);
            self.updateTicker(self.filteredData);
        };

        if (typeof window.MOCK_EARTHQUAKE_DATA !== 'undefined' && window.MOCK_EARTHQUAKE_DATA) {
            processData(window.MOCK_EARTHQUAKE_DATA);
            return;
        }

        $.getJSON('mock_data.json', function (response) {
            processData(response);
        }).fail(function (err) {
            console.error("[App] Failed to load data:", err);
        });
    },

    startClock: function () {
        const update = () => {
            const now = new Date();
            const utcString = now.toISOString().slice(11, 19) + ' UTC';
            const wibHour = (now.getUTCHours() + 7) % 24;
            const wibString = String(wibHour).padStart(2, '0') + ':' + String(now.getUTCMinutes()).padStart(2, '0') + ' WIB';
            $('#headerClock').text(`${utcString} | ${wibString}`);
        };
        update();
        setInterval(update, 1000);
    },

    initMagnitudeSlider: function () {
        const sliderElem = document.getElementById('sliderMagnitude');
        if (!sliderElem || typeof noUiSlider === 'undefined') return;

        this.magSlider = noUiSlider.create(sliderElem, {
            start: [0.0, 10.0],
            connect: true,
            step: 0.1,
            range: { 'min': 0.0, 'max': 10.0 },
            tooltips: [false, false],
            format: {
                to: val => parseFloat(val).toFixed(1),
                from: val => parseFloat(val)
            }
        });

        const self = this;
        this.magSlider.on('update', function (values) {
            $('#valMinMag').text(values[0]);
            $('#valMaxMag').text(values[1]);
        });

        this.magSlider.on('change', function () {
            self.applyFilters();
        });
    },

    startDateFilter: null,
    endDateFilter: null,

    initDatePicker: function () {
        if (typeof $.fn.daterangepicker === 'undefined') return;

        const self = this;
        const $input = $('#filterDateRange');

        $input.daterangepicker({
            autoUpdateInput: false,
            showDropdowns: true,
            opens: 'right',
            drops: 'auto',
            ranges: {
                'Hari Ini': [moment(), moment()],
                'Kemarin': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '7 Hari Terakhir': [moment().subtract(6, 'days'), moment()],
                '30 Hari Terakhir': [moment().subtract(29, 'days'), moment()],
                'Bulan Ini': [moment().startOf('month'), moment().endOf('month')],
                'Semua Data': [moment('2020-01-01'), moment()]
            },
            locale: {
                format: 'YYYY-MM-DD',
                separator: ' s/d ',
                applyLabel: 'Terapkan',
                cancelLabel: 'Batal',
                fromLabel: 'Dari',
                toLabel: 'Hingga',
                customRangeLabel: 'Pilih Manual',
                daysOfWeek: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
                monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
                firstDay: 1
            }
        });

        $input.on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' s/d ' + picker.endDate.format('YYYY-MM-DD'));
            self.startDateFilter = picker.startDate.format('YYYY-MM-DD');
            self.endDateFilter = picker.endDate.format('YYYY-MM-DD');
            self.applyFilters();
        });

        $input.on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            self.startDateFilter = null;
            self.endDateFilter = null;
            self.applyFilters();
        });
    },

    initDataTable: function () {
        if (typeof $.fn.DataTable === 'undefined') return;

        this.dataTable = $('#quakeTable').DataTable({
            responsive: true,
            order: [[1, 'desc']],
            pageLength: 10,
            lengthMenu: [10, 25, 50, 100],
            language: {
                search: "",
                searchPlaceholder: "Cari data katalog (wilayah, ID, koordinat)...",
                lengthMenu: "_MENU_ baris",
                info: "Menampilkan _START_–_END_ dari total _TOTAL_ kejadian",
                paginate: { first: "«", last: "»", next: "›", previous: "‹" }
            },
            columns: [
                { data: 'id', title: 'ID Event', className: 'text-nowrap font-mono text-muted small' },
                { 
                    data: 'time', 
                    title: 'Waktu (UTC)',
                    render: data => `<span class="font-mono text-muted small">${(data || '').replace('T', ' ').replace('Z', '')}</span>`
                },
                { 
                    data: 'magnitude', 
                    title: 'Magnitudo',
                    render: (data, type, row) => {
                        let colorClass = 'text-success';
                        if (data >= 6.0) colorClass = 'text-danger';
                        else if (data >= 5.0) colorClass = 'text-warning';
                        return `<span class="font-mono fw-bold ${colorClass}">M ${parseFloat(data).toFixed(1)} <small class="text-secondary">(${row.mag_type || 'Mw'})</small></span>`;
                    }
                },
                { 
                    data: 'depth_km', 
                    title: 'Kedalaman',
                    render: data => `<span class="font-mono small">${parseFloat(data).toFixed(0)} km</span>`
                },
                { 
                    data: 'place', 
                    title: 'Episentrum Wilayah',
                    render: (data, type, row) => {
                        const tsunami = row.tsunami_alert === 1 ? '<span class="badge bg-danger ms-1 font-mono" style="font-size:0.65rem;">TSUNAMI</span>' : '';
                        return `<div class="text-truncate fw-medium" style="max-width:280px;" title="${data}">${data} ${tsunami}</div>`;
                    }
                },
                { 
                    data: 'cluster_id', 
                    title: 'Zonasi Risiko',
                    render: (data, type, row) => {
                        let badge = '<span class="badge bg-success-subtle text-success border border-success-subtle font-mono">Zona Hijau</span>';
                        if (data === 0) badge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle font-mono">Zona Merah</span>';
                        else if (data === 1) badge = '<span class="badge bg-warning-subtle text-warning border border-warning-subtle font-mono">Zona Kuning</span>';
                        return badge;
                    }
                },
                {
                    data: null,
                    title: 'Aksi',
                    orderable: false,
                    className: 'text-end',
                    render: (data, type, row) => `
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary btn-action-focus py-0 px-2" data-lat="${row.latitude}" data-lon="${row.longitude}" title="Fokus Peta">
                                <i class="fa-solid fa-crosshairs small"></i>
                            </button>
                            <button class="btn btn-outline-primary btn-action-sim py-0 px-2" data-id="${row.id}" data-lat="${row.latitude}" data-lon="${row.longitude}" data-mag="${row.magnitude}" data-depth="${row.depth_km}" data-place="${row.place}" title="Hitung Waktu Tiba">
                                <i class="fa-solid fa-calculator small"></i>
                            </button>
                        </div>
                    `
                }
            ]
        });

        // Table Action Listeners
        const self = this;
        $('#quakeTable tbody').on('click', '.btn-action-focus', function () {
            const lat = parseFloat($(this).data('lat'));
            const lon = parseFloat($(this).data('lon'));
            self.closeCatalogDrawer();
            MapEngine.flyToLocation(lat, lon, 8);
        });

        $('#quakeTable tbody').on('click', '.btn-action-sim', function () {
            const id = $(this).data('id');
            const lat = parseFloat($(this).data('lat'));
            const lon = parseFloat($(this).data('lon'));
            const mag = parseFloat($(this).data('mag'));
            const depth = parseFloat($(this).data('depth'));
            const place = $(this).data('place');
            self.closeCatalogDrawer();
            MapEngine.flyToLocation(lat, lon, 7);
            WaveSimulator.startSimulationFromQuake(id, lat, lon, mag, depth, place);
        });
    },

    populateDataTable: function (data) {
        if (!this.dataTable) return;
        this.dataTable.clear();
        this.dataTable.rows.add(data);
        this.dataTable.draw();
    },

    renderFeedList: function (data) {
        const $container = $('#feedListContainer');
        $container.empty();
        $('#feedCountBadge').text(data.length);

        if (data.length === 0) {
            $container.html('<div class="text-center text-muted small py-4 font-mono">Tidak ada data gempa sesuai filter.</div>');
            return;
        }

        data.forEach(eq => {
            let magClass = 'gis-mag-green';
            let riskColor = '#10b981';
            if (eq.magnitude >= 6.0 || eq.cluster_id === 0) {
                magClass = 'gis-mag-red';
                riskColor = '#ef4444';
            } else if (eq.magnitude >= 5.0 || eq.cluster_id === 1) {
                magClass = 'gis-mag-amber';
                riskColor = '#f59e0b';
            }

            const timeStr = (eq.time || '').replace('T', ' ').slice(0, 16);
            const $item = $(`
                <div class="gis-feed-item" style="--risk-color: ${riskColor};" data-lat="${eq.latitude}" data-lon="${eq.longitude}" data-id="${eq.id}">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="gis-mag-badge ${magClass}">M ${eq.magnitude.toFixed(1)}</span>
                        <span class="text-muted font-mono" style="font-size:0.68rem;">${timeStr} UTC</span>
                    </div>
                    <div class="small fw-semibold text-truncate text-heading" title="${eq.place}">${eq.place}</div>
                    <div class="d-flex justify-content-between align-items-center mt-1 text-muted font-mono" style="font-size:0.68rem;">
                        <span>Kedalaman: ${eq.depth_km} km</span>
                        <span class="text-cyan">${eq.source}</span>
                    </div>
                </div>
            `);

            $item.on('click', () => {
                $('.gis-feed-item').removeClass('active');
                $item.addClass('active');
                MapEngine.flyToLocation(eq.latitude, eq.longitude, 8);
                WaveSimulator.startSimulationFromQuake(eq.id, eq.latitude, eq.longitude, eq.magnitude, eq.depth_km, eq.place);
            });

            $container.append($item);
        });
    },

    applyFilters: function () {
        let minMag = 0.0, maxMag = 10.0;
        if (this.magSlider) {
            const vals = this.magSlider.get();
            minMag = parseFloat(vals[0]);
            maxMag = parseFloat(vals[1]);
        }

        const allowShallow = $('#chkShallow').is(':checked');
        const allowMedium = $('#chkMedium').is(':checked');
        const allowDeep = $('#chkDeep').is(':checked');
        const selectedSource = $('input[name="filterSource"]:checked').val() || 'ALL';

        this.filteredData = this.earthquakeData.filter(eq => {
            if (eq.magnitude < minMag || eq.magnitude > maxMag) return false;
            if (eq.depth_km < 60 && !allowShallow) return false;
            if (eq.depth_km >= 60 && eq.depth_km <= 300 && !allowMedium) return false;
            if (eq.depth_km > 300 && !allowDeep) return false;
            if (selectedSource !== 'ALL' && eq.source !== selectedSource) return false;

            if (this.startDateFilter && this.endDateFilter) {
                const eqDate = (eq.time || '').split('T')[0];
                if (eqDate < this.startDateFilter || eqDate > this.endDateFilter) return false;
            }

            if (this.radiusFilter) {
                const dist = WaveSimulator.calculateHaversine(this.radiusFilter.lat, this.radiusFilter.lon, eq.latitude, eq.longitude);
                if (dist > this.radiusFilter.radiusKM) return false;
            }

            return true;
        });

        MapEngine.renderEarthquakes(this.filteredData);
        ChartsManager.renderAllCharts(this.filteredData);
        this.populateDataTable(this.filteredData);
        this.renderFeedList(this.filteredData);
        this.updateKPICards(this.filteredData);
        this.updateSeismicTicker(this.filteredData);
    },

    applyRadiusFilter: function (lat, lon, radiusKM) {
        this.radiusFilter = { lat, lon, radiusKM };
        this.applyFilters();
    },

    clearRadiusFilterState: function () {
        this.radiusFilter = null;
        this.applyFilters();
    },

    updateKPIs: function (summary) {
        if (!summary) return;
        $('#kpiTotalEvents').text(summary.total_events || 0);
        $('#kpi24hEvents').text(summary.events_last_24h || 0);
        $('#kpiMaxMag').text(`M ${summary.max_magnitude || '0.0'}`);
        $('#kpiMaxPlace').text(summary.max_event_place || '-');
        
        const tsunamiCount = summary.tsunami_alerts_active || 0;
        if (tsunamiCount > 0) {
            $('#kpiTsunamiStatus').html(`<span class="text-danger fw-bold"><i class="fa-solid fa-triangle-exclamation"></i> ${tsunamiCount} AKTIF</span>`);
        } else {
            $('#kpiTsunamiStatus').html('<span class="text-success fw-semibold"><i class="fa-solid fa-shield-halved"></i> AMAN</span>');
        }
    },

    updateTicker: function (data) {
        const top6 = data.slice(0, 6);
        const tickerItems = top6.map(eq => `
            <span class="me-4">
                <span class="text-muted font-mono">${(eq.time || '').slice(11, 19)} UTC</span>: 
                <b class="${eq.magnitude >= 6 ? 'text-danger' : 'text-cyan'}">M ${eq.magnitude.toFixed(1)}</b> 
                <span>${eq.place}</span> <span class="text-muted">(${eq.depth_km} km)</span>
            </span>
        `).join(' • ');

        $('#tickerContent').html(tickerItems || "Memantau data telemetri seismik nasional BMKG & USGS...");
    },

    openCatalogDrawer: function () {
        $('#catalogDrawer').addClass('open');
        $('#drawerOverlay').fadeIn(200);
        if (this.dataTable) {
            setTimeout(() => this.dataTable.columns.adjust().responsive.recalc(), 250);
        }
    },

    closeCatalogDrawer: function () {
        $('#catalogDrawer').removeClass('open');
        $('#drawerOverlay').fadeOut(200);
    },

    audioEnabled: true,

    playAudioAlert: function (duration = 1.4) {
        if (!this.audioEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(750, ctx.currentTime);
            osc.frequency.setValueAtTime(400, ctx.currentTime + 0.3);
            osc.frequency.setValueAtTime(750, ctx.currentTime + 0.6);
            osc.frequency.setValueAtTime(400, ctx.currentTime + 0.9);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn("[App] Audio alert error:", e);
        }
    },

    showEmergencyModal: function (quake) {
        this.playAudioAlert(1.4);

        if (typeof Swal !== 'undefined') {
            const isDark = ThemeManager.isDarkMode();
            Swal.fire({
                title: `Peringatan Seismik: M ${quake.magnitude}`,
                html: `
                    <div class="text-start font-mono small p-2" style="line-height:1.6;">
                        <div><b>Wilayah:</b> ${quake.place}</div>
                        <div><b>Kedalaman:</b> ${quake.depth_km} km</div>
                        <div><b>Waktu (UTC):</b> ${quake.time}</div>
                        <div><b>Status Tsunami:</b> ${quake.tsunami_alert ? '<span class="text-danger fw-bold">WASPADA TSUNAMI</span>' : '<span class="text-success">TIDAK BERPOTENSI</span>'}</div>
                    </div>
                `,
                icon: quake.magnitude >= 6.0 ? 'warning' : 'info',
                background: isDark ? '#08142a' : '#ffffff',
                color: isDark ? '#f0f6fc' : '#0f172a',
                confirmButtonColor: '#0284c7',
                confirmButtonText: 'Fokuskan ke Peta',
                showCancelButton: true,
                cancelButtonText: 'Tutup'
            }).then((res) => {
                if (res.isConfirmed) {
                    MapEngine.flyToLocation(quake.latitude, quake.longitude, 8);
                    WaveSimulator.startSimulationFromQuake(quake.id, quake.latitude, quake.longitude, quake.magnitude, quake.depth_km, quake.place);
                }
            });
        }
    },

    setupEvents: function () {
        const self = this;

        // 1. Panel Collapse / Expand Controls
        $('#btnMinimizeLeft').on('click', function () {
            $('#panelLeft').addClass('collapsed');
            $('#tabToggleLeft').fadeIn(200);
        });
        $('#tabToggleLeft').on('click', function () {
            $('#panelLeft').removeClass('collapsed');
            $('#tabToggleLeft').fadeOut(200);
        });

        $('#btnMinimizeRight').on('click', function () {
            $('#panelRight').addClass('collapsed');
            $('#tabToggleRight').fadeIn(200);
        });
        $('#tabToggleRight').on('click', function () {
            $('#panelRight').removeClass('collapsed');
            $('#tabToggleRight').fadeOut(200);
        });

        // 2. Fullscreen Toggle
        $('#btnFullscreen').on('click', function () {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(e => console.warn(e));
                $(this).html('<i class="fa-solid fa-compress"></i>');
            } else {
                document.exitFullscreen().catch(e => console.warn(e));
                $(this).html('<i class="fa-solid fa-expand"></i>');
            }
        });

        // 3. Basemap Selection
        $('[data-basemap]').on('click', function (e) {
            e.preventDefault();
            const basemap = $(this).data('basemap');
            MapEngine.setBasemap(basemap);
        });

        // 4. Faults & Legend Toggle
        $('#btnToggleFaults, #btnDockFaults').on('click', function () {
            MapEngine.toggleFaults();
        });

        $('#btnToggleLegend').on('click', function () {
            $('#mapLegend').fadeToggle(200);
            $(this).toggleClass('active');
        });

        // Heatmap Toggle
        $('#btnDockHeatmap').on('click', function () {
            MapEngine.toggleHeatmap();
        });

        // Geodesic Ruler Measurement Tool
        $('#btnDockRuler').on('click', function () {
            MapEngine.toggleRuler();
        });
        $('#btnCloseRuler').on('click', function () {
            MapEngine.clearRuler();
        });

        // Audio Alarm Mute Toggle
        $('#btnAudioToggle').on('click', function () {
            self.audioEnabled = !self.audioEnabled;
            if (self.audioEnabled) {
                $('#audioIcon').removeClass('fa-volume-xmark text-muted').addClass('fa-volume-high text-success');
                $(this).attr('title', 'Suara Alarm Aktif (Klik untuk Mute)');
            } else {
                $('#audioIcon').removeClass('fa-volume-high text-success').addClass('fa-volume-xmark text-muted');
                $(this).attr('title', 'Suara Alarm Dibisukan (Klik untuk Aktifkan)');
            }
        });

        // 5. Catalog Drawer Open/Close
        $('#btnOpenCatalogTop, #btnDockCatalog').on('click', function () {
            self.openCatalogDrawer();
        });
        $('#btnCloseCatalogDrawer, #drawerOverlay').on('click', function () {
            self.closeCatalogDrawer();
        });

        // 6. Reset Map Button
        $('#btnResetMap').on('click', function () {
            MapEngine.resetView();
        });

        // 7. Test Alarm Button
        $('#btnDockAlarm').on('click', function () {
            if (self.filteredData.length > 0) {
                self.showEmergencyModal(self.filteredData[0]);
            }
        });

        // 8. Wave Simulator Instruction Prompt
        $('#btnToggleSimMode, #btnDockSim').on('click', function () {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Mode Simulasi Gelombang Seismik',
                    text: 'Silakan klik titik manapun di peta kepulauan Indonesia (atau pilih kejadian gempa di feed) untuk menghitung jarak 3D dan waktu tiba gelombang P/S.',
                    icon: 'info',
                    background: ThemeManager.isDarkMode() ? '#08142a' : '#ffffff',
                    color: ThemeManager.isDarkMode() ? '#f0f6fc' : '#0f172a',
                    confirmButtonColor: '#0284c7',
                    confirmButtonText: 'Siap, Mulai Klik Peta'
                });
            }
        });

        // 9. Feed Search Input
        $('#inputSearchFeed').on('keyup', function () {
            const query = $(this).val().toLowerCase();
            const searched = self.filteredData.filter(eq => 
                eq.place.toLowerCase().includes(query) || 
                eq.id.toLowerCase().includes(query) ||
                eq.source.toLowerCase().includes(query)
            );
            self.renderFeedList(searched);
        });

        // 10. Filter Checkbox Changes
        $('#chkShallow, #chkMedium, #chkDeep').on('change', () => this.applyFilters());
        $('input[name="filterSource"]').on('change', () => this.applyFilters());

        $('#btnResetFilter').on('click', function () {
            if (self.magSlider) self.magSlider.set([0.0, 10.0]);
            $('#chkShallow, #chkMedium, #chkDeep').prop('checked', true);
            $('input[name="filterSource"][value="ALL"]').prop('checked', true);
            $('#filterDateRange').val('');
            self.startDateFilter = null;
            self.endDateFilter = null;
            self.radiusFilter = null;
            if (MapEngine.clearRadiusFilter) MapEngine.clearRadiusFilter();
            if (MapEngine.clearShakeMap) MapEngine.clearShakeMap();
            self.applyFilters();
        });

        // 11. Close Simulator HUD
        $('#btnCloseSimHUD').on('click', function () {
            $('#simHUD').fadeOut(200);
            if (WaveSimulator && WaveSimulator.clearSimulation) {
                WaveSimulator.clearSimulation();
            }
        });

        // 12. Active Volcanoes Toggle (127 Gunung Api)
        $('#btnToggleVolcanoes, #btnDockVolcanoes').on('click', function () {
            MapEngine.toggleVolcanoes();
        });

        // 13. ShakeMap Close Badge & Dock Button
        $('#btnCloseShakeMap').on('click', function () {
            MapEngine.clearShakeMap();
        });

        $('#btnDockShakeMap').on('click', function () {
            // Pick strongest earthquake or first event
            const data = self.filteredData && self.filteredData.length > 0 ? self.filteredData : self.earthquakeData;
            if (data && data.length > 0) {
                const maxEq = [...data].sort((a, b) => b.magnitude - a.magnitude)[0];
                MapEngine.renderShakeMap(maxEq.latitude, maxEq.longitude, maxEq.magnitude, maxEq.depth_km, maxEq.place);
            }
        });

        // 14. Spatial Radius Filter Tool
        $('#btnDockRadius, #btnToggleRadius').on('click', function () {
            MapEngine.toggleRadiusFilter();
        });

        $('#btnRadiusGPS').on('click', function () {
            MapEngine.useGPSLocation();
        });

        $('#btnCloseRadiusBadge').on('click', function () {
            MapEngine.clearRadiusFilter();
        });

        $('#inputRadiusRange').on('input', function () {
            const val = $(this).val();
            MapEngine.setRadiusKM(val);
        });

        // 15. Export Buttons
        $('#btnExportCSV').on('click', function (e) {
            e.preventDefault();
            self.exportCSV();
        });
        $('#btnExportGeoJSON').on('click', function (e) {
            e.preventDefault();
            self.exportGeoJSON();
        });
        $('#btnExportPNG').on('click', function (e) {
            e.preventDefault();
            MapEngine.exportMapScreenshot();
        });
    },

    exportCSV: function () {
        if (!this.filteredData || this.filteredData.length === 0) return;

        let csv = 'id,source,time_utc,latitude,longitude,depth_km,magnitude,place,tsunami_alert,cluster_id\n';
        this.filteredData.forEach(eq => {
            csv += `"${eq.id}","${eq.source}","${eq.time}",${eq.latitude},${eq.longitude},${eq.depth_km},${eq.magnitude},"${eq.place}",${eq.tsunami_alert},${eq.cluster_id}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `swangeo_seismic_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    exportGeoJSON: function () {
        if (!this.filteredData || this.filteredData.length === 0) return;

        const geojson = {
            type: "FeatureCollection",
            metadata: {
                title: "SWANGEO Exported Seismicity Dataset",
                count: this.filteredData.length,
                generated_at: new Date().toISOString()
            },
            features: this.filteredData.map(eq => ({
                type: "Feature",
                id: eq.id,
                geometry: {
                    type: "Point",
                    coordinates: [eq.longitude, eq.latitude, eq.depth_km]
                },
                properties: {
                    source: eq.source,
                    time: eq.time,
                    magnitude: eq.magnitude,
                    depth_km: eq.depth_km,
                    place: eq.place,
                    tsunami_alert: eq.tsunami_alert === 1,
                    cluster_id: eq.cluster_id,
                    risk_level: eq.risk_level
                }
            }))
        };

        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `swangeo_seismic_export_${new Date().toISOString().slice(0,10)}.geojson`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

$(document).ready(function () {
    App.init();
});

window.App = App;
