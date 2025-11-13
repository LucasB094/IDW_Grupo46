import './guard.js';

const modalMedicoEl = document.getElementById('doctorModal');
const modalMedico = new bootstrap.Modal(modalMedicoEl);
const modalVer = new bootstrap.Modal(document.getElementById('viewModal'));

const getDoctors = () => JSON.parse(localStorage.getItem('doctors')) || [];
const setDoctors = (arr) => {
  localStorage.setItem('doctors', JSON.stringify(arr));
  const espejo = arr.map(d => ({
    id: d.id,
    nombre: d.name,
    especialidad: d.specialty,
    matricula: d.matricula,
    correo: d.email,
    telefono: d.phone,
    horario: d.horario,
    obras: d.obras,
    imagen: d.image,
    instagram: d.instagram
  }));
  localStorage.setItem('doctores', JSON.stringify(espejo));
};

const getSpecialties = () => JSON.parse(localStorage.getItem('specialties')) || [];

function migrateDoctors() {
  const en = JSON.parse(localStorage.getItem('doctors') || '[]');
  const es = JSON.parse(localStorage.getItem('doctores') || '[]');
  let base = en.length ? en : es;

  const migrated = base.map(d => ({
    id: d.id,
    name: d.name ?? d.nombre ?? '',
    specialty: d.specialty ?? d.especialidad ?? '',
    matricula: d.matricula ?? '',
    email: d.email ?? d.correo ?? '',
    phone: d.phone ?? d.telefono ?? '',
    horario: d.horario ?? '',
    obras: d.obras ?? '',
    image: d.image ?? d.imagen ?? '',
    instagram: d.instagram ?? ''
  }));

  setDoctors(migrated); 
}

const showSuccessMessage = (txt) => {
  const el = document.getElementById('successMessage');
  el.textContent = txt;
  el.classList.remove('d-none');
  setTimeout(() => el.classList.add('d-none'), 2500);
};

function renderTable() {
  const tbody = document.querySelector('#doctorsTable tbody');
  tbody.innerHTML = '';
  const docs = getDoctors();

  if (!docs.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay médicos cargados</td></tr>';
    return;
  }

  docs.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.id}</td>
      <td>${d.name}</td>
      <td>${d.specialty}</td>
      <td>${d.matricula || '-'}</td>
      <td>${d.email || '-'}</td>
      <td>${d.phone || '-'}</td>
      <td>${d.horario || '-'}</td>
      <td>${d.obras || '-'}</td>
      <td class="text-end">
        <button class="btn btn-info btn-sm btn-ver" data-id="${d.id}" title="Ver"><i class="fas fa-eye"></i></button>
        <button class="btn btn-warning btn-sm btn-editar" data-id="${d.id}" title="Editar"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${d.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateSpecialtiesSelect() {
  const list = getSpecialties();
  const sel = document.getElementById('doctorSpecialty');
  sel.innerHTML = '';

  if (!list.length) {
    sel.innerHTML = '<option disabled selected>No hay especialidades. Cargue una primero.</option>';
    return false;
  }
  sel.innerHTML = '<option value="" disabled selected>Seleccione una especialidad</option>';
  list.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    sel.appendChild(opt);
  });
  return true;
}

function mostrarFormulario(doctor = {}) {
  document.getElementById('formTitle').textContent = doctor.id ? 'Modificar Médico' : 'Nuevo Médico';

  document.getElementById('doctorId').value = doctor.id || '';
  document.getElementById('doctorName').value = doctor.name || '';
  document.getElementById('doctorImage').value = doctor.image || '';
  document.getElementById('doctorInstagram').value = doctor.instagram || '';

  document.getElementById('doctorMatricula').value = doctor.matricula || '';
  document.getElementById('doctorEmail').value = doctor.email || '';
  document.getElementById('doctorPhone').value = doctor.phone || '';
  document.getElementById('doctorHorario').value = doctor.horario || '';
  document.getElementById('doctorObras').value = doctor.obras || '';

  const ok = populateSpecialtiesSelect();
  document.getElementById('doctorSpecialty').value = doctor.specialty || '';

  const submitBtn = document.querySelector('#doctorForm button[type="submit"]');
  if (submitBtn) submitBtn.disabled = !ok;

  modalMedico.show();
}

function cerrarFormulario() {
  modalMedico.hide();
}

function validateDoctor(d, doctors) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
  const phoneOk = d.phone && d.phone.trim().length >= 6;
  const nameOk = d.name && d.name.trim().length >= 3;
  const specOk = !!d.specialty;
  const matOk = d.matricula && d.matricula.trim().length >= 3;

  if (!nameOk) throw new Error('Nombre inválido');
  if (!specOk) throw new Error('Seleccione especialidad');
  if (!matOk) throw new Error('Matrícula obligatoria');
  if (!emailOk) throw new Error('Email inválido');
  if (!phoneOk) throw new Error('Teléfono inválido');

  const dup = doctors.find(x => x.matricula === d.matricula && x.id !== d.id);
  if (dup) throw new Error('La matrícula ya existe');
}

modalMedicoEl.addEventListener('hidden.bs.modal', () => {
  document.getElementById('doctorForm').reset();
  const submitBtn = document.querySelector('#doctorForm button[type="submit"]');
  if (submitBtn) submitBtn.disabled = false;
});

document.getElementById('newDoctor')?.addEventListener('click', () => {
  mostrarFormulario();
});

document.getElementById('doctorForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const prev = getDoctors();
  const id = parseInt(document.getElementById('doctorId').value) || null;

  const nuevo = {
    id: id || (Math.max(...prev.map(d => d.id), 0) + 1),
    name: document.getElementById('doctorName').value.trim(),
    specialty: document.getElementById('doctorSpecialty').value,
    matricula: document.getElementById('doctorMatricula').value.trim(),
    email: document.getElementById('doctorEmail').value.trim(),
    phone: document.getElementById('doctorPhone').value.trim(),
    horario: document.getElementById('doctorHorario').value.trim(),
    obras: document.getElementById('doctorObras').value.trim(),
    image: document.getElementById('doctorImage').value.trim(),
    instagram: document.getElementById('doctorInstagram').value.trim()
  };

  try {
    validateDoctor(nuevo, prev);
  } catch (err) {
    alert(err.message);
    return;
  }

  let out = prev;
  if (id) {
    out = out.map(d => d.id === id ? nuevo : d);
    showSuccessMessage('Médico actualizado');
  } else {
    out.push(nuevo);
    showSuccessMessage('Médico creado');
  }
  setDoctors(out);
  renderTable();
  cerrarFormulario();
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.btn-ver')) {
    const id = parseInt(e.target.closest('.btn-ver').dataset.id);
    const d = getDoctors().find(x => x.id === id);
    if (!d) return;

    document.getElementById('viewName').textContent = d.name || '';
    document.getElementById('viewSpecialty').textContent = d.specialty || '';
    document.getElementById('viewImage').textContent = d.image || '(sin imagen)';
    document.getElementById('viewImagePreview').src = d.image || '';
    const insta = document.getElementById('viewInstagram');
    insta.textContent = d.instagram || '';
    insta.href = d.instagram && /^https?:\/\//i.test(d.instagram) ? d.instagram : '#';

    modalVer.show();

  } else if (e.target.closest('.btn-editar')) {
    const id = parseInt(e.target.closest('.btn-editar').dataset.id);
    const d = getDoctors().find(x => x.id === id);
    if (!d) return;
    mostrarFormulario(d);

  } else if (e.target.closest('.btn-eliminar')) {
    if (confirm('¿Eliminar este médico?')) {
      const id = parseInt(e.target.closest('.btn-eliminar').dataset.id);
      const out = getDoctors().filter(x => x.id !== id);
      setDoctors(out);
      renderTable();
      showSuccessMessage('Médico eliminado');
    }
  }
});

document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
  const cols = ['id','name','specialty','matricula','email','phone','horario','obras','image','instagram'];
  const rows = getDoctors().map(d => cols.map(c => (d[c] ?? '').toString().replace(/"/g, '""')));
  const csv = [ cols.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(',')) ].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'medicos.csv'; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showSuccessMessage('Archivo CSV generado');
});

document.addEventListener('DOMContentLoaded', () => {
  migrateDoctors();
  renderTable();
});
