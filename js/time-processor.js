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

    procesarPorFechaAgrupado(participantes) {
        console.log('🔍 Procesando FECHA agrupado...', participantes?.length);

        const datosPorFecha = {};
        const fechasSet = new Set();
        const tiposSet = new Set(['Confirmada', 'Pendiente', 'Cancelada']);

        participantes.forEach(p => {
            const fecha = p.reservas?.fecha_reserva || p.fecha_visita;
            
            const tipoRaw = p.reservas?.estado || 'pendiente';
            let tipo = tipoRaw.trim().toLowerCase();

            if (tipo === "confirmada") tipo = "Confirmada";
            else if (tipo === "pendiente") tipo = "Pendiente";
            else if (tipo === "cancelada") tipo = "Cancelada";
            else tipo = "Pendiente"; // default

            if (fecha) {
                const fechaStr = new Date(fecha).toISOString().split('T')[0];

                fechasSet.add(fechaStr);
                tiposSet.add(tipo);

                if (!datosPorFecha[fechaStr]) {
                    datosPorFecha[fechaStr] = {
                        'Confirmada': 0,
                        'Pendiente': 0,
                        'Cancelada': 0
                    };
                }

                datosPorFecha[fechaStr][tipo]++;
            }
        });

        const fechasOrdenadas = Array.from(fechasSet).sort();
        const tiposLista = Array.from(tiposSet);

        const datasets = tiposLista.map((tipo, index) => ({
            label: tipo,
            data: fechasOrdenadas.map(fecha => datosPorFecha[fecha]?.[tipo] || 0),
            backgroundColor: this.getColorForTipo(tipo, index),
            borderColor: this.getBorderColorForTipo(tipo, index),
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20
        }));

        const total = datasets.reduce(
            (total, dataset) => total + dataset.data.reduce((sum, val) => sum + val, 0), 0
        );

        return {
            labels: fechasOrdenadas,
            datasets: datasets,
            tipos: tiposLista,
            fechas: fechasOrdenadas,
            total: total,
            type: 'grouped'
        };
    }

    procesarPorMesAgrupado(participantes) {
        console.log('🔍 Procesando MES agrupado...', participantes?.length);

        const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

        const datosPorMes = {};
        const mesesSet = new Set();
        const tiposSet = new Set(['Confirmada', 'Pendiente', 'Cancelada']);

        participantes.forEach(p => {
            const fecha = p.reservas?.fecha_reserva || p.fecha_visita;

            const tipoRaw = p.reservas?.estado_reserva || 'pendiente';
            let tipo = tipoRaw.trim().toLowerCase();

            if (tipo === "confirmada") tipo = "Confirmada";
            else if (tipo === "pendiente") tipo = "Pendiente";
            else if (tipo === "cancelada") tipo = "Cancelada";
            else tipo = "Pendiente";

            if (fecha) {
                const d = new Date(fecha);
                const mesLabel = `${meses[d.getMonth()]} ${d.getFullYear()}`;

                mesesSet.add(mesLabel);
                tiposSet.add(tipo);

                if (!datosPorMes[mesLabel]) {
                    datosPorMes[mesLabel] = {
                        'Confirmada': 0,
                        'Pendiente': 0,
                        'Cancelada': 0
                    };
                }

                datosPorMes[mesLabel][tipo]++;
            }
        });

        const mesesOrdenados = Array.from(mesesSet).sort((a, b) => {
            const [mesA, añoA] = a.split(' ');
            const [mesB, añoB] = b.split(' ');
            if (añoA !== añoB) return parseInt(añoA) - parseInt(añoB);
            return meses.indexOf(mesA) - meses.indexOf(mesB);
        });

        const tiposLista = Array.from(tiposSet);

        const datasets = tiposLista.map((tipo, index) => ({
            label: tipo,
            data: mesesOrdenados.map(mes => datosPorMes[mes]?.[tipo] || 0),
            backgroundColor: this.getColorForTipo(tipo, index),
            borderColor: this.getBorderColorForTipo(tipo, index),
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20
        }));

        const total = datasets.reduce((total, dataset) =>
            total + dataset.data.reduce((sum, val) => sum + val, 0), 0);

        return {
            labels: mesesOrdenados,
            datasets,
            tipos: tiposLista,
            meses: mesesOrdenados,
            total,
            type: 'grouped'
        };
    }

    procesarPorAnioAgrupado(participantes) {
        console.log('🔍 Procesando AÑO agrupado...', participantes?.length);

        const datosPorAnio = {};
        const añosSet = new Set();
        const tiposSet = new Set(['Confirmada', 'Pendiente', 'Cancelada']);

        participantes.forEach(p => {
            const fecha = p.reservas?.fecha_reserva || p.fecha_visita;

            const tipoRaw = p.reservas?.estado_reserva || 'pendiente';
            let tipo = tipoRaw.trim().toLowerCase();

            if (tipo === "confirmada") tipo = "Confirmada";
            else if (tipo === "pendiente") tipo = "Pendiente";
            else if (tipo === "cancelada") tipo = "Cancelada";
            else tipo = "Pendiente";

            if (fecha) {
                const año = new Date(fecha).getFullYear().toString();

                añosSet.add(año);
                tiposSet.add(tipo);

                if (!datosPorAnio[año]) {
                    datosPorAnio[año] = {
                        'Confirmada': 0,
                        'Pendiente': 0,
                        'Cancelada': 0
                    };
                }

                datosPorAnio[año][tipo]++;
            }
        });

        const añosOrdenados = Array.from(añosSet).sort();
        const tiposLista = Array.from(tiposSet);

        const datasets = tiposLista.map((tipo, index) => ({
            label: tipo,
            data: añosOrdenados.map(año => datosPorAnio[año]?.[tipo] || 0),
            backgroundColor: this.getColorForTipo(tipo, index),
            borderColor: this.getBorderColorForTipo(tipo, index),
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20
        }));

        const total = datasets.reduce((total, dataset) =>
            total + dataset.data.reduce((sum, val) => sum + val, 0), 0);

        return {
            labels: añosOrdenados,
            datasets,
            tipos: tiposLista,
            años: añosOrdenados,
            total,
            type: 'grouped'
        };
    }

    getColorForTipo(tipo, index) {
        tipo = tipo.trim().toLowerCase();  

        const colores = {
            'individual': '#3498db',
            'grupal': '#2ecc71',
            'confirmada': '#27ae60',
            'pendiente': '#f39c12',
            'cancelada': '#e74c3c',
            'tour guiado': '#3498db',
            'visita libre': '#e67e22',
            'taller': '#9b59b6'
        };

        return colores[tipo] || this.getRandomColor(index);
    }

    getBorderColorForTipo(tipo, index) {
        const baseColor = this.getColorForTipo(tipo, index);
        return this.darkenColor(baseColor, 0.2);
    }

    getRandomColor(index) {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
            '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
        ];
        return colors[index % colors.length];
    }

    darkenColor(color, factor) {
        if (color.startsWith('#')) {
            let r = parseInt(color.slice(1, 3), 16);
            let g = parseInt(color.slice(3, 5), 16);
            let b = parseInt(color.slice(5, 7), 16);
            
            r = Math.max(0, Math.floor(r * (1 - factor)));
            g = Math.max(0, Math.floor(g * (1 - factor)));
            b = Math.max(0, Math.floor(b * (1 - factor)));
            
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return color;
    }

    // Métodos de utilidad adicionales
    formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    obtenerMesActual() {
        const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const ahora = new Date();
        return meses[ahora.getMonth()];
    }

    obtenerAnioActual() {
        return new Date().getFullYear().toString();
    }

    // Método para obtener todos los datos temporales de una vez
    procesarTodosLosDatosTemporales(participantes) {
        return {
            fecha: this.procesarPorFecha(participantes),
            fechaAgrupado: this.procesarPorFechaAgrupado(participantes),
            mes: this.procesarPorMes(participantes),
            mesAgrupado: this.procesarPorMesAgrupado(participantes),
            anio: this.procesarPorAnio(participantes),
            anioAgrupado: this.procesarPorAnioAgrupado(participantes)
        };
    }

    // Método para obtener datos resumidos
    obtenerResumenTemporal(participantes) {
        const datosFecha = this.procesarPorFecha(participantes);
        const datosMes = this.procesarPorMes(participantes);
        const datosAnio = this.procesarPorAnio(participantes);
        
        return {
            totalParticipantes: participantes.length,
            fechasUnicas: datosFecha.labels.length,
            mesesUnicos: datosMes.labels.length,
            añosUnicos: datosAnio.labels.length,
            fechaMasConcurrida: datosFecha.labels[datosFecha.values.indexOf(Math.max(...datosFecha.values))] || 'N/A',
            mesMasConcurrido: datosMes.labels[datosMes.values.indexOf(Math.max(...datosMes.values))] || 'N/A',
            añoMasConcurrido: datosAnio.labels[datosAnio.values.indexOf(Math.max(...datosAnio.values))] || 'N/A'
        };
    }
}

// Crear instancia global
const timeProcessor = new TimeProcessor();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.TimeProcessor = TimeProcessor; // Clase
    window.timeProcessor = timeProcessor; // Instancia
    console.log('✅ TimeProcessor registrado globalmente');
}

// Verificación automática después de cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ TimeProcessor cargado en DOMContentLoaded');
        verificarTimeProcessor();
    });
} else {
    console.log('✅ TimeProcessor cargado (DOM ya listo)');
    setTimeout(verificarTimeProcessor, 500);
}

// Función de verificación
function verificarTimeProcessor() {
    console.log('🔍 VERIFICACIÓN TIME-PROCESSOR:');
    console.log('- Clase TimeProcessor:', !!window.TimeProcessor);
    console.log('- Instancia timeProcessor:', !!window.timeProcessor);
    
    if (window.timeProcessor) {
        console.log('- Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.timeProcessor)));
        console.log('- Total métodos:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.timeProcessor)).length);
        
        // Mostrar ejemplos de uso
        console.log('📝 Ejemplos de uso:');
        console.log('1. Procesar por fecha simple: timeProcessor.procesarPorFecha(participantes)');
        console.log('2. Procesar por fecha agrupado: timeProcessor.procesarPorFechaAgrupado(participantes)');
        console.log('3. Obtener resumen: timeProcessor.obtenerResumenTemporal(participantes)');
        console.log('4. Procesar todos: timeProcessor.procesarTodosLosDatosTemporales(participantes)');
    }
}

// Exportar para módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TimeProcessor, timeProcessor };
}

// Ejemplo de uso con datos simulados
if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('load', function() {
        console.log('⏰ TimeProcessor listo para procesar datos temporales');
        
        // Ejemplo de datos de prueba
        const datosEjemplo = [
            {
                reservas: {
                    fecha_reserva: '2024-01-15',
                    tipo_reserva: 'Individual'
                }
            },
            {
                reservas: {
                    fecha_reserva: '2024-01-15',
                    tipo_reserva: 'Grupal'
                }
            },
            {
                reservas: {
                    fecha_reserva: '2024-02-10',
                    tipo_reserva: 'Individual'
                }
            }
        ];
        
        // Mostrar ejemplo de procesamiento
        console.log('🧪 Ejemplo de procesamiento:');
        const ejemploFecha = timeProcessor.procesarPorFecha(datosEjemplo);
        console.log('- Datos por fecha:', ejemploFecha);
        
        const ejemploFechaAgrupado = timeProcessor.procesarPorFechaAgrupado(datosEjemplo);
        console.log('- Datos por fecha agrupado:', ejemploFechaAgrupado);
    });
}