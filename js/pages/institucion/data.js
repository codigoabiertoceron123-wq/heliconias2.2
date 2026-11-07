// InstitucionSystem - data
// Refactor modular: lógica original preservada.

// =============================================
    // FUNCIONES PRINCIPALES
    // =============================================

    // Función para cargar datos completos
    async function cargarDatosCompletos() {
        try {
            mostrarLoading('Cargando datos completos...');
            
            // Primero asegurar que las instituciones estén cargadas
            if (!Array.isArray(todasLasInstituciones) || todasLasInstituciones.length === 0) {
                await cargarInstitucionesBase();
            }
            
            // Cargar datos de instituciones
            await cargarDatosInstitucion();
            
            // Cargar datos de tiempo si es necesario
            if (tipoActual !== 'institucion') {
                await cargarDatosTiempo(tipoActual);
            }
            
            cerrarLoading();
            
        } catch (error) {
            console.error('Error cargando datos completos:', error);
            cerrarLoading();
            mostrarError('Error al cargar los datos: ' + error.message);
        }
    }

// Función para cargar datos de instituciones - VERSIÓN CORREGIDA
        async function cargarDatosInstitucion() {
            try {
                console.log('=== CARGANDO DATOS DE INSTITUCIÓN ===');
                
                // 1. Cargar instituciones primero
                if (!Array.isArray(todasLasInstituciones) || todasLasInstituciones.length === 0) {
                    await cargarInstitucionesBase();
                }
                
                // 2. Obtener todos los participantes
                const { data: participantes, error: errorParticipantes } = await supabase
                    .from('participantes_reserva')
                    .select('id_institucion, fecha_visita')
                    .not('id_institucion', 'is', null);

                if (errorParticipantes) throw errorParticipantes;

                if (!participantes || participantes.length === 0) {
                    mostrarSinDatos();
                    return;
                }

                // 3. Contar participantes por institución
                const conteoInstituciones = {};
                const institucionesEncontradas = new Set();
                
                participantes.forEach(participante => {
                    const institucion = todasLasInstituciones.find(i => i.id_institucion === participante.id_institucion);
                    if (institucion && institucion.nombre_institucion) {
                        const nombreInstitucion = institucion.nombre_institucion.trim();
                        conteoInstituciones[nombreInstitucion] = (conteoInstituciones[nombreInstitucion] || 0) + 1;
                        institucionesEncontradas.add(nombreInstitucion);
                    }
                });

                console.log(`📊 Encontradas ${Object.keys(conteoInstituciones).length} instituciones con visitantes`);

                // 4. Agrupar instituciones
                const resultado = agruparInstituciones(conteoInstituciones);
                
                // 5. Procesar datos para la interfaz
                procesarDatosInstitucion(
                    resultado.institucionesPrincipales,
                    resultado.otrasInstituciones,
                    resultado.todasLasInstituciones,
                    resultado.institucionesArray
                );

                console.log('✅ Datos de institución cargados exitosamente');

            } catch (error) {
                console.error('Error en cargarDatosInstitucion:', error);
                throw error;
            }
        }

//depronto quitar
    // Función para inicializar el sistema de manera segura
    async function inicializarSistemaSeguro() {
        try {
            // Primero cargar las instituciones
            await cargarInstitucionesBase();
            // Luego cargar los datos completos
            await cargarDatosCompletos();
        } catch (error) {
            console.error('Error inicializando sistema:', error);
            mostrarError('Error al inicializar el sistema: ' + error.message);
        }
    }

// Función para cargar solo las instituciones
    async function cargarInstitucionesBase() {
        try {
            const { data: instituciones, error } = await supabase
                .from('instituciones')
                .select('id_institucion, nombre_institucion')
                .order('nombre_institucion');

            if (error) throw error;
            
            // Asegurar que es un array
            todasLasInstituciones = Array.isArray(instituciones) ? instituciones : [];
            
            console.log(`✅ Cargadas ${todasLasInstituciones.length} instituciones`);
            
        } catch (error) {
            console.error('Error cargando instituciones base:', error);
            todasLasInstituciones = []; // Asegurar que sea array vacío
            throw error;
        }
    }

// Agrupar instituciones - OPCIÓN 4 RECOMENDADA
    function agruparInstituciones(conteoInstituciones) {
        console.log('🔄 Procesando', Object.keys(conteoInstituciones).length, 'instituciones...');
        
        // Convertir a array y ordenar por cantidad descendente
        let institucionesArray = Object.entries(conteoInstituciones)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad);
        
        // Para el gráfico principal, mostrar máximo 25 instituciones
        const maxParaGrafico = 25;
        
        // Separar las que van al gráfico y las que no
        const institucionesParaGrafico = {};
        const institucionesRestantes = {};
        
        institucionesArray.forEach((inst, index) => {
            if (index < maxParaGrafico) {
                institucionesParaGrafico[inst.nombre] = inst.cantidad;
            } else {
                institucionesRestantes[inst.nombre] = inst.cantidad;
            }
        });
        
        // Sumar las instituciones restantes para "Otras"
        const otrasCount = Object.values(institucionesRestantes).reduce((a, b) => a + b, 0);
        
        // Solo agregar "Otras" si hay instituciones restantes
        if (otrasCount > 0 && Object.keys(institucionesRestantes).length > 0) {
            institucionesParaGrafico['Otras Instituciones'] = otrasCount;
        }
        
        // Para los filtros, necesitamos TODAS las instituciones
        const todasLasInstituciones = {};
        institucionesArray.forEach(inst => {
            todasLasInstituciones[inst.nombre] = inst.cantidad;
        });
        
        console.log('✅ Gráfico:', Object.keys(institucionesParaGrafico).length, 'instituciones');
        console.log('✅ Filtros:', Object.keys(todasLasInstituciones).length, 'instituciones disponibles');
        
        return {
            institucionesPrincipales: institucionesParaGrafico,
            otrasInstituciones: institucionesRestantes,
            todasLasInstituciones: todasLasInstituciones,
            institucionesArray: institucionesArray
        };
    }

// Procesar datos para la interfaz - VERSIÓN CON 4 PARÁMETROS
    function procesarDatosInstitucion(institucionesPrincipales, otrasInstituciones, todasLasInstituciones, institucionesArray) {
    // Convertir a arrays para el gráfico
        const labels = Object.keys(institucionesPrincipales);
        const values = Object.values(institucionesPrincipales);
        const totalVisitantes = values.reduce((a, b) => a + b, 0);

        // Calcular estadísticas REALES
        const totalInstitucionesUnicas = Object.keys(todasLasInstituciones).length;
        
        // Actualizar estadísticas en la UI
        actualizarEstadisticas(totalVisitantes, totalInstitucionesUnicas);

        // Generar colores únicos y guardarlos
        const colors = generarColoresInstitucion(labels.length);
        
        // Guardar datos COMPLETOS con colores
        datosInstituciones = {
            labels: labels,
            values: values,
            colors: colors, // ¡IMPORTANTE! Guardar los colores
            total: totalVisitantes,
            datosCompletos: todasLasInstituciones,
            todasLasInstitucionesArray: institucionesArray,
            totalInstitucionesUnicas: totalInstitucionesUnicas,
            institucionesEnGrafico: labels.length,
            institucionesFueraDeGrafico: Object.keys(otrasInstituciones).length
        };

        // Guardar copia original CON COLORES
        datosOriginales = {
            labels: [...labels],
            values: [...values],
            colors: [...colors], // Guardar también en originales
            total: totalVisitantes,
            datosCompletos: {...todasLasInstituciones}
        };

        institucionesFiltradas = [...labels];

        // Actualizar filtros
        actualizarFiltrosInstituciones();

        // Mostrar interfaz si estamos en modo institución
        if (tipoActual === 'institucion') {
            mostrarInterfazInstitucion();
        }
        
        console.log(`✅ Procesadas ${totalInstitucionesUnicas} instituciones únicas`);
    }

// Función para cargar datos por tiempo (fecha, mes, año)
    async function cargarDatosTiempo(tipo) {
        try {
            mostrarLoading(`Cargando datos por ${tipo}...`);

            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('fecha_visita, id_institucion')
                .not('fecha_visita', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                procesarDatosTiempo(participantes, tipo);
                mostrarInterfazTiempo(tipo);
            } else {
                mostrarSinDatosTiempo(tipo);
            }

            cerrarLoading();
            
        } catch (error) {
            console.error(`Error cargando datos de ${tipo}:`, error);
            cerrarLoading();
            mostrarError(`Error al cargar datos de ${tipo}: ` + error.message);
        }
    }

// Procesar datos por tiempo
    // Reemplaza la función procesarDatosTiempo actual por esta nueva versión
    function procesarDatosTiempo(participantes, tipo) {
        // Verificar si todasLasInstituciones es un array
        if (!Array.isArray(todasLasInstituciones)) {
            console.error('todasLasInstituciones no es un array:', todasLasInstituciones);
            return { labels: [], datasets: [], instituciones: [], fechas: [] };
        }
        
        const datosPorInstitucion = {};
        const institucionesSet = new Set();
        const fechasSet = new Set();
        
        // Primero, procesar todos los participantes para obtener instituciones y fechas
        participantes.forEach(participante => {
            if (participante.fecha_visita && participante.id_institucion) {
                const fecha = new Date(participante.fecha_visita);
                let claveFecha = '';
                
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
                
                // Encontrar el nombre de la institución
                let nombreInstitucion = 'Sin institución';
                if (Array.isArray(todasLasInstituciones)) {
                    const institucionEncontrada = todasLasInstituciones.find(
                        i => i.id_institucion === participante.id_institucion
                    );
                    if (institucionEncontrada && institucionEncontrada.nombre_institucion) {
                        nombreInstitucion = institucionEncontrada.nombre_institucion;
                    }
                }
                
                fechasSet.add(claveFecha);
                institucionesSet.add(nombreInstitucion);
                
                // Inicializar estructura si no existe
                if (!datosPorInstitucion[nombreInstitucion]) {
                    datosPorInstitucion[nombreInstitucion] = {};
                }
                
                // Contar por fecha
                datosPorInstitucion[nombreInstitucion][claveFecha] = 
                    (datosPorInstitucion[nombreInstitucion][claveFecha] || 0) + 1;
            }
        });
        
        // Ordenar fechas
        const fechasOrdenadas = Array.from(fechasSet).sort();
        const institucionesLista = Array.from(institucionesSet);
        
        // Preparar datasets para Chart.js
        const datasets = institucionesLista.map((institucion, index) => {
        const datosInstitucion = datosPorInstitucion[institucion] || {};
        const data = fechasOrdenadas.map(fecha => {
            const valor = datosInstitucion[fecha];
            // Asegurar que siempre devuelva un número
            return (typeof valor === 'number' && !isNaN(valor)) ? valor : 0;
        });
        
        return {
            label: institucion,
            data: data,
            backgroundColor: coloresInstituciones[index % coloresInstituciones.length],
            borderColor: darkenColor(coloresInstituciones[index % coloresInstituciones.length], 0.2),
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20
        };
    });
        
        // Guardar datos
        const datosTiempo = {
            labels: fechasOrdenadas,
            datasets: datasets,
            instituciones: institucionesLista,
            fechas: fechasOrdenadas
        };
        
        switch(tipo) {
            case 'fecha': datosFecha = datosTiempo; break;
            case 'mes': datosMes = datosTiempo; break;
            case 'anio': datosAnio = datosTiempo; break;
        }
        
        return datosTiempo;
    }

// =============================================
    // FUNCIONES AUXILIARES
    // =============================================
    // Actualizar estadísticas - VERSIÓN MEJORADA
    function actualizarEstadisticas(total, institucionesUnicas) {
        if (document.getElementById('total-visitantes')) {
            document.getElementById('total-visitantes').textContent = total.toLocaleString();
        }
        if (document.getElementById('visitantes-con-institucion')) {
            document.getElementById('visitantes-con-institucion').textContent = total.toLocaleString();
        }
        if (document.getElementById('total-instituciones')) {
            document.getElementById('total-instituciones').textContent = institucionesUnicas.toLocaleString();
        }
    }

// Funciones auxiliares para tiempo
    function getDatosTiempo(tipo) {
        let datos;
        switch(tipo) {
            case 'fecha': datos = datosFecha; break;
            case 'mes': datos = datosMes; break;
            case 'anio': datos = datosAnio; break;
            default: datos = { labels: [], datasets: [], instituciones: [], fechas: [] };
        }
        
        // Si los datos no tienen estructura de barras agrupadas, convertirlos
        if (datos && (!datos.datasets || datos.datasets.length === 0)) {
            // Convertir datos antiguos a nuevo formato
            datos = convertirDatosAntiguos(tipo, datos);
        }
        
        return datos;
    }

// Función auxiliar para convertir datos antiguos al nuevo formato
    function convertirDatosAntiguos(tipo, datosAntiguos) {
        if (!datosAntiguos.labels || datosAntiguos.labels.length === 0) {
            return { labels: [], datasets: [], instituciones: [], fechas: [] };
        }
        
        // Crear un dataset único con los datos antiguos
        const dataset = {
            label: 'Total Visitantes',
            data: datosAntiguos.values || [],
            backgroundColor: '#3498db'
        };
        
        return {
            labels: datosAntiguos.labels || [],
            datasets: [dataset],
            instituciones: ['Total Visitantes'],
            fechas: datosAntiguos.labels || []
        };
    }

//BORRARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
    function verificarDatosInstitucion() {
        console.log('=== VERIFICACIÓN DE DATOS ===');
        console.log('Total instituciones en base:', todasLasInstituciones.length);
        console.log('Primeras 3:', todasLasInstituciones.slice(0, 3));
        
        console.log('DatosInstituciones:');
        console.log('- Labels:', datosInstituciones.labels?.length || 0);
        console.log('- Colors:', datosInstituciones.colors?.length || 0);
        
        console.log('DatosOriginales:');
        console.log('- Labels:', datosOriginales.labels?.length || 0);
        console.log('- Colors:', datosOriginales.colors?.length || 0);
        
        // Mostrar ejemplo de color para una institución específica
        if (datosInstituciones.labels && datosInstituciones.labels.length > 0) {
            const ejemploInst = datosInstituciones.labels[0];
            const color = obtenerColorInstitucion(ejemploInst);
            console.log(`Ejemplo: "${ejemploInst}" tiene color: ${color}`);
        }
    }

// Nueva función para procesar datos de institución filtrados
    function procesarDatosInstitucionFiltrados(participantes) {
        const conteoInstituciones = {};
        
        participantes.forEach(participante => {
            const institucion = todasLasInstituciones.find(i => i.id_institucion === participante.id_institucion);
            if (institucion && institucion.nombre_institucion) {
                const nombreInstitucion = institucion.nombre_institucion;
                conteoInstituciones[nombreInstitucion] = (conteoInstituciones[nombreInstitucion] || 0) + 1;
            }
        });

        const { institucionesPrincipales, otrasInstituciones } = agruparInstituciones(conteoInstituciones);
        procesarDatosInstitucion(institucionesPrincipales, otrasInstituciones);
    }

// Nueva función para procesar datos de tiempo filtrados
    function procesarDatosTiempoFiltrados(participantes, tipo) {
        // Usar la función procesarDatosTiempo existente
        const datosTiempo = procesarDatosTiempo(participantes, tipo);
        
        // Guardar datos según el tipo
        switch(tipo) {
            case 'fecha': datosFecha = datosTiempo; break;
            case 'mes': datosMes = datosTiempo; break;
            case 'anio': datosAnio = datosTiempo; break;
        }
        
        // Mostrar interfaz
        mostrarInterfazTiempo(tipo);
    }

// Procesar datos filtrados
    function procesarDatosFiltrados(participantes, tipo) {
        if (tipo === 'institucion') {
            const conteoInstituciones = {};
            
            participantes.forEach(participante => {
                const institucion = todasLasInstituciones.find(i => i.id_institucion === participante.id_institucion);
                if (institucion && institucion.nombre_institucion) {
                    const nombreInstitucion = institucion.nombre_institucion;
                    conteoInstituciones[nombreInstitucion] = (conteoInstituciones[nombreInstitucion] || 0) + 1;
                }
            });

            const { institucionesPrincipales, otrasInstituciones } = agruparInstituciones(conteoInstituciones);
            procesarDatosInstitucion(institucionesPrincipales, otrasInstituciones);
            
        } else {
            procesarDatosTiempo(participantes, tipo);
            mostrarInterfazTiempo(tipo);
        }
    }

// Función auxiliar para aplicar ordenamiento
    function aplicarOrdenamientoInstituciones(datos, orden) {
        if (orden === 'desc') {
            // Orden descendente (mayor a menor)
            const indices = datos.labels
                .map((label, i) => ({ label, value: datos.values[i] }))
                .sort((a, b) => b.value - a.value)
                .map(item => datos.labels.indexOf(item.label));
            
            datos.labels = indices.map(i => datos.labels[i]);
            datos.values = indices.map(i => datos.values[i]);
        } else if (orden === 'asc') {
            // Orden ascendente (menor a mayor)
            const indices = datos.labels
                .map((label, i) => ({ label, value: datos.values[i] }))
                .sort((a, b) => a.value - b.value)
                .map(item => datos.labels.indexOf(item.label));
            
            datos.labels = indices.map(i => datos.labels[i]);
            datos.values = indices.map(i => datos.values[i]);
        } else if (orden === 'alpha') {
            // Orden alfabético
            const indices = datos.labels
                .map((label, i) => ({ label, value: datos.values[i] }))
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(item => datos.labels.indexOf(item.label));
            
            datos.labels = indices.map(i => datos.labels[i]);
            datos.values = indices.map(i => datos.values[i]);
        }
        
        return datos;
    }

// Función auxiliar para aplicar límite de cantidad
    function aplicarLimiteCantidadInstituciones(datos, cantidad) {
        if (cantidad > 0 && cantidad < datos.labels.length) {
            datos.labels = datos.labels.slice(0, cantidad);
            datos.values = datos.values.slice(0, cantidad);
            datos.total = datos.values.reduce((a, b) => a + b, 0);
        }
        
        return datos;
    }

// Función para validar datos antes de usarlos
    function validarDatosFiltrados(datos) {
        return datos && 
            (datos.labels || datos.values || datos.datasets) &&
            ((datos.labels && datos.labels.length > 0) || 
                (datos.values && datos.values.length > 0) || 
                (datos.datasets && datos.datasets.length > 0));
    }

// Función para inicializar la API completa
    function inicializarAPICompleta() {
        // Métodos de modal con filtros
        window.InstitucionManager.abrirModal = (tipo) => abrirModalInstitucion(tipo);
        window.InstitucionManager.abrirModalTiempo = (tipo, tipoGrafica) => abrirModalTiempo(tipo, tipoGrafica);
        window.InstitucionManager.cerrarModal = () => cerrarModalInstitucion();
        window.InstitucionManager.aplicarFiltrosModal = () => aplicarFiltrosModal();
        window.InstitucionManager.limpiarFiltrosModal = () => limpiarFiltrosModal();
        
        // Métodos de descarga
        window.InstitucionManager.descargarPNG = () => {
            const canvas = document.getElementById("chartAmpliadoInstitucion");
            if (canvas) {
                const link = document.createElement("a");
                link.download = "grafica_ampliada.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        };
        
        window.InstitucionManager.descargarExcelModal = () => {
            const titulo = document.getElementById('modalTitleInstitucion')?.textContent || 'Reporte';
            const tbody = document.getElementById("tbodyDatosInstitucion");
            if (!tbody) return;
            
            const filas = tbody.querySelectorAll('tr');
            const datosExcel = [];
            
            // Obtener encabezados de la tabla
            const thead = document.querySelector('#tablaDatosInstitucion thead');
            const encabezados = [];
            if (thead) {
                const ths = thead.querySelectorAll('th');
                ths.forEach(th => encabezados.push(th.textContent.trim()));
                datosExcel.push(encabezados);
            } else {
                // Encabezados por defecto
                datosExcel.push(['Institución/Período', 'Descripción', 'Total Visitantes', 'Porcentaje', 'Tendencia']);
            }
            
            // Obtener datos de las filas
            filas.forEach(fila => {
                const celdas = fila.querySelectorAll('td');
                if (celdas.length > 0) {
                    const filaDatos = [];
                    celdas.forEach(celda => filaDatos.push(celda.textContent.trim()));
                    datosExcel.push(filaDatos);
                }
            });
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(datosExcel);
            XLSX.utils.book_append_sheet(wb, ws, "Datos Filtrados");
            XLSX.writeFile(wb, "reporte_filtrado.xlsx");
        };

        // Métodos principales
        window.InstitucionManager.inicializar = () => cargarDatosCompletos();
        window.InstitucionManager.cambiarTipoReporte = (tipo) => cambiarTipoReporte(tipo);
        
        // Métodos de filtrado principal
        window.InstitucionManager.aplicarFiltrosCombinados = () => aplicarFiltrosCombinados();
        window.InstitucionManager.limpiarFiltrosCombinados = () => limpiarFiltrosCombinados();
        window.InstitucionManager.exportarDatosFiltrados = () => exportarDatosFiltrados();
        
        // Métodos para tiempo
        window.InstitucionManager.descargarGraficoPrincipalTiempo = (tipo) => descargarGraficoPrincipalTiempo(tipo);
        window.InstitucionManager.descargarExcelTiempo = (tipo) => descargarExcelTiempo(tipo);

        // Métodos generales
        window.InstitucionManager.descargarGraficoPrincipal = () => descargarGraficoPrincipal();
        window.InstitucionManager.descargarExcel = () => descargarExcel();

        // En la API pública, agrega:
        window.InstitucionManager.recargarInstituciones = () => cargarInstitucionesBase();

        window.InstitucionManager.depurarInstitucion = (nombre) => depurarInstitucionEspecifica(nombre);
    
        window.InstitucionManager.verificarDatos = () => verificarDatosInstitucion();


        // Agrega esto a la API pública para depuración:
         window.InstitucionManager.depurarFiltros = function() {
            console.log('=== DEPURACIÓN DE FILTROS ===');
            console.log('Total instituciones en base de datos:', todasLasInstituciones.length);
            console.log('Primeras 5 instituciones:', todasLasInstituciones.slice(0, 5).map(i => i.nombre_institucion));
            
            console.log('DatosInstituciones.datosCompletos:');
            if (datosInstituciones.datosCompletos) {
                console.log('Número de instituciones:', Object.keys(datosInstituciones.datosCompletos).length);
                console.log('Primeras 5:', Object.keys(datosInstituciones.datosCompletos).slice(0, 5));
            } else {
                console.log('datosCompletos NO está definido!');
            }
            
            console.log('Select de filtros:');
            const select = document.getElementById('filtro-institucion-comb');
            if (select) {
                console.log('Opciones en select:', select.options.length);
                console.log('Primeras 5 opciones:', Array.from(select.options).slice(0, 5).map(o => o.value));
            }
            
            // Mostrar en alert para fácil visualización
            const institucionesSelect = Array.from(document.getElementById('filtro-institucion-comb')?.options || [])
                .map(o => o.value)
                .slice(0, 20)
                .join('\n');
            
            alert(`Instituciones en filtro (primeras 20):\n${institucionesSelect}\n\nTotal: ${document.getElementById('filtro-institucion-comb')?.options.length || 0}`);
        };
    }

async function depurarInstitucionEspecifica(nombreInstitucion) {
        try {
            console.log(`🔍 Depurando institución: ${nombreInstitucion}`);
            
            // Buscar en la base de datos
            const institucionObj = todasLasInstituciones.find(inst => 
                inst.nombre_institucion && 
                inst.nombre_institucion.trim().toLowerCase() === nombreInstitucion.toLowerCase().trim()
            );
            
            console.log('Encontrada en base de datos:', institucionObj);
            
            // Buscar en participantes
            if (institucionObj) {
                const { data: participantes, error } = await supabase
                    .from('participantes_reserva')
                    .select('id, fecha_visita')
                    .eq('id_institucion', institucionObj.id_institucion);
                
                console.log('Participantes encontrados:', participantes?.length || 0);
                console.log('Primeros 3 participantes:', participantes?.slice(0, 3));
            }
            
            // Buscar en datosInstituciones
            const enLabelsIndex = datosInstituciones.labels?.indexOf(nombreInstitucion);
            console.log('En datosInstituciones.labels:', enLabelsIndex !== -1 ? `índice ${enLabelsIndex}` : 'NO encontrada');
            
            // Buscar en datosOriginales
            const enOriginalesIndex = datosOriginales.labels?.indexOf(nombreInstitucion);
            console.log('En datosOriginales.labels:', enOriginalesIndex !== -1 ? `índice ${enOriginalesIndex}` : 'NO encontrada');
            
        } catch (error) {
            console.error('Error en depuración:', error);
        }
    }
