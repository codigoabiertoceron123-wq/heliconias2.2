// Genero - tables
// Refactor modular: lógica original preservada.

// Función para actualizar tabla con datos agrupados por fecha y género
function actualizarTablaFechasAgrupadas(datosFechas) {
    const tbody = document.querySelector("#tablaDatos tbody");
    if (!tbody) return;
    
    let tablaHTML = '';
    
    // Para cada fecha
    datosFechas.labels.forEach((fecha, fechaIndex) => {
        const totalFecha = datosFechas.totalPorFecha[fechaIndex] || 0;
        
        if (totalFecha > 0) {
            // Encabezado de fecha
            tablaHTML += `
                <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                    <td colspan="3" style="font-weight: bold; color: #2c3e50; padding: 12px; border-bottom: 2px solid #dee2e6;">
                        <i class="fas fa-calendar-day"></i> ${fecha} - Total: ${totalFecha} visitantes
                    </td>
                </tr>
            `;
            
            // Detalle por género para esta fecha
            datosFechas.datasets.forEach(dataset => {
                const valor = dataset.data[fechaIndex] || 0;
                if (valor > 0) {
                    const porcentaje = totalFecha > 0 ? ((valor / totalFecha) * 100).toFixed(1) : 0;
                    const claseGenero = obtenerClaseGenero(dataset.label.toLowerCase());
                    
                    tablaHTML += `
                        <tr>
                            <td style="padding-left: 30px;">
                                <span class="gender-badge ${claseGenero}">
                                    <i class="fas ${dataset.label === 'Masculino' ? 'fa-mars' : dataset.label === 'Femenino' ? 'fa-venus' : 'fa-genderless'}"></i>
                                    ${formatearGenero(dataset.label)}
                                </span>
                            </td>
                            <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                            <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                        </tr>
                    `;
                }
            });
        }
    });
    
    // Fila de total general
    if (datosFechas.totalGeneral > 0) {
        tablaHTML += `
            <tr style="background: linear-gradient(135deg, #a8e6cf, #dcedc1); font-weight: bold;">
                <td colspan="2" style="padding: 12px; border-top: 2px solid #2ecc71;">
                    <i class="fas fa-chart-bar"></i> TOTAL GENERAL
                </td>
                <td style="text-align: center; border-top: 2px solid #2ecc71;">${datosFechas.totalGeneral.toLocaleString()}</td>
            </tr>
        `;
    }
    
    tbody.innerHTML = tablaHTML;
}

// Función para actualizar tabla de fechas
function actualizarTablaFechas(datosFechas) {
    const tbody = document.querySelector("#tablaDatos tbody");
    const total = datosFechas.values.reduce((a, b) => a + b, 0);
    
    tbody.innerHTML = datosFechas.labels
        .map((fecha, index) => {
            const valor = datosFechas.values[index];
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            
            // Destacar la fecha con más visitas
            const maxValor = Math.max(...datosFechas.values);
            const esMaximo = valor === maxValor && valor > 0;
            const estiloFila = esMaximo ? 'background: linear-gradient(135deg, #ffeaa7, #fab1a0); font-weight: bold;' : '';
            
            return `
                <tr style="${estiloFila}">
                    <td style="padding: 12px; font-weight: bold;">
                        <i class="fas fa-calendar-day"></i> ${fecha}
                        ${esMaximo ? '<i class="fas fa-crown" style="margin-left: 5px; color: #f39c12;"></i>' : ''}
                    </td>
                    <td style="text-align: center; font-weight: bold; font-size: 16px;">
                        ${valor.toLocaleString()}
                    </td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold; font-size: 16px;">
                        ${porcentaje}%
                    </td>
                </tr>
            `;
        })
        .join("");
    
    // Agregar fila de total
    if (total > 0) {
        tbody.innerHTML += `
            <tr style="background: linear-gradient(135deg, #a8e6cf, #dcedc1); font-weight: bold;">
                <td style="padding: 12px;">
                    <i class="fas fa-calendar-alt"></i> TOTAL PERÍODO
                </td>
                <td style="text-align: center; font-size: 16px;">${total.toLocaleString()}</td>
                <td style="text-align: center; font-size: 16px;">100%</td>
            </tr>
        `;
    }
}

// Función para actualizar tabla comparativa
function actualizarTablaComparativa(datosComparativa) {
    const tbody = document.querySelector("#tablaDatos tbody");
    const total = datosComparativa.values.reduce((a, b) => a + b, 0);
    
    tbody.innerHTML = datosComparativa.labels
        .map((genero, index) => {
            const valor = datosComparativa.values[index];
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            const generoFormateado = formatearGenero(genero);
            const claseGenero = obtenerClaseGenero(genero);
            
            // Destacar el valor máximo (solo si hay valores > 0)
            const valoresPositivos = datosComparativa.values.filter(v => v > 0);
            const esMaximo = valoresPositivos.length > 0 && valor === Math.max(...valoresPositivos) && valor > 0;
            const estiloFila = esMaximo ? 'background: linear-gradient(135deg, #ffeaa7, #fab1a0); font-weight: bold;' : '';
            
            return `
                <tr style="${estiloFila}">
                    <td>
                        <span class="gender-badge-3d ${claseGenero}">
                            <i class="fas ${genero === 'Masculino' ? 'fa-mars' : genero === 'Femenino' ? 'fa-venus' : 'fa-genderless'}"></i>
                            ${generoFormateado}
                            ${esMaximo ? '<i class="fas fa-crown" style="margin-left: 5px; color: #f39c12;"></i>' : ''}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: bold; font-size: 16px;">
                        ${valor.toLocaleString()}
                    </td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold; font-size: 16px;">
                        ${porcentaje}%
                    </td>
                </tr>
            `;
        })
        .join("");
    
    // Agregar fila de total solo si hay datos
    if (total > 0) {
        tbody.innerHTML += `
            <tr style="background: linear-gradient(135deg, #a8e6cf, #dcedc1); font-weight: bold;">
                <td style="padding: 12px;">
                    <i class="fas fa-users"></i> TOTAL
                </td>
                <td style="text-align: center; font-size: 16px;">${total.toLocaleString()}</td>
                <td style="text-align: center; font-size: 16px;">100%</td>
            </tr>
        `;
    }
}

// Función para actualizar tabla comparativa mensual
function actualizarTablaComparativaMensual(datosComparativa) {
    const tbody = document.querySelector("#tablaDatos tbody");
    const total = datosComparativa.values.reduce((a, b) => a + b, 0);
    
    tbody.innerHTML = datosComparativa.labels
        .map((genero, index) => {
            const valor = datosComparativa.values[index];
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            const generoFormateado = formatearGenero(genero);
            const claseGenero = obtenerClaseGenero(genero);
            
            // Destacar el valor máximo (solo si hay valores > 0)
            const valoresPositivos = datosComparativa.values.filter(v => v > 0);
            const esMaximo = valoresPositivos.length > 0 && valor === Math.max(...valoresPositivos) && valor > 0;
            const estiloFila = esMaximo ? 'background: linear-gradient(135deg, #ffeaa7, #fab1a0); font-weight: bold;' : '';
            
            return `
                <tr style="${estiloFila}">
                    <td>
                        <span class="gender-badge-3d ${claseGenero}">
                            <i class="fas ${
                                generoLower === 'masculino' ? 'fa-mars' : 
                                generoLower === 'femenino' ? 'fa-venus' : 
                                'fa-genderless'
                            }"></i>
                            ${generoFormateado}
                            ${esMaximo ? '<i class="fas fa-crown" style="margin-left: 5px; color: #f39c12;"></i>' : ''}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: bold; font-size: 16px;">
                        ${valor.toLocaleString()}
                    </td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold; font-size: 16px;">
                        ${porcentaje}%
                    </td>
                </tr>
            `;
        })
        .join("");
    
    // Agregar fila de total solo si hay datos
    if (total > 0) {
        tbody.innerHTML += `
            <tr style="background: linear-gradient(135deg, #a8e6cf, #dcedc1); font-weight: bold;">
                <td style="padding: 12px;">
                    <i class="fas fa-users"></i> TOTAL ${datosComparativa.mes} ${datosComparativa.año}
                </td>
                <td style="text-align: center; font-size: 16px;">${total.toLocaleString()}</td>
                <td style="text-align: center; font-size: 16px;">100%</td>
            </tr>
        `;
    }
}

// // AGREGAR función para actualizar gráfica de años agrupados
// function actualizarGraficaAniosAgrupados(tipoGrafica, datosProcesados, titulo) {
//     const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
//     if (chartAmpliado) chartAmpliado.destroy();

//     // Configurar gráfica de barras agrupadas
//     chartAmpliado = new Chart(ctx, {
//         type: tipoGrafica === "bar" ? "bar" : "doughnut",
//         data: {
//             labels: datosProcesados.labels,
//             datasets: datosProcesados.datasets
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     position: 'top',
//                     labels: {
//                         padding: 15,
//                         usePointStyle: true,
//                         pointStyle: 'circle',
//                         font: { size: 13 }
//                     }
//                 },
//                 title: {
//                     display: true,
//                     text: titulo,
//                     font: { size: 18, weight: 'bold' },
//                     padding: 25
//                 },
//                 tooltip: {
//                     backgroundColor: 'rgba(0,0,0,0.8)',
//                     titleFont: { size: 14 },
//                     bodyFont: { size: 14 },
//                     padding: 12,
//                     cornerRadius: 8,
//                     callbacks: {
//                         title: function(tooltipItems) {
//                             return `Año: ${tooltipItems[0].label}`;
//                         },
//                         label: function(context) {
//                             const añoIndex = context.dataIndex;
//                             const totalAño = datosProcesados.totalPorAño[añoIndex] || 0;
//                             const valor = context.parsed.y;
//                             const porcentaje = totalAño > 0 ? Math.round((valor / totalAño) * 100) : 0;
//                             return `${context.dataset.label}: ${valor} visitantes (${porcentaje}%)`;
//                         }
//                     }
//                 }
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     stacked: false, // BARRAS JUNTAS, NO APILADAS
//                     grid: { 
//                         color: 'rgba(0,0,0,0.1)',
//                         drawBorder: false
//                     },
//                     title: {
//                         display: true,
//                         text: 'Cantidad de Visitantes',
//                         font: { weight: 'bold', size: 14 }
//                     }
//                 },
//                 x: {
//                     stacked: false, // BARRAS JUNTAS
//                     grid: { display: false },
//                     title: {
//                         display: true,
//                         text: 'Años',
//                         font: { weight: 'bold', size: 14 }
//                     },
//                     ticks: {
//                         font: { size: 12 }
//                     }
//                 }
//             },
//             animation: {
//                 duration: 1000,
//                 easing: 'easeOutQuart'
//             }
//         }
//     });

//     // Actualizar tabla
//     actualizarTablaAñosAgrupados(datosProcesados);
// }

// AGREGAR función para actualizar tabla de años agrupados
function actualizarTablaAñosAgrupados(datosProcesados) {
    const tbody = document.querySelector("#tablaDatos tbody");
    if (!tbody) return;
    
    let tablaHTML = '';
    
    // Para cada año
    datosProcesados.labels.forEach((año, añoIndex) => {
        const totalAño = datosProcesados.totalPorAño[añoIndex] || 0;
        
        if (totalAño > 0) {
            // Encabezado de año
            tablaHTML += `
                <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                    <td colspan="3" style="font-weight: bold; color: #2c3e50; padding: 12px; border-bottom: 2px solid #dee2e6;">
                        <i class="fas fa-calendar-alt"></i> Año ${año} - Total: ${totalAño} visitantes
                    </td>
                </tr>
            `;
            
            // Detalle por género para este año
            datosProcesados.datasets.forEach(dataset => {
                const valor = dataset.data[añoIndex] || 0;
                if (valor > 0) {
                    const porcentaje = totalAño > 0 ? ((valor / totalAño) * 100).toFixed(1) : 0;
                    const claseGenero = obtenerClaseGenero(dataset.label.toLowerCase());
                    
                    tablaHTML += `
                        <tr>
                            <td style="padding-left: 30px;">
                                <span class="gender-badge ${claseGenero}">
                                    <i class="fas ${dataset.label === 'Masculino' ? 'fa-mars' : dataset.label === 'Femenino' ? 'fa-venus' : 'fa-genderless'}"></i>
                                    ${formatearGenero(dataset.label)}
                                </span>
                            </td>
                            <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                            <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                        </tr>
                    `;
                }
            });
        }
    });
    
    // Fila de total general
    if (datosProcesados.totalGeneral > 0) {
        tablaHTML += `
            <tr style="background: linear-gradient(135deg, #a8e6cf, #dcedc1); font-weight: bold;">
                <td colspan="2" style="padding: 12px; border-top: 2px solid #2ecc71;">
                    <i class="fas fa-chart-bar"></i> TOTAL GENERAL
                </td>
                <td style="text-align: center; border-top: 2px solid #2ecc71;">${datosProcesados.totalGeneral.toLocaleString()}</td>
            </tr>
        `;
    }
    
    tbody.innerHTML = tablaHTML;
}

// Función para actualizar tabla con datos agrupados
function actualizarTablaDatosAgrupados(datosProcesados) {
    const tbody = document.querySelector("#tablaDatos tbody");
    if (!tbody) return;
    
    let tablaHTML = '';
    const totalGeneral = datosProcesados.total || 0;
    
    // Para cada fecha
    datosProcesados.labels.forEach((fecha, fechaIndex) => {
        let totalFecha = 0;
        
        // Calcular total por fecha
        datosProcesados.datasets.forEach(dataset => {
            totalFecha += dataset.data[fechaIndex] || 0;
        });
        
        if (totalFecha > 0) {
            // Encabezado de fecha
            tablaHTML += `
                <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                    <td colspan="3" style="font-weight: bold; color: #2c3e50; padding: 12px; border-bottom: 2px solid #dee2e6;">
                        <i class="fas fa-calendar-day"></i> ${fecha} - Total: ${totalFecha} visitantes
                    </td>
                </tr>
            `;
            
            // Detalle por género para esta fecha
            datosProcesados.datasets.forEach(dataset => {
                const valor = dataset.data[fechaIndex] || 0;
                if (valor > 0) {
                    const porcentaje = totalFecha > 0 ? ((valor / totalFecha) * 100).toFixed(1) : 0;
                    const claseGenero = obtenerClaseGenero(dataset.label.trim().toLowerCase());
                    
                    tablaHTML += `
                        <tr>
                            <td style="padding-left: 30px;">
                                <span class="gender-badge-3d ${claseGenero}">
                                    <i class="fas ${dataset.label === 'Masculino' ? 'fa-mars' : dataset.label === 'Femenino' ? 'fa-venus' : 'fa-genderless'}"></i>
                                    ${formatearGenero(dataset.label)}
                                </span>
                            </td>
                            <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                            <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                        </tr>
                    `;
                }
            });
        }
    });
    
    // Fila de total general
    if (totalGeneral > 0) {
        tablaHTML += `
            <tr style="background: linear-gradient(135deg, #a8e6cf, #dcedc1); font-weight: bold;">
                <td colspan="2" style="padding: 12px; border-top: 2px solid #2ecc71;">
                    <i class="fas fa-chart-bar"></i> TOTAL GENERAL (${formatearFecha(datosProcesados.fechaInicial)} - ${formatearFecha(datosProcesados.fechaFinal)})
                </td>
                <td style="text-align: center; border-top: 2px solid #2ecc71;">${totalGeneral.toLocaleString()}</td>
            </tr>
        `;
    }
    
    tbody.innerHTML = tablaHTML;
}

// Función para actualizar tabla con datos simples (género específico)
function actualizarTablaDatosSimples(datosProcesados) {
    const tbody = document.querySelector("#tablaDatos tbody");
    if (!tbody) return;
    
    const total = datosProcesados.total || datosProcesados.values.reduce((a, b) => a + b, 0);
    
    let tablaHTML = datosProcesados.labels.map((fecha, index) => {
        const valor = datosProcesados.values[index];
        const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
        
        return `
            <tr>
                <td style="padding: 10px; font-weight: bold;">
                    <i class="fas fa-calendar-day"></i> ${fecha}
                </td>
                <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
            </tr>
        `;
    }).join('');
    
    // Fila de total
    if (total > 0) {
        tablaHTML += `
            <tr style="background: linear-gradient(135deg, #a8e6cf, #dcedc1); font-weight: bold;">
                <td style="padding: 12px;">
                    <i class="fas fa-users"></i> TOTAL ${formatearGenero(datosProcesados.genero)}
                </td>
                <td style="text-align: center;">${total.toLocaleString()}</td>
                <td style="text-align: center;">100%</td>
            </tr>
        `;
    }
    
    tbody.innerHTML = tablaHTML;
}

// Función para actualizar tabla de meses agrupados - VERSIÓN COMPLETA
function actualizarTablaMesesAgrupados(datosProcesados) {
    const tbody = document.querySelector("#tablaDatos tbody");
    if (!tbody) return;
    
    let tablaHTML = '';
    
    // Para cada mes
    datosProcesados.labels.forEach((mes, mesIndex) => {
        const totalMes = datosProcesados.totalPorPeriodo[mesIndex] || 0;
        
        if (totalMes > 0) {
            // Encabezado de mes
            tablaHTML += `
                <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                    <td colspan="3" style="font-weight: bold; color: #2c3e50; padding: 12px; border-bottom: 2px solid #dee2e6;">
                        <i class="fas fa-calendar-week"></i> ${mes} - Total: ${totalMes} visitantes
                    </td>
                </tr>
            `;
            
            // Detalle por género para este mes
            datosProcesados.datasets.forEach(dataset => {
                const valor = dataset.data[mesIndex] || 0;
                if (valor > 0) {
                    const porcentaje = totalMes > 0 ? ((valor / totalMes) * 100).toFixed(1) : 0;
                    const claseGenero = obtenerClaseGenero(dataset.label.trim().toLowerCase());
                    
                    tablaHTML += `
                        <tr>
                            <td style="padding-left: 30px;">
                                <span class="gender-badge ${claseGenero}">
                                    <i class="fas ${dataset.label === 'Masculino' ? 'fa-mars' : dataset.label === 'Femenino' ? 'fa-venus' : 'fa-genderless'}"></i>
                                    ${formatearGenero(dataset.label)}
                                </span>
                            </td>
                            <td style="text-align: center; font-weight: bold">${valor.toLocaleString()}</td>
                            <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                        </tr>
                    `;
                }
            });
        }
    });
    
    // Fila de total general
    if (datosProcesados.totalGeneral > 0) {
        tablaHTML += `
            <tr style="background: linear-gradient(135deg, #a8e6cf, #dcedc1); font-weight: bold;">
                <td colspan="2" style="padding: 12px; border-top: 2px solid #2ecc71;">
                    <i class="fas fa-chart-bar"></i> TOTAL GENERAL
                </td>
                <td style="text-align: center; border-top: 2px solid #2ecc71;">${datosProcesados.totalGeneral.toLocaleString()}</td>
            </tr>
        `;
    }
    
    tbody.innerHTML = tablaHTML;
}
