// NacionalidadSystem - ui
// Refactor modular: lógica original preservada.

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

// Función para mostrar interfaz de tiempo (fecha, mes, año)
    function mostrarInterfazTiempo(tipo, datosFiltrados = null) {
        const container = document.getElementById('data-container');
        const titulo = getTituloTiempo(tipo);
        const icono = getIconoTiempo(tipo);
        
        // USAR: datos filtrados si existen, SINO datos originales
        const datos = datosFiltrados || getDatosTiempo(tipo);
        
        // TODO el HTML IGUAL, pero asegúrate de usar ${tipo} donde corresponda
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
                                <th style="min-width: 150px;">País</th>
                                <th style="min-width: 150px;">${titulo.split(' ')[1]}</th>
                                <th style="width: 120px;">Visitantes</th>
                                <th style="width: 100px;">Porcentaje</th>
                                <th colspan="3" style="min-width: 100px;">Detalles</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-${tipo}-body">
                            ${generarFilasTablaTiempo(datos, tipo)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Llamar a una función que muestre gráficas CON datos específicos
        mostrarGraficasTiempoConDatos(tipo, datos);
    }
