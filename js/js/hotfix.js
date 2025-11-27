// HOTFIX para errores críticos - aplicar inmediatamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Aplicando hotfix para errores...');
    
    // Hotfix para el método faltante
    if (typeof ChartManager !== 'undefined' && ChartManager.prototype) {
        if (!ChartManager.prototype.programarCreacionGraficas) {
            ChartManager.prototype.programarCreacionGraficas = function(tipo) {
                console.log('🔄 Hotfix: programarCreacionGraficas -> mostrarGraficas');
                this.mostrarGraficas(tipo);
            };
        }
    }
    
    // Hotfix para UIManager
    if (typeof UIManager !== 'undefined' && UIManager.prototype) {
        const originalConfigurarEventos = UIManager.prototype.configurarEventos;
        
        UIManager.prototype.configurarEventos = function() {
            console.log('🔧 Hotfix: Configurando eventos corregidos');
            
            // Llamar al método original si existe
            if (originalConfigurarEventos) {
                originalConfigurarEventos.call(this);
            }
            
            // Re-configurar botones de forma segura
            setTimeout(() => {
                this.configurarBotonesSeguro();
            }, 100);
        };
        
        UIManager.prototype.configurarBotonesSeguro = function() {
            const chartButtons = document.querySelectorAll('.chart-btn');
            chartButtons.forEach(btn => {
                btn.addEventListener('click', (event) => {
                    event.preventDefault();
                    const tipo = event.currentTarget.getAttribute('data-type');
                    console.log('🔧 Hotfix: Botón clickeado -', tipo);
                    
                    // Usar mostrarGraficas en lugar de programarCreacionGraficas
                    if (this.chartManager && typeof this.chartManager.mostrarGraficas === 'function') {
                        this.chartManager.mostrarGraficas(tipo);
                    }
                });
            });
        };
    }
    
    console.log('✅ Hotfix aplicado correctamente');
});