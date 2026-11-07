// eventos - utils
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

    currentDateTime.textContent = dateTimeString;
}

// Cargar eventos desde Supabase
async function loadEvents() {
    try {
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .order('fecha_evento', { ascending: true });

        if (error) throw error;

        // Convertir a formato compatible con el calendario
        events = {};
        data.forEach(event => {
            const dateKey = event.fecha_evento;
            events[dateKey] = {
                id: event.id_evento,
                title: event.titulo,
                description: event.descripcion,
                status: event.estado
            };
        });

        console.log('Eventos cargados:', events);
        renderCalendar(currentMonth, currentYear);
    } catch (error) {
        console.error('Error cargando eventos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los eventos',
            confirmButtonColor: '#e74c3c'
        });
    }
}

// Funciones del calendario
function renderCalendar(month, year) {
    calendarGrid.innerHTML = "";
    monthYear.textContent = `${getMonthName(month)} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Crear días vacíos para alinear el primer día del mes
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.classList.add("day", "empty");
        calendarGrid.appendChild(emptyDay);
    }

    // Crear días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const event = events[dateKey];

        const dayBox = document.createElement("div");
        dayBox.classList.add("day");

        if (event) {
            dayBox.classList.add("has-event");
        }

        // Agregar número del día
        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        dayBox.appendChild(dayNumber);

        // Agregar evento si existe
        if (event) {
            const eventIndicator = document.createElement("div");
            eventIndicator.className = `event-indicator ${event.status}`;
            eventIndicator.textContent = event.title;
            dayBox.appendChild(eventIndicator);
        }

        // Marcar día actual
        const today = new Date();
        if (
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
        ) {
            dayBox.classList.add("today");
        }

        dayBox.addEventListener("click", () => openModal(dateKey));
        calendarGrid.appendChild(dayBox);
    }

    // Actualiza los selectores
    document.getElementById("month-select").value = month;
    document.getElementById("year-select").value = year;

    // Actualizar historial
    renderHistory();
}

function getMonthName(monthIndex) {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    return months[monthIndex];
}

// Función para guardar evento en Supabase
async function saveEvent() {
    const title = document.getElementById('swal-event-title').value.trim();
    const description = document.getElementById('swal-event-description').value.trim();
    const status = document.getElementById('swal-event-status').value;

    if (title === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Falta información',
            text: 'Por favor, ingresa un título para el evento',
            confirmButtonColor: '#f39c12',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    try {
        // 1. Obtener el usuario actual de Supabase Auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            throw new Error("No se pudo obtener el usuario. Por favor, inicia sesión nuevamente.");
        }

        // 2. Buscar o crear el usuario en tu tabla 'usuarios'
        let idUsuarioParaEvento;
        
        // Primero buscar por email (más confiable)
        const { data: usuarioExistente, error: searchError } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('correo', user.email)
            .single();

        if (searchError || !usuarioExistente) {
            // Si no existe, crear el usuario en tu tabla
            console.log("Creando nuevo usuario en la tabla...");
            const { data: nuevoUsuario, error: createError } = await supabase
                .from('usuarios')
                .insert([
                    {
                        nombre: user.user_metadata?.name || 'Usuario',
                        apellido: user.user_metadata?.last_name || 'Auth',
                        correo: user.email,
                        contrasena: 'auth_provider', // No se usa para login real
                        auth_id: user.id // Vincular con Supabase Auth
                    }
                ])
                .select('id_usuario')
                .single();

            if (createError) {
                console.error("Error creando usuario:", createError);
                // Si falla la creación, intentar usar un usuario por defecto
                idUsuarioParaEvento = 1;
            } else {
                idUsuarioParaEvento = nuevoUsuario.id_usuario;
            }
        } else {
            idUsuarioParaEvento = usuarioExistente.id_usuario;
        }

        console.log("ID Usuario para evento:", idUsuarioParaEvento);

        let result;

        if (isEditing && editingEventId) {
            // Actualizar evento existente
            const { data, error } = await supabase
                .from('eventos')
                .update({
                    titulo: title,
                    descripcion: description,
                    estado: status,
                    fecha_evento: selectedDate,
                    id_usuario: idUsuarioParaEvento
                })
                .eq('id_evento', editingEventId)
                .select();

            if (error) throw error;
            result = data[0];
            
            // Recargar eventos desde la base de datos
            await loadEvents();

            // Mostrar confirmación de actualización
            Swal.fire({
                icon: 'success',
                title: '¡Evento Actualizado!',
                html: `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; color: #27ae60; margin-bottom: 15px;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <p style="margin-bottom: 10px; font-size: 1.1rem; font-weight: 600;">
                            El evento se ha actualizado correctamente
                        </p>
                        <p style="color: #7f8c8d; font-size: 0.9rem;">
                            <strong>"${title}"</strong> ha sido actualizado
                        </p>
                    </div>
                `,
                confirmButtonColor: '#27ae60',
                confirmButtonText: 'Aceptar',
                width: 450
            });

        } else {
            // Crear nuevo evento
            const { data, error } = await supabase
                .from('eventos')
                .insert([{
                    titulo: title,
                    descripcion: description,
                    estado: status,
                    fecha_evento: selectedDate,
                    id_usuario: idUsuarioParaEvento // ← Usar el ID correcto
                }])
                .select();

            if (error) throw error;
            result = data[0];
            
            // Recargar eventos desde la base de datos
            await loadEvents();

            // Formatear fecha para el mensaje
            const [year, month, day] = selectedDate.split('-');
            const dateObj = new Date(year, month - 1, day);
            const formattedDate = dateObj.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            // Mostrar SweetAlert personalizado para nuevo evento
            Swal.fire({
                icon: 'success',
                title: '¡Excelente!',
                html: `
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; color: #27ae60; margin-bottom: 20px;">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <p style="margin-bottom: 15px; font-size: 1.3rem; font-weight: 700; color: #27ae60;">
                            ¡Has creado un nuevo evento!
                        </p>
                        <div style="background: #f8fff8; padding: 15px; border-radius: 10px; border: 2px solid #e8f5e8; margin: 15px 0;">
                            <p style="margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 600; color: #2c3e50;">
                                <i class="fas fa-heading"></i> ${title}
                            </p>
                            <p style="margin: 0; font-size: 0.95rem; color: #27ae60;">
                                <i class="fas fa-calendar-day"></i> ${formattedDate}
                            </p>
                        </div>
                        <p style="color: #7f8c8d; font-size: 0.9rem; margin-top: 10px;">
                            El evento ha sido guardado en la base de datos
                        </p>
                    </div>
                `,
                confirmButtonColor: '#27ae60',
                confirmButtonText: '<i class="fas fa-thumbs-up"></i> ¡Perfecto!',
                width: 500,
                background: '#ffffff',
                customClass: {
                    popup: 'animated-popup',
                    confirmButton: 'custom-confirm-btn'
                },
                showClass: {
                    popup: 'animate__animated animate__bounceIn'
                }
            });
        }

        Swal.close();
    } catch (error) {
        console.error('Error guardando evento:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el evento: ' + error.message,
            confirmButtonColor: '#e74c3c'
        });
    }
}

// Función para eliminar evento
async function deleteEvent() {
    Swal.fire({
        title: '¿Eliminar evento?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#27ae60',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed && editingEventId) {
            try {
                const { error } = await supabase
                    .from('eventos')
                    .delete()
                    .eq('id_evento', editingEventId);

                if (error) throw error;

                // Recargar eventos desde la base de datos
                await loadEvents();

                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El evento ha sido eliminado',
                    confirmButtonColor: '#27ae60',
                    timer: 1500
                });

                Swal.close();
            } catch (error) {
                console.error('Error eliminando evento:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el evento',
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    });
}

// Función para aplicar cambio de fecha (ACTUALIZADA para guardar en Supabase)
async function applyDateChange() {
    const newDate = document.getElementById('swal-new-event-date').value;
    if (newDate) {
        // Verificar si ya existe un evento en la nueva fecha
        if (events[newDate] && newDate !== originalDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Fecha ocupada',
                text: 'Ya existe un evento en esta fecha. Por favor, elige otra fecha.',
                confirmButtonColor: '#f39c12',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        try {
            // Actualizar la fecha en Supabase
            const { error } = await supabase
                .from('eventos')
                .update({
                    fecha_evento: newDate
                })
                .eq('id_evento', editingEventId);

            if (error) throw error;

            selectedDate = newDate;

            const [year, month, day] = newDate.split('-');
            const dateObj = new Date(year, month - 1, day);
            const formattedDate = dateObj.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            // Actualizar el título del modal
            document.querySelector('.swal2-title').innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-calendar-plus" style="font-size: 1.5rem;"></i>
                    <span>Editar evento para ${formattedDate}</span>
                </div>
            `;

            document.getElementById('swal-date-change-container').style.display = 'none';

            // Recargar eventos para reflejar el cambio
            await loadEvents();

            Swal.fire({
                icon: 'success',
                title: 'Fecha cambiada',
                text: 'La fecha del evento ha sido actualizada en la base de datos',
                confirmButtonColor: '#27ae60',
                timer: 1500
            });
        } catch (error) {
            console.error('Error cambiando fecha:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cambiar la fecha del evento',
                confirmButtonColor: '#e74c3c'
            });
        }
    }
}

function renderHistory() {
    eventsList.innerHTML = "";

    // Obtener todos los eventos y ordenarlos por fecha (más recientes primero)
    const eventEntries = Object.entries(events).sort(
        ([dateA], [dateB]) => new Date(dateB) - new Date(dateA),
    );

    // Filtrar según la pestaña activa
    const filteredEvents = eventEntries.filter(([date, event]) => {
        if (currentTab === "all") return true;
        return event.status === currentTab;
    });

    if (filteredEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="no-events">
                <h4>No hay eventos</h4>
                <p>${
                    currentTab === "all"
                        ? "No hay eventos registrados"
                        : currentTab === "pendiente"
                          ? "No hay eventos pendientes"
                          : currentTab === "en_progreso"
                            ? "No hay eventos en progreso"
                            : "No hay eventos completados"
                }</p>
            </div>
        `;
        return;
    }

    filteredEvents.forEach(([date, event]) => {
        const [year, month, day] = date.split("-");
        const dateObj = new Date(year, month - 1, day);
        const formattedDate = dateObj.toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        // Mapear estados a texto legible
        const statusText = {
            'pendiente': 'Pendiente',
            'en_progreso': 'En Progreso',
            'completado': 'Completado'
        };

        // Mapear colores de estado
        const statusColors = {
            'pendiente': '#f39c12',
            'en_progreso': '#3498db',
            'completado': '#27ae60'
        };

        const eventCard = document.createElement("div");
        eventCard.className = `event-card ${event.status}`;
        eventCard.innerHTML = `
            <div class="event-date">${formattedDate}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-description">${event.description || "Sin descripción"}</div>
            <div class="event-status status-${event.status}" style="background: ${statusColors[event.status]}">
                ${statusText[event.status]}
            </div>
        `;

        eventCard.addEventListener("click", () => {
            // Al hacer clic en un evento del historial, abrir el modal para editarlo
            selectedDate = date;
            openModal(date);
        });

        eventsList.appendChild(eventCard);
    });
}

// Actualizar los selectores con el año actual y siguiente
function updateYearSelect() {
    const currentYear = today.getFullYear();
    yearSelect.innerHTML = '';
    yearSelect.innerHTML += `<option value="${currentYear}" selected>${currentYear}</option>`;
    yearSelect.innerHTML += `<option value="${currentYear + 1}">${currentYear + 1}</option>`;
}
