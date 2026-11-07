// eventos - index
// Refactor modular: lógica original preservada.

// Inicializar fecha y hora
updateDateTime();

setInterval(updateDateTime, 1000);

// Event Listeners
document
    .getElementById("prev-month")
    .addEventListener("click", () => {
        currentMonth = (currentMonth - 1 + 12) % 12;
        if (currentMonth === 11) currentYear--;
        renderCalendar(currentMonth, currentYear);
    });

document
    .getElementById("next-month")
    .addEventListener("click", () => {
        currentMonth = (currentMonth + 1) % 12;
        if (currentMonth === 0) currentYear++;
        renderCalendar(currentMonth, currentYear);
    });

monthSelect.addEventListener("change", () => {
    currentMonth = parseInt(monthSelect.value);
    renderCalendar(currentMonth, currentYear);
});

yearSelect.addEventListener("change", () => {
    currentYear = parseInt(yearSelect.value);
    renderCalendar(currentMonth, currentYear);
});

// Toggle del historial
historyToggle.addEventListener("click", () => {
    historySection.classList.toggle("collapsed");
    historyToggle.textContent = historySection.classList.contains(
        "collapsed",
    )
        ? ""
        : "";
});

// Tabs del historial (ACTUALIZADOS para los nuevos estados)
historyTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        historyTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentTab = tab.dataset.tab;
        renderHistory();
    });
});

// Botón de ayuda flotante
floatingHelpBtn.addEventListener('click', function() {
    Swal.fire({
        title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-calendar-alt" style="color: #27ae60; font-size: 1.5rem;"></i><span>Gestión de Eventos</span></div>',
        html: `
            <div style="text-align: left;">
                <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-lightbulb"></i>
                        ¿Qué puedes hacer aquí?
                    </h4>
                </div>
                
                <div style="display: grid; gap: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
                        <i class="fas fa-calendar-day" style="color: #27ae60; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Calendario Interactivo</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Visualiza y programa eventos en el calendario mensual con navegación intuitiva</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e74c3c;">
                        <i class="fas fa-history" style="color: #e74c3c; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Historial Organizado</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Consulta todos los eventos filtrados por estado en el panel lateral</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
                        <i class="fas fa-plus-circle" style="color: #27ae60; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Agregar Eventos</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Haz clic en cualquier día del calendario para crear un nuevo evento</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f39c12;">
                        <i class="fas fa-edit" style="color: #f39c12; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Edición Flexible</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Modifica eventos existentes, cambia fechas y actualiza estados</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #9b59b6;">
                        <i class="fas fa-tasks" style="color: #9b59b6; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Seguimiento de Estados</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Marca eventos como "Pendiente", "En Progreso" o "Completados" para mejor organización</p>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 15px; border-radius: 10px; border-left: 4px solid #e17055;">
                    <h5 style="margin: 0 0 8px 0; color: #2d3436; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-graduation-cap"></i>
                        Consejos Prácticos
                    </h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-mouse-pointer" style="color: #27ae60;"></i>
                            Clic en días
                        </span>
                        <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-filter" style="color: #e74c3c;"></i>
                            Filtra por pestañas
                        </span>
                        <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-arrows-alt-h" style="color: #27ae60;"></i>
                            Ajusta tamaño panel
                        </span>
                        <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-database" style="color: #f39c12;"></i>
                            Guarda en base de datos
                        </span>
                    </div>
                </div>
            </div>
        `,
        icon: 'info',
        showCloseButton: true,
        confirmButtonColor: '#27ae60',
        confirmButtonText: '<i class="fas fa-check-circle"></i> Entendido',
        width: 650,
        background: '#ffffff',
        customClass: {
            popup: 'animated-popup',
            title: 'custom-title',
            htmlContainer: 'custom-html'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    });
});

// Botón de ayuda del header
helpBtn.addEventListener('click', function() {
    Swal.fire({
        title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-calendar-alt" style="color: #27ae60; font-size: 1.5rem;"></i><span>Centro de Ayuda - Eventos</span></div>',
        html: `
            <div style="text-align: left;">
                <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-star"></i>
                        Funcionalidades Principales
                    </h4>
                </div>
                
                <div style="display: grid; gap: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
                        <i class="fas fa-calendar-alt" style="color: #27ae60; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Calendario Interactivo</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Navega entre meses y visualiza eventos programados de forma intuitiva</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
                        <i class="fas fa-tasks" style="color: #27ae60; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Gestión de Eventos</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Crea, edita y elimina eventos fácilmente con interfaz amigable</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e74c3c;">
                        <i class="fas fa-chart-line" style="color: #e74c3c; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Seguimiento de Estados</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Marca eventos como "Pendiente", "En Progreso" o "Completados" para mejor organización</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #9b59b6;">
                        <i class="fas fa-history" style="color: #9b59b6; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div>
                            <strong style="color: #2c3e50;">Historial Organizado</strong>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Filtra eventos por estado en el panel lateral para acceso rápido</p>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 15px; border-radius: 10px; border-left: 4px solid #e17055; margin-bottom: 20px;">
                    <h5 style="margin: 0 0 8px 0; color: #2d3436; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-lightbulb"></i>
                        Consejos Rápidos
                    </h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-mouse-pointer" style="color: #27ae60;"></i>
                            Clic en días
                        </span>
                        <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-filter" style="color: #e74c3c;"></i>
                            Filtra por pestañas
                        </span>
                        <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-exchange-alt" style="color: #27ae60;"></i>
                            Cambia fechas
                        </span>
                        <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #2d3436; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-database" style="color: #f39c12;"></i>
                            Guarda en base de datos
                        </span>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 12px; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-database"></i>
                        Todos los cambios se guardan automáticamente en la base de datos
                    </p>
                </div>
            </div>
        `,
        icon: 'info',
        showCloseButton: true,
        confirmButtonColor: '#27ae60',
        confirmButtonText: '<i class="fas fa-check-circle"></i> Entendido',
        width: 650,
        background: '#ffffff',
        customClass: {
            popup: 'animated-popup',
            title: 'custom-title',
            htmlContainer: 'custom-html',
            confirmButton: 'custom-confirm-btn'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    });
});

// Botón de salir
logoutBtn.addEventListener("click", function() {
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

// Inicializar calendario e historial
updateYearSelect();

// Actualizar selector de año
loadEvents();
