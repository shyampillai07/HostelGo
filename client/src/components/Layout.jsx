import Header from './Header';
import { NAV_LINKS } from './navigation';
import Footer from './Footer';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user } = useAuth();

  if (user) {
    const links = NAV_LINKS[user.role] || [];
    return (
      <div className="cp-shell cp-shell--app">
        <Header />
        <div className="cp-app-layout">
          <aside className="cp-sidebar" aria-label="Workspace navigation">
            <nav className="cp-sidebar-nav">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/dashboard' || link.to === '/warden/dashboard' || link.to === '/admin/staff' || link.to === '/scanner'}
                  className={({ isActive }) => `cp-sidebar-link ${isActive ? 'is-active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className="cp-main cp-main--app">
            <div className="cp-main-inner">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-shell">
      <Header />
      <main className="cp-main">
        <div className="cp-watermark" aria-hidden="true" />
        <div className="cp-main-inner">{children}</div>
      </main>
      <Footer />
    </div>
  );
}