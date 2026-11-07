// CiudadSystem - ui
// Refactor modular: lógica original preservada.

// Función para mostrar interfaz de ciudad
    function mostrarInterfazCiudad() {
        const container = document.getElementById('data-container');
        const stats = datosCiudades.estadisticas;
        
        container.innerHTML = `
            <div class="chart-controls">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-city"></i> Distribución por Ciudad
                        <span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                            ${stats.totalConCiudad} visitantes de ${stats.totalCiudadesUnicas} ciudades
                        </span>
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="download-btn" onclick="window.CiudadSystem.descargarGraficoPrincipal()">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card" onclick="window.CiudadSystem.abrirModal('bar')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> Distribución por Ciudad - Barras
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chartBarCiudad"></canvas>
                    </div>
                </div>

                <div class="chart-card" onclick="window.CiudadSystem.abrirModal('pie')">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-pie"></i> Distribución por Ciudad - Circular
                        </div>
                        <div class="chart-card-badge">Haz clic para ampliar</div>
                    </div>
                    <div class="chart-canvas-wrap pie-chart-container">
                        <canvas id="chartPieCiudad"></canvas>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por Ciudad
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="download-btn" onclick="window.CiudadSystem.descargarExcel()">
                            <i class="fas fa-file-excel"></i> Exportar Excel
                        </button>
                        <button class="btn" onclick="window.CiudadSystem.mostrarTodasLasCiudades()" style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white;">
                            <i class="fas fa-list"></i> Ver todas las ciudades
                        </button>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 700px;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th style="min-width: 150px;">Ciudad</th>
                                <th style="width: 120px;">Total Visitantes</th>
                                <th style="width: 100px;">Porcentaje</th>
                                <th style="min-width: 150px;">Descripción</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-ciudad-body">
                            ${generarFilasTablaCiudad()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        mostrarGraficasCiudad();
    }

// =============================================
    // INTERFAZ PARA CIUDAD POR TIEMPO - CON BARRAS
    // =============================================

    function mostrarInterfazCiudadTiempo(tipo) {
        const container = document.getElementById('data-container');
        const datos = getDatosCiudadTiempo(tipo);
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
                        <button class="download-btn" onclick="window.CiudadSystem.descargarGraficoPrincipalTiempo('${tipo}')">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                        <button class="btn" onclick="window.CiudadSystem.abrirModalTiempoDetalle('${tipo}')" style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white;">
                            <i class="fas fa-expand"></i> Ver Detalle Completo
                        </button>
                    </div>
                </div>
                
                <!-- CONTROLES DE RANGO DE FECHA -->
                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; color: #2c3e50;">
                        <i class="fas fa-calendar-alt"></i> Rango de ${tipo}
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <label style="font-weight: 600; margin-bottom: 5px; display: block; font-size: 0.9rem;">
                                ${getLabelFechaInicio(tipo)}
                            </label>
                            ${getInputFechaInicio(tipo)}
                        </div>
                        <div>
                            <label style="font-weight: 600; margin-bottom: 5px; display: block; font-size: 0.9rem;">
                                ${getLabelFechaFin(tipo)}
                            </label>
                            ${getInputFechaFin(tipo)}
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button class="btn btn-primary" onclick="window.CiudadSystem.aplicarRangoFechas('${tipo}')" style="width: 100%;">
                                <i class="fas fa-filter"></i> Aplicar Rango
                            </button>
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button class="btn" onclick="window.CiudadSystem.limpiarRangoFechas('${tipo}')" style="width: 100%; background: #95a5a6; color: white;">
                                <i class="fas fa-broom"></i> Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-chart-bar"></i> ${titulo} - Barras Agrupadas
                        </div>
                        <div class="chart-card-badge">
                            <i class="fas fa-sort-amount-down"></i> Ordenado cronológicamente
                        </div>
                    </div>
                    <div class="chart-canvas-wrap">
                        <canvas id="chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Ciudad"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-card-header">
                        <div class="chart-card-title">
                            <i class="fas fa-list"></i> Distribución por Ciudad
                        </div>
                        <div class="chart-card-badge">
                            <i class="fas fa-search"></i> Con buscador
                        </div>
                    </div>
                    <div class="chart-canvas-wrap" style="overflow-x: auto;">
                        <div style="padding: 15px;">
                            <!-- BUSCADOR DE CIUDADES -->
                            <div style="margin-bottom: 15px;">
                                <div style="position: relative;">
                                    <i class="fas fa-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #7f8c8d;"></i>
                                    <input type="text" 
                                           id="buscador-ciudad-${tipo}" 
                                           style="width: 100%; padding: 8px 8px 8px 35px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
                                           placeholder="Buscar ciudad por nombre..."
                                           onkeyup="window.CiudadSystem.filtrarTablaCiudades('${tipo}', this.value)">
                                </div>
                            </div>
                            
                            <!-- LISTA DE CIUDADES -->
                            <div id="lista-ciudades-${tipo}" style="max-height: 250px; overflow-y: auto;">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TABLA DE DETALLE -->
            <div class="data-table" style="margin-top: 20px;">
                <div class="chart-header">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 6px">
                        <i class="fas fa-table"></i> Detalle por ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        <div style="margin-left: auto; display: flex; gap: 10px;">
                            <button class="btn" onclick="window.CiudadSystem.ordenarTabla('${tipo}', 'desc')" style="background: #e74c3c; color: white; font-size: 12px; padding: 6px 12px;">
                                <i class="fas fa-sort-amount-down"></i> Mayor a menor
                            </button>
                            <button class="btn" onclick="window.CiudadSystem.ordenarTabla('${tipo}', 'asc')" style="background: #3498db; color: white; font-size: 12px; padding: 6px 12px;">
                                <i class="fas fa-sort-amount-up"></i> Menor a mayor
                            </button>
                            <button class="btn" onclick="window.CiudadSystem.ordenarTabla('${tipo}', 'fecha')" style="background: #2ecc71; color: white; font-size: 12px; padding: 6px 12px;">
                                <i class="fas fa-calendar"></i> Por fecha
                            </button>
                        </div>
                    </h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="table" style="min-width: 800px;" id="tabla-detalle-${tipo}">
                        <thead>
                            <tr>
                                <th>${getTituloColumna(tipo)}</th>
                                <th>Total Ciudades</th>
                                <th>Visitantes</th>
                                <th>Ciudad Principal</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-${tipo}-body">
                            ${generarFilasTablaCiudadTiempo(datos, tipo)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        mostrarGraficaCiudadTiempo(tipo);
        llenarListaCiudades(tipo);
    }

// =============================================
    // FUNCIONES DE INTERFAZ DE USUARIO
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

function mostrarErrorCiudad(mensaje = 'Error al cargar los datos de ciudad') {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data" style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c;"></i>
                <h3 style="color: #e74c3c;">Error al cargar datos</h3>
                <p>${mensaje}</p>
                <button class="btn btn-primary" onclick="window.CiudadSystem.cargarDatos()" style="background: #3498db; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

function mostrarSinDatosCiudad() {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data" style="text-align: center; padding: 40px;">
                <i class="fas fa-city" style="font-size: 48px; color: #7f8c8d;"></i>
                <h3>No hay datos de ciudades disponibles</h3>
                <p>No se encontraron participantes con ciudad registrada.</p>
                <button class="btn btn-primary" onclick="window.CiudadSystem.cargarDatos()" style="background: #3498db; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

function mostrarSinDatosTiempo(tipo) {
        const container = document.getElementById('data-container');
        container.innerHTML = `
            <div class="no-data" style="text-align: center; padding: 40px;">
                <i class="fas fa-calendar-times" style="font-size: 48px; color: #7f8c8d;"></i>
                <h3>No hay datos de ${tipo} disponibles</h3>
                <p>No se encontraron visitantes con fechas de visita registradas.</p>
                <button class="btn btn-primary" onclick="window.CiudadSystem.cargarDatosCiudadTiempo('${tipo}')" style="background: #3498db; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

function mostrarExito(mensaje) {
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

function mostrarMensajeNoHayDatos(mensaje = 'No hay datos disponibles para los filtros seleccionados') {
        Swal.fire({
            icon: 'info',
            title: 'Sin datos',
            text: mensaje,
            confirmButtonColor: '#3498db'
        });
    }
