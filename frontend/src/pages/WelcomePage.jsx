import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './WelcomePage.css';

function WelcomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { dark } = useTheme();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
  });

  useEffect(() => {
    const themeVal = theme || 'light';
    localStorage.setItem('theme', themeVal);
    document.documentElement.setAttribute('data-theme', themeVal);

    return () => {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    };
  }, [dark, theme]);

  useEffect(() => {
    if (!loading && user) {
      navigate('/faq', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || user) return null;

  const isDark = theme === 'dark';

  return (
    <main className={`welcome-page welcome-page--${theme}`}>
      <div className="welcome-particles" aria-hidden="true">
        <div className="welcome-particle" />
        <div className="welcome-particle" />
        <div className="welcome-particle" />
        <div className="welcome-particle" />
        <div className="welcome-particle" />
        <div className="welcome-particle" />
        <div className="welcome-particle" />
        <div className="welcome-particle" />
        <div className="welcome-particle" />
        <div className="welcome-particle" />
      </div>
      <button
        className="welcome-bulb-toggle"
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <svg className="welcome-bulb-cord" viewBox="0 0 4 60" fill="none">
          <path d="M2 0v60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
        <div className="welcome-bulb-icon">
          <svg viewBox="0 0 32 48" fill="none" className="welcome-bulb-svg">
            {isDark ? (
              <>
                <path d="M16 4C8.82 4 3 9.82 3 17c0 4.5 2.22 8.5 5.62 11 .8.6 1.38 1.5 1.38 2.5V32a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1.5c0-1 .58-1.9 1.38-2.5A13.94 13.94 0 0 0 29 17C29 9.82 23.18 4 16 4Z" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                <line x1="12" y1="36" x2="20" y2="36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="13" y1="39" x2="19" y2="39" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="14" y1="42" x2="18" y2="42" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16" cy="17" r="4" fill="#64748b" />
              </>
            ) : (
              <>
                <path d="M16 4C8.82 4 3 9.82 3 17c0 4.5 2.22 8.5 5.62 11 .8.6 1.38 1.5 1.38 2.5V32a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1.5c0-1 .58-1.9 1.38-2.5A13.94 13.94 0 0 0 29 17C29 9.82 23.18 4 16 4Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="12" y1="36" x2="20" y2="36" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="13" y1="39" x2="19" y2="39" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="14" y1="42" x2="18" y2="42" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16" cy="17" r="6" fill="#fef3c7" opacity="0.6" />
                <circle cx="16" cy="17" r="8" fill="#fef3c7" opacity="0.3" />
                <circle cx="16" cy="17" r="10" fill="#fef3c7" opacity="0.15" />
              </>
            )}
          </svg>
        </div>
      </button>
      <section className="welcome-card" aria-labelledby="welcome-title">
        <div className="welcome-content">
          <span className="welcome-kicker">FAQ Portal</span>
          <h1 id="welcome-title" className="welcome-title">Welcome</h1>
          <p className="welcome-subtitle">Choose your access level to continue</p>

          <button
            className="welcome-btn welcome-btn--guest"
            type="button"
            onClick={() => navigate('/faq')}
          >
            Continue as Guest
            <span aria-hidden="true">-&gt;</span>
          </button>

          <div className="welcome-divider">
            <span />
            <strong>OR</strong>
            <span />
          </div>

          <button
            className="welcome-btn welcome-btn--auth"
            type="button"
            onClick={() => navigate('/auth')}
          >
            Login / Sign Up
          </button>
        </div>
      </section>
    </main>
  );
}

export default WelcomePage;
