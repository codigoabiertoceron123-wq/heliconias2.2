// Módulo para gestión de gráficos
class ChartManager {
    constructor() {
        this.tipoActual = "tipo_reserva";
        this.app = null;
        this.dataProcessor = null;

        this.chartBar = null;
        this.chartPie = null;
        this.chartAmpliado = null;
        
        // ✅ NUEVO: Paletas de colores actualizadas con todas las categorías
        this.colorPalettes = {
            tipo_reserva: ['#3498db', '#e74c3c'],
            estado: ['#27ae60', '#f39c12', '#e74c3c'],
            actividad: ['#3498db', '#e67e22', '#9b59b6', '#2ecc71'],
            institucion: ['#e74c3c', '#3498db', '#f39c12', '#27ae60'],
            intereses: ['#27ae60', '#3498db', '#f39c12', '#9b59b6', '#e74c3c'],
            genero: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6'],
            temporada: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
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
        console.log('🔍 Buscando datos para:', tipo);
        
        // Obtener datos de múltiples fuentes posibles
        let datos = null;
        
        // Fuente 1: DataProcessor modular
        if (this.dataProcessor && this.dataProcessor.datosSimulados) {
            datos = this.dataProcessor.datosSimulados[tipo];
            console.log('✅ Datos desde DataProcessor:', datos);
        } 
        // Fuente 2: App principal
        else if (this.app && this.app.getDatosSimulados) {
            const datosSimulados = this.app.getDatosSimulados();
            datos = datosSimulados[tipo];
            console.log('✅ Datos desde App:', datos);
        }
        // Fuente 3: Variable global (fallback)
        else if (window.dataProcessor && window.dataProcessor.datosSimulados) {
            datos = window.dataProcessor.datosSimulados[tipo];
            console.log('✅ Datos desde global dataProcessor:', datos);
        }
        // Fuente 4: Variable global directa (último fallback)
        else if (window.datosSimulados) {
            datos = window.datosSimulados[tipo];
            console.log('✅ Datos desde global datosSimulados:', datos);
        }

        if (!datos) {
            console.error('❌ No hay datos para:', tipo);
            console.log('🔍 Fuentes disponibles:');
            if (this.dataProcessor) console.log('   - DataProcessor:', this.dataProcessor.datosSimulados);
            if (this.app) console.log('   - App:', this.app.getDatosSimulados());
            if (window.dataProcessor) console.log('   - Global dataProcessor:', window.dataProcessor.datosSimulados);
            if (window.datosSimulados) console.log('   - Global datosSimulados:', window.datosSimulados);
            return;
        }

        console.log('🎯 Datos encontrados para', tipo, ':', datos);

        const etiquetaDescriptiva = this.obtenerEtiquetaDescriptiva(tipo);
        const tituloDescriptivo = this.obtenerTituloDescriptivo(tipo);

        // ✅ AGREGAR ESTA LÍNEA: Destruir gráficas anteriores antes de crear nuevas
        this.destruirGraficasAnteriores();

        this.crearGraficaBarras(tipo, datos, etiquetaDescriptiva, tituloDescriptivo);
        this.crearGraficaCircular(tipo, datos, tituloDescriptivo);
    }

    // AGREGAR: Método para destruir gráficas anteriores
    destruirGraficasAnteriores() {
        console.log('🗑️ Destruyendo gráficas anteriores...');
        
        if (this.chartBar) {
            this.chartBar.destroy();
            this.chartBar = null;
            console.log('✅ Gráfica de barras destruida');
        }
        
        if (this.chartPie) {
            this.chartPie.destroy();
            this.chartPie = null;
            console.log('✅ Gráfica circular destruida');
        }

        // Opcional: también destruir gráfica ampliada si existe
        if (this.chartAmpliado) {
            this.chartAmpliado.destroy();
            this.chartAmpliado = null;
            console.log('✅ Gráfica ampliada destruida');
        }
    }  

    crearGraficaBarras(tipo, datos, etiquetaDescriptiva, tituloDescriptivo) {
        const ctxBar = document.getElementById("chartBar");
        if (!ctxBar) {
            console.error('❌ No se encontró el canvas chartBar');
            return;
        }

        // DESTRUIR gráfica anterior si existe (redundante pero segura)
        if (this.chartBar) {
            this.chartBar.destroy();
            this.chartBar = null;
        }

        const colors = this.generarColores(tipo, datos.labels);
        
        this.chartBar = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: datos.labels,
                datasets: [{
                    label: "Total de Visitantes",
                    data: datos.values,
                    backgroundColor: colors,
                    borderRadius: 6,
                    barThickness: 18,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: tituloDescriptivo,
                        font: { size: 16, weight: 'bold' },
                        padding: 20
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        title: {
                            display: true,
                            text: 'Cantidad de Visitantes',
                            font: { weight: 'bold' }
                        }
                    },
                    x: {
                        grid: { display: false },
                        title: {
                            display: true,
                            text: etiquetaDescriptiva,
                            font: { weight: 'bold' }
                        }
                    }
                },
            },
        });
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
            console.error('❌ No se encontró el canvas chartPie');
            return;
        }

        // DESTRUIR gráfica anterior si existe
        if (this.chartPie) {
            this.chartPie.destroy();
        }

        const colors = this.generarColores(tipo, datos.labels);

         // ✅ NUEVO: Formatear labels para género
        const labelsParaGrafica = tipo === 'genero' ? datos.labels.map(label => this.formatearGenero(label)) : datos.labels;
        
        this.chartPie = new Chart(ctxPie, {
            type: "doughnut",
            data: {
                labels: datos.labels,
                datasets: [{
                    data: datos.values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 8,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 8,
                            font: { size: 10 }
                        }
                    },
                    title: {
                        display: true,
                        text: tituloDescriptivo,
                        font: { size: 16, weight: 'bold' },
                        padding: 20
                    }
                },
                cutout: '70%',
                spacing: 2
            },
        });
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
            tipo_reserva: 'Tipo de Reserva',
            estado: 'Estado de Reserva', 
            actividad: 'Actividad',
            institucion: 'Institución',
            intereses: 'Interés Principal',
            genero: 'Género',
            temporada: 'Temporada',
            fecha: 'Fecha de Visita',
            mes: 'Mes del Año',
            anio: 'Año'
        };
        return etiquetas[tipo] || 'Categoría';
    }

    obtenerTituloDescriptivo(tipo) {
        const titulos = {
            tipo_reserva: 'Reservas por Tipo',
            estado: 'Reservas por Estado',
            actividad: 'Reservas por Actividad',
            institucion: 'Reservas por Institución',
            intereses: 'Intereses de los Visitantes',
            genero: 'Visitantes por Género',
            temporada: 'Reservas por Temporada',
            fecha: 'Reservas por Fecha',
            mes: 'Reservas por Mes',
            anio: 'Reservas por Año'
        };
        return titulos[tipo] || 'Distribución de Reservas';
    }
     // ✅ NUEVO: Método para formatear género (de la versión antigua)
    formatearGenero(genero) {
        const formatos = {
            'masculino': 'Masculino',
            'femenino': 'Femenino', 
            'otro': 'Otro',
            'prefiero-no-decir': 'Prefiero no decir'
        };
        return formatos[genero] || genero;
    }

    // ✅ ACTUALIZAR: Método crearGraficas para incluir formateo de género
    crearGraficaBarras(tipo, datos, etiquetaDescriptiva, tituloDescriptivo) {
        const ctxBar = document.getElementById("chartBar");
        if (!ctxBar) {
            console.error('❌ No se encontró el canvas chartBar');
            return;
        }

        if (this.chartBar) {
            this.chartBar.destroy();
            this.chartBar = null;
        }

        const colors = this.generarColores(tipo, datos.labels);
        
        // ✅ NUEVO: Formatear labels para género
        const labelsParaGrafica = tipo === 'genero' ? datos.labels.map(label => this.formatearGenero(label)) : datos.labels;
        
        this.chartBar = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: labelsParaGrafica,
                datasets: [{
                    label: "Total de Visitantes",
                    data: datos.values,
                    backgroundColor: colors,
                    borderRadius: 6,
                    barThickness: 18,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: tituloDescriptivo,
                        font: { size: 16, weight: 'bold' },
                        padding: 20
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        title: {
                            display: true,
                            text: 'Cantidad de Visitantes',
                            font: { weight: 'bold' }
                        }
                    },
                    x: {
                        grid: { display: false },
                        title: {
                            display: true,
                            text: etiquetaDescriptiva,
                            font: { weight: 'bold' }
                        }
                    }
                },
            },
        });
    }
}

const chartManager = new ChartManager();