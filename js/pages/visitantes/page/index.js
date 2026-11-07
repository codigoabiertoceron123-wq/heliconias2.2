// visitantes - index
// Refactor modular: lógica original preservada.

// Actualizar cada segundo
        setInterval(actualizarFechaHora, 1000);

actualizarFechaHora();

// Botones de ayuda y logout
        document.getElementById('help-btn').addEventListener('click', function() {
            Swal.fire({
                title: 'Ayuda del Sistema',
                html: `
                    <div style="text-align: left; padding: 10px;">
                        <h4>📊 Análisis de Visitantes</h4>
                        <p>• <strong>Haz clic en cualquier gráfica</strong> para verla en tamaño ampliado.</p>
                        <p>• <strong>Usa los botones de categoría</strong> para cambiar el tipo de análisis.</p>
                        <p>• <strong>Aplica filtros</strong> en la vista ampliada para datos específicos.</p>
                        <p>• <strong>Descarga gráficas</strong> en PNG o Excel.</p>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#10b981'
            });
        });

document.getElementById('logout-btn').addEventListener('click', function() {
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que quieres salir del sistema?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirigir al login
                    window.location.href = 'index.html';
                }
            });
        });
