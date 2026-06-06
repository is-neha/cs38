import React, { useState } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function AuthPage() {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const [roleTab, setRoleTab] = useState('student');
  const [studentTab, setStudentTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/faq" replace />;
  }

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      if (roleTab === 'admin' && data.user.role !== 'admin') {
        setError('This account is not an admin. Use the Student section.');
        return;
      }
      if (roleTab === 'student' && data.user.role !== 'student') {
        setError('This account is not a student. Use the Admin section.');
        return;
      }
      login(data.user);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/faq');
      }
    } catch { setError('Connection error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.user);
      navigate('/faq');
    } catch { setError('Connection error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const switchRole = (r) => {
    setRoleTab(r);
    clearForm();
  };

  return (
    <div className="authpage">
      <div className="authpage-card">
        <div className="authpage-header">
          <h1 className="authpage-title">FAQ Portal</h1>
          <p className="authpage-subtitle">Vicharanashala Internship</p>
        </div>

        <div className="authpage-tabs">
          <button
            className={`authpage-tab ${roleTab === 'student' ? 'authpage-tab--active' : ''}`}
            onClick={() => switchRole('student')}
          >
            Student
          </button>
          <button
            className={`authpage-tab ${roleTab === 'admin' ? 'authpage-tab--active' : ''}`}
            onClick={() => switchRole('admin')}
          >
            Admin
          </button>
        </div>

        {roleTab === 'student' && (
          <div className="authpage-subtabs">
            <button
              className={`authpage-subtab ${studentTab === 'signin' ? 'authpage-subtab--active' : ''}`}
              onClick={() => { setStudentTab('signin'); clearForm(); }}
            >
              Sign In
            </button>
            <button
              className={`authpage-subtab ${studentTab === 'signup' ? 'authpage-subtab--active' : ''}`}
              onClick={() => { setStudentTab('signup'); clearForm(); }}
            >
              Create Account
            </button>
          </div>
        )}

        {error && <div className="authpage-error">{error}</div>}

        {roleTab === 'admin' ? (
          <form className="authpage-form" onSubmit={handleSignIn}>
            <div className="authpage-field">
              <label htmlFor="ap-email-admin">Admin Email</label>
              <input
                id="ap-email-admin"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@faq.com"
                required
              />
            </div>
            <div className="authpage-field">
              <label htmlFor="ap-password-admin">Password</label>
              <div className="authpage-pw">
                <input
                  id="ap-password-admin"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="authpage-pw-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <button className="authpage-btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>
        ) : studentTab === 'signin' ? (
          <form className="authpage-form" onSubmit={handleSignIn}>
            <div className="authpage-field">
              <label htmlFor="ap-email">Student Email</label>
              <input
                id="ap-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="authpage-field">
              <label htmlFor="ap-password">Password</label>
              <div className="authpage-pw">
                <input
                  id="ap-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="authpage-pw-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <button className="authpage-btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="authpage-form" onSubmit={handleSignUp}>
            <div className="authpage-field">
              <label htmlFor="ap-name">Full name</label>
              <input
                id="ap-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="authpage-field">
              <label htmlFor="ap-email2">Student Email</label>
              <input
                id="ap-email2"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="authpage-field">
              <label htmlFor="ap-password2">Password</label>
              <div className="authpage-pw">
                <input
                  id="ap-password2"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
                <button type="button" className="authpage-pw-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <button className="authpage-btn" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
