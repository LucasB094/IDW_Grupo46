const API_URL = 'https://dummyjson.com';

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
  const data = await res.json();

  sessionStorage.setItem('accessToken', data.token || data.accessToken);
  sessionStorage.setItem('username', data.username);
}

export function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

export function isAuthenticated() {
  return !!sessionStorage.getItem('accessToken');
}
