import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from '../../context/AppContext';
import Icon from '../UI/Icon';
import './Header.css';

const Header = ({ onMenuClick, onLogout }) => {
  const { darkMode, toggleDarkMode, userRole } = useApp();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const avatarBtnRef = useRef(null);
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, left: 0 });

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position when menu is shown
  useEffect(() => {
    if (showUserMenu && avatarBtnRef.current) {
      const rect = avatarBtnRef.current.getBoundingClientRect();
      setUserMenuPosition({
        top: rect.bottom + 6, // 6px gap below button
        left: rect.right - 180 // align right edge, 180px is dropdown width
      });
    }
  }, [showUserMenu]);

  // Mock notifications data
  const notifications = [
    { id: 1, type: 'info', message: 'Document approval pending', time: '2 hours ago', read: false },
    { id: 2, type: 'success', message: 'Onboarding form completed', time: '5 hours ago', read: false },
    { id: 3, type: 'warning', message: 'Document expiry in 7 days', time: '1 day ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          title="Menu"
        >
          <Icon name="menu" size={20} />
        </button>
        <div className="header-logo">
          <img 
            src={process.env.PUBLIC_URL + "/images/ValueMomentum_logo.png"} 
            alt="ValueMomentum" 
            className="header-logo-image"
          />
        </div>
        <div className="header-search">
          <Icon name="search" size={18} className="search-icon" />
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
        <div className="header-notifications" ref={notificationsRef}>
          <button 
            className="header-icon-btn" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Icon name="bell" size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          {showNotifications && ReactDOM.createPortal(
            <div className="notifications-panel notifications-panel-portal">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <button className="mark-all-read">Mark all as read</button>
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-content">
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="notifications-footer">
                <button>View all notifications</button>
              </div>
            </div>,
            document.body
          )}
        </div>

        <button 
          className="header-icon-btn" 
          onClick={toggleDarkMode}
          title="Toggle dark mode"
        >
          <Icon name="settings" size={20} />
        </button>

        <div className="header-user-menu" ref={userMenuRef}>
          <button 
            className="header-user-btn"
            ref={avatarBtnRef}
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
            title="User menu"
          >
            {userRole === 'hr' ? (
              <div className="avatar-circle header-avatar-hr">RR</div>
            ) : (
              <img
                src={process.env.PUBLIC_URL + '/images/shashank.jpg'}
                alt="Shashank Tudum"
                className="header-avatar-img"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
              />
            )}
          </button>
          {showUserMenu && ReactDOM.createPortal(
            <div
              className="user-menu-dropdown user-menu-dropdown-small user-menu-dropdown-portal"
              style={{ position: 'fixed', top: userMenuPosition.top, left: userMenuPosition.left, zIndex: 2000 }}
            >
              <div className="user-menu-header">
                <div className="user-menu-avatar header-avatar-hr-small">
                  {userRole === 'hr' ? (
                    <img src={process.env.PUBLIC_URL + '/images/raghavendra.jpg'} alt="Raghavendra Raju" style={{width: 28, height: 28, borderRadius: '50%', objectFit: 'cover'}} />
                  ) : (
                    <img src={process.env.PUBLIC_URL + '/images/shashank.jpg'} alt="Shashank Tudum" style={{width: 28, height: 28, borderRadius: '50%', objectFit: 'cover'}} />
                  )}
                </div>
                <div>
                  <div className="user-menu-name" style={{fontSize: '13px'}}>{userRole === 'hr' ? 'Raghavendra Raju' : 'Shashank Tudum'}</div>
                  <div className="user-menu-email" style={{fontSize: '11px'}}>{userRole === 'hr' ? 'raghavendra@valuemomentum.com' : 'shashank@valuemomentum.com'}</div>
                </div>
              </div>
              <div className="user-menu-divider"></div>
              <div className="user-menu-items">
                <button className="user-menu-item"><Icon name="user" size={16} /><span>Profile</span></button>
                <button className="user-menu-item"><Icon name="settings" size={16} /><span>Settings</span></button>
                <div className="user-menu-divider"></div>
                <button className="user-menu-item" type="button" onClick={() => { setShowUserMenu(false); if (onLogout) onLogout(); }}><Icon name="logout" size={16} /><span>Logout</span></button>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

