import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, Library, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      {/* Sidebar */}
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
            Catálogo
          </Link>
          <Link to="/dashboard/mis-prestamos" className={`sidebar-link ${location.pathname.includes('/mis-prestamos') ? 'active' : ''}`}>
            <Library size={20} />
            Mis Préstamos
          </Link>
          <Link to="/dashboard/perfil" className={`sidebar-link ${location.pathname.includes('/perfil') ? 'active' : ''}`}>
            <User size={20} />
            Mi Perfil
          </Link>
        </nav>
        
        <button onClick={handleLogout} className="sidebar-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', marginTop: 'auto', color: 'var(--color-error)' }}>
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'var(--spacing-xl)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ marginBottom: 0 }}>Explorar Catálogo</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <span className="badge badge-active">{user?.rol || 'Rol'}</span>
            <span style={{ fontWeight: 500, color: 'var(--color-forest)' }}>Hola, {user?.nombre || 'Usuario'}</span>
          </div>
        </header>
        
        <Routes>
          <Route path="/" element={
            <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-forest)' }}>Libros Recientes</h3>
              <p>El catálogo se mostrará aquí próximamente.</p>
            </div>
          } />
          {/* Añadiremos más rutas de vistas más adelante */}
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
      `}</style>
    </div>
  );
}
