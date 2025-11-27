// export-manager.js - VERSIÓN CORREGIDA
class ExportManager {
    constructor() {
        this.app = null;
        this.chartManager = null;
        this.dataProcessor = null;
    }

    setApp(app) {
        this.app = app;
        // Obtener referencias desde la app
        if (app && app.modules) {
            this.chartManager = app.modules.chartManager;
            this.dataProcessor = app.modules.dataProcessor;
        }
    }

    descargarPNG() {
        const canvas = document.getElementById("chartAmpliado");
        if (!canvas) {
            console.warn('No se encontró el canvas chartAmpliado');
            return;
        }
        
        const tipoActual = this.chartManager ? this.chartManager.tipoActual : 
                          (this.app ? this.app.getTipoActual() : 'grafica');
        
        const link = document.createElement("a");
        link.download = `grafica_${tipoActual}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    descargarExcel() {
        const tipoActual = this.chartManager ? this.chartManager.tipoActual : 
                          (this.app ? this.app.getTipoActual() : 'grafica');
        
        const datosSimulados = this.dataProcessor ? this.dataProcessor.datosSimulados :
                              (this.app ? this.app.getDatosSimulados() : null);
        
        if (!datosSimulados || !datosSimulados[tipoActual]) {
            console.warn('No hay datos para exportar:', tipoActual);
            return;
        }
        
        const datos = datosSimulados[tipoActual];
        const { labels, values } = datos;
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
            [this.obtenerEtiquetaDescriptiva(tipoActual), "Total de Visitantes"],
            ...labels.map((l, i) => [l, values[i]]),
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Datos");
        XLSX.writeFile(wb, `datos_${tipoActual}.xlsx`);
    }

    descargarGraficoPrincipal() {
        const canvas = document.getElementById("chartBar");
        if (!canvas) {
            console.warn('No se encontró el canvas chartBar');
            return;
        }
        
        const link = document.createElement("a");
        link.download = "grafica_principal.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    obtenerEtiquetaDescriptiva(tipo) {
        const etiquetas = {
            tipo_reserva: 'Tipo de Reserva',
            estado: 'Estado',
            actividad: 'Actividad',
            institucion: 'Institución',
            intereses: 'Intereses',
            satisfaccion: 'Satisfacción',
            temporada: 'Temporada',
            fecha: 'Fecha',
            mes: 'Mes',
            anio: 'Año',
            genero: 'Género'
        };
        return etiquetas[tipo] || 'Categoría';
    }
}

// Asegurar que esté disponible globalmente
if (typeof ExportManager === 'undefined') {
    window.ExportManager = ExportManager;
}

// Crear instancia global
const exportManager = new ExportManager();