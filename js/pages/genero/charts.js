// Genero - charts
// Refactor modular: lógica original preservada.

// Función para generar colores según el tipo
function generarColores(tipo, labels) {
    if (tipo === 'genero') {
        return labels.map(label => coloresPorGenero[label] || '#95a5a6');
    } else if (tipo === 'intereses') {
        const coloresIntereses = {
            'Observación': '#27ae60',
            'Fotografía': '#3498db',
            'Investigación': '#f39c12',
            'Educación': '#9b59b6',
            'Recreación': '#e74c3c'
        };
        return labels.map(label => coloresIntereses[label] || '#95a5a6');
    } else {
        const palette = colorPalettes[tipo] || colorPalettes.fecha;
        const cols = [];
        for(let i = 0; i < labels.length; i++) {
            cols.push(palette[i % palette.length]);
        }
        return cols;
    }
}

// Función para oscurecer colores (efecto 3D)
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

// Función para aclarar colores (efecto hover)
function lightenColor(color, factor) {
    if (color.startsWith('#')) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        
        r = Math.min(255, Math.floor(r + (255 - r) * factor));
        g = Math.min(255, Math.floor(g + (255 - g) * factor));
        b = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return color;
}

// funcion auxiliar
// Función para ordenar fechas en formato "23-ene"
function ordenarFechasCortas(fechasArray) {
    if (!fechasArray || fechasArray.length === 0) return [];
    
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                   'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    return fechasArray.sort((a, b) => {
        try {
            const [diaA, mesA] = a.split('-');
            const [diaB, mesB] = b.split('-');
            
            const mesIndexA = meses.indexOf(mesA.toLowerCase());
            const mesIndexB = meses.indexOf(mesB.toLowerCase());
            
            // Primero comparar por mes
            if (mesIndexA !== mesIndexB) {
                return mesIndexA - mesIndexB;
            }
            
            // Si mismo mes, comparar por día
            return parseInt(diaA) - parseInt(diaB);
        } catch (error) {
            return 0;
        }
    });
}

// Función para actualizar gráfica de fechas - VERSIÓN CON DATOS AGRUPADOS
function actualizarGraficaFechas(tipoGrafica, datosFechas, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    // Verificar si tenemos datos agrupados
    if (datosFechas.type === 'grouped' && datosFechas.datasets) {
        // GRÁFICA AGRUPADA POR GÉNERO
        chartAmpliado = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datosFechas.labels,
                datasets: datosFechas.datasets
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
                            pointStyle: 'circle',
                            font: { size: 13 }
                        }
                    },
                    title: {
                        display: true,
                        text: titulo + ' - Agrupado por Género',
                        font: { size: 18, weight: 'bold' },
                        padding: 25
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(tooltipItems) {
                                return `Fecha: ${tooltipItems[0].label}`;
                            },
                            label: function(context) {
                                const fechaIndex = context.dataIndex;
                                const totalFecha = datosFechas.totalPorFecha[fechaIndex] || 0;
                                const valor = context.parsed.y;
                                const porcentaje = totalFecha > 0 ? Math.round((valor / totalFecha) * 100) : 0;
                                return `${context.dataset.label}: ${valor} visitantes (${porcentaje}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: false, // BARRAS JUNTAS, NO APILADAS
                        grid: { 
                            color: 'rgba(0,0,0,0.1)',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Cantidad de Visitantes',
                            font: { weight: 'bold', size: 14 }
                        }
                    },
                    x: {
                        stacked: false, // BARRAS JUNTAS
                        grid: { display: false },
                        title: {
                            display: true,
                            text: 'Fechas de Visita',
                            font: { weight: 'bold', size: 14 }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            },
        });

        // Actualizar tabla con datos agrupados
        actualizarTablaFechasAgrupadas(datosFechas);
        
    } else {
        // GRÁFICA SIMPLE (fallback)
        const colors = generarColores('fecha', datosFechas.labels);

        chartAmpliado = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datosFechas.labels,
                datasets: [
                    {
                        label: "Total de Visitantes por Fecha",
                        data: datosFechas.values,
                        backgroundColor: colors,
                        borderColor: colors.map(color => darkenColor(color, 0.3)),
                        borderWidth: 2,
                        borderRadius: 6,
                        barThickness: 25,
                        hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: titulo,
                        font: { size: 18, weight: 'bold' },
                        padding: 25
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
                                return `${label}: ${value.toLocaleString()} visitantes`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { 
                            color: 'rgba(0,0,0,0.1)',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Cantidad de Visitantes',
                            font: { weight: 'bold', size: 14 }
                        }
                    },
                    x: {
                        grid: { 
                            display: false 
                        },
                        title: {
                            display: true,
                            text: 'Fechas de Visita',
                            font: { weight: 'bold', size: 14 }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            },
        });

        // Actualizar tabla simple
        actualizarTablaFechas(datosFechas);
    }
}

// Función para actualizar gráfica modal con datos agrupados
function actualizarGraficaModalConDatosAgrupados(tipoGrafica, datosProcesados, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    // DETECTAR QUÉ TIPO DE DATOS TENEMOS
    if (datosProcesados.type === 'grouped') {
        // DATOS AGRUPADOS (con datasets múltiples)
        
        if (tipoActual === 'anio') {
            // CASO ESPECIAL: GRÁFICA DE AÑOS AGRUPADOS
            actualizarGraficaAniosAgrupados(tipoGrafica, datosProcesados, titulo);
        } else if (tipoActual === 'mes') {
            // CASO ESPECIAL: GRÁFICA DE MESES AGRUPADOS
            actualizarGraficaMesesAgrupados(tipoGrafica, datosProcesados, titulo);
        } else {
            // CASO GENERAL: GRÁFICA AGRUPADA (fechas, días, etc.)
            chartAmpliado = new Chart(ctx, {
                type: tipoGrafica === "bar" ? "bar" : "doughnut",
                data: {
                    labels: datosProcesados.labels,
                    datasets: datosProcesados.datasets
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
                                pointStyle: 'circle',
                                font: { size: 13 }
                            }
                        },
                        title: {
                            display: true,
                            text: titulo,
                            font: { size: 18, weight: 'bold' },
                            padding: 25
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                title: function(tooltipItems) {
                                    let labelText = '';
                                    if (tipoActual === 'fecha') {
                                        labelText = `Fecha: ${tooltipItems[0].label}`;
                                    } else if (tipoActual === 'mes') {
                                        labelText = `Mes: ${tooltipItems[0].label}`;
                                    } else if (tipoActual === 'anio') {
                                        labelText = `Año: ${tooltipItems[0].label}`;
                                    } else {
                                        labelText = tooltipItems[0].label;
                                    }
                                    return labelText;
                                },
                                label: function(context) {
                                    let totalPeriodo = 0;
                                    
                                    if (tipoActual === 'fecha' && datosProcesados.totalPorFecha) {
                                        totalPeriodo = datosProcesados.totalPorFecha[context.dataIndex] || 0;
                                    } else if (tipoActual === 'mes' && datosProcesados.totalPorMes) {
                                        totalPeriodo = datosProcesados.totalPorMes[context.dataIndex] || 0;
                                    } else if (tipoActual === 'anio' && datosProcesados.totalPorAño) {
                                        totalPeriodo = datosProcesados.totalPorAño[context.dataIndex] || 0;
                                    }
                                    
                                    const valor = context.parsed.y;
                                    const porcentaje = totalPeriodo > 0 ? 
                                        Math.round((valor / totalPeriodo) * 100) : 0;
                                    return `${context.dataset.label}: ${valor} visitantes (${porcentaje}%)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: false, // BARRAS JUNTAS, NO APILADAS
                            grid: { 
                                color: 'rgba(0,0,0,0.1)',
                                drawBorder: false
                            },
                            title: {
                                display: true,
                                text: 'Cantidad de Visitantes',
                                font: { weight: 'bold', size: 14 }
                            },
                            ticks: {
                                precision: 0
                            }
                        },
                        x: {
                            stacked: false, // BARRAS JUNTAS
                            grid: { display: false },
                            title: {
                                display: true,
                                text: obtenerEtiquetaDescriptiva(tipoActual),
                                font: { weight: 'bold', size: 14 }
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0,
                                font: { size: 12 }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
            
            // Actualizar tabla según el tipo
            if (tipoActual === 'fecha') {
                actualizarTablaFechasAgrupadas(datosProcesados);
            } else if (tipoActual === 'mes') {
                actualizarTablaMesesAgrupados(datosProcesados);
            } else if (tipoActual === 'anio') {
                actualizarTablaAñosAgrupados(datosProcesados);
            } else {
                actualizarTablaDatosAgrupados(datosProcesados);
            }
        }
        
    } else if (datosProcesados.type === 'genero_especifico') {
        // GRÁFICA SIMPLE (género específico)
        const colors = generarColores(tipoActual, datosProcesados.labels);
        
        chartAmpliado = new Chart(ctx, {
            type: tipoGrafica === "bar" ? "bar" : "doughnut", 
            data: {
                labels: datosProcesados.labels,
                datasets: [{
                    label: `Visitantes ${formatearGenero(datosProcesados.genero)}`,
                    data: datosProcesados.values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => darkenColor(color, 0.3)),
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 25,
                    hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            padding: 15,
                            font: { size: 13 }
                        }
                    },
                    title: {
                        display: true,
                        text: titulo,
                        font: { size: 18, weight: 'bold' },
                        padding: 25
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} visitantes`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { 
                            color: 'rgba(0,0,0,0.1)',
                            drawBorder: false
                        },
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
                            text: obtenerEtiquetaDescriptiva(tipoActual),
                            font: { weight: 'bold', size: 14 }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        actualizarTablaDatosSimples(datosProcesados);
    }
}

// Función para actualizar gráfica comparativa mensual (barras juntas por género)
function actualizarGraficaComparativaMensual(tipoGrafica, datosComparativa, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    const colors = generarColores('genero', datosComparativa.labels);
    const etiquetaDescriptiva = 'Géneros';

    // Configuración especial para gráfica comparativa mensual
    chartAmpliado = new Chart(ctx, {
        type: tipoGrafica === "bar" ? "bar" : "bar", // Forzar barras para comparación
        data: {
            labels: datosComparativa.labels.map(formatearGenero),
            datasets: [
                {
                    label: "Total de Visitantes",
                    data: datosComparativa.values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => darkenColor(color, 0.3)),
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 35,
                    hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // Ocultar leyenda ya que los colores están en las barras
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
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
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Visitantes',
                        font: { weight: 'bold', size: 14 }
                    },
                    // Mostrar siempre un valor mínimo para que se vean las barras pequeñas
                    suggestedMin: 0,
                    suggestedMax: function() {
                        const maxValue = Math.max(...datosComparativa.values);
                        return maxValue === 0 ? 10 : Math.ceil(maxValue * 1.2);
                    }
                },
                x: {
                    grid: { 
                        display: false 
                    },
                    title: {
                        display: true,
                        text: etiquetaDescriptiva,
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    }
                }
            },
            // Animaciones para gráfica comparativa
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        },
    });

    // Actualizar tabla con datos comparativos mensuales
    actualizarTablaComparativaMensual(datosComparativa);
}

// AGREGAR ESTA FUNCIÓN NUEVA (antes de que se llame)
function actualizarGraficaComparativa(tipoGrafica, datosComparativa, titulo) {
    console.log('🎨 Actualizando gráfica comparativa:', { tipoGrafica, datosComparativa, titulo });
    
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    const colors = generarColores(tipoActual, datosComparativa.labels);

    chartAmpliado = new Chart(ctx, {
        type: tipoGrafica === "bar" ? "bar" : "doughnut", // ← RESPETAR EL TIPO
        data: {
            labels: datosComparativa.labels.map(label => 
                tipoActual === 'genero' ? formatearGenero(label) : label
            ),
            datasets: [{
                label: "Total de Visitantes",
                data: datosComparativa.values,
                backgroundColor: colors,
                borderColor: colors.map(color => darkenColor(color, 0.3)),
                borderWidth: 2,
                borderRadius: tipoGrafica === "bar" ? 6 : 0,
                barThickness: tipoGrafica === "bar" ? 30 : undefined,
                hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: tipoGrafica === "bar" ? 'top' : 'right',
                    labels: {
                        padding: 15,
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
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
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} visitantes (${percentage}%)`;
                        }
                    }
                }
            },
            scales: tipoGrafica === "bar" ? {
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
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
                        text: obtenerEtiquetaDescriptiva(tipoActual),
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            } : {},
            cutout: tipoGrafica === "bar" ? '0%' : '40%'
        }
    });

    // Actualizar tabla
    actualizarTablaComparativa(datosComparativa);
}

// Función para actualizar gráfica de género específico - VERSIÓN CORREGIDA
function actualizarGraficaGeneroEspecifico(datosProcesados, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    const colors = generarColores('fecha', datosProcesados.labels);
    
    chartAmpliado = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datosProcesados.labels,
            datasets: [{
                label: `Visitantes ${formatearGenero(datosProcesados.genero)}`,
                data: datosProcesados.values,
                backgroundColor: colors,
                borderColor: colors.map(color => darkenColor(color, 0.3)),
                borderWidth: 2,
                borderRadius: 6,
                barThickness: 25,
                hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} visitantes`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
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
                        text: 'Fechas de Visita',
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    // Actualizar tabla
    actualizarTablaDatosSimples(datosProcesados);
}

// ====================================================================
// FUNCIONES NUEVAS QUE FALTAN - AÑADIR ANTES DE actualizarGraficaModalConDatosAgrupados
// ====================================================================

// Función para actualizar gráfica de meses agrupados (BARRAS JUNTAS)
function actualizarGraficaMesesAgrupados(tipoGrafica, datosProcesados, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    // Configurar gráfica de barras agrupadas (BARRAS JUNTAS)
    chartAmpliado = new Chart(ctx, {
        type: 'bar', // SIEMPRE barras para esta vista
        data: {
            labels: datosProcesados.labels,
            datasets: datosProcesados.datasets
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
                        pointStyle: 'circle',
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Mes: ${tooltipItems[0].label}`;
                        },
                        label: function(context) {
                            const mesIndex = context.dataIndex;
                            const totalMes = datosProcesados.totalPorPeriodo[mesIndex] || 0;
                            const valor = context.parsed.y;
                            const porcentaje = totalMes > 0 ? Math.round((valor / totalMes) * 100) : 0;
                            return `${context.dataset.label}: ${valor} visitantes (${porcentaje}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false, // IMPORTANTE: BARRAS JUNTAS, NO APILADAS
                    grid: { 
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Visitantes',
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        precision: 0
                    }
                },
                x: {
                    stacked: false, // IMPORTANTE: BARRAS JUNTAS
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Meses',
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        font: { size: 12 }
                    }
                }
            },
            // Configuración para barras juntas
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    // Actualizar tabla
    actualizarTablaMesesAgrupados(datosProcesados);
}

// Función para actualizar gráfica de años agrupados (BARRAS JUNTAS)
function actualizarGraficaAniosAgrupados(tipoGrafica, datosProcesados, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    // Configurar gráfica de barras agrupadas (BARRAS JUNTAS)
    chartAmpliado = new Chart(ctx, {
        type: 'bar', // SIEMPRE barras para esta vista
        data: {
            labels: datosProcesados.labels,
            datasets: datosProcesados.datasets
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
                        pointStyle: 'circle',
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Año: ${tooltipItems[0].label}`;
                        },
                        label: function(context) {
                            const añoIndex = context.dataIndex;
                            const totalAño = datosProcesados.totalPorAño[añoIndex] || 0;
                            const valor = context.parsed.y;
                            const porcentaje = totalAño > 0 ? Math.round((valor / totalAño) * 100) : 0;
                            return `${context.dataset.label}: ${valor} visitantes (${porcentaje}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false, // IMPORTANTE: BARRAS JUNTAS, NO APILADAS
                    grid: { 
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Visitantes',
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        precision: 0
                    }
                },
                x: {
                    stacked: false, // IMPORTANTE: BARRAS JUNTAS
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Años',
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        font: { size: 12 }
                    }
                }
            },
            // Configuración para barras juntas
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    // Actualizar tabla
    actualizarTablaAñosAgrupados(datosProcesados);
}

function actualizarGraficaModal(tipoGrafica, titulo) {
    // Implementación de actualizar gráfica modal
    console.log('Actualizando gráfica modal:', tipoGrafica, titulo);
}
