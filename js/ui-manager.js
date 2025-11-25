// Módulo para gestión de interfaz
class UIManager {
    mostrarDatos() {
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

                <!-- Filtros específicos con mejor diseño -->
                <div id="filtros-especificos-container" style="margin-top: 15px; display: none;">
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #e9ecef;">
                        <h4 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px; color: #2c3e50; font-size: 0.95rem;">
                            <i class="fas fa-filter"></i> Filtros Específicos
                        </h4>
                        <div id="filtros-especificos"></div>
                    </div>
                </div>

                <div class="chart-type-buttons btn-group" style="margin-top: 12px">
                    <button class="chart-btn active" data-type="tipo_reserva">
                        <i class="fas fa-ticket-alt"></i> Tipo Reserva
                    </button>
                    <button class="chart-btn" data-type="estado">
                        <i class="fas fa-check-circle"></i> Estado
                    </button>
                    <button class="chart-btn" data-type="actividad">
                        <i class="fas fa-hiking"></i> Actividad
                    </button>
                    <button class="chart-btn" data-type="institucion">
                        <i class="fas fa-university"></i> Institución
                    </button>
                    <button class="chart-btn" data-type="satisfaccion">
                        <i class="fas fa-star"></i> Satisfacción
                    </button>
                    <button class="chart-btn" data-type="intereses">
                        <i class="fas fa-heart"></i> Intereses
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

            <!-- Gráficas principales lado a lado -->
            <div class="charts-grid">
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

        // Inicializar gráficas
        if (typeof chartManager !== 'undefined') {
            chartManager.mostrarGraficas("tipo_reserva");
        }
        this.configurarEventos();
    }

    configurarEventos() {
        // Botones de tipo de gráfica
        const chartButtons = document.querySelectorAll('.chart-btn');
        if (chartButtons.length > 0) {
            chartButtons.forEach(btn => {
                btn.addEventListener('click', (event) => {
                    // Remover clase active de todos los botones
                    chartButtons.forEach(b => b.classList.remove('active'));
                    // Agregar clase active al botón clickeado
                    event.currentTarget.classList.add('active');
                    
                    const tipo = event.currentTarget.getAttribute('data-type');
                    if (typeof chartManager !== 'undefined') {
                        chartManager.mostrarGraficas(tipo);
                    }
                    
                    // Crear filtros específicos para este tipo
                    this.crearFiltrosEspecificos(tipo);
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

        // Crear filtros específicos iniciales
        this.crearFiltrosEspecificos('tipo_reserva');
    }

    crearFiltrosEspecificos(tipo) {
        const filtrosContainer = document.getElementById('filtros-especificos');
        const filtrosEspecificosContainer = document.getElementById('filtros-especificos-container');
        
        if (!filtrosContainer || !filtrosEspecificosContainer) return;

        let filtrosHTML = '';

        switch(tipo) {
            case 'tipo_reserva':
                filtrosHTML = `
                    <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div class="filter-group" style="margin: 0;">
                            <label class="filter-label" style="margin-bottom: 5px; font-size: 0.85rem;">Filtrar por tipo:</label>
                            <select class="filter-select" id="filtro-tipo-reserva-especifico" style="min-width: 150px;">
                                <option value="todos">Todos los tipos</option>
                                <option value="individual">Individual</option>
                                <option value="grupal">Grupal</option>
                            </select>
                        </div>
                        <button class="btn" id="limpiar-filtros-especificos-btn" style="background: #95a5a6; color: white; padding: 6px 12px; font-size: 0.8rem; margin-top: 20px;">
                            <i class="fas fa-times"></i> Limpiar
                        </button>
                    </div>
                `;
                break;
            default:
                filtrosHTML = '';
                break;
        }

        filtrosContainer.innerHTML = filtrosHTML;
        
        // Configurar eventos de los filtros específicos
        if (filtrosHTML) {
            filtrosEspecificosContainer.style.display = 'block';
            
            // Evento para el select de tipo de reserva
            const selectTipoReserva = document.getElementById('filtro-tipo-reserva-especifico');
            if (selectTipoReserva) {
                selectTipoReserva.addEventListener('change', () => {
                    this.aplicarFiltroTipoReserva();
                });
            }
            
            // Evento para el botón limpiar
            const btnLimpiar = document.getElementById('limpiar-filtros-especificos-btn');
            if (btnLimpiar) {
                btnLimpiar.addEventListener('click', () => {
                    this.limpiarFiltrosEspecificos();
                });
            }
        } else {
            filtrosEspecificosContainer.style.display = 'none';
        }
    }

    aplicarFiltroTipoReserva() {
        const tipoSeleccionado = document.getElementById('filtro-tipo-reserva-especifico');
        if (!tipoSeleccionado) return;
        
        const valor = tipoSeleccionado.value;
        
        try {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Aplicando filtro...',
                    text: 'Filtrando datos por tipo de reserva',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }

            // Aquí iría la lógica de filtrado real
            // Por ahora simulamos con un timeout
            setTimeout(() => {
                if (typeof Swal !== 'undefined') {
                    Swal.close();
                    Swal.fire({
                        icon: 'success',
                        title: 'Filtro aplicado',
                        text: `Mostrando reservas ${valor !== 'todos' ? 'de tipo ' + valor : 'de todos los tipos'}`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
                
                // Actualizar gráficas si es necesario
                if (typeof chartManager !== 'undefined') {
                    chartManager.mostrarGraficas(chartManager.tipoActual);
                }
            }, 1000);

        } catch (error) {
            console.error('Error aplicando filtro:', error);
            if (typeof Swal !== 'undefined') {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo aplicar el filtro: ' + error.message,
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    }

    limpiarFiltrosEspecificos() {
        const filtroTipo = document.getElementById('filtro-tipo-reserva-especifico');
        if (filtroTipo) {
            filtroTipo.value = 'todos';
        }
        
        // Recargar datos sin filtro
        if (typeof dataLoader !== 'undefined') {
            dataLoader.limpiarFiltros();
            dataLoader.cargarDatosVisitantes();
        }
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Filtro limpiado',
                text: 'Se muestran todos los tipos de reserva',
                timer: 1500,
                showConfirmButton: false
            });
        }
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

        // Crear filtros específicos para este tipo
        this.crearFiltrosModal();
        
        // Crear gráfica inicial
        this.actualizarGraficaModal(tipoGrafica);
    }

    crearFiltrosModal() {
        const modalHeader = document.querySelector('.modal-header');
        if (!modalHeader) return;
        
        // Eliminar filtros anteriores si existen
        const filtrosAnteriores = document.getElementById('filtrosModal');
        if (filtrosAnteriores) {
            filtrosAnteriores.remove();
        }

        let filtrosHTML = '';
        
        // Filtros base (fecha inicial y final) para todos los tipos
        let filtrosBaseHTML = `
            <div class="filter-group">
                <label class="filter-label">Fecha Inicial</label>
                <input type="date" class="filter-select" id="modal-filtro-fecha-inicio">
            </div>
            <div class="filter-group">
                <label class="filter-label">Fecha Final</label>
                <input type="date" class="filter-select" id="modal-filtro-fecha-fin">
            </div>
        `;

        // Filtros específicos según el tipo actual
        let filtrosEspecificosHTML = '';
        
        if (typeof chartManager !== 'undefined') {
            switch(chartManager.tipoActual) {
                case 'tipo_reserva':
                    filtrosEspecificosHTML = `
                        <div class="filter-group">
                            <label class="filter-label">Tipo de Reserva</label>
                            <select class="filter-select" id="modal-filtro-tipo-reserva">
                                <option value="todas">Todas las reservas</option>
                                <option value="individual">Individual</option>
                                <option value="grupal">Grupal</option>
                            </select>
                        </div>
                    `;
                    break;
                default:
                    filtrosEspecificosHTML = '';
                    break;
            }
        }

        // Combinar todos los filtros
        filtrosHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 12px;">
                ${filtrosBaseHTML}
                ${filtrosEspecificosHTML}
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn btn-primary" id="aplicar-filtros-modal-btn">
                    <i class="fas fa-check"></i> Aplicar Filtros
                </button>
                <button class="btn" id="limpiar-filtros-modal-btn" style="background: #e74c3c; color: white;">
                    <i class="fas fa-times"></i> Limpiar Filtros
                </button>
            </div>
        `;

        const filtrosContainer = document.createElement('div');
        filtrosContainer.id = 'filtrosModal';
        filtrosContainer.style.cssText = `
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        `;
        
        let tituloDescriptivo = 'Filtros';
        if (typeof chartManager !== 'undefined') {
            tituloDescriptivo = chartManager.obtenerTituloDescriptivo(chartManager.tipoActual);
        }
        
        filtrosContainer.innerHTML = `
            <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px">
                <i class="fas fa-filter"></i> Filtros para ${tituloDescriptivo}
            </h4>
            ${filtrosHTML}
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
        
        // Configurar evento para el select de tipo de reserva en el modal
        const selectTipoReservaModal = document.getElementById('modal-filtro-tipo-reserva');
        if (selectTipoReservaModal) {
            selectTipoReservaModal.addEventListener('change', () => {
                this.actualizarGraficasConFiltroTipoReserva();
            });
        }

        // Inicializar fechas
        this.inicializarFechasModal();
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
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio');
        const fechaFin = document.getElementById('modal-filtro-fecha-fin');
        const tipoReserva = document.getElementById('modal-filtro-tipo-reserva');
        
        if (fechaInicio && fechaFin && tipoReserva) {
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
            
            if (typeof dataLoader !== 'undefined') {
                dataLoader.aplicarFiltrosCombinados(
                    fechaInicio.value, 
                    fechaFin.value, 
                    tipoReserva.value
                );
            }
        }
    }

    limpiarFiltrosModal() {
        const fechaInicio = document.getElementById('modal-filtro-fecha-inicio');
        const fechaFin = document.getElementById('modal-filtro-fecha-fin');
        const tipoReserva = document.getElementById('modal-filtro-tipo-reserva');
        
        if (fechaInicio) fechaInicio.value = '';
        if (fechaFin) fechaFin.value = '';
        if (tipoReserva) tipoReserva.value = 'todas';
        
        if (typeof dataLoader !== 'undefined') {
            dataLoader.limpiarFiltros();
            dataLoader.cargarDatosVisitantes();
        }
        
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

    actualizarGraficasConFiltroTipoReserva() {
        const tipoReservaSeleccionado = document.getElementById('modal-filtro-tipo-reserva');
        
        if (!tipoReservaSeleccionado) return;
        
        const valor = tipoReservaSeleccionado.value;
        console.log('Filtro tipo reserva cambiado a:', valor);
        
        if (typeof chartManager !== 'undefined') {
            if (chartManager.tipoActual === 'fecha' || chartManager.tipoActual === 'mes' || chartManager.tipoActual === 'anio') {
                console.log('Actualizando gráficas temporales con filtro:', valor);
                chartManager.mostrarGraficas(chartManager.tipoActual);
                
                const modal = document.getElementById('chartModal');
                if (modal && modal.classList.contains('show')) {
                    const tipoGraficaActual = document.querySelector('.modal-chart-container') ? 
                                            document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica') : 'bar';
                    console.log('Actualizando modal con tipo:', tipoGraficaActual);
                    this.actualizarGraficaModal(tipoGraficaActual);
                }
            }
        }
    }

    actualizarGraficaModal(tipoGrafica) {
        const canvas = document.getElementById("chartAmpliado");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        
        if (typeof chartManager === 'undefined' || typeof dataProcessor === 'undefined') {
            console.error('Módulos necesarios no disponibles');
            return;
        }
        
        const datos = dataProcessor.datosSimulados[chartManager.tipoActual];
        
        if (!datos) {
            console.error('No hay datos para:', chartManager.tipoActual);
            return;
        }

        if (chartManager.chartAmpliado) {
            chartManager.chartAmpliado.destroy();
        }

        let labels, values, total;

        if (chartManager.tipoActual === 'fecha' || chartManager.tipoActual === 'mes' || chartManager.tipoActual === 'anio') {
            const tipoReservaSeleccionado = document.getElementById('modal-filtro-tipo-reserva') ? 
                                        document.getElementById('modal-filtro-tipo-reserva').value : 'todas';
            
            if (tipoReservaSeleccionado === 'individual') {
                labels = datos.labels || [];
                values = datos.individual || [];
            } else if (tipoReservaSeleccionado === 'grupal') {
                labels = datos.labels || [];
                values = datos.grupal || [];
            } else {
                labels = datos.labels || [];
                values = datos.total || [];
            }
            total = values.reduce((a, b) => a + b, 0);
        } else {
            labels = datos.labels || [];
            values = datos.values || [];
            total = values.reduce((a, b) => a + b, 0);
        }

        const colors = chartManager.generarColores(chartManager.tipoActual, labels);
        const etiquetaDescriptiva = chartManager.obtenerEtiquetaDescriptiva(chartManager.tipoActual);
        const tituloDescriptivo = chartManager.obtenerTituloDescriptivo(chartManager.tipoActual);

        // Actualizar título del modal
        const modalTitle = document.getElementById("modalTitle");
        if (modalTitle) {
            modalTitle.innerHTML = `<i class="fas fa-expand"></i> ${tituloDescriptivo}`;
        }

        chartManager.chartAmpliado = new Chart(ctx, {
            type: tipoGrafica === "bar" ? "bar" : "doughnut",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Total de Visitantes",
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
            },
            options: {
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
            },
        });

        // Llenar tabla con porcentajes
        const tbody = document.querySelector("#tablaDatos tbody");
        if (tbody) {
            tbody.innerHTML = labels
                .map((l, i) => {
                    const valor = values[i] || 0;
                    const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : '0.0';
                    return `<tr>
                        <td><strong>${l}</strong></td>
                        <td style="text-align: center;"><strong>${valor.toLocaleString()}</strong></td>
                        <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                    </tr>`;
                })
                .join("");
        }

        setTimeout(() => {
            if (chartManager.chartAmpliado) {
                chartManager.chartAmpliado.resize();
            }
        }, 200);
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