
import './guard.js';


const PAGE_SIZE = 10;
const API_URL = 'https://dummyjson.com/users?limit=100';


let ALL = [];
let VIEW = [];
let page = 1;


const tbody       = document.querySelector('#usersTable tbody');
const usersCount  = document.getElementById('usersCount');
const pageInfo    = document.getElementById('pageInfo');
const prevBtn     = document.getElementById('prevPage');
const nextBtn     = document.getElementById('nextPage');
const searchInput = document.getElementById('userSearch');
const reloadBtn   = document.getElementById('reloadBtn');
const errorBox    = document.getElementById('errorMessage');

const userViewModal = new bootstrap.Modal(document.getElementById('userViewModal'));
const vId       = document.getElementById('vId');
const vNombre   = document.getElementById('vNombre');
const vUsername = document.getElementById('vUsername');
const vEmpresa  = document.getElementById('vEmpresa');
const vPuesto   = document.getElementById('vPuesto');


function sanitizeUser(u) {
  const fullName = [u?.firstName, u?.lastName].filter(Boolean).join(' ');
  return {
    id: u.id,
    fullName: fullName || '(sin nombre)',
    username: u.username || '(sin usuario)',
    companyName: u.company?.name || '(sin empresa)',
    companyTitle: u.company?.title || '(sin puesto)',
  };
}

function render() {
  const total = VIEW.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) page = totalPages;

  const start = (page - 1) * PAGE_SIZE;
  const list  = VIEW.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = '';
  if (!list.length) {
    tbody.innerHTML = `
      <tr><td colspan="6" class="text-center text-muted py-4">Sin resultados</td></tr>`;
  } else {
    list.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.fullName}</td>
        <td>${u.username}</td>
        <td>${u.companyName}</td>
        <td>${u.companyTitle}</td>
        <td class="text-end">
          <button class="btn btn-info btn-sm btn-ver" data-id="${u.id}">
            <i class="fa-solid fa-eye"></i>
          </button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  usersCount.textContent = `${total} usuario${total === 1 ? '' : 's'} encontrados`;
  pageInfo.textContent   = `${page}/${totalPages}`;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
}

function applyFilter(q) {
  const t = (q || '').toLowerCase();
  VIEW = ALL.filter(u =>
    u.fullName.toLowerCase().includes(t) ||
    u.username.toLowerCase().includes(t) ||
    u.companyName.toLowerCase().includes(t)
  );
  page = 1;
  render();
}


async function loadUsers() {
  errorBox?.classList.add('d-none');
  tbody.innerHTML = `
    <tr><td colspan="6" class="text-center text-muted py-4">Cargando usuarios…</td></tr>`;

  try {
    
    console.log('[usuarios] Haciendo fetch a:', API_URL);
    const res = await fetch(API_URL, { cache: 'no-store' });
    console.log('[usuarios] status:', res.status);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data || !Array.isArray(data.users)) {
      console.error('[usuarios] Respuesta inesperada:', data);
      throw new Error('Formato inesperado de la API');
    }

    ALL  = data.users.map(sanitizeUser);
    VIEW = ALL.slice();
    page = 1;
    render();
  } catch (e) {
    console.error('[usuarios] Error al cargar:', e);
    tbody.innerHTML = `
      <tr><td colspan="6" class="text-center text-danger py-4">
        No se pudieron cargar los usuarios desde dummyjson.com
      </td></tr>`;
    if (errorBox) {
      errorBox.textContent = 'No se pudieron cargar los usuarios desde dummyjson.com. Reintentá más tarde.';
      errorBox.classList.remove('d-none');
    }
  }
}


searchInput?.addEventListener('input', e => applyFilter(e.target.value));
prevBtn?.addEventListener('click', () => { if (page > 1) { page--; render(); } });
nextBtn?.addEventListener('click', () => { page++; render(); });
reloadBtn?.addEventListener('click', loadUsers);

document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-ver');
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);
  const u = ALL.find(x => x.id === id);
  if (!u) return;
  vId.textContent       = u.id;
  vNombre.textContent   = u.fullName;
  vUsername.textContent = u.username;
  vEmpresa.textContent  = u.companyName;
  vPuesto.textContent   = u.companyTitle;
  userViewModal.show();
});

document.addEventListener('DOMContentLoaded', loadUsers);
