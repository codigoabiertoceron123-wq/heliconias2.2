// genero - index
// Refactor modular: lógica original preservada.

// Botón de ayuda - Estadísticas por Género
document.getElementById('help-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const screenWidth = window.innerWidth;
    let modalWidth = '700px';
    
    if (screenWidth <= 768) modalWidth = '95%';
    if (screenWidth <= 480) modalWidth = '98%';
    
    Swal.fire({
        title: '<div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #2c3e50;"><i class="fas fa-venus-mars" style="color: #e91e63; font-size: 1.5rem;"></i><span style="font-size: 1.5rem;">Ayuda - Estadísticas por Género</span></div>',
        html: `
            <div style="text-align: center;">
                <div style="background: linear-gradient(135deg, #9c27b0, #e91e63); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.1rem;">
                        <i class="fas fa-info-circle"></i>
                        Cómo usar las estadísticas por género
                    </h4>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin: 25px 0; text-align: left;">
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #9c27b0;">
                        <i class="fas fa-chart-pie" style="color: #9c27b0; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Visualización de Datos</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Observa la distribución de visitantes según su género. La gráfica muestra porcentajes y cantidades de cada categoría.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #e91e63;">
                        <i class="fas fa-expand" style="color: #e91e63; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Vista Ampliada</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Haz clic en cualquier gráfica para abrir la vista ampliada con tabla de datos detallada y opciones de exportación.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #2196f3;">
                        <i class="fas fa-download" style="color: #2196f3; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Exportar Datos</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Desde la vista ampliada, descarga la gráfica como imagen PNG o los datos como archivo Excel para análisis externos.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #4caf50;">
                        <i class="fas fa-filter" style="color: #4caf50; font-size: 1.3rem; margin-top: 2px;"></i>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Tarjetas Estadísticas</h5>
                            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Revisa las tarjetas superiores para ver el total de visitantes, distribución porcentual y cantidad de géneros registrados.</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f3e5f5; padding: 15px; border-radius: 10px; margin-top: 20px; text-align: left;">
                    <h5 style="margin: 0 0 10px 0; color: #9c27b0; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-lightbulb"></i>
                        Tips importantes:
                    </h5>
                    <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 0.9rem;">
                        <li><strong>Actualización automática:</strong> Los datos se actualizan periódicamente</li>
                        <li><strong>Precisión:</strong> Solo se incluyen visitantes con género registrado</li>
                        <li><strong>Tabla detallada:</strong> En la vista ampliada verás todos los datos</li>
                        <li><strong>Responsive:</strong> Las gráficas se adaptan a cualquier dispositivo</li>
                    </ul>
                </div>
                
                <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fas fa-headset" style="color: #2196f3;"></i>
                    <p style="margin: 0; color: #2e7d32; font-size: 0.9rem;">
                        <strong>¿Necesitas más ayuda?</strong> Visita la sección de <a href="soporte.html" style="color: #2196f3; text-decoration: underline;">Soporte</a> para contactar a nuestro equipo
                    </p>
                </div>
            </div>
        `,
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonColor: '#9c27b0',
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
