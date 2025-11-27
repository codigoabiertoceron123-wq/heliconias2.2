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
    'Prefiero no decirlo': '#f39c12'
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
        fecha: 'Fecha de Visita',
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
        fecha: 'Visitantes por Fecha',
        dia: 'Visitantes por Día',
        mes: 'Visitantes por Mes',
        anio: 'Visitantes por Año',
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
        'prefiero no decirlo': 'prefiero-no-decir'
    };
    return clases[genero.toLowerCase()] || 'masculino';
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
        'prefiero no decirlo': 'Prefiero no decirlo'
    };
    return formatos[genero.toLowerCase()] || genero;
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

// Función para formatear fecha corta (como en la imagen: 20-ene)
function formatearFechaCorta(fechaStr) {
    if (!fechaStr) return 'Fecha inválida';
    
    try {
        const fecha = new Date(fechaStr);
        
        if (isNaN(fecha.getTime())) {
            console.warn('Fecha inválida:', fechaStr);
            return 'Fecha inválida';
        }
        
        const dia = fecha.getDate();
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
        return `${dia}-${mes}`;
    } catch (error) {
        console.error('Error formateando fecha corta:', fechaStr, error);
        return 'Fecha inválida';
    }
}

// Función para obtener nombre del mes
function obtenerNombreMes(mes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes] || 'Mes desconocido';
}

// Función para obtener nombre del mes abreviado
function obtenerNombreMesAbreviado(mes) {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return meses[mes] || 'mes';
}

// Función para obtener nombre del mes desde string de fecha
function obtenerNombreMesDesdeFecha(fechaStr) {
    try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return 'Mes desconocido';
        return obtenerNombreMes(fecha.getMonth());
    } catch (error) {
        return 'Mes desconocido';
    }
}

// Función para obtener año desde string de fecha
function obtenerAnioDesdeFecha(fechaStr) {
    try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return 'Año desconocido';
        return fecha.getFullYear().toString();
    } catch (error) {
        return 'Año desconocido';
    }
}

// Función para obtener mes y año desde string de fecha
function obtenerMesYAnioDesdeFecha(fechaStr) {
    try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return 'Fecha inválida';
        const mes = obtenerNombreMes(fecha.getMonth());
        const año = fecha.getFullYear();
        return { mes, año };
    } catch (error) {
        return { mes: 'Mes desconocido', año: 'Año desconocido' };
    }
}

// Función para oscurecer colores (efecto 3D)
function darkenColor(color, factor) {
    if (color.startsWith('#')) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        
        r = Math.max(0, Math.floor(r * (1 - factor)));
        g = Math.max(0, Math.floor(g * (1 - factor)));
        b = Math.max(0, Math.floor(b * (1 - factor)));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return color;
}

// Función para aclarar colores (efecto hover)
function lightenColor(color, factor) {
    if (color.startsWith('#')) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        
        r = Math.min(255, Math.floor(r + (255 - r) * factor));
        g = Math.min(255, Math.floor(g + (255 - g) * factor));
        b = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return color;
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
                
                // Por fecha específica (formato como en la imagen: 20-ene)
                const fechaCorta = formatearFechaCorta(item.fecha);
                visitasPorFecha[fechaCorta] = (visitasPorFecha[fechaCorta] || 0) + 1;
                
                // Por día de la semana
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const dia = diasSemana[fecha.getDay()];
                visitasPorDia[dia] = (visitasPorDia[dia] || 0) + 1;
                
                // Por mes (formato como en la imagen)
                const mesAbreviado = obtenerNombreMesAbreviado(fecha.getMonth());
                const mesKey = `${fecha.getFullYear()}-${mesAbreviado}`;
                visitasPorMes[mesKey] = (visitasPorMes[mesKey] || 0) + 1;
                
                // Por año
                const anio = fecha.getFullYear().toString();
                visitasPorAnio[anio] = (visitasPorAnio[anio] || 0) + 1;
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

// ====================================================================
// FUNCIONES DE FILTROS MEJORADAS - COMPARACIÓN POR MES Y AÑO
// ====================================================================

// Función para aplicar filtro de género
function aplicarFiltroGenero() {
    try {
        const filtro = document.getElementById('filtroGenero').value;
        
        console.log('🎯 Aplicando filtro de género:', filtro);
        
        if (filtro === 'todos') {
            // Restaurar datos originales (todos los géneros)
            datosSimulados.genero = JSON.parse(JSON.stringify(datosOriginales.genero));
            console.log('✅ Mostrando todos los géneros');
            actualizarGraficaModal(document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica'));
            return;
        }

        const { labels, values } = datosOriginales.genero;
        
        // MAPEO COMPLETO DE GÉNEROS
        const mapeoGeneros = {
            'Masculino': ['Masculino', 'masculino', 'MASCULINO'],
            'Femenino': ['Femenino', 'femenino', 'FEMENINO'],
            'Otro': ['Otro', 'otro', 'OTRO', 'Otros'],
            'Prefiero no decirlo': ['Prefiero no decirlo', 'Prefiero no decir', 'prefiero no decirlo', 'No especificar']
        };
        
        let generoEncontrado = null;
        let indexEncontrado = -1;
        
        // Buscar en todas las variantes posibles
        for (const [key, variantes] of Object.entries(mapeoGeneros)) {
            if (variantes.includes(filtro)) {
                // Buscar cada variante en los labels
                for (const variante of variantes) {
                    const index = labels.indexOf(variante);
                    if (index !== -1) {
                        generoEncontrado = variante;
                        indexEncontrado = index;
                        break;
                    }
                }
                if (indexEncontrado !== -1) break;
            }
        }
        
        // Si no se encontró con el mapeo, buscar directamente
        if (indexEncontrado === -1) {
            indexEncontrado = labels.indexOf(filtro);
            if (indexEncontrado !== -1) {
                generoEncontrado = filtro;
            }
        }
        
        console.log('🔍 Resultado búsqueda:', {
            filtroSeleccionado: filtro,
            generoEncontrado: generoEncontrado,
            indexEncontrado: indexEncontrado,
            labelsDisponibles: labels
        });
        
        if (indexEncontrado !== -1) {
            const datosFiltrados = {
                labels: [labels[indexEncontrado]],
                values: [values[indexEncontrado]]
            };
            
            console.log('✅ Género encontrado, datos filtrados:', datosFiltrados);
            
            // Actualizar datos temporales
            datosSimulados.genero = datosFiltrados;
            actualizarGraficaConFiltro(datosFiltrados, `Visitantes - ${formatearGenero(filtro)}`);
            
        } else {
            console.error('❌ Género no encontrado:', filtro);
            mostrarMensajeSinDatos(`No se encontraron datos para el género: "${filtro}"`);
            
            // Restaurar vista de todos los géneros
            setTimeout(() => {
                document.getElementById('filtroGenero').value = 'todos';
                datosSimulados.genero = JSON.parse(JSON.stringify(datosOriginales.genero));
                actualizarGraficaModal(document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica'));
            }, 2000);
        }
        
    } catch (error) {
        console.error('💥 Error en aplicarFiltroGenero:', error);
        mostrarMensajeSinDatos('Error al aplicar el filtro de género');
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

// Función para aplicar filtro de rango de fechas - VERSIÓN MEJORADA
async function aplicarFiltroRangoFechas() {
    const fechaInicial = document.getElementById('filtroFechaInicial').value;
    const fechaFinal = document.getElementById('filtroFechaFinal').value;
    
    console.log('🎯 Aplicando filtro FECHAS con parámetros:', {
        fechaInicial, 
        fechaFinal
    });
    
    // Validaciones
    if (!fechaInicial || !fechaFinal) {
        mostrarMensajeSinDatos('Por favor selecciona ambas fechas');
        return;
    }
    
    if (fechaInicial > fechaFinal) {
        mostrarMensajeSinDatos('La fecha inicial no puede ser mayor que la fecha final');
        return;
    }

    try {
        mostrarLoading('Cargando datos por fecha...');

        console.log('🔍 Aplicando filtro FECHAS para rango:', fechaInicial, 'a', fechaFinal);
        
        // Cargar datos del rango seleccionado
        const datosFiltrados = await cargarDatosPorRangoFechas(fechaInicial, fechaFinal);

        console.log('✅ Datos fechas obtenidos:', datosFiltrados);

        // Verificar si hay datos
        const totalVisitantes = datosFiltrados.values.reduce((a, b) => a + b, 0);
        console.log('👥 Total de visitantes encontrados:', totalVisitantes);
        
        if (totalVisitantes === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el rango de fechas seleccionado');
            return;
        }

        // Crear título descriptivo
        const titulo = `Visitantes por Fecha (${formatearFecha(fechaInicial)} - ${formatearFecha(fechaFinal)})`;

        cerrarLoading();

        console.log('🎯 Datos finales para mostrar:', datosFiltrados);
        
        // Actualizar datos y gráfica
        datosSimulados.fecha = datosFiltrados;
        
        // Actualizar la gráfica del modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            console.log('🔄 Actualizando gráfica FECHAS en modal...');
            
            // Actualizar título del modal
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-calendar"></i> ${titulo}`;
            }
            
            // FORZAR la actualización de la gráfica con los nuevos datos
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaFechas(tipoGraficaActual, datosFiltrados, titulo);
        }

        // Mostrar resumen
        mostrarExito(`Se encontraron ${totalVisitantes} visitantes en ${datosFiltrados.labels.length} fechas diferentes`);

    } catch (error) {
        console.error('💥 Error aplicando filtro de rango de fechas:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos: ' + error.message);
    }
}

// Función para cargar datos por rango de fechas
async function cargarDatosPorRangoFechas(fechaInicial, fechaFinal) {
    try {
        console.log('🔍 Cargando datos por rango de fechas:', fechaInicial, 'a', fechaFinal);

        // Consultar participantes en el rango de fechas
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select('fecha_visita')
            .not('fecha_visita', 'is', null)
            .gte('fecha_visita', fechaInicial)
            .lte('fecha_visita', fechaFinal);

        if (error) {
            console.error('Error en consulta de fechas:', error);
            throw error;
        }

        console.log('👥 Participantes encontrados en rango:', participantes);

        // Procesar fechas en formato corto (como en la imagen)
        const visitasPorFecha = {};
        participantes.forEach(p => {
            if (p.fecha_visita) {
                const fechaCorta = formatearFechaCorta(p.fecha_visita);
                visitasPorFecha[fechaCorta] = (visitasPorFecha[fechaCorta] || 0) + 1;
            }
        });

        // Ordenar fechas cronológicamente
        const fechasOrdenadas = Object.keys(visitasPorFecha).sort((a, b) => {
            return new Date(a) - new Date(b);
        });

        const datosFechas = {
            labels: fechasOrdenadas,
            values: fechasOrdenadas.map(fecha => visitasPorFecha[fecha])
        };

        console.log('✅ Datos de fechas procesados:', datosFechas);
        return datosFechas;

    } catch (error) {
        console.error('💥 Error cargando datos por rango de fechas:', error);
        throw error;
    }
}

// Función para actualizar gráfica de fechas
function actualizarGraficaFechas(tipoGrafica, datosFechas, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    const colors = generarColores('fecha', datosFechas.labels);

    // Para gráficas de fecha, usar barras por defecto para mejor visualización
    const tipoFinal = tipoGrafica === "bar" ? "bar" : "bar";

    chartAmpliado = new Chart(ctx, {
        type: tipoFinal,
        data: {
            labels: datosFechas.labels,
            datasets: [
                {
                    label: "Visitantes por Fecha",
                    data: datosFechas.values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => darkenColor(color, 0.3)),
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 25,
                    hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value.toLocaleString()} visitantes`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Visitantes',
                        font: { weight: 'bold', size: 14 }
                    }
                },
                x: {
                    grid: { 
                        display: false 
                    },
                    title: {
                        display: true,
                        text: 'Fechas de Visita',
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        },
    });

    // Actualizar tabla con datos de fechas
    actualizarTablaFechas(datosFechas);
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

// Función para cargar el mes actual - ACTUALIZADA
async function cargarMesActual() {
    try {
        mostrarLoading('Cargando comparativa del mes actual...');

        const ahora = new Date();
        const añoActual = ahora.getFullYear();
        const mesActual = ahora.getMonth();
        
        const fechaInicial = new Date(añoActual, mesActual, 1);
        const fechaFinal = new Date(añoActual, mesActual + 1, 0);
        
        console.log('Cargando COMPARATIVA del mes actual:', fechaInicial, 'a', fechaFinal);

        // Cargar datos del mes actual
        const datosFiltrados = await cargarDatosGeneroPorTiempo('fecha', {
            fechaInicial: fechaInicial.toISOString().split('T')[0],
            fechaFinal: fechaFinal.toISOString().split('T')[0]
        });

        // ✅ GARANTIZAR LOS 4 GÉNEROS PARA COMPARACIÓN
        const todosLosGeneros = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'];
        const valoresPorGenero = {};
        
        todosLosGeneros.forEach(genero => {
            valoresPorGenero[genero] = 0;
        });
        
        if (datosFiltrados && datosFiltrados.labels && datosFiltrados.values) {
            datosFiltrados.labels.forEach((genero, index) => {
                if (todosLosGeneros.includes(genero)) {
                    valoresPorGenero[genero] = datosFiltrados.values[index] || 0;
                }
            });
        }

        const datosComparativa = {
            labels: todosLosGeneros,
            values: todosLosGeneros.map(genero => valoresPorGenero[genero] || 0),
            type: 'comparativa',
            periodo: 'mes_actual',
            mes: obtenerNombreMes(mesActual),
            año: añoActual.toString()
        };

        // Actualizar los inputs de fecha
        document.getElementById('filtroFechaInicial').value = fechaInicial.toISOString().split('T')[0];
        document.getElementById('filtroFechaFinal').value = fechaFinal.toISOString().split('T')[0];
        document.getElementById('filtroGeneroFecha').value = 'todos';

        // Actualizar datos
        datosSimulados.fecha = datosComparativa;
        
        cerrarLoading();

        // Actualizar la gráfica del modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            const modalTitle = document.getElementById("modalTitle");
            const mesNombre = obtenerNombreMes(mesActual);
            const titulo = `Comparativa Mensual - ${mesNombre} ${añoActual}`;
            
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-chart-bar"></i> ${titulo}`;
            }
            
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaComparativa(tipoGraficaActual, datosComparativa, titulo);
        }

        // Mostrar resumen comparativo
        const totalVisitantes = datosComparativa.values.reduce((a, b) => a + b, 0);
        const resumen = `Comparativa mensual: ${totalVisitantes} visitantes en ${obtenerNombreMes(mesActual)}`;
        mostrarExito(resumen);

    } catch (error) {
        console.error('Error cargando comparativa del mes actual:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar la comparativa mensual');
    }
}

// Función para aplicar filtro de rango de fechas - VERSIÓN MEJORADA
async function aplicarFiltroRangoFechasComparativo() {
    const fechaInicial = document.getElementById('filtroFechaInicial').value;
    const fechaFinal = document.getElementById('filtroFechaFinal').value;
    const generoSeleccionado = document.getElementById('filtroGeneroFecha').value;
    
    console.log('🎯 Aplicando filtro COMPARATIVO con parámetros:', {
        fechaInicial, 
        fechaFinal, 
        generoSeleccionado
    });
    
    // Validaciones
    if (!fechaInicial || !fechaFinal) {
        mostrarMensajeSinDatos('Por favor selecciona ambas fechas');
        return;
    }
    
    if (fechaInicial > fechaFinal) {
        mostrarMensajeSinDatos('La fecha inicial no puede ser mayor que la fecha final');
        return;
    }

    try {
        mostrarLoading('Cargando datos comparativos...');

        console.log('🔍 Aplicando filtro COMPARATIVO para rango:', fechaInicial, 'a', fechaFinal);
        
        // Cargar datos del rango seleccionado
        const datosFiltrados = await cargarDatosGeneroPorTiempo('fecha', {
            fechaInicial: fechaInicial,
            fechaFinal: fechaFinal
        });

        console.log('✅ Datos filtrados obtenidos:', datosFiltrados);

        // ✅ GARANTIZAR QUE SIEMPRE HAYA 4 GÉNEROS PARA COMPARACIÓN
        const todosLosGeneros = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'];
        
        // Crear un objeto para mapear los valores por género
        const valoresPorGenero = {};
        
        // Inicializar todos los géneros en 0
        todosLosGeneros.forEach(genero => {
            valoresPorGenero[genero] = 0;
        });
        
        // Actualizar con los valores reales obtenidos
        if (datosFiltrados && datosFiltrados.labels && datosFiltrados.values) {
            datosFiltrados.labels.forEach((genero, index) => {
                if (todosLosGeneros.includes(genero)) {
                    valoresPorGenero[genero] = datosFiltrados.values[index] || 0;
                }
            });
        }

        // PREPARAR DATOS PARA COMPARACIÓN VISUAL
        let datosFinales;
        
        // Obtener información del período para el título
        const mesInicial = obtenerNombreMesDesdeFecha(fechaInicial);
        const mesFinal = obtenerNombreMesDesdeFecha(fechaFinal);
        const añoInicial = obtenerAnioDesdeFecha(fechaInicial);
        const añoFinal = obtenerAnioDesdeFecha(fechaFinal);
        
        let titulo;
        if (mesInicial === mesFinal && añoInicial === añoFinal) {
            titulo = `Comparativa por Género - ${mesInicial} ${añoInicial}`;
        } else {
            titulo = `Comparativa por Género (${formatearFecha(fechaInicial)} - ${formatearFecha(fechaFinal)})`;
        }

        if (generoSeleccionado !== 'todos') {
            console.log(`🔍 Filtrando por género específico: "${generoSeleccionado}"`);
            
            // Para un género específico, mostrar solo ese género pero con el valor correcto
            datosFinales = {
                labels: [generoSeleccionado],
                values: [valoresPorGenero[generoSeleccionado] || 0],
                type: 'genero_especifico',
                periodo: titulo
            };
            titulo += ` - ${formatearGenero(generoSeleccionado)}`;
            console.log('✅ Datos para género específico:', datosFinales);
        } else {
            // ✅ PARA COMPARACIÓN: Mostrar SIEMPRE los 4 géneros
            datosFinales = {
                labels: todosLosGeneros,
                values: todosLosGeneros.map(genero => valoresPorGenero[genero] || 0),
                type: 'comparativa',
                periodo: titulo,
                mesInicial: mesInicial,
                mesFinal: mesFinal,
                añoInicial: añoInicial,
                añoFinal: añoFinal
            };
            console.log('✅ Datos para COMPARACIÓN (4 géneros garantizados):', datosFinales);
        }

        cerrarLoading();

        // Verificar si hay datos
        const totalVisitantes = datosFinales.values.reduce((a, b) => a + b, 0);
        console.log('👥 Total de visitantes encontrados:', totalVisitantes);
        
        if (totalVisitantes === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el rango de fechas seleccionado');
            return;
        }

        console.log('🎯 Datos finales para mostrar:', datosFinales);
        
        // Actualizar datos y gráfica
        datosSimulados.fecha = datosFinales;
        
        // SIEMPRE actualizar la gráfica del modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            console.log('🔄 Actualizando gráfica COMPARATIVA en modal...');
            
            // Actualizar título del modal
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-chart-bar"></i> ${titulo}`;
            }
            
            // FORZAR la actualización de la gráfica con los nuevos datos
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaComparativa(tipoGraficaActual, datosFinales, titulo);
        }

        // Mostrar resumen comparativo
        const resumen = generarResumenComparativo(datosFinales);
        mostrarExito(resumen);

    } catch (error) {
        console.error('💥 Error aplicando filtro de rango de fechas:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos: ' + error.message);
    }
}

// Función para actualizar gráfica comparativa
function actualizarGraficaComparativa(tipoGrafica, datosComparativa, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    const colors = generarColores('genero', datosComparativa.labels);
    const etiquetaDescriptiva = 'Géneros';

    // Configuración especial para gráfica comparativa
    chartAmpliado = new Chart(ctx, {
        type: tipoGrafica === "bar" ? "bar" : "bar", // Forzar barras para comparación
        data: {
            labels: datosComparativa.labels.map(formatearGenero),
            datasets: [
                {
                    label: "Total de Visitantes",
                    data: datosComparativa.values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => darkenColor(color, 0.3)),
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 35,
                    hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // Ocultar leyenda ya que los colores están en las barras
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.y;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Visitantes',
                        font: { weight: 'bold', size: 14 }
                    },
                    // Mostrar siempre un valor mínimo para que se vean las barras pequeñas
                    suggestedMin: 0,
                    suggestedMax: function() {
                        const maxValue = Math.max(...datosComparativa.values);
                        return maxValue === 0 ? 10 : Math.ceil(maxValue * 1.2);
                    }
                },
                x: {
                    grid: { 
                        display: false 
                    },
                    title: {
                        display: true,
                        text: etiquetaDescriptiva,
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    }
                }
            },
            // Animaciones para gráfica comparativa
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        },
    });

    // Actualizar tabla con datos comparativos
    actualizarTablaComparativa(datosComparativa);
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

// Función para generar resumen comparativo
function generarResumenComparativo(datosComparativa) {
    const total = datosComparativa.values.reduce((a, b) => a + b, 0);
    
    if (datosComparativa.labels.length === 1) {
        return `Género ${datosComparativa.labels[0]}: ${total} visitantes`;
    }
    
    // Para comparativa de múltiples géneros
    const valoresPositivos = datosComparativa.values.filter(v => v > 0);
    
    if (valoresPositivos.length === 0) {
        return 'No se encontraron visitantes en el período seleccionado';
    }
    
    const maxValue = Math.max(...valoresPositivos);
    const maxIndex = datosComparativa.values.indexOf(maxValue);
    const generoMaximo = datosComparativa.labels[maxIndex];
    const porcentajeMaximo = ((maxValue / total) * 100).toFixed(1);
    
    let resumen = `Comparativa completada: ${total} visitantes totales. `;
    
    if (valoresPositivos.length > 1) {
        resumen += `Género predominante: ${generoMaximo} (${porcentajeMaximo}%)`;
    } else {
        resumen += `Único género con datos: ${generoMaximo}`;
    }
    
    return resumen;
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

// Función auxiliar para obtener estructura de géneros vacía
async function obtenerEstructuraGenerosVacia() {
    try {
        const { data: generos } = await supabase
            .from('genero')
            .select('id_genero, genero');

        if (generos && generos.length > 0) {
            return {
                labels: generos.map(g => g.genero),
                values: generos.map(() => 0)
            };
        } else {
            // Fallback por si no hay géneros en la base de datos
            return {
                labels: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'],
                values: [0, 0, 0, 0]
            };
        }
    } catch (error) {
        console.error('Error obteniendo estructura de géneros:', error);
        return {
            labels: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'],
            values: [0, 0, 0, 0]
        };
    }
}

// Función para aplicar filtro de rango de meses - VERSIÓN MEJORADA
async function aplicarFiltroRangoMeses() {
    const fechaInicial = document.getElementById('filtroFechaInicialMes').value;
    const fechaFinal = document.getElementById('filtroFechaFinalMes').value;
    const generoSeleccionado = document.getElementById('filtroGeneroMes').value;
    
    console.log('🎯 Aplicando filtro MES con parámetros:', {
        fechaInicial, 
        fechaFinal, 
        generoSeleccionado
    });
    
    // Validaciones
    if (!fechaInicial || !fechaFinal) {
        mostrarMensajeSinDatos('Por favor selecciona ambas fechas');
        return;
    }
    
    if (fechaInicial > fechaFinal) {
        mostrarMensajeSinDatos('La fecha inicial no puede ser mayor que la fecha final');
        return;
    }

    try {
        mostrarLoading('Cargando comparativa por mes...');

        console.log('🔍 Aplicando filtro MES para rango:', fechaInicial, 'a', fechaFinal);
        
        // Obtener información del mes y año para comparación
        const mesInicialInfo = obtenerMesYAnioDesdeFecha(fechaInicial);
        const mesFinalInfo = obtenerMesYAnioDesdeFecha(fechaFinal);
        
        console.log('📅 Información del período:', {
            mesInicial: mesInicialInfo,
            mesFinal: mesFinalInfo
        });

        // Verificar si estamos comparando el mismo mes y año
        const esMismoMesYAnio = mesInicialInfo.mes === mesFinalInfo.mes && mesInicialInfo.año === mesFinalInfo.año;
        
        let titulo;
        if (esMismoMesYAnio) {
            // SI ES EL MISMO MES: Mostrar comparativa por género
            titulo = `Comparativa por Género - ${mesInicialInfo.mes} ${mesInicialInfo.año}`;
            
            // Cargar datos del rango seleccionado (por género)
            const datosFiltrados = await cargarDatosGeneroPorTiempo('mes', {
                fechaInicial: fechaInicial,
                fechaFinal: fechaFinal
            });

            console.log('✅ Datos MES filtrados obtenidos:', datosFiltrados);

            // ✅ GARANTIZAR LOS 4 GÉNEROS
            const todosLosGeneros = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'];
            const valoresPorGenero = {};
            
            todosLosGeneros.forEach(genero => {
                valoresPorGenero[genero] = 0;
            });
            
            if (datosFiltrados && datosFiltrados.labels && datosFiltrados.values) {
                datosFiltrados.labels.forEach((genero, index) => {
                    if (todosLosGeneros.includes(genero)) {
                        valoresPorGenero[genero] = datosFiltrados.values[index] || 0;
                    }
                });
            }

            // PREPARAR DATOS SEGÚN FILTRO DE GÉNERO
            let datosFinales;

            if (generoSeleccionado !== 'todos') {
                console.log(`🔍 Filtrando por género: "${generoSeleccionado}"`);
                
                datosFinales = {
                    labels: [generoSeleccionado],
                    values: [valoresPorGenero[generoSeleccionado] || 0],
                    type: 'genero_especifico',
                    periodo: titulo,
                    mes: mesInicialInfo.mes,
                    año: mesInicialInfo.año
                };
                titulo += ` - ${formatearGenero(generoSeleccionado)}`;
                console.log('✅ Género encontrado, datos filtrados:', datosFinales);
            } else {
                // Mostrar todos los géneros (siempre 4) - BARRAS JUNTAS
                datosFinales = {
                    labels: todosLosGeneros,
                    values: todosLosGeneros.map(genero => valoresPorGenero[genero] || 0),
                    type: 'comparativa_mensual',
                    periodo: titulo,
                    mes: mesInicialInfo.mes,
                    año: mesInicialInfo.año,
                    esMismoMes: true
                };
            }

            cerrarLoading();

            // Verificar si hay datos
            const totalVisitantes = datosFinales.values.reduce((a, b) => a + b, 0);
            console.log('👥 Total de visitantes encontrados:', totalVisitantes);
            
            if (totalVisitantes === 0) {
                mostrarMensajeSinDatos(`No hay datos disponibles para ${mesInicialInfo.mes} ${mesInicialInfo.año}`);
                return;
            }

            console.log('🎯 Datos finales para mostrar:', datosFinales);
            
            // Actualizar datos y gráfica
            datosSimulados.mes = datosFinales;
            
            // Actualizar la gráfica del modal
            const modal = document.getElementById("chartModal");
            if (modal && modal.classList.contains('show')) {
                console.log('🔄 Actualizando gráfica COMPARATIVA MENSUAL en modal...');
                
                // Actualizar título del modal
                const modalTitle = document.getElementById("modalTitle");
                if (modalTitle) {
                    modalTitle.innerHTML = `<i class="fas fa-chart-bar"></i> ${titulo}`;
                }
                
                // FORZAR la actualización de la gráfica con los nuevos datos
                const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
                actualizarGraficaComparativaMensual(tipoGraficaActual, datosFinales, titulo);
            }

            // Mostrar resumen específico por mes
            const resumen = `Comparativa de ${mesInicialInfo.mes} ${mesInicialInfo.año}: ${totalVisitantes} visitantes totales`;
            mostrarExito(resumen);

        } else {
            // SI SON MESES DIFERENTES: Mostrar comparativa por fecha
            titulo = `Visitantes por Fecha (${formatearFecha(fechaInicial)} - ${formatearFecha(fechaFinal)})`;
            
            // Cargar datos por fecha
            const datosFiltrados = await cargarDatosPorRangoFechas(fechaInicial, fechaFinal);

            console.log('✅ Datos FECHAS filtrados obtenidos:', datosFiltrados);

            // Verificar si hay datos
            const totalVisitantes = datosFiltrados.values.reduce((a, b) => a + b, 0);
            console.log('👥 Total de visitantes encontrados:', totalVisitantes);
            
            if (totalVisitantes === 0) {
                mostrarMensajeSinDatos('No hay datos disponibles para el rango de meses seleccionado');
                return;
            }

            cerrarLoading();

            console.log('🎯 Datos finales para mostrar:', datosFiltrados);
            
            // Actualizar datos y gráfica
            datosSimulados.mes = datosFiltrados;
            
            // Actualizar la gráfica del modal
            const modal = document.getElementById("chartModal");
            if (modal && modal.classList.contains('show')) {
                console.log('🔄 Actualizando gráfica FECHAS en modal...');
                
                // Actualizar título del modal
                const modalTitle = document.getElementById("modalTitle");
                if (modalTitle) {
                    modalTitle.innerHTML = `<i class="fas fa-calendar"></i> ${titulo}`;
                }
                
                // FORZAR la actualización de la gráfica con los nuevos datos
                const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
                actualizarGraficaFechas(tipoGraficaActual, datosFiltrados, titulo);
            }

            // Mostrar resumen
            const resumen = `Se encontraron ${totalVisitantes} visitantes entre ${mesInicialInfo.mes} ${mesInicialInfo.año} y ${mesFinalInfo.mes} ${mesFinalInfo.año}`;
            mostrarExito(resumen);
        }

    } catch (error) {
        console.error('💥 Error aplicando filtro de rango de meses:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos: ' + error.message);
    }
}

// Función para actualizar gráfica comparativa mensual (barras juntas por género)
function actualizarGraficaComparativaMensual(tipoGrafica, datosComparativa, titulo) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    
    if (chartAmpliado) chartAmpliado.destroy();

    const colors = generarColores('genero', datosComparativa.labels);
    const etiquetaDescriptiva = 'Géneros';

    // Configuración especial para gráfica comparativa mensual
    chartAmpliado = new Chart(ctx, {
        type: tipoGrafica === "bar" ? "bar" : "bar", // Forzar barras para comparación
        data: {
            labels: datosComparativa.labels.map(formatearGenero),
            datasets: [
                {
                    label: "Total de Visitantes",
                    data: datosComparativa.values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => darkenColor(color, 0.3)),
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 35,
                    hoverBackgroundColor: colors.map(color => lightenColor(color, 0.1)),
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // Ocultar leyenda ya que los colores están en las barras
                },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.y;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Visitantes',
                        font: { weight: 'bold', size: 14 }
                    },
                    // Mostrar siempre un valor mínimo para que se vean las barras pequeñas
                    suggestedMin: 0,
                    suggestedMax: function() {
                        const maxValue = Math.max(...datosComparativa.values);
                        return maxValue === 0 ? 10 : Math.ceil(maxValue * 1.2);
                    }
                },
                x: {
                    grid: { 
                        display: false 
                    },
                    title: {
                        display: true,
                        text: etiquetaDescriptiva,
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    }
                }
            },
            // Animaciones para gráfica comparativa
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        },
    });

    // Actualizar tabla con datos comparativos mensuales
    actualizarTablaComparativaMensual(datosComparativa);
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
                    <i class="fas fa-users"></i> TOTAL ${datosComparativa.mes} ${datosComparativa.año}
                </td>
                <td style="text-align: center; font-size: 16px;">${total.toLocaleString()}</td>
                <td style="text-align: center; font-size: 16px;">100%</td>
            </tr>
        `;
    }
}

// Función para aplicar filtro de rango de años - VERSIÓN MEJORADA
async function aplicarFiltroRangoAnios() {
    const fechaInicial = document.getElementById('filtroFechaInicialAnio').value;
    const fechaFinal = document.getElementById('filtroFechaFinalAnio').value;
    const generoSeleccionado = document.getElementById('filtroGeneroAnio').value;
    
    console.log('🎯 Aplicando filtro AÑO con parámetros:', {
        fechaInicial, 
        fechaFinal, 
        generoSeleccionado
    });
    
    // Validaciones
    if (!fechaInicial || !fechaFinal) {
        mostrarMensajeSinDatos('Por favor selecciona ambas fechas');
        return;
    }
    
    if (fechaInicial > fechaFinal) {
        mostrarMensajeSinDatos('La fecha inicial no puede ser mayor que la fecha final');
        return;
    }

    try {
        mostrarLoading('Cargando comparativa por año...');

        console.log('🔍 Aplicando filtro AÑO para rango:', fechaInicial, 'a', fechaFinal);
        
        // Obtener información del año para comparación
        const añoInicial = obtenerAnioDesdeFecha(fechaInicial);
        const añoFinal = obtenerAnioDesdeFecha(fechaFinal);
        
        // Verificar si estamos comparando el mismo año
        const esMismoAnio = añoInicial === añoFinal;
        
        let titulo;
        if (esMismoAnio) {
            titulo = `Comparativa Anual - Año ${añoInicial}`;
        } else {
            titulo = `Comparativa por Año (${añoInicial} - ${añoFinal})`;
        }

        // Usar la función para cargar datos
        const datosFiltrados = await cargarDatosGeneroPorTiempo('anio', {
            fechaInicial: fechaInicial,
            fechaFinal: fechaFinal
        });

        console.log('✅ Datos AÑO filtrados obtenidos:', datosFiltrados);

        // ✅ GARANTIZAR LOS 4 GÉNEROS
        const todosLosGeneros = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'];
        const valoresPorGenero = {};
        
        todosLosGeneros.forEach(genero => {
            valoresPorGenero[genero] = 0;
        });
        
        if (datosFiltrados && datosFiltrados.labels && datosFiltrados.values) {
            datosFiltrados.labels.forEach((genero, index) => {
                if (todosLosGeneros.includes(genero)) {
                    valoresPorGenero[genero] = datosFiltrados.values[index] || 0;
                }
            });
        }

        // PREPARAR DATOS SEGÚN FILTRO DE GÉNERO
        let datosFinales;

        if (generoSeleccionado !== 'todos') {
            console.log(`🔍 Filtrando por género: "${generoSeleccionado}"`);
            
            datosFinales = {
                labels: [generoSeleccionado],
                values: [valoresPorGenero[generoSeleccionado] || 0],
                type: 'genero_especifico',
                periodo: titulo,
                año: esMismoAnio ? añoInicial : 'Varios años'
            };
            titulo += ` - ${formatearGenero(generoSeleccionado)}`;
            console.log('✅ Género encontrado, datos filtrados:', datosFinales);
        } else {
            // Mostrar todos los géneros (siempre 4)
            datosFinales = {
                labels: todosLosGeneros,
                values: todosLosGeneros.map(genero => valoresPorGenero[genero] || 0),
                type: 'comparativa',
                periodo: titulo,
                año: esMismoAnio ? añoInicial : 'Varios años',
                añoInicial: añoInicial,
                añoFinal: añoFinal
            };
        }

        cerrarLoading();

        // Verificar si hay datos
        const totalVisitantes = datosFinales.values.reduce((a, b) => a + b, 0);
        console.log('👥 Total de visitantes encontrados:', totalVisitantes);
        
        if (totalVisitantes === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el rango de años seleccionado');
            return;
        }

        console.log('🎯 Datos finales para mostrar:', datosFinales);
        
        // Actualizar datos y gráfica
        datosSimulados.anio = datosFinales;
        
        // Actualizar la gráfica del modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            console.log('🔄 Actualizando gráfica en modal...');
            
            // Actualizar título del modal
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-expand"></i> ${titulo}`;
            }
            
            // FORZAR la actualización de la gráfica con los nuevos datos Y el título personalizado
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaComparativa(tipoGraficaActual, datosFinales, titulo);
        }

        // Mostrar resumen específico por año
        let resumen;
        if (esMismoAnio) {
            resumen = `Comparativa del Año ${añoInicial}: ${totalVisitantes} visitantes`;
        } else {
            resumen = `Comparativa de ${añoInicial} a ${añoFinal}: ${totalVisitantes} visitantes`;
        }
        
        mostrarExito(resumen);

    } catch (error) {
        console.error('💥 Error aplicando filtro de rango de años:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos: ' + error.message);
    }
}

// Función para aplicar filtro de día específico
async function aplicarFiltroDiaEspecifico() {
    const diaSeleccionado = document.getElementById('filtroDiaEspecifico').value;
    
    if (diaSeleccionado === 'todos') {
        // Restaurar datos originales
        datosSimulados.dia = JSON.parse(JSON.stringify(datosOriginales.dia));
        actualizarGraficaModal(document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica'));
        return;
    }

    try {
        mostrarLoading('Aplicando filtro...');

        const ahora = new Date();
        const añoActual = ahora.getFullYear();
        const mesActual = ahora.getMonth();
        const diaNumero = parseInt(diaSeleccionado);
        
        // Crear fecha específica para el día seleccionado
        const fechaEspecifica = new Date(añoActual, mesActual, diaNumero);
        const fechaStr = fechaEspecifica.toISOString().split('T')[0];
        
        console.log('Consultando datos para fecha:', fechaStr);

        // Consultar participantes para esa fecha específica
        const { data: participantes, error } = await supabase
            .from('participantes_reserva')
            .select('id_genero, fecha_visita')
            .not('id_genero', 'is', null)
            .eq('fecha_visita', fechaStr);

        if (error) {
            console.error('Error en consulta de día específico:', error);
            throw error;
        }

        console.log('Participantes encontrados para el día:', participantes);

        // Obtener TODOS los géneros
        const { data: generos } = await supabase
            .from('genero')
            .select('id_genero, genero');

        // Contar participantes por género
        const conteoPorGenero = {};
        participantes.forEach(participante => {
            if (participante.id_genero) {
                const generoId = participante.id_genero;
                conteoPorGenero[generoId] = (conteoPorGenero[generoId] || 0) + 1;
            }
        });

        console.log('Conteo por género para el día:', conteoPorGenero);

        // Combinar datos de géneros con conteos - SIEMPRE incluir los 4 géneros
        const datosCombinados = generos.map(genero => ({
            genero: genero.genero,
            count: conteoPorGenero[genero.id_genero] || 0
        }));

        const datosFiltrados = {
            labels: datosCombinados.map(item => item.genero),
            values: datosCombinados.map(item => item.count)
        };

        cerrarLoading();

        // Verificar si hay datos
        const totalVisitantes = datosFiltrados.values.reduce((a, b) => a + b, 0);
        if (totalVisitantes === 0) {
            const nombreDia = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fechaEspecifica.getDay()];
            mostrarMensajeSinDatos(`No hay datos disponibles para el ${nombreDia} ${diaNumero}`);
            return;
        }

        // Crear título descriptivo
        const nombreDia = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fechaEspecifica.getDay()];
        const mesNombre = obtenerNombreMes(mesActual);
        const titulo = `Visitantes - ${nombreDia} ${diaNumero} de ${mesNombre} ${añoActual}`;
        
        // Actualizar datos y gráfica
        datosSimulados.dia = datosFiltrados;
        actualizarGraficaConFiltro(datosFiltrados, titulo);

    } catch (error) {
        console.error('Error aplicando filtro de día específico:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos para el día seleccionado');
    }
}

// Función para aplicar filtro de intereses
async function aplicarFiltroIntereses() {
    // Obtener elementos del DOM con verificación
    const fechaInicialElement = document.getElementById('filtroFechaInicialIntereses');
    const fechaFinalElement = document.getElementById('filtroFechaFinalIntereses');
    const interesElement = document.getElementById('filtroInteresEspecifico');
    
    // Verificar que los elementos existan
    if (!fechaInicialElement || !fechaFinalElement || !interesElement) {
        console.error('❌ No se encontraron los elementos del filtro de intereses');
        mostrarMensajeSinDatos('Error: No se pudieron cargar los filtros');
        return;
    }
    
    const fechaInicial = fechaInicialElement.value;
    const fechaFinal = fechaFinalElement.value;
    const interesSeleccionado = interesElement.value;
    
    console.log('🎯 Aplicando filtro INTERESES con parámetros:', {
        fechaInicial, 
        fechaFinal, 
        interesSeleccionado
    });
    
    // Validaciones
    if (!fechaInicial || !fechaFinal) {
        mostrarMensajeSinDatos('Por favor selecciona ambas fechas');
        return;
    }
    
    if (fechaInicial > fechaFinal) {
        mostrarMensajeSinDatos('La fecha inicial no puede ser mayor que la fecha final');
        return;
    }

    try {
        mostrarLoading('Aplicando filtro...');

        // Cargar datos de intereses
        const datosFiltrados = await cargarDatosInteresesPorTiempo(fechaInicial, fechaFinal, interesSeleccionado);

        console.log('✅ Datos INTERESES filtrados obtenidos:', datosFiltrados);

        cerrarLoading();

        // Verificar si hay datos
        const totalVisitantes = datosFiltrados.values.reduce((a, b) => a + b, 0);
        console.log('👥 Total de visitantes encontrados:', totalVisitantes);
        
        if (totalVisitantes === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para los criterios seleccionados');
            return;
        }

        // Crear título descriptivo según el tipo de datos
        let titulo;
        if (datosFiltrados.type === 'genero') {
            // Muestra géneros para un interés específico
            titulo = `Distribución por Género - Interés: ${datosFiltrados.interes}`;
            if (fechaInicial && fechaFinal) {
                titulo += ` (${formatearFecha(fechaInicial)} - ${formatearFecha(fechaFinal)})`;
            }
        } else {
            // Muestra todos los intereses
            titulo = 'Visitantes por Interés en Heliconias';
            if (fechaInicial && fechaFinal) {
                titulo += ` (${formatearFecha(fechaInicial)} - ${formatearFecha(fechaFinal)})`;
            }
        }

        console.log('🎯 Datos finales para mostrar:', datosFiltrados);
        
        // Actualizar datos y gráfica
        datosSimulados.intereses = datosFiltrados;
        
        // Actualizar la gráfica del modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            console.log('🔄 Actualizando gráfica en modal...');
            
            // Actualizar título del modal
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-expand"></i> ${titulo}`;
            }
            
            // Actualizar la gráfica
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaModal(tipoGraficaActual, titulo);
        }

        // Mostrar resumen
        mostrarExito(`Se encontraron ${totalVisitantes} visitantes en el rango seleccionado`);

    } catch (error) {
        console.error('💥 Error aplicando filtro de intereses:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos: ' + error.message);
    }
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

// Función para actualizar gráfica con datos filtrados
function actualizarGraficaConFiltro(datosFiltrados, tituloPersonalizado) {
    const ctx = document.getElementById("chartAmpliado").getContext("2d");
    const tipoGrafica = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');

    if (chartAmpliado) chartAmpliado.destroy();

    // Actualizar título del modal
    const modalTitle = document.getElementById("modalTitle");
    modalTitle.innerHTML = `<i class="fas fa-expand"></i> ${tituloPersonalizado}`;

    const colors = generarColores(tipoActual, datosFiltrados.labels);

    const labelsParaGrafica = tipoActual === 'genero' ? datosFiltrados.labels.map(formatearGenero) : 
                            tipoActual === 'fecha' ? datosFiltrados.labels.map(formatearGenero) :
                            datosFiltrados.labels;

    chartAmpliado = new Chart(ctx, {
        type: tipoGrafica === "bar" ? "bar" : "doughnut",
        data: {
            labels: labelsParaGrafica,
            datasets: [
                {
                    label: "Total de Visitantes",
                    data: datosFiltrados.values,
                    backgroundColor: colors,
                    borderRadius: tipoGrafica === "bar" ? 6 : 0,
                    borderWidth: tipoGrafica === "bar" ? 0 : 2,
                    borderColor: tipoGrafica === "bar" ? 'transparent' : '#fff',
                    barThickness: tipoGrafica === "bar" ? 18 : undefined,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: tipoGrafica === "bar" ? 'top' : 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 13 }
                    }
                },
                title: {
                    display: true,
                    text: tituloPersonalizado,
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.y || context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} visitantes (${percentage}%)`;
                        }
                    }
                }
            },
            scales: tipoGrafica === "bar" ? {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: {
                        display: true,
                        text: 'Cantidad de Visitantes',
                        font: { weight: 'bold', size: 14 }
                    }
                },
                x: {
                    grid: { display: false },
                    title: {
                        display: true,
                        text: obtenerEtiquetaDescriptiva(tipoActual),
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            } : {},
            cutout: tipoGrafica === "bar" ? '0%' : '40%'
        },
    });

    // Actualizar tabla con datos filtrados normales
    const tbody = document.querySelector("#tablaDatos tbody");
    const total = datosFiltrados.values.reduce((a, b) => a + b, 0);
    
    tbody.innerHTML = datosFiltrados.labels
        .map((l, i) => {
            const porcentaje = total > 0 ? ((datosFiltrados.values[i] / total) * 100).toFixed(1) : 0;
            
            const labelFormateado = tipoActual === 'genero' ? formatearGenero(l) : 
                                tipoActual === 'fecha' ? formatearGenero(l) :
                                l;
            
            if (tipoActual === 'genero' || tipoActual === 'fecha') {
                const claseGenero = obtenerClaseGenero(l);
                return `<tr>
                    <td>
                        <span class="gender-badge ${claseGenero}">
                            <i class="fas ${l === 'masculino' ? 'fa-mars' : l === 'femenino' ? 'fa-venus' : 'fa-genderless'}"></i>
                            ${labelFormateado}
                        </span>
                    </td>
                    <td style="text-align: center;"><strong>${datosFiltrados.values[i].toLocaleString()}</strong></td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                </tr>`;
            } else {
                return `<tr>
                    <td><strong>${labelFormateado}</strong></td>
                    <td style="text-align: center;"><strong>${datosFiltrados.values[i].toLocaleString()}</strong></td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                </tr>`;
            }
        })
        .join("");
}

// Función placeholder para insertar datos de prueba
function insertarDatosDePrueba() {
    console.log('Función insertarDatosDePrueba - por implementar');
    mostrarMensajeSinDatos('Función en desarrollo');
}

// Funciones de utilidad (deben estar definidas en tu código)
function mostrarLoading(mensaje) {
    // Implementación de mostrar loading
    console.log('Loading:', mensaje);
}

function cerrarLoading() {
    // Implementación de cerrar loading
    console.log('Cerrando loading');
}

function mostrarError(mensaje) {
    // Implementación de mostrar error
    console.error('Error:', mensaje);
}

function mostrarExito(mensaje) {
    // Implementación de mostrar éxito
    console.log('Éxito:', mensaje);
}

function mostrarMensajeSinDatos(mensaje) {
    // Implementación de mostrar mensaje sin datos
    console.warn('Sin datos:', mensaje);
}

function mostrarDatos() {
    // Implementación de mostrar datos
    console.log('Mostrando datos');
}

function actualizarGraficaModal(tipoGrafica, titulo) {
    // Implementación de actualizar gráfica modal
    console.log('Actualizando gráfica modal:', tipoGrafica, titulo);
}