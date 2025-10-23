const darkModeToggle = document.getElementById('darkModeToggle');

if (darkModeToggle) {
  
  const lightIcon = '<i class="fas fa-sun"></i>';
  const darkIcon = '<i class="fas fa-moon"></i>';

 
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = lightIcon; 
  } else {
    document.body.classList.remove('dark-mode');
    darkModeToggle.innerHTML = darkIcon; 
  }

  
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
   
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    
   
    darkModeToggle.innerHTML = isDark ? lightIcon : darkIcon;
  });
}