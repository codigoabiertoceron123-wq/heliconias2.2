// CiudadSystem - state
// Refactor modular: lógica original preservada.

// Variables del sistema
    let chartBarCiudad, chartPieCiudad, chartAmpliadoCiudad;

let datosCiudades = {};

let datosFechaCiudad = {};

let datosMesCiudad = {};

let datosAnioCiudad = {};

let todasLasCiudades = [];

let tipoActual = "ciudad";

// Objetos para almacenar instancias de gráficos por tipo
    const chartInstances = {
        fecha: null,
        mes: null,
        anio: null,
        bar: null,
        pie: null,
        ampliado: null
    };

// PALETA DE COLORES MEJORADA - UN COLOR POR CIUDAD
    const coloresBase = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', 
        '#34495e', '#e67e22', '#27ae60', '#8e44ad', '#16a085', '#c0392b',
        '#2980b9', '#d35400', '#7f8c8d', '#f1c40f', '#95a5a6', '#d35400'
    ];

// Mapa para mantener colores consistentes por ciudad
    let mapaColoresCiudades = {};

// Paleta para gráficos de tiempo
    const coloresPorTiempo = {
        fecha: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'],
        mes: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#d35400', '#27ae60', '#8e44ad', '#16a085', '#c0392b', '#2980b9'],
        anio: ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c']
    };
