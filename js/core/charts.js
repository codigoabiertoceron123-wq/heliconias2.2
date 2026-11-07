// js/core/charts.js
// Helpers para crear, destruir y exportar gráficas de Chart.js.
(function () {
    'use strict';

    const PALETTE = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#8e44ad', '#16a085'
    ];

    function destroy(chart) {
        if (chart && typeof chart.destroy === 'function') {
            try { chart.destroy(); } catch (e) { /* instancia ya destruida */ }
        }
        return null;
    }

    function canvasOf(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.getElementById(target);
        if (target.canvas) return target.canvas;
        return target;
    }

    function downloadPNG(target, filename) {
        const canvas = canvasOf(target);
        if (!canvas || typeof canvas.toDataURL !== 'function') return;
        const link = document.createElement('a');
        link.download = filename || 'grafica.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function baseOptions(overrides) {
        return Object.assign({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }, overrides || {});
    }

    function createBar(canvasId, labels, values, options) {
        const canvas = canvasOf(canvasId);
        if (!canvas || !window.Chart) return null;
        return new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels || [],
                datasets: [{
                    label: (options && options.label) || 'Total',
                    data: values || [],
                    backgroundColor: (options && options.colors) || PALETTE,
                    borderColor: (options && options.borderColors) || PALETTE,
                    borderWidth: 1
                }]
            },
            options: baseOptions(options && options.chartOptions)
        });
    }

    function createPie(canvasId, labels, values, options) {
        const canvas = canvasOf(canvasId);
        if (!canvas || !window.Chart) return null;
        return new Chart(canvas, {
            type: (options && options.type) || 'pie',
            data: {
                labels: labels || [],
                datasets: [{
                    data: values || [],
                    backgroundColor: (options && options.colors) || PALETTE
                }]
            },
            options: baseOptions(options && options.chartOptions)
        });
    }

    function createLine(canvasId, labels, datasets, options) {
        const canvas = canvasOf(canvasId);
        if (!canvas || !window.Chart) return null;
        return new Chart(canvas, {
            type: 'line',
            data: { labels: labels || [], datasets: datasets || [] },
            options: baseOptions(options && options.chartOptions)
        });
    }

    window.HCharts = {
        PALETTE, destroy, downloadPNG, canvasOf,
        baseOptions, createBar, createPie, createLine
    };
})();
