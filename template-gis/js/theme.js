/**
 * INA-SEISMOBI: Dynamic Theme Switcher Module (Dark / Light Mode)
 * Handles HTML attribute toggling, Leaflet tile switching, Chart.js recoloring, and localStorage persistence.
 */

const ThemeManager = {
    STORAGE_KEY: 'ina_seismobi_theme',
    DEFAULT_THEME: 'dark',

    init: function () {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_THEME;
        this.applyTheme(savedTheme, false);

        // Bind Theme Toggle Button
        $(document).on('click', '#btnThemeToggle', () => {
            const current = $('html').attr('data-bs-theme') || 'dark';
            const nextTheme = (current === 'dark') ? 'light' : 'dark';
            this.applyTheme(nextTheme, true);
        });
    },

    applyTheme: function (theme, animate = true) {
        const isDark = (theme === 'dark');
        $('html').attr('data-bs-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);

        // 1. Update Switcher Button Icon & Label
        const $btn = $('#btnThemeToggle');
        if ($btn.length) {
            if (isDark) {
                $btn.html('<i class="fa-solid fa-moon text-info" id="themeIcon"></i>');
                $btn.attr('title', 'Mode Gelap Aktif (Klik untuk Mode Terang)');
            } else {
                $btn.html('<i class="fa-solid fa-sun text-warning" id="themeIcon"></i>');
                $btn.attr('title', 'Mode Terang Aktif (Klik untuk Mode Gelap)');
            }
        }

        // 2. Switch Leaflet Map Tiles dynamically via MapEngine
        if (window.MapEngine && window.MapEngine.map) {
            const basemapType = isDark ? 'dark' : 'light';
            window.MapEngine.setBasemap(basemapType);
        }

        // 3. Update Chart.js themes if charts exist
        if (window.ChartsManager && typeof window.ChartsManager.updateTheme === 'function') {
            window.ChartsManager.updateTheme(isDark);
        }

        // 4. Trigger Custom Event for other modules
        $(document).trigger('themeChanged', [theme, isDark]);
    },

    isDarkMode: function () {
        return ($('html').attr('data-bs-theme') === 'dark');
    }
};

// Initialize on DOM ready
$(document).ready(function () {
    ThemeManager.init();
});

window.ThemeManager = ThemeManager;
