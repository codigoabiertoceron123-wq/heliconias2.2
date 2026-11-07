// CiudadSystem - tables
// Refactor modular: lógica original preservada.

// Función para generar filas de tabla de ciudad
    function generarFilasTablaCiudad() {
        const { labels, values, total } = datosCiudades.general;
        const colores = datosCiudades.general.colors;
        
        return labels.map((ciudad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const descripcion = obtenerDescripcionCiudad(ciudad);
            const color = colores[index];
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td>
                        <span class="ciudad-badge" style="background: ${color}; color: white; padding: 4px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fas fa-city"></i> ${ciudad}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: #2e7d32">${porcentaje}%</td>
                    <td style="color: #7f8c8d; font-size: 0.9rem">${descripcion}</td>
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

function generarFilasTablaCiudadTiempo(datos, tipo) {
        if (!datos.labels || datos.labels.length === 0) {
            return '<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay datos disponibles</td></tr>';
        }

        return datos.labels.map((label, index) => {
            // Calcular total para este período
            let totalPeriodo = 0;
            let ciudadesPeriodo = new Set();
            let ciudadPrincipal = '';
            let maxVisitantes = 0;
            
            datos.datasets.forEach(dataset => {
                const valor = dataset.data[index] || 0;
                totalPeriodo += valor;
                if (valor > 0) {
                    ciudadesPeriodo.add(dataset.label);
                    if (valor > maxVisitantes) {
                        maxVisitantes = valor;
                        ciudadPrincipal = dataset.label;
                    }
                }
            });
            
            const numCiudades = ciudadesPeriodo.size;
            const colorPrincipal = obtenerColorParaCiudad(ciudadPrincipal);
            
            return `
                <tr data-fecha="${label}" data-total="${totalPeriodo}">
                    <td><strong>${label}</strong></td>
                    <td style="text-align: center;">${numCiudades}</td>
                    <td style="text-align: center; font-weight: bold;">${totalPeriodo.toLocaleString()}</td>
                    <td>
                        ${ciudadPrincipal ? `
                        <span class="ciudad-badge-mini" style="background: ${colorPrincipal}; color: white; padding: 3px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fas fa-city"></i> ${ciudadPrincipal} (${maxVisitantes})
                        </span>` : 'N/A'}
                    </td>
                    <td>
                        <button class="btn-detalle" onclick="window.CiudadSystem.mostrarDetallePeriodo('${tipo}', '${label}')" style="background: #f8f9fa; border: 1px solid #ddd; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-eye"></i> Ver detalle
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
