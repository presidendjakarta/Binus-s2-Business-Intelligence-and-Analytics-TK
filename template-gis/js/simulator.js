/**
 * INA-SEISMOBI: Seismic Wave Propagation & Early Warning Physics Simulator
 * Style: Digital Twin Earth Observatory Standard
 */

const WaveSimulator = {
    activeQuake: null,
    targetPin: null,
    pWaveCircle: null,
    sWaveCircle: null,
    animationInterval: null,
    countdownInterval: null,

    // Crustal Wave Velocities (Standard PREM / IASP91 Model for Indonesian Crust)
    VP: 6.0, // P-Wave Velocity (km/s)
    VS: 3.5, // S-Wave Velocity (km/s)

    init: function () {
        $('#btnCloseSimHUD').on('click', () => this.clearSimulation());
    },

    startSimulationFromQuake: function (id, eqLat, eqLon, mag, depth, place) {
        this.activeQuake = { id, lat: eqLat, lon: eqLon, mag, depth, place };
        
        // Default target to Jakarta if no target clicked yet
        const defaultTargetLat = -6.2088;
        const defaultTargetLon = 106.8456;
        this.calculateAndAnimate(defaultTargetLat, defaultTargetLon, "Jakarta (Pusat Koordinasi)");
    },

    handleMapClickTarget: function (targetLat, targetLon) {
        if (!this.activeQuake) {
            const allQuakes = App.earthquakeData || [];
            if (allQuakes.length === 0) return;
            const topQuake = allQuakes[0];
            this.activeQuake = {
                id: topQuake.id,
                lat: topQuake.latitude,
                lon: topQuake.longitude,
                mag: topQuake.magnitude,
                depth: topQuake.depth_km,
                place: topQuake.place
            };
        }

        this.calculateAndAnimate(targetLat, targetLon, `Koordinat ${targetLat.toFixed(2)}°, ${targetLon.toFixed(2)}°`);
    },

    calculateAndAnimate: function (targetLat, targetLon, targetName) {
        const q = this.activeQuake;
        if (!q || !MapEngine.map) return;

        // 1. Calculate 3D Hypocentral Distance
        const epiDistKM = this.calculateHaversine(q.lat, q.lon, targetLat, targetLon);
        const hypoDistKM = Math.sqrt(Math.pow(epiDistKM, 2) + Math.pow(q.depth, 2));

        // 2. Wave Travel Times
        const pWaveTimeSec = hypoDistKM / this.VP;
        const sWaveTimeSec = hypoDistKM / this.VS;
        const leadTimeSec = Math.max(0, sWaveTimeSec - pWaveTimeSec);

        // 3. Ground Shaking MMI Estimation
        const mmiResult = this.estimateMMI(q.mag, hypoDistKM);

        // 4. Update Target Pin Marker on Map
        if (this.targetPin) {
            MapEngine.simulationLayerGroup.removeLayer(this.targetPin);
        }
        this.targetPin = L.marker([targetLat, targetLon], {
            icon: L.divIcon({
                className: 'target-user-pin',
                html: '<div style="background:#0284c7;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(56,189,248,0.9);border:2px solid #fff;font-size:12px;"><i class="fa-solid fa-location-crosshairs"></i></div>',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            })
        }).bindPopup(`
            <div class="font-mono p-1" style="min-width: 190px;">
                <div class="d-flex align-items-center gap-1 text-cyan mb-1">
                    <i class="fa-solid fa-crosshairs small"></i>
                    <span class="small fw-bold text-uppercase">Titik Pengamatan Target</span>
                </div>
                <div class="fw-bold text-heading fs-6 mb-1">${targetName}</div>
                <div class="small text-secondary border-top border-subtle pt-1 mt-1">
                    Jarak Hiposentral: <b class="text-cyan font-mono">${hypoDistKM.toFixed(1)} km</b>
                </div>
            </div>
        `).addTo(MapEngine.simulationLayerGroup);

        this.targetPin.openPopup();

        // 5. Render Animated Expanding Waves
        this.startWaveAnimation(q.lat, q.lon, epiDistKM, pWaveTimeSec, sWaveTimeSec);

        // 6. Update Precision HUD
        this.updateHUD({
            id: q.id,
            targetName: targetName,
            quakePlace: q.place,
            magnitude: q.mag,
            depth: q.depth,
            epiDistKM: epiDistKM.toFixed(1),
            hypoDistKM: hypoDistKM.toFixed(1),
            pWaveTime: pWaveTimeSec.toFixed(1),
            sWaveTime: sWaveTimeSec.toFixed(1),
            leadTime: sWaveTimeSec,
            mmiScale: mmiResult.scale,
            mmiDesc: mmiResult.desc,
            mmiBadgeColor: mmiResult.color
        });
    },

    startWaveAnimation: function (originLat, originLon, maxDistKM, pTotalSec, sTotalSec) {
        if (this.animationInterval) clearInterval(this.animationInterval);
        if (this.pWaveCircle) MapEngine.simulationLayerGroup.removeLayer(this.pWaveCircle);
        if (this.sWaveCircle) MapEngine.simulationLayerGroup.removeLayer(this.sWaveCircle);

        // Primary Wave (P-Wave, Cyan / Blue dashed)
        this.pWaveCircle = L.circle([originLat, originLon], {
            radius: 1000,
            color: '#00f0ff',
            fillColor: '#00f0ff',
            fillOpacity: 0.08,
            weight: 1.8,
            dashArray: '4, 4'
        }).addTo(MapEngine.simulationLayerGroup);

        // Secondary Wave (S-Wave, Red / Destructive solid)
        this.sWaveCircle = L.circle([originLat, originLon], {
            radius: 500,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            weight: 2.2
        }).addTo(MapEngine.simulationLayerGroup);

        let elapsed = 0;
        const dt = 0.2;
        const maxRadiusMeters = maxDistKM * 1000 * 1.25;

        this.animationInterval = setInterval(() => {
            elapsed += dt;
            const pRadius = elapsed * this.VP * 1000;
            const sRadius = elapsed * this.VS * 1000;

            if (pRadius < maxRadiusMeters) {
                this.pWaveCircle.setRadius(pRadius);
            }
            if (sRadius < maxRadiusMeters) {
                this.sWaveCircle.setRadius(sRadius);
            }

            if (sRadius >= maxRadiusMeters) {
                elapsed = 0;
            }
        }, 200);
    },

    updateHUD: function (data) {
        const $hud = $('#simHUD');
        $hud.fadeIn(200);

        $('#simQuakeId').text(data.id || 'SEISMIC-EVENT');
        $('#simQuakePlace').html(`M ${data.magnitude.toFixed(1)} • ${data.quakePlace}`);
        $('#simDistEpi').text(`${data.epiDistKM} km`);
        $('#simDistHipo').text(`${data.hypoDistKM} km`);
        $('#simTimeP').text(`${data.pWaveTime}s`);
        $('#simTimeS').text(`${data.sWaveTime}s`);
        
        $('#simMMIBadge').text(`Skala MMI ${data.mmiScale}`).css('background-color', data.mmiBadgeColor);
        $('#simGuidanceText').html(`<i class="fa-solid fa-shield-halved text-warning me-1"></i> ${data.mmiDesc}`);

        if (this.countdownInterval) clearInterval(this.countdownInterval);
        let remaining = parseFloat(data.leadTime);

        const $countdown = $('#simLeadTime');
        $countdown.text(`${remaining.toFixed(1)}s`);

        this.countdownInterval = setInterval(() => {
            remaining -= 0.1;
            if (remaining <= 0) {
                $countdown.text("TIBA! ⚠️").addClass('text-danger');
                clearInterval(this.countdownInterval);
            } else {
                $countdown.text(`${remaining.toFixed(1)}s`).removeClass('text-danger');
            }
        }, 100);
    },

    clearSimulation: function () {
        $('#simHUD').fadeOut(200);
        if (this.animationInterval) clearInterval(this.animationInterval);
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        if (this.pWaveCircle) MapEngine.simulationLayerGroup.removeLayer(this.pWaveCircle);
        if (this.sWaveCircle) MapEngine.simulationLayerGroup.removeLayer(this.sWaveCircle);
        if (this.targetPin) MapEngine.simulationLayerGroup.removeLayer(this.targetPin);
    },

    calculateHaversine: function (lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth Radius (KM)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    estimateMMI: function (mag, hypoDistKM) {
        let rawMMI = 1.5 * mag - 3.25 * Math.log(Math.max(10, hypoDistKM)) + 2.5;
        rawMMI = Math.max(1, Math.min(10, rawMMI));

        if (rawMMI <= 2.5) {
            return { scale: "I - II", desc: "Getaran lemah. Hampir tidak dirasakan kecuali yang diam.", color: "#10b981" };
        } else if (rawMMI <= 4.0) {
            return { scale: "III - IV", desc: "Getaran dirasakan nyata di dalam ruangan. Jendela berderik.", color: "#0284c7" };
        } else if (rawMMI <= 6.0) {
            return { scale: "V - VI", desc: "Guncangan kuat dirasakan semua orang. Waspada barang jatuh!", color: "#f59e0b" };
        } else if (rawMMI <= 8.0) {
            return { scale: "VII - VIII", desc: "Kerusakan ringan-sedang. Segera lindungi kepala & cari ruang terbuka!", color: "#ea580c" };
        } else {
            return { scale: "IX - X", desc: "Destruktif hebat! Evakuasi darurat ke zona aman tsunami/tanah lapang.", color: "#ef4444" };
        }
    }
};

$(document).ready(function () {
    WaveSimulator.init();
});

window.WaveSimulator = WaveSimulator;
