// EdadSystem - state
// Refactor modular: lógica original preservada.

let chartBarEdad, chartPieEdad;

let tipoActualEdad = "edad";

let datosSimuladosEdad = {};

let datosOriginalesEdad = {};

let datosFecha = { labels: [], values: [], total: 0 };

let datosMes = { labels: [], values: [], total: 0 };

let datosAnio = { labels: [], values: [], total: 0 };

let chartFechaBar, chartFechaPie, chartMesBar, chartMesPie, chartAnioBar, chartAnioPie;

// Agrega esto con las otras variables al inicio
    let datosFechaInteligente = { labels: [], datasets: [], total: 0 };

let datosMesInteligente = { labels: [], datasets: [], total: 0 };

let datosAnioInteligente = { labels: [], datasets: [], total: 0 };

// Datos para vistas combinadas
    let datosFechaCombinado = {};

let datosMesCombinado = {};

let datosAnioCombinado = {};

let chartAmpliadoEdad = null;

// Variables para datos agrupados
    let datosFechaAgrupados = { labels: [], datasets: [], total: 0 };

let datosMesAgrupados = { labels: [], datasets: [], total: 0 };

let datosAnioAgrupados = { labels: [], datasets: [], total: 0 };

// Paletas de colores específicas para edad
    const coloresPorEdad = {
        '0-17': '#27ae60', '18-25': '#3498db', '26-35': '#f39c12',
        '36-50': '#e67e22', '51-65': '#9b59b6', '66+': '#e74c3c'
    };

// Paletas de colores para fecha, mes y año
    const coloresPorTiempo = {
        fecha: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'],
        mes: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#d35400', '#27ae60', '#8e44ad', '#16a085', '#c0392b', '#2980b9'],
        anio: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c']
    };
