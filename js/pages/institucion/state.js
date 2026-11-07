// InstitucionSystem - state
// Refactor modular: lógica original preservada.

// =============================================
    // VARIABLES PRIVADAS
    // =============================================
    let chartBarInstitucion, chartPieInstitucion, chartAmpliadoInstitucion;

let chartFechaBar, chartFechaPie, chartMesBar, chartMesPie, chartAnioBar, chartAnioPie;

let tipoActual = "institucion";

let datosInstituciones = {};

let datosOriginales = {};

let datosFecha = {};

let datosMes = {};

let datosAnio = {};

let institucionesFiltradas = [];

let todasLasInstituciones = [];

// Paletas de colores
    const coloresInstituciones = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#d35400', '#34495e', '#16a085', '#27ae60'
    ];

const coloresPorTiempo = {
        fecha: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
        mes: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#d35400', '#27ae60'],
        anio: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f']
    };
