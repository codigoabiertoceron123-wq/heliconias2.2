// actividad - utils
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

// Cargar actividades desde Supabase
        async function loadActivities(searchTerm = '') {
            const activitiesGrid = document.getElementById('activities-grid');
            
            try {
                let query = supabase
                    .from('actividades')
                    .select('*')
                    .order('id_actividad', { ascending: true });

                // Si hay un término de búsqueda, filtrar por nombre
                if (searchTerm) {
                    query = query.ilike('nombre', `%${searchTerm}%`);
                }

                const { data: activities, error } = await query;

                if (error) throw error;

                // Limpiar el grid
                activitiesGrid.innerHTML = '';

                if (activities.length === 0) {
                    activitiesGrid.innerHTML = `
                        <div class="no-results">
                            <i class="fas fa-search"></i>
                            <p>No se encontraron actividades${searchTerm ? ` para "${searchTerm}"` : ''}</p>
                        </div>
                    `;
                    return;
                }

                // Crear tarjetas para cada actividad
                activities.forEach(activity => {
                    const activityCard = document.createElement('div');
                    activityCard.className = 'activity-card';
                    activityCard.dataset.id = activity.id_actividad;
                    
                    // Determinar clase de dificultad
                    let difficultyClass = 'difficulty-low';
                    if (activity.nivel_dificultad === 'medio') {
                        difficultyClass = 'difficulty-medium';
                    } else if (activity.nivel_dificultad === 'alto') {
                        difficultyClass = 'difficulty-high';
                    }
                    
                    // Formatear fecha y hora
                    let horarioFormatted = 'No especificado';
                    if (activity.horario) {
                        const horarioDate = new Date(activity.horario);
                        horarioFormatted = horarioDate.toLocaleString('es-ES');
                    }
                    
                    activityCard.innerHTML = `
                        <div class="activity-header">
                            <div class="activity-name">${activity.nombre}</div>
                            <span class="activity-difficulty ${difficultyClass}">
                                ${activity.nivel_dificultad}
                            </span>
                        </div>
                        <div class="activity-body">
                            <p class="activity-description">${activity.descripcion || 'Sin descripción disponible'}</p>
                            <div class="activity-details">
                                <div class="detail-item">
                                    <i class="far fa-clock"></i>
                                    <span>${activity.duracion_minutos || 'N/A'} min</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-users"></i>
                                    <span>${activity.cupo_maximo} cupos</span>
                                </div>
                            </div>
                        </div>
                        <div class="activity-footer">
                            <div class="activity-capacity">
                                <i class="far fa-calendar-alt"></i>
                                ${horarioFormatted}
                            </div>
                            <span class="activity-status ${activity.activo ? 'status-active' : 'status-inactive'}">
                                ${activity.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    `;
                    
                    // Agregar evento de clic para mostrar detalles
                    activityCard.addEventListener('click', () => showActivityDetails(activity));
                    
                    activitiesGrid.appendChild(activityCard);
                });
            } catch (error) {
                console.error('Error al cargar actividades:', error);
                activitiesGrid.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error al cargar las actividades: ${error.message}</p>
                    </div>
                `;
            }
        }

// Mostrar detalles de la actividad en SweetAlert mejorado
        function showActivityDetails(activity) {
            // Formatear fecha y hora
            let horarioFormatted = 'No especificado';
            if (activity.horario) {
                const horarioDate = new Date(activity.horario);
                horarioFormatted = horarioDate.toLocaleString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            // Determinar clase de dificultad
            let difficultyBadge = 'badge-success';
            let difficultyText = 'Bajo';
            if (activity.nivel_dificultad === 'medio') {
                difficultyBadge = 'badge-warning';
                difficultyText = 'Medio';
            } else if (activity.nivel_dificultad === 'alto') {
                difficultyBadge = 'badge-danger';
                difficultyText = 'Alto';
            }
            
            // Determinar estado
            let statusBadge = activity.activo ? 'badge-success' : 'badge-danger';
            let statusText = activity.activo ? 'Activa' : 'Inactiva';
            
            // Procesar recomendaciones
            let recommendationsHTML = '<p class="description-text">No hay recomendaciones específicas</p>';
            if (activity.recomendaciones) {
                const recommendations = activity.recomendaciones.split('\n').filter(rec => rec.trim());
                if (recommendations.length > 0) {
                    recommendationsHTML = `
                        <ul class="recommendations-list">
                            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    `;
                }
            }

            Swal.fire({
                html: `
                    <div class="activity-detail-header">
                        <h2 class="activity-detail-title">${activity.nombre}</h2>
                        <p class="activity-detail-subtitle">Detalles completos de la actividad</p>
                    </div>
                    <div class="activity-detail-content">
                        <div class="detail-section">
                            <h3 class="detail-section-title">
                                <i class="fas fa-info-circle"></i> Información General
                            </h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <span class="detail-label">Estado</span>
                                    <span class="detail-value">
                                        <span class="badge ${statusBadge}">${statusText}</span>
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Nivel de Dificultad</span>
                                    <span class="detail-value">
                                        <span class="badge ${difficultyBadge}">${difficultyText}</span>
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Duración</span>
                                    <span class="detail-value">
                                        <i class="far fa-clock"></i> ${activity.duracion_minutos || 'N/A'} minutos
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Cupo Máximo</span>
                                    <span class="detail-value">
                                        <i class="fas fa-users"></i> ${activity.cupo_maximo} personas
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3 class="detail-section-title">
                                <i class="far fa-calendar-alt"></i> Horario Programado
                            </h3>
                            <div class="detail-item">
                                <span class="detail-label">Fecha y Hora</span>
                                <span class="detail-value">${horarioFormatted}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3 class="detail-section-title">
                                <i class="fas fa-align-left"></i> Descripción
                            </h3>
                            <p class="description-text">${activity.descripcion || 'No hay descripción disponible para esta actividad.'}</p>
                        </div>

                        <div class="detail-section">
                            <h3 class="detail-section-title">
                                <i class="fas fa-lightbulb"></i> Recomendaciones
                            </h3>
                            ${recommendationsHTML}
                        </div>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#2e7d32',
                width: '700px',
                customClass: {
                    popup: 'swal2-popup'
                },
                showCloseButton: true,
                background: '#f8f9fa'
            });
        }
