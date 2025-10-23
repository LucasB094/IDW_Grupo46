import { MEDICOS_INICIALES, ESPECIALIDADES_INICIALES } from './data.js';

function inicializarDatos() {
  if (!localStorage.getItem('doctors')) {
    localStorage.setItem('doctors', JSON.stringify(MEDICOS_INICIALES));
  }
  
  if (!localStorage.getItem('specialties')) {
    localStorage.setItem('specialties', JSON.stringify(ESPECIALIDADES_INICIALES));
  }
}

function adjuntarLoginModal() {
  const loginForm = document.getElementById('modalLoginForm');
  const errorMsg = document.getElementById('modalLoginError');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  if (loginForm) {
    if (localStorage.getItem('rememberMe') === 'true') {
        document.getElementById('modalEmail').value = localStorage.getItem('lastUsername') || 'admin';
        document.getElementById('modalPassword').value = localStorage.getItem('lastPassword') || '1234';
        rememberMeCheckbox.checked = true;
    } else {
        document.getElementById('modalEmail').value = 'admin';
        document.getElementById('modalPassword').value = '1234';
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      errorMsg.classList.add('d-none');

      const username = document.getElementById('modalEmail').value;
      const password = document.getElementById('modalPassword').value;

      if (username === 'admin' && password === '1234') {
        localStorage.setItem('loggedIn', 'true');
        
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('lastUsername', username);
            localStorage.setItem('lastPassword', password);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('lastUsername');
            localStorage.removeItem('lastPassword');
        }

        window.location.href = 'admin.html';
      } else {
        errorMsg.classList.remove('d-none');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarDatos();
  adjuntarLoginModal();
});
