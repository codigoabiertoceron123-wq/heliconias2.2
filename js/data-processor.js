// data-processor.js - VERSIÓN ACTUALIZADA
class DataProcessor {
    constructor() {
        this.datosVisitantes = [];
        this.datosSimulados = {};
        this.app = null;
    }

    setApp(app) {
        this.app = app;
    }

    procesarDatosCompletos(participantes) {
        console.log('🔄 Procesando datos completos de participantes...');
        this.datosVisitantes = participantes;

        const totalParticipantes = participantes.length;
        
        const idsReservasUnicas = [...new Set(participantes
            .filter(p => p.id_reserva)
            .map(p => p.id_reserva))];
        
        const reservasUnicas = idsReservasUnicas.length;
        
        const reservasConfirmadas = [...new Set(participantes
            .filter(p => p.reservas && p.reservas.estado === 'confirmada')
            .map(p => p.id_reserva))].length;
            
        const participantesPromedio = reservasUnicas > 0 ? totalParticipantes / reservasUnicas : 0;

        // Actualizar estadísticas
        this.actualizarEstadisticas(totalParticipantes, reservasUnicas, participantesPromedio, reservasConfirmadas);

        // Procesar datos por categorías (NUEVO: con todas las categorías de la versión antigua)
        this.procesarDatosPorCategorias(participantes);

        console.log('✅ Datos procesados COMPLETOS:', this.datosSimulados);

        // Notificar a la App
        if (this.app) {
            console.log('📤 Enviando datos a App principal');
            this.app.setDatosSimulados(this.datosSimulados);
        }
        
        console.log('🏁 Procesamiento de datos terminado');
    }

    actualizarEstadisticas(totalVisitantes, totalReservas, participantesPromedio, reservasConfirmadas) {
        const elementos = {
            'total-visitantes': totalVisitantes.toLocaleString(),
            'total-reservas': totalReservas.toLocaleString(),
            'participantes-promedio': participantesPromedio.toFixed(1),
            'reservas-confirmadas': reservasConfirmadas.toLocaleString()
        };

        Object.keys(elementos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = elementos[id];
            }
        });
    }

    procesarDatosPorCategorias(participantes) {
        console.log('🔄 Procesando datos con estructura REAL...');
        
        // ✅ USANDO LA ESTRUCTURA REAL DE LA BASE DE DATOS
        const tipoReserva = { 'individual': 0, 'grupal': 0 };
        const estado = { 'confirmada': 0, 'pendiente': 0, 'cancelada': 0 };
        const actividad = {};
        const institucion = {};
        const intereses = {};
        const genero = {};
        const temporada = { 'Alta': 0, 'Media': 0, 'Baja': 0 };

        participantes.forEach(participante => {
            const reserva = participante.reservas;
            if (!reserva) return;

            // ✅ TIPO DE RESERVA (desde tabla reservas)
            if (reserva.tipo_reserva && tipoReserva.hasOwnProperty(reserva.tipo_reserva)) {
                tipoReserva[reserva.tipo_reserva]++;
            }

            // ✅ ESTADO DE RESERVA (desde tabla reservas)
            if (reserva.estado && estado.hasOwnProperty(reserva.estado)) {
                estado[reserva.estado]++;
            }

            // ✅ ACTIVIDAD (desde tabla actividades a través de reservas)
            if (participante.actividades && participante.actividades.nombre) {
                const actividadNombre = participante.actividades.nombre;
                if (!actividad[actividadNombre]) actividad[actividadNombre] = 0;
                actividad[actividadNombre]++;
            }

            // ✅ INSTITUCIÓN (desde tabla instituciones)
            if (participante.instituciones && participante.instituciones.nombre_institucion) {
                const institucionNombre = participante.instituciones.nombre_institucion;
                if (!institucion[institucionNombre]) institucion[institucionNombre] = 0;
                institucion[institucionNombre]++;
            } else if (!participante.id_institucion) {
                const individual = 'Individual/Sin institución';
                if (!institucion[individual]) institucion[individual] = 0;
                institucion[individual]++;
            }

            // ✅ INTERESES (desde tabla intereses)
            if (participante.intereses && participante.intereses.nombre) {
                const interesNombre = participante.intereses.nombre;
                if (!intereses[interesNombre]) intereses[interesNombre] = 0;
                intereses[interesNombre]++;
            }

            // ✅ GÉNERO (desde tabla genero)
            if (participante.genero && participante.genero.genero) {
                const generoNombre = participante.genero.genero;
                if (!genero[generoNombre]) genero[generoNombre] = 0;
                genero[generoNombre]++;
            }

            // ✅ TEMPORADA (calculada desde fecha_visita)
            const fechaVisita = participante.fecha_visita; 
            if (fechaVisita) {
                const temp = this.determinarTemporada(fechaVisita);
                temporada[temp]++;
            }
        });

        const datosTiempo = this.procesarDatosPorTiempo(participantes);

        // ✅ ESTRUCTURA FINAL CON DATOS REALES
        this.datosSimulados = {
            tipo_reserva: { 
                labels: Object.keys(tipoReserva), 
                values: Object.values(tipoReserva) 
            },
            estado: { 
                labels: Object.keys(estado), 
                values: Object.values(estado) 
            },
            actividad: { 
                labels: Object.keys(actividad).slice(0, 6), 
                values: Object.values(actividad).slice(0, 6) 
            },
            institucion: { 
                labels: Object.keys(institucion).slice(0, 6), 
                values: Object.values(institucion).slice(0, 6) 
            },
            intereses: { 
                labels: Object.keys(intereses).slice(0, 6), 
                values: Object.values(intereses).slice(0, 6) 
            },
            genero: { 
                labels: Object.keys(genero), 
                values: Object.values(genero) 
            },
            temporada: { 
                labels: Object.keys(temporada), 
                values: Object.values(temporada) 
            },
            fecha: datosTiempo.fecha,
            mes: datosTiempo.mes,
            anio: datosTiempo.anio
        };

        console.log('✅ Datos procesados con estructura REAL:', this.datosSimulados);
    }

    determinarTemporada(fecha) {
        const mes = new Date(fecha).getMonth() + 1;
        if (mes === 12 || mes === 1 || mes === 2) return 'Alta';
        else if (mes === 6 || mes === 7) return 'Media';
        else return 'Baja';
    }

    procesarDatosPorTiempo(participantes) {
        const visitasPorFecha = {};
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const visitasPorMes = {};
        const visitasPorAnio = {};

        // Inicializar meses
        meses.forEach(mes => {
            visitasPorMes[mes] = 0;
        });

        participantes.forEach(participante => {
            const fechaVisita = participante.fecha_visita;
            if (!fechaVisita) return;
            
            const fecha = new Date(fechaVisita);
            
            // Por fecha específica
            const fechaStr = fecha.toISOString().split('T')[0];
            if (!visitasPorFecha[fechaStr]) visitasPorFecha[fechaStr] = 0;
            visitasPorFecha[fechaStr]++;
            
            // Por mes
            const mes = meses[fecha.getMonth()];
            visitasPorMes[mes]++;
            
            // Por año
            const anio = fecha.getFullYear().toString();
            if (!visitasPorAnio[anio]) visitasPorAnio[anio] = 0;
            visitasPorAnio[anio]++;
        });

        const aniosOrdenados = Object.keys(visitasPorAnio).sort((a, b) => parseInt(a) - parseInt(b));

        return {
            fecha: {
                labels: Object.keys(visitasPorFecha).slice(0, 10),
                values: Object.values(visitasPorFecha).slice(0, 10)
            },
            mes: {
                labels: Object.keys(visitasPorMes),
                values: Object.values(visitasPorMes)
            },
            anio: {
                labels: aniosOrdenados,
                values: aniosOrdenados.map(anio => visitasPorAnio[anio] || 0)
            }
        };
    }

    mostrarDatosDemo() {
        console.log('🔄 Mostrando datos de demostración');
        
        // ✅ NUEVO: Datos demo con todas las categorías
        this.datosSimulados = {
            tipo_reserva: { labels: ['Individual', 'Grupal'], values: [65, 35] },
            estado: { labels: ['Confirmada', 'Pendiente', 'Cancelada'], values: [70, 20, 10] },
            actividad: { labels: ['Recorrido Guiado', 'Observación Aves', 'Taller Plantas', 'Investigación', 'Fotografía'], values: [45, 30, 15, 8, 2] },
            institucion: { labels: ['Universidad Nacional', 'Colegio Andino', 'Individual', 'Empresa XYZ', 'Escuela Rural'], values: [25, 18, 35, 12, 10] },
            intereses: { labels: ['Observación Aves', 'Fotografía', 'Botánica', 'Investigación', 'Ecoturismo', 'Educación'], values: [45, 38, 32, 28, 42, 35] },
            genero: { labels: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'], values: [55, 60, 5, 3] },
            temporada: { labels: ['Alta', 'Media', 'Baja'], values: [45, 35, 20] },
            fecha: { labels: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'], values: [12, 18, 15, 22, 19] },
            mes: { labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'], values: [120, 135, 110, 125, 140, 155] },
            anio: {
                labels: ['2021', '2022', '2023', '2024'],
                values: [200, 230, 260, 290]
            }
        };

        this.actualizarEstadisticas(850, 145, 5.9, 102);

        if (this.app) {
            console.log('📤 Enviando datos demo a App principal');
            this.app.setDatosSimulados(this.datosSimulados);
        }
    }

    // PARA GRAFICA DE RESERVAS ESTADO
    procesarDatosConFiltros(participantes, filtros) {
        console.log('🔄 Procesando datos con filtros:', filtros);
        this.datosVisitantes = participantes;

        const totalParticipantes = participantes.length;
        
        const idsReservasUnicas = [...new Set(participantes
            .filter(p => p.id_reserva)
            .map(p => p.id_reserva))];
        
        const reservasUnicas = idsReservasUnicas.length;
        
        const reservasConfirmadas = [...new Set(participantes
            .filter(p => p.reservas && p.reservas.estado === 'confirmada')
            .map(p => p.id_reserva))].length;
            
        const participantesPromedio = reservasUnicas > 0 ? totalParticipantes / reservasUnicas : 0;

        // Actualizar estadísticas
        this.actualizarEstadisticas(totalParticipantes, reservasUnicas, participantesPromedio, reservasConfirmadas);

        // Procesar datos por categorías con información de filtros
        this.procesarDatosPorCategoriasConFiltros(participantes, filtros);

        console.log('✅ Datos procesados CON FILTROS:', this.datosSimulados);

        // Notificar a la App
        if (this.app) {
            console.log('📤 Enviando datos filtrados a App principal');
            this.app.setDatosSimulados(this.datosSimulados);
        }
    }

    procesarDatosPorCategoriasConFiltros(participantes, filtros) {
        // Procesar datos específicos para tipo_reserva con filtros
        if (filtros.tipoReserva || filtros.estado) {
            this.procesarTipoReservaConFiltros(participantes, filtros);
        } else {
            // Si no hay filtros específicos, usar el procesamiento normal
            this.procesarDatosPorCategorias(participantes);
        }
    }

    procesarTipoReservaConFiltros(participantes, filtros) {
    console.log('🎯 Procesando tipo_reserva con filtros:', filtros);
    
    // Estructura para contar por tipo y estado
    const datosPorTipoYEstado = {
        'individual': { 'confirmada': 0, 'pendiente': 0, 'cancelada': 0 },
        'grupal': { 'confirmada': 0, 'pendiente': 0, 'cancelada': 0 }
    };
    
    // Contar reservas por tipo y estado
    participantes.forEach(participante => {
        const reserva = participante.reservas;
        if (!reserva || !reserva.tipo_reserva || !reserva.estado) return;

        const tipo = reserva.tipo_reserva;
        const estado = reserva.estado;
        
        if (datosPorTipoYEstado[tipo] && datosPorTipoYEstado[tipo][estado] !== undefined) {
            datosPorTipoYEstado[tipo][estado]++;
        }
    });

    console.log('📊 Datos por tipo y estado:', datosPorTipoYEstado);

    let labels = [];
    let datasets = [];
    const estados = ['confirmada', 'pendiente', 'cancelada'];
    const coloresEstados = {
        'confirmada': '#27ae60',
        'pendiente': '#f39c12', 
        'cancelada': '#e74c3c'
    };

    // Lógica según los filtros seleccionados
    if (filtros.tipoReserva === 'todas' || !filtros.tipoReserva) {
        // CASO 1: Todas las reservas - Mostrar ambos tipos con sus estados
        if (filtros.estado === 'todas' || !filtros.estado) {
            // Mostrar ambos tipos con todos los estados (gráfica agrupada)
            labels = ['Individual', 'Grupal'];
            datasets = estados.map(estado => ({
                label: this.formatearEstado(estado),
                data: [
                    datosPorTipoYEstado.individual[estado],
                    datosPorTipoYEstado.grupal[estado]
                ],
                backgroundColor: coloresEstados[estado],
                borderRadius: 6
            }));
        } else {
            // Mostrar ambos tipos pero solo un estado específico
            labels = ['Individual', 'Grupal'];
            datasets = [{
                label: this.formatearEstado(filtros.estado),
                data: [
                    datosPorTipoYEstado.individual[filtros.estado],
                    datosPorTipoYEstado.grupal[filtros.estado]
                ],
                backgroundColor: coloresEstados[filtros.estado],
                borderRadius: 6
            }];
        }
    } else if (filtros.tipoReserva === 'individual' || filtros.tipoReserva === 'grupal') {
        // CASO 2: Tipo específico (individual o grupal)
        const tipoSeleccionado = filtros.tipoReserva;
        
        if (filtros.estado === 'todas' || !filtros.estado) {
            // Mostrar todos los estados del tipo seleccionado
            labels = estados.map(estado => this.formatearEstado(estado));
            datasets = [{
                label: tipoSeleccionado === 'individual' ? 'Reservas Individuales' : 'Reservas Grupales',
                data: estados.map(estado => datosPorTipoYEstado[tipoSeleccionado][estado]),
                backgroundColor: estados.map(estado => coloresEstados[estado]),
                borderRadius: 6
            }];
        } else {
            // Mostrar solo un estado específico del tipo seleccionado
            labels = [tipoSeleccionado === 'individual' ? 'Individual' : 'Grupal'];
            datasets = [{
                label: this.formatearEstado(filtros.estado),
                data: [datosPorTipoYEstado[tipoSeleccionado][filtros.estado]],
                backgroundColor: coloresEstados[filtros.estado],
                borderRadius: 6
            }];
        }
    }

    // Actualizar datos simulados con estructura para gráficas agrupadas
    this.datosSimulados.tipo_reserva = { 
        labels: labels,
        datasets: datasets,
        type: 'grouped' // Indicar que es una gráfica agrupada
    };

    console.log('✅ Datos procesados para gráfica:', this.datosSimulados.tipo_reserva);

    // Mantener los otros datos para otras categorías
    this.procesarOtrasCategorias(participantes);
}

    // Método auxiliar para formatear estados
    formatearEstado(estado) {
        const formatos = {
            'confirmada': 'Confirmadas',
            'pendiente': 'Pendientes',
            'cancelada': 'Canceladas'
        };
        return formatos[estado] || estado;
    }

    procesarOtrasCategorias(participantes) {
        // Procesar datos básicos para otras categorías
        const estado = { 'confirmada': 0, 'pendiente': 0, 'cancelada': 0 };
        const actividad = {};
        const institucion = {};
        const intereses = {};
        const genero = {};
        const temporada = { 'Alta': 0, 'Media': 0, 'Baja': 0 };

        participantes.forEach(participante => {
            const reserva = participante.reservas;
            if (!reserva) return;

            // Estado de reserva
            if (reserva.estado && estado.hasOwnProperty(reserva.estado)) {
                estado[reserva.estado]++;
            }

            // Actividad
            if (reserva.actividades && reserva.actividades.nombre_actividad) {
                const actividadNombre = reserva.actividades.nombre_actividad;
                if (!actividad[actividadNombre]) actividad[actividadNombre] = 0;
                actividad[actividadNombre]++;
            }

            // Institución
            if (reserva.instituciones && reserva.instituciones.nombre_institucion) {
                const institucionNombre = reserva.instituciones.nombre_institucion;
                if (!institucion[institucionNombre]) institucion[institucionNombre] = 0;
                institucion[institucionNombre]++;
            } else if (!reserva.id_institucion) {
                const individual = 'Individual/Sin institución';
                if (!institucion[individual]) institucion[individual] = 0;
                institucion[individual]++;
            }

            // Intereses
            if (participante.intereses && participante.intereses.nombre_interes) {
                const interesNombre = participante.intereses.nombre_interes;
                if (!intereses[interesNombre]) intereses[interesNombre] = 0;
                intereses[interesNombre]++;
            }

            // Género
            if (participante.genero && participante.genero.genero) {
                const generoNombre = participante.genero.genero;
                if (!genero[generoNombre]) genero[generoNombre] = 0;
                genero[generoNombre]++;
            }

            // Temporada (calculada desde fecha_visita)
            const fechaVisita = participante.fecha_visita; 
            if (fechaVisita) {
                const temp = this.determinarTemporada(fechaVisita);
                temporada[temp]++;
            }
        });

        const datosTiempo = this.procesarDatosPorTiempo(participantes);

        // Actualizar otras categorías
        this.datosSimulados.estado = { labels: Object.keys(estado), values: Object.values(estado) };
        this.datosSimulados.actividad = { labels: Object.keys(actividad).slice(0, 5), values: Object.values(actividad).slice(0, 5) };
        this.datosSimulados.institucion = { labels: Object.keys(institucion).slice(0, 5), values: Object.values(institucion).slice(0, 5) };
        this.datosSimulados.intereses = { labels: Object.keys(intereses).slice(0, 6), values: Object.values(intereses).slice(0, 6) };
        this.datosSimulados.genero = { labels: Object.keys(genero), values: Object.values(genero) };
        this.datosSimulados.temporada = { labels: Object.keys(temporada), values: Object.values(temporada) };
        this.datosSimulados.fecha = datosTiempo.fecha;
        this.datosSimulados.mes = datosTiempo.mes;
        this.datosSimulados.anio = datosTiempo.anio;
    }
}

const dataProcessor = new DataProcessor();