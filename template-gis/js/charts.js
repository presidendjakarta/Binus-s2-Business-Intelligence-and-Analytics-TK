/**
 * INA-SEISMOBI: Telemetry Charts Engine (Chart.js v4.4)
 * Style: Digital Twin Earth Observatory & GIS Command Center
 */

const ChartsManager = {
    trendChart: null,
    clusterChart: null,
    depthChart: null,

    init: function () {},

    renderAllCharts: function (data) {
        this.renderTrendChart(data);
        this.renderClusterChart(data);
        this.renderDepthChart(data);
    },

    renderTrendChart: function (data) {
        const ctx = document.getElementById('trendChart') || document.getElementById('chartTrend');
        if (!ctx) return;

        // Aggregate by date
        const dateCounts = {};
        data.forEach(eq => {
            const dateKey = (eq.time || '').split('T')[0] || 'Unknown';
            dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
        });

        const sortedDates = Object.keys(dateCounts).sort().slice(-7);
        const counts = sortedDates.map(d => dateCounts[d]);

        const isDark = ThemeManager.isDarkMode();
        const gridColor = isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(0, 0, 0, 0.06)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        if (this.trendChart) this.trendChart.destroy();

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates.map(d => d.slice(5)), // MM-DD
                datasets: [{
                    label: 'Frekuensi Gempa',
                    data: counts,
                    borderColor: '#38bdf8',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#00f0ff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1,
                    pointRadius: 3.5,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#08142a' : '#ffffff',
                        titleColor: isDark ? '#f0f6fc' : '#0f172a',
                        bodyColor: isDark ? '#38bdf8' : '#0284c7',
                        borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(0,0,0,0.1)',
                        borderWidth: 1,
                        padding: 8,
                        titleFont: { family: 'JetBrains Mono', size: 11 },
                        bodyFont: { family: 'JetBrains Mono', size: 11 }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 9.5 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 9.5 }, stepSize: 1 }
                    }
                }
            }
        });
    },

    renderClusterChart: function (data) {
        const ctx = document.getElementById('clusterChart') || document.getElementById('chartCluster');
        if (!ctx) return;

        let red = 0, amber = 0, green = 0;
        data.forEach(eq => {
            if (eq.cluster_id === 0) red++;
            else if (eq.cluster_id === 1) amber++;
            else green++;
        });

        const isDark = ThemeManager.isDarkMode();

        if (this.clusterChart) this.clusterChart.destroy();

        this.clusterChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Zona Merah', 'Zona Kuning', 'Zona Hijau'],
                datasets: [{
                    data: [red, amber, green],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderColor: isDark ? '#08142a' : '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: isDark ? '#94a3b8' : '#475569',
                            boxWidth: 8,
                            padding: 8,
                            font: { family: 'Inter', size: 9.5 }
                        }
                    }
                }
            }
        });
    },

    renderDepthChart: function (data) {
        const ctx = document.getElementById('depthChart') || document.getElementById('chartDepth');
        if (!ctx) return;

        let shallow = 0, intermediate = 0, deep = 0;
        data.forEach(eq => {
            if (eq.depth_km < 60) shallow++;
            else if (eq.depth_km <= 300) intermediate++;
            else deep++;
        });

        const isDark = ThemeManager.isDarkMode();
        const gridColor = isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(0, 0, 0, 0.06)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        if (this.depthChart) this.depthChart.destroy();

        this.depthChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['<60 km', '60-300 km', '>300 km'],
                datasets: [{
                    label: 'Jumlah Gempa',
                    data: [shallow, intermediate, deep],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 9.5 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 9.5 } }
                    }
                }
            }
        });
    },

    updateTheme: function (isDark) {
        if (App && App.filteredData) {
            this.renderAllCharts(App.filteredData);
        }
    }
};

window.ChartsManager = ChartsManager;
