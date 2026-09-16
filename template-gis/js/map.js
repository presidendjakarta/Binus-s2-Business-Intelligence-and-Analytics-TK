/**
 * SWANGEO: Enterprise Earth Observatory Web GIS Engine
 * Style: USGS / BMKG / ESRI ArcGIS Professional Edition
 * 100% Free Public GIS Tiles (Zero Watermark / No API Key Required)
 */

const MapEngine = {
    map: null,
    currentTileLayer: null,
    labelsTileLayer: null,
    earthquakeLayerGroup: null,
    faultsLayerGroup: null,
    simulationLayerGroup: null,
    heatmapLayerGroup: null,
    rulerLayerGroup: null,
    platesLayerGroup: null,
    shakemapLayerGroup: null,
    volcanoesLayerGroup: null,
    radiusLayerGroup: null,
    userLocationMarker: null,
    
    // Feature Visibility States
    faultsVisible: true,
    heatmapVisible: false,
    volcanoesVisible: false,
    rulerActive: false,
    rulerPoints: [],
    radiusFilterActive: false,
    radiusCenter: null,
    radiusKM: 250,
    currentBasemap: 'dark',

    CONFIG: {
        center: [-2.5, 118.0], // Indonesia Geographic Center
        zoom: 5,
        minZoom: 4,
        maxZoom: 18
    },

    // 100% Free Public ESRI & OSM Basemaps without Any Watermark
    BASEMAPS: {
        dark: {
            name: 'ESRI Dark Gray Canvas',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            labelsUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
            attribution: '&copy; ESRI, HERE, Garmin & OpenStreetMap | BMKG & USGS',
            maxZoom: 16
        },
        satellite: {
            name: 'ESRI World Imagery (Satelit)',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            labelsUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            attribution: '&copy; ESRI, Maxar, Earthstar Geographics | BMKG',
            maxZoom: 18
        },
        light: {
            name: 'ESRI Light Gray Canvas',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            labelsUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
            attribution: '&copy; ESRI, HERE, Garmin & OpenStreetMap | BMKG & USGS',
            maxZoom: 16
        },
        topo: {
            name: 'ESRI World Topo Map',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            attribution: '&copy; ESRI, FAO, NOAA & OpenStreetMap | BMKG',
            maxZoom: 18
        },
        osm: {
            name: 'ESRI World Street Map (Vektor)',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
            attribution: '&copy; ESRI, DeLorme, NAVTEQ & OpenStreetMap | BMKG',
            maxZoom: 18
        }
    },

    init: function () {
        if (this.map) return;

        // 1. Create Leaflet Map Instance
        this.map = L.map('mapContainer', {
            center: this.CONFIG.center,
            zoom: this.CONFIG.zoom,
            minZoom: this.CONFIG.minZoom,
            maxZoom: this.CONFIG.maxZoom,
            zoomControl: false
        });

        // Add Zoom Control to Bottom-Right
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        // 2. Layer Groups
        this.platesLayerGroup = L.layerGroup().addTo(this.map);
        this.faultsLayerGroup = L.layerGroup().addTo(this.map);
        this.heatmapLayerGroup = L.layerGroup().addTo(this.map);
        this.shakemapLayerGroup = L.layerGroup().addTo(this.map);
        this.volcanoesLayerGroup = L.layerGroup().addTo(this.map);
        this.radiusLayerGroup = L.layerGroup().addTo(this.map);
        this.earthquakeLayerGroup = L.layerGroup().addTo(this.map);
        this.simulationLayerGroup = L.layerGroup().addTo(this.map);
        this.rulerLayerGroup = L.layerGroup().addTo(this.map);

        // 3. Tile Layer Configuration based on Theme
        const isDark = $('html').attr('data-bs-theme') !== 'light';
        this.currentBasemap = isDark ? 'dark' : 'light';
        this.setBasemap(this.currentBasemap);

        window.leafletMap = this.map;
        window.currentTileLayer = this.currentTileLayer;

        // 4. Load Fault Lines, Plates & Subduction Trenches
        this.loadFaultLines();
        this.renderTectonicPlates();

        // 5. Setup Map Click & Mousemove Listeners
        this.setupMapListeners();

        console.log("[SWANGEO] Earth Observatory Web GIS initialized.");
    },

    setBasemap: function (type) {
        if (!this.BASEMAPS[type]) return;
        this.currentBasemap = type;

        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }
        if (this.labelsTileLayer) {
            this.map.removeLayer(this.labelsTileLayer);
            this.labelsTileLayer = null;
        }

        const config = this.BASEMAPS[type];
        this.currentTileLayer = L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: config.maxZoom || 18
        }).addTo(this.map);

        // If basemap provides dedicated reference labels (like ESRI Dark/Light/Satellite), load them on top
        if (config.labelsUrl) {
            this.labelsTileLayer = L.tileLayer(config.labelsUrl, {
                maxZoom: config.maxZoom || 18,
                pane: 'markerPane'
            }).addTo(this.map);
        }

        window.currentTileLayer = this.currentTileLayer;

        // Update active class in dropdown UI
        $('[data-basemap]').removeClass('active');
        $(`[data-basemap="${type}"]`).addClass('active');

        // Update dropdown button label text
        const basemapLabel = config.name || type;
        $('#btnBasemapMenu span').text(basemapLabel);
    },

    toggleFaults: function () {
        this.faultsVisible = !this.faultsVisible;
        if (this.faultsVisible) {
            this.map.addLayer(this.faultsLayerGroup);
            this.map.addLayer(this.platesLayerGroup);
            $('#btnToggleFaults, #btnDockFaults').addClass('active');
        } else {
            this.map.removeLayer(this.faultsLayerGroup);
            this.map.removeLayer(this.platesLayerGroup);
            $('#btnToggleFaults, #btnDockFaults').removeClass('active');
        }
        return this.faultsVisible;
    },

    toggleHeatmap: function () {
        this.heatmapVisible = !this.heatmapVisible;
        if (this.heatmapVisible) {
            this.renderHeatmap(App.filteredData || App.earthquakeData);
            $('#btnDockHeatmap').addClass('active');
        } else {
            this.heatmapLayerGroup.clearLayers();
            $('#btnDockHeatmap').removeClass('active');
        }
        return this.heatmapVisible;
    },

    renderHeatmap: function (data) {
        if (!this.heatmapVisible || !data) return;
        this.heatmapLayerGroup.clearLayers();

        // Check if Leaflet.heat is available
        if (typeof L.heatLayer !== 'undefined') {
            const heatPoints = data.map(eq => [
                eq.latitude, 
                eq.longitude, 
                Math.min(1.0, Math.pow(eq.magnitude / 7.0, 2))
            ]);

            const heat = L.heatLayer(heatPoints, {
                radius: 35,
                blur: 25,
                maxZoom: 10,
                gradient: {
                    0.2: '#38bdf8',
                    0.4: '#10b981',
                    0.6: '#f59e0b',
                    0.8: '#ea580c',
                    1.0: '#ef4444'
                }
            });
            this.heatmapLayerGroup.addLayer(heat);
        }
    },

    toggleRuler: function () {
        this.rulerActive = !this.rulerActive;
        if (this.rulerActive) {
            this.rulerPoints = [];
            this.rulerLayerGroup.clearLayers();
            $('#rulerBadge').fadeIn(200);
            $('#btnDockRuler').addClass('active');
            this.map.getContainer().style.cursor = 'crosshair';
        } else {
            this.clearRuler();
        }
        return this.rulerActive;
    },

    clearRuler: function () {
        this.rulerActive = false;
        this.rulerPoints = [];
        this.rulerLayerGroup.clearLayers();
        $('#rulerBadge').fadeOut(200);
        $('#btnDockRuler').removeClass('active');
        if (this.map) {
            this.map.getContainer().style.cursor = '';
        }
    },

    handleRulerPoint: function (lat, lon) {
        this.rulerPoints.push([lat, lon]);

        const marker = L.circleMarker([lat, lon], {
            radius: 5,
            fillColor: '#00f0ff',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 1
        });
        this.rulerLayerGroup.addLayer(marker);

        if (this.rulerPoints.length === 2) {
            const p1 = this.rulerPoints[0];
            const p2 = this.rulerPoints[1];

            const distanceKM = WaveSimulator.calculateHaversine(p1[0], p1[1], p2[0], p2[1]);
            const pTravelSec = (distanceKM / WaveSimulator.VP).toFixed(1);
            const sTravelSec = (distanceKM / WaveSimulator.VS).toFixed(1);

            const line = L.polyline([p1, p2], {
                color: '#00f0ff',
                weight: 3,
                dashArray: '6, 6'
            });
            this.rulerLayerGroup.addLayer(line);

            const midLat = (p1[0] + p2[0]) / 2;
            const midLon = (p1[1] + p2[1]) / 2;

            const popup = L.popup({ closeButton: true, autoClose: false, className: 'ruler-popup' })
                .setLatLng([midLat, midLon])
                .setContent(`
                    <div class="font-mono p-1">
                        <div class="text-cyan small fw-bold text-uppercase"><i class="fa-solid fa-ruler-combined me-1"></i> HASIL PENGUKURAN</div>
                        <div class="fs-5 fw-bold text-heading my-1">${distanceKM.toFixed(1)} km</div>
                        <div class="small text-secondary border-top border-subtle pt-1 mt-1" style="font-size:0.72rem;">
                            <div>Estimasi Rambat P: <b class="text-info">${pTravelSec}s</b></div>
                            <div>Estimasi Rambat S: <b class="text-danger">${sTravelSec}s</b></div>
                        </div>
                    </div>
                `)
                .openOn(this.map);

            this.rulerLayerGroup.addLayer(popup);
            this.rulerPoints = [];
        }
    },

    resetView: function () {
        if (this.map) {
            this.map.flyTo(this.CONFIG.center, this.CONFIG.zoom, { duration: 1.2 });
        }
    },

    loadFaultLines: function () {
        const self = this;
        const renderLayer = function (geoData) {
            L.geoJSON(geoData, {
                style: function (feature) {
                    const isCritical = (feature.properties.hazard_rating === 'CRITICAL');
                    return {
                        color: isCritical ? '#ef4444' : '#f59e0b',
                        weight: isCritical ? 2.2 : 1.6,
                        dashArray: isCritical ? '6, 3' : '4, 4',
                        opacity: 0.85
                    };
                },
                onEachFeature: function (feature, layer) {
                    const p = feature.properties;
                    layer.bindTooltip(`
                        <div class="font-mono p-1">
                            <b class="text-danger">${p.fault_name}</b><br>
                            <span class="text-muted small">Tipe: ${p.fault_type}</span><br>
                            <span class="small">Laju Pergeseran: <b>${p.slip_rate_mm_yr} mm/thn</b></span>
                        </div>
                    `, { sticky: true });
                }
            }).addTo(self.faultsLayerGroup);
        };

        if (typeof window.FAULT_LINES_GEOJSON !== 'undefined' && window.FAULT_LINES_GEOJSON) {
            renderLayer(window.FAULT_LINES_GEOJSON);
            return;
        }

        $.getJSON('assets/faults.geojson', function (geoData) {
            renderLayer(geoData);
        }).fail(function () {
            console.warn("[MapEngine] Fault lines GeoJSON could not be loaded.");
        });
    },

    renderTectonicPlates: function () {
        // Major Plate Geodynamic Labels
        const plates = [
            { name: "LEMPENG EURASIA", coords: [-0.5, 111.0], note: "Paparan Sunda Stabil" },
            { name: "LEMPENG INDO-AUSTRALIA ➔", coords: [-12.0, 114.0], note: "Subduksi ~65-70 mm/thn ke Utara" },
            { name: "LEMPENG PASIFIK ➔", coords: [1.5, 137.0], note: "Pergerakan ~100 mm/thn ke Barat" },
            { name: "LEMPENG LAUT FILIPINA", coords: [5.5, 128.5], note: "Konvergensi Tektonik Aktif" }
        ];

        plates.forEach(p => {
            const icon = L.divIcon({
                className: 'tectonic-plate-label font-mono',
                html: `<div style="color: rgba(56, 189, 248, 0.45); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; text-shadow: 0 1px 4px rgba(0,0,0,0.8); pointer-events: none;">${p.name}<br><span style="font-size: 9px; opacity: 0.7; font-weight: 400;">${p.note}</span></div>`,
                iconSize: [200, 30],
                iconAnchor: [100, 15]
            });
            L.marker(p.coords, { icon: icon, interactive: false }).addTo(this.platesLayerGroup);
        });
    },

    renderEarthquakes: function (earthquakes) {
        if (!this.earthquakeLayerGroup) return;
        this.earthquakeLayerGroup.clearLayers();

        earthquakes.forEach((eq, index) => {
            // Scientific Color Palette (Standard USGS / Seismological Mapping)
            let fillColor = '#10b981'; // Emerald (Low Risk / Deep)
            if (eq.cluster_id === 0) fillColor = '#ef4444'; // Crimson Red (High Risk / Shallow)
            else if (eq.cluster_id === 1) fillColor = '#f59e0b'; // Warm Amber (Intermediate)

            // Scaled radius proportional to magnitude
            const radius = Math.pow(eq.magnitude, 1.8) * 1.35;

            // Precision Circle Marker
            const marker = L.circleMarker([eq.latitude, eq.longitude], {
                radius: radius,
                fillColor: fillColor,
                color: '#ffffff',
                weight: 1.0,
                opacity: 0.95,
                fillOpacity: 0.72
            });

            // Scientific Popup Format
            const isTsunami = (eq.tsunami_alert === 1);
            const tsunamiNotice = isTsunami 
                ? `<div class="badge bg-danger mb-2 w-100 font-mono"><i class="fa-solid fa-triangle-exclamation me-1"></i>PERINGATAN TSUNAMI</div>` 
                : '';

            const popupContent = `
                <div class="p-1 font-mono" style="min-width: 230px;">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="badge" style="background:${fillColor}; font-size:0.68rem;">${eq.risk_level || 'RISIKO'}</span>
                        <span class="text-secondary" style="font-size:0.7rem;">${eq.source}</span>
                    </div>
                    <div class="fw-bold fs-6 text-danger mb-1">M ${eq.magnitude.toFixed(1)} <span class="text-secondary fw-normal small">(${eq.mag_type || 'Mw'})</span></div>
                    <div class="small fw-semibold text-heading mb-2">${eq.place}</div>
                    ${tsunamiNotice}
                    <div class="small text-secondary border-top border-bottom border-subtle py-1 mb-2" style="font-size:0.72rem; line-height: 1.5;">
                        <div><b>Waktu:</b> ${eq.time}</div>
                        <div><b>Kedalaman:</b> ${eq.depth_km} km</div>
                        <div><b>Episentrum:</b> ${eq.latitude.toFixed(2)}°, ${eq.longitude.toFixed(2)}°</div>
                        ${eq.felt_mmi ? `<div><b>Guncangan:</b> ${eq.felt_mmi}</div>` : ''}
                    </div>
                    <div class="d-flex flex-column gap-1">
                        <button class="btn btn-sm btn-primary w-100 py-1 font-mono" style="font-size:0.75rem;" onclick="WaveSimulator.startSimulationFromQuake('${eq.id}', ${eq.latitude}, ${eq.longitude}, ${eq.magnitude}, ${eq.depth_km}, '${eq.place ? eq.place.replace(/'/g, "\\'") : ''}')">
                            <i class="fa-solid fa-calculator me-1"></i> Hitung Waktu Tiba P/S
                        </button>
                        <button class="btn btn-sm btn-outline-warning w-100 py-1 font-mono" style="font-size:0.75rem;" onclick="MapEngine.renderShakeMap(${eq.latitude}, ${eq.longitude}, ${eq.magnitude}, ${eq.depth_km}, '${eq.place ? eq.place.replace(/'/g, "\\'") : ''}')">
                            <i class="fa-solid fa-bullseye me-1"></i> Peta Guncangan (ShakeMap MMI)
                        </button>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent);
            this.earthquakeLayerGroup.addLayer(marker);

            // Pulsing Marker for Latest Event
            if (eq.is_latest || index === 0) {
                const pulsingIcon = L.divIcon({
                    className: 'pulsing-marker-halo',
                    iconSize: [radius * 3.2, radius * 3.2],
                    iconAnchor: [(radius * 3.2) / 2, (radius * 3.2) / 2]
                });
                const pulseMarker = L.marker([eq.latitude, eq.longitude], { icon: pulsingIcon });
                this.earthquakeLayerGroup.addLayer(pulseMarker);
            }
        });

        // If heatmap enabled, re-render heat points
        if (this.heatmapVisible) {
            this.renderHeatmap(earthquakes);
        }
    },

    /* =========================================================================
       7. SHAKEMAP MMI INTENSITY CONTOUR ENGINE (BMKG / ATKINSON ATTENUATION)
       ========================================================================= */
    renderShakeMap: function (lat, lon, mag, depth, place) {
        this.clearShakeMap();

        const mmiZones = [
            { mmi: "MMI III-IV", desc: "Getaran Ringan - Dirasakan orang banyak di dalam rumah", level: 3.5, color: "#38bdf8", fillOpacity: 0.15, borderDash: "4, 4" },
            { mmi: "MMI V", desc: "Getaran Sedang - Benda berayun, tiang bergoyang", level: 5.0, color: "#eab308", fillOpacity: 0.20, borderDash: "6, 4" },
            { mmi: "MMI VI", desc: "Getaran Kuat - Plester dinding retak, orang kaget & berlarian", level: 6.0, color: "#f97316", fillOpacity: 0.25, borderDash: "none" },
            { mmi: "MMI VII-VIII+", desc: "Getaran Sangat Kuat / Merusak - Bangunan rusak sedang hingga berat", level: 7.0, color: "#ef4444", fillOpacity: 0.32, borderDash: "none" }
        ];

        // Empirical hypocentral distance calculation: log10(R) = (1.5*M + 1.2 - MMI)/2.5
        const ringsToDraw = [];
        mmiZones.forEach(zone => {
            const exp = (1.5 * mag + 1.2 - zone.level) / 2.5;
            const rHypo = Math.pow(10, exp);
            const rEpiKM = Math.sqrt(Math.max(0, Math.pow(rHypo, 2) - Math.pow(depth, 2)));

            if (rEpiKM > 10) {
                ringsToDraw.push({
                    ...zone,
                    radiusKM: Math.round(rEpiKM),
                    radiusMeters: Math.round(rEpiKM * 1000)
                });
            }
        });

        if (ringsToDraw.length === 0) {
            Swal.fire({
                title: 'Magnitudo Terlalu Kecil',
                text: 'Intensitas guncangan permukaan tidak mencapai threshold MMI III untuk pemodelan kontur makroseismik.',
                icon: 'info',
                background: 'rgba(8, 20, 42, 0.95)',
                color: '#f8fafc'
            });
            return;
        }

        // Sort descending so larger zones are drawn first (in background)
        ringsToDraw.sort((a, b) => b.radiusMeters - a.radiusMeters);

        ringsToDraw.forEach(ring => {
            const circle = L.circle([lat, lon], {
                radius: ring.radiusMeters,
                color: ring.color,
                fillColor: ring.color,
                fillOpacity: ring.fillOpacity,
                weight: 1.8,
                dashArray: ring.borderDash
            });

            circle.bindTooltip(`
                <div class="font-mono p-1">
                    <b style="color:${ring.color}; font-size:12px;">${ring.mmi}</b> (Radius ~${ring.radiusKM} km)<br>
                    <span class="text-light small">${ring.desc}</span>
                </div>
            `, { sticky: true });

            this.shakemapLayerGroup.addLayer(circle);
        });

        // Center epicenter focal pin
        const epicenterPin = L.circleMarker([lat, lon], {
            radius: 7,
            fillColor: '#ffffff',
            color: '#ef4444',
            weight: 3,
            fillOpacity: 1
        }).bindTooltip(`<b class="text-danger font-mono">PUSAT GEMPA M ${mag.toFixed(1)}</b>`, { permanent: true, direction: 'top' });

        this.shakemapLayerGroup.addLayer(epicenterPin);

        // Show floating HUD badge
        $('#shakemapPlace').text(place || 'Episentrum Gempa');
        $('#shakemapMag').text(`M ${mag.toFixed(1)} (${depth} km)`);
        $('#shakemapBadge').fadeIn(200);

        this.map.flyTo([lat, lon], Math.max(5, 8 - Math.floor(mag / 2.5)), { duration: 1.0 });
    },

    clearShakeMap: function () {
        if (this.shakemapLayerGroup) {
            this.shakemapLayerGroup.clearLayers();
        }
        $('#shakemapBadge').fadeOut(200);
    },

    /* =========================================================================
       8. VOLCANOES ECOSYSTEM LAYER (127 GUNUNG API AKTIF RI - PVMBG)
       ========================================================================= */
    toggleVolcanoes: function () {
        this.volcanoesVisible = !this.volcanoesVisible;
        if (this.volcanoesVisible) {
            this.renderVolcanoes();
            $('#btnToggleVolcanoes, #btnDockVolcanoes').addClass('active');
        } else {
            this.volcanoesLayerGroup.clearLayers();
            $('#btnToggleVolcanoes, #btnDockVolcanoes').removeClass('active');
        }
        return this.volcanoesVisible;
    },

    renderVolcanoes: function () {
        if (!this.volcanoesLayerGroup || !window.VOLCANOES_DATA) return;
        this.volcanoesLayerGroup.clearLayers();

        window.VOLCANOES_DATA.forEach(vol => {
            let statusColor = '#10b981'; // Level I Normal
            if (vol.status.includes('Level IV')) statusColor = '#ef4444'; // Awas
            else if (vol.status.includes('Level III')) statusColor = '#f97316'; // Siaga
            else if (vol.status.includes('Level II')) statusColor = '#eab308'; // Waspada

            const iconHtml = `
                <div style="position:relative; width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                    <div style="width:0; height:0; border-left:9px solid transparent; border-right:9px solid transparent; border-bottom:16px solid ${statusColor}; filter: drop-shadow(0 0 6px ${statusColor});"></div>
                    <div style="position:absolute; bottom:1px; width:4px; height:4px; border-radius:50%; background:#fff;"></div>
                </div>
            `;

            const icon = L.divIcon({
                className: 'volcano-marker-icon',
                html: iconHtml,
                iconSize: [26, 26],
                iconAnchor: [13, 16]
            });

            const marker = L.marker([vol.lat, vol.lon], { icon: icon });

            const popupContent = `
                <div class="p-1 font-mono" style="min-width: 220px;">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="badge" style="background:${statusColor}; font-size:0.68rem;">${vol.status}</span>
                        <span class="text-secondary small">${vol.island}</span>
                    </div>
                    <div class="fw-bold fs-6 text-light mb-1"><i class="fa-solid fa-volcano text-danger me-1"></i>${vol.name}</div>
                    <div class="small text-secondary border-top border-bottom border-subtle py-1 mb-2" style="font-size:0.72rem; line-height: 1.5;">
                        <div><b>Elevasi:</b> ${vol.elev} mdpl</div>
                        <div><b>Tipe:</b> ${vol.type}</div>
                        <div><b>Erupsi Terakhir:</b> ${vol.lastEruption}</div>
                        <div><b>Koordinat:</b> ${vol.lat.toFixed(4)}°, ${vol.lon.toFixed(4)}°</div>
                    </div>
                    <div class="small text-muted" style="font-size:0.68rem;">Sumber: PVMBG / Badan Geologi ESDM</div>
                </div>
            `;
            marker.bindPopup(popupContent);
            this.volcanoesLayerGroup.addLayer(marker);
        });
    },

    /* =========================================================================
       9. SPATIAL RADIUS FILTER TOOL (RADAR GPS / PINPOINT RADIUS)
       ========================================================================= */
    toggleRadiusFilter: function () {
        this.radiusFilterActive = !this.radiusFilterActive;
        if (this.radiusFilterActive) {
            $('#radiusFilterBadge').fadeIn(200);
            $('#btnDockRadius').addClass('active');
            this.map.getContainer().style.cursor = 'crosshair';
            if (!this.radiusCenter) {
                // Default to Jakarta / Java Trench as initial anchor if not set
                this.handleRadiusClick(-6.2, 106.8);
            }
        } else {
            this.clearRadiusFilter();
        }
        return this.radiusFilterActive;
    },

    handleRadiusClick: function (lat, lon) {
        this.radiusCenter = [lat, lon];
        this.updateRadiusCircle();
    },

    setRadiusKM: function (km) {
        this.radiusKM = parseInt(km);
        $('#radiusValueLabel').text(`${this.radiusKM} km`);
        if (this.radiusCenter) {
            this.updateRadiusCircle();
        }
    },

    updateRadiusCircle: function () {
        if (!this.radiusCenter) return;
        this.radiusLayerGroup.clearLayers();

        const [lat, lon] = this.radiusCenter;
        const radiusM = this.radiusKM * 1000;

        // Radar circle
        const circle = L.circle([lat, lon], {
            radius: radiusM,
            color: '#00f0ff',
            fillColor: '#00f0ff',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '5, 5'
        });
        this.radiusLayerGroup.addLayer(circle);

        // Center pin
        const centerMarker = L.circleMarker([lat, lon], {
            radius: 6,
            fillColor: '#00f0ff',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 1
        }).bindTooltip(`<b class="font-mono text-cyan">PUSAT RADAR: ${this.radiusKM} KM</b>`, { permanent: false });
        this.radiusLayerGroup.addLayer(centerMarker);

        // Update UI badge
        $('#radiusCenterCoord').text(`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);

        // Trigger Application Filter
        if (typeof App !== 'undefined' && App.applyRadiusFilter) {
            App.applyRadiusFilter(lat, lon, this.radiusKM);
        }
    },

    clearRadiusFilter: function () {
        this.radiusFilterActive = false;
        this.radiusCenter = null;
        this.radiusLayerGroup.clearLayers();
        $('#radiusFilterBadge').fadeOut(200);
        $('#btnDockRadius').removeClass('active');
        this.map.getContainer().style.cursor = '';
        if (typeof App !== 'undefined' && App.resetFilters) {
            App.applyFilter();
        }
    },

    useGPSLocation: function () {
        const self = this;
        if (!navigator.geolocation) {
            Swal.fire({ title: 'GPS Tidak Didukung', text: 'Browser Anda tidak mendukung Geolocation API.', icon: 'warning' });
            return;
        }

        Swal.fire({
            title: 'Mencari Posisi GPS...',
            text: 'Mohon izinkan akses lokasi jika browser meminta.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        navigator.geolocation.getCurrentPosition(
            function (pos) {
                Swal.close();
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                self.radiusFilterActive = true;
                $('#radiusFilterBadge').fadeIn(200);
                $('#btnDockRadius').addClass('active');
                self.handleRadiusClick(lat, lon);
                self.map.flyTo([lat, lon], 7, { duration: 1.2 });
            },
            function (err) {
                Swal.fire({ title: 'Gagal Membaca GPS', text: err.message, icon: 'error' });
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    },

    /* =========================================================================
       10. HIGH-RES MAP SCREENSHOT CAPTURE (.PNG)
       ========================================================================= */
    exportMapScreenshot: function () {
        if (typeof html2canvas === 'undefined') {
            alert("html2canvas library not loaded.");
            return;
        }

        Swal.fire({
            title: 'Menyiapkan Tangkapan Layar...',
            text: 'Meng-generate snapshot peta resolusi tinggi SWANGEO...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const mapElem = document.getElementById('mapContainer');
        html2canvas(mapElem, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#070f1e'
        }).then(canvas => {
            Swal.close();
            const link = document.createElement('a');
            const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            link.download = `swangeo_map_snapshot_${now}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            Swal.fire({ title: 'Gagal Snapshot', text: err.message, icon: 'error' });
        });
    },

    setupMapListeners: function () {
        const self = this;

        // 1. Mousemove Real-time Coordinate Inspector
        this.map.on('mousemove', function (e) {
            $('#inspLat').text(e.latlng.lat.toFixed(4) + '°');
            $('#inspLon').text(e.latlng.lng.toFixed(4) + '°');
        });

        // 2. Zoom Level Inspector
        this.map.on('zoomend', function () {
            $('#inspZoom').text(self.map.getZoom().toFixed(1));
        });

        // 3. Map Click Handler (Routing between Ruler, Radius, and Wave Simulator)
        this.map.on('click', function (e) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;

            if (self.rulerActive) {
                self.handleRulerPoint(lat, lon);
            } else if (self.radiusFilterActive) {
                self.handleRadiusClick(lat, lon);
            } else {
                WaveSimulator.handleMapClickTarget(lat, lon);
            }
        });
    },

    flyToLocation: function (lat, lon, zoom = 8) {
        if (this.map) {
            this.map.flyTo([lat, lon], zoom, { duration: 1.2 });
        }
    }
};

window.MapEngine = MapEngine;
