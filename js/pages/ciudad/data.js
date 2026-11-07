// CiudadSystem - data
// Refactor modular: lógica original preservada.

// =============================================
    // FUNCIONES PRINCIPALES DEL SISTEMA DE CIUDAD
    // =============================================

    // Función principal para cargar datos de ciudad
    async function cargarDatosCiudad() {
        try {
            console.log('🚀 Iniciando carga de datos de ciudad...');
            mostrarLoading('Cargando datos de ciudades...');

            // Obtener todos los participantes con ciudad
            const { data: participantes, error: errorParticipantes } = await supabase
                .from('participantes_reserva')
                .select('id_ciudad, fecha_visita')
                .not('id_ciudad', 'is', null);

            if (errorParticipantes) {
                console.error('Error al obtener participantes:', errorParticipantes);
                mostrarErrorCiudad();
                return;
            }

            console.log('Participantes con ciudades:', participantes);

            if (!participantes || participantes.length === 0) {
                mostrarSinDatosCiudad();
                return;
            }

            // Obtener IDs de ciudades únicos
            const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
            console.log('IDs de ciudades únicos:', idsCiudadesUnicos);

            // Obtener información de ciudades
            const { data: ciudades, error: errorCiudades } = await supabase
                .from('ciudades')
                .select('id, nombre')
                .in('id', idsCiudadesUnicos);

            if (errorCiudades) {
                console.error('Error al obtener ciudades:', errorCiudades);
                mostrarErrorCiudad();
                return;
            }

            console.log('Ciudades obtenidas:', ciudades);

            // Guardar todas las ciudades para el buscador
            todasLasCiudades = ciudades.map(c => c.nombre).sort();

            // Procesar datos de ciudades
            procesarDatosCiudad(participantes, ciudades);
            mostrarInterfazCiudad();

            cerrarLoading();
            
        } catch (error) {
            console.error('Error en cargarDatosCiudad:', error);
            cerrarLoading();
            mostrarErrorCiudad();
        }
    }

// Función para procesar datos de ciudad
    function procesarDatosCiudad(participantes, ciudades) {
        // Inicializar mapa de colores
        mapaColoresCiudades = {};
        
        // Conteo general por ciudad - ahora dinámico
        const conteoGeneral = {};
        let totalConCiudad = 0;
        let sinCiudad = 0;

        // Mapeo de IDs de ciudad a nombres
        const mapaCiudades = {};
        ciudades.forEach(ciudad => {
            mapaCiudades[ciudad.id] = ciudad.nombre;
            
            // Asignar color único a cada ciudad
            if (!mapaColoresCiudades[ciudad.nombre]) {
                // Usar color predefinido para ciudades principales
                const ciudadLower = ciudad.nombre.toLowerCase();
                if (ciudadLower.includes('bogotá') || ciudadLower.includes('bogota')) {
                    mapaColoresCiudades[ciudad.nombre] = '#e74c3c'; // Rojo
                } else if (ciudadLower.includes('medellín') || ciudadLower.includes('medellin')) {
                    mapaColoresCiudades[ciudad.nombre] = '#3498db'; // Azul
                } else if (ciudadLower.includes('cali')) {
                    mapaColoresCiudades[ciudad.nombre] = '#f39c12'; // Naranja
                } else if (ciudadLower.includes('barranquilla')) {
                    mapaColoresCiudades[ciudad.nombre] = '#2ecc71'; // Verde
                } else if (ciudadLower.includes('cartagena')) {
                    mapaColoresCiudades[ciudad.nombre] = '#9b59b6'; // Púrpura
                } else if (ciudadLower.includes('bucaramanga')) {
                    mapaColoresCiudades[ciudad.nombre] = '#1abc9c'; // Turquesa
                } else {
                    // Para otras ciudades, asignar color único
                    const index = Object.keys(mapaColoresCiudades).length % coloresBase.length;
                    mapaColoresCiudades[ciudad.nombre] = coloresBase[index];
                }
            }
        });

        // Contar participantes por ciudad
        participantes.forEach(participante => {
            if (participante.id_ciudad) {
                const nombreCiudad = mapaCiudades[participante.id_ciudad];
                if (nombreCiudad) {
                    // Contar por nombre exacto de ciudad
                    conteoGeneral[nombreCiudad] = (conteoGeneral[nombreCiudad] || 0) + 1;
                    totalConCiudad++;
                } else {
                    sinCiudad++;
                }
            } else {
                sinCiudad++;
            }
        });

        // Ordenar ciudades por cantidad (de mayor a menor)
        const conteoOrdenado = Object.entries(conteoGeneral)
            .sort((a, b) => b[1] - a[1]);

        // Separar en grupos para mejor visualización
        const ciudadesPrincipales = [];
        const otrasCiudades = [];
        
        conteoOrdenado.forEach(([ciudad, cantidad], index) => {
            if (index < 8) { // Top 8 ciudades principales
                ciudadesPrincipales.push({ ciudad, cantidad });
            } else {
                otrasCiudades.push({ ciudad, cantidad });
            }
        });

        // Si hay muchas "otras ciudades", agruparlas
        let otrasCiudadesTotal = 0;
        if (otrasCiudades.length > 0) {
            otrasCiudadesTotal = otrasCiudades.reduce((sum, item) => sum + item.cantidad, 0);
        }

        // Preparar datos finales para gráficos
        const labelsGrafico = [];
        const valuesGrafico = [];
        const coloresGrafico = [];
        
        // Agregar ciudades principales
        ciudadesPrincipales.forEach(item => {
            labelsGrafico.push(item.ciudad);
            valuesGrafico.push(item.cantidad);
            coloresGrafico.push(mapaColoresCiudades[item.ciudad] || '#95a5a6');
        });
        
        // Agregar "Otras" si hay
        if (otrasCiudadesTotal > 0) {
            labelsGrafico.push('Otras ciudades');
            valuesGrafico.push(otrasCiudadesTotal);
            coloresGrafico.push('#7f8c8d');
        }

        // Calcular estadísticas
        const totalParticipantes = totalConCiudad + sinCiudad;
        const totalCiudadesUnicas = Object.keys(conteoGeneral).length;

        // Guardar datos procesados
        datosCiudades = {
            general: {
                labels: labelsGrafico,
                values: valuesGrafico,
                colors: coloresGrafico,
                total: totalConCiudad
            },
            detallado: {
                todasLasCiudades: conteoOrdenado,
                ciudadesPrincipales: ciudadesPrincipales,
                otrasCiudades: otrasCiudades,
                totalOtras: otrasCiudadesTotal
            },
            estadisticas: {
                totalParticipantes: totalParticipantes,
                totalConCiudad: totalConCiudad,
                totalSinCiudad: sinCiudad,
                totalCiudadesUnicas: totalCiudadesUnicas,
                porcentajeConCiudad: totalParticipantes > 0 ? 
                    Math.round((totalConCiudad / totalParticipantes) * 100) : 0
            },
            rawData: participantes,
            ciudadesMapa: mapaCiudades,
            coloresMapa: mapaColoresCiudades
        };

        console.log('✅ Datos procesados:', datosCiudades);
        
        // Actualizar estadísticas en la UI
        actualizarEstadisticas();
    }

// =============================================
    // FUNCIONES PARA CIUDAD POR TIEMPO - CON BARRAS
    // =============================================

    async function cargarDatosCiudadTiempo(tipo) {
        try {
            mostrarLoading(`Cargando datos por ${tipo}...`);
            
            // Obtener participantes con ciudad y fecha
            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('id_ciudad, fecha_visita')
                .not('id_ciudad', 'is', null)
                .not('fecha_visita', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                await procesarDatosCiudadTiempo(participantes, tipo);
                mostrarInterfazCiudadTiempo(tipo);
            } else {
                mostrarSinDatosTiempo(tipo);
            }

            cerrarLoading();
            
        } catch (error) {
            console.error(`Error cargando datos de ${tipo}:`, error);
            cerrarLoading();
            mostrarErrorCiudad(`Error al cargar datos de ${tipo}: ` + error.message);
        }
    }

async function procesarDatosCiudadTiempo(participantes, tipo) {
        // Obtener información de ciudades
        const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
        
        const { data: ciudades, error } = await supabase
            .from('ciudades')
            .select('id, nombre')
            .in('id', idsCiudadesUnicos);

        if (error) throw error;

        const mapaCiudades = {};
        ciudades.forEach(ciudad => {
            mapaCiudades[ciudad.id] = ciudad.nombre;
        });

        const conteo = {};
        const todasLasFechas = [];
        
        // Agrupar por período de tiempo
        participantes.forEach(participante => {
            if (participante.fecha_visita) {
                const fecha = new Date(participante.fecha_visita);
                let clave = '';
                
                switch(tipo) {
                    case 'fecha':
                        clave = fecha.toISOString().split('T')[0];
                        break;
                    case 'mes':
                        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        clave = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                        break;
                    case 'anio':
                        clave = fecha.getFullYear().toString();
                        break;
                }
                
                // Agregar a todas las fechas para ordenamiento
                if (!todasLasFechas.includes(clave)) {
                    todasLasFechas.push(clave);
                }
                
                if (!conteo[clave]) {
                    conteo[clave] = {};
                }
                
                // Obtener nombre de ciudad
                const nombreCiudad = mapaCiudades[participante.id_ciudad] || 'Desconocida';
                
                // Contar por ciudad
                if (!conteo[clave][nombreCiudad]) {
                    conteo[clave][nombreCiudad] = 0;
                }
                conteo[clave][nombreCiudad]++;
            }
        });

        // Ordenar fechas
        let labels = ordenarFechas(todasLasFechas, tipo);

        // Obtener todas las ciudades únicas para las series
        const todasCiudadesUnicas = new Set();
        Object.values(conteo).forEach(periodo => {
            Object.keys(periodo).forEach(ciudad => {
                todasCiudadesUnicas.add(ciudad);
            });
        });

        // Convertir a array y ordenar alfabéticamente
        const ciudadesArray = Array.from(todasCiudadesUnicas).sort();

        // Preparar datasets para gráficas AGRUPADAS
        const datasets = ciudadesArray.map(ciudad => {
            // Determinar color basado en la ciudad
            const color = obtenerColorParaCiudad(ciudad);
            
            return {
                label: ciudad,
                data: labels.map(label => conteo[label] ? (conteo[label][ciudad] || 0) : 0),
                backgroundColor: color + 'CC', // Agregar transparencia
                borderColor: color,
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
                categoryPercentage: 0.8,
                barPercentage: 0.9
            };
        });

        // Ordenar datasets por total (mayor a menor)
        const datasetsOrdenados = datasets.sort((a, b) => {
            const totalA = a.data.reduce((sum, val) => sum + val, 0);
            const totalB = b.data.reduce((sum, val) => sum + val, 0);
            return totalB - totalA;
        });

        const datosTiempo = {
            labels: labels,
            datasets: datasetsOrdenados,
            ciudades: ciudadesArray,
            total: participantes.length,
            conteo: conteo
        };

        // Guardar datos
        switch(tipo) {
            case 'fecha': datosFechaCiudad = datosTiempo; break;
            case 'mes': datosMesCiudad = datosTiempo; break;
            case 'anio': datosAnioCiudad = datosTiempo; break;
        }

        console.log(`✅ Datos ${tipo} procesados para gráficas agrupadas:`, datosTiempo);
        return datosTiempo;
    }

function actualizarEstadisticas() {
        const stats = datosCiudades.estadisticas;
        
        // Actualizar tarjetas de estadísticas
        if (document.getElementById('total-visitantes')) {
            document.getElementById('total-visitantes').textContent = 
                stats.totalParticipantes.toLocaleString();
        }
        
        if (document.getElementById('visitantes-con-ciudad')) {
            document.getElementById('visitantes-con-ciudad').textContent = 
                stats.totalConCiudad.toLocaleString();
        }
        
        if (document.getElementById('total-ciudades')) {
            document.getElementById('total-ciudades').textContent = 
                stats.totalCiudadesUnicas.toLocaleString();
        }
    }

// =============================================
    // FUNCIONES AUXILIARES
    // =============================================

    function getDatosCiudadTiempo(tipo) {
        switch(tipo) {
            case 'fecha': return datosFechaCiudad || { labels: [], datasets: [], ciudades: [], total: 0 };
            case 'mes': return datosMesCiudad || { labels: [], datasets: [], ciudades: [], total: 0 };
            case 'anio': return datosAnioCiudad || { labels: [], datasets: [], ciudades: [], total: 0 };
            default: return { labels: [], datasets: [], ciudades: [], total: 0 };
        }
    }
