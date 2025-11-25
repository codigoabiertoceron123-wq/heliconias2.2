// Módulo para gestión de filtros
class FilterManager {
    constructor() {
        this.filtrosActivos = {};
    }

    aplicarFiltros() {
        const tipoEntrada = document.getElementById('filtro-tipo-entrada').value;
        const temporada = document.getElementById('filtro-temporada').value;
        const actividad = document.getElementById('filtro-actividad').value;
        const guia = document.getElementById('filtro-guia').value;

        this.filtrosActivos = {};
        
        if (tipoEntrada) this.filtrosActivos.tipo_entrada = tipoEntrada;
        if (temporada) this.filtrosActivos.temporada = temporada;
        if (actividad) this.filtrosActivos.actividad = actividad;
        if (guia) this.filtrosActivos.con_guia = guia === 'true';

        dataLoader.setFiltros(this.filtrosActivos);
        dataLoader.cargarDatosVisitantes();

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Filtros aplicados',
                text: 'Los datos se han filtrado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            console.log('Filtros aplicados correctamente');
        }
    }

    limpiarFiltros() {
        document.getElementById('filtro-tipo-entrada').value = '';
        document.getElementById('filtro-temporada').value = '';
        document.getElementById('filtro-actividad').value = '';
        document.getElementById('filtro-guia').value = '';

        dataLoader.limpiarFiltros();
        dataLoader.cargarDatosVisitantes();

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Filtros limpiados',
                text: 'Se muestran todos los datos',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            console.log('Filtros limpiados correctamente');
        }
    }
}

// Crear instancia global
const filterManager = new FilterManager();