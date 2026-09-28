import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const NAV_LINKS = {
  STUDENT: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/pass', label: 'My Pass' },
    { to: '/payments', label: 'Payments' },
    { to: '/maintenance', label: 'Maintenance' },
  ],
  WARDEN: [
    { to: '/warden/dashboard', label: 'Dashboard' },
    { to: '/warden/verify', label: 'Verify Payments' },
    { to: '/warden/allocation', label: 'Allocation' },
    { to: '/warden/maintenance', label: 'Maintenance' },
  ],
  GATE_STAFF: [{ to: '/scanner', label: 'Scanner' }],
  ADMIN: [{ to: '/admin/staff', label: 'Manage Staff' }],
};

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
  const roleLinks = user ? NAV_LINKS[user.role] || [] : [];
  const homeTo = user ? HOME_BY_ROLE[user.role] || '/' : '/';

  return (
    <header className="cp-header">
      <div className="cp-header-identity">
        <Link to={homeTo} className="cp-header-brand" aria-label="HostelGo home">
          <img src="/HostelGo-logo.png" alt="HostelGo" className="cp-header-logo" />
          <span className="cp-header-tagline">Digital Hostel<br />Management</span>
        </Link>

        <div className="cp-header-account">
          {user ? (
            <>
              {user.role === 'STUDENT' ? (
                <Link to="/profile" className="cp-header-user cp-header-user-link">
                  {user.name}
                  {user.usn && <span className="cp-header-usn">{user.usn}</span>}
                </Link>
              ) : (
                <span className="cp-header-user">
                  {user.name}
                  {user.staffId && <span className="cp-header-usn">{user.staffId}</span>}
                </span>
              )}
              <button type="button" className="cp-header-logout" onClick={logout}>Logout</button>
            </>
          ) : (
            <nav className="cp-header-quicklinks" aria-label="Quick links">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`cp-header-quicklink ${link.to === '/register' ? 'cp-header-quicklink--primary' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="cp-header-hairline" />

      {roleLinks.length > 0 && (
        <nav className="cp-header-nav" aria-label="Navigation">
          {roleLinks.map((link) => (
            <Link key={link.to} to={link.to} className="cp-header-navlink">{link.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}