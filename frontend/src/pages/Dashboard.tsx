import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Library, LogOut, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface Loan {
  id: number;
  status: string;
  loanDate: string;
  dueDate?: string;
  returnDate?: string;
  documentType?: string;
  baseCost?: string | number;
  discountPercent?: string | number;
  finalCost?: string | number;
  fineAmount?: string | number;
  book?: { title: string };
  user?: { name: string };
}

interface Book {
  id: number;
  title: string;
  isbn: string;
  description?: string;
  publicationYear?: number;
  publisher?: string;
  stock: number;
  available: boolean;
  author?: { name: string };
  category?: { name: string };
  _count?: { copies?: number };
}

function money(value?: string | number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function date(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date(value));
}

function LoansView() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canManageLoans = ['ADMIN', 'BIBLIOTECARIO', 'SUBADMIN'].includes(user?.rol || '');

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const response = await api.get(canManageLoans ? '/loans' : '/loans/my-loans');
        setLoans(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'No se pudieron cargar los prestamos.');
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, [canManageLoans]);

  const returnLoan = async (loanId: number) => {
    setError('');
    try {
      const response = await api.patch(`/loans/${loanId}/return`);
      setLoans((current) => current.map((loan) => (loan.id === loanId ? response.data : loan)));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo registrar la devolucion.');
    }
  };

  if (loading) return <div className="card">Cargando prestamos...</div>;
  if (error) return <div className="card" style={{ color: 'var(--color-error)' }}>{error}</div>;

  return (
    <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
      <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-forest)' }}>
        {canManageLoans ? 'Gestion de prestamos' : 'Mis prestamos'}
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table className="loans-table">
          <thead>
            <tr>
              {canManageLoans && <th>Usuario</th>}
              <th>Libro</th>
              <th>Estado</th>
              <th>Prestamo</th>
              <th>Limite</th>
              <th>Devolucion</th>
              <th>Documento</th>
              <th>Descuento</th>
              <th>Multa</th>
              <th>Total</th>
              {canManageLoans && <th>Accion</th>}
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan={canManageLoans ? 11 : 9}>No hay prestamos registrados.</td>
              </tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan.id}>
                  {canManageLoans && <td>{loan.user?.name || '-'}</td>}
                  <td>{loan.book?.title || '-'}</td>
                  <td>{loan.status}</td>
                  <td>{date(loan.loanDate)}</td>
                  <td>{date(loan.dueDate)}</td>
                  <td>{date(loan.returnDate)}</td>
                  <td>{loan.documentType || '-'}</td>
                  <td>{Number(loan.discountPercent || 0)}%</td>
                  <td className={Number(loan.fineAmount || 0) > 0 ? 'fine-cell' : ''}>
                    {money(loan.fineAmount)}
                  </td>
                  <td>{money(loan.finalCost)}</td>
                  {canManageLoans && (
                    <td>
                      {['Activo', 'Renovacion pendiente'].includes(loan.status) ? (
                        <button type="button" onClick={() => returnLoan(loan.id)}>
                          Registrar devolucion
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ color: 'var(--color-charcoal-light)', marginTop: 'var(--spacing-md)' }}>
        La multa aplica solo a clientes cuando devuelven despues de la fecha limite: $1.00 por dia de retraso.
      </p>
    </div>
  );
}

function CatalogView() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const canRequestLoan = ['CLIENTE', 'ESTUDIANTE', 'PROFESOR'].includes(user?.rol || '');

  const categories = Array.from(
    new Set(books.map((book) => book.category?.name).filter(Boolean)),
  ) as string[];

  const loadBooks = async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (category) params.set('category', category);
      const response = await api.get(`/books${params.toString() ? `?${params}` : ''}`);
      setBooks(response.data);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'No se pudo cargar el catalogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const requestLoan = async (bookId: number) => {
    setMessage('');
    try {
      await api.post('/loans/request', { bookId });
      setMessage('Solicitud de prestamo registrada.');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'No se pudo solicitar el prestamo.');
    }
  };

  return (
    <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
      <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-forest)' }}>Catalogo</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          loadBooks();
        }}
        style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 220px auto', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, autor, editorial o anio"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Todas las categorias</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button type="submit">Buscar</button>
      </form>

      {message && <p style={{ color: message.includes('No se') ? 'var(--color-error)' : 'var(--color-success)' }}>{message}</p>}
      {loading ? (
        <p>Cargando libros...</p>
      ) : (
        <>
          <p style={{ color: 'var(--color-charcoal-light)' }}>{books.length} libros encontrados</p>
          <div className="book-grid">
            {books.map((book) => {
              const availableCopies = Number(book._count?.copies || 0);
              return (
                <article className="book-card" key={book.id}>
                  <h4>{book.title}</h4>
                  <p>{book.author?.name || 'Autor no registrado'}</p>
                  <p>{book.description || 'Sin descripcion.'}</p>
                  <div className="book-meta">
                    <span>{book.category?.name || 'Sin categoria'}</span>
                    <span>{book.publisher || 'Sin editorial'}</span>
                    <span>{book.publicationYear || 'Sin anio'}</span>
                    <span>{book.isbn}</span>
                  </div>
                  <strong>{availableCopies} disponibles</strong>
                  {canRequestLoan && (
                    <button
                      type="button"
                      disabled={availableCopies <= 0}
                      onClick={() => requestLoan(book.id)}
                    >
                      Pedir libro
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-ivory)' }}>
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--color-white)',
        borderRight: '1px solid var(--color-ivory-dark)',
        padding: 'var(--spacing-xl) var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xxl)', padding: '0 var(--spacing-sm)' }}>
          <BookOpen size={28} color="var(--color-terracotta)" />
          <h1 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Biblioteca</h1>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <Search size={20} />
            Catalogo
          </Link>
          <Link to="/dashboard/mis-prestamos" className={`sidebar-link ${location.pathname.includes('/mis-prestamos') ? 'active' : ''}`}>
            <Library size={20} />
            Mis Prestamos
          </Link>
          <Link to="/dashboard/perfil" className={`sidebar-link ${location.pathname.includes('/perfil') ? 'active' : ''}`}>
            <User size={20} />
            Mi Perfil
          </Link>
        </nav>

        <button onClick={handleLogout} className="sidebar-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', marginTop: 'auto', color: 'var(--color-error)' }}>
          <LogOut size={20} />
          Cerrar Sesion
        </button>
      </aside>

      <main style={{ flex: 1, padding: 'var(--spacing-xl)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ marginBottom: 0 }}>Explorar Catalogo</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <span className="badge badge-active">{user?.rol || 'Rol'}</span>
            <span style={{ fontWeight: 500, color: 'var(--color-forest)' }}>Hola, {user?.nombre || 'Usuario'}</span>
          </div>
        </header>

        <Routes>
          <Route path="/" element={
            <CatalogView />
          } />
          <Route path="/mis-prestamos" element={<LoansView />} />
          <Route path="/perfil" element={
            <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-forest)' }}>Mi Perfil</h3>
              <p><strong>Nombre:</strong> {user?.nombre}</p>
              <p><strong>Correo:</strong> {user?.email}</p>
              <p><strong>Rol:</strong> {user?.rol}</p>
            </div>
          } />
        </Routes>
      </main>

      <style>{`
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
        .loans-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 920px;
        }
        .loans-table th,
        .loans-table td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--color-ivory-dark);
          text-align: left;
          white-space: nowrap;
        }
        .loans-table th {
          color: var(--color-forest);
          font-size: 0.78rem;
          text-transform: uppercase;
        }
        .fine-cell {
          color: var(--color-error);
          font-weight: 700;
        }
        .book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: var(--spacing-md);
        }
        .book-card {
          display: grid;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: 1px solid var(--color-ivory-dark);
          border-radius: var(--radius-md);
          background: var(--color-white);
        }
        .book-card h4,
        .book-card p {
          margin: 0;
        }
        .book-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          color: var(--color-charcoal-light);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
