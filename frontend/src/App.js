import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import FAQPage from './components/FAQPage';

// Pages
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage';
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
            {/* ── Public Routes (No Login Required) ── */}
            {/* The Grand Entrance */}
            <Route path="/" element={<WelcomePage />} />
            
            {/* Unified Authentication */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Catch old standalone links and push to unified Auth */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth" replace />} />
            
            {/* Guest Access allowed here */}
            <Route path="/faq" element={<FAQPage />} />

            {/* ── Protected Student Routes (Login Required) ── */}
            {/* Anything inside this wrapper is completely locked down */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Community requires login to view, post, or answer */}
              <Route path="/community" element={<OAQPage />} />
              
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>

            {/* ── Protected Admin Route (Login + Admin Role Required) ── */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;