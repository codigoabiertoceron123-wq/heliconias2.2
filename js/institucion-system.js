// js/institucion-system.js - SISTEMA DE INSTITUCIÓN COMPLETO CON FILTROS EN MODAL
(function() {
    'use strict';
    
    // =============================================
    // VARIABLES PRIVADAS
    // =============================================
    let chartBarInstitucion, chartPieInstitucion, chartAmpliadoInstitucion;
    let chartFechaBar, chartFechaPie, chartMesBar, chartMesPie, chartAnioBar, chartAnioPie;
    let tipoActual = "institucion";
    let datosInstituciones = {};
    let datosOriginales = {};
    let datosFecha = {};
    let datosMes = {};
    let datosAnio = {};
    let institucionesFiltradas = [];
    let todasLasInstituciones = [];

    // Paletas de colores
    const coloresInstituciones = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#d35400', '#34495e', '#16a085', '#27ae60'
    ];

    const coloresPorTiempo = {
        fecha: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
        mes: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#d35400', '#27ae60'],
        anio: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f']
    };

    // =============================================
    // FUNCIONES DE UTILIDAD
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

    function mostrarError(mensaje) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: mensaje,
                confirmButtonColor: '#e74c3c'
            });
        }
        const container = document.getElementById('data-container');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar datos</h3>
                    <p>${mensaje}</p>
                    <button class="btn btn-primary" onclick="window.InstitucionManager.inicializar()">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    function mostrarExito(mensaje) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: mensaje,
                timer: 2000,
                showConfirmButton: false
            });
        }
    }

    function mostrarSinDatos() {
        const container = document.getElementById('data-container');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-school"></i>
                    <h3>No hay datos disponibles</h3>
                    <p>No se encontraron datos en la base de datos.</p>
                    <button class="btn btn-primary" onclick="window.InstitucionManager.inicializar()">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    function mostrarSinDatosTiempo(tipo) {
        const container = document.getElementById('data-container');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No hay datos de ${tipo} disponibles</h3>
                    <p>No se encontraron visitantes con fechas de visita registradas.</p>
                    <button class="btn btn-primary" onclick="window.InstitucionManager.cambiarTipoReporte('${tipo}')">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    function mostrarSinDatosFiltrados() {
        const container = document.getElementById('data-container');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-search"></i>
                    <h3>No hay datos con los filtros aplicados</h3>
                    <p>Intenta con otros criterios de búsqueda o limpia los filtros.</p>
                    <button class="btn btn-primary" onclick="window.InstitucionManager.limpiarFiltrosCombinados()">
                        <i class="fas fa-times"></i> Limpiar Filtros
                    </button>
                </div>
            `;
        }
    }

    // =============================================
    // FUNCIONES PRINCIPALES
    // =============================================

    // Función para cargar datos completos
    async function cargarDatosCompletos() {
        try {
            mostrarLoading('Cargando datos completos...');
            
            // Cargar datos de instituciones
            await cargarDatosInstitucion();
            
            // Cargar datos de tiempo si es necesario
            if (tipoActual !== 'institucion') {
                await cargarDatosTiempo(tipoActual);
            }
            
            cerrarLoading();
            
        } catch (error) {
            console.error('Error cargando datos completos:', error);
            cerrarLoading();
            mostrarError('Error al cargar los datos: ' + error.message);
        }
    }

    // Función para cargar datos de instituciones
    async function cargarDatosInstitucion() {
        try {
            console.log('=== CARGANDO DATOS DE INSTITUCIÓN ===');
            
            // 1. Obtener todos los participantes con institución
            const { data: participantes, error: errorParticipantes } = await supabase
                .from('participantes_reserva')
                .select('id_institucion, fecha_visita')
                .not('id_institucion', 'is', null);

            if (errorParticipantes) throw errorParticipantes;

            if (!participantes || participantes.length === 0) {
                mostrarSinDatos();
                return;
            }

            // 2. Obtener información de instituciones
            const { data: instituciones, error: errorInstituciones } = await supabase
                .from('instituciones')
                .select('id_institucion, nombre_institucion')
                .order('nombre_institucion');

            if (errorInstituciones) throw errorInstituciones;

            todasLasInstituciones = instituciones || [];
            
            // 3. Contar participantes por institución
            const conteoInstituciones = {};
            participantes.forEach(participante => {
                const institucion = todasLasInstituciones.find(i => i.id_institucion === participante.id_institucion);
                if (institucion && institucion.nombre_institucion) {
                    const nombreInstitucion = institucion.nombre_institucion;
                    conteoInstituciones[nombreInstitucion] = (conteoInstituciones[nombreInstitucion] || 0) + 1;
                }
            });

            // 4. Agrupar instituciones principales
            const { institucionesPrincipales, otrasInstituciones } = agruparInstituciones(conteoInstituciones);

            // 5. Procesar datos para la interfaz
            procesarDatosInstitucion(institucionesPrincipales, otrasInstituciones);

        } catch (error) {
            console.error('Error en cargarDatosInstitucion:', error);
            throw error;
        }
    }

    // Agrupar instituciones en principales y otras
    function agruparInstituciones(conteoInstituciones) {
        let univalleCount = 0;
        let nacionalCount = 0;
        let andesCount = 0;
        let otrasInstituciones = {};

        Object.keys(conteoInstituciones).forEach(nombreInstitucion => {
            const cantidad = conteoInstituciones[nombreInstitucion];
            const nombreLower = nombreInstitucion.toLowerCase();
            
            if (nombreLower.includes('universidad del valle') || nombreLower.includes('univalle')) {
                univalleCount += cantidad;
            } else if (nombreLower.includes('universidad nacional') || nombreLower.includes('nacional de colombia')) {
                nacionalCount += cantidad;
            } else if (nombreLower.includes('universidad de los andes') || nombreLower.includes('uniandes')) {
                andesCount += cantidad;
            } else {
                otrasInstituciones[nombreInstitucion] = cantidad;
            }
        });

        // Sumar otras instituciones
        const otrasCount = Object.values(otrasInstituciones).reduce((a, b) => a + b, 0);

        return {
            institucionesPrincipales: {
                'Universidad del Valle': univalleCount,
                'Universidad Nacional': nacionalCount,
                'Universidad de los Andes': andesCount,
                'Otras Instituciones': otrasCount
            },
            otrasInstituciones: otrasInstituciones
        };
    }

    // Procesar datos para la interfaz
    function procesarDatosInstitucion(institucionesPrincipales, otrasInstituciones) {
        const labels = Object.keys(institucionesPrincipales);
        const values = Object.values(institucionesPrincipales);
        const totalVisitantes = values.reduce((a, b) => a + b, 0);

        // Actualizar estadísticas
        actualizarEstadisticas(totalVisitantes, labels.length);

        // Guardar datos
        datosInstituciones = {
            labels: labels,
            values: values,
            total: totalVisitantes,
            datosCompletos: { ...institucionesPrincipales, ...otrasInstituciones }
        };

        datosOriginales = JSON.parse(JSON.stringify(datosInstituciones));
        institucionesFiltradas = [...labels];

        // Actualizar filtros
        actualizarFiltrosInstituciones();

        if (tipoActual === 'institucion') {
            mostrarInterfazInstitucion();
        }
    }

    // Función para cargar datos por tiempo (fecha, mes, año)
    async function cargarDatosTiempo(tipo) {
        try {
            mostrarLoading(`Cargando datos por ${tipo}...`);

            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('fecha_visita, id_institucion')
                .not('fecha_visita', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                procesarDatosTiempo(participantes, tipo);
                mostrarInterfazTiempo(tipo);
            } else {
                mostrarSinDatosTiempo(tipo);
            }

            cerrarLoading();
            
        } catch (error) {
            console.error(`Error cargando datos de ${tipo}:`, error);
            cerrarLoading();
            mostrarError(`Error al cargar datos de ${tipo}: ` + error.message);
        }
    }

    // Procesar datos por tiempo
    function procesarDatosTiempo(participantes, tipo) {
        const conteo = {};
        
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
                
                conteo[clave] = (conteo[clave] || 0) + 1;
            }
        });

        // Ordenar datos
        let labels, values;
        
        switch(tipo) {
            case 'fecha':
                labels = Object.keys(conteo).sort((a, b) => new Date(a) - new Date(b)).slice(-15);
                break;
            case 'mes':
                labels = Object.keys(conteo).sort((a, b) => ordenarMeses(a, b));
                break;
            case 'anio':
                labels = Object.keys(conteo).sort((a, b) => parseInt(a) - parseInt(b));
                break;
        }
        
        values = labels.map(label => conteo[label]);

        // Guardar datos
        const datosTiempo = {
            labels: labels,
            values: values,
            total: values.reduce((a, b) => a + b, 0)
        };

        switch(tipo) {
            case 'fecha': datosFecha = datosTiempo; break;
            case 'mes': datosMes = datosTiempo; break;
            case 'anio': datosAnio = datosTiempo; break;
        }
    }

    // =============================================
    // FUNCIONES AUXILIARES
    // =============================================

    // Actualizar estadísticas
    function actualizarEstadisticas(total, instituciones) {
        if (document.getElementById('total-visitantes')) {
            document.getElementById('total-visitantes').textContent = total.toLocaleString();
        }
        if (document.getElementById('visitantes-con-institucion')) {
            document.getElementById('visitantes-con-institucion').textContent = total.toLocaleString();
        }
        if (document.getElementById('total-instituciones')) {
            document.getElementById('total-instituciones').textContent = instituciones;
        }
    }

    // Actualizar filtros de instituciones
    function actualizarFiltrosInstituciones() {
        const select = document.getElementById('filtro-institucion-comb');
        if (select) {
            // Limpiar opciones excepto la primera
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Agregar todas las instituciones
            Object.keys(datosInstituciones.datosCompletos).forEach(institucion => {
                const option = document.createElement('option');
                option.value = institucion;
                option.textContent = institucion;
                select.appendChild(option);
            });
        }
    }

    // Funciones auxiliares para tiempo
    function getDatosTiempo(tipo) {
        switch(tipo) {
            case 'fecha': return datosFecha;
            case 'mes': return datosMes;
            case 'anio': return datosAnio;
            default: return { labels: [], values: [], total: 0 };
        }
    }

    function getTituloTiempo(tipo) {
        const titulos = {
            'fecha': '📅 Visitantes por Fecha',
            'mes': '📊 Visitantes por Mes', 
            'anio': '📈 Visitantes por Año'
        };
        return titulos[tipo] || 'Visitantes';
    }

    function getIconoTiempo(tipo) {
        const iconos = {
            'fecha': '<i class="fas fa-calendar-day"></i>',
            'mes': '<i class="fas fa-calendar-week"></i>',
            'anio': '<i class="fas fa-calendar-alt"></i>'
        };
        return iconos[tipo] || '<i class="fas fa-chart-bar"></i>';
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

    function obtenerTipoInstitucion(nombre) {
        const nombreLower = nombre.toLowerCase();
        if (nombreLower.includes('universidad')) return 'Universidad';
        if (nombreLower.includes('colegio') || nombreLower.includes('institución')) return 'Colegio';
        if (nombreLower.includes('escuela')) return 'Escuela';
        return 'Institución Educativa';
    }

    function getDescripcionTiempo(tipo, label) {
        switch(tipo) {
            case 'fecha':
                const fecha = new Date(label);
                return fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            case 'mes':
                return 'Mes completo de visitas';
            case 'anio':
                return 'Año completo de visitas';
            default:
                return 'Período de tiempo';
        }
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
    // INTERFACES DE USUARIO
    // =============================================

    // Mostrar interfaz de instituciones
    function mostrarInterfazInstitucion() {
        const container = document.getElementById('data-container');
        const { labels, values, total } = datosInstituciones;
        
        container.innerHTML = `
            <div class="charts-grid">
                <div class="chart-card" onclick="window.InstitucionManager.abrirModal('bar')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> Distribución por Institución - Barras
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartBarInstitucion"></canvas>
                    </div>
                </div>

                <div class="chart-card" onclick="window.InstitucionManager.abrirModal('pie')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> Distribución por Institución - Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartPieInstitucion"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por Institución
                    </h3>
                    <button class="download-btn" onclick="window.InstitucionManager.descargarExcel()">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 600px;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th style="min-width: 200px;">Institución</th>
                                <th style="width: 150px;">Total Visitantes</th>
                                <th style="width: 100px;">Porcentaje</th>
                                <th style="min-width: 150px;">Tipo</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-institucion-body">
                            ${generarFilasTablaInstitucion()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        mostrarGraficasInstitucion();
    }

    // Generar filas de tabla para instituciones
    function generarFilasTablaInstitucion() {
        const { labels, values, total } = datosInstituciones;
        
        return labels.map((institucion, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoInstitucion(institucion);
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td>
                        <span class="institution-badge">
                            <i class="fas fa-university"></i>
                            ${institucion}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: #2e7d32">${porcentaje}%</td>
                    <td style="color: #7f8c8d; font-size: 0.9rem">${tipo}</td>
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

    // Mostrar interfaz para tiempo (fecha, mes, año)
    function mostrarInterfazTiempo(tipo) {
        const container = document.getElementById('data-container');
        const datos = getDatosTiempo(tipo);
        const titulo = getTituloTiempo(tipo);
        const icono = getIconoTiempo(tipo);

        container.innerHTML = `
            <div class="charts-grid">
                <div class="chart-card" onclick="window.InstitucionManager.abrirModalTiempo('${tipo}', 'bar')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> ${titulo} - Barras
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Bar"></canvas>
                    </div>
                </div>

                <div class="chart-card" onclick="window.InstitucionManager.abrirModalTiempo('${tipo}', 'pie')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> ${titulo} - Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Pie"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por ${titulo.split(' ')[1]}
                    </h3>
                    <button class="download-btn" onclick="window.InstitucionManager.descargarExcelTiempo('${tipo}')">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 600px;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th style="min-width: 150px;">${titulo.split(' ')[1]}</th>
                                <th style="width: 120px;">Total Visitantes</th>
                                <th style="width: 100px;">Porcentaje</th>
                                <th style="min-width: 100px;">Tendencia</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-${tipo}-body">
                            ${generarFilasTablaTiempo(datos, tipo)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        mostrarGraficasTiempo(tipo);
    }

    // Generar filas de tabla para tiempo
    function generarFilasTablaTiempo(datos, tipo) {
        const total = datos.values.reduce((a, b) => a + b, 0);
        
        return datos.labels.map((label, index) => {
            const valor = datos.values[index];
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            
            // Calcular tendencia
            let tendencia = '';
            if (index > 0) {
                const valorAnterior = datos.values[index - 1];
                const diferencia = valor - valorAnterior;
                const porcentajeCambio = valorAnterior > 0 ? ((diferencia / valorAnterior) * 100).toFixed(1) : 100;
                
                if (diferencia > 0) {
                    tendencia = `<span style="color: #27ae60;"><i class="fas fa-arrow-up"></i> ${porcentajeCambio}%</span>`;
                } else if (diferencia < 0) {
                    tendencia = `<span style="color: #e74c3c;"><i class="fas fa-arrow-down"></i> ${Math.abs(porcentajeCambio)}%</span>`;
                } else {
                    tendencia = `<span style="color: #f39c12;"><i class="fas fa-minus"></i> 0%</span>`;
                }
            } else {
                tendencia = '<span style="color: #95a5a6;">-</span>';
            }
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td><strong>${label}</strong></td>
                    <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                    <td style="text-align: center;">${tendencia}</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td style="text-align: center;">-</td>
            </tr>
        ` : '');
    }

    // =============================================
    // FUNCIONES DE GRÁFICAS
    // =============================================

    // Mostrar gráficas de instituciones
    function mostrarGraficasInstitucion() {
        const { labels, values } = datosInstituciones;
        const colors = generarColoresInstitucion(labels.length);
        
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
                    }
                },
                cutout: '50%'
            },
        });
    }

    // Mostrar gráficas para tiempo
    function mostrarGraficasTiempo(tipo) {
        const datos = getDatosTiempo(tipo);
        const colors = generarColoresTiempo(tipo, datos.labels.length);
        
        // Gráfica de barras
        const ctxBar = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Bar`);
        if (chartFechaBar) chartFechaBar.destroy();
        if (chartMesBar) chartMesBar.destroy();
        if (chartAnioBar) chartAnioBar.destroy();
        
        const chartBar = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: datos.labels,
                datasets: [{
                    label: "Visitantes",
                    data: datos.values,
                    backgroundColor: colors,
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
                        text: getTituloTiempo(tipo),
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad de Visitantes' }
                    },
                    x: {
                        title: { display: true, text: getTituloTiempo(tipo).split(' ')[1] }
                    }
                }
            },
        });

        // Gráfica circular
        const ctxPie = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Pie`);
        if (chartFechaPie) chartFechaPie.destroy();
        if (chartMesPie) chartMesPie.destroy();
        if (chartAnioPie) chartAnioPie.destroy();
        
        const chartPie = new Chart(ctxPie, {
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
                        labels: { usePointStyle: true, padding: 15 }
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

    // =============================================
    // FUNCIONES DE FILTRADO COMBINADO
    // =============================================

    // Aplicar filtros combinados
    async function aplicarFiltrosCombinados() {
        try {
            const fechaInicial = document.getElementById('filtro-fecha-inicial').value;
            const fechaFinal = document.getElementById('filtro-fecha-final').value;
            const institucion = document.getElementById('filtro-institucion-comb').value;

            // Validar fechas
            if (!fechaInicial || !fechaFinal) {
                mostrarError('Por favor selecciona ambas fechas');
                return;
            }

            if (fechaInicial > fechaFinal) {
                mostrarError('La fecha inicial no puede ser mayor que la fecha final');
                return;
            }

            mostrarLoading('Aplicando filtros...');

            let query = supabase
                .from('participantes_reserva')
                .select('id_institucion, fecha_visita')
                .gte('fecha_visita', fechaInicial + 'T00:00:00')
                .lte('fecha_visita', fechaFinal + 'T23:59:59');

            // Filtrar por institución si no es "todas"
            if (institucion !== 'todas') {
                const institucionObj = todasLasInstituciones.find(inst => inst.nombre_institucion === institucion);
                if (institucionObj) {
                    query = query.eq('id_institucion', institucionObj.id_institucion);
                }
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                procesarDatosFiltrados(participantesFiltrados, tipoActual);
                mostrarExito(`Filtros aplicados: ${participantesFiltrados.length} participantes encontrados`);
            } else {
                mostrarSinDatosFiltrados();
            }

            cerrarLoading();
            
        } catch (error) {
            console.error('Error aplicando filtros combinados:', error);
            cerrarLoading();
            mostrarError('Error al aplicar los filtros: ' + error.message);
        }
    }

    // Procesar datos filtrados
    function procesarDatosFiltrados(participantes, tipo) {
        if (tipo === 'institucion') {
            const conteoInstituciones = {};
            
            participantes.forEach(participante => {
                const institucion = todasLasInstituciones.find(i => i.id_institucion === participante.id_institucion);
                if (institucion && institucion.nombre_institucion) {
                    const nombreInstitucion = institucion.nombre_institucion;
                    conteoInstituciones[nombreInstitucion] = (conteoInstituciones[nombreInstitucion] || 0) + 1;
                }
            });

            const { institucionesPrincipales, otrasInstituciones } = agruparInstituciones(conteoInstituciones);
            procesarDatosInstitucion(institucionesPrincipales, otrasInstituciones);
            
        } else {
            procesarDatosTiempo(participantes, tipo);
            mostrarInterfazTiempo(tipo);
        }
    }

    // Limpiar filtros combinados
    function limpiarFiltrosCombinados() {
        document.getElementById('filtro-fecha-inicial').value = '';
        document.getElementById('filtro-fecha-final').value = '';
        document.getElementById('filtro-institucion-comb').value = 'todas';
        
        // Recargar datos sin filtros
        cargarDatosCompletos();
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    }

    // Cambiar tipo de reporte
    function cambiarTipoReporte(tipo) {
        console.log('🔄 Cambiando a reporte:', tipo);
        
        // Actualizar botones activos
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.chart-btn[data-type="${tipo}"]`).classList.add('active');
        
        // Mostrar/ocultar filtros combinados
        const filtrosDiv = document.getElementById('filtros-combinados');
        if (filtrosDiv) {
            filtrosDiv.style.display = tipo !== 'institucion' ? 'block' : 'none';
        }

        tipoActual = tipo;

        if (tipo === 'institucion') {
            if (datosInstituciones.labels && datosInstituciones.labels.length > 0) {
                mostrarInterfazInstitucion();
            } else {
                cargarDatosCompletos();
            }
        } else {
            cargarDatosTiempo(tipo);
        }
    }

    // =============================================
    // FUNCIONES DE MODAL CON FILTROS INTEGRADOS
    // =============================================

    // Función para crear HTML de filtros para el modal
    function crearHTMLFiltrosModal(tipo) {
        let html = `
        <div class="modal-filtros-container" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #2c3e50;">
                    <i class="fas fa-filter"></i> Filtros Avanzados
                </h4>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-filter-modal" onclick="window.InstitucionManager.aplicarFiltrosModal()" style="background: #2e7d32; color: white;">
                        <i class="fas fa-check"></i> Aplicar
                    </button>
                    <button class="btn-filter-modal" onclick="window.InstitucionManager.limpiarFiltrosModal()" style="background: #95a5a6; color: white;">
                        <i class="fas fa-times"></i> Limpiar
                    </button>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <!-- Tipo de Gráfica -->
                <div class="filter-group">
                    <label><i class="fas fa-chart-bar"></i> Tipo de Gráfica:</label>
                    <select id="modalTipoGrafica" class="filter-select">
                        <option value="bar">Gráfico de Barras</option>
                        <option value="doughnut">Gráfico Circular</option>
                        <option value="pie">Gráfico de Pastel</option>
                    </select>
                </div>
        `;

        // Si no es institución, agregar filtros de fecha
        if (tipo !== 'institucion') {
            html += `
                <!-- Fecha Inicial -->
                <div class="filter-group">
                    <label><i class="fas fa-calendar-alt"></i> Fecha Inicial:</label>
                    <input type="date" id="modalFechaInicio" class="filter-input">
                </div>
                
                <!-- Fecha Final -->
                <div class="filter-group">
                    <label><i class="fas fa-calendar-alt"></i> Fecha Final:</label>
                    <input type="date" id="modalFechaFin" class="filter-input">
                </div>
            `;
        }

        // Agregar filtro de institución para todos los tipos
        html += `
                <!-- Institución -->
                <div class="filter-group">
                    <label><i class="fas fa-university"></i> Institución:</label>
                    <select id="modalInstitucion" class="filter-select">
                        <option value="todas">Todas las instituciones</option>
                        ${Object.keys(datosInstituciones.datosCompletos || {}).map(inst => 
                            `<option value="${inst}">${inst}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <!-- Número de resultados -->
                <div class="filter-group">
                    <label><i class="fas fa-list-ol"></i> Mostrar:</label>
                    <select id="modalCantidad" class="filter-select">
                        <option value="5">Top 5</option>
                        <option value="10" selected>Top 10</option>
                        <option value="15">Top 15</option>
                        <option value="20">Top 20</option>
                        <option value="0">Todos</option>
                    </select>
                </div>
                
                <!-- Ordenar por -->
                <div class="filter-group">
                    <label><i class="fas fa-sort-amount-down"></i> Ordenar por:</label>
                    <select id="modalOrden" class="filter-select">
                        <option value="desc">Mayor a menor</option>
                        <option value="asc">Menor a mayor</option>
                        <option value="alpha">Alfabético</option>
                    </select>
                </div>
            </div>
        </div>
        `;

        return html;
    }

    // Función para abrir modal de institución CON FILTROS DENTRO
    function abrirModalInstitucion(tipoGrafica) {
        const modal = document.getElementById("chartModalInstitucion");
        if (!modal) {
            console.error('Modal no encontrado');
            return;
        }
        
        // Limpiar modal anterior
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = '';
        }
        
        modal.classList.add("show");
        
        // Actualizar contenido del modal
        actualizarContenidoModal('institucion', tipoGrafica);
        
        // Crear gráfica ampliada
        setTimeout(() => {
            crearGraficaAmpliadaInstitucion(tipoGrafica);
            llenarTablaModalInstitucion();
        }, 100);
    }

    // Función para abrir modal de tiempo CON FILTROS DENTRO
    function abrirModalTiempo(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalInstitucion");
        if (!modal) {
            console.error('Modal no encontrado');
            return;
        }
        
        // Limpiar modal anterior
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = '';
        }
        
        modal.classList.add("show");
        
        // Actualizar contenido del modal
        actualizarContenidoModal(tipo, tipoGrafica);
        
        // Crear gráfica ampliada
        setTimeout(() => {
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
            llenarTablaModalTiempo(tipo);
        }, 100);
    }

    // Función para actualizar contenido del modal con filtros
    function actualizarContenidoModal(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalInstitucion");
        if (!modal) return;
        
        // Crear contenido completo del modal
        const titulo = tipo === 'institucion' ? 'Distribución por Institución' : getTituloTiempo(tipo);
        const iconoTitulo = tipo === 'institucion' ? 'fa-school' : 
                           tipo === 'fecha' ? 'fa-calendar-day' : 
                           tipo === 'mes' ? 'fa-calendar-week' : 'fa-calendar-alt';
        
        const html = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title" id="modalTitleInstitucion">
                        <i class="fas ${iconoTitulo}"></i> ${titulo} - Vista Ampliada
                    </div>
                    <div class="modal-actions">
                        <button class="download-btn-small secondary" onclick="window.InstitucionManager.descargarPNG()">
                            <i class="fas fa-image"></i> PNG
                        </button>
                        <button class="download-btn-small" onclick="window.InstitucionManager.descargarExcelModal()">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <span class="close" onclick="window.InstitucionManager.cerrarModal()">&times;</span>
                    </div>
                </div>

                <!-- FILTROS DENTRO DEL MODAL -->
                ${crearHTMLFiltrosModal(tipo)}

                <div class="modal-chart-container">
                    <canvas id="chartAmpliadoInstitucion"></canvas>
                </div>

                <div class="data-table">
                    <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-table"></i> Datos Detallados
                    </h4>
                    <table class="table" id="tablaDatosInstitucion">
                        <thead>
                            <tr>
                                <th>${tipo === 'institucion' ? 'Institución' : 'Período'}</th>
                                <th>${tipo === 'institucion' ? 'Tipo' : 'Descripción'}</th>
                                <th>Total Visitantes</th>
                                <th>Porcentaje</th>
                                ${tipo !== 'institucion' ? '<th>Tendencia</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="tbodyDatosInstitucion">
                            <!-- Los datos se llenarán dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        modal.innerHTML = html;
        
        // Establecer valor inicial del tipo de gráfica
        const selectTipoGrafica = document.getElementById('modalTipoGrafica');
        if (selectTipoGrafica) {
            selectTipoGrafica.value = tipoGrafica || 'bar';
        }
    }

    // Función para cambiar tipo de gráfica en modal
    function cambiarTipoGraficaModal(tipoGrafica, tipo) {
        tipo = tipo || determinarTipoActual();
        if (tipo === 'institucion') {
            crearGraficaAmpliadaInstitucion(tipoGrafica);
        } else {
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
        }
    }

    // Función para determinar el tipo actual del modal
    function determinarTipoActual() {
        const titulo = document.getElementById('modalTitleInstitucion')?.textContent || '';
        if (titulo.includes('Institución')) return 'institucion';
        if (titulo.includes('Fecha')) return 'fecha';
        if (titulo.includes('Mes')) return 'mes';
        if (titulo.includes('Año')) return 'anio';
        return 'institucion';
    }

    // Función para aplicar filtros del modal
    async function aplicarFiltrosModal() {
        try {
            mostrarLoading('Aplicando filtros...');
            
            const tipoGrafica = document.getElementById('modalTipoGrafica')?.value || 'bar';
            const fechaInicio = document.getElementById('modalFechaInicio')?.value;
            const fechaFin = document.getElementById('modalFechaFin')?.value;
            const institucion = document.getElementById('modalInstitucion')?.value || 'todas';
            const cantidad = parseInt(document.getElementById('modalCantidad')?.value || '10');
            const orden = document.getElementById('modalOrden')?.value || 'desc';
            
            const tipo = determinarTipoActual();
            let datosFiltrados;
            
            if (tipo === 'institucion') {
                // Filtrar datos de instituciones
                datosFiltrados = await filtrarDatosInstitucionModal(institucion, cantidad, orden);
                crearGraficaAmpliadaInstitucionConDatos(datosFiltrados, tipoGrafica);
                llenarTablaModalInstitucionConDatos(datosFiltrados);
            } else {
                // Filtrar datos de tiempo
                datosFiltrados = await filtrarDatosTiempoModal(tipo, fechaInicio, fechaFin, institucion, cantidad, orden);
                crearGraficaAmpliadaTiempoConDatos(tipo, datosFiltrados, tipoGrafica);
                llenarTablaModalTiempoConDatos(tipo, datosFiltrados);
            }
            
            mostrarExito(`Filtros aplicados: ${datosFiltrados.total || 0} registros encontrados`);
            cerrarLoading();
            
        } catch (error) {
            console.error('Error aplicando filtros:', error);
            cerrarLoading();
            mostrarError('Error al aplicar los filtros: ' + error.message);
        }
    }

    // Función para filtrar datos de institución en modal
    async function filtrarDatosInstitucionModal(institucion, cantidad, orden) {
        let datos = { ...datosInstituciones };
        
        // Filtrar por institución específica
        if (institucion !== 'todas') {
            const index = datos.labels.indexOf(institucion);
            if (index !== -1) {
                datos = {
                    labels: [institucion],
                    values: [datos.values[index]],
                    total: datos.values[index],
                    datosCompletos: { [institucion]: datos.values[index] }
                };
            }
        }
        
        // Ordenar datos
        if (orden === 'desc') {
            // Orden descendente (mayor a menor)
            const indices = datos.labels
                .map((label, i) => ({ label, value: datos.values[i] }))
                .sort((a, b) => b.value - a.value)
                .map(item => datos.labels.indexOf(item.label));
            
            datos.labels = indices.map(i => datos.labels[i]);
            datos.values = indices.map(i => datos.values[i]);
        } else if (orden === 'asc') {
            // Orden ascendente (menor a mayor)
            const indices = datos.labels
                .map((label, i) => ({ label, value: datos.values[i] }))
                .sort((a, b) => a.value - b.value)
                .map(item => datos.labels.indexOf(item.label));
            
            datos.labels = indices.map(i => datos.labels[i]);
            datos.values = indices.map(i => datos.values[i]);
        } else if (orden === 'alpha') {
            // Orden alfabético
            const indices = datos.labels
                .map((label, i) => ({ label, value: datos.values[i] }))
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(item => datos.labels.indexOf(item.label));
            
            datos.labels = indices.map(i => datos.labels[i]);
            datos.values = indices.map(i => datos.values[i]);
        }
        
        // Limitar cantidad
        if (cantidad > 0 && cantidad < datos.labels.length) {
            datos.labels = datos.labels.slice(0, cantidad);
            datos.values = datos.values.slice(0, cantidad);
            datos.total = datos.values.reduce((a, b) => a + b, 0);
        }
        
        return datos;
    }

    // Función para filtrar datos de tiempo en modal
    async function filtrarDatosTiempoModal(tipo, fechaInicio, fechaFin, institucion, cantidad, orden) {
        let query = supabase
            .from('participantes_reserva')
            .select('fecha_visita, id_institucion')
            .not('fecha_visita', 'is', null);
        
        // Aplicar filtros de fecha si existen
        if (fechaInicio) {
            query = query.gte('fecha_visita', fechaInicio + 'T00:00:00');
        }
        if (fechaFin) {
            query = query.lte('fecha_visita', fechaFin + 'T23:59:59');
        }
        
        // Filtrar por institución si no es "todas"
        if (institucion !== 'todas') {
            const institucionObj = todasLasInstituciones.find(inst => inst.nombre_institucion === institucion);
            if (institucionObj) {
                query = query.eq('id_institucion', institucionObj.id_institucion);
            }
        }
        
        const { data: participantes, error } = await query;
        if (error) throw error;
        
        // Procesar datos
        const conteo = {};
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
                
                conteo[clave] = (conteo[clave] || 0) + 1;
            }
        });
        
        // Convertir a arrays
        let labels = Object.keys(conteo);
        let values = Object.values(conteo);
        
        // Ordenar
        if (orden === 'desc') {
            const indices = labels
                .map((label, i) => ({ label, value: values[i] }))
                .sort((a, b) => b.value - a.value)
                .map(item => labels.indexOf(item.label));
            
            labels = indices.map(i => labels[i]);
            values = indices.map(i => values[i]);
        } else if (orden === 'asc') {
            const indices = labels
                .map((label, i) => ({ label, value: values[i] }))
                .sort((a, b) => a.value - b.value)
                .map(item => labels.indexOf(item.label));
            
            labels = indices.map(i => labels[i]);
            values = indices.map(i => values[i]);
        } else if (orden === 'alpha') {
            const indices = labels
                .map((label, i) => ({ label, value: values[i] }))
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(item => labels.indexOf(item.label));
            
            labels = indices.map(i => labels[i]);
            values = indices.map(i => values[i]);
        }
        
        // Limitar cantidad
        if (cantidad > 0 && cantidad < labels.length) {
            labels = labels.slice(0, cantidad);
            values = values.slice(0, cantidad);
        }
        
        return {
            labels: labels,
            values: values,
            total: values.reduce((a, b) => a + b, 0)
        };
    }

    // Función para crear gráfica con datos filtrados de institución
    function crearGraficaAmpliadaInstitucionConDatos(datosFiltrados, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoInstitucion");
        if (!ctx) return;

        if (chartAmpliadoInstitucion) {
            chartAmpliadoInstitucion.destroy();
        }

        const colors = generarColoresInstitucion(datosFiltrados.labels.length);
        const tipoChart = tipoGrafica;

        chartAmpliadoInstitucion = new Chart(ctx, {
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
                        text: 'Distribución por Institución (Filtrado)',
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

    // Función para crear gráfica con datos filtrados de tiempo
    function crearGraficaAmpliadaTiempoConDatos(tipo, datosFiltrados, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoInstitucion");
        if (!ctx) return;

        if (chartAmpliadoInstitucion) {
            chartAmpliadoInstitucion.destroy();
        }

        const colors = generarColoresTiempo(tipo, datosFiltrados.labels.length);
        const tipoChart = tipoGrafica;

        chartAmpliadoInstitucion = new Chart(ctx, {
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
                        text: `${getTituloTiempo(tipo)} (Filtrado)`,
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
                            text: getTituloTiempo(tipo).split(' ')[2] || 'Período',
                            font: { weight: 'bold', size: 14 }
                        },
                        ticks: {
                            maxRotation: tipo === 'fecha' ? 45 : 0,
                            minRotation: 0
                        }
                    }
                } : {},
                cutout: tipoChart === "bar" ? '0%' : (tipoChart === 'doughnut' ? '40%' : '0%')
            },
        });
    }

    // Función para llenar tabla con datos filtrados de institución
    function llenarTablaModalInstitucionConDatos(datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosInstitucion");
        if (!tbody) return;

        tbody.innerHTML = datosFiltrados.labels.map((institucion, index) => {
            const cantidad = datosFiltrados.values[index];
            const porcentaje = datosFiltrados.total > 0 ? ((cantidad / datosFiltrados.total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoInstitucion(institucion);
            
            return `
                <tr>
                    <td><strong>${institucion}</strong></td>
                    <td>${tipo}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                </tr>
            `;
        }).join('') + (datosFiltrados.total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${datosFiltrados.total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
            </tr>
        ` : '');
    }

    // Función para llenar tabla con datos filtrados de tiempo
    function llenarTablaModalTiempoConDatos(tipo, datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosInstitucion");
        if (!tbody) return;

        tbody.innerHTML = datosFiltrados.labels.map((label, index) => {
            const valor = datosFiltrados.values[index];
            const porcentaje = datosFiltrados.total > 0 ? ((valor / datosFiltrados.total) * 100).toFixed(1) : 0;
            
            // Calcular tendencia
            let tendencia = '';
            if (index > 0) {
                const valorAnterior = datosFiltrados.values[index - 1];
                const diferencia = valor - valorAnterior;
                const porcentajeCambio = valorAnterior > 0 ? ((diferencia / valorAnterior) * 100).toFixed(1) : 100;
                
                if (diferencia > 0) {
                    tendencia = `<span style="color: #27ae60;"><i class="fas fa-arrow-up"></i> ${porcentajeCambio}%</span>`;
                } else if (diferencia < 0) {
                    tendencia = `<span style="color: #e74c3c;"><i class="fas fa-arrow-down"></i> ${Math.abs(porcentajeCambio)}%</span>`;
                } else {
                    tendencia = `<span style="color: #f39c12;"><i class="fas fa-minus"></i> 0%</span>`;
                }
            } else {
                tendencia = '<span style="color: #95a5a6;">-</span>';
            }
            
            return `
                <tr>
                    <td><strong>${label}</strong></td>
                    <td>${getDescripcionTiempo(tipo, label)}</td>
                    <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                    <td style="text-align: center;">${tendencia}</td>
                </tr>
            `;
        }).join('') + (datosFiltrados.total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${datosFiltrados.total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td style="text-align: center;">-</td>
            </tr>
        ` : '');
    }

    // Función para limpiar filtros del modal
    function limpiarFiltrosModal() {
        // Limpiar todos los filtros
        document.querySelectorAll('.filter-input, .filter-select').forEach(element => {
            if (element.tagName === 'SELECT') {
                if (element.id === 'modalTipoGrafica') {
                    element.value = 'bar';
                } else if (element.id === 'modalCantidad') {
                    element.value = '10';
                } else if (element.id === 'modalOrden') {
                    element.value = 'desc';
                } else if (element.id === 'modalInstitucion') {
                    element.value = 'todas';
                }
            } else if (element.tagName === 'INPUT') {
                element.value = '';
            }
        });
        
        // Recargar gráfica original
        const tipo = determinarTipoActual();
        const tipoGrafica = document.getElementById('modalTipoGrafica')?.value || 'bar';
        
        if (tipo === 'institucion') {
            crearGraficaAmpliadaInstitucion(tipoGrafica);
            llenarTablaModalInstitucion();
        } else {
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
            llenarTablaModalTiempo(tipo);
        }
        
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    }

    // Función para cerrar modal
    function cerrarModalInstitucion() {
        const modal = document.getElementById("chartModalInstitucion");
        if (modal) {
            modal.classList.remove("show");
        }
    }

    // Crear gráfica ampliada de institución
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

    // Llenar tabla del modal de institución
    function llenarTablaModalInstitucion() {
        const tbody = document.getElementById("tbodyDatosInstitucion");
        if (!tbody) return;

        const { labels, values, total } = datosInstituciones;

        tbody.innerHTML = labels.map((institucion, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoInstitucion(institucion);
            
            return `
                <tr>
                    <td><strong>${institucion}</strong></td>
                    <td>${tipo}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
            </tr>
        ` : '');
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
        const colors = generarColoresTiempo(tipo, datos.labels.length);
        const total = datos.values.reduce((a, b) => a + b, 0);
        const tipoChart = tipoGrafica;

        chartAmpliadoInstitucion = new Chart(ctx, {
            type: tipoChart,
            data: {
                labels: datos.labels,
                datasets: [{
                    label: "Cantidad de Visitantes",
                    data: datos.values,
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
                            text: getTituloTiempo(tipo).split(' ')[2] || 'Período',
                            font: { weight: 'bold', size: 14 }
                        },
                        ticks: {
                            maxRotation: tipo === 'fecha' ? 45 : 0,
                            minRotation: 0
                        }
                    }
                } : {},
                cutout: tipoChart === "bar" ? '0%' : (tipoChart === 'doughnut' ? '40%' : '0%')
            },
        });
    }

    // Llenar tabla del modal de tiempo
    function llenarTablaModalTiempo(tipo) {
        const tbody = document.getElementById("tbodyDatosInstitucion");
        if (!tbody) return;

        const datos = getDatosTiempo(tipo);
        const total = datos.values.reduce((a, b) => a + b, 0);

        tbody.innerHTML = datos.labels.map((label, index) => {
            const valor = datos.values[index];
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            
            // Calcular tendencia
            let tendencia = '';
            if (index > 0) {
                const valorAnterior = datos.values[index - 1];
                const diferencia = valor - valorAnterior;
                const porcentajeCambio = valorAnterior > 0 ? ((diferencia / valorAnterior) * 100).toFixed(1) : 100;
                
                if (diferencia > 0) {
                    tendencia = `<span style="color: #27ae60;"><i class="fas fa-arrow-up"></i> ${porcentajeCambio}%</span>`;
                } else if (diferencia < 0) {
                    tendencia = `<span style="color: #e74c3c;"><i class="fas fa-arrow-down"></i> ${Math.abs(porcentajeCambio)}%</span>`;
                } else {
                    tendencia = `<span style="color: #f39c12;"><i class="fas fa-minus"></i> 0%</span>`;
                }
            } else {
                tendencia = '<span style="color: #95a5a6;">-</span>';
            }
            
            return `
                <tr>
                    <td><strong>${label}</strong></td>
                    <td>${getDescripcionTiempo(tipo, label)}</td>
                    <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                    <td style="text-align: center;">${tendencia}</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td style="text-align: center;">-</td>
            </tr>
        ` : '');
    }

    // =============================================
    // FUNCIONES DE DESCARGA
    // =============================================

    function descargarGraficoPrincipal() {
        if (chartBarInstitucion) {
            const link = document.createElement("a");
            link.download = "grafica_instituciones_principal.png";
            link.href = chartBarInstitucion.canvas.toDataURL("image/png");
            link.click();
        }
    }

    function descargarGraficoPrincipalTiempo(tipo) {
        let chart;
        switch(tipo) {
            case 'fecha': chart = chartFechaBar; break;
            case 'mes': chart = chartMesBar; break;
            case 'anio': chart = chartAnioBar; break;
        }
        
        if (chart) {
            const link = document.createElement("a");
            link.download = `grafica_${tipo}_principal.png`;
            link.href = chart.canvas.toDataURL("image/png");
            link.click();
        }
    }

    function descargarExcel() {
        const { labels, values, total } = datosInstituciones;
        
        const datosExcel = [
            ['Institución', 'Total Visitantes', 'Porcentaje'],
            ...labels.map((label, i) => {
                const porcentaje = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
                return [label, values[i], `${porcentaje}%`];
            }),
            ['TOTAL', total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos por Institución");
        XLSX.writeFile(wb, "reporte_instituciones.xlsx");
    }

    function descargarExcelTiempo(tipo) {
        const datos = getDatosTiempo(tipo);
        
        const datosExcel = [
            [getTituloTiempo(tipo).split(' ')[1], 'Total Visitantes', 'Porcentaje'],
            ...datos.labels.map((label, i) => {
                const porcentaje = datos.total > 0 ? ((datos.values[i] / datos.total) * 100).toFixed(1) : 0;
                return [label, datos.values[i], `${porcentaje}%`];
            }),
            ['TOTAL', datos.total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, `Datos por ${tipo}`);
        XLSX.writeFile(wb, `reporte_${tipo}.xlsx`);
    }

    function exportarDatosFiltrados() {
        Swal.fire({
            icon: 'info',
            title: 'Exportar Datos',
            text: 'Función de exportación de datos filtrados',
            confirmButtonColor: '#3498db'
        });
    }

    // =============================================
    // API PÚBLICA COMPLETA
    // =============================================

    // Inicializar el objeto global
    if (!window.InstitucionManager) {
        window.InstitucionManager = {};
    }

    // Función para inicializar la API completa
    function inicializarAPICompleta() {
        // Métodos de modal con filtros
        window.InstitucionManager.abrirModal = (tipo) => abrirModalInstitucion(tipo);
        window.InstitucionManager.abrirModalTiempo = (tipo, tipoGrafica) => abrirModalTiempo(tipo, tipoGrafica);
        window.InstitucionManager.cerrarModal = () => cerrarModalInstitucion();
        window.InstitucionManager.aplicarFiltrosModal = () => aplicarFiltrosModal();
        window.InstitucionManager.limpiarFiltrosModal = () => limpiarFiltrosModal();
        
        // Métodos de descarga
        window.InstitucionManager.descargarPNG = () => {
            const canvas = document.getElementById("chartAmpliadoInstitucion");
            if (canvas) {
                const link = document.createElement("a");
                link.download = "grafica_ampliada.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        };
        
        window.InstitucionManager.descargarExcelModal = () => {
            const titulo = document.getElementById('modalTitleInstitucion')?.textContent || 'Reporte';
            const tbody = document.getElementById("tbodyDatosInstitucion");
            if (!tbody) return;
            
            const filas = tbody.querySelectorAll('tr');
            const datosExcel = [];
            
            // Obtener encabezados de la tabla
            const thead = document.querySelector('#tablaDatosInstitucion thead');
            const encabezados = [];
            if (thead) {
                const ths = thead.querySelectorAll('th');
                ths.forEach(th => encabezados.push(th.textContent.trim()));
                datosExcel.push(encabezados);
            } else {
                // Encabezados por defecto
                datosExcel.push(['Institución/Período', 'Descripción', 'Total Visitantes', 'Porcentaje', 'Tendencia']);
            }
            
            // Obtener datos de las filas
            filas.forEach(fila => {
                const celdas = fila.querySelectorAll('td');
                if (celdas.length > 0) {
                    const filaDatos = [];
                    celdas.forEach(celda => filaDatos.push(celda.textContent.trim()));
                    datosExcel.push(filaDatos);
                }
            });
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(datosExcel);
            XLSX.utils.book_append_sheet(wb, ws, "Datos Filtrados");
            XLSX.writeFile(wb, "reporte_filtrado.xlsx");
        };

        // Métodos principales
        window.InstitucionManager.inicializar = () => cargarDatosCompletos();
        window.InstitucionManager.cambiarTipoReporte = (tipo) => cambiarTipoReporte(tipo);
        
        // Métodos de filtrado principal
        window.InstitucionManager.aplicarFiltrosCombinados = () => aplicarFiltrosCombinados();
        window.InstitucionManager.limpiarFiltrosCombinados = () => limpiarFiltrosCombinados();
        window.InstitucionManager.exportarDatosFiltrados = () => exportarDatosFiltrados();
        
        // Métodos para tiempo
        window.InstitucionManager.descargarGraficoPrincipalTiempo = (tipo) => descargarGraficoPrincipalTiempo(tipo);
        window.InstitucionManager.descargarExcelTiempo = (tipo) => descargarExcelTiempo(tipo);

        // Métodos generales
        window.InstitucionManager.descargarGraficoPrincipal = () => descargarGraficoPrincipal();
        window.InstitucionManager.descargarExcel = () => descargarExcel();
    }

    // Inicializar la API completa
    inicializarAPICompleta();

    console.log('✅ Sistema de Institución con filtros en modal cargado correctamente');

    // Auto-inicializar
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (window.InstitucionManager && window.InstitucionManager.inicializar) {
                window.InstitucionManager.inicializar();
            }
        }, 1000);
    });

})();