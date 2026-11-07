// CiudadSystem - utils
// Refactor modular: lógica original preservada.

// =============================================
    // FUNCIONES PARA RANGOS DE FECHA
    // =============================================

    async function aplicarRangoFechas(tipo) {
        let fechaInicio = document.getElementById(`filtro-${tipo}-inicio`)?.value;
        let fechaFin = document.getElementById(`filtro-${tipo}-fin`)?.value;
        
        if (!fechaInicio || !fechaFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Fechas requeridas',
                text: 'Por favor selecciona ambas fechas para el rango'
            });
            return;
        }
        
        // CORRECCIÓN: Formatear fechas correctamente según el tipo
        if (tipo === 'anio') {
            // Para año, las fechas ya son solo números
            if (parseInt(fechaInicio) > parseInt(fechaFin)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fechas inválidas',
                    text: 'El año inicial no puede ser mayor que el año final'
                });
                return;
            }
            // Formatear para consulta SQL
            fechaInicio = `${fechaInicio}-01-01`;
            fechaFin = `${fechaFin}-12-31`;
        } else if (tipo === 'mes') {
            // Para mes, necesitamos convertir a formato de fecha
            const meses = {
                'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
                'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
                'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
            };
            
            // Parsear mes y año
            const [mesInicioStr, añoInicio] = fechaInicio.split(' ');
            const [mesFinStr, añoFin] = fechaFin.split(' ');
            
            const mesInicio = meses[mesInicioStr];
            const mesFin = meses[mesFinStr];
            
            if (!mesInicio || !mesFin) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Formato inválido',
                    text: 'Por favor usa el formato "Mes Año" (ej: Enero 2023)'
                });
                return;
            }
            
            // Obtener último día del mes
            const ultimoDiaMes = new Date(parseInt(añoFin), parseInt(mesFin), 0).getDate();
            
            fechaInicio = `${añoInicio}-${mesInicio}-01`;
            fechaFin = `${añoFin}-${mesFin}-${ultimoDiaMes}`;
        } else {
            // Para fecha normal, validar orden
            if (fechaInicio > fechaFin) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fechas inválidas',
                    text: 'La fecha inicial no puede ser mayor que la fecha final'
                });
                return;
            }
        }

        try {
            mostrarLoading(`Cargando datos del rango de ${tipo}...`);
            
            let query = supabase
                .from('participantes_reserva')
                .select('id_ciudad, fecha_visita')
                .not('id_ciudad', 'is', null)
                .not('fecha_visita', 'is', null)
                .gte('fecha_visita', fechaInicio + 'T00:00:00')
                .lte('fecha_visita', fechaFin + 'T23:59:59');

            const { data: participantes, error } = await query;

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                await procesarDatosCiudadTiempo(participantes, tipo);
                mostrarInterfazCiudadTiempo(tipo);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Rango aplicado',
                    text: `Se encontraron ${participantes.length} participantes en el rango seleccionado`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                mostrarMensajeNoHayDatos('No hay participantes en el rango de fechas seleccionado');
            }

            cerrarLoading();
            
        } catch (error) {
            console.error('Error aplicando rango de fechas:', error);
            cerrarLoading();
            mostrarErrorCiudad('Error al aplicar el rango de fechas: ' + error.message);
        }
    }

// Funciones auxiliares para controles de fecha
    function getLabelFechaInicio(tipo) {
        switch(tipo) {
            case 'fecha': return 'Fecha Inicial';
            case 'mes': return 'Mes Inicial';
            case 'anio': return 'Año Inicial';
            default: return 'Inicio';
        }
    }

function getLabelFechaFin(tipo) {
        switch(tipo) {
            case 'fecha': return 'Fecha Final';
            case 'mes': return 'Mes Final';
            case 'anio': return 'Año Final';
            default: return 'Fin';
        }
    }

function getInputFechaInicio(tipo) {
        const fechaActual = new Date();
        switch(tipo) {
            case 'fecha': 
                const fechaInicioDefault = new Date(fechaActual);
                fechaInicioDefault.setMonth(fechaInicioDefault.getMonth() - 1);
                return `<input type="date" id="filtro-${tipo}-inicio" class="filtro-input" value="${fechaInicioDefault.toISOString().split('T')[0]}">`;
            case 'mes':
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                let añoInicio = fechaActual.getFullYear();
                let mesInicio = fechaActual.getMonth() - 1;
                if (mesInicio < 0) {
                    mesInicio = 11;
                    añoInicio--;
                }
                return `
                    <select id="filtro-${tipo}-inicio" class="filtro-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                        ${Array.from({length: 24}, (_, i) => {
                            const fecha = new Date(fechaActual);
                            fecha.setMonth(fecha.getMonth() - i);
                            const mes = fecha.getMonth();
                            const año = fecha.getFullYear();
                            const seleccionado = i === 1 ? 'selected' : '';
                            return `<option value="${meses[mes]} ${año}" ${seleccionado}>${meses[mes]} ${año}</option>`;
                        }).reverse().join('')}
                    </select>`;
            case 'anio':
                return `
                    <select id="filtro-${tipo}-inicio" class="filtro-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                        ${Array.from({length: 10}, (_, i) => {
                            const año = fechaActual.getFullYear() - i;
                            const seleccionado = i === 1 ? 'selected' : '';
                            return `<option value="${año}" ${seleccionado}>${año}</option>`;
                        }).join('')}
                    </select>`;
            default:
                return `<input type="date" id="filtro-${tipo}-inicio" class="filtro-input">`;
        }
    }

function getInputFechaFin(tipo) {
        const fechaActual = new Date();
        switch(tipo) {
            case 'fecha': 
                return `<input type="date" id="filtro-${tipo}-fin" class="filtro-input" value="${fechaActual.toISOString().split('T')[0]}">`;
            case 'mes':
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return `
                    <select id="filtro-${tipo}-fin" class="filtro-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                        ${Array.from({length: 24}, (_, i) => {
                            const fecha = new Date(fechaActual);
                            fecha.setMonth(fecha.getMonth() - i);
                            const mes = fecha.getMonth();
                            const año = fecha.getFullYear();
                            const seleccionado = i === 0 ? 'selected' : '';
                            return `<option value="${meses[mes]} ${año}" ${seleccionado}>${meses[mes]} ${año}</option>`;
                        }).reverse().join('')}
                    </select>`;
            case 'anio':
                return `
                    <select id="filtro-${tipo}-fin" class="filtro-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                        ${Array.from({length: 10}, (_, i) => {
                            const año = fechaActual.getFullYear() - i;
                            const seleccionado = i === 0 ? 'selected' : '';
                            return `<option value="${año}" ${seleccionado}>${año}</option>`;
                        }).join('')}
                    </select>`;
            default:
                return `<input type="date" id="filtro-${tipo}-fin" class="filtro-input" value="${fechaActual.toISOString().split('T')[0]}">`;
        }
    }

function llenarListaCiudades(tipo) {
        const datos = getDatosCiudadTiempo(tipo);
        const container = document.getElementById(`lista-ciudades-${tipo}`);
        
        if (!container) return;
        
        // Calcular totales por ciudad
        const ciudadesConTotal = datos.ciudades.map(ciudad => {
            const dataset = datos.datasets.find(d => d.label === ciudad);
            const total = dataset ? dataset.data.reduce((a, b) => a + b, 0) : 0;
            return { ciudad, total };
        });
        
        // Ordenar de mayor a menor
        ciudadesConTotal.sort((a, b) => b.total - a.total);
        
        container.innerHTML = ciudadesConTotal.map(item => {
            const porcentaje = datos.total > 0 ? ((item.total / datos.total) * 100).toFixed(1) : 0;
            const color = obtenerColorParaCiudad(item.ciudad);
            
            return `
                <div class="ciudad-item" style="padding: 8px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" 
                     onclick="window.CiudadSystem.mostrarDetalleCiudad('${tipo}', '${item.ciudad}')"
                     onmouseover="this.style.backgroundColor='#f8f9fa'" 
                     onmouseout="this.style.backgroundColor='transparent'">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
                        <span style="font-weight: 600; font-size: 14px;">${item.ciudad}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; font-size: 14px;">${item.total}</div>
                        <div style="font-size: 12px; color: #27ae60;">${porcentaje}%</div>
                    </div>
                </div>
            `;
        }).join('');
    }

function formatearFecha(fecha, tipo) {
        switch(tipo) {
            case 'fecha':
                const fechaObj = new Date(fecha);
                return fechaObj.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            case 'mes':
                return 'Mes completo';
            case 'anio':
                return 'Año completo';
            default:
                return fecha;
        }
    }

function obtenerDescripcionCiudad(ciudad) {
        const ciudadLower = ciudad.toLowerCase();
        if (ciudadLower.includes('bogotá') || ciudadLower.includes('bogota')) {
            return 'Capital de Colombia';
        } else if (ciudadLower.includes('medellín') || ciudadLower.includes('medellin')) {
            return 'Ciudad de la eterna primavera';
        } else if (ciudadLower.includes('cali')) {
            return 'Capital mundial de la salsa';
        } else if (ciudadLower === 'otras ciudades') {
            return `${datosCiudades.detallado.otrasCiudades.length} ciudades adicionales`;
        } else {
            return 'Ciudad de Colombia';
        }
    }

function getTituloTiempo(tipo) {
        const titulos = {
            'fecha': '🏙️ Ciudad por Fecha',
            'mes': '🏙️ Ciudad por Mes', 
            'anio': '🏙️ Ciudad por Año'
        };
        return titulos[tipo] || 'Ciudad por Tiempo';
    }

function getIconoTiempo(tipo) {
        const iconos = {
            'fecha': '<i class="fas fa-calendar-day"></i>',
            'mes': '<i class="fas fa-calendar-week"></i>',
            'anio': '<i class="fas fa-calendar-alt"></i>'
        };
        return iconos[tipo] || '<i class="fas fa-chart-bar"></i>';
    }

function getTituloColumna(tipo) {
        switch(tipo) {
            case 'fecha': return 'Fecha';
            case 'mes': return 'Mes';
            case 'anio': return 'Año';
            default: return 'Período';
        }
    }
