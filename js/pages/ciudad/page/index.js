// ciudad - index
// Refactor modular: lógica original preservada.

// Configurar eventos
        document.addEventListener('DOMContentLoaded', function() {
            updateDateTime();
            setInterval(updateDateTime, 60000);
            
            // Inicializar sistema de ciudad
            if (window.CiudadManager && window.CiudadManager.inicializar) {
                setTimeout(() => {
                    window.CiudadManager.inicializar();
                }, 500);
            }

            // Botón de ayuda - Reporte por Ciudad (Versión Mejorada)
document.getElementById('help-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const screenWidth = window.innerWidth;
    let modalWidth = '800px';
    
    if (screenWidth <= 768) modalWidth = '95%';
    if (screenWidth <= 480) modalWidth = '98%';
    
    Swal.fire({
        title: '<div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #2c3e50;"><i class="fas fa-city" style="color: #3498db; font-size: 1.5rem;"></i><span style="font-size: 1.5rem;">Ayuda - Reporte por Ciudad</span></div>',
        html: `
            <div style="text-align: center;">
                <div style="background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.1rem;">
                        <i class="fas fa-info-circle"></i>
                        Cómo usar el reporte por ciudad
                    </h4>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin: 25px 0; text-align: left;">
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #3498db;">
                        <i class="fas fa-map-marked-alt" style="color: #3498db; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Distribución Geográfica</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Visualiza la distribución de visitantes por ciudad de origen. Identifica de dónde vienen tus visitantes.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #2ecc71;">
                        <i class="fas fa-chart-bar" style="color: #2ecc71; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Comparación Estadística</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Compara estadísticas entre ciudades principales para identificar tendencias y patrones.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #e74c3c;">
                        <i class="fas fa-expand" style="color: #e74c3c; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Vista Detallada</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Haz clic en las gráficas para abrir la vista ampliada con filtros avanzados y más opciones.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #f39c12;">
                        <i class="fas fa-download" style="color: #f39c12; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Exportación de Datos</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Descarga reportes en PNG o Excel desde el modal para compartir o analizar externamente.</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #e8f4f8; padding: 15px; border-radius: 10px; margin-top: 20px; text-align: left;">
                    <h5 style="margin: 0 0 15px 0; color: #2980b9; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-filter"></i>
                        Filtros Avanzados en el Modal
                    </h5>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 3px solid #3498db;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                <i class="far fa-calendar-alt" style="color: #3498db;"></i>
                                <strong style="color: #2c3e50;">Fecha Inicial/Final</strong>
                            </div>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.85rem;">Selecciona un rango de fechas específico para filtrar los datos.</p>
                        </div>
                        
                        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 3px solid #2ecc71;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                <i class="fas fa-city" style="color: #2ecc71;"></i>
                                <strong style="color: #2c3e50;">Ciudad</strong>
                            </div>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.85rem;">Filtra por una ciudad específica o selecciona "Todas" para ver el panorama completo.</p>
                        </div>
                        
                        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 3px solid #e74c3c;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                <i class="fas fa-list-ol" style="color: #e74c3c;"></i>
                                <strong style="color: #2c3e50;">Mostrar</strong>
                            </div>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.85rem;">Limita el número de resultados mostrados para un análisis más enfocado.</p>
                        </div>
                        
                        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 3px solid #f39c12;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                <i class="fas fa-sort-amount-down" style="color: #f39c12;"></i>
                                <strong style="color: #2c3e50;">Ordenar por</strong>
                            </div>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.85rem;">Ordena los resultados por diferentes criterios según tus necesidades.</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #fff8e1; padding: 12px; border-radius: 8px; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-lightbulb" style="color: #ff9800;"></i>
                    <p style="margin: 0; color: #e65100; font-size: 0.9rem;">
                        <strong>💡 Consejo:</strong> Combina filtros de fecha con selección de ciudad para análisis específicos de temporada.
                    </p>
                </div>
            </div>
        `,
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonColor: '#3498db',
        confirmButtonText: '<i class="fas fa-check-circle"></i> ¡Entendido!',
        width: modalWidth,
        padding: '2rem',
        background: '#ffffff',
        customClass: {
            popup: 'animated-popup'
        }
    });
});
            // Botón de salir
            document.getElementById('logout-btn')?.addEventListener('click', function() {
                Swal.fire({
                    title: '¿Cerrar sesión?',
                    text: '¿Estás seguro de que deseas salir del sistema?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#e74c3c',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, salir',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'index.html';
                    }
                });
            });
            
            // Manejar clics en el modal para cerrarlo
            document.addEventListener('click', function(event) {
                const modal = document.getElementById('chartModalCiudad');
                if (modal && event.target === modal) {
                    window.CiudadManager.cerrarModal();
                }
            });
            
            // Manejar tecla ESC para cerrar modal
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    const modal = document.getElementById('chartModalCiudad');
                    if (modal && modal.classList.contains('show')) {
                        window.CiudadManager.cerrarModal();
                    }
                    
                }
            });
            
            // Mostrar/ocultar filtros combinados según tipo de reporte
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (target.classList.contains('chart-btn')) {
                            const tipo = target.getAttribute('data-type');
                            const filtrosDiv = document.getElementById('filtros-combinados');
                            if (filtrosDiv) {
                                filtrosDiv.style.display = tipo !== 'ciudad' ? 'block' : 'none';
                            }
                        }
                    }
                });
            });
            
            // Observar cambios en los botones
            document.querySelectorAll('.chart-btn').forEach(btn => {
                observer.observe(btn, { attributes: true });
            });
        });
