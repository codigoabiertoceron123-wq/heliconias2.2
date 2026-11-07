// InstitucionSystem - export
// Refactor modular: lógica original preservada.

// =============================================
    // FUNCIONES DE DESCARGA
    // =============================================

    function descargarGraficoPrincipal() {
        if (chartBarInstitucion) {
            const link = document.createElement("a");
            link.download = "grafica_instituciones_principal.png";
            link.href = chartBarInstitucion.canvas.toDataURL("image/png");
            link.click();
        }
    }

function descargarGraficoPrincipalTiempo(tipo) {
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
    }

function descargarExcel() {
        const { labels, values, total } = datosInstituciones;
        
        const datosExcel = [
            ['Institución', 'Total Visitantes', 'Porcentaje'],
            ...labels.map((label, i) => {
                const porcentaje = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
                return [label, values[i], `${porcentaje}%`];
            }),
            ['TOTAL', total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos por Institución");
        XLSX.writeFile(wb, "reporte_instituciones.xlsx");
    }

function descargarExcelTiempo(tipo) {
        const datos = getDatosTiempo(tipo);
        
        const datosExcel = [
            [getTituloTiempo(tipo).split(' ')[1], 'Total Visitantes', 'Porcentaje'],
            ...datos.labels.map((label, i) => {
                const porcentaje = datos.total > 0 ? ((datos.values[i] / datos.total) * 100).toFixed(1) : 0;
                return [label, datos.values[i], `${porcentaje}%`];
            }),
            ['TOTAL', datos.total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, `Datos por ${tipo}`);
        XLSX.writeFile(wb, `reporte_${tipo}.xlsx`);
    }

function exportarDatosFiltrados() {
        Swal.fire({
            icon: 'info',
            title: 'Exportar Datos',
            text: 'Función de exportación de datos filtrados',
            confirmButtonColor: '#3498db'
        });
    }
