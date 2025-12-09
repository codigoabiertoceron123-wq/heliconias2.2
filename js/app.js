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
            // 1. DataProcessor (sin dependencias)
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
                console.warn('⚠️ ChartManager no disponible');
            }
            
            // 4. UIManager (depende de todos los anteriores)
            if (typeof UIManager !== 'undefined') {
                this.modules.uiManager = new UIManager();
                console.log('✅ UIManager inicializado');
            } else {
                console.warn('⚠️ UIManager no disponible');
            }

            // 5. ExportManager (depende de ChartManager y DataProcessor)
            if (typeof ExportManager !== 'undefined') {
                this.modules.exportManager = new ExportManager();
                console.log('✅ ExportManager inicializado');
            } else if (typeof exportManager !== 'undefined') {
                this.modules.exportManager = exportManager;
                console.log('✅ ExportManager (global) vinculado');
            } else {
                console.warn('⚠️ ExportManager no disponible');
            }
            
            // 6. ModalManager (depende de ChartManager y DataProcessor)
            if (typeof ModalManager !== 'undefined') {
                this.modules.modalManager = new ModalManager();
                console.log('✅ ModalManager inicializado');
            } else {
                console.warn('⚠️ ModalManager no disponible');
            }
            
            // 7. FilterManager (depende de DataLoader)
            if (typeof FilterManager !== 'undefined') {
                this.modules.filterManager = new FilterManager();
                console.log('✅ FilterManager inicializado');
            } else {
                console.warn('⚠️ FilterManager no disponible');
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
                console.warn('⚠️ Datos no disponibles, reintentando...');
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
            console.warn('⚠️ UIManager no disponible para notificar');
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

    // Función global para aplicar filtros del modal
        aplicarFiltrosModal() {
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio')?.value;
        const fechaFin = document.getElementById('modal-filtro-fecha-fin')?.value;
        const tipoReserva = document.getElementById('modal-filtro-tipo-reserva')?.value;
        
        console.log('🎯 Aplicando filtros del modal:', {
            fechaInicio, fechaFin, tipoReserva
        });
        
        // Validar fechas
        if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error en fechas',
                    text: 'La fecha inicial no puede ser mayor que la fecha final',
                    confirmButtonColor: '#e74c3c'
                });
            }
            return;
        }
        
        // Usar el método aplicarFiltrosCombinados que YA TIENES
        if (this.modules.dataLoader && this.modules.dataLoader.aplicarFiltrosCombinados) {
            this.modules.dataLoader.aplicarFiltrosCombinados(fechaInicio, fechaFin, tipoReserva);
        } else if (window.dataLoader && window.dataLoader.aplicarFiltrosCombinados) {
            dataLoader.aplicarFiltrosCombinados(fechaInicio, fechaFin, tipoReserva);
        } else {
            console.error('dataLoader no disponible');
        }
    }
    

    // Función para limpiar filtros del modal
    limpiarFiltrosModal() {
        document.getElementById('modal-filtro-fecha-inicio').value = '';
        document.getElementById('modal-filtro-fecha-fin').value = '';
        document.getElementById('modal-filtro-tipo-reserva').value = 'todas';
        
        console.log('🧹 Filtros del modal limpiados');
        
        // Recargar datos sin filtros
        if (window.dataLoader && window.dataLoader.cargarDatosVisitantes) {
            dataLoader.cargarDatosVisitantes();
        } else {
            console.error('dataLoader no disponible');
        }
    }

        procesarDatosPorTiempo(participantes, tipo, filtros) {
        console.log(`🔄 Procesando datos por ${tipo}...`);
        
        // Validar que haya participantes
        if (!participantes || participantes.length === 0) {
            console.log('⚠️ No hay participantes para procesar');
            return;
        }
        
        // Objeto para almacenar los resultados
        const resultados = {
            labels: [],
            values: [],
            total: 0,
            tipo: tipo,
            filtros: filtros
        };
        
        // Contadores según el tipo
        const conteo = {};
        
        // Procesar cada participante
        participantes.forEach(participante => {
            const fechaReserva = participante.reservas?.fecha_reserva;
            if (!fechaReserva) return;
            
            const fecha = new Date(fechaReserva);
            let clave = '';
            
            switch(tipo) {
                case 'mes':
                    // Formato: "Enero 2024"
                    const meses = [
                        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                    ];
                    clave = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                    break;
                    
                case 'anio':
                    // Formato: "2024"
                    clave = fecha.getFullYear().toString();
                    break;
                    
                case 'fecha':
                    // Formato: "2024-01-15"
                    clave = fecha.toISOString().split('T')[0];
                    break;
                    
                default:
                    console.warn(`Tipo no reconocido: ${tipo}`);
                    return;
            }
            
            // Incrementar contador
            conteo[clave] = (conteo[clave] || 0) + 1;
        });
        
        // Ordenar las claves según el tipo
        let clavesOrdenadas = Object.keys(conteo);
        
        if (tipo === 'mes') {
            // Ordenar meses cronológicamente
            clavesOrdenadas.sort((a, b) => {
                const [mesA, añoA] = a.split(' ');
                const [mesB, añoB] = b.split(' ');
                const meses = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];
                
                if (añoA !== añoB) return parseInt(añoA) - parseInt(añoB);
                return meses.indexOf(mesA) - meses.indexOf(mesB);
            });
        } else if (tipo === 'anio') {
            // Ordenar años ascendente
            clavesOrdenadas.sort((a, b) => parseInt(a) - parseInt(b));
        } else if (tipo === 'fecha') {
            // Ordenar fechas ascendente
            clavesOrdenadas.sort();
        }
        
        // Preparar arrays para gráficas
        resultados.labels = clavesOrdenadas;
        resultados.values = clavesOrdenadas.map(clave => conteo[clave]);
        resultados.total = resultados.values.reduce((sum, val) => sum + val, 0);
        
        // Agrupar datos por tipo de reserva si está disponible
        if (filtros.tipoReserva === 'todas' || !filtros.tipoReserva) {
            // Contar por tipo de reserva también
            const conteoPorTipo = {};
            participantes.forEach(participante => {
                const tipoReserva = participante.reservas?.tipo_reserva || 'Sin tipo';
                conteoPorTipo[tipoReserva] = (conteoPorTipo[tipoReserva] || 0) + 1;
            });
            
            resultados.conteoPorTipo = conteoPorTipo;
        }
        
        console.log(`✅ Datos procesados por ${tipo}:`, {
            totalParticipantes: resultados.total,
            periodos: resultados.labels.length,
            periodosEjemplo: resultados.labels.slice(0, 3)
        });
        
        // Guardar resultados en el dataProcessor
        if (this.dataProcessor) {
            // Crear estructura para el dataProcessor
            const datosParaProcessor = {
                tipo: tipo,
                labels: resultados.labels,
                values: resultados.values,
                total: resultados.total,
                datosCompletos: resultados,
                filtrosAplicados: filtros
            };
            
            // Verificar si el dataProcessor tiene el método
            if (typeof this.dataProcessor.procesarDatosPorTiempo === 'function') {
                this.dataProcessor.procesarDatosPorTiempo(datosParaProcessor);
            } else if (typeof this.dataProcessor.procesarDatosCompletos === 'function') {
                // Fallback: usar procesarDatosCompletos
                this.dataProcessor.procesarDatosCompletos(participantes);
                
                // También guardar datos específicos por tiempo
                if (!this.dataProcessor.datosSimulados) {
                    this.dataProcessor.datosSimulados = {};
                }
                this.dataProcessor.datosSimulados[tipo] = datosParaProcessor;
                
                console.log(`📊 Datos de ${tipo} guardados en dataProcessor`);
            }
        }
        
        // También notificar a la app si es necesario
        if (this.app && this.app.setDatosSimulados) {
            if (!this.app.datosSimulados) {
                this.app.datosSimulados = {};
            }
            this.app.datosSimulados[tipo] = resultados;
        }
        
        return resultados;
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