// EdadSystem - index
// Refactor modular: lógica original preservada.

if (!window.EdadSystem) {
        window.EdadSystem = {};
    }

window.EdadSystem.cargarDatos = () => cargarDatosEdades();

window.EdadSystem.abrirModalEdad = (tipo) => abrirModalEdad(tipo);

window.EdadSystem.cerrarModal = () => cerrarModalEdad();

window.EdadSystem.cargarDatosTiempo = (tipo) => cargarDatosTiempo(tipo);

window.EdadSystem.cambiarTipoTiempo = (tipo) => cargarDatosTiempo(tipo);

window.EdadSystem.abrirModalTiempo = (tipo, tipoGrafica) => abrirModalTiempo(tipo, tipoGrafica);

window.EdadSystem.descargarGraficoPrincipal = () => {
        if (chartBarEdad) {
            const link = document.createElement("a");
            link.download = "grafica_edad_principal.png";
            link.href = chartBarEdad.canvas.toDataURL("image/png");
            link.click();
        }
    };

window.EdadSystem.descargarGraficoPrincipalTiempo = (tipo) => {
        let chart;
        switch(tipo) {
            case 'fecha': chart = chartFechaBar; break;
            case 'mes': chart = chartMesBar; break;
            case 'anio': chart = chartAnioBar; break;
        }
        
        if (chart) {
            const link = document.createElement("a");
            link.download = `grafica_${tipo}_principal.png`;
            link.href = chart.canvas.toDataURL("image/png");
            link.click();
        }
    };

window.EdadSystem.descargarPNG = () => descargarPNGModalEdad();

window.EdadSystem.descargarExcel = () => descargarExcelModalEdad();

window.EdadSystem.descargarExcelTiempo = (tipo) => {
        const datos = getDatosTiempo(tipo);
        const total = datos.values.reduce((a, b) => a + b, 0);
        
        const datosExcel = [
            [getTituloTiempo(tipo).split(' ')[1], 'Total Visitantes', 'Porcentaje'],
            ...datos.labels.map((label, i) => {
                const porcentaje = total > 0 ? ((datos.values[i] / total) * 100).toFixed(1) : 0;
                return [label, datos.values[i], `${porcentaje}%`];
            }),
            ['TOTAL', total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, `Datos ${tipo}`);
        XLSX.writeFile(wb, `reporte_${tipo}.xlsx`);
    };

window.EdadSystem.aplicarFiltros = () => aplicarFiltros();

window.EdadSystem.limpiarFiltros = () => limpiarFiltros();

window.EdadSystem.cambiarTipoReporte = (tipo) => cambiarTipoReporte(tipo);

window.EdadSystem.mostrarFiltrosAvanzados = () => mostrarFiltrosAvanzados();

window.EdadSystem.mostrarOcultarFiltros = () => mostrarOcultarFiltros();

window.EdadSystem.aplicarFiltrosCombinados = () => aplicarFiltrosCombinados();

window.EdadSystem.limpiarFiltrosCombinados = () => limpiarFiltrosCombinados();

console.log('✅ Sistema de Edad y Tiempo cargado correctamente');

// Agrega al final del archivo, en la sección del namespace global
    window.EdadSystem.procesarDatosTiempoConFiltros = (participantes, tipo, rangoEdad) => 
        procesarDatosTiempoConFiltros(participantes, tipo, rangoEdad);

window.EdadSystem.mostrarInterfazTiempoConFiltros = (tipo, datosFiltrados, rangoEdad) => 
        mostrarInterfazTiempoConFiltros(tipo, datosFiltrados, rangoEdad);

window.EdadSystem.descargarGraficoFiltrado = (tipo, rangoEdad) => {
        const canvas = document.getElementById(`chart${tipo.charAt(0).toUpperCase() + tipo.slice(1)}BarFiltrado`);
        if (canvas) {
            const link = document.createElement("a");
            link.download = `grafica_${tipo}_filtrada_${rangoEdad}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
    };

window.EdadSystem.descargarExcelFiltrado = (tipo, rangoEdad) => {
        const container = document.getElementById('data-container');
        if (!container) return;
        
        // Aquí implementarías la lógica para exportar a Excel
        // Similar a las funciones de exportación que ya tienes
        mostrarExitoEdad('Función de exportación Excel filtrada - En desarrollo');
    };

window.EdadSystem.abrirModalTiempoFiltrado = (tipo, tipoGrafica, rangoEdad) => {
        // Implementar modal específico para datos filtrados
        // Similar a abrirModalTiempo pero con datos filtrados
        mostrarExitoEdad(`Modal filtrado para ${tipo} - ${rangoEdad}`);
    };

// Métodos para gráficas agrupadas
    window.EdadSystem.mostrarGraficasAgrupadas = (tipo) => mostrarGraficasAgrupadasTiempo(tipo);

window.EdadSystem.descargarGraficoAgrupado = (tipo) => {
        // Implementar descarga
    };

window.EdadSystem.abrirModalTiempoAgrupado = (tipo, tipoGrafica) => {
        // Implementar modal
    };

window.EdadSystem.descargarExcelAgrupado = (tipo) => {
        // Implementar Excel
    };

// Función para abrir modal desde gráficas agrupadas
    window.EdadSystem.abrirModalTiempoAgrupado = function(tipo, tipoGrafica) {
        console.log(`📊 Abriendo modal agrupado: ${tipo} - ${tipoGrafica}`);
        abrirModalTiempo(tipo, tipoGrafica);
    };

// Función para abrir modal desde gráficas no agrupadas
    window.EdadSystem.abrirModalTiempo = function(tipo, tipoGrafica) {
        console.log(`📊 Abriendo modal normal: ${tipo} - ${tipoGrafica}`);
        abrirModalTiempo(tipo, tipoGrafica);
    };

// Asegurar que las funciones de modal básicas estén disponibles
    window.EdadSystem.abrirModalEdad = function(tipoGrafica) {
        console.log(`👥 Abriendo modal edad: ${tipoGrafica}`);
        abrirModalEdad(tipoGrafica);
    };

window.EdadSystem.cerrarModal = function() {
        console.log('❌ Cerrando modal');
        cerrarModalEdad();
    };

// Función para cambiar tipo de reporte
    window.EdadSystem.cambiarTipoReporte = function(tipo) {
        console.log(`🔄 Cambiando reporte a: ${tipo}`);
        cambiarTipoReporte(tipo);
    };

// Función para mostrar/ocultar filtros
    window.EdadSystem.mostrarOcultarFiltros = function() {
        const filtrosDiv = document.getElementById('filtros-combinados');
        if (!filtrosDiv) return;
        
        if (filtrosDiv.style.display === 'none' || filtrosDiv.style.display === '') {
            filtrosDiv.style.display = 'block';
            // Establecer fechas por defecto
            const ahora = new Date();
            const haceUnMes = new Date();
            haceUnMes.setMonth(ahora.getMonth() - 1);
            
            document.getElementById('filtro-fecha-inicial').value = 
                haceUnMes.toISOString().split('T')[0];
            document.getElementById('filtro-fecha-final').value = 
                ahora.toISOString().split('T')[0];
        } else {
            filtrosDiv.style.display = 'none';
        }
    };
