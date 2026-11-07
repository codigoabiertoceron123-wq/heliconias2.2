// NacionalidadSystem - utils
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

function obtenerTipoNacionalidad(nombre) {
        if (nombre === 'Colombia') return 'Nacional';
        if (nombre === 'Otros países') return 'Internacional';
        return 'Internacional';
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

// Cambiar tipo de reporte
    function cambiarTipoReporte(tipo) {
        console.log('🔄 Cambiando a reporte:', tipo);
        
        // Actualizar botones activos
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.chart-btn[data-type="${tipo}"]`).classList.add('active');
        
        // Mostrar/ocultar filtros combinados
        const filtrosDiv = document.getElementById('filtros-combinados');
        if (filtrosDiv) {
            filtrosDiv.style.display = tipo !== 'nacionalidad' ? 'block' : 'none';
        }

        tipoActual = tipo;

        if (tipo === 'nacionalidad') {
            if (datosNacionalidades.labels && datosNacionalidades.labels.length > 0) {
                mostrarInterfazNacionalidad();
            } else {
                cargarDatosCompletos();
            }
        } else {
            cargarDatosTiempo(tipo);
        }
    }

// Función para determinar el tipo actual del modal
    function determinarTipoActual() {
        const titulo = document.getElementById('modalTitleNacionalidad')?.textContent || '';
        if (titulo.includes('Nacionalidad')) return 'nacionalidad';
        if (titulo.includes('Fecha')) return 'fecha';
        if (titulo.includes('Mes')) return 'mes';
        if (titulo.includes('Año')) return 'anio';
        return 'nacionalidad';
    }
