// configuracion - utils
// Refactor modular: lógica original preservada.

// Función para verificar si hay conexión a internet
function checkInternetConnection() {
    return navigator.onLine;
}

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

// Función para capitalizar nombres (primera letra mayúscula, resto minúscula)
function capitalizeName(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Función para validar solo números
function validateNumbersOnly(input) {
    return /^\d+$/.test(input);
}

// Función para validar teléfono (solo números, mínimo 7 dígitos)
function validatePhone(phone) {
    return /^\d{7,15}$/.test(phone);
}

// Función para validar documento (solo números, mínimo 5 dígitos)
function validateDocument(document) {
    return /^\d{5,20}$/.test(document);
}

// Función para cargar géneros desde la tabla
async function loadGeneros() {
    try {
        console.log('🚻 Cargando géneros...');
        
        const { data: generos, error } = await supabase
            .from('genero')
            .select('id_genero, genero')
            .order('id_genero');
            
        if (error) {
            console.error('❌ Error al cargar géneros:', error);
            return [];
        }
        
        console.log('✅ Géneros cargados:', generos);
        return generos || [];
        
    } catch (error) {
        console.error('❌ Error al cargar géneros:', error);
        return [];
    }
}

// Función para cargar instituciones
async function loadInstituciones() {
    try {
        console.log('🏫 Cargando instituciones...');
        
        const { data: instituciones, error } = await supabase
            .from('instituciones')
            .select('id_institucion, nombre_institucion')
            .order('nombre_institucion');
            
        if (error) {
            console.error('❌ Error al cargar instituciones:', error);
            return [];
        }
        
        console.log('✅ Instituciones cargadas:', instituciones);
        return instituciones || [];
        
    } catch (error) {
        console.error('❌ Error al cargar instituciones:', error);
        return [];
    }
}

// Función para llenar el select de géneros
function populateGenerosSelect(generos, selectedId = null) {
    const selectElement = document.getElementById('edit-genero');
    
    if (!selectElement) {
        console.error('❌ No se encontró el elemento edit-genero');
        return;
    }
    
    // Limpiar opciones existentes
    selectElement.innerHTML = '<option value="">Seleccionar género</option>';
    
    // Agregar opciones
    generos.forEach(genero => {
        const option = document.createElement('option');
        option.value = genero.id_genero;
        option.textContent = genero.genero;
        
        // Seleccionar el género actual del usuario
        if (selectedId && genero.id_genero === selectedId) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
    
    console.log('✅ Select de géneros actualizado');
}

// Función para llenar el select de instituciones
function populateInstitucionesSelect(instituciones, selectedId = null) {
    const selectElement = document.getElementById('edit-institucion');
    
    if (!selectElement) {
        console.error('❌ No se encontró el elemento edit-institucion');
        return;
    }
    
    // Limpiar opciones existentes
    selectElement.innerHTML = '<option value="">Seleccionar institución</option>';
    
    // Agregar opciones
    instituciones.forEach(institucion => {
        const option = document.createElement('option');
        option.value = institucion.id_institucion;
        option.textContent = institucion.nombre_institucion;
        
        // Seleccionar la institución actual del usuario
        if (selectedId && institucion.id_institucion === selectedId) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
    
    console.log('✅ Select de instituciones actualizado');
}

// Función para cargar datos relacionados por separado
async function loadRelatedDataSeparately() {
    try {
        console.log('🔄 Cargando datos relacionados por separado...');
        
        // Cargar género
        if (currentUserData.id_genero) {
            const { data: generoData, error: generoError } = await supabase
                .from('genero')
                .select('id_genero, genero')
                .eq('id_genero', currentUserData.id_genero)
                .single();
                
            if (!generoError && generoData) {
                currentUserData.genero = generoData;
            }
        }
        
        // Cargar institución
        if (currentUserData.id_instituciones) {
            const { data: institucionData, error: institucionError } = await supabase
                .from('instituciones')
                .select('id_institucion, nombre_institucion')
                .eq('id_institucion', currentUserData.id_instituciones)
                .single();
                
            if (!institucionError && institucionData) {
                currentUserData.instituciones = institucionData;
            }
        }
        
        // Cargar rol
        if (currentUserData.id_rol) {
            const { data: rolData, error: rolError } = await supabase
                .from('roles')
                .select('*')
                .eq('id_rol', currentUserData.id_rol)
                .single();
                
            if (!rolError && rolData) {
                currentUserData.roles = rolData;
            }
        }
        
        console.log('✅ Datos relacionados cargados:', {
            genero: currentUserData.genero,
            instituciones: currentUserData.instituciones,
            roles: currentUserData.roles
        });
        
    } catch (error) {
        console.error('❌ Error al cargar datos relacionados:', error);
    }
}

// Función para guardar cambios
async function saveChanges() {
    try {
        const confirmResult = await Swal.fire({
            title: '¿Guardar cambios?',
            text: '¿Está seguro de que desea guardar los cambios realizados?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#27ae60',
            cancelButtonColor: '#e74c3c',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        // Recoger datos del formulario con validaciones
        const nombre = capitalizeName(document.getElementById('edit-nombre').value.trim());
        const apellido = capitalizeName(document.getElementById('edit-apellido').value.trim());
        const correo = document.getElementById('edit-correo').value.trim();
        const documento = document.getElementById('edit-documento').value.trim();
        const telefono = document.getElementById('edit-telefono').value.trim();
        const fecha_nacimiento = document.getElementById('edit-fecha-nacimiento').value;
        const id_genero = document.getElementById('edit-genero').value || null;
        const id_instituciones = document.getElementById('edit-institucion').value || null;

        // Validaciones
        if (!nombre || !apellido || !correo) {
            throw new Error('Los campos nombre, apellido y correo son obligatorios');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            throw new Error('El formato del correo electrónico no es válido');
        }

        // Validar teléfono (solo números, 7-15 dígitos)
        if (telefono && !validatePhone(telefono)) {
            throw new Error('El teléfono debe contener solo números (7-15 dígitos)');
        }

        // Validar documento (solo números, 5-20 dígitos)
        if (documento && !validateDocument(documento)) {
            throw new Error('El documento debe contener solo números (5-20 dígitos)');
        }

        const updatedData = {
            nombre,
            apellido,
            correo,
            documento,
            telefono,
            fecha_nacimiento,
            id_genero,
            id_instituciones
        };

        console.log('📤 Datos a actualizar:', updatedData);
        console.log('🆔 ID del usuario:', currentUserData.id_usuario);

        // Mostrar indicador de carga
        Swal.fire({
            title: 'Guardando cambios...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Actualizar en Supabase
        const { data, error } = await supabase
            .from('usuarios')
            .update(updatedData)
            .eq('id_usuario', currentUserData.id_usuario)
            .select();

        console.log('📥 Respuesta de Supabase:', { data, error });

        if (error) {
            throw error;
        }

        // Cerrar el loader
        Swal.close();

        // Actualizar datos locales
        if (data && data[0]) {
            currentUserData = { ...currentUserData, ...data[0] };
            // Recargar datos relacionados
            await loadRelatedDataSeparately();
        }
        
        // Salir del modo edición
        toggleEditMode(false);
        
        // Actualizar la interfaz
        updateProfileDisplay();

        await Swal.fire({
            title: '¡Éxito!',
            text: 'Los cambios se han guardado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });

    } catch (error) {
        console.error('💥 Error completo al guardar cambios:', error);
        
        // Cerrar el loader si está abierto
        Swal.close();
        
        let errorMessage = 'No se pudieron guardar los cambios. Intente nuevamente.';
        
        if (error.message.includes('obligatorios') || 
            error.message.includes('formato del correo') ||
            error.message.includes('teléfono') ||
            error.message.includes('documento')) {
            errorMessage = error.message;
        } else if (error.message.includes('network') || !navigator.onLine) {
            errorMessage = 'Error de conexión. Verifique su internet e intente nuevamente.';
        } else if (error.message.includes('duplicate') || error.message.includes('unique') || error.code === '23505') {
            errorMessage = 'El correo electrónico ya está en uso por otro usuario.';
        }
        
        await Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

// Función para cargar perfil de usuario
async function loadUserProfile() {
    try {
        if (!checkInternetConnection()) {
            throw new Error('NO_INTERNET');
        }

        console.log('🚀 Iniciando carga de perfil...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            throw sessionError;
        }

        if (!session || !session.user) {
            throw new Error('NO_SESSION');
        }

        const authUser = session.user;
        console.log('✅ Usuario autenticado con Supabase Auth:', authUser);

        // Consulta SIMPLE sin JOINS complejos
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('correo', authUser.email)
            .single();

        if (userError) {
            throw userError;
        }

        if (!userData) {
            throw new Error('No se encontraron datos del usuario en la base de datos');
        }

        console.log('📊 Datos básicos del usuario:', userData);
        
        // Guardar datos actuales
        currentUserData = userData;
        
        // Cargar datos relacionados por separado
        await loadRelatedDataSeparately();
        
        // Actualizar la interfaz
        updateProfileDisplay();

        // Ocultar spinner y mostrar información
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('profile-info').style.display = 'block';
        document.getElementById('login-prompt').style.display = 'none';
        document.getElementById('no-internet-prompt').style.display = 'none';
        
    } catch (error) {
        console.error('❌ Error al cargar el perfil:', error);
        
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('profile-info').style.display = 'none';
        
        if (error.message === 'NO_INTERNET') {
            document.getElementById('no-internet-prompt').style.display = 'block';
        } else if (error.message === 'NO_SESSION') {
            document.getElementById('login-prompt').style.display = 'block';
        } else {
            document.getElementById('no-internet-prompt').style.display = 'block';
        }
    }
}

// Actualizar la función updateProfileDisplay
function updateProfileDisplay() {
    if (!currentUserData) return;

    document.getElementById('profile-name').textContent = 
        `${currentUserData.nombre || ''} ${currentUserData.apellido || ''}`.trim() || 'Usuario';
    
    // Mostrar rol desde la relación
    const rolNombre = currentUserData.roles?.nombre_rol || getRoleName(currentUserData.id_rol);
    document.getElementById('profile-role').textContent = rolNombre;
    
    // Información personal
    document.getElementById('info-nombre').textContent = currentUserData.nombre || 'No especificado';
    document.getElementById('info-apellido').textContent = currentUserData.apellido || 'No especificado';
    document.getElementById('info-correo').textContent = currentUserData.correo || 'No especificado';
    document.getElementById('info-documento').textContent = currentUserData.documento || 'No especificado';
    document.getElementById('info-telefono').textContent = currentUserData.telefono || 'No especificado';
    
    // Mostrar género desde la relación
    const generoNombre = currentUserData.genero?.genero || 'No especificado';
    document.getElementById('info-genero').textContent = generoNombre;
    
    // Mostrar institución desde la relación
    const institucionNombre = currentUserData.instituciones?.nombre_institucion || 'No especificado';
    document.getElementById('info-institucion').textContent = institucionNombre;
    
    document.getElementById('info-fecha-nacimiento').textContent = 
        currentUserData.fecha_nacimiento ? new Date(currentUserData.fecha_nacimiento).toLocaleDateString('es-ES') : 'No especificado';
    
    // Información de acceso
    document.getElementById('info-id-usuario').textContent = currentUserData.id_usuario || 'No especificado';
    document.getElementById('info-rol').textContent = rolNombre;
    document.getElementById('info-fecha-creacion').textContent = 
        currentUserData.fecha_creacion ? new Date(currentUserData.fecha_creacion).toLocaleDateString('es-ES') : 'No especificado';
    document.getElementById('info-ultimo-login').textContent = 
        currentUserData.ultimo_login ? new Date(currentUserData.ultimo_login).toLocaleDateString('es-ES') : 'No especificado';
}

// Actualizar toggleEditMode para incluir género e institución
async function toggleEditMode(editing) {
    isEditing = editing;
    
    if (editing) {
        // Cargar géneros e instituciones cuando se active el modo edición
        const [generos, instituciones] = await Promise.all([
            loadGeneros(),
            loadInstituciones()
        ]);
        
        const generoActualId = currentUserData.id_genero;
        const institucionActualId = currentUserData.id_instituciones;
        
        populateGenerosSelect(generos, generoActualId);
        populateInstitucionesSelect(instituciones, institucionActualId);

        // Agregar event listeners para validación en tiempo real
        setupRealTimeValidation();
    }
    
    // Campos editables directos
    const editableFields = ['nombre', 'apellido', 'correo', 'documento', 'telefono', 'fecha-nacimiento'];
    
    editableFields.forEach(field => {
        const displayElement = document.getElementById(`info-${field}`);
        const inputElement = document.getElementById(`edit-${field}`);
        
        if (displayElement && inputElement) {
            displayElement.style.display = editing ? 'none' : 'block';
            inputElement.style.display = editing ? 'block' : 'none';
            
            if (editing) {
                // Para fecha-nacimiento, necesitamos formatear la fecha
                if (field === 'fecha-nacimiento') {
                    const fecha = currentUserData.fecha_nacimiento;
                    inputElement.value = fecha ? new Date(fecha).toISOString().split('T')[0] : '';
                } else {
                    const fieldName = field.replace('-', '_');
                    inputElement.value = currentUserData[fieldName] || '';
                }
            }
        }
    });
    
    // Manejar género (campo de relación)
    const generoDisplay = document.getElementById('info-genero');
    const generoSelect = document.getElementById('edit-genero');
    
    if (generoDisplay && generoSelect) {
        generoDisplay.style.display = editing ? 'none' : 'block';
        generoSelect.style.display = editing ? 'block' : 'none';
    }
    
    // Manejar institución (campo de relación)
    const institucionDisplay = document.getElementById('info-institucion');
    const institucionSelect = document.getElementById('edit-institucion');
    
    if (institucionDisplay && institucionSelect) {
        institucionDisplay.style.display = editing ? 'none' : 'block';
        institucionSelect.style.display = editing ? 'block' : 'none';
    }
    
    // El rol siempre se muestra como información
    document.getElementById('info-rol').style.display = 'block';
    
    // Mostrar/ocultar botones
    document.getElementById('edit-profile-btn').style.display = editing ? 'none' : 'inline-flex';
    document.getElementById('cancel-edit-btn').style.display = editing ? 'inline-flex' : 'none';
    document.getElementById('save-changes-btn').style.display = editing ? 'inline-flex' : 'none';
}

// Función para configurar validación en tiempo real
function setupRealTimeValidation() {
    // Validar teléfono (solo números)
    const telefonoInput = document.getElementById('edit-telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            // Remover caracteres no numéricos
            e.target.value = e.target.value.replace(/[^\d]/g, '');
        });
    }

    // Validar documento (solo números)
    const documentoInput = document.getElementById('edit-documento');
    if (documentoInput) {
        documentoInput.addEventListener('input', function(e) {
            // Remover caracteres no numéricos
            e.target.value = e.target.value.replace(/[^\d]/g, '');
        });
    }

    // Capitalizar automáticamente nombre y apellido
    const nombreInput = document.getElementById('edit-nombre');
    if (nombreInput) {
        nombreInput.addEventListener('blur', function(e) {
            e.target.value = capitalizeName(e.target.value);
        });
    }

    const apellidoInput = document.getElementById('edit-apellido');
    if (apellidoInput) {
        apellidoInput.addEventListener('blur', function(e) {
            e.target.value = capitalizeName(e.target.value);
        });
    }
}

// Función auxiliar para obtener el nombre del rol
function getRoleName(roleId) {
    const roles = {
        1: 'Administrador de Eventos',
        2: 'Administrador del Sistema'
    };
    return roles[roleId] || 'Usuario';
}
