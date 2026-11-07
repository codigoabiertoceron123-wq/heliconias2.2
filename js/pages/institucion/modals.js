// InstitucionSystem - modals
// Refactor modular: lógica original preservada.

// Función para abrir modal de institución CON FILTROS DENTRO
    function abrirModalInstitucion(tipoGrafica) {
        const modal = document.getElementById("chartModalInstitucion");
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
        actualizarContenidoModal('institucion', tipoGrafica);
        
        // Crear gráfica ampliada
        setTimeout(() => {
            crearGraficaAmpliadaInstitucion(tipoGrafica);
            llenarTablaModalInstitucion();
        }, 100);
    }

// Función para abrir modal de tiempo CON FILTROS DENTRO
    function abrirModalTiempo(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalInstitucion");
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
        actualizarContenidoModal(tipo, tipoGrafica);
        
        // Crear gráfica ampliada
        setTimeout(() => {
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
            llenarTablaModalTiempo(tipo);
        }, 100);
    }

// Función para actualizar contenido del modal con filtros
    function actualizarContenidoModal(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalInstitucion");
        if (!modal) return;
        
        // Crear contenido completo del modal
        const titulo = tipo === 'institucion' ? 'Distribución por Institución' : getTituloTiempo(tipo);
        const iconoTitulo = tipo === 'institucion' ? 'fa-school' : 
                           tipo === 'fecha' ? 'fa-calendar-day' : 
                           tipo === 'mes' ? 'fa-calendar-week' : 'fa-calendar-alt';
        
        const html = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title" id="modalTitleInstitucion">
                        <i class="fas ${iconoTitulo}"></i> ${titulo} - Vista Ampliada
                    </div>
                    <div class="modal-actions">
                        <button class="download-btn-small secondary" onclick="window.InstitucionManager.descargarPNG()">
                            <i class="fas fa-image"></i> PNG
                        </button>
                        <button class="download-btn-small" onclick="window.InstitucionManager.descargarExcelModal()">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <span class="close" onclick="window.InstitucionManager.cerrarModal()">&times;</span>
                    </div>
                </div>

                <!-- FILTROS DENTRO DEL MODAL -->
                ${crearHTMLFiltrosModal(tipo)}

                <div class="modal-chart-container">
                    <canvas id="chartAmpliadoInstitucion"></canvas>
                </div>

                <div class="data-table">
                    <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-table"></i> Datos Detallados
                    </h4>
                    <table class="table" id="tablaDatosInstitucion">
                        <thead>
                            <tr>
                                <th>${tipo === 'institucion' ? 'Institución' : 'Período'}</th>
                                <th>${tipo === 'institucion' ? 'Tipo' : 'Descripción'}</th>
                                <th>Total Visitantes</th>
                                <th>Porcentaje</th>
                                ${tipo !== 'institucion' ? '<th>Tendencia</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="tbodyDatosInstitucion">
                            <!-- Los datos se llenarán dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        modal.innerHTML = html;
        
        // Establecer valor inicial del tipo de gráfica
        const selectTipoGrafica = document.getElementById('modalTipoGrafica');
        if (selectTipoGrafica) {
            selectTipoGrafica.value = tipoGrafica || 'bar';
        }

        // En la función actualizarContenidoModal, agrega este evento:
        document.getElementById('modalTipoGrafica').addEventListener('change', function(e) {
            const tipoGrafica = e.target.value;
            cambiarTipoGraficaModal(tipoGrafica);
        });
    }

// Función para llenar tabla con datos filtrados de institución
    function llenarTablaModalInstitucionConDatos(datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosInstitucion");
        if (!tbody) return;

        tbody.innerHTML = datosFiltrados.labels.map((institucion, index) => {
            const cantidad = datosFiltrados.values[index];
            const porcentaje = datosFiltrados.total > 0 ? ((cantidad / datosFiltrados.total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoInstitucion(institucion);
            
            return `
                <tr>
                    <td><strong>${institucion}</strong></td>
                    <td>${tipo}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
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

// Función para llenar tabla con datos filtrados de tiempo - VERSIÓN SEGURA
    function llenarTablaModalTiempoConDatos(tipo, datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosInstitucion");
        if (!tbody) return;

        // Verificar que tenemos datos válidos
        if (!datosFiltrados || (!datosFiltrados.labels && !datosFiltrados.datasets)) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">
                        <i class="fas fa-exclamation-circle"></i> No hay datos disponibles con los filtros aplicados
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        
        // Verificar si tenemos datos en formato de barras agrupadas (con datasets)
        if (datosFiltrados.datasets && datosFiltrados.datasets.length > 0) {
            // FORMATO NUEVO: Barras agrupadas
            // Encabezado para formato de barras agrupadas
            html += `
                <tr style="background: #f8f9fa; font-weight: bold;">
                    <th>Fecha/Período</th>
                    ${datosFiltrados.instituciones.map(inst => `<th>${inst}</th>`).join('')}
                    <th>Total por Fecha</th>
                </tr>
            `;
            
            // Filas de datos para cada fecha
            (datosFiltrados.labels || []).forEach((fecha, fechaIndex) => {
                const totalPorFecha = datosFiltrados.datasets.reduce((sum, dataset) => 
                    sum + (dataset.data[fechaIndex] || 0), 0);
                
                html += `
                    <tr>
                        <td><strong>${fecha}</strong></td>
                        ${datosFiltrados.datasets.map(dataset => 
                            `<td style="text-align: center; font-weight: ${dataset.data[fechaIndex] > 0 ? 'bold' : 'normal'}">
                                ${(dataset.data[fechaIndex] || 0).toLocaleString()}
                            </td>`
                        ).join('')}
                        <td style="text-align: center; background: #e8f5e9; font-weight: bold;">
                            ${totalPorFecha.toLocaleString()}
                        </td>
                    </tr>
                `;
            });
            
            // Fila de totales por institución
            html += `
                <tr style="background: #f0f7ff; font-weight: bold;">
                    <td><strong>Total por Institución</strong></td>
                    ${datosFiltrados.datasets.map(dataset => {
                        const totalInstitucion = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                        return `<td style="text-align: center; color: #2e7d32;">${totalInstitucion.toLocaleString()}</td>`;
                    }).join('')}
                    <td style="text-align: center; background: #2e7d32; color: white;">
                        ${datosFiltrados.datasets.reduce((total, dataset) => 
                            total + dataset.data.reduce((sum, val) => sum + (val || 0), 0), 0
                        ).toLocaleString()}
                    </td>
                </tr>
            `;
        } else if (datosFiltrados.values && datosFiltrados.values.length > 0) {
            // FORMATO ANTIGUO: Una sola serie de datos
            const total = datosFiltrados.values.reduce((a, b) => a + b, 0);
            
            (datosFiltrados.labels || []).forEach((label, index) => {
                const valor = datosFiltrados.values[index] || 0;
                const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
                
                // Calcular tendencia
                let tendencia = '';
                if (index > 0) {
                    const valorAnterior = datosFiltrados.values[index - 1] || 0;
                    const diferencia = valor - valorAnterior;
                    const porcentajeCambio = valorAnterior > 0 ? ((diferencia / valorAnterior) * 100).toFixed(1) : 100;
                    
                    if (diferencia > 0) {
                        tendencia = `<span style="color: #27ae60;"><i class="fas fa-arrow-up"></i> ${porcentajeCambio}%</span>`;
                    } else if (diferencia < 0) {
                        tendencia = `<span style="color: #e74c3c;"><i class="fas fa-arrow-down"></i> ${Math.abs(porcentajeCambio)}%</span>`;
                    } else {
                        tendencia = `<span style="color: #f39c12;"><i class="fas fa-minus"></i> 0%</span>`;
                    }
                } else {
                    tendencia = '<span style="color: #95a5a6;">-</span>';
                }
                
                html += `
                    <tr>
                        <td><strong>${label}</strong></td>
                        <td>${getDescripcionTiempo(tipo, label)}</td>
                        <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                        <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                        <td style="text-align: center;">${tendencia}</td>
                    </tr>
                `;
            });
            
            // Total general
            html += `
                <tr style="background: #f8f9fa; font-weight: bold;">
                    <td colspan="2">TOTAL GENERAL</td>
                    <td style="text-align: center">${total.toLocaleString()}</td>
                    <td style="text-align: center">100%</td>
                    <td style="text-align: center;">-</td>
                </tr>
            `;
        } else {
            // Sin datos
            html = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">
                        <i class="fas fa-exclamation-circle"></i> No hay datos disponibles con los filtros aplicados
                    </td>
                </tr>
            `;
        }
        
        tbody.innerHTML = html;
    }

// Función para cerrar modal
    function cerrarModalInstitucion() {
        const modal = document.getElementById("chartModalInstitucion");
        if (modal) {
            modal.classList.remove("show");
        }
    }

// Llenar tabla del modal de institución
    function llenarTablaModalInstitucion() {
        const tbody = document.getElementById("tbodyDatosInstitucion");
        if (!tbody) return;

        const { labels, values, total } = datosInstituciones;

        tbody.innerHTML = labels.map((institucion, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoInstitucion(institucion);
            
            return `
                <tr>
                    <td><strong>${institucion}</strong></td>
                    <td>${tipo}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
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

// Llenar tabla del modal de tiempo
    // Llenar tabla del modal de tiempo CON DATOS AGRUPADOS
    function llenarTablaModalTiempo(tipo) {
        const tbody = document.getElementById("tbodyDatosInstitucion");
        if (!tbody) return;

        const datos = getDatosTiempo(tipo);
        
        let html = '';
        
        // Encabezado
        html += `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <th>Fecha/Período</th>
                ${datos.instituciones.map(inst => `<th>${inst}</th>`).join('')}
                <th>Total por Fecha</th>
            </tr>
        `;
        
        // Filas de datos
        datos.labels.forEach((fecha, fechaIndex) => {
            const totalPorFecha = datos.datasets.reduce((sum, dataset) => sum + dataset.data[fechaIndex], 0);
            
            html += `
                <tr>
                    <td><strong>${fecha}</strong></td>
                    ${datos.datasets.map(dataset => 
                        `<td style="text-align: center; font-weight: ${dataset.data[fechaIndex] > 0 ? 'bold' : 'normal'}">
                            ${dataset.data[fechaIndex].toLocaleString()}
                        </td>`
                    ).join('')}
                    <td style="text-align: center; background: #e8f5e9; font-weight: bold;">
                        ${totalPorFecha.toLocaleString()}
                    </td>
                </tr>
            `;
        });
        
        // Fila de totales por institución
        html += `
            <tr style="background: #f0f7ff; font-weight: bold;">
                <td><strong>Total por Institución</strong></td>
                ${datos.datasets.map(dataset => {
                    const totalInstitucion = dataset.data.reduce((sum, val) => sum + val, 0);
                    return `<td style="text-align: center; color: #2e7d32;">${totalInstitucion.toLocaleString()}</td>`;
                }).join('')}
                <td style="text-align: center; background: #2e7d32; color: white;">
                    ${datos.datasets.reduce((total, dataset) => 
                        total + dataset.data.reduce((sum, val) => sum + val, 0), 0
                    ).toLocaleString()}
                </td>
            </tr>
        `;
        
        tbody.innerHTML = html;
    }
