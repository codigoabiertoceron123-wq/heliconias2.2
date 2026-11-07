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
          title: '<div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #2c3e50;"><i class="fas fa-life-ring" style="color: #3498db; font-size: 1.5rem;"></i><span style="font-size: 1.5rem;">Centro de Ayuda</span></div>',
          html: `
            <div style="text-align: center;">
              <div style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.1rem;">
                  <i class="fas fa-hand-point-up"></i>
                  Contacta nuestro soporte técnico
                </h4>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 20px; margin: 25px 0;">
                <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #ea4335;">
                  <i class="fab fa-google" style="color: #ea4335; font-size: 1.5rem; margin-top: 2px;"></i>
                  <div style="text-align: left;">
                    <h5 style="margin: 0 0 8px 0; color: #2c3e50;">Gmail</h5>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Pasa el mouse sobre el botón rojo para ver la información</p>
                  </div>
                </div>
                
                <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #25d366;">
                  <i class="fab fa-whatsapp" style="color: #25d366; font-size: 1.5rem; margin-top: 2px;"></i>
                  <div style="text-align: left;">
                    <h5 style="margin: 0 0 8px 0; color: #2c3e50;">WhatsApp</h5>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">Pasa el mouse sobre el botón verde para ver la información</p>
                  </div>
                </div>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <p style="margin: 0; color: #2e7d32; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <i class="fas fa-clock"></i>
                  <strong>Respuesta rápida: Menos de 24 horas hábiles</strong>
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
