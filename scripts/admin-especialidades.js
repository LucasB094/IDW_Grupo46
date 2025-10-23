
if (localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

const getSpecialties = () => JSON.parse(localStorage.getItem('specialties')) || [];
const setSpecialties = (specialties) => localStorage.setItem('specialties', JSON.stringify(specialties));

const showSuccessMessage = (message) => {
  const msgEl = document.getElementById('successMessage');
  msgEl.textContent = message;
  msgEl.classList.remove('d-none');
  setTimeout(() => msgEl.classList.add('d-none'), 3000);
};

const renderTable = () => {
  const tbody = document.querySelector('#specialtiesTable tbody');
  tbody.innerHTML = '';
  const specialties = getSpecialties();
  
  if (specialties.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay especialidades registradas</td></tr>';
    return;
  }
  
  specialties.forEach(spec => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${spec.id}</td>
      <td>${spec.name}</td>
      <td>
        <button class="btn btn-warning btn-sm editBtn" data-id="${spec.id}" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm deleteBtn" data-id="${spec.id}" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

const showForm = (spec = {}) => {
  document.getElementById('formTitle').textContent = spec.id ? 'Modificar Especialidad' : 'Nueva Especialidad';
  document.getElementById('specialtyId').value = spec.id || '';
  document.getElementById('specialtyName').value = spec.name || '';
  document.getElementById('specialtyFormContainer').style.display = 'block';
  document.getElementById('specialtyFormContainer').scrollIntoView({ behavior: 'smooth' });
};

const hideForm = () => {
  document.getElementById('specialtyFormContainer').style.display = 'none';
  document.getElementById('specialtyForm').reset();
};

document.getElementById('newSpecialty').addEventListener('click', () => showForm());
document.getElementById('cancelForm').addEventListener('click', hideForm);

document.getElementById('specialtyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('specialtyId').value) || null;
  const newSpecialty = {
    id: id || (Math.max(...getSpecialties().map(s => s.id), 0) + 1),
    name: document.getElementById('specialtyName').value,
  };
  let specialties = getSpecialties();
  if (id) {
    specialties = specialties.map(s => s.id === id ? newSpecialty : s);
    showSuccessMessage('Especialidad actualizada correctamente');
  } else {
    specialties.push(newSpecialty);
    showSuccessMessage('Especialidad creada correctamente');
  }
  setSpecialties(specialties);
  renderTable();
  hideForm();
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.editBtn')) {
    const id = parseInt(e.target.closest('.editBtn').dataset.id);
    const spec = getSpecialties().find(s => s.id === id);
    showForm(spec);
  } else if (e.target.closest('.deleteBtn')) {
    if (confirm('¿Estás seguro de eliminar esta especialidad? (Esto podría afectar a médicos existentes)')) {
      const id = parseInt(e.target.closest('.deleteBtn').dataset.id);
      const specialties = getSpecialties().filter(s => s.id !== id);
      setSpecialties(specialties);
      renderTable();
      showSuccessMessage('Especialidad eliminada correctamente');
    }
  }
});

document.addEventListener('DOMContentLoaded', renderTable);