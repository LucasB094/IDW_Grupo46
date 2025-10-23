
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}


const getDoctors = () => JSON.parse(localStorage.getItem('doctors')) || [];
const setDoctors = (doctors) => localStorage.setItem('doctors', JSON.stringify(doctors));


const getSpecialties = () => JSON.parse(localStorage.getItem('specialties')) || [];

const showSuccessMessage = (message) => {
  const msgEl = document.getElementById('successMessage');
  msgEl.textContent = message;
  msgEl.classList.remove('d-none');
  setTimeout(() => msgEl.classList.add('d-none'), 3000);
};

const renderTable = () => {
  const tbody = document.querySelector('#doctorsTable tbody');
  tbody.innerHTML = '';
  const doctors = getDoctors();
  
  if (doctors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay médicos registrados</td></tr>';
    return;
  }
  
  doctors.forEach(doctor => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${doctor.id}</td>
      <td>${doctor.name}</td>
      <td>${doctor.specialty}</td>
      <td>
        <button class="btn btn-info btn-sm viewBtn" data-id="${doctor.id}" title="Ver detalles">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-warning btn-sm editBtn" data-id="${doctor.id}" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm deleteBtn" data-id="${doctor.id}" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};


const populateSpecialtiesSelect = () => {
  const specialties = getSpecialties();
  const select = document.getElementById('doctorSpecialty');
  select.innerHTML = ''; 
  
  if (specialties.length === 0) {
    select.innerHTML = '<option value="" disabled>No hay especialidades creadas</option>';
    return;
  }
  
  specialties.forEach(spec => {
    const option = document.createElement('option');
    option.value = spec.name;
    option.textContent = spec.name;
    select.appendChild(option);
  });
};

const showForm = (doctor = {}) => {
  document.getElementById('formTitle').textContent = doctor.id ? 'Modificar Médico' : 'Nuevo Médico';
  document.getElementById('doctorId').value = doctor.id || '';
  document.getElementById('doctorName').value = doctor.name || '';
  document.getElementById('doctorImage').value = doctor.image || '';
  document.getElementById('doctorInstagram').value = doctor.instagram || '';
  

  populateSpecialtiesSelect();
  document.getElementById('doctorSpecialty').value = doctor.specialty || '';
  
  document.getElementById('doctorFormContainer').style.display = 'block';
  document.getElementById('doctorFormContainer').scrollIntoView({ behavior: 'smooth' });
};

const hideForm = () => {
  document.getElementById('doctorFormContainer').style.display = 'none';
  document.getElementById('doctorForm').reset();
};

document.getElementById('newDoctor').addEventListener('click', () => showForm());
document.getElementById('cancelForm').addEventListener('click', hideForm);

document.getElementById('doctorForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('doctorId').value) || null;
  const newDoctor = {
    id: id || (Math.max(...getDoctors().map(d => d.id), 0) + 1),
    name: document.getElementById('doctorName').value,
    specialty: document.getElementById('doctorSpecialty').value, // Lee el valor del <select>
    image: document.getElementById('doctorImage').value,
    instagram: document.getElementById('doctorInstagram').value,
  };
  let doctors = getDoctors();
  if (id) {
    doctors = doctors.map(d => d.id === id ? newDoctor : d);
    showSuccessMessage('Médico actualizado correctamente');
  } else {
    doctors.push(newDoctor);
    showSuccessMessage('Médico creado correctamente');
  }
  setDoctors(doctors);
  renderTable();
  hideForm();
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.viewBtn')) {
    const id = parseInt(e.target.closest('.viewBtn').dataset.id);
    const doctor = getDoctors().find(d => d.id === id);
    document.getElementById('viewName').textContent = doctor.name;
    document.getElementById('viewSpecialty').textContent = doctor.specialty;
    document.getElementById('viewImage').textContent = doctor.image;
    document.getElementById('viewImagePreview').src = doctor.image;
    document.getElementById('viewInstagram').textContent = doctor.instagram;
    document.getElementById('viewInstagram').href = doctor.instagram;
    const modal = new bootstrap.Modal(document.getElementById('viewModal'));
    modal.show();
  } else if (e.target.closest('.editBtn')) {
    const id = parseInt(e.target.closest('.editBtn').dataset.id);
    const doctor = getDoctors().find(d => d.id === id);
    showForm(doctor);
  } else if (e.target.closest('.deleteBtn')) {
    if (confirm('¿Estás seguro de eliminar este médico?')) {
      const id = parseInt(e.target.closest('.deleteBtn').dataset.id);
      const doctors = getDoctors().filter(d => d.id !== id);
      setDoctors(doctors);
      renderTable();
      showSuccessMessage('Médico eliminado correctamente');
    }
  }
});

document.addEventListener('DOMContentLoaded', renderTable);