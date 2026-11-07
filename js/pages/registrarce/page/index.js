// registrarce - index
// Refactor modular: lógica original preservada.

// Función para reenviar confirmación
    window.reenviarConfirmacion = async function(email) {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: window.location.origin + '/index.html'
                }
            });

            if (error) throw error;

            Swal.fire({
                title: '📨 Correo reenviado',
                text: 'Hemos enviado nuevamente el enlace de confirmación a tu correo.',
                icon: 'success',
                confirmButtonText: 'Gracias'
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo reenviar el correo: ' + error.message,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };

// Inicializar la aplicación cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', inicializarApp);

// Navegación actualizada
    document.getElementById('nav-inicio').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Inicio - Parque Heliconias', 'https://parque-heliconias-khaki.vercel.app/index.html');
    });

document.getElementById('nav-reservas').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Reservas - Parque Heliconias', 'https://parqueheliconias-app.onrender.com/');
    });

document.getElementById('nav-login').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Login - Parque Heliconias', 'https://codigoabiertoceron123-wq.github.io/heliconias2.2/');
    });

// NUEVO: Botón de soporte
    document.getElementById('nav-soporte').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Soporte - Heliconias Reports', 'soporte2.html');
    });
