// CiudadSystem - modals
// Refactor modular: lógica original preservada.

// Función para actualizar contenido del modal con filtros
    function actualizarContenidoModal(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalCiudad");
        if (!modal) return;
        
        // Crear contenido completo del modal
        const titulo = tipo === 'ciudad' ? 'Distribución por Ciudad' : getTituloTiempo(tipo);
        const iconoTitulo = tipo === 'ciudad' ? 'fa-city' : 
                           tipo === 'fecha' ? 'fa-calendar-day' : 
                           tipo === 'mes' ? 'fa-calendar-week' : 'fa-calendar-alt';
        
        const html = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title" id="modalTitleCiudad">
                        <i class="fas ${iconoTitulo}"></i> ${titulo} - Vista Ampliada
                    </div>
                    <div class="modal-actions">
                        <button class="download-btn-small secondary" onclick="window.CiudadSystem.descargarPNGModal()">
                            <i class="fas fa-image"></i> PNG
                        </button>
                        <button class="download-btn-small" onclick="window.CiudadSystem.descargarExcelModal()">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <span class="close" onclick="window.CiudadSystem.cerrarModal()">&times;</span>
                    </div>
                </div>

                <!-- FILTROS DENTRO DEL MODAL -->
                ${crearHTMLFiltrosModal(tipo)}

                <div class="modal-chart-container">
                    <canvas id="chartAmpliadoCiudad"></canvas>
                </div>

                <div class="data-table">
                    <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-table"></i> Datos Detallados
                    </h4>
                    <table class="table" id="tablaDatosCiudad">
                        <thead>
                            <tr>
                                <th>${tipo === 'ciudad' ? 'Ciudad' : 'Período'}</th>
                                <th>${tipo === 'ciudad' ? 'Descripción' : 'Fecha'}</th>
                                <th>Total Visitantes</th>
                                <th>Porcentaje</th>
                                ${tipo !== 'ciudad' ? '<th>Ciudades</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="tbodyDatosCiudad">
                            <!-- Los datos se llenarán dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        modal.innerHTML = html;
        
        // Establecer valor inicial del tipo de gráfica
        const selectTipoGrafica = document.getElementById('modalTipoGrafica');
        if (selectTipoGrafica && selectTipoGrafica.tagName === 'SELECT') {
            selectTipoGrafica.value = tipoGrafica || 'bar';
        }
        
        // Establecer fechas por defecto si es tipo tiempo
        if (tipo !== 'ciudad') {
            const ahora = new Date();
            const haceUnMes = new Date();
            haceUnMes.setMonth(ahora.getMonth() - 1);
            
            const fechaInicio = document.getElementById('modalFechaInicio');
            const fechaFin = document.getElementById('modalFechaFin');
            
            if (fechaInicio && fechaFin) {
                fechaInicio.value = haceUnMes.toISOString().split('T')[0];
                fechaFin.value = ahora.toISOString().split('T')[0];
            }
        }
    }

// Función para determinar el tipo actual del modal
    function determinarTipoActualModal() {
        const titulo = document.getElementById('modalTitleCiudad')?.textContent || '';
        if (titulo.includes('Ciudad') && !titulo.includes('Fecha') && !titulo.includes('Mes') && !titulo.includes('Año')) {
            return 'ciudad';
        }
        if (titulo.includes('Fecha')) return 'fecha';
        if (titulo.includes('Mes')) return 'mes';
        if (titulo.includes('Año')) return 'anio';
        return 'ciudad';
    }

// =============================================
    // MODAL PARA DETALLE COMPLETO - CON BARRAS
    // =============================================

    function abrirModalTiempoDetalle(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        const titulo = getTituloTiempo(tipo);
        
        // Crear modal
        const modalHTML = `
            <div class="modal-overlay" id="modal-tiempo-detalle" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000; padding: 20px;">
                <div style="background: white; border-radius: 12px; width: 90%; max-width: 1400px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-chart-bar"></i> ${titulo} - Vista Detallada
                        </h2>
                        <button onclick="document.getElementById('modal-tiempo-detalle').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div style="display: flex; height: calc(90vh - 140px);">
                        <!-- Panel izquierdo: Gráfico de BARRAS -->
                        <div style="flex: 3; padding: 20px; border-right: 1px solid #eee; display: flex; flex-direction: column;">
                            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">
                                <i class="fas fa-chart-bar"></i> Distribución Temporal por Ciudad
                            </h3>
                            <div style="flex: 1; position: relative;">
                                <canvas id="chartModalDetalle"></canvas>
                            </div>
                        </div>
                        
                        <!-- Panel derecho: Datos -->
                        <div style="flex: 2; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;">
                            <div>
                                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
                                    <i class="fas fa-info-circle"></i> Estadísticas Generales
                                </h3>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                    <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px; border: 1px solid #dee2e6;">
                                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Total Visitantes</div>
                                        <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${datos.total}</div>
                                    </div>
                                    <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px; border: 1px solid #dee2e6;">
                                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Total Ciudades</div>
                                        <div style="font-size: 28px; font-weight: bold; color: #3498db;">${datos.ciudades.length}</div>
                                    </div>
                                    <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px; border: 1px solid #dee2e6; grid-column: span 2;">
                                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Períodos Analizados</div>
                                        <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${datos.labels.length}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
                                    <i class="fas fa-city"></i> Ciudades Principales
                                </h3>
                                <div id="lista-ciudades-modal" style="max-height: 200px; overflow-y: auto;">
                                    <!-- Se llenará dinámicamente -->
                                </div>
                            </div>
                            
                            <div>
                                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
                                    <i class="fas fa-download"></i> Exportar Datos
                                </h3>
                                <div style="display: flex; gap: 10px;">
                                    <button onclick="window.CiudadSystem.exportarExcelModal('${tipo}')" style="flex: 1; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        <i class="fas fa-file-excel"></i> Excel
                                    </button>
                                    <button onclick="window.CiudadSystem.exportarPDFModal('${tipo}')" style="flex: 1; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        <i class="fas fa-file-pdf"></i> PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee;">
                        <button onclick="document.getElementById('modal-tiempo-detalle').remove()" style="background: #95a5a6; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;">
                            Cerrar
                        </button>
                        <button onclick="window.CiudadSystem.descargarGraficoModal()" style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-download"></i> Descargar Gráfico
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar modal al DOM
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv.firstElementChild);
        
        // Inicializar gráfico y datos del modal
        inicializarGraficoModal(tipo);
        llenarListaCiudadesModal(tipo);
    }

// Función para abrir modal de ciudad CON FILTROS DENTRO
    function abrirModalCiudad(tipoGrafica) {
        const modal = document.getElementById("chartModalCiudad");
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
        actualizarContenidoModal('ciudad', tipoGrafica);
        
        // Crear gráfica ampliada
        setTimeout(() => {
            crearGraficaAmpliadaCiudad(tipoGrafica);
            llenarTablaModalCiudad();
        }, 100);
    }

// Llenar tabla del modal de ciudad
    function llenarTablaModalCiudad() {
        const tbody = document.getElementById("tbodyDatosCiudad");
        if (!tbody) return;

        const { labels, values, total } = datosCiudades.general;

        tbody.innerHTML = labels.map((ciudad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const descripcion = obtenerDescripcionCiudad(ciudad);
            
            return `
                <tr>
                    <td><strong>${ciudad}</strong></td>
                    <td>${descripcion}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; color: #e74c3c; font-weight: bold">${porcentaje}%</td>
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

// Llenar tabla del modal de tiempo con datos filtrados
    function llenarTablaModalCiudadTiempoConDatos(tipo, datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosCiudad");
        if (!tbody) return;

        // Verificar si tenemos datos
        if (!datosFiltrados || !datosFiltrados.datasets || datosFiltrados.datasets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">
                        <i class="fas fa-exclamation-circle"></i> No hay datos disponibles con los filtros
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        const totalGeneral = datosFiltrados.total || 0;
        
        // Si solo hay una ciudad, mostrar formato simple
        if (datosFiltrados.ciudades.length === 1) {
            const ciudad = datosFiltrados.ciudades[0];
            const dataset = datosFiltrados.datasets[0];
            
            html += `
                <tr style="background: #f8f9fa; font-weight: bold;">
                    <th>Fecha/Período</th>
                    <th>Fecha Formato</th>
                    <th>${ciudad}</th>
                    <th>Porcentaje</th>
                </tr>
            `;
            
            datosFiltrados.labels.forEach((fecha, fechaIndex) => {
                const valor = dataset.data[fechaIndex] || 0;
                const porcentaje = totalGeneral > 0 ? ((valor / totalGeneral) * 100).toFixed(1) : 0;
                
                html += `
                    <tr>
                        <td><strong>${fecha}</strong></td>
                        <td>${formatearFecha(fecha, tipo)}</td>
                        <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                        <td style="text-align: center; color: #e74c3c; font-weight: bold">${porcentaje}%</td>
                    </tr>
                `;
            });
            
            const totalCiudad = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
            
            html += `
                <tr style="background: #f0f7ff; font-weight: bold;">
                    <td colspan="2"><strong>TOTAL ${ciudad}</strong></td>
                    <td style="text-align: center; background: #e74c3c; color: white;">${totalCiudad.toLocaleString()}</td>
                    <td style="text-align: center; background: #e74c3c; color: white;">100%</td>
                </tr>
            `;
        } else {
            // Formato para múltiples ciudades
            html += `
                <tr style="background: #f8f9fa; font-weight: bold;">
                    <th>Fecha/Período</th>
                    <th>Fecha Formato</th>
                    ${datosFiltrados.ciudades.map(ciudad => `<th>${ciudad}</th>`).join('')}
                    <th>Total</th>
                </tr>
            `;
            
            datosFiltrados.labels.forEach((fecha, fechaIndex) => {
                const totalPorFecha = datosFiltrados.datasets.reduce((sum, dataset) => 
                    sum + (dataset.data[fechaIndex] || 0), 0);
                
                html += `
                    <tr>
                        <td><strong>${fecha}</strong></td>
                        <td>${formatearFecha(fecha, tipo)}</td>
                        ${datosFiltrados.datasets.map(dataset => 
                            `<td style="text-align: center; font-weight: ${dataset.data[fechaIndex] > 0 ? 'bold' : 'normal'}">
                                ${(dataset.data[fechaIndex] || 0).toLocaleString()}
                            </td>`
                        ).join('')}
                        <td style="text-align: center; background: #ffeaa7; font-weight: bold;">
                            ${totalPorFecha.toLocaleString()}
                        </td>
                    </tr>
                `;
            });
            
            // Fila de totales
            html += `
                <tr style="background: #f0f7ff; font-weight: bold;">
                    <td colspan="2"><strong>Total por Ciudad</strong></td>
                    ${datosFiltrados.datasets.map(dataset => {
                        const totalCiudad = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                        return `<td style="text-align: center; color: #e74c3c;">${totalCiudad.toLocaleString()}</td>`;
                    }).join('')}
                    <td style="text-align: center; background: #e74c3c; color: white;">
                        ${totalGeneral.toLocaleString()}
                    </td>
                </tr>
            `;
        }
        
        tbody.innerHTML = html;
    }

// Llenar tabla del modal de tiempo
    function llenarTablaModalCiudadTiempo(tipo) {
        const tbody = document.getElementById("tbodyDatosCiudad");
        if (!tbody) return;

        const datos = getDatosCiudadTiempo(tipo);
        
        // Verificar si tenemos datos
        if (!datos || !datos.datasets || datos.datasets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">
                        <i class="fas fa-exclamation-circle"></i> No hay datos disponibles
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        const totalGeneral = datos.total || 0;
        
        // Encabezado para formato de barras agrupadas
        html += `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <th>Fecha/Período</th>
                <th>Fecha Formato</th>
                ${datos.ciudades.slice(0, 5).map(ciudad => `<th>${ciudad}</th>`).join('')}
                ${datos.ciudades.length > 5 ? '<th>Otras</th>' : ''}
                <th>Total</th>
            </tr>
        `;
        
        // Filas de datos para cada fecha
        datos.labels.forEach((fecha, fechaIndex) => {
            const totalPorFecha = datos.datasets.reduce((sum, dataset) => 
                sum + (dataset.data[fechaIndex] || 0), 0);
            
            // Calcular total de "otras" ciudades (más allá de las 5 principales)
            let otrasTotal = 0;
            if (datos.ciudades.length > 5) {
                otrasTotal = datos.datasets.slice(5).reduce((sum, dataset) => 
                    sum + (dataset.data[fechaIndex] || 0), 0);
            }
            
            html += `
                <tr>
                    <td><strong>${fecha}</strong></td>
                    <td>${formatearFecha(fecha, tipo)}</td>
                    ${datos.datasets.slice(0, 5).map(dataset => 
                        `<td style="text-align: center; font-weight: ${dataset.data[fechaIndex] > 0 ? 'bold' : 'normal'}">
                            ${(dataset.data[fechaIndex] || 0).toLocaleString()}
                        </td>`
                    ).join('')}
                    ${datos.ciudades.length > 5 ? 
                        `<td style="text-align: center; color: #7f8c8d; font-weight: ${otrasTotal > 0 ? 'bold' : 'normal'}">
                            ${otrasTotal.toLocaleString()}
                        </td>` : ''}
                    <td style="text-align: center; background: #ffeaa7; font-weight: bold;">
                        ${totalPorFecha.toLocaleString()}
                    </td>
                </tr>
            `;
        });
        
        // Fila de totales
        html += `
            <tr style="background: #f0f7ff; font-weight: bold;">
                <td colspan="2"><strong>Total por Ciudad</strong></td>
                ${datos.datasets.slice(0, 5).map(dataset => {
                    const totalCiudad = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                    return `<td style="text-align: center; color: #e74c3c;">${totalCiudad.toLocaleString()}</td>`;
                }).join('')}
                ${datos.ciudades.length > 5 ? 
                    `<td style="text-align: center; color: #7f8c8d;">
                        ${datos.datasets.slice(5).reduce((sum, dataset) => 
                            sum + dataset.data.reduce((s, v) => s + (v || 0), 0), 0).toLocaleString()}
                    </td>` : ''}
                <td style="text-align: center; background: #e74c3c; color: white;">
                    ${totalGeneral.toLocaleString()}
                </td>
            </tr>
        `;
        
        tbody.innerHTML = html;
    }

// Llenar tabla del modal de ciudad con datos filtrados
    function llenarTablaModalCiudadConDatos(datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosCiudad");
        if (!tbody) return;

        tbody.innerHTML = datosFiltrados.labels.map((ciudad, index) => {
            const cantidad = datosFiltrados.values[index];
            const porcentaje = datosFiltrados.total > 0 ? ((cantidad / datosFiltrados.total) * 100).toFixed(1) : 0;
            const descripcion = obtenerDescripcionCiudad(ciudad);
            
            return `
                <tr>
                    <td><strong>${ciudad}</strong></td>
                    <td>${descripcion}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; color: #e74c3c; font-weight: bold">${porcentaje}%</td>
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

// Función para abrir modal de tiempo CON FILTROS DENTRO
    function abrirModalCiudadTiempo(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalCiudad");
        if (!modal) {
            console.error('Modal no encontrado');
            return;
        }
        
        // DEBUG
        console.log('🎯 Abriendo modal para tipo:', tipo, 'con gráfica:', tipoGrafica);
        
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
            console.log('⏰ Creando gráfica para modal...');
            const datosActuales = getDatosCiudadTiempo(tipo);
            crearGraficaAmpliadaCiudadTiempo(tipo, tipoGrafica, datosActuales);
            llenarTablaModalCiudadTiempo(tipo);
        }, 200);
    }

function llenarListaCiudadesModal(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        const container = document.getElementById('lista-ciudades-modal');
        
        if (!container) return;
        
        // Calcular totales por ciudad
        const ciudadesConTotal = datos.ciudades.map(ciudad => {
            const dataset = datos.datasets.find(d => d.label === ciudad);
            const total = dataset ? dataset.data.reduce((a, b) => a + b, 0) : 0;
            return { ciudad, total };
        });
        
        // Ordenar de mayor a menor y tomar las 10 principales
        ciudadesConTotal.sort((a, b) => b.total - a.total);
        const ciudadesPrincipales = ciudadesConTotal.slice(0, 10);
        
        container.innerHTML = ciudadesPrincipales.map(item => {
            const porcentaje = datos.total > 0 ? ((item.total / datos.total) * 100).toFixed(1) : 0;
            const color = obtenerColorParaCiudad(item.ciudad);
            
            // Calcular progreso para barra
            const maxTotal = ciudadesPrincipales[0].total;
            const porcentajeBarra = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
            
            return `
                <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
                            <span style="font-weight: 600; font-size: 14px;">${item.ciudad}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; font-size: 14px;">${item.total}</div>
                            <div style="font-size: 12px; color: #27ae60;">${porcentaje}%</div>
                        </div>
                    </div>
                    <div style="height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${porcentajeBarra}%; background: ${color}; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
