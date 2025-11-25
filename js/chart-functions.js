// Función para crear gráficas
function crearGraficas(tipo) {
    console.log(`=== CREANDO GRÁFICA PARA: ${tipo} ===`);
    
    const datos = datosSimulados[tipo];
    console.log('Datos completos:', datos);

    let labels = [];
    let values = [];

    if (tipo === 'fecha') {
        if (datos && datos.labels && datos.values) {
            labels = datos.labels;
            values = datos.values;
            console.log('Usando datos de BD para fecha:', { labels, values });
        } else {
            labels = ['Sin datos'];
            values = [0];
            console.log('Usando datos de fallback para fecha');
        }
    } else if (datos && datos.labels && datos.values) {
        labels = datos.labels;
        values = datos.values;
        console.log('Usando datos existentes:', { labels, values });
    } else {
        labels = ['Dato 1', 'Dato 2', 'Dato 3'];
        values = [10, 20, 15];
        console.log('Usando datos de ejemplo por defecto:', { labels, values });
    }

    // Validación simple
    if (!labels.length || !values.length || values.reduce((a, b) => a + b, 0) === 0) {
        console.log('No hay datos - labels:', labels, 'values:', values);
        mostrarMensajeSinDatos(`No hay datos disponibles para ${obtenerTituloDescriptivo(tipo)}`);
        return;
    }

    console.log('Procesando con labels:', labels, 'values:', values);

    const colors = generarColores(tipo, labels);
    const etiquetaDescriptiva = obtenerEtiquetaDescriptiva(tipo);
    const tituloDescriptivo = obtenerTituloDescriptivo(tipo);

    // Configurar barras
    const ctxBar = document.getElementById("chartBar").getContext("2d");
    if (chartBar) chartBar.destroy();
    
    const labelsParaGrafica = tipo === 'genero' ? labels.map(formatearGenero) : 
                            tipo === 'fecha' ? labels.map(formatearGenero) : 
                            labels;
    
    console.log('Creando gráfica de barras con:', labelsParaGrafica, values);
    
    chartBar = new Chart(ctxBar, {
        type: "bar",
        data: {
            labels: labelsParaGrafica,
            datasets: [
                {
                    label: "Total de Visitantes",
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 6,
                    barThickness: 18,
                },
            ],
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
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 13 },
                    bodyFont: { size: 13 },
                    padding: 10,
                    cornerRadius: 6,
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function(context) {
                            return `Visitantes: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
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
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            },
        },
    });

    // Configurar circular
    const ctxPie = document.getElementById("chartPie").getContext("2d");
    if (chartPie) chartPie.destroy();
    
    console.log('Creando gráfica circular con:', labelsParaGrafica, values);
    
    chartPie = new Chart(ctxPie, {
        type: "doughnut",
        data: {
            labels: labelsParaGrafica,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                },
            ],
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
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%',
            spacing: 2
        },
    });

    console.log('=== GRÁFICAS CREADAS EXITOSAMENTE ===');
}

// Función para mostrar gráficas
function mostrarGraficas(tipo) {
    tipoActual = tipo;
    console.log(`🔄 Mostrando gráficas para: ${tipo}`);
    crearGraficas(tipo);
}

// Función para abrir modal
function abrirModal(tipoGrafica) {
    const modal = document.getElementById("chartModal");
    modal.classList.add("show");

    document.querySelector('.modal-chart-container').setAttribute('data-tipo-grafica', tipoGrafica);

    crearFiltrosModal();
    actualizarGraficaModal(tipoGrafica);
}

// Función para actualizar la gráfica del modal
function actualizarGraficaModal(tipoGrafica, tituloPersonalizado = null) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    const datos = datosSimulados[tipoActual];
    const total = tipoActual === 'fecha' && datos.type === 'grouped' 
        ? datos.datasets.reduce((sum, dataset) => sum + dataset.data.reduce((a, b) => a + b, 0), 0)
        : datos.values.reduce((a, b) => a + b, 0);
    
    const etiquetaDescriptiva = obtenerEtiquetaDescriptiva(tipoActual);
    
    const tituloFinal = tituloPersonalizado || obtenerTituloDescriptivo(tipoActual);

    if (chartAmpliado) chartAmpliado.destroy();

    const modalTitle = document.getElementById("modalTitle");
    modalTitle.innerHTML = `<i class="fas fa-expand"></i> ${tituloFinal}`;

    // PARA GRÁFICA DE FECHA (AGRUPADA POR GÉNERO)
    if (tipoActual === 'fecha' && datos.type === 'grouped') {
        chartAmpliado = new Chart(ctx, {
            type: tipoGrafica === "bar" ? "bar" : "bar",
            data: {
                labels: datos.labels.map(fecha => formatearFecha(fecha)),
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
                            pointStyle: 'circle',
                            font: { size: 13 }
                        }
                    },
                    title: {
                        display: true,
                        text: tituloFinal,
                        font: { size: 18, weight: 'bold' },
                        padding: 25
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(tooltipItems) {
                                return `Fecha: ${formatearFecha(tooltipItems[0].label)}`;
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} visitantes`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
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
                            text: etiquetaDescriptiva,
                            font: { weight: 'bold', size: 14 }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                }
            },
        });

        // Actualizar tabla con datos agrupados por fecha y género
        const tbody = document.querySelector("#tablaDatos tbody");
        tbody.innerHTML = '';
        
        datos.labels.forEach((fecha, fechaIndex) => {
            const fechaFormateada = formatearFecha(fecha);
            let totalFecha = 0;
            
            datos.datasets.forEach(dataset => {
                totalFecha += dataset.data[fechaIndex] || 0;
            });

            tbody.innerHTML += `
                <tr style="background-color: #f8f9fa;">
                    <td colspan="3" style="font-weight: bold; color: #2c3e50;">
                        <i class="fas fa-calendar-day"></i> ${fechaFormateada} - Total: ${totalFecha} visitantes
                    </td>
                </tr>
            `;

            datos.datasets.forEach(dataset => {
                const valor = dataset.data[fechaIndex] || 0;
                const porcentaje = totalFecha > 0 ? ((valor / totalFecha) * 100).toFixed(1) : 0;
                
                if (valor > 0) {
                    tbody.innerHTML += `
                        <tr>
                            <td style="padding-left: 30px;">
                                <span class="gender-badge ${obtenerClaseGenero(dataset.label.toLowerCase())}">
                                    <i class="fas ${dataset.label === 'Masculino' ? 'fa-mars' : dataset.label === 'Femenino' ? 'fa-venus' : 'fa-genderless'}"></i>
                                    ${dataset.label}
                                </span>
                            </td>
                            <td style="text-align: center;"><strong>${valor.toLocaleString()}</strong></td>
                            <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                        </tr>
                    `;
                }
            });
        });

    } else {
        let colors;

        if (tipoActual === 'fecha' && datos.labels.length === 1) {
            const generoUnico = datos.labels[0];
            console.log(`🎨 Aplicando color específico para: ${generoUnico}`);
            
            colors = [coloresPorGenero[generoUnico] || '#95a5a6'];
        } else {
            colors = generarColores(tipoActual, datos.labels);
        }

        console.log('🎨 Colores aplicados:', colors);
                        
        chartAmpliado = new Chart(ctx, {
            type: tipoGrafica === "bar" ? "bar" : "doughnut",
            data: {
                labels: tipoActual === 'genero' ? datos.labels.map(formatearGenero) : 
                        tipoActual === 'fecha' ? datos.labels.map(formatearGenero) : datos.labels,
                datasets: [
                    {
                        label: "Total de Visitantes",
                        data: tipoActual === 'fecha' && datos.type === 'grouped' ? [] : datos.values,
                        backgroundColor: colors,
                        borderRadius: tipoGrafica === "bar" ? 6 : 0,
                        borderWidth: tipoGrafica === "bar" ? 0 : 2,
                        borderColor: tipoGrafica === "bar" ? 'transparent' : '#fff',
                        barThickness: tipoGrafica === "bar" ? 18 : undefined,
                        maxBarThickness: tipoGrafica === "bar" ? 30 : undefined,
                        barPercentage: tipoGrafica === "bar" ? 0.6 : undefined
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: tipoGrafica === "bar" ? 'top' : 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 13 }
                        }
                    },
                    title: {
                        display: true,
                        text: tituloFinal,
                        font: { size: 18, weight: 'bold' },
                        padding: 25
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed.y || context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: tipoGrafica === "bar" ? {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
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
                            text: etiquetaDescriptiva,
                            font: { weight: 'bold', size: 14 }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                } : {},
                cutout: tipoGrafica === "bar" ? '0%' : '40%'
            },
        });

        // Llenar tabla normal para otros tipos
        const tbody = document.querySelector("#tablaDatos tbody");
        tbody.innerHTML = datos.labels
            .map((l, i) => {
                const valor = datos.values[i];
                const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
                const labelFormateado = tipoActual === 'genero' ? formatearGenero(l) : 
                                    tipoActual === 'fecha' ? formatearGenero(l) : l;
                
                if (tipoActual === 'genero' || tipoActual === 'fecha') {
                    const claseGenero = obtenerClaseGenero(l);
                    return `<tr>
                        <td>
                            <span class="gender-badge ${claseGenero}">
                                <i class="fas ${l === 'masculino' ? 'fa-mars' : l === 'femenino' ? 'fa-venus' : 'fa-genderless'}"></i>
                                ${labelFormateado}
                            </span>
                        </td>
                        <td style="text-align: center;"><strong>${valor.toLocaleString()}</strong></td>
                        <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                    </tr>`;
                } else {
                    return `<tr>
                        <td><strong>${labelFormateado}</strong></td>
                        <td style="text-align: center;"><strong>${valor.toLocaleString()}</strong></td>
                        <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                    </tr>`;
                }
            })
            .join("");
    }

    setTimeout(() => {
        chartAmpliado.resize();
    }, 200);
}

// Función para cerrar modal
function cerrarModal() {
    document.getElementById("chartModal").classList.remove("show");
}