// =======================================
//  scripts/admin-turnos.js
// =======================================

import './guard.js';

// Modales Bootstrap
const viewModal = new bootstrap.Modal(document.getElementById('viewTurnoModal'));
const formModal = new bootstrap.Modal(document.getElementById('turnoModal'));

// Storage helpers
const getTurnos   = () => JSON.parse(localStorage.getItem('turnos'))   || [];
const setTurnos   = (arr) => localStorage.setItem('turnos', JSON.stringify(arr));
const getDoctors  = () => JSON.parse(localStorage.getItem('doctors'))  || JSON.parse(localStorage.getItem('medicos')) || [];
const getReservas = () => JSON.parse(localStorage.getItem('reservas')) || [];

// UI helper
const ok = (t) => {
  const el = document.getElementById('successMessage');
  el.textContent = t;
  el.classList.remove('d-none');
  setTimeout(() => el.classList.add('d-none'), 2200);
};

// Dinero
function money(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
    .format(Number(n) || 0);
}


const VIRTUAL_DISCOUNTS = {
  'osde': 40,
  'swiss medical': 35,
  'galeno': 25,
  'medifé': 20,
  'medife': 20,
  'omint': 15,
  'osecac': 10,
  'sancor salud': 30,
  'jerárquicos salud': 20,
  'jerarquicos salud': 20,
  'ospe': 15,
  'prevención salud': 25,
  'prevencion salud': 25
};
const getVirtualPct = (name = '') => {
  const key = String(name || '').toLowerCase();
  const pct = VIRTUAL_DISCOUNTS[key] ?? 0;
  return Math.max(0, Math.min(pct, 50));
};


const getPrecioConsulta = () => {
  try {
    const cfg = JSON.parse(localStorage.getItem('config_clinica') || '{}');
    const val = Number(cfg.precioConsulta);
    return Number.isFinite(val) && val > 0 ? val : 30000;
  } catch { return 30000; }
};


function normalizeDoctor(d) {
  return {
    id: Number(d.id) || 0,
    name: d.name ?? d.nombre ?? '',
    specialty: d.specialty ?? d.especialidad ?? ''
  };
}
function normalizedDoctors() {
  return getDoctors().map(normalizeDoctor).filter(d => d.id && d.name);
}


function computePriceAndPct({ turno, reserva }) {
  const base = getPrecioConsulta();


  const obraNombre = reserva?.obraNombre ?? turno?.obraNombre ?? '-';
  let porcentaje = reserva?.porcentaje ?? turno?.porcentaje ?? 0;


  if (!porcentaje) porcentaje = getVirtualPct(obraNombre);


  let precioFinal = reserva?.precioFinal ?? turno?.precioFinal ?? null;


  if (porcentaje > 0 && (!precioFinal || Math.abs(Number(precioFinal) - base) < 1)) {
    precioFinal = Math.round(base * (1 - porcentaje / 100));
  }

  if (!precioFinal) precioFinal = base;

  return { obraNombre, porcentaje, precioFinal };
}


function renderTable() {
  const tbody = document.querySelector('#turnosTable tbody');
  const turnos = getTurnos();
  const reservas = getReservas();
  tbody.innerHTML = '';

  if (!turnos.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No hay turnos</td></tr>';
    return;
  }

  turnos.forEach(t => {
    const r = reservas.find(x => x.turnoId === t.id);
    const { obraNombre, porcentaje, precioFinal } = computePriceAndPct({ turno: t, reserva: r });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.id}</td>
      <td>${t.pacienteNombre ?? ''}</td>
      <td>${t.doctorNombre ?? ''}</td>
      <td>${t.especialidad ?? ''}</td>
      <td>${obraNombre && obraNombre !== '-' ? `${obraNombre} (${porcentaje}%)` : '-'}</td>
      <td>${money(precioFinal)}</td>
      <td>${t.fecha ?? ''}</td>
      <td>${t.hora ?? ''}</td>
      <td>${t.estado ?? ''}</td>
      <td class="text-end">
        <button class="btn btn-info btn-sm btn-ver" data-id="${t.id}" title="Ver"><i class="fas fa-eye"></i></button>
        <button class="btn btn-warning btn-sm btn-editar" data-id="${t.id}" title="Editar"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${t.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


function uniqueSpecialtiesFromDoctors() {
  const docs = normalizedDoctors();
  return [...new Set(docs.map(d => d.specialty).filter(Boolean))];
}

function fillEspecialidades() {
  const sel = document.getElementById('turnoEspecialidad');
  const list = uniqueSpecialtiesFromDoctors();
  sel.innerHTML = '';
  if (!list.length) {
    sel.innerHTML = '<option disabled selected>Primero cargue médicos</option>';
    return false;
  }
  sel.innerHTML = '<option value="" disabled selected>Seleccione una especialidad</option>';
  list.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
  return true;
}

function fillDoctorsFor(specName) {
  const sel = document.getElementById('turnoDoctor');
  const list = normalizedDoctors().filter(d => !specName || d.specialty === specName);
  sel.innerHTML = '';
  if (!list.length) {
    sel.innerHTML = '<option disabled selected>No hay doctores para esa especialidad</option>';
    return false;
  }
  sel.innerHTML = '<option value="" disabled selected>Seleccione un doctor</option>';
  list.forEach(d => {
    const opt = document.createElement('option');
    opt.value = String(d.id);
    opt.textContent = `${d.name} (${d.specialty})`;
    sel.appendChild(opt);
  });
  return true;
}


function showForm(turno = {}) {
  document.getElementById('turnoFormTitle').textContent = turno.id ? 'Editar Turno' : 'Nuevo Turno';

  document.getElementById('turnoId').value          = turno.id || '';
  document.getElementById('pacienteNombre').value   = turno.pacienteNombre || '';
  document.getElementById('pacienteEmail').value    = turno.pacienteEmail || '';
  document.getElementById('pacienteTelefono').value = turno.pacienteTelefono || '';

  const okEsp = fillEspecialidades();
  if (okEsp) document.getElementById('turnoEspecialidad').value = turno.especialidad || '';

  fillDoctorsFor(turno.especialidad || null);
  document.getElementById('turnoDoctor').value = turno.doctorId ? String(turno.doctorId) : '';

  document.getElementById('turnoFecha').value   = turno.fecha || '';
  document.getElementById('turnoHora').value    = turno.hora || '';
  document.getElementById('turnoEstado').value  = turno.estado || '';
  document.getElementById('turnoNotas').value   = turno.notas || '';

  const btn = document.querySelector('#turnoForm button[type="submit"]');
  btn.disabled = !okEsp || !normalizedDoctors().length;

  formModal.show();
}
function closeForm() { formModal.hide(); }


document.getElementById('newAppointment')?.addEventListener('click', () => showForm());

document.getElementById('turnoEspecialidad').addEventListener('change', (e) => {
  fillDoctorsFor(e.target.value);
});

document.getElementById('turnoForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const prev = getTurnos();
  const id   = parseInt(document.getElementById('turnoId').value) || null;

  const espec = document.getElementById('turnoEspecialidad').value;
  const docId = parseInt(document.getElementById('turnoDoctor').value);
  const doc   = normalizedDoctors().find(d => d.id === docId);

  const nuevo = {
    id: id || (Math.max(...prev.map(t => t.id), 0) + 1),
    pacienteNombre:   document.getElementById('pacienteNombre').value.trim(),
    pacienteEmail:    document.getElementById('pacienteEmail').value.trim(),
    pacienteTelefono: document.getElementById('pacienteTelefono').value.trim(),
    especialidad: espec,
    doctorId:     doc ? doc.id   : null,
    doctorNombre: doc ? doc.name : '',
    fecha:  document.getElementById('turnoFecha').value,
    hora:   document.getElementById('turnoHora').value,
    estado: document.getElementById('turnoEstado').value,
    notas:  document.getElementById('turnoNotas').value.trim(),


    obraNombre: (getTurnos().find(x => x.id === id)?.obraNombre) ?? null,
    porcentaje: (getTurnos().find(x => x.id === id)?.porcentaje) ?? null,
    precioBase: (getTurnos().find(x => x.id === id)?.precioBase) ?? null,
    precioFinal:(getTurnos().find(x => x.id === id)?.precioFinal) ?? null
  };


  const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevo.pacienteEmail);
  if (!nuevo.pacienteNombre) return alert('Nombre de paciente obligatorio');
  if (!mailOk)               return alert('Email inválido');
  if (!nuevo.pacienteTelefono || nuevo.pacienteTelefono.length < 6) return alert('Teléfono inválido');
  if (!nuevo.especialidad)   return alert('Seleccione especialidad');
  if (!nuevo.doctorId)       return alert('Seleccione doctor');
  if (!nuevo.fecha)          return alert('Fecha obligatoria');
  if (!nuevo.hora)           return alert('Hora obligatoria');
  if (!nuevo.estado)         return alert('Estado obligatorio');

  let out = prev;
  if (id) {
    out = out.map(t => t.id === id ? nuevo : t);
    ok('Turno actualizado');
  } else {
    out.push(nuevo);
    ok('Turno creado');
  }
  setTurnos(out);
  renderTable();
  closeForm();
});


document.addEventListener('click', (e) => {
  if (e.target.closest('.btn-ver')) {
    const id = parseInt(e.target.closest('.btn-ver').dataset.id);
    const t  = getTurnos().find(x => x.id === id);
    if (!t) return;

    const r = getReservas().find(x => x.turnoId === t.id);
    const { obraNombre, porcentaje, precioFinal } = computePriceAndPct({ turno: t, reserva: r });

    document.getElementById('vPaciente').textContent     = t.pacienteNombre ?? '';
    document.getElementById('vEmail').textContent        = t.pacienteEmail ?? '';
    document.getElementById('vTelefono').textContent     = t.pacienteTelefono ?? '';
    document.getElementById('vEspecialidad').textContent = t.especialidad ?? '';
    document.getElementById('vDoctor').textContent       = t.doctorNombre ?? '';
    document.getElementById('vFecha').textContent        = t.fecha ?? '';
    document.getElementById('vHora').textContent         = t.hora ?? '';
    document.getElementById('vEstado').textContent       = t.estado ?? '';
    document.getElementById('vNotas').textContent        = t.notas || '-';
    if (document.getElementById('vObra'))
      document.getElementById('vObra').textContent = obraNombre && obraNombre !== '-' ? `${obraNombre} (${porcentaje}%)` : '-';
    if (document.getElementById('vPrecio'))
      document.getElementById('vPrecio').textContent = money(precioFinal);

    viewModal.show();

  } else if (e.target.closest('.btn-editar')) {
    const id = parseInt(e.target.closest('.btn-editar').dataset.id);
    const t  = getTurnos().find(x => x.id === id);
    if (t) showForm(t);

  } else if (e.target.closest('.btn-eliminar')) {
    if (confirm('¿Eliminar este turno?')) {
      const id = parseInt(e.target.closest('.btn-eliminar').dataset.id);
      const out = getTurnos().filter(x => x.id !== id);
      setTurnos(out);
      renderTable();
      ok('Turno eliminado');
    }
  }
});


document.addEventListener('DOMContentLoaded', renderTable);
