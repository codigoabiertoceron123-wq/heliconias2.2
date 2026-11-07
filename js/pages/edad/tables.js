// EdadSystem - tables
// Refactor modular: lógica original preservada.

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
        
        // Encabezado para tabla agrupada
        html += `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <th style="min-width: 150px;">${getTituloTiempo(tipo).split(' ')[1]}</th>
                ${datos.datasets.map(dataset => `<th>${dataset.label}</th>`).join('')}
                <th style="width: 120px;">Total por ${getTituloTiempo(tipo).split(' ')[1]}</th>
            </tr>
        `;
        
        // Filas de datos para cada fecha/mes/año
        datos.labels.forEach((fecha, fechaIndex) => {
            html += `
                <tr>
                    <td><strong>${fecha}</strong></td>
                    ${datos.datasets.map(dataset => 
                        `<td style="text-align: center; font-weight: ${dataset.data[fechaIndex] > 0 ? 'bold' : 'normal'}">
                            ${(dataset.data[fechaIndex] || 0).toLocaleString()}
                        </td>`
                    ).join('')}
                    <td style="text-align: center; background: #e8f5e9; font-weight: bold;">
                        ${datos.datasets.reduce((sum, dataset) => 
                            sum + (dataset.data[fechaIndex] || 0), 0
                        ).toLocaleString()}
                    </td>
                </tr>
            `;
        });
        
        // Totales por rango de edad
        html += `
            <tr style="background: #f0f7ff; font-weight: bold;">
                <td><strong>Total por Rango</strong></td>
                ${datos.datasets.map(dataset => {
                    const totalRango = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                    return `<td style="text-align: center; color: #2e7d32;">${totalRango.toLocaleString()}</td>`;
                }).join('')}
                <td style="text-align: center; background: #2e7d32; color: white;">
                    ${totalGeneral.toLocaleString()}
                </td>
            </tr>
        `;
        
        return html;
    }

function generarFilasTablaInteligente(datos, tipo, rangoEdad) {
        return datos.labels.map((label, index) => {
            let celdasEdad = '';
            let totalFila = 0;

            if (rangoEdad === 'todos') {
                // Sumar todas las edades para esta fecha/mes/año
                datos.datasets.forEach(dataset => {
                    const valor = dataset.data[index] || 0;
                    celdasEdad += `<td style="text-align: center;">${valor}</td>`;
                    totalFila += valor;
                });
            } else {
                // Solo una edad específica
                const valor = datos.datasets[0].data[index] || 0;
                celdasEdad = `<td style="text-align: center;">${valor}</td>`;
                totalFila = valor;
            }

            return `
                <tr>
                    <td><strong>${label}</strong></td>
                    ${celdasEdad}
                    <td style="text-align: center; font-weight: bold; background: #e8f5e8;">${totalFila}</td>
                </tr>
            `;
        }).join('');
    }

function generarFilasTablaFiltrada(datos, tipo) {
        let html = '';
        
        // Filas de datos para cada fecha/mes/año
        datos.labels.forEach((fecha, fechaIndex) => {
            const totalFila = datos.datasets.reduce((sum, dataset) => 
                sum + (dataset.data[fechaIndex] || 0), 0);
            
            html += `
                <tr>
                    <td><strong>${fecha}</strong></td>
                    ${datos.datasets.map(dataset => 
                        `<td style="text-align: center; font-weight: ${dataset.data[fechaIndex] > 0 ? 'bold' : 'normal'}">
                            ${(dataset.data[fechaIndex] || 0).toLocaleString()}
                        </td>`
                    ).join('')}
                    <td style="text-align: center; background: #e8f5e9; font-weight: bold;">
                        ${totalFila.toLocaleString()}
                    </td>
                </tr>
            `;
        });
        
        // Totales por rango de edad
        html += `
            <tr style="background: #f0f7ff; font-weight: bold;">
                <td><strong>Total por Rango</strong></td>
                ${datos.datasets.map(dataset => {
                    const totalRango = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                    return `<td style="text-align: center; color: #2e7d32;">${totalRango.toLocaleString()}</td>`;
                }).join('')}
                <td style="text-align: center; background: #2e7d32; color: white;">
                    ${datos.total.toLocaleString()}
                </td>
            </tr>
        `;
        
        return html;
    }

function generarFilasTablaCombinada(datos, tipo) {
        const tiempos = Object.keys(datos.porTiempo).sort((a, b) => {
            // Ordenar según el tipo
            switch(tipo) {
                case 'fecha': return new Date(a) - new Date(b);
                case 'mes': return ordenarMeses(a, b);
                case 'anio': return parseInt(a) - parseInt(b);
                default: return 0;
            }
        });

        return tiempos.map(tiempo => {
            const total = datos.porTiempo[tiempo];
            const edades = datos.porEdadYTiempo[tiempo] || {};
            
            return `
                <tr>
                    <td><strong>${tiempo}</strong></td>
                    <td style="text-align: center; background: ${edades['0-17'] > 0 ? '#e8f5e8' : '#f8f9fa'};">
                        ${edades['0-17'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['18-25'] > 0 ? '#e3f2fd' : '#f8f9fa'};">
                        ${edades['18-25'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['26-35'] > 0 ? '#fff3e0' : '#f8f9fa'};">
                        ${edades['26-35'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['36-50'] > 0 ? '#fbe9e7' : '#f8f9fa'};">
                        ${edades['36-50'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['51-65'] > 0 ? '#f3e5f5' : '#f8f9fa'};">
                        ${edades['51-65'] || 0}
                    </td>
                    <td style="text-align: center; background: ${edades['66+'] > 0 ? '#ffebee' : '#f8f9fa'};">
                        ${edades['66+'] || 0}
                    </td>
                    <td style="text-align: center; font-weight: bold; background: #e8f5e8;">
                        ${total}
                    </td>
                </tr>
            `;
        }).join('');
    }

function generarFilasTablaEdad() {
        const { labels, values } = datosSimuladosEdad.edad;
        const total = values.reduce((a, b) => a + b, 0);
        
        const descripciones = {
            '0-17': 'Niños y adolescentes', '18-25': 'Jóvenes adultos',
            '26-35': 'Adultos jóvenes', '36-50': 'Adultos',
            '51-65': 'Adultos mayores', '66+': 'Tercera edad'
        };

        return labels.map((grupo, index) => {
            const cantidad = values[index];
            const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
            const descripcion = descripciones[grupo] || 'Grupo de edad';
            
            return `
                <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td>
                        <span class="age-badge" style="background: ${coloresPorEdad[grupo]}; color: white;">
                            <i class="fas fa-user"></i>
                            ${grupo} años
                        </span>
                    </td>
                    <td>${grupo}</td>
                    <td style="text-align: center; font-weight: bold">${cantidad.toLocaleString()}</td>
                    <td style="text-align: center; font-weight: bold; color: #2e7d32">${porcentaje}%</td>
                    <td style="color: #7f8c8d; font-size: 0.9rem">${descripcion}</td>
                </tr>
            `;
        }).join('') + (total > 0 ? `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3">TOTAL GENERAL</td>
                <td style="text-align: center">${total.toLocaleString()}</td>
                <td style="text-align: center">100%</td>
                <td></td>
            </tr>
        ` : '');
    }

// Añade esta función en edad-system.js, cerca de las otras funciones de tablas
    function generarFilasTablaAgrupada(datosAgrupados, tipo) {
        // Verificar si tenemos datos en el formato correcto
        if (!datosAgrupados || !datosAgrupados.datasets || datosAgrupados.datasets.length === 0) {
            return `
                <tr>
                    <td colspan="${datosAgrupados.datasets ? datosAgrupados.datasets.length + 2 : 8}" 
                        style="text-align: center; color: #7f8c8d; padding: 20px;">
                        <i class="fas fa-exclamation-circle"></i> No hay datos disponibles
                    </td>
                </tr>
            `;
        }
        
        let html = '';
        const totalGeneral = datosAgrupados.total || 0;
        
        // Encabezado para tabla agrupada
        html += `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <th style="min-width: 150px;">${getTituloTiempo(tipo).split(' ')[1]}</th>
                ${datosAgrupados.datasets.map(dataset => `<th>${dataset.label}</th>`).join('')}
                <th style="width: 120px;">Total por ${getTituloTiempo(tipo).split(' ')[1]}</th>
            </tr>
        `;
        
        // Filas de datos para cada fecha/mes/año
        datosAgrupados.labels.forEach((fecha, fechaIndex) => {
            // Calcular total para esta fecha
            const totalPorFecha = datosAgrupados.datasets.reduce((sum, dataset) => 
                sum + (dataset.data[fechaIndex] || 0), 0);
            
            html += `
                <tr>
                    <td><strong>${fecha}</strong></td>
                    ${datosAgrupados.datasets.map(dataset => 
                        `<td style="text-align: center; font-weight: ${dataset.data[fechaIndex] > 0 ? 'bold' : 'normal'}">
                            ${(dataset.data[fechaIndex] || 0).toLocaleString()}
                        </td>`
                    ).join('')}
                    <td style="text-align: center; background: #e8f5e9; font-weight: bold;">
                        ${totalPorFecha.toLocaleString()}
                    </td>
                </tr>
            `;
        });
        
        // Totales por rango de edad
        html += `
            <tr style="background: #f0f7ff; font-weight: bold;">
                <td><strong>Total por Rango</strong></td>
                ${datosAgrupados.datasets.map(dataset => {
                    const totalRango = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                    return `<td style="text-align: center; color: #2e7d32;">${totalRango.toLocaleString()}</td>`;
                }).join('')}
                <td style="text-align: center; background: #2e7d32; color: white;">
                    ${totalGeneral.toLocaleString()}
                </td>
            </tr>
        `;
        
        // Resumen estadístico
        html += `
            <tr style="background: #f8f9fa; font-size: 0.9em; color: #7f8c8d;">
                <td colspan="${datosAgrupados.datasets.length + 2}" style="text-align: center; padding: 10px;">
                    <i class="fas fa-info-circle"></i> Mostrando ${datosAgrupados.labels.length} 
                    ${tipo === 'fecha' ? 'fechas' : tipo === 'mes' ? 'meses' : 'años'} con datos
                </td>
            </tr>
        `;
        
        return html;
    }
