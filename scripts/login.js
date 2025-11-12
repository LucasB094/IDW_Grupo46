import { login, isAuthenticated } from './api/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) window.location.href = 'admin.html';

  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      await login(username, password);
      window.location.href = 'admin.html';
    } catch (err) {
      alert(err.message || 'Credenciales incorrectas');
    }
  });
});
