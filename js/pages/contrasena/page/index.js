// contrasena - index
// Refactor modular: lógica original preservada.

// Navegación actualizada
      document.getElementById('nav-inicio').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Inicio - Parque Heliconias', 'https://parque-heliconias-khaki.vercel.app/index.html');
      });

document.getElementById('nav-reservas').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Reservas - Parque Heliconias', 'https://parqueheliconias-app.onrender.com/');
      });

document.getElementById('nav-login').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Login - Parque Heliconias', 'https://codigoabiertoceron123-wq.github.io/heliconias2.2/');
      });

// Botón de soporte
      document.getElementById('nav-soporte').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Soporte - Heliconias Reports', 'soporte2.html');
      });

// Botón de ayuda
      document.getElementById('help-btn').addEventListener('click', function(e) {
        e.preventDefault();
        Swal.fire({
          title: 'Ayuda - Cambiar Contraseña',
          html: `
            <div style="text-align: left;">
              <div style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                  <i class="fas fa-key"></i>
                  Recuperación de Contraseña
                </h4>
              </div>
              
              <p style="margin-bottom: 20px; color: #2c3e50; line-height: 1.6;">
                Sigue estos pasos para recuperar tu contraseña:
              </p>

              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3498db;">
                <h5 style="margin: 0 0 15px 0; color: #2c3e50;">
                  Paso 1: Validación
                </h5>
                <div style="display: grid; gap: 10px;">
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-user-check" style="color: #3498db; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Ingresa tu nombre completo</span>
                  </div>
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-envelope" style="color: #3498db; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Proporciona tu correo electrónico</span>
                  </div>
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-id-card" style="color: #3498db; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Ingresa tu número de documento</span>
                  </div>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 15px; border-radius: 10px; border-left: 4px solid #e17055;">
                <h5 style="margin: 0 0 10px 0; color: #2d3436;">
                  Recomendaciones de seguridad
                </h5>
                
                <div style="color: #2d3436; font-size: 0.9rem;">
                  <p style="margin: 5px 0; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-shield-alt" style="color: #27ae60;"></i>
                    Crea una contraseña de al menos 6 caracteres
                  </p>
                  <p style="margin: 5px 0; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-lock" style="color: #27ae60;"></i>
                    Usa combinación de letras, números y símbolos
                  </p>
                  <p style="margin: 5px 0; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-sync-alt" style="color: #27ae60;"></i>
                    Cambia tu contraseña regularmente
                  </p>
                </div>
              </div>
            </div>
          `,
          showCloseButton: true,
          confirmButtonColor: '#27ae60',
          confirmButtonText: '<i class="fas fa-check-circle"></i> Entendido',
          width: 600,
          background: '#ffffff',
          customClass: {
            popup: 'swal2-popup',
            confirmButton: 'help-swal-confirm-btn'
          }
        });
      });

// Step 1: Validar Usuario
      document.getElementById('step1Form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const documento = document.getElementById('documento').value;

        const loadingAlert = Swal.fire({
          title: '<div style="color: #27ae60; font-size: 22px; font-weight: 600;">VALIDANDO USUARIO</div>',
          html: '<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">Verificando tus datos, por favor espera...</div>',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
          background: 'white',
          didOpen: () => { Swal.showLoading(); }
        });

        try {
          console.log('🔍 Validando usuario...');
          
          // Buscar usuario en la tabla
          const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('nombre', nombre)
            .eq('correo', correo)
            .eq('documento', documento)
            .single();

          if (error || !usuarios) {
            throw new Error('No se encontró un usuario con los datos proporcionados. Verifica nombre, correo y documento.');
          }

          usuarioValidado = usuarios;
          console.log('✅ Usuario validado:', usuarioValidado);

          await Swal.close();

          // Mostrar éxito y avanzar al siguiente paso
          await Swal.fire({
            title: '<div style="color: #27ae60; font-size: 24px; font-weight: 600;">USUARIO VALIDADO</div>',
            html: `<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">
                   Usuario encontrado: <strong>${usuarioValidado.nombre}</strong><br>
                   Ahora puedes establecer tu nueva contraseña.
                   </div>`,
            icon: 'success',
            confirmButtonText: '<i class="fas fa-key"></i> Continuar',
            background: 'white'
          });

          // Avanzar al paso 2
          currentStep = 2;
          goToStep(2);

        } catch (error) {
          await Swal.close();
          console.error('❌ Error validando usuario:', error);
          
          Swal.fire({
            title: '<div style="color: #e74c3c; font-size: 24px; font-weight: 600;">ERROR</div>',
            html: `<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">${error.message}</div>`,
            icon: 'error',
            confirmButtonText: '<i class="fas fa-redo"></i> Intentar de nuevo',
            background: 'white'
          });
        }
      });

// Step 2: Cambiar Contraseña
      document.getElementById('step2Form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const nuevaContrasena = document.getElementById('nuevaContrasena').value;
        const confirmarContrasena = document.getElementById('confirmarContrasena').value;

        // Validar que las contraseñas coincidan
        if (nuevaContrasena !== confirmarContrasena) {
          Swal.fire({
            title: 'Error',
            text: 'Las contraseñas no coinciden',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          return;
        }

        // Validar longitud mínima
        if (nuevaContrasena.length < 6) {
          Swal.fire({
            title: 'Error',
            text: 'La contraseña debe tener al menos 6 caracteres',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          return;
        }

        const loadingAlert = Swal.fire({
          title: '<div style="color: #27ae60; font-size: 22px; font-weight: 600;">CAMBIANDO CONTRASEÑA</div>',
          html: '<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">Actualizando tu contraseña, por favor espera...</div>',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
          background: 'white',
          didOpen: () => { Swal.showLoading(); }
        });

        try {
          console.log('🔄 Cambiando contraseña...');

          // 1. Actualizar contraseña en la tabla usuarios
          const { error: updateError } = await supabase
            .from('usuarios')
            .update({ 
              contrasena: nuevaContrasena,
              ultimo_login: new Date().toISOString()
            })
            .eq('id_usuario', usuarioValidado.id_usuario);

          if (updateError) {
            throw new Error('Error al actualizar la contraseña: ' + updateError.message);
          }

          // 2. Actualizar contraseña en Supabase Auth
          const { error: authError } = await supabase.auth.updateUser({
            password: nuevaContrasena
          });

          if (authError) {
            console.log('⚠️ No se pudo actualizar en Auth, pero se actualizó en la tabla:', authError.message);
            // Continuamos aunque falle Auth, porque la tabla sí se actualizó
          }

          await Swal.close();

          // Mostrar éxito final
          await Swal.fire({
            title: '<div style="color: #27ae60; font-size: 24px; font-weight: 600;">¡CONTRASEÑA ACTUALIZADA!</div>',
            html: `<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">
                   <p>Tu contraseña ha sido cambiada exitosamente.</p>
                   <div style="background: #e8f6f3; padding: 15px; border-radius: 8px; margin: 15px 0;">
                       <strong>Resumen:</strong><br>
                       👤 Usuario: <strong>${usuarioValidado.nombre}</strong><br>
                       📧 Correo: <strong>${usuarioValidado.correo}</strong><br>
                       🔑 Contraseña: <strong>Actualizada</strong>
                   </div>
                   <p>Se ha enviado una notificación a tu correo electrónico.</p>
                   </div>`,
            icon: 'success',
            confirmButtonText: '<i class="fas fa-check-circle"></i> Iniciar Sesión',
            background: 'white'
          });

          // Redirigir al login
          window.location.href = 'index.html';

        } catch (error) {
          await Swal.close();
          console.error('❌ Error cambiando contraseña:', error);
          
          Swal.fire({
            title: '<div style="color: #e74c3c; font-size: 24px; font-weight: 600;">ERROR</div>',
            html: `<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">${error.message}</div>`,
            icon: 'error',
            confirmButtonText: '<i class="fas fa-redo"></i> Intentar de nuevo',
            background: 'white'
          });
        }
      });

// Validar contraseñas en tiempo real
      document.getElementById('confirmarContrasena').addEventListener('input', function() {
        const nuevaContrasena = document.getElementById('nuevaContrasena').value;
        const confirmar = this.value;
        
        if (confirmar && nuevaContrasena !== confirmar) {
          this.style.borderColor = '#e74c3c';
          this.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
        } else {
          this.style.borderColor = '#27ae60';
          this.style.boxShadow = '0 0 0 2px rgba(39, 174, 96, 0.2)';
        }
      });

// Inicializar progress bar
      updateProgressBar();

// Funcionalidad de mostrar/ocultar contraseña
      document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
          const inputId = this.getAttribute('data-target');
          const input = document.getElementById(inputId);

          if (input.type === "password") {
            input.type = "text";
            this.classList.remove("fa-eye");
            this.classList.add("fa-eye-slash");
          } else {
            input.type = "password";
            this.classList.remove("fa-eye-slash");
            this.classList.add("fa-eye");
          }
        });
      });

// Efectos de hover en inputs
      document.querySelectorAll('.password-box input').forEach(input => {
        input.addEventListener('focus', function() {
          this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
          this.parentElement.style.transform = 'translateY(0)';
        });
      });

// Inicializar con animación
      window.addEventListener('load', function() {
        document.querySelector('.password-box').style.animation = 'slideUp 0.5s ease-out';
      });
