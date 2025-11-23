import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './Header.css';

const Header = ({ onMenuClick, onLogout }) => {
  const { darkMode, toggleDarkMode } = useApp();
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      setCurrentDateTime(now.toLocaleDateString('en-US', options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          title="Menu"
        >
          ☰
        </button>
        <div className="header-search">
          <span className="search-icon">⌕</span>
          <input 
            type="text" 
            placeholder="Search for..." 
            className="search-input"
          />
        </div>
      </div>

      <div className="header-center">
        <div className="header-datetime">{currentDateTime}</div>
      </div>

      <div className="header-right">
        <button className="header-icon-btn" title="Messages">
          <span className="icon">✉</span>
        </button>
        <button className="header-icon-btn" title="Notifications">
          <span className="icon">🔔</span>
          <span className="notification-badge">3</span>
        </button>
        <button className="header-icon-btn" title="Alerts">
          <span className="icon">⚠</span>
          <span className="notification-badge">2</span>
        </button>
        <button 
          className="header-icon-btn" 
          onClick={toggleDarkMode}
          title="Settings"
        >
          <span className="icon">⚙</span>
        </button>
        <button 
          className="header-icon-btn" 
          onClick={onLogout}
          title="Logout"
        >
          <span className="icon">→</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

