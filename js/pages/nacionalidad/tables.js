// NacionalidadSystem - tables
// Refactor modular: lógica original preservada.

// Generar filas de tabla para nacionalidades
    function generarFilasTablaNacionalidad() {
        const { labels, values, total } = datosNacionalidades;
        
        return labels.map((nacionalidad, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoNacionalidad(nacionalidad);
            const icono = nacionalidad === 'Colombia' ? 'fa-flag' : 'fa-globe-americas';
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td>
                        <span class="nation-badge">
                            <i class="fas ${icono}"></i>
                            ${nacionalidad}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: ${nacionalidad === 'Colombia' ? '#27ae60' : '#3498db'}">${porcentaje}%</td>
                    <td style="color: #7f8c8d; font-size: 0.9rem">${tipo}</td>
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

// Generar filas de tabla para tiempo
    function generarFilasTablaTiempo(datos, tipo) {
    // Verificar si tenemos datos en el nuevo formato (con datasets)
        if (!datos || !datos.datasets || datos.datasets.length === 0) {
            return `
                <tr>
                    <td colspan="7" style="text-align: center; color: #7f8c8d; padding: 20px;">
                        <i class="fas fa-exclamation-circle"></i> No hay datos disponibles
                    </td>
                </tr>
            `;
        }
        
        let html = '';
        const totalGeneral = datos.total || 0;
        
        // Para cada fecha
        datos.labels.forEach((fecha, fechaIndex) => {
            html += `
                <tr style="background-color: #f8f9fa;">
                    <td colspan="7" style="font-weight: bold; color: #2c3e50;">
                        <i class="fas fa-calendar-day"></i> ${fecha}
                    </td>
                </tr>
            `;
            
            // Para cada país en esa fecha
            let totalFecha = 0;
            datos.datasets.forEach((dataset, datasetIndex) => {
                const valor = dataset.data[fechaIndex] || 0;
                totalFecha += valor;
                
                if (valor > 0) {
                    html += `
                        <tr>
                            <td style="padding-left: 30px;">
                                <span class="nation-badge ${dataset.label === 'Colombia' ? 'colombia' : ''}">
                                    <i class="fas ${dataset.label === 'Colombia' ? 'fa-flag' : 'fa-globe-americas'}"></i>
                                    ${dataset.label}
                                </span>
                            </td>
                            <td>${getDescripcionTiempo(tipo, fecha)}</td>
                            <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                            <td style="text-align: center; font-weight: bold; color: ${dataset.label === 'Colombia' ? '#27ae60' : '#3498db'}">
                                ${totalGeneral > 0 ? ((valor / totalGeneral) * 100).toFixed(1) : 0}%
                            </td>
                            <td colspan="2" style="text-align: center;">
                                <span style="color: #95a5a6;">-</span>
                            </td>
                        </tr>
                    `;
                }
            });
            
            // Total de la fecha
            html += `
                <tr style="background-color: #e8f5e8;">
                    <td colspan="2" style="padding-left: 30px; font-weight: bold;">
                        <i class="fas fa-plus-circle"></i> Total ${fecha}
                    </td>
                    <td style="text-align: center; font-weight: bold">${totalFecha.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold">
                        ${totalGeneral > 0 ? ((totalFecha / totalGeneral) * 100).toFixed(1) : 0}%
                    </td>
                    <td colspan="3" style="text-align: center;">-</td>
                </tr>
            `;
        });
        
        // Total general
        html += `
            <tr style="background: #2e7d32; color: white; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${totalGeneral.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td colspan="3" style="text-align: center;">-</td>
            </tr>
        `;
        
        return html;
    }
