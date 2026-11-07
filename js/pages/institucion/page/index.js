// institucion - index
// Refactor modular: lógica original preservada.

// Configurar eventos
        document.addEventListener('DOMContentLoaded', function() {
            updateDateTime();
            setInterval(updateDateTime, 60000);
            
            // Inicializar sistema de institución
            if (window.InstitucionManager && window.InstitucionManager.inicializar) {
                window.InstitucionManager.inicializar();
            }
// Botón de ayuda - Reporte por Institución (Versión Mejorada)
document.getElementById('help-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const screenWidth = window.innerWidth;
    let modalWidth = '750px';
    
    if (screenWidth <= 768) modalWidth = '95%';
    if (screenWidth <= 480) modalWidth = '98%';
    
    Swal.fire({
        title: '<div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #2c3e50;"><i class="fas fa-university" style="color: #9b59b6; font-size: 1.5rem;"></i><span style="font-size: 1.5rem;">Ayuda - Reporte por Institución</span></div>',
        html: `
            <div style="text-align: center;">
                <div style="background: linear-gradient(135deg, #2c3e50, #9b59b6); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.1rem;">
                        <i class="fas fa-info-circle"></i>
                        Cómo usar el reporte por institución
                    </h4>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin: 25px 0; text-align: left;">
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #9b59b6;">
                        <i class="fas fa-school" style="color: #9b59b6; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Distribución Institucional</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Visualiza la distribución de visitantes por institución educativa. Identifica qué instituciones visitan más tu parque.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #3498db;">
                        <i class="fas fa-chart-bar" style="color: #3498db; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Comparación Estadística</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Compara estadísticas entre diferentes instituciones para identificar tendencias y preferencias.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #e74c3c;">
                        <i class="fas fa-expand" style="color: #e74c3c; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Vista Ampliada</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Haz clic en las gráficas para abrir la vista ampliada con filtros avanzados y más detalles.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #2ecc71;">
                        <i class="fas fa-filter" style="color: #2ecc71; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Filtros Avanzados</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Utiliza los filtros dentro del modal para realizar análisis detallados y específicos.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #f39c12;">
                        <i class="fas fa-download" style="color: #f39c12; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Exportación de Datos</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Descarga reportes en formato PNG o Excel para compartir o analizar externamente.</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f3e5f5; padding: 15px; border-radius: 10px; margin-top: 20px; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <i class="fas fa-star" style="color: #9b59b6; font-size: 1.2rem;"></i>
                        <h5 style="margin: 0; color: #8e44ad;">💡 Nueva Función Destacada</h5>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 15px; padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #9b59b6;">
                        <div style="background: #9b59b6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-sliders-h"></i>
                        </div>
                        <div>
                            <h6 style="margin: 0 0 5px 0; color: #2c3e50;">Filtros Avanzados en Vista Ampliada</h6>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Accede a controles detallados dentro del modal para personalizar completamente tu análisis institucional.</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #2ecc71;"></i>
                            <span style="font-size: 0.85rem; color: #555;">Filtro por tipo de institución</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #2ecc71;"></i>
                            <span style="font-size: 0.85rem; color: #555;">Selección por nivel educativo</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #2ecc71;"></i>
                            <span style="font-size: 0.85rem; color: #555;">Filtro de rango de fechas</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #2ecc71;"></i>
                            <span style="font-size: 0.85rem; color: #555;">Ordenamiento personalizado</span>
                        </div>
                    </div>
                </div>
                
                <div style="background: #e8f4fc; padding: 12px; border-radius: 8px; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-lightbulb" style="color: #3498db;"></i>
                    <p style="margin: 0; color: #2c3e50; font-size: 0.9rem;">
                        <strong>Consejo útil:</strong> Combina el filtro de institución con filtros de fecha para analizar visitas institucionales por temporada escolar.
                    </p>
                </div>
            </div>
        `,
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonColor: '#9b59b6',
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
                    confirmButtonColor: '#2e7d32',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, salir',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'index.html';
                    }
                });
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
                                filtrosDiv.style.display = tipo !== 'institucion' ? 'block' : 'none';
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
