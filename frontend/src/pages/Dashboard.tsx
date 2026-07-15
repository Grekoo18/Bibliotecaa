import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Library,
  User,
  LogOut,
  Plus,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

type Role = 'ADMIN' | 'SUBADMIN' | 'BIBLIOTECARIO' | 'CLIENTE' | 'PROFESOR' | 'ESTUDIANTE' | string;

interface Book {
  id: number;
  title: string;
  isbn: string;
  publisher?: string;
  publicationYear?: number;
  stock?: number;
  available?: boolean;
  description?: string;
  author?: { name: string };
  category?: { name: string };
  copies?: Array<{ id: number; code: string; status: string }>;
  _count?: { copies?: number; loans?: number };
}

interface Loan {
  id: number;
  status: string;
  loanDate?: string;
  dueDate?: string;
  returnDate?: string;
  documentType?: string;
  baseCost?: string | number;
  discountPercent?: string | number;
  finalCost?: string | number;
  fineAmount?: string | number;
  book?: Book;
  bookId: number;
  bookCopy?: { id: number; code: string; status: string };
  user?: { name: string; email: string };
}

function money(value?: string | number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function date(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date(value));
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('pendiente')) return 'badge badge-pending';
  if (normalized.includes('activo')) return 'badge badge-active';
  if (normalized.includes('rechazado')) return 'badge badge-rejected';
  return 'badge badge-returned';
}

function defaultDocument(role?: Role) {
  if (role === 'PROFESOR') return 'Credencial docente';
  if (role === 'ESTUDIANTE') return 'Carnet estudiantil';
  return 'Cedula';
}

function DashboardShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-ivory)' }}>
      <aside className="dashboard-sidebar">
        <div className="brand">
          <BookOpen size={28} color="var(--color-terracotta)" />
          <h1>Biblioteca</h1>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <Search size={20} />
            Catalogo
          </Link>
          <Link
            to="/dashboard/mis-prestamos"
            className={`sidebar-link ${location.pathname.includes('/mis-prestamos') ? 'active' : ''}`}
          >
            <Library size={20} />
            Prestamos
          </Link>
          <Link
            to="/dashboard/perfil"
            className={`sidebar-link ${location.pathname.includes('/perfil') ? 'active' : ''}`}
          >
            <User size={20} />
            Perfil
          </Link>
        </nav>

        <button onClick={handleLogout} className="sidebar-link logout-button" type="button">
          <LogOut size={20} />
          Cerrar sesion
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Sistema bibliotecario</p>
            <h2>Gestion de biblioteca</h2>
          </div>
          <div className="user-pill">
            <span className="badge badge-active">{user?.rol || 'Rol'}</span>
            <span>Hola, {user?.nombre || 'Usuario'}</span>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<CatalogView />} />
          <Route path="/mis-prestamos" element={<LoansView />} />
          <Route path="/perfil" element={<ProfileView />} />
        </Routes>
      </main>

      <style>{dashboardStyles}</style>
    </div>
  );
}

function CatalogView() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    isbn: '',
    authorName: '',
    categoryName: '',
    publisher: '',
    publicationYear: '',
    stock: '1',
    description: '',
  });

  const canRequest = ['CLIENTE', 'ESTUDIANTE', 'PROFESOR'].includes(user?.rol || '');
  const canCreateBook = user?.rol === 'BIBLIOTECARIO';

  const loadBooks = async (search = query) => {
    setLoading(true);
    try {
      const response = await api.get('/books', { params: search ? { q: search } : {} });
      setBooks(response.data);
      setMessage('');
    } catch {
      setMessage('No se pudo cargar el catalogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLoan = async (bookId: number) => {
    try {
      await api.post('/loans/request', {
        bookId,
        documentType: defaultDocument(user?.rol),
      });
      setMessage('Solicitud de prestamo registrada.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'No se pudo solicitar el prestamo.');
    }
  };

  const createBook = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/books', {
        title: form.title,
        isbn: form.isbn,
        authorName: form.authorName,
        categoryName: form.categoryName,
        publisher: form.publisher || undefined,
        publicationYear: form.publicationYear ? Number(form.publicationYear) : undefined,
        stock: Number(form.stock || 1),
        description: form.description || undefined,
      });
      setForm({ title: '', isbn: '', authorName: '', categoryName: '', publisher: '', publicationYear: '', stock: '1', description: '' });
      setMessage('Libro creado correctamente.');
      loadBooks();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'No se pudo crear el libro.');
    }
  };

  return (
    <section className="stack">
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && loadBooks()}
            placeholder="Buscar por nombre, autor, editorial o ano"
          />
        </div>
        <button className="btn btn-primary" type="button" onClick={() => loadBooks()}>
          <Search size={16} />
          Buscar
        </button>
      </div>

      {message && <div className="notice">{message}</div>}

      {canCreateBook && (
        <form className="card compact-card" onSubmit={createBook}>
          <div className="section-heading">
            <Plus size={20} />
            <h3>Crear libro</h3>
          </div>
          <div className="form-grid">
            <input className="form-input" placeholder="Titulo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="form-input" placeholder="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
            <input className="form-input" placeholder="Autor" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} required />
            <input className="form-input" placeholder="Categoria" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required />
            <input className="form-input" placeholder="Editorial" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
            <input className="form-input" placeholder="Ano" value={form.publicationYear} onChange={(e) => setForm({ ...form, publicationYear: e.target.value })} />
            <input className="form-input" placeholder="Ejemplares" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <input className="form-input" placeholder="Descripcion" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-accent" type="submit">
            <Plus size={16} />
            Guardar libro
          </button>
        </form>
      )}

      {loading ? (
        <div className="card">Cargando libros...</div>
      ) : (
        <div className="book-grid">
          {books.map((book) => {
            const availableCopies = book._count?.copies ?? 0;
            return (
              <article className="card book-card" key={book.id}>
                <div>
                  <span className={availableCopies > 0 ? 'badge badge-active' : 'badge badge-rejected'}>
                    {availableCopies > 0 ? 'Disponible' : 'No disponible'}
                  </span>
                  <h3>{book.title}</h3>
                  <p>{book.author?.name || 'Autor no registrado'}</p>
                </div>
                <div className="meta-row">
                  <span>{book.publisher || 'Sin editorial'}</span>
                  <span>{book.publicationYear || 'Sin ano'}</span>
                  <span>{book.category?.name || 'Sin categoria'}</span>
                </div>
                <p className="description">{book.description || 'Sin descripcion.'}</p>
                <div className="card-actions">
                  <span>{availableCopies} ejemplares</span>
                  {canRequest && (
                    <button className="btn btn-primary" type="button" onClick={() => requestLoan(book.id)} disabled={availableCopies <= 0}>
                      Pedir libro
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {books.length === 0 && <div className="card">No hay libros para mostrar.</div>}
        </div>
      )}
    </section>
  );
}

function LoansView() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const canManage = ['ADMIN', 'SUBADMIN', 'BIBLIOTECARIO'].includes(user?.rol || '');

  const loadLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get(canManage ? '/loans' : '/loans/my-loans');
      setLoans(response.data);
      setMessage('');
    } catch {
      setMessage('No se pudieron cargar los prestamos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const approveLoan = async (loan: Loan) => {
    try {
      const bookResponse = await api.get(`/books/${loan.bookId}`);
      const copy = bookResponse.data.copies?.find((item: { id: number; status: string }) => item.status === 'DISPONIBLE');
      if (!copy) {
        setMessage('No hay ejemplares disponibles para aprobar.');
        return;
      }
      await api.patch(`/loans/${loan.id}/approve`, {
        bookCopyId: copy.id,
        documentType: loan.documentType || defaultDocument(loan.user ? 'CLIENTE' : user?.rol),
      });
      setMessage('Prestamo aprobado.');
      loadLoans();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'No se pudo aprobar el prestamo.');
    }
  };

  const returnLoan = async (loanId: number) => {
    try {
      const response = await api.patch(`/loans/${loanId}/return`);
      const fine = Number(response.data.fineAmount || 0);
      setMessage(fine > 0 ? `Devolucion registrada con multa de ${money(fine)}.` : 'Devolucion registrada.');
      loadLoans();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'No se pudo registrar la devolucion.');
    }
  };

  return (
    <section className="stack">
      <div className="section-heading">
        <Library size={22} />
        <h3>{canManage ? 'Gestion de prestamos' : 'Mis prestamos'}</h3>
      </div>
      {message && <div className="notice">{message}</div>}
      {loading ? (
        <div className="card">Cargando prestamos...</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Libro</th>
                {canManage && <th>Usuario</th>}
                <th>Estado</th>
                <th>Documento</th>
                <th>Prestamo</th>
                <th>Devolucion</th>
                <th>Descuento</th>
                <th>Multa</th>
                <th>Total</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.book?.title || `Libro ${loan.bookId}`}</td>
                  {canManage && <td>{loan.user?.name || '-'}</td>}
                  <td><span className={statusClass(loan.status)}>{loan.status}</span></td>
                  <td>{loan.documentType || '-'}</td>
                  <td>{date(loan.loanDate)}</td>
                  <td>{date(loan.dueDate)}</td>
                  <td>{Number(loan.discountPercent || 0)}%</td>
                  <td className={Number(loan.fineAmount || 0) > 0 ? 'fine-cell' : ''}>{money(loan.fineAmount)}</td>
                  <td>{money(loan.finalCost)}</td>
                  {canManage && (
                    <td className="inline-actions">
                      {loan.status === 'Pendiente' && (
                        <button className="icon-action" type="button" title="Aprobar prestamo" onClick={() => approveLoan(loan)}>
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      {['Activo', 'Renovacion pendiente'].includes(loan.status) && (
                        <button className="icon-action" type="button" title="Registrar devolucion" onClick={() => returnLoan(loan.id)}>
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 10 : 9}>No hay prestamos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ProfileView() {
  const { user } = useAuth();
  const rules = useMemo(() => {
    if (user?.rol === 'PROFESOR') return ['Prestamos gratuitos', 'Documento: credencial docente', 'Puede pedir libros y revisar disponibilidad'];
    if (user?.rol === 'ESTUDIANTE') return ['50% de descuento', 'Documento: carnet estudiantil', 'Maximo 3 prestamos activos'];
    if (user?.rol === 'CLIENTE') return ['Prestamo por 10 dias', 'Documento: cedula', 'Multa si devuelve tarde'];
    if (user?.rol === 'BIBLIOTECARIO') return ['Puede crear libros', 'Aprueba prestamos', 'Registra devoluciones'];
    if (user?.rol === 'ADMIN') return ['Administra registros del sistema', 'No crea libros en esta implementacion', 'Puede revisar prestamos'];
    if (user?.rol === 'SUBADMIN') return ['Apoya la gestion de prestamos', 'Consulta catalogo', 'Registra devoluciones'];
    return ['Consulta catalogo', 'Revisa disponibilidad'];
  }, [user?.rol]);

  return (
    <section className="profile-grid">
      <div className="card compact-card">
        <div className="section-heading">
          <User size={22} />
          <h3>Mi perfil</h3>
        </div>
        <p><strong>Nombre:</strong> {user?.nombre}</p>
        <p><strong>Correo:</strong> {user?.email}</p>
        <p><strong>Rol:</strong> {user?.rol}</p>
      </div>
      <div className="card compact-card">
        <div className="section-heading">
          <CheckCircle2 size={22} />
          <h3>Reglas del rol</h3>
        </div>
        <ul className="rule-list">
          {rules.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
      </div>
      <div className="card compact-card">
        <div className="section-heading">
          <XCircle size={22} />
          <h3>Reglas generales</h3>
        </div>
        <ul className="rule-list">
          <li>Ningun usuario puede tener mas de 3 prestamos activos.</li>
          <li>La busqueda de libros funciona por nombre, autor, editorial y ano.</li>
          <li>Solo el bibliotecario puede crear libros.</li>
        </ul>
      </div>
    </section>
  );
}

export default function Dashboard() {
  return <DashboardShell />;
}

const dashboardStyles = `
  .dashboard-sidebar {
    width: 260px;
    background: var(--color-white);
    border-right: 1px solid var(--color-ivory-dark);
    padding: var(--spacing-xl) var(--spacing-md);
    display: flex;
    flex-direction: column;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xxl);
    padding: 0 var(--spacing-sm);
  }
  .brand h1 {
    font-size: 1.25rem;
    margin-bottom: 0;
  }
  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  .sidebar-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 0.75rem 1rem;
    color: var(--color-charcoal-light);
    text-decoration: none;
    border-radius: var(--radius-sm);
    font-weight: 500;
    transition: all var(--transition-fast);
  }
  .sidebar-link:hover {
    background-color: var(--color-ivory);
    color: var(--color-forest);
  }
  .sidebar-link.active {
    background-color: var(--color-forest);
    color: var(--color-white);
  }
  .logout-button {
    background: none;
    border: none;
    width: 100%;
    cursor: pointer;
    text-align: left;
    margin-top: auto;
    color: var(--color-error);
  }
  .dashboard-main {
    flex: 1;
    padding: var(--spacing-xl);
    min-width: 0;
  }
  .dashboard-header,
  .toolbar,
  .card-actions,
  .section-heading,
  .user-pill,
  .inline-actions {
    display: flex;
    align-items: center;
  }
  .dashboard-header {
    justify-content: space-between;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }
  .dashboard-header h2 {
    margin-bottom: 0;
  }
  .eyebrow {
    margin-bottom: var(--spacing-xs);
    color: var(--color-terracotta);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
  }
  .user-pill,
  .section-heading {
    gap: var(--spacing-sm);
  }
  .section-heading h3 {
    margin-bottom: 0;
    font-family: var(--font-sans);
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  .toolbar {
    gap: var(--spacing-sm);
  }
  .search-box {
    min-width: 260px;
    max-width: 620px;
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 0.7rem 1rem;
    background: var(--color-white);
    border: 1px solid var(--color-sand);
    border-radius: var(--radius-sm);
  }
  .search-box input {
    border: 0;
    outline: 0;
    width: 100%;
    font: inherit;
    background: transparent;
  }
  .notice {
    padding: 0.85rem 1rem;
    border: 1px solid var(--color-sand);
    border-radius: var(--radius-sm);
    background: var(--color-white);
    color: var(--color-forest);
  }
  .compact-card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-sm);
  }
  .book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
  }
  .book-card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  .book-card h3 {
    margin-top: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }
  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    color: var(--color-charcoal-light);
    font-size: 0.9rem;
  }
  .description {
    flex: 1;
  }
  .card-actions {
    justify-content: space-between;
    gap: var(--spacing-sm);
  }
  .table-wrap {
    overflow: auto;
    background: var(--color-white);
    border: 1px solid var(--color-ivory-dark);
    border-radius: var(--radius-md);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
  }
  th,
  td {
    text-align: left;
    padding: 0.85rem;
    border-bottom: 1px solid var(--color-ivory-dark);
    vertical-align: middle;
  }
  th {
    color: var(--color-forest);
    font-size: 0.8rem;
    text-transform: uppercase;
  }
  .fine-cell {
    color: var(--color-error);
    font-weight: 700;
  }
  .inline-actions {
    gap: var(--spacing-xs);
  }
  .icon-action {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-sand);
    background: var(--color-white);
    color: var(--color-forest);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--spacing-md);
  }
  .rule-list {
    padding-left: 1.2rem;
    color: var(--color-charcoal-light);
  }
  @media (max-width: 820px) {
    .dashboard-sidebar {
      width: 86px;
      padding: var(--spacing-md) var(--spacing-sm);
    }
    .brand h1,
    .sidebar-link span,
    .logout-button {
      font-size: 0;
    }
    .dashboard-main {
      padding: var(--spacing-md);
    }
    .dashboard-header,
    .toolbar {
      align-items: stretch;
      flex-direction: column;
    }
  }
`;
