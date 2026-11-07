// Genero - filters
// Refactor modular: lógica original preservada.

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

// Función para aplicar filtro de rango de fechas con gráficas agrupadas - VERSIÓN CORREGIDA
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
        
        // CONSULTA PARA OBTENER DATOS AGRUPADOS POR FECHA Y GÉNERO
        let query = supabase
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

        const { data: participantes, error } = await query;

        if (error) {
            console.error('❌ Error en consulta de participantes:', error);
            throw error;
        }

        console.log('👥 Participantes encontrados en rango:', participantes);

        if (!participantes || participantes.length === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el rango de fechas seleccionado');
            cerrarLoading();
            return;
        }

        // Obtener todos los géneros disponibles
        const { data: generos } = await supabase
            .from('genero')
            .select('id_genero, genero')
            .order('id_genero');

        console.log('🎭 Géneros disponibles:', generos);

        // Procesar datos según el tipo de filtro
        let datosProcesados;
        let titulo;
        
        if (generoSeleccionado !== 'todos') {
            // CASO 1: GÉNERO ESPECÍFICO - Barras por fecha para un solo género
            datosProcesados = await procesarDatosGeneroEspecifico(
                participantes, 
                generos, 
                generoSeleccionado, 
                fechaInicial, 
                fechaFinal
            );
            titulo = `${formatearGenero(generoSeleccionado)} - ${formatearFecha(fechaInicial)} a ${formatearFecha(fechaFinal)}`;
        } else {
            // CASO 2: TODOS LOS GÉNEROS - Barras agrupadas por fecha
            datosProcesados = await procesarDatosAgrupadosPorGenero(
                participantes, 
                generos, 
                fechaInicial, 
                fechaFinal
            );
            titulo = `Visitantes por Género y Fecha - ${formatearFecha(fechaInicial)} a ${formatearFecha(fechaFinal)}`;
        }

        cerrarLoading();

        // Verificar si hay datos
        const totalVisitantes = datosProcesados.total || 
            (datosProcesados.values ? datosProcesados.values.reduce((a, b) => a + b, 0) : 0);
        
        if (totalVisitantes === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el rango de fechas seleccionado');
            return;
        }

        console.log('🎯 Datos procesados para mostrar:', datosProcesados);
        
        // Actualizar datos
        datosSimulados.fecha = datosProcesados;
        
        // SIEMPRE actualizar la gráfica del modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            console.log('🔄 Actualizando gráfica en modal...');
            
            // Actualizar título del modal
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-chart-bar"></i> ${titulo}`;
            }
            
            // FORZAR la actualización de la gráfica con los nuevos datos
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaModalConDatosAgrupados(tipoGraficaActual, datosProcesados, titulo);
        }

        // Mostrar resumen
        mostrarExito(`Se encontraron ${totalVisitantes} visitantes en el rango seleccionado`);

    } catch (error) {
        console.error('💥 Error aplicando filtro de rango de fechas:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos: ' + error.message);
    }
}

// Función SIMPLIFICADA para aplicar filtro por mes
async function aplicarFiltroRangoMeses() {
    const fechaInicial = document.getElementById('filtroFechaInicialMes').value;
    const fechaFinal = document.getElementById('filtroFechaFinalMes').value;
    const generoSeleccionado = document.getElementById('filtroGeneroMes').value;
    
    console.log('🎯 Aplicando filtro por MES:', { fechaInicial, fechaFinal, generoSeleccionado });
    
    // Validaciones básicas
    if (!fechaInicial || !fechaFinal) {
        mostrarMensajeSinDatos('Por favor selecciona ambas fechas');
        return;
    }
    
    if (fechaInicial > fechaFinal) {
        mostrarMensajeSinDatos('La fecha inicial no puede ser mayor que la fecha final');
        return;
    }

    try {
        mostrarLoading('Cargando datos por mes...');
        
        // Usar la función genérica para procesar meses
        const datosProcesados = await procesarDatosPorPeriodo('mes', fechaInicial, fechaFinal, generoSeleccionado);
        
        cerrarLoading();
        
        // Verificar si hay datos
        if (datosProcesados.totalGeneral === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el rango de meses seleccionado');
            return;
        }
        
        // Actualizar datos
        datosSimulados.mes = datosProcesados;
        tipoActual = 'mes'; // IMPORTANTE: Actualizar el tipo actual
        
        // Crear título
        let titulo;
        const mesInicial = obtenerNombreMesDesdeFecha(fechaInicial);
        const mesFinal = obtenerNombreMesDesdeFecha(fechaFinal);
        const añoInicial = obtenerAnioDesdeFecha(fechaInicial);
        const añoFinal = obtenerAnioDesdeFecha(fechaFinal);
        
        if (generoSeleccionado !== 'todos') {
            titulo = `${formatearGenero(generoSeleccionado)} por Mes - ${mesInicial} ${añoInicial} a ${mesFinal} ${añoFinal}`;
        } else {
            titulo = `Visitantes por Mes y Género - ${mesInicial} ${añoInicial} a ${mesFinal} ${añoFinal}`;
        }
        
        // Actualizar gráfica en el modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-calendar-week"></i> ${titulo}`;
            }
            
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaModal(tipoGraficaActual, titulo);
        }
        
        mostrarExito(`Se encontraron ${datosProcesados.totalGeneral} visitantes en ${datosProcesados.labels.length} meses`);

    } catch (error) {
        console.error('❌ Error aplicando filtro de mes:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos: ' + error.message);
    }
}

// Función SIMPLIFICADA para aplicar filtro por año
async function aplicarFiltroRangoAnios() {
    const fechaInicial = document.getElementById('filtroFechaInicialAnio').value;
    const fechaFinal = document.getElementById('filtroFechaFinalAnio').value;
    const generoSeleccionado = document.getElementById('filtroGeneroAnio').value;
    
    console.log('🎯 Aplicando filtro por AÑO:', { fechaInicial, fechaFinal, generoSeleccionado });
    
    // Validaciones básicas
    if (!fechaInicial || !fechaFinal) {
        mostrarMensajeSinDatos('Por favor selecciona ambas fechas');
        return;
    }
    
    if (fechaInicial > fechaFinal) {
        mostrarMensajeSinDatos('La fecha inicial no puede ser mayor que la fecha final');
        return;
    }

    try {
        mostrarLoading('Cargando datos por año...');
        
        // Usar la función genérica para procesar años
        const datosProcesados = await procesarDatosPorPeriodo('anio', fechaInicial, fechaFinal, generoSeleccionado);
        
        cerrarLoading();
        
        // Verificar si hay datos
        if (datosProcesados.totalGeneral === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el rango de años seleccionado');
            return;
        }
        
        // Actualizar datos
        datosSimulados.anio = datosProcesados;
        tipoActual = 'anio'; // IMPORTANTE: Actualizar el tipo actual
        
        // Crear título
        let titulo;
        const añoInicial = obtenerAnioDesdeFecha(fechaInicial);
        const añoFinal = obtenerAnioDesdeFecha(fechaFinal);
        
        if (generoSeleccionado !== 'todos') {
            titulo = `${formatearGenero(generoSeleccionado)} por Año - ${añoInicial} a ${añoFinal}`;
        } else {
            titulo = `Visitantes por Año y Género - ${añoInicial} a ${añoFinal}`;
        }
        
        // Actualizar gráfica en el modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-calendar-alt"></i> ${titulo}`;
            }
            
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaModal(tipoGraficaActual, titulo);
        }
        
        mostrarExito(`Se encontraron ${datosProcesados.totalGeneral} visitantes en ${datosProcesados.labels.length} años`);

    } catch (error) {
        console.error('❌ Error aplicando filtro de año:', error);
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

// Función SIMPLIFICADA para aplicar filtro por género y fecha
async function aplicarFiltroPorGeneroYFecha() {
    const fechaInicial = document.getElementById('filtroFechaInicial').value;
    const fechaFinal = document.getElementById('filtroFechaFinal').value;
    const generoSeleccionado = document.getElementById('filtroGeneroFecha').value;
    
    console.log('🎯 Aplicando filtro por FECHA:', { fechaInicial, fechaFinal, generoSeleccionado});
    
    // Validaciones básicas
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
        
        // Usar la función genérica para procesar fechas
        const datosProcesados = await procesarDatosPorPeriodo('fecha', fechaInicial, fechaFinal, generoSeleccionado);
        
        cerrarLoading();
        
        // Verificar si hay datos
        if (datosProcesados.totalGeneral === 0) {
            mostrarMensajeSinDatos('No hay datos disponibles para el rango de fechas seleccionado');
            return;
        }
        
        // Actualizar datos
        datosSimulados.fecha = datosProcesados;
        tipoActual = 'fecha'; // IMPORTANTE: Actualizar el tipo actual
        
        // Crear título
        let titulo;
        if (generoSeleccionado !== 'todos') {
            titulo = `${formatearGenero(generoSeleccionado)} por Fecha - ${formatearFecha(fechaInicial)} a ${formatearFecha(fechaFinal)}`;
        } else {
            titulo = `Visitantes por Fecha y Género - ${formatearFecha(fechaInicial)} a ${formatearFecha(fechaFinal)}`;
        }
        
        // Actualizar gráfica en el modal
        const modal = document.getElementById("chartModal");
        if (modal && modal.classList.contains('show')) {
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) {
                modalTitle.innerHTML = `<i class="fas fa-calendar"></i> ${titulo}`;
            }
            
            const tipoGraficaActual = document.querySelector('.modal-chart-container').getAttribute('data-tipo-grafica');
            actualizarGraficaModal(tipoGraficaActual, titulo);
        }
        
        mostrarExito(`Se encontraron ${datosProcesados.totalGeneral} visitantes en ${datosProcesados.labels.length} fechas`);

    } catch (error) {
        console.error('❌ Error aplicando filtro de fecha:', error);
        cerrarLoading();
        mostrarMensajeSinDatos('Error al cargar los datos: ' + error.message);
    }
}

// ====================================================================
// FIN DE FUNCIONES NUEVAS
// ====================================================================


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
