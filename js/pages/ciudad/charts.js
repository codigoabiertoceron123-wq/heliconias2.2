// CiudadSystem - charts
// Refactor modular: lógica original preservada.

// Función para mostrar gráficas de ciudad
    function mostrarGraficasCiudad() {
        const { labels, values, colors } = datosCiudades.general;
        
        // Destruir gráficas anteriores si existen
        if (chartInstances.bar) {
            chartInstances.bar.destroy();
        }
        if (chartInstances.pie) {
            chartInstances.pie.destroy();
        }
        
        // Gráfica de barras
        const ctxBar = document.getElementById("chartBarCiudad");
        if (ctxBar) {
            chartInstances.bar = new Chart(ctxBar, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Cantidad de Visitantes",
                        data: values,
                        backgroundColor: colors,
                        borderColor: colors.map(color => darkenColor(color, 0.2)),
                        borderWidth: 2,
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
                            text: 'Distribución por Ciudad - Top ' + labels.length,
                            font: { size: 16, weight: 'bold' }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed.y;
                                    const total = values.reduce((a, b) => a + b, 0);
                                    const porcentaje = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} visitantes (${porcentaje}%)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Cantidad de Visitantes' },
                            ticks: { stepSize: 1 }
                        },
                        x: {
                            title: { display: true, text: 'Ciudad' }
                        }
                    }
                },
            });
        }

        // Gráfica circular
        const ctxPie = document.getElementById("chartPieCiudad");
        if (ctxPie) {
            chartInstances.pie = new Chart(ctxPie, {
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
                                font: { size: 12 }
                            }
                        }
                    },
                    cutout: '60%'
                },
            });
        }
    }

// FUNCIÓN PRINCIPAL CAMBIADA: Ahora usa gráficos de barras agrupadas
    function mostrarGraficaCiudadTiempo(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        const ctx = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Ciudad`);
        
        if (!ctx || !datos.labels || datos.labels.length === 0) return;
        
        // Destruir gráfica anterior si existe
        if (chartInstances[tipo]) {
            chartInstances[tipo].destroy();
        }
        
        // Ordenar datasets por total (mayor a menor) para mejor visualización
        const datasetsOrdenados = [...datos.datasets]
            .sort((a, b) => {
                const totalA = a.data.reduce((sum, val) => sum + val, 0);
                const totalB = b.data.reduce((sum, val) => sum + val, 0);
                return totalB - totalA;
            })
            .slice(0, 8); // Mostrar solo las 8 ciudades principales para mejor visualización
        
        chartInstances[tipo] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.labels,
                datasets: datasetsOrdenados
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: getTituloTiempo(tipo) + ` (${datos.total} visitantes)`,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 12 },
                        bodyFont: { size: 12 },
                        padding: 10,
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
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Cantidad de Visitantes'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: tipo === 'fecha' ? 45 : 0,
                            font: {
                                size: tipo === 'fecha' ? 10 : 12
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

function obtenerColorParaCiudad(nombreCiudad) {
        if (!nombreCiudad) return '#95a5a6';
        
        // Primero verificar si ya tenemos un color asignado
        if (mapaColoresCiudades[nombreCiudad]) {
            return mapaColoresCiudades[nombreCiudad];
        }
        
        // Si no, asignar uno nuevo
        const ciudadLower = nombreCiudad.toLowerCase();
        
        // Colores predefinidos para ciudades principales
        if (ciudadLower.includes('bogotá') || ciudadLower.includes('bogota')) {
            return '#e74c3c'; // Rojo
        } else if (ciudadLower.includes('medellín') || ciudadLower.includes('medellin')) {
            return '#3498db'; // Azul
        } else if (ciudadLower.includes('cali')) {
            return '#f39c12'; // Naranja
        } else if (ciudadLower.includes('barranquilla')) {
            return '#2ecc71'; // Verde
        } else if (ciudadLower.includes('cartagena')) {
            return '#9b59b6'; // Púrpura
        } else if (ciudadLower.includes('bucaramanga')) {
            return '#1abc9c'; // Turquesa
        }
        
        // Para otras ciudades, generar color único basado en el nombre
        let hash = 0;
        for (let i = 0; i < nombreCiudad.length; i++) {
            hash = nombreCiudad.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Usar el hash para generar un color HSL
        const hue = Math.abs(hash % 360);
        const saturation = 70;
        const lightness = 60;
        
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // Guardar en el mapa para consistencia
        mapaColoresCiudades[nombreCiudad] = color;
        
        return color;
    }

function ordenarFechas(fechas, tipo) {
        return fechas.sort((a, b) => {
            switch(tipo) {
                case 'fecha':
                    return new Date(a) - new Date(b);
                case 'mes':
                    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const [mesA, añoA] = a.split(' ');
                    const [mesB, añoB] = b.split(' ');
                    
                    if (añoA !== añoB) {
                        return parseInt(añoA) - parseInt(añoB);
                    }
                    return meses.indexOf(mesA) - meses.indexOf(mesB);
                case 'anio':
                    return parseInt(a) - parseInt(b);
                default:
                    return 0;
            }
        });
    }

// Crear gráfica ampliada de tiempo
    function crearGraficaAmpliadaCiudadTiempo(tipo, tipoGrafica, datosFiltrados = null) {
        const canvas = document.getElementById("chartAmpliadoCiudad");
        if (!canvas) {
            console.error('❌ Canvas no encontrado!');
            return;
        }
        
        const ctx = canvas.getContext('2d');

        // Destruir gráfica anterior si existe
        if (chartAmpliadoCiudad) {
            chartAmpliadoCiudad.destroy();
        }

        // Usar datos filtrados si se proporcionan, SINO datos originales
        let datos;
        if (datosFiltrados) {
            datos = datosFiltrados;
            console.log('✅ Usando datos filtrados en modal');
        } else {
            datos = getDatosCiudadTiempo(tipo);
            console.log('✅ Usando datos originales en modal');
        }

        // Verificar si tenemos datos
        if (!datos || !datos.datasets || datos.datasets.length === 0) {
            console.log('⚠️ No hay datos para el modal');
            // Mostrar gráfica vacía con mensaje
            chartAmpliadoCiudad = new Chart(ctx, {
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
            
            console.log('📊 Creando gráfico de barras AGRUPADAS con', datos.datasets.length, 'datasets');
            
            // Limitar a las 8 ciudades principales para mejor visualización
            const datasetsLimitados = datos.datasets.slice(0, 8);
            
            chartAmpliadoCiudad = new Chart(ctx, {
                type: tipoChart,
                data: {
                    labels: datos.labels,
                    datasets: datasetsLimitados
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
            // Calcular totales por ciudad
            const totalesPorCiudad = {};
            datos.datasets.forEach(dataset => {
                const total = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                if (total > 0) {
                    totalesPorCiudad[dataset.label] = total;
                }
            });
            
            const labels = Object.keys(totalesPorCiudad);
            const data = Object.values(totalesPorCiudad);

            chartAmpliadoCiudad = new Chart(ctx, {
                type: tipoChart,
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: labels.map((label, index) => 
                            obtenerColorParaCiudad(label)
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
                            text: `${getTituloTiempo(tipo)} - Distribución por Ciudad ${datosFiltrados ? '(Filtrado)' : ''}`,
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

// Crear gráfica ampliada de ciudad con datos filtrados
    function crearGraficaAmpliadaCiudadConDatos(datosFiltrados, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoCiudad");
        if (!ctx) return;

        if (chartAmpliadoCiudad) {
            chartAmpliadoCiudad.destroy();
        }

        const tipoChart = tipoGrafica;

        chartAmpliadoCiudad = new Chart(ctx, {
            type: tipoChart,
            data: {
                labels: datosFiltrados.labels,
                datasets: [{
                    label: "Cantidad de Visitantes",
                    data: datosFiltrados.values,
                    backgroundColor: datosFiltrados.colors,
                    borderColor: tipoChart === "bar" ? 'transparent' : datosFiltrados.colors.map(color => darkenColor(color, 0.2)),
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
                            'Distribución por Ciudad (Filtrado)',
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
                            text: 'Ciudad',
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

// Crear gráfica ampliada de ciudad
    function crearGraficaAmpliadaCiudad(tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoCiudad");
        if (!ctx) return;

        // Destruir gráfica anterior si existe
        if (chartAmpliadoCiudad) {
            chartAmpliadoCiudad.destroy();
        }

        const { labels, values, colors, total } = datosCiudades.general;
        const tipoChart = tipoGrafica;

        chartAmpliadoCiudad = new Chart(ctx, {
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
                        text: 'Distribución por Ciudad - Vista Ampliada',
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
                            text: 'Ciudad',
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

// FUNCIÓN CAMBIADA: Ahora usa gráfico de barras en el modal
    function inicializarGraficoModal(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        const ctx = document.getElementById('chartModalDetalle');
        
        if (!ctx || !datos.labels || datos.labels.length === 0) return;
        
        // Destruir gráfico anterior si existe
        if (chartInstances.ampliado) {
            chartInstances.ampliado.destroy();
        }
        
        // Ordenar datasets por total y tomar solo las principales
        const datasetsPrincipales = [...datos.datasets]
            .sort((a, b) => {
                const totalA = a.data.reduce((sum, val) => sum + val, 0);
                const totalB = b.data.reduce((sum, val) => sum + val, 0);
                return totalB - totalA;
            })
            .slice(0, 6); // Solo las 6 ciudades principales
        
        chartInstances.ampliado = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.labels,
                datasets: datasetsPrincipales.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: dataset.backgroundColor,
                    borderColor: dataset.borderColor,
                    borderWidth: 1,
                    borderRadius: 4,
                    barThickness: 25,
                    categoryPercentage: 0.8,
                    barPercentage: 0.9
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución Temporal por Ciudad',
                        font: { size: 18, weight: 'bold' }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            font: { size: 12 },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 6,
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
                        title: {
                            display: true,
                            text: 'Visitantes',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
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
