// Módulo para gestión de gráficos
class ChartManager {
    constructor() {
        this.chartBar = null;
        this.chartPie = null;
        this.chartAmpliado = null;
        this.tipoActual = "tipo_reserva";
        
        this.colorPalettes = {
            tipo_reserva: ['#3498db', '#e74c3c'],
            tipo_reserva_tiempo: ['#3498db', '#e74c3c', '#2ecc71'], 
            estado: ['#27ae60', '#f39c12', '#e74c3c'],
            actividad: ['#3498db', '#e67e22', '#9b59b6', '#2ecc71'],
            institucion: ['#e74c3c', '#3498db', '#f39c12', '#27ae60'],
            satisfaccion: ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60'],
            intereses: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
            temporada: ['#27ae60', '#f39c12', '#e74c3c'],
            fecha: ['#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#e74c3c'],
            mes: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'],
            anio: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f']
        };
    }

    mostrarGraficas(tipo) {
        this.tipoActual = tipo;
        this.crearGraficas(tipo);
    }

    crearGraficas(tipo) {
        const datos = dataProcessor.datosSimulados[tipo];
        if (!datos) {
            console.error('No hay datos para:', tipo);
            return;
        }

        const etiquetaDescriptiva = this.obtenerEtiquetaDescriptiva(tipo);
        const tituloDescriptivo = this.obtenerTituloDescriptivo(tipo);

        this.crearGraficaBarras(tipo, datos, etiquetaDescriptiva, tituloDescriptivo);
        this.crearGraficaCircular(tipo, datos, tituloDescriptivo);
    }

    crearGraficaBarras(tipo, datos, etiquetaDescriptiva, tituloDescriptivo) {
        const ctxBar = document.getElementById("chartBar");
        if (!ctxBar) {
            console.error('Canvas chartBar no encontrado');
            return;
        }
        
        const ctx = ctxBar.getContext("2d");
        if (this.chartBar) this.chartBar.destroy();

        if (tipo === 'fecha' || tipo === 'mes' || tipo === 'anio') {
            this.crearGraficaBarrasTemporal(tipo, datos, etiquetaDescriptiva, tituloDescriptivo, ctx);
        } else {
            this.crearGraficaBarrasNormal(tipo, datos, etiquetaDescriptiva, tituloDescriptivo, ctx);
        }
    }

    crearGraficaBarrasTemporal(tipo, datos, etiquetaDescriptiva, tituloDescriptivo, ctx) {
        const tipoReservaSeleccionado = document.getElementById('modal-filtro-tipo-reserva') ? 
                                    document.getElementById('modal-filtro-tipo-reserva').value : 'todas';
        
        let datasets = [];
        const colors = ['#3498db', '#e74c3c', '#2ecc71'];
        
        if (tipoReservaSeleccionado === 'todas') {
            datasets = [
                { label: "Individual", data: datos.individual, backgroundColor: colors[0], borderRadius: 6, barThickness: 18 },
                { label: "Grupal", data: datos.grupal, backgroundColor: colors[1], borderRadius: 6, barThickness: 18 },
                { label: "Total", data: datos.total, backgroundColor: colors[2], borderRadius: 6, barThickness: 18 }
            ];
        } else if (tipoReservaSeleccionado === 'individual') {
            datasets = [
                { label: "Individual", data: datos.individual, backgroundColor: colors[0], borderRadius: 6, barThickness: 18 }
            ];
        } else if (tipoReservaSeleccionado === 'grupal') {
            datasets = [
                { label: "Grupal", data: datos.grupal, backgroundColor: colors[1], borderRadius: 6, barThickness: 18 }
            ];
        }
        
        this.chartBar = new Chart(ctx, {
            type: "bar",
            data: { labels: datos.labels, datasets: datasets },
            options: this.obtenerOpcionesBarras(etiquetaDescriptiva, tituloDescriptivo, tipoReservaSeleccionado)
        });
    }

    crearGraficaBarrasNormal(tipo, datos, etiquetaDescriptiva, tituloDescriptivo, ctx) {
        const { labels, values } = datos;
        const colors = this.generarColores(tipo, labels);
        
        this.chartBar = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Total de Visitantes",
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 6,
                    barThickness: 18,
                }],
            },
            options: this.obtenerOpcionesBarras(etiquetaDescriptiva, tituloDescriptivo)
        });
    }

    crearGraficaCircular(tipo, datos, tituloDescriptivo) {
        const ctxPie = document.getElementById("chartPie");
        if (!ctxPie) {
            console.error('Canvas chartPie no encontrado');
            return;
        }
        
        const ctx = ctxPie.getContext("2d");
        if (this.chartPie) this.chartPie.destroy();

        if (tipo === 'fecha' || tipo === 'mes' || tipo === 'anio') {
            this.crearGraficaCircularTemporal(tipo, datos, tituloDescriptivo, ctx);
        } else {
            this.crearGraficaCircularNormal(tipo, datos, tituloDescriptivo, ctx);
        }
    }

    crearGraficaCircularTemporal(tipo, datos, tituloDescriptivo, ctx) {
        const tipoReservaSeleccionado = document.getElementById('modal-filtro-tipo-reserva') ? 
                                    document.getElementById('modal-filtro-tipo-reserva').value : 'todas';
        
        let datosCircular = [];
        let labelsCircular = [];
        let colorsCircular = [];
        
        if (tipoReservaSeleccionado === 'individual') {
            labelsCircular = datos.labels || [];
            datosCircular = datos.individual || [];
            colorsCircular = this.generarColores(tipo, labelsCircular);
        } else if (tipoReservaSeleccionado === 'grupal') {
            labelsCircular = datos.labels || [];
            datosCircular = datos.grupal || [];
            colorsCircular = this.generarColores(tipo, labelsCircular);
        } else {
            labelsCircular = ['Individual', 'Grupal'];
            const totalIndividual = datos.individual ? datos.individual.reduce((a, b) => a + b, 0) : 0;
            const totalGrupal = datos.grupal ? datos.grupal.reduce((a, b) => a + b, 0) : 0;
            datosCircular = [totalIndividual, totalGrupal];
            colorsCircular = ['#3498db', '#e74c3c'];
        }
        
        this.chartPie = new Chart(ctx, {
            type: "doughnut",
            data: { labels: labelsCircular, datasets: [{ data: datosCircular, backgroundColor: colorsCircular, borderWidth: 2, borderColor: '#fff' }] },
            options: this.obtenerOpcionesCircular(tituloDescriptivo, tipoReservaSeleccionado)
        });
    }

    crearGraficaCircularNormal(tipo, datos, tituloDescriptivo, ctx) {
        const { labels, values } = datos;
        const colors = this.generarColores(tipo, labels);
        
        this.chartPie = new Chart(ctx, {
            type: "doughnut",
            data: { labels: labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
            options: this.obtenerOpcionesCircular(tituloDescriptivo)
        });
    }

    generarColores(tipo, labels) {
        const palette = this.colorPalettes[tipo] || this.colorPalettes.tipo_reserva;
        return labels.map((_, i) => palette[i % palette.length]);
    }

    obtenerOpcionesBarras(etiquetaDescriptiva, tituloDescriptivo, tipoReservaSeleccionado = 'todas') {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: tipoReservaSeleccionado === 'todas', position: 'top' },
                title: {
                    display: true,
                    text: tituloDescriptivo + (tipoReservaSeleccionado !== 'todas' ? ` - ${tipoReservaSeleccionado}` : ''),
                    font: { size: 16, weight: 'bold' },
                    padding: 20
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 13 },
                    bodyFont: { size: 13 },
                    padding: 10,
                    cornerRadius: 6,
                    callbacks: {
                        title: function(tooltipItems) { return tooltipItems[0].label; },
                        label: function(context) { return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} visitantes`; }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: { display: true, text: 'Cantidad de Visitantes', font: { weight: 'bold' } }
                },
                x: {
                    grid: { display: false },
                    title: { display: true, text: etiquetaDescriptiva, font: { weight: 'bold' } },
                    ticks: { maxRotation: 45, minRotation: 0 }
                }
            }
        };
    }

    obtenerOpcionesCircular(tituloDescriptivo, tipoReservaSeleccionado = 'todas') {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { padding: 8, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { size: 10 } }
                },
                title: {
                    display: true,
                    text: tituloDescriptivo + (tipoReservaSeleccionado !== 'todas' ? ` - ${tipoReservaSeleccionado}` : ' - Distribución'),
                    font: { size: 16, weight: 'bold' },
                    padding: 20
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                    padding: 6,
                    cornerRadius: 4,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%',
            spacing: 2
        };
    }

    obtenerEtiquetaDescriptiva(tipo) {
        const etiquetas = {
            tipo_reserva: 'Tipo de Reserva', estado: 'Estado de Reserva', actividad: 'Actividad',
            institucion: 'Institución', satisfaccion: 'Nivel de Satisfacción', intereses: 'Interés Principal',
            temporada: 'Temporada', fecha: 'Fecha de Visita', mes: 'Mes del Año', anio: 'Año'
        };
        return etiquetas[tipo] || 'Categoría';
    }

    obtenerTituloDescriptivo(tipo) {
        const titulos = {
            tipo_reserva: 'Reservas por Tipo', estado: 'Reservas por Estado', actividad: 'Reservas por Actividad',
            institucion: 'Reservas por Institución', satisfaccion: 'Niveles de Satisfacción', intereses: 'Intereses de los Visitantes',
            temporada: 'Reservas por Temporada', fecha: 'Reservas por Fecha', mes: 'Reservas por Mes', anio: 'Reservas por Año'
        };
        return titulos[tipo] || 'Distribución de Reservas';
    }
}

const chartManager = new ChartManager();