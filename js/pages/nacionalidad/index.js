// NacionalidadSystem - index
// Refactor modular: lógica original preservada.

// =============================================
    // API PÚBLICA COMPLETA
    // =============================================

    // Inicializar el objeto global
    if (!window.NacionalidadManager) {
        window.NacionalidadManager = {};
    }

// Inicializar la API completa
    inicializarAPICompleta();

console.log('✅ Sistema de Nacionalidad con filtros en modal cargado correctamente');

// Auto-inicializar
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (window.NacionalidadManager && window.NacionalidadManager.inicializar) {
                window.NacionalidadManager.inicializar();
            }
        }, 1000);
    });
