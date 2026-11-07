// principal - index
// Refactor modular: lógica original preservada.

// Inicializar fecha y hora
            updateDateTime();

setInterval(updateDateTime, 1000);

// Cargar datos cuando la página esté lista
            document.addEventListener('DOMContentLoaded', function() {
                console.log('📄 DOM cargado, iniciando carga de datos...');
                cargarTodosLosDatos();
            });

// Botón de ayuda del panel principal
            document.getElementById("help-btn").addEventListener("click", function () {
                Swal.fire({
                    title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-chart-pie" style="color: #3498db; font-size: 1.5rem;"></i><span>Centro de Ayuda - Panel Principal</span></div>',
                    html: `
                        <div style="text-align: left;">
                            <div style="background: linear-gradient(135deg, #3498db, #2c3e50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                                <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-info-circle"></i>
                                    ¿Qué hace esta interfaz?
                                </h4>
                            </div>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; margin-bottom: 20px;">
                                <p style="margin: 0 0 10px 0; color: #2c3e50; font-size: 0.95rem;">
                                    <i class="fas fa-seedling" style="color: #27ae60; margin-right: 8px;"></i>
                                    En este apartado encontrarás información y tus reportes importantes para tus informes. 
                                    También podrás ver detalladamente el parque con sus datos del pasado y presente.
                                </p>
                                <p style="margin: 0; color: #2c3e50; font-size: 0.95rem;">
                                    <i class="fas fa-heart" style="color: #e74c3c; margin-right: 8px;"></i>
                                    Esperamos que sea de tu agrado.
                                </p>
                            </div>

                            <div style="background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                                <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-star"></i>
                                    Funcionalidades Principales
                                </h4>
                            </div>
                            
                            <div style="display: grid; gap: 15px; margin-bottom: 20px;">
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
                                    <i class="fas fa-chart-bar" style="color: #3498db; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Visualización de Datos</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Consulta información detallada y estadísticas en tiempo real del parque</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e74c3c;">
                                    <i class="fas fa-history" style="color: #e74c3c; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Reportes Históricos</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Accede a datos del pasado y presente para análisis comparativos</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f39c12;">
                                    <i class="fas fa-file-alt" style="color: #f39c12; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Informes Importantes</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Genera y visualiza tus reportes con información clave del parque</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
                    showCloseButton: true,
                    confirmButtonColor: '#3498db',
                    confirmButtonText: '<i class="fas fa-check-circle"></i> Entendido',
                    width: 650,
                    background: '#ffffff'
                });
            });

// Botón de salir - Ahora con confirmación
            document.getElementById("logout-btn").addEventListener("click", function() {
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: "¿Quieres cerrar sesión?",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#27ae60',
                    cancelButtonColor: '#e74c3c',
                    confirmButtonText: 'Sí, salir',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Saliendo...',
                            text: "Cerrando sesión",
                            icon: 'info',
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true,
                            didOpen: () => {
                                Swal.showLoading()
                            }
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    }
                });
            });
