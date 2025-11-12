
function ensureObrasSeed() {
  try {
    const raw = localStorage.getItem('obras');
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr) && arr.length > 0) return; 

    const seedNames = [
      'OSDE','Swiss Medical','Galeno','Medifé','Omint',
      'OSECAC','Sancor Salud','Jerárquicos Salud','OSPE','Prevención Salud'
    ];
    const seed = seedNames.map((name, i) => ({
      id: i + 1,
      name,
      porcentaje: 0 
    }));
    localStorage.setItem('obras', JSON.stringify(seed));
  } catch (e) {
    console.warn('No se pudo sembrar obras:', e);
  }
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
const clampPct = p => Math.max(0, Math.min(Number(p) || 0, 50));
const getVirtualPct = (name='') => clampPct(VIRTUAL_DISCOUNTS[name.toLowerCase()] ?? 0);


const lsGet = (k, def = []) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
};
const getTurnos   = () => lsGet('turnos');
const setTurnos   = (arr) => localStorage.setItem('turnos', JSON.stringify(arr));
const getReservas = () => lsGet('reservas');
const setReservas = (arr) => localStorage.setItem('reservas', JSON.stringify(arr));


const getPrecioConsulta = () => {
  const cfgRaw = localStorage.getItem('config_clinica');
  let val = 30000;
  try {
    const cfg = cfgRaw ? JSON.parse(cfgRaw) : {};
    const n = Number(cfg.precioConsulta);
    if (Number.isFinite(n) && n > 0) val = n;
  } catch {}
  return val;
};


function getDoctorsRaw() {
  const d1 = lsGet('doctors');
  const d2 = lsGet('medicos');
  return (Array.isArray(d1) && d1.length ? d1 : d2);
}
function normalizeDoctor(d) {
  return {
    id: Number(d.id) || 0,
    name: d.name ?? d.nombre ?? '',
    specialty: d.specialty ?? d.especialidad ?? '',
    image: d.image ?? d.imagen ?? '',
    instagram: d.instagram ?? d.ig ?? ''
  };
}
function getDoctors() {
  return getDoctorsRaw().map(normalizeDoctor).filter(d => d.name && d.specialty);
}


function uniqueSpecialtiesFromDoctors() {
  const docs = getDoctors();
  return [...new Set(docs.map(d => d.specialty).filter(Boolean))].sort();
}

function fillEspecialidades() {
  const sel = document.getElementById('aEspecialidad');
  if (!sel) return false;

  const list = uniqueSpecialtiesFromDoctors();
  sel.innerHTML = '';

  if (!list.length) {
    sel.innerHTML = '<option disabled selected>No hay médicos disponibles</option>';
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

function fillDoctorsFor(spec) {
  const sel = document.getElementById('aDoctor');
  if (!sel) return false;

  const docs = getDoctors().filter(d => !spec || d.specialty === spec);
  sel.innerHTML = '';

  if (!docs.length) {
    sel.innerHTML = '<option disabled selected>No hay doctores para esa especialidad</option>';
    return false;
  }

  sel.innerHTML = '<option value="" disabled selected>Seleccione un doctor</option>';
  docs.forEach(d => {
    const opt = document.createElement('option');
    opt.value = String(d.id);
    opt.textContent = `${d.name} (${d.specialty})`;
    sel.appendChild(opt);
  });
  return true;
}


function fillObras() {
  const sel = document.getElementById('aObra');
  if (!sel) return false;

  const list = lsGet('obras', []);
  sel.innerHTML = '';
  if (!Array.isArray(list) || !list.length) {
    sel.innerHTML = '<option disabled selected>No hay obras sociales cargadas</option>';
    return false;
  }

  sel.innerHTML = '<option value="" disabled selected>Seleccione una obra social</option>';
  list.forEach(o => {
    const pct = getVirtualPct(o.name);
    const opt = document.createElement('option');
    opt.value = String(o.id);
    opt.textContent = `${o.name} (${pct}% desc.)`;
    sel.appendChild(opt);
  });
  return true;
}


function actualizarPrecio() {
  const base = getPrecioConsulta();
  const obraSel = document.getElementById('aObra');
  const out = document.getElementById('aPrecio');
  if (!obraSel || !out) return { base, final: base, obra: null, pct: 0 };

  const obras = lsGet('obras', []);
  const obra = obras.find(o => String(o.id) === obraSel.value) || null;

  const pct = obra ? getVirtualPct(obra.name) : 0;
  const final = Math.round(base * (1 - pct / 100));

  out.value = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(final);
  return { base, final, obra, pct };
}


const emailOk = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');


document.addEventListener('DOMContentLoaded', () => {
  ensureObrasSeed();

  const okEsp = fillEspecialidades();
  if (okEsp) {
    const selEsp = document.getElementById('aEspecialidad');
    selEsp?.addEventListener('change', (e) => fillDoctorsFor(e.target.value));
  }

  const pre = document.getElementById('aEspecialidad')?.value;
  if (pre) fillDoctorsFor(pre);

  const okObra = fillObras();
  if (okObra) document.getElementById('aObra')?.addEventListener('change', actualizarPrecio);
  actualizarPrecio();

  const form = document.getElementById('agendarForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const espec = document.getElementById('aEspecialidad')?.value || '';
    const docId = parseInt(document.getElementById('aDoctor')?.value || '', 10);
    const docs  = getDoctors();
    const doc   = docs.find(d => d.id === docId);

    const base = getPrecioConsulta();
    const obraSel = document.getElementById('aObra');
    const obra = lsGet('obras', []).find(o => String(o.id) === obraSel?.value) || null;
    const pct = obra ? getVirtualPct(obra.name) : 0;
    const final = Math.round(base * (1 - pct / 100));

    if (!obra) return alert('Seleccione obra social');

    const nuevoTurno = {
      id: (Math.max(0, ...getTurnos().map(t => t.id)) + 1),
      pacienteNombre:   document.getElementById('aNombre')?.value.trim() || '',
      pacienteEmail:    document.getElementById('aEmail')?.value.trim()  || '',
      pacienteTelefono: document.getElementById('aTel')?.value.trim()    || '',
      especialidad: espec,
      doctorId:     doc?.id || null,
      doctorNombre: doc?.name || '',
      fecha:  document.getElementById('aFecha')?.value || '',
      hora:   document.getElementById('aHora')?.value  || '',
      estado: 'Pendiente',
      notas:  document.getElementById('aNotas')?.value.trim() || '',
      obraNombre: obra.name,
      porcentaje: pct,
      precioBase: base,
      precioFinal: final
    };

    if (!nuevoTurno.pacienteNombre) return alert('Nombre obligatorio');
    if (!emailOk(nuevoTurno.pacienteEmail)) return alert('Email inválido');
    if (!nuevoTurno.pacienteTelefono || nuevoTurno.pacienteTelefono.length < 6) return alert('Teléfono inválido');
    if (!nuevoTurno.especialidad) return alert('Seleccione especialidad');
    if (!nuevoTurno.doctorId) return alert('Seleccione doctor');
    if (!nuevoTurno.fecha) return alert('Fecha obligatoria');
    if (!nuevoTurno.hora) return alert('Hora obligatoria');

    const prevT = getTurnos();
    setTurnos([...prevT, nuevoTurno]);

    const prevR = getReservas();
    const nuevaReserva = {
      id: (Math.max(0, ...prevR.map(r => r.id)) + 1),
      turnoId: nuevoTurno.id,
      obraId: obra.id,
      obraNombre: obra.name,
      porcentaje: pct,
      precioBase: base,
      precioFinal: final,
      fecha: nuevoTurno.fecha,
      hora:  nuevoTurno.hora,
      pacienteEmail: nuevoTurno.pacienteEmail,
      estado: nuevoTurno.estado
    };
    setReservas([...prevR, nuevaReserva]);

    const ok = document.getElementById('agendarOk');
    ok?.classList.remove('d-none');
    setTimeout(() => ok?.classList.add('d-none'), 2500);

    form.reset();
    const precioOut = document.getElementById('aPrecio');
    if (precioOut) precioOut.value = '$ -';
  });
});
