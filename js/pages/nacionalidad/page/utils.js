// nacionalidad - utils
// Refactor modular: lógica original preservada.

// Funciones básicas
        function updateDateTime() {
            const now = new Date();
            const dateTimeString = now.toLocaleString("es-ES", {
                weekday: "long", year: "numeric", month: "long", 
                day: "numeric", hour: "2-digit", minute: "2-digit"
            });
            document.getElementById("current-date-time").textContent = dateTimeString;
        }
