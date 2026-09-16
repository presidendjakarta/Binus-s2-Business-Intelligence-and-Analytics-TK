/**
 * SWANGEO: Historical Timeline Time-Lapse Playback Engine
 * Chronological Earthquake Evolution & Aftershock Spatiotemporal Propagation
 */

const TimelineEngine = {
    events: [],
    currentIndex: 0,
    isPlaying: false,
    timer: null,
    speeds: [1, 2, 5],
    speedIndex: 0,
    pulseMarker: null,

    init: function () {
        const self = this;

        // Play / Pause Toggle
        $('#btnTimelinePlay').on('click', function () {
            self.togglePlay();
        });

        // Speed Button
        $('#btnTimelineSpeed').on('click', function () {
            self.cycleSpeed();
        });

        // Step Back / Step Forward
        $('#btnTimelinePrev').on('click', function () {
            self.pause();
            self.goTo(self.currentIndex - 1);
        });

        $('#btnTimelineNext').on('click', function () {
            self.pause();
            self.goTo(self.currentIndex + 1);
        });

        // Scrubber Slider
        $('#timelineScrubber').on('input', function () {
            self.pause();
            self.goTo(parseInt($(this).val()));
        });

        // Close Timeline
        $('#btnCloseTimeline').on('click', function () {
            self.close();
        });

        // Bottom Dock Timeline Button Trigger
        $('#btnDockTimeline').on('click', function () {
            self.toggle();
        });

        console.log("[TimelineEngine] Initialized.");
    },

    toggle: function () {
        if ($('#timelineHUD').is(':visible')) {
            this.close();
        } else {
            this.open();
        }
    },

    open: function () {
        const data = App.filteredData && App.filteredData.length > 0 ? App.filteredData : App.earthquakeData;
        if (!data || data.length === 0) {
            Swal.fire({
                title: 'Data Tidak Tersedia',
                text: 'Tidak ada data gempa untuk diputar pada rentang filter saat ini.',
                icon: 'warning',
                background: 'rgba(8, 20, 42, 0.95)',
                color: '#f8fafc'
            });
            return;
        }

        // Sort chronologically (oldest to newest)
        this.events = [...data].sort((a, b) => new Date(a.time_utc || a.time) - new Date(b.time_utc || b.time));
        this.currentIndex = 0;

        $('#timelineScrubber').attr('min', 0).attr('max', this.events.length - 1).val(0);
        $('#btnDockTimeline').addClass('active');
        $('#timelineHUD').fadeIn(250);

        this.goTo(0);
    },

    close: function () {
        this.pause();
        $('#timelineHUD').fadeOut(200);
        $('#btnDockTimeline').removeClass('active');
        if (this.pulseMarker && window.leafletMap) {
            window.leafletMap.removeLayer(this.pulseMarker);
            this.pulseMarker = null;
        }
        // Restore standard view
        if (typeof MapEngine !== 'undefined') {
            MapEngine.renderEarthquakes(App.filteredData || App.earthquakeData);
        }
    },

    togglePlay: function () {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    play: function () {
        const self = this;
        if (this.currentIndex >= this.events.length - 1) {
            this.currentIndex = 0;
        }

        this.isPlaying = true;
        $('#btnTimelinePlay').html('<i class="fa-solid fa-pause"></i>').addClass('btn-warning').removeClass('btn-primary');

        const stepDelay = Math.round(1400 / this.speeds[this.speedIndex]);

        this.timer = setInterval(function () {
            if (self.currentIndex < self.events.length - 1) {
                self.goTo(self.currentIndex + 1);
            } else {
                self.pause();
            }
        }, stepDelay);
    },

    pause: function () {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        $('#btnTimelinePlay').html('<i class="fa-solid fa-play"></i>').addClass('btn-primary').removeClass('btn-warning');
    },

    cycleSpeed: function () {
        this.speedIndex = (this.speedIndex + 1) % this.speeds.length;
        const currentSpeed = this.speeds[this.speedIndex];
        $('#btnTimelineSpeed').text(currentSpeed + 'x');

        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    },

    goTo: function (index) {
        if (index < 0) index = 0;
        if (index >= this.events.length) index = this.events.length - 1;

        this.currentIndex = index;
        const eq = this.events[index];
        $('#timelineScrubber').val(index);

        // Update Text Info
        const timeStr = eq.time || eq.time_utc || 'Waktu tidak tersedia';
        $('#timelineCounter').text(`GEMPA ${index + 1} / ${this.events.length}`);
        $('#timelineDate').text(timeStr);
        $('#timelineEventDetail').html(`
            <span class="badge ${eq.magnitude >= 6.0 ? 'bg-danger' : 'bg-warning'} font-mono me-1">M ${eq.magnitude.toFixed(1)}</span>
            <span class="text-light fw-bold">${eq.place}</span>
            <span class="text-secondary ms-1">(${eq.depth_km} km)</span>
        `);

        // Visual Shockwave on Map
        this.highlightEpicenter(eq);

        // Render cumulative earthquakes up to this point
        const sliceData = this.events.slice(0, index + 1);
        if (typeof MapEngine !== 'undefined') {
            MapEngine.renderEarthquakes(sliceData);
        }
    },

    highlightEpicenter: function (eq) {
        if (!window.leafletMap) return;

        if (this.pulseMarker) {
            window.leafletMap.removeLayer(this.pulseMarker);
            this.pulseMarker = null;
        }

        const size = Math.max(35, eq.magnitude * 8);
        const icon = L.divIcon({
            className: 'timeline-shockwave-icon',
            html: `<div class="timeline-shockwave-ring" style="width:${size}px; height:${size}px; border-color:${eq.magnitude >= 6.0 ? '#ef4444' : '#00f0ff'};"></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });

        this.pulseMarker = L.marker([eq.latitude, eq.longitude], { icon: icon, zIndexOffset: 2000 }).addTo(window.leafletMap);

        // Pan map if epicenter is outside current view bounds
        if (!window.leafletMap.getBounds().contains([eq.latitude, eq.longitude])) {
            window.leafletMap.panTo([eq.latitude, eq.longitude], { animate: true, duration: 0.6 });
        }
    }
};

window.TimelineEngine = TimelineEngine;
