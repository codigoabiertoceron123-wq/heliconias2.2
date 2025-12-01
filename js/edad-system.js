// js/edad-system.js - VERSIÓN COMPLETA Y FUNCIONAL
(function() {
    'use strict';
    
 
    let chartBarEdad, chartPieEdad, chartAmpliadoEdad;
    
    let tipoActualEdad = "edad";
    let datosSimuladosEdad = {};
    let datosOriginalesEdad = {};
    let datosFecha = {};
    let datosMes = {};
    let datosAnio = {};
    let chartFechaBar, chartFechaPie, chartMesBar, chartMesPie, chartAnioBar, chartAnioPie;

    // Agregar junto con las otras variables
    let datosFechaInteligente = {};
    let datosMesInteligente = {};
    let datosAnioInteligente = {};

    // Datos para vistas combinadas
    let datosFechaCombinado = {};
    let datosMesCombinado = {};
    let datosAnioCombinado = {};

    // Paletas de colores específicas para edad
    const coloresPorEdad = {
        '0-17': '#27ae60', '18-25': '#3498db', '26-35': '#f39c12',
        '36-50': '#e67e22', '51-65': '#9b59b6', '66+': '#e74c3c'
    };

    // Paletas de colores para fecha, mes y año
    const coloresPorTiempo = {
        fecha: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'],
        mes: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#d35400', '#27ae60', '#8e44ad', '#16a085', '#c0392b', '#2980b9'],
        anio: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c']
    };

   

    function calcularEdad(fechaNacimiento) {
        try {
            const nacimiento = new Date(fechaNacimiento);
            const hoy = new Date();
            
            if (isNaN(nacimiento.getTime())) {
                return null;
            }
            
            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad--;
            }
            
            return edad >= 0 ? edad : null;
        } catch (error) {
            console.error('Error calculando edad:', error);
            return null;
        }
    }

    function clasificarEdad(edad) {
        if (edad <= 17) return '0-17';
        if (edad <= 25) return '18-25';
        if (edad <= 35) return '26-35';
        if (edad <= 50) return '36-50';
        if (edad <= 65) return '51-65';
        return '66+';
    }

    async function cargarDatosEdades() {
        try {
            mostrarLoadingEdad('Cargando datos de edad...');

            console.log('Consultando datos de edades...');
            
            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select(`
                    fecha_nacimiento,
                    fecha_visita,
                    id_genero,
                    nombre,
                    apellido,
                    genero!inner(genero)
                `)
                .not('fecha_nacimiento', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                procesarDatosEdades(participantes);
                mostrarDatosEdad();
            } else {
                mostrarSinDatosEdad();
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error('Error cargando edades:', error);
            cerrarLoadingEdad();
            mostrarErrorEdad(error.message);
        }
    }

    function procesarDatosEdades(participantes) {
        const conteoEdades = {
            '0-17': 0, '18-25': 0, '26-35': 0, 
            '36-50': 0, '51-65': 0, '66+': 0
        };

        const edadesIndividuales = [];
        let sumaEdades = 0;
        let totalConEdad = 0;

        participantes.forEach(participante => {
            const fechaNacimiento = participante.fecha_nacimiento;
            if (fechaNacimiento) {
                const edad = calcularEdad(fechaNacimiento);
                if (edad !== null && edad >= 0 && edad <= 120) {
                    const categoria = clasificarEdad(edad);
                    conteoEdades[categoria]++;
                    edadesIndividuales.push(edad);
                    sumaEdades += edad;
                    totalConEdad++;
                }
            }
        });

        const edadPromedio = totalConEdad > 0 ? Math.round(sumaEdades / totalConEdad) : 0;
        const edadMinima = edadesIndividuales.length > 0 ? Math.min(...edadesIndividuales) : 0;
        const edadMaxima = edadesIndividuales.length > 0 ? Math.max(...edadesIndividuales) : 0;

        // Actualizar estadísticas
        document.getElementById('total-visitantes').textContent = totalConEdad.toLocaleString();
        document.getElementById('edad-promedio').textContent = edadPromedio + ' años';
        document.getElementById('total-grupos').textContent = Object.values(conteoEdades).filter(val => val > 0).length;

        datosSimuladosEdad = {
            edad: {
                labels: Object.keys(conteoEdades),
                values: Object.values(conteoEdades)
            },
            estadisticas: {
                total: totalConEdad,
                promedio: edadPromedio,
                minima: edadMinima,
                maxima: edadMaxima
            },
            datosOriginales: participantes
        };

        datosOriginalesEdad = JSON.parse(JSON.stringify(datosSimuladosEdad));
    }

    function mostrarDatosEdad() {
        const container = document.getElementById('data-container');
        const stats = datosSimuladosEdad.estadisticas;
        
        container.innerHTML = `
            <div class="chart-controls">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-user"></i> Estadísticas por Edad
                        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                            ${stats.total} participantes
                        </span>
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="download-btn" onclick="window.EdadSystem.descargarGraficoPrincipal()">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                        <button class="download-btn" onclick="window.EdadSystem.mostrarFiltrosAvanzados()" style="background: linear-gradient(135deg, #e67e22, #f39c12);">
                            <i class="fas fa-filter"></i> Filtros Avanzados
                        </button>
                    </div>
                </div>
                <!-- Filtros Avanzados (ocultos inicialmente) -->
                <div id="filtros-avanzados-edad" style="display: none; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-filter"></i> Filtros Avanzados
                    </h4>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <div class="filtro-grupo">
                            <label for="filtro-fecha-inicial"><i class="fas fa-calendar-alt"></i> Fecha Inicial:</label>
                            <input type="date" id="filtro-fecha-inicial">
                        </div>
                        <div class="filtro-grupo">
                            <label for="filtro-fecha-final"><i class="fas fa-calendar-alt"></i> Fecha Final:</label>
                            <input type="date" id="filtro-fecha-final">
                        </div>
                        <div class="filtro-grupo">
                            <label for="filtro-rango-edad"><i class="fas fa-user"></i> Rango de Edad:</label>
                            <select id="filtro-rango-edad">
                                <option value="todos">Todos los rangos</option>
                                <option value="0-17">0-17 años</option>
                                <option value="18-25">18-25 años</option>
                                <option value="26-35">26-35 años</option>
                                <option value="36-50">36-50 años</option>
                                <option value="51-65">51-65 años</option>
                                <option value="66+">66+ años</option>
                            </select>
                        </div>
                        <div class="filtro-grupo">
                            <button class="btn btn-primary" onclick="window.EdadSystem.aplicarFiltros()" style="margin-top: 22px;">
                                <i class="fas fa-check"></i> Aplicar Filtros
                            </button>
                            <button class="btn" onclick="window.EdadSystem.limpiarFiltros()" style="margin-top: 22px; background: #95a5a6; color: white;">
                                <i class="fas fa-times"></i> Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card" onclick="window.EdadSystem.abrirModalEdad('bar')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> Distribución por Edad - Barras
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartBarEdad"></canvas>
                    </div>
                </div>

                <div class="chart-card" onclick="window.EdadSystem.abrirModalEdad('pie')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> Distribución por Edad - Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap pie-chart-container">
                        <canvas id="chartPieEdad"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por Grupos de Edad
                    </h3>
                    <button class="download-btn" onclick="window.EdadSystem.descargarExcel()">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 700px;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th style="min-width: 120px;">Grupo de Edad</th>
                                <th style="min-width: 100px;">Rango</th>
                                <th style="width: 120px;">Total Visitantes</th>
                                <th style="width: 100px;">Porcentaje</th>
                                <th style="min-width: 150px;">Descripción</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-edad-body">
                            ${generarFilasTablaEdad()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Agregar estilos para los filtros
        agregarEstilosFiltros();
        mostrarGraficasEdad();
    }

    // Función principal para cargar datos de tiempo
    async function cargarDatosTiempo(tipo) {
        try {
            mostrarLoadingEdad(`Cargando datos por ${tipo}...`);

            console.log(`📊 Cargando datos para: ${tipo}`);
            
            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('fecha_visita, fecha_nacimiento')
                .not('fecha_visita', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                procesarDatosTiempo(participantes, tipo);
                mostrarInterfazTiempo(tipo);
            } else {
                mostrarSinDatosTiempo(tipo);
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error(`Error cargando datos de ${tipo}:`, error);
            cerrarLoadingEdad();
            mostrarErrorEdad(`Error al cargar datos de ${tipo}: ` + error.message);
        }
    }

    function mostrarOcultarFiltros() {
        const container = document.getElementById('data-container');
        // Crear contenedor de filtros si no existe
        if (!document.getElementById('filtros-combinados')) {
            const filtrosHTML = `
                <div id="filtros-combinados" style="display: none; margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e9ecef;">
                    <h4 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px; color: #2c3e50;">
                        <i class="fas fa-filter"></i> Filtros Combinados
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="font-weight: 600; margin-bottom: 5px; display: block; font-size: 0.9rem;">
                                <i class="fas fa-calendar-alt"></i> Fecha Inicial
                            </label>
                            <input type="date" id="filtro-fecha-inicial" class="form-control" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd;">
                        </div>
                        <div>
                            <label style="font-weight: 600; margin-bottom: 5px; display: block; font-size: 0.9rem;">
                                <i class="fas fa-calendar-alt"></i> Fecha Final
                            </label>
                            <input type="date" id="filtro-fecha-final" class="form-control" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd;">
                        </div>
                        <div>
                            <label style="font-weight: 600; margin-bottom: 5px; display: block; font-size: 0.9rem;">
                                <i class="fas fa-user"></i> Rango de Edad
                            </label>
                            <select id="filtro-rango-edad" class="form-control" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd;">
                                <option value="todos">Todos los rangos</option>
                                <option value="0-17">0-17 años</option>
                                <option value="18-25">18-25 años</option>
                                <option value="26-35">26-35 años</option>
                                <option value="36-50">36-50 años</option>
                                <option value="51-65">51-65 años</option>
                                <option value="66+">66+ años</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="window.EdadSystem.aplicarFiltrosCombinados()">
                            <i class="fas fa-check"></i> Aplicar Filtros
                        </button>
                        <button class="btn btn-secondary" onclick="window.EdadSystem.limpiarFiltrosCombinados()">
                            <i class="fas fa-times"></i> Limpiar Filtros
                        </button>
                    </div>
                </div>
            `;
            
            // Insertar al inicio del contenedor
            container.insertAdjacentHTML('afterbegin', filtrosHTML);
        }

        const filtrosDiv = document.getElementById('filtros-combinados');
        if (filtrosDiv.style.display === 'none') {
            filtrosDiv.style.display = 'block';
            // Establecer fechas por defecto (último año)
            const ahora = new Date();
            const haceUnAnio = new Date();
            haceUnAnio.setFullYear(ahora.getFullYear() - 1);
            
            document.getElementById('filtro-fecha-inicial').value = haceUnAnio.toISOString().split('T')[0];
            document.getElementById('filtro-fecha-final').value = ahora.toISOString().split('T')[0];
        } else {
            filtrosDiv.style.display = 'none';
        }
    }

    // Procesar datos por tiempo
    function procesarDatosTiempo(participantes, tipo) {
        const conteo = {};
        const ahora = new Date();
        
        participantes.forEach(participante => {
            if (participante.fecha_visita) {
                const fecha = new Date(participante.fecha_visita);
                let clave = '';
                
                switch(tipo) {
                    case 'fecha':
                        // Formato: YYYY-MM-DD
                        clave = fecha.toISOString().split('T')[0];
                        break;
                    case 'mes':
                        // Formato: YYYY-MM (Enero 2024)
                        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        clave = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                        break;
                    case 'anio':
                        // Formato: YYYY
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
                // Ordenar fechas cronológicamente
                labels = Object.keys(conteo).sort((a, b) => new Date(a) - new Date(b));
                // Tomar las últimas 10 fechas (más recientes)
                labels = labels.slice(-10);
                break;
            case 'mes':
                // Ordenar meses cronológicamente
                labels = Object.keys(conteo).sort((a, b) => {
                    const [mesA, añoA] = a.split(' ');
                    const [mesB, añoB] = b.split(' ');
                    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    return new Date(añoA, meses.indexOf(mesA)) - new Date(añoB, meses.indexOf(mesB));
                });
                break;
            case 'anio':
                // Ordenar años cronológicamente
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

        console.log(`✅ Datos ${tipo} procesados:`, datosTiempo);
    }

    // Mostrar interfaz para fecha, mes o año
    function mostrarInterfazTiempo(tipo) {
        const container = document.getElementById('data-container');
        const datos = getDatosTiempo(tipo);
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
                        <button class="download-btn" onclick="window.EdadSystem.descargarGraficoPrincipalTiempo('${tipo}')">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                        <button class="btn" onclick="window.EdadSystem.mostrarOcultarFiltros()" style="background: linear-gradient(135deg, #e67e22, #f39c12); color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-filter"></i> Filtros
                        </button>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card" onclick="window.EdadSystem.abrirModalTiempo('${tipo}', 'bar')">
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

                <div class="chart-card" onclick="window.EdadSystem.abrirModalTiempo('${tipo}', 'pie')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> ${titulo} - Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap pie-chart-container">
                        <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Pie"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por ${titulo.split(' ')[1]}
                    </h3>
                    <button class="download-btn" onclick="window.EdadSystem.descargarExcelTiempo('${tipo}')">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 700px;">
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

  

    async function aplicarFiltrosCombinados() {
        try {
            const fechaInicial = document.getElementById('filtro-fecha-inicial').value;
            const fechaFinal = document.getElementById('filtro-fecha-final').value;
            const rangoEdad = document.getElementById('filtro-rango-edad').value;

            // Validar fechas
            if (!fechaInicial || !fechaFinal) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fechas requeridas',
                    text: 'Por favor selecciona ambas fechas'
                });
                return;
            }

            if (fechaInicial > fechaFinal) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fechas inválidas',
                    text: 'La fecha inicial no puede ser mayor que la fecha final'
                });
                return;
            }

            mostrarLoadingEdad('Aplicando filtros...');

            // Determinar qué tipo de reporte estamos viendo
            const tipoReporte = obtenerTipoReporteActual();
            
            if (tipoReporte === 'edad') {
                // Para reporte de edad
                await aplicarFiltrosEdadCombinado(fechaInicial, fechaFinal, rangoEdad);
            } else {
                // Para reporte de tiempo (fecha/mes/año)
                await aplicarFiltrosTiempoCombinado(fechaInicial, fechaFinal, rangoEdad, tipoReporte);
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error('Error aplicando filtros combinados:', error);
            cerrarLoadingEdad();
            mostrarErrorEdad('Error al aplicar los filtros: ' + error.message);
        }
    }

    async function aplicarFiltrosEdadCombinado(fechaInicial, fechaFinal, rangoEdad) {
        try {
            let query = supabase
                .from('participantes_reserva')
                .select(`
                    fecha_nacimiento,
                    fecha_visita,
                    id_genero,
                    nombre,
                    apellido,
                    genero!inner(genero)
                `)
                .not('fecha_nacimiento', 'is', null)
                .gte('fecha_visita', fechaInicial + 'T00:00:00')
                .lte('fecha_visita', fechaFinal + 'T23:59:59');

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                let participantesProcesados = participantesFiltrados;

                // Aplicar filtro adicional por rango de edad si no es "todos"
                if (rangoEdad !== 'todos') {
                    participantesProcesados = participantesFiltrados.filter(participante => {
                        const edad = calcularEdad(participante.fecha_nacimiento);
                        if (edad === null) return false;
                        
                        const categoria = clasificarEdad(edad);
                        return categoria === rangoEdad;
                    });
                }

                if (participantesProcesados.length > 0) {
                    procesarDatosEdades(participantesProcesados);
                    mostrarDatosEdad();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Filtros aplicados',
                        text: `Se encontraron ${participantesProcesados.length} participantes`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    mostrarMensajeNoHayDatos(rangoEdad);
                }
            } else {
                mostrarMensajeNoHayDatos();
            }
            
        } catch (error) {
            throw error;
        }
    }

    async function aplicarFiltrosTiempoCombinado(fechaInicial, fechaFinal, rangoEdad, tipoTiempo) {
        try {
            let query = supabase
                .from('participantes_reserva')
                .select(`
                    fecha_nacimiento,
                    fecha_visita
                `)
                .not('fecha_visita', 'is', null)
                .gte('fecha_visita', fechaInicial + 'T00:00:00')
                .lte('fecha_visita', fechaFinal + 'T23:59:59');

            // Solo incluir participantes con fecha de nacimiento si se filtra por edad
            if (rangoEdad !== 'todos') {
                query = query.not('fecha_nacimiento', 'is', null);
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                // Procesar datos para vista inteligente
                procesarDatosTiempoInteligente(participantesFiltrados, tipoTiempo, rangoEdad);
                mostrarInterfazTiempoInteligente(tipoTiempo, rangoEdad);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Filtros aplicados',
                    text: `Se encontraron ${participantesFiltrados.length} visitas`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                mostrarMensajeNoHayDatos(rangoEdad);
            }
            
        } catch (error) {
            throw error;
        }
    }

    function mostrarMensajeNoHayDatos(rangoEdad = '') {
        let mensaje = 'No hay datos disponibles para los filtros seleccionados';
        if (rangoEdad && rangoEdad !== 'todos') {
            mensaje = `No hay participantes con edad ${rangoEdad} en las fechas seleccionadas`;
        }
        
        Swal.fire({
            icon: 'info',
            title: 'Sin datos',
            text: mensaje,
            confirmButtonColor: '#3498db'
        });
    }

  

    function crearGraficaAmpliadaTiempo(tipo, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoEdad");
        if (!ctx) return;

        // Destruir gráfica anterior si existe
        if (chartAmpliadoEdad) {
            chartAmpliadoEdad.destroy();
        }

        const datos = getDatosTiempo(tipo);
        const colors = generarColoresTiempo(tipo, datos.labels.length);
        const total = datos.values.reduce((a, b) => a + b, 0);

        // Configurar según el tipo de gráfica
        const chartType = tipoGrafica === "bar" ? "bar" : "doughnut";

        chartAmpliadoEdad = new Chart(ctx, {
            type: chartType,
            data: {
                labels: datos.labels,
                datasets: [{
                    label: "Cantidad de Visitantes",
                    data: datos.values,
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
                                const percentage = Math.round((value / total) * 100);
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
    }

   

    function llenarTablaModalTiempo(tipo) {
        const tbody = document.getElementById("tbodyDatosEdad");
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

   

    function getDescripcionTiempo(tipo, label) {
        switch(tipo) {
            case 'fecha':
                return 'Fecha específica de visita';
            case 'mes':
                return 'Mes completo de visitas';
            case 'anio':
                return 'Año completo de visitas';
            default:
                return 'Período de tiempo';
        }
    }


    async function aplicarFiltrosModalTiempo(tipo) {
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio-tiempo')?.value;
        const fechaFin = document.getElementById('modal-filtro-fecha-fin-tiempo')?.value;
        
        console.log('🎯 Aplicando filtros tiempo:', { fechaInicio, fechaFin, tipo });
        
        if (!fechaInicio || !fechaFin) {
            mostrarMensajeSinDatos('Por favor selecciona ambas fechas');
            return;
        }
        
        if (fechaInicio > fechaFin) {
            mostrarMensajeSinDatos('La fecha inicial no puede ser mayor que la fecha final');
            return;
        }

        try {
            mostrarLoadingEdad('Aplicando filtros...');

            const { data: participantesFiltrados, error } = await supabase
                .from('participantes_reserva')
                .select('fecha_visita')
                .not('fecha_visita', 'is', null)
                .gte('fecha_visita', fechaInicio + 'T00:00:00')
                .lte('fecha_visita', fechaFin + 'T23:59:59');

            if (error) throw error;

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                procesarDatosTiempo(participantesFiltrados, tipo);
                crearGraficaAmpliadaTiempo(tipo, 'bar');
                llenarTablaModalTiempo(tipo);
                
                mostrarExitoEdad(`Filtros aplicados: ${participantesFiltrados.length} visitas encontradas`);
            } else {
                mostrarMensajeNoHayDatos();
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error('Error aplicando filtros tiempo:', error);
            cerrarLoadingEdad();
            mostrarErrorEdad('Error al aplicar los filtros: ' + error.message);
        }
    }

    function limpiarFiltrosModalTiempo(tipo) {
        // Limpiar inputs
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio-tiempo');
        const fechaFin = document.getElementById('modal-filtro-fecha-fin-tiempo');
        
        if (fechaInicio) fechaInicio.value = '';
        if (fechaFin) fechaFin.value = '';
        
        // Recargar datos originales
        cargarDatosTiempo(tipo);
        
        mostrarExitoEdad('Filtros limpiados - Mostrando todos los datos');
    }

    // Generar filas de tabla para tiempo
    function generarFilasTablaTiempo(datos, tipo) {
        const total = datos.values.reduce((a, b) => a + b, 0);
        
        return datos.labels.map((label, index) => {
            const valor = datos.values[index];
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            
            // Calcular tendencia (comparar con valor anterior)
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

    // ***** FUNCIONES FALTANTES AÑADIDAS *****

    function mostrarInterfazTiempoInteligente(tipo, rangoEdad) {
        const container = document.getElementById('data-container');
        const datos = getDatosTiempoInteligente(tipo);
        const titulo = getTituloTiempo(tipo);

        const subtitulo = rangoEdad === 'todos' ? 
            'Todas las edades' : 
            `Solo ${rangoEdad} años`;

        container.innerHTML = `
            <div class="chart-controls">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        ${getIconoTiempo(tipo)} ${titulo}
                        <span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                            ${subtitulo}
                        </span>
                    </h3>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> ${titulo} - ${subtitulo}
                        </div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartTiempoInteligente"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por ${titulo.split(' ')[1]}
                    </h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 700px;">
                        <thead>
                            <tr>
                                <th>${titulo.split(' ')[1]}</th>
                                ${rangoEdad === 'todos' ? 
                                    '<th>0-17</th><th>18-25</th><th>26-35</th><th>36-50</th><th>51-65</th><th>66+</th>' : 
                                    `<th>${rangoEdad} años</th>`
                                }
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-inteligente-body">
                            ${generarFilasTablaInteligente(datos, tipo, rangoEdad)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        mostrarGraficaTiempoInteligente(datos, tipo, rangoEdad);
    }

    function procesarDatosTiempoInteligente(participantes, tipo, rangoEdad) {
        console.log(`Procesando para ${tipo} con edad: ${rangoEdad}`);
        
        const datos = {
            labels: [],
            datasets: []
        };

        const conteoPorTiempo = {};
        const todosLosRangos = ['0-17', '18-25', '26-35', '36-50', '51-65', '66+'];

        // Procesar cada participante
        participantes.forEach(participante => {
            if (participante.fecha_visita) {
                const fecha = new Date(participante.fecha_visita);
                const edad = calcularEdad(participante.fecha_nacimiento);
                
                if (edad !== null) {
                    const categoriaEdad = clasificarEdad(edad);
                    
                    // Solo procesar si es "todas" o la edad específica seleccionada
                    if (rangoEdad === 'todos' || categoriaEdad === rangoEdad) {
                        let claveTiempo = '';
                        
                        switch(tipo) {
                            case 'fecha':
                                claveTiempo = fecha.toISOString().split('T')[0];
                                break;
                            case 'mes':
                                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                claveTiempo = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                                break;
                            case 'anio':
                                claveTiempo = fecha.getFullYear().toString();
                                break;
                        }

                        if (!conteoPorTiempo[claveTiempo]) {
                            conteoPorTiempo[claveTiempo] = {
                                '0-17': 0, '18-25': 0, '26-35': 0, 
                                '36-50': 0, '51-65': 0, '66+': 0
                            };
                        }
                        
                        conteoPorTiempo[claveTiempo][categoriaEdad]++;
                    }
                }
            }
        });

        // Preparar datos para gráficas
        datos.labels = Object.keys(conteoPorTiempo).sort((a, b) => {
            switch(tipo) {
                case 'fecha': return new Date(a) - new Date(b);
                case 'mes': return ordenarMeses(a, b);
                case 'anio': return parseInt(a) - parseInt(b);
                default: return 0;
            }
        });

        if (rangoEdad === 'todos') {
            // Mostrar todas las edades
            todosLosRangos.forEach(rango => {
                datos.datasets.push({
                    label: `${rango} años`,
                    data: datos.labels.map(label => conteoPorTiempo[label][rango] || 0),
                    backgroundColor: coloresPorEdad[rango],
                    borderRadius: 8,
                    barThickness: 20,
                });
            });
        } else {
            // Mostrar solo la edad seleccionada
            datos.datasets.push({
                label: `${rangoEdad} años`,
                data: datos.labels.map(label => conteoPorTiempo[label][rangoEdad] || 0),
                backgroundColor: coloresPorEdad[rangoEdad],
                borderRadius: 8,
                barThickness: 35,
            });
        }

        // Guardar datos
        switch(tipo) {
            case 'fecha': datosFechaInteligente = datos; break;
            case 'mes': datosMesInteligente = datos; break;
            case 'anio': datosAnioInteligente = datos; break;
        }

        console.log(`✅ Datos inteligentes ${tipo}:`, datos);
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

    function generarFilasTablaInteligente(datos, tipo, rangoEdad) {
        return datos.labels.map((label, index) => {
            let celdasEdad = '';
            let totalFila = 0;

            if (rangoEdad === 'todos') {
                // Sumar todas las edades para esta fecha/mes/año
                datos.datasets.forEach(dataset => {
                    const valor = dataset.data[index] || 0;
                    celdasEdad += `<td style="text-align: center;">${valor}</td>`;
                    totalFila += valor;
                });
            } else {
                // Solo una edad específica
                const valor = datos.datasets[0].data[index] || 0;
                celdasEdad = `<td style="text-align: center;">${valor}</td>`;
                totalFila = valor;
            }

            return `
                <tr>
                    <td><strong>${label}</strong></td>
                    ${celdasEdad}
                    <td style="text-align: center; font-weight: bold; background: #e8f5e8;">${totalFila}</td>
                </tr>
            `;
        }).join('');
    }

    function getDatosTiempoInteligente(tipo) {
        switch(tipo) {
            case 'fecha': return datosFechaInteligente;
            case 'mes': return datosMesInteligente;
            case 'anio': return datosAnioInteligente;
            default: return { labels: [], datasets: [] };
        }
    }

    function generarFilasTablaCombinada(datos, tipo) {
        const tiempos = Object.keys(datos.porTiempo).sort((a, b) => {
            // Ordenar según el tipo
            switch(tipo) {
                case 'fecha': return new Date(a) - new Date(b);
                case 'mes': return ordenarMeses(a, b);
                case 'anio': return parseInt(a) - parseInt(b);
                default: return 0;
            }
        });

        return tiempos.map(tiempo => {
            const total = datos.porTiempo[tiempo];
            const edades = datos.porEdadYTiempo[tiempo] || {};
            
            return `
                <tr>
                    <td><strong>${tiempo}</strong></td>
                    <td style="text-align: center; background: ${edades['0-17'] > 0 ? '#e8f5e8' : '#f8f9fa'};">
                        ${edades['0-17'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['18-25'] > 0 ? '#e3f2fd' : '#f8f9fa'};">
                        ${edades['18-25'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['26-35'] > 0 ? '#fff3e0' : '#f8f9fa'};">
                        ${edades['26-35'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['36-50'] > 0 ? '#fbe9e7' : '#f8f9fa'};">
                        ${edades['36-50'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['51-65'] > 0 ? '#f3e5f5' : '#f8f9fa'};">
                        ${edades['51-65'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['66+'] > 0 ? '#ffebee' : '#f8f9fa'};">
                        ${edades['66+'] || 0}
                    </td>
                    <td style="text-align: center; font-weight: bold; background: #e8f5e8;">
                        ${total}
                    </td>
                </tr>
            `;
        }).join('');
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

    function getDatosTiempoCombinado(tipo) {
        switch(tipo) {
            case 'fecha': return datosFechaCombinado;
            case 'mes': return datosMesCombinado;
            case 'anio': return datosAnioCombinado;
            default: return { porTiempo: {}, porEdadYTiempo: {} };
        }
    }

    function limpiarFiltrosCombinados() {
        document.getElementById('filtro-fecha-inicial').value = '';
        document.getElementById('filtro-fecha-final').value = '';
        document.getElementById('filtro-rango-edad').value = 'todos';
        
        // Recargar datos sin filtros
        const tipoActual = obtenerTipoReporteActual();
        if (tipoActual === 'edad') {
            cargarDatosEdades();
        } else {
            cargarDatosTiempo(tipoActual);
        }
        
        mostrarExitoEdad('Filtros limpiados - Mostrando todos los datos');
    }

    // ***** FUNCIONES COMPLETADAS *****

    function obtenerTipoReporteActual() {
        const btnActivo = document.querySelector('.chart-btn.active');
        if (btnActivo) {
            return btnActivo.dataset.type || 'edad';
        }
        return 'edad';
    }

    function agregarEstilosFiltros() {
        const styles = `
            <style>
                .filtro-grupo {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .filtro-grupo label {
                    font-weight: 600;
                    color: #2c3e50;
                    font-size: 0.85rem;
                }
                .filtro-grupo input,
                .filtro-grupo select {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    min-width: 150px;
                }
                .chart-btn {
                    background: #f8f9fa;
                    border: 1px solid #e8f5e8;
                    padding: 8px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .chart-btn:hover {
                    background: #e1f0e5;
                }
                .chart-btn.active {
                    background: linear-gradient(135deg, #2e7d32, #4caf50); 
                    color: #fff;
                    border-color: #2e7d32;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    function generarFilasTablaEdad() {
        const { labels, values } = datosSimuladosEdad.edad;
        const total = values.reduce((a, b) => a + b, 0);
        
        const descripciones = {
            '0-17': 'Niños y adolescentes', '18-25': 'Jóvenes adultos',
            '26-35': 'Adultos jóvenes', '36-50': 'Adultos',
            '51-65': 'Adultos mayores', '66+': 'Tercera edad'
        };

        return labels.map((grupo, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const descripcion = descripciones[grupo] || 'Grupo de edad';
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td>
                        <span class="age-badge" style="background: ${coloresPorEdad[grupo]}; color: white;">
                            <i class="fas fa-user"></i>
                            ${grupo} años
                        </span>
                    </td>
                    <td>${grupo}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: #2e7d32">${porcentaje}%</td>
                    <td style="color: #7f8c8d; font-size: 0.9rem">${descripcion}</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td></td>
            </tr>
        ` : '');
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

    

    function abrirModalEdad(tipoGrafica) {
        const modal = document.getElementById("chartModalEdad");
        if (!modal) {
            console.error('Modal no encontrado');
            return;
        }
        
        modal.classList.add("show");
        
        // Guardar tipo de gráfica
        const modalChartContainer = document.querySelector('.modal-chart-container');
        if (modalChartContainer) {
            modalChartContainer.setAttribute('data-tipo-grafica', tipoGrafica);
        }
        
        // Crear filtros
        crearFiltrosModalEdad();
        
        // Crear gráfica inicial
        crearGraficaAmpliadaEdad(tipoGrafica);
        llenarTablaModalEdad();
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

    function llenarTablaModalEdad() {
        const tbody = document.getElementById("tbodyDatosEdad");
        if (!tbody) return;

        const { labels, values } = datosSimuladosEdad.edad;
        const total = values.reduce((a, b) => a + b, 0);

        const descripciones = {
            '0-17': 'Niños y adolescentes',
            '18-25': 'Jóvenes adultos', 
            '26-35': 'Adultos jóvenes',
            '36-50': 'Adultos',
            '51-65': 'Adultos mayores',
            '66+': 'Tercera edad'
        };

        tbody.innerHTML = labels.map((grupo, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const descripcion = descripciones[grupo] || 'Grupo de edad';
            
            return `
                <tr>
                    <td>
                        <span class="age-badge" style="background: ${coloresPorEdad[grupo]}; color: white; padding: 4px 8px; border-radius: 12px;">
                            <i class="fas fa-user"></i> ${grupo} años
                        </span>
                    </td>
                    <td>${grupo}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                    <td style="color: #7f8c8d">${descripcion}</td>
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

    function cerrarModalEdad() {
        const modal = document.getElementById("chartModalEdad");
        if (modal) {
            modal.classList.remove("show");
        }
    }

    function descargarPNGModalEdad() {
        const canvas = document.getElementById("chartAmpliadoEdad");
        if (canvas) {
            const link = document.createElement("a");
            link.download = "grafica_edad_ampliada.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
    }

    function descargarExcelModalEdad() {
        const { labels, values } = datosSimuladosEdad.edad;
        const total = values.reduce((a, b) => a + b, 0);
        
        const datosExcel = [
            ['Grupo de Edad', 'Rango', 'Total Visitantes', 'Porcentaje'],
            ...labels.map((label, i) => {
                const porcentaje = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
                return [`${label} años`, label, values[i], `${porcentaje}%`];
            }),
            ['TOTAL', '', total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos por Edad");
        XLSX.writeFile(wb, "reporte_edad_detallado.xlsx");
    }

   

    function crearFiltrosModalEdad() {
        const modalHeader = document.querySelector('.modal-header');
        if (!modalHeader) return;
        
        // Eliminar filtros anteriores si existen
        const filtrosAnteriores = document.getElementById('filtrosModalEdad');
        if (filtrosAnteriores) {
            filtrosAnteriores.remove();
        }
        
        const ahora = new Date();
        const haceUnMes = new Date();
        haceUnMes.setMonth(ahora.getMonth() - 1);
        
        const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];
        
        const filtrosHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 12px;">
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-calendar-alt"></i> Fecha Inicial</label>
                    <input type="date" class="filter-select" id="modal-filtro-fecha-inicio-edad" value="${formatoFecha(haceUnMes)}">
                </div>
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-calendar-alt"></i> Fecha Final</label>
                    <input type="date" class="filter-select" id="modal-filtro-fecha-fin-edad" value="${formatoFecha(ahora)}">
                </div>
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-user"></i> Rango de Edad</label>
                    <select class="filter-select" id="modal-filtro-rango-edad">
                        <option value="todos">Todos los rangos</option>
                        <option value="0-17">0-17 años</option>
                        <option value="18-25">18-25 años</option>
                        <option value="26-35">26-35 años</option>
                        <option value="36-50">36-50 años</option>
                        <option value="51-65">51-65 años</option>
                        <option value="66+">66+ años</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn btn-primary" id="aplicar-filtros-modal-edad-btn">
                    <i class="fas fa-check"></i> Aplicar Filtros
                </button>
                <button class="btn btn-danger" id="limpiar-filtros-modal-edad-btn">
                    <i class="fas fa-times"></i> Limpiar Filtros
                </button>
            </div>
        `;

        const filtrosContainer = document.createElement('div');
        filtrosContainer.id = 'filtrosModalEdad';
        filtrosContainer.style.cssText = `
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        `;
        
        filtrosContainer.innerHTML = `
            <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px">
                <i class="fas fa-filter"></i> Filtros por Fecha y Edad
            </h4>
            ${filtrosHTML}
        `;

        // Insertar después del modal-header
        modalHeader.parentNode.insertBefore(filtrosContainer, modalHeader.nextSibling);
        
        // Configurar eventos
        setTimeout(() => {
            const btnAplicar = document.getElementById('aplicar-filtros-modal-edad-btn');
            const btnLimpiar = document.getElementById('limpiar-filtros-modal-edad-btn');
            
            if (btnAplicar) {
                btnAplicar.addEventListener('click', aplicarFiltrosModalEdad);
            }
            
            if (btnLimpiar) {
                btnLimpiar.addEventListener('click', limpiarFiltrosModalEdad);
            }
        }, 100);
    }

    async function aplicarFiltrosModalEdad() {
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio-edad')?.value;
        const fechaFin = document.getElementById('modal-filtro-fecha-fin-edad')?.value;
        const rangoEdad = document.getElementById('modal-filtro-rango-edad')?.value;
        
        console.log('🎯 Aplicando filtros edad:', { fechaInicio, fechaFin, rangoEdad });
        
        // Validaciones
        if (!fechaInicio || !fechaFin) {
            mostrarMensajeNoHayDatos('Por favor selecciona ambas fechas');
            return;
        }
        
        if (fechaInicio > fechaFin) {
            mostrarMensajeNoHayDatos('La fecha inicial no puede ser mayor que la fecha final');
            return;
        }

        try {
            mostrarLoadingEdad('Aplicando filtros...');

            let query = supabase
                .from('participantes_reserva')
                .select(`
                    fecha_nacimiento,
                    fecha_visita,
                    id_genero,
                    nombre,
                    apellido,
                    genero!inner(genero)
                `)
                .not('fecha_nacimiento', 'is', null)
                .gte('fecha_visita', fechaInicio + 'T00:00:00')
                .lte('fecha_visita', fechaFin + 'T23:59:59');

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            let participantesProcesados = participantesFiltrados;

            // Aplicar filtro de rango de edad si no es "todos"
            if (rangoEdad !== 'todos') {
                participantesProcesados = participantesFiltrados.filter(participante => {
                    const edad = calcularEdad(participante.fecha_nacimiento);
                    if (edad === null) return false;
                    
                    const categoria = clasificarEdad(edad);
                    return categoria === rangoEdad;
                });
            }

            if (participantesProcesados && participantesProcesados.length > 0) {
                // Procesar datos filtrados
                procesarDatosEdades(participantesProcesados);
                
                // Actualizar gráfica del modal
                const tipoGrafica = document.querySelector('.modal-chart-container')?.getAttribute('data-tipo-grafica') || 'bar';
                actualizarGraficaModalConFiltros(tipoGrafica, { fechaInicio, fechaFin, rangoEdad });
                
                mostrarExitoEdad(`Filtros aplicados: ${participantesProcesados.length} participantes encontrados`);
            } else {
                mostrarMensajeNoHayDatos(rangoEdad);
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error('Error aplicando filtros:', error);
            cerrarLoadingEdad();
            mostrarErrorEdad('Error al aplicar los filtros: ' + error.message);
        }
    }

    function limpiarFiltrosModalEdad() {
        // Limpiar inputs
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio-edad');
        const fechaFin = document.getElementById('modal-filtro-fecha-fin-edad');
        const rangoEdad = document.getElementById('modal-filtro-rango-edad');
        
        if (fechaInicio) fechaInicio.value = '';
        if (fechaFin) fechaFin.value = '';
        if (rangoEdad) rangoEdad.value = 'todos';
        
        // Recargar datos originales
        if (window.EdadSystem && window.EdadSystem.cargarDatos) {
            window.EdadSystem.cargarDatos();
        }
        
        mostrarExitoEdad('Filtros limpiados - Mostrando todos los datos');
    }

    

    function abrirModalTiempo(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalEdad");
        if (!modal) {
            console.error('Modal no encontrado');
            return;
        }
        
        modal.classList.add("show");
        
        // Guardar tipo de gráfica y datos
        const modalChartContainer = document.querySelector('.modal-chart-container');
        if (modalChartContainer) {
            modalChartContainer.setAttribute('data-tipo-grafica', tipoGrafica);
            modalChartContainer.setAttribute('data-tipo-datos', tipo);
        }
        
        // Crear filtros específicos para tiempo
        crearFiltrosModalTiempo(tipo);
        
        // Crear gráfica inicial
        crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
        llenarTablaModalTiempo(tipo);
    }

    function crearFiltrosModalTiempo(tipo) {
        const modalHeader = document.querySelector('.modal-header');
        if (!modalHeader) return;
        
        // Eliminar filtros anteriores
        const filtrosAnteriores = document.getElementById('filtrosModalEdad');
        if (filtrosAnteriores) {
            filtrosAnteriores.remove();
        }
        
        const ahora = new Date();
        let fechaInicioDefault, fechaFinDefault;
        
        switch(tipo) {
            case 'fecha':
                // Últimos 30 días para fecha
                fechaInicioDefault = new Date(ahora);
                fechaInicioDefault.setDate(ahora.getDate() - 30);
                fechaFinDefault = ahora;
                break;
            case 'mes':
                // Últimos 6 meses para mes
                fechaInicioDefault = new Date(ahora);
                fechaInicioDefault.setMonth(ahora.getMonth() - 6);
                fechaFinDefault = ahora;
                break;
            case 'anio':
                // Últimos 3 años para año
                fechaInicioDefault = new Date(ahora);
                fechaInicioDefault.setFullYear(ahora.getFullYear() - 3);
                fechaFinDefault = ahora;
                break;
        }
        
        const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];
        
        const filtrosHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 12px;">
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-calendar-alt"></i> Fecha Inicial</label>
                    <input type="date" class="filter-select" id="modal-filtro-fecha-inicio-tiempo" value="${formatoFecha(fechaInicioDefault)}">
                </div>
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-calendar-alt"></i> Fecha Final</label>
                    <input type="date" class="filter-select" id="modal-filtro-fecha-fin-tiempo" value="${formatoFecha(fechaFinDefault)}">
                </div>
                <div class="filter-group">
                    <label class="filter-label"><i class="fas fa-user"></i> Rango de Edad</label>
                    <select class="filter-select" id="modal-filtro-rango-edad-tiempo">
                        <option value="todos">Todos los rangos</option>
                        <option value="0-17">0-17 años</option>
                        <option value="18-25">18-25 años</option>
                        <option value="26-35">26-35 años</option>
                        <option value="36-50">36-50 años</option>
                        <option value="51-65">51-65 años</option>
                        <option value="66+">66+ años</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn btn-primary" id="aplicar-filtros-modal-tiempo-btn">
                    <i class="fas fa-check"></i> Aplicar Filtros
                </button>
                <button class="btn btn-danger" id="limpiar-filtros-modal-tiempo-btn">
                    <i class="fas fa-times"></i> Limpiar Filtros
                </button>
            </div>
        `;

        const filtrosContainer = document.createElement('div');
        filtrosContainer.id = 'filtrosModalEdad';
        filtrosContainer.style.cssText = `
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        `;
        
        filtrosContainer.innerHTML = `
            <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px">
                <i class="fas fa-filter"></i> Filtros Avanzados - ${getTituloTiempo(tipo)}
            </h4>
            ${filtrosHTML}
        `;

        modalHeader.parentNode.insertBefore(filtrosContainer, modalHeader.nextSibling);
        
        // Configurar eventos
        setTimeout(() => {
            const btnAplicar = document.getElementById('aplicar-filtros-modal-tiempo-btn');
            const btnLimpiar = document.getElementById('limpiar-filtros-modal-tiempo-btn');
            
            if (btnAplicar) {
                btnAplicar.addEventListener('click', () => {
                    aplicarFiltrosModalTiempoCompleto(tipo);
                });
            }
            
            if (btnLimpiar) {
                btnLimpiar.addEventListener('click', () => {
                    limpiarFiltrosModalTiempoCompleto(tipo);
                });
            }
        }, 100);
    }

    async function aplicarFiltrosModalTiempoCompleto(tipo) {
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio-tiempo')?.value;
        const fechaFin = document.getElementById('modal-filtro-fecha-fin-tiempo')?.value;
        const rangoEdad = document.getElementById('modal-filtro-rango-edad-tiempo')?.value;
        
        console.log('🎯 Aplicando filtros tiempo completo:', { fechaInicio, fechaFin, rangoEdad, tipo });
        
        if (!fechaInicio || !fechaFin) {
            mostrarMensajeNoHayDatos('Por favor selecciona ambas fechas');
            return;
        }
        
        if (fechaInicio > fechaFin) {
            mostrarMensajeNoHayDatos('La fecha inicial no puede ser mayor que la fecha final');
            return;
        }

        try {
            mostrarLoadingEdad('Aplicando filtros...');

            let query = supabase
                .from('participantes_reserva')
                .select('fecha_visita, fecha_nacimiento')
                .not('fecha_visita', 'is', null)
                .gte('fecha_visita', fechaInicio + 'T00:00:00')
                .lte('fecha_visita', fechaFin + 'T23:59:59');

            // Solo incluir fecha nacimiento si se filtra por edad
            if (rangoEdad !== 'todos') {
                query = query.not('fecha_nacimiento', 'is', null);
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                // Procesar datos según tipo y rango de edad
                const datosFiltrados = procesarDatosTiempoConEdad(participantesFiltrados, tipo, rangoEdad);
                actualizarGraficaModalTiempoConFiltros(tipo, datosFiltrados, { fechaInicio, fechaFin, rangoEdad });
                
                mostrarExitoEdad(`Filtros aplicados: ${participantesFiltrados.length} visitas encontradas`);
            } else {
                mostrarMensajeNoHayDatos(rangoEdad);
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error('Error aplicando filtros tiempo:', error);
            cerrarLoadingEdad();
            mostrarErrorEdad('Error al aplicar los filtros: ' + error.message);
        }
    }

    function procesarDatosTiempoConEdad(participantes, tipo, rangoEdad) {
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
                        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        clave = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                        break;
                    case 'anio':
                        clave = fecha.getFullYear().toString();
                        break;
                }
                
                // Si es "todos", contar todos
                if (rangoEdad === 'todos') {
                    conteo[clave] = (conteo[clave] || 0) + 1;
                } else {
                    // Filtrar por edad específica
                    const edad = calcularEdad(participante.fecha_nacimiento);
                    if (edad !== null) {
                        const categoria = clasificarEdad(edad);
                        if (categoria === rangoEdad) {
                            conteo[clave] = (conteo[clave] || 0) + 1;
                        }
                    }
                }
            }
        });

        // Ordenar datos
        let labels = Object.keys(conteo).sort((a, b) => {
            switch(tipo) {
                case 'fecha': return new Date(a) - new Date(b);
                case 'mes': return ordenarMeses(a, b);
                case 'anio': return parseInt(a) - parseInt(b);
                default: return 0;
            }
        });

        const values = labels.map(label => conteo[label]);

        return {
            labels: labels,
            values: values,
            total: values.reduce((a, b) => a + b, 0),
            rangoEdad: rangoEdad
        };
    }

    function actualizarGraficaModalTiempoConFiltros(tipo, datos, filtros) {
        const canvas = document.getElementById("chartAmpliadoEdad");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        
        // Destruir gráfica anterior si existe
        if (chartAmpliadoEdad) {
            chartAmpliadoEdad.destroy();
        }

        const colors = generarColoresTiempo(tipo, datos.labels.length);
        const total = datos.total;

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

        const tipoGrafica = document.querySelector('.modal-chart-container')?.getAttribute('data-tipo-grafica') || 'bar';
        const chartType = tipoGrafica === "bar" ? "bar" : "doughnut";

        chartAmpliadoEdad = new Chart(ctx, {
            type: chartType,
            data: {
                labels: datos.labels,
                datasets: [{
                    label: filtros.rangoEdad === 'todos' ? "Cantidad de Visitantes" : `Visitantes ${filtros.rangoEdad} años`,
                    data: datos.values,
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
                                const percentage = Math.round((value / total) * 100);
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

        // Actualizar tabla
        const tbody = document.getElementById("tbodyDatosEdad");
        if (tbody) {
            tbody.innerHTML = datos.labels.map((label, index) => {
                const valor = datos.values[index];
                const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
                
                return `
                    <tr>
                        <td><strong>${label}</strong></td>
                        <td>${getDescripcionTiempo(tipo, label)}</td>
                        <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                        <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                        <td style="text-align: center;">
                            <span style="color: #3498db;">
                                <i class="fas fa-filter"></i> Filtrado
                            </span>
                        </td>
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
    }

    function limpiarFiltrosModalTiempoCompleto(tipo) {
        // Limpiar inputs
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio-tiempo');
        const fechaFin = document.getElementById('modal-filtro-fecha-fin-tiempo');
        const rangoEdad = document.getElementById('modal-filtro-rango-edad-tiempo');
        
        if (fechaInicio) fechaInicio.value = '';
        if (fechaFin) fechaFin.value = '';
        if (rangoEdad) rangoEdad.value = 'todos';
        
        // Recargar datos originales
        cargarDatosTiempo(tipo);
        
        mostrarExitoEdad('Filtros limpiados - Mostrando todos los datos');
    }

    function actualizarGraficaModalConFiltros(tipoGrafica, filtros) {
        const canvas = document.getElementById("chartAmpliadoEdad");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        
        // Destruir gráfica anterior si existe
        if (chartAmpliadoEdad) {
            chartAmpliadoEdad.destroy();
        }

        const { labels, values } = datosSimuladosEdad.edad;
        const colors = labels.map(label => coloresPorEdad[label] || '#95a5a6');
        const total = values.reduce((a, b) => a + b, 0);

        // Generar título con información de filtros
        let titulo = 'Distribución por Edad';
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

        // Actualizar tabla
        llenarTablaModalEdad();
    }

  

    async function aplicarFiltros() {
        try {
            const fechaInicial = document.getElementById('filtro-fecha-inicial').value;
            const fechaFinal = document.getElementById('filtro-fecha-final').value;
            const rangoEdad = document.getElementById('filtro-rango-edad').value;

            mostrarLoadingEdad('Aplicando filtros...');

            let query = supabase
                .from('participantes_reserva')
                .select(`
                    fecha_nacimiento,
                    fecha_visita,
                    id_genero,
                    nombre,
                    apellido,
                    genero!inner(genero)
                `)
                .not('fecha_nacimiento', 'is', null);

            // Aplicar filtro de fechas
            if (fechaInicial && fechaFinal) {
                query = query
                    .gte('fecha_visita', fechaInicial)
                    .lte('fecha_visita', fechaFinal);
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            let participantesProcesados = participantesFiltrados;

            // Aplicar filtro de rango de edad si no es "todos"
            if (rangoEdad !== 'todos') {
                participantesProcesados = participantesFiltrados.filter(participante => {
                    const edad = calcularEdad(participante.fecha_nacimiento);
                    if (edad === null) return false;
                    
                    const categoria = clasificarEdad(edad);
                    return categoria === rangoEdad;
                });
            }

            if (participantesProcesados && participantesProcesados.length > 0) {
                procesarDatosEdades(participantesProcesados);
                mostrarDatosEdad();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Filtros aplicados',
                    text: `Se encontraron ${participantesProcesados.length} participantes con los criterios seleccionados`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                mostrarMensajeNoHayDatos(rangoEdad);
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error('Error aplicando filtros:', error);
            cerrarLoadingEdad();
            mostrarErrorEdad('Error al aplicar los filtros: ' + error.message);
        }
    }

    function limpiarFiltros() {
        document.getElementById('filtro-fecha-inicial').value = '';
        document.getElementById('filtro-fecha-final').value = '';
        document.getElementById('filtro-rango-edad').value = 'todos';
        
        // Restaurar datos originales
        datosSimuladosEdad = JSON.parse(JSON.stringify(datosOriginalesEdad));
        mostrarDatosEdad();
        
        Swal.fire({
            icon: 'success',
            title: 'Filtros limpiados',
            text: 'Se muestran todos los datos sin filtros',
            timer: 1500,
            showConfirmButton: false
        });
    }

    // Función para cambiar entre tipos de reporte
    function cambiarTipoReporte(tipo) {
        console.log('🔄 Cambiando a reporte:', tipo);
        
        // Actualizar botones activos
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.chart-btn[data-type="${tipo}"]`).classList.add('active');
        
        if (tipo === 'edad') {
            // Cargar datos de edad
            cargarDatosEdades();
        } else {
            // Cargar datos de tiempo (fecha, mes, año)
            cargarDatosTiempo(tipo);
        }
    }

    function mostrarFiltrosAvanzados() {
        const filtrosDiv = document.getElementById('filtros-avanzados-edad');
        if (filtrosDiv.style.display === 'none') {
            filtrosDiv.style.display = 'block';
        } else {
            filtrosDiv.style.display = 'none';
        }
    }

    // =============================================
    // FUNCIONES AUXILIARES
    // =============================================

    function formatearFecha(fechaStr) {
        try {
            const fecha = new Date(fechaStr);
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return fechaStr;
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

    function generarColoresTiempo(tipo, cantidad) {
        const palette = coloresPorTiempo[tipo] || coloresPorTiempo.fecha;
        const colors = [];
        for(let i = 0; i < cantidad; i++) {
            colors.push(palette[i % palette.length]);
        }
        return colors;
    }

    function mostrarSinDatosTiempo(tipo) {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-calendar-times"></i>
                <h3>No hay datos de ${tipo} disponibles</h3>
                <p>No se encontraron visitantes con fechas de visita registradas.</p>
                <button class="btn btn-primary" onclick="window.EdadSystem.cargarDatosTiempo('${tipo}')">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

    function mostrarLoadingEdad(mensaje) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: mensaje,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
        }
    }

    function cerrarLoadingEdad() {
        if (typeof Swal !== 'undefined') Swal.close();
    }

    function mostrarErrorEdad(mensaje) {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar datos de edad</h3>
                <p>${mensaje}</p>
                <button class="btn btn-primary" onclick="window.EdadSystem.cargarDatos()">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

    function mostrarExitoEdad(mensaje) {
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

    function mostrarSinDatosEdad() {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-user-slash"></i>
                <h3>No hay datos de edad disponibles</h3>
                <p>No se encontraron participantes con fecha de nacimiento registrada.</p>
                <button class="btn btn-primary" onclick="window.EdadSystem.cargarDatos()">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

   

    if (!window.EdadSystem) {
        window.EdadSystem = {};
    }

    
    window.EdadSystem.cargarDatos = () => cargarDatosEdades();
    window.EdadSystem.abrirModalEdad = (tipo) => abrirModalEdad(tipo);
    window.EdadSystem.cerrarModal = () => cerrarModalEdad();

    
    window.EdadSystem.cargarDatosTiempo = (tipo) => cargarDatosTiempo(tipo);
    window.EdadSystem.cambiarTipoTiempo = (tipo) => cargarDatosTiempo(tipo);
    window.EdadSystem.abrirModalTiempo = (tipo, tipoGrafica) => abrirModalTiempo(tipo, tipoGrafica);

   
    window.EdadSystem.descargarGraficoPrincipal = () => {
        if (chartBarEdad) {
            const link = document.createElement("a");
            link.download = "grafica_edad_principal.png";
            link.href = chartBarEdad.canvas.toDataURL("image/png");
            link.click();
        }
    };

    window.EdadSystem.descargarGraficoPrincipalTiempo = (tipo) => {
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
    };

    window.EdadSystem.descargarPNG = () => descargarPNGModalEdad();
    window.EdadSystem.descargarExcel = () => descargarExcelModalEdad();

    window.EdadSystem.descargarExcelTiempo = (tipo) => {
        const datos = getDatosTiempo(tipo);
        const total = datos.values.reduce((a, b) => a + b, 0);
        
        const datosExcel = [
            [getTituloTiempo(tipo).split(' ')[1], 'Total Visitantes', 'Porcentaje'],
            ...datos.labels.map((label, i) => {
                const porcentaje = total > 0 ? ((datos.values[i] / total) * 100).toFixed(1) : 0;
                return [label, datos.values[i], `${porcentaje}%`];
            }),
            ['TOTAL', total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, `Datos ${tipo}`);
        XLSX.writeFile(wb, `reporte_${tipo}.xlsx`);
    };

   
    window.EdadSystem.aplicarFiltros = () => aplicarFiltros();
    window.EdadSystem.limpiarFiltros = () => limpiarFiltros();
    window.EdadSystem.cambiarTipoReporte = (tipo) => cambiarTipoReporte(tipo);
    window.EdadSystem.mostrarFiltrosAvanzados = () => mostrarFiltrosAvanzados();
    window.EdadSystem.mostrarOcultarFiltros = () => mostrarOcultarFiltros();
    window.EdadSystem.aplicarFiltrosCombinados = () => aplicarFiltrosCombinados();
    window.EdadSystem.limpiarFiltrosCombinados = () => limpiarFiltrosCombinados();

    console.log('✅ Sistema de Edad y Tiempo cargado correctamente');
})();