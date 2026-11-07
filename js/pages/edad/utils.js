// EdadSystem - utils
// Refactor modular: lógica original preservada.

function calcularEdad(fechaNacimiento) {
        try {
            const nacimiento = new Date(fechaNacimiento);
            const hoy = new Date();
            
            if (isNaN(nacimiento.getTime())) {
                return null;
            }
            
            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edad--;
            }
            
            return edad >= 0 ? edad : null;
        } catch (error) {
            console.error('Error calculando edad:', error);
            return null;
        }
    }

function clasificarEdad(edad) {
        if (edad <= 17) return '0-17';
        if (edad <= 25) return '18-25';
        if (edad <= 35) return '26-35';
        if (edad <= 50) return '36-50';
        if (edad <= 65) return '51-65';
        return '66+';
    }

function getDescripcionTiempo(tipo, label) {
        switch(tipo) {
            case 'fecha':
                return 'Fecha específica de visita';
            case 'mes':
                return 'Mes completo de visitas';
            case 'anio':
                return 'Año completo de visitas';
            default:
                return 'Período de tiempo';
        }
    }

// ***** FUNCIONES COMPLETADAS *****

    function obtenerTipoReporteActual() {
        const btnActivo = document.querySelector('.chart-btn.active');
        if (btnActivo) {
            return btnActivo.dataset.type || 'edad';
        }
        return 'edad';
    }

// Función para cambiar entre tipos de reporte
    function cambiarTipoReporte(tipo) {
        console.log('🔄 Cambiando a reporte:', tipo);
        
        // Actualizar botones activos
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.chart-btn[data-type="${tipo}"]`).classList.add('active');
        
        if (tipo === 'edad') {
            // Cargar datos de edad
            cargarDatosEdades();
        } else {
            // Cargar datos de tiempo (fecha, mes, año)
            cargarDatosTiempo(tipo);
        }
    }

// =============================================
    // FUNCIONES AUXILIARES
    // =============================================

    function formatearFecha(fechaStr) {
        try {
            const fecha = new Date(fechaStr);
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return fechaStr;
        }
    }

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
