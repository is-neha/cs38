import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import HomePage from './components/HomePage';
import WelcomePage from './pages/WelcomePage';
import FAQPage from './components/FAQPage';
import DashboardPage from './pages/DashboardPage';
import OAQPage from './pages/OAQPage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth" replace />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
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
