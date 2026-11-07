// js/core/modal.js
// Apertura/cierre de modales y comportamiento común (backdrop, Escape).
(function () {
    'use strict';

    function resolve(target) {
        return typeof target === 'string' ? document.getElementById(target) : target;
    }

    function open(target, className) {
        const el = resolve(target);
        if (!el) return null;
        el.classList.add(className || 'show');
        el.style.display = className ? el.style.display : 'flex';
        document.body.classList.add('modal-open');
        return el;
    }

    function close(target, className) {
        const el = resolve(target);
        if (!el) return null;
        el.classList.remove(className || 'show');
        if (!className) el.style.display = 'none';
        document.body.classList.remove('modal-open');
        return el;
    }

    function toggle(target, className) {
        const el = resolve(target);
        if (!el) return null;
        return el.classList.contains(className || 'show') ? close(el, className) : open(el, className);
    }

    function bindGlobalClose(selector) {
        document.addEventListener('click', function (event) {
            const modal = event.target.closest(selector || '.modal');
            if (modal && event.target === modal) {
                close(modal);
            }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') return;
            document.querySelectorAll(selector || '.modal.show, .modal[style*="display: flex"]').forEach(modal => close(modal));
        });
    }

    window.HModal = { open, close, toggle, bindGlobalClose };
})();
