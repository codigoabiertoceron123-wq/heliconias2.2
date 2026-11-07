// js/core/accessibility.js - Funciones de accesibilidad para la página de configuración
// Script clásico compatible con file:// (sin ES modules). Afecta a TODA la página,
// incluido el menú hamburguesa.
(function () {
    'use strict';

    // Clases CSS para accesibilidad
    const CLASS_HIGH_CONTRAST = 'high-contrast';
    const CLASS_LARGE_TEXT = 'large-text';
    const CLASS_FONT_SANS = 'font-sans';
    const CLASS_FONT_SERIF = 'font-serif';
    const CLASS_FONT_MONO = 'font-mono';

    // Claves de localStorage
    const LS_HIGH_CONTRAST = 'hc_accessibility_high_contrast';
    const LS_LARGE_TEXT = 'hc_accessibility_large_text';
    const LS_FONT_SIZE = 'hc_accessibility_font_size';
    const LS_FONT_FAMILY = 'hc_accessibility_font_family';

    // Valores por defecto
    const FONT_SIZES = {
        normal: '1.1rem',
        large: '1.25rem',
        extraLarge: '1.5rem'
    };

    const FONT_FAMILIES = {
        sans: 'font-sans',
        serif: 'font-serif',
        mono: 'font-mono'
    };

    // Leer preferencia guardada
    function getStored(key, def) {
        try {
            const raw = localStorage.getItem(key);
            return raw !== null ? JSON.parse(raw) : def;
        } catch (e) {
            return def;
        }
    }

    function setStored(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            // localStorage no disponible (modo privado, etc.)
        }
    }

    // Quitar clases de fuente previas
    function clearFontClasses() {
        document.documentElement.classList.remove(
            CLASS_FONT_SANS, CLASS_FONT_SERIF, CLASS_FONT_MONO
        );
    }

    // Aplicar contraste alto
    function applyHighContrast(enabled) {
        const root = document.documentElement;
        if (enabled) {
            root.classList.add(CLASS_HIGH_CONTRAST);
        } else {
            root.classList.remove(CLASS_HIGH_CONTRAST);
        }
    }

    // Aplicar texto grande
    function applyLargeText(enabled) {
        const root = document.documentElement;
        if (enabled) {
            root.classList.add(CLASS_LARGE_TEXT);
        } else {
            root.classList.remove(CLASS_LARGE_TEXT);
        }
    }

    // Aplicar tamaño de fuente base
    function applyFontSize(sizeKey) {
        const size = FONT_SIZES[sizeKey] || FONT_SIZES.normal;
        document.documentElement.style.setProperty('--hc-font-size-base', size);
    }

    // Aplicar tipo de letra
    function applyFontFamily(key) {
        clearFontClasses();
        const cls = FONT_FAMILIES[key] || CLASS_FONT_SANS;
        document.documentElement.classList.add(cls);
    }

    // Inicializar accesibilidad desde localStorage
    function initAccessibility() {
        const highContrast = getStored(LS_HIGH_CONTRAST, false);
        const largeText = getStored(LS_LARGE_TEXT, false);
        const fontSize = getStored(LS_FONT_SIZE, 'normal');
        const fontFamily = getStored(LS_FONT_FAMILY, 'sans');

        applyHighContrast(highContrast);
        applyLargeText(largeText);
        applyFontSize(fontSize);
        applyFontFamily(fontFamily);

        // Vincular controles y sincronizar estado de la UI
        bindAccessibilityControls();
        syncUI(highContrast, largeText, fontSize, fontFamily);
    }

    // Sincronizar estado de botones y selects en la UI
    function syncUI(highContrast, largeText, fontSize, fontFamily) {
        const btnHC = document.querySelector('[data-hc-toggle="contrast"]');
        const btnLT = document.querySelector('[data-hc-toggle="text-size"]');
        const selectFS = document.querySelector('[data-hc-select="font-size"]');
        const selectFF = document.querySelector('[data-hc-select="font-family"]');

        if (btnHC) btnHC.classList.toggle('active', highContrast);
        if (btnLT) btnLT.classList.toggle('active', largeText);
        if (selectFS) selectFS.value = fontSize;
        if (selectFF) selectFF.value = fontFamily;
    }

    // Vincular eventos de los controles de accesibilidad
    function bindAccessibilityControls() {
        const btnHC = document.querySelector('[data-hc-toggle="contrast"]');
        const btnLT = document.querySelector('[data-hc-toggle="text-size"]');
        const selectFS = document.querySelector('[data-hc-select="font-size"]');
        const selectFF = document.querySelector('[data-hc-select="font-family"]');

        if (btnHC) {
            btnHC.addEventListener('click', toggleHighContrast);
        }
        if (btnLT) {
            btnLT.addEventListener('click', toggleLargeText);
        }
        if (selectFS) {
            selectFS.addEventListener('change', function (e) {
                setFontSize(e.target.value);
            });
        }
        if (selectFF) {
            selectFF.addEventListener('change', function (e) {
                setFontFamily(e.target.value);
            });
        }
    }

    // Alternar contraste alto
    function toggleHighContrast() {
        const current = getStored(LS_HIGH_CONTRAST, false);
        const next = !current;
        setStored(LS_HIGH_CONTRAST, next);
        applyHighContrast(next);
        syncUI(next, getStored(LS_LARGE_TEXT, false), getStored(LS_FONT_SIZE, 'normal'), getStored(LS_FONT_FAMILY, 'sans'));
        return next;
    }

    // Alternar texto grande
    function toggleLargeText() {
        const current = getStored(LS_LARGE_TEXT, false);
        const next = !current;
        setStored(LS_LARGE_TEXT, next);
        applyLargeText(next);
        syncUI(getStored(LS_HIGH_CONTRAST, false), next, getStored(LS_FONT_SIZE, 'normal'), getStored(LS_FONT_FAMILY, 'sans'));
        return next;
    }

    // Cambiar tamaño de fuente
    function setFontSize(sizeKey) {
        setStored(LS_FONT_SIZE, sizeKey);
        applyFontSize(sizeKey);
        syncUI(getStored(LS_HIGH_CONTRAST, false), getStored(LS_LARGE_TEXT, false), sizeKey, getStored(LS_FONT_FAMILY, 'sans'));
    }

    // Cambiar tipo de letra
    function setFontFamily(key) {
        setStored(LS_FONT_FAMILY, key);
        applyFontFamily(key);
        syncUI(getStored(LS_HIGH_CONTRAST, false), getStored(LS_LARGE_TEXT, false), getStored(LS_FONT_SIZE, 'normal'), key);
    }

    // Exponer API global
    window.HAccessibility = {
        init: initAccessibility,
        toggleHighContrast: toggleHighContrast,
        toggleLargeText: toggleLargeText,
        setFontSize: setFontSize,
        setFontFamily: setFontFamily,
        getStored: getStored
    };

    // Inicializar automáticamente cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccessibility);
    } else {
        initAccessibility();
    }

})();
