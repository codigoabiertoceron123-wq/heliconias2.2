// InstitucionSystem - utils
// Refactor modular: lógica original preservada.

function getTituloTiempo(tipo) {
        const titulos = {
            'fecha': '📅 Visitantes por Fecha',
            'mes': '📊 Visitantes por Mes', 
            'anio': '📈 Visitantes por Año'
        };
        return titulos[tipo] || 'Visitantes';
    }

function getIconoTiempo(tipo) {
        const iconos = {
            'fecha': '<i class="fas fa-calendar-day"></i>',
            'mes': '<i class="fas fa-calendar-week"></i>',
            'anio': '<i class="fas fa-calendar-alt"></i>'
        };
        return iconos[tipo] || '<i class="fas fa-chart-bar"></i>';
    }

function obtenerTipoInstitucion(nombre) {
        const nombreLower = nombre.toLowerCase();
        if (nombreLower.includes('universidad')) return 'Universidad';
        if (nombreLower.includes('colegio') || nombreLower.includes('institución')) return 'Colegio';
        if (nombreLower.includes('escuela')) return 'Escuela';
        return 'Institución Educativa';
    }

function getDescripcionTiempo(tipo, label) {
        switch(tipo) {
            case 'fecha':
                const fecha = new Date(label);
                return fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            case 'mes':
                return 'Mes completo de visitas';
            case 'anio':
                return 'Año completo de visitas';
            default:
                return 'Período de tiempo';
        }
    }

// Cambiar tipo de reporte - VERSIÓN CORREGIDA
    function cambiarTipoReporte(tipo) {
        console.log('🔄 Cambiando a reporte:', tipo);
        
        // Actualizar botones activos
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.chart-btn[data-type="${tipo}"]`).classList.add('active');
        
        // Actualizar variable global
        tipoActual = tipo;
        
        // Mostrar/ocultar filtros combinados
        const filtrosDiv = document.getElementById('filtros-combinados');
        if (filtrosDiv) {
            filtrosDiv.style.display = 'block'; // Siempre mostrar filtros
        }
        
        // Si ya tenemos datos de este tipo, mostrarlos
        let tieneDatos = false;
        
        if (tipo === 'institucion') {
            tieneDatos = datosInstituciones && datosInstituciones.labels && datosInstituciones.labels.length > 0;
        } else {
            const datosTipo = getDatosTiempo(tipo);
            tieneDatos = datosTipo && datosTipo.labels && datosTipo.labels.length > 0;
        }
        
        if (tieneDatos) {
            if (tipo === 'institucion') {
                mostrarInterfazInstitucion();
            } else {
                mostrarInterfazTiempo(tipo);
            }
        } else {
            // Cargar datos si no los tenemos
            if (tipo === 'institucion') {
                if (datosOriginales.labels && datosOriginales.labels.length > 0) {
                    datosInstituciones = JSON.parse(JSON.stringify(datosOriginales));
                    mostrarInterfazInstitucion();
                } else {
                    cargarDatosInstitucion();
                }
            } else {
                cargarDatosTiempo(tipo);
            }
        }
    }

// Función para determinar el tipo actual del modal
    function determinarTipoActual() {
        const titulo = document.getElementById('modalTitleInstitucion')?.textContent || '';
        if (titulo.includes('Institución')) return 'institucion';
        if (titulo.includes('Fecha')) return 'fecha';
        if (titulo.includes('Mes')) return 'mes';
        if (titulo.includes('Año')) return 'anio';
        return 'institucion';
    }
