// Genero - utils
// Refactor modular: lógica original preservada.

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
    const g = genero.trim().toLowerCase();
    const clases = {
        'masculino': 'masculino',
        'femenino': 'femenino',
        'otro': 'otro',
        'prefiero no decirlo': 'prefiero-no-decirlo',
        'prefiero no decir': 'prefiero-no-decirlo', // <-- agrega esta variante
    };
    return clases[g] || 'prefiero-no-decirlo'; // fallback seguro
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

// Función para formatear fecha corta (como en la imagen: 20-ene)
function formatearFechaCorta(fechaStr) {
    if (!fechaStr) return 'Fecha inválida';
    
    try {
        // Si ya está en formato "23-ene", devolverlo tal cual
        if (typeof fechaStr === 'string' && /^\d{1,2}-\w{3}$/.test(fechaStr)) {
            return fechaStr;
        }
        
        // Si es una fecha ISO completa
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

// También mejora formatearFecha() para mayor robustez:
function formatearFecha(fechaStr) {
    if (!fechaStr) return 'Fecha inválida';
    
    try {
        // Si ya está en formato "23-ene", convertirlo a fecha completa
        if (typeof fechaStr === 'string' && /^\d{1,2}-\w{3}$/.test(fechaStr)) {
            const [dia, mesAbrev] = fechaStr.split('-');
            const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                          'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            const mesNum = meses.indexOf(mesAbrev.toLowerCase());
            
            if (mesNum === -1) return fechaStr;
            
            // Asumir año actual
            const ahora = new Date();
            const fecha = new Date(ahora.getFullYear(), mesNum, parseInt(dia));
            
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
            });
        }
        
        // Si es una fecha ISO
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

// Función auxiliar para obtener número de mes desde abreviatura
function obtenerNumeroMes(mesAbrev) {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                   'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const mes = mesAbrev.toLowerCase();
    const index = meses.indexOf(mes);
    return index !== -1 ? index : 0;
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

// Agrega esto en data-functions.js para debug
async function debugFechasBD() {
    console.log('🔍 DEBUG: Consultando fechas en la BD...');
    
    const { data, error } = await supabase
        .from('participantes_reserva')
        .select('fecha_visita, id_genero')
        .limit(10);
        
    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('📅 Fechas en BD:', data);
        console.log('📅 Formato de fechas:');
        data.forEach((item, i) => {
            console.log(`${i + 1}. ${item.fecha_visita} (genero: ${item.id_genero})`);
        });
    }
}

// Ejecutar en consola: debugFechasBD()

// Función placeholder para insertar datos de prueba
function insertarDatosDePrueba() {
    console.log('Función insertarDatosDePrueba - por implementar');
    mostrarMensajeSinDatos('Función en desarrollo');
}
