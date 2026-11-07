// contrasena - utils
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

// Actualizar progress bar
      function updateProgressBar() {
        const progress = ((currentStep - 1) / 2) * 100;
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = progress + '%';
        
        // Actualizar steps
        document.getElementById('step1').className = `step ${currentStep >= 1 ? 'active' : ''}`;
        document.getElementById('step2').className = `step ${currentStep >= 2 ? 'active' : ''}`;
        document.getElementById('step3').className = `step ${currentStep >= 3 ? 'completed' : ''}`;
      }

// Cambiar step
      function goToStep(step) {
        currentStep = step;
        updateProgressBar();
        
        // Ocultar todos los forms
        document.querySelectorAll('.form-step').forEach(form => {
          form.classList.remove('active');
        });
        
        // Mostrar el form actual con animación
        setTimeout(() => {
          if (step === 1) {
            document.getElementById('step1Form').classList.add('active');
          } else if (step === 2) {
            document.getElementById('step2Form').classList.add('active');
          }
        }, 200);
      }

// Resetear formulario
      function resetForm() {
        usuarioValidado = null;
        currentStep = 1;
        updateProgressBar();
        goToStep(1);
        document.getElementById('step1Form').reset();
        document.getElementById('step2Form').reset();
      }
