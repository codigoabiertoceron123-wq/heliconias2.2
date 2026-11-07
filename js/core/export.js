// js/core/export.js
// Exportación a Excel y PNG compartida por todas las páginas.
(function () {
    'use strict';

    function requireXLSX() {
        if (!window.XLSX) {
            if (window.Swal) {
                Swal.fire({ icon: 'error', title: 'Exportación no disponible', text: 'No se pudo cargar la librería de Excel.' });
            }
            return false;
        }
        return true;
    }

    function rowsToExcel(rows, filename, sheetName) {
        if (!requireXLSX()) return;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows || []);
        XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Datos');
        XLSX.writeFile(wb, filename || 'datos.xlsx');
    }

    function objectsToExcel(objects, filename, sheetName) {
        if (!requireXLSX()) return;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(objects || []);
        XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Datos');
        XLSX.writeFile(wb, filename || 'datos.xlsx');
    }

    function tableToExcel(tableId, filename, sheetName) {
        if (!requireXLSX()) return;
        const table = typeof tableId === 'string' ? document.getElementById(tableId) : tableId;
        if (!table) return;
        const wb = XLSX.utils.table_to_book(table, { sheet: sheetName || 'Datos' });
        XLSX.writeFile(wb, filename || 'tabla.xlsx');
    }

    function downloadPNG(target, filename) {
        if (window.HCharts) return window.HCharts.downloadPNG(target, filename);
        const canvas = typeof target === 'string' ? document.getElementById(target) : target;
        if (!canvas || typeof canvas.toDataURL !== 'function') return;
        const link = document.createElement('a');
        link.download = filename || 'grafica.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    window.HExport = { rowsToExcel, objectsToExcel, tableToExcel, downloadPNG };
})();
