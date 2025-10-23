document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.querySelector('#navbarNav ul.navbar-nav');
  if (!navContainer) return;

  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

  
  const navItems = [
    { href: 'index.html', text: 'Inicio' },
    { href: 'servicios.html', text: 'Servicios' },
    { href: 'contacto.html', text: 'Contacto' }
  ];

 
  const adminNavItems = [
    { href: 'admin.html', text: 'Admin Médicos' },
    { href: 'admin-especialidades.html', text: 'Admin Especialidades' }
  ];

  let navHTML = '';

  
  navItems.forEach(item => {
    navHTML += `<li class="nav-item"><a class="nav-link" href="${item.href}">${item.text}</a></li>`;
  });

  if (isLoggedIn) {
   
    adminNavItems.forEach(item => {
      navHTML += `<li class="nav-item"><a class="nav-link fw-bold text-primary" href="${item.href}">${item.text}</a></li>`;
    });
    
    navHTML += `<li class="nav-item"><a class="nav-link btn btn-outline-danger btn-sm text-danger px-2" id="logoutBtn" href="#">Cerrar Sesión</a></li>`;
  } else {
  
    navHTML += `<li class="nav-item"><a class="nav-link" href="login.html">Iniciar Sesión</a></li>`;
  }

  navContainer.innerHTML = navHTML;

  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('loggedIn');
      window.location.href = 'index.html';
    });
  }
});