// EdadSystem - export
// Refactor modular: lógica original preservada.

function descargarPNGModalEdad() {
        const canvas = document.getElementById("chartAmpliadoEdad");
        if (canvas) {
            const link = document.createElement("a");
            link.download = "grafica_edad_ampliada.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
    }

function descargarExcelModalEdad() {
        const { labels, values } = datosSimuladosEdad.edad;
        const total = values.reduce((a, b) => a + b, 0);
        
        const datosExcel = [
            ['Grupo de Edad', 'Rango', 'Total Visitantes', 'Porcentaje'],
            ...labels.map((label, i) => {
                const porcentaje = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
                return [`${label} años`, label, values[i], `${porcentaje}%`];
            }),
            ['TOTAL', '', total, '100%']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos por Edad");
        XLSX.writeFile(wb, "reporte_edad_detallado.xlsx");
    }
