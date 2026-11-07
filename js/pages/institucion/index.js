// InstitucionSystem - index
// Refactor modular: lógica original preservada.

// =============================================
    // API PÚBLICA COMPLETA
    // =============================================

    // Inicializar el objeto global
    if (!window.InstitucionManager) {
        window.InstitucionManager = {};
    }

// Inicializar la API completa
    inicializarAPICompleta();

console.log('✅ Sistema de Institución con filtros en modal cargado correctamente');

// Auto-inicializar con manejo de errores mejorado
    document.addEventListener('DOMContentLoaded', function() {
        // Primero actualizar la fecha/hora
        updateDateTime();
        setInterval(updateDateTime, 60000);
        
        // Configurar eventos de botones
        document.getElementById('help-btn')?.addEventListener('click', function() {
            // Tu código de ayuda...
        });

        document.getElementById('logout-btn')?.addEventListener('click', function() {
            // Tu código de logout...
        });
        
        // Inicializar sistema con retraso para evitar bloqueos
        setTimeout(() => {
            if (window.InstitucionManager && window.InstitucionManager.inicializar) {
                console.log('🚀 Inicializando sistema de reportes...');
                // Usar un pequeño retraso para evitar conflictos con el bloqueo del navegador
                setTimeout(() => {
                    window.InstitucionManager.inicializar().catch(error => {
                        console.error('Error en inicialización:', error);
                        // Intentar nuevamente después de 2 segundos
                        setTimeout(() => {
                            window.InstitucionManager.inicializar();
                        }, 2000);
                    });
                }, 500);
            }
        }, 1500);
    });
