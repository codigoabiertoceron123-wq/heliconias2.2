// Variables globales
let chartBar, chartPie, chartAmpliado;
let tipoActual = "genero";
let datosGeneros = [];
let datosSimulados = {};
let datosOriginales = {};

// Paletas de colores por género
const coloresPorGenero = {
    'Masculino': '#3498db',
    'Femenino': '#e74c3c',
    'Otro': '#27ae60',
    'Prefiero no decir': '#f39c12'
};

// Paletas de colores para otros tipos
const colorPalettes = {
    fecha: [
        '#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#e74c3c',
        '#f1c40f', '#34495e', '#d35400', '#8e44ad', '#16a085'
    ],
    dia: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8'
    ],
    mes: [
        '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
        '#1abc9c', '#d35400', '#34495e'
    ],
    anio: [
        '#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f'
    ],
    intereses: [
        '#27ae60', '#3498db', '#f39c12', '#9b59b6', '#e74c3c'
    ]
};

// Función para generar colores según el tipo
function generarColores(tipo, labels) {
    if (tipo === 'genero') {
        return labels.map(label => coloresPorGenero[label] || '#95a5a6');
    } else if (tipo === 'intereses') {
        const coloresIntereses = {
            'Observación': '#27ae60',
            'Fotografía': '#3498db',
            'Investigación': '#f39c12',
            'Educación': '#9b59b6',
            'Recreación': '#e74c3c'
        };
        return labels.map(label => coloresIntereses[label] || '#95a5a6');
    } else {
        const palette = colorPalettes[tipo] || colorPalettes.fecha;
        const cols = [];
        for(let i = 0; i < labels.length; i++) {
            cols.push(palette[i % palette.length]);
        }
        return cols;
    }
}

// Función para obtener etiqueta descriptiva
function obtenerEtiquetaDescriptiva(tipo) {
    const etiquetas = {
        genero: 'Género',
        fecha: 'Género',
        dia: 'Día de la Semana',
        mes: 'Mes del Año',
        anio: 'Año',
        intereses: 'Interés Principal'
    };
    return etiquetas[tipo] || 'Categoría';
}

// Función para obtener título descriptivo
function obtenerTituloDescriptivo(tipo) {
    const titulos = {
        genero: 'Visitantes por Género',
        fecha: 'Visitantes por Género (Filtrado por Fecha)',
        mes: 'Visitantes por Género (Mes Actual)',
        anio: 'Visitantes por Género (Año Actual)',
        intereses: 'Visitantes por Interés en Heliconias'
    };
    return titulos[tipo] || 'Distribución de Visitantes';
}

// Función para obtener clase CSS por género
function obtenerClaseGenero(genero) {
    const clases = {
        'masculino': 'masculino',
        'femenino': 'femenino',
        'otro': 'otro',
        'prefiero-no-decir': 'prefiero-no-decir'
    };
    return clases[genero] || 'masculino';
}

// Función para obtener clase CSS por interés
function obtenerClaseInteres(interes) {
    const clases = {
        'Observación': 'observacion',
        'Fotografía': 'fotografia',
        'Investigación': 'investigacion',
        'Educación': 'educacion',
        'Recreación': 'recreacion'
    };
    return clases[interes] || 'observacion';
}

// Función para formatear texto de género
function formatearGenero(genero) {
    const formatos = {
        'masculino': 'Masculino',
        'femenino': 'Femenino',
        'otro': 'Otro',
        'prefiero-no-decir': 'Prefiero no decir'
    };
    return formatos[genero] || genero;
}

// Función para formatear fecha
function formatearFecha(fechaStr) {
    if (!fechaStr) return 'Fecha inválida';
    
    try {
        const fecha = new Date(fechaStr);
        
        if (isNaN(fecha.getTime())) {
            console.warn('Fecha inválida:', fechaStr);
            return 'Fecha inválida';
        }
        
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formateando fecha:', fechaStr, error);
        return 'Fecha inválida';
    }
}

// Función para obtener nombre del mes
function obtenerNombreMes(mes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes] || 'Mes desconocido';
}

// Función principal para cargar datos de géneros
async function cargarDatosGeneros() {
    try {
        mostrarLoading('Cargando datos...');

        console.log('=== INICIANDO CARGA DE DATOS ===');
        
        // PRIMERO: Verificar tabla genero
        const generos = await verificarTablaGenero();
        if (!generos || generos.length === 0) {
            throw new Error('No se encontraron géneros en la base de datos');
        }

        console.log('✅ Géneros cargados:', generos);

        // SEGUNDO: Cargar participantes CON DATOS REALES
        await cargarDatosDesdeParticipantes(generos);

        cerrarLoading();
        console.log('✅ Todos los datos REALES cargados, mostrando interfaz...');
        mostrarDatos();
        
    } catch (error) {
        console.error('Error cargando géneros:', error);
        cerrarLoading();
        
        mostrarError('No se pudieron cargar los datos de la base de datos: ' + error.message);
        
        // NO usar datos de ejemplo - mostrar error real
        mostrarSinDatos();
    }
}

// Función para verificar tabla genero
async function verificarTablaGenero() {
    try {
        console.log('=== VERIFICANDO TABLA GENERO ===');
        const { data: generos, error } = await supabase
            .from('genero')
            .select('*');
        
        if (error) {
            console.error('❌ Error en tabla genero:', error);
            return null;
        }
        
        console.log('✅ Tabla genero - Datos:', generos);
        console.log('✅ Total de géneros:', generos.length);
        return generos;
    } catch (error) {
        console.error('💥 Error verificando tabla genero:', error);
        return null;
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
                
                // Por fecha específica
                const fechaStr = fecha.toISOString().split('T')[0];
                visitasPorFecha[fechaStr] = (visitasPorFecha[fechaStr] || 0) + 1;
                
                // Por día de la semana
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const dia = diasSemana[fecha.getDay()];
                visitasPorDia[dia] = (visitasPorDia[dia] || 0) + 1;
                
                // Por mes
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                const mes = meses[fecha.getMonth()];
                visitasPorMes[mes] = (visitasPorMes[mes] || 0) + 1;
                
                // Por año
                const anio = fecha.getFullYear().toString();
                visitasPorAnio[anio] = (visitasPorAnio[anio] || 0) + 1;
            }
        }
    });

    console.log('Conteo REAL por género:', conteoPorGenero);
    console.log('Visitas por fecha:', visitasPorFecha);

    // Crear datos por género - SIEMPRE los 4 géneros
    const datosPorGenero = generos.map(genero => ({
        genero: genero.genero,
        count: conteoPorGenero[genero.genero] || 0
    }));

    console.log('Datos por género para fecha:', datosPorGenero);

    return {
        // "Por Fecha" muestra GÉNEROS (no fechas)
        fecha: {
            labels: datosPorGenero.map(item => item.genero),
            values: datosPorGenero.map(item => item.count)
        },
        // "Por Género" también muestra géneros
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
            labels: Object.keys(visitasPorAnio),
            values: Object.values(visitasPorAnio)
        }
    };
}

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

// Función para mostrar sin datos
function mostrarSinDatos() {
    const container = document.getElementById('data-container');
    container.innerHTML = `
        <div class="no-data">
            <i class="fas fa-database"></i>
            <h3>No hay datos disponibles</h3>
            <p>No se encontraron registros en la base de datos para mostrar estadísticas.</p>
            <button class="btn btn-primary" onclick="cargarDatosGeneros()" style="margin-top: 15px;">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        </div>
    `;
}