// configuracion - index
// Refactor modular: lógica original preservada.

// Event Listeners
document.getElementById('logout-btn').addEventListener('click', function() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Está seguro de que desea salir del sistema?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#27ae60',
        cancelButtonColor: '#e74c3c',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            supabase.auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        }
    });
});

document.getElementById('edit-profile-btn').addEventListener('click', function() {
    toggleEditMode(true);
});

document.getElementById('cancel-edit-btn').addEventListener('click', function() {
    toggleEditMode(false);
});

document.getElementById('save-changes-btn').addEventListener('click', saveChanges);

document.getElementById('login-redirect-btn').addEventListener('click', function() {
    window.location.href = 'index.html';
});

document.getElementById('refresh-session-btn').addEventListener('click', function() {
    document.getElementById('loading-section').style.display = 'flex';
    document.getElementById('login-prompt').style.display = 'none';
    document.getElementById('profile-info').style.display = 'none';
    document.getElementById('no-internet-prompt').style.display = 'none';
    
    setTimeout(() => {
        loadUserProfile();
    }, 1000);
});

// Botón para reintentar cuando no hay internet
document.getElementById('retry-connection-btn').addEventListener('click', function() {
    document.getElementById('loading-section').style.display = 'flex';
    document.getElementById('login-prompt').style.display = 'none';
    document.getElementById('profile-info').style.display = 'none';
    document.getElementById('no-internet-prompt').style.display = 'none';
    
    setTimeout(() => {
        loadUserProfile();
    }, 1000);
});

document.getElementById('help-btn').addEventListener('click', function() {
    Swal.fire({
        title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-cog" style="color: #27ae60; font-size: 1.5rem;"></i><span>Configuración del Perfil - Ayuda</span></div>',
        html: `
            <div style="text-align: left;">
                <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user-cog"></i>
                        Gestión de tu Perfil Personal
                    </h4>
                </div>
                
                <div style="display: grid; gap: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
                        <i class="fas fa-eye" style="color: #3498db; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Visualización de Información</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Puedes ver toda tu información personal, datos de contacto e información institucional en un formato organizado y fácil de leer.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
                        <i class="fas fa-edit" style="color: #27ae60; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Edición de Datos</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Haz clic en "Editar Perfil" para modificar tu información. Todos los campos son editables excepto el Rol del usuario.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f39c12;">
                        <i class="fas fa-venus-mars" style="color: #f39c12; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Campo de Género</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Selecciona tu género desde el menú desplegable con opciones: Hombre, Mujer u Otro.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e74c3c;">
                        <i class="fas fa-calendar-alt" style="color: #e74c3c; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Fecha de Nacimiento</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Utiliza el selector de fecha integrado para elegir tu fecha de nacimiento de forma rápida y precisa.</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #9b59b6;">
                        <i class="fas fa-save" style="color: #9b59b6; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Guardado Seguro</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Todos los cambios se guardan de forma segura en nuestra base de datos después de tu confirmación.</p>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #a29bfe, #74b9ff); padding: 15px; border-radius: 10px; border-left: 4px solid #6c5ce7;">
                    <h5 style="margin: 0 0 8px 0; color: white; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-shield-alt"></i>
                        Validaciones Automáticas
                    </h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <span style="background: rgba(255,255,255,0.9); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-text-height" style="color: #27ae60;"></i>
                            Nombre/Apellido (Mayúscula)
                        </span>
                        <span style="background: rgba(255,255,255,0.9); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-phone" style="color: #3498db;"></i>
                            Teléfono (Solo números)
                        </span>
                        <span style="background: rgba(255,255,255,0.9); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-id-card" style="color: #e74c3c;"></i>
                            Documento (Solo números)
                        </span>
                        <span style="background: rgba(255,255,255,0.9); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-envelope" style="color: #9b59b6;"></i>
                            Email (Formato válido)
                        </span>
                    </div>
                </div>

                <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #856404;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Nota Importante</strong>
                    </div>
                    <p style="margin: 8px 0 0 0; color: #856404; font-size: 0.85rem;">
                        El campo <strong>Rol</strong> no es editable por seguridad del sistema. Para cambios en el rol, contacta al administrador.
                    </p>
                </div>
            </div>
        `,
        showCloseButton: true,
        confirmButtonColor: '#27ae60',
        confirmButtonText: '<i class="fas fa-check-circle"></i> Entendido',
        width: 650,
        background: '#ffffff',
        customClass: {
            popup: 'help-swal-popup',
            title: 'help-swal-title',
            htmlContainer: 'help-swal-html',
            confirmButton: 'help-swal-confirm-btn'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    });
});

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Cargar datos del usuario
    loadUserProfile();
});
