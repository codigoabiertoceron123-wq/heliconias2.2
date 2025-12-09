// app.js - Coordinador principal de la aplicación - VERSIÓN OPTIMIZADA
class App {
    constructor() {
        this.modules = {};
        this.isInitialized = false;

        // Variables globales que necesitan compartirse
        this.tipoActual = "tipo_reserva";
        this.datosSimulados = {};
        this.filtrosActivos = {};
        
        // ✅ AGREGAR: Control para evitar notificaciones duplicadas
        this.notificacionEnProceso = false;
    }

    async initialize() {
        try {
            console.log('🚀 Inicializando aplicación...');
            
            // Inicializar módulos en orden correcto
            await this.initializeModules();
            
            // Configurar referencias cruzadas
            this.setupModuleReferences();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            this.isInitialized = true;
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            // Inicialización mínima incluso si hay errores
            this.setupGlobalEvents();
            await this.loadInitialData();
        }
    }
    async initializeModules() {
        try {
            // 0. ✅ AGREGAR: Inicializar TimeProcessor primero
            if (typeof TimeProcessor !== 'undefined') {
                this.modules.timeProcessor = new TimeProcessor();
                window.timeProcessor = this.modules.timeProcessor; // Hacerlo global
                console.log('✅ TimeProcessor inicializado y hecho global');
            } else {
                console.warn('⚠ TimeProcessor no disponible, intentando cargar...');
                // Intentar cargar dinámicamente
                await this.cargarTimeProcessor();
            }
            // 1. DataProcessor (ahora depende de timeProcessor)
            this.modules.dataProcessor = new DataProcessor();
            console.log('✅ DataProcessor inicializado');
            
            // 2. DataLoader (depende de DataProcessor)
            this.modules.dataLoader = new DataLoader();
            console.log('✅ DataLoader inicializado');
            
            // 3. ChartManager (depende de DataProcessor)
            if (typeof ChartManager !== 'undefined') {
                this.modules.chartManager = new ChartManager();
                console.log('✅ ChartManager inicializado');
            } else {
                console.warn('⚠ ChartManager no disponible');
            }
            
            // 4. UIManager (depende de todos los anteriores)
            if (typeof UIManager !== 'undefined') {
                this.modules.uiManager = new UIManager();
                console.log('✅ UIManager inicializado');
            } else {
                console.warn('⚠ UIManager no disponible');
            }

            // 5. ExportManager (depende de ChartManager y DataProcessor)
            if (typeof ExportManager !== 'undefined') {
                this.modules.exportManager = new ExportManager();
                console.log('✅ ExportManager inicializado');
            } else if (typeof exportManager !== 'undefined') {
                this.modules.exportManager = exportManager;
                console.log('✅ ExportManager (global) vinculado');
            } else {
                console.warn('⚠ ExportManager no disponible');
            }
            
            // 6. ModalManager (depende de ChartManager y DataProcessor)
            if (typeof ModalManager !== 'undefined') {
                this.modules.modalManager = new ModalManager();
                console.log('✅ ModalManager inicializado');
            } else {
                console.warn('⚠ ModalManager no disponible');
            }
            
            // 7. FilterManager (depende de DataLoader)
            if (typeof FilterManager !== 'undefined') {
                this.modules.filterManager = new FilterManager();
                console.log('✅ FilterManager inicializado');
            } else {
                console.warn('⚠ FilterManager no disponible');
            }
            
        } catch (error) {
            console.error('Error inicializando módulos:', error);
            throw error;
        }
    }

    setupModuleReferences() {
    // Pasar referencia de la app a todos los módulos disponibles
    Object.values(this.modules).forEach(module => {
        if (module && typeof module.setApp === 'function') {
            module.setApp(this);
        }
    });

    // CONFIGURACIÓN ESPECÍFICA MEJORADA
    if (this.modules.dataLoader && this.modules.dataProcessor) {
        this.modules.dataLoader.dataProcessor = this.modules.dataProcessor;
        console.log('🔗 DataLoader -> DataProcessor conectado');
    }
    
    if (this.modules.chartManager) {
        this.modules.chartManager.dataProcessor = this.modules.dataProcessor;
        this.modules.chartManager.app = this;
        console.log('🔗 ChartManager -> DataProcessor y App conectados');
    }
    
    if (this.modules.uiManager) {
        // ✅ USAR EL MÉTODO DE INICIALIZACIÓN CORRECTO
        this.modules.uiManager.inicializarModulos(
            this.modules.dataLoader, 
            this.modules.chartManager, 
            this.modules.dataProcessor
        );
        this.modules.uiManager.app = this;
        console.log('🔗 UIManager completamente inicializado');
    } // ✅ LLAVE DE CIERRE AGREGADA

    if (this.modules.exportManager) {
        this.modules.exportManager.chartManager = this.modules.chartManager;
        this.modules.exportManager.dataProcessor = this.modules.dataProcessor;
        this.modules.exportManager.app = this;
    }

    if (this.modules.modalManager) {
        this.modules.modalManager.chartManager = this.modules.chartManager;
        this.modules.modalManager.dataProcessor = this.modules.dataProcessor;
        this.modules.modalManager.app = this;
    }

    if (this.modules.filterManager) {
        this.modules.filterManager.dataLoader = this.modules.dataLoader;
        this.modules.filterManager.app = this;
    }

    console.log('✅ Referencias entre módulos configuradas');
}
    
    setupGlobalEvents() {
        // Fecha y hora
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);

        // Eventos de botones globales
        this.setupGlobalButtons();
        
        console.log('✅ Eventos globales configurados');
    }

    updateDateTime() {
        const now = new Date();
        const dateTimeString = now.toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

        const dateTimeElement = document.getElementById("current-date-time");
        if (dateTimeElement) {
            dateTimeElement.textContent = dateTimeString;
        }
    }

    setupGlobalButtons() {
        // Botón de ayuda
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        // Botón de salir
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    // ✅ AGREGAR: Método para cargar TimeProcessor dinámicamente
    async cargarTimeProcessor() {
        return new Promise((resolve, reject) => {
            if (typeof TimeProcessor !== 'undefined') {
                this.modules.timeProcessor = new TimeProcessor();
                window.timeProcessor = this.modules.timeProcessor;
                resolve();
                return;
            }
            
            // Intentar cargar desde el archivo
            const script = document.createElement('script');
            script.src = 'js/time-processor.js';
            script.onload = () => {
                if (typeof TimeProcessor !== 'undefined') {
                    this.modules.timeProcessor = new TimeProcessor();
                    window.timeProcessor = this.modules.timeProcessor;
                    console.log('✅ TimeProcessor cargado dinámicamente');
                    resolve();
                } else {
                    console.error('❌ TimeProcessor no definido después de cargar');
                    reject(new Error('TimeProcessor no disponible'));
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async loadInitialData() {
    try {
        console.log('📥 Cargando datos iniciales...');
        
        // 1. Cargar datos (DataProcessor los procesará y pasará a App)
        await this.modules.dataLoader.cargarDatosVisitantes();
        
        // 2. ✅ ESPERAR a que los datos se procesen antes de mostrar la UI
        console.log('🎯 Esperando procesamiento de datos...');
        setTimeout(() => {
            if (this.modules.uiManager && this.modules.dataProcessor.datosSimulados) {
                console.log('✅ Datos listos, mostrando interfaz...');
                this.modules.uiManager.mostrarDatos();
            } else {
                console.warn('⚠ Datos no disponibles, reintentando...');
                setTimeout(() => {
                    if (this.modules.uiManager) {
                        this.modules.uiManager.mostrarDatos();
                    }
                }, 1000);
            }
        }, 500);
        
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        // Mostrar UI incluso con error
        if (this.modules.uiManager) {
            this.modules.uiManager.mostrarDatos();
        }
    }
  }

    // Getters y setters para datos compartidos
    getTipoActual() {
        return this.tipoActual;
    }

    setTipoActual(tipo) {
        this.tipoActual = tipo;
        // Notificar a otros módulos del cambio si es necesario
        if (this.modules.chartManager) {
            this.modules.chartManager.tipoActual = tipo;
        }
    }

    getDatosSimulados() {
        return this.datosSimulados;
    }

    setDatosSimulados(datos) {
        this.datosSimulados = datos;
    }

    getFiltrosActivos() {
        return this.filtrosActivos;
    }

    setFiltrosActivos(filtros) {
        this.filtrosActivos = { ...this.filtrosActivos, ...filtros };
    }

    // Paletas de colores compartidas
    getColorPalettes() {
        return {
            tipo_reserva: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'],
            estado: ['#27ae60', '#f39c12', '#e74c3c'],
            actividad: ['#3498db', '#e67e22', '#9b59b6', '#2ecc71'],
            institucion: ['#e74c3c', '#3498db', '#f39c12', '#27ae60'],
            intereses: ['#27ae60', '#3498db', '#f39c12', '#9b59b6', '#e74c3c'],
            satisfaccion: ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60'],
            temporada: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
            fecha: ['#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#e74c3c'],
            mes: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'],
            anio: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f'],
            genero: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6']
        };
    }

    showHelp() {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Ayuda - Estadísticas de Visitantes',
                html: `
                    <div style="text-align: left;">
                        <h4>📊 Cómo usar el sistema:</h4>
                        <ul>
                            <li><strong>Selecciona una categoría</strong> para ver diferentes tipos de estadísticas</li>
                            <li><strong>Haz clic en las gráficas</strong> para ver una versión ampliada</li>
                            <li><strong>Usa los filtros</strong> para refinar los datos mostrados</li>
                            <li><strong>Descarga reportes</strong> en PNG o Excel</li>
                        </ul>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Entendido'
            });
        }
    }

    logout() {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que deseas salir del sistema?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2e7d32',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html';
                }
            });
        } else {
            window.location.href = 'login.html';
        }
    }

    // ✅ MEJORADO: Método para notificar a la UI cuando los datos cambian
    notificarCambioDatos() {
        // Evitar notificaciones duplicadas
        if (this.notificacionEnProceso) {
            console.log('⏳ Notificación ya en proceso, omitiendo...');
            return;
        }
        
        this.notificacionEnProceso = true;
        console.log('🔔 Notificando cambio de datos...');
    
        // SOLO UNA llamada controlada
        if (this.modules.uiManager && typeof this.modules.uiManager.mostrarDatos === 'function') {
            console.log('✅ Notificando a UIManager');
            this.modules.uiManager.mostrarDatos();
        } else {
            console.warn('⚠ UIManager no disponible para notificar');
        }
        
        // Liberar el bloqueo después de un tiempo
        setTimeout(() => {
            this.notificacionEnProceso = false;
        }, 500);
    }

    // Métodos globales accesibles desde HTML con fallbacks
    abrirModal(tipoGrafica) {
        if (this.modules.uiManager) {
            this.modules.uiManager.abrirModal(tipoGrafica);
        } else if (this.modules.modalManager) {
            this.modules.modalManager.abrirModal(tipoGrafica);
        } else if (typeof abrirModal !== 'undefined') {
            abrirModal(tipoGrafica);
        }
    }

    cerrarModal() {
        if (this.modules.modalManager) {
            this.modules.modalManager.cerrarModal();
        } else if (this.modules.uiManager) {
            this.modules.uiManager.cerrarModal();
        } else if (typeof cerrarModal !== 'undefined') {
            cerrarModal();
        }
    }

    aplicarFiltrosModal() {
        if (this.modules.uiManager) {
            this.modules.uiManager.aplicarFiltrosModal();
        } else if (this.modules.filterManager) {
            this.modules.filterManager.aplicarFiltrosModal();
        } else if (typeof aplicarFiltrosModal !== 'undefined') {
            aplicarFiltrosModal();
        }
    }

    limpiarFiltrosModal() {
        if (this.modules.uiManager) {
            this.modules.uiManager.limpiarFiltrosModal();
        } else if (this.modules.filterManager) {
            this.modules.filterManager.limpiarFiltrosModal();
        } else if (typeof limpiarFiltrosModal !== 'undefined') {
            limpiarFiltrosModal();
        }
    }

    descargarPNG() {
        if (this.modules.exportManager) {
            this.modules.exportManager.descargarPNG();
        } else if (typeof exportManager !== 'undefined') {
            exportManager.descargarPNG();
        } else if (typeof descargarPNG !== 'undefined') {
            descargarPNG();
        }
    }

    descargarExcel() {
        if (this.modules.exportManager) {
            this.modules.exportManager.descargarExcel();
        } else if (typeof exportManager !== 'undefined') {
            exportManager.descargarExcel();
        } else if (typeof descargarExcel !== 'undefined') {
            descargarExcel();
        }
    }

    

    descargarGraficoPrincipal() {
        if (this.modules.exportManager) {
            this.modules.exportManager.descargarGraficoPrincipal();
        } else if (typeof exportManager !== 'undefined') {
            exportManager.descargarGraficoPrincipal();
        } else if (typeof descargarGraficoPrincipal !== 'undefined') {
            descargarGraficoPrincipal();
        }
    }
}

// Crear instancia global
const app = new App();


// ✅ SOLO UN DOMContentLoaded FUERA de la clase
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, iniciando aplicación...');
    app.initialize().then(() => {
        console.log('🎉 Aplicación completamente inicializada');
    }).catch(error => {
        console.error('💥 Error fatal inicializando aplicación:', error);
    });
});


// Hacer métodos disponibles globalmente para onclick en HTML
window.abrirModal = (tipo) => app.abrirModal(tipo);
window.cerrarModal = () => app.cerrarModal();
window.aplicarFiltrosModal = () => app.aplicarFiltrosModal();
window.limpiarFiltrosModal = () => app.limpiarFiltrosModal();
window.descargarPNG = () => app.descargarPNG();
window.descargarExcel = () => app.descargarExcel();
window.descargarGraficoPrincipal = () => app.descargarGraficoPrincipal();