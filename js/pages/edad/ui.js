// EdadSystem - ui
// Refactor modular: lógica original preservada.

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

function mostrarInterfazTiempoAgrupada(tipo, datosAgrupados) {
        const container = document.getElementById('data-container');
        const titulo = getTituloTiempo(tipo);
        const icono = getIconoTiempo(tipo);

        container.innerHTML = `
            <div class="chart-controls">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        ${icono} ${titulo} - Gráficas Agrupadas
                        <span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                            ${datosAgrupados.total} visitantes
                        </span>
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="download-btn" onclick="window.EdadSystem.descargarGraficoAgrupado('${tipo}')">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card" onclick="window.EdadSystem.abrirModalTiempoAgrupado('${tipo}', 'bar')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> ${titulo} - Barras Agrupadas
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}BarAgrupado"></canvas>
                    </div>
                </div>

                <div class="chart-card" onclick="window.EdadSystem.abrirModalTiempoAgrupado('${tipo}', 'pie')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> ${titulo} - Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap pie-chart-container">
                        <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}PieAgrupado"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por ${titulo.split(' ')[1]} y Rango de Edad
                    </h3>
                    <button class="download-btn" onclick="window.EdadSystem.descargarExcelAgrupado('${tipo}')">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 700px;">
                        <thead>
                            <tr>
                                <th style="min-width: 150px;">${titulo.split(' ')[1]}</th>
                                ${datosAgrupados.datasets.map(dataset => `<th>${dataset.label}</th>`).join('')}
                                <th style="width: 120px;">Total por ${titulo.split(' ')[1]}</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-${tipo}-agrupado-body">
                            ${generarFilasTablaAgrupada(datosAgrupados, tipo)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        mostrarGraficasAgrupadasTiempo(tipo);
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
