// actividad - index
// Refactor modular: lógica original preservada.

// Inicializar fecha y hora
            updateDateTime();

setInterval(updateDateTime, 1000);

// Inicializar la página
        document.addEventListener('DOMContentLoaded', function() {
            // Actualizar fecha y hora cada segundo
            updateDateTime();
            setInterval(updateDateTime, 1000);
            
            // Cargar actividades al inicio
            loadActivities();
            
            // Configurar búsqueda
            const searchInput = document.getElementById('search-input');
            const searchBtn = document.getElementById('search-btn');
            
            searchBtn.addEventListener('click', () => {
                loadActivities(searchInput.value.trim());
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loadActivities(searchInput.value.trim());
                }
            });
            
            // Configurar botones de la interfaz
            document.getElementById('logout-btn').addEventListener('click', () => {
                Swal.fire({
                    title: '¿Cerrar sesión?',
                    text: 'Está a punto de salir del sistema',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#27ae60',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, salir',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Aquí iría la lógica para cerrar sesión
                        window.location.href = 'index.html';
                    }
                });
            });
            
                // Botón de ayuda del header con SweetAlert mejorado
            document.getElementById('help-btn').addEventListener('click', function(e) {
                e.preventDefault();
                Swal.fire({
                  title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-life-ring" style="color: #3498db; font-size: 1.5rem;"></i><span>Centro de Ayuda - Actividades</span></div>',
                  html: `
                    <div style="text-align: left;">
                      <div style="background: linear-gradient(135deg, #3498db, #2c3e50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                          <i class="fas fa-info-circle"></i>
                          Gestión de Actividades - Guía Rápida
                        </h4>
                      </div>
                      
                      <div style="display: grid; gap: 15px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
                          <i class="fas fa-search" style="color: #3498db; font-size: 1.2rem; margin-top: 2px;"></i>
                          <div>
                            <strong style="color: #2c3e50;">Búsqueda de Actividades</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Utilice el campo de búsqueda para encontrar actividades específicas por nombre. Puede presionar Enter o hacer clic en el botón Buscar.</p>
                          </div>
                        </div>
                        
                        <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
                          <i class="fas fa-eye" style="color: #27ae60; font-size: 1.2rem; margin-top: 2px;"></i>
                          <div>
                            <strong style="color: #2c3e50;">Ver Detalles Completos</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Haga clic en cualquier tarjeta de actividad para ver información detallada incluyendo descripción, horarios, recomendaciones y más.</p>
                          </div>
                        </div>
                        
                        <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f39c12;">
                          <i class="fas fa-filter" style="color: #f39c12; font-size: 1.2rem; margin-top: 2px;"></i>
                          <div>
                            <strong style="color: #2c3e50;">Filtros Visuales</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Las actividades se muestran con colores según su nivel de dificultad (verde=bajo, amarillo=medio, rojo=alto) y estado (activo/inactivo).</p>
                          </div>
                        </div>
                        
                        <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e74c3c;">
                          <i class="fas fa-sync" style="color: #e74c3c; font-size: 1.2rem; margin-top: 2px;"></i>
                          <div>
                            <strong style="color: #2c3e50;">Datos en Tiempo Real</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Toda la información se carga directamente desde nuestra base de datos, garantizando que siempre vea la información más actualizada.</p>
                          </div>
                        </div>
                      </div>

                      <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 15px; border-radius: 10px; border-left: 4px solid #e17055;">
                        <h5 style="margin: 0 0 8px 0; color: #2d3436; display: flex; align-items: center; gap: 8px;">
                          <i class="fas fa-graduation-cap"></i>
                          ¿Necesita más ayuda?
                        </h5>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                          <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-headset" style="color: #27ae60;"></i>
                            Soporte Técnico
                          </span>
                          <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-book" style="color: #3498db;"></i>
                            Manual de Usuario
                          </span>
                        </div>
                      </div>
                    </div>
                  `,
                  showCloseButton: true,
                  confirmButtonColor: '#3498db',
                  confirmButtonText: '<i class="fas fa-check-circle"></i> Entendido',
                  width: 600,
                  background: '#ffffff',
                  customClass: {
                    popup: 'help-swal-popup',
                    title: 'help-swal-title',
                    htmlContainer: 'help-swal-html',
                    confirmButton: 'help-swal-confirm-btn'
                  }
                });
            });
        });
