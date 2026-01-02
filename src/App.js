import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { LoadingProvider } from './context/LoadingContext';
import Login from './components/Auth/Login';
import MainLayout from './components/Layout/MainLayout';
import SessionTimeout from './components/Auth/SessionTimeout';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always show login page on app start
    // Remove auto-login for security
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    
    // Reset authentication state
    setIsAuthenticated(false);
    
    // Force redirect to login page
    window.location.href = '/login';
  };

  const handleLogin = () => {
    localStorage.setItem('session', JSON.stringify({ timestamp: Date.now() }));
    setIsAuthenticated(true);
  };

  const handleDemo = () => {
    localStorage.setItem('session', JSON.stringify({ timestamp: Date.now() }));
    localStorage.setItem('demoData', 'true');
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppProvider>
        <ToastProvider>
          <LoadingProvider>
            <div className="app">
              <Routes>
                <Route path="/login" element={
                  !isAuthenticated ? (
                    <Login onLogin={handleLogin} onDemo={handleDemo} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                } />
                <Route path="/*" element={
                  isAuthenticated ? (
                    <>
                      <MainLayout onLogout={handleLogout} />
                      <SessionTimeout onLogout={handleLogout} />
                    </>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } />
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
              </Routes>
            </div>
          </LoadingProvider>
        </ToastProvider>
      </AppProvider>
    </Router>
  );
}

export default App;

