// Módulo para gestión de modales
class ModalManager {
    constructor() {
        this.modal = document.getElementById("chartModal");
        this.chartAmpliado = null;
    }

    abrirModal(tipoGrafica) {
        if (!this.modal) return;
        
        this.modal.classList.add("show");
        this.actualizarGraficaModal(tipoGrafica);
    }

    actualizarGraficaModal(tipoGrafica) {
        const canvas = document.getElementById("chartAmpliado");
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        const datos = dataProcessor.datosSimulados[chartManager.tipoActual];
        
        if (!datos) return;

        if (this.chartAmpliado) this.chartAmpliado.destroy();

        const colors = chartManager.generarColores(chartManager.tipoActual, datos.labels);

        this.chartAmpliado = new Chart(ctx, {
            type: tipoGrafica === "bar" ? "bar" : "doughnut",
            data: {
                labels: datos.labels,
                datasets: [{
                    label: "Total de Visitantes",
                    data: datos.values,
                    backgroundColor: colors,
                    borderRadius: tipoGrafica === "bar" ? 6 : 0,
                    borderWidth: tipoGrafica === "bar" ? 0 : 2,
                    borderColor: tipoGrafica === "bar" ? 'transparent' : '#fff'
                }],
            },
            options: this.obtenerOpcionesModal(tipoGrafica)
        });

        this.actualizarTablaDatos(datos);
    }

    obtenerOpcionesModal(tipoGrafica) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: tipoGrafica === "bar" ? 'top' : 'right'
                },
                title: {
                    display: true,
                    text: chartManager.obtenerTituloDescriptivo(chartManager.tipoActual),
                    font: { size: 18, weight: 'bold' },
                    padding: 25
                }
            }
        };
    }

    actualizarTablaDatos(datos) {
        const tbody = document.querySelector("#tablaDatos tbody");
        if (!tbody) return;

        const total = datos.values.reduce((a, b) => a + b, 0);
        
        tbody.innerHTML = datos.labels.map((label, i) => {
            const valor = datos.values[i];
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : '0.0';
            return `
                <tr>
                    <td><strong>${label}</strong></td>
                    <td style="text-align: center;"><strong>${valor.toLocaleString()}</strong></td>
                    <td style="text-align: center; color: #2c3e50; font-weight: bold">${porcentaje}%</td>
                </tr>
            `;
        }).join("");
    }

    cerrarModal() {
        if (this.modal) {
            this.modal.classList.remove("show");
        }
    }
}

// Crear instancia global
const modalManager = new ModalManager();