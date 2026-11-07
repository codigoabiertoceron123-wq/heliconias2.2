// principal - utils
// Refactor modular: lógica original preservada.

// Usar 'sb' en lugar de 'supabase' para evitar conflictos

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

// Función para calcular edad a partir de fecha de nacimiento
            function calcularEdad(fechaNacimiento) {
                if (!fechaNacimiento) return null;
                
                const hoy = new Date();
                const nacimiento = new Date(fechaNacimiento);
                
                let edad = hoy.getFullYear() - nacimiento.getFullYear();
                const mes = hoy.getMonth() - nacimiento.getMonth();
                
                if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                    edad--;
                }
                
                return edad;
            }

// Función para clasificar por edad
            function clasificarEdad(edad) {
                if (edad < 18) return 'menores';
                if (edad <= 60) return 'adultos';
                return 'mayores';
            }

// Función para generar la interfaz de géneros dinámicamente
            function generarInterfazGeneros(conteoGeneros, nombresGenero) {
                const statsContainer = document.getElementById('genero-stats-container');
                
                statsContainer.innerHTML = '';

                if (Object.keys(conteoGeneros).length === 0) {
                    statsContainer.innerHTML = '<div class="no-data">No hay datos de género</div>';
                    return;
                }

                const generosOrdenados = Object.keys(conteoGeneros).sort((a, b) => {
                    return conteoGeneros[b] - conteoGeneros[a];
                });

                generosOrdenados.forEach(idGenero => {
                    const cantidad = conteoGeneros[idGenero];
                    const nombre = nombresGenero[idGenero] || `Género ${idGenero}`;
                    
                    const statItem = document.createElement('div');
                    statItem.className = 'stat-item';
                    statItem.innerHTML = `
                        <span class="stat-label">${nombre}</span>
                        <span class="stat-value">${cantidad.toLocaleString()}</span>
                    `;
                    
                    statsContainer.appendChild(statItem);
                });

                console.log('✅ Interfaz de géneros generada dinámicamente');
            }

// Función para generar la interfaz de edades dinámicamente
            function generarInterfazEdades(conteoEdades) {
                const statsContainer = document.getElementById('edad-stats-container');
                
                statsContainer.innerHTML = '';

                if (conteoEdades.menores === 0 && conteoEdades.adultos === 0 && conteoEdades.mayores === 0) {
                    statsContainer.innerHTML = '<div class="no-data">No hay datos de edad</div>';
                    return;
                }

                const categorias = [
                    { key: 'menores', label: 'Menores de 18' },
                    { key: 'adultos', label: '18 - 60 años' },
                    { key: 'mayores', label: 'Mayores de 60' }
                ];

                categorias.forEach(categoria => {
                    const cantidad = conteoEdades[categoria.key];
                    
                    const statItem = document.createElement('div');
                    statItem.className = 'stat-item';
                    statItem.innerHTML = `
                        <span class="stat-label">${categoria.label}</span>
                        <span class="stat-value">${cantidad.toLocaleString()}</span>
                    `;
                    
                    statsContainer.appendChild(statItem);
                });

                console.log('✅ Interfaz de edades generada dinámicamente');
            }

// Función para generar la interfaz de nacionalidades
            function generarInterfazNacionalidades(conteoNacionalidades) {
                const statsContainer = document.getElementById('nacionalidad-stats-container');
                
                statsContainer.innerHTML = '';

                const categorias = [
                    { label: 'Colombia', value: conteoNacionalidades['Colombia'] || 0 },
                    { label: 'Otros países', value: conteoNacionalidades['Otros países'] || 0 }
                ];

                categorias.forEach(categoria => {
                    const statItem = document.createElement('div');
                    statItem.className = 'stat-item';
                    statItem.innerHTML = `
                        <span class="stat-label">${categoria.label}</span>
                        <span class="stat-value">${categoria.value.toLocaleString()}</span>
                    `;
                    
                    statsContainer.appendChild(statItem);
                });

                console.log('✅ Interfaz de nacionalidades generada');
            }

// Función para actualizar la interfaz de ciudades
            function actualizarInterfazCiudades(bogota, medellin, cali, otras) {
                document.getElementById('ciudad-bogota').textContent = bogota.toLocaleString();
                document.getElementById('ciudad-medellin').textContent = medellin.toLocaleString();
                document.getElementById('ciudad-cali').textContent = cali.toLocaleString();
                document.getElementById('ciudad-otras').textContent = otras.toLocaleString();

                console.log('✅ Interfaz de ciudades actualizada');
            }

// Función para actualizar la interfaz de instituciones
            function actualizarInterfazInstituciones(univalle, nacional, andes, otras) {
                try {
                    console.log('Actualizando interfaz instituciones:', { univalle, nacional, andes, otras });
                    
                    document.getElementById('institucion-univalle').textContent = univalle.toLocaleString();
                    document.getElementById('institucion-nacional').textContent = nacional.toLocaleString();
                    document.getElementById('institucion-andes').textContent = andes.toLocaleString();
                    document.getElementById('institucion-otras').textContent = otras.toLocaleString();

                    console.log('✅ Interfaz de instituciones actualizada');
                } catch (error) {
                    console.error('Error al actualizar interfaz instituciones:', error);
                }
            }
