// js/core/nav.js
// Comportamiento común del encabezado: reloj, sesión y ayuda.
(function () {
    'use strict';

    function init(options) {
        const opts = Object.assign({
            clockElementId: 'current-date-time',
            logoutButtonId: 'logout-btn',
            logoutRedirect: 'index.html',
            helpButtonId: 'help-btn',
            help: null
        }, options || {});

        if (window.HUI) {
            window.HUI.startClock(opts.clockElementId);
            window.HUI.setupLogout({ buttonId: opts.logoutButtonId, redirect: opts.logoutRedirect });
        }

        const helpBtn = document.getElementById(opts.helpButtonId);
        if (helpBtn && opts.help && window.Swal) {
            helpBtn.addEventListener('click', function (event) {
                event.preventDefault();
                Swal.fire(opts.help);
            });
        }
    }

    window.HNav = { init };
})();
