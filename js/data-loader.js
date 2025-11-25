// Módulo para carga de datos
class DataLoader {
    constructor() {
        this.filtrosActivos = {};
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

            if (this.filtrosActivos.tipo_reserva) {
                query = query.eq('reservas.tipo_reserva', this.filtrosActivos.tipo_reserva);
            }
            if (this.filtrosActivos.estado) {
                query = query.eq('reservas.estado', this.filtrosActivos.estado);
            }
            if (this.filtrosActivos.anio) {
                query = query.filter('fecha_visita', 'gte', `${this.filtrosActivos.anio}-01-01`)
                            .filter('fecha_visita', 'lte', `${this.filtrosActivos.anio}-12-31`);
            }

            const { data: participantes, error } = await query;

            if (error) {
                console.error('Error en consulta:', error);
                throw new Error(`Error de base de datos: ${error.message}`);
            }

            this.ocultarCarga();

            if (participantes && participantes.length > 0) {
                dataProcessor.procesarDatosCompletos(participantes);
                if (typeof uiManager !== 'undefined') {
                    uiManager.mostrarDatos();
                }
            } else {
                console.log('No se encontraron reservas');
                this.cargarDatosDemo();
            }
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.ocultarCarga();
            
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
                }).then(() => {
                    this.cargarDatosDemo();
                });
            } else {
                this.cargarDatosDemo();
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
        dataProcessor.mostrarDatosDemo();
    }

    setFiltros(filtros) {
        this.filtrosActivos = { ...this.filtrosActivos, ...filtros };
    }

    limpiarFiltros() {
        this.filtrosActivos = {};
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

            const participantesAnteriores = dataProcessor.datosVisitantes.length;

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
                dataProcessor.procesarDatosCompletos(participantesFiltrados);
                
                if (typeof chartManager !== 'undefined') {
                    chartManager.mostrarGraficas(chartManager.tipoActual);
                }

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