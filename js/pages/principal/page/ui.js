// principal - ui
// Refactor modular: lógica original preservada.

// Función para mostrar sin datos en institución
            function mostrarSinDatosInstitucion() {
                try {
                    document.getElementById('institucion-univalle').textContent = '0';
                    document.getElementById('institucion-nacional').textContent = '0';
                    document.getElementById('institucion-andes').textContent = '0';
                    document.getElementById('institucion-otras').textContent = '0';
                } catch (error) {
                    console.error('Error en mostrarSinDatosInstitucion:', error);
                }
            }

// Función para mostrar error en la sección de institución
            function mostrarErrorInstitucion() {
                try {
                    document.getElementById('institucion-univalle').textContent = 'Error';
                    document.getElementById('institucion-nacional').textContent = 'Error';
                    document.getElementById('institucion-andes').textContent = 'Error';
                    document.getElementById('institucion-otras').textContent = 'Error';
                } catch (error) {
                    console.error('Error en mostrarErrorInstitucion:', error);
                }
            }

// Funciones de manejo de errores y estados
            function mostrarSinDatosNacionalidad() {
                const statsContainer = document.getElementById('nacionalidad-stats-container');
                statsContainer.innerHTML = '<div class="no-data">No hay datos de nacionalidad</div>';
            }

function mostrarErrorNacionalidad() {
                const statsContainer = document.getElementById('nacionalidad-stats-container');
                statsContainer.innerHTML = '<div class="no-data">Error al cargar datos de nacionalidad</div>';
            }

function mostrarSinDatosCiudad() {
                document.getElementById('ciudad-bogota').textContent = '0';
                document.getElementById('ciudad-medellin').textContent = '0';
                document.getElementById('ciudad-cali').textContent = '0';
                document.getElementById('ciudad-otras').textContent = '0';
            }

function mostrarErrorCiudad() {
                document.getElementById('ciudad-bogota').textContent = 'Error';
                document.getElementById('ciudad-medellin').textContent = 'Error';
                document.getElementById('ciudad-cali').textContent = 'Error';
                document.getElementById('ciudad-otras').textContent = 'Error';
            }

function mostrarErrorGenero() {
                const statsContainer = document.getElementById('genero-stats-container');
                statsContainer.innerHTML = '<div class="no-data">Error al cargar datos de género</div>';
            }

function mostrarErrorEdad() {
                const statsContainer = document.getElementById('edad-stats-container');
                statsContainer.innerHTML = '<div class="no-data">Error al cargar datos de edad</div>';
            }
