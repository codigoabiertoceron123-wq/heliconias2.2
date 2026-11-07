// EdadSystem - charts
// Refactor modular: lógica original preservada.

function crearGraficaAmpliadaTiempo(tipo, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoEdad");
        if (!ctx) {
            console.error('❌ No se encontró el canvas para gráfica ampliada');
            return;
        }

        // Destruir gráfica anterior si existe
        if (chartAmpliadoEdad) {
            chartAmpliadoEdad.destroy();
            chartAmpliadoEdad = null;
        }

        // Obtener datos AGRUPADOS según el tipo
        let datos;
        switch(tipo) {
            case 'fecha':
                datos = datosFechaAgrupados || datosFechaInteligente || { labels: [], datasets: [], total: 0 };
                console.log('📅 Datos AGRUPADOS para fecha ampliada:', datos);
                break;
            case 'mes':
                datos = datosMesAgrupados || datosMesInteligente || { labels: [], datasets: [], total: 0 };
                console.log('📊 Datos AGRUPADOS para mes ampliada:', datos);
                break;
            case 'anio':
                datos = datosAnioAgrupados || datosAnioInteligente || { labels: [], datasets: [], total: 0 };
                console.log('📈 Datos AGRUPADOS para año ampliada:', datos);
                break;
            default:
                console.error(`❌ Tipo de gráfica no válido: ${tipo}`);
                datos = { labels: [], datasets: [], total: 0 };
        }

        console.log(`🔍 Datos para gráfica ampliada ${tipo}:`, {
            labels: datos.labels?.length || 0,
            datasets: datos.datasets?.length || 0,
            total: datos.total || 0
        });

        // Validar que tenemos datos
        if (!datos || !datos.labels || datos.labels.length === 0) {
            console.warn(`⚠️ No hay datos para gráfica ampliada de ${tipo}, mostrando gráfica vacía`);
            
            // Crear gráfica vacía
            chartAmpliadoEdad = new Chart(ctx, {
                type: tipoGrafica === "bar" ? "bar" : "doughnut",
                data: {
                    labels: ['Sin datos'],
                    datasets: [{
                        label: "Sin datos disponibles",
                        data: [1],
                        backgroundColor: '#95a5a6'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: `${getTituloTiempo(tipo)} - No hay datos disponibles`,
                            font: { size: 16, weight: 'bold' }
                        },
                        tooltip: { enabled: false }
                    },
                    scales: tipoGrafica === "bar" ? {
                        y: { display: false },
                        x: { display: false }
                    } : {}
                }
            });
            return;
        }

        // Determinar qué tipo de gráfica crear
        const chartType = tipoGrafica === "bar" ? "bar" : "doughnut";
        
        // Si es gráfica circular o si no hay datasets múltiples, crear gráfica simple
        if (chartType === "doughnut" || !datos.datasets || datos.datasets.length <= 1) {
            console.log(`📊 Creando gráfica SIMPLE para ${tipo} (${chartType})`);
            crearGraficaAmpliadaSimple(tipo, datos, chartType, ctx);
        } else {
            // Si hay múltiples datasets, crear gráfica AGRUPADA
            console.log(`📊 Creando gráfica AGRUPADA para ${tipo} (${chartType}) con ${datos.datasets.length} datasets`);
            crearGraficaAmpliadaAgrupada(tipo, datos, chartType, ctx);
        }
    }

// Mostrar gráficas para tiempo
    function mostrarGraficasTiempo(tipo) {
        console.log(`🎨 Iniciando gráficas para: ${tipo}`);
        
        // Obtener datos
        const datos = getDatosTiempoInteligente(tipo);
        console.log('📊 Datos recibidos para gráficas:', datos);
        
        // Validar que tenemos el contenedor del gráfico de barras
        const ctxBar = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Bar`);
        if (!ctxBar) {
            console.error(`❌ No se encontró el canvas para gráfica de barras de ${tipo}`);
            return;
        }
        
        // Validar datos antes de crear gráficas
        if (!datos || !datos.datasets || datos.datasets.length === 0) {
            console.warn(`⚠️ No hay datos válidos para ${tipo}, mostrando gráfica vacía`);
            
            // Mostrar mensaje en el contenedor
            const container = ctxBar.parentElement;
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px; color: #7f8c8d;">
                        <i class="fas fa-chart-bar fa-2x" style="margin-bottom: 10px;"></i>
                        <h4>No hay datos disponibles</h4>
                        <p>No se encontraron visitantes con datos de edad en este período</p>
                    </div>
                `;
            }
            return;
        }
        
        // Verificar que los datasets tengan datos
        const datasetsValidos = datos.datasets.filter(dataset => 
            dataset.data && dataset.data.length > 0 && dataset.data.some(val => val > 0)
        );
        
        if (datasetsValidos.length === 0) {
            console.warn(`⚠️ Todos los datasets están vacíos para ${tipo}`);
            // Crear gráfica con datos vacíos
            crearGraficaVacia(tipo, ctxBar, 'No hay visitantes en este período');
            return;
        }
        
        // Destruir gráficas anteriores si existen
        console.log(`🗑️ Destruyendo gráficas anteriores de ${tipo}...`);
        switch(tipo) {
            case 'fecha': 
                if (chartFechaBar) {
                    chartFechaBar.destroy();
                    chartFechaBar = null;
                }
                break;
            case 'mes': 
                if (chartMesBar) {
                    chartMesBar.destroy();
                    chartMesBar = null;
                }
                break;
            case 'anio': 
                if (chartAnioBar) {
                    chartAnioBar.destroy();
                    chartAnioBar = null;
                }
                break;
        }
        
        // Crear gráfica de barras
        try {
            console.log(`📈 Creando gráfica de barras para ${tipo}...`);
            const chartBar = new Chart(ctxBar, {
                type: "bar",
                data: {
                    labels: datos.labels || [],
                    datasets: datos.datasets.map((dataset, index) => {
                        // Validar y limpiar datos
                        const datosLimpiados = (dataset.data || []).map(val => {
                            const num = parseFloat(val) || 0;
                            return isNaN(num) ? 0 : num;
                        });
                        
                        // Determinar color
                        const rango = dataset.label ? dataset.label.replace(' años', '') : '';
                        const colorBase = dataset.backgroundColor || coloresPorEdad[rango] || 
                                        coloresPorEdad[Object.keys(coloresPorEdad)[index % Object.keys(coloresPorEdad).length]];
                        
                        return {
                            label: dataset.label || `Rango ${index + 1}`,
                            data: datosLimpiados,
                            backgroundColor: colorBase,
                            borderColor: darkenColor(colorBase, 0.2),
                            borderWidth: dataset.borderWidth || 1,
                            borderRadius: dataset.borderRadius || 6,
                            barThickness: dataset.barThickness || 20,
                            minBarLength: 2
                        };
                    })
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
                            text: `${getTituloTiempo(tipo)} - Distribución por Edad`,
                            font: { size: 16, weight: 'bold' }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
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
                                font: { size: 14, weight: 'bold' }
                            },
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    return Math.round(value);
                                }
                            }
                        },
                        x: {
                            title: { 
                                display: true, 
                                text: getTituloTiempo(tipo).split(' ')[2] || tipo.toUpperCase(),
                                font: { size: 14, weight: 'bold' }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
            
            // Guardar referencia
            switch(tipo) {
                case 'fecha': chartFechaBar = chartBar; break;
                case 'mes': chartMesBar = chartBar; break;
                case 'anio': chartAnioBar = chartBar; break;
            }
            
            console.log(`✅ Gráfica de barras ${tipo} creada exitosamente`);
            
        } catch (error) {
            console.error(`❌ Error creando gráfica de barras para ${tipo}:`, error);
            crearGraficaVacia(tipo, ctxBar, `Error: ${error.message}`);
        }
        
        // Crear gráfica circular
        crearGraficaCircularTiempo(tipo, datos);
    }

// Función para mostrar gráficas agrupadas
    function mostrarGraficasAgrupadasTiempo(tipo) {
    // Obtener el canvas correcto
    const ctxBar = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}BarAgrupado`);
    if (!ctxBar) {
        console.error(`❌ Canvas no encontrado para gráfica agrupada de ${tipo}`);
        return;
    }
    
    // Obtener datos agrupados
    let datos;
    switch(tipo) {
        case 'fecha': datos = datosFechaAgrupados; break;
        case 'mes': datos = datosMesAgrupados; break;
        case 'anio': datos = datosAnioAgrupados; break;
        default: return;
    }
    
    console.log(`🎨 Creando gráfica agrupada para ${tipo}:`, datos);
    
    // Destruir gráficas anteriores si existen
    let chartAnterior;
    switch(tipo) {
        case 'fecha': 
            if (chartFechaBar) {
                chartFechaBar.destroy();
                chartFechaBar = null;
            }
            break;
        case 'mes': 
            if (chartMesBar) {
                chartMesBar.destroy();
                chartMesBar = null;
            }
            break;
        case 'anio': 
            if (chartAnioBar) {
                chartAnioBar.destroy();
                chartAnioBar = null;
            }
            break;
    }
    
    // Verificar que tenemos datos
    if (!datos || !datos.datasets || datos.datasets.length === 0) {
        console.warn(`⚠️ No hay datasets para gráfica agrupada de ${tipo}`);
        
        // Crear gráfica vacía
        new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    label: 'Sin datos',
                    data: [1],
                    backgroundColor: '#f8f9fa',
                    borderColor: '#dee2e6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'No hay datos disponibles',
                        font: { size: 14, weight: 'bold' },
                        color: '#95a5a6'
                    },
                    tooltip: { enabled: false }
                },
                scales: {
                    y: { display: false },
                    x: { display: false }
                }
            }
        });
        return;
    }
    
    // Crear gráfica de barras AGRUPADAS
    const chartBar = new Chart(ctxBar, {
        type: "bar",
        data: {
            labels: datos.labels || [],
            datasets: (datos.datasets || []).map((dataset, index) => {
                // Obtener el rango de edad del label
                const rango = dataset.label ? dataset.label.split(' ')[0] : '';
                
                return {
                    label: dataset.label || `Rango ${index + 1}`,
                    data: dataset.data.map(val => val || 0),
                    backgroundColor: dataset.backgroundColor || coloresPorEdad[rango] || 
                                  coloresPorEdad[Object.keys(coloresPorEdad)[index % Object.keys(coloresPorEdad).length]],
                    borderColor: dataset.borderColor || darkenColor(dataset.backgroundColor || '#3498db', 0.2),
                    borderWidth: dataset.borderWidth || 1,
                    borderRadius: dataset.borderRadius || 6,
                    barThickness: dataset.barThickness || 20,
                    minBarLength: 2
                };
            })
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
                    text: `${getTituloTiempo(tipo)} - Gráfica Agrupada por Edad`,
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} visitantes (${percentage}%)`;
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
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Math.round(value);
                        }
                    }
                },
                x: {
                    title: { 
                        display: true, 
                        text: getTituloTiempo(tipo).split(' ')[2] || tipo.toUpperCase(),
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        maxRotation: tipo === 'fecha' ? 45 : 0,
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
    
    // Guardar referencia
    switch(tipo) {
        case 'fecha': chartFechaBar = chartBar; break;
        case 'mes': chartMesBar = chartBar; break;
        case 'anio': chartAnioBar = chartBar; break;
    }
    
    console.log(`✅ Gráfica agrupada ${tipo} creada exitosamente`);
    
    // También crear gráfica circular
    crearGraficaCircularAgrupada(tipo, datos);
}

// Función auxiliar para crear gráfica vacía
    function crearGraficaVacia(tipo, ctx, mensaje) {
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    label: 'Sin datos',
                    data: [1],
                    backgroundColor: '#f8f9fa',
                    borderColor: '#dee2e6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: mensaje || 'No hay datos disponibles',
                        font: { size: 14, weight: 'bold' },
                        color: '#95a5a6'
                    },
                    tooltip: { enabled: false }
                },
                scales: {
                    y: { display: false },
                    x: { display: false }
                }
            }
        });
    }

// Función para crear gráfica circular
    function crearGraficaCircularTiempo(tipo, datos) {
        const ctxPie = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Pie`);
        if (!ctxPie) {
            console.error(`❌ No se encontró el canvas para gráfica circular de ${tipo}`);
            return;
        }
        
        // Destruir gráfica anterior si existe
        switch(tipo) {
            case 'fecha': 
                if (chartFechaPie) {
                    chartFechaPie.destroy();
                    chartFechaPie = null;
                }
                break;
            case 'mes': 
                if (chartMesPie) {
                    chartMesPie.destroy();
                    chartMesPie = null;
                }
                break;
            case 'anio': 
                if (chartAnioPie) {
                    chartAnioPie.destroy();
                    chartAnioPie = null;
                }
                break;
        }
        
        // Calcular totales por rango
        const totalesPorRango = {};
        if (datos.datasets && datos.datasets.length > 0) {
            datos.datasets.forEach(dataset => {
                const total = (dataset.data || []).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                if (total > 0 && dataset.label) {
                    totalesPorRango[dataset.label] = total;
                }
            });
        }
        
        // Si no hay datos, crear gráfica vacía
        if (Object.keys(totalesPorRango).length === 0) {
            const chartPie = new Chart(ctxPie, {
                type: "doughnut",
                data: {
                    labels: ['Sin datos'],
                    datasets: [{
                        data: [100],
                        backgroundColor: ['#f8f9fa'],
                        borderColor: '#dee2e6',
                        borderWidth: 2
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'No hay datos disponibles',
                            font: { size: 14, weight: 'bold' },
                            color: '#95a5a6'
                        },
                        tooltip: { enabled: false }
                    },
                    cutout: '60%'
                },
            });
            
            switch(tipo) {
                case 'fecha': chartFechaPie = chartPie; break;
                case 'mes': chartMesPie = chartPie; break;
                case 'anio': chartAnioPie = chartPie; break;
            }
            return;
        }
        
        // Crear gráfica con datos
        const labels = Object.keys(totalesPorRango);
        const data = Object.values(totalesPorRango);
        const totalGeneral = data.reduce((a, b) => a + b, 0);
        
        try {
            const chartPie = new Chart(ctxPie, {
                type: "doughnut",
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: labels.map(label => {
                            const rango = label.replace(' años', '');
                            return coloresPorEdad[rango] || generarColorAleatorio();
                        }),
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
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Distribución por Rangos de Edad',
                            font: { size: 16, weight: 'bold' }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const percentage = totalGeneral > 0 ? ((value / totalGeneral) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: '60%'
                },
            });
            
            switch(tipo) {
                case 'fecha': chartFechaPie = chartPie; break;
                case 'mes': chartMesPie = chartPie; break;
                case 'anio': chartAnioPie = chartPie; break;
            }
            
            console.log(`✅ Gráfica circular ${tipo} creada exitosamente`);
            
        } catch (error) {
            console.error(`❌ Error creando gráfica circular para ${tipo}:`, error);
        }
    }

function crearGraficaCircularAgrupada(tipo, datos) {
        const ctxPie = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}PieAgrupado`);
        if (!ctxPie) {
            console.error(`❌ Canvas no encontrado para gráfica circular agrupada de ${tipo}`);
            return;
        }
        
        // Destruir gráfica anterior si existe
        switch(tipo) {
            case 'fecha': 
                if (chartFechaPie) {
                    chartFechaPie.destroy();
                    chartFechaPie = null;
                }
                break;
            case 'mes': 
                if (chartMesPie) {
                    chartMesPie.destroy();
                    chartMesPie = null;
                }
                break;
            case 'anio': 
                if (chartAnioPie) {
                    chartAnioPie.destroy();
                    chartAnioPie = null;
                }
                break;
        }
        
        // Calcular totales por rango
        const totalesPorRango = {};
        if (datos.datasets && datos.datasets.length > 0) {
            datos.datasets.forEach(dataset => {
                const total = (dataset.data || []).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                if (total > 0 && dataset.label) {
                    totalesPorRango[dataset.label] = total;
                }
            });
        }
        
        // Si no hay datos, crear gráfica vacía
        if (Object.keys(totalesPorRango).length === 0) {
            const chartPie = new Chart(ctxPie, {
                type: "doughnut",
                data: {
                    labels: ['Sin datos'],
                    datasets: [{
                        data: [100],
                        backgroundColor: ['#f8f9fa'],
                        borderColor: '#dee2e6',
                        borderWidth: 2
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'No hay datos disponibles',
                            font: { size: 14, weight: 'bold' },
                            color: '#95a5a6'
                        },
                        tooltip: { enabled: false }
                    },
                    cutout: '60%'
                },
            });
            
            switch(tipo) {
                case 'fecha': chartFechaPie = chartPie; break;
                case 'mes': chartMesPie = chartPie; break;
                case 'anio': chartAnioPie = chartPie; break;
            }
            return;
        }
        
        // Crear gráfica con datos
        const labels = Object.keys(totalesPorRango);
        const data = Object.values(totalesPorRango);
        const totalGeneral = data.reduce((a, b) => a + b, 0);
        
        try {
            const chartPie = new Chart(ctxPie, {
                type: "doughnut",
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: labels.map(label => {
                            const rango = label.split(' ')[0];
                            return coloresPorEdad[rango] || generarColorAleatorio();
                        }),
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
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Distribución por Rangos de Edad',
                            font: { size: 16, weight: 'bold' }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const percentage = totalGeneral > 0 ? ((value / totalGeneral) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: '60%'
                },
            });
            
            switch(tipo) {
                case 'fecha': chartFechaPie = chartPie; break;
                case 'mes': chartMesPie = chartPie; break;
                case 'anio': chartAnioPie = chartPie; break;
            }
            
            console.log(`✅ Gráfica circular agrupada ${tipo} creada exitosamente`);
            
        } catch (error) {
            console.error(`❌ Error creando gráfica circular para ${tipo}:`, error);
        }
    }

// Función auxiliar para generar colores aleatorios
    function generarColorAleatorio() {
        const colores = [
            '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2',
            '#EF476F', '#073B4C', '#7209B7', '#3A86FF', '#FB5607'
        ];
        return colores[Math.floor(Math.random() * colores.length)];
    }

function mostrarGraficaTiempoInteligente(datos, tipo, rangoEdad) {
        const ctx = document.getElementById('chartTiempoInteligente');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: datos,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${getTituloTiempo(tipo)} - ${rangoEdad === 'todos' ? 'Todas las edades' : rangoEdad + ' años'}`,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad de Visitantes' }
                    },
                    x: {
                        title: { display: true, text: getTituloTiempo(tipo).split(' ')[2] }
                    }
                }
            }
        });
    }

function mostrarGraficasTiempoCombinado(tipo, datos) {
        // Gráfica de barras principal
        const ctxBar = document.getElementById('chartTiempoPrincipal');
        if (ctxBar) {
            new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: Object.keys(datos.porTiempo),
                    datasets: [{
                        label: 'Visitantes Totales',
                        data: Object.values(datos.porTiempo),
                        backgroundColor: '#3498db',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Visitantes por ${tipo} - Totales`
                        }
                    }
                }
            });
        }

        // Gráfica circular
        const ctxPie = document.getElementById('chartTiempoPie');
        if (ctxPie) {
            new Chart(ctxPie, {
                type: 'pie',
                data: {
                    labels: Object.keys(datos.porTiempo),
                    datasets: [{
                        data: Object.values(datos.porTiempo),
                        backgroundColor: generarColoresTiempo(tipo, Object.keys(datos.porTiempo).length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

function mostrarGraficasTiempoFiltradas(tipo, datosFiltrados) {
    // Gráfica de barras AGRUPADAS filtrada
    const ctxBar = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}BarFiltrado`);
    
    new Chart(ctxBar, {
        type: "bar",
        data: {
            labels: datosFiltrados.labels,
            datasets: datosFiltrados.datasets.map((dataset, index) => ({
                label: dataset.label,
                data: dataset.data.map(val => val || 0),
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor,
                borderWidth: dataset.borderWidth || 1,
                borderRadius: dataset.borderRadius || 6,
                barThickness: dataset.barThickness || 20
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
                    text: `${getTituloTiempo(tipo)} - ${datosFiltrados.filtrosAplicados?.rangoEdad === 'todos' ? 'Todas las edades' : datosFiltrados.filtrosAplicados?.rangoEdad + ' años'}`,
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value} visitantes`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Cantidad de Visitantes' },
                    stacked: false
                },
                x: {
                    title: { display: true, text: getTituloTiempo(tipo).split(' ')[2] },
                    stacked: false
                }
            }
        }
    });

    // Gráfica circular filtrada
    const ctxPie = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}PieFiltrado`);
    
    // Calcular totales por rango para el gráfico circular
    const totalesPorRango = {};
    datosFiltrados.datasets.forEach(dataset => {
        const total = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
        if (total > 0) {
            totalesPorRango[dataset.label] = total;
        }
    });

    const labels = Object.keys(totalesPorRango);
    const data = Object.values(totalesPorRango);

    new Chart(ctxPie, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map(label => {
                    const rango = label.replace(' años', '');
                    return coloresPorEdad[rango] || '#95a5a6';
                }),
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
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Distribución por Rangos de Edad (Filtrado)',
                    font: { size: 16, weight: 'bold' }
                }
            },
            cutout: '60%'
        },
    });
}

function mostrarGraficasEdad() {
        const { labels, values } = datosSimuladosEdad.edad;
        
        // Gráfica de barras
        const ctxBar = document.getElementById("chartBarEdad");
        if (chartBarEdad) chartBarEdad.destroy();
        
        chartBarEdad = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: labels.map(label => `${label} años`),
                datasets: [{
                    label: "Cantidad de Participantes",
                    data: values,
                    backgroundColor: labels.map(label => coloresPorEdad[label]),
                    borderRadius: 8,
                    barThickness: 25,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Distribución por Grupos de Edad',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad de Participantes' }
                    },
                    x: {
                        title: { display: true, text: 'Grupos de Edad' }
                    }
                }
            },
        });

        // Gráfica circular
        const ctxPie = document.getElementById("chartPieEdad");
        if (chartPieEdad) chartPieEdad.destroy();
        
        chartPieEdad = new Chart(ctxPie, {
            type: "doughnut",
            data: {
                labels: labels.map(label => `${label} años`),
                datasets: [{
                    data: values,
                    backgroundColor: labels.map(label => coloresPorEdad[label]),
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
                    }
                },
                cutout: '60%'
            },
        });
    }

function crearGraficaAmpliadaEdad(tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoEdad");
        if (!ctx) return;

        // Destruir gráfica anterior si existe
        if (chartAmpliadoEdad) {
            chartAmpliadoEdad.destroy();
        }

        const { labels, values } = datosSimuladosEdad.edad;
        const colors = labels.map(label => coloresPorEdad[label] || '#95a5a6');
        const total = values.reduce((a, b) => a + b, 0);

        // Configurar según el tipo de gráfica
        const tipoChart = tipoGrafica === "bar" ? "bar" : "doughnut";

        chartAmpliadoEdad = new Chart(ctx, {
            type: tipoChart,
            data: {
                labels: labels.map(label => `${label} años`),
                datasets: [{
                    label: "Cantidad de Participantes",
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => darkenColor(color, 0.2)),
                    borderWidth: 2,
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
                        text: 'Distribución por Grupos de Edad - Vista Ampliada',
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
                                return `${label}: ${value} participantes (${percentage}%)`;
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
                            text: 'Cantidad de Participantes',
                            font: { weight: 'bold', size: 14 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        title: {
                            display: true,
                            text: 'Grupos de Edad',
                            font: { weight: 'bold', size: 14 }
                        }
                    }
                } : {},
                cutout: tipoChart === "bar" ? '0%' : '50%'
            },
        });
    }

function crearGraficaAmpliadaAgrupada(tipo, datos, chartType, ctx) {
        try {
            console.log(`🎨 Preparando gráfica AGRUPADA para ${tipo}:`, {
                labels: datos.labels, // Estos deben ser los años/fechas/meses
                datasetsCount: datos.datasets.length,
                primeraDataset: datos.datasets[0]
            });
            
            // Asegurar que todos los datasets tengan datos
            const datasetsProcesados = datos.datasets.map((dataset, index) => {
                const data = dataset.data.map(val => val || 0);
                const rango = dataset.label ? dataset.label.replace(' años', '') : '';
                const colorBase = dataset.backgroundColor || coloresPorEdad[rango] || 
                                coloresPorEdad[Object.keys(coloresPorEdad)[index % Object.keys(coloresPorEdad).length]];
                
                return {
                    label: dataset.label || `Rango ${index + 1}`,
                    data: data,
                    backgroundColor: colorBase,
                    borderColor: darkenColor(colorBase, 0.2),
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 25,
                    minBarLength: 2
                };
            });
            
            // Calcular totales para tooltips
            const totalesPorFecha = datos.labels.map((_, index) => {
                return datasetsProcesados.reduce((sum, dataset) => sum + (dataset.data[index] || 0), 0);
            });
            
            // Definir el título del eje X según el tipo
            let tituloEjeX = '';
            switch(tipo) {
                case 'fecha':
                    tituloEjeX = 'Fechas';
                    break;
                case 'mes':
                    tituloEjeX = 'Meses';
                    break;
                case 'anio':
                    tituloEjeX = 'Años';
                    break;
                default:
                    tituloEjeX = 'Período';
            }
            
            chartAmpliadoEdad = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: datos.labels, // Esto debe ser: ['2020', '2021', '2022'] para año
                    datasets: datasetsProcesados
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
                            text: `${getTituloTiempo(tipo)} - Distribución por Edad`,
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
                                    const label = context.dataset.label || '';
                                    const value = context.raw || 0;
                                    const total = totalesPorFecha[context.dataIndex] || 0;
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                },
                                afterLabel: function(context) {
                                    const total = totalesPorFecha[context.dataIndex] || 0;
                                    return `Total: ${total} visitantes`;
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
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    return Math.round(value);
                                }
                            }
                        },
                        x: {
                            grid: { display: false },
                            title: {
                                display: true,
                                text: tituloEjeX, // Aquí se corrige
                                font: { weight: 'bold', size: 14 }
                            },
                            ticks: {
                                maxRotation: tipo === 'fecha' ? 45 : 0,
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
            
            console.log(`✅ Gráfica AGRUPADA ampliada ${tipo} creada exitosamente con labels:`, datos.labels);
            
        } catch (error) {
            console.error(`❌ Error creando gráfica agrupada para ${tipo}:`, error);
            crearGraficaAmpliadaSimple(tipo, datos, 'bar', ctx);
        }
    }

function crearGraficaAmpliadaSimple(tipo, datos, chartType, ctx) {
        try {
            // Calcular valores totales por fecha/mes/año
            const labels = datos.labels || [];
            let values = [];
            let total = 0;
            
            if (datos.datasets && datos.datasets.length > 0) {
                // Sumar todos los datasets
                values = labels.map((_, index) => {
                    return datos.datasets.reduce((sum, dataset) => {
                        return sum + (dataset.data[index] || 0);
                    }, 0);
                });
                total = datos.total || values.reduce((a, b) => a + b, 0);
            } else if (datos.values && datos.values.length > 0) {
                values = datos.values;
                total = datos.total || values.reduce((a, b) => a + b, 0);
            } else {
                values = labels.map(() => 0);
                total = 0;
            }
            
            // Generar colores
            const colors = generarColoresTiempo(tipo, labels.length);
            
            chartAmpliadoEdad = new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Cantidad de Visitantes",
                        data: values,
                        backgroundColor: colors,
                        borderColor: colors.map(color => darkenColor(color, 0.2)),
                        borderWidth: 2,
                        borderRadius: chartType === "bar" ? 8 : 0,
                        barThickness: chartType === "bar" ? 35 : undefined,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: chartType === "bar" ? 'top' : 'right',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: `${getTituloTiempo(tipo)} - Vista Ampliada`,
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
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    scales: chartType === "bar" ? {
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
                                text: getTituloTiempo(tipo).split(' ')[2] || 'Período',
                                font: { weight: 'bold', size: 14 }
                            }
                        }
                    } : {},
                    cutout: chartType === "bar" ? '0%' : '50%'
                },
            });
            
            console.log(`✅ Gráfica SIMPLE ampliada ${tipo} creada exitosamente`);
            
        } catch (error) {
            console.error(`❌ Error creando gráfica simple para ${tipo}:`, error);
        }
    }

function actualizarGraficaModalConDatosAgrupados(tipo, datosFiltrados, tipoGrafica, filtros) {
        const canvas = document.getElementById("chartAmpliadoEdad");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        
        // Destruir gráfica anterior si existe
        if (chartAmpliadoEdad) {
            chartAmpliadoEdad.destroy();
            chartAmpliadoEdad = null;
        }

        // Generar título con información de filtros
        let titulo = getTituloTiempo(tipo);
        if (filtros.fechaInicio && filtros.fechaFin) {
            titulo += ` (${formatearFecha(filtros.fechaInicio)} - ${formatearFecha(filtros.fechaFin)})`;
        }
        if (filtros.rangoEdad && filtros.rangoEdad !== 'todos') {
            titulo += ` - ${filtros.rangoEdad} años`;
        }

        // Actualizar título del modal
        const modalTitle = document.getElementById("modalTitleEdad");
        if (modalTitle) {
            modalTitle.innerHTML = `<i class="fas fa-expand"></i> ${titulo} - Vista Ampliada`;
        }

        // Definir el título del eje X según el tipo
        let tituloEjeX = '';
        switch(tipo) {
            case 'fecha':
                tituloEjeX = 'Fechas';
                break;
            case 'mes':
                tituloEjeX = 'Meses';
                break;
            case 'anio':
                tituloEjeX = 'Años';
                break;
            default:
                tituloEjeX = 'Período';
        }

        // Si tenemos datos en formato AGRUPADO (con datasets)
        if (datosFiltrados.datasets && datosFiltrados.datasets.length > 0) {
            console.log(`📊 Creando gráfica AGRUPADA para modal ${tipo} con ${datosFiltrados.datasets.length} datasets`);
            console.log(`📊 Labels para eje X (${tipo}):`, datosFiltrados.labels);
            
            // Si es gráfica circular, crear gráfica simple con totales
            if (tipoGrafica === "pie" || tipoGrafica === "doughnut") {
                crearGraficaCircularModal(tipo, datosFiltrados, titulo);
            } else {
                // Crear gráfica de barras AGRUPADAS
                chartAmpliadoEdad = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: datosFiltrados.labels || [], // Aquí deben ir los años
                        datasets: datosFiltrados.datasets.map((dataset, index) => {
                            const rango = dataset.label ? dataset.label.replace(' años', '') : '';
                            const colorBase = dataset.backgroundColor || coloresPorEdad[rango] || 
                                            coloresPorEdad[Object.keys(coloresPorEdad)[index % Object.keys(coloresPorEdad).length]];
                            
                            return {
                                label: dataset.label || `Rango ${index + 1}`,
                                data: dataset.data.map(val => val || 0),
                                backgroundColor: colorBase,
                                borderColor: darkenColor(colorBase, 0.2),
                                borderWidth: 2,
                                borderRadius: 6,
                                barThickness: 25,
                                minBarLength: 2
                            };
                        })
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
                                text: titulo,
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
                                        const label = context.dataset.label || '';
                                        const value = context.raw || 0;
                                        const total = datosFiltrados.total || 0;
                                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
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
                                },
                                ticks: {
                                    stepSize: 1,
                                    callback: function(value) {
                                        return Math.round(value);
                                    }
                                }
                            },
                            x: {
                                grid: { display: false },
                                title: {
                                    display: true,
                                    text: tituloEjeX, // CORREGIDO: Usar el título correcto
                                    font: { weight: 'bold', size: 14 }
                                },
                                ticks: {
                                    maxRotation: tipo === 'fecha' ? 45 : 0,
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
            }
        } else {
            // Si no hay datasets, crear gráfica simple
            console.warn(`⚠️ No hay datasets para gráfica agrupada de ${tipo}, creando gráfica simple`);
            
            const colors = generarColoresTiempo(tipo, datosFiltrados.labels?.length || 0);
            const total = datosFiltrados.total || 0;

            chartAmpliadoEdad = new Chart(ctx, {
                type: tipoGrafica === "bar" ? "bar" : "doughnut",
                data: {
                    labels: datosFiltrados.labels || [],
                    datasets: [{
                        label: filtros.rangoEdad === 'todos' ? "Cantidad de Visitantes" : `Visitantes ${filtros.rangoEdad} años`,
                        data: datosFiltrados.values || [],
                        backgroundColor: colors,
                        borderColor: colors.map(color => darkenColor(color, 0.2)),
                        borderWidth: 2,
                        borderRadius: tipoGrafica === "bar" ? 8 : 0,
                        barThickness: tipoGrafica === "bar" ? 35 : undefined,
                    }],
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
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: titulo,
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
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    scales: tipoGrafica === "bar" ? {
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
                                text: tituloEjeX, // CORREGIDO: Usar el título correcto
                                font: { weight: 'bold', size: 14 }
                            }
                        }
                    } : {},
                    cutout: tipoGrafica === "bar" ? '0%' : '50%'
                },
            });
        }

        // Actualizar tabla del modal
        actualizarTablaModalConDatosAgrupados(tipo, datosFiltrados, filtros);
    }

function crearGraficaCircularModal(tipo, datosFiltrados, titulo) {
    const canvas = document.getElementById("chartAmpliadoEdad");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    
    // Destruir gráfica anterior si existe
    if (chartAmpliadoEdad) {
        chartAmpliadoEdad.destroy();
        chartAmpliadoEdad = null;
    }
    
    // Calcular totales por rango de edad para la gráfica circular
    const totalesPorRango = {};
    if (datosFiltrados.datasets && datosFiltrados.datasets.length > 0) {
        datosFiltrados.datasets.forEach(dataset => {
            const total = (dataset.data || []).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            if (total > 0 && dataset.label) {
                totalesPorRango[dataset.label] = total;
            }
        });
    }
    
    // Si no hay datos, crear gráfica vacía
    if (Object.keys(totalesPorRango).length === 0) {
        chartAmpliadoEdad = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    data: [100],
                    backgroundColor: ['#f8f9fa'],
                    borderColor: '#dee2e6',
                    borderWidth: 2
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'No hay datos disponibles',
                        font: { size: 14, weight: 'bold' },
                        color: '#95a5a6'
                    },
                    tooltip: { enabled: false }
                },
                cutout: '60%'
            },
        });
        return;
    }
    
    // Crear gráfica con datos
    const labels = Object.keys(totalesPorRango);
    const data = Object.values(totalesPorRango);
    const totalGeneral = data.reduce((a, b) => a + b, 0);
    
    try {
        chartAmpliadoEdad = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: labels.map(label => {
                        const rango = label.replace(' años', '');
                        return coloresPorEdad[rango] || generarColorAleatorio();
                    }),
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
                            font: { size: 12 }
                        }
                    },
                    title: {
                        display: true,
                        text: titulo,
                        font: { size: 18, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = totalGeneral > 0 ? ((value / totalGeneral) * 100).toFixed(1) : 0;
                                return `${label}: ${value} visitantes (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            },
        });
        
        console.log(`✅ Gráfica circular para modal ${tipo} creada exitosamente`);
        
    } catch (error) {
        console.error(`❌ Error creando gráfica circular para ${tipo}:`, error);
    }
}

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

function ordenarMeses(mesA, mesB) {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const [nombreA, añoA] = mesA.split(' ');
        const [nombreB, añoB] = mesB.split(' ');
        
        if (añoA !== añoB) return parseInt(añoA) - parseInt(añoB);
        return meses.indexOf(nombreA) - meses.indexOf(nombreB);
    }

function generarColoresTiempo(tipo, cantidad) {
        if (!cantidad || cantidad <= 0) {
            console.warn('⚠️ Cantidad inválida para generar colores:', cantidad);
            return ['#3498db']; // Color por defecto
        }
        
        const palette = coloresPorTiempo[tipo] || coloresPorTiempo.fecha || ['#3498db', '#e74c3c', '#2ecc71'];
        
        if (!palette || palette.length === 0) {
            console.warn('⚠️ Paleta de colores vacía para tipo:', tipo);
            // Generar colores básicos
            const coloresBase = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
            palette = coloresBase;
        }
        
        const colors = [];
        for(let i = 0; i < cantidad; i++) {
            colors.push(palette[i % palette.length]);
        }
        return colors;
    }
