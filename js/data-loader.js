class DataProcessor {
    constructor() {
        this.datosVisitantes = [];
        this.datosSimulados = {};
        this.app = null;
    }

    setApp(app) {
        this.app = app;
    }

    // ✅ MÉTODO PRINCIPAL: Procesar datos completos
    procesarDatosCompletos(datos) {
        console.log('📊 Procesando datos completos:', datos?.length || 0, 'registros');
        
        if (!datos || datos.length === 0) {
            console.warn('⚠️ No hay datos para procesar');
            this.mostrarDatosDemo();
            return;
        }
        
        this.datosVisitantes = datos;
        console.log('📈 Ejemplo de dato procesado:', datos[0]);
        
        // ✅ Asegurar que los datos tengan la estructura correcta
        const datosConEstructura = datos.map(d => ({
            tipo_reserva: d.tipo_reserva || d.reservas?.tipo_reserva || 'individual',
            estado: d.estado || d.reservas?.estado || 'confirmada',
            actividad_nombre: d.actividad_nombre || d.reservas?.actividades?.nombre || 'Visita General',
            interes_nombre: d.interes_nombre || d.intereses?.nombre || 'General',
            institucion_nombre: d.institucion_nombre || d.instituciones?.nombre_institucion || 'Sin institución',
            genero: d.genero_nombre || d.genero?.genero || d.genero || 'no especificado',
            fecha_visita: d.fecha_visita || d.fecha_reserva || d.reservas?.fecha_reserva || new Date().toISOString(),
            numero_participantes: d.numero_participantes || d.reservas?.numero_participantes || 1,
            id_reserva: d.id_reserva || d.reservas?.id_reserva || Math.random().toString(36).substr(2, 9)
        }));
        
        // ✅ LLAMAR AL MÉTODO CORRECTO
        this.prepararDatosParaGraficas(datosConEstructura);
        
        // Notificar que hay datos nuevos
        if (this.app) {
            this.app.notificarCambioDatos();
        }
    }

    // ✅ MÉTODO AÑADIDO: Preparar datos para gráficas
    prepararDatosParaGraficas(datosConEstructura) {
        console.log('📊 Preparando datos para gráficas...');
        
        if (!datosConEstructura || datosConEstructura.length === 0) {
            console.warn('⚠️ No hay datos para preparar gráficas');
            this.generarDatosSimulados();
            return;
        }
        
        // Procesar cada categoría
        const categorias = [
            'tipo_reserva', 'estado', 'actividad', 
            'institucion', 'intereses', 'genero'
        ];
        
        categorias.forEach(categoria => {
            this.datosSimulados[categoria] = this.procesarCategoria(categoria, datosConEstructura);
        });
        
        // Procesar datos temporales
        this.procesarDatosTemporales(datosConEstructura);
        
        // Procesar datos de temporada
        this.procesarDatosTemporada(datosConEstructura);
        
        // Procesar datos por año
        this.procesarDatosPorAnio(datosConEstructura);
        
        console.log('✅ Datos preparados para gráficas:', this.datosSimulados);
    }

    // ✅ MÉTODO AÑADIDO: Procesar una categoría específica
    procesarCategoria(categoria, datos) {
        const mapeoCategorias = {
            'tipo_reserva': 'tipo_reserva',
            'estado': 'estado',
            'actividad': 'actividad_nombre',
            'institucion': 'institucion_nombre',
            'intereses': 'interes_nombre',
            'genero': 'genero'
        };
        
        const campo = mapeoCategorias[categoria] || categoria;
        
        // Contar frecuencias
        const conteo = {};
        datos.forEach(item => {
            const valor = item[campo] || 'No especificado';
            conteo[valor] = (conteo[valor] || 0) + 1;
        });
        
        // Convertir a formato para gráficas
        return {
            labels: Object.keys(conteo),
            values: Object.values(conteo)
        };
    }

    // ✅ MÉTODO AÑADIDO: Procesar datos temporales
    procesarDatosTemporales(datos) {
        try {
            console.log('📅 Procesando datos temporales...');
            
            // Agrupar por fecha
            const conteoPorFecha = {};
            datos.forEach(item => {
                const fecha = item.fecha_visita;
                if (fecha) {
                    const fechaStr = fecha.split('T')[0]; // Solo fecha
                    conteoPorFecha[fechaStr] = (conteoPorFecha[fechaStr] || 0) + 1;
                }
            });
            
            // Ordenar por fecha y tomar las últimas 10
            const fechasOrdenadas = Object.keys(conteoPorFecha)
                .sort()
                .slice(-10);
            
            const valoresOrdenados = fechasOrdenadas.map(fecha => conteoPorFecha[fecha]);
            
            this.datosSimulados['fecha'] = {
                labels: fechasOrdenadas,
                values: valoresOrdenados
            };
            
            // Agrupar por mes
            const conteoPorMes = {};
            datos.forEach(item => {
                const fecha = item.fecha_visita;
                if (fecha) {
                    const mes = fecha.substring(0, 7); // Formato YYYY-MM
                    const mesNombre = this.obtenerNombreMes(mes);
                    conteoPorMes[mesNombre] = (conteoPorMes[mesNombre] || 0) + 1;
                }
            });
            
            // Ordenar meses
            const mesesOrdenados = Object.keys(conteoPorMes).sort((a, b) => {
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return meses.indexOf(a) - meses.indexOf(b);
            });
            
            const valoresMeses = mesesOrdenados.map(mes => conteoPorMes[mes]);
            
            this.datosSimulados['mes'] = {
                labels: mesesOrdenados,
                values: valoresMeses
            };
            
        } catch (error) {
            console.error('❌ Error procesando datos temporales:', error);
            this.datosSimulados['fecha'] = this.generarDatosDemoTemporal();
            this.datosSimulados['mes'] = this.generarDatosDemoMensual();
        }
    }

    // ✅ MÉTODO AÑADIDO: Procesar datos por temporada
    procesarDatosTemporada(datos) {
        const temporadas = {
            'alta': 0,
            'media': 0,
            'baja': 0
        };
        
        datos.forEach(item => {
            const fecha = item.fecha_visita;
            if (fecha) {
                const mes = new Date(fecha).getMonth() + 1;
                
                if ([1, 2, 3, 7, 8, 12].includes(mes)) {
                    temporadas.alta += 1;
                } else if ([4, 5, 6, 11].includes(mes)) {
                    temporadas.media += 1;
                } else {
                    temporadas.baja += 1;
                }
            }
        });
        
        this.datosSimulados['temporada'] = {
            labels: ['Alta', 'Media', 'Baja'],
            values: [temporadas.alta, temporadas.media, temporadas.baja]
        };
    }

    // ✅ MÉTODO AÑADIDO: Procesar datos por año
    procesarDatosPorAnio(datos) {
        const conteoPorAnio = {};
        
        datos.forEach(item => {
            const fecha = item.fecha_visita;
            if (fecha) {
                const anio = fecha.substring(0, 4);
                conteoPorAnio[anio] = (conteoPorAnio[anio] || 0) + 1;
            }
        });
        
        // Ordenar por año descendente
        const aniosOrdenados = Object.keys(conteoPorAnio).sort((a, b) => b - a);
        const valoresAnios = aniosOrdenados.map(anio => conteoPorAnio[anio]);
        
        this.datosSimulados['anio'] = {
            labels: aniosOrdenados,
            values: valoresAnios
        };
    }

    // ✅ MÉTODO AÑADIDO: Obtener nombre del mes
    obtenerNombreMes(fechaStr) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        try {
            const fecha = new Date(fechaStr + '-01');
            return meses[fecha.getMonth()];
        } catch (error) {
            return fechaStr;
        }
    }

    // ✅ MÉTODO EXISTENTE: Mostrar datos demo
    mostrarDatosDemo() {
        console.log('🔄 Mostrando datos de demostración...');
        this.generarDatosSimulados();
        
        // Notificar que hay datos nuevos
        if (this.app) {
            this.app.notificarCambioDatos();
        }
    }

    // ✅ MÉTODO EXISTENTE: Generar datos simulados
    generarDatosSimulados() {
        console.log('🎲 Generando datos simulados...');
        
        this.datosSimulados = {
            tipo_reserva: {
                labels: ['Individual', 'Grupal'],
                values: [65, 35]
            },
            estado: {
                labels: ['Confirmada', 'Pendiente', 'Cancelada'],
                values: [70, 20, 10]
            },
            actividad: {
                labels: ['Tour Guiado', 'Visita Libre', 'Taller Educativo'],
                values: [45, 35, 20]
            },
            institucion: {
                labels: ['Universidad', 'Colegio', 'Empresa', 'Otro'],
                values: [40, 30, 20, 10]
            },
            intereses: {
                labels: ['Historia', 'Ciencia', 'Naturaleza', 'Arte'],
                values: [35, 25, 20, 20]
            },
            genero: {
                labels: ['Masculino', 'Femenino', 'Otro'],
                values: [55, 40, 5]
            },
            fecha: this.generarDatosDemoTemporal(),
            mes: this.generarDatosDemoMensual(),
            anio: {
                labels: ['2024', '2023'],
                values: [70, 30]
            },
            temporada: {
                labels: ['Alta', 'Media', 'Baja'],
                values: [50, 30, 20]
            }
        };
        
        console.log('✅ Datos simulados generados:', this.datosSimulados);
    }

    // ✅ MÉTODO AÑADIDO: Generar datos demo temporales
    generarDatosDemoTemporal() {
        const fechas = [];
        const valores = [];
        
        for (let i = 9; i >= 0; i--) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            fechas.push(fecha.toISOString().split('T')[0]);
            valores.push(Math.floor(Math.random() * 50) + 20);
        }
        
        return {
            labels: fechas,
            values: valores
        };
    }

    // ✅ MÉTODO AÑADIDO: Generar datos demo mensuales
    generarDatosDemoMensual() {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const valores = meses.map(() => Math.floor(Math.random() * 100) + 50);
        
        return {
            labels: meses,
            values: valores
        };
    }

    // ✅ MÉTODO EXISTENTE: Obtener datos simulados
    getDatosSimulados() {
        return this.datosSimulados;
    }

    // ✅ MÉTODO EXISTENTE: Obtener datos de visitantes
    getDatosVisitantes() {
        return this.datosVisitantes;
    }

    // ✅ MÉTODO EXISTENTE: Filtrar datos
    filtrarDatos(filtros) {
        if (!this.datosVisitantes || this.datosVisitantes.length === 0) return;
        
        let datosFiltrados = [...this.datosVisitantes];
        
        // Aplicar filtros
        if (filtros.tipo_reserva && filtros.tipo_reserva !== 'todas') {
            datosFiltrados = datosFiltrados.filter(d => 
                d.tipo_reserva === filtros.tipo_reserva
            );
        }
        
        if (filtros.estado && filtros.estado !== 'todas') {
            datosFiltrados = datosFiltrados.filter(d => 
                d.estado === filtros.estado
            );
        }
        
        // Procesar datos filtrados para gráficas
        const datosConEstructura = datosFiltrados.map(d => ({
            tipo_reserva: d.tipo_reserva,
            estado: d.estado,
            actividad_nombre: d.actividad_nombre,
            interes_nombre: d.interes_nombre,
            institucion_nombre: d.institucion_nombre,
            genero: d.genero,
            fecha_visita: d.fecha_visita
        }));
        
        this.prepararDatosParaGraficas(datosConEstructura);
    }
}

const dataProcessor = new DataProcessor();