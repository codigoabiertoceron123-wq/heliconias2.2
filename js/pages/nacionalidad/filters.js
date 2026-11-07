// NacionalidadSystem - filters
// Refactor modular: lógica original preservada.

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

// Limpiar filtros combinados
    function limpiarFiltrosCombinados() {
        document.getElementById('filtro-fecha-inicial').value = '';
        document.getElementById('filtro-fecha-final').value = '';
        document.getElementById('filtro-nacionalidad-comb').value = 'todas';
        
        // Mostrar datos ORIGINALES (sin parámetro = usa getDatosTiempo)
        mostrarInterfazTiempo(tipoActual); // ← Esto está bien
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    }

// =============================================
    // FUNCIONES DE MODAL CON FILTROS INTEGRADOS (ADAPTADAS DE INSTITUCIÓN)
    // =============================================

    // Función para crear HTML de filtros para el modal
    function crearHTMLFiltrosModal(tipo) {
        // Obtener todas las nacionalidades de datosNacionalidades
        const opcionesNacionalidad = datosNacionalidades.labels || [];

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
                        ${opcionesNacionalidad.map(nac => 
                            `<option value="${nac}">${nac}</option>`
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
            
            // En la función aplicarFiltrosModal, verifica que sea así:
            if (tipo === 'nacionalidad') {
                // Filtrar datos de nacionalidades
                datosFiltrados = await filtrarDatosNacionalidadModal(nacionalidad, cantidad, orden);
                crearGraficaAmpliadaNacionalidadConDatos(datosFiltrados, tipoGrafica);
                llenarTablaModalNacionalidadConDatos(datosFiltrados);
            } else {
                // Filtrar datos de tiempo
                datosFiltrados = await filtrarDatosTiempoModal(tipo, fechaInicio, fechaFin, nacionalidad, cantidad, orden);
                
                // ✅ Esto debe ser crearGraficaAmpliadaTiempo, NO crearGraficaAmpliadaTiempoConDatos
                crearGraficaAmpliadaTiempo(tipo, tipoGrafica, datosFiltrados);
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
        
        console.log('🔍 Filtrando por nacionalidad:', nacionalidad);
        
        // Filtrar por nacionalidad específica
        if (nacionalidad !== 'todas') {
            const index = datos.labels.indexOf(nacionalidad);
            
            if (index !== -1) {
                // Es una nacionalidad válida
                datos = {
                    labels: [nacionalidad],
                    values: [datos.values[index]],
                    total: datos.values[index],
                    datosCompletos: { [nacionalidad]: datos.values[index] },
                    detallesOtrosPaises: {} // Vacío porque ya no usamos "Otros países"
                };
            } else {
                // No encontrado, devolver datos vacíos
                datos = {
                    labels: [],
                    values: [],
                    total: 0,
                    datosCompletos: {},
                    detallesOtrosPaises: {}
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

// Función para filtrar datos de tiempo en modal CON FILTRO DE NACIONALIDAD
    async function filtrarDatosTiempoModal(tipo, fechaInicio, fechaFin, nacionalidadSeleccionada, cantidad, orden) {
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
        
        // FILTRAR por nacionalidad si no es "todas"
        let participantesFiltrados = participantes;
        if (nacionalidadSeleccionada && nacionalidadSeleccionada !== 'todas') {
            participantesFiltrados = participantes.filter(participante => {
                const pais = mapaCiudadPais[participante.id_ciudad];
                if (!pais) return false;
                
                // Normalizar nombre para comparar
                const nombrePaisNormalizado = pais.toLowerCase().includes('colombia') ? 'Colombia' : pais;
                return nombrePaisNormalizado === nacionalidadSeleccionada;
            });
        }
        
        // Procesar con la MISMA función que usa el formato nuevo
        const datosProcesados = procesarDatosTiempo(participantesFiltrados, tipo, mapaCiudadPais);
        
        // FILTRAR datasets por nacionalidad específica
        if (nacionalidadSeleccionada && nacionalidadSeleccionada !== 'todas') {
            // Encontrar el dataset que corresponde a la nacionalidad seleccionada
            const datasetFiltrado = datosProcesados.datasets.find(
                dataset => dataset.label === nacionalidadSeleccionada
            );
            
            if (datasetFiltrado) {
                // Si encontramos la nacionalidad, mantener solo ese dataset
                datosProcesados.datasets = [datasetFiltrado];
                datosProcesados.paises = [nacionalidadSeleccionada];
            } else {
                // Si no encontramos datos para esa nacionalidad, devolver datos vacíos
                datosProcesados.datasets = [];
                datosProcesados.paises = [];
            }
        }
        
        // Aplicar ordenamiento
        if (orden === 'desc') {
            // Ordenar por total de cada fecha (más visitas primero)
            const indices = datosProcesados.labels
                .map((label, i) => ({
                    label,
                    total: datosProcesados.datasets.reduce((sum, dataset) => sum + (dataset.data[i] || 0), 0)
                }))
                .sort((a, b) => b.total - a.total)
                .map(item => datosProcesados.labels.indexOf(item.label));
            
            datosProcesados.labels = indices.map(i => datosProcesados.labels[i]);
            datosProcesados.datasets.forEach(dataset => {
                dataset.data = indices.map(i => dataset.data[i]);
            });
        } else if (orden === 'asc') {
            // Ordenar por total de cada fecha (menos visitas primero)
            const indices = datosProcesados.labels
                .map((label, i) => ({
                    label,
                    total: datosProcesados.datasets.reduce((sum, dataset) => sum + (dataset.data[i] || 0), 0)
                }))
                .sort((a, b) => a.total - b.total)
                .map(item => datosProcesados.labels.indexOf(item.label));
            
            datosProcesados.labels = indices.map(i => datosProcesados.labels[i]);
            datosProcesados.datasets.forEach(dataset => {
                dataset.data = indices.map(i => dataset.data[i]);
            });
        } else if (orden === 'alpha') {
            // Ordenar alfabéticamente
            const indices = datosProcesados.labels
                .map((label, i) => ({ label, index: i }))
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(item => item.index);
            
            datosProcesados.labels = indices.map(i => datosProcesados.labels[i]);
            datosProcesados.datasets.forEach(dataset => {
                dataset.data = indices.map(i => dataset.data[i]);
            });
        }
        
        // Limitar cantidad
        if (cantidad > 0 && cantidad < datosProcesados.labels.length) {
            datosProcesados.labels = datosProcesados.labels.slice(0, cantidad);
            datosProcesados.datasets.forEach(dataset => {
                dataset.data = dataset.data.slice(0, cantidad);
            });
        }

        // Asegurar que tenga la propiedad paises si no la tiene
        if (!datosProcesados.paises && datosProcesados.datasets) {
            datosProcesados.paises = datosProcesados.datasets.map(d => d.label);
        }
        
        // Recalcular total
        datosProcesados.total = datosProcesados.datasets.reduce((total, dataset) => 
            total + dataset.data.reduce((sum, val) => sum + (val || 0), 0), 0);
        
        return datosProcesados;
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
        
        // En la función limpiarFiltrosModal, cambiar:
        if (tipo === 'nacionalidad') {
            crearGraficaAmpliadaNacionalidad(tipoGrafica);
            llenarTablaModalNacionalidad();
        } else {
            // ✅ Usar datos originales
            const datosOriginales = getDatosTiempo(tipo);
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica, datosOriginales);
            llenarTablaModalTiempo(tipo);
        }
        
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    }
