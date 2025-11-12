import { login, isAuthenticated } from './api/auth.js';


(function seedOnce() {
  try {
    const MEDICOS_INICIALES = [
      { id: 1, name: "Dr. Benítez Lucas", specialty: "Cardiología", image: "imagen/profesionales/benitez.jpg", instagram: "https://www.instagram.com/lucasbenitez10_/" },
      { id: 2, name: "Dr. Cabrera Alexis", specialty: "Pediatría",   image: "imagen/profesionales/cabrera.jpg",  instagram: "https://www.instagram.com/alexiscabrera14/" },
      { id: 3, name: "Dra. Morilla Flavia", specialty: "Dermatología", image: "imagen/profesionales/morilla.jpg",  instagram: "https://www.instagram.com/flaa_morilla/" },
      { id: 4, name: "Dr. Berthet Kevin",   specialty: "Neurología",  image: "imagen/profesionales/berthet.jpg",  instagram: "https://www.instagram.com/berthetkev/" }
    ];

    const ESPECIALIDADES_INICIALES = [
      { id: 1, name: "Cardiología" },
      { id: 2, name: "Pediatría" },
      { id: 3, name: "Dermatología" },
      { id: 4, name: "Neurología" },
      { id: 5, name: "Clínica Médica" },
      { id: 6, name: "Traumatología" }
    ];


    const OBRAS_INICIALES = [
      { id: 1, name: "OSDE",              porcentaje: 40 },
      { id: 2, name: "Swiss Medical",     porcentaje: 35 },
      { id: 3, name: "Galeno",            porcentaje: 25 },
      { id: 4, name: "Medifé",            porcentaje: 20 },
      { id: 5, name: "Omint",             porcentaje: 15 },
      { id: 6, name: "OSECAC",            porcentaje: 10 },
      { id: 7, name: "Sancor Salud",      porcentaje: 30 },
      { id: 8, name: "Jerárquicos Salud", porcentaje: 20 },
      { id: 9, name: "OSPE",              porcentaje: 15 },
      { id:10, name: "Prevención Salud",  porcentaje: 25 }
    ];

    if (!localStorage.getItem('doctors'))        localStorage.setItem('doctors', JSON.stringify(MEDICOS_INICIALES));
    if (!localStorage.getItem('especialidades')) localStorage.setItem('especialidades', JSON.stringify(ESPECIALIDADES_INICIALES));
    if (!localStorage.getItem('obras'))          localStorage.setItem('obras', JSON.stringify(OBRAS_INICIALES));
    if (!localStorage.getItem('turnos'))         localStorage.setItem('turnos', JSON.stringify([]));
    if (!localStorage.getItem('reservas'))       localStorage.setItem('reservas', JSON.stringify([]));
    if (!localStorage.getItem('config_clinica')) localStorage.setItem('config_clinica', JSON.stringify({ precioConsulta: 30000 }));
  } catch (e) {
    console.warn('No se pudo inicializar LocalStorage:', e);
  }
})();


function adjuntarLoginModal() {
  const loginForm   = document.getElementById('modalLoginForm');
  const errorMsg    = document.getElementById('modalLoginError');
  const rememberMe  = document.getElementById('rememberMe');
  const userInput   = document.getElementById('modalEmail');
  const passInput   = document.getElementById('modalPassword');


  if (!loginForm || !userInput || !passInput) return;

  const lastUser = localStorage.getItem('lastDummyUser');
  if (lastUser) userInput.value = lastUser;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg?.classList.add('d-none');

    const username = (userInput.value || '').trim();
    const password = passInput.value || '';

    if (!username) {
      if (errorMsg) { errorMsg.textContent = 'Ingresá el usuario.'; errorMsg.classList.remove('d-none'); }
      return;
    }
    if (!password) {
      if (errorMsg) { errorMsg.textContent = 'Ingresá la contraseña.'; errorMsg.classList.remove('d-none'); }
      return;
    }

    try {
    
      await login(username, password);

    
      if (rememberMe && rememberMe.checked) {
        localStorage.setItem('lastDummyUser', username);
      } else {
        localStorage.removeItem('lastDummyUser');
      }

    
      window.location.href = 'admin.html';
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = err?.message || 'Credenciales incorrectas.';
        errorMsg.classList.remove('d-none');
      } else {
        alert(err?.message || 'Credenciales incorrectas.');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {

  if (isAuthenticated()) return;
  adjuntarLoginModal();
});
