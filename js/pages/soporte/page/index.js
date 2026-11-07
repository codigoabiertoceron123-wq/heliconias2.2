// soporte - index
// Refactor modular: lógica original preservada.

// Inicializar fecha y hora
updateDateTime();

setInterval(updateDateTime, 1000);

if (descripcion && contador) {
  descripcion.addEventListener("input", function () {
    contador.textContent = this.value.length;
  });
}

// Manejar la selección de archivos
document.getElementById('archivo').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                           'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                           'text/plain'];
    
    if (!tiposPermitidos.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo de archivo no válido',
        text: 'Solo se permiten imágenes, PDF, documentos de Word, Excel y archivos de texto.',
        confirmButtonColor: '#e74c3c'
      });
      this.value = '';
      return;
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'El archivo no puede ser mayor a 10MB.',
        confirmButtonColor: '#e74c3c'
      });
      this.value = '';
      return;
    }

    archivoSeleccionado = file;
    
    // Mostrar información del archivo
    if (infoArchivo) {
      const tamanoMB = (file.size / (1024 * 1024)).toFixed(2);
      infoArchivo.innerHTML = `
        <p><i class="fas fa-file"></i> <strong>${file.name}</strong></p>
        <p><i class="fas fa-weight-hanging"></i> ${tamanoMB} MB</p>
        <p><i class="fas fa-check-circle" style="color: #27ae60;"></i> Archivo listo para subir</p>
      `;
    }

    // Si es una imagen, mostrar vista previa
    if (file.type.startsWith('image/')) {
      mostrarVistaPrevia(file);
    }
  }
});

// En la parte del formulario donde manejas el archivo (VERSIÓN CORREGIDA)
if (archivoSeleccionado) {
  try {
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo archivo...';
    
    // Llamar a la función async correctamente
    infoArchivoSubido = subirArchivo(archivoSeleccionado, idSoporte);
    
    // Actualizar el reporte con SOLO la columna que existe
    const { error: updateError } = supabase
      .from('soporte')
      .update({
        archivo: infoArchivoSubido.nombre_archivo  // Solo esta columna existe
      })
      .eq('id_soporte', idSoporte);

    if (updateError) {
      console.warn('⚠️ No se pudo actualizar la información del archivo:', updateError);
    } else {
      console.log('✅ Información de archivo actualizada en la BD');
    }

  } catch (error) {
    console.warn('⚠️ Error subiendo archivo, pero el reporte se guardó:', error);
    
    // Mostrar mensaje informativo al usuario
    Swal.fire({
      icon: 'warning',
      title: 'Archivo no subido',
      html: `
        <div style="text-align: center;">
          <p>El reporte se guardó correctamente, pero el archivo no pudo subirse.</p>
          <p style="color: #7f8c8d; font-size: 0.9rem;">
            <strong>Razón:</strong> ${error.message}
          </p>
        </div>
      `,
      confirmButtonColor: '#f39c12',
      confirmButtonText: 'Entendido'
    });
  }
}

// FORMULARIO DE SOPORTE - VERSIÓN CON SUBIDA DE ARCHIVOS
document.getElementById("formSoporte").addEventListener("submit", async function (e) {
  e.preventDefault();
  
  const boton = this.querySelector(".btn-reporte");
  const botonOriginalHTML = boton.innerHTML;
  boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  boton.disabled = true;
  boton.classList.add("loading");

  try {
    // Obtener datos del formulario
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const tipo = document.getElementById("tipo").value;
    const descripcionTexto = document.getElementById("descripcion").value.trim();
    const prioridad = document.querySelector('input[name="prioridad"]:checked').value;

    // Validaciones básicas
    if (!nombre || !email || !descripcionTexto) {
      throw new Error('Por favor completa todos los campos obligatorios');
    }

    if (!email.includes('@')) {
      throw new Error('Por favor ingresa un email válido');
    }

    // Obtener ID de usuario
    const usuarioId = await obtenerUsuarioId();
    console.log('👤 ID de usuario a usar:', usuarioId);

    // Preparar descripción
    const descripcionCompleta = `📧 EMAIL: ${email}\n👤 NOMBRE: ${nombre}\n\n📝 DESCRIPCIÓN:\n${descripcionTexto}`;

    // DATOS PARA INSERTAR - USANDO LOS NOMBRES CORRECTOS DE COLUMNAS
    const insertData = {
      id_usuario: usuarioId,
      tipo: tipo,
      descripcion: descripcionCompleta,
      prioridad: prioridad,
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString(),
      email: email
    };

    console.log('📤 Enviando datos del reporte...');

    // Insertar reporte en Supabase
    const { data: reporteData, error: reporteError } = await supabase
      .from('soporte')
      .insert([insertData])
      .select();

    if (reporteError) {
      console.error('❌ Error de Supabase:', reporteError);
      
      // Manejar error de foreign key específicamente
      if (reporteError.message.includes('foreign key') || reporteError.code === '23503') {
        throw new Error('Error de usuario no válido. Por favor contacta al administrador.');
      }
      
      throw reporteError;
    }

    const idSoporte = reporteData[0].id_soporte;
    console.log('✅ Reporte insertado exitosamente. ID:', idSoporte);

    let infoArchivoSubido = null;

    // Subir archivo si hay uno seleccionado
    if (archivoSeleccionado) {
      try {
        boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo archivo...';
        
        infoArchivoSubido = await subirArchivo(archivoSeleccionado, idSoporte);
        
        // Actualizar el reporte con la información del archivo
        const { error: updateError } = await supabase
          .from('soporte')
          .update({
            archivo: infoArchivoSubido.nombre_archivo,
            ruta_archivo: infoArchivoSubido.ruta,
            url_archivo: infoArchivoSubido.url_publica
          })
          .eq('id_soporte', idSoporte);

        if (updateError) {
          console.warn('⚠️ No se pudo actualizar la información del archivo:', updateError);
        }

        console.log('✅ Información de archivo actualizada');

      } catch (error) {
        console.warn('⚠️ Error subiendo archivo, pero el reporte se guardó:', error);
        // No lanzar error aquí para que el reporte se guarde aunque falle la subida del archivo
      }
    }

    // Mostrar mensaje de éxito
    let mensajeExito = `
      <div style="text-align: center;">
        <div style="font-size: 3rem; color: #27ae60; margin-bottom: 15px;">
          <i class="fas fa-check-circle"></i>
        </div>
        <p style="margin-bottom: 10px; font-size: 1.1rem; font-weight: 600;">
          Tu solicitud ha sido registrada exitosamente.
        </p>
        <p style="color: #7f8c8d; font-size: 0.9rem;">
          Número de ticket: <strong>#${idSoporte}</strong>
        </p>
    `;

    if (infoArchivoSubido) {
      mensajeExito += `
        <p style="color: #2e7d32; font-size: 0.8rem; margin-top: 10px;">
          <i class="fas fa-paperclip"></i> Archivo adjunto: ${infoArchivoSubido.nombre_original}
        </p>
      `;
    }

    mensajeExito += `
        <p style="color: #2e7d32; font-size: 0.8rem; margin-top: 10px;">
          <i class="fas fa-envelope"></i> Te contactaremos a: ${email}
        </p>
      </div>
    `;

    await Swal.fire({
      icon: 'success',
      title: '¡Reporte Enviado!',
      html: mensajeExito,
      confirmButtonColor: '#2e7d32',
      confirmButtonText: 'Aceptar',
      width: 450
    });

    // Resetear formulario
    this.reset();
    archivoSeleccionado = null;
    if (contador) contador.textContent = "0";
    
    // Limpiar vista previa e info de archivo
    const vistaPrevia = document.getElementById('vista-previa');
    if (vistaPrevia) vistaPrevia.remove();
    
    if (infoArchivo) {
      infoArchivo.innerHTML = `
        <p><small>Formatos permitidos: JPG, PNG, PDF, DOC, XLSX, TXT (Máx. 10MB)</small></p>
      `;
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    
    let mensajeError = 'No se pudo enviar el reporte. ';
    
    if (error.message.includes('foreign key')) {
      mensajeError += 'Error de configuración de usuario.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      mensajeError += 'Error de conexión. Verifica tu internet.';
    } else if (error.message.includes('JWT')) {
      mensajeError += 'Error de autenticación. Por favor, inicia sesión nuevamente.';
    } else {
      mensajeError += error.message;
    }

    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensajeError,
      confirmButtonColor: '#e74c3c'
    });
  } finally {
    // Restaurar botón
    boton.innerHTML = botonOriginalHTML;
    boton.disabled = false;
    boton.classList.remove("loading");
  }
});

// Asignar la función al botón de Gmail
document.getElementById("btnGmail").addEventListener("click", function (e) {
  e.preventDefault();
  mostrarSweetAlertGmail();
});

// Asignar la función al botón de WhatsApp
document.getElementById("btnWhatsapp").addEventListener("click", function (e) {
  e.preventDefault();
  abrirWhatsApp();
});

// Botón de ayuda del header con SweetAlert
document.getElementById('help-btn').addEventListener('click', function(e) {
  e.preventDefault();
  Swal.fire({
    title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-life-ring" style="color: #3498db; font-size: 1.5rem;"></i><span>Centro de Ayuda - Soporte</span></div>',
    html: `
      <div style="text-align: left;">
        <div style="background: linear-gradient(135deg, #3498db, #2c3e50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-info-circle"></i>
            Estamos aquí para ayudarte
          </h4>
        </div>
        
        <div style="display: grid; gap: 15px; margin-bottom: 20px;">
          <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
            <i class="fas fa-list-ol" style="color: #3498db; font-size: 1.2rem; margin-top: 2px;"></i>
            <div>
              <strong style="color: #2c3e50;">Paso 1:</strong>
              <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Completa el formulario de soporte con todos los detalles de tu problema</p>
            </div>
          </div>
          
          <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
            <i class="fas fa-flag" style="color: #27ae60; font-size: 1.2rem; margin-top: 2px;"></i>
            <div>
              <strong style="color: #2c3e50;">Paso 2:</strong>
              <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Selecciona la prioridad adecuada para tu reporte</p>
            </div>
          </div>
          
          <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f39c12;">
            <i class="fas fa-paperclip" style="color: #f39c12; font-size: 1.2rem; margin-top: 2px;"></i>
            <div>
              <strong style="color: #2c3e50;">Paso 3:</strong>
              <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Adjunta archivos relevantes (capturas, documentos, etc.)</p>
            </div>
          </div>
          
          <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e74c3c;">
            <i class="fas fa-paper-plane" style="color: #e74c3c; font-size: 1.2rem; margin-top: 2px;"></i>
            <div>
              <strong style="color: #2c3e50;">Paso 4:</strong>
              <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Envía el formulario y recibe confirmación inmediata</p>
            </div>
          </div>
          
          <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #9b59b6;">
            <i class="fas fa-clock" style="color: #9b59b6; font-size: 1.2rem; margin-top: 2px;"></i>
            <div>
              <strong style="color: #2c3e50;">Paso 5:</strong>
              <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Te contactaremos en un plazo máximo de 24 horas</p>
            </div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 15px; border-radius: 10px; border-left: 4px solid #e17055;">
          <h5 style="margin: 0 0 8px 0; color: #2d3436; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-graduation-cap"></i>
            Canales de Contacto
          </h5>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
              <i class="fab fa-google" style="color: #ea4335;"></i>
              Gmail
            </span>
            <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
              <i class="fab fa-whatsapp" style="color: #25d366;"></i>
              WhatsApp
            </span>
          </div>
        </div>
      </div>
    `,
    showCloseButton: true,
    confirmButtonColor: '#3498db',
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

// Botón de salir
document.getElementById("logout-btn").addEventListener("click", function() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Quieres cerrar sesión?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#27ae60',
    cancelButtonColor: '#e74c3c',
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Mostrar mensaje de "Saliendo..."
      Swal.fire({
        title: 'Saliendo...',
        text: "Cerrando sesión",
        icon: 'info',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading()
        }
      }).then(() => {
        // Redirigir a index.html después de mostrar el mensaje
        window.location.href = 'index.html';
      });
    }
  });
});

sweetAlertStyle.textContent = `
  .gmail-swal-popup, .help-swal-popup {
    border-radius: 15px;
    border: 2px solid #e8f5e8;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
  
  .gmail-swal-title, .help-swal-title {
    font-size: 1.4rem !important;
    font-weight: 700 !important;
  }
  
  .gmail-swal-html, .help-swal-html {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .gmail-swal-confirm-btn, .help-swal-confirm-btn {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-weight: 600 !important;
    padding: 12px 30px !important;
    border-radius: 8px !important;
  }
  
  .gmail-swal-cancel-btn {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-weight: 600 !important;
    padding: 12px 30px !important;
    border-radius: 8px !important;
  }
  
  .swal2-close {
    color: #7f8c8d !important;
    font-size: 1.5rem !important;
    transition: color 0.3s ease !important;
  }
  
  .swal2-close:hover {
    color: #e74c3c !important;
  }
`;

document.head.appendChild(sweetAlertStyle);
