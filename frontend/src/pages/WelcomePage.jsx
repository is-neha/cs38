import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './WelcomePage.css';

const WELCOME_THEME_KEY = 'welcome-theme';

function WelcomePage() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(WELCOME_THEME_KEY);
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'dark';
  });

  useEffect(() => {
    localStorage.setItem(WELCOME_THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);

    return () => {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    };
  }, [dark, theme]);

  const isDark = theme === 'dark';

  return (
    <main className={`welcome-page welcome-page--${theme}`}>
      <button
        className="welcome-theme-toggle"
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? 'Light' : 'Dark'}
      </button>

      <section className="welcome-card" aria-labelledby="welcome-title">
        <div className="welcome-orbit welcome-orbit--one" />
        <div className="welcome-orbit welcome-orbit--two" />
        <div className="welcome-orbit welcome-orbit--three" />

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
