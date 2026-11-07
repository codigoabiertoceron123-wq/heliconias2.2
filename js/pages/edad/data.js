// EdadSystem - data
// Refactor modular: lógica original preservada.

async function cargarDatosEdades() {
        try {
            mostrarLoadingEdad('Cargando datos de edad...');

            console.log('Consultando datos de edades...');
            
            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select(`
                    fecha_nacimiento,
                    fecha_visita,
                    id_genero,
                    nombre,
                    apellido,
                    genero!inner(genero)
                `)
                .not('fecha_nacimiento', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                procesarDatosEdades(participantes);
                mostrarDatosEdad();
            } else {
                mostrarSinDatosEdad();
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error('Error cargando edades:', error);
            cerrarLoadingEdad();
            mostrarErrorEdad(error.message);
        }
    }

function procesarDatosEdades(participantes) {
        const conteoEdades = {
            '0-17': 0, '18-25': 0, '26-35': 0, 
            '36-50': 0, '51-65': 0, '66+': 0
        };

        const edadesIndividuales = [];
        let sumaEdades = 0;
        let totalConEdad = 0;

        participantes.forEach(participante => {
            const fechaNacimiento = participante.fecha_nacimiento;
            if (fechaNacimiento) {
                const edad = calcularEdad(fechaNacimiento);
                if (edad !== null && edad >= 0 && edad <= 120) {
                    const categoria = clasificarEdad(edad);
                    conteoEdades[categoria]++;
                    edadesIndividuales.push(edad);
                    sumaEdades += edad;
                    totalConEdad++;
                }
            }
        });

        const edadPromedio = totalConEdad > 0 ? Math.round(sumaEdades / totalConEdad) : 0;
        const edadMinima = edadesIndividuales.length > 0 ? Math.min(...edadesIndividuales) : 0;
        const edadMaxima = edadesIndividuales.length > 0 ? Math.max(...edadesIndividuales) : 0;

        // Actualizar estadísticas
        document.getElementById('total-visitantes').textContent = totalConEdad.toLocaleString();
        document.getElementById('edad-promedio').textContent = edadPromedio + ' años';
        document.getElementById('total-grupos').textContent = Object.values(conteoEdades).filter(val => val > 0).length;

        datosSimuladosEdad = {
            edad: {
                labels: Object.keys(conteoEdades),
                values: Object.values(conteoEdades)
            },
            estadisticas: {
                total: totalConEdad,
                promedio: edadPromedio,
                minima: edadMinima,
                maxima: edadMaxima
            },
            datosOriginales: participantes
        };

        datosOriginalesEdad = JSON.parse(JSON.stringify(datosSimuladosEdad));
    }

// Procesar datos para gráficas AGRUPADAS por tiempo y edad
    function procesarDatosTiempoAgrupados(participantes, tipo) {
        console.log(`🔄 Procesando datos AGRUPADOS de: ${tipo}`);
        
        const datosPorTiempo = {};
        const rangosEdad = ['0-17', '18-25', '26-35', '36-50', '51-65', '66+'];
        const fechasSet = new Set();
        
        // Inicializar estructura para cada rango de edad
        rangosEdad.forEach(rango => {
            datosPorTiempo[rango] = {};
        });
        
        // Procesar cada participante
        participantes.forEach(participante => {
            if (participante.fecha_visita && participante.fecha_nacimiento) {
                const fecha = new Date(participante.fecha_visita);
                const edad = calcularEdad(participante.fecha_nacimiento);
                
                if (edad !== null) {
                    const rango = clasificarEdad(edad);
                    let claveFecha = '';
                    
                    // Determinar clave según tipo
                    switch(tipo) {
                        case 'fecha':
                            claveFecha = fecha.toISOString().split('T')[0];
                            break;
                        case 'mes':
                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                            claveFecha = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                            break;
                        case 'anio':
                            claveFecha = fecha.getFullYear().toString();
                            break;
                    }
                    
                    fechasSet.add(claveFecha);
                    
                    // Contar en el rango correspondiente
                    if (datosPorTiempo[rango][claveFecha]) {
                        datosPorTiempo[rango][claveFecha]++;
                    } else {
                        datosPorTiempo[rango][claveFecha] = 1;
                    }
                }
            }
        });
        
        // Ordenar fechas
        const fechasOrdenadas = Array.from(fechasSet).sort((a, b) => {
            switch(tipo) {
                case 'fecha': return new Date(a) - new Date(b);
                case 'mes': return ordenarMeses(a, b);
                case 'anio': return parseInt(a) - parseInt(b);
                default: return 0;
            }
        });
        
        // Limitar a las últimas fechas si son muchas
        let fechasMostrar = fechasOrdenadas;
        if (tipo === 'fecha' && fechasOrdenadas.length > 10) {
            fechasMostrar = fechasOrdenadas.slice(-10);
        } else if (tipo === 'mes' && fechasOrdenadas.length > 12) {
            fechasMostrar = fechasOrdenadas.slice(-12);
        }
        
        // Preparar datasets para Chart.js (BARRAS AGRUPADAS)
        const datasets = rangosEdad.map((rango, index) => {
            const datosRango = datosPorTiempo[rango] || {};
            const data = fechasMostrar.map(fecha => datosRango[fecha] || 0);
            
            // Verificar si este rango tiene datos
            const totalRango = data.reduce((sum, val) => sum + val, 0);
            
            if (totalRango > 0) {
                return {
                    label: `${rango} años`,
                    data: data,
                    backgroundColor: coloresPorEdad[rango],
                    borderColor: darkenColor(coloresPorEdad[rango], 0.2),
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 15,
                    hidden: false
                };
            } else {
                return null;
            }
        }).filter(dataset => dataset !== null);
        
        // Si no hay datos, crear uno vacío
        if (datasets.length === 0) {
            datasets.push({
                label: 'Sin datos',
                data: fechasMostrar.map(() => 0),
                backgroundColor: '#95a5a6'
            });
        }
        
        // Guardar datos en formato AGRUPADO
        const datosTiempo = {
            labels: fechasMostrar,
            datasets: datasets,
            rangosEdad: datasets.map(d => d.label.replace(' años', '')),
            fechas: fechasMostrar,
            total: datasets.reduce((total, dataset) => 
                total + dataset.data.reduce((sum, val) => sum + val, 0), 0)
        };
        
        console.log(`✅ Datos AGUPADOS de ${tipo} procesados:`, datosTiempo);
        
        // Guardar según tipo
        switch(tipo) {
            case 'fecha': 
                datosFechaAgrupados = datosTiempo;
                break;
            case 'mes': 
                datosMesAgrupados = datosTiempo;
                break;
            case 'anio': 
                datosAnioAgrupados = datosTiempo;
                break;
        }
        
        return datosTiempo;
    }

// Función principal para cargar datos de tiempo
    async function cargarDatosTiempo(tipo) {
        try {
            mostrarLoadingEdad(`Cargando datos por ${tipo}...`);
            
            console.log(`📊 Cargando datos AGUPADOS para: ${tipo}`);
            
            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('fecha_visita, fecha_nacimiento')
                .not('fecha_visita', 'is', null)
                .not('fecha_nacimiento', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                // Procesar datos para gráficas AGRUPADAS
                const datosProcesados = procesarDatosTiempoAgrupados(participantes, tipo);
                console.log(`✅ Datos procesados para ${tipo}:`, datosProcesados);
                
                // Mostrar interfaz con gráficas agrupadas
                mostrarInterfazTiempoAgrupada(tipo, datosProcesados);
            } else {
                console.warn(`⚠️ No hay participantes con fecha de visita para ${tipo}`);
                mostrarSinDatosTiempo(tipo);
            }

            cerrarLoadingEdad();
            
        } catch (error) {
            console.error(`❌ Error cargando datos de ${tipo}:`, error);
            cerrarLoadingEdad();
            mostrarErrorEdad(`Error al cargar datos de ${tipo}: ` + error.message);
        }
    }

// Procesar datos por tiempo
    function procesarDatosTiempo(participantes, tipo) {
        const conteo = {};
        const ahora = new Date();
        
        participantes.forEach(participante => {
            if (participante.fecha_visita) {
                const fecha = new Date(participante.fecha_visita);
                let clave = '';
                
                switch(tipo) {
                    case 'fecha':
                        // Formato: YYYY-MM-DD
                        clave = fecha.toISOString().split('T')[0];
                        break;
                    case 'mes':
                        // Formato: YYYY-MM (Enero 2024)
                        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        clave = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                        break;
                    case 'anio':
                        // Formato: YYYY
                        clave = fecha.getFullYear().toString();
                        break;
                }
                
                conteo[clave] = (conteo[clave] || 0) + 1;
            }
        });

        // Ordenar datos
        let labels, values;
        
        switch(tipo) {
            case 'fecha':
                // Ordenar fechas cronológicamente
                labels = Object.keys(conteo).sort((a, b) => new Date(a) - new Date(b));
                // Tomar las últimas 10 fechas (más recientes)
                labels = labels.slice(-10);
                break;
            case 'mes':
                // Ordenar meses cronológicamente
                labels = Object.keys(conteo).sort((a, b) => {
                    const [mesA, añoA] = a.split(' ');
                    const [mesB, añoB] = b.split(' ');
                    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    return new Date(añoA, meses.indexOf(mesA)) - new Date(añoB, meses.indexOf(mesB));
                });
                break;
            case 'anio':
                // Ordenar años cronológicamente
                labels = Object.keys(conteo).sort((a, b) => parseInt(a) - parseInt(b));
                break;
        }
        
        values = labels.map(label => conteo[label]);

        // Guardar datos
        const datosTiempo = {
            labels: labels,
            values: values,
            total: values.reduce((a, b) => a + b, 0)
        };

        switch(tipo) {
            case 'fecha': datosFecha = datosTiempo; break;
            case 'mes': datosMes = datosTiempo; break;
            case 'anio': datosAnio = datosTiempo; break;
        }

        console.log(`✅ Datos ${tipo} procesados:`, datosTiempo);
    }

function procesarDatosTiempoInteligente(participantes, tipo, rangoEdad) {
        console.log(`Procesando para ${tipo} con edad: ${rangoEdad}`);
        
        const datos = {
            labels: [],
            datasets: []
        };

        const conteoPorTiempo = {};
        const todosLosRangos = ['0-17', '18-25', '26-35', '36-50', '51-65', '66+'];

        // Procesar cada participante
        participantes.forEach(participante => {
            if (participante.fecha_visita) {
                const fecha = new Date(participante.fecha_visita);
                const edad = calcularEdad(participante.fecha_nacimiento);
                
                if (edad !== null) {
                    const categoriaEdad = clasificarEdad(edad);
                    
                    // Solo procesar si es "todas" o la edad específica seleccionada
                    if (rangoEdad === 'todos' || categoriaEdad === rangoEdad) {
                        let claveTiempo = '';
                        
                        switch(tipo) {
                            case 'fecha':
                                claveTiempo = fecha.toISOString().split('T')[0];
                                break;
                            case 'mes':
                                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                claveTiempo = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                                break;
                            case 'anio':
                                claveTiempo = fecha.getFullYear().toString();
                                break;
                        }

                        if (!conteoPorTiempo[claveTiempo]) {
                            conteoPorTiempo[claveTiempo] = {
                                '0-17': 0, '18-25': 0, '26-35': 0, 
                                '36-50': 0, '51-65': 0, '66+': 0
                            };
                        }
                        
                        conteoPorTiempo[claveTiempo][categoriaEdad]++;
                    }
                }
            }
        });

        // Preparar datos para gráficas
        datos.labels = Object.keys(conteoPorTiempo).sort((a, b) => {
            switch(tipo) {
                case 'fecha': return new Date(a) - new Date(b);
                case 'mes': return ordenarMeses(a, b);
                case 'anio': return parseInt(a) - parseInt(b);
                default: return 0;
            }
        });

        if (rangoEdad === 'todos') {
            // Mostrar todas las edades
            todosLosRangos.forEach(rango => {
                datos.datasets.push({
                    label: `${rango} años`,
                    data: datos.labels.map(label => conteoPorTiempo[label][rango] || 0),
                    backgroundColor: coloresPorEdad[rango],
                    borderRadius: 8,
                    barThickness: 20,
                });
            });
        } else {
            // Mostrar solo la edad seleccionada
            datos.datasets.push({
                label: `${rangoEdad} años`,
                data: datos.labels.map(label => conteoPorTiempo[label][rangoEdad] || 0),
                backgroundColor: coloresPorEdad[rangoEdad],
                borderRadius: 8,
                barThickness: 35,
            });
        }

        // Guardar datos
        switch(tipo) {
            case 'fecha': datosFechaInteligente = datos; break;
            case 'mes': datosMesInteligente = datos; break;
            case 'anio': datosAnioInteligente = datos; break;
        }

        console.log(`✅ Datos inteligentes ${tipo}:`, datos);
    }

function getDatosTiempoCombinado(tipo) {
        switch(tipo) {
            case 'fecha': return datosFechaCombinado;
            case 'mes': return datosMesCombinado;
            case 'anio': return datosAnioCombinado;
            default: return { porTiempo: {}, porEdadYTiempo: {} };
        }
    }

function procesarDatosTiempoConEdad(participantes, tipo, rangoEdad) {
        console.log(`🔄 Procesando datos AGRUPADOS con filtros: ${tipo}, Rango: ${rangoEdad}`);
        
        const datosPorTiempo = {};
        const rangosEdad = ['0-17', '18-25', '26-35', '36-50', '51-65', '66+'];
        const fechasSet = new Set();
        
        // Determinar qué rangos incluir
        let rangosAIncluir = [];
        if (rangoEdad === 'todos') {
            // Incluir todos los rangos
            rangosAIncluir = rangosEdad;
        } else {
            // Solo el rango específico seleccionado
            rangosAIncluir = [rangoEdad];
        }
        
        // Inicializar estructura para cada rango a incluir
        rangosAIncluir.forEach(rango => {
            datosPorTiempo[rango] = {};
        });
        
        // Procesar cada participante
        participantes.forEach(participante => {
            if (participante.fecha_visita && participante.fecha_nacimiento) {
                const fecha = new Date(participante.fecha_visita);
                const edad = calcularEdad(participante.fecha_nacimiento);
                
                if (edad !== null) {
                    const rango = clasificarEdad(edad);
                    let claveFecha = '';
                    
                    // Determinar clave según tipo
                    switch(tipo) {
                        case 'fecha':
                            claveFecha = fecha.toISOString().split('T')[0];
                            break;
                        case 'mes':
                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                            claveFecha = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
                            break;
                        case 'anio':
                            claveFecha = fecha.getFullYear().toString();
                            break;
                    }
                    
                    // Solo procesar si el rango está en los rangos a incluir
                    if (rangosAIncluir.includes(rango)) {
                        fechasSet.add(claveFecha);
                        
                        // Contar en el rango correspondiente
                        if (datosPorTiempo[rango][claveFecha]) {
                            datosPorTiempo[rango][claveFecha]++;
                        } else {
                            datosPorTiempo[rango][claveFecha] = 1;
                        }
                    }
                }
            }
        });
        
        // Ordenar fechas
        const fechasOrdenadas = Array.from(fechasSet).sort((a, b) => {
            switch(tipo) {
                case 'fecha': return new Date(a) - new Date(b);
                case 'mes': return ordenarMeses(a, b);
                case 'anio': return parseInt(a) - parseInt(b);
                default: return 0;
            }
        });
        
        // Limitar a las últimas fechas si son muchas
        let fechasMostrar = fechasOrdenadas;
        if (tipo === 'fecha' && fechasOrdenadas.length > 10) {
            fechasMostrar = fechasOrdenadas.slice(-10);
        } else if (tipo === 'mes' && fechasOrdenadas.length > 12) {
            fechasMostrar = fechasOrdenadas.slice(-12);
        }
        
        // Preparar datasets para Chart.js (BARRAS AGRUPADAS)
        const datasets = rangosAIncluir.map((rango, index) => {
            const datosRango = datosPorTiempo[rango] || {};
            const data = fechasMostrar.map(fecha => datosRango[fecha] || 0);
            
            // Verificar si este rango tiene datos
            const totalRango = data.reduce((sum, val) => sum + val, 0);
            
            if (totalRango > 0 || rangoEdad !== 'todos') {
                return {
                    label: `${rango} años`,
                    data: data,
                    backgroundColor: coloresPorEdad[rango],
                    borderColor: darkenColor(coloresPorEdad[rango], 0.2),
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: rangoEdad === 'todos' ? 15 : 35, // Más ancho si solo hay un rango
                    hidden: false
                };
            } else {
                return null; // No incluir rangos sin datos
            }
        }).filter(dataset => dataset !== null); // Filtrar rangos sin datos
        
        // Si no hay datasets (todos los rangos estaban vacíos)
        if (datasets.length === 0) {
            datasets.push({
                label: rangoEdad === 'todos' ? 'Sin datos' : `${rangoEdad} años`,
                data: fechasMostrar.map(() => 0),
                backgroundColor: rangoEdad === 'todos' ? '#95a5a6' : coloresPorEdad[rangoEdad],
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 35
            });
        }
        
        // Calcular total general
        const totalGeneral = datasets.reduce((total, dataset) => 
            total + dataset.data.reduce((sum, val) => sum + val, 0), 0);
        
        // Estructura de datos final (FORMATO AGRUPADO)
        const datosFiltrados = {
            labels: fechasMostrar,
            datasets: datasets,
            rangosEdad: datasets.map(d => d.label.replace(' años', '')),
            fechas: fechasMostrar,
            total: totalGeneral,
            filtrosAplicados: {
                rangoEdad: rangoEdad,
                participantesAnalizados: participantes.length
            }
        };
        
        console.log(`✅ Datos AGRUPADOS filtrados de ${tipo} procesados:`, datosFiltrados);
        
        // Guardar datos según el tipo para uso en el modal
        switch(tipo) {
            case 'fecha': 
                datosFechaAgrupados = datosFiltrados;
                break;
            case 'mes': 
                datosMesAgrupados = datosFiltrados;
                break;
            case 'anio': 
                datosAnioAgrupados = datosFiltrados;
                break;
        }
        
        return datosFiltrados;
    }

function getDatosTiempo(tipo) {
        switch(tipo) {
            case 'fecha': return datosFecha;
            case 'mes': return datosMes;
            case 'anio': return datosAnio;
            default: return { labels: [], values: [], total: 0 };
        }
    }

// En edad-system.js, busca la función getDatosTiempoInteligente y reemplázala por:
    function getDatosTiempoInteligente(tipo) {
        let datos;
        switch(tipo) {
            case 'fecha': 
                datos = datosFechaInteligente; 
                console.log('📅 Datos fecha inteligente:', datos);
                break;
            case 'mes': 
                datos = datosMesInteligente; 
                console.log('📊 Datos mes inteligente:', datos);
                break;
            case 'anio': 
                datos = datosAnioInteligente; 
                console.log('📈 Datos año inteligente:', datos);
                break;
            default: 
                datos = { labels: [], datasets: [], rangosEdad: [], fechas: [], total: 0 };
        }
        
        // Asegurar que tenga la estructura correcta
        if (!datos || !datos.datasets) {
            console.warn(`⚠️ Datos ${tipo} no tienen estructura correcta, inicializando...`);
            return {
                labels: [],
                datasets: [],
                rangosEdad: [],
                fechas: [],
                total: 0
            };
        }
        
        // Si hay datasets pero están vacíos, asegurar que tengan datos
        if (datos.datasets.length === 0) {
            datos.datasets = [{
                label: 'Sin datos',
                data: datos.labels.map(() => 0),
                backgroundColor: '#95a5a6',
                borderWidth: 1,
                borderRadius: 6
            }];
        }
        
        return datos;
    }
