// soporte2 - index
// Refactor modular: lógica original preservada.

// Inicializar fecha y hora
      updateDateTime();

setInterval(updateDateTime, 1000);

// Agregar eventos para expandir al hover
      document.getElementById('contenedor-gmail').addEventListener('mouseenter', function() {
        toggleExpansion('contenedor-gmail');
      });

document.getElementById('contenedor-whatsapp').addEventListener('mouseenter', function() {
        toggleExpansion('contenedor-whatsapp');
      });

// Asignar funciones a los botones principales
      document.getElementById("btnGmail").addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        mostrarSweetAlertGmail();
      });

document.getElementById("btnWhatsapp").addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        abrirWhatsApp();
      });

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

// Botón de ayuda del header
      document.getElementById('help-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        const screenWidth = window.innerWidth;
        let modalWidth = '600px';
        
        if (screenWidth <= 768) modalWidth = '95%';
        if (screenWidth <= 480) modalWidth = '98%';
        
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
                Nuestra plataforma esta disenada para ofrecerte informes detallados y analisis completos sobre el cultivo y produccion de heliconias.
              </p>

              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #27ae60;">
                <h5 style="margin: 0 0 15px 0; color: #2c3e50;">
                  Caracteristicas principales
                </h5>
                <div style="display: grid; gap: 10px;">
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #27ae60; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Gestion de inventarios de heliconias</span>
                  </div>
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #27ae60; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Seguimiento de produccion y cosechas</span>
                  </div>
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #27ae60; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Analisis de rendimiento por variedad</span>
                  </div>
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #27ae60; margin-top: 2px;"></i>
                    <span style="color: #2c3e50;">Reportes personalizados para toma de decisiones</span>
                  </div>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 15px; border-radius: 10px; border-left: 4px solid #e17055;">
                <h5 style="margin: 0 0 10px 0; color: #2d3436;">
                  Necesitas ayuda?
                </h5>
                
                <p style="margin: 0; color: #2d3436; line-height: 1.5;">
                  Tambien puedes contactar a nuestro equipo de soporte a traves de la seccion de contacto en la parte superior de la pagina.
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
      });

sweetAlertStyle.textContent = `
        .gmail-swal-popup, .nav-swal-popup {
          border-radius: 15px;
          border: 2px solid #e8f5e8;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .gmail-swal-title, .nav-swal-title {
          font-size: 1.4rem !important;
          font-weight: 700 !important;
        }
        
        .gmail-swal-html, .nav-swal-html {
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .gmail-swal-confirm-btn, .gmail-swal-cancel-btn,
        .nav-swal-confirm-btn, .nav-swal-cancel-btn {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          font-weight: 600 !important;
          padding: 12px 30px !important;
          border-radius: 8px !important;
        }
      `;

document.head.appendChild(sweetAlertStyle);

// Cerrar expansión al hacer clic fuera
      document.addEventListener('click', function(e) {
        if (contenedorExpandido && !contenedorExpandido.contains(e.target)) {
          contenedorExpandido.classList.remove('expandido');
          contenedorExpandido = null;
        }
      });
