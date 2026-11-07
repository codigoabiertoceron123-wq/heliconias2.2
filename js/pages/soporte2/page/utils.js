// soporte2 - utils
// Refactor modular: lógica original preservada.

// Función para actualizar fecha y hora
      function updateDateTime() {
        const now = new Date();
        const dateTimeString = now.toLocaleString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        const dateTimeElement = document.getElementById("current-date-time");
        if (dateTimeElement) {
          dateTimeElement.textContent = dateTimeString;
        }
      }

// Función para expandir/contraer contenedores
      function toggleExpansion(contenedorId) {
        const contenedor = document.getElementById(contenedorId);
        
        if (contenedorExpandido && contenedorExpandido !== contenedor) {
          contenedorExpandido.classList.remove('expandido');
        }
        
        if (contenedor.classList.contains('expandido')) {
          contenedor.classList.remove('expandido');
          contenedorExpandido = null;
        } else {
          contenedor.classList.add('expandido');
          contenedorExpandido = contenedor;
        }
      }

// Función para mostrar SweetAlert de Gmail
      function mostrarSweetAlertGmail() {
        Swal.fire({
          title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-envelope" style="color: #21773EFF; font-size: 1.5rem;"></i><span>Contactar por Correo</span></div>',
          html: `
            <div style="text-align: center;">
              <div style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <i class="fas fa-paper-plane"></i>
                  ¿Enviar correo a soporte?
                </h4>
              </div>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px solid #e8f5e8; margin-bottom: 20px;">
                <div style="font-size: 1.1rem; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">
                  <i class="fas fa-at" style="color: #2e7d32;"></i>
                  Correo de soporte:
                </div>
                <div style="background: white; padding: 12px; border-radius: 8px; border: 2px dashed #2e7d32; font-size: 1rem; font-weight: 600; color: #2e7d32;">
                  joacoxx2340@gmail.com
                </div>
              </div>
              
              <p style="color: #7f8c8d; margin-bottom: 20px;">
                <i class="fas fa-info-circle" style="color: #3498db;"></i>
                Se abrirá Gmail con los datos prellenados automáticamente.
              </p>
              
              <div style="background: #e8f5e8; padding: 12px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #2e7d32; font-size: 0.9rem;">
                  <i class="fas fa-clock"></i>
                  <strong>Te responderemos en menos de 24 horas</strong>
                </p>
              </div>
            </div>
          `,
          showCloseButton: true,
          showCancelButton: true,
          confirmButtonColor: '#2e7d32',
          cancelButtonColor: '#e74c3c',
          confirmButtonText: '<i class="fab fa-google"></i> Abrir Gmail',
          cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
          width: 500,
          background: '#ffffff',
          customClass: {
            popup: 'gmail-swal-popup',
            title: 'gmail-swal-title',
            htmlContainer: 'gmail-swal-html',
            confirmButton: 'gmail-swal-confirm-btn',
            cancelButton: 'gmail-swal-cancel-btn'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            abrirGmail();
          }
        });
      }

// Función para abrir Gmail directamente
      function abrirGmail() {
        const asunto = `Soporte Técnico - Heliconia Reports`;
        const cuerpo = `Hola equipo de soporte de Heliconia Reports,\n\nNecesito ayuda con el sistema.\n\nPor favor contáctenme lo antes posible.\n\nSaludos,\n[Tu Nombre]`;

        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=joacoxx2340@gmail.com&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`,
          "_blank"
        );
      }

// Función para abrir WhatsApp inteligente
      function abrirWhatsApp() {
        const mensaje = `Hola, necesito ayuda con el sistema Heliconia Reports.\n\nPor favor contáctenme lo antes posible.`;

        const numeroSeguro = "573189427120";
        const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (esMovil) {
          window.open(
            `https://api.whatsapp.com/send?phone=${numeroSeguro}&text=${encodeURIComponent(mensaje)}`,
            "_blank"
          );
        } else {
          window.open(
            `https://web.whatsapp.com/send?phone=${numeroSeguro}&text=${encodeURIComponent(mensaje)}`,
            "_blank"
          );
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
          }
        }).then((result) => {
          if (result.isConfirmed) {
            // Misma pestaña
            window.location.href = url;
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Nueva pestaña
            window.open(url, '_blank');
          }
        });
      }
