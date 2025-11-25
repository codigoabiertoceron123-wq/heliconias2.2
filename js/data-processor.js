// Módulo para procesamiento de datos
class DataProcessor {
    constructor() {
        this.datosVisitantes = [];
        this.datosSimulados = {};
    }

    procesarDatosCompletos(participantes) {
        console.log('Procesando datos completos de participantes...');
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
        const satisfaccionPromedio = 4.2;
        const totalReservas = reservasUnicas;

        // Actualizar estadísticas con verificación de elementos
        this.actualizarEstadisticas(totalParticipantes, totalReservas, participantesPromedio, satisfaccionPromedio);

        // Procesar datos por categorías
        this.procesarDatosPorCategorias(participantes);
    }

    actualizarEstadisticas(totalVisitantes, totalReservas, participantesPromedio, satisfaccionPromedio) {
        const elementos = {
            'total-visitantes': totalVisitantes.toLocaleString(),
            'total-reservas': totalReservas.toLocaleString(),
            'participantes-promedio': participantesPromedio.toFixed(1),
            'satisfaccion-promedio': satisfaccionPromedio.toFixed(1) + '/5'
        };

        Object.keys(elementos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = elementos[id];
            } else {
                console.warn(`Elemento con ID '${id}' no encontrado`);
            }
        });
    }

    procesarDatosPorCategorias(participantes) {
        // ... (todo el código de procesamiento de categorías se mantiene igual)
        const tipoReserva = { 'individual': 0, 'grupal': 0 };
        const estado = { 'confirmada': 0, 'pendiente': 0, 'cancelada': 0 };
        const actividad = {};
        const institucion = {};
        const temporada = { 'Alta': 0, 'Media': 0, 'Baja': 0 };
        const satisfaccion = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        const intereses = {};

        participantes.forEach(participante => {
            const reserva = participante.reservas;
            if (!reserva) return;

            if (reserva.tipo_reserva && tipoReserva.hasOwnProperty(reserva.tipo_reserva)) {
                tipoReserva[reserva.tipo_reserva]++;
            }

            if (reserva.estado && estado.hasOwnProperty(reserva.estado)) {
                estado[reserva.estado]++;
            }

            if (reserva.actividades && reserva.actividades.nombre_actividad) {
                const actividadNombre = reserva.actividades.nombre_actividad;
                if (!actividad[actividadNombre]) actividad[actividadNombre] = 0;
                actividad[actividadNombre]++;
            }

            if (reserva.instituciones && reserva.instituciones.nombre_institucion) {
                const institucionNombre = reserva.instituciones.nombre_institucion;
                if (!institucion[institucionNombre]) institucion[institucionNombre] = 0;
                institucion[institucionNombre]++;
            } else if (!reserva.id_institucion) {
                const individual = 'Individual/Sin institución';
                if (!institucion[individual]) institucion[individual] = 0;
                institucion[individual]++;
            }

            const fechaVisita = participante.fecha_visita; 
            if (fechaVisita) {
                const temp = this.determinarTemporada(fechaVisita);
                temporada[temp]++;
            }

            if (participante.intereses && participante.intereses.nombre_interes) {
                const interesNombre = participante.intereses.nombre_interes;
                if (!intereses[interesNombre]) intereses[interesNombre] = 0;
                intereses[interesNombre]++;
            }
        });

        Object.keys(satisfaccion).forEach(nivel => {
            satisfaccion[nivel] = Math.floor(Math.random() * 20) + 5;
        });

        const datosTiempo = this.procesarDatosPorTiempo(participantes);

        this.datosSimulados = {
            tipo_reserva: { labels: Object.keys(tipoReserva), values: Object.values(tipoReserva) },
            estado: { labels: Object.keys(estado), values: Object.values(estado) },
            actividad: { labels: Object.keys(actividad).slice(0, 5), values: Object.values(actividad).slice(0, 5) },
            institucion: { labels: Object.keys(institucion).slice(0, 5), values: Object.values(institucion).slice(0, 5) },
            satisfaccion: { labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'], values: Object.values(satisfaccion) },
            intereses: { labels: Object.keys(intereses).slice(0, 6), values: Object.values(intereses).slice(0, 6) },
            temporada: { labels: Object.keys(temporada), values: Object.values(temporada) },
            fecha: datosTiempo.fecha,
            mes: datosTiempo.mes,
            anio: datosTiempo.anio
        };

        console.log('Datos completos procesados:', this.datosSimulados);
    }

    determinarTemporada(fecha) {
        const mes = new Date(fecha).getMonth() + 1;
        if (mes === 12 || mes === 1 || mes === 2) return 'Alta';
        else if (mes === 6 || mes === 7) return 'Media';
        else return 'Baja';
    }

    procesarDatosPorTiempo(participantes) {
        // ... (todo el código de procesamiento por tiempo se mantiene igual)
        const visitasPorFecha = { 'individual': {}, 'grupal': {}, 'total': {} };
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const visitasPorMes = { 'individual': {}, 'grupal': {}, 'total': {} };
        const visitasPorAnio = { 'individual': {}, 'grupal': {}, 'total': {} };

        meses.forEach(mes => {
            visitasPorMes.individual[mes] = 0;
            visitasPorMes.grupal[mes] = 0;
            visitasPorMes.total[mes] = 0;
        });

        participantes.forEach(participante => {
            const reserva = participante.reservas;
            if (!reserva) return;
            
            const fechaReserva = reserva.fecha_reserva;
            if (!fechaReserva) return;
            
            const fecha = new Date(fechaReserva);
            const tipo = reserva.tipo_reserva || 'individual';
            const fechaStr = fecha.toISOString().split('T')[0];
            
            if (!visitasPorFecha.individual[fechaStr]) visitasPorFecha.individual[fechaStr] = 0;
            if (!visitasPorFecha.grupal[fechaStr]) visitasPorFecha.grupal[fechaStr] = 0;
            if (!visitasPorFecha.total[fechaStr]) visitasPorFecha.total[fechaStr] = 0;
            
            if (tipo === 'individual') visitasPorFecha.individual[fechaStr]++;
            else if (tipo === 'grupal') visitasPorFecha.grupal[fechaStr]++;
            visitasPorFecha.total[fechaStr]++;
            
            const mes = meses[fecha.getMonth()];
            if (tipo === 'individual') visitasPorMes.individual[mes]++;
            else if (tipo === 'grupal') visitasPorMes.grupal[mes]++;
            visitasPorMes.total[mes]++;
            
            const anio = fecha.getFullYear().toString();
            if (!visitasPorAnio.individual[anio]) visitasPorAnio.individual[anio] = 0;
            if (!visitasPorAnio.grupal[anio]) visitasPorAnio.grupal[anio] = 0;
            if (!visitasPorAnio.total[anio]) visitasPorAnio.total[anio] = 0;
            
            if (tipo === 'individual') visitasPorAnio.individual[anio]++;
            else if (tipo === 'grupal') visitasPorAnio.grupal[anio]++;
            visitasPorAnio.total[anio]++;
        });

        const aniosOrdenados = Object.keys(visitasPorAnio.total).sort((a, b) => parseInt(a) - parseInt(b));

        return {
            fecha: {
                labels: Object.keys(visitasPorFecha.total).slice(0, 10),
                individual: Object.values(visitasPorFecha.individual).slice(0, 10),
                grupal: Object.values(visitasPorFecha.grupal).slice(0, 10),
                total: Object.values(visitasPorFecha.total).slice(0, 10)
            },
            mes: {
                labels: Object.keys(visitasPorMes.total),
                individual: Object.values(visitasPorMes.individual),
                grupal: Object.values(visitasPorMes.grupal),
                total: Object.values(visitasPorMes.total)
            },
            anio: {
                labels: aniosOrdenados,
                individual: aniosOrdenados.map(anio => visitasPorAnio.individual[anio] || 0),
                grupal: aniosOrdenados.map(anio => visitasPorAnio.grupal[anio] || 0),
                total: aniosOrdenados.map(anio => visitasPorAnio.total[anio] || 0)
            }
        };
    }

    mostrarDatosDemo() {
        console.log('Mostrando datos de demostración');
        
        this.datosSimulados = {
            tipo_reserva: { labels: ['Individual', 'Grupal'], values: [65, 35] },
            estado: { labels: ['Confirmada', 'Pendiente', 'Cancelada'], values: [70, 20, 10] },
            actividad: { labels: ['Recorrido Guiado', 'Observación Aves', 'Taller Plantas', 'Investigación', 'Fotografía'], values: [45, 30, 15, 8, 2] },
            institucion: { labels: ['Universidad Nacional', 'Colegio Andino', 'Individual', 'Empresa XYZ', 'Escuela Rural'], values: [25, 18, 35, 12, 10] },
            satisfaccion: { labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'], values: [5, 12, 25, 45, 63] },
            intereses: { labels: ['Observación Aves', 'Fotografía', 'Botánica', 'Investigación', 'Ecoturismo', 'Educación'], values: [45, 38, 32, 28, 42, 35] },
            temporada: { labels: ['Alta', 'Media', 'Baja'], values: [45, 35, 20] },
            fecha: { labels: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'], values: [12, 18, 15, 22, 19] },
            mes: { labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'], values: [120, 135, 110, 125, 140, 155] },
            anio: {
                labels: ['2021', '2022', '2023', '2024'],
                individual: [120, 135, 150, 165],
                grupal: [80, 95, 110, 125],
                total: [200, 230, 260, 290]
            }
        };

        this.actualizarEstadisticas(850, 145, 5.9, 4.2);

        if (typeof uiManager !== 'undefined') {
            uiManager.mostrarDatos();
        }
    }
}

const dataProcessor = new DataProcessor();