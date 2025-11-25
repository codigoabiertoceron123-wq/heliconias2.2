// Módulo para exportación de datos
class ExportManager {
    descargarPNG() {
        const canvas = document.getElementById("chartAmpliado");
        if (!canvas) return;
        
        const link = document.createElement("a");
        link.download = `grafica_${chartManager.tipoActual}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    descargarExcel() {
        const datos = dataProcessor.datosSimulados[chartManager.tipoActual];
        if (!datos) return;
        
        const { labels, values } = datos;
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
            [chartManager.obtenerEtiquetaDescriptiva(chartManager.tipoActual), "Total de Visitantes"],
            ...labels.map((l, i) => [l, values[i]]),
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Datos");
        XLSX.writeFile(wb, `datos_${chartManager.tipoActual}.xlsx`);
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

// Crear instancia global
const exportManager = new ExportManager();