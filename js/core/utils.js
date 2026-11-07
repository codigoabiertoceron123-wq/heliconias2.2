// js/core/utils.js
// Utilidades genéricas compartidas: fechas, colores, números, DOM.
(function () {
    'use strict';

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    function toDate(value) {
        if (value instanceof Date) return value;
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            // Evita el desfase de zona horaria al interpretar YYYY-MM-DD.
            return new Date(value + 'T00:00:00');
        }
        return new Date(value);
    }

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }

    function formatDate(value, options) {
        const date = toDate(value);
        if (!isValidDate(date)) return String(value ?? '');
        const opts = Object.assign({ day: '2-digit', month: '2-digit', year: 'numeric' }, options || {});
        return date.toLocaleDateString('es-ES', opts);
    }

    function formatDateTime(value) {
        const date = toDate(value);
        if (!isValidDate(date)) return String(value ?? '');
        return date.toLocaleString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    function monthName(index, short) {
        const list = short ? MESES_CORTOS : MESES;
        return list[index] || '';
    }

    function monthNumber(name) {
        const normalized = String(name || '').toLowerCase();
        return MESES.findIndex(m => m.toLowerCase() === normalized);
    }

    function sortMonthNames(names) {
        return [...names].sort((a, b) => monthNumber(a) - monthNumber(b));
    }

    function darkenColor(color, percent) {
        if (!color) return color;
        const amount = Math.max(0, Math.min(100, Number(percent) || 0));
        let hex = String(color).replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (!/^[0-9a-f]{6}$/i.test(hex)) return color;
        const num = parseInt(hex, 16);
        const r = Math.max(0, ((num >> 16) & 255) - Math.round(255 * amount / 100));
        const g = Math.max(0, ((num >> 8) & 255) - Math.round(255 * amount / 100));
        const b = Math.max(0, (num & 255) - Math.round(255 * amount / 100));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function lightenColor(color, percent) {
        if (!color) return color;
        const amount = Math.max(0, Math.min(100, Number(percent) || 0));
        let hex = String(color).replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (!/^[0-9a-f]{6}$/i.test(hex)) return color;
        const num = parseInt(hex, 16);
        const r = Math.min(255, ((num >> 16) & 255) + Math.round(255 * amount / 100));
        const g = Math.min(255, ((num >> 8) & 255) + Math.round(255 * amount / 100));
        const b = Math.min(255, (num & 255) + Math.round(255 * amount / 100));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function randomColor() {
        return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    }

    function debounce(fn, wait) {
        let timer = null;
        return function debounced(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), wait || 250);
        };
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatNumber(value, decimals) {
        const n = Number(value);
        if (!isFinite(n)) return '0';
        return n.toLocaleString('es-ES', {
            minimumFractionDigits: decimals || 0,
            maximumFractionDigits: decimals || 0
        });
    }

    function unique(values) {
        return [...new Set(values)];
    }

    function groupBy(items, keyFn) {
        return items.reduce((acc, item) => {
            const key = keyFn(item);
            (acc[key] = acc[key] || []).push(item);
            return acc;
        }, {});
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function qs(selector, root) { return (root || document).querySelector(selector); }
    function qsa(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }

    window.HUtils = {
        MESES, MESES_CORTOS,
        toDate, isValidDate, formatDate, formatDateTime,
        monthName, monthNumber, sortMonthNames,
        darkenColor, lightenColor, randomColor,
        debounce, escapeHtml, formatNumber, unique, groupBy,
        downloadBlob, qs, qsa
    };
})();
