// nacionalidad - index
// Refactor modular: lógica original preservada.

// Configurar eventos
        document.addEventListener('DOMContentLoaded', function() {
            updateDateTime();
            setInterval(updateDateTime, 60000);
            
            // Inicializar sistema de nacionalidad
            if (window.NacionalidadManager && window.NacionalidadManager.inicializar) {
                setTimeout(() => {
                    window.NacionalidadManager.inicializar();
                }, 500);
            }

            // Botón de ayuda - Reporte por Nacionalidad (Versión Mejorada)
document.getElementById('help-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const screenWidth = window.innerWidth;
    let modalWidth = '700px';
    
    if (screenWidth <= 768) modalWidth = '95%';
    if (screenWidth <= 480) modalWidth = '98%';
    
    Swal.fire({
        title: '<div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #2c3e50;"><i class="fas fa-globe-americas" style="color: #3498db; font-size: 1.5rem;"></i><span style="font-size: 1.5rem;">Ayuda - Reporte por Nacionalidad</span></div>',
        html: `
            <div style="text-align: center;">
                <div style="background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.1rem;">
                        <i class="fas fa-info-circle"></i>
                        Cómo usar el reporte por nacionalidad
                    </h4>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin: 25px 0; text-align: left;">
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #3498db;">
                        <i class="fas fa-chart-pie" style="color: #3498db; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Visualización de Datos</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Mira la distribución de visitantes por nacionalidad (Colombia vs Otros países) y compara estadísticas entre nacionales e internacionales.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #2ecc71;">
                        <i class="fas fa-mouse-pointer" style="color: #2ecc71; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Interactividad</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Haz clic en las gráficas para ver versión ampliada con filtros avanzados para análisis más detallados.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #e74c3c;">
                        <i class="fas fa-filter" style="color: #e74c3c; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Filtros</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Usa los filtros por fecha para análisis específicos y obtener datos precisos según el periodo que necesites.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #f39c12;">
                        <i class="fas fa-download" style="color: #f39c12; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Exportación</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Descarga reportes en PNG o Excel desde el modal para compartir o guardar tus análisis.</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin-top: 20px; text-align: left;">
                    <h5 style="margin: 0 0 10px 0; color: #2e7d32; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-chart-bar"></i>
                        Datos mostrados:
                    </h5>
                    <p style="margin: 0 0 10px 0; color: #555; font-size: 0.9rem;">
                        <strong>• Colombia vs Otros países:</strong> Con desglose detallado por nacionalidad específica.
                    </p>
                    <p style="margin: 0; color: #555; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-star" style="color: #f39c12;"></i>
                        <strong>Novedad:</strong> Filtros avanzados dentro del modal para análisis detallado.
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
                    confirmButtonColor: '#27ae60',
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
                const modal = document.getElementById('chartModalNacionalidad');
                if (modal && event.target === modal) {
                    window.NacionalidadManager.cerrarModal();
                }
            });
            
            // Manejar tecla ESC para cerrar modal
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    const modal = document.getElementById('chartModalNacionalidad');
                    if (modal && modal.classList.contains('show')) {
                        window.NacionalidadManager.cerrarModal();
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
                                filtrosDiv.style.display = tipo !== 'nacionalidad' ? 'block' : 'none';
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
