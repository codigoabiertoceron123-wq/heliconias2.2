// NacionalidadSystem - data
// Refactor modular: lógica original preservada.

// =============================================
    // FUNCIONES PRINCIPALES - NACIONALIDAD
    // =============================================

    // Función para cargar datos completos
    async function cargarDatosCompletos() {
        try {
            mostrarLoading('Cargando datos completos...');
            
            // Cargar datos de nacionalidad
            await cargarDatosNacionalidad();
            
            // Cargar datos de tiempo si es necesario
            if (tipoActual !== 'nacionalidad') {
                await cargarDatosTiempo(tipoActual);
            }
            
            cerrarLoading();
            
        } catch (error) {
            console.error('Error cargando datos completos:', error);
            cerrarLoading();
            mostrarError('Error al cargar los datos: ' + error.message);
        }
    }

// Función para cargar datos de nacionalidad - COLOMBIA vs OTROS PAÍSES
    async function cargarDatosNacionalidad() {
        try {
            console.log('=== CARGANDO DATOS DE NACIONALIDAD - COLOMBIA vs OTROS ===');
            
            // 1. Obtener todos los participantes con id_ciudad
            const { data: participantes, error: errorParticipantes } = await supabase
                .from('participantes_reserva')
                .select('id_ciudad, fecha_visita')
                .not('id_ciudad', 'is', null);

            if (errorParticipantes) {
                console.error('Error al obtener participantes:', errorParticipantes);
                mostrarErrorNacionalidad();
                return;
            }

            console.log('Participantes con ciudades:', participantes);

            if (!participantes || participantes.length === 0) {
                mostrarSinDatosNacionalidad();
                return;
            }

            // 2. Obtener todos los IDs de ciudades únicos
            const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
            console.log('IDs de ciudades únicos:', idsCiudadesUnicos);

            // 3. Obtener información de ciudades con sus países
            const { data: ciudades, error: errorCiudades } = await supabase
                .from('ciudades')
                .select(`
                    id, 
                    pais_id,
                    pais (
                        id,
                        pais
                    )
                `)
                .in('id', idsCiudadesUnicos);

            if (errorCiudades) {
                console.error('Error al obtener ciudades:', errorCiudades);
                mostrarErrorNacionalidad();
                return;
            }

            console.log('Ciudades obtenidas con países:', ciudades);

            // 4. Contar participantes por país
            const conteoPaises = {};
            let sinPaisCount = 0;

            participantes.forEach(participante => {
                const ciudad = ciudades.find(c => c.id === participante.id_ciudad);
                
                if (ciudad && ciudad.pais && ciudad.pais.pais) {
                    const nombrePais = ciudad.pais.pais;
                    conteoPaises[nombrePais] = (conteoPaises[nombrePais] || 0) + 1;
                } else {
                    // Si no encontramos el país
                    sinPaisCount++;
                }
            });

            console.log('Conteo completo por país:', conteoPaises);
            console.log('Sin país:', sinPaisCount);

            // 5. Separar Colombia de otros países
            const conteoFinal = { ...conteoPaises };
            if (sinPaisCount > 0) {
                conteoFinal['Sin país'] = sinPaisCount;
            }

            // Ordenar por cantidad (mayor a menor)
            const paisesOrdenados = Object.entries(conteoFinal)
                .sort((a, b) => b[1] - a[1])
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});

            console.log('Paises ordenados:', paisesOrdenados);

            console.log('Conteo final:', conteoFinal);
            
            // Guardar todos los países para filtros
            todosLosPaises = Object.keys(conteoPaises).map(pais => ({ nombre_pais: pais }));
            
            // Procesar datos para la interfaz
            procesarDatosNacionalidad(conteoFinal, {});

        } catch (error) {
            console.error('Error en cargarDatosNacionalidad:', error);
            mostrarErrorNacionalidad();
            throw error;
        }
    }

// Procesar datos para la interfaz
    function procesarDatosNacionalidad(conteoFinal, detallesOtrosPaises= {}) {
        const labels = Object.keys(conteoFinal);
        const values = Object.values(conteoFinal);
        const totalVisitantes = values.reduce((a, b) => a + b, 0);

        // Actualizar estadísticas
        actualizarEstadisticas(totalVisitantes, labels.length);

        // Guardar datos
        datosNacionalidades = {
            labels: labels,
            values: values,
            total: totalVisitantes,
            datosCompletos: { ...conteoFinal },
            detallesOtrosPaises: detallesOtrosPaises
        };

        datosOriginales = JSON.parse(JSON.stringify(datosNacionalidades));
        nacionalidadesFiltradas = [...labels];

        // Actualizar filtros
        actualizarFiltrosNacionalidades();

        if (tipoActual === 'nacionalidad') {
            mostrarInterfazNacionalidad();
        }
    }

// Función para cargar datos por tiempo (fecha, mes, año)
    async function cargarDatosTiempo(tipo) {
        try {
            mostrarLoading(`Cargando datos por ${tipo}...`);

            const { data: participantes, error } = await supabase
                .from('participantes_reserva')
                .select('fecha_visita, id_ciudad')
                .not('fecha_visita', 'is', null);

            if (error) throw error;

            if (participantes && participantes.length > 0) {
                // Obtener países para filtrar
                const paisesParticipantes = await obtenerPaisesDeParticipantes(participantes);
                procesarDatosTiempo(participantes, tipo, paisesParticipantes);
                mostrarInterfazTiempo(tipo); // ← Esto debe estar aquí
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

// Obtener países de participantes
    async function obtenerPaisesDeParticipantes(participantes) {
        // Filtrar participantes que tengan id_ciudad válido (no null)
        const participantesConCiudad = participantes.filter(p => p.id_ciudad);
        const idsCiudadesUnicos = [...new Set(participantesConCiudad.map(p => p.id_ciudad))];
        
        if (idsCiudadesUnicos.length === 0) {
            return {};
        }
        
        const { data: ciudades, error } = await supabase
            .from('ciudades')
            .select(`
                id, 
                pais_id,
                pais (
                    id,
                    pais
                )
            `)
            .in('id', idsCiudadesUnicos);

        if (error) throw error;

        const mapaCiudadPais = {};
        ciudades.forEach(ciudad => {
            if (ciudad.pais && ciudad.pais.pais) {
                mapaCiudadPais[ciudad.id] = ciudad.pais.pais;
            }
        });

        return mapaCiudadPais;
    }

// Procesar datos por tiempo
    function procesarDatosTiempo(participantes, tipo, mapaCiudadPais) {
        console.log(`🔄 Procesando datos de tiempo: ${tipo}`);
        
        const datosPorPais = {};
        const paisesSet = new Set();
        const fechasSet = new Set();
        
        // Filtrar participantes con fecha válida
        const participantesFiltrados = participantes.filter(p => p.fecha_visita && p.id_ciudad);
        
        // Procesar cada participante
        participantesFiltrados.forEach(participante => {
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
            
            // Obtener nombre del país
            let nombrePais = mapaCiudadPais[participante.id_ciudad] || 'Sin país';
            
            // Normalizar nombre (Colombia siempre igual)
            if (nombrePais.toLowerCase().includes('colombia')) {
                nombrePais = 'Colombia';
            }
            
            fechasSet.add(claveFecha);
            paisesSet.add(nombrePais);
            
            // Inicializar estructura si no existe
            if (!datosPorPais[nombrePais]) {
                datosPorPais[nombrePais] = {};
            }
            
            // Contar por fecha
            datosPorPais[nombrePais][claveFecha] = 
                (datosPorPais[nombrePais][claveFecha] || 0) + 1;
        });
        
        // Ordenar fechas
        const fechasOrdenadas = Array.from(fechasSet).sort();
        const paisesLista = Array.from(paisesSet).sort();
        
        // Preparar datasets para Chart.js (BARRAS AGRUPADAS)
        const datasets = paisesLista.map((pais, index) => {
            const datosPais = datosPorPais[pais] || {};
            const data = fechasOrdenadas.map(fecha => datosPais[fecha] || 0);
            
            return {
                label: pais,
                data: data,
                backgroundColor: coloresNacionalidades[index % coloresNacionalidades.length],
                borderColor: darkenColor(coloresNacionalidades[index % coloresNacionalidades.length], 0.2),
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 20
            };
        });
        
        // Guardar datos en el formato CORRECTO para gráficas agrupadas
        const datosTiempo = {
            labels: fechasOrdenadas,
            datasets: datasets,
            paises: paisesLista,
            fechas: fechasOrdenadas,
            total: datasets.reduce((total, dataset) => 
                total + dataset.data.reduce((sum, val) => sum + val, 0), 0)
        };
        
        console.log(`✅ Datos de ${tipo} procesados:`, datosTiempo);
        
        switch(tipo) {
            case 'fecha': datosFecha = datosTiempo; break;
            case 'mes': datosMes = datosTiempo; break;
            case 'anio': datosAnio = datosTiempo; break;
        }
        
        return datosTiempo;
    }

async function procesarDatosFiltradosTiempo(participantes, tipo, mapaCiudadPais) {
        console.log(`🔄 Procesando datos Filtrados de: ${tipo}`);
        
        const datosPorPais = {};
        const paisesSet = new Set();
        const fechasSet = new Set();
        
        // Filtrar participantes con fecha válida
        const participantesFiltrados = participantes.filter(p => p.fecha_visita && p.id_ciudad);
        
        // Procesar cada participante
        participantesFiltrados.forEach(participante => {
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
            
            // Obtener nombre del país
            let nombrePais = mapaCiudadPais[participante.id_ciudad] || 'Sin país';
            
            // Normalizar nombre (Colombia siempre igual)
            if (nombrePais.toLowerCase().includes('colombia')) {
                nombrePais = 'Colombia';
            }
            
            fechasSet.add(claveFecha);
            paisesSet.add(nombrePais);
            
            // Inicializar estructura si no existe
            if (!datosPorPais[nombrePais]) {
                datosPorPais[nombrePais] = {};
            }
            
            // Contar por fecha
            datosPorPais[nombrePais][claveFecha] = 
                (datosPorPais[nombrePais][claveFecha] || 0) + 1;
        });
        
        // Ordenar fechas
        const fechasOrdenadas = Array.from(fechasSet).sort();
        const paisesLista = Array.from(paisesSet).sort();
        
        // Preparar datasets para Chart.js (BARRAS AGRUPADAS)
        const datasets = paisesLista.map((pais, index) => {
            const datosPais = datosPorPais[pais] || {};
            const data = fechasOrdenadas.map(fecha => datosPais[fecha] || 0);
            
            return {
                label: pais,
                data: data,
                backgroundColor: coloresNacionalidades[index % coloresNacionalidades.length],
                borderColor: darkenColor(coloresNacionalidades[index % coloresNacionalidades.length], 0.2),
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 20
            };
        });
        
        // Guardar datos en el formato CORRECTO para gráficas agrupadas
        const datosTiempo = {
            labels: fechasOrdenadas,
            datasets: datasets,
            paises: paisesLista,
            fechas: fechasOrdenadas,
            total: datasets.reduce((total, dataset) => 
                total + dataset.data.reduce((sum, val) => sum + val, 0), 0)
        };
        
        console.log(`✅ Datos de ${tipo} procesados:`, datosTiempo);

        console.log('🔍 Datos procesados para filtros:', {
            labelsCount: fechasOrdenadas.length,
            datasetsCount: datasets.length,
            datasetsInfo: datasets.map(d => ({
                label: d.label,
                dataCount: d.data.length,
                total: d.data.reduce((sum, val) => sum + val, 0)
            })),
            totalGeneral: datasets.reduce((total, dataset) => 
                total + dataset.data.reduce((sum, val) => sum + val, 0), 0)
        });
        
        return datosTiempo;
    }

// =============================================
    // FUNCIONES AUXILIARES
    // =============================================

    // Actualizar estadísticas
    function actualizarEstadisticas(total, nacionalidades) {
        if (document.getElementById('total-visitantes')) {
            document.getElementById('total-visitantes').textContent = total.toLocaleString();
        }
        if (document.getElementById('visitantes-con-nacionalidad')) {
            document.getElementById('visitantes-con-nacionalidad').textContent = total.toLocaleString();
        }
        if (document.getElementById('total-nacionalidades')) {
            document.getElementById('total-nacionalidades').textContent = nacionalidades;
        }
    }

// Funciones auxiliares para tiempo
    function getDatosTiempo(tipo) {
        let datos;
        switch(tipo) {
            case 'fecha': datos = datosFecha; break;
            case 'mes': datos = datosMes; break;
            case 'anio': datos = datosAnio; break;
            default: datos = { labels: [], datasets: [], paises: [], fechas: [], total: 0 };
        }
        
        // Asegurar que tenga la estructura correcta para gráficas agrupadas
        if (datos && (!datos.datasets || datos.datasets.length === 0)) {
            // Convertir datos antiguos a nuevo formato
            return convertirDatosAntiguosATiempo(tipo, datos);
        }
        
        return datos;
    }

// Función auxiliar para convertir datos antiguos
    function convertirDatosAntiguosATiempo(tipo, datosAntiguos) {
        if (!datosAntiguos.labels || datosAntiguos.labels.length === 0) {
            return { labels: [], datasets: [], paises: [], fechas: [], total: 0 };
        }
        
        // Crear datasets para "Colombia" y "Otros" si existen
        const datasets = [];
        
        if (datosAntiguos.valuesColombia && datosAntiguos.valuesColombia.length > 0) {
            datasets.push({
                label: 'Colombia',
                data: datosAntiguos.valuesColombia,
                backgroundColor: '#27ae60'
            });
        }
        
        if (datosAntiguos.valuesOtros && datosAntiguos.valuesOtros.length > 0) {
            datasets.push({
                label: 'Otros Países',
                data: datosAntiguos.valuesOtros,
                backgroundColor: '#3498db'
            });
        }
        
        return {
            labels: datosAntiguos.labels || [],
            datasets: datasets,
            paises: datasets.map(d => d.label),
            fechas: datosAntiguos.labels || [],
            total: datosAntiguos.total || 0
        };
    }

// Procesar datos filtrados
    async function procesarDatosFiltrados(participantes, tipo) {
        if (tipo === 'nacionalidad') {
            // Obtener países de los participantes filtrados
            const mapaCiudadPais = await obtenerPaisesDeParticipantes(participantes);
            
            // Contar participantes por país (formato nuevo - TODOS los países individuales)
            const conteoPaises = {};
            let sinPaisCount = 0;

            participantes.forEach(participante => {
                const pais = mapaCiudadPais[participante.id_ciudad];
                
                if (pais && pais !== 'Sin país') {
                    // Normalizar nombre (Colombia siempre igual)
                    const nombrePais = pais.toLowerCase().includes('colombia') ? 'Colombia' : pais;
                    conteoPaises[nombrePais] = (conteoPaises[nombrePais] || 0) + 1;
                } else {
                    sinPaisCount++;
                }
            });

            // Agregar "Sin país" si hay
            if (sinPaisCount > 0) {
                conteoPaises['Sin país'] = sinPaisCount;
            }

            // Procesar como todos los países individuales
            procesarDatosNacionalidad(conteoPaises, {});
            
        } else {
            const mapaCiudadPais = await obtenerPaisesDeParticipantes(participantes);
            
            // Crear función temporal para procesar filtros (NO usa procesarDatosTiempo)
            const datosFiltrados = await procesarDatosFiltradosTiempo(participantes, tipo, mapaCiudadPais);
            
            // Mostrar INTERFAZ con datos filtrados
            mostrarInterfazTiempo(tipo, datosFiltrados);
            
            mostrarExito(`Filtros aplicados: ${participantes.length} participantes encontrados`);
        }
    }

// Función para inicializar la API completa
    function inicializarAPICompleta() {
        // Métodos de modal con filtros
        window.NacionalidadManager.abrirModal = (tipo) => abrirModalNacionalidad(tipo);
        window.NacionalidadManager.abrirModalTiempo = (tipo, tipoGrafica) => abrirModalTiempo(tipo, tipoGrafica);
        window.NacionalidadManager.cerrarModal = () => cerrarModalNacionalidad();
        window.NacionalidadManager.aplicarFiltrosModal = () => aplicarFiltrosModal();
        window.NacionalidadManager.limpiarFiltrosModal = () => limpiarFiltrosModal();
        
        // Métodos de descarga
        window.NacionalidadManager.descargarPNG = () => {
            const canvas = document.getElementById("chartAmpliadoNacionalidad");
            if (canvas) {
                const link = document.createElement("a");
                link.download = "grafica_ampliada_nacionalidad.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        };
        
        window.NacionalidadManager.descargarExcelModal = () => {
            const titulo = document.getElementById('modalTitleNacionalidad')?.textContent || 'Reporte Nacionalidad';
            const tbody = document.getElementById("tbodyDatosNacionalidad");
            if (!tbody) return;
            
            const filas = tbody.querySelectorAll('tr');
            const datosExcel = [];
            
            // Obtener encabezados de la tabla
            const thead = document.querySelector('#tablaDatosNacionalidad thead');
            const encabezados = [];
            if (thead) {
                const ths = thead.querySelectorAll('th');
                ths.forEach(th => encabezados.push(th.textContent.trim()));
                datosExcel.push(encabezados);
            } else {
                // Encabezados por defecto
                datosExcel.push(['Nacionalidad/Período', 'Descripción', 'Total Visitantes', 'Porcentaje', 'Tendencia']);
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
            XLSX.utils.book_append_sheet(wb, ws, "Datos Filtrados Nacionalidad");
            XLSX.writeFile(wb, "reporte_filtrado_nacionalidad.xlsx");
        };

        // Métodos principales
        window.NacionalidadManager.inicializar = () => cargarDatosCompletos();
        window.NacionalidadManager.cambiarTipoReporte = (tipo) => cambiarTipoReporte(tipo);
        
        // Métodos de filtrado principal
        window.NacionalidadManager.aplicarFiltrosCombinados = () => aplicarFiltrosCombinados();
        window.NacionalidadManager.limpiarFiltrosCombinados = () => limpiarFiltrosCombinados();
        window.NacionalidadManager.exportarDatosFiltrados = () => exportarDatosFiltrados();
        
        // Métodos para tiempo
        window.NacionalidadManager.descargarGraficoPrincipalTiempo = (tipo) => descargarGraficoPrincipalTiempo(tipo);
        window.NacionalidadManager.descargarExcelTiempo = (tipo) => descargarExcelTiempo(tipo);

        // Métodos generales
        window.NacionalidadManager.descargarGraficoPrincipal = () => descargarGraficoPrincipal();
        window.NacionalidadManager.descargarExcel = () => descargarExcel();
    }
