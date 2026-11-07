// NacionalidadSystem - modals
// Refactor modular: lógica original preservada.

// Función para obtener datos actuales según el contexto
    function obtenerDatosActualesParaModal(tipo) {
        // Si hay datos filtrados activos, usarlos
        if (datosFiltradosTiempoActual && determinarTipoActual() === tipo) {
            return datosFiltradosTiempoActual;
        }
        // SINO, datos originales
        return getDatosTiempo(tipo);
    }

// Función para abrir modal de nacionalidad CON FILTROS DENTRO
    function abrirModalNacionalidad(tipoGrafica) {
        const modal = document.getElementById("chartModalNacionalidad");
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
        actualizarContenidoModal('nacionalidad', tipoGrafica);
        
        // Crear gráfica ampliada
        setTimeout(() => {
            crearGraficaAmpliadaNacionalidad(tipoGrafica);
            llenarTablaModalNacionalidad();
        }, 100);
    }

// Función para abrir modal de tiempo CON FILTROS DENTRO
    function abrirModalTiempo(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalNacionalidad");
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
        
        // Crear gráfica ampliada - CON RETRASO para asegurar que el canvas existe
        setTimeout(() => {
            console.log('⏰ Creando gráfica para modal...');
            // ✅ Obtener datos actuales según el tipo
            const datosActuales = getDatosTiempo(tipo);
            crearGraficaAmpliadaTiempo(tipo, tipoGrafica, datosActuales);
            llenarTablaModalTiempo(tipo);
        }, 200); // Aumenta el tiempo si es necesario
    }

// Función para actualizar contenido del modal con filtros
    function actualizarContenidoModal(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalNacionalidad");
        if (!modal) return;
        
        // Crear contenido completo del modal
        const titulo = tipo === 'nacionalidad' ? 'Distribución por Nacionalidad' : getTituloTiempo(tipo);
        const iconoTitulo = tipo === 'nacionalidad' ? 'fa-globe-americas' : 
                           tipo === 'fecha' ? 'fa-calendar-day' : 
                           tipo === 'mes' ? 'fa-calendar-week' : 'fa-calendar-alt';
        
        const html = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title" id="modalTitleNacionalidad">
                        <i class="fas ${iconoTitulo}"></i> ${titulo} - Vista Ampliada
                    </div>
                    <div class="modal-actions">
                        <button class="download-btn-small secondary" onclick="window.NacionalidadManager.descargarPNG()">
                            <i class="fas fa-image"></i> PNG
                        </button>
                        <button class="download-btn-small" onclick="window.NacionalidadManager.descargarExcelModal()">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <span class="close" onclick="window.NacionalidadManager.cerrarModal()">&times;</span>
                    </div>
                </div>

                <!-- FILTROS DENTRO DEL MODAL -->
                ${crearHTMLFiltrosModal(tipo)}

                <div class="modal-chart-container">
                    <canvas id="chartAmpliadoNacionalidad"></canvas>
                </div>

                <div class="data-table">
                    <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-table"></i> Datos Detallados
                    </h4>
                    <table class="table" id="tablaDatosNacionalidad">
                        <thead>
                            <tr>
                                <th>${tipo === 'nacionalidad' ? 'Nacionalidad' : 'Período'}</th>
                                <th>${tipo === 'nacionalidad' ? 'Tipo' : 'Descripción'}</th>
                                <th>Total Visitantes</th>
                                <th>Porcentaje</th>
                                ${tipo !== 'nacionalidad' ? '<th>Tendencia</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="tbodyDatosNacionalidad">
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
    }

// Función para llenar tabla con datos filtrados de nacionalidad
    function llenarTablaModalNacionalidadConDatos(datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosNacionalidad");
        if (!tbody) return;

        tbody.innerHTML = datosFiltrados.labels.map((nacionalidad, index) => {
            const cantidad = datosFiltrados.values[index];
            const porcentaje = datosFiltrados.total > 0 ? ((cantidad / datosFiltrados.total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoNacionalidad(nacionalidad);
            const icono = nacionalidad === 'Colombia' ? 'fa-flag' : 'fa-globe-americas';
            
            return `
                <tr>
                    <td><span><i class="fas ${icono}"></i> <strong>${nacionalidad}</strong></span></td>
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

// Función para llenar tabla con datos filtrados de tiempo
    function llenarTablaModalTiempoConDatos(tipo, datosFiltrados) {
        const tbody = document.getElementById("tbodyDatosNacionalidad");
        if (!tbody) return;

        // Verificar si tenemos datos en el nuevo formato
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
        
        // Encabezado para formato de barras agrupadas
        html += `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <th>Fecha/Período</th>
                ${datosFiltrados.paises.map(pais => `<th>${pais}</th>`).join('')}
                <th>Total por Fecha</th>
            </tr>
        `;
        
        // Filas de datos para cada fecha
        datosFiltrados.labels.forEach((fecha, fechaIndex) => {
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
        
        // Fila de totales por país
        html += `
            <tr style="background: #f0f7ff; font-weight: bold;">
                <td><strong>Total por País</strong></td>
                ${datosFiltrados.datasets.map(dataset => {
                    const totalPais = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                    return `<td style="text-align: center; color: #2e7d32;">${totalPais.toLocaleString()}</td>`;
                }).join('')}
                <td style="text-align: center; background: #2e7d32; color: white;">
                    ${datosFiltrados.datasets.reduce((total, dataset) => 
                        total + dataset.data.reduce((sum, val) => sum + (val || 0), 0), 0
                    ).toLocaleString()}
                </td>
            </tr>
        `;
        
        tbody.innerHTML = html;
    }

// Función para cerrar modal
    function cerrarModalNacionalidad() {
        const modal = document.getElementById("chartModalNacionalidad");
        if (modal) {
            modal.classList.remove("show");
        }
    }

// Llenar tabla del modal de nacionalidad
    function llenarTablaModalNacionalidad() {
        const tbody = document.getElementById("tbodyDatosNacionalidad");
        if (!tbody) return;

        const { labels, values, total } = datosNacionalidades;

        tbody.innerHTML = labels.map((nacionalidad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoNacionalidad(nacionalidad);
            const icono = nacionalidad === 'Colombia' ? 'fa-flag' : 'fa-globe-americas';
            
            return `
                <tr>
                    <td><span><i class="fas ${icono}"></i> <strong>${nacionalidad}</strong></span></td>
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
    function llenarTablaModalTiempo(tipo) {
        const tbody = document.getElementById("tbodyDatosNacionalidad");
        if (!tbody) return;

        const datos = getDatosTiempo(tipo);
        
        // Verificar si tenemos datos en el nuevo formato
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
                ${datos.paises.map(pais => `<th>${pais}</th>`).join('')}
                <th>Total por Fecha</th>
            </tr>
        `;
        
        // Filas de datos para cada fecha
        datos.labels.forEach((fecha, fechaIndex) => {
            const totalPorFecha = datos.datasets.reduce((sum, dataset) => 
                sum + (dataset.data[fechaIndex] || 0), 0);
            
            html += `
                <tr>
                    <td><strong>${fecha}</strong></td>
                    ${datos.datasets.map(dataset => 
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
        
        // Fila de totales por país
        html += `
            <tr style="background: #f0f7ff; font-weight: bold;">
                <td><strong>Total por País</strong></td>
                ${datos.datasets.map(dataset => {
                    const totalPais = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                    return `<td style="text-align: center; color: #2e7d32;">${totalPais.toLocaleString()}</td>`;
                }).join('')}
                <td style="text-align: center; background: #2e7d32; color: white;">
                    ${datos.datasets.reduce((total, dataset) => 
                        total + dataset.data.reduce((sum, val) => sum + (val || 0), 0), 0
                    ).toLocaleString()}
                </td>
            </tr>
        `;
        
        tbody.innerHTML = html;
    }
