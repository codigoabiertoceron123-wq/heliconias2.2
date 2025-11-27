// Módulo para carga de datos - VERSIÓN COMPLETAMENTE CORREGIDA
class DataLoader {
    constructor() {
        this.filtrosActivos = {};
        this.app = null;
        this.dataProcessor = null;
    }

    setApp(app) {
        this.app = app;
        // Obtener referencia al dataProcessor desde la app
        if (app && app.modules.dataProcessor) {
            this.dataProcessor = app.modules.dataProcessor;
        }
    }

    async cargarDatosVisitantes() {
        try {
            if (typeof Swal === 'undefined') {
                console.warn('SweetAlert2 no está disponible');
                this.cargarDatosDemo();
                return;
            }

            this.mostrarCarga('Cargando datos...', 'Obteniendo información de reservas y participantes');

            let query = supabase
                .from('participantes_reserva')
                .select(`
                    *,
                    reservas(
                        *,
                        actividades(*),
                        instituciones(*)
                    ),
                    intereses(*)
                `);

            // Aplicar filtros activos desde la app principal
            if (this.app) {
                const filtros = this.app.getFiltrosActivos();
                if (filtros.tipo_reserva) {
                    query = query.eq('reservas.tipo_reserva', filtros.tipo_reserva);
                }
                if (filtros.estado) {
                    query = query.eq('reservas.estado', filtros.estado);
                }
                if (filtros.anio) {
                    query = query.filter('fecha_visita', 'gte', `${filtros.anio}-01-01`)
                                .filter('fecha_visita', 'lte', `${filtros.anio}-12-31`);
                }
            }

            const { data: participantes, error } = await query;

            if (error) {
                console.error('Error en consulta:', error);
                throw new Error(`Error de base de datos: ${error.message}`);
            }

            this.ocultarCarga();

            if (participantes && participantes.length > 0) {
                // ✅ CORRECTO: Solo procesar datos, NO notificar
                if (this.dataProcessor) {
                    this.dataProcessor.procesarDatosCompletos(participantes);
                    // ❌ NO llamar a notificarCambioDatos() aquí
                } else {
                    // Fallback a la versión global si existe
                    if (typeof dataProcessor !== 'undefined') {
                        dataProcessor.procesarDatosCompletos(participantes);
                        // En versión global, UI se actualiza automáticamente
                    }
                }
            } else {
                console.log('No se encontraron reservas');
                this.cargarDatosDemo();
            }
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.ocultarCarga();
            this.cargarDatosDemo();
            
            let mensajeError = 'No se pudieron cargar los datos';
            if (error.message.includes('JWT')) {
                mensajeError = 'Error de autenticación. Verifica la configuración de Supabase.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                mensajeError = 'Error de conexión. Verifica tu conexión a internet.';
            } else if (error.message.includes('permission')) {
                mensajeError = 'No tienes permisos para acceder a estos datos.';
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: mensajeError,
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    }

    mostrarCarga(titulo, texto) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: titulo,
                text: texto,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            console.log(titulo + ': ' + texto);
        }
    }

    ocultarCarga() {
        if (typeof Swal !== 'undefined') {
            Swal.close();
        }
    }

    cargarDatosDemo() {
        console.log('Cargando datos de demostración...');
        // ✅ CORREGIDO: Solo mostrar datos demo, NO notificar
        if (this.dataProcessor) {
            this.dataProcessor.mostrarDatosDemo();
            // ❌ ELIMINADO: this.app.notificarCambioDatos();
        } else if (typeof dataProcessor !== 'undefined') {
            // Fallback a versión global
            dataProcessor.mostrarDatosDemo();
        }
    }

    setFiltros(filtros) {
        this.filtrosActivos = { ...this.filtrosActivos, ...filtros };
        // También actualizar en la app principal
        if (this.app) {
            this.app.setFiltrosActivos(filtros);
        }
    }

    limpiarFiltros() {
        this.filtrosActivos = {};
        if (this.app) {
            this.app.setFiltrosActivos({});
        }
    }

    async aplicarFiltrosCombinados(fechaInicio, fechaFin, tipoReserva) {
        try {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Aplicando filtros...',
                    text: 'Filtrando datos por criterios seleccionados',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }

            console.log('Aplicando filtros:', { fechaInicio, fechaFin, tipoReserva });

            const participantesAnteriores = this.dataProcessor ? 
                this.dataProcessor.datosVisitantes.length : 0;

            let query = supabase
                .from('participantes_reserva')
                .select(`
                    *,
                    reservas(
                        *,
                        actividades(*),
                        instituciones(*)
                    ),
                    intereses(*)
                `);

            if (fechaInicio && fechaFin) {
                query = query.gte('reservas.fecha_reserva', fechaInicio + 'T00:00:00')
                            .lte('reservas.fecha_reserva', fechaFin + 'T23:59:59');
            }

            if (tipoReserva && tipoReserva !== 'todas') {
                query = query.eq('reservas.tipo_reserva', tipoReserva);
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            this.ocultarCarga();

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                // ✅ CORREGIDO: Solo procesar datos filtrados
                if (this.dataProcessor) {
                    this.dataProcessor.procesarDatosCompletos(participantesFiltrados);
                    
                    // ❌ ELIMINADO: Notificación directa a chartManager
                    // Dejar que App coordine la notificación

                    const huboCambio = participantesFiltrados.length !== participantesAnteriores;
                    const reservasFiltradas = [...new Set(participantesFiltrados.map(p => p.id_reserva))].length;

                    if (typeof Swal !== 'undefined') {
                        let mensaje = '';
                        if (huboCambio) {
                            mensaje = `Filtros aplicados\nResultados: ${reservasFiltradas} reservas y ${participantesFiltrados.length} participantes`;
                        } else {
                            mensaje = `Los filtros no modificaron los resultados\nSe mantienen: ${reservasFiltradas} reservas y ${participantesFiltrados.length} participantes`;
                        }
                        
                        Swal.fire({
                            icon: huboCambio ? 'success' : 'info',
                            title: huboCambio ? 'Filtros aplicados' : 'Sin cambios',
                            text: mensaje,
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                } else {
                    // Fallback a versión global
                    dataProcessor.procesarDatosCompletos(participantesFiltrados);
                    // En versión global, las gráficas se actualizan automáticamente
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Sin resultados',
                        text: 'No se encontraron datos para los filtros aplicados',
                        confirmButtonColor: '#3498db'
                    });
                }
            }

        } catch (error) {
            console.error('Error aplicando filtros:', error);
            this.ocultarCarga();
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron aplicar los filtros: ' + error.message,
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    }
}

const dataLoader = new DataLoader();