// Función para crear gráficas
// Función para crear gráficas en 3D
function crearGraficas(tipo) {
    console.log(`=== CREANDO GRÁFICA 3D PARA: ${tipo} ===`);
    
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

    // Configurar barras 3D
    const ctxBar = document.getElementById("chartBar").getContext("2d");
    if (chartBar) chartBar.destroy();
    
    const labelsParaGrafica = tipo === 'genero' ? labels.map(formatearGenero) : 
                            tipo === 'fecha' ? labels.map(formatearGenero) : 
                            labels;
    
    console.log('Creando gráfica de barras 3D con:', labelsParaGrafica, values);
    
    chartBar = new Chart(ctxBar, {
        type: "bar",
        data: {
            labels: labelsParaGrafica,
            datasets: [
                {
                    label: "Total de Visitantes",
                    data: values,
                    backgroundColor: colors.map(color => 
                        typeof color === 'string' ? color : 
                        Array.isArray(color) ? color[0] : '#3498db'
                    ),
                    borderColor: colors.map(color => 
                        typeof color === 'string' ? 
                        darkenColor(color, 0.2) : 
                        '#2980b9'
                    ),
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 25,
                    hoverBackgroundColor: colors.map(color => 
                        typeof color === 'string' ? 
                        lightenColor(color, 0.1) : 
                        '#5dade2'
                    ),
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
                    text: tituloDescriptivo + ' - Vista 3D',
                    font: { size: 16, weight: 'bold' },
                    padding: 20
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 13 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.parsed.y / total) * 100);
                            return `Visitantes: ${context.parsed.y.toLocaleString()} (${percentage}%)`;
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
                        font: { weight: 'bold' }
                    }
                },
                x: {
                    grid: { 
                        display: false 
                    },
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
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        },
    });

    // Configurar gráfica circular 3D
    const ctxPie = document.getElementById("chartPie").getContext("2d");
    if (chartPie) chartPie.destroy();
    
    console.log('Creando gráfica circular 3D con:', labelsParaGrafica, values);
    
    chartPie = new Chart(ctxPie, {
        type: "doughnut",
        data: {
            labels: labelsParaGrafica,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 3,
                    borderColor: '#fff',
                    hoverBorderWidth: 4,
                    hoverBorderColor: '#fff',
                    hoverBackgroundColor: colors.map(color => 
                        typeof color === 'string' ? 
                        lightenColor(color, 0.2) : color
                    ),
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
                    text: tituloDescriptivo + ' - Vista 3D',
                    font: { size: 16, weight: 'bold' },
                    padding: 20
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            spacing: 5,
            rotation: -30, // Efecto 3D - inclinación
            circumference: 360,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            }
        },
    });

    // Aplicar efectos 3D manualmente con sombras
    aplicarEfectos3D();

    console.log('=== GRÁFICAS 3D CREADAS EXITOSAMENTE ===');
}

// Función para aplicar efectos 3D
function aplicarEfectos3D() {
    // Efecto para barras
    const barCanvas = document.getElementById("chartBar");
    if (barCanvas) {
        barCanvas.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
        barCanvas.style.borderRadius = '12px';
        barCanvas.style.background = 'linear-gradient(145deg, #ffffff, #f8f9fa)';
        barCanvas.style.padding = '15px';
    }
    
    // Efecto para doughnut
    const pieCanvas = document.getElementById("chartPie");
    if (pieCanvas) {
        pieCanvas.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
        pieCanvas.style.borderRadius = '12px';
        pieCanvas.style.background = 'linear-gradient(145deg, #ffffff, #f8f9fa)';
        pieCanvas.style.padding = '15px';
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

// Función para mostrar gráficas
function mostrarGraficas(tipo) {
    tipoActual = tipo;
    console.log(`🔄 Mostrando gráficas 3D para: ${tipo}`);
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

// Función para actualizar la gráfica del modal en 3D
function actualizarGraficaModal(tipoGrafica, tituloPersonalizado = null) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    const datos = datosSimulados[tipoActual];
    const total = tipoActual === 'fecha' && datos.type === 'grouped' 
        ? datos.datasets.reduce((sum, dataset) => sum + dataset.data.reduce((a, b) => a + b, 0), 0)
        : datos.values.reduce((a, b) => a + b, 0);
    
    const etiquetaDescriptiva = obtenerEtiquetaDescriptiva(tipoActual);
    
    const tituloFinal = (tituloPersonalizado || obtenerTituloDescriptivo(tipoActual)) + ' - Vista 3D';

    if (chartAmpliado) chartAmpliado.destroy();

    const modalTitle = document.getElementById("modalTitle");
    modalTitle.innerHTML = `<i class="fas fa-cube"></i> ${tituloFinal}`;

    // PARA GRÁFICA DE FECHA (AGRUPADA POR GÉNERO)
    if (tipoActual === 'fecha' && datos.type === 'grouped') {
        // Aplicar efectos 3D a datasets agrupados
        const datasets3D = datos.datasets.map(dataset => ({
            ...dataset,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: darkenColor(dataset.backgroundColor, 0.3),
            hoverBorderWidth: 3,
            hoverBackgroundColor: lightenColor(dataset.backgroundColor, 0.1),
            barThickness: 30,
        }));

        chartAmpliado = new Chart(ctx, {
            type: tipoGrafica === "bar" ? "bar" : "bar",
            data: {
                labels: datos.labels.map(fecha => formatearFecha(fecha)),
                datasets: datasets3D
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
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(tooltipItems) {
                                return `Fecha: ${formatearFecha(tooltipItems[0].label)}`;
                            },
                            label: function(context) {
                                const totalFecha = datos.labels.reduce((sum, fecha, index) => {
                                    return sum + datos.datasets.reduce((datasetSum, dataset) => 
                                        datasetSum + (dataset.data[index] || 0), 0);
                                }, 0);
                                const percentage = totalFecha > 0 ? Math.round((context.parsed.y / totalFecha) * 100) : 0;
                                return `${context.dataset.label}: ${context.parsed.y} visitantes (${percentage}%)`;
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
                            text: etiquetaDescriptiva,
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
                <tr style="background: linear-gradient(145deg, #f8f9fa, #e9ecef);">
                    <td colspan="3" style="font-weight: bold; color: #2c3e50; padding: 12px;">
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
                                <span class="gender-badge-3d ${obtenerClaseGenero(dataset.label.toLowerCase())}">
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
                        borderColor: colors.map(color => darkenColor(color, 0.3)),
                        borderWidth: tipoGrafica === "bar" ? 2 : 3,
                        borderRadius: tipoGrafica === "bar" ? 10 : 0,
                        barThickness: tipoGrafica === "bar" ? 25 : undefined,
                        hoverBorderWidth: tipoGrafica === "bar" ? 3 : 4,
                        hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
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
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
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
                        grid: { 
                            display: false 
                        },
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
                cutout: tipoGrafica === "bar" ? '0%' : '50%',
                rotation: tipoGrafica === "bar" ? 0 : -25, // Efecto 3D para doughnut
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart',
                    animateRotate: tipoGrafica !== "bar",
                    animateScale: true
                }
            },
        });

        // Aplicar efectos visuales 3D al modal
        const modalCanvas = document.getElementById("chartAmpliado");
        modalCanvas.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
        modalCanvas.style.borderRadius = '15px';
        modalCanvas.style.background = 'linear-gradient(145deg, #ffffff, #f8f9fa)';
        modalCanvas.style.padding = '20px';

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
                            <span class="gender-badge-3d ${claseGenero}">
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

// Agregar CSS para efectos 3D (debes agregar esto en tu CSS)
function agregarCSS3D() {
    const style = document.createElement('style');
    style.textContent = `
        .chart-container {
            perspective: 1000px;
        }

        canvas {
            transition: all 0.3s ease;
            transform-style: preserve-3d;
        }

        canvas:hover {
            transform: translateY(-5px) rotateX(5deg);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2) !important;
        }

        .chart-bar-3d {
            background: linear-gradient(145deg, #ffffff, #f8f9fa);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 
                0 10px 30px rgba(0,0,0,0.1),
                inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .gender-badge-3d {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            transform: translateZ(0);
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .gender-badge-3d:hover {
            transform: translateY(-2px) translateZ(10px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.2);
            border-color: rgba(255,255,255,0.5);
        }

        .modal-3d {
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(10px);
        }

        .modal-content-3d {
            background: linear-gradient(145deg, #ffffff, #f8f9fa);
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            border: none;
            transform-style: preserve-3d;
        }
    `;
    document.head.appendChild(style);
}

// Llamar esta función al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    agregarCSS3D();
});