// edad - utils
// Refactor modular: lógica original preservada.

// Solo funciones básicas sin conflicto
        function updateDateTime() {
            const now = new Date();
            const dateTimeString = now.toLocaleString("es-ES", {
                weekday: "long", year: "numeric", month: "long", 
                day: "numeric", hour: "2-digit", minute: "2-digit"
            });
            document.getElementById("current-date-time").textContent = dateTimeString;
        }

// Función para iniciar manualmente el sistema
        function iniciarSistemaManual() {
            if (typeof EdadSystem !== 'undefined' && EdadSystem.cargarDatos) {
                EdadSystem.cargarDatos();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El sistema no está disponible. Por favor recarga la página.',
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
