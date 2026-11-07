// Genero - ui
// Refactor modular: lógica original preservada.

// Función para mostrar resultados (sin cambios, pero añadimos verificación)
function mostrarResultadosGenero(conteoGeneros, nombresGenero) {
    const total = Object.values(conteoGeneros).reduce((a, b) => a + b, 0);
    const dataContainer = document.getElementById('data-container');
    
    if (!dataContainer) {
        console.error('❌ data-container no encontrado');
        return;
    }
    
    console.log('📊 Mostrando resultados, total:', total);
    
    // Actualizar tarjetas
    const totalVisitantesSpan = document.getElementById('total-visitantes');
    const distribucionGenero = document.getElementById('distribucion-genero');
    const totalGeneros = document.getElementById('total-generos');
    
    if (totalVisitantesSpan) totalVisitantesSpan.textContent = total;
    if (totalGeneros) totalGeneros.textContent = Object.keys(conteoGeneros).length;
    
    // Crear gráfico
    const labels = [];
    const values = [];
    
    Object.keys(conteoGeneros).forEach(id => {
        labels.push(nombresGenero[id] || `Género ${id}`);
        values.push(conteoGeneros[id]);
    });
    
    // Mostrar distribución porcentual
    if (distribucionGenero && values.length > 0) {
        const maxValue = Math.max(...values);
        const maxIndex = values.indexOf(maxValue);
        const porcentaje = ((maxValue / total) * 100).toFixed(1);
        distribucionGenero.textContent = `${porcentaje}% (${labels[maxIndex]})`;
    }
    
    // Crear gráfico de torta
    const ctx = document.createElement('canvas');
    dataContainer.innerHTML = '';
    ctx.id = 'genderChart';
    ctx.style.maxWidth = '400px';
    ctx.style.margin = '20px auto';
    dataContainer.appendChild(ctx);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const porcentaje = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${porcentaje}%)`;
                        }
                    }
                }
            }
        }
    });
    
    console.log('✅ Gráfico creado correctamente');
}

// Función para mostrar sin datos
function mostrarSinDatos() {
    const container = document.getElementById('data-container');
    container.innerHTML = `
        <div class="no-data">
            <i class="fas fa-database"></i>
            <h3>No hay datos disponibles</h3>
            <p>No se encontraron registros en la base de datos para mostrar estadísticas.</p>
            <button class="btn btn-primary" onclick="cargarDatosGeneros()" style="margin-top: 15px;">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        </div>
    `;
}

// Funciones de utilidad (deben estar definidas en tu código)
function mostrarLoading(mensaje) {
    // Implementación de mostrar loading
    console.log('Loading:', mensaje);
}

function cerrarLoading() {
    // Implementación de cerrar loading
    console.log('Cerrando loading');
}

function mostrarError(mensaje) {
    // Implementación de mostrar error
    console.error('Error:', mensaje);
}

function mostrarExito(mensaje) {
    // Implementación de mostrar éxito
    console.log('Éxito:', mensaje);
}

function mostrarMensajeSinDatos(mensaje) {
    // Implementación de mostrar mensaje sin datos
    console.warn('Sin datos:', mensaje);
}

function mostrarDatos() {
    // Implementación de mostrar datos
    console.log('Mostrando datos');
}
