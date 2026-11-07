// principal - data
// Refactor modular: lógica original preservada.

// Función para obtener datos de visitantes desde Supabase
            async function cargarDatosVisitantes() {
                try {
                    console.log('Iniciando carga de datos de visitantes...');
                    
                    const { data: visitantesData, error: visitantesError } = await sb
                        .from('participantes_reserva')
                        .select('id_participante');
                    
                    console.log('Datos obtenidos de visitantes:', visitantesData);
                    
                    if (visitantesError) {
                        console.error('Error al cargar visitantes:', visitantesError);
                        document.getElementById('total-visitantes').textContent = 'Error en BD';
                        return;
                    }
                    
                    const totalVisitantes = visitantesData ? visitantesData.length : 0;
                    document.getElementById('total-visitantes').textContent = totalVisitantes.toLocaleString();
                    
                    console.log('Total de visitantes:', totalVisitantes);
                    
                } catch (error) {
                    console.error('Error al cargar datos de visitantes:', error);
                    document.getElementById('total-visitantes').textContent = 'Error';
                }
            }

// Función para cargar datos de género dinámicamente
            async function cargarDatosGenero() {
                try {
                    console.log('=== CARGANDO DATOS DE GÉNERO DINÁMICAMENTE ===');
                    
                    const { data: participantes, error } = await sb
                        .from('participantes_reserva')
                        .select('id_genero')
                        .not('id_genero', 'is', null);

                    if (error) {
                        console.error('Error al cargar datos de género:', error);
                        mostrarErrorGenero();
                        return;
                    }

                    console.log('Datos de género obtenidos:', participantes);

                    const conteoGeneros = {};
                    
                    participantes.forEach(participante => {
                        const idGenero = participante.id_genero;
                        if (idGenero) {
                            conteoGeneros[idGenero] = (conteoGeneros[idGenero] || 0) + 1;
                        }
                    });

                    console.log('Conteo por ID de género:', conteoGeneros);

                    const nombresGenero = {
                        1: 'Masculino',
                        2: 'Femenino',
                        3: 'No binario',
                        4: 'Prefiero no decir',
                        5: 'Otro'
                    };

                    generarInterfazGeneros(conteoGeneros, nombresGenero);

                } catch (error) {
                    console.error('Error crítico en cargarDatosGenero:', error);
                    mostrarErrorGenero();
                }
            }

// Función para cargar datos de edad dinámicamente
            async function cargarDatosEdad() {
                try {
                    console.log('=== CARGANDO DATOS DE EDAD DINÁMICAMENTE ===');
                    
                    const { data: participantes, error } = await sb
                        .from('participantes_reserva')
                        .select('fecha_nacimiento')
                        .not('fecha_nacimiento', 'is', null);

                    if (error) {
                        console.error('Error al cargar datos de edad:', error);
                        mostrarErrorEdad();
                        return;
                    }

                    console.log('Datos de edad obtenidos:', participantes);

                    const conteoEdades = {
                        menores: 0,
                        adultos: 0,
                        mayores: 0
                    };

                    participantes.forEach(participante => {
                        const fechaNacimiento = participante.fecha_nacimiento;
                        if (fechaNacimiento) {
                            const edad = calcularEdad(fechaNacimiento);
                            if (edad !== null) {
                                const categoria = clasificarEdad(edad);
                                conteoEdades[categoria]++;
                            }
                        }
                    });

                    console.log('Conteo por categoría de edad:', conteoEdades);

                    generarInterfazEdades(conteoEdades);

                } catch (error) {
                    console.error('Error crítico en cargarDatosEdad:', error);
                    mostrarErrorEdad();
                }
            }

// Función para cargar datos de nacionalidad
            async function cargarDatosNacionalidad() {
                try {
                    console.log('=== CARGANDO DATOS DE NACIONALIDAD - COLOMBIA vs OTROS ===');
                    
                    const { data: participantes, error: errorParticipantes } = await sb
                        .from('participantes_reserva')
                        .select('id_ciudad')
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

                    const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
                    console.log('IDs de ciudades únicos:', idsCiudadesUnicos);

                    const { data: ciudades, error: errorCiudades } = await sb
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

                    const conteoPaises = {};
                    let sinPaisCount = 0;

                    participantes.forEach(participante => {
                        const ciudad = ciudades.find(c => c.id === participante.id_ciudad);
                        
                        if (ciudad && ciudad.pais && ciudad.pais.pais) {
                            const nombrePais = ciudad.pais.pais;
                            conteoPaises[nombrePais] = (conteoPaises[nombrePais] || 0) + 1;
                        } else {
                            sinPaisCount++;
                        }
                    });

                    console.log('Conteo completo por país:', conteoPaises);
                    console.log('Sin país:', sinPaisCount);

                    let colombiaCount = 0;
                    let otrosPaisesCount = 0;

                    Object.keys(conteoPaises).forEach(nombrePais => {
                        if (nombrePais.toLowerCase().includes('colombia')) {
                            colombiaCount += conteoPaises[nombrePais];
                        } else {
                            otrosPaisesCount += conteoPaises[nombrePais];
                        }
                    });

                    otrosPaisesCount += sinPaisCount;

                    const conteoFinal = {
                        'Colombia': colombiaCount,
                        'Otros países': otrosPaisesCount
                    };

                    console.log('Conteo final:', conteoFinal);
                    generarInterfazNacionalidades(conteoFinal);

                } catch (error) {
                    console.error('Error en cargarDatosNacionalidad:', error);
                    mostrarErrorNacionalidad();
                }
            }

// Función para cargar datos de ciudades
            async function cargarDatosCiudad() {
                try {
                    console.log('=== CARGANDO DATOS DE CIUDAD ===');
                    
                    const { data: participantes, error: errorParticipantes } = await sb
                        .from('participantes_reserva')
                        .select('id_ciudad')
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

                    const idsCiudadesUnicos = [...new Set(participantes.map(p => p.id_ciudad))];
                    console.log('IDs de ciudades únicos:', idsCiudadesUnicos);

                    const { data: ciudades, error: errorCiudades } = await sb
                        .from('ciudades')
                        .select('id, nombre')
                        .in('id', idsCiudadesUnicos);

                    if (errorCiudades) {
                        console.error('Error al obtener ciudades:', errorCiudades);
                        mostrarErrorCiudad();
                        return;
                    }

                    console.log('Ciudades obtenidas:', ciudades);

                    const conteoCiudades = {};
                    let sinCiudadCount = 0;

                    participantes.forEach(participante => {
                        const ciudad = ciudades.find(c => c.id === participante.id_ciudad);
                        
                        if (ciudad && ciudad.nombre) {
                            const nombreCiudad = ciudad.nombre;
                            conteoCiudades[nombreCiudad] = (conteoCiudades[nombreCiudad] || 0) + 1;
                        } else {
                            sinCiudadCount++;
                        }
                    });

                    console.log('Conteo completo por ciudad:', conteoCiudades);
                    console.log('Sin ciudad:', sinCiudadCount);

                    let bogotaCount = 0;
                    let medellinCount = 0;
                    let caliCount = 0;
                    let otrasCiudadesCount = 0;

                    Object.keys(conteoCiudades).forEach(nombreCiudad => {
                        const cantidad = conteoCiudades[nombreCiudad];
                        
                        if (nombreCiudad.toLowerCase().includes('bogotá') || nombreCiudad.toLowerCase().includes('bogota')) {
                            bogotaCount += cantidad;
                        } else if (nombreCiudad.toLowerCase().includes('medellín') || nombreCiudad.toLowerCase().includes('medellin')) {
                            medellinCount += cantidad;
                        } else if (nombreCiudad.toLowerCase().includes('cali')) {
                            caliCount += cantidad;
                        } else {
                            otrasCiudadesCount += cantidad;
                        }
                    });

                    otrasCiudadesCount += sinCiudadCount;

                    console.log('Conteo final ciudades:', {
                        'Bogotá': bogotaCount,
                        'Medellín': medellinCount,
                        'Cali': caliCount,
                        'Otras': otrasCiudadesCount
                    });

                    actualizarInterfazCiudades(bogotaCount, medellinCount, caliCount, otrasCiudadesCount);

                } catch (error) {
                    console.error('Error en cargarDatosCiudad:', error);
                    mostrarErrorCiudad();
                }
            }

// Función para cargar datos de instituciones
            async function cargarDatosInstitucion() {
                try {
                    console.log('=== CARGANDO DATOS DE INSTITUCIÓN ===');
                    
                    const { data: participantes, error: errorParticipantes } = await sb
                        .from('participantes_reserva')
                        .select('id_institucion')
                        .not('id_institucion', 'is', null);

                    if (errorParticipantes) {
                        console.error('Error al obtener participantes:', errorParticipantes);
                        mostrarErrorInstitucion();
                        return;
                    }

                    console.log('Participantes con instituciones:', participantes);

                    if (!participantes || participantes.length === 0) {
                        mostrarSinDatosInstitucion();
                        return;
                    }

                    const idsInstitucionesUnicos = [...new Set(participantes.map(p => p.id_institucion))];
                    console.log('IDs de instituciones únicos:', idsInstitucionesUnicos);

                    const { data: instituciones, error: errorInstituciones } = await sb
                        .from('instituciones')
                        .select('id_institucion, nombre_institucion')
                        .order('nombre_institucion');

                    if (errorInstituciones) {
                        console.error('Error al obtener instituciones:', errorInstituciones);
                        mostrarErrorInstitucion();
                        return;
                    }

                    const todasLasInstituciones = instituciones || [];
                    console.log('Todas las instituciones obtenidas:', todasLasInstituciones);

                    const conteoInstituciones = {};
                    let sinInstitucionCount = 0;

                    participantes.forEach(participante => {
                        const institucion = todasLasInstituciones.find(i => i.id_institucion === participante.id_institucion);
                        
                        if (institucion && institucion.nombre_institucion) {
                            const nombreInstitucion = institucion.nombre_institucion;
                            conteoInstituciones[nombreInstitucion] = (conteoInstituciones[nombreInstitucion] || 0) + 1;
                        } else {
                            sinInstitucionCount++;
                        }
                    });

                    console.log('Conteo completo por institución:', conteoInstituciones);
                    console.log('Sin institución:', sinInstitucionCount);

                    let univalleCount = 0;
                    let nacionalCount = 0;
                    let andesCount = 0;
                    let otrasInstitucionesCount = 0;

                    Object.keys(conteoInstituciones).forEach(nombreInstitucion => {
                        const cantidad = conteoInstituciones[nombreInstitucion];
                        const nombreLower = nombreInstitucion.toLowerCase();
                        
                        if (nombreLower.includes('universidad del valle') || nombreLower.includes('univalle')) {
                            univalleCount += cantidad;
                        } else if (nombreLower.includes('universidad nacional') || nombreLower.includes('nacional de colombia')) {
                            nacionalCount += cantidad;
                        } else if (nombreLower.includes('universidad de los andes') || nombreLower.includes('uniandes')) {
                            andesCount += cantidad;
                        } else {
                            otrasInstitucionesCount += cantidad;
                        }
                    });

                    otrasInstitucionesCount += sinInstitucionCount;

                    console.log('Conteo final instituciones:', {
                        'Universidad del Valle': univalleCount,
                        'Universidad Nacional': nacionalCount,
                        'Universidad de los Andes': andesCount,
                        'Otras': otrasInstitucionesCount
                    });

                    actualizarInterfazInstituciones(univalleCount, nacionalCount, andesCount, otrasInstitucionesCount);

                } catch (error) {
                    console.error('Error en cargarDatosInstitucion:', error);
                    mostrarErrorInstitucion();
                }
            }

// Función para cargar todos los datos
            async function cargarTodosLosDatos() {
                try {
                    console.log('🚀 Iniciando carga de todos los datos...');
                    
                    await cargarDatosVisitantes();
                    await cargarDatosGenero();
                    await cargarDatosEdad();
                    await cargarDatosNacionalidad();
                    await cargarDatosCiudad();
                    await cargarDatosInstitucion();
                    
                    console.log('✅ Todos los datos cargados exitosamente');
                    
                } catch (error) {
                    console.error('❌ Error al cargar todos los datos:', error);
                }
            }
