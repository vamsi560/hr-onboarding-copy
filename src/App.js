import React, { useState, useEffect } from 'react';
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
    <AppProvider>
      <ToastProvider>
        <LoadingProvider>
          <div className="app">
            {!isAuthenticated ? (
              <Login onLogin={handleLogin} onDemo={handleDemo} />
            ) : (
              <>
                <MainLayout onLogout={handleLogout} />
                <SessionTimeout onLogout={handleLogout} />
              </>
            )}
          </div>
        </LoadingProvider>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;

