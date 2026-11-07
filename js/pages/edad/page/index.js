// edad - index
// Refactor modular: lógica original preservada.

// Configurar eventos de ayuda y salir
        document.addEventListener('DOMContentLoaded', function() {
            updateDateTime();
            setInterval(updateDateTime, 60000);
            
            // Inicializar sistema de edad con manejo de errores mejorado
            try {
                console.log('🚀 Inicializando sistema de edad...');
                
                // Esperar un poco para asegurar que todo esté cargado
                setTimeout(() => {
                    if (window.EdadSystem && window.EdadSystem.cargarDatos) {
                        console.log('✅ Sistema EdadSystem disponible, cargando datos...');
                        window.EdadSystem.cargarDatos();
                    } else {
                        console.error('❌ window.EdadSystem no está disponible');
                        mostrarErrorInicial('El sistema de estadísticas no se cargó correctamente');
                    }
                }, 100);
            } catch (error) {
                console.error('❌ Error al inicializar:', error);
                mostrarErrorInicial('Error al cargar el sistema: ' + error.message);
            }

            // Botón de ayuda - Reporte por Edad (Versión Mejorada)
document.getElementById('help-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const screenWidth = window.innerWidth;
    let modalWidth = '750px';
    
    if (screenWidth <= 768) modalWidth = '95%';
    if (screenWidth <= 480) modalWidth = '98%';
    
    Swal.fire({
        title: '<div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #2c3e50;"><i class="fas fa-chart-bar" style="color: #4CAF50; font-size: 1.5rem;"></i><span style="font-size: 1.5rem;">Ayuda - Reporte por Edad</span></div>',
        html: `
            <div style="text-align: center;">
                <div style="background: linear-gradient(135deg, #2c3e50, #4CAF50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.1rem;">
                        <i class="fas fa-info-circle"></i>
                        Cómo usar el reporte por edad
                    </h4>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin: 25px 0; text-align: left;">
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #2196F3;">
                        <i class="fas fa-filter" style="color: #2196F3; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Selección de Reporte</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Elije entre diferentes tipos de análisis: Por Edad, Fecha específica, Mes o Año completo.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #4CAF50;">
                        <i class="fas fa-chart-pie" style="color: #4CAF50; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Visualización de Datos</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Observa la distribución de visitantes por grupos de edad y compara estadísticas como edad promedio y rangos.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #FF9800;">
                        <i class="fas fa-expand" style="color: #FF9800; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Vista Ampliada</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Haz clic en cualquier gráfica para abrir la vista ampliada con más detalles y opciones de exportación.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #9C27B0;">
                        <i class="fas fa-download" style="color: #9C27B0; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Exportación de Datos</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Descarga los reportes en formato PNG (imagen) o Excel para análisis externos y presentaciones.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #F44336;">
                        <i class="fas fa-sliders-h" style="color: #F44336; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Filtros Avanzados</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Utiliza los filtros combinados para realizar análisis específicos según tus necesidades.</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #E8F5E9; padding: 15px; border-radius: 10px; margin-top: 20px; text-align: left;">
                    <h5 style="margin: 0 0 10px 0; color: #2E7D32; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-calculator"></i>
                        Cálculo de Edades:
                    </h5>
                    <p style="margin: 0; color: #555; font-size: 0.9rem;">
                        <strong>⚙️ Automático:</strong> Las edades se calculan automáticamente desde las fechas de nacimiento registradas en el sistema.
                    </p>
                    <p style="margin: 10px 0 0 0; color: #555; font-size: 0.9rem;">
                        <strong>📊 Precisión:</strong> Los datos se agrupan por rangos predefinidos para un análisis más claro y organizado.
                    </p>
                </div>
                
                <div style="background: #FFF3E0; padding: 12px; border-radius: 8px; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-lightbulb" style="color: #FF9800;"></i>
                    <p style="margin: 0; color: #E65100; font-size: 0.9rem;">
                        <strong>💡 Tip:</strong> Combina filtros de fecha con grupos de edad para obtener insights más específicos sobre tu audiencia.
                    </p>
                </div>
            </div>
        `,
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonColor: '#4CAF50',
        confirmButtonText: '<i class="fas fa-check-circle"></i> ¡Entendido!',
        width: modalWidth,
        padding: '2rem',
        background: '#ffffff',
        customClass: {
            popup: 'animated-popup'
        }
    });
});
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
        });

// Agregar listeners para depuración
    document.addEventListener('click', function(e) {
        if (e.target.closest('.chart-card')) {
            const card = e.target.closest('.chart-card');
            console.log('🖱️ Clic en chart-card:', card);
        }
    });

// Redefinir onclick para debugging
    setTimeout(function() {
        const cards = document.querySelectorAll('.chart-card');
        cards.forEach(card => {
            const originalOnclick = card.getAttribute('onclick');
            card.setAttribute('data-original-onclick', originalOnclick);
            
            card.addEventListener('click', function(e) {
                console.log('🎯 Clic capturado en chart-card');
                console.log('Onclick original:', originalOnclick);
                
                if (originalOnclick) {
                    try {
                        eval(originalOnclick);
                    } catch (err) {
                        console.error('❌ Error ejecutando onclick:', err);
                    }
                }
            });
        });
    }, 1000);
