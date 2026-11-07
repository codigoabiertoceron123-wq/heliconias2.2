// CiudadSystem - index
// Refactor modular: lógica original preservada.

// =============================================
    // EXPOSICIÓN DE FUNCIONES GLOBALES - COMPLETO
    // =============================================

    if (!window.CiudadSystem) {
        window.CiudadSystem = {};
    }

// Funciones principales
    window.CiudadSystem.cargarDatos = cargarDatosCiudad;

window.CiudadSystem.cargarDatosCiudadTiempo = cargarDatosCiudadTiempo;

window.CiudadSystem.cambiarTipoReporte = function(tipo) {
        console.log('🔄 Cambiando a reporte:', tipo);
        
        // Actualizar botones activos
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const btn = document.querySelector(`.chart-btn[data-type="${tipo}"]`);
        if (btn) btn.classList.add('active');
        
        if (tipo === 'ciudad') {
            cargarDatosCiudad();
        } else {
            cargarDatosCiudadTiempo(tipo);
        }
    };

// Funciones de filtros y rangos
    window.CiudadSystem.aplicarRangoFechas = aplicarRangoFechas;

window.CiudadSystem.limpiarRangoFechas = function(tipo) {
        // Recargar datos originales
        cargarDatosCiudadTiempo(tipo);
        
        mostrarExito('Filtros limpiados - Mostrando todos los datos');
    };

// Funciones de ordenamiento de tabla
    window.CiudadSystem.ordenarTabla = function(tipo, orden) {
        const tbody = document.getElementById(`tabla-${tipo}-body`);
        if (!tbody) return;
        
        const filas = Array.from(tbody.querySelectorAll('tr'));
        if (filas.length === 0) return;
        
        filas.sort((a, b) => {
            if (orden === 'fecha') {
                const fechaA = a.getAttribute('data-fecha');
                const fechaB = b.getAttribute('data-fecha');
                
                if (tipo === 'fecha') {
                    return new Date(fechaA) - new Date(fechaB);
                } else if (tipo === 'mes') {
                    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const [mesA, añoA] = fechaA.split(' ');
                    const [mesB, añoB] = fechaB.split(' ');
                    
                    if (añoA !== añoB) {
                        return parseInt(añoA) - parseInt(añoB);
                    }
                    return meses.indexOf(mesA) - meses.indexOf(mesB);
                } else {
                    return parseInt(fechaA) - parseInt(fechaB);
                }
            } else {
                const totalA = parseInt(a.getAttribute('data-total') || 0);
                const totalB = parseInt(b.getAttribute('data-total') || 0);
                
                return orden === 'desc' ? totalB - totalA : totalA - totalB;
            }
        });
        
        // Reordenar filas
        filas.forEach(fila => tbody.appendChild(fila));
    };

// Funciones de filtrado de ciudades
    window.CiudadSystem.filtrarTablaCiudades = function(tipo, termino) {
        const container = document.getElementById(`lista-ciudades-${tipo}`);
        if (!container) return;
        
        const items = container.querySelectorAll('.ciudad-item');
        const terminoLower = termino.toLowerCase();
        
        items.forEach(item => {
            const ciudadElement = item.querySelector('span');
            if (ciudadElement) {
                const ciudad = ciudadElement.textContent.toLowerCase();
                if (ciudad.includes(terminoLower)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    };

// Funciones para mostrar detalles
    window.CiudadSystem.mostrarDetallePeriodo = function(tipo, periodo) {
        const datos = getDatosCiudadTiempo(tipo);
        
        if (!datos.conteo || !datos.conteo[periodo]) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: `No hay datos disponibles para ${periodo}`,
                confirmButtonText: 'OK'
            });
            return;
        }
        
        const ciudadesDetalle = Object.entries(datos.conteo[periodo])
            .map(([ciudad, valor]) => ({ ciudad, valor }))
            .sort((a, b) => b.valor - a.valor);
        
        const totalPeriodo = ciudadesDetalle.reduce((sum, ciudad) => sum + ciudad.valor, 0);
        
        let contenido = `<div style="max-height: 400px; overflow-y: auto;">`;
        contenido += `<div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px;">
            <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 5px;">${periodo}</div>
            <div style="display: flex; gap: 20px;">
                <div>
                    <div style="font-size: 12px; color: #7f8c8d;">Total visitantes</div>
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${totalPeriodo}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #7f8c8d;">Ciudades diferentes</div>
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${ciudadesDetalle.length}</div>
                </div>
            </div>
        </div>`;
        contenido += `<table style="width: 100%; border-collapse: collapse;">`;
        contenido += `<thead><tr style="background: #f8f9fa;"><th style="padding: 12px; text-align: left;">Ciudad</th><th style="padding: 12px; text-align: center;">Visitantes</th><th style="padding: 12px; text-align: center;">Porcentaje</th></tr></thead>`;
        contenido += `<tbody>`;
        
        ciudadesDetalle.forEach(ciudad => {
            const porcentaje = totalPeriodo > 0 ? ((ciudad.valor / totalPeriodo) * 100).toFixed(1) : 0;
            const color = obtenerColorParaCiudad(ciudad.ciudad);
            
            contenido += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                            <span style="font-weight: 600;">${ciudad.ciudad}</span>
                        </div>
                    </td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee; font-weight: bold;">${ciudad.valor}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">
                        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${porcentaje}%</span>
                    </td>
                </tr>
            `;
        });
        
        contenido += `</tbody></table></div>`;
        
        Swal.fire({
            title: `Detalle: ${periodo}`,
            html: contenido,
            width: 700,
            confirmButtonText: 'Cerrar',
            customClass: {
                container: 'swal-detalle-container'
            }
        });
    };

window.CiudadSystem.mostrarDetalleCiudad = function(tipo, ciudadNombre) {
        const datos = getDatosCiudadTiempo(tipo);
        const dataset = datos.datasets.find(d => d.label === ciudadNombre);
        
        if (!dataset) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: `No hay datos disponibles para ${ciudadNombre}`,
                confirmButtonText: 'OK'
            });
            return;
        }
        
        const totalCiudad = dataset.data.reduce((a, b) => a + b, 0);
        const color = obtenerColorParaCiudad(ciudadNombre);
        
        let contenido = `<div style="max-height: 400px; overflow-y: auto;">`;
        contenido += `<div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                <div style="width: 40px; height: 40px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fas fa-city"></i>
                </div>
                <div>
                    <div style="font-size: 20px; font-weight: bold; color: #2c3e50;">${ciudadNombre}</div>
                    <div style="font-size: 14px; color: #7f8c8d;">Distribución temporal</div>
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div>
                    <div style="font-size: 12px; color: #7f8c8d;">Total visitantes</div>
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${totalCiudad}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #7f8c8d;">Porcentaje total</div>
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${datos.total > 0 ? ((totalCiudad / datos.total) * 100).toFixed(1) : 0}%</div>
                </div>
            </div>
        </div>`;
        contenido += `<table style="width: 100%; border-collapse: collapse;">`;
        contenido += `<thead><tr style="background: #f8f9fa;"><th style="padding: 12px; text-align: left;">Período</th><th style="padding: 12px; text-align: center;">Visitantes</th><th style="padding: 12px; text-align: center;">Porcentaje</th></tr></thead>`;
        contenido += `<tbody>`;
        
        datos.labels.forEach((label, index) => {
            const valor = dataset.data[index] || 0;
            if (valor > 0) {
                const porcentaje = totalCiudad > 0 ? ((valor / totalCiudad) * 100).toFixed(1) : 0;
                
                contenido += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${label}</td>
                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee; font-weight: bold;">${valor}</td>
                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">
                            <span style="background: #f39c12; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${porcentaje}%</span>
                        </td>
                    </tr>
                `;
            }
        });
        
        contenido += `</tbody></table></div>`;
        
        Swal.fire({
            title: `Detalle: ${ciudadNombre}`,
            html: contenido,
            width: 700,
            confirmButtonText: 'Cerrar'
        });
    };

// Funciones modales
    window.CiudadSystem.abrirModal = function(tipoGrafica) {
        // Crear modal simple para gráficas principales
        const { labels, values, colors, total } = datosCiudades.general;
        
        let contenido = `<div style="max-width: 800px; margin: 0 auto;">`;
        contenido += `<div style="margin-bottom: 20px; text-align: center;">
            <h2 style="color: #2c3e50; margin-bottom: 10px;">
                <i class="fas fa-chart-bar"></i> Distribución por Ciudad
            </h2>
            <p style="color: #7f8c8d;">Total: ${total} visitantes</p>
        </div>`;
        
        // Crear canvas para gráfico
        contenido += `<div style="height: 400px; margin-bottom: 20px;">
            <canvas id="modalChartCanvas"></canvas>
        </div>`;
        
        // Tabla de datos
        contenido += `<div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left;">Ciudad</th>
                        <th style="padding: 12px; text-align: center;">Visitantes</th>
                        <th style="padding: 12px; text-align: center;">Porcentaje</th>
                    </tr>
                </thead>
                <tbody>`;
        
        labels.forEach((ciudad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const color = colors[index];
            
            contenido += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                            <span>${ciudad}</span>
                        </div>
                    </td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee; font-weight: bold;">${cantidad}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">
                        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${porcentaje}%</span>
                    </td>
                </tr>
            `;
        });
        
        contenido += `</tbody></table></div></div>`;
        
        Swal.fire({
            title: 'Distribución por Ciudad - Vista Ampliada',
            html: contenido,
            width: 900,
            showCloseButton: true,
            showConfirmButton: false,
            didOpen: () => {
                // Crear gráfico dentro del modal
                const ctx = document.getElementById('modalChartCanvas');
                if (ctx) {
                    new Chart(ctx, {
                        type: tipoGrafica === 'bar' ? 'bar' : 'doughnut',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Visitantes',
                                data: values,
                                backgroundColor: colors,
                                borderColor: tipoGrafica === 'bar' ? colors.map(c => darkenColor(c, 0.2)) : '#fff',
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: tipoGrafica === 'bar' ? 'top' : 'right'
                                }
                            }
                        }
                    });
                }
            }
        });
    };

window.CiudadSystem.abrirModalTiempoDetalle = abrirModalTiempoDetalle;

// Funciones de descarga
    window.CiudadSystem.descargarGraficoPrincipal = function() {
        if (chartInstances.bar) {
            const link = document.createElement("a");
            link.download = "grafica_ciudad_principal.png";
            link.href = chartInstances.bar.canvas.toDataURL("image/png");
            link.click();
        }
    };

window.CiudadSystem.descargarGraficoPrincipalTiempo = function(tipo) {
        if (chartInstances[tipo]) {
            const link = document.createElement("a");
            link.download = `grafica_ciudad_${tipo}.png`;
            link.href = chartInstances[tipo].canvas.toDataURL("image/png");
            link.click();
        }
    };

window.CiudadSystem.descargarGraficoModal = function() {
        if (chartInstances.ampliado) {
            const link = document.createElement("a");
            link.download = `grafica_detalle_${new Date().toISOString().split('T')[0]}.png`;
            link.href = chartInstances.ampliado.canvas.toDataURL("image/png");
            link.click();
        }
    };

window.CiudadSystem.descargarExcel = function() {
        const { labels, values } = datosCiudades.general;
        const total = values.reduce((a, b) => a + b, 0);
        
        const datosExcel = [
            ['Ciudad', 'Total Visitantes', 'Porcentaje'],
            ...labels.map((ciudad, i) => {
                const porcentaje = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
                return [ciudad, values[i], `${porcentaje}%`];
            }),
            ['TOTAL', total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos por Ciudad");
        XLSX.writeFile(wb, "reporte_ciudad.xlsx");
    };

// Funciones de exportación del modal
    window.CiudadSystem.exportarExcelModal = function(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        
        // Preparar datos para Excel
        const datosExcel = [
            ['Período', ...datos.ciudades, 'Total'],
            ...datos.labels.map((label, index) => {
                const fila = [label];
                let totalFila = 0;
                
                datos.ciudades.forEach(ciudad => {
                    const dataset = datos.datasets.find(d => d.label === ciudad);
                    const valor = dataset ? dataset.data[index] || 0 : 0;
                    fila.push(valor);
                    totalFila += valor;
                });
                
                fila.push(totalFila);
                return fila;
            }),
            ['TOTAL', ...datos.ciudades.map(ciudad => {
                const dataset = datos.datasets.find(d => d.label === ciudad);
                return dataset ? dataset.data.reduce((a, b) => a + b, 0) : 0;
            }), datos.total]
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, `Datos ${tipo}`);
        XLSX.writeFile(wb, `reporte_ciudad_${tipo}.xlsx`);
    };

window.CiudadSystem.exportarPDFModal = function(tipo) {
        Swal.fire({
            icon: 'info',
            title: 'Exportar a PDF',
            text: 'Esta funcionalidad se implementará próximamente',
            confirmButtonText: 'OK'
        });
    };

// Función para ver todas las ciudades
    window.CiudadSystem.mostrarTodasLasCiudades = function() {
        if (!datosCiudades.detallado) return;
        
        const todasCiudades = datosCiudades.detallado.todasLasCiudades;
        const total = datosCiudades.estadisticas.totalConCiudad;
        
        let contenido = '<div style="max-height: 500px; overflow-y: auto; padding-right: 10px;">';
        contenido += '<table style="width: 100%; border-collapse: collapse;">';
        contenido += '<thead><tr style="background: #f8f9fa; position: sticky; top: 0; z-index: 1;"><th style="padding: 12px; text-align: left;">#</th><th style="padding: 12px; text-align: left;">Ciudad</th><th style="padding: 12px; text-align: center;">Visitantes</th><th style="padding: 12px; text-align: center;">Porcentaje</th></tr></thead>';
        contenido += '<tbody>';
        
        todasCiudades.forEach(([ciudad, cantidad], index) => {
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const color = obtenerColorParaCiudad(ciudad);
            
            contenido += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold; color: #7f8c8d;">${index + 1}</td>
                    <td style="padding: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                            ${ciudad}
                        </div>
                    </td>
                    <td style="padding: 10px; text-align: center; font-weight: bold;">${cantidad}</td>
                    <td style="padding: 10px; text-align: center;">
                        <span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${porcentaje}%</span>
                    </td>
                </tr>
            `;
        });
        
        contenido += '</tbody></table></div>';
        
        Swal.fire({
            title: `Todas las Ciudades (${todasCiudades.length})`,
            html: contenido,
            width: 800,
            showConfirmButton: false,
            showCloseButton: true
        });
    };

if (!window.CiudadSystem) {
        window.CiudadSystem = {};
    }

// Busca la sección "EXPOSICIÓN DE FUNCIONES GLOBALES" y agrega:
    window.CiudadSystem.aplicarFiltrosModal = () => aplicarFiltrosModal();

window.CiudadSystem.limpiarFiltrosModal = () => limpiarFiltrosModal();

// Funciones principales
    window.CiudadSystem.cargarDatos = cargarDatosCiudad;

window.CiudadSystem.cargarDatosCiudadTiempo = cargarDatosCiudadTiempo;

window.CiudadSystem.cambiarTipoReporte = function(tipo) {
        console.log('🔄 Cambiando a reporte:', tipo);
        
        // Actualizar botones activos
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const btn = document.querySelector(`.chart-btn[data-type="${tipo}"]`);
        if (btn) btn.classList.add('active');
        
        tipoActual = tipo;
        
        if (tipo === 'ciudad') {
            cargarDatosCiudad();
        } else {
            cargarDatosCiudadTiempo(tipo);
        }
    };

// Funciones de modal con filtros
    window.CiudadSystem.abrirModal = (tipo) => abrirModalCiudad(tipo);

window.CiudadSystem.abrirModalTiempo = (tipo, tipoGrafica) => abrirModalCiudadTiempo(tipo, tipoGrafica);

window.CiudadSystem.cerrarModal = () => {
        const modal = document.getElementById("chartModalCiudad");
        if (modal) {
            modal.classList.remove("show");
        }
    };

window.CiudadSystem.aplicarFiltrosModal = () => aplicarFiltrosModal();

window.CiudadSystem.limpiarFiltrosModal = () => limpiarFiltrosModal();

// Funciones de descarga del modal
    window.CiudadSystem.descargarPNGModal = () => {
        const canvas = document.getElementById("chartAmpliadoCiudad");
        if (canvas) {
            const link = document.createElement("a");
            link.download = "grafica_ampliada_ciudad.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
    };

window.CiudadSystem.descargarExcelModal = () => {
        const titulo = document.getElementById('modalTitleCiudad')?.textContent || 'Reporte Ciudad';
        const tbody = document.getElementById("tbodyDatosCiudad");
        if (!tbody) return;
        
        const filas = tbody.querySelectorAll('tr');
        const datosExcel = [];
        
        // Obtener encabezados de la tabla
        const thead = document.querySelector('#tablaDatosCiudad thead');
        const encabezados = [];
        if (thead) {
            const ths = thead.querySelectorAll('th');
            ths.forEach(th => encabezados.push(th.textContent.trim()));
            datosExcel.push(encabezados);
        } else {
            // Encabezados por defecto
            datosExcel.push(['Ciudad/Período', 'Descripción', 'Total Visitantes', 'Porcentaje', 'Detalles']);
        }
        
        // Obtener datos de las filas
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length > 0) {
                const filaDatos = [];
                celdas.forEach(celda => filaDatos.push(celda.textContent.trim()));
                datosExcel.push(filaDatos);
            }
        });
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos Filtrados Ciudad");
        XLSX.writeFile(wb, "reporte_filtrado_ciudad.xlsx");
    };

console.log('✅ Sistema de Ciudad CON GRÁFICAS AGRUPADAS Y FILTROS EN MODAL cargado correctamente');

console.log('✅ Sistema de Ciudad CON BARRAS cargado correctamente');

// =============================================
    // FUNCIÓN DE INICIALIZACIÓN
    // =============================================

    window.CiudadSystem.inicializar = function() {
        console.log('✅ Inicializando sistema de ciudad...');
        this.cargarDatos();
    };

// Funciones de filtros combinados (si no existen)
    window.CiudadSystem.aplicarFiltrosCombinados = function() {
        console.log('Aplicando filtros combinados...');
        // Implementa esta función según necesites
        alert('Funcionalidad de filtros combinados en desarrollo');
    };

window.CiudadSystem.limpiarFiltrosCombinados = function() {
        console.log('Limpiando filtros combinados...');
        // Implementa esta función según necesites
        alert('Funcionalidad de limpiar filtros en desarrollo');
    };

window.CiudadSystem.exportarDatosFiltrados = function() {
        console.log('Exportando datos filtrados...');
        // Implementa esta función según necesites
        alert('Funcionalidad de exportar datos filtrados en desarrollo');
    };

// Inicializar automáticamente cuando se carga el DOM
    document.addEventListener('DOMContentLoaded', function() {
        if (window.CiudadSystem && window.CiudadSystem.inicializar) {
            setTimeout(() => {
                window.CiudadSystem.inicializar();
            }, 1000);
        }
    });

console.log('✅ Sistema de Ciudad CON BARRAS cargado correctamente');
