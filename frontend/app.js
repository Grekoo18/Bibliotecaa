const API_BASE = localStorage.getItem('biblioteca_api') || 'http://localhost:3001';

const ACCESS = {
  admin: {
    email: 'admin@biblioteca.local',
    password: 'Admin123!',
    label: 'Administrador',
    nombre: 'Administrador',
    rol: 'admin',
    permissions: [
      'Gestionar usuarios',
      'Agregar y retirar libros',
      'Ver registros',
      'Gestionar prestamos',
    ],
  },
  bibliotecario: {
    email: 'bibliotecario@biblioteca.local',
    password: 'Biblio123!',
    label: 'Bibliotecario',
    nombre: 'Bibliotecario',
    rol: 'bibliotecario',
    permissions: [
      'Agregar y retirar libros',
      'Registrar prestamos',
      'Registrar devoluciones',
      'Consultar actividad',
    ],
  },
  usuario: {
    email: 'usuario@biblioteca.local',
    password: 'Usuario123!',
    label: 'Cliente',
    nombre: 'Cliente',
    rol: 'usuario',
    tipoPersona: 'INVITADO',
    permissions: [
      'Ver libros',
      'Pedir libros',
      'Devolver libros',
      'Prestamo maximo de 10 dias',
    ],
  },
  maestro: {
    email: 'maestro@biblioteca.local',
    password: 'Maestro123!',
    label: 'Maestro',
    nombre: 'Maestro',
    rol: 'usuario',
    tipoPersona: 'DOCENTE',
    permissions: ['Ver libros', 'Pedir libros', 'Prestamos gratuitos'],
  },
  estudiante: {
    email: 'estudiante@biblioteca.local',
    password: 'Estudiante123!',
    label: 'Estudiante',
    nombre: 'Estudiante',
    rol: 'usuario',
    tipoPersona: 'ESTUDIANTE',
    permissions: ['Ver libros', 'Pedir libros', '50% de descuento en prestamo'],
  },
};

const state = {
  token: localStorage.getItem('biblioteca_token') || '',
  user: JSON.parse(localStorage.getItem('biblioteca_user') || 'null'),
  books: [],
  users: [],
  loans: [],
};

const demoBooks = [
  {
    id: 1,
    codigo: 'INF-001',
    titulo: 'Fundamentos de Programacion',
    autor: 'Luis Joyanes Aguilar',
    programa: 'Desarrollo de Software',
    categoria: 'Informatica',
    descripcion: 'Introduccion practica a algoritmos y pensamiento computacional.',
    disponibles: 6,
    totalEjemplares: 6,
  },
  {
    id: 2,
    codigo: 'ADM-014',
    titulo: 'Administracion Moderna',
    autor: 'Stephen Robbins',
    programa: 'Gestion Empresarial',
    categoria: 'Administracion',
    descripcion: 'Gestion, liderazgo, control y toma de decisiones.',
    disponibles: 4,
    totalEjemplares: 4,
  },
  {
    id: 3,
    codigo: 'CON-022',
    titulo: 'Contabilidad General',
    autor: 'Pedro Zapata Sanchez',
    programa: 'Contabilidad y Auditoria',
    categoria: 'Contabilidad',
    descripcion: 'Registro contable y estados financieros.',
    disponibles: 5,
    totalEjemplares: 5,
  },
  {
    id: 4,
    codigo: 'EDU-008',
    titulo: 'Didactica General',
    autor: 'Antonio Medina Rivilla',
    programa: 'Educacion Basica',
    categoria: 'Educacion',
    descripcion: 'Planificacion y evaluacion del aprendizaje.',
    disponibles: 3,
    totalEjemplares: 3,
  },
  {
    id: 5,
    codigo: 'MAT-030',
    titulo: 'Matematica Aplicada',
    autor: 'Erwin Kreyszig',
    programa: 'Ciencias Basicas',
    categoria: 'Matematica',
    descripcion: 'Herramientas matematicas para resolver problemas tecnicos.',
    disponibles: 4,
    totalEjemplares: 4,
  },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function getAccessByEmail(email) {
  return Object.values(ACCESS).find(
    (access) => access.email.toLowerCase() === email.toLowerCase(),
  );
}

function startLocalSession(access) {
  state.token = `demo-${access.rol}`;
  state.user = {
    id:
      access.rol === 'admin'
        ? 1
        : access.rol === 'bibliotecario'
          ? 2
          : access.tipoPersona === 'DOCENTE'
            ? 4
            : access.tipoPersona === 'ESTUDIANTE'
              ? 5
              : 3,
    nombre: access.nombre,
    email: access.email,
    rol: access.rol,
    tipoPersona: access.tipoPersona,
  };
  localStorage.setItem('biblioteca_token', state.token);
  localStorage.setItem('biblioteca_user', JSON.stringify(state.user));
}

function isAdmin() {
  return state.user?.rol === 'admin';
}

function isStaff() {
  return ['admin', 'bibliotecario'].includes(state.user?.rol);
}

function isUserRole() {
  return state.user?.rol === 'usuario';
}

function setStatus(message, isError = false) {
  $('#statusMessage').textContent = message;
  $('#statusStrip').classList.toggle('error', isError);
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const detail = await response.text();
    let message = `Error ${response.status}`;
    try {
      const parsed = JSON.parse(detail);
      message = parsed.message || parsed.error || message;
    } catch {
      message = detail || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function updateRoleUi() {
  const role = state.user?.rol || 'invitado';
  const access = (state.user?.email && getAccessByEmail(state.user.email)) || ACCESS[role] || {
    label: 'Invitado',
    permissions: ['Seleccionar un perfil', 'Consultar demo del catalogo'],
  };

  $('#sessionName').textContent = state.user?.nombre || access.label;
  $('#sessionRole').textContent = role === 'invitado' ? 'Sin iniciar sesion' : role;
  $('#permissionTitle').textContent = access.label;
  $('#permissionList').innerHTML = access.permissions.map((item) => `<li>${item}</li>`).join('');
  $('#logoutButton').classList.toggle('hidden', !state.token);
  $('#loginBoard').classList.toggle('hidden', Boolean(state.token));
  $('#loginForm').classList.toggle('hidden', Boolean(state.token));

  $$('.requires-admin').forEach((item) => item.classList.toggle('hidden', !isAdmin()));
  $$('.requires-staff').forEach((item) => item.classList.toggle('hidden', !isStaff()));
  $$('.requires-login').forEach((item) => item.classList.toggle('hidden', !state.token));
  $$('.admin-only').forEach((item) => item.classList.toggle('hidden', !isAdmin()));
  $$('.staff-only').forEach((item) => item.classList.toggle('hidden', !isStaff()));
  $$('.user-only').forEach((item) => item.classList.toggle('hidden', !isUserRole()));

  $('#roleHeadline').textContent =
    role === 'admin'
      ? 'Panel de administracion'
      : role === 'bibliotecario'
        ? 'Mesa de trabajo del bibliotecario'
        : role === 'usuario'
          ? 'Portal de solicitud'
          : 'Gestiona la biblioteca sin complicarte';

  $('#roleDescription').textContent =
    role === 'admin'
      ? 'Tienes acceso a usuarios, catalogo, prestamos y registros.'
      : role === 'bibliotecario'
        ? 'Puedes agregar libros, retirar libros y controlar prestamos.'
        : role === 'usuario'
          ? 'Puedes ver libros, revisar disponibilidad y solicitar prestamos.'
          : 'Elige un perfil de acceso. La interfaz cambia segun los permisos de cada rol.';
}

function renderMetrics() {
  const available = state.books.reduce((sum, book) => sum + Number(book.disponibles || 0), 0);
  $('#totalBooks').textContent = state.books.length;
  $('#availableBooks').textContent = available;
  $('#activeLoans').textContent = state.loans.length;
  $('#totalUsers').textContent = state.users.length;
}

function renderPrograms(programs) {
  const list = $('#programList');
  if (!programs.length) {
    list.innerHTML = '<p>No hay programas registrados todavia.</p>';
    return;
  }
  const max = Math.max(...programs.map((item) => item.total));
  list.innerHTML = programs
    .slice(0, 8)
    .map((item) => {
      const width = Math.max(8, Math.round((item.total / max) * 100));
      return `
        <div class="program-row">
          <div>
            <strong>${item.programa || 'Sin programa'}</strong>
            <div class="bar"><span style="width:${width}%"></span></div>
          </div>
          <span>${item.total}</span>
        </div>
      `;
    })
    .join('');
}

function renderProgramOptions(programs) {
  $('#programFilter').innerHTML =
    '<option value="">Todos los programas</option>' +
    programs.map((program) => `<option value="${program}">${program}</option>`).join('');
}

function renderBooks(books = state.books) {
  const grid = $('#bookGrid');
  if (!books.length) {
    grid.innerHTML = '<p>No se encontraron libros.</p>';
    return;
  }

  grid.innerHTML = books
    .map(
      (book) => `
        <article class="book-card">
          <div>
            <strong>${book.titulo}</strong>
            <div class="book-meta">
              <span>${book.autor || 'Autor no registrado'}</span>
              <span>${book.codigo}</span>
            </div>
          </div>
          <p>${book.descripcion || 'Sin descripcion.'}</p>
          <div class="book-meta">
            <span>${book.programa || 'Sin programa'}</span>
            <span>${book.categoria || 'Sin categoria'}</span>
          </div>
          <div class="stock">
            <span>ID ${book.id}</span>
            <strong>${book.disponibles}/${book.totalEjemplares} disponibles</strong>
          </div>
          ${
            isStaff()
              ? `<button class="danger" data-delete-book="${book.id}">Retirar libro</button>`
              : isUserRole()
                ? `<button data-request-book="${book.id}">Solicitar prestamo</button>`
              : ''
          }
        </article>
      `,
    )
    .join('');
}

function renderLoans() {
  const rows = $('#loanRows');
  if (!state.loans.length) {
    rows.innerHTML = '<tr><td colspan="4">No hay prestamos activos.</td></tr>';
    return;
  }

  rows.innerHTML = state.loans
    .map(
      (loan) => `
      <tr>
        <td>${loan.usuario?.nombre || 'Usuario #' + loan.usuarioId}</td>
        <td>${loan.libro?.titulo || 'Libro #' + loan.libroId}</td>
        <td>${formatDate(loan.fechaPrestamo)}</td>
        <td><button data-return-loan="${loan.id}">Devolver</button></td>
      </tr>
    `,
    )
    .join('');
}

function renderUsers(users = state.users) {
  const list = $('#userList');
  if (!users.length) {
    list.innerHTML = '<p>No hay usuarios registrados.</p>';
    return;
  }
  list.innerHTML = users
    .map(
      (user) => `
      <article class="user-card">
        <strong>${user.nombre}</strong>
        <div class="user-meta">
          <span>ID ${user.id}</span>
          <span>${user.tipoPersona}</span>
          <span>${user.rol}</span>
          <span>${user.email || 'Sin correo'}</span>
        </div>
      </article>
    `,
    )
    .join('');
}

function renderRecords(records, stats) {
  $('#recordSummary').innerHTML = `
    <div class="summary-box"><strong>${stats.totalVisitas || 0}</strong><br />Visitas</div>
    <div class="summary-box"><strong>${stats.usos || 0}</strong><br />Usos</div>
    <div class="summary-box"><strong>${stats.prestamos || 0}</strong><br />Prestamos</div>
    <div class="summary-box"><strong>${stats.devoluciones || 0}</strong><br />Devoluciones</div>
  `;
  $('#recordRows').innerHTML = records.length
    ? records
        .map(
          (record) => `
          <tr>
            <td>${formatDate(record.fecha)}</td>
            <td>${record.tipo}</td>
            <td>${record.usuario?.nombre || 'Usuario #' + record.usuarioId}</td>
            <td>${record.detalle || record.actividad || record.materia || '-'}</td>
          </tr>
        `,
        )
        .join('')
    : '<tr><td colspan="4">No hay registros para este mes.</td></tr>';
}

function applyDemoData() {
  state.books = demoBooks;
  state.users = [];
  state.loans = [];
  renderBooks();
  renderUsers();
  renderLoans();
  renderProgramOptions([...new Set(demoBooks.map((book) => book.programa))]);
  renderPrograms(
    Object.entries(
      demoBooks.reduce((acc, book) => {
        acc[book.programa] = (acc[book.programa] || 0) + 1;
        return acc;
      }, {}),
    ).map(([programa, total]) => ({ programa, total })),
  );
  renderMetrics();
}

function loanRuleForCurrentUser() {
  if (state.user?.tipoPersona === 'DOCENTE') {
    return {
      document: 'Credencial docente',
      detail: 'Prestamo gratuito para profesor.',
    };
  }
  if (state.user?.tipoPersona === 'ESTUDIANTE') {
    return {
      document: 'Carnet estudiantil',
      detail: 'Prestamo con 50% de descuento para estudiante.',
    };
  }
  return {
    document: 'Cedula',
    detail: 'Prestamo por 10 dias. Si se retrasa, aplica multa.',
  };
}

function addDemoLoan(bookId, tipoDocumento, numeroDocumento) {
  if (state.loans.length >= 3) {
    setStatus('Ningun usuario puede tener mas de tres prestamos activos.', true);
    return;
  }
  const book = state.books.find((item) => Number(item.id) === Number(bookId));
  if (!book) {
    setStatus('Libro no encontrado.', true);
    return;
  }
  if (book.disponibles <= 0) {
    setStatus('No hay ejemplares disponibles.', true);
    return;
  }
  book.disponibles -= 1;
  const rule = loanRuleForCurrentUser();
  state.loans.push({
    id: Date.now(),
    usuarioId: state.user.id,
    libroId: book.id,
    usuario: state.user,
    libro: book,
    fechaPrestamo: new Date().toISOString(),
    tipoDocumento: tipoDocumento || rule.document,
    numeroDocumento,
  });
  renderBooks();
  renderLoans();
  renderMetrics();
  setStatus(`${rule.detail} Documento entregado: ${tipoDocumento || rule.document}.`);
}

function returnDemoLoan(loanId) {
  const index = state.loans.findIndex((loan) => Number(loan.id) === Number(loanId));
  if (index < 0) {
    setStatus('Prestamo no encontrado.', true);
    return;
  }
  const [loan] = state.loans.splice(index, 1);
  const book = state.books.find((item) => Number(item.id) === Number(loan.libroId));
  if (book) book.disponibles += 1;
  renderBooks();
  renderLoans();
  renderMetrics();
  setStatus('Devolucion registrada.');
}

async function loadPublicData() {
  try {
    const [books, users, programs, programCounts] = await Promise.all([
      api('/libros'),
      api('/docentes'),
      api('/libros/programas'),
      api('/libros/conteo-por-programa'),
    ]);
    state.books = books;
    state.users = users;
    renderBooks();
    renderUsers();
    renderProgramOptions(programs.filter(Boolean));
    renderPrograms(programCounts);
    renderMetrics();
  } catch {
    applyDemoData();
    setStatus('Backend no disponible. Mostrando datos de presentacion.', true);
  }
}

async function loadLoans() {
  if (!state.token) {
    state.loans = [];
    renderLoans();
    renderMetrics();
    return;
  }
  if (state.token.startsWith('demo-')) {
    renderLoans();
    renderMetrics();
    return;
  }
  try {
    state.loans = await api(isUserRole() ? '/prestamos/mis' : '/prestamos/activos');
  } catch (error) {
    state.loans = [];
    setStatus(`No se pudieron cargar prestamos: ${error.message}`, true);
  }
  renderLoans();
  renderMetrics();
}

async function loadRecords() {
  if (!isStaff()) {
    setStatus('Solo administrador o bibliotecario pueden ver registros.', true);
    return;
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  try {
    const [records, stats] = await Promise.all([
      api(`/registros/mes/${year}/${month}`),
      api(`/registros/stats/${year}/${month}`),
    ]);
    renderRecords(records, stats);
    setStatus('Registros actualizados.');
  } catch (error) {
    setStatus(`No se pudieron cargar registros: ${error.message}`, true);
  }
}

async function init() {
  updateRoleUi();
  await loadPublicData();
  await loadLoans();
}

$$('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.classList.contains('requires-admin') && !isAdmin()) {
      setStatus('Esta seccion es solo para administrador.', true);
      return;
    }
    if (button.classList.contains('requires-staff') && !isStaff()) {
      setStatus('Esta seccion es solo para personal de biblioteca.', true);
      return;
    }
    if (button.classList.contains('requires-login') && !state.token) {
      setStatus('Primero inicia sesion para ver prestamos.', true);
      return;
    }
    $$('.nav-item').forEach((item) => item.classList.remove('active'));
    $$('.view').forEach((view) => view.classList.remove('active'));
    button.classList.add('active');
    $(`#${button.dataset.section}`).classList.add('active');
  });
});

$$('[data-login-role]').forEach((button) => {
  button.addEventListener('click', () => {
    const access = ACCESS[button.dataset.loginRole];
    $('#email').value = access.email;
    $('#password').value = access.password;
    setStatus(`Credenciales de ${access.label} listas. Presiona Iniciar sesion.`);
  });
});

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = $('#email').value.trim();
  const password = $('#password').value;
  const access = getAccessByEmail(email);
  try {
    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });
    state.token = result.access_token;
    state.user = result.usuario;
    const localAccess = getAccessByEmail(state.user.email || email);
    if (localAccess && !state.user.tipoPersona) {
      state.user.tipoPersona = localAccess.tipoPersona;
    }
    localStorage.setItem('biblioteca_token', state.token);
    localStorage.setItem('biblioteca_user', JSON.stringify(state.user));
    updateRoleUi();
    await loadPublicData();
    await loadLoans();
    setStatus(`Sesion iniciada como ${state.user.rol}.`);
  } catch (error) {
    if (error.message === 'Failed to fetch' && access && password === access.password) {
      startLocalSession(access);
      updateRoleUi();
      applyDemoData();
      setStatus(
        `Modo presentacion: entraste como ${access.label}. Enciende el backend para usar la base real.`,
      );
      return;
    }
    setStatus(`No se pudo iniciar sesion: ${error.message}`, true);
  }
});

$('#logoutButton').addEventListener('click', async () => {
  state.token = '';
  state.user = null;
  state.loans = [];
  localStorage.removeItem('biblioteca_token');
  localStorage.removeItem('biblioteca_user');
  updateRoleUi();
  await loadPublicData();
  await loadLoans();
  setStatus('Sesion cerrada.');
});

$('#bookSearch').addEventListener('input', async (event) => {
  const text = event.target.value.trim();
  const program = $('#programFilter').value;
  const params = new URLSearchParams();
  if (text) params.set('texto', text);
  if (program) params.set('programa', program);
  try {
    const books = params.toString() ? await api(`/libros/buscar?${params}`) : state.books;
    renderBooks(books);
  } catch {
    renderBooks(
      state.books.filter((book) =>
        `${book.titulo} ${book.autor} ${book.codigo} ${book.anio || ''} ${book.editorial || ''}`
          .toLowerCase()
          .includes(text.toLowerCase()),
      ),
    );
  }
});

$('#programFilter').addEventListener('change', () => {
  $('#bookSearch').dispatchEvent(new Event('input'));
});

$('#bookGrid').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-delete-book]');
  const requestButton = event.target.closest('[data-request-book]');
  if (requestButton) {
    if (!isUserRole()) return;
    const rule = loanRuleForCurrentUser();
    const documentInput = $('#requestLoanForm [name="tipoDocumento"]');
    const numberInput = $('#requestLoanForm [name="numeroDocumento"]');
    const tipoDocumento = documentInput.value || rule.document;
    try {
      await api('/prestamos/solicitar', {
        method: 'POST',
        body: JSON.stringify({
          libroId: Number(requestButton.dataset.requestBook),
          tipoDocumento,
          numeroDocumento: numberInput.value,
        }),
      });
      await Promise.all([loadLoans(), loadPublicData()]);
      setStatus(`${rule.detail} Solicitud enviada.`);
    } catch (error) {
      if (error.message === 'Failed to fetch' || state.token.startsWith('demo-')) {
        addDemoLoan(requestButton.dataset.requestBook, tipoDocumento, numberInput.value);
      } else {
        setStatus(`No se pudo solicitar prestamo: ${error.message}`, true);
      }
    }
    return;
  }
  if (!button) return;
  if (!isStaff()) return;
  try {
    await api(`/libros/${button.dataset.deleteBook}`, { method: 'DELETE' });
    await loadPublicData();
    setStatus('Libro retirado del catalogo.');
  } catch (error) {
    setStatus(`No se pudo retirar el libro: ${error.message}`, true);
  }
});

$('#requestLoanForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isUserRole()) return;
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const rule = loanRuleForCurrentUser();
  const payload = {
    libroId: Number(form.get('libroId')),
    tipoDocumento: form.get('tipoDocumento') || rule.document,
    numeroDocumento: form.get('numeroDocumento')?.toString() || '',
  };
  try {
    await api('/prestamos/solicitar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    formElement.reset();
    await Promise.all([loadLoans(), loadPublicData()]);
    setStatus(`${rule.detail} Solicitud enviada.`);
  } catch (error) {
    if (error.message === 'Failed to fetch' || state.token.startsWith('demo-')) {
      addDemoLoan(payload.libroId, payload.tipoDocumento, payload.numeroDocumento);
      formElement.reset();
    } else {
      setStatus(`No se pudo solicitar prestamo: ${error.message}`, true);
    }
  }
});

$('#bookForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isStaff()) return;
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const payload = Object.fromEntries(form.entries());
  payload.anio = Number(payload.anio);
  payload.totalEjemplares = Number(payload.totalEjemplares);
  payload.disponibles = Number(payload.disponibles);
  try {
    await api('/libros', { method: 'POST', body: JSON.stringify(payload) });
    formElement.reset();
    await loadPublicData();
    setStatus('Libro guardado.');
  } catch (error) {
    setStatus(`No se pudo guardar el libro: ${error.message}`, true);
  }
});

$('#userSearch').addEventListener('input', (event) => {
  const text = event.target.value.toLowerCase();
  renderUsers(state.users.filter((user) => user.nombre.toLowerCase().includes(text)));
});

$('#userForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isAdmin()) return;
  const formElement = event.currentTarget;
  const payload = Object.fromEntries(new FormData(formElement).entries());
  try {
    await api('/docentes', { method: 'POST', body: JSON.stringify(payload) });
    formElement.reset();
    await loadPublicData();
    setStatus('Usuario guardado.');
  } catch (error) {
    setStatus(`No se pudo guardar el usuario: ${error.message}`, true);
  }
});

$('#loanForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isStaff()) return;
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  try {
    await api('/prestamos', {
      method: 'POST',
      body: JSON.stringify({
        docenteId: Number(form.get('docenteId')),
        libroId: Number(form.get('libroId')),
      }),
    });
    formElement.reset();
    await Promise.all([loadLoans(), loadPublicData()]);
    setStatus('Prestamo registrado.');
  } catch (error) {
    setStatus(`No se pudo registrar el prestamo: ${error.message}`, true);
  }
});

$('#loanRows').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-return-loan]');
  if (!button) return;
  if (state.token.startsWith('demo-')) {
    returnDemoLoan(button.dataset.returnLoan);
    return;
  }
  try {
    await api(`/prestamos/devolver/${button.dataset.returnLoan}`, { method: 'PATCH' });
    await Promise.all([loadLoans(), loadPublicData()]);
    setStatus('Prestamo devuelto.');
  } catch (error) {
    setStatus(`No se pudo devolver: ${error.message}`, true);
  }
});

$('#refreshLoans').addEventListener('click', loadLoans);
$('#loadRecords').addEventListener('click', loadRecords);
$('[data-refresh="programas"]').addEventListener('click', loadPublicData);

init();
