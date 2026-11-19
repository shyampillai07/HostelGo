import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';


const HOME_BY_ROLE = {
  STUDENT: '/dashboard',
  WARDEN: '/warden/dashboard',
  GATE_STAFF: '/scanner',
  ADMIN: '/admin/staff',
};

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const homeTo = user ? HOME_BY_ROLE[user.role] || '/' : '/';

  return (
    <header className="cp-header">
      {user ? (
        <div className="cp-appbar">
          <Link to={homeTo} className="cp-appbar-brand" aria-label="HostelGo home">
            <img src="/HostelGo-logo.png" alt="HostelGo" className="cp-appbar-logo" />
          </Link>

          <div className="cp-appbar-center" aria-hidden="true">
            <span className="cp-appbar-workspace">{user.role === 'GATE_STAFF' ? 'Gate operations' : user.role === 'ADMIN' ? 'Administration' : user.role === 'WARDEN' ? 'Hostel operations' : 'Student workspace'}</span>
          </div>

          <div className="cp-appbar-actions">
            {user.role === 'STUDENT' ? (
              <Link to="/profile" className="cp-appbar-profile">
                <span>{user.name}</span>
                <small>{user.usn}</small>
              </Link>
            ) : (
              <div className="cp-appbar-profile">
                <span>{user.name}</span>
                <small>{user.staffId}</small>
              </div>
            )}
            <button type="button" className="cp-appbar-logout" onClick={logout}>Sign out</button>
          </div>
        </div>
      ) : (
        <div className="cp-header-identity">
          <Link to="/" className="cp-header-brand" aria-label="HostelGo home">
            <img src="/HostelGo-logo.png" alt="HostelGo" className="cp-header-logo" />
          </Link>
          <nav className="cp-header-quicklinks" aria-label="Quick links">
            {QUICK_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `cp-header-quicklink ${link.to === '/register' ? 'cp-header-quicklink--primary' : ''} ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}