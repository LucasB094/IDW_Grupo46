import { MEDICOS_INICIALES, ESPECIALIDADES_INICIALES } from './data.js';


function inicializarDatos() {
  
  if (!localStorage.getItem('doctors')) {
    localStorage.setItem('doctors', JSON.stringify(MEDICOS_INICIALES));
  }
  
  
  if (!localStorage.getItem('specialties')) {
    localStorage.setItem('specialties', JSON.stringify(ESPECIALIDADES_INICIALES));
  }
}


document.addEventListener('DOMContentLoaded', inicializarDatos);