// registrarce - utils
// Refactor modular: lógica original preservada.

// Función para mostrar/ocultar contraseña
    function setupPasswordToggle() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

// Función para mostrar SweetAlert de ayuda con el nuevo estilo
    function setupHelpButton() {
        document.querySelectorAll('#help-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                Swal.fire({
                    title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-life-ring" style="color: #3498db; font-size: 1.5rem;"></i><span>Centro de Ayuda - Registro</span></div>',
                    html: `
                        <div style="text-align: left;">
                            <div style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                                <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-info-circle"></i>
                                    Información sobre el proceso de registro
                                </h4>
                            </div>
                            
                            <div style="display: grid; gap: 15px; margin-bottom: 20px;">
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
                                    <i class="fas fa-user-plus" style="color: #3498db; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Paso 1: Información personal</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Completa tus datos personales (nombre, apellido, documento)</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
                                    <i class="fas fa-envelope" style="color: #27ae60; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Paso 2: Correo electrónico</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Ingresa un correo válido para confirmar tu cuenta</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f39c12;">
                                    <i class="fas fa-lock" style="color: #f39c12; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Paso 3: Contraseña segura</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Crea una contraseña de al menos 6 caracteres</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e74c3c;">
                                    <i class="fas fa-check-double" style="color: #e74c3c; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Paso 4: Confirmar contraseña</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Repite tu contraseña para verificar que coincida</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #9b59b6;">
                                    <i class="fas fa-mail-bulk" style="color: #9b59b6; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Paso 5: Confirmación por correo</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Revisa tu correo y confirma tu cuenta para activarla</p>
                                    </div>
                                </div>
                            </div>

                            <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 15px; border-radius: 10px; border-left: 4px solid #e17055; margin-bottom: 15px;">
                                <h5 style="margin: 0 0 8px 0; color: #2d3436; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-shield-alt"></i>
                                    Seguridad de tu información
                                </h5>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                    <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-key" style="color: #3498db;"></i>
                                        Encriptación SSL
                                    </span>
                                    <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-user-shield" style="color: #27ae60;"></i>
                                        Privacidad garantizada
                                    </span>
                                    <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-database" style="color: #f39c12;"></i>
                                        Base de datos segura
                                    </span>
                                </div>
                            </div>

                            <div style="background: linear-gradient(135deg, #a29bfe, #6c5ce7); padding: 15px; border-radius: 10px; border-left: 4px solid #5f27cd;">
                                <h5 style="margin: 0 0 8px 0; color: white; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-graduation-cap"></i>
                                    Beneficios de registrarte
                                </h5>
                                <div style="color: white; font-size: 0.9rem;">
                                    <p style="margin: 5px 0; display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-check-circle" style="font-size: 0.8rem;"></i>
                                        Acceso completo al sistema Heliconias Reports
                                    </p>
                                    <p style="margin: 5px 0; display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-check-circle" style="font-size: 0.8rem;"></i>
                                        Gestión de reportes y seguimiento
                                    </p>
                                    <p style="margin: 5px 0; display: flex; align-items: center; gap: 5px;">
                                        <i class="fas fa-check-circle" style="font-size: 0.8rem;"></i>
                                        Soporte técnico prioritario
                                    </p>
                                </div>
                            </div>
                        </div>
                    `,
                    showCloseButton: true,
                    confirmButtonColor: '#2e7d32',
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
    }

// Función para manejar el registro (mantener igual que antes)
    async function manejarRegistro(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const documento = document.getElementById('documento').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const id_genero = document.getElementById('id_genero').value;
        const id_instituciones = document.getElementById('id_instituciones').value;
        const fechaNacimiento = document.getElementById('fecha_nacimiento').value;
        const contrasena = document.getElementById('contrasena').value;
        const confirmarContrasena = document.getElementById('confirmar_contrasena').value;

        // Validaciones básicas
        if (!nombre || !apellido || !correo || !documento || !contrasena || !confirmarContrasena || !id_genero) {
            Swal.fire({
                title: 'Campos requeridos',
                text: 'Por favor completa todos los campos obligatorios',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        if (contrasena !== confirmarContrasena) {
            Swal.fire({
                title: 'Error',
                text: 'Las contraseñas no coinciden',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        if (contrasena.length < 6) {
            Swal.fire({
                title: 'Error',
                text: 'La contraseña debe tener al menos 6 caracteres',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const loadingAlert = Swal.fire({
            title: 'Creando cuenta...',
            text: 'Por favor espera mientras creamos tu cuenta',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            // Verificar si el correo o documento ya existen
            console.log('🔍 Verificando si el usuario ya existe...');
            
            const { data: usuariosExistentes, error: checkError } = await supabase
                .from('usuarios')
                .select('correo, documento')
                .or(`correo.eq.${correo},documento.eq.${documento}`);

            if (checkError) {
                console.error('Error al verificar usuario:', checkError);
            }

            if (usuariosExistentes && usuariosExistentes.length > 0) {
                const existeCorreo = usuariosExistentes.some(u => u.correo === correo);
                const existeDocumento = usuariosExistentes.some(u => u.documento === documento);
                
                if (existeCorreo) {
                    throw new Error('Este correo electrónico ya está registrado');
                } else if (existeDocumento) {
                    throw new Error('Este documento ya está registrado en el sistema');
                }
            }

            // Crear usuario en Supabase Auth
            console.log('🛠️ Creando usuario en Auth...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: correo,
                password: contrasena,
                options: {
                    data: {
                        nombre: nombre,
                        apellido: apellido,
                        documento: documento
                    },
                    emailRedirectTo: window.location.origin + '/index.html'
                }
            });

            if (authError) {
                console.log('❌ Error en Auth:', authError);
                
                if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
                    throw new Error('Este correo electrónico ya está registrado en el sistema de autenticación');
                } else if (authError.message.includes('invalid email')) {
                    throw new Error('El correo electrónico no es válido');
                } else if (authError.message.includes('password')) {
                    throw new Error('La contraseña no cumple con los requisitos de seguridad');
                } else {
                    throw new Error('Error al crear la cuenta: ' + authError.message);
                }
            }

            // Insertar usuario en la tabla usuarios
            console.log('💾 Insertando en tabla usuarios...');
            const userData = {
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                documento: documento,
                contrasena: contrasena,
                telefono: telefono || null,
                id_genero: id_genero ? parseInt(id_genero) : null,
                id_instituciones: id_instituciones ? parseInt(id_instituciones) : null,
                fecha_nacimiento: fechaNacimiento || null,
                id_rol: 2,
                email_confirmado: false,
                usuario_activo: true,
                fecha_registro: new Date().toISOString(),
                ultima_actualizacion: new Date().toISOString()
            };

            if (authData && authData.user) {
                userData.auth_id = authData.user.id;
            }

            const { data: dbData, error: userError } = await supabase
                .from('usuarios')
                .insert([userData])
                .select();

            if (userError) {
                console.log('❌ Error en tabla usuarios:', userError);
                
                if (userError.code === '23505') {
                    if (userError.message.includes('correo')) {
                        throw new Error('Este correo electrónico ya está registrado');
                    } else if (userError.message.includes('documento')) {
                        throw new Error('Este documento ya está registrado');
                    } else if (userError.message.includes('auth_id')) {
                        throw new Error('Error de autenticación: ID duplicado');
                    }
                }
                
                throw new Error('Error al guardar los datos: ' + userError.message);
            }

            await loadingAlert.close();

            // Mostrar mensaje de éxito
            if (authData.user && !authData.user.email_confirmed_at) {
                await Swal.fire({
                    title: '¡Cuenta creada! 📧',
                    html: `
                        <div style="text-align: left;">
                            <p>Tu cuenta ha sido creada exitosamente.</p>
                            <div style="background: #e8f6f3; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <strong>¡Confirmación requerida!</strong><br><br>
                                📨 Hemos enviado un enlace de activación a:<br>
                                <strong>${correo}</strong><br><br>
                                <strong>Por favor:</strong>
                                <ul style="text-align: left; margin: 10px 0;">
                                    <li>Revisa tu bandeja de entrada</li>
                                    <li>Busca en la carpeta de SPAM</li>
                                    <li>Haz clic en "Confirmar mi email"</li>
                                    <li>Serás redirigido para iniciar sesión</li>
                                </ul>
                            </div>
                            <p><small>¿No recibiste el correo? <a href="#" onclick="reenviarConfirmacion('${correo}')">Reenviar confirmación</a></small></p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Entendido'
                });
            } else {
                await Swal.fire({
                    title: '¡Cuenta creada!',
                    text: 'Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.',
                    icon: 'success',
                    confirmButtonText: 'Iniciar Sesión'
                }).then(() => {
                    window.location.href = 'index.html';
                });
                return;
            }

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 5000);

        } catch (error) {
            await loadingAlert.close();
            console.error('❌ Error completo:', error);
            
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    }

// Función para mostrar SweetAlert de navegación
    function mostrarOpcionesNavegacion(titulo, url) {
        Swal.fire({
            title: `<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-external-link-alt" style="color: #2e7d32; font-size: 1.5rem;"></i><span style="font-size: 1.5rem;">${titulo}</span></div>`,
            html: `
                <div style="text-align: center;">
                    <div style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fas fa-route"></i>
                            ¿Cómo quieres abrir esta página?
                        </h4>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 15px; margin: 20px 0;">
                        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #3498db;">
                            <i class="fas fa-window-maximize" style="color: #3498db; font-size: 1.5rem;"></i>
                            <div style="text-align: left;">
                                <h5 style="margin: 0 0 5px 0; color: #2c3e50;">Misma pestaña</h5>
                                <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Reemplaza la página actual</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #9b59b6;">
                            <i class="fas fa-plus-square" style="color: #9b59b6; font-size: 1.5rem;"></i>
                            <div style="text-align: left;">
                                <h5 style="margin: 0 0 5px 0; color: #2c3e50;">Nueva pestaña</h5>
                                <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Abre en una pestaña nueva</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonColor: '#3498db',
            cancelButtonColor: '#9b59b6',
            confirmButtonText: '<i class="fas fa-window-maximize"></i> Misma pestaña',
            cancelButtonText: '<i class="fas fa-plus-square"></i> Nueva pestaña',
            width: 500,
            background: '#ffffff',
            customClass: {
                popup: 'nav-swal-popup',
                title: 'nav-swal-title',
                htmlContainer: 'nav-swal-html',
                confirmButton: 'nav-swal-confirm-btn',
                cancelButton: 'nav-swal-cancel-btn'
            },
            buttonsStyling: false,
            showClass: {
                popup: 'animate__animated animate__fadeInUp'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = url;
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.open(url, '_blank');
            }
        });
    }
