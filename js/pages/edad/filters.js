// EdadSystem - filters
// Refactor modular: lógica original preservada.

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

async function aplicarFiltrosCombinados() {
        try {
            const fechaInicial = document.getElementById('filtro-fecha-inicial').value;
            const fechaFinal = document.getElementById('filtro-fecha-final').value;
            const rangoEdad = document.getElementById('filtro-rango-edad').value;

            // Validar fechas
            if (!fechaInicial || !fechaFinal) {
                mostrarErrorEdad('Por favor selecciona ambas fechas');
                return;
            }

            if (fechaInicial > fechaFinal) {
                mostrarErrorEdad('La fecha inicial no puede ser mayor que la fecha final');
                return;
            }

            mostrarLoadingEdad('Aplicando filtros...');

            const tipoReporte = obtenerTipoReporteActual();
            
            let query = supabase
                .from('participantes_reserva')
                .select('fecha_visita, fecha_nacimiento')
                .not('fecha_visita', 'is', null)
                .gte('fecha_visita', fechaInicial + 'T00:00:00')
                .lte('fecha_visita', fechaFinal + 'T23:59:59');

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                // Procesar datos con filtros
                const datosFiltrados = procesarDatosTiempoConFiltros(
                    participantesFiltrados, 
                    tipoReporte, 
                    rangoEdad
                );
                
                // Mostrar interfaz con datos filtrados
                mostrarInterfazTiempoConFiltros(tipoReporte, datosFiltrados, rangoEdad);
                
                mostrarExitoEdad(`Filtros aplicados: ${participantesFiltrados.length} visitas encontradas`);
            } else {
                mostrarMensajeNoHayDatos(rangoEdad);
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

function procesarDatosTiempoConFiltros(participantes, tipo, rangoEdad) {
        console.log(`🔄 Procesando datos con filtros: ${tipo}, Rango: ${rangoEdad}`);
        
        const datosPorTiempo = {};
        const rangosEdad = ['0-17', '18-25', '26-35', '36-50', '51-65', '66+'];
        const fechasSet = new Set();
        
        // Determinar qué rangos incluir
        let rangosAIncluir = [];
        if (rangoEdad === 'todos') {
            // Incluir todos los rangos
            rangosAIncluir = rangosEdad;
        } else {
            // Solo el rango específico seleccionado
            rangosAIncluir = [rangoEdad];
        }
        
        // Inicializar estructura para cada rango a incluir
        rangosAIncluir.forEach(rango => {
            datosPorTiempo[rango] = {};
        });
        
        // Procesar cada participante
        participantes.forEach(participante => {
            if (participante.fecha_visita && participante.fecha_nacimiento) {
                const fecha = new Date(participante.fecha_visita);
                const edad = calcularEdad(participante.fecha_nacimiento);
                
                if (edad !== null) {
                    const rango = clasificarEdad(edad);
                    let claveFecha = '';
                    
                    // Determinar clave según tipo
                    switch(tipo) {
                        case 'fecha':
                            claveFecha = fecha.toISOString().split('T')[0];
                            break;
                        case 'mes':
                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                            claveFecha = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                            break;
                        case 'anio':
                            claveFecha = fecha.getFullYear().toString();
                            break;
                    }
                    
                    // Solo procesar si el rango está en los rangos a incluir
                    if (rangosAIncluir.includes(rango)) {
                        fechasSet.add(claveFecha);
                        
                        // Contar en el rango correspondiente
                        if (datosPorTiempo[rango][claveFecha]) {
                            datosPorTiempo[rango][claveFecha]++;
                        } else {
                            datosPorTiempo[rango][claveFecha] = 1;
                        }
                    }
                }
            }
        });
        
        // Ordenar fechas
        const fechasOrdenadas = Array.from(fechasSet).sort((a, b) => {
            switch(tipo) {
                case 'fecha': return new Date(a) - new Date(b);
                case 'mes': return ordenarMeses(a, b);
                case 'anio': return parseInt(a) - parseInt(b);
                default: return 0;
            }
        });
        
        // Limitar a las últimas fechas si son muchas
        let fechasMostrar = fechasOrdenadas;
        if (tipo === 'fecha' && fechasOrdenadas.length > 10) {
            fechasMostrar = fechasOrdenadas.slice(-10);
        } else if (tipo === 'mes' && fechasOrdenadas.length > 12) {
            fechasMostrar = fechasOrdenadas.slice(-12);
        }
        
        // Preparar datasets para Chart.js (BARRAS AGRUPADAS)
        const datasets = rangosAIncluir.map((rango, index) => {
            const datosRango = datosPorTiempo[rango] || {};
            const data = fechasMostrar.map(fecha => datosRango[fecha] || 0);
            
            // Verificar si este rango tiene datos
            const totalRango = data.reduce((sum, val) => sum + val, 0);
            
            if (totalRango > 0 || rangoEdad !== 'todos') {
                return {
                    label: `${rango} años`,
                    data: data,
                    backgroundColor: coloresPorEdad[rango],
                    borderColor: darkenColor(coloresPorEdad[rango], 0.2),
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: rangoEdad === 'todos' ? 15 : 35, // Más ancho si solo hay un rango
                    hidden: false
                };
            } else {
                return null; // No incluir rangos sin datos
            }
        }).filter(dataset => dataset !== null); // Filtrar rangos sin datos
        
        // Si no hay datasets (todos los rangos estaban vacíos)
        if (datasets.length === 0) {
            datasets.push({
                label: rangoEdad === 'todos' ? 'Sin datos' : `${rangoEdad} años`,
                data: fechasMostrar.map(() => 0),
                backgroundColor: rangoEdad === 'todos' ? '#95a5a6' : coloresPorEdad[rangoEdad],
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 35
            });
        }
        
        // Calcular total general
        const totalGeneral = datasets.reduce((total, dataset) => 
            total + dataset.data.reduce((sum, val) => sum + val, 0), 0);
        
        // Estructura de datos final
        const datosFiltrados = {
            labels: fechasMostrar,
            datasets: datasets,
            rangosEdad: datasets.map(d => d.label.replace(' años', '')),
            fechas: fechasMostrar,
            total: totalGeneral,
            filtrosAplicados: {
                rangoEdad: rangoEdad,
                participantesAnalizados: participantes.length
            }
        };
        
        console.log(`✅ Datos filtrados de ${tipo} procesados:`, datosFiltrados);
        
        return datosFiltrados;
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

function mostrarInterfazTiempoConFiltros(tipo, datosFiltrados, rangoEdad) {
    const container = document.getElementById('data-container');
    const titulo = getTituloTiempo(tipo);
    const icono = getIconoTiempo(tipo);
    
    const subtitulo = rangoEdad === 'todos' ? 
        'Todas las edades' : 
        `Solo ${rangoEdad} años`;
    
    container.innerHTML = `
        <div class="chart-controls">
            <div class="chart-header">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                    ${icono} ${titulo}
                    <span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                        ${subtitulo}
                    </span>
                    <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                        ${datosFiltrados.total} visitantes
                    </span>
                </h3>
                <div style="display: flex; gap: 10px;">
                    <button class="download-btn" onclick="window.EdadSystem.descargarGraficoFiltrado('${tipo}', '${rangoEdad}')">
                        <i class="fas fa-download"></i> Descargar Gráfico
                    </button>
                    <button class="btn" onclick="window.EdadSystem.limpiarFiltrosCombinados()" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-times"></i> Limpiar Filtros
                    </button>
                </div>
            </div>
            
            <!-- Indicador de filtros aplicados -->
            <div style="background: #e8f5e8; padding: 12px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3498db;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-filter" style="color: #3498db;"></i>
                    <div>
                        <strong>Filtros aplicados:</strong> 
                        ${rangoEdad === 'todos' ? 'Todas las edades' : `${rangoEdad} años`}
                        <br><small>${datosFiltrados.filtrosAplicados?.participantesAnalizados || 0} participantes analizados</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card" onclick="window.EdadSystem.abrirModalTiempoFiltrado('${tipo}', 'bar', '${rangoEdad}')">
                <div class="chart-card-header">
                    <div class="chart-card-title">
                        <i class="fas fa-chart-bar"></i> ${titulo} - Barras Agrupadas
                    </div>
                    <div class="chart-card-badge">Haz clic para ampliar</div>
                </div>
                <div class="chart-canvas-wrap">
                    <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}BarFiltrado"></canvas>
                </div>
            </div>

            <div class="chart-card" onclick="window.EdadSystem.abrirModalTiempoFiltrado('${tipo}', 'pie', '${rangoEdad}')">
                <div class="chart-card-header">
                    <div class="chart-card-title">
                        <i class="fas fa-chart-pie"></i> ${titulo} - Circular
                    </div>
                    <div class="chart-card-badge">Haz clic para ampliar</div>
                </div>
                <div class="chart-canvas-wrap pie-chart-container">
                    <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}PieFiltrado"></canvas>
                </div>
            </div>
        </div>

        <div class="data-table">
            <div class="chart-header">
                <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                    <i class="fas fa-table"></i> Detalle por ${titulo.split(' ')[1]} y Rango de Edad
                </h3>
                <button class="download-btn" onclick="window.EdadSystem.descargarExcelFiltrado('${tipo}', '${rangoEdad}')">
                    <i class="fas fa-file-excel"></i> Exportar Excel
                </button>
            </div>
            <div style="overflow-x: auto;">
                <table class="table" style="min-width: 700px;">
                    <thead>
                        <tr>
                            <th style="min-width: 150px;">${titulo.split(' ')[1]}</th>
                            ${datosFiltrados.datasets.map(dataset => `<th>${dataset.label}</th>`).join('')}
                            <th style="width: 120px;">Total</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-${tipo}-filtrado-body">
                        ${generarFilasTablaFiltrada(datosFiltrados, tipo)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    mostrarGraficasTiempoFiltradas(tipo, datosFiltrados);
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
                // Procesar datos según tipo y rango de edad - USAR LA NUEVA FUNCIÓN
                const datosFiltrados = procesarDatosTiempoConEdad(participantesFiltrados, tipo, rangoEdad);
                
                // Obtener el tipo de gráfica actual del modal
                const modalChartContainer = document.querySelector('.modal-chart-container');
                const tipoGrafica = modalChartContainer?.getAttribute('data-tipo-grafica') || 'bar';
                
                // Actualizar la gráfica del modal con los datos filtrados AGRUPADOS
                actualizarGraficaModalConDatosAgrupados(tipo, datosFiltrados, tipoGrafica, { 
                    fechaInicio, 
                    fechaFin, 
                    rangoEdad 
                });
                
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

function mostrarFiltrosAvanzados() {
        const filtrosDiv = document.getElementById('filtros-avanzados-edad');
        if (filtrosDiv.style.display === 'none') {
            filtrosDiv.style.display = 'block';
        } else {
            filtrosDiv.style.display = 'none';
        }
    }
