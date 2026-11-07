// soporte - state
// Refactor modular: lógica original preservada.

// Contador de caracteres para la descripción
const descripcion = document.getElementById("descripcion");

const contador = document.getElementById("contador");

// Variables para el manejo de archivos
let archivoSeleccionado = null;

const areaArchivo = document.querySelector('.area-archivo');

const infoArchivo = document.querySelector('.info-archivo');

// Agregar estilos CSS para los SweetAlert
const sweetAlertStyle = document.createElement('style');
