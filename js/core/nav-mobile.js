// js/core/nav-mobile.js - Menú hamburguesa lateral (desliza derecha → izquierda)
// Script clásico compatible con file:// (sin ES modules)
(function () {
    'use strict';

    function initMobileMenu() {
        const btn = document.querySelector('.hamburger-btn');
        const sidebar = document.querySelector('.mobile-sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        const closeBtn = document.querySelector('.mobile-sidebar-close');
        const navLinks = document.querySelectorAll('.mobile-nav-item');

        if (!btn || !sidebar || !overlay) return;

        function openMenu() {
            btn.classList.add('active');
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.classList.add('menu-open');
        }

        function closeMenu() {
            btn.classList.remove('active');
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.classList.remove('menu-open');
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (sidebar.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        // Cerrar al hacer clic en un enlace del menú
        navLinks.forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeMenu();
            }
        });
    }

    // Ejecutar cuando el DOM esté listo (script clásico al final del body)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }

    window.HMobileMenu = { init: initMobileMenu };
})();
