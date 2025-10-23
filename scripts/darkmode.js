const darkModeToggle = document.getElementById('darkModeToggle');

if (darkModeToggle) {
  
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '☀️ Modo Claro';
  }

  
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    
    
    darkModeToggle.innerHTML = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
  });
}