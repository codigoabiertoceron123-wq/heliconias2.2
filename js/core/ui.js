// js/core/ui.js
// Componentes de interfaz reutilizables: reloj, sesión, estados de carga y alertas.
(function () {
    'use strict';

    function updateDateTime(elementId) {
        const el = document.getElementById(elementId || 'current-date-time');
        if (!el || !window.HUtils) return;
        el.textContent = window.HUtils.formatDateTime(new Date());
    }

    function startClock(elementId, intervalMs) {
        updateDateTime(elementId);
        return setInterval(() => updateDateTime(elementId), intervalMs || 60000);
    }

    function setupLogout(options) {
        const opts = Object.assign({ buttonId: 'logout-btn', redirect: 'index.html' }, options || {});
        const btn = document.getElementById(opts.buttonId);
        if (!btn || btn.dataset.huiLogout === 'true') return;
        btn.dataset.huiLogout = 'true';
        btn.addEventListener('click', function (event) {
            event.preventDefault();
            if (!window.Swal) {
                if (confirm('¿Cerrar sesión?')) window.location.href = opts.redirect;
                return;
            }
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que deseas salir del sistema?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2e7d32',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) window.location.href = opts.redirect;
            });
        });
    }

    function loading(container, message) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;
        el.innerHTML = `
            <div class="no-data" style="text-align:center;padding:40px;">
                <i class="fas fa-spinner fa-spin fa-3x" style="color:#3498db;margin-bottom:20px;"></i>
                <h3>Cargando datos...</h3>
                <p style="color:#7f8c8d;">${window.HUtils ? window.HUtils.escapeHtml(message || '') : (message || '')}</p>
            </div>`;
    }

    function error(container, message, onRetry) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;
        const safeMessage = window.HUtils ? window.HUtils.escapeHtml(message || 'Error al cargar los datos') : (message || '');
        el.innerHTML = `
            <div class="no-data" style="text-align:center;padding:40px;">
                <i class="fas fa-exclamation-triangle fa-3x" style="color:#e74c3c;margin-bottom:20px;"></i>
                <h3 style="color:#c0392b;">No se pudieron cargar los datos</h3>
                <p style="margin:15px 0;color:#7f8c8d;">${safeMessage}</p>
                <button class="btn btn-primary" id="hui-retry">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>`;
        const retry = el.querySelector('#hui-retry');
        if (retry && typeof onRetry === 'function') retry.addEventListener('click', onRetry);
    }

    function empty(container, message) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;
        const safeMessage = window.HUtils ? window.HUtils.escapeHtml(message || 'No hay datos disponibles') : (message || '');
        el.innerHTML = `
            <div class="no-data" style="text-align:center;padding:40px;">
                <i class="fas fa-inbox fa-3x" style="color:#95a5a6;margin-bottom:20px;"></i>
                <h3>Sin datos</h3>
                <p style="color:#7f8c8d;">${safeMessage}</p>
            </div>`;
    }

    function toast(options) {
        if (!window.Swal) return;
        Swal.fire(Object.assign({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 }, options || {}));
    }

    function alert(options) {
        if (!window.Swal) return Promise.resolve();
        return Swal.fire(options || {});
    }

    function confirm(options) {
        if (!window.Swal) return Promise.resolve({ isConfirmed: window.confirm((options && options.text) || '¿Continuar?') });
        return Swal.fire(Object.assign({ showCancelButton: true, confirmButtonText: 'Aceptar', cancelButtonText: 'Cancelar' }, options || {}));
    }

    window.HUI = {
        updateDateTime, startClock, setupLogout,
        loading, error, empty, toast, alert, confirm
    };
})();
