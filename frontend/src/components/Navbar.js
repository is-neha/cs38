import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(p => !p);
  const closeMenu = () => setMenuOpen(false);

  const isAuthPage = location.pathname === '/';

  if (isAuthPage && !user) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="navbar-logo">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span>FAQ Portal</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand-wrapper">
          <Link to={user ? "/home" : "/"} className="navbar-brand" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="navbar-logo">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span>FAQ Portal</span>
          </Link>
          <Link to={user ? "/home" : "/"} className="navbar-brand-home" onClick={closeMenu}>Home</Link>
        </div>

        <div className={`navbar-links${menuOpen ? ' active' : ''}`}>
          <Link to="/faq" className="navbar-link" onClick={closeMenu}>FAQ</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar-link" onClick={closeMenu}>Admin</Link>
          )}
          {!user && (
            <>
              <Link to="/auth" className="navbar-link" onClick={closeMenu}>Sign in</Link>
              <Link to="/auth" className="navbar-btn navbar-btn--primary" onClick={closeMenu}>Sign up</Link>
            </>
          )}
        </div>

        <div className="navbar-right">
          {user && (
            <div className="navbar-user">
              <div className={`navbar-avatar navbar-avatar--${user.role}`}>
                {(user.name || user.email || '?')[0].toUpperCase()}
              </div>
              <span className={`navbar-role-tag navbar-role-tag--${user.role}`}>{user.role}</span>
              <span className="navbar-points">{user.points || 0} pts</span>
              <button className="navbar-btn--signout" title="Sign out" onClick={(e) => { e.stopPropagation(); logout(); navigate('/'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}
          <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
            <div className="bar" /><div className="bar" /><div className="bar" />
          </button>
          <NotificationBell />
          <div className="navbar-lamp">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
