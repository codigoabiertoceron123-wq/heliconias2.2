// index - index
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

// NUEVO: Botón de soporte
      document.getElementById('nav-soporte').addEventListener('click', function(e) {
        e.preventDefault();
        mostrarOpcionesNavegacion('Soporte - Heliconias Reports', 'soporte2.html');
      });

// Botón de ayuda del header con SweetAlert
      document.querySelectorAll('#help-btn').forEach(btn => btn.addEventListener('click', function(e) {
        e.preventDefault();
        Swal.fire({
          title: 'Heliconias Reports - Ayuda',
          html: `
            <div style="text-align: left;">
              <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin: 0;">
                  Bienvenido a Heliconias Reports
                </h4>
              </div>
              
              <p style="margin-bottom: 20px; color: #2c3e50; line-height: 1.6;">
                Nuestra plataforma está diseñada para ofrecerte informes detallados y análisis completos sobre el cultivo y producción de heliconias.
              </p>

              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #27ae60;">
                <h5 style="margin: 0 0 15px 0; color: #2c3e50;">
                  Características principales
                </h5>
                <div style="display: grid; gap: 10px;">
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #27ae60; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Gestión de inventarios de heliconias</span>
                  </div>
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #27ae60; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Seguimiento de producción y cosechas</span>
                  </div>
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #27ae60; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Análisis de rendimiento por variedad</span>
                  </div>
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #27ae60; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Reportes personalizados para toma de decisiones</span>
                  </div>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 15px; border-radius: 10px; border-left: 4px solid #e17055;">
                <h5 style="margin: 0 0 10px 0; color: #2d3436;">
                  ¿Necesitas ayuda?
                </h5>
                
                <p style="margin: 0; color: #2d3436; line-height: 1.5;">
                  También puedes contactar a nuestro equipo de soporte a través de la sección de contacto en la parte superior de la página.
                </p>
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
          },
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
    }));

// Código de login FINAL con Supabase Auth
      document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const correo = document.getElementById('nombre').value;
        const contrasena = document.getElementById('documento').value;
        
        console.log('🔐 INICIANDO SESIÓN CON AUTH:');
        console.log('Correo:', correo);
        console.log('Contraseña:', contrasena);
        
        const loadingAlert = Swal.fire({
          title: '<div style="color: #27ae60; font-size: 22px; font-weight: 600;">INICIANDO SESIÓN</div>',
          html: '<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">Validando tus credenciales, por favor espera...</div>',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
          background: 'white',
          didOpen: () => { Swal.showLoading(); }
        });
        
        try {
          console.log('📡 AUTENTICANDO CON SUPABASE AUTH...');
          
          // ✅ Login simple y directo con Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: correo,
            password: contrasena
          });

          console.log('📊 RESULTADO AUTH:', authData);
          console.log('ERROR AUTH:', authError);

          if (authError) {
            console.log('❌ ERROR EN AUTH:', authError.message);
            throw authError;
          }

          // ✅ LOGIN EXITOSO
          console.log('✅ LOGIN EXITOSO CON AUTH:', authData.user);
          
          // Obtener información adicional de tu tabla usuarios
          const { data: usuarioInfo, error: errorInfo } = await supabase
            .from('usuarios')
            .select('*')
            .eq('correo', correo)
            .single();

          console.log('📋 INFORMACIÓN ADICIONAL:', usuarioInfo);

          // Actualizar último login en tu tabla
          if (usuarioInfo) {
            await supabase
              .from('usuarios')
              .update({ ultimo_login: new Date().toISOString() })
              .eq('id_usuario', usuarioInfo.id_usuario);
          }

          await Swal.close();
          
          // Mostrar mensaje de bienvenida
          await Swal.fire({
            title: '<div style="color: #27ae60; font-size: 24px; font-weight: 600;">¡BIENVENIDO!</div>',
            html: `<div style="color: #2c3e50; font-size: 18px; margin-top: 10px;">
                   Hola <strong>${usuarioInfo ? usuarioInfo.nombre : authData.user.email}</strong>, 
                   has iniciado sesión correctamente.
                   </div>`,
            icon: 'success',
            confirmButtonText: '<i class="fas fa-check-circle"></i> Continuar',
            background: 'white',
            showConfirmButton: true
          });

          // ✅ Redirigir a la página principal
          console.log('🔄 Redirigiendo a principal.html...');
          setTimeout(() => {
            window.location.href = 'principal.html';
          }, 1000);
          
        } catch (error) {
          console.error('❌ ERROR EN LOGIN:', error);
          await Swal.close();
          
          let mensajeError = 'Error al iniciar sesión.';
          
          if (error.message.includes('Invalid login credentials')) {
            mensajeError = 'Correo electrónico o contraseña incorrectos.';
          } else if (error.message.includes('Email not confirmed')) {
            mensajeError = 'Por favor confirma tu correo electrónico antes de iniciar sesión.';
          } else if (error.message.includes('Too many requests')) {
            mensajeError = 'Demasiados intentos fallidos. Por favor espera unos minutos.';
          }
          
          await Swal.fire({
            title: '<div style="color: #e74c3c; font-size: 24px; font-weight: 600;">ERROR</div>',
            html: `<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">${mensajeError}</div>`,
            icon: 'error',
            confirmButtonText: '<i class="fas fa-redo"></i> Intentar de nuevo',
            background: 'white'
          });
        }
      });

document.getElementById("togglePassword").addEventListener("click", function () {
        const input = document.getElementById("documento");

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
