// NacionalidadSystem - state
// Refactor modular: lógica original preservada.

// =============================================
    // VARIABLES PRIVADAS
    // =============================================
    let chartBarNacionalidad, chartPieNacionalidad, chartAmpliadoNacionalidad;

let chartFechaBar, chartFechaPie, chartMesBar, chartMesPie, chartAnioBar, chartAnioPie;

let tipoActual = "nacionalidad";

let datosNacionalidades = {};

let datosOriginales = {};

let datosFecha = {};

let datosMes = {};

let datosAnio = {};

let nacionalidadesFiltradas = [];

let todosLosPaises = [];

let datosFiltradosTiempoActual = null;

// Paletas de colores para nacionalidades (verde para Colombia, otros colores para otros)
    const coloresNacionalidades = [
        '#27ae60', // Verde para Colombia
        '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c',
        '#d35400', '#34495e', '#16a085', '#8e44ad'
    ];

const coloresPorTiempo = {
        fecha: ['#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'],
        mes: ['#27ae60', '#3498db', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#d35400', '#8e44ad'],
        anio: ['#27ae60', '#3498db', '#e67e22', '#9b59b6', '#f1c40f']
    };
