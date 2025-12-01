// js/ciudad.js - Sistema de Estadísticas por Ciudad - CON GRÁFICOS DE BARRAS
(function() {
    'use strict';
    
    // Variables del sistema
    let chartBarCiudad, chartPieCiudad, chartAmpliadoCiudad;
    let datosCiudades = {};
    let datosFechaCiudad = {};
    let datosMesCiudad = {};
    let datosAnioCiudad = {};
    let todasLasCiudades = [];
    
    // Objetos para almacenar instancias de gráficos por tipo
    const chartInstances = {
        fecha: null,
        mes: null,
        anio: null,
        bar: null,
        pie: null,
        ampliado: null
    };
    
    // PALETA DE COLORES MEJORADA - UN COLOR POR CIUDAD
    const coloresBase = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', 
        '#34495e', '#e67e22', '#27ae60', '#8e44ad', '#16a085', '#c0392b',
        '#2980b9', '#d35400', '#7f8c8d', '#f1c40f', '#95a5a6', '#d35400'
    ];
    
    // Mapa para mantener colores consistentes por ciudad
    let mapaColoresCiudades = {};

    // Paleta para gráficos de tiempo
    const coloresPorTiempo = {
        fecha: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'],
        mes: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#d35400', '#27ae60', '#8e44ad', '#16a085', '#c0392b', '#2980b9'],
        anio: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c']
    };

    // =============================================
    // FUNCIONES PRINCIPALES DEL SISTEMA DE CIUDAD
    // =============================================

    // Función principal para cargar datos de ciudad
    async function cargarDatosCiudad() {
        try {
            console.log('🚀 Iniciando carga de datos de ciudad...');
            mostrarLoading('Cargando datos de ciudades...');

            // Obtener todos los participantes con ciudad
            const { data: participantes, error: errorParticipantes } = await supabase
                .from('participantes_reserva')
                .select('id_ciudad, fecha_visita')
                .not('id_ciudad', 'is', null);

            if (errorParticipantes) {
                console.error('Error al obtener participantes:', errorParticipantes);
                mostrarErrorCiudad();
                return;
            }

            console.log('Participantes con ciudades:', participantes);

            if (!participantes || participantes.length === 0) {
                mostrarSinDatosCiudad();
                return;
            }

            // Obtener IDs de ciudades únicos
            const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
            console.log('IDs de ciudades únicos:', idsCiudadesUnicos);

            // Obtener información de ciudades
            const { data: ciudades, error: errorCiudades } = await supabase
                .from('ciudades')
                .select('id, nombre')
                .in('id', idsCiudadesUnicos);

            if (errorCiudades) {
                console.error('Error al obtener ciudades:', errorCiudades);
                mostrarErrorCiudad();
                return;
            }

            console.log('Ciudades obtenidas:', ciudades);

            // Guardar todas las ciudades para el buscador
            todasLasCiudades = ciudades.map(c => c.nombre).sort();

            // Procesar datos de ciudades
            procesarDatosCiudad(participantes, ciudades);
            mostrarInterfazCiudad();

            cerrarLoading();
            
        } catch (error) {
            console.error('Error en cargarDatosCiudad:', error);
            cerrarLoading();
            mostrarErrorCiudad();
        }
    }

    // Función para procesar datos de ciudad
    function procesarDatosCiudad(participantes, ciudades) {
        // Inicializar mapa de colores
        mapaColoresCiudades = {};
        
        // Conteo general por ciudad - ahora dinámico
        const conteoGeneral = {};
        let totalConCiudad = 0;
        let sinCiudad = 0;

        // Mapeo de IDs de ciudad a nombres
        const mapaCiudades = {};
        ciudades.forEach(ciudad => {
            mapaCiudades[ciudad.id] = ciudad.nombre;
            
            // Asignar color único a cada ciudad
            if (!mapaColoresCiudades[ciudad.nombre]) {
                // Usar color predefinido para ciudades principales
                const ciudadLower = ciudad.nombre.toLowerCase();
                if (ciudadLower.includes('bogotá') || ciudadLower.includes('bogota')) {
                    mapaColoresCiudades[ciudad.nombre] = '#e74c3c'; // Rojo
                } else if (ciudadLower.includes('medellín') || ciudadLower.includes('medellin')) {
                    mapaColoresCiudades[ciudad.nombre] = '#3498db'; // Azul
                } else if (ciudadLower.includes('cali')) {
                    mapaColoresCiudades[ciudad.nombre] = '#f39c12'; // Naranja
                } else if (ciudadLower.includes('barranquilla')) {
                    mapaColoresCiudades[ciudad.nombre] = '#2ecc71'; // Verde
                } else if (ciudadLower.includes('cartagena')) {
                    mapaColoresCiudades[ciudad.nombre] = '#9b59b6'; // Púrpura
                } else if (ciudadLower.includes('bucaramanga')) {
                    mapaColoresCiudades[ciudad.nombre] = '#1abc9c'; // Turquesa
                } else {
                    // Para otras ciudades, asignar color único
                    const index = Object.keys(mapaColoresCiudades).length % coloresBase.length;
                    mapaColoresCiudades[ciudad.nombre] = coloresBase[index];
                }
            }
        });

        // Contar participantes por ciudad
        participantes.forEach(participante => {
            if (participante.id_ciudad) {
                const nombreCiudad = mapaCiudades[participante.id_ciudad];
                if (nombreCiudad) {
                    // Contar por nombre exacto de ciudad
                    conteoGeneral[nombreCiudad] = (conteoGeneral[nombreCiudad] || 0) + 1;
                    totalConCiudad++;
                } else {
                    sinCiudad++;
                }
            } else {
                sinCiudad++;
            }
        });

        // Ordenar ciudades por cantidad (de mayor a menor)
        const conteoOrdenado = Object.entries(conteoGeneral)
            .sort((a, b) => b[1] - a[1]);

        // Separar en grupos para mejor visualización
        const ciudadesPrincipales = [];
        const otrasCiudades = [];
        
        conteoOrdenado.forEach(([ciudad, cantidad], index) => {
            if (index < 8) { // Top 8 ciudades principales
                ciudadesPrincipales.push({ ciudad, cantidad });
            } else {
                otrasCiudades.push({ ciudad, cantidad });
            }
        });

        // Si hay muchas "otras ciudades", agruparlas
        let otrasCiudadesTotal = 0;
        if (otrasCiudades.length > 0) {
            otrasCiudadesTotal = otrasCiudades.reduce((sum, item) => sum + item.cantidad, 0);
        }

        // Preparar datos finales para gráficos
        const labelsGrafico = [];
        const valuesGrafico = [];
        const coloresGrafico = [];
        
        // Agregar ciudades principales
        ciudadesPrincipales.forEach(item => {
            labelsGrafico.push(item.ciudad);
            valuesGrafico.push(item.cantidad);
            coloresGrafico.push(mapaColoresCiudades[item.ciudad] || '#95a5a6');
        });
        
        // Agregar "Otras" si hay
        if (otrasCiudadesTotal > 0) {
            labelsGrafico.push('Otras ciudades');
            valuesGrafico.push(otrasCiudadesTotal);
            coloresGrafico.push('#7f8c8d');
        }

        // Calcular estadísticas
        const totalParticipantes = totalConCiudad + sinCiudad;
        const totalCiudadesUnicas = Object.keys(conteoGeneral).length;

        // Guardar datos procesados
        datosCiudades = {
            general: {
                labels: labelsGrafico,
                values: valuesGrafico,
                colors: coloresGrafico,
                total: totalConCiudad
            },
            detallado: {
                todasLasCiudades: conteoOrdenado,
                ciudadesPrincipales: ciudadesPrincipales,
                otrasCiudades: otrasCiudades,
                totalOtras: otrasCiudadesTotal
            },
            estadisticas: {
                totalParticipantes: totalParticipantes,
                totalConCiudad: totalConCiudad,
                totalSinCiudad: sinCiudad,
                totalCiudadesUnicas: totalCiudadesUnicas,
                porcentajeConCiudad: totalParticipantes > 0 ? 
                    Math.round((totalConCiudad / totalParticipantes) * 100) : 0
            },
            rawData: participantes,
            ciudadesMapa: mapaCiudades,
            coloresMapa: mapaColoresCiudades
        };

        console.log('✅ Datos procesados:', datosCiudades);
        
        // Actualizar estadísticas en la UI
        actualizarEstadisticas();
    }

    // Función para actualizar estadísticas en la UI
    function actualizarEstadisticas() {
        const stats = datosCiudades.estadisticas;
        
        // Actualizar tarjetas de estadísticas
        if (document.getElementById('total-visitantes')) {
            document.getElementById('total-visitantes').textContent = 
                stats.totalParticipantes.toLocaleString();
        }
        
        if (document.getElementById('visitantes-con-ciudad')) {
            document.getElementById('visitantes-con-ciudad').textContent = 
                stats.totalConCiudad.toLocaleString();
        }
        
        if (document.getElementById('total-ciudades')) {
            document.getElementById('total-ciudades').textContent = 
                stats.totalCiudadesUnicas.toLocaleString();
        }
    }

    // Función para mostrar interfaz de ciudad
    function mostrarInterfazCiudad() {
        const container = document.getElementById('data-container');
        const stats = datosCiudades.estadisticas;
        
        container.innerHTML = `
            <div class="chart-controls">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-city"></i> Distribución por Ciudad
                        <span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                            ${stats.totalConCiudad} visitantes de ${stats.totalCiudadesUnicas} ciudades
                        </span>
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="download-btn" onclick="window.CiudadSystem.descargarGraficoPrincipal()">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card" onclick="window.CiudadSystem.abrirModal('bar')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> Distribución por Ciudad - Barras
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartBarCiudad"></canvas>
                    </div>
                </div>

                <div class="chart-card" onclick="window.CiudadSystem.abrirModal('pie')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> Distribución por Ciudad - Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap pie-chart-container">
                        <canvas id="chartPieCiudad"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por Ciudad
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="download-btn" onclick="window.CiudadSystem.descargarExcel()">
                            <i class="fas fa-file-excel"></i> Exportar Excel
                        </button>
                        <button class="btn" onclick="window.CiudadSystem.mostrarTodasLasCiudades()" style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white;">
                            <i class="fas fa-list"></i> Ver todas las ciudades
                        </button>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 700px;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th style="min-width: 150px;">Ciudad</th>
                                <th style="width: 120px;">Total Visitantes</th>
                                <th style="width: 100px;">Porcentaje</th>
                                <th style="min-width: 150px;">Descripción</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-ciudad-body">
                            ${generarFilasTablaCiudad()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        mostrarGraficasCiudad();
    }

    // Función para generar filas de tabla de ciudad
    function generarFilasTablaCiudad() {
        const { labels, values, total } = datosCiudades.general;
        const colores = datosCiudades.general.colors;
        
        return labels.map((ciudad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const descripcion = obtenerDescripcionCiudad(ciudad);
            const color = colores[index];
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td>
                        <span class="ciudad-badge" style="background: ${color}; color: white; padding: 4px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fas fa-city"></i> ${ciudad}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: #2e7d32">${porcentaje}%</td>
                    <td style="color: #7f8c8d; font-size: 0.9rem">${descripcion}</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td></td>
            </tr>
        ` : '');
    }

    // Función para obtener descripción de ciudad
    function obtenerDescripcionCiudad(ciudad) {
        const ciudadLower = ciudad.toLowerCase();
        if (ciudadLower.includes('bogotá') || ciudadLower.includes('bogota')) {
            return 'Capital de Colombia';
        } else if (ciudadLower.includes('medellín') || ciudadLower.includes('medellin')) {
            return 'Ciudad de la eterna primavera';
        } else if (ciudadLower.includes('cali')) {
            return 'Capital mundial de la salsa';
        } else if (ciudadLower === 'otras ciudades') {
            return `${datosCiudades.detallado.otrasCiudades.length} ciudades adicionales`;
        } else {
            return 'Ciudad de Colombia';
        }
    }

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

    // =============================================
    // FUNCIONES PARA CIUDAD POR TIEMPO - CON BARRAS
    // =============================================

    async function cargarDatosCiudadTiempo(tipo) {
        try {
            mostrarLoading(`Cargando datos por ${tipo}...`);
            
            // Obtener participantes con ciudad y fecha
            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('id_ciudad, fecha_visita')
                .not('id_ciudad', 'is', null)
                .not('fecha_visita', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                await procesarDatosCiudadTiempo(participantes, tipo);
                mostrarInterfazCiudadTiempo(tipo);
            } else {
                mostrarSinDatosTiempo(tipo);
            }

            cerrarLoading();
            
        } catch (error) {
            console.error(`Error cargando datos de ${tipo}:`, error);
            cerrarLoading();
            mostrarErrorCiudad(`Error al cargar datos de ${tipo}: ` + error.message);
        }
    }

    async function procesarDatosCiudadTiempo(participantes, tipo) {
        // Obtener información de ciudades
        const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
        
        const { data: ciudades, error } = await supabase
            .from('ciudades')
            .select('id, nombre')
            .in('id', idsCiudadesUnicos);

        if (error) throw error;

        const mapaCiudades = {};
        ciudades.forEach(ciudad => {
            mapaCiudades[ciudad.id] = ciudad.nombre;
        });

        const conteo = {};
        const todasLasFechas = [];
        
        // Agrupar por período de tiempo
        participantes.forEach(participante => {
            if (participante.fecha_visita) {
                const fecha = new Date(participante.fecha_visita);
                let clave = '';
                
                switch(tipo) {
                    case 'fecha':
                        clave = fecha.toISOString().split('T')[0];
                        break;
                    case 'mes':
                        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        clave = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                        break;
                    case 'anio':
                        clave = fecha.getFullYear().toString();
                        break;
                }
                
                // Agregar a todas las fechas para ordenamiento
                if (!todasLasFechas.includes(clave)) {
                    todasLasFechas.push(clave);
                }
                
                if (!conteo[clave]) {
                    conteo[clave] = {};
                }
                
                // Obtener nombre de ciudad
                const nombreCiudad = mapaCiudades[participante.id_ciudad] || 'Desconocida';
                
                // Contar por ciudad
                if (!conteo[clave][nombreCiudad]) {
                    conteo[clave][nombreCiudad] = 0;
                }
                conteo[clave][nombreCiudad]++;
            }
        });

        // Ordenar fechas
        let labels = ordenarFechas(todasLasFechas, tipo);

        // Obtener todas las ciudades únicas para las series
        const todasCiudadesUnicas = new Set();
        Object.values(conteo).forEach(periodo => {
            Object.keys(periodo).forEach(ciudad => {
                todasCiudadesUnicas.add(ciudad);
            });
        });

        // Convertir a array y ordenar alfabéticamente
        const ciudadesArray = Array.from(todasCiudadesUnicas).sort();

        // Preparar datasets - ahora para gráficos de barras agrupadas
        const datasets = ciudadesArray.map(ciudad => {
            // Determinar color basado en la ciudad
            const color = obtenerColorParaCiudad(ciudad);
            
            return {
                label: ciudad,
                data: labels.map(label => conteo[label] ? (conteo[label][ciudad] || 0) : 0),
                backgroundColor: color + 'CC', // Agregar transparencia
                borderColor: color,
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
                categoryPercentage: 0.8,
                barPercentage: 0.9
            };
        });

        const datosTiempo = {
            labels: labels,
            datasets: datasets,
            ciudades: ciudadesArray,
            total: participantes.length,
            conteo: conteo
        };

        // Guardar datos
        switch(tipo) {
            case 'fecha': datosFechaCiudad = datosTiempo; break;
            case 'mes': datosMesCiudad = datosTiempo; break;
            case 'anio': datosAnioCiudad = datosTiempo; break;
        }

        console.log(`✅ Datos ${tipo} procesados:`, datosTiempo);
    }

    // =============================================
    // FUNCIONES PARA RANGOS DE FECHA
    // =============================================

    async function aplicarRangoFechas(tipo) {
        let fechaInicio = document.getElementById(`filtro-${tipo}-inicio`)?.value;
        let fechaFin = document.getElementById(`filtro-${tipo}-fin`)?.value;
        
        if (!fechaInicio || !fechaFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Fechas requeridas',
                text: 'Por favor selecciona ambas fechas para el rango'
            });
            return;
        }
        
        // CORRECCIÓN: Formatear fechas correctamente según el tipo
        if (tipo === 'anio') {
            // Para año, las fechas ya son solo números
            if (parseInt(fechaInicio) > parseInt(fechaFin)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fechas inválidas',
                    text: 'El año inicial no puede ser mayor que el año final'
                });
                return;
            }
            // Formatear para consulta SQL
            fechaInicio = `${fechaInicio}-01-01`;
            fechaFin = `${fechaFin}-12-31`;
        } else if (tipo === 'mes') {
            // Para mes, necesitamos convertir a formato de fecha
            const meses = {
                'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
                'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
                'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
            };
            
            // Parsear mes y año
            const [mesInicioStr, añoInicio] = fechaInicio.split(' ');
            const [mesFinStr, añoFin] = fechaFin.split(' ');
            
            const mesInicio = meses[mesInicioStr];
            const mesFin = meses[mesFinStr];
            
            if (!mesInicio || !mesFin) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Formato inválido',
                    text: 'Por favor usa el formato "Mes Año" (ej: Enero 2023)'
                });
                return;
            }
            
            // Obtener último día del mes
            const ultimoDiaMes = new Date(parseInt(añoFin), parseInt(mesFin), 0).getDate();
            
            fechaInicio = `${añoInicio}-${mesInicio}-01`;
            fechaFin = `${añoFin}-${mesFin}-${ultimoDiaMes}`;
        } else {
            // Para fecha normal, validar orden
            if (fechaInicio > fechaFin) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fechas inválidas',
                    text: 'La fecha inicial no puede ser mayor que la fecha final'
                });
                return;
            }
        }

        try {
            mostrarLoading(`Cargando datos del rango de ${tipo}...`);
            
            let query = supabase
                .from('participantes_reserva')
                .select('id_ciudad, fecha_visita')
                .not('id_ciudad', 'is', null)
                .not('fecha_visita', 'is', null)
                .gte('fecha_visita', fechaInicio + 'T00:00:00')
                .lte('fecha_visita', fechaFin + 'T23:59:59');

            const { data: participantes, error } = await query;

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                await procesarDatosCiudadTiempo(participantes, tipo);
                mostrarInterfazCiudadTiempo(tipo);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Rango aplicado',
                    text: `Se encontraron ${participantes.length} participantes en el rango seleccionado`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                mostrarMensajeNoHayDatos('No hay participantes en el rango de fechas seleccionado');
            }

            cerrarLoading();
            
        } catch (error) {
            console.error('Error aplicando rango de fechas:', error);
            cerrarLoading();
            mostrarErrorCiudad('Error al aplicar el rango de fechas: ' + error.message);
        }
    }

    // =============================================
    // INTERFAZ PARA CIUDAD POR TIEMPO - CON BARRAS
    // =============================================

    function mostrarInterfazCiudadTiempo(tipo) {
        const container = document.getElementById('data-container');
        const datos = getDatosCiudadTiempo(tipo);
        const titulo = getTituloTiempo(tipo);
        const icono = getIconoTiempo(tipo);

        container.innerHTML = `
            <div class="chart-controls">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        ${icono} ${titulo}
                        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                            ${datos.total} visitantes
                        </span>
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="download-btn" onclick="window.CiudadSystem.descargarGraficoPrincipalTiempo('${tipo}')">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                        <button class="btn" onclick="window.CiudadSystem.abrirModalTiempoDetalle('${tipo}')" style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white;">
                            <i class="fas fa-expand"></i> Ver Detalle Completo
                        </button>
                    </div>
                </div>
                
                <!-- CONTROLES DE RANGO DE FECHA -->
                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; color: #2c3e50;">
                        <i class="fas fa-calendar-alt"></i> Rango de ${tipo}
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <label style="font-weight: 600; margin-bottom: 5px; display: block; font-size: 0.9rem;">
                                ${getLabelFechaInicio(tipo)}
                            </label>
                            ${getInputFechaInicio(tipo)}
                        </div>
                        <div>
                            <label style="font-weight: 600; margin-bottom: 5px; display: block; font-size: 0.9rem;">
                                ${getLabelFechaFin(tipo)}
                            </label>
                            ${getInputFechaFin(tipo)}
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button class="btn btn-primary" onclick="window.CiudadSystem.aplicarRangoFechas('${tipo}')" style="width: 100%;">
                                <i class="fas fa-filter"></i> Aplicar Rango
                            </button>
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button class="btn" onclick="window.CiudadSystem.limpiarRangoFechas('${tipo}')" style="width: 100%; background: #95a5a6; color: white;">
                                <i class="fas fa-broom"></i> Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> ${titulo} - Barras Agrupadas
                        </div>
                        <div class="chart-card-badge">
                            <i class="fas fa-sort-amount-down"></i> Ordenado cronológicamente
                        </div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Ciudad"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-list"></i> Distribución por Ciudad
                        </div>
                        <div class="chart-card-badge">
                            <i class="fas fa-search"></i> Con buscador
                        </div>
                    </div>
                    <div class="chart-canvas-wrap" style="overflow-x: auto;">
                        <div style="padding: 15px;">
                            <!-- BUSCADOR DE CIUDADES -->
                            <div style="margin-bottom: 15px;">
                                <div style="position: relative;">
                                    <i class="fas fa-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #7f8c8d;"></i>
                                    <input type="text" 
                                           id="buscador-ciudad-${tipo}" 
                                           style="width: 100%; padding: 8px 8px 8px 35px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
                                           placeholder="Buscar ciudad por nombre..."
                                           onkeyup="window.CiudadSystem.filtrarTablaCiudades('${tipo}', this.value)">
                                </div>
                            </div>
                            
                            <!-- LISTA DE CIUDADES -->
                            <div id="lista-ciudades-${tipo}" style="max-height: 250px; overflow-y: auto;">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TABLA DE DETALLE -->
            <div class="data-table" style="margin-top: 20px;">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        <div style="margin-left: auto; display: flex; gap: 10px;">
                            <button class="btn" onclick="window.CiudadSystem.ordenarTabla('${tipo}', 'desc')" style="background: #e74c3c; color: white; font-size: 12px; padding: 6px 12px;">
                                <i class="fas fa-sort-amount-down"></i> Mayor a menor
                            </button>
                            <button class="btn" onclick="window.CiudadSystem.ordenarTabla('${tipo}', 'asc')" style="background: #3498db; color: white; font-size: 12px; padding: 6px 12px;">
                                <i class="fas fa-sort-amount-up"></i> Menor a mayor
                            </button>
                            <button class="btn" onclick="window.CiudadSystem.ordenarTabla('${tipo}', 'fecha')" style="background: #2ecc71; color: white; font-size: 12px; padding: 6px 12px;">
                                <i class="fas fa-calendar"></i> Por fecha
                            </button>
                        </div>
                    </h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 800px;" id="tabla-detalle-${tipo}">
                        <thead>
                            <tr>
                                <th>${getTituloColumna(tipo)}</th>
                                <th>Total Ciudades</th>
                                <th>Visitantes</th>
                                <th>Ciudad Principal</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-${tipo}-body">
                            ${generarFilasTablaCiudadTiempo(datos, tipo)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        mostrarGraficaCiudadTiempo(tipo);
        llenarListaCiudades(tipo);
    }

    // Funciones auxiliares para controles de fecha
    function getLabelFechaInicio(tipo) {
        switch(tipo) {
            case 'fecha': return 'Fecha Inicial';
            case 'mes': return 'Mes Inicial';
            case 'anio': return 'Año Inicial';
            default: return 'Inicio';
        }
    }

    function getLabelFechaFin(tipo) {
        switch(tipo) {
            case 'fecha': return 'Fecha Final';
            case 'mes': return 'Mes Final';
            case 'anio': return 'Año Final';
            default: return 'Fin';
        }
    }

    function getInputFechaInicio(tipo) {
        const fechaActual = new Date();
        switch(tipo) {
            case 'fecha': 
                const fechaInicioDefault = new Date(fechaActual);
                fechaInicioDefault.setMonth(fechaInicioDefault.getMonth() - 1);
                return `<input type="date" id="filtro-${tipo}-inicio" class="filtro-input" value="${fechaInicioDefault.toISOString().split('T')[0]}">`;
            case 'mes':
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                let añoInicio = fechaActual.getFullYear();
                let mesInicio = fechaActual.getMonth() - 1;
                if (mesInicio < 0) {
                    mesInicio = 11;
                    añoInicio--;
                }
                return `
                    <select id="filtro-${tipo}-inicio" class="filtro-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                        ${Array.from({length: 24}, (_, i) => {
                            const fecha = new Date(fechaActual);
                            fecha.setMonth(fecha.getMonth() - i);
                            const mes = fecha.getMonth();
                            const año = fecha.getFullYear();
                            const seleccionado = i === 1 ? 'selected' : '';
                            return `<option value="${meses[mes]} ${año}" ${seleccionado}>${meses[mes]} ${año}</option>`;
                        }).reverse().join('')}
                    </select>`;
            case 'anio':
                return `
                    <select id="filtro-${tipo}-inicio" class="filtro-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                        ${Array.from({length: 10}, (_, i) => {
                            const año = fechaActual.getFullYear() - i;
                            const seleccionado = i === 1 ? 'selected' : '';
                            return `<option value="${año}" ${seleccionado}>${año}</option>`;
                        }).join('')}
                    </select>`;
            default:
                return `<input type="date" id="filtro-${tipo}-inicio" class="filtro-input">`;
        }
    }

    function getInputFechaFin(tipo) {
        const fechaActual = new Date();
        switch(tipo) {
            case 'fecha': 
                return `<input type="date" id="filtro-${tipo}-fin" class="filtro-input" value="${fechaActual.toISOString().split('T')[0]}">`;
            case 'mes':
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return `
                    <select id="filtro-${tipo}-fin" class="filtro-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                        ${Array.from({length: 24}, (_, i) => {
                            const fecha = new Date(fechaActual);
                            fecha.setMonth(fecha.getMonth() - i);
                            const mes = fecha.getMonth();
                            const año = fecha.getFullYear();
                            const seleccionado = i === 0 ? 'selected' : '';
                            return `<option value="${meses[mes]} ${año}" ${seleccionado}>${meses[mes]} ${año}</option>`;
                        }).reverse().join('')}
                    </select>`;
            case 'anio':
                return `
                    <select id="filtro-${tipo}-fin" class="filtro-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                        ${Array.from({length: 10}, (_, i) => {
                            const año = fechaActual.getFullYear() - i;
                            const seleccionado = i === 0 ? 'selected' : '';
                            return `<option value="${año}" ${seleccionado}>${año}</option>`;
                        }).join('')}
                    </select>`;
            default:
                return `<input type="date" id="filtro-${tipo}-fin" class="filtro-input" value="${fechaActual.toISOString().split('T')[0]}">`;
        }
    }

    // =============================================
    // FUNCIONES AUXILIARES MEJORADAS
    // =============================================

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

    function generarFilasTablaCiudadTiempo(datos, tipo) {
        if (!datos.labels || datos.labels.length === 0) {
            return '<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay datos disponibles</td></tr>';
        }

        return datos.labels.map((label, index) => {
            // Calcular total para este período
            let totalPeriodo = 0;
            let ciudadesPeriodo = new Set();
            let ciudadPrincipal = '';
            let maxVisitantes = 0;
            
            datos.datasets.forEach(dataset => {
                const valor = dataset.data[index] || 0;
                totalPeriodo += valor;
                if (valor > 0) {
                    ciudadesPeriodo.add(dataset.label);
                    if (valor > maxVisitantes) {
                        maxVisitantes = valor;
                        ciudadPrincipal = dataset.label;
                    }
                }
            });
            
            const numCiudades = ciudadesPeriodo.size;
            const colorPrincipal = obtenerColorParaCiudad(ciudadPrincipal);
            
            return `
                <tr data-fecha="${label}" data-total="${totalPeriodo}">
                    <td><strong>${label}</strong></td>
                    <td style="text-align: center;">${numCiudades}</td>
                    <td style="text-align: center; font-weight: bold;">${totalPeriodo.toLocaleString()}</td>
                    <td>
                        ${ciudadPrincipal ? `
                        <span class="ciudad-badge-mini" style="background: ${colorPrincipal}; color: white; padding: 3px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fas fa-city"></i> ${ciudadPrincipal} (${maxVisitantes})
                        </span>` : 'N/A'}
                    </td>
                    <td>
                        <button class="btn-detalle" onclick="window.CiudadSystem.mostrarDetallePeriodo('${tipo}', '${label}')" style="background: #f8f9fa; border: 1px solid #ddd; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-eye"></i> Ver detalle
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
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

    function llenarListaCiudades(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        const container = document.getElementById(`lista-ciudades-${tipo}`);
        
        if (!container) return;
        
        // Calcular totales por ciudad
        const ciudadesConTotal = datos.ciudades.map(ciudad => {
            const dataset = datos.datasets.find(d => d.label === ciudad);
            const total = dataset ? dataset.data.reduce((a, b) => a + b, 0) : 0;
            return { ciudad, total };
        });
        
        // Ordenar de mayor a menor
        ciudadesConTotal.sort((a, b) => b.total - a.total);
        
        container.innerHTML = ciudadesConTotal.map(item => {
            const porcentaje = datos.total > 0 ? ((item.total / datos.total) * 100).toFixed(1) : 0;
            const color = obtenerColorParaCiudad(item.ciudad);
            
            return `
                <div class="ciudad-item" style="padding: 8px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" 
                     onclick="window.CiudadSystem.mostrarDetalleCiudad('${tipo}', '${item.ciudad}')"
                     onmouseover="this.style.backgroundColor='#f8f9fa'" 
                     onmouseout="this.style.backgroundColor='transparent'">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
                        <span style="font-weight: 600; font-size: 14px;">${item.ciudad}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; font-size: 14px;">${item.total}</div>
                        <div style="font-size: 12px; color: #27ae60;">${porcentaje}%</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =============================================
    // MODAL PARA DETALLE COMPLETO - CON BARRAS
    // =============================================

    function abrirModalTiempoDetalle(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        const titulo = getTituloTiempo(tipo);
        
        // Crear modal
        const modalHTML = `
            <div class="modal-overlay" id="modal-tiempo-detalle" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000; padding: 20px;">
                <div style="background: white; border-radius: 12px; width: 90%; max-width: 1400px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-chart-bar"></i> ${titulo} - Vista Detallada
                        </h2>
                        <button onclick="document.getElementById('modal-tiempo-detalle').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div style="display: flex; height: calc(90vh - 140px);">
                        <!-- Panel izquierdo: Gráfico de BARRAS -->
                        <div style="flex: 3; padding: 20px; border-right: 1px solid #eee; display: flex; flex-direction: column;">
                            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">
                                <i class="fas fa-chart-bar"></i> Distribución Temporal por Ciudad
                            </h3>
                            <div style="flex: 1; position: relative;">
                                <canvas id="chartModalDetalle"></canvas>
                            </div>
                        </div>
                        
                        <!-- Panel derecho: Datos -->
                        <div style="flex: 2; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;">
                            <div>
                                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
                                    <i class="fas fa-info-circle"></i> Estadísticas Generales
                                </h3>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                    <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px; border: 1px solid #dee2e6;">
                                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Total Visitantes</div>
                                        <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${datos.total}</div>
                                    </div>
                                    <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px; border: 1px solid #dee2e6;">
                                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Total Ciudades</div>
                                        <div style="font-size: 28px; font-weight: bold; color: #3498db;">${datos.ciudades.length}</div>
                                    </div>
                                    <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px; border: 1px solid #dee2e6; grid-column: span 2;">
                                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Períodos Analizados</div>
                                        <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${datos.labels.length}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
                                    <i class="fas fa-city"></i> Ciudades Principales
                                </h3>
                                <div id="lista-ciudades-modal" style="max-height: 200px; overflow-y: auto;">
                                    <!-- Se llenará dinámicamente -->
                                </div>
                            </div>
                            
                            <div>
                                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
                                    <i class="fas fa-download"></i> Exportar Datos
                                </h3>
                                <div style="display: flex; gap: 10px;">
                                    <button onclick="window.CiudadSystem.exportarExcelModal('${tipo}')" style="flex: 1; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        <i class="fas fa-file-excel"></i> Excel
                                    </button>
                                    <button onclick="window.CiudadSystem.exportarPDFModal('${tipo}')" style="flex: 1; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        <i class="fas fa-file-pdf"></i> PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee;">
                        <button onclick="document.getElementById('modal-tiempo-detalle').remove()" style="background: #95a5a6; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;">
                            Cerrar
                        </button>
                        <button onclick="window.CiudadSystem.descargarGraficoModal()" style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar modal al DOM
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv.firstElementChild);
        
        // Inicializar gráfico y datos del modal
        inicializarGraficoModal(tipo);
        llenarListaCiudadesModal(tipo);
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

    function llenarListaCiudadesModal(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        const container = document.getElementById('lista-ciudades-modal');
        
        if (!container) return;
        
        // Calcular totales por ciudad
        const ciudadesConTotal = datos.ciudades.map(ciudad => {
            const dataset = datos.datasets.find(d => d.label === ciudad);
            const total = dataset ? dataset.data.reduce((a, b) => a + b, 0) : 0;
            return { ciudad, total };
        });
        
        // Ordenar de mayor a menor y tomar las 10 principales
        ciudadesConTotal.sort((a, b) => b.total - a.total);
        const ciudadesPrincipales = ciudadesConTotal.slice(0, 10);
        
        container.innerHTML = ciudadesPrincipales.map(item => {
            const porcentaje = datos.total > 0 ? ((item.total / datos.total) * 100).toFixed(1) : 0;
            const color = obtenerColorParaCiudad(item.ciudad);
            
            // Calcular progreso para barra
            const maxTotal = ciudadesPrincipales[0].total;
            const porcentajeBarra = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
            
            return `
                <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
                            <span style="font-weight: 600; font-size: 14px;">${item.ciudad}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; font-size: 14px;">${item.total}</div>
                            <div style="font-size: 12px; color: #27ae60;">${porcentaje}%</div>
                        </div>
                    </div>
                    <div style="height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${porcentajeBarra}%; background: ${color}; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =============================================
    // FUNCIONES DE INTERFAZ DE USUARIO
    // =============================================

    function mostrarLoading(mensaje) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: mensaje,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
        }
    }

    function cerrarLoading() {
        if (typeof Swal !== 'undefined') Swal.close();
    }

    function mostrarErrorCiudad(mensaje = 'Error al cargar los datos de ciudad') {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data" style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c;"></i>
                <h3 style="color: #e74c3c;">Error al cargar datos</h3>
                <p>${mensaje}</p>
                <button class="btn btn-primary" onclick="window.CiudadSystem.cargarDatos()" style="background: #3498db; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

    function mostrarSinDatosCiudad() {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data" style="text-align: center; padding: 40px;">
                <i class="fas fa-city" style="font-size: 48px; color: #7f8c8d;"></i>
                <h3>No hay datos de ciudades disponibles</h3>
                <p>No se encontraron participantes con ciudad registrada.</p>
                <button class="btn btn-primary" onclick="window.CiudadSystem.cargarDatos()" style="background: #3498db; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

    function mostrarSinDatosTiempo(tipo) {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data" style="text-align: center; padding: 40px;">
                <i class="fas fa-calendar-times" style="font-size: 48px; color: #7f8c8d;"></i>
                <h3>No hay datos de ${tipo} disponibles</h3>
                <p>No se encontraron visitantes con fechas de visita registradas.</p>
                <button class="btn btn-primary" onclick="window.CiudadSystem.cargarDatosCiudadTiempo('${tipo}')" style="background: #3498db; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

    function mostrarExito(mensaje) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: mensaje,
                timer: 3000,
                showConfirmButton: false
            });
        }
    }

    function mostrarMensajeNoHayDatos(mensaje = 'No hay datos disponibles para los filtros seleccionados') {
        Swal.fire({
            icon: 'info',
            title: 'Sin datos',
            text: mensaje,
            confirmButtonColor: '#3498db'
        });
    }

    // =============================================
    // EXPOSICIÓN DE FUNCIONES GLOBALES - COMPLETO
    // =============================================

    if (!window.CiudadSystem) {
        window.CiudadSystem = {};
    }

    // Funciones principales
    window.CiudadSystem.cargarDatos = cargarDatosCiudad;
    window.CiudadSystem.cargarDatosCiudadTiempo = cargarDatosCiudadTiempo;
    window.CiudadSystem.cambiarTipoReporte = function(tipo) {
        console.log('🔄 Cambiando a reporte:', tipo);
        
        // Actualizar botones activos
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const btn = document.querySelector(`.chart-btn[data-type="${tipo}"]`);
        if (btn) btn.classList.add('active');
        
        if (tipo === 'ciudad') {
            cargarDatosCiudad();
        } else {
            cargarDatosCiudadTiempo(tipo);
        }
    };

    // Funciones de filtros y rangos
    window.CiudadSystem.aplicarRangoFechas = aplicarRangoFechas;
    window.CiudadSystem.limpiarRangoFechas = function(tipo) {
        // Recargar datos originales
        cargarDatosCiudadTiempo(tipo);
        
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    };

    // Funciones de ordenamiento de tabla
    window.CiudadSystem.ordenarTabla = function(tipo, orden) {
        const tbody = document.getElementById(`tabla-${tipo}-body`);
        if (!tbody) return;
        
        const filas = Array.from(tbody.querySelectorAll('tr'));
        if (filas.length === 0) return;
        
        filas.sort((a, b) => {
            if (orden === 'fecha') {
                const fechaA = a.getAttribute('data-fecha');
                const fechaB = b.getAttribute('data-fecha');
                
                if (tipo === 'fecha') {
                    return new Date(fechaA) - new Date(fechaB);
                } else if (tipo === 'mes') {
                    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const [mesA, añoA] = fechaA.split(' ');
                    const [mesB, añoB] = fechaB.split(' ');
                    
                    if (añoA !== añoB) {
                        return parseInt(añoA) - parseInt(añoB);
                    }
                    return meses.indexOf(mesA) - meses.indexOf(mesB);
                } else {
                    return parseInt(fechaA) - parseInt(fechaB);
                }
            } else {
                const totalA = parseInt(a.getAttribute('data-total') || 0);
                const totalB = parseInt(b.getAttribute('data-total') || 0);
                
                return orden === 'desc' ? totalB - totalA : totalA - totalB;
            }
        });
        
        // Reordenar filas
        filas.forEach(fila => tbody.appendChild(fila));
    };

    // Funciones de filtrado de ciudades
    window.CiudadSystem.filtrarTablaCiudades = function(tipo, termino) {
        const container = document.getElementById(`lista-ciudades-${tipo}`);
        if (!container) return;
        
        const items = container.querySelectorAll('.ciudad-item');
        const terminoLower = termino.toLowerCase();
        
        items.forEach(item => {
            const ciudadElement = item.querySelector('span');
            if (ciudadElement) {
                const ciudad = ciudadElement.textContent.toLowerCase();
                if (ciudad.includes(terminoLower)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    };

    // Funciones para mostrar detalles
    window.CiudadSystem.mostrarDetallePeriodo = function(tipo, periodo) {
        const datos = getDatosCiudadTiempo(tipo);
        
        if (!datos.conteo || !datos.conteo[periodo]) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: `No hay datos disponibles para ${periodo}`,
                confirmButtonText: 'OK'
            });
            return;
        }
        
        const ciudadesDetalle = Object.entries(datos.conteo[periodo])
            .map(([ciudad, valor]) => ({ ciudad, valor }))
            .sort((a, b) => b.valor - a.valor);
        
        const totalPeriodo = ciudadesDetalle.reduce((sum, ciudad) => sum + ciudad.valor, 0);
        
        let contenido = `<div style="max-height: 400px; overflow-y: auto;">`;
        contenido += `<div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px;">
            <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 5px;">${periodo}</div>
            <div style="display: flex; gap: 20px;">
                <div>
                    <div style="font-size: 12px; color: #7f8c8d;">Total visitantes</div>
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${totalPeriodo}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #7f8c8d;">Ciudades diferentes</div>
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${ciudadesDetalle.length}</div>
                </div>
            </div>
        </div>`;
        contenido += `<table style="width: 100%; border-collapse: collapse;">`;
        contenido += `<thead><tr style="background: #f8f9fa;"><th style="padding: 12px; text-align: left;">Ciudad</th><th style="padding: 12px; text-align: center;">Visitantes</th><th style="padding: 12px; text-align: center;">Porcentaje</th></tr></thead>`;
        contenido += `<tbody>`;
        
        ciudadesDetalle.forEach(ciudad => {
            const porcentaje = totalPeriodo > 0 ? ((ciudad.valor / totalPeriodo) * 100).toFixed(1) : 0;
            const color = obtenerColorParaCiudad(ciudad.ciudad);
            
            contenido += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                            <span style="font-weight: 600;">${ciudad.ciudad}</span>
                        </div>
                    </td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee; font-weight: bold;">${ciudad.valor}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">
                        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${porcentaje}%</span>
                    </td>
                </tr>
            `;
        });
        
        contenido += `</tbody></table></div>`;
        
        Swal.fire({
            title: `Detalle: ${periodo}`,
            html: contenido,
            width: 700,
            confirmButtonText: 'Cerrar',
            customClass: {
                container: 'swal-detalle-container'
            }
        });
    };

    window.CiudadSystem.mostrarDetalleCiudad = function(tipo, ciudadNombre) {
        const datos = getDatosCiudadTiempo(tipo);
        const dataset = datos.datasets.find(d => d.label === ciudadNombre);
        
        if (!dataset) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: `No hay datos disponibles para ${ciudadNombre}`,
                confirmButtonText: 'OK'
            });
            return;
        }
        
        const totalCiudad = dataset.data.reduce((a, b) => a + b, 0);
        const color = obtenerColorParaCiudad(ciudadNombre);
        
        let contenido = `<div style="max-height: 400px; overflow-y: auto;">`;
        contenido += `<div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                <div style="width: 40px; height: 40px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fas fa-city"></i>
                </div>
                <div>
                    <div style="font-size: 20px; font-weight: bold; color: #2c3e50;">${ciudadNombre}</div>
                    <div style="font-size: 14px; color: #7f8c8d;">Distribución temporal</div>
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div>
                    <div style="font-size: 12px; color: #7f8c8d;">Total visitantes</div>
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${totalCiudad}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #7f8c8d;">Porcentaje total</div>
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${datos.total > 0 ? ((totalCiudad / datos.total) * 100).toFixed(1) : 0}%</div>
                </div>
            </div>
        </div>`;
        contenido += `<table style="width: 100%; border-collapse: collapse;">`;
        contenido += `<thead><tr style="background: #f8f9fa;"><th style="padding: 12px; text-align: left;">Período</th><th style="padding: 12px; text-align: center;">Visitantes</th><th style="padding: 12px; text-align: center;">Porcentaje</th></tr></thead>`;
        contenido += `<tbody>`;
        
        datos.labels.forEach((label, index) => {
            const valor = dataset.data[index] || 0;
            if (valor > 0) {
                const porcentaje = totalCiudad > 0 ? ((valor / totalCiudad) * 100).toFixed(1) : 0;
                
                contenido += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${label}</td>
                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee; font-weight: bold;">${valor}</td>
                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">
                            <span style="background: #f39c12; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${porcentaje}%</span>
                        </td>
                    </tr>
                `;
            }
        });
        
        contenido += `</tbody></table></div>`;
        
        Swal.fire({
            title: `Detalle: ${ciudadNombre}`,
            html: contenido,
            width: 700,
            confirmButtonText: 'Cerrar'
        });
    };

    // Funciones modales
    window.CiudadSystem.abrirModal = function(tipoGrafica) {
        // Crear modal simple para gráficas principales
        const { labels, values, colors, total } = datosCiudades.general;
        
        let contenido = `<div style="max-width: 800px; margin: 0 auto;">`;
        contenido += `<div style="margin-bottom: 20px; text-align: center;">
            <h2 style="color: #2c3e50; margin-bottom: 10px;">
                <i class="fas fa-chart-bar"></i> Distribución por Ciudad
            </h2>
            <p style="color: #7f8c8d;">Total: ${total} visitantes</p>
        </div>`;
        
        // Crear canvas para gráfico
        contenido += `<div style="height: 400px; margin-bottom: 20px;">
            <canvas id="modalChartCanvas"></canvas>
        </div>`;
        
        // Tabla de datos
        contenido += `<div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left;">Ciudad</th>
                        <th style="padding: 12px; text-align: center;">Visitantes</th>
                        <th style="padding: 12px; text-align: center;">Porcentaje</th>
                    </tr>
                </thead>
                <tbody>`;
        
        labels.forEach((ciudad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const color = colors[index];
            
            contenido += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                            <span>${ciudad}</span>
                        </div>
                    </td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee; font-weight: bold;">${cantidad}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">
                        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${porcentaje}%</span>
                    </td>
                </tr>
            `;
        });
        
        contenido += `</tbody></table></div></div>`;
        
        Swal.fire({
            title: 'Distribución por Ciudad - Vista Ampliada',
            html: contenido,
            width: 900,
            showCloseButton: true,
            showConfirmButton: false,
            didOpen: () => {
                // Crear gráfico dentro del modal
                const ctx = document.getElementById('modalChartCanvas');
                if (ctx) {
                    new Chart(ctx, {
                        type: tipoGrafica === 'bar' ? 'bar' : 'doughnut',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Visitantes',
                                data: values,
                                backgroundColor: colors,
                                borderColor: tipoGrafica === 'bar' ? colors.map(c => darkenColor(c, 0.2)) : '#fff',
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: tipoGrafica === 'bar' ? 'top' : 'right'
                                }
                            }
                        }
                    });
                }
            }
        });
    };

    window.CiudadSystem.abrirModalTiempoDetalle = abrirModalTiempoDetalle;

    // Funciones de descarga
    window.CiudadSystem.descargarGraficoPrincipal = function() {
        if (chartInstances.bar) {
            const link = document.createElement("a");
            link.download = "grafica_ciudad_principal.png";
            link.href = chartInstances.bar.canvas.toDataURL("image/png");
            link.click();
        }
    };

    window.CiudadSystem.descargarGraficoPrincipalTiempo = function(tipo) {
        if (chartInstances[tipo]) {
            const link = document.createElement("a");
            link.download = `grafica_ciudad_${tipo}.png`;
            link.href = chartInstances[tipo].canvas.toDataURL("image/png");
            link.click();
        }
    };

    window.CiudadSystem.descargarGraficoModal = function() {
        if (chartInstances.ampliado) {
            const link = document.createElement("a");
            link.download = `grafica_detalle_${new Date().toISOString().split('T')[0]}.png`;
            link.href = chartInstances.ampliado.canvas.toDataURL("image/png");
            link.click();
        }
    };

    window.CiudadSystem.descargarExcel = function() {
        const { labels, values } = datosCiudades.general;
        const total = values.reduce((a, b) => a + b, 0);
        
        const datosExcel = [
            ['Ciudad', 'Total Visitantes', 'Porcentaje'],
            ...labels.map((ciudad, i) => {
                const porcentaje = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
                return [ciudad, values[i], `${porcentaje}%`];
            }),
            ['TOTAL', total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos por Ciudad");
        XLSX.writeFile(wb, "reporte_ciudad.xlsx");
    };

    // Funciones de exportación del modal
    window.CiudadSystem.exportarExcelModal = function(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        
        // Preparar datos para Excel
        const datosExcel = [
            ['Período', ...datos.ciudades, 'Total'],
            ...datos.labels.map((label, index) => {
                const fila = [label];
                let totalFila = 0;
                
                datos.ciudades.forEach(ciudad => {
                    const dataset = datos.datasets.find(d => d.label === ciudad);
                    const valor = dataset ? dataset.data[index] || 0 : 0;
                    fila.push(valor);
                    totalFila += valor;
                });
                
                fila.push(totalFila);
                return fila;
            }),
            ['TOTAL', ...datos.ciudades.map(ciudad => {
                const dataset = datos.datasets.find(d => d.label === ciudad);
                return dataset ? dataset.data.reduce((a, b) => a + b, 0) : 0;
            }), datos.total]
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, `Datos ${tipo}`);
        XLSX.writeFile(wb, `reporte_ciudad_${tipo}.xlsx`);
    };

    window.CiudadSystem.exportarPDFModal = function(tipo) {
        Swal.fire({
            icon: 'info',
            title: 'Exportar a PDF',
            text: 'Esta funcionalidad se implementará próximamente',
            confirmButtonText: 'OK'
        });
    };

    // Función para ver todas las ciudades
    window.CiudadSystem.mostrarTodasLasCiudades = function() {
        if (!datosCiudades.detallado) return;
        
        const todasCiudades = datosCiudades.detallado.todasLasCiudades;
        const total = datosCiudades.estadisticas.totalConCiudad;
        
        let contenido = '<div style="max-height: 500px; overflow-y: auto; padding-right: 10px;">';
        contenido += '<table style="width: 100%; border-collapse: collapse;">';
        contenido += '<thead><tr style="background: #f8f9fa; position: sticky; top: 0; z-index: 1;"><th style="padding: 12px; text-align: left;">#</th><th style="padding: 12px; text-align: left;">Ciudad</th><th style="padding: 12px; text-align: center;">Visitantes</th><th style="padding: 12px; text-align: center;">Porcentaje</th></tr></thead>';
        contenido += '<tbody>';
        
        todasCiudades.forEach(([ciudad, cantidad], index) => {
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const color = obtenerColorParaCiudad(ciudad);
            
            contenido += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold; color: #7f8c8d;">${index + 1}</td>
                    <td style="padding: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                            ${ciudad}
                        </div>
                    </td>
                    <td style="padding: 10px; text-align: center; font-weight: bold;">${cantidad}</td>
                    <td style="padding: 10px; text-align: center;">
                        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${porcentaje}%</span>
                    </td>
                </tr>
            `;
        });
        
        contenido += '</tbody></table></div>';
        
        Swal.fire({
            title: `Todas las Ciudades (${todasCiudades.length})`,
            html: contenido,
            width: 800,
            showConfirmButton: false,
            showCloseButton: true
        });
    };

    // =============================================
    // FUNCIONES AUXILIARES
    // =============================================

    function getDatosCiudadTiempo(tipo) {
        switch(tipo) {
            case 'fecha': return datosFechaCiudad || { labels: [], datasets: [], ciudades: [], total: 0 };
            case 'mes': return datosMesCiudad || { labels: [], datasets: [], ciudades: [], total: 0 };
            case 'anio': return datosAnioCiudad || { labels: [], datasets: [], ciudades: [], total: 0 };
            default: return { labels: [], datasets: [], ciudades: [], total: 0 };
        }
    }

    function getTituloTiempo(tipo) {
        const titulos = {
            'fecha': '🏙️ Ciudad por Fecha',
            'mes': '🏙️ Ciudad por Mes', 
            'anio': '🏙️ Ciudad por Año'
        };
        return titulos[tipo] || 'Ciudad por Tiempo';
    }

    function getIconoTiempo(tipo) {
        const iconos = {
            'fecha': '<i class="fas fa-calendar-day"></i>',
            'mes': '<i class="fas fa-calendar-week"></i>',
            'anio': '<i class="fas fa-calendar-alt"></i>'
        };
        return iconos[tipo] || '<i class="fas fa-chart-bar"></i>';
    }

    function getTituloColumna(tipo) {
        switch(tipo) {
            case 'fecha': return 'Fecha';
            case 'mes': return 'Mes';
            case 'anio': return 'Año';
            default: return 'Período';
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

    console.log('✅ Sistema de Ciudad CON BARRAS cargado correctamente');
})();