// js/nacionalidad-system.js - SISTEMA DE NACIONALIDAD COMPLETO CON FILTROS EN MODAL
(function() {
    'use strict';
    
    // =============================================
    // VARIABLES PRIVADAS
    // =============================================
    let chartBarNacionalidad, chartPieNacionalidad, chartAmpliadoNacionalidad;
    let chartFechaBar, chartFechaPie, chartMesBar, chartMesPie, chartAnioBar, chartAnioPie;
    let tipoActual = "nacionalidad";
    let datosNacionalidades = {};
    let datosOriginales = {};
    let datosFecha = {};
    let datosMes = {};
    let datosAnio = {};
    let nacionalidadesFiltradas = [];
    let todosLosPaises = [];

    // Paletas de colores para nacionalidades (verde para Colombia, otros colores para otros)
    const coloresNacionalidades = [
        '#27ae60', // Verde para Colombia
        '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c',
        '#d35400', '#34495e', '#16a085', '#8e44ad'
    ];

    const coloresPorTiempo = {
        fecha: ['#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'],
        mes: ['#27ae60', '#3498db', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#d35400', '#8e44ad'],
        anio: ['#27ae60', '#3498db', '#e67e22', '#9b59b6', '#f1c40f']
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
                    <button class="btn btn-primary" onclick="window.NacionalidadManager.inicializar()">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    function mostrarErrorNacionalidad() {
        mostrarError('Error al cargar datos de nacionalidad');
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
                    <i class="fas fa-globe-americas"></i>
                    <h3>No hay datos disponibles</h3>
                    <p>No se encontraron datos en la base de datos.</p>
                    <button class="btn btn-primary" onclick="window.NacionalidadManager.inicializar()">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    function mostrarSinDatosNacionalidad() {
        const container = document.getElementById('data-container');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-globe-americas"></i>
                    <h3>No hay datos de nacionalidad disponibles</h3>
                    <p>No se encontraron participantes con nacionalidad registrada.</p>
                    <button class="btn btn-primary" onclick="window.NacionalidadManager.inicializar()">
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
                    <button class="btn btn-primary" onclick="window.NacionalidadManager.cambiarTipoReporte('${tipo}')">
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
                    <button class="btn btn-primary" onclick="window.NacionalidadManager.limpiarFiltrosCombinados()">
                        <i class="fas fa-times"></i> Limpiar Filtros
                    </button>
                </div>
            `;
        }
    }

    // =============================================
    // FUNCIONES PRINCIPALES - NACIONALIDAD
    // =============================================

    // Función para cargar datos completos
    async function cargarDatosCompletos() {
        try {
            mostrarLoading('Cargando datos completos...');
            
            // Cargar datos de nacionalidad
            await cargarDatosNacionalidad();
            
            // Cargar datos de tiempo si es necesario
            if (tipoActual !== 'nacionalidad') {
                await cargarDatosTiempo(tipoActual);
            }
            
            cerrarLoading();
            
        } catch (error) {
            console.error('Error cargando datos completos:', error);
            cerrarLoading();
            mostrarError('Error al cargar los datos: ' + error.message);
        }
    }

    // Función para cargar datos de nacionalidad - COLOMBIA vs OTROS PAÍSES
    async function cargarDatosNacionalidad() {
        try {
            console.log('=== CARGANDO DATOS DE NACIONALIDAD - COLOMBIA vs OTROS ===');
            
            // 1. Obtener todos los participantes con id_ciudad
            const { data: participantes, error: errorParticipantes } = await supabase
                .from('participantes_reserva')
                .select('id_ciudad, fecha_visita')
                .not('id_ciudad', 'is', null);

            if (errorParticipantes) {
                console.error('Error al obtener participantes:', errorParticipantes);
                mostrarErrorNacionalidad();
                return;
            }

            console.log('Participantes con ciudades:', participantes);

            if (!participantes || participantes.length === 0) {
                mostrarSinDatosNacionalidad();
                return;
            }

            // 2. Obtener todos los IDs de ciudades únicos
            const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
            console.log('IDs de ciudades únicos:', idsCiudadesUnicos);

            // 3. Obtener información de ciudades con sus países
            const { data: ciudades, error: errorCiudades } = await supabase
                .from('ciudades')
                .select(`
                    id, 
                    pais_id,
                    pais (
                        id,
                        pais
                    )
                `)
                .in('id', idsCiudadesUnicos);

            if (errorCiudades) {
                console.error('Error al obtener ciudades:', errorCiudades);
                mostrarErrorNacionalidad();
                return;
            }

            console.log('Ciudades obtenidas con países:', ciudades);

            // 4. Contar participantes por país
            const conteoPaises = {};
            let sinPaisCount = 0;

            participantes.forEach(participante => {
                const ciudad = ciudades.find(c => c.id === participante.id_ciudad);
                
                if (ciudad && ciudad.pais && ciudad.pais.pais) {
                    const nombrePais = ciudad.pais.pais;
                    conteoPaises[nombrePais] = (conteoPaises[nombrePais] || 0) + 1;
                } else {
                    // Si no encontramos el país
                    sinPaisCount++;
                }
            });

            console.log('Conteo completo por país:', conteoPaises);
            console.log('Sin país:', sinPaisCount);

            // 5. Separar Colombia de otros países
            let colombiaCount = 0;
            let otrosPaisesCount = 0;
            let detallesOtrosPaises = {};

            Object.keys(conteoPaises).forEach(nombrePais => {
                if (nombrePais.toLowerCase().includes('colombia')) {
                    colombiaCount += conteoPaises[nombrePais];
                } else {
                    otrosPaisesCount += conteoPaises[nombrePais];
                    detallesOtrosPaises[nombrePais] = conteoPaises[nombrePais];
                }
            });

            // Agregar los que no tienen país a "Otros países"
            otrosPaisesCount += sinPaisCount;

            const conteoFinal = {
                'Colombia': colombiaCount,
                'Otros países': otrosPaisesCount
            };

            console.log('Conteo final:', conteoFinal);
            
            // Guardar todos los países para filtros
            todosLosPaises = Object.keys(conteoPaises).map(pais => ({ nombre_pais: pais }));
            
            // Procesar datos para la interfaz
            procesarDatosNacionalidad(conteoFinal, detallesOtrosPaises);

        } catch (error) {
            console.error('Error en cargarDatosNacionalidad:', error);
            mostrarErrorNacionalidad();
            throw error;
        }
    }

    // Procesar datos para la interfaz
    function procesarDatosNacionalidad(conteoFinal, detallesOtrosPaises) {
        const labels = Object.keys(conteoFinal);
        const values = Object.values(conteoFinal);
        const totalVisitantes = values.reduce((a, b) => a + b, 0);

        // Actualizar estadísticas
        actualizarEstadisticas(totalVisitantes, labels.length);

        // Guardar datos
        datosNacionalidades = {
            labels: labels,
            values: values,
            total: totalVisitantes,
            datosCompletos: { ...conteoFinal },
            detallesOtrosPaises: detallesOtrosPaises
        };

        datosOriginales = JSON.parse(JSON.stringify(datosNacionalidades));
        nacionalidadesFiltradas = [...labels];

        // Actualizar filtros
        actualizarFiltrosNacionalidades();

        if (tipoActual === 'nacionalidad') {
            mostrarInterfazNacionalidad();
        }
    }

    // Función para cargar datos por tiempo (fecha, mes, año)
    async function cargarDatosTiempo(tipo) {
        try {
            mostrarLoading(`Cargando datos por ${tipo}...`);

            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('fecha_visita, id_ciudad')
                .not('fecha_visita', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                // Obtener países para filtrar
                const paisesParticipantes = await obtenerPaisesDeParticipantes(participantes);
                procesarDatosTiempo(participantes, tipo, paisesParticipantes);
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

    // Obtener países de participantes
    async function obtenerPaisesDeParticipantes(participantes) {
        const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
        
        const { data: ciudades, error } = await supabase
            .from('ciudades')
            .select(`
                id, 
                pais_id,
                pais (
                    id,
                    pais
                )
            `)
            .in('id', idsCiudadesUnicos);

        if (error) throw error;

        const mapaCiudadPais = {};
        ciudades.forEach(ciudad => {
            if (ciudad.pais && ciudad.pais.pais) {
                mapaCiudadPais[ciudad.id] = ciudad.pais.pais;
            }
        });

        return mapaCiudadPais;
    }

    // Procesar datos por tiempo
    function procesarDatosTiempo(participantes, tipo, mapaCiudadPais) {
        const conteo = {};
        
        participantes.forEach(participante => {
            if (participante.fecha_visita && participante.id_ciudad) {
                const fecha = new Date(participante.fecha_visita);
                const pais = mapaCiudadPais[participante.id_ciudad] || 'Sin país';
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
                
                if (!conteo[clave]) {
                    conteo[clave] = { total: 0, colombia: 0, otros: 0 };
                }
                
                conteo[clave].total++;
                if (pais.toLowerCase().includes('colombia')) {
                    conteo[clave].colombia++;
                } else {
                    conteo[clave].otros++;
                }
            }
        });

        // Ordenar datos
        let labels, valuesColombia, valuesOtros;
        
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
        
        valuesColombia = labels.map(label => conteo[label].colombia);
        valuesOtros = labels.map(label => conteo[label].otros);

        // Guardar datos
        const datosTiempo = {
            labels: labels,
            valuesColombia: valuesColombia,
            valuesOtros: valuesOtros,
            totalColombia: valuesColombia.reduce((a, b) => a + b, 0),
            totalOtros: valuesOtros.reduce((a, b) => a + b, 0),
            total: labels.reduce((sum, label) => sum + conteo[label].total, 0)
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
    function actualizarEstadisticas(total, nacionalidades) {
        if (document.getElementById('total-visitantes')) {
            document.getElementById('total-visitantes').textContent = total.toLocaleString();
        }
        if (document.getElementById('visitantes-con-nacionalidad')) {
            document.getElementById('visitantes-con-nacionalidad').textContent = total.toLocaleString();
        }
        if (document.getElementById('total-nacionalidades')) {
            document.getElementById('total-nacionalidades').textContent = nacionalidades;
        }
    }

    // Actualizar filtros de nacionalidades
    function actualizarFiltrosNacionalidades() {
        const select = document.getElementById('filtro-nacionalidad-comb');
        if (select) {
            // Limpiar opciones excepto la primera
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Agregar todas las nacionalidades
            Object.keys(datosNacionalidades.datosCompletos).forEach(nacionalidad => {
                const option = document.createElement('option');
                option.value = nacionalidad;
                option.textContent = nacionalidad;
                select.appendChild(option);
            });
            
            // Agregar países específicos dentro de "Otros países"
            if (datosNacionalidades.detallesOtrosPaises) {
                Object.keys(datosNacionalidades.detallesOtrosPaises).forEach(pais => {
                    const option = document.createElement('option');
                    option.value = pais;
                    option.textContent = `Otros - ${pais}`;
                    select.appendChild(option);
                });
            }
        }
    }

    // Funciones auxiliares para tiempo
    function getDatosTiempo(tipo) {
        switch(tipo) {
            case 'fecha': return datosFecha;
            case 'mes': return datosMes;
            case 'anio': return datosAnio;
            default: return { 
                labels: [], 
                valuesColombia: [], 
                valuesOtros: [], 
                totalColombia: 0, 
                totalOtros: 0, 
                total: 0 
            };
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

    function obtenerTipoNacionalidad(nombre) {
        if (nombre === 'Colombia') return 'Nacional';
        if (nombre === 'Otros países') return 'Internacional';
        return 'Internacional';
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

    // Mostrar interfaz de nacionalidades
    function mostrarInterfazNacionalidad() {
        const container = document.getElementById('data-container');
        const { labels, values, total } = datosNacionalidades;
        
        container.innerHTML = `
            <div class="charts-grid">
                <div class="chart-card" onclick="window.NacionalidadManager.abrirModal('bar')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> Distribución por Nacionalidad - Barras
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartBarNacionalidad"></canvas>
                    </div>
                </div>

                <div class="chart-card" onclick="window.NacionalidadManager.abrirModal('pie')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> Distribución por Nacionalidad - Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartPieNacionalidad"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por Nacionalidad
                    </h3>
                    <button class="download-btn" onclick="window.NacionalidadManager.descargarExcel()">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 600px;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th style="min-width: 200px;">Nacionalidad</th>
                                <th style="width: 150px;">Total Visitantes</th>
                                <th style="width: 100px;">Porcentaje</th>
                                <th style="min-width: 150px;">Tipo</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-nacionalidad-body">
                            ${generarFilasTablaNacionalidad()}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Detalle de otros países -->
            ${datosNacionalidades.detallesOtrosPaises && Object.keys(datosNacionalidades.detallesOtrosPaises).length > 0 ? `
            <div class="data-table" style="margin-top: 20px;">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-flag"></i> Detalle de Otros Países
                    </h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 600px;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th style="min-width: 200px;">País</th>
                                <th style="width: 150px;">Total Visitantes</th>
                                <th style="width: 100px;">Porcentaje (Otros)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(datosNacionalidades.detallesOtrosPaises).map(([pais, cantidad], index) => {
                                const porcentajeOtros = datosNacionalidades.values[1] > 0 ? 
                                    ((cantidad / datosNacionalidades.values[1]) * 100).toFixed(1) : 0;
                                return `
                                    <tr>
                                        <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                                        <td>
                                            <span class="nation-badge">
                                                <i class="fas fa-globe-americas"></i>
                                                ${pais}
                                            </span>
                                        </td>
                                        <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                                        <td style="text-align: center; font-weight: bold; color: #3498db">${porcentajeOtros}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}
        `;

        mostrarGraficasNacionalidad();
    }

    // Generar filas de tabla para nacionalidades
    function generarFilasTablaNacionalidad() {
        const { labels, values, total } = datosNacionalidades;
        
        return labels.map((nacionalidad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoNacionalidad(nacionalidad);
            const icono = nacionalidad === 'Colombia' ? 'fa-flag' : 'fa-globe-americas';
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td>
                        <span class="nation-badge">
                            <i class="fas ${icono}"></i>
                            ${nacionalidad}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: ${nacionalidad === 'Colombia' ? '#27ae60' : '#3498db'}">${porcentaje}%</td>
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
                <div class="chart-card" onclick="window.NacionalidadManager.abrirModalTiempo('${tipo}', 'bar')">
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

                <div class="chart-card" onclick="window.NacionalidadManager.abrirModalTiempo('${tipo}', 'pie')">
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
                    <button class="download-btn" onclick="window.NacionalidadManager.descargarExcelTiempo('${tipo}')">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 600px;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th style="min-width: 150px;">${titulo.split(' ')[1]}</th>
                                <th style="width: 100px;">Colombia</th>
                                <th style="width: 100px;">Otros Países</th>
                                <th style="width: 100px;">Total</th>
                                <th style="width: 100px;">% Colombia</th>
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
        return datos.labels.map((label, index) => {
            const colombia = datos.valuesColombia[index];
            const otros = datos.valuesOtros[index];
            const total = colombia + otros;
            const porcentajeColombia = total > 0 ? ((colombia / total) * 100).toFixed(1) : 0;
            
            // Calcular tendencia
            let tendencia = '';
            if (index > 0) {
                const totalAnterior = datos.valuesColombia[index - 1] + datos.valuesOtros[index - 1];
                const diferencia = total - totalAnterior;
                const porcentajeCambio = totalAnterior > 0 ? ((diferencia / totalAnterior) * 100).toFixed(1) : 100;
                
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
                    <td style="text-align: center; font-weight: bold; color: #27ae60">${colombia.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: #3498db">${otros.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold">${total.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentajeColombia}%</td>
                    <td style="text-align: center;">${tendencia}</td>
                </tr>
            `;
        }).join('') + (datos.total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center; color: #27ae60">${datos.totalColombia.toLocaleString()}</td>
                <td style="text-align: center; color: #3498db">${datos.totalOtros.toLocaleString()}</td>
                <td style="text-align: center">${datos.total.toLocaleString()}</td>
                <td style="text-align: center">${datos.total > 0 ? ((datos.totalColombia / datos.total) * 100).toFixed(1) : 0}%</td>
                <td style="text-align: center;">-</td>
            </tr>
        ` : '');
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

    // Mostrar gráficas para tiempo
    function mostrarGraficasTiempo(tipo) {
        const datos = getDatosTiempo(tipo);
        const colors = ['#27ae60', '#3498db']; // Verde para Colombia, Azul para otros
        
        // Gráfica de barras apiladas
        const ctxBar = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Bar`);
        if (chartFechaBar) chartFechaBar.destroy();
        if (chartMesBar) chartMesBar.destroy();
        if (chartAnioBar) chartAnioBar.destroy();
        
        const chartBar = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: datos.labels,
                datasets: [
                    {
                        label: "Colombia",
                        data: datos.valuesColombia,
                        backgroundColor: colors[0],
                        borderRadius: 8,
                        barThickness: 25,
                    },
                    {
                        label: "Otros Países",
                        data: datos.valuesOtros,
                        backgroundColor: colors[1],
                        borderRadius: 8,
                        barThickness: 25,
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    title: {
                        display: true,
                        text: `${getTituloTiempo(tipo)} - Por Nacionalidad`,
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const datasetLabel = context.dataset.label || '';
                                const value = context.raw;
                                const total = datos.valuesColombia[context.dataIndex] + datos.valuesOtros[context.dataIndex];
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${datasetLabel}: ${value} visitantes (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        title: { display: true, text: 'Cantidad de Visitantes' }
                    },
                    x: {
                        stacked: true,
                        title: { display: true, text: getTituloTiempo(tipo).split(' ')[1] }
                    }
                }
            },
        });

        // Gráfica circular por período (solo el más reciente)
        const ctxPie = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Pie`);
        if (chartFechaPie) chartFechaPie.destroy();
        if (chartMesPie) chartMesPie.destroy();
        if (chartAnioPie) chartAnioPie.destroy();
        
        // Tomar el último período para mostrar en la gráfica circular
        const lastIndex = datos.labels.length - 1;
        const lastLabel = datos.labels[lastIndex] || 'Actual';
        const lastColombia = datos.valuesColombia[lastIndex] || 0;
        const lastOtros = datos.valuesOtros[lastIndex] || 0;
        
        const chartPie = new Chart(ctxPie, {
            type: "doughnut",
            data: {
                labels: ['Colombia', 'Otros Países'],
                datasets: [{
                    data: [lastColombia, lastOtros],
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
                    },
                    title: {
                        display: true,
                        text: `${lastLabel} - Distribución por Nacionalidad`,
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = lastColombia + lastOtros;
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

    // =============================================
    // FUNCIONES DE FILTRADO COMBINADO
    // =============================================

    // Aplicar filtros combinados
    async function aplicarFiltrosCombinados() {
        try {
            const fechaInicial = document.getElementById('filtro-fecha-inicial').value;
            const fechaFinal = document.getElementById('filtro-fecha-final').value;
            const nacionalidad = document.getElementById('filtro-nacionalidad-comb').value;

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
                .select('id_ciudad, fecha_visita')
                .gte('fecha_visita', fechaInicial + 'T00:00:00')
                .lte('fecha_visita', fechaFinal + 'T23:59:59')
                .not('id_ciudad', 'is', null);

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
    async function procesarDatosFiltrados(participantes, tipo) {
        if (tipo === 'nacionalidad') {
            // Obtener países de los participantes filtrados
            const mapaCiudadPais = await obtenerPaisesDeParticipantes(participantes);
            
            // Contar participantes por país
            const conteoPaises = {};
            let sinPaisCount = 0;

            participantes.forEach(participante => {
                const pais = mapaCiudadPais[participante.id_ciudad];
                
                if (pais && pais !== 'Sin país') {
                    conteoPaises[pais] = (conteoPaises[pais] || 0) + 1;
                } else {
                    sinPaisCount++;
                }
            });

            // Separar Colombia de otros países
            let colombiaCount = 0;
            let otrosPaisesCount = 0;
            let detallesOtrosPaises = {};

            Object.keys(conteoPaises).forEach(nombrePais => {
                if (nombrePais.toLowerCase().includes('colombia')) {
                    colombiaCount += conteoPaises[nombrePais];
                } else {
                    otrosPaisesCount += conteoPaises[nombrePais];
                    detallesOtrosPaises[nombrePais] = conteoPaises[nombrePais];
                }
            });

            // Agregar los que no tienen país a "Otros países"
            otrosPaisesCount += sinPaisCount;

            const conteoFinal = {
                'Colombia': colombiaCount,
                'Otros países': otrosPaisesCount
            };
            
            procesarDatosNacionalidad(conteoFinal, detallesOtrosPaises);
            
        } else {
            const mapaCiudadPais = await obtenerPaisesDeParticipantes(participantes);
            procesarDatosTiempo(participantes, tipo, mapaCiudadPais);
            mostrarInterfazTiempo(tipo);
        }
    }

    // Limpiar filtros combinados
    function limpiarFiltrosCombinados() {
        document.getElementById('filtro-fecha-inicial').value = '';
        document.getElementById('filtro-fecha-final').value = '';
        document.getElementById('filtro-nacionalidad-comb').value = 'todas';
        
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
            filtrosDiv.style.display = tipo !== 'nacionalidad' ? 'block' : 'none';
        }

        tipoActual = tipo;

        if (tipo === 'nacionalidad') {
            if (datosNacionalidades.labels && datosNacionalidades.labels.length > 0) {
                mostrarInterfazNacionalidad();
            } else {
                cargarDatosCompletos();
            }
        } else {
            cargarDatosTiempo(tipo);
        }
    }

    // =============================================
    // FUNCIONES DE MODAL CON FILTROS INTEGRADOS (ADAPTADAS DE INSTITUCIÓN)
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
                    <button class="btn-filter-modal" onclick="window.NacionalidadManager.aplicarFiltrosModal()" style="background: #2e7d32; color: white;">
                        <i class="fas fa-check"></i> Aplicar
                    </button>
                    <button class="btn-filter-modal" onclick="window.NacionalidadManager.limpiarFiltrosModal()" style="background: #95a5a6; color: white;">
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

        // Si no es nacionalidad, agregar filtros de fecha
        if (tipo !== 'nacionalidad') {
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

        // Agregar filtro de nacionalidad para todos los tipos
        html += `
                <!-- Nacionalidad -->
                <div class="filter-group">
                    <label><i class="fas fa-flag"></i> Nacionalidad:</label>
                    <select id="modalNacionalidad" class="filter-select">
                        <option value="todas">Todas las nacionalidades</option>
                        ${Object.keys(datosNacionalidades.datosCompletos || {}).map(nac => 
                            `<option value="${nac}">${nac}</option>`
                        ).join('')}
                        ${datosNacionalidades.detallesOtrosPaises ? Object.keys(datosNacionalidades.detallesOtrosPaises).map(pais => 
                            `<option value="${pais}">Otros - ${pais}</option>`
                        ).join('') : ''}
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

    // Función para abrir modal de nacionalidad CON FILTROS DENTRO
    function abrirModalNacionalidad(tipoGrafica) {
        const modal = document.getElementById("chartModalNacionalidad");
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
        actualizarContenidoModal('nacionalidad', tipoGrafica);
        
        // Crear gráfica ampliada
        setTimeout(() => {
            crearGraficaAmpliadaNacionalidad(tipoGrafica);
            llenarTablaModalNacionalidad();
        }, 100);
    }

    // Función para abrir modal de tiempo CON FILTROS DENTRO
    function abrirModalTiempo(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalNacionalidad");
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
        const modal = document.getElementById("chartModalNacionalidad");
        if (!modal) return;
        
        // Crear contenido completo del modal
        const titulo = tipo === 'nacionalidad' ? 'Distribución por Nacionalidad' : getTituloTiempo(tipo);
        const iconoTitulo = tipo === 'nacionalidad' ? 'fa-globe-americas' : 
                           tipo === 'fecha' ? 'fa-calendar-day' : 
                           tipo === 'mes' ? 'fa-calendar-week' : 'fa-calendar-alt';
        
        const html = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title" id="modalTitleNacionalidad">
                        <i class="fas ${iconoTitulo}"></i> ${titulo} - Vista Ampliada
                    </div>
                    <div class="modal-actions">
                        <button class="download-btn-small secondary" onclick="window.NacionalidadManager.descargarPNG()">
                            <i class="fas fa-image"></i> PNG
                        </button>
                        <button class="download-btn-small" onclick="window.NacionalidadManager.descargarExcelModal()">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <span class="close" onclick="window.NacionalidadManager.cerrarModal()">&times;</span>
                    </div>
                </div>

                <!-- FILTROS DENTRO DEL MODAL -->
                ${crearHTMLFiltrosModal(tipo)}

                <div class="modal-chart-container">
                    <canvas id="chartAmpliadoNacionalidad"></canvas>
                </div>

                <div class="data-table">
                    <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-table"></i> Datos Detallados
                    </h4>
                    <table class="table" id="tablaDatosNacionalidad">
                        <thead>
                            <tr>
                                <th>${tipo === 'nacionalidad' ? 'Nacionalidad' : 'Período'}</th>
                                <th>${tipo === 'nacionalidad' ? 'Tipo' : 'Descripción'}</th>
                                <th>Total Visitantes</th>
                                <th>Porcentaje</th>
                                ${tipo !== 'nacionalidad' ? '<th>Tendencia</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="tbodyDatosNacionalidad">
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
        if (tipo === 'nacionalidad') {
            crearGraficaAmpliadaNacionalidad(tipoGrafica);
        } else {
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
        }
    }

    // Función para determinar el tipo actual del modal
    function determinarTipoActual() {
        const titulo = document.getElementById('modalTitleNacionalidad')?.textContent || '';
        if (titulo.includes('Nacionalidad')) return 'nacionalidad';
        if (titulo.includes('Fecha')) return 'fecha';
        if (titulo.includes('Mes')) return 'mes';
        if (titulo.includes('Año')) return 'anio';
        return 'nacionalidad';
    }

    // Función para aplicar filtros del modal
    async function aplicarFiltrosModal() {
        try {
            mostrarLoading('Aplicando filtros...');
            
            const tipoGrafica = document.getElementById('modalTipoGrafica')?.value || 'bar';
            const fechaInicio = document.getElementById('modalFechaInicio')?.value;
            const fechaFin = document.getElementById('modalFechaFin')?.value;
            const nacionalidad = document.getElementById('modalNacionalidad')?.value || 'todas';
            const cantidad = parseInt(document.getElementById('modalCantidad')?.value || '10');
            const orden = document.getElementById('modalOrden')?.value || 'desc';
            
            const tipo = determinarTipoActual();
            let datosFiltrados;
            
            if (tipo === 'nacionalidad') {
                // Filtrar datos de nacionalidades
                datosFiltrados = await filtrarDatosNacionalidadModal(nacionalidad, cantidad, orden);
                crearGraficaAmpliadaNacionalidadConDatos(datosFiltrados, tipoGrafica);
                llenarTablaModalNacionalidadConDatos(datosFiltrados);
            } else {
                // Filtrar datos de tiempo
                datosFiltrados = await filtrarDatosTiempoModal(tipo, fechaInicio, fechaFin, nacionalidad, cantidad, orden);
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

    // Función para filtrar datos de nacionalidad en modal
    async function filtrarDatosNacionalidadModal(nacionalidad, cantidad, orden) {
        let datos = { ...datosNacionalidades };
        
        // Filtrar por nacionalidad específica
        if (nacionalidad !== 'todas') {
            // Verificar si es una nacionalidad principal
            const index = datos.labels.indexOf(nacionalidad);
            if (index !== -1) {
                datos = {
                    labels: [nacionalidad],
                    values: [datos.values[index]],
                    total: datos.values[index],
                    datosCompletos: { [nacionalidad]: datos.values[index] },
                    detallesOtrosPaises: {}
                };
            } else if (datos.detallesOtrosPaises && datos.detallesOtrosPaises[nacionalidad]) {
                // Si es un país dentro de "Otros países"
                datos = {
                    labels: ['Otros países', nacionalidad],
                    values: [datos.values[1], datos.detallesOtrosPaises[nacionalidad]],
                    total: datos.detallesOtrosPaises[nacionalidad] + datos.values[1] - datos.detallesOtrosPaises[nacionalidad],
                    datosCompletos: { 
                        'Otros países': datos.values[1] - datos.detallesOtrosPaises[nacionalidad],
                        [nacionalidad]: datos.detallesOtrosPaises[nacionalidad]
                    },
                    detallesOtrosPaises: { [nacionalidad]: datos.detallesOtrosPaises[nacionalidad] }
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
    async function filtrarDatosTiempoModal(tipo, fechaInicio, fechaFin, nacionalidad, cantidad, orden) {
        let query = supabase
            .from('participantes_reserva')
            .select('fecha_visita, id_ciudad')
            .not('fecha_visita', 'is', null)
            .not('id_ciudad', 'is', null);
        
        // Aplicar filtros de fecha si existen
        if (fechaInicio) {
            query = query.gte('fecha_visita', fechaInicio + 'T00:00:00');
        }
        if (fechaFin) {
            query = query.lte('fecha_visita', fechaFin + 'T23:59:59');
        }
        
        const { data: participantes, error } = await query;
        if (error) throw error;
        
        // Obtener países de los participantes
        const mapaCiudadPais = await obtenerPaisesDeParticipantes(participantes);
        
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
                
                if (!conteo[clave]) {
                    conteo[clave] = { total: 0, colombia: 0, otros: 0 };
                }
                
                const pais = mapaCiudadPais[participante.id_ciudad] || 'Sin país';
                conteo[clave].total++;
                if (pais.toLowerCase().includes('colombia')) {
                    conteo[clave].colombia++;
                } else {
                    conteo[clave].otros++;
                }
            }
        });
        
        // Convertir a arrays
        let labels = Object.keys(conteo);
        let valuesColombia = labels.map(label => conteo[label].colombia);
        let valuesOtros = labels.map(label => conteo[label].otros);
        
        // Ordenar
        if (orden === 'desc') {
            const indices = labels
                .map((label, i) => ({ label, value: conteo[label].total }))
                .sort((a, b) => b.value - a.value)
                .map(item => labels.indexOf(item.label));
            
            labels = indices.map(i => labels[i]);
            valuesColombia = indices.map(i => valuesColombia[i]);
            valuesOtros = indices.map(i => valuesOtros[i]);
        } else if (orden === 'asc') {
            const indices = labels
                .map((label, i) => ({ label, value: conteo[label].total }))
                .sort((a, b) => a.value - b.value)
                .map(item => labels.indexOf(item.label));
            
            labels = indices.map(i => labels[i]);
            valuesColombia = indices.map(i => valuesColombia[i]);
            valuesOtros = indices.map(i => valuesOtros[i]);
        } else if (orden === 'alpha') {
            const indices = labels
                .map((label, i) => ({ label, value: conteo[label].total }))
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(item => labels.indexOf(item.label));
            
            labels = indices.map(i => labels[i]);
            valuesColombia = indices.map(i => valuesColombia[i]);
            valuesOtros = indices.map(i => valuesOtros[i]);
        }
        
        // Limitar cantidad
        if (cantidad > 0 && cantidad < labels.length) {
            labels = labels.slice(0, cantidad);
            valuesColombia = valuesColombia.slice(0, cantidad);
            valuesOtros = valuesOtros.slice(0, cantidad);
        }
        
        return {
            labels: labels,
            valuesColombia: valuesColombia,
            valuesOtros: valuesOtros,
            totalColombia: valuesColombia.reduce((a, b) => a + b, 0),
            totalOtros: valuesOtros.reduce((a, b) => a + b, 0),
            total: labels.reduce((sum, label) => sum + conteo[label].total, 0)
        };
    }

    // Función para crear gráfica con datos filtrados de nacionalidad
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
                        text: 'Distribución por Nacionalidad (Filtrado)',
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

    // Función para crear gráfica con datos filtrados de tiempo
    function crearGraficaAmpliadaTiempoConDatos(tipo, datosFiltrados, tipoGrafica) {
        const ctx = document.getElementById("chartAmpliadoNacionalidad");
        if (!ctx) return;

        if (chartAmpliadoNacionalidad) {
            chartAmpliadoNacionalidad.destroy();
        }

        const colors = ['#27ae60', '#3498db']; // Verde para Colombia, Azul para otros
        const tipoChart = tipoGrafica;

        // Para gráficos de tiempo, manejamos dos datasets
        if (tipoChart === 'bar') {
            chartAmpliadoNacionalidad = new Chart(ctx, {
                type: tipoChart,
                data: {
                    labels: datosFiltrados.labels,
                    datasets: [
                        {
                            label: "Colombia",
                            data: datosFiltrados.valuesColombia,
                            backgroundColor: colors[0],
                            borderColor: colors[0],
                            borderWidth: 0,
                            borderRadius: 8,
                            barThickness: 25,
                        },
                        {
                            label: "Otros Países",
                            data: datosFiltrados.valuesOtros,
                            backgroundColor: colors[1],
                            borderColor: colors[1],
                            borderWidth: 0,
                            borderRadius: 8,
                            barThickness: 25,
                        }
                    ],
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
                                    const label = context.dataset.label || '';
                                    const value = context.raw;
                                    const total = context.datasetIndex === 0 ? 
                                        datosFiltrados.valuesColombia[context.dataIndex] + datosFiltrados.valuesOtros[context.dataIndex] : 0;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: true,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            title: {
                                display: true,
                                text: 'Cantidad de Visitantes',
                                font: { weight: 'bold', size: 14 }
                            }
                        },
                        x: {
                            stacked: true,
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
        } else {
            // Para gráficos circulares, solo mostrar el total
            const totalColombia = datosFiltrados.totalColombia;
            const totalOtros = datosFiltrados.totalOtros;
            
            chartAmpliadoNacionalidad = new Chart(ctx, {
                type: tipoChart,
                data: {
                    labels: ['Colombia', 'Otros Países'],
                    datasets: [{
                        data: [totalColombia, totalOtros],
                        backgroundColor: colors,
                        borderColor: colors.map(color => darkenColor(color, 0.2)),
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
                            text: `${getTituloTiempo(tipo)} - Total (Filtrado)`,
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
                                    const value = context.raw;
                                    const total = totalColombia + totalOtros;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: tipoChart === 'doughnut' ? '40%' : '0%'
                }
            });
        }
    }

    // Función para llenar tabla con datos filtrados de nacionalidad
    function llenarTablaModalNacionalidadConDatos(datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosNacionalidad");
        if (!tbody) return;

        tbody.innerHTML = datosFiltrados.labels.map((nacionalidad, index) => {
            const cantidad = datosFiltrados.values[index];
            const porcentaje = datosFiltrados.total > 0 ? ((cantidad / datosFiltrados.total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoNacionalidad(nacionalidad);
            const icono = nacionalidad === 'Colombia' ? 'fa-flag' : 'fa-globe-americas';
            
            return `
                <tr>
                    <td><span><i class="fas ${icono}"></i> <strong>${nacionalidad}</strong></span></td>
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
        const tbody = document.getElementById("tbodyDatosNacionalidad");
        if (!tbody) return;

        tbody.innerHTML = datosFiltrados.labels.map((label, index) => {
            const colombia = datosFiltrados.valuesColombia[index];
            const otros = datosFiltrados.valuesOtros[index];
            const total = colombia + otros;
            const porcentajeColombia = total > 0 ? ((colombia / total) * 100).toFixed(1) : 0;
            
            // Calcular tendencia
            let tendencia = '';
            if (index > 0) {
                const totalAnterior = datosFiltrados.valuesColombia[index - 1] + datosFiltrados.valuesOtros[index - 1];
                const diferencia = total - totalAnterior;
                const porcentajeCambio = totalAnterior > 0 ? ((diferencia / totalAnterior) * 100).toFixed(1) : 100;
                
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
                    <td style="text-align: center; font-weight: bold">${total.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentajeColombia}%</td>
                    <td style="text-align: center;">${tendencia}</td>
                </tr>
            `;
        }).join('') + (datosFiltrados.total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${datosFiltrados.total.toLocaleString()}</td>
                <td style="text-align: center">${datosFiltrados.total > 0 ? ((datosFiltrados.totalColombia / datosFiltrados.total) * 100).toFixed(1) : 0}%</td>
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
                } else if (element.id === 'modalNacionalidad') {
                    element.value = 'todas';
                }
            } else if (element.tagName === 'INPUT') {
                element.value = '';
            }
        });
        
        // Recargar gráfica original
        const tipo = determinarTipoActual();
        const tipoGrafica = document.getElementById('modalTipoGrafica')?.value || 'bar';
        
        if (tipo === 'nacionalidad') {
            crearGraficaAmpliadaNacionalidad(tipoGrafica);
            llenarTablaModalNacionalidad();
        } else {
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
            llenarTablaModalTiempo(tipo);
        }
        
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    }

    // Función para cerrar modal
    function cerrarModalNacionalidad() {
        const modal = document.getElementById("chartModalNacionalidad");
        if (modal) {
            modal.classList.remove("show");
        }
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

    // Llenar tabla del modal de nacionalidad
    function llenarTablaModalNacionalidad() {
        const tbody = document.getElementById("tbodyDatosNacionalidad");
        if (!tbody) return;

        const { labels, values, total } = datosNacionalidades;

        tbody.innerHTML = labels.map((nacionalidad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoNacionalidad(nacionalidad);
            const icono = nacionalidad === 'Colombia' ? 'fa-flag' : 'fa-globe-americas';
            
            return `
                <tr>
                    <td><span><i class="fas ${icono}"></i> <strong>${nacionalidad}</strong></span></td>
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
        const ctx = document.getElementById("chartAmpliadoNacionalidad");
        if (!ctx) return;

        // Destruir gráfica anterior si existe
        if (chartAmpliadoNacionalidad) {
            chartAmpliadoNacionalidad.destroy();
        }

        const datos = getDatosTiempo(tipo);
        const colors = ['#27ae60', '#3498db']; // Verde para Colombia, Azul para otros
        const totalColombia = datos.valuesColombia.reduce((a, b) => a + b, 0);
        const totalOtros = datos.valuesOtros.reduce((a, b) => a + b, 0);
        const tipoChart = tipoGrafica;

        if (tipoChart === 'bar') {
            chartAmpliadoNacionalidad = new Chart(ctx, {
                type: tipoChart,
                data: {
                    labels: datos.labels,
                    datasets: [
                        {
                            label: "Colombia",
                            data: datos.valuesColombia,
                            backgroundColor: colors[0],
                            borderColor: colors[0],
                            borderWidth: 0,
                            borderRadius: 8,
                            barThickness: 25,
                        },
                        {
                            label: "Otros Países",
                            data: datos.valuesOtros,
                            backgroundColor: colors[1],
                            borderColor: colors[1],
                            borderWidth: 0,
                            borderRadius: 8,
                            barThickness: 25,
                        }
                    ],
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
                                    const label = context.dataset.label || '';
                                    const value = context.raw;
                                    const total = context.datasetIndex === 0 ? 
                                        datos.valuesColombia[context.dataIndex] + datos.valuesOtros[context.dataIndex] : 0;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: true,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            title: {
                                display: true,
                                text: 'Cantidad de Visitantes',
                                font: { weight: 'bold', size: 14 }
                            }
                        },
                        x: {
                            stacked: true,
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
        } else {
            chartAmpliadoNacionalidad = new Chart(ctx, {
                type: tipoChart,
                data: {
                    labels: ['Colombia', 'Otros Países'],
                    datasets: [{
                        data: [totalColombia, totalOtros],
                        backgroundColor: colors,
                        borderColor: colors.map(color => darkenColor(color, 0.2)),
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
                            text: `${getTituloTiempo(tipo)} - Distribución Total`,
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
                                    const value = context.raw;
                                    const total = totalColombia + totalOtros;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} visitantes (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: tipoChart === 'doughnut' ? '40%' : '0%'
                }
            });
        }
    }

    // Llenar tabla del modal de tiempo
    function llenarTablaModalTiempo(tipo) {
        const tbody = document.getElementById("tbodyDatosNacionalidad");
        if (!tbody) return;

        const datos = getDatosTiempo(tipo);
        const total = datos.valuesColombia.reduce((a, b) => a + b, 0) + datos.valuesOtros.reduce((a, b) => a + b, 0);

        tbody.innerHTML = datos.labels.map((label, index) => {
            const colombia = datos.valuesColombia[index];
            const otros = datos.valuesOtros[index];
            const totalPeríodo = colombia + otros;
            const porcentajeColombia = totalPeríodo > 0 ? ((colombia / totalPeríodo) * 100).toFixed(1) : 0;
            
            // Calcular tendencia
            let tendencia = '';
            if (index > 0) {
                const totalAnterior = datos.valuesColombia[index - 1] + datos.valuesOtros[index - 1];
                const diferencia = totalPeríodo - totalAnterior;
                const porcentajeCambio = totalAnterior > 0 ? ((diferencia / totalAnterior) * 100).toFixed(1) : 100;
                
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
                    <td style="text-align: center; font-weight: bold">${totalPeríodo.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentajeColombia}%</td>
                    <td style="text-align: center;">${tendencia}</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">${total > 0 ? ((datos.valuesColombia.reduce((a, b) => a + b, 0) / total) * 100).toFixed(1) : 0}%</td>
                <td style="text-align: center;">-</td>
            </tr>
        ` : '');
    }

    // =============================================
    // FUNCIONES DE DESCARGA
    // =============================================

    function descargarGraficoPrincipal() {
        if (chartBarNacionalidad) {
            const link = document.createElement("a");
            link.download = "grafica_nacionalidades_principal.png";
            link.href = chartBarNacionalidad.canvas.toDataURL("image/png");
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
        const { labels, values, total, detallesOtrosPaises } = datosNacionalidades;
        
        const datosExcel = [
            ['Nacionalidad', 'Total Visitantes', 'Porcentaje', 'Tipo'],
            ...labels.map((label, i) => {
                const porcentaje = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
                const tipo = obtenerTipoNacionalidad(label);
                return [label, values[i], `${porcentaje}%`, tipo];
            }),
            ['TOTAL', total, '100%', '']
        ];

        // Agregar detalles de otros países si existen
        if (detallesOtrosPaises && Object.keys(detallesOtrosPaises).length > 0) {
            datosExcel.push([]); // Línea en blanco
            datosExcel.push(['DETALLE DE OTROS PAÍSES', '', '', '']);
            datosExcel.push(['País', 'Total Visitantes', 'Porcentaje (Otros)', '']);
            
            Object.entries(detallesOtrosPaises).forEach(([pais, cantidad]) => {
                const porcentajeOtros = values[1] > 0 ? ((cantidad / values[1]) * 100).toFixed(1) : 0;
                datosExcel.push([pais, cantidad, `${porcentajeOtros}%`, '']);
            });
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos por Nacionalidad");
        XLSX.writeFile(wb, "reporte_nacionalidades.xlsx");
    }

    function descargarExcelTiempo(tipo) {
        const datos = getDatosTiempo(tipo);
        
        const datosExcel = [
            [getTituloTiempo(tipo).split(' ')[1], 'Colombia', 'Otros Países', 'Total', '% Colombia'],
            ...datos.labels.map((label, i) => {
                const colombia = datos.valuesColombia[i];
                const otros = datos.valuesOtros[i];
                const total = colombia + otros;
                const porcentajeColombia = total > 0 ? ((colombia / total) * 100).toFixed(1) : 0;
                return [label, colombia, otros, total, `${porcentajeColombia}%`];
            }),
            ['TOTAL', datos.totalColombia, datos.totalOtros, datos.total, 
             datos.total > 0 ? `${((datos.totalColombia / datos.total) * 100).toFixed(1)}%` : '0%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, `Datos por ${tipo}`);
        XLSX.writeFile(wb, `reporte_${tipo}_nacionalidad.xlsx`);
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
    if (!window.NacionalidadManager) {
        window.NacionalidadManager = {};
    }

    // Función para inicializar la API completa
    function inicializarAPICompleta() {
        // Métodos de modal con filtros
        window.NacionalidadManager.abrirModal = (tipo) => abrirModalNacionalidad(tipo);
        window.NacionalidadManager.abrirModalTiempo = (tipo, tipoGrafica) => abrirModalTiempo(tipo, tipoGrafica);
        window.NacionalidadManager.cerrarModal = () => cerrarModalNacionalidad();
        window.NacionalidadManager.aplicarFiltrosModal = () => aplicarFiltrosModal();
        window.NacionalidadManager.limpiarFiltrosModal = () => limpiarFiltrosModal();
        
        // Métodos de descarga
        window.NacionalidadManager.descargarPNG = () => {
            const canvas = document.getElementById("chartAmpliadoNacionalidad");
            if (canvas) {
                const link = document.createElement("a");
                link.download = "grafica_ampliada_nacionalidad.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        };
        
        window.NacionalidadManager.descargarExcelModal = () => {
            const titulo = document.getElementById('modalTitleNacionalidad')?.textContent || 'Reporte Nacionalidad';
            const tbody = document.getElementById("tbodyDatosNacionalidad");
            if (!tbody) return;
            
            const filas = tbody.querySelectorAll('tr');
            const datosExcel = [];
            
            // Obtener encabezados de la tabla
            const thead = document.querySelector('#tablaDatosNacionalidad thead');
            const encabezados = [];
            if (thead) {
                const ths = thead.querySelectorAll('th');
                ths.forEach(th => encabezados.push(th.textContent.trim()));
                datosExcel.push(encabezados);
            } else {
                // Encabezados por defecto
                datosExcel.push(['Nacionalidad/Período', 'Descripción', 'Total Visitantes', 'Porcentaje', 'Tendencia']);
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
            XLSX.utils.book_append_sheet(wb, ws, "Datos Filtrados Nacionalidad");
            XLSX.writeFile(wb, "reporte_filtrado_nacionalidad.xlsx");
        };

        // Métodos principales
        window.NacionalidadManager.inicializar = () => cargarDatosCompletos();
        window.NacionalidadManager.cambiarTipoReporte = (tipo) => cambiarTipoReporte(tipo);
        
        // Métodos de filtrado principal
        window.NacionalidadManager.aplicarFiltrosCombinados = () => aplicarFiltrosCombinados();
        window.NacionalidadManager.limpiarFiltrosCombinados = () => limpiarFiltrosCombinados();
        window.NacionalidadManager.exportarDatosFiltrados = () => exportarDatosFiltrados();
        
        // Métodos para tiempo
        window.NacionalidadManager.descargarGraficoPrincipalTiempo = (tipo) => descargarGraficoPrincipalTiempo(tipo);
        window.NacionalidadManager.descargarExcelTiempo = (tipo) => descargarExcelTiempo(tipo);

        // Métodos generales
        window.NacionalidadManager.descargarGraficoPrincipal = () => descargarGraficoPrincipal();
        window.NacionalidadManager.descargarExcel = () => descargarExcel();
    }

    // Inicializar la API completa
    inicializarAPICompleta();

    console.log('✅ Sistema de Nacionalidad con filtros en modal cargado correctamente');

    // Auto-inicializar
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (window.NacionalidadManager && window.NacionalidadManager.inicializar) {
                window.NacionalidadManager.inicializar();
            }
        }, 1000);
    });

})();
