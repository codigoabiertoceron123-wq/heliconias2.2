// NacionalidadSystem - export
// Refactor modular: lógica original preservada.

// =============================================
    // FUNCIONES DE DESCARGA
    // =============================================

    function descargarGraficoPrincipal() {
        if (chartBarNacionalidad) {
            const link = document.createElement("a");
            link.download = "grafica_nacionalidades_principal.png";
            link.href = chartBarNacionalidad.canvas.toDataURL("image/png");
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
        const { labels, values, total, detallesOtrosPaises } = datosNacionalidades;
        
        const datosExcel = [
            ['Nacionalidad', 'Total Visitantes', 'Porcentaje', 'Tipo'],
            ...labels.map((label, i) => {
                const porcentaje = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
                const tipo = obtenerTipoNacionalidad(label);
                return [label, values[i], `${porcentaje}%`, tipo];
            }),
            ['TOTAL', total, '100%', '']
        ];

        // Agregar detalles de otros países si existen
        if (detallesOtrosPaises && Object.keys(detallesOtrosPaises).length > 0) {
            datosExcel.push([]); // Línea en blanco
            datosExcel.push(['DETALLE DE OTROS PAÍSES', '', '', '']);
            datosExcel.push(['País', 'Total Visitantes', 'Porcentaje (Otros)', '']);
            
            Object.entries(detallesOtrosPaises).forEach(([pais, cantidad]) => {
                const porcentajeOtros = values[1] > 0 ? ((cantidad / values[1]) * 100).toFixed(1) : 0;
                datosExcel.push([pais, cantidad, `${porcentajeOtros}%`, '']);
            });
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, "Datos por Nacionalidad");
        XLSX.writeFile(wb, "reporte_nacionalidades.xlsx");
    }

function descargarExcelTiempo(tipo) {
        const datos = getDatosTiempo(tipo);
        
        // Nuevo formato compatible con datasets
        const datosExcel = [
            ['Fecha', ...datos.paises, 'Total']
        ];
        
        // Para cada fecha
        datos.labels.forEach((fecha, i) => {
            const fila = [fecha];
            let totalFecha = 0;
            
            // Para cada país
            datos.datasets.forEach(dataset => {
                const valor = dataset.data[i] || 0;
                fila.push(valor);
                totalFecha += valor;
            });
            
            fila.push(totalFecha);
            datosExcel.push(fila);
        });
        
        // Totales por país
        const totales = ['TOTAL'];
        datos.datasets.forEach(dataset => {
            const total = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
            totales.push(total);
        });
        totales.push(datos.total || 0);
        datosExcel.push(totales);
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(wb, ws, `Datos por ${tipo}`);
        XLSX.writeFile(wb, `reporte_${tipo}_nacionalidad.xlsx`);
    }

function exportarDatosFiltrados() {
        Swal.fire({
            icon: 'info',
            title: 'Exportar Datos',
            text: 'Función de exportación de datos filtrados',
            confirmButtonColor: '#3498db'
        });
    }
