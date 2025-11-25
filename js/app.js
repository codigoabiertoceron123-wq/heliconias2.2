// Módulo principal de la aplicación
class App {
    inicializar() {
        console.log('Inicializando aplicación...');
        
        // Inicializar fecha y hora
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        
        // Esperar un momento para asegurar que las dependencias estén cargadas
        setTimeout(() => {
            if (typeof dataLoader !== 'undefined') {
                dataLoader.cargarDatosVisitantes();
            } else {
                console.error('DataLoader no disponible');
            }
        }, 500);
        
        // Configurar eventos globales
        this.configurarEventosGlobales();
        
        console.log('Aplicación inicializada correctamente');
    }

    updateDateTime() {
        const now = new Date();
        const dateTimeString = now.toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

        const currentDateTimeElement = document.getElementById("current-date-time");
        if (currentDateTimeElement) {
            currentDateTimeElement.textContent = dateTimeString;
        }
    }

    configurarEventosGlobales() {
        // Botón de ayuda
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Ayuda',
                        html: `
                            <p>Esta aplicación te permite visualizar estadísticas de visitantes del Parque Heliconias.</p>
                            <p><strong>Funcionalidades:</strong></p>
                            <ul style="text-align: left;">
                                <li>Ver estadísticas generales</li>
                                <li>Explorar datos por diferentes categorías</li>
                                <li>Aplicar filtros para análisis específicos</li>
                                <li>Exportar gráficos y datos</li>
                            </ul>
                        `,
                        icon: 'info',
                        confirmButtonText: 'Entendido'
                    });
                } else {
                    alert('Ayuda: Esta aplicación te permite visualizar estadísticas de visitantes del Parque Heliconias.');
                }
            });
        }

        // Botón de salir
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: '¿Cerrar sesión?',
                        text: '¿Estás seguro de que deseas salir del sistema?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#e74c3c',
                        cancelButtonColor: '#3498db',
                        confirmButtonText: 'Sí, salir',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'login.html';
                        }
                    });
                } else {
                    if (confirm('¿Estás seguro de que deseas salir del sistema?')) {
                        window.location.href = 'login.html';
                    }
                }
            });
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const app = new App();
    app.inicializar();
});