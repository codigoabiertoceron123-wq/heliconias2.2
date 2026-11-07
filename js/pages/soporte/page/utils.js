// soporte - utils
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

// Función para mostrar vista previa de imágenes
function mostrarVistaPrevia(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    // Crear elemento de vista previa
    let vistaPrevia = document.getElementById('vista-previa');
    if (!vistaPrevia) {
      vistaPrevia = document.createElement('div');
      vistaPrevia.id = 'vista-previa';
      vistaPrevia.style.cssText = `
        margin-top: 15px;
        text-align: center;
      `;
      areaArchivo.appendChild(vistaPrevia);
    }

    vistaPrevia.innerHTML = `
      <div style="display: inline-block; position: relative;">
        <img src="${e.target.result}" alt="Vista previa" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 2px solid #e8f5e8;">
        <button type="button" id="eliminar-vista-previa" style="position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 12px;">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Agregar evento para eliminar vista previa
    document.getElementById('eliminar-vista-previa').addEventListener('click', function() {
      vistaPrevia.remove();
      document.getElementById('archivo').value = '';
      archivoSeleccionado = null;
      if (infoArchivo) {
        infoArchivo.innerHTML = `
          <p><small>Formatos permitidos: JPG, PNG, PDF, DOC, XLSX, TXT (Máx. 10MB)</small></p>
        `;
      }
    });
  };
  reader.readAsDataURL(file);
}

// Función para subir archivo a Supabase Storage (VERSIÓN CORREGIDA)
async function subirArchivo(file, idSoporte) {
  try {
    console.log('📤 Subiendo archivo...', file.name);
    
    // Crear nombre único para el archivo
    const extension = file.name.split('.').pop();
    const nombreArchivo = `soporte_${idSoporte}_${Date.now()}.${extension}`;

    console.log('📁 Subiendo archivo como:', nombreArchivo);

    // Subir archivo al bucket 'soportes'
    const { data, error } = await supabase.storage
      .from('soportes')
      .upload(nombreArchivo, file);

    if (error) throw error;

    console.log('✅ Archivo subido exitosamente:', data);

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('soportes')
      .getPublicUrl(nombreArchivo);

    return {
      nombre_original: file.name,
      nombre_archivo: nombreArchivo,
      url_publica: urlData.publicUrl,
      tipo: file.type,
      tamaño: file.size
    };

  } catch (error) {
    console.error('❌ Error subiendo archivo:', error);
    throw new Error('No se pudo subir el archivo: ' + error.message);
  }
}

// Función mejorada para obtener el ID del usuario
async function obtenerUsuarioId() {
  try {
    console.log('🔍 Intentando obtener usuario autenticado...');
    
    // Opción 1: Verificar autenticación de Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.warn('Error en auth:', authError);
    }
    
    if (user && user.email) {
      console.log('👤 Usuario de Supabase Auth encontrado:', user.email);
      
      // Buscar en tabla usuarios usando CORREO (no email)
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('correo', user.email)
        .single();
      
      if (userError) {
        console.warn('Usuario no encontrado en tabla usuarios:', userError);
        console.warn('⚠️ Usando ID por defecto para desarrollo');
        return 1;
      }
      
      console.log('✅ Usuario encontrado en BD:', usuario.id_usuario);
      return usuario.id_usuario;
    }
    
    // Opción 2: Verificar localStorage/sessionStorage
    const usuarioGuardado = localStorage.getItem('usuario_id') || sessionStorage.getItem('usuario_id');
    if (usuarioGuardado) {
      console.log('📁 Usuario de storage:', usuarioGuardado);
      return parseInt(usuarioGuardado);
    }
    
    // Opción 3: Valor por defecto (para desarrollo)
    console.warn('⚠️ Usando ID por defecto para desarrollo');
    return 1;
    
  } catch (error) {
    console.error('❌ Error crítico obteniendo usuario:', error);
    return 1; // Valor por defecto para evitar bloqueos
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
            <i class="fas fa-question-circle"></i>
            ¿Enviar correo a soporte?
          </h4>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px solid #e8f5e8; margin-bottom: 20px;">
          <div style="font-size: 1.1rem; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">
            <i class="fas fa-at" style="color: #2e7d32;"></i>
            Correo de soporte:
          </div>
          <div class="correo-display" style="background: white; padding: 12px; border-radius: 8px; border: 2px dashed #2e7d32; font-size: 1rem; font-weight: 600; color: #2e7d32;">
            joacoxx2340@gmail.com
          </div>
        </div>
        
        <p style="color: #7f8c8d; margin-bottom: 20px;">
          <i class="fas fa-info-circle" style="color: #3498db;"></i>
          Se abrirá Gmail con los datos de tu reporte prellenados automáticamente.
        </p>
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
  const nombre = document.getElementById("nombre").value || "Usuario";
  const tipoProblema = document.getElementById("tipo").value;
  const descripcionTexto = document.getElementById("descripcion").value || "Por favor describa su problema aquí...";

  const asunto = `Problema con el Sistema Heliconias - ${tipoProblema}`;
  const cuerpo = `Hola equipo de soporte de Heliconias,\n\nMi nombre es ${nombre}.\n\nTengo el siguiente problema:\n${descripcionTexto}\n\nPor favor contáctenme lo antes posible.\n\nSaludos,\n${nombre}`;

  // Abrir Gmail directamente
  window.open(
    `https://mail.google.com/mail/?view=cm&fs=1&to=joacoxx2340@gmail.com&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`,
    "_blank",
  );
}

// Función para abrir WhatsApp inteligente (app o web)
function abrirWhatsApp() {
  const nombre = document.getElementById("nombre").value || "Usuario";
  const tipoProblema = document.getElementById("tipo").value;
  const descripcionTexto = document.getElementById("descripcion").value || "Tengo un problema con el sistema";

  const mensaje = `Hola, soy ${nombre}. Tengo un problema con Heliconias:\n\n*Tipo de problema:* ${tipoProblema}\n*Descripción:* ${descripcionTexto}\n\nPor favor contáctenme lo antes posible.`;

  // Número completamente oculto y seguro
  const numeroSeguro = "573189427120";

  // Detectar si es dispositivo móvil
  const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (esMovil) {
    // Abrir aplicación de WhatsApp en móviles
    window.open(
      `https://api.whatsapp.com/send?phone=${numeroSeguro}&text=${encodeURIComponent(mensaje)}`,
      "_blank",
    );
  } else {
    // Abrir WhatsApp Web en desktop
    window.open(
      `https://web.whatsapp.com/send?phone=${numeroSeguro}&text=${encodeURIComponent(mensaje)}`,
      "_blank",
    );
  }
}
