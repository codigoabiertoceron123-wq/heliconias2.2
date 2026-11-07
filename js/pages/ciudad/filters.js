// CiudadSystem - filters
// Refactor modular: lógica original preservada.

// Función para aplicar filtros del modal
    async function aplicarFiltrosModal() {
        try {
            mostrarLoading('Aplicando filtros...');
            
            const tipoGrafica = document.getElementById('modalTipoGrafica')?.value || 'bar';
            const fechaInicio = document.getElementById('modalFechaInicio')?.value;
            const fechaFin = document.getElementById('modalFechaFin')?.value;
            const ciudadFiltro = document.getElementById('modalCiudad')?.value || 'todas';
            const cantidad = parseInt(document.getElementById('modalCantidad')?.value || '10');
            const orden = document.getElementById('modalOrden')?.value || 'desc';
            
            const tipo = determinarTipoActualModal();
            let datosFiltrados;
            
            if (tipo === 'ciudad') {
                // Filtrar datos de ciudad general
                datosFiltrados = await filtrarDatosCiudadModal(ciudadFiltro, cantidad, orden);
                crearGraficaAmpliadaCiudadConDatos(datosFiltrados, tipoGrafica);
                llenarTablaModalCiudadConDatos(datosFiltrados);
            } else {
                // Filtrar datos de tiempo
                datosFiltrados = await filtrarDatosCiudadTiempoModal(tipo, fechaInicio, fechaFin, ciudadFiltro, cantidad, orden);
                crearGraficaAmpliadaCiudadTiempo(tipo, tipoGrafica, datosFiltrados);
                llenarTablaModalCiudadTiempoConDatos(tipo, datosFiltrados);
            }
            
            mostrarExito(`Filtros aplicados: ${datosFiltrados.total || 0} registros encontrados`);
            cerrarLoading();
            
        } catch (error) {
            console.error('Error aplicando filtros:', error);
            cerrarLoading();
            mostrarErrorCiudad('Error al aplicar los filtros: ' + error.message);
        }
    }

// Función para filtrar datos de ciudad en modal
    async function filtrarDatosCiudadModal(ciudadFiltro, cantidad, orden) {
    let datos = { ...datosCiudades.general };
    
    // Filtrar por ciudad específica
    if (ciudadFiltro !== 'todas') {
        const index = datos.labels.indexOf(ciudadFiltro);
        
        if (index !== -1) {
            // Es una ciudad válida
            datos = {
                labels: [ciudadFiltro],
                values: [datos.values[index]],
                colors: [datos.colors[index]],
                total: datos.values[index]
            };
        } else {
            // No encontrado, devolver datos vacíos
            datos = {
                labels: [],
                values: [],
                colors: [],
                total: 0
            };
        }
    }
    
    // Ordenar datos
    if (orden === 'desc') {
        // Orden descendente (mayor a menor)
        const indices = datos.labels
            .map((label, i) => ({ label, value: datos.values[i], color: datos.colors[i] }))
            .sort((a, b) => b.value - a.value)
            .map(item => datos.labels.indexOf(item.label));
        
        datos.labels = indices.map(i => datos.labels[i]);
        datos.values = indices.map(i => datos.values[i]);
        datos.colors = indices.map(i => datos.colors[i]);
    } else if (orden === 'asc') {
        // Orden ascendente (menor a mayor)
        const indices = datos.labels
            .map((label, i) => ({ label, value: datos.values[i], color: datos.colors[i] }))
            .sort((a, b) => a.value - b.value)
            .map(item => datos.labels.indexOf(item.label));
        
        datos.labels = indices.map(i => datos.labels[i]);
        datos.values = indices.map(i => datos.values[i]);
        datos.colors = indices.map(i => datos.colors[i]);
    } else if (orden === 'alpha') {
        // Orden alfabético
        const indices = datos.labels
            .map((label, i) => ({ label, value: datos.values[i], color: datos.colors[i] }))
            .sort((a, b) => a.label.localeCompare(b.label))
            .map(item => datos.labels.indexOf(item.label));
        
        datos.labels = indices.map(i => datos.labels[i]);
        datos.values = indices.map(i => datos.values[i]);
        datos.colors = indices.map(i => datos.colors[i]);
    }
    
    // Limitar cantidad
    if (cantidad > 0 && cantidad < datos.labels.length) {
        datos.labels = datos.labels.slice(0, cantidad);
        datos.values = datos.values.slice(0, cantidad);
        datos.colors = datos.colors.slice(0, cantidad);
        datos.total = datos.values.reduce((a, b) => a + b, 0);
    }
    
    return datos;
}

// Función para filtrar datos de tiempo en modal CON FILTRO DE CIUDAD
    async function filtrarDatosCiudadTiempoModal(tipo, fechaInicio, fechaFin, ciudadFiltro, cantidad, orden) {
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
        
        // Obtener ciudades de los participantes
        const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
        const { data: ciudades, error: errorCiudades } = await supabase
            .from('ciudades')
            .select('id, nombre')
            .in('id', idsCiudadesUnicos);
        
        if (errorCiudades) throw errorCiudades;
        
        const mapaCiudades = {};
        ciudades.forEach(ciudad => {
            mapaCiudades[ciudad.id] = ciudad.nombre;
        });
        
        // FILTRAR por ciudad si no es "todas"
        let participantesFiltrados = participantes;
        if (ciudadFiltro && ciudadFiltro !== 'todas') {
            participantesFiltrados = participantes.filter(participante => {
                const ciudad = mapaCiudades[participante.id_ciudad];
                return ciudad === ciudadFiltro;
            });
        }
        
        // Procesar datos con la función existente
        const datosProcesados = await procesarDatosCiudadTiempo(participantesFiltrados, tipo);
        
        // FILTRAR datasets por ciudad específica
        if (ciudadFiltro && ciudadFiltro !== 'todas') {
            // Encontrar el dataset que corresponde a la ciudad seleccionada
            const datasetFiltrado = datosProcesados.datasets.find(
                dataset => dataset.label === ciudadFiltro
            );
            
            if (datasetFiltrado) {
                // Si encontramos la ciudad, mantener solo ese dataset
                datosProcesados.datasets = [datasetFiltrado];
                datosProcesados.ciudades = [ciudadFiltro];
            } else {
                // Si no encontramos datos para esa ciudad, devolver datos vacíos
                datosProcesados.datasets = [];
                datosProcesados.ciudades = [];
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
        } else if (orden === 'fecha') {
            // Ordenar por fecha (ya está ordenado por defecto)
            // No hacer nada
        }
        
        // Limitar cantidad de períodos
        if (cantidad > 0 && cantidad < datosProcesados.labels.length) {
            datosProcesados.labels = datosProcesados.labels.slice(0, cantidad);
            datosProcesados.datasets.forEach(dataset => {
                dataset.data = dataset.data.slice(0, cantidad);
            });
        }

        // Asegurar que tenga la propiedad ciudades si no la tiene
        if (!datosProcesados.ciudades && datosProcesados.datasets) {
            datosProcesados.ciudades = datosProcesados.datasets.map(d => d.label);
        }
        
        // Recalcular total
        datosProcesados.total = datosProcesados.datasets.reduce((total, dataset) => 
            total + dataset.data.reduce((sum, val) => sum + (val || 0), 0), 0);
        
        return datosProcesados;
    }

// CAMBIA ESTA FUNCIÓN COMPLETA:
function crearHTMLFiltrosModal(tipo) {
    // Obtener todas las ciudades de datosCiudades
    const opcionesCiudad = todasLasCiudades || [];

    let html = `
    <div class="modal-filtros-container" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: #2c3e50;">
                <i class="fas fa-filter"></i> Filtros Avanzados
            </h4>
            <div style="display: flex; gap: 8px;">
                <button class="btn-filter-modal" onclick="window.CiudadSystem.aplicarFiltrosModal()" style="background: #e74c3c; color: white;">
                    <i class="fas fa-check"></i> Aplicar
                </button>
                <button class="btn-filter-modal" onclick="window.CiudadSystem.limpiarFiltrosModal()" style="background: #95a5a6; color: white;">
                    <i class="fas fa-times"></i> Limpiar
                </button>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
    `;

    // SI ES GRÁFICA DE BARRAS, mostrar tipo de gráfica
    // Para esto necesitamos saber qué tipo de gráfica vamos a mostrar
    const modalTipoGrafica = document.getElementById('modalTipoGrafica')?.value || 'bar';
    
    if (modalTipoGrafica === 'bar') {
        html += `
            
        `;
    } else {
        // Para gráficas circulares, ocultamos el selector pero lo mantenemos
        html += `
            <!-- Tipo de Gráfica (oculto para circulares) -->
            <input type="hidden" id="modalTipoGrafica" value="${modalTipoGrafica}">
        `;
    }

    // Si no es ciudad general, agregar filtros de fecha
    if (tipo !== 'ciudad') {
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

    // Agregar filtro de ciudad para todos los tipos
    html += `
            <!-- Ciudad -->
            <div class="filter-group">
                <label><i class="fas fa-city"></i> Ciudad:</label>
                <select id="modalCiudad" class="filter-select">
                    <option value="todas">Todas las ciudades</option>
                    ${opcionesCiudad.map(ciudad => 
                        `<option value="${ciudad}">${ciudad}</option>`
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
                    ${tipo !== 'ciudad' ? '<option value="fecha">Por fecha</option>' : ''}
                </select>
            </div>
        </div>
    </div>
    `;

    return html;
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
                } else if (element.id === 'modalCiudad') {
                    element.value = 'todas';
                }
            } else if (element.tagName === 'INPUT') {
                element.value = '';
            }
        });
        
        // Recargar gráfica original
        const tipo = determinarTipoActualModal();
        const tipoGrafica = document.getElementById('modalTipoGrafica')?.value || 'bar';
        
        if (tipo === 'ciudad') {
            crearGraficaAmpliadaCiudad(tipoGrafica);
            llenarTablaModalCiudad();
        } else {
            const datosOriginales = getDatosCiudadTiempo(tipo);
            crearGraficaAmpliadaCiudadTiempo(tipo, tipoGrafica, datosOriginales);
            llenarTablaModalCiudadTiempo(tipo);
        }
        
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    }
