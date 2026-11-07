// visitantes - utils
// Refactor modular: lógica original preservada.

function actualizarFechaHora() {
            const ahora = new Date();
            const opciones = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            const fechaHora = ahora.toLocaleDateString('es-ES', opciones);
            document.getElementById('current-date-time').textContent = fechaHora;
        }
