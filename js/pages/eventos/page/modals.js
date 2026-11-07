// eventos - modals
// Refactor modular: lógica original preservada.

// Función para abrir el modal con SweetAlert2
function openModal(dateKey) {
    selectedDate = dateKey;
    originalDate = dateKey;
    const existingEvent = events[dateKey];
    isEditing = existingEvent !== undefined;
    editingEventId = existingEvent?.id || null;

    // Formatear la fecha para mostrarla mejor
    const [year, month, day] = dateKey.split('-');
    const dateObj = new Date(year, month - 1, day);
    const formattedDate = dateObj.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const eventTitle = existingEvent?.title || "";
    const eventDescription = existingEvent?.description || "";
    const eventStatus = existingEvent?.status || "pendiente";

    // Crear el contenido del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'event-form';
    
    modalContent.innerHTML = `
        <div class="form-group">
            <label for="swal-event-title">Título del evento:</label>
            <input
                type="text"
                id="swal-event-title"
                class="form-control"
                placeholder="Ej: Reporte mensual"
                value="${eventTitle}"
            />
        </div>
        
        <div class="form-group">
            <label for="swal-event-description">Descripción:</label>
            <textarea
                id="swal-event-description"
                class="form-control"
                rows="4"
                placeholder="Ej: Preparar informe de visitantes y enviar a dirección."
            >${eventDescription}</textarea>
        </div>
        
        <div class="form-group">
            <label for="swal-event-status">Estado:</label>
            <select id="swal-event-status" class="form-control">
                <option value="pendiente" ${eventStatus === "pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="en_progreso" ${eventStatus === "en_progreso" ? "selected" : ""}>En Progreso</option>
                <option value="completado" ${eventStatus === "completado" ? "selected" : ""}>Completado</option>
            </select>
        </div>
        
        <div class="date-change-container" id="swal-date-change-container" style="display: none;">
            <label for="swal-new-event-date">Cambiar fecha del evento:</label>
            <input type="date" id="swal-new-event-date" class="form-control">
            <button id="swal-apply-date-change" class="btn-custom btn-primary" style="margin-top: 10px;">Aplicar cambio de fecha</button>
        </div>
        
        <div class="modal-actions-extended">
            <div class="modal-actions-left">
                ${isEditing ? `
                    <button id="swal-delete-event" class="btn-custom btn-delete">Eliminar Evento</button>
                    <button id="swal-change-date" class="btn-custom btn-change-date">Cambiar Fecha</button>
                ` : ''}
            </div>
            <div class="modal-actions-right">
                <button id="swal-cancel-event" class="btn-custom btn-cancel">Cancelar</button>
                <button id="swal-save-event" class="btn-custom btn-primary">Guardar</button>
            </div>
        </div>
    `;

    Swal.fire({
        title: `<div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-calendar-plus" style="font-size: 1.5rem; color: #27ae60;"></i>
            <span style="color: #27ae60;">${isEditing ? 'Editar evento' : 'Agregar evento'} para ${formattedDate}</span>
        </div>`,
        html: modalContent,
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'event-modal',
            header: 'event-modal-header',
            title: 'event-modal-title',
            htmlContainer: 'event-modal-content',
            actions: 'event-modal-actions'
        },
        width: 500,
        didOpen: () => {
            // Configurar eventos para los botones
            document.getElementById('swal-save-event').addEventListener('click', saveEvent);
            document.getElementById('swal-cancel-event').addEventListener('click', () => Swal.close());
            
            if (isEditing) {
                document.getElementById('swal-delete-event').addEventListener('click', deleteEvent);
                document.getElementById('swal-change-date').addEventListener('click', () => {
                    document.getElementById('swal-date-change-container').style.display = 'block';
                    document.getElementById('swal-new-event-date').value = selectedDate;
                });
            }
            
            document.getElementById('swal-apply-date-change').addEventListener('click', applyDateChange);
        }
    });
}
