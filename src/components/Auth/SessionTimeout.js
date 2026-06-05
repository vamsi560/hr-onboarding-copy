import React, { useState, useEffect } from 'react';
import './SessionTimeout.css';

const SessionTimeout = ({ onLogout }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  useEffect(() => {
    let warningTimer;
    let logoutTimer;
    
    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(WARNING_TIME / 1000);
      }, SESSION_TIMEOUT - WARNING_TIME);
      
      logoutTimer = setTimeout(() => {
        onLogout();
      }, SESSION_TIMEOUT);
    };

    const handleActivity = () => {
      if (showWarning) {
        setShowWarning(false);
      }
      resetTimers();
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    resetTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [showWarning, onLogout, SESSION_TIMEOUT, WARNING_TIME]);

  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      const countdown = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    }
  }, [showWarning, timeLeft]);

  const extendSession = () => {
    setShowWarning(false);
    setTimeLeft(0);
  };

  if (!showWarning) return null;

  return (
    <div className="session-timeout-overlay">
      <div className="session-timeout-modal">
        <div className="session-timeout-icon">⏰</div>
        <h3>Session Expiring Soon</h3>
        <p>Your session will expire in <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong></p>
        <p>Click "Stay Logged In" to continue your session.</p>
        <div className="session-timeout-actions">
          <button className="btn-primary" onClick={extendSession}>
            Stay Logged In
          </button>
          <button className="btn-secondary" onClick={onLogout}>
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;