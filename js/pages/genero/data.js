// Genero - data
// Refactor modular: lógica original preservada.

// Función auxiliar para procesar cualquier período (fecha, mes, año) de manera consistente
async function procesarDatosPorPeriodo(tipoPeriodo, fechaInicial, fechaFinal, generoSeleccionado = 'todos') {
    console.log(`📊 Procesando ${tipoPeriodo}:`, { fechaInicial, fechaFinal, generoSeleccionado });
    
    try {
        // CONSULTA base para obtener datos
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select(`
                fecha_visita,
                genero!inner(id_genero, genero)
            `)
            .not('fecha_visita', 'is', null)
            .not('id_genero', 'is', null)
            .gte('fecha_visita', fechaInicial + 'T00:00:00')
            .lte('fecha_visita', fechaFinal + 'T23:59:59')
            .order('fecha_visita', { ascending: true });

        if (error) throw error;

        if (!participantes || participantes.length === 0) {
            return { type: 'grouped', labels: [], datasets: [], totalGeneral: 0 };
        }

        // Obtener todos los géneros
        const { data: generos } = await supabase
            .from('genero')
            .select('id_genero, genero')
            .order('id_genero');

        // Determinar formato de etiquetas según tipoPeriodo
        const formatearEtiqueta = (fechaStr) => {
            const fecha = new Date(fechaStr);
            switch(tipoPeriodo) {
                case 'fecha':
                    return formatearFechaCorta(fechaStr); // 20-ene
                case 'mes':
                    return `${obtenerNombreMesAbreviado(fecha.getMonth())}-${fecha.getFullYear()}`; // ene-2024
                case 'anio':
                    return fecha.getFullYear().toString(); // 2024
                default:
                    return fechaStr;
            }
        };

        // Agrupar por período y género
        const datosPorPeriodo = {};
        const periodosUnicos = new Set();
        const todosLosGeneros = generos.map(g => g.genero);
        
        // Inicializar estructura
        participantes.forEach(participante => {
            if (participante.fecha_visita && participante.genero) {
                const periodo = formatearEtiqueta(participante.fecha_visita);
                const genero = participante.genero.genero;
                
                periodosUnicos.add(periodo);
                
                if (!datosPorPeriodo[periodo]) {
                    datosPorPeriodo[periodo] = {};
                    todosLosGeneros.forEach(g => {
                        datosPorPeriodo[periodo][g] = 0;
                    });
                }
                
                if (datosPorPeriodo[periodo][genero] !== undefined) {
                    datosPorPeriodo[periodo][genero]++;
                }
            }
        });

        // Ordenar períodos cronológicamente
        const periodosOrdenados = Array.from(periodosUnicos).sort((a, b) => {
            // Convertir a fecha para ordenar correctamente
            const getDateFromPeriod = (periodo) => {
                if (tipoPeriodo === 'anio') {
                    return new Date(periodo, 0, 1);
                } else if (tipoPeriodo === 'mes') {
                    const [mes, año] = periodo.split('-');
                    const mesNum = obtenerNumeroMes(mes);
                    return new Date(año, mesNum, 1);
                } else {
                    // Para fecha, usar el primer día del mes
                    const partes = periodo.split('-');
                    if (partes.length === 2) {
                        const dia = parseInt(partes[0]);
                        const mes = obtenerNumeroMes(partes[1]);
                        return new Date(new Date().getFullYear(), mes, dia);
                    }
                    return new Date();
                }
            };
            return getDateFromPeriod(a) - getDateFromPeriod(b);
        });

        // Crear datasets para cada género
        const datasets = todosLosGeneros.map(genero => {
            const color = coloresPorGenero[genero] || '#95a5a6';
            return {
                label: genero,
                data: periodosOrdenados.map(periodo => datosPorPeriodo[periodo]?.[genero] || 0),
                backgroundColor: color,
                borderColor: darkenColor(color, 0.3),
                borderWidth: 2,
                borderRadius: 6,
                barThickness: tipoPeriodo === 'anio' ? 25 : 20,
                barPercentage: 0.8,
                categoryPercentage: 0.9
            };
        });

        // Filtrar si es género específico
        let datasetsFinales = datasets;
        if (generoSeleccionado !== 'todos') {
            const generoDataset = datasets.find(d => d.label === generoSeleccionado);
            datasetsFinales = generoDataset ? [{
                ...generoDataset,
                label: formatearGenero(generoSeleccionado),
                backgroundColor: coloresPorGenero[generoSeleccionado] || '#3498db'
            }] : datasets;
        }

        // Calcular totales
        const totalPorPeriodo = periodosOrdenados.map(periodo => 
            todosLosGeneros.reduce((sum, genero) => sum + (datosPorPeriodo[periodo]?.[genero] || 0), 0)
        );
        
        const totalGeneral = totalPorPeriodo.reduce((a, b) => a + b, 0);

        return {
            type: 'grouped',
            labels: periodosOrdenados,
            datasets: datasetsFinales,
            totalPorPeriodo: totalPorPeriodo,
            totalGeneral: totalGeneral,
            generos: todosLosGeneros,
            generoFiltrado: generoSeleccionado !== 'todos' ? generoSeleccionado : null
        };

    } catch (error) {
        console.error(`💥 Error procesando ${tipoPeriodo}:`, error);
        throw error;
    }
}

// data-functions.js - Versión con mejor validación
async function cargarDatosGeneros() {
    try {
        console.log('=== INICIANDO CARGA DE DATOS ===');
        
        // Intentar obtener el cliente de diferentes maneras
        let supabaseClient = null;
        
        // Opción 1: window.supabaseClient
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            supabaseClient = window.supabaseClient;
            console.log('✅ Usando window.supabaseClient');
        }
        // Opción 2: window.supabase
        else if (window.supabase && typeof window.supabase.from === 'function') {
            supabaseClient = window.supabase;
            console.log('✅ Usando window.supabase');
        }
        // Opción 3: crear nuevo cliente
        else {
            console.warn('⚠️ Cliente Supabase no encontrado, creando uno nuevo...');
            const SUPABASE_URL = 'https://umncnddwzmjxgmvisvqz.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbmNuZGR3em1qeGdtdmlzdnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDIyNzksImV4cCI6MjA3ODExODI3OX0.ODvus28cTCTD8gGewQ2sAZ8PcXbEe4CIy_zv6bip8J0';
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabaseClient = supabaseClient;
            window.supabase = supabaseClient;
        }
        
        // Verificación final
        if (!supabaseClient || typeof supabaseClient.from !== 'function') {
            throw new Error('Supabase no está inicializado correctamente. from no es una función.');
        }
        
        console.log('✅ Cliente Supabase verificado, procediendo a cargar datos...');
        
        // Obtener datos de género
        const { data: generos, error: generosError } = await supabaseClient
            .from('genero')
            .select('*');
        
        if (generosError) {
            throw new Error('Error cargando géneros: ' + generosError.message);
        }
        
        console.log('✅ Géneros cargados:', generos);
        
        // Obtener participantes
        const { data: participantes, error: participantesError } = await supabaseClient
            .from('participantes_reserva')
            .select('id_genero')
            .not('id_genero', 'is', null);
        
        if (participantesError) {
            throw new Error('Error cargando participantes: ' + participantesError.message);
        }
        
        console.log('✅ Participantes cargados:', participantes.length);
        
        // Procesar datos
        const conteoGeneros = {};
        participantes.forEach(p => {
            if (p.id_genero) {
                conteoGeneros[p.id_genero] = (conteoGeneros[p.id_genero] || 0) + 1;
            }
        });
        
        console.log('📊 Conteo por género:', conteoGeneros);
        
        // Crear mapeo de nombres
        const nombresGenero = {};
        if (generos && generos.length > 0) {
            generos.forEach(g => {
                nombresGenero[g.id_genero] = g.nombre_genero || `Género ${g.id_genero}`;
            });
        } else {
            // Mapeo por defecto si no hay datos en tabla genero
            nombresGenero[1] = 'Masculino';
            nombresGenero[2] = 'Femenino';
            nombresGenero[3] = 'No binario';
            nombresGenero[4] = 'Prefiero no decir';
            nombresGenero[5] = 'Otro';
        }
        
        // Mostrar resultados
        mostrarResultadosGenero(conteoGeneros, nombresGenero);
        
    } catch (error) {
        console.error('❌ Error cargando géneros:', error);
        mostrarError('Error al cargar datos: ' + error.message);
    }
}

// Función para cargar datos desde participantes_reserva
async function cargarDatosDesdeParticipantes(generos) {
    try {
        console.log('=== DIAGNÓSTICO: Consultando participantes_reserva ===');
        
        // PRIMERO: Consulta directa a participantes_reserva con fecha_visita
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select('id_genero, fecha_visita')
            .not('id_genero', 'is', null);

        if (error) {
            console.error('❌ Error en consulta simple:', error);
            throw error;
        }

        console.log('✅ Participantes encontrados:', participantes);
        console.log('Total de participantes con género:', participantes.length);

        // Contar participantes por género y procesar fechas
        const conteoPorGenero = {};
        const fechasVisitas = [];
        
        participantes.forEach(participante => {
            if (participante.id_genero) {
                const generoId = participante.id_genero;
                conteoPorGenero[generoId] = (conteoPorGenero[generoId] || 0) + 1;
                
                // Obtener la fecha de visita directamente de participantes_reserva
                if (participante.fecha_visita) {
                    fechasVisitas.push({
                        fecha: participante.fecha_visita,
                        generoId: participante.id_genero
                    });
                }
            }
        });

        console.log('📊 Conteo REAL por género:', conteoPorGenero);
        console.log('📅 Fechas REALES de visita:', fechasVisitas);

        // Combinar datos de géneros con conteos REALES
        const datosCombinados = generos.map(genero => {
            return {
                genero: genero.genero,
                count: conteoPorGenero[genero.id_genero] || 0
            };
        });

        console.log('🎯 Datos combinados REALES:', datosCombinados);
        
        // Verificar si hay datos
        const totalVisitantes = datosCombinados.reduce((sum, item) => sum + item.count, 0);
        console.log('👥 Total de visitantes con género:', totalVisitantes);

        if (totalVisitantes === 0) {
            console.warn('⚠️  No se encontraron participantes con género en la base de datos');
            throw new Error('No hay datos reales');
        } else {
            procesarDatosGeneros(datosCombinados);
            
            // Procesar datos adicionales con las fechas reales
            if (fechasVisitas.length === 0) {
                console.warn('⚠️  No se encontraron fechas de visita');
                // Usar solo datos de género sin fechas
                await cargarDatosAdicionalesReales([], generos);
            } else {
                await cargarDatosAdicionalesReales(fechasVisitas, generos);
            }
        }

    } catch (error) {
        console.error('💥 Error crítico cargando datos desde participantes:', error);
        throw error;
    }
}

// Función para procesar datos de géneros
function procesarDatosGeneros(datosGenero) {
    console.log('Procesando datos de géneros...', datosGenero);
    
    // Extraer labels y valores directamente de los datos combinados
    const labelsGenero = [];
    const valuesGenero = [];
    let totalConGenero = 0;

    datosGenero.forEach(item => {
        if (item.genero) {
            labelsGenero.push(item.genero);
            valuesGenero.push(item.count);
            totalConGenero += item.count;
        }
    });

    console.log('Datos procesados de géneros:', { labelsGenero, valuesGenero });

    const totalGeneros = labelsGenero.length;
    const maxGenero = Math.max(...valuesGenero);
    const distribucion = totalConGenero > 0 ? Math.round((maxGenero / totalConGenero) * 100) : 0;

    // Actualizar estadísticas
    document.getElementById('total-visitantes').textContent = totalConGenero.toLocaleString();
    document.getElementById('distribucion-genero').textContent = distribucion + '%';
    document.getElementById('total-generos').textContent = totalGeneros;

    // Preparar datos para gráficas
    datosSimulados.genero = {
        labels: labelsGenero,
        values: valuesGenero
    };

    console.log('Datos finales para gráficas:', datosSimulados.genero);
}

// Función para cargar datos adicionales REALES
async function cargarDatosAdicionalesReales(fechasVisitas, generos) {
    try {
        console.log('Procesando datos REALES adicionales...');
        
        // Procesar datos por tiempo desde las fechas REALES
        const datosTiempo = procesarDatosPorTiempoDesdeFechasReales(fechasVisitas, generos);
        
        // Cargar intereses REALES desde participantes_reserva
        const datosIntereses = await cargarDatosInteresesReales();

        datosSimulados.fecha = datosTiempo.fecha;
        datosSimulados.genero = datosTiempo.genero;
        datosSimulados.dia = datosTiempo.dia;
        datosSimulados.mes = datosTiempo.mes;
        datosSimulados.anio = datosTiempo.anio;
        datosSimulados.intereses = datosIntereses;

        datosOriginales = JSON.parse(JSON.stringify(datosSimulados));
        
        console.log('Datos REALES cargados exitosamente:', datosSimulados);
        
    } catch (error) {
        console.error('Error cargando datos adicionales REALES:', error);
        // Si hay error, usar datos básicos de género
        datosSimulados.fecha = datosSimulados.genero;
        datosSimulados.dia = { labels: [], values: [] };
        datosSimulados.mes = { labels: [], values: [] };
        datosSimulados.anio = { labels: [], values: [] };
        datosSimulados.intereses = { labels: [], values: [] };
    }
}

// Función para procesar datos por tiempo desde fechas reales
function procesarDatosPorTiempoDesdeFechasReales(fechasVisitas, generos) {
    console.log('Procesando fechas REALES:', fechasVisitas);
    
    // Mapeo de IDs de género a nombres
    const mapaGeneros = {};
    generos.forEach(genero => {
        mapaGeneros[genero.id_genero] = genero.genero;
    });

    // Contar por género (usando todas las fechas disponibles)
    const conteoPorGenero = {};
    const visitasPorFecha = {};
    const visitasPorDia = {
        'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 
        'Viernes': 0, 'Sábado': 0, 'Domingo': 0
    };
    const visitasPorMes = {};
    const visitasPorAnio = {};

    fechasVisitas.forEach(item => {
        const generoNombre = mapaGeneros[item.generoId];
        
        if (generoNombre) {
            conteoPorGenero[generoNombre] = (conteoPorGenero[generoNombre] || 0) + 1;
            
            // Procesar por fecha si existe
            if (item.fecha) {
                const fecha = new Date(item.fecha);
                
            if (!isNaN(fecha.getTime())) {
                // Por fecha específica (formato como en la imagen: 20-ene)
                const fechaCorta = formatearFechaCorta(item.fecha);
                visitasPorFecha[fechaCorta] = (visitasPorFecha[fechaCorta] || 0) + 1;
                
                // Por día de la semana
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const dia = diasSemana[fecha.getDay()];
                visitasPorDia[dia] = (visitasPorDia[dia] || 0) + 1;
                
                // Por mes (formato como en la imagen)
                const mesAbreviado = obtenerNombreMesAbreviado(fecha.getMonth());
                const anio = fecha.getFullYear();
                const mesKey = `${anio}-${mesAbreviado}`;
                visitasPorMes[mesKey] = (visitasPorMes[mesKey] || 0) + 1;
                
                // Por año
                visitasPorAnio[anio] = (visitasPorAnio[anio] || 0) + 1;
            } else {
                    console.warn('Fecha inválida en item:', item.fecha);
            }
          }
        }  
    });

    console.log('Conteo REAL por género:', conteoPorGenero);
    console.log('Visitas por fecha:', visitasPorFecha);
    console.log('Visitas por mes:', visitasPorMes);

    // Crear datos por género - SIEMPRE los 4 géneros
    const datosPorGenero = generos.map(genero => ({
        genero: genero.genero,
        count: conteoPorGenero[genero.genero] || 0
    }));

    console.log('Datos por género para fecha:', datosPorGenero);

    return {
        // "Por Fecha" muestra FECHAS específicas (como en la imagen)
        fecha: {
            labels: Object.keys(visitasPorFecha),
            values: Object.values(visitasPorFecha)
        },
        // "Por Género" muestra géneros
        genero: {
            labels: datosPorGenero.map(item => item.genero),
            values: datosPorGenero.map(item => item.count)
        },
        // Datos para otros gráficos basados en fechas reales
        dia: {
            labels: Object.keys(visitasPorDia),
            values: Object.values(visitasPorDia)
        },
        mes: {
            labels: Object.keys(visitasPorMes),
            values: Object.values(visitasPorMes)
        },
        anio: {
            labels: Object.keys(visitasPorAnio).sort(),
            values: Object.keys(visitasPorAnio).sort().map(anio => visitasPorAnio[anio])
        }
    };
}

// cierra funcion auxiliar


// Función para cargar intereses REALES
async function cargarDatosInteresesReales() {
    try {
        // Como el campo intereses_heliconias no existe, retornamos datos vacíos
        console.log('⚠️ Campo intereses_heliconias no existe en participantes_reserva');
        
        const intereses = ['Observación', 'Fotografía', 'Investigación', 'Educación', 'Recreación'];
        
        console.log('✅ Datos de intereses vacíos (campo no existe):', intereses);

        return {
            labels: intereses,
            values: intereses.map(() => 0)
        };
    } catch (error) {
        console.error('Error cargando intereses REALES:', error);
        return {
            labels: ['Observación', 'Fotografía', 'Investigación', 'Educación', 'Recreación'],
            values: [0, 0, 0, 0, 0]
        };
    }
}

// Función para cargar datos de fecha específicos (como en la imagen)
async function cargarDatosFechasEspecificas() {
    try {
        mostrarLoading('Cargando datos por fecha...');

        // Consultar todas las fechas disponibles
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select('fecha_visita')
            .not('fecha_visita', 'is', null);

        if (error) {
            console.error('Error cargando fechas:', error);
            throw error;
        }

        // Procesar fechas en formato como la imagen (20-ene, 22-feb, 1-mar)
        const fechasUnicas = {};
        participantes.forEach(p => {
            if (p.fecha_visita) {
                const fechaCorta = formatearFechaCorta(p.fecha_visita);
                fechasUnicas[fechaCorta] = (fechasUnicas[fechaCorta] || 0) + 1;
            }
        });

        // Ordenar fechas cronológicamente
        const fechasOrdenadas = Object.keys(fechasUnicas).sort((a, b) => {
            return new Date(a) - new Date(b);
        });

        const datosFechas = {
            labels: fechasOrdenadas,
            values: fechasOrdenadas.map(fecha => fechasUnicas[fecha])
        };

        cerrarLoading();
        return datosFechas;

    } catch (error) {
        console.error('Error cargando datos de fechas:', error);
        cerrarLoading();
        throw error;
    }
}

// Función para cargar datos por rango de fechas - VERSIÓN CORREGIDA
async function cargarDatosPorRangoFechas(fechaInicial, fechaFinal) {
    try {
        console.log('🔍 Cargando datos por rango de fechas AGRUPADOS:', fechaInicial, 'a', fechaFinal);

        // CONSULTA MEJORADA: Traer datos agrupados por fecha y género
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select(`
                fecha_visita,
                genero!inner(id_genero, genero)
            `)
            .not('fecha_visita', 'is', null)
            .not('id_genero', 'is', null)
            .gte('fecha_visita', fechaInicial)
            .lte('fecha_visita', fechaFinal)
            .order('fecha_visita', { ascending: true });

        if (error) {
            console.error('Error en consulta de fechas:', error);
            throw error;
        }

        console.log('👥 Participantes encontrados en rango:', participantes);

        if (!participantes || participantes.length === 0) {
            return {
                labels: [],
                values: [],
                datasets: []
            };
        }

        // Obtener todos los géneros disponibles
        const { data: generos } = await supabase
            .from('genero')
            .select('id_genero, genero')
            .order('id_genero');

        console.log('🎭 Géneros disponibles:', generos);

        // Procesar datos AGRUPADOS por fecha y género
        return procesarDatosAgrupadosPorFechaYGenero(participantes, generos);

    } catch (error) {
        console.error('💥 Error cargando datos por rango de fechas:', error);
        throw error;
    }
}

// Función para procesar datos agrupados por fecha y género
function procesarDatosAgrupadosPorFechaYGenero(participantes, generos) {
    console.log('📊 Procesando datos agrupados por fecha y género...');
    
    // Obtener todas las fechas únicas ordenadas
    const fechasUnicas = [...new Set(
        participantes
            .filter(p => p.fecha_visita)
            .map(p => p.fecha_visita.split('T')[0])
    )].sort();
    
    // Obtener todos los géneros disponibles
    const todosLosGeneros = generos.map(g => g.genero);
    
    // Inicializar estructura de datos
    const datosPorFechaYGenero = {};
    
    // Inicializar para todas las fechas
    fechasUnicas.forEach(fecha => {
        datosPorFechaYGenero[fecha] = {};
        todosLosGeneros.forEach(genero => {
            datosPorFechaYGenero[fecha][genero] = 0;
        });
    });
    
    // Contar participantes por fecha y género
    participantes.forEach(participante => {
        if (participante.fecha_visita && participante.genero) {
            const fecha = participante.fecha_visita.split('T')[0];
            const genero = participante.genero.genero;
            
            if (datosPorFechaYGenero[fecha] && datosPorFechaYGenero[fecha][genero] !== undefined) {
                datosPorFechaYGenero[fecha][genero]++;
            }
        }
    });
    
    // Formatear fechas para mostrar (ej: 20-ene)
    const fechasFormateadas = fechasUnicas.map(fecha => formatearFechaCorta(fecha));
    
    // Crear datasets para cada género
    const datasets = todosLosGeneros.map(genero => {
        const color = coloresPorGenero[genero] || '#95a5a6';
        return {
            label: genero,
            data: fechasUnicas.map(fecha => datosPorFechaYGenero[fecha][genero] || 0),
            backgroundColor: color,
            borderColor: darkenColor(color, 0.3),
            borderWidth: 2,
            borderRadius: 6,
            barThickness: 25
        };
    });
    
    // Calcular totales
    const totalPorFecha = fechasUnicas.map(fecha => 
        todosLosGeneros.reduce((sum, genero) => sum + (datosPorFechaYGenero[fecha][genero] || 0), 0)
    );
    
    const totalGeneral = totalPorFecha.reduce((a, b) => a + b, 0);
    
    console.log('✅ Datos agrupados procesados:', {
        fechas: fechasFormateadas,
        datasets: datasets,
        totalPorFecha: totalPorFecha,
        totalGeneral: totalGeneral
    });
    
    return {
        type: 'grouped',
        labels: fechasFormateadas,
        datasets: datasets,
        totalPorFecha: totalPorFecha,
        totalGeneral: totalGeneral,
        fechasOriginales: fechasUnicas,
        generos: todosLosGeneros
    };
}

// Función para cargar datos de meses específicos (como en la imagen)
async function cargarDatosMesesEspecificos() {
    try {
        mostrarLoading('Cargando datos por mes...');

        // Consultar todas las fechas disponibles
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select('fecha_visita')
            .not('fecha_visita', 'is', null);

        if (error) {
            console.error('Error cargando meses:', error);
            throw error;
        }

        // Procesar meses en formato como la imagen (feb, mar)
        const mesesUnicos = {};
        participantes.forEach(p => {
            if (p.fecha_visita) {
                const fecha = new Date(p.fecha_visita);
                const mesAbreviado = obtenerNombreMesAbreviado(fecha.getMonth());
                const año = fecha.getFullYear();
                const mesKey = `${año}-${mesAbreviado}`;
                
                mesesUnicos[mesKey] = (mesesUnicos[mesKey] || 0) + 1;
            }
        });

        // Ordenar meses cronológicamente
        const mesesOrdenados = Object.keys(mesesUnicos).sort((a, b) => {
            return new Date(a) - new Date(b);
        });

        const datosMeses = {
            labels: mesesOrdenados,
            values: mesesOrdenados.map(mes => mesesUnicos[mes])
        };

        cerrarLoading();
        return datosMeses;

    } catch (error) {
        console.error('Error cargando datos de meses:', error);
        cerrarLoading();
        throw error;
    }
}

// Función para cargar el mes actual - VERSIÓN CORREGIDA
async function cargarMesActual() {
    try {
        mostrarLoading('Cargando datos del mes actual...');

        const ahora = new Date();
        const añoActual = ahora.getFullYear();
        const mesActual = ahora.getMonth();
        
        // Primer y último día del mes actual
        const fechaInicial = new Date(añoActual, mesActual, 1);
        const fechaFinal = new Date(añoActual, mesActual + 1, 0);
        
        console.log('📅 Cargando mes actual:', fechaInicial.toISOString().split('T')[0], 'a', fechaFinal.toISOString().split('T')[0]);

        // Consultar participantes del mes actual
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select(`
                fecha_visita,
                genero!inner(id_genero, genero)
            `)
            .not('fecha_visita', 'is', null)
            .not('id_genero', 'is', null)
            .gte('fecha_visita', fechaInicial.toISOString().split('T')[0])
            .lte('fecha_visita', fechaFinal.toISOString().split('T')[0])
            .order('fecha_visita', { ascending: true });

        if (error) {
            console.error('❌ Error consultando mes actual:', error);
            throw error;
        }

        console.log(`👥 Participantes encontrados en mes actual: ${participantes?.length || 0}`);

        if (!participantes || participantes.length === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el mes actual');
            cerrarLoading();
            return;
        }

        // Obtener todos los géneros
        const { data: generos } = await supabase
            .from('genero')
            .select('id_genero, genero')
            .order('id_genero');

        // Procesar datos AGRUPADOS (todos los géneros)
        const datosProcesados = await procesarDatosAgrupadosPorGenero(
            participantes, 
            generos, 
            fechaInicial.toISOString().split('T')[0], 
            fechaFinal.toISOString().split('T')[0]
        );

        // Actualizar los inputs de fecha
        document.getElementById('filtroFechaInicial').value = fechaInicial.toISOString().split('T')[0];
        document.getElementById('filtroFechaFinal').value = fechaFinal.toISOString().split('T')[0];
        document.getElementById('filtroGeneroFecha').value = 'todos';

        // Actualizar datos
        datosSimulados.fecha = datosProcesados;
        
        cerrarLoading();

        // Actualizar la gráfica del modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            const modalTitle = document.getElementById("modalTitle");
            const mesNombre = obtenerNombreMes(mesActual);
            const titulo = `Visitantes por Género - ${mesNombre} ${añoActual}`;
            
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-chart-bar"></i> ${titulo}`;
            }
            
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaModalConDatosAgrupados(tipoGraficaActual, datosProcesados, titulo);
        }

        // Mostrar resumen
        const totalVisitantes = datosProcesados.total || 0;
        const resumen = `Mes ${obtenerNombreMes(mesActual)}: ${totalVisitantes} visitantes totales`;
        mostrarExito(resumen);

    } catch (error) {
        console.error('❌ Error cargando mes actual:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos del mes actual');
    }
}

// Función para procesar datos de un género específico (barras por fecha)
async function procesarDatosGeneroEspecifico(participantes, generos, generoSeleccionado, fechaInicial, fechaFinal) {
    console.log(`📊 Procesando datos para género específico: ${generoSeleccionado}`);
    
    // Filtrar participantes por el género seleccionado
    const participantesFiltrados = participantes.filter(p => {
        const generoParticipante = p.genero?.genero?.trim().toLowerCase();
        const generoSeleccionadoClean = generoSeleccionado.trim().toLowerCase();
        
        return generoSeleccionadoClean === 'todos' || generoParticipante === generoSeleccionadoClean;
    });
    
    console.log(`👥 Participantes del género ${generoSeleccionado}:`, participantesFiltrados.length);
    
    // Agrupar por fecha
    const visitasPorFecha = {};
    
    participantesFiltrados.forEach(participante => {
        if (participante.fecha_visita) {
            // Formatear fecha en formato corto (como en la imagen: 20-ene)
            const fechaCorta = formatearFechaCorta(participante.fecha_visita);
            visitasPorFecha[fechaCorta] = (visitasPorFecha[fechaCorta] || 0) + 1;
        }
    });
    
    // Ordenar fechas cronológicamente
    const fechasOrdenadas = Object.keys(visitasPorFecha).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    return {
        type: 'genero_especifico',
        genero: generoSeleccionado,
        labels: fechasOrdenadas,
        values: fechasOrdenadas.map(fecha => visitasPorFecha[fecha]),
        total: participantesFiltrados.length,
        fechaInicial: fechaInicial,
        fechaFinal: fechaFinal
    };
}

// Función para procesar datos agrupados por género (barras juntas por fecha)
async function procesarDatosAgrupadosPorGenero(participantes, generos, fechaInicial, fechaFinal) {
    console.log('📊 Procesando datos agrupados por género');
    
    // Obtener fechas únicas dentro del rango
    const fechasUnicas = {};
    const generosNombres = Array.from(new Set([
        ...generos.map(g => g.genero),  // géneros de la tabla
        ...participantes.map(p => p.genero?.genero).filter(Boolean) // géneros de participantes
    ]));
    
    // Inicializar estructura de datos
    participantes.forEach(participante => {
        if (participante.fecha_visita) {
            const fechaCorta = formatearFechaCorta(participante.fecha_visita);
            if (!fechasUnicas[fechaCorta]) {
                fechasUnicas[fechaCorta] = {};
                generosNombres.forEach(genero => {
                    fechasUnicas[fechaCorta][genero] = 0;
                });
            }
            
            if (participante.genero && participante.genero.genero) {
                const generoNombre = participante.genero.genero;
                fechasUnicas[fechaCorta][generoNombre] = 
                    (fechasUnicas[fechaCorta][generoNombre] || 0) + 1;
            }
        }
    });
    
    // Ordenar fechas cronológicamente
    const fechasOrdenadas = Object.keys(fechasUnicas).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    // Crear datasets para cada género
    const datasets = generosNombres.map(genero => ({
        label: genero,
        data: fechasOrdenadas.map(fecha => fechasUnicas[fecha][genero] || 0),
        backgroundColor: coloresPorGenero[genero] || '#95a5a6',
        borderColor: darkenColor(coloresPorGenero[genero] || '#95a5a6', 0.3),
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 25,
    }));
    
    // Calcular total general
    const totalGeneral = datasets.reduce((total, dataset) => {
        return total + dataset.data.reduce((sum, val) => sum + val, 0);
    }, 0);
    
    return {
        type: 'grouped',
        labels: fechasOrdenadas,
        datasets: datasets,
        total: totalGeneral,
        fechaInicial: fechaInicial,
        fechaFinal: fechaFinal,
        generos: generosNombres
    };
}

// Función para cargar datos de género por tiempo
async function cargarDatosGeneroPorTiempo(tipo, parametros = {}) {
    try {
        console.log('🔍 Iniciando carga de datos por tiempo:', tipo, parametros);

        // CONSULTA DIRECTA a participantes_reserva - SOLO campos existentes
        let query = supabase
            .from('participantes_reserva')
            .select('id_genero, fecha_visita')
            .not('id_genero', 'is', null);

        // Aplicar filtro de rango de fechas si está disponible
        if (parametros.fechaInicial && parametros.fechaFinal) {
            console.log('📅 Aplicando filtro de fechas:', parametros.fechaInicial, 'a', parametros.fechaFinal);
            query = query
                .gte('fecha_visita', parametros.fechaInicial)
                .lte('fecha_visita', parametros.fechaFinal);
        }

        const { data: participantes, error } = await query;

        if (error) {
            console.error('❌ Error en consulta de participantes_reserva:', error);
            throw error;
        }

        console.log('👥 Participantes encontrados:', participantes);

        if (!participantes || participantes.length === 0) {
            console.log('⚠️ No hay participantes en el rango de fechas');
            return await obtenerEstructuraGenerosVacia();
        }

        // Obtener TODOS los géneros
        const { data: generos } = await supabase
            .from('genero')
            .select('id_genero, genero');

        if (!generos || generos.length === 0) {
            console.error('❌ No se encontraron géneros en la base de datos');
            throw new Error('No hay géneros configurados en el sistema');
        }

        console.log('🎭 Géneros disponibles:', generos);

        // Contar participantes por género
        const conteoPorGenero = {};
        participantes.forEach(participante => {
            if (participante.id_genero) {
                const generoId = participante.id_genero;
                conteoPorGenero[generoId] = (conteoPorGenero[generoId] || 0) + 1;
            }
        });

        console.log('📊 Conteo por género ID:', conteoPorGenero);

        // Combinar con nombres de géneros
        const datosCombinados = generos.map(genero => ({
            genero: genero.genero,
            count: conteoPorGenero[genero.id_genero] || 0
        }));

        console.log('✅ Datos combinados finales:', datosCombinados);

        return {
            labels: datosCombinados.map(item => item.genero),
            values: datosCombinados.map(item => item.count)
        };

    } catch (error) {
        console.error(`💥 Error cargando datos de género por ${tipo}:`, error);
        return await obtenerEstructuraGenerosVacia();
    }
}

// AGREGAR esta función nueva para procesar datos por año
function procesarDatosAgrupadosPorAnioYGenero(participantes, generos) {
    console.log('📊 Procesando datos agrupados por año y género...');
    
    // Obtener todos los años únicos
    const añosUnicos = [...new Set(
        participantes
            .filter(p => p.fecha_visita)
            .map(p => new Date(p.fecha_visita).getFullYear())
    )].sort((a, b) => a - b);
    
    // Obtener todos los géneros disponibles
    const todosLosGeneros = generos.map(g => g.genero);
    
    // Inicializar estructura de datos
    const datosPorAñoYGenero = {};
    
    // Inicializar para todos los años
    añosUnicos.forEach(año => {
        datosPorAñoYGenero[año] = {};
        todosLosGeneros.forEach(genero => {
            datosPorAñoYGenero[año][genero] = 0;
        });
    });
    
    // Contar participantes por año y género
    participantes.forEach(participante => {
        if (participante.fecha_visita && participante.genero) {
            const año = new Date(participante.fecha_visita).getFullYear();
            const genero = participante.genero.genero;
            
            if (datosPorAñoYGenero[año] && datosPorAñoYGenero[año][genero] !== undefined) {
                datosPorAñoYGenero[año][genero]++;
            }
        }
    });
    
    // Crear datasets para cada género
    const datasets = todosLosGeneros.map(genero => {
        const color = coloresPorGenero[genero] || '#95a5a6';
        return {
            label: genero,
            data: añosUnicos.map(año => datosPorAñoYGenero[año][genero] || 0),
            backgroundColor: color,
            borderColor: darkenColor(color, 0.3),
            borderWidth: 2,
            borderRadius: 6,
            barThickness: 25,
            barPercentage: 0.8,
            categoryPercentage: 0.9
        };
    });
    
    // Calcular totales
    const totalPorAño = añosUnicos.map(año => 
        todosLosGeneros.reduce((sum, genero) => sum + (datosPorAñoYGenero[año][genero] || 0), 0)
    );
    
    const totalGeneral = totalPorAño.reduce((a, b) => a + b, 0);
    
    console.log('✅ Datos agrupados por año procesados:', {
        años: añosUnicos,
        datasets: datasets,
        totalPorAño: totalPorAño,
        totalGeneral: totalGeneral
    });
    
    return {
        type: 'grouped',
        labels: añosUnicos.map(año => año.toString()),
        datasets: datasets,
        totalPorAño: totalPorAño,
        totalGeneral: totalGeneral,
        añosOriginales: añosUnicos,
        generos: todosLosGeneros
    };
}

// Función placeholder para cargar datos de intereses por tiempo
async function cargarDatosInteresesPorTiempo(fechaInicial, fechaFinal, interes) {
    console.log('Función cargarDatosInteresesPorTiempo - por implementar');
    // Por ahora retornamos datos vacíos
    return {
        labels: ['Observación', 'Fotografía', 'Investigación', 'Educación', 'Recreación'],
        values: [0, 0, 0, 0, 0],
        type: 'interes'
    };
}

// Función para procesar datos de género específico por fecha - VERSIÓN CORREGIDA
function procesarDatosGeneroEspecificoPorFecha(participantes, generoSeleccionado) {
    console.log(`📊 Procesando datos para género específico: ${generoSeleccionado}`);
    
    // Agrupar por fecha
    const visitasPorFecha = {};
    
    participantes.forEach(participante => {
        if (participante.fecha_visita) {
            const fechaCorta = formatearFechaCorta(participante.fecha_visita);
            visitasPorFecha[fechaCorta] = (visitasPorFecha[fechaCorta] || 0) + 1;
        }
    });
    
    // Ordenar fechas cronológicamente
    const fechasOrdenadas = Object.keys(visitasPorFecha).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    return {
        type: 'genero_especifico',
        genero: generoSeleccionado,
        labels: fechasOrdenadas,
        values: fechasOrdenadas.map(fecha => visitasPorFecha[fecha] || 0),
        total: Object.values(visitasPorFecha).reduce((a, b) => a + b, 0)
    };
}
