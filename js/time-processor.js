// js/time-processor.js - Procesador de Fecha/Mes/Año
class TimeProcessor {
    constructor() {
        this.datosFecha = {};
        this.datosMes = {};
        this.datosAnio = {};
    }

    procesarPorFecha(participantes) {
        // Lógica similar a nacionalidad pero por fecha
        const conteo = {};
        
        participantes.forEach(p => {
            if (p.reservas?.fecha_reserva) {
                const fecha = new Date(p.reservas.fecha_reserva);
                const fechaStr = fecha.toISOString().split('T')[0];
                conteo[fechaStr] = (conteo[fechaStr] || 0) + 1;
            }
        });
        
        return {
            labels: Object.keys(conteo).sort(),
            values: Object.keys(conteo).sort().map(f => conteo[f]),
            total: Object.values(conteo).reduce((a, b) => a + b, 0)
        };
    }

    procesarPorMes(participantes) {
        // Similar a procesarPorFecha pero agrupa por mes
        const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const conteo = {};
        
        participantes.forEach(p => {
            if (p.reservas?.fecha_reserva) {
                const fecha = new Date(p.reservas.fecha_reserva);
                const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;
                conteo[clave] = (conteo[clave] || 0) + 1;
            }
        });
        
        // Convertir a formato legible
        const labels = Object.keys(conteo)
            .sort()
            .map(clave => {
                const [anio, mes] = clave.split('-');
                return `${meses[parseInt(mes)]} ${anio}`;
            });
        
        return {
            labels: labels,
            values: Object.keys(conteo).sort().map(clave => conteo[clave]),
            total: Object.values(conteo).reduce((a, b) => a + b, 0)
        };
    }

    procesarPorAnio(participantes) {
        // Similar pero por año
        const conteo = {};
        
        participantes.forEach(p => {
            if (p.reservas?.fecha_reserva) {
                const fecha = new Date(p.reservas.fecha_reserva);
                const anio = fecha.getFullYear().toString();
                conteo[anio] = (conteo[anio] || 0) + 1;
            }
        });
        
        return {
            labels: Object.keys(conteo).sort(),
            values: Object.keys(conteo).sort().map(a => conteo[a]),
            total: Object.values(conteo).reduce((a, b) => a + b, 0)
        };
    }
}

// SOLUCIÓN: Crear una sola instancia y asignarla a window
window.timeProcessor = new TimeProcessor();