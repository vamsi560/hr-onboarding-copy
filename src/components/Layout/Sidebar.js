import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../UI/Icon';
import './Sidebar.css';

const Sidebar = ({ activeView, onNavClick, isMobileOpen, onClose, onCollapseChange }) => {
  const { userRole, location } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapseToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
  };

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

  // Alumni users don't get sidebar navigation
  if (userRole === 'alumni') {
    return null;
  }

  const menuItems = userRole === 'hr' ? hrMenuItems : candidateMenuItems;

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <nav className={`sidebar ${isMobileOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-collapse-btn sidebar-collapse-btn-absolute"
          onClick={handleCollapseToggle}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={20} />
        </button>
        <div className="sidebar-content">
          {/* User Profile Section */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
          </div>
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {userRole === 'hr' ? (
                <img
                  src={process.env.PUBLIC_URL + '/images/raghavendra.jpg'}
                  alt="Raghavendra Raju"
                  className="sidebar-avatar-img"
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
                />
              ) : (
                <img
                  src={process.env.PUBLIC_URL + '/images/shashank.jpg'}
                  alt="Shashank Tudum"
                  className="sidebar-avatar-img"
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
                />
              )}
            </div>
            {!collapsed && (
              <>
                <div className="profile-name">
                  {userRole === 'hr' ? 'Raghavendra Raju' : 'Shashank Tudum'}
                </div>
                <div className="profile-role">
                  {userRole === 'hr' ? 'HR' : 'New Employee'} • {location === 'us' ? 'US' : 'India'}
                </div>
              </>
            )}
          </div>

          {/* Navigation Menu */}
          <ul className="sidebar-list">
            {menuItems.map(item => (
              <li
                key={item.id}
                className={activeView === item.id ? 'active' : ''}
                onClick={() => onNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                data-nav={item.id}
              >
                <Icon name={item.icon} size={20} className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {item.badge && !collapsed && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {activeView === item.id && <span className="active-dot"></span>}
              </li>
            ))}
          </ul>

          {/* Logo at Bottom */}
          {!collapsed && (
            <div className="sidebar-logo">
              <img 
                src={process.env.PUBLIC_URL + "/images/ValueMomentum_logo.png"} 
                alt="ValueMomentum" 
                className="logo-image"
              />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;

