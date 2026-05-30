import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="navbar-logo">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <span>FAQ Portal</span>
        </Link>

        {/* Dynamic Navigation Menu links */}
        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={closeMenu}>Home</Link>
          <Link to="/faq" className="navbar-link" onClick={closeMenu}>FAQ</Link>
          <Link to="/community" className="navbar-link" onClick={closeMenu}>Community</Link>
          <Link to="/leaderboard" className="navbar-link" onClick={closeMenu}>Leaderboard</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin" className="navbar-link" onClick={closeMenu}>Admin</Link>}
              <button className="navbar-btn" onClick={() => { logout(); navigate('/'); closeMenu(); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" className="navbar-btn navbar-btn--primary" onClick={closeMenu}>Sign up</Link>
            </>
          )}
        </div>

        {/* Persistent Utilities & Hamburger Controls */}
        <div className="navbar-right">
          <NotificationBell />
          <div className="navbar-lamp">
            <ThemeToggle />
          </div>
          
          {/* Hamburger Icon Element (Displays to the right of indicators on mobile views) */}
          <div className="hamburger" onClick={toggleMenu}>
            <div className={`bar ${isOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isOpen ? 'open' : ''}`}></div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;