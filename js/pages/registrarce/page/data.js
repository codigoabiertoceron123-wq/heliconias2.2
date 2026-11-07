// registrarce - data
// Refactor modular: lógica original preservada.

// Función para cargar los géneros desde la base de datos
    async function cargarGeneros() {
        try {
            console.log('🔄 Cargando géneros...');
            
            const { data, error } = await supabase
                .from('genero')
                .select('*')
                .order('id_genero');

            if (error) {
                console.error('❌ Error al cargar géneros:', error);
                const selectGenero = document.getElementById('id_genero');
                if (selectGenero) {
                    selectGenero.innerHTML = '<option value="" disabled selected>Error al cargar géneros</option>';
                }
                return;
            }

            console.log('✅ Géneros cargados:', data);

            const selectGenero = document.getElementById('id_genero');
            if (!selectGenero) {
                console.error('❌ No se encontró el select con id "id_genero"');
                return;
            }
            
            selectGenero.innerHTML = '<option value="" disabled selected>Selecciona tu género</option>';
            
            data.forEach(genero => {
                const option = document.createElement('option');
                option.value = genero.id_genero;
                option.textContent = genero.genero;
                selectGenero.appendChild(option);
            });
            
        } catch (err) {
            console.error('❌ Error inesperado al cargar géneros:', err);
            const selectGenero = document.getElementById('id_genero');
            if (selectGenero) {
                selectGenero.innerHTML = '<option value="" disabled selected>Error al cargar géneros</option>';
            }
        }
    }

// Función para cargar las instituciones desde la base de datos
    async function cargarInstituciones() {
        try {
            console.log('🔄 Cargando instituciones...');
            
            const { data, error } = await supabase
                .from('instituciones')
                .select('id_institucion, nombre_institucion')
                .order('nombre_institucion');

            if (error) {
                console.error('❌ Error al cargar instituciones:', error);
                const selectInstitucion = document.getElementById('id_instituciones');
                if (selectInstitucion) {
                    selectInstitucion.innerHTML = '<option value="" selected>Error al cargar instituciones</option>';
                }
                return;
            }

            console.log('✅ Instituciones cargadas:', data);

            const selectInstitucion = document.getElementById('id_instituciones');
            if (!selectInstitucion) {
                console.error('❌ No se encontró el select con id "id_instituciones"');
                return;
            }
            
            selectInstitucion.innerHTML = '<option value="" selected>Selecciona una institución (opcional)</option>';
            
            data.forEach(institucion => {
                const option = document.createElement('option');
                option.value = institucion.id_institucion;
                option.textContent = institucion.nombre_institucion;
                selectInstitucion.appendChild(option);
            });
            
        } catch (err) {
            console.error('❌ Error inesperado al cargar instituciones:', err);
            const selectInstitucion = document.getElementById('id_instituciones');
            if (selectInstitucion) {
                selectInstitucion.innerHTML = '<option value="" selected>Error al cargar instituciones</option>';
            }
        }
    }

// Función para inicializar toda la aplicación
    async function inicializarApp() {
        console.log('🚀 Inicializando aplicación...');
        
        await Promise.all([
            cargarGeneros(),
            cargarInstituciones()
        ]);
        
        setupPasswordToggle();
        setupHelpButton();
        
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', manejarRegistro);
            console.log('✅ Event listener del formulario configurado');
        } else {
            console.error('❌ No se encontró el formulario con ID registerForm');
        }
    }
