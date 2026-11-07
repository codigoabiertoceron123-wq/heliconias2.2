// InstitucionSystem - charts
// Refactor modular: lógica original preservada.

//finnn
    // Función para obtener el color de una institución específica - VERSIÓN MEJORADA
    function obtenerColorInstitucion(nombreInstitucion) {
        if (!nombreInstitucion) return '#3498db'; // Color por defecto
        
        // 1. Buscar en datosInstituciones actuales
        if (datosInstituciones.colors && datosInstituciones.labels) {
            const index = datosInstituciones.labels.indexOf(nombreInstitucion);
            if (index !== -1 && datosInstituciones.colors[index]) {
                return datosInstituciones.colors[index];
            }
        }
        
        // 2. Buscar en datosOriginales
        if (datosOriginales.colors && datosOriginales.labels) {
            const index = datosOriginales.labels.indexOf(nombreInstitucion);
            if (index !== -1 && datosOriginales.colors[index]) {
                return datosOriginales.colors[index];
            }
        }
        
        // 3. Si no se encuentra, generar color consistente basado en el nombre
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', 
                        '#1abc9c', '#d35400', '#34495e', '#16a085', '#27ae60'];
        
        // Generar índice estable basado en el nombre (hash)
        let hash = 0;
        for (let i = 0; i < nombreInstitucion.length; i++) {
            hash = nombreInstitucion.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

function ordenarMeses(mesA, mesB) {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const [nombreA, añoA] = mesA.split(' ');
        const [nombreB, añoB] = mesB.split(' ');
        
        if (añoA !== añoB) return parseInt(añoA) - parseInt(añoB);
        return meses.indexOf(nombreA) - meses.indexOf(nombreB);
    }

function generarColoresInstitucion(cantidad) {
        const colors = [];
        for(let i = 0; i < cantidad; i++) {
            colors.push(coloresInstituciones[i % coloresInstituciones.length]);
        }
        return colors;
    }

function generarColoresTiempo(tipo, cantidad) {
        const palette = coloresPorTiempo[tipo] || coloresPorTiempo.fecha;
        const colors = [];
        for(let i = 0; i < cantidad; i++) {
            colors.push(palette[i % palette.length]);
        }
        return colors;
    }

// Función auxiliar para oscurecer colores
    function darkenColor(color, factor) {
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

// =============================================
    // FUNCIONES DE GRÁFICAS
    // =============================================

    // Mostrar gráficas de instituciones - VERSIÓN QUE GUARDA COLORES
    function mostrarGraficasInstitucion() {
        const { labels, values } = datosInstituciones;
        const colors = generarColoresInstitucion(labels.length);
        
        // Guardar los colores en datosInstituciones para referencia futura
        datosInstituciones.colors = colors;
        
        // Gráfica de barras
        const ctxBar = document.getElementById("chartBarInstitucion");
        if (chartBarInstitucion) chartBarInstitucion.destroy();
        
        chartBarInstitucion = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Cantidad de Visitantes",
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 8,
                    barThickness: 30,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Distribución por Institución',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed.y;
                                const total = values.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} visitantes (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad de Visitantes' }
                    },
                    x: {
                        title: { display: true, text: 'Institución' }
                    }
                }
            },
        });

        // Gráfica circular
        const ctxPie = document.getElementById("chartPieInstitucion");
        if (chartPieInstitucion) chartPieInstitucion.destroy();
        
        chartPieInstitucion = new Chart(ctxPie, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
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
                            usePointStyle: true, 
                            padding: 15,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = values.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} visitantes (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '50%'
            },
        });
    }

// Mostrar gráficas para tiempo
    // Mostrar gráficas para tiempo - VERSIÓN CORREGIDA CON TOOLTIPS
    function mostrarGraficasTiempo(tipo) {
        const datos = getDatosTiempo(tipo);
        
        // Gráfica de barras AGRUPADAS
        const ctxBar = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Bar`);
        if (chartFechaBar) chartFechaBar.destroy();
        if (chartMesBar) chartMesBar.destroy();
        if (chartAnioBar) chartAnioBar.destroy();
        
        // Asegurar que los datos estén en el formato correcto
        const datasetsCorregidos = (datos.datasets || []).map((dataset, index) => ({
            ...dataset,
            data: dataset.data.map(val => val || 0), // Convertir undefined/NaN a 0
            backgroundColor: dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length],
            borderColor: dataset.borderColor || darkenColor(dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length], 0.2),
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 25
        }));
        
        const chartBar = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: datos.labels || [],
                datasets: datasetsCorregidos
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    title: {
                        display: true,
                        text: getTituloTiempo(tipo) + ' (Barras Agrupadas)',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(tooltipItems) {
                                // Mostrar la fecha como título
                                const index = tooltipItems[0].dataIndex;
                                return datos.labels ? datos.labels[index] : 'Fecha no disponible';
                            },
                            label: function(context) {
                                const datasetLabel = context.dataset.label || '';
                                const value = context.parsed.y;
                                
                                if (value === 0) {
                                    return `${datasetLabel}: 0 visitantes`;
                                }
                                
                                // Calcular porcentaje del total para esta fecha
                                const fechaIndex = context.dataIndex;
                                let totalFecha = 0;
                                if (datos.datasets) {
                                    totalFecha = datos.datasets.reduce((sum, ds) => 
                                        sum + (ds.data[fechaIndex] || 0), 0);
                                }
                                
                                const porcentaje = totalFecha > 0 ? Math.round((value / totalFecha) * 100) : 0;
                                return `${datasetLabel}: ${value} visitantes (${porcentaje}% del total de la fecha)`;
                            },
                            filter: function(tooltipItem) {
                                return true; // Mostrar todos los tooltips
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { 
                            display: true, 
                            text: 'Cantidad de Visitantes',
                            font: { weight: 'bold' }
                        },
                        stacked: false
                    },
                    x: {
                        title: { 
                            display: true, 
                            text: getTituloTiempo(tipo).split(' ')[1],
                            font: { weight: 'bold' }
                        },
                        stacked: false
                    }
                },
                elements: {
                    bar: {
                        backgroundColor: function(context) {
                            const value = context.raw;
                            if (value === 0 || value === null) {
                                return context.dataset.backgroundColor + '40';
                            }
                            return context.dataset.backgroundColor;
                        }
                    }
                }
            }
        });

        // Gráfica circular
        const ctxPie = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Pie`);
        if (chartFechaPie) chartFechaPie.destroy();
        if (chartMesPie) chartMesPie.destroy();
        if (chartAnioPie) chartAnioPie.destroy();
        
        // Para el gráfico circular, mostrar distribución por institución general
        const totalPorInstitucion = {};
        datasetsCorregidos.forEach(dataset => {
            const total = dataset.data.reduce((a, b) => a + b, 0);
            totalPorInstitucion[dataset.label] = total;
        });
        
        const chartPie = new Chart(ctxPie, {
            type: "doughnut",
            data: {
                labels: Object.keys(totalPorInstitucion),
                datasets: [{
                    data: Object.values(totalPorInstitucion),
                    backgroundColor: datasetsCorregidos.map(d => d.backgroundColor),
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
                        labels: { usePointStyle: true, padding: 15 }
                    },
                    title: {
                        display: true,
                        text: 'Distribución por Institución',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                cutout: '60%'
            },
        });

        // Guardar referencias
        switch(tipo) {
            case 'fecha': 
                chartFechaBar = chartBar; 
                chartFechaPie = chartPie;
                break;
            case 'mes': 
                chartMesBar = chartBar; 
                chartMesPie = chartPie;
                break;
            case 'anio': 
                chartAnioBar = chartBar; 
                chartAnioPie = chartPie;
                break;
        }
    }

// Función para limpiar y normalizar datos antes de crear gráficos
    function normalizarDatosParaGrafico(datos) {
        if (!datos || !datos.datasets) return datos;
        
        return {
            ...datos,
            datasets: datos.datasets.map((dataset, index) => ({
                ...dataset,
                label: dataset.label || `Institución ${index + 1}`,
                data: (dataset.data || []).map(val => {
                    // Convertir cualquier valor no numérico a 0
                    const num = Number(val);
                    return isNaN(num) ? 0 : num;
                }),
                backgroundColor: dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length],
                borderColor: dataset.borderColor || darkenColor(dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length], 0.2)
            }))
        };
    }

// Función para crear gráfica con datos filtrados de institución - VERSIÓN CON COLORES CONSISTENTES
    function crearGraficaAmpliadaInstitucionConDatos(datosFiltrados, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoInstitucion");
        if (!ctx) return;

        if (chartAmpliadoInstitucion) {
            chartAmpliadoInstitucion.destroy();
        }

        // Verificar si realmente NO hay datos
        const esCasoSinDatos = datosFiltrados.mensaje && 
                            (datosFiltrados.mensaje.includes('No se encontraron') || 
                            datosFiltrados.mensaje.includes('no encontrada'));
        
        if (esCasoSinDatos || datosFiltrados.total === 0) {
            const mensaje = datosFiltrados?.mensaje || 'No hay datos disponibles';
            
            chartAmpliadoInstitucion = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Sin datos'],
                    datasets: [{
                        data: [100],
                        backgroundColor: ['#95a5a6']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: mensaje,
                            font: { size: 16, weight: 'bold' }
                        },
                        subtitle: {
                            display: true,
                            text: 'Intenta con otra institución o criterios de búsqueda',
                            font: { size: 12, style: 'italic' },
                            color: '#7f8c8d'
                        }
                    }
                }
            });
            return;
        }

        // Determinar si es una institución individual
        const esInstitucionIndividual = datosFiltrados.labels.length === 1 && 
                                    datosFiltrados.labels[0] !== 'Todas las instituciones';
        
        // Preparar colores
        let colors;
        if (esInstitucionIndividual) {
            // Para una sola institución, usar el color que ya tenía
            colors = [obtenerColorInstitucion(datosFiltrados.labels[0])];
        } else {
            // Para múltiples instituciones, generar colores normales
            colors = generarColoresInstitucion(datosFiltrados.labels.length);
        }

        // GRÁFICOS CIRCULARES
        if (tipoGrafica === 'doughnut' || tipoGrafica === 'pie') {
            chartAmpliadoInstitucion = new Chart(ctx, {
                type: tipoGrafica,
                data: {
                    labels: datosFiltrados.labels,
                    datasets: [{
                        data: datosFiltrados.values,
                        backgroundColor: colors,
                        borderColor: '#fff',
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: esInstitucionIndividual 
                                ? `${datosFiltrados.labels[0]} - ${datosFiltrados.total} visitantes`
                                : 'Distribución por Institución' + 
                                (tipoGrafica === 'doughnut' ? ' (Dona)' : ' (Pastel)'),
                            font: { size: 18, weight: 'bold' },
                            padding: 20
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = datosFiltrados.total;
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: tipoGrafica === 'doughnut' ? '50%' : '0%'
                }
            });
        } 
        // GRÁFICO DE BARRAS
        else if (tipoGrafica === 'bar') {
            chartAmpliadoInstitucion = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: datosFiltrados.labels,
                    datasets: [{
                        label: "Cantidad de Visitantes",
                        data: datosFiltrados.values,
                        backgroundColor: colors,
                        borderColor: colors.map(color => darkenColor(color, 0.2)),
                        borderWidth: 1,
                        borderRadius: 8,
                        barThickness: esInstitucionIndividual ? 50 : 35,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: !esInstitucionIndividual
                        },
                        title: {
                            display: true,
                            text: esInstitucionIndividual 
                                ? `${datosFiltrados.labels[0]} - ${datosFiltrados.total} visitantes`
                                : 'Distribución por Institución - Barras',
                            font: { size: 18, weight: 'bold' },
                            padding: 20
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed.y;
                                    const percentage = datosFiltrados.total > 0 ? 
                                        Math.round((value / datosFiltrados.total) * 100) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            title: {
                                display: true,
                                text: 'Cantidad de Visitantes',
                                font: { weight: 'bold', size: 14 }
                            }
                        },
                        x: {
                            grid: { display: false },
                            title: {
                                display: true,
                                text: 'Institución',
                                font: { weight: 'bold', size: 14 }
                            },
                            ticks: {
                                maxRotation: esInstitucionIndividual ? 0 : 45,
                                minRotation: 0
                            }
                        }
                    }
                }
            });
        }
    }

// Función para crear gráfica con datos filtrados de tiempo - VERSIÓN COMPLETA CON GRÁFICOS CIRCULARES
    function crearGraficaAmpliadaTiempoConDatos(tipo, datosFiltrados, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoInstitucion");
        if (!ctx) return;

        if (chartAmpliadoInstitucion) {
            chartAmpliadoInstitucion.destroy();
        }

        // Verificar que tenemos datos
        if (!datosFiltrados || (!datosFiltrados.datasets && !datosFiltrados.values)) {
            // Mostrar gráfica vacía con mensaje
            chartAmpliadoInstitucion = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Sin datos'],
                    datasets: [{
                        label: 'Sin datos',
                        data: [100],
                        backgroundColor: ['#95a5a6']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true },
                        title: {
                            display: true,
                            text: 'No hay datos disponibles con los filtros aplicados',
                            font: { size: 16, weight: 'bold' }
                        }
                    }
                }
            });
            return;
        }

        // ============================================
        // GRÁFICOS CIRCULARES (doughnut o pie)
        // ============================================
        if (tipoGrafica === 'doughnut' || tipoGrafica === 'pie') {
            // Para gráficos circulares, necesitamos mostrar distribución por institución
            let labels = [];
            let data = [];
            let backgroundColor = [];
            let borderColor = [];
            
            if (datosFiltrados.datasets && datosFiltrados.datasets.length > 0) {
                // Calcular total por institución para el gráfico circular
                datosFiltrados.datasets.forEach((dataset, index) => {
                    const totalInstitucion = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                    if (totalInstitucion > 0) {
                        labels.push(dataset.label || `Institución ${index + 1}`);
                        data.push(totalInstitucion);
                        backgroundColor.push(dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length]);
                        borderColor.push(dataset.borderColor || darkenColor(dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length], 0.2));
                    }
                });
                
                // Si no hay datos después del filtrado, mostrar mensaje
                if (data.length === 0) {
                    labels = ['Sin datos con los filtros aplicados'];
                    data = [100];
                    backgroundColor = ['#95a5a6'];
                    borderColor = ['#7f8c8d'];
                }
            } else if (datosFiltrados.values && datosFiltrados.values.length > 0) {
                // Formato antiguo - mostrar distribución por fecha
                labels = datosFiltrados.labels || [];
                data = datosFiltrados.values.map(val => val || 0);
                backgroundColor = generarColoresTiempo(tipo, labels.length);
                borderColor = backgroundColor.map(color => darkenColor(color, 0.2));
            }
            
            chartAmpliadoInstitucion = new Chart(ctx, {
                type: tipoGrafica,
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                font: { 
                                    size: 12,
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                },
                                // Solo mostrar leyenda para valores mayores a 0
                                filter: function(legendItem, chartData) {
                                    return chartData.datasets[0].data[legendItem.index] > 0;
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: tipoGrafica === 'doughnut' ? 
                                'Distribución por Institución (Dona)' : 
                                'Distribución por Institución (Pastel)',
                            font: { size: 18, weight: 'bold' },
                            padding: 20
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: tipoGrafica === 'doughnut' ? '50%' : '0%',
                    // Animaciones suaves
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            });
        } 
        // ============================================
        // GRÁFICO DE BARRAS
        // ============================================
        else if (tipoGrafica === 'bar' && datosFiltrados.datasets && datosFiltrados.datasets.length > 0) {
            // BARRAS AGRUPADAS
            chartAmpliadoInstitucion = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: datosFiltrados.labels || [],
                    datasets: datosFiltrados.datasets.map((dataset, index) => ({
                        ...dataset,
                        // Asegurar que los datos sean números válidos
                        data: dataset.data.map(val => val || 0),
                        // Asignar color específico a cada institución
                        backgroundColor: dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length],
                        borderColor: dataset.borderColor || darkenColor(dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length], 0.2),
                        borderWidth: 1,
                        borderRadius: 6,
                        barThickness: 25,
                        // Nombre específico para cada barra
                        label: dataset.label || `Institución ${index + 1}`
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: `${getTituloTiempo(tipo)} (Filtrado) - Barras Agrupadas`,
                            font: { size: 18, weight: 'bold' },
                            padding: 20
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                title: function(tooltipItems) {
                                    // Mostrar la fecha como título
                                    const index = tooltipItems[0].dataIndex;
                                    return datosFiltrados.labels ? datosFiltrados.labels[index] : 'Fecha no disponible';
                                },
                                label: function(context) {
                                    const datasetLabel = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    
                                    if (value === 0) {
                                        return `${datasetLabel}: 0 visitantes`;
                                    }
                                    
                                    // Calcular porcentaje del total para esta fecha
                                    const fechaIndex = context.dataIndex;
                                    let totalFecha = 0;
                                    if (datosFiltrados.datasets) {
                                        totalFecha = datosFiltrados.datasets.reduce((sum, ds) => 
                                            sum + (ds.data[fechaIndex] || 0), 0);
                                    }
                                    
                                    const porcentaje = totalFecha > 0 ? Math.round((value / totalFecha) * 100) : 0;
                                    return `${datasetLabel}: ${value} visitantes (${porcentaje}% del total de la fecha)`;
                                },
                                filter: function(tooltipItem) {
                                    return true;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            title: {
                                display: true,
                                text: 'Cantidad de Visitantes',
                                font: { weight: 'bold', size: 14 }
                            },
                            stacked: false
                        },
                        x: {
                            grid: { display: false },
                            title: {
                                display: true,
                                text: getTituloTiempo(tipo).split(' ')[2] || 'Período',
                                font: { weight: 'bold', size: 14 }
                            },
                            stacked: false,
                            ticks: {
                                maxRotation: tipo === 'fecha' ? 45 : 0,
                                minRotation: 0
                            }
                        }
                    }
                }
            });
        }
    }

// Crear gráfica ampliada de institución - VERSIÓN CORREGIDA
    function crearGraficaAmpliadaInstitucion(tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoInstitucion");
        if (!ctx) return;

        // Destruir gráfica anterior si existe
        if (chartAmpliadoInstitucion) {
            chartAmpliadoInstitucion.destroy();
        }

        const { labels, values, total } = datosInstituciones;
        const colors = generarColoresInstitucion(labels.length);
        const tipoChart = tipoGrafica;

        chartAmpliadoInstitucion = new Chart(ctx, {
            type: tipoChart,
            data: {
                labels: labels,
                datasets: [{
                    label: "Cantidad de Visitantes",
                    data: values,
                    backgroundColor: colors,
                    borderColor: tipoChart === "bar" ? 'transparent' : colors.map(color => darkenColor(color, 0.2)),
                    borderWidth: tipoChart === "bar" ? 0 : 2,
                    borderRadius: tipoChart === "bar" ? 8 : 0,
                    barThickness: tipoChart === "bar" ? 35 : undefined,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: tipoChart === "bar" ? 'top' : 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Distribución por Institución - Vista Ampliada',
                        font: { size: 18, weight: 'bold' },
                        padding: 20
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed.y || context.parsed;
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} visitantes (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: tipoChart === "bar" ? {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        title: {
                            display: true,
                            text: 'Cantidad de Visitantes',
                            font: { weight: 'bold', size: 14 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        title: {
                            display: true,
                            text: 'Institución',
                            font: { weight: 'bold', size: 14 }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                } : {},
                cutout: tipoChart === "bar" ? '0%' : (tipoChart === 'doughnut' ? '40%' : '0%')
            },
        });
    }

// Crear gráfica ampliada de tiempo
    function crearGraficaAmpliadaTiempo(tipo, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoInstitucion");
        if (!ctx) return;

        // Destruir gráfica anterior si existe
        if (chartAmpliadoInstitucion) {
            chartAmpliadoInstitucion.destroy();
        }

        const datos = getDatosTiempo(tipo);
        
        // GRÁFICOS CIRCULARES
        if (tipoGrafica === 'doughnut' || tipoGrafica === 'pie') {
            // Para gráficos circulares, usar distribución general por institución
            let labels = [];
            let data = [];
            let backgroundColor = [];
            
            if (datos.datasets && datos.datasets.length > 0) {
                // Calcular total por institución
                datos.datasets.forEach((dataset, index) => {
                    const totalInstitucion = dataset.data.reduce((a, b) => a + b, 0);
                    if (totalInstitucion > 0) {
                        labels.push(dataset.label);
                        data.push(totalInstitucion);
                        backgroundColor.push(dataset.backgroundColor || coloresInstituciones[index % coloresInstituciones.length]);
                    }
                });
            }
            
            chartAmpliadoInstitucion = new Chart(ctx, {
                type: tipoGrafica,
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColor,
                        borderColor: '#fff',
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Distribución por Institución - Vista Ampliada',
                            font: { size: 18, weight: 'bold' },
                            padding: 20
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: tipoGrafica === 'doughnut' ? '50%' : '0%'
                }
            });
        } 
        // GRÁFICO DE BARRAS
        else if (tipoGrafica === 'bar') {
            chartAmpliadoInstitucion = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: datos.labels,
                    datasets: datos.datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: `${getTituloTiempo(tipo)} - Vista Ampliada (Barras Agrupadas)`,
                            font: { size: 18, weight: 'bold' },
                            padding: 20
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.parsed.y + ' visitantes';
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            title: {
                                display: true,
                                text: 'Cantidad de Visitantes',
                                font: { weight: 'bold', size: 14 }
                            },
                            stacked: false
                        },
                        x: {
                            grid: { display: false },
                            title: {
                                display: true,
                                text: getTituloTiempo(tipo).split(' ')[2] || 'Período',
                                font: { weight: 'bold', size: 14 }
                            },
                            stacked: false,
                            ticks: {
                                maxRotation: tipo === 'fecha' ? 45 : 0,
                                minRotation: 0
                            }
                        }
                    }
                }
            });
        }
    }

// Función para cambiar tipo de gráfica en modal - VERSIÓN MEJORADA
    function cambiarTipoGraficaModal(tipoGrafica) {
        const tipo = determinarTipoActual();
        
        // Obtener los datos actuales del modal
        let datosActuales;
        if (tipo === 'institucion') {
            datosActuales = datosInstituciones;
            crearGraficaAmpliadaInstitucionConDatos(datosActuales, tipoGrafica);
            llenarTablaModalInstitucion();
        } else {
            datosActuales = getDatosTiempo(tipo);
            crearGraficaAmpliadaTiempoConDatos(tipo, datosActuales, tipoGrafica);
            llenarTablaModalTiempo(tipo);
        }
    }
