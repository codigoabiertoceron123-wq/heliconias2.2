// Módulo para gestión de interfaz - VERSIÓN CORREGIDA
class UIManager {
    constructor() {
        this.dataLoader = null;
        this.chartManager = null;
        this.dataProcessor = null;
        this.app = null;
    }

    // MÉTODO PARA INICIALIZAR MÓDULOS
    inicializarModulos(dataLoader, chartManager, dataProcessor) {
        this.dataLoader = dataLoader;
        this.chartManager = chartManager;
        this.dataProcessor = dataProcessor;
        console.log('✅ Módulos inicializados en UIManager:', {
            dataLoader: !!dataLoader,
            chartManager: !!chartManager,
            dataProcessor: !!dataProcessor
        });
    }

    setApp(app) {
        this.app = app;
    }

    mostrarDatos() {
        console.log('🎨 Mostrando interfaz de datos...');
        console.log('📊 ChartManager disponible:', !!this.chartManager);
        console.log('📊 ChartManager global:', typeof chartManager !== 'undefined');

        const container = document.getElementById('data-container');
        if (!container) {
            console.error('Contenedor data-container no encontrado');
            return;
        }
        
        container.innerHTML = `
            <div class="chart-controls">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-chart-bar"></i> Selecciona la Categoría de Análisis
                    </h3>
                    <button class="download-btn" id="downloadChartBtn">
                        <i class="fas fa-download"></i> Descargar Gráfico (PNG)
                    </button>
                </div>

                <div class="chart-type-buttons btn-group" style="margin-top: 12px">
                    <button class="chart-btn active" data-type="tipo_reserva">
                        <i class="fas fa-ticket-alt"></i> Tipo Reserva
                    </button>
                    <button class="chart-btn" data-type="actividad">
                        <i class="fas fa-hiking"></i> Actividad
                    </button>
                    <button class="chart-btn" data-type="institucion">
                        <i class="fas fa-university"></i> Institución
                    </button>
                    <button class="chart-btn" data-type="intereses">
                        <i class="fas fa-heart"></i> Intereses
                    </button>
                    <button class="chart-btn" data-type="genero">
                        <i class="fas fa-venus-mars"></i> Género
                    </button>
                    <button class="chart-btn" data-type="temporada">
                        <i class="fas fa-calendar"></i> Temporada
                    </button>
                    <button class="chart-btn" data-type="fecha">
                        <i class="fas fa-calendar-day"></i> Fecha
                    </button>
                    <button class="chart-btn" data-type="mes">
                        <i class="fas fa-calendar"></i> Mes
                    </button>
                    <button class="chart-btn" data-type="anio">
                        <i class="fas fa-calendar-alt"></i> Año
                    </button>
                </div>
            </div>

            <!-- Estado de carga -->
            <div id="loading-state" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top: 15px;">Cargando gráficas...</p>
            </div>

            <!-- Gráficas principales lado a lado -->
            <div class="charts-grid" id="charts-container" style="display: none;">
                <div class="chart-card" id="chart-card-barras">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> Gráfica de Barras
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartBar"></canvas>
                    </div>
                </div>

                <div class="chart-card" id="chart-card-circular">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> Gráfica Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap pie-chart-container">
                        <canvas id="chartPie"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Intentar cargar gráficas después de un breve delay
        setTimeout(() => {
            this.inicializarGraficas();
        }, 100);
    }

    // MÉTODO PARA INICIALIZAR GRÁFICAS
    inicializarGraficas() {
        console.log('🔄 Inicializando gráficas...');
        
        const tipoInicial = 'tipo_reserva';
        
        if (this.chartManager && typeof this.chartManager.mostrarGraficas === 'function') {
            console.log('📊 Usando ChartManager interno');
            this.chartManager.mostrarGraficas(tipoInicial);
            
            // Ocultar loading y mostrar gráficas
            setTimeout(() => {
                const loadingState = document.getElementById('loading-state');
                const chartsContainer = document.getElementById('charts-container');
                if (loadingState) loadingState.style.display = 'none';
                if (chartsContainer) chartsContainer.style.display = 'grid';
            }, 500);
            
        } else if (typeof chartManager !== 'undefined' && typeof chartManager.mostrarGraficas === 'function') {
            console.log('📊 Usando ChartManager global');
            chartManager.mostrarGraficas(tipoInicial);
            
            setTimeout(() => {
                const loadingState = document.getElementById('loading-state');
                const chartsContainer = document.getElementById('charts-container');
                if (loadingState) loadingState.style.display = 'none';
                if (chartsContainer) chartsContainer.style.display = 'grid';
            }, 500);
            
        } else {
            console.error('❌ No hay ChartManager disponible');
            
            // Mostrar error
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
                loadingState.innerHTML = `
                    <div style="color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <p style="margin-top: 15px;">Error: No se pudo cargar el gestor de gráficas</p>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Reintentar
                        </button>
                    </div>
                `;
            }
        }
        
        // Configurar eventos después de inicializar gráficas
        this.configurarEventos();
    }

    configurarEventos() {
        console.log('🎯 Configurando eventos de UI...');
        
        // Botones de tipo de gráfica
        const chartButtons = document.querySelectorAll('.chart-btn');
        if (chartButtons.length > 0) {
            chartButtons.forEach(btn => {
                // Remover event listeners anteriores para evitar duplicados
                btn.replaceWith(btn.cloneNode(true));
            });

            // Re-seleccionar después del clone
            document.querySelectorAll('.chart-btn').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    event.preventDefault();
                    
                    // Remover clase active de todos los botones
                    chartButtons.forEach(b => b.classList.remove('active'));
                    // Agregar clase active al botón clickeado
                    event.currentTarget.classList.add('active');
                    
                    const tipo = event.currentTarget.getAttribute('data-type');
                    console.log('🎯 Cambiando a categoría:', tipo);

                    if (this.chartManager && typeof this.chartManager.mostrarGraficas === 'function') {
                        console.log('📊 Llamando a chartManager.mostrarGraficas');
                        this.chartManager.mostrarGraficas(tipo);
                    } else if (typeof chartManager !== 'undefined' && typeof chartManager.mostrarGraficas === 'function') {
                        console.log('📊 Llamando a chartManager global');
                        chartManager.mostrarGraficas(tipo);
                    } else {
                        console.error('❌ No hay ChartManager disponible');
                    }
                });
            });
        }

        // Botón de descarga
        const downloadBtn = document.getElementById('downloadChartBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.descargarGraficoPrincipal();
            });
        }

        // Cards de gráficas
        const cardBarras = document.getElementById('chart-card-barras');
        const cardCircular = document.getElementById('chart-card-circular');
        
        if (cardBarras) {
            cardBarras.addEventListener('click', () => this.abrirModal('bar'));
        }
        if (cardCircular) {
            cardCircular.addEventListener('click', () => this.abrirModal('pie'));
        }
        
        console.log('✅ Eventos de UI configurados correctamente');
    }

    abrirModal(tipoGrafica) {
        const modal = document.getElementById("chartModal");
        if (!modal) return;
        
        modal.classList.add("show");

        // Guardar tipo de gráfica
        const modalChartContainer = document.querySelector('.modal-chart-container');
        if (modalChartContainer) {
            modalChartContainer.setAttribute('data-tipo-grafica', tipoGrafica);
        }

        // LIMPIEZA COMPLETA: Eliminar cualquier sección de filtros duplicada
        this.limpiarFiltrosDuplicados();

        // Crear filtros del modal según el tipo de categoría
        this.crearFiltrosModal();

        // Crear gráfica inicial
        this.actualizarGraficaModal(tipoGrafica);
    }

    limpiarFiltrosDuplicados() {
        // Eliminar cualquier sección de filtros que no sea la principal
        const seccionesFiltros = document.querySelectorAll('#filtrosModal, .filters-section, [class*="filtro"], [class*="filter"]');
        seccionesFiltros.forEach(seccion => {
            if (seccion.id !== 'filtrosModal' && seccion.closest('.modal-content')) {
                seccion.remove();
            }
        });

        // Limpiar también cualquier contenido duplicado en el modal-header
        const modalHeader = document.querySelector('.modal-header');
        if (modalHeader) {
            const elementosDuplicados = modalHeader.querySelectorAll('h4, .filter-group, .btn');
            elementosDuplicados.forEach(elemento => {
                if (!elemento.closest('#filtrosModal')) {
                    elemento.remove();
                }
            });
        }
    }

    crearFiltrosModal() {
        const modalHeader = document.querySelector('.modal-header');
        if (!modalHeader) return;
        
        // Eliminar filtros anteriores si existen
        const filtrosAnteriores = document.getElementById('filtrosModal');
        if (filtrosAnteriores) {
            filtrosAnteriores.remove();
        }
        
        const tipoActual = this.chartManager ? this.chartManager.tipoActual : 'tipo_reserva';

        
        let filtrosHTML = '';
        
        if (tipoActual === 'tipo_reserva') {
            filtrosHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 12px;">
                    <div class="filter-group">
                        <label class="filter-label">Fecha Inicial</label>
                        <input type="date" class="filter-select" id="modal-filtro-fecha-inicio">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">Fecha Final</label>
                        <input type="date" class="filter-select" id="modal-filtro-fecha-fin">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">Tipo de Reserva</label>
                        <select class="filter-select" id="modal-filtro-tipo-reserva">
                            <option value="">No seleccionado</option>
                            <option value="todas">Todas las reservas</option>
                            <option value="individual">Individual</option>
                            <option value="grupal">Grupal</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">Estado de Reserva</label>
                        <select class="filter-select" id="modal-filtro-estado">
                            <option value="">No seleccionado</option>
                            <option value="todas">Todos los estados</option>
                            <option value="confirmada">Confirmadas</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="cancelada">Canceladas</option>
                        </select>
                    </div>
                </div>
            `;
        }  else if (tipoActual === 'actividad') {
        // FILTROS SIMPLIFICADOS PARA ACTIVIDADES
        filtrosHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 12px;">
                <div class="filter-group">
                    <label class="filter-label">Fecha Inicial</label>
                    <input type="date" class="filter-select" id="modal-filtro-fecha-inicio">
                </div>
                <div class="filter-group">
                    <label class="filter-label">Fecha Final</label>
                    <input type="date" class="filter-select" id="modal-filtro-fecha-fin">
                </div>
                <div class="filter-group">
                    <label class="filter-label">Estado de Reserva</label>
                    <select class="filter-select" id="modal-filtro-estado">
                        <option value="">No seleccionado</option>
                        <option value="todas">Todos los estados</option>
                        <option value="confirmada">Confirmadas</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="cancelada">Canceladas</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Actividad Específica</label>
                    <select class="filter-select" id="modal-filtro-actividad">
                        <option value="">No seleccionado</option>
                        <option value="todas">Todas las actividades</option>
                        <!-- Las actividades se cargarán dinámicamente -->
                    </select>
                </div>
            </div>
        `;
    }   // En la función crearFiltrosModal, agregar el caso para 'institucion':
        else if (tipoActual === 'institucion') {
            // Fecha por defecto: últimos 30 días
            const hoy = new Date();
            const hace30Dias = new Date();
            hace30Dias.setDate(hoy.getDate() - 30);
            
            filtrosHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 12px;">
                    <!-- Filtros de Fecha -->
                    <div class="filter-group">
                        <label class="filter-label"><i class="fas fa-calendar-alt"></i> Fecha Inicial</label>
                        <input type="date" class="filter-select" id="modal-filtro-fecha-inicio" value="${hace30Dias.toISOString().split('T')[0]}">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label"><i class="fas fa-calendar-alt"></i> Fecha Final</label>
                        <input type="date" class="filter-select" id="modal-filtro-fecha-fin" value="${hoy.toISOString().split('T')[0]}">
                    </div>
                    
                    <!-- Filtro de Institución -->
                    <div class="filter-group">
                        <label class="filter-label"><i class="fas fa-university"></i> Institución</label>
                        <select class="filter-select" id="modal-filtro-institucion">
                            <option value="todas">Todas las instituciones</option>
                            <!-- Las instituciones se cargarán dinámicamente -->
                        </select>
                    </div>
            
                    
                    <!-- Mostrar y Ordenar -->
                    <div class="filter-group">
                        <label class="filter-label"><i class="fas fa-list-ol"></i> Mostrar</label>
                        <select class="filter-select" id="modal-filtro-cantidad">
                            <option value="10">Top 10</option>
                            <option value="5">Top 5</option>
                            <option value="15">Top 15</option>
                            <option value="20">Top 20</option>
                            <option value="0">Todos</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label"><i class="fas fa-sort-amount-down"></i> Ordenar por</label>
                        <select class="filter-select" id="modal-filtro-orden">
                            <option value="desc">Mayor a menor</option>
                            <option value="asc">Menor a mayor</option>
                            <option value="alpha">Alfabético</option>
                        </select>
                    </div>
                </div>
            `;
        }
         
        else {
            // Filtros básicos para otras categorías
            filtrosHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 12px;">
                    <div class="filter-group">
                        <label class="filter-label">Fecha Inicial</label>
                        <input type="date" class="filter-select" id="modal-filtro-fecha-inicio">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">Fecha Final</label>
                        <input type="date" class="filter-select" id="modal-filtro-fecha-fin">
                    </div>
                </div>
            `;
        }

        const filtrosContainer = document.createElement('div');
        filtrosContainer.id = 'filtrosModal';
        filtrosContainer.style.cssText = `
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        `;
        
        const tituloFiltros = this.obtenerTituloFiltros(tipoActual);
        
        filtrosContainer.innerHTML = `
            <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px">
                <i class="fas fa-filter"></i> ${tituloFiltros}
            </h4>
            ${filtrosHTML}
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn btn-primary" id="aplicar-filtros-modal-btn">
                    <i class="fas fa-check"></i> Aplicar Filtros
                </button>
                <button class="btn" id="limpiar-filtros-modal-btn" style="background: #e74c3c; color: white;">
                    <i class="fas fa-times"></i> Limpiar Filtros
                </button>
            </div>
        `;

        // Insertar después del modal-header
        modalHeader.parentNode.insertBefore(filtrosContainer, modalHeader.nextSibling);
        
        // Configurar eventos de los botones del modal
        const btnAplicar = document.getElementById('aplicar-filtros-modal-btn');
        const btnLimpiar = document.getElementById('limpiar-filtros-modal-btn');
        
        if (btnAplicar) {
            btnAplicar.addEventListener('click', () => {
                this.aplicarFiltrosModal();
            });
        }
        
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                this.limpiarFiltrosModal();
            });
        }

        // Configurar eventos para filtros que actualizan automáticamente
        if (tipoActual === 'tipo_reserva' || tipoActual === 'actividad') {
            const estadoSelect = document.getElementById('modal-filtro-estado');
            const actividadSelect = document.getElementById('modal-filtro-actividad');
            
            if (estadoSelect) {
                estadoSelect.addEventListener('change', () => {
                    this.actualizarGraficaModalDesdeFiltros();
                });
            }
            
            if (actividadSelect) {
                actividadSelect.addEventListener('change', () => {
                    this.actualizarGraficaModalDesdeFiltros();
                });
            }
        }

        // Inicializar fechas
        this.inicializarFechasModal();

        // Cargar actividades dinámicamente si es el caso
        if (tipoActual === 'actividad') {
            this.cargarActividadesEnFiltro();
        }
        // En crearFiltrosModal, después de crear el HTML, agregar:
        // Cargar instituciones dinámicamente si es el caso
        if (tipoActual === 'institucion') {
            this.cargarInstitucionesEnFiltro();
        }
    }

    obtenerTituloFiltros(tipoActual) {
        const titulos = {
            'tipo_reserva': 'Filtros para Tipo de Reserva',
            'actividad': 'Filtros para Actividades',
            'estado': 'Filtros para Estado de Reserva',
            'institucion': 'Filtros para Institución',
            'intereses': 'Filtros para Intereses',
            'genero': 'Filtros para Género',
            'temporada': 'Filtros para Temporada',
            'fecha': 'Filtros por Fecha',
            'mes': 'Filtros por Mes',
            'anio': 'Filtros por Año'
        };
        return titulos[tipoActual] || 'Filtros por Fecha';
    }

    async cargarActividadesEnFiltro() {
        try {
            const actividadSelect = document.getElementById('modal-filtro-actividad');
            if (!actividadSelect) return;

            // Cargar actividades desde la base de datos
            const { data: actividades, error } = await supabase
                .from('actividades')
                .select('id_actividad, nombre')
                .eq('activo', true)
                .order('nombre');

            if (error) throw error;

            // Limpiar opciones excepto las primeras
            while (actividadSelect.children.length > 2) {
                actividadSelect.removeChild(actividadSelect.lastChild);
            }

            // Agregar actividades al select
            if (actividades && actividades.length > 0) {
                actividades.forEach(actividad => {
                    const option = document.createElement('option');
                    option.value = actividad.id_actividad;
                    option.textContent = actividad.nombre;
                    actividadSelect.appendChild(option);
                });
            }

        } catch (error) {
            console.error('Error cargando actividades:', error);
        }
    }

    inicializarFechasModal() {
        const hoy = new Date();
        const haceUnMes = new Date();
        haceUnMes.setMonth(hoy.getMonth() - 1);
        
        const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];
        
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio');
        const fechaFin = document.getElementById('modal-filtro-fecha-fin');
        
        if (fechaInicio) fechaInicio.value = formatoFecha(haceUnMes);
        if (fechaFin) fechaFin.value = formatoFecha(hoy);
    }

    aplicarFiltrosModal() {
        const tipoActual = this.chartManager ? this.chartManager.tipoActual : 'tipo_reserva';
        
        if (tipoActual === 'institucion') {
            // Llamar a la función específica para institución
            this.aplicarFiltrosInstitucion();
            return;
        }
        
        // Para otros tipos, usar la lógica original
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio');
        const fechaFin = document.getElementById('modal-filtro-fecha-fin');
        const tipoReserva = document.getElementById('modal-filtro-tipo-reserva');
        const estado = document.getElementById('modal-filtro-estado');
        const actividad = document.getElementById('modal-filtro-actividad');
        
        // Validaciones básicas
        if (fechaInicio.value && fechaFin.value && fechaInicio.value > fechaFin.value) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error en fechas',
                    text: 'La fecha inicial no puede ser mayor que la fecha final',
                    confirmButtonColor: '#e74c3c'
                });
            }
            return;
        }
        
        // Obtener valores de filtros
        const filtros = {
            fechaInicio: fechaInicio.value,
            fechaFin: fechaFin.value
        };
        
        if (tipoReserva) filtros.tipoReserva = tipoReserva.value;
        if (estado && estado.value) filtros.estado = estado.value;
        if (actividad && actividad.value) filtros.actividad = actividad.value;

        console.log('🎯 Aplicando filtros:', filtros);

        // Aplicar filtros según el tipo de categoría
        if (tipoActual === 'tipo_reserva') {
            this.aplicarFiltrosTipoReserva(filtros);
        } else if (tipoActual === 'actividad') {
            this.aplicarFiltrosActividad(filtros);
        } else {
            // Para otras categorías, usar filtros básicos de fecha
            if (this.dataLoader) {
                this.dataLoader.aplicarFiltrosCombinados(
                    filtros.fechaInicio, 
                    filtros.fechaFin
                );
            } else if (typeof dataLoader !== 'undefined') {
                dataLoader.aplicarFiltrosCombinados(
                    filtros.fechaInicio, 
                    filtros.fechaFin
                );
            }
        }
    }

    async aplicarFiltrosTipoReserva(filtros) {
        try {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Aplicando filtros...',
                    text: 'Filtrando datos por criterios seleccionados',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }

            console.log('🎯 Aplicando filtros para tipo_reserva:', filtros);

            let query = supabase
                .from('participantes_reserva')
                .select(`
                    *,
                    reservas(
                        *,
                        actividades(*),
                        instituciones(*)
                    ),
                    intereses(*)
                `);

            // Aplicar filtros de fecha
            if (filtros.fechaInicio && filtros.fechaFin) {
                query = query.gte('reservas.fecha_reserva', filtros.fechaInicio + 'T00:00:00')
                            .lte('reservas.fecha_reserva', filtros.fechaFin + 'T23:59:59');
            }

            // Aplicar filtro de tipo de reserva (solo si no está vacío)
            if (filtros.tipoReserva && filtros.tipoReserva !== '') {
                if (filtros.tipoReserva !== 'todas') {
                    query = query.eq('reservas.tipo_reserva', filtros.tipoReserva);
                }
                // Si es "todas", no aplicamos filtro específico
            }

            // Aplicar filtro de estado (solo si no está vacío)
            if (filtros.estado && filtros.estado !== '') {
                if (filtros.estado !== 'todas') {
                    query = query.eq('reservas.estado', filtros.estado);
                }
                // Si es "todas", no aplicamos filtro específico
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            if (typeof Swal !== 'undefined') {
                Swal.close();
            }

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                // Procesar datos filtrados con información de los filtros aplicados
                if (this.dataProcessor) {
                    // Pasar información de filtros al dataProcessor para que pueda generar gráficas específicas
                    this.dataProcessor.procesarDatosConFiltros(participantesFiltrados, filtros);
                    
                    // Actualizar gráfica en el modal
                    const tipoGrafica = document.querySelector('.modal-chart-container')?.getAttribute('data-tipo-grafica') || 'bar';
                    this.actualizarGraficaModalConFiltros(tipoGrafica, filtros);

                    if (typeof Swal !== 'undefined') {
                        const reservasUnicas = [...new Set(participantesFiltrados.map(p => p.id_reserva))].length;
                        Swal.fire({
                            icon: 'success',
                            title: 'Filtros aplicados',
                            text: `Se encontraron ${reservasUnicas} reservas y ${participantesFiltrados.length} participantes`,
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                } else {
                    // Fallback si el método no existe
                    console.warn('procesarDatosConFiltros no disponible, usando procesamiento normal');
                    if (this.dataProcessor) {
                        this.dataProcessor.procesarDatosCompletos(participantesFiltrados);
                        
                        const tipoGrafica = document.querySelector('.modal-chart-container')?.getAttribute('data-tipo-grafica') || 'bar';
                        this.actualizarGraficaModalConFiltros(tipoGrafica, filtros);
                    }
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Sin resultados',
                        text: 'No se encontraron datos para los filtros aplicados',
                        confirmButtonColor: '#3498db'
                    });
                }
            }

        } catch (error) {
            console.error('Error aplicando filtros:', error);
            if (typeof Swal !== 'undefined') {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron aplicar los filtros: ' + error.message,
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    }

    async aplicarFiltrosActividad(filtros) {
        try {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Aplicando filtros...',
                    text: 'Filtrando datos de actividades por criterios seleccionados',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }

            console.log('🎯 Aplicando filtros para actividad:', filtros);

            let query = supabase
                .from('participantes_reserva')
                .select(`
                    *,
                    reservas(
                        *,
                        actividades(*),
                        instituciones(*)
                    ),
                    intereses(*)
                `);

            // Aplicar filtros de fecha
            if (filtros.fechaInicio && filtros.fechaFin) {
                query = query.gte('reservas.fecha_reserva', filtros.fechaInicio + 'T00:00:00')
                            .lte('reservas.fecha_reserva', filtros.fechaFin + 'T23:59:59');
            }

            // Aplicar filtro de estado (solo si no está vacío)
            if (filtros.estado && filtros.estado !== '') {
                if (filtros.estado !== 'todas') {
                    query = query.eq('reservas.estado', filtros.estado);
                }
                // Si es "todas", no aplicamos filtro específico
            }

            // Aplicar filtro de actividad específica
            if (filtros.actividad && filtros.actividad !== '') {
                if (filtros.actividad !== 'todas') {
                    query = query.eq('reservas.id_actividad', filtros.actividad);
                }
                // Si es "todas", no aplicamos filtro específico
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            if (typeof Swal !== 'undefined') {
                Swal.close();
            }

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                // Procesar datos filtrados
                if (this.dataProcessor) {
                    this.dataProcessor.procesarDatosCompletos(participantesFiltrados);
                    
                    // Actualizar gráfica en el modal
                    const tipoGrafica = document.querySelector('.modal-chart-container')?.getAttribute('data-tipo-grafica') || 'bar';
                    this.actualizarGraficaModalConFiltros(tipoGrafica, filtros);

                    if (typeof Swal !== 'undefined') {
                        const actividadesUnicas = [...new Set(participantesFiltrados.map(p => p.reservas?.id_actividad))].length;
                        Swal.fire({
                            icon: 'success',
                            title: 'Filtros aplicados',
                            text: `Se encontraron ${actividadesUnicas} actividades y ${participantesFiltrados.length} participantes`,
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Sin resultados',
                        text: 'No se encontraron datos para los filtros aplicados',
                        confirmButtonColor: '#3498db'
                    });
                }
            }

        } catch (error) {
            console.error('Error aplicando filtros de actividad:', error);
            if (typeof Swal !== 'undefined') {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron aplicar los filtros: ' + error.message,
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    }

    // Agregar esta función en UIManager
    async aplicarFiltrosInstitucion() {
        try {
            // Obtener valores de los filtros (SOLO los que funcionan)
            const fechaInicio = document.getElementById('modal-filtro-fecha-inicio')?.value;
            const fechaFin = document.getElementById('modal-filtro-fecha-fin')?.value;
            const institucion = document.getElementById('modal-filtro-institucion')?.value;
            const cantidad = parseInt(document.getElementById('modal-filtro-cantidad')?.value || '10');
            const orden = document.getElementById('modal-filtro-orden')?.value || 'desc';

            // Validar fechas
            if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en fechas',
                        text: 'La fecha inicial no puede ser mayor que la fecha final',
                        confirmButtonColor: '#e74c3c'
                    });
                }
                return;
            }

            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Aplicando filtros...',
                    text: 'Filtrando datos de instituciones',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
            }

            console.log('🎯 Aplicando filtros para institución:', {
                fechaInicio, fechaFin, institucion, cantidad, orden
            });

            // Construir consulta SIMPLIFICADA
            let query = supabase
                .from('participantes_reserva')
                .select(`
                    *,
                    instituciones!inner(
                        id_institucion,
                        nombre_institucion
                    )
                `)
                .not('id_institucion', 'is', null);

            // Aplicar filtros de fecha si existen
            if (fechaInicio) {
                query = query.gte('fecha_visita', fechaInicio + 'T00:00:00');
            }
            if (fechaFin) {
                query = query.lte('fecha_visita', fechaFin + 'T23:59:59');
            }

            // Filtrar por institución específica
            if (institucion && institucion !== 'todas') {
                query = query.eq('id_institucion', institucion);
            }

            const { data: participantesFiltrados, error } = await query;

            if (error) throw error;

            if (typeof Swal !== 'undefined') {
                Swal.close();
            }

            if (participantesFiltrados && participantesFiltrados.length > 0) {
                // Procesar los datos filtrados
                this.procesarDatosInstitucionFiltrados(participantesFiltrados, cantidad, orden);
                
                // Actualizar la gráfica
                const tipoGrafica = document.querySelector('.modal-chart-container')?.getAttribute('data-tipo-grafica') || 'bar';
                this.actualizarGraficaModalConFiltrosInstitucion(tipoGrafica);
                
                // Mostrar mensaje de éxito
                const institucionesUnicas = [...new Set(participantesFiltrados.map(p => p.id_institucion))].length;
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Filtros aplicados',
                        text: `Se encontraron ${institucionesUnicas} instituciones y ${participantesFiltrados.length} participantes`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Sin resultados',
                        text: 'No se encontraron datos para los filtros aplicados',
                        confirmButtonColor: '#3498db'
                    });
                }
            }

        } catch (error) {
            console.error('Error aplicando filtros de institución:', error);
            if (typeof Swal !== 'undefined') {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron aplicar los filtros: ' + error.message,
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    }

    // Función para procesar datos filtrados de institución
    procesarDatosInstitucionFiltrados(participantes, cantidad, orden) {
        // Contar por institución
        const conteo = {};
        
        participantes.forEach(participante => {
            const institucion = participante.instituciones;
            if (institucion && institucion.nombre_institucion) {
                const nombreInstitucion = institucion.nombre_institucion;
                conteo[nombreInstitucion] = (conteo[nombreInstitucion] || 0) + 1;
            }
        });

        // Convertir a arrays
        let labels = Object.keys(conteo);
        let values = Object.values(conteo);
        const total = values.reduce((a, b) => a + b, 0);
        
        // Aplicar orden
        let indices = labels.map((label, index) => ({ label, value: values[index] }));
        
        if (orden === 'desc') {
            indices.sort((a, b) => b.value - a.value);
        } else if (orden === 'asc') {
            indices.sort((a, b) => a.value - b.value);
        } else if (orden === 'alpha') {
            indices.sort((a, b) => a.label.localeCompare(b.label));
        }
        
        // Aplicar cantidad
        if (cantidad > 0 && cantidad < indices.length) {
            indices = indices.slice(0, cantidad);
        }
        
        // Reconstruir arrays
        labels = indices.map(item => item.label);
        values = indices.map(item => item.value);
        
        // Actualizar datos en el dataProcessor
        if (this.dataProcessor) {
            this.dataProcessor.datosSimulados.institucion = {
                labels: labels,
                values: values,
                total: values.reduce((a, b) => a + b, 0)
            };
        }
    }

    // Agregar esta función en UIManager
    async cargarInstitucionesEnFiltro() {
        try {
            const institucionSelect = document.getElementById('modal-filtro-institucion');
            if (!institucionSelect) return;

            // Cargar instituciones desde la base de datos
            const { data: instituciones, error } = await supabase
                .from('instituciones')
                .select('id_institucion, nombre_institucion')
                .order('nombre_institucion');

            if (error) throw error;

            // Limpiar opciones excepto la primera
            while (institucionSelect.children.length > 1) {
                institucionSelect.removeChild(institucionSelect.lastChild);
            }

            // Agregar instituciones al select
            if (instituciones && instituciones.length > 0) {
                instituciones.forEach(institucion => {
                    const option = document.createElement('option');
                    option.value = institucion.id_institucion;
                    option.textContent = institucion.nombre_institucion;
                    institucionSelect.appendChild(option);
                });
            }

        } catch (error) {
            console.error('Error cargando instituciones:', error);
        }
    }

    // Función auxiliar para agrupar instituciones (similar a la del sistema de institución)
    agruparInstituciones(conteoInstituciones) {
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

    // Agregar esta función en UIManager
    async cargarInstitucionesEnFiltro() {
        try {
            const institucionSelect = document.getElementById('modal-filtro-institucion');
            if (!institucionSelect) return;

            // Cargar instituciones desde la base de datos
            const { data: instituciones, error } = await supabase
                .from('instituciones')
                .select('id_institucion, nombre_institucion')
                .order('nombre_institucion');

            if (error) throw error;

            // Limpiar opciones excepto la primera
            while (institucionSelect.children.length > 1) {
                institucionSelect.removeChild(institucionSelect.lastChild);
            }

            // Agregar instituciones al select
            if (instituciones && instituciones.length > 0) {
                instituciones.forEach(institucion => {
                    const option = document.createElement('option');
                    option.value = institucion.id_institucion;
                    option.textContent = institucion.nombre_institucion;
                    institucionSelect.appendChild(option);
                });
            }

        } catch (error) {
            console.error('Error cargando instituciones:', error);
        }
    }

    limpiarFiltrosModal() {
        const tipoActual = this.chartManager ? this.chartManager.tipoActual : 'tipo_reserva';
        
        if (tipoActual === 'institucion') {
            // Limpiar filtros específicos de institución (SOLO los que funcionan)
            const fechaInicio = document.getElementById('modal-filtro-fecha-inicio');
            const fechaFin = document.getElementById('modal-filtro-fecha-fin');
            const institucionSelect = document.getElementById('modal-filtro-institucion');
            const cantidadSelect = document.getElementById('modal-filtro-cantidad');
            const ordenSelect = document.getElementById('modal-filtro-orden');
            
            // Restaurar valores por defecto
            const hoy = new Date();
            const hace30Dias = new Date();
            hace30Dias.setDate(hoy.getDate() - 30);
            
            if (fechaInicio) fechaInicio.value = hace30Dias.toISOString().split('T')[0];
            if (fechaFin) fechaFin.value = hoy.toISOString().split('T')[0];
            if (institucionSelect) institucionSelect.value = 'todas';
            if (cantidadSelect) cantidadSelect.value = '10';
            if (ordenSelect) ordenSelect.value = 'desc';
            
            // Recargar datos sin filtros para institución
            this.recargarDatosInstitucionSinFiltros();
            
        } else {
            // Limpiar filtros para otros tipos (mantener lógica original)
            const fechaInicio = document.getElementById('modal-filtro-fecha-inicio');
            const fechaFin = document.getElementById('modal-filtro-fecha-fin');
            const tipoReserva = document.getElementById('modal-filtro-tipo-reserva');
            const estado = document.getElementById('modal-filtro-estado');
            const actividad = document.getElementById('modal-filtro-actividad');
            
            if (fechaInicio) fechaInicio.value = '';
            if (fechaFin) fechaFin.value = '';
            if (tipoReserva) tipoReserva.value = '';
            if (estado) estado.value = '';
            if (actividad) actividad.value = '';
            
            // Recargar datos sin filtros
            if (this.dataLoader) {
                this.dataLoader.limpiarFiltros();
                this.dataLoader.cargarDatosVisitantes();
            }
        }
        
        // Actualizar gráfica en el modal
        const tipoGrafica = document.querySelector('.modal-chart-container')?.getAttribute('data-tipo-grafica') || 'bar';
        setTimeout(() => {
            this.actualizarGraficaModal(tipoGrafica);
        }, 500);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Filtros limpiados',
                text: 'Se muestran todos los datos disponibles',
                timer: 2000,
                showConfirmButton: false
            });
        }
    }

    // Agregar esta función para recargar datos de institución sin filtros
    async recargarDatosInstitucionSinFiltros() {
        try {
            // Cargar todos los datos de institución sin filtros
            if (this.dataLoader) {
                await this.dataLoader.cargarDatosVisitantes();
            }
        } catch (error) {
            console.error('Error recargando datos de institución:', error);
        }
    }


    actualizarGraficaModalDesdeFiltros() {
        // Actualizar la gráfica cuando cambian los filtros de tipo_reserva o estado
        const tipoActual = this.chartManager ? this.chartManager.tipoActual : 'tipo_reserva';
        
        if (tipoActual === 'tipo_reserva' || tipoActual === 'actividad') {
            const tipoGrafica = document.querySelector('.modal-chart-container')?.getAttribute('data-tipo-grafica') || 'bar';
            
            // Obtener valores actuales de los filtros
            const tipoReserva = document.getElementById('modal-filtro-tipo-reserva');
            const estado = document.getElementById('modal-filtro-estado');
            const actividad = document.getElementById('modal-filtro-actividad');
            
            const filtros = {
                tipoReserva: tipoReserva ? tipoReserva.value : '',
                estado: estado ? estado.value : '',
                actividad: actividad ? actividad.value : ''
            };
            
            this.actualizarGraficaModalConFiltros(tipoGrafica, filtros);
        }
    }

    actualizarGraficaModalConFiltros(tipoGrafica, filtros) {
        const canvas = document.getElementById("chartAmpliado");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        
        const manager = this.chartManager;
        const processor = this.dataProcessor;
        
        if (!manager || !processor) {
            console.error('❌ Módulos necesarios no disponibles para modal');
            return;
        }
        
        // Obtener datos procesados con filtros
        const datos = processor.datosSimulados[manager.tipoActual];
        
        if (!datos) {
            console.error('❌ No hay datos para:', manager.tipoActual);
            return;
        }

        // Destruir gráfica anterior si existe
        if (manager.chartAmpliado) {
            manager.chartAmpliado.destroy();
        }

        // Generar título descriptivo basado en los filtros aplicados
        const tituloDescriptivo = this.generarTituloConFiltros(manager.tipoActual, filtros);
        const etiquetaDescriptiva = this.generarEtiquetaConFiltros(manager.tipoActual, filtros);

        // Actualizar título del modal
        const modalTitle = document.getElementById("modalTitle");
        if (modalTitle) {
            modalTitle.innerHTML = `<i class="fas fa-expand"></i> ${tituloDescriptivo}`;
        }

        // Verificar si es una gráfica agrupada
        const esGraficaAgrupada = datos.datasets && datos.type === 'grouped';

        let chartData;
        let chartOptions;

        if (esGraficaAgrupada) {
            // GRÁFICA AGRUPADA - Múltiples datasets
            chartData = {
                labels: datos.labels,
                datasets: datos.datasets.map(dataset => ({
                    ...dataset,
                    borderRadius: tipoGrafica === "bar" ? 6 : 0,
                    borderWidth: tipoGrafica === "bar" ? 0 : 2,
                    borderColor: tipoGrafica === "bar" ? 'transparent' : '#fff',
                    barThickness: tipoGrafica === "bar" ? 18 : undefined,
                    maxBarThickness: tipoGrafica === "bar" ? 30 : undefined,
                    barPercentage: tipoGrafica === "bar" ? 0.6 : undefined
                }))
            };

            chartOptions = this.obtenerOpcionesGraficaAgrupada(tipoGrafica, tituloDescriptivo, etiquetaDescriptiva, filtros);
        } else {
            // GRÁFICA SIMPLE - Un solo dataset
            const labels = datos.labels || [];
            const values = datos.values || [];
            const total = values.reduce((a, b) => a + b, 0);
            const colors = manager.generarColores(manager.tipoActual, labels);

            chartData = {
                labels: labels,
                datasets: [
                    {
                        label: this.generarLabelDataset(filtros),
                        data: values,
                        backgroundColor: colors,
                        borderRadius: tipoGrafica === "bar" ? 6 : 0,
                        borderWidth: tipoGrafica === "bar" ? 0 : 2,
                        borderColor: tipoGrafica === "bar" ? 'transparent' : '#fff',
                        barThickness: tipoGrafica === "bar" ? 18 : undefined,
                        maxBarThickness: tipoGrafica === "bar" ? 30 : undefined,
                        barPercentage: tipoGrafica === "bar" ? 0.6 : undefined
                    },
                ],
            };

            chartOptions = this.obtenerOpcionesGraficaSimple(tipoGrafica, tituloDescriptivo, etiquetaDescriptiva, filtros, total);
        }

        // Crear nueva gráfica
        manager.chartAmpliado = new Chart(ctx, {
            type: tipoGrafica === "bar" ? "bar" : "doughnut",
            data: chartData,
            options: chartOptions
        });

        // Llenar tabla con porcentajes
        this.actualizarTablaConDatos(datos, filtros, esGraficaAgrupada);

        setTimeout(() => {
            if (manager.chartAmpliado) {
                manager.chartAmpliado.resize();
            }
        }, 200);
    }

    // Función para aplicar orden y cantidad a datos de institución
    aplicarOrdenYCantidadInstitucion(cantidad, orden) {
        if (!this.dataProcessor || !this.dataProcessor.datosSimulados) return;
        
        const datos = this.dataProcessor.datosSimulados.institucion;
        if (!datos || !datos.labels || !datos.values) return;
        
        let indices = datos.labels.map((label, index) => ({ label, value: datos.values[index], index }));
        
        // Aplicar orden
        if (orden === 'desc') {
            indices.sort((a, b) => b.value - a.value);
        } else if (orden === 'asc') {
            indices.sort((a, b) => a.value - b.value);
        } else if (orden === 'alpha') {
            indices.sort((a, b) => a.label.localeCompare(b.label));
        }
        
        // Aplicar cantidad
        if (cantidad > 0 && cantidad < indices.length) {
            indices = indices.slice(0, cantidad);
        }
        
        // Reconstruir arrays
        datos.labels = indices.map(item => item.label);
        datos.values = indices.map(item => item.value);
        
        // Actualizar datos en el dataProcessor
        this.dataProcessor.datosSimulados.institucion = datos;
    }

    // Función para actualizar gráfica con filtros de institución
    actualizarGraficaModalConFiltrosInstitucion(tipoGrafica) {
        const canvas = document.getElementById("chartAmpliado");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        
        if (!this.chartManager || !this.dataProcessor) {
            console.error('❌ Módulos necesarios no disponibles para modal');
            return;
        }
        
        const datos = this.dataProcessor.datosSimulados.institucion;
        if (!datos) {
            console.error('❌ No hay datos para institución');
            return;
        }

        // Destruir gráfica anterior si existe
        if (this.chartManager.chartAmpliado) {
            this.chartManager.chartAmpliado.destroy();
        }

        // Generar colores
        const colors = this.chartManager.generarColores('institucion', datos.labels);
        
        // Obtener valores de filtros para el título (SOLO los que funcionan)
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio')?.value;
        const fechaFin = document.getElementById('modal-filtro-fecha-fin')?.value;
        const institucion = document.getElementById('modal-filtro-institucion')?.value;
        const cantidad = document.getElementById('modal-filtro-cantidad')?.value;
        const orden = document.getElementById('modal-filtro-orden')?.value;
        
        // Generar título descriptivo
        let titulo = 'Visitantes por Institución';
        const partes = [];
        
        if (fechaInicio && fechaFin) {
            partes.push(`Período: ${this.formatearFecha(fechaInicio)} - ${this.formatearFecha(fechaFin)}`);
        }
        
        if (institucion && institucion !== 'todas') {
            const institucionSelect = document.getElementById('modal-filtro-institucion');
            const institucionNombre = institucionSelect?.options[institucionSelect.selectedIndex]?.text || 'Institución';
            partes.push(`Institución: ${institucionNombre}`);
        }
        
        if (cantidad && cantidad !== '10') {
            partes.push(`Mostrando: ${cantidad === '0' ? 'Todos' : 'Top ' + cantidad}`);
        }
        
        if (orden && orden !== 'desc') {
            const ordenText = orden === 'asc' ? 'Menor a mayor' : 'Alfabético';
            partes.push(`Orden: ${ordenText}`);
        }
        
        if (partes.length > 0) {
            titulo += ` (${partes.join(' | ')})`;
        }

        // Actualizar título del modal
        const modalTitle = document.getElementById("modalTitle");
        if (modalTitle) {
            modalTitle.innerHTML = `<i class="fas fa-expand"></i> ${titulo}`;
        }

        this.chartManager.chartAmpliado = new Chart(ctx, {
            type: tipoGrafica === "bar" ? "bar" : "doughnut",
            data: {
                labels: datos.labels,
                datasets: [{
                    label: "Total de Visitantes",
                    data: datos.values,
                    backgroundColor: colors,
                    borderRadius: tipoGrafica === "bar" ? 6 : 0,
                    borderWidth: tipoGrafica === "bar" ? 0 : 2,
                    borderColor: tipoGrafica === "bar" ? 'transparent' : '#fff',
                    barThickness: tipoGrafica === "bar" ? 18 : undefined,
                    maxBarThickness: tipoGrafica === "bar" ? 30 : undefined,
                    barPercentage: tipoGrafica === "bar" ? 0.6 : undefined
                }],
            },
            options: this.obtenerOpcionesGraficaInstitucion(tipoGrafica, titulo)
        });

        // Actualizar tabla
        this.actualizarTablaConDatosInstitucion(datos);
    }

    // Obtener opciones específicas para gráfica de institución
    obtenerOpcionesGraficaInstitucion(tipoGrafica, titulo) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: tipoGrafica === "bar" ? 'top' : 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.y || context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
                        }
                    }
                }
            },
            scales: tipoGrafica === "bar" ? {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
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
            cutout: tipoGrafica === "bar" ? '0%' : '40%'
        };
    }

    // Actualizar tabla con datos de institución
    actualizarTablaConDatosInstitucion(datos) {
        const tbody = document.querySelector("#tablaDatos tbody");
        if (!tbody) return;

        const total = datos.values.reduce((a, b) => a + b, 0);
        
        tbody.innerHTML = datos.labels.map((label, i) => {
            const valor = datos.values[i];
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            
            return `
                <tr>
                    <td><strong>${label}</strong></td>
                    <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                </tr>
            `;
        }).join("") + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td>TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
            </tr>
        ` : '');
    }

    // Función auxiliar para formatear fecha
    formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    obtenerOpcionesGraficaAgrupada(tipoGrafica, tituloDescriptivo, etiquetaDescriptiva, filtros) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: tituloDescriptivo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value.toLocaleString()} reservas`;
                        }
                    }
                }
            },
            scales: tipoGrafica === "bar" ? {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: {
                        display: true,
                        text: 'Cantidad de Reservas',
                        font: { weight: 'bold', size: 14 }
                    }
                },
                x: {
                    grid: { display: false },
                    title: {
                        display: true,
                        text: etiquetaDescriptiva,
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            } : {},
            cutout: tipoGrafica === "bar" ? '0%' : '40%'
        };
    }

    obtenerOpcionesGraficaSimple(tipoGrafica, tituloDescriptivo, etiquetaDescriptiva, filtros, total) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: tipoGrafica === "bar" ? 'top' : 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: tituloDescriptivo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.y || context.parsed;
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value.toLocaleString()} ${filtros.estado && filtros.estado !== 'todas' ? filtros.estado : 'reservas'} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: tipoGrafica === "bar" ? {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: {
                        display: true,
                        text: this.generarTituloEjeY(filtros),
                        font: { weight: 'bold', size: 14 }
                    }
                },
                x: {
                    grid: { display: false },
                    title: {
                        display: true,
                        text: etiquetaDescriptiva,
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            } : {},
            cutout: tipoGrafica === "bar" ? '0%' : '40%'
        };
    }

    actualizarTablaConDatos(datos, filtros, esGraficaAgrupada) {
        const tbody = document.querySelector("#tablaDatos tbody");
        if (!tbody) return;

        let tablaHTML = '';

        if (esGraficaAgrupada) {
            // Tabla para gráfica agrupada
            const totales = {};
            datos.datasets.forEach(dataset => {
                dataset.data.forEach((valor, index) => {
                    const label = datos.labels[index];
                    if (!totales[label]) totales[label] = 0;
                    totales[label] += valor;
                });
            });

            const totalGeneral = Object.values(totales).reduce((a, b) => a + b, 0);

            tablaHTML = datos.labels.map((label, index) => {
                let filaHTML = '';
                let subtotal = 0;

                // Filas para cada dataset (estado)
                datos.datasets.forEach(dataset => {
                    const valor = dataset.data[index] || 0;
                    subtotal += valor;
                    const porcentaje = totalGeneral > 0 ? ((valor / totalGeneral) * 100).toFixed(1) : '0.0';
                    
                    filaHTML += `<tr>
                        <td><strong>${label} - ${dataset.label}</strong></td>
                        <td style="text-align: center;"><strong>${valor.toLocaleString()}</strong></td>
                        <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                    </tr>`;
                });

                // Fila de subtotal
                const porcentajeSubtotal = totalGeneral > 0 ? ((subtotal / totalGeneral) * 100).toFixed(1) : '0.0';
                filaHTML += `<tr style="background-color: #f8f9fa;">
                    <td><strong>${label} - TOTAL</strong></td>
                    <td style="text-align: center;"><strong>${subtotal.toLocaleString()}</strong></td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentajeSubtotal}%</td>
                </tr>`;

                return filaHTML;
            }).join('');

            // Fila de total general
            tablaHTML += `<tr style="background-color: #e3f2fd; border-top: 2px solid #2196f3;">
                <td><strong>TOTAL GENERAL</strong></td>
                <td style="text-align: center;"><strong>${totalGeneral.toLocaleString()}</strong></td>
                <td style="text-align: center; color: #2196f3; font-weight: bold">100%</td>
            </tr>`;

        } else {
            // Tabla para gráfica simple
            const labels = datos.labels || [];
            const values = datos.values || [];
            const total = values.reduce((a, b) => a + b, 0);

            tablaHTML = labels.map((l, i) => {
                const valor = values[i] || 0;
                const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : '0.0';
                return `<tr>
                    <td><strong>${l}</strong></td>
                    <td style="text-align: center;"><strong>${valor.toLocaleString()}</strong></td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                </tr>`;
            }).join("");
        }

        tbody.innerHTML = tablaHTML;
    }

    generarTituloConFiltros(tipo, filtros) {
        let tituloBase = '';
        
        // Definir título base según el tipo
        if (tipo === 'tipo_reserva') {
            tituloBase = 'Reservas por Tipo';
        } else if (tipo === 'actividad') {
            tituloBase = 'Reservas por Actividad';
        } else {
            tituloBase = 'Reservas';
        }
        
        const partes = [];
        
        // Filtros para tipo_reserva
        if (tipo === 'tipo_reserva' && filtros.tipoReserva && filtros.tipoReserva !== '') {
            if (filtros.tipoReserva === 'todas') {
                partes.push('Todos los tipos');
            } else {
                partes.push(filtros.tipoReserva === 'individual' ? 'Individuales' : 'Grupales');
            }
        }
        
        // Filtros para actividad
        if (tipo === 'actividad' && filtros.actividad && filtros.actividad !== '') {
            if (filtros.actividad === 'todas') {
                partes.push('Todas las actividades');
            } else {
                partes.push('Actividad específica');
            }
        }
        
        // Filtro de estado (común para ambos)
        if (filtros.estado && filtros.estado !== '') {
            if (filtros.estado === 'todas') {
                partes.push('todos los estados');
            } else {
                partes.push(filtros.estado);
            }
        }
        
        if (partes.length > 0) {
            return `${tituloBase} - ${partes.join(' / ')}`;
        }
        
        return tituloBase;
    }

    generarEtiquetaConFiltros(tipo, filtros) {
        if (tipo === 'tipo_reserva') {
            if (filtros.estado && filtros.estado !== '' && filtros.estado !== 'todas') {
                return `Tipo de Reserva (Estado: ${filtros.estado})`;
            }
            return 'Tipo de Reserva';
        } else if (tipo === 'actividad') {
            if (filtros.estado && filtros.estado !== '' && filtros.estado !== 'todas') {
                return `Actividad (Estado: ${filtros.estado})`;
            }
            return 'Actividad';
        }
        return 'Categoría';
    }

    generarLabelDataset(filtros) {
        if (filtros.estado && filtros.estado !== '' && filtros.estado !== 'todas') {
            return `Reservas ${filtros.estado}`;
        }
        return 'Total de Reservas';
    }

    generarTituloEjeY(filtros) {
        if (filtros.estado && filtros.estado !== '' && filtros.estado !== 'todas') {
            return `Cantidad de Reservas ${filtros.estado}`;
        }
        return 'Cantidad de Reservas';
    } 

    actualizarGraficaModal(tipoGrafica) {
        // Versión simple sin filtros para cuando no hay filtros aplicados
        this.actualizarGraficaModalConFiltros(tipoGrafica, {});
    }

    descargarGraficoPrincipal() {
        const canvas = document.getElementById("chartBar");
        if (!canvas) return;
        
        const link = document.createElement("a");
        link.download = "grafica_principal.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }
}

const uiManager = new UIManager();