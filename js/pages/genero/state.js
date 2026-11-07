// Genero - state
// Refactor modular: lógica original preservada.

// Variables globales
let chartBar, chartPie, chartAmpliado;

let tipoActual = "genero";

let datosGeneros = [];

let datosSimulados = {};

let datosOriginales = {};

// Paletas de colores por género
const coloresPorGenero = {
    'Masculino': '#3498db',
    'Femenino': '#e74c3c',
    'Otro': '#27ae60',
    'Prefiero no decirlo': '#f39c12'
};

// Paletas de colores para otros tipos
const colorPalettes = {
    fecha: [
        '#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#e74c3c',
        '#f1c40f', '#34495e', '#d35400', '#8e44ad', '#16a085'
    ],
    dia: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8'
    ],
    mes: [
        '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
        '#1abc9c', '#d35400', '#34495e'
    ],
    anio: [
        '#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f'
    ],
    intereses: [
        '#27ae60', '#3498db', '#f39c12', '#9b59b6', '#e74c3c'
    ]
};
