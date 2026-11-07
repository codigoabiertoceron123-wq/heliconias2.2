// EdadSystem - modals
// Refactor modular: lógica original preservada.

function llenarTablaModalTiempo(tipo) {
        const tbody = document.getElementById("tbodyDatosEdad");
        if (!tbody) return;

        // Obtener datos AGRUPADOS según el tipo
        let datos;
        switch(tipo) {
            case 'fecha': datos = datosFechaAgrupados; break;
            case 'mes': datos = datosMesAgrupados; break;
            case 'anio': datos = datosAnioAgrupados; break;
            default: datos = { labels: [], datasets: [], total: 0 };
        }

        // Si no hay datasets, intentar con datos normales
        if (!datos.datasets || datos.datasets.length === 0) {
            console.warn(`⚠️ No hay datasets agrupados para ${tipo}, usando datos normales`);
            datos = getDatosTiempo(tipo);
        }

        // Calcular valores totales por fecha/mes/año
        let labels = datos.labels || [];
        let values = [];
        let total = 0;
        
        if (datos.datasets && datos.datasets.length > 0) {
            // Sumar todos los datasets
            values = labels.map((_, index) => {
                return datos.datasets.reduce((sum, dataset) => {
                    return sum + (dataset.data[index] || 0);
                }, 0);
            });
            total = datos.total || values.reduce((a, b) => a + b, 0);
        } else if (datos.values && datos.values.length > 0) {
            values = datos.values;
            total = datos.total || values.reduce((a, b) => a + b, 0);
        } else {
            values = labels.map(() => 0);
            total = 0;
        }

        tbody.innerHTML = labels.map((label, index) => {
            const valor = values[index] || 0;
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            
            // Calcular tendencia (solo si hay valores anteriores)
            let tendencia = '';
            if (index > 0) {
                const valorAnterior = values[index - 1] || 0;
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
            
            return `
                <tr>
                    <td><strong>${label}</strong></td>
                    <td>${getDescripcionTiempo(tipo, label)}</td>
                    <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                    <td style="text-align: center;">${tendencia}</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td style="text-align: center;">-</td>
            </tr>
        ` : '');
    }

function abrirModalEdad(tipoGrafica) {
        const modal = document.getElementById("chartModalEdad");
        if (!modal) {
            console.error('Modal no encontrado');
            return;
        }
        
        modal.classList.add("show");
        
        // Guardar tipo de gráfica
        const modalChartContainer = document.querySelector('.modal-chart-container');
        if (modalChartContainer) {
            modalChartContainer.setAttribute('data-tipo-grafica', tipoGrafica);
        }
        
        // Crear filtros
        crearFiltrosModalEdad();
        
        // Crear gráfica inicial
        crearGraficaAmpliadaEdad(tipoGrafica);
        llenarTablaModalEdad();
    }

function llenarTablaModalEdad() {
        const tbody = document.getElementById("tbodyDatosEdad");
        if (!tbody) return;

        const { labels, values } = datosSimuladosEdad.edad;
        const total = values.reduce((a, b) => a + b, 0);

        const descripciones = {
            '0-17': 'Niños y adolescentes',
            '18-25': 'Jóvenes adultos', 
            '26-35': 'Adultos jóvenes',
            '36-50': 'Adultos',
            '51-65': 'Adultos mayores',
            '66+': 'Tercera edad'
        };

        tbody.innerHTML = labels.map((grupo, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const descripcion = descripciones[grupo] || 'Grupo de edad';
            
            return `
                <tr>
                    <td>
                        <span class="age-badge" style="background: ${coloresPorEdad[grupo]}; color: white; padding: 4px 8px; border-radius: 12px;">
                            <i class="fas fa-user"></i> ${grupo} años
                        </span>
                    </td>
                    <td>${grupo}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                    <td style="color: #7f8c8d">${descripcion}</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td></td>
            </tr>
        ` : '');
    }

function cerrarModalEdad() {
        const modal = document.getElementById("chartModalEdad");
        if (modal) {
            modal.classList.remove("show");
        }
    }

function abrirModalTiempo(tipo, tipoGrafica) {
        const modal = document.getElementById("chartModalEdad");
        if (!modal) {
            console.error('Modal no encontrado');
            return;
        }
        
        modal.classList.add("show");
        
        // Guardar tipo de gráfica y datos
        const modalChartContainer = document.querySelector('.modal-chart-container');
        if (modalChartContainer) {
            modalChartContainer.setAttribute('data-tipo-grafica', tipoGrafica);
            modalChartContainer.setAttribute('data-tipo-datos', tipo);
        }
        
        // Crear filtros específicos para tiempo
        crearFiltrosModalTiempo(tipo);
        
        // Crear gráfica inicial CON LOS PARÁMETROS CORRECTOS
        console.log(`📊 Creando gráfica ampliada para ${tipo} - ${tipoGrafica}`);
        crearGraficaAmpliadaTiempo(tipo, tipoGrafica);
        llenarTablaModalTiempo(tipo);
    }

function actualizarTablaModalConDatosAgrupados(tipo, datosFiltrados, filtros) {
        const tbody = document.getElementById("tbodyDatosEdad");
        if (!tbody) return;

        // Calcular valores totales por fecha/mes/año
        let labels = datosFiltrados.labels || [];
        let values = [];
        let total = 0;
        
        if (datosFiltrados.datasets && datosFiltrados.datasets.length > 0) {
            // Sumar todos los datasets
            values = labels.map((_, index) => {
                return datosFiltrados.datasets.reduce((sum, dataset) => {
                    return sum + (dataset.data[index] || 0);
                }, 0);
            });
            total = datosFiltrados.total || values.reduce((a, b) => a + b, 0);
        } else if (datosFiltrados.values && datosFiltrados.values.length > 0) {
            values = datosFiltrados.values;
            total = datosFiltrados.total || values.reduce((a, b) => a + b, 0);
        } else {
            values = labels.map(() => 0);
            total = 0;
        }

        tbody.innerHTML = labels.map((label, index) => {
            const valor = values[index] || 0;
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            
            // Calcular tendencia (solo si hay valores anteriores)
            let tendencia = '';
            if (index > 0) {
                const valorAnterior = values[index - 1] || 0;
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
            
            return `
                <tr>
                    <td><strong>${label}</strong></td>
                    <td>${getDescripcionTiempo(tipo, label)}</td>
                    <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                    <td style="text-align: center; color: #2e7d32; font-weight: bold">${porcentaje}%</td>
                    <td style="text-align: center;">
                        <span style="color: #3498db;">
                            <i class="fas fa-filter"></i> Filtrado
                        </span>
                    </td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td style="text-align: center;">-</td>
            </tr>
        ` : '');
    }
