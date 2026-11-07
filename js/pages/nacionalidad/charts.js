// NacionalidadSystem - charts
// Refactor modular: lógica original preservada.

function ordenarMeses(mesA, mesB) {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const [nombreA, añoA] = mesA.split(' ');
        const [nombreB, añoB] = mesB.split(' ');
        
        if (añoA !== añoB) return parseInt(añoA) - parseInt(añoB);
        return meses.indexOf(nombreA) - meses.indexOf(nombreB);
    }

function generarColoresNacionalidad(cantidad) {
        const colors = [];
        for(let i = 0; i < cantidad; i++) {
            colors.push(coloresNacionalidades[i % coloresNacionalidades.length]);
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

    // Mostrar gráficas de nacionalidades
    function mostrarGraficasNacionalidad() {
        const { labels, values } = datosNacionalidades;
        const colors = generarColoresNacionalidad(labels.length);
        
        // Gráfica de barras
        const ctxBar = document.getElementById("chartBarNacionalidad");
        if (chartBarNacionalidad) chartBarNacionalidad.destroy();
        
        chartBarNacionalidad = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Cantidad de Visitantes",
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 8,
                    barThickness: 50,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Distribución por Nacionalidad',
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
                        title: { display: true, text: 'Nacionalidad' }
                    }
                }
            },
        });

        // Gráfica circular
        const ctxPie = document.getElementById("chartPieNacionalidad");
        if (chartPieNacionalidad) chartPieNacionalidad.destroy();
        
        chartPieNacionalidad = new Chart(ctxPie, {
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
                    }
                },
                cutout: '50%'
            },
        });
    }

// Mostrar gráficas para tiempo con datos específicos
    function mostrarGraficasTiempoConDatos(tipo, datos) {
        console.log('🔍 DEBUG mostrarGraficasTiempoConDatos:', {
            tipo: tipo,
            datosRecibidos: datos,
            tieneLabels: datos?.labels?.length || 0,
            tieneDatasets: datos?.datasets?.length || 0,
            datasets: datos?.datasets?.map(d => ({
                label: d.label,
                dataLength: d.data?.length || 0,
                firstValue: d.data?.[0] || 0
            }))
        });
    
        // Gráfica de barras apiladas|
        const ctxBar = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Bar`);
        if (chartFechaBar) chartFechaBar.destroy();
        if (chartMesBar) chartMesBar.destroy();
        if (chartAnioBar) chartAnioBar.destroy();
        
        // Gráfica de barras AGRUPADAS
        const chartBar = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: datos.labels || [],
                datasets: (datos.datasets || []).map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.data.map(val => val || 0),
                    backgroundColor: dataset.backgroundColor || coloresNacionalidades[index % coloresNacionalidades.length],
                    borderColor: dataset.borderColor || darkenColor(dataset.backgroundColor || coloresNacionalidades[index % coloresNacionalidades.length], 0.2),
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 25
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
                        text: `${getTituloTiempo(tipo)} - Barras Agrupadas`,
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
                        title: { display: true, text: getTituloTiempo(tipo).split(' ')[1] },
                        stacked: false
                    }
                }
            }
        });

        // Gráfica circular por período (solo el más reciente)
        const ctxPie = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Pie`);
        if (chartFechaPie) chartFechaPie.destroy();
        if (chartMesPie) chartMesPie.destroy();
        if (chartAnioPie) chartAnioPie.destroy();

        // Calcular totales por país para el gráfico circular
        const totalesPorPais = {};
        if (datos.datasets && datos.datasets.length > 0) {
            datos.datasets.forEach(dataset => {
                const total = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                if (total > 0) {
                    totalesPorPais[dataset.label] = total;
                }
            });
        }

        // Si no hay datos, mostrar gráfico vacío
        if (Object.keys(totalesPorPais).length === 0) {
            const chartPie = new Chart(ctxPie, {
                type: "doughnut",
                data: {
                    labels: ['Sin datos'],
                    datasets: [{
                        data: [100],
                        backgroundColor: ['#95a5a6']
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'No hay datos disponibles',
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                },
            });
            
            // Guardar referencia según tipo
            switch(tipo) {
                case 'fecha': chartFechaPie = chartPie; break;
                case 'mes': chartMesPie = chartPie; break;
                case 'anio': chartAnioPie = chartPie; break;
            }
            return;
        }

        // Crear gráfico circular con los totales
        const labels = Object.keys(totalesPorPais);
        const data = Object.values(totalesPorPais);

        const chartPie = new Chart(ctxPie, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: labels.map((label, index) => 
                        coloresNacionalidades[index % coloresNacionalidades.length]
                    ),
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
                        text: 'Distribución por Nacionalidad - Total',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} visitantes (${percentage}%)`;
                            }
                        }
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

// Función para cambiar tipo de gráfica en modal
    function cambiarTipoGraficaModal(tipoGrafica, tipo) {
        tipo = tipo || determinarTipoActual();
        if (tipo === 'nacionalidad') {
            crearGraficaAmpliadaNacionalidad(tipoGrafica);
        } else {
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
        }
    }

// Función para crear gráfica con datos filtrados de nacionalidad (VERSIÓN SIMPLIFICADA)
    function crearGraficaAmpliadaNacionalidadConDatos(datosFiltrados, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoNacionalidad");
        if (!ctx) return;

        if (chartAmpliadoNacionalidad) {
            chartAmpliadoNacionalidad.destroy();
        }

        const colors = generarColoresNacionalidad(datosFiltrados.labels.length);
        const tipoChart = tipoGrafica;

        chartAmpliadoNacionalidad = new Chart(ctx, {
            type: tipoChart,
            data: {
                labels: datosFiltrados.labels,
                datasets: [{
                    label: "Cantidad de Visitantes",
                    data: datosFiltrados.values,
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
                        text: datosFiltrados.labels.length === 1 ? 
                            `Visitantes de ${datosFiltrados.labels[0]}` : 
                            'Distribución por Nacionalidad (Filtrado)',
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
                                const percentage = Math.round((value / datosFiltrados.total) * 100);
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
                            text: 'Nacionalidad',
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

// Crear gráfica ampliada de nacionalidad
    function crearGraficaAmpliadaNacionalidad(tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoNacionalidad");
        if (!ctx) return;

        // Destruir gráfica anterior si existe
        if (chartAmpliadoNacionalidad) {
            chartAmpliadoNacionalidad.destroy();
        }

        const { labels, values, total } = datosNacionalidades;
        const colors = generarColoresNacionalidad(labels.length);
        const tipoChart = tipoGrafica;

        chartAmpliadoNacionalidad = new Chart(ctx, {
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
                        text: 'Distribución por Nacionalidad - Vista Ampliada',
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
                            text: 'Nacionalidad',
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

// Crear gráfica ampliada de tiempo - VERSIÓN CORREGIDA
    function crearGraficaAmpliadaTiempo(tipo, tipoGrafica, datosFiltrados = null) {
        const canvas = document.getElementById("chartAmpliadoNacionalidad");
        if (!canvas) {
            console.error('❌ Canvas no encontrado!');
            return;
        }
        
        const ctx = canvas.getContext('2d');

        // Destruir gráfica anterior si existe
        if (chartAmpliadoNacionalidad) {
            chartAmpliadoNacionalidad.destroy();
        }

        // ✅ CORRECCIÓN: Usar datos filtrados si se proporcionan, SINO datos originales
        let datos;
        if (datosFiltrados) {
            datos = datosFiltrados;
            console.log('✅ Usando datos filtrados en modal');
        } else {
            datos = getDatosTiempo(tipo);
            console.log('✅ Usando datos originales en modal');
        }

        // DEBUG: Ver qué datos estamos recibiendo
        console.log('🔍 Datos para modal de', tipo, ':', datos);
        console.log('¿Usando datos filtrados?', !!datosFiltrados);
        console.log('¿Tenemos datasets?', datos?.datasets?.length || 0);
        console.log('¿Tenemos labels?', datos?.labels?.length || 0);

        // Verificar si tenemos datos en el nuevo formato
        if (!datos || !datos.datasets || datos.datasets.length === 0) {
            console.log('⚠️ No hay datos para el modal');
            // Mostrar gráfica vacía con mensaje
            chartAmpliadoNacionalidad = new Chart(ctx, {
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
                            text: 'No hay datos disponibles',
                            font: { size: 16, weight: 'bold' }
                        }
                    }
                }
            });
            return;
        }

        const tipoChart = tipoGrafica;

        if (tipoChart === 'bar') {
            // Verificar que tenemos datos
            if (!datos.datasets || datos.datasets.length === 0) {
                console.log('⚠️ No hay datasets para el gráfico de barras');
                return;
            }
            
            console.log('📊 Creando gráfico de barras con', datos.datasets.length, 'datasets');
            console.log('📅 Labels:', datos.labels);
            
            chartAmpliadoNacionalidad = new Chart(ctx, {
                type: tipoChart,
                data: {
                    labels: datos.labels,
                    datasets: datos.datasets.map((dataset, index) => ({
                        label: dataset.label,
                        data: dataset.data.map(val => val || 0),
                        backgroundColor: dataset.backgroundColor || coloresNacionalidades[index % coloresNacionalidades.length],
                        borderColor: darkenColor(dataset.backgroundColor || coloresNacionalidades[index % coloresNacionalidades.length], 0.2),
                        borderWidth: 1,
                        borderRadius: 6,
                        barThickness: 25
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
                            text: `${getTituloTiempo(tipo)} - Vista Ampliada ${datosFiltrados ? '(Filtrado)' : ''}`,
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
                                    return `${label}: ${value} visitantes`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: false,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            title: {
                                display: true,
                                text: 'Cantidad de Visitantes',
                                font: { weight: 'bold', size: 14 }
                            }
                        },
                        x: {
                            stacked: false,
                            grid: { display: false },
                            title: {
                                display: true,
                                text: getTituloTiempo(tipo).split(' ')[2] || 'Período',
                                font: { weight: 'bold', size: 14 }
                            },
                            ticks: {
                                maxRotation: tipo === 'fecha' ? 45 : 0,
                                minRotation: 0
                            }
                        }
                    }
                }
            });
        } else if (tipoChart === 'doughnut' || tipoChart === 'pie') {
            // Calcular totales por país
            const totalesPorPais = {};
            datos.datasets.forEach(dataset => {
                const total = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                if (total > 0) {
                    totalesPorPais[dataset.label] = total;
                }
            });
            
            const labels = Object.keys(totalesPorPais);
            const data = Object.values(totalesPorPais);

            chartAmpliadoNacionalidad = new Chart(ctx, {
                type: tipoChart,
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: labels.map((label, index) => 
                            coloresNacionalidades[index % coloresNacionalidades.length]
                        ),
                        borderColor: '#fff',
                        borderWidth: 2,
                    }],
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
                            text: `${getTituloTiempo(tipo)} - Distribución por Nacionalidad ${datosFiltrados ? '(Filtrado)' : ''}`,
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
                                    const value = context.raw || 0;
                                    const total = data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: tipoChart === 'doughnut' ? '50%' : '0%'
                }
            });
        }
    }
