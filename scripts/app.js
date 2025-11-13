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

    if (!localStorage.getItem('doctors'))        localStorage.setItem('doctors', JSON.stringify(MEDICOS_INICIALES));
    if (!localStorage.getItem('especialidades')) localStorage.setItem('especialidades', JSON.stringify(ESPECIALIDADES_INICIALES));
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
      errorMsg.textContent = 'Ingresá el usuario.';
      errorMsg.classList.remove('d-none');
      return;
    }
    if (!password) {
      errorMsg.textContent = 'Ingresá la contraseña.';
      errorMsg.classList.remove('d-none');
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
      errorMsg.textContent = err?.message || 'Credenciales incorrectas.';
      errorMsg.classList.remove('d-none');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) return;
  adjuntarLoginModal();
});
