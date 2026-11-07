// edad - ui
// Refactor modular: lógica original preservada.

// Función para mostrar errores de inicialización
        function mostrarErrorInicial(mensaje) {
            const container = document.getElementById('data-container');
            if (container) {
                container.innerHTML = `
                    <div class="no-data" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle fa-3x" style="color: #e74c3c; margin-bottom: 20px;"></i>
                        <h3 style="color: #c0392b;">Error en el sistema</h3>
                        <p style="margin: 15px 0; color: #7f8c8d;">${mensaje}</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button class="btn btn-primary" onclick="location.reload()">
                                <i class="fas fa-redo"></i> Recargar página
                            </button>
                            <button class="btn" onclick="iniciarSistemaManual()" style="background: #3498db; color: white;">
                                <i class="fas fa-play"></i> Iniciar manualmente
                            </button>
                        </div>
                    </div>
                `;
            }
        }
