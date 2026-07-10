const API_BASE =
  localStorage.getItem('biblioteca_api') ||
  window.BIBLIOTECA_API_URL ||
  'http://localhost:3001';

const ACCESS = {
  admin: {
    email: 'admin@biblioteca.local',
    password: 'Admin123!',
    label: 'Administrador',
    nombre: 'Administrador',
    rol: 'admin',
    permissions: [
      'Gestionar usuarios',
      'Ver y administrar tablas del sistema',
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
    tipoPersona: 'CLIENTE',
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
    label: 'Profesor',
    nombre: 'Profesor',
    rol: 'usuario',
    tipoPersona: 'PROFESOR',
    permissions: ['Ver libros', 'Pedir libros', 'Prestamos gratuitos'],
  },
  subadmin: {
    email: 'subadmin@biblioteca.local',
    password: 'Subadmin123!',
    label: 'Subadministrador',
    nombre: 'Subadministrador',
    rol: 'subadmin',
    permissions: ['Ver catalogo', 'Consultar prestamos', 'Ver registros'],
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
  roles: [],
};

if (!state.user || typeof state.user !== 'object' || !state.user.rol) {
  state.token = '';
  state.user = null;
  localStorage.removeItem('biblioteca_token');
  localStorage.removeItem('biblioteca_user');
}

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
  {
    id: 6,
    codigo: 'SOFT-101',
    titulo: 'Clean Code',
    autor: 'Robert C. Martin',
    programa: 'Desarrollo de Software',
    categoria: 'Programacion',
    descripcion: 'Buenas practicas para escribir codigo claro, mantenible y profesional.',
    disponibles: 3,
    totalEjemplares: 3,
  },
  {
    id: 7,
    codigo: 'SOFT-103',
    titulo: 'Inteligencia Artificial: Un Enfoque Moderno',
    autor: 'Stuart Russell y Peter Norvig',
    programa: 'Desarrollo de Software',
    categoria: 'Inteligencia Artificial',
    descripcion: 'Fundamentos de IA, aprendizaje automatico y agentes inteligentes.',
    disponibles: 2,
    totalEjemplares: 2,
  },
  {
    id: 8,
    codigo: 'DIS-201',
    titulo: 'No Me Hagas Pensar',
    autor: 'Steve Krug',
    programa: 'Diseno Grafico',
    categoria: 'Diseno UX',
    descripcion: 'Guia directa para crear interfaces simples, claras y faciles de usar.',
    disponibles: 4,
    totalEjemplares: 4,
  },
  {
    id: 9,
    codigo: 'EMP-302',
    titulo: 'El Metodo Lean Startup',
    autor: 'Eric Ries',
    programa: 'Gestion Empresarial',
    categoria: 'Emprendimiento',
    descripcion: 'Modelo para validar ideas y construir productos viables.',
    disponibles: 3,
    totalEjemplares: 3,
  },
  {
    id: 10,
    codigo: 'EDU-401',
    titulo: 'Ensenar a Pensar',
    autor: 'Robert Swartz',
    programa: 'Educacion Basica',
    categoria: 'Educacion',
    descripcion: 'Estrategias para desarrollar pensamiento critico dentro del aula.',
    disponibles: 3,
    totalEjemplares: 3,
  },
  {
    id: 11,
    codigo: 'CIE-501',
    titulo: 'Breves Respuestas a las Grandes Preguntas',
    autor: 'Stephen Hawking',
    programa: 'Ciencias Basicas',
    categoria: 'Ciencia',
    descripcion: 'Reflexiones sobre universo, tecnologia, inteligencia artificial y futuro humano.',
    disponibles: 3,
    totalEjemplares: 3,
  },
  {
    id: 12,
    codigo: 'LIT-601',
    titulo: 'Cien Anos de Soledad',
    autor: 'Gabriel Garcia Marquez',
    programa: 'Coleccion General',
    categoria: 'Literatura',
    descripcion: 'Novela esencial del realismo magico latinoamericano y la familia Buendia.',
    disponibles: 4,
    totalEjemplares: 4,
  },
  {
    id: 13,
    codigo: 'LIT-602',
    titulo: 'El Principito',
    autor: 'Antoine de Saint-Exupery',
    programa: 'Coleccion General',
    categoria: 'Literatura',
    descripcion: 'Relato breve sobre amistad, imaginacion, responsabilidad y mirada humana.',
    disponibles: 5,
    totalEjemplares: 5,
  },
  {
    id: 14,
    codigo: 'SOC-701',
    titulo: 'Sapiens: De Animales a Dioses',
    autor: 'Yuval Noah Harari',
    programa: 'Coleccion General',
    categoria: 'Historia',
    descripcion: 'Recorrido por la historia humana, la cultura, la economia y la tecnologia.',
    disponibles: 3,
    totalEjemplares: 3,
  },
  {
    id: 15,
    codigo: 'SOFT-104',
    titulo: 'Designing Data-Intensive Applications',
    autor: 'Martin Kleppmann',
    programa: 'Desarrollo de Software',
    categoria: 'Bases de Datos',
    descripcion: 'Arquitectura de datos, escalabilidad y sistemas distribuidos.',
    disponibles: 2,
    totalEjemplares: 2,
  },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function getAccessByEmail(email) {
  return Object.values(ACCESS).find(
    (access) => access.email.toLowerCase() === email.toLowerCase(),
  );
}

function normalizeLoginUser(result, fallbackEmail) {
  const usuario = result?.usuario || result?.user;
  if (usuario?.rol) return usuario;

  const access = getAccessByEmail(fallbackEmail);
  if (!access) return null;

  return {
    id:
      access.rol === 'admin'
        ? 1
        : access.rol === 'bibliotecario'
          ? 2
          : access.rol === 'subadmin'
            ? 6
            : access.tipoPersona === 'PROFESOR'
              ? 4
              : access.tipoPersona === 'ESTUDIANTE'
                ? 5
                : 3,
    nombre: access.nombre,
    email: access.email,
    rol: access.rol,
    tipoPersona: access.tipoPersona || 'CLIENTE',
  };
}

function startLocalSession(access) {
  state.token = `demo-${access.rol}`;
  state.user = {
    id:
      access.rol === 'admin'
        ? 1
        : access.rol === 'bibliotecario'
          ? 2
          : access.rol === 'subadmin'
            ? 6
            : access.tipoPersona === 'PROFESOR'
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
  return ['admin', 'subadmin', 'bibliotecario'].includes(state.user?.rol);
}

function isLibrarian() {
  return state.user?.rol === 'bibliotecario';
}

function canManageBooks() {
  return ['admin', 'bibliotecario'].includes(state.user?.rol);
}

function canManageLoans() {
  return ['admin', 'bibliotecario'].includes(state.user?.rol);
}

function canReturnLoan(loan) {
  if (canManageLoans()) return true;
  return isUserRole() && Number(loan.usuarioId) === Number(state.user?.id);
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
  $('#registerForm').classList.toggle('hidden', Boolean(state.token));

  $$('.requires-admin').forEach((item) => item.classList.toggle('hidden', !isAdmin()));
  $$('.requires-staff').forEach((item) => item.classList.toggle('hidden', !isStaff()));
  $$('.requires-login').forEach((item) => item.classList.toggle('hidden', !state.token));
  $$('.admin-only').forEach((item) => item.classList.toggle('hidden', !isAdmin()));
  $$('.staff-only').forEach((item) => item.classList.toggle('hidden', !isStaff()));
  $$('.librarian-only').forEach((item) => item.classList.toggle('hidden', !isLibrarian()));
  $$('.loan-manager-only').forEach((item) =>
    item.classList.toggle('hidden', !canManageLoans()),
  );
  $$('.user-only').forEach((item) => item.classList.toggle('hidden', !isUserRole()));

  $('#roleHeadline').textContent =
    role === 'admin'
      ? 'Panel de administracion'
      : role === 'subadmin'
        ? 'Panel de apoyo'
      : role === 'bibliotecario'
        ? 'Mesa de trabajo del bibliotecario'
        : role === 'usuario'
          ? 'Portal de solicitud'
          : 'Gestiona la biblioteca sin complicarte';

  $('#roleDescription').textContent =
    role === 'admin'
      ? 'Tienes acceso a usuarios, catalogo, prestamos y registros.'
      : role === 'subadmin'
        ? 'Puedes revisar catalogo, prestamos y registros operativos.'
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

function renderCategoryOptions(books = state.books) {
  const categories = [...new Set(books.map((book) => book.categoria).filter(Boolean))].sort();
  $('#categoryFilter').innerHTML =
    '<option value="">Todas las categorias</option>' +
    categories.map((category) => `<option value="${category}">${category}</option>`).join('');
}

function applyBookFilters() {
  const text = $('#bookSearch').value.trim().toLowerCase();
  const program = $('#programFilter').value;
  const category = $('#categoryFilter').value;
  const availability = $('#availabilityFilter').value;

  const filtered = state.books.filter((book) => {
    const matchesText = text
      ? `${book.titulo} ${book.autor} ${book.codigo} ${book.anio || ''} ${book.editorial || ''} ${book.isbn || ''}`
          .toLowerCase()
          .includes(text)
      : true;
    const matchesProgram = program ? book.programa === program : true;
    const matchesCategory = category ? book.categoria === category : true;
    const available = Number(book.disponibles || 0) > 0;
    const matchesAvailability =
      availability === 'disponibles'
        ? available
        : availability === 'agotados'
          ? !available
          : true;
    return matchesText && matchesProgram && matchesCategory && matchesAvailability;
  });

  renderBooks(filtered);
}

function renderBooks(books = state.books) {
  const grid = $('#bookGrid');
  $('#bookResultCount').textContent = `${books.length} libro${books.length === 1 ? '' : 's'} encontrado${books.length === 1 ? '' : 's'}`;
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
            <span>${book.isbn || 'Sin ISBN'}</span>
          </div>
          <div class="stock">
            <span>ID ${book.id}</span>
            <strong>${book.disponibles}/${book.totalEjemplares} disponibles</strong>
          </div>
          ${
            canManageBooks()
              ? `<div class="card-actions"><button data-view-book="${book.id}">Ver detalle</button><button class="danger" data-delete-book="${book.id}">Retirar libro</button></div>`
              : isUserRole()
                ? `<div class="card-actions"><button data-view-book="${book.id}">Ver detalle</button><button data-request-book="${book.id}">Solicitar prestamo</button></div>`
              : `<button data-view-book="${book.id}">Ver detalle</button>`
          }
        </article>
      `,
    )
    .join('');
}

function renderBookDetail(book) {
  const panel = $('#bookDetail');
  if (!book) {
    panel.classList.add('hidden');
    panel.innerHTML = '';
    return;
  }

  panel.classList.remove('hidden');
  panel.innerHTML = `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Detalle de libro</p>
        <h2>${book.titulo}</h2>
      </div>
      <button type="button" class="secondary" id="closeBookDetail">Cerrar</button>
    </div>
    <div class="detail-grid">
      <span><strong>Autor:</strong> ${book.autor || '-'}</span>
      <span><strong>Anio:</strong> ${book.anio || '-'}</span>
      <span><strong>Editorial:</strong> ${book.editorial || '-'}</span>
      <span><strong>ISBN:</strong> ${book.isbn || '-'}</span>
      <span><strong>Categoria:</strong> ${book.categoria || '-'}</span>
      <span><strong>Disponibles:</strong> ${book.disponibles}/${book.totalEjemplares}</span>
    </div>
    <p>${book.descripcion || 'Sin descripcion.'}</p>
  `;
}

function renderLoans() {
  const rows = $('#loanRows');
  if (!state.loans.length) {
    rows.innerHTML = '<tr><td colspan="6">No hay prestamos activos.</td></tr>';
    return;
  }

  rows.innerHTML = state.loans
    .map(
      (loan) => `
      <tr>
        <td>${loan.usuario?.nombre || 'Usuario #' + loan.usuarioId}</td>
        <td>${loan.libro?.titulo || 'Libro #' + loan.libroId}</td>
        <td>${formatDate(loan.fechaPrestamo)}</td>
        <td>${formatDate(loan.fechaLimite)}</td>
        <td>${loan.estado || (loan.activo ? 'ACTIVO' : 'DEVUELTO')}</td>
        <td>${
          canReturnLoan(loan)
            ? `<button data-return-loan="${loan.id}">Devolver</button>`
            : '<span class="muted-text">Consulta</span>'
        }</td>
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

function renderRoles(roles = state.roles) {
  const list = $('#roleRows');
  if (!roles.length) {
    list.innerHTML = '<p>No hay roles cargados.</p>';
    return;
  }
  list.innerHTML = roles
    .map(
      (role) => `
        <article class="role-card">
          <strong>${role.nombre}</strong>
          <span>${role.rol}</span>
          <ul>${role.permisos.map((permiso) => `<li>${permiso}</li>`).join('')}</ul>
        </article>
      `,
    )
    .join('');
}

function applyDemoData() {
  state.books = demoBooks;
  state.users = [];
  state.loans = [];
  renderBooks();
  renderUsers();
  renderLoans();
  renderProgramOptions([...new Set(demoBooks.map((book) => book.programa))]);
  renderCategoryOptions(demoBooks);
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
  if (state.user?.tipoPersona === 'PROFESOR' || state.user?.tipoPersona === 'DOCENTE') {
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
    const [books, programs, programCounts] = await Promise.all([
      api('/libros'),
      api('/libros/programas'),
      api('/libros/conteo-por-programa'),
    ]);
    state.books = books;
    if (isAdmin()) {
      try {
        state.users = await api('/docentes');
      } catch {
        state.users = [];
      }
    } else {
      state.users = [];
    }
    renderBooks();
    renderUsers();
    renderProgramOptions(programs.filter(Boolean));
    renderCategoryOptions(books);
    renderPrograms(programCounts);
    renderMetrics();
  } catch {
    applyDemoData();
    setStatus('Backend no disponible. Mostrando datos de presentacion.', true);
  }
}

async function loadRoles() {
  try {
    state.roles = await api('/roles');
  } catch {
    state.roles = [
      { rol: 'admin', nombre: 'Administrador', permisos: ACCESS.admin.permissions },
      { rol: 'subadmin', nombre: 'Subadministrador', permisos: ACCESS.subadmin.permissions },
      { rol: 'bibliotecario', nombre: 'Bibliotecario', permisos: ACCESS.bibliotecario.permissions },
      { rol: 'usuario', nombre: 'Usuario', permisos: ACCESS.usuario.permissions },
      { rol: 'invitado', nombre: 'Invitado', permisos: ['Explorar catalogo', 'Ver disponibilidad'] },
    ];
  }
  renderRoles();
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
    setStatus('Solo personal autorizado puede ver registros.', true);
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
  await loadRoles();
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
    state.user = normalizeLoginUser(result, email);
    if (!state.token || !state.user) {
      throw new Error('La respuesta de inicio de sesion no trajo datos de usuario validos.');
    }
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

$('#bookSearch').addEventListener('input', applyBookFilters);

$('#programFilter').addEventListener('change', () => {
  applyBookFilters();
});

$('#categoryFilter').addEventListener('change', applyBookFilters);
$('#availabilityFilter').addEventListener('change', applyBookFilters);

$('#bookGrid').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-delete-book]');
  const requestButton = event.target.closest('[data-request-book]');
  const viewButton = event.target.closest('[data-view-book]');
  if (viewButton) {
    const book = state.books.find((item) => Number(item.id) === Number(viewButton.dataset.viewBook));
    renderBookDetail(book);
    $('#bookDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
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
  if (!canManageBooks()) return;
  try {
    await api(`/libros/${button.dataset.deleteBook}`, { method: 'DELETE' });
    await loadPublicData();
    setStatus('Libro retirado del catalogo.');
  } catch (error) {
    setStatus(`No se pudo retirar el libro: ${error.message}`, true);
  }
});

$('#bookDetail').addEventListener('click', (event) => {
  if (event.target.closest('#closeBookDetail')) {
    renderBookDetail(null);
  }
});

$('#registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const payload = Object.fromEntries(new FormData(formElement).entries());
  if (payload.password !== payload.confirmPassword) {
    setStatus('Las contrasenas no coinciden.', true);
    return;
  }
  try {
    const result = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    state.token = result.access_token;
    state.user = normalizeLoginUser(result, payload.email);
    localStorage.setItem('biblioteca_token', state.token);
    localStorage.setItem('biblioteca_user', JSON.stringify(state.user));
    formElement.reset();
    updateRoleUi();
    await Promise.all([loadPublicData(), loadLoans()]);
    setStatus('Cuenta creada. Sesion iniciada.');
  } catch (error) {
    setStatus(`No se pudo registrar: ${error.message}`, true);
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
  if (!isLibrarian()) return;
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
  if (!canManageLoans()) return;
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
$('#loadRoles').addEventListener('click', loadRoles);
$('[data-refresh="programas"]').addEventListener('click', loadPublicData);

init();
