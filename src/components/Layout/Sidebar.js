import React from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../UI/Icon';
import './Sidebar.css';

const Sidebar = ({ activeView, onNavClick, isMobileOpen, onClose }) => {
  const { userRole, location } = useApp();

  const candidateMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'form', label: 'Onboarding Form', icon: 'form' },
    { id: 'documents', label: 'Documents', icon: 'documents' },
    { id: 'validation', label: 'AI Validation', icon: 'validation' },
    { id: 'support', label: 'Support', icon: 'support' }
  ];

  const hrMenuItems = [
    { id: 'hr', label: 'HR Dashboard', icon: 'hr' },
    { id: 'exceptions', label: 'Exceptions', icon: 'exceptions', badge: 3 },
    { id: 'workflows', label: 'Workflows', icon: 'workflows' },
    { id: 'references', label: 'Reference Checks', icon: 'references' },
    { id: 'expiry', label: 'Document Expiry', icon: 'expiry', badge: 2 },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'chat', label: 'Chat', icon: 'chat' },
    { id: 'auditlog', label: 'Audit Log', icon: 'auditlog' },
    { id: 'support', label: 'Support', icon: 'support' }
  ];

  const menuItems = userRole === 'hr' ? hrMenuItems : candidateMenuItems;

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <nav className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">
          {/* User Profile Section */}
          <div className="sidebar-profile">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {userRole === 'hr' ? 'RR' : 'ST'}
              </div>
            </div>
            <div className="profile-name">
              {userRole === 'hr' ? 'Raghavendra Raju' : 'Shashank Tudum'}
            </div>
            <div className="profile-role">
              {userRole === 'hr' ? 'HR' : 'New Employee'} • {location === 'us' ? 'US' : 'India'}
            </div>
          </div>

          {/* Navigation Menu */}
          <ul className="sidebar-list">
            {menuItems.map(item => (
              <li
                key={item.id}
                className={activeView === item.id ? 'active' : ''}
                onClick={() => onNavClick(item.id)}
              >
                <Icon name={item.icon} size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {activeView === item.id && <span className="active-dot"></span>}
              </li>
            ))}
          </ul>

          {/* Logo at Bottom */}
          <div className="sidebar-logo">
            <img 
              src={process.env.PUBLIC_URL + "/images/ValueMomentum_logo.png"} 
              alt="ValueMomentum" 
              className="logo-image"
            />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;

