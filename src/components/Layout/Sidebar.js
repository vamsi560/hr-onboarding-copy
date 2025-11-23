import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeView, onNavClick, isMobileOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'form', label: 'Onboarding Form' },
    { id: 'documents', label: 'Documents' },
    { id: 'validation', label: 'AI Validation' },
    { id: 'hr', label: 'HR Review' },
    { id: 'support', label: 'Support' }
  ];

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <nav className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">
          {/* User Profile Section */}
          <div className="sidebar-profile">
            <div className="profile-avatar">
              <div className="avatar-circle">JD</div>
            </div>
            <div className="profile-name">John Doe</div>
            <div className="profile-role">New Employee</div>
          </div>

          {/* Navigation Menu */}
          <ul className="sidebar-list">
            {menuItems.map(item => (
              <li
                key={item.id}
                className={activeView === item.id ? 'active' : ''}
                onClick={() => onNavClick(item.id)}
              >
                <span className="nav-label">{item.label}</span>
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

