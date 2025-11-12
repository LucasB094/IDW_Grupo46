// scripts/nav.js
document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.querySelector('#navbarNav ul.navbar-nav');
  if (!navContainer) return;

  // Detectar si estamos en carpeta /admin/
  const inAdminFolder = location.pathname.includes('/admin/');
  // Prefijo relativo para los enlaces
  const P = inAdminFolder ? '..' : '.';

  const isLogged = !!sessionStorage.getItem('accessToken');

  let navHTML = `
    <li class="nav-item"><a class="nav-link" href="${P}/index.html">Inicio</a></li>
    <li class="nav-item"><a class="nav-link" href="${P}/servicios.html">Servicios</a></li>
    <li class="nav-item"><a class="nav-link" href="${P}/contacto.html">Contacto</a></li>
  `;

  if (isLogged) {
    // 🔧 Enlaces corregidos (plural)
    navHTML += `
      <li class="nav-item"><a class="nav-link" href="${P}/admin.html">Admin Médicos</a></li>
      <li class="nav-item"><a class="nav-link" href="${P}/admin-turnos.html">Admin Turnos</a></li>
      <li class="nav-item"><a class="nav-link" href="${P}/usuarios.html">Usuarios</a></li>
      <li class="nav-item"><a class="nav-link btn btn-outline-danger btn-sm ms-2" id="logoutBtn" href="#">Cerrar Sesión</a></li>
    `;
  } else {
    navHTML += `
      <li class="nav-item">
        <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Iniciar Sesión</a>
      </li>`;
  }

  navContainer.innerHTML = navHTML;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.clear();
      window.location.href = `${P}/index.html`;
    });
  }
});
