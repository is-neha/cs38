import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import HomePage from './components/HomePage';
import FAQPage from './components/FAQPage';
import DashboardPage from './pages/DashboardPage';
import OAQPage from './pages/OAQPage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';
import './App.css';

function RootHandler() {
  const { user } = useAuth();
  if (!user) return <AuthPage />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <HomePage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<RootHandler />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/community" element={<OAQPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            } />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;