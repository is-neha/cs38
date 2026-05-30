/*
 * Navbar.js — Top navigation bar component
 *
 * Purpose:
 *   Renders a responsive navigation bar with links, auth-aware controls
 *   (Sign in / Sign up vs. Dashboard / Sign out), a hamburger menu for
 *   mobile viewports, a notification bell, and a dark‑mode theme toggle.
 *
 * Key behaviour:
 *   - Uses React state (`menuOpen`) to show/hide the mobile nav links.
 *   - `toggleMenu` flips the state; `closeMenu` sets it to false.
 *   - `closeMenu` is attached to every link so navigating auto‑closes the
 *     mobile menu.
 *   - The `.active` CSS class (applied conditionally on `menuOpen`)
 *     controls visibility of the link list on small screens.
 */

import React, { useState } from 'react';          // useState for hamburger open/close state
import { Link, useNavigate } from 'react-router-dom'; // Link for client-side navigation, useNavigate for programmatic redirect
import { useAuth } from '../context/AuthContext';  // Custom hook providing { user, login, logout }
import ThemeToggle from './ThemeToggle';           // Dark / light mode toggle button
import NotificationBell from './NotificationBell'; // Unread notification indicator + dropdown
import './Navbar.css';                             // Component styles

function Navbar() {
  // ── Auth & routing ──
  const { user, logout } = useAuth();   // `user` is null when logged out, object when logged in
  const navigate = useNavigate();

  // ── Hamburger menu state ──
  // `menuOpen` controls whether the mobile nav links are visible.
  // `toggleMenu` toggles the boolean (used by the hamburger button).
  // `closeMenu` always closes (used by every nav link so the menu auto‑closes on tap).
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(p => !p);  // Flip open/closed (functional update)
  const closeMenu = () => setMenuOpen(false);      // Force closed (used by link clicks)

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ── Brand / logo – links to home ── */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          {/* Inline SVG: question‑mark circle icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="navbar-logo">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <span>FAQ Portal</span>
        </Link>

        {/* ── Navigation links (desktop: inline row, mobile: dropdown) ── */}
        {/* The `active` class is appended when `menuOpen` is true, revealing the links on mobile. */}
        <div className={`navbar-links${menuOpen ? ' active' : ''}`}>

          {/* Public links — always visible */}
          <Link to="/" className="navbar-link" onClick={closeMenu}>Home</Link>
          <Link to="/faq" className="navbar-link" onClick={closeMenu}>FAQ</Link>
          <Link to="/community" className="navbar-link" onClick={closeMenu}>Community</Link>
          <Link to="/leaderboard" className="navbar-link" onClick={closeMenu}>Leaderboard</Link>

          {/* Authenticated vs. guest controls — swapped based on `user` */}
          {user ? (
            <>
              {/* Links only shown when a user is logged in */}
              <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>Dashboard</Link>
              {/* Admin panel – only rendered for admin‑role users */}
              {user.role === 'admin' && <Link to="/admin" className="navbar-link" onClick={closeMenu}>Admin</Link>}
              {/* Sign‑out button – calls logout then redirects to home */}
              <button className="navbar-btn" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
            </>
          ) : (
            <>
              {/* Guest links – shown when no user is logged in */}
              <Link to="/login" className="navbar-link" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" className="navbar-btn navbar-btn--primary" onClick={closeMenu}>Sign up</Link>
            </>
          )}
        </div>

        {/* ── Right‑side utilities (always visible) ── */}
        <div className="navbar-right">
          {/* Hamburger button – hidden on desktop (display: none), flex on mobile */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {/* Three bars that animate into an X when `.open` is added */}
            <div className="bar" /><div className="bar" /><div className="bar" />
          </button>

          {/* Notification bell (icon + dropdown) */}
          <NotificationBell />

          {/* Theme toggle (dark / light) positioned below the navbar */}
          <div className="navbar-lamp">
            <ThemeToggle />
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
