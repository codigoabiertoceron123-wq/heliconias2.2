// InstitucionSystem - filters
// Refactor modular: lógica original preservada.

// Actualizar filtros de instituciones - VERSIÓN CORREGIDA
    function actualizarFiltrosInstituciones() {
        const select = document.getElementById('filtro-institucion-comb');
        const selectModal = document.getElementById('modalInstitucion');
        
        // Función para llenar un select
        function llenarSelect(selectElement) {
            if (!selectElement) return;
            
            // Guardar selección actual si existe
            const seleccionActual = selectElement.value;
            
            // Limpiar todas las opciones
            selectElement.innerHTML = '';
            
            // Crear opción "Todas las instituciones"
            const opcionTodas = document.createElement('option');
            opcionTodas.value = 'todas';
            opcionTodas.textContent = 'Todas las instituciones';
            opcionTodas.selected = true;
            selectElement.appendChild(opcionTodas);
            
            // Crear un Set para evitar duplicados
            const institucionesUnicas = new Set();
            
            // 1. Agregar TODAS las instituciones de la base de datos
            if (Array.isArray(todasLasInstituciones)) {
                todasLasInstituciones.forEach(inst => {
                    if (inst.nombre_institucion && inst.nombre_institucion.trim()) {
                        institucionesUnicas.add(inst.nombre_institucion.trim());
                    }
                });
            }
            
            // 2. También agregar instituciones de datosCompletos (por si hay nuevas)
            if (datosInstituciones.datosCompletos) {
                Object.keys(datosInstituciones.datosCompletos).forEach(institucion => {
                    if (institucion && institucion.trim()) {
                        institucionesUnicas.add(institucion.trim());
                    }
                });
            }
            
            // Convertir a array y ordenar alfabéticamente
            const institucionesOrdenadas = Array.from(institucionesUnicas)
                .filter(inst => inst && inst.trim() !== '')
                .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
            
            // Agregar opciones al select
            institucionesOrdenadas.forEach(institucion => {
                const option = document.createElement('option');
                option.value = institucion;
                option.textContent = institucion;
                selectElement.appendChild(option);
            });
            
            // Restaurar selección anterior si existe
            if (seleccionActual && (seleccionActual === 'todas' || institucionesOrdenadas.includes(seleccionActual))) {
                selectElement.value = seleccionActual;
            }
            
            console.log(`✅ Filtro actualizado: ${institucionesOrdenadas.length} instituciones disponibles`);
            
            // Hacer el select más usable si hay muchas opciones
            if (institucionesOrdenadas.length > 10) {
                selectElement.size = Math.min(8, institucionesOrdenadas.length);
                selectElement.style.height = 'auto';
                selectElement.style.minHeight = '120px';
            }
        }
        
        // Llenar ambos selects
        llenarSelect(select);
        llenarSelect(selectModal);
    }

// =============================================
    // FUNCIONES DE FILTRADO COMBINADO
    // =============================================

    // Aplicar filtros combinados - VERSIÓN CORREGIDA (AGREGA ESTA LÍNEA)
    async function aplicarFiltrosCombinados() {
        try {
            const fechaInicial = document.getElementById('filtro-fecha-inicial').value;
            const fechaFinal = document.getElementById('filtro-fecha-final').value;
            const institucion = document.getElementById('filtro-institucion-comb').value;

            // Validar fechas
            if (fechaInicial && fechaFinal) {
                if (fechaInicial > fechaFinal) {
                    mostrarError('La fecha inicial no puede ser mayor que la fecha final');
                    return;
                }
            } else if (fechaInicial || fechaFinal) {
                mostrarError('Por favor selecciona ambas fechas o deja ambas vacías');
                return;
            }

            mostrarLoading('Aplicando filtros...');

            // Construir consulta base
            let query = supabase
                .from('participantes_reserva')
                .select('id_institucion, fecha_visita');

            // Filtrar por fecha si se especificaron
            if (fechaInicial && fechaFinal) {
                query = query.gte('fecha_visita', fechaInicial + 'T00:00:00');
                query = query.lte('fecha_visita', fechaFinal + 'T23:59:59');
            }

            // Filtrar por institución si NO es "todas"
            if (institucion && institucion !== 'todas') {
                const institucionObj = todasLasInstituciones.find(inst => 
                    inst.nombre_institucion && 
                    inst.nombre_institucion.trim() === institucion.trim()
                );
                
                if (!institucionObj) {
                    cerrarLoading();
                    mostrarSinDatosFiltradosEspecifico(institucion);
                    return;
                }
                
                query = query.eq('id_institucion', institucionObj.id_institucion);
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            console.log(`✅ Filtros aplicados: ${participantesFiltrados?.length || 0} registros encontrados`);

            cerrarLoading();

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                if (tipoActual === 'institucion') {
                    procesarDatosInstitucionFiltrados(participantesFiltrados);
                    mostrarExito(`Filtros aplicados: ${participantesFiltrados.length} visitantes encontrados`);
                } else {
                    procesarDatosTiempoFiltrados(participantesFiltrados, tipoActual);
                    mostrarExito(`Filtros aplicados: ${participantesFiltrados.length} visitantes encontrados`);
                }
            } else {
                cerrarLoading();
                if (institucion && institucion !== 'todas') {
                    mostrarSinDatosFiltradosEspecifico(institucion);
                } else {
                    mostrarSinDatosFiltrados();
                }
            }

        } catch (error) {
            console.error('Error aplicando filtros combinados:', error);
            cerrarLoading();
            mostrarError('Error al aplicar los filtros: ' + error.message);
        }
    }

// =============================================
    // FUNCIONES DE MODAL CON FILTROS INTEGRADOS
    // =============================================

    // Función para crear HTML de filtros para el modal - VERSIÓN ACTUALIZADA
    function crearHTMLFiltrosModal(tipo) {
        // Obtener todas las instituciones disponibles
        const institucionesDisponibles = Array.from(
            new Set([
                ...(Array.isArray(todasLasInstituciones) ? 
                    todasLasInstituciones.map(i => i.nombre_institucion) : []),
                ...Object.keys(datosInstituciones.datosCompletos || {})
            ])
        ).filter(inst => inst && inst.trim() !== '')
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

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
                    <select id="modalInstitucion" class="filter-select" style="min-height: 120px;">
                        <option value="todas" selected>Todas las instituciones</option>
                        ${institucionesDisponibles.map(inst => 
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

// Función para aplicar filtros del modal - VERSIÓN CON VALIDACIÓN
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
                
                // Validar datos
                if (validarDatosFiltrados(datosFiltrados)) {
                    crearGraficaAmpliadaInstitucionConDatos(datosFiltrados, tipoGrafica);
                    llenarTablaModalInstitucionConDatos(datosFiltrados);
                    mostrarExito(`Filtros aplicados: ${datosFiltrados.total || 0} registros encontrados`);
                } else {
                    mostrarError('No se encontraron datos con los filtros aplicados');
                }
            } else {
                // Filtrar datos de tiempo
                datosFiltrados = await filtrarDatosTiempoModal(tipo, fechaInicio, fechaFin, institucion, cantidad, orden);
                
                // Validar datos
                if (validarDatosFiltrados(datosFiltrados)) {
                    crearGraficaAmpliadaTiempoConDatos(tipo, datosFiltrados, tipoGrafica);
                    llenarTablaModalTiempoConDatos(tipo, datosFiltrados);
                    mostrarExito(`Filtros aplicados: ${datosFiltrados.total || 0} registros encontrados`);
                } else {
                    mostrarError('No se encontraron datos con los filtros aplicados');
                }
            }
            
            cerrarLoading();
            
        } catch (error) {
            console.error('Error aplicando filtros:', error);
            cerrarLoading();
            mostrarError('Error al aplicar los filtros: ' + error.message);
        }
    }

// Función para filtrar datos de tiempo en modal CON AGRUPACIÓN - VERSIÓN CORREGIDA
    async function filtrarDatosTiempoModal(tipo, fechaInicio, fechaFin, institucion, cantidad, orden) {
        try {
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
            
            // Si no hay participantes, devolver estructura vacía
            if (!participantes || participantes.length === 0) {
                return {
                    labels: [],
                    values: [],
                    total: 0,
                    datasets: [],
                    instituciones: [],
                    fechas: []
                };
            }
            
            // Procesar datos con la función de agrupación
            const datosAgrupados = procesarDatosTiempo(participantes, tipo);
            
            // Aplicar límite de cantidad si es necesario
            if (cantidad > 0 && cantidad < datosAgrupados.labels.length) {
                datosAgrupados.labels = datosAgrupados.labels.slice(0, cantidad);
                datosAgrupados.datasets.forEach(dataset => {
                    dataset.data = dataset.data.slice(0, cantidad);
                });
                datosAgrupados.fechas = datosAgrupados.labels;
            }
            
            // Asegurar que tenemos los campos necesarios
            return {
                labels: datosAgrupados.labels || [],
                values: datosAgrupados.datasets?.[0]?.data || [],
                total: datosAgrupados.datasets?.reduce((total, dataset) => 
                    total + dataset.data.reduce((sum, val) => sum + val, 0), 0) || 0,
                datasets: datosAgrupados.datasets || [],
                instituciones: datosAgrupados.instituciones || [],
                fechas: datosAgrupados.fechas || []
            };
            
        } catch (error) {
            console.error('Error filtrando datos de tiempo:', error);
            // Devolver estructura vacía en caso de error
            return {
                labels: [],
                values: [],
                total: 0,
                datasets: [],
                instituciones: [],
                fechas: []
            };
        }
    }

// Función para filtrar datos de institución en modal - VERSIÓN CON "TODAS"
    async function filtrarDatosInstitucionModal(institucion, cantidad, orden) {
        try {
            // Si se selecciona "todas", devolver datos del gráfico principal
            if (institucion === 'todas') {
                let datos = { ...datosInstituciones };
                
                // Aplicar ordenamiento
                datos = aplicarOrdenamientoInstituciones(datos, orden);
                
                // Aplicar límite de cantidad
                datos = aplicarLimiteCantidadInstituciones(datos, cantidad);
                
                return datos;
            }
            
            // Si se selecciona una institución específica
            const institucionObj = todasLasInstituciones.find(inst => 
                inst.nombre_institucion && 
                inst.nombre_institucion.trim().toLowerCase() === institucion.toLowerCase().trim()
            );
            
            if (!institucionObj) {
                return {
                    labels: [institucion],
                    values: [0],
                    total: 0,
                    datosCompletos: {},
                    mensaje: `Institución "${institucion}" no encontrada en la base de datos`
                };
            }
            
            // Consultar participantes de esta institución
            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('id, fecha_visita')
                .eq('id_institucion', institucionObj.id_institucion);
            
            if (error) throw error;
            
            // Si no hay participantes
            if (!participantes || participantes.length === 0) {
                return {
                    labels: [institucion],
                    values: [0],
                    total: 0,
                    datosCompletos: {},
                    mensaje: `No se encontraron visitantes para "${institucion}"`
                };
            }
            
            // Procesar datos
            const cantidadEncontrada = participantes.length;
            const datosFiltrados = {
                labels: [institucion],
                values: [cantidadEncontrada],
                total: cantidadEncontrada,
                datosCompletos: { [institucion]: cantidadEncontrada },
                participantes: participantes // Guardar para referencia
            };
            
            return datosFiltrados;
            
        } catch (error) {
            console.error('Error filtrando datos de institución:', error);
            return {
                labels: ['Error'],
                values: [0],
                total: 0,
                datosCompletos: {},
                mensaje: 'Error al cargar los datos: ' + error.message
            };
        }
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

// Limpiar filtros combinados - VERSIÓN MEJORADA
    function limpiarFiltrosCombinados() {
        // Limpiar campos
        document.getElementById('filtro-fecha-inicial').value = '';
        document.getElementById('filtro-fecha-final').value = '';
        document.getElementById('filtro-institucion-comb').value = 'todas';
        
        // Recargar datos sin filtros según el tipo actual
        if (tipoActual === 'institucion') {
            // Recargar datos de institución originales
            datosInstituciones = JSON.parse(JSON.stringify(datosOriginales));
            mostrarInterfazInstitucion();
        } else {
            // Recargar datos de tiempo
            cargarDatosTiempo(tipoActual);
        }
        
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    }
