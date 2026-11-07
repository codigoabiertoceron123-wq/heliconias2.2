// index - utils
// Refactor modular: lógica original preservada.

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

// Función para crear/sincronizar todos los usuarios en Supabase Auth
      async function crearUsuariosEnAuth() {
        const loadingAlert = Swal.fire({
          title: '<div style="color: #3498db; font-size: 22px; font-weight: 600;">CREANDO USUARIOS</div>',
          html: '<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">Sincronizando usuarios con el sistema de autenticación...</div>',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
          background: 'white',
          didOpen: () => { Swal.showLoading(); }
        });

        try {
          console.log('📋 OBteniendo usuarios de la tabla...');
          
          // Obtener todos los usuarios de tu tabla
          const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('*');
          
          if (error) throw error;
          
          console.log(`📊 Encontrados ${usuarios.length} usuarios`);
          
          let usuariosCreados = 0;
          let usuariosExistentes = 0;
          let errores = 0;
          
          for (const usuario of usuarios) {
            if (usuario.correo && usuario.contrasena) {
              console.log(`🛠️ Procesando: ${usuario.correo}`);
              
              try {
                const { data, error } = await supabase.auth.signUp({
                  email: usuario.correo,
                  password: usuario.contrasena,
                  options: {
                    data: {
                      nombre: usuario.nombre,
                      id_usuario: usuario.id_usuario,
                      documento: usuario.documento
                    }
                  }
                });
                
                if (error) {
                  if (error.message.includes('already registered')) {
                    console.log(`✅ ${usuario.correo} - Ya existe en Auth`);
                    usuariosExistentes++;
                  } else {
                    console.log(`❌ ${usuario.correo} - Error:`, error.message);
                    errores++;
                  }
                } else {
                  console.log(`✅ ${usuario.correo} - Creado exitosamente`);
                  usuariosCreados++;
                }
              } catch (userError) {
                console.log(`⚠️ ${usuario.correo} - Error:`, userError.message);
                errores++;
              }
              
              // Esperar entre registros
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
          
          await Swal.close();
          
          // Mostrar resumen
          await Swal.fire({
            title: '<div style="color: #27ae60; font-size: 24px; font-weight: 600;">PROCESO COMPLETADO</div>',
            html: `
              <div style="text-align: left; color: #2c3e50; font-size: 14px;">
                <strong>Resumen de la sincronización:</strong><br><br>
                <div style="background: #e8f6f3; padding: 10px; border-radius: 5px;">
                  <strong>✅ Usuarios creados:</strong> ${usuariosCreados}<br>
                  <strong>🔵 Usuarios existentes:</strong> ${usuariosExistentes}<br>
                  <strong>❌ Errores:</strong> ${errores}<br>
                  <strong>📊 Total procesados:</strong> ${usuarios.length}
                </div>
                <br>
                <small>Ahora puedes usar el login con Supabase Auth</small>
              </div>
            `,
            icon: 'success',
            confirmButtonText: '<i class="fas fa-check"></i> Entendido',
            background: 'white',
            width: '500px'
          });
          
          console.log(`🎉 Proceso completado: ${usuariosCreados} creados, ${usuariosExistentes} existentes, ${errores} errores`);
          
        } catch (error) {
          await Swal.close();
          console.error('❌ Error general:', error);
          await Swal.fire({
            title: '<div style="color: #e74c3c; font-size: 24px; font-weight: 600;">ERROR</div>',
            html: `<div style="color: #2c3e50; font-size: 16px; margin-top: 10px;">Error: ${error.message}</div>`,
            icon: 'error',
            confirmButtonText: '<i class="fas fa-check"></i> Entendido',
            background: 'white'
          });
        }
      }
