document.addEventListener('DOMContentLoaded', () => {
 
  if (localStorage.getItem('loggedIn') === 'true') {
    window.location.href = 'admin.html';
  }



  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
    
      const username = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
     
      if (username === 'admin' && password === '1234') {
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'admin.html';
      } else {
        alert('Credenciales incorrectas');
      }
    });
  }
});