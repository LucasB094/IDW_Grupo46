const renderProfessionals = () => {
  
  const doctors = JSON.parse(localStorage.getItem('doctors')) || [];
  const container = document.getElementById('professionalsContainer');
  
  
  container.innerHTML = '';
  
  if (doctors.length > 0) {
    doctors.forEach(doctor => {
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-4 hover-lift">
          <img src="${doctor.image}" class="card-img-top rounded-top" alt="${doctor.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title fw-bold">${doctor.name}</h5>
            <p class="card-text">${doctor.specialty}</p>
            <a href="${doctor.instagram}" class="btn btn-outline-primary mt-auto rounded-pill" target="_blank">
              <i class="fab fa-instagram me-2"></i> Instagram
            </a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  } else {
  
    container.innerHTML = '<p class="text-center text-muted">No hay profesionales disponibles en este momento.</p>';
  }
};


document.addEventListener('DOMContentLoaded', renderProfessionals);