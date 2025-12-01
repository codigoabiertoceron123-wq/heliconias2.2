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
            console.log('🔍 Cargando datos para REPORTE DE RESERVAS...');

            if (!window.supabase) {
                console.error('❌ Cliente Supabase no disponible');
                this.cargarDatosDemo();
                return;
            }

            // ✅ CONSULTA CORREGIDA con la estructura REAL
            let query = supabase
                .from('participantes_reserva')
                .select(`
                    *,
                    reservas!inner(
                        id_reserva,
                        tipo_reserva,
                        estado,
                        fecha_reserva,
                        id_actividad,
                        numero_participantes
                    ),
                    actividades!reservas(id_actividad, nombre),
                    intereses!inner(id_interes, nombre),
                    instituciones!inner(id_institucion, nombre_institucion),
                    genero!inner(id_genero, genero)
                `)
                .order('fecha_visita', { ascending: false })
                .limit(500);

            console.log('📡 Ejecutando consulta con estructura real...');
            const { data: participantes, error } = await query;

            if (error) {
                console.error('❌ Error en consulta:', error);
                console.log('🔍 Detalles:', error.message);
                
                // ✅ INTENTO ALTERNATIVO: Consulta más simple
                return await this.cargarDatosAlternativos();
            }

            console.log(`✅ ${participantes?.length || 0} participantes cargados`);

            if (participantes && participantes.length > 0) {
                console.log('📊 Ejemplo de datos cargados:', participantes[0]);
                
                // ✅ Procesar datos exitosamente
                if (this.dataProcessor) {
                    this.dataProcessor.procesarDatosCompletos(participantes);
                } else if (typeof dataProcessor !== 'undefined') {
                    dataProcessor.procesarDatosCompletos(participantes);
                }
                
                // Mostrar éxito
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Datos cargados',
                        text: `Se cargaron ${participantes.length} participantes`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            } else {
                console.log('⚠️ No se encontraron participantes');
                this.cargarDatosDemo();
            }
            
        } catch (error) {
            console.error('❌ Error crítico:', error);
            this.cargarDatosDemo();
        }
    }

// ✅ NUEVO MÉTODO: Carga alternativa si falla la principal
async cargarDatosAlternativos() {
    try {
        console.log('🔄 Intentando carga alternativa...');
        
        // Consulta más simple pero funcional
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select(`
                *,
                reservas(tipo_reserva, estado, fecha_reserva),
                intereses(nombre),
                instituciones(nombre_institucion),
                genero(genero)
            `)
            .limit(300);

        if (error) throw error;

        if (participantes && participantes.length > 0) {
            console.log(`✅ ${participantes.length} participantes cargados (alternativo)`);
            
            if (this.dataProcessor) {
                this.dataProcessor.procesarDatosCompletos(participantes);
            }
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Error en carga alternativa:', error);
        return false;
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