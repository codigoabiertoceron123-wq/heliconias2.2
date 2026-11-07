// js/core/filters.js
// Filtros y rangos reutilizables (fechas, edades, meses, años).
(function () {
    'use strict';

    function readDateInput(id) {
        const el = document.getElementById(id);
        if (!el || !el.value) return null;
        const date = new Date(el.value + 'T00:00:00');
        return isNaN(date.getTime()) ? null : date;
    }

    function dateRange(startId, endId) {
        const start = readDateInput(startId);
        const end = readDateInput(endId);
        if (end) end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    function inDateRange(value, range) {
        const date = window.HUtils ? window.HUtils.toDate(value) : new Date(value);
        if (!range || isNaN(date.getTime())) return true;
        if (range.start && date < range.start) return false;
        if (range.end && date > range.end) return false;
        return true;
    }

    function filterByDateRange(items, dateGetter, range) {
        if (!range || (!range.start && !range.end)) return items.slice();
        return items.filter(item => inDateRange(dateGetter(item), range));
    }

    function parseAgeRange(value) {
        if (!value || value === 'todos') return null;
        const match = String(value).match(/^(\d+)\s*-\s*(\d+)$/);
        if (match) return { min: Number(match[1]), max: Number(match[2]) };
        const plus = String(value).match(/^(\d+)\+$/);
        if (plus) return { min: Number(plus[1]), max: Infinity };
        return null;
    }

    function inAgeRange(age, range) {
        if (!range) return true;
        if (age === null || age === undefined || isNaN(age)) return false;
        return age >= range.min && age <= range.max;
    }

    function filterByAgeRange(items, ageGetter, range) {
        if (!range) return items.slice();
        return items.filter(item => inAgeRange(ageGetter(item), range));
    }

    function defaultMonthOptions(selectedMonth) {
        const names = window.HUtils ? window.HUtils.MESES : [];
        return names.map((name, index) => {
            const selected = index === selectedMonth ? ' selected' : '';
            return `<option value="${index + 1}"${selected}>${name}</option>`;
        }).join('');
    }

    function defaultYearOptions(yearsBack, selectedYear) {
        const current = new Date().getFullYear();
        const total = yearsBack || 10;
        let html = '';
        for (let i = 0; i <= total; i++) {
            const year = current - i;
            const selected = year === selectedYear ? ' selected' : '';
            html += `<option value="${year}"${selected}>${year}</option>`;
        }
        return html;
    }

    window.HFilters = {
        readDateInput, dateRange, inDateRange, filterByDateRange,
        parseAgeRange, inAgeRange, filterByAgeRange,
        defaultMonthOptions, defaultYearOptions
    };
})();
