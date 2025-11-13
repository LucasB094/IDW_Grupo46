
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


const getSpecialties = () => {
  try {
    const es = localStorage.getItem('especialidades');
    const en = localStorage.getItem('specialties');
    const raw = es || en || '[]';
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.map(e => ({ id: e.id, name: e.name ?? e.nombre ?? '' })) : [];
  } catch { return []; }
};


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
      <td class="fw-semibold">${d.name || ''}</td>
      <td>${d.specialty || ''}</td>
      <td>${d.matricula || ''}</td>
      <td>${d.email || ''}</td>
      <td>${d.phone || ''}</td>
      <td>${d.horario || ''}</td>
      <td>${d.obras || ''}</td>
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


function validateDoctor(d) {
  if (!d.name?.trim()) return 'Nombre requerido';
  if (!d.specialty?.trim()) return 'Especialidad requerida';
  if (!d.matricula?.trim()) return 'Matrícula requerida';
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return 'Email inválido';
  return null;
}


document.getElementById('doctorForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById('doctorId').value || '0', 10);

  const doc = {
    id,
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

  const err = validateDoctor(doc);
  if (err) { alert(err); return; }

  const arr = getDoctors();
  if (id) {
    const idx = arr.findIndex(x => x.id === id);
    if (idx >= 0) arr[idx] = doc;
  } else {
    doc.id = Math.max(0, ...arr.map(x => x.id)) + 1;
    arr.push(doc);
  }

  setDoctors(arr);
  renderTable();
  modalMedico.hide();
  showSuccessMessage('Médico guardado correctamente');
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


document.getElementById('newDoctor')?.addEventListener('click', () => {
  
  document.getElementById('doctorForm').reset();
  document.getElementById('doctorId').value = '';
  
  populateSpecialtiesSelect();
  modalMedico.show();
});


document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
  const arr = getDoctors();
  if (!arr.length) { alert('No hay datos para exportar'); return; }

  const head = ['id','name','specialty','matricula','email','phone','horario','obras','image','instagram'];
  const csv = [head.join(',')].concat(arr.map(d => head.map(k => `"${String(d[k] ?? '').replace(/"/g,'""')}"`).join(','))).join('\n');

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
