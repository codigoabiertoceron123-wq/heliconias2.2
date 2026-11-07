// InstitucionSystem - tables
// Refactor modular: lógica original preservada.

// Generar filas de tabla para instituciones
    function generarFilasTablaInstitucion() {
        const { labels, values, total } = datosInstituciones;
        
        return labels.map((institucion, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const tipo = obtenerTipoInstitucion(institucion);
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td>
                        <span class="institution-badge">
                            <i class="fas fa-university"></i>
                            ${institucion}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: #2e7d32">${porcentaje}%</td>
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
    // Actualiza la función generarFilasTablaTiempo:
    function generarFilasTablaTiempo(datos, tipo) {
        let html = '';
        const totalGeneral = datos.total || 0;
        
        // Para cada fecha
        datos.labels.forEach((fecha, fechaIndex) => {
            html += `
                <tr style="background-color: #f8f9fa;">
                    <td colspan="5" style="font-weight: bold; color: #2c3e50;">
                        <i class="fas fa-calendar-day"></i> ${fecha}
                    </td>
                </tr>
            `;
            
            // Para cada institución en esa fecha
            let totalFecha = 0;
            datos.instituciones.forEach((institucion, instIndex) => {
                const valor = datos.datasets[instIndex]?.data[fechaIndex] || 0;
                totalFecha += valor;
                
                if (valor > 0) {
                    html += `
                        <tr>
                            <td style="padding-left: 30px;">
                                <span class="institution-badge">
                                    <i class="fas fa-university"></i>
                                    ${institucion}
                                </span>
                            </td>
                            <td>${getDescripcionTiempo(tipo, fecha)}</td>
                            <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                            <td style="text-align: center; color: #2e7d32; font-weight: bold">
                                ${totalGeneral > 0 ? ((valor / totalGeneral) * 100).toFixed(1) : 0}%
                            </td>
                            <td style="text-align: center;">
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
                    <td style="text-align: center;">-</td>
                </tr>
            `;
        });
        
        // Total general
        html += `
            <tr style="background: #2e7d32; color: white; font-weight: bold;">
                <td colspan="2">TOTAL GENERAL</td>
                <td style="text-align: center">${totalGeneral.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td style="text-align: center;">-</td>
            </tr>
        `;
        
        return html;
    }
