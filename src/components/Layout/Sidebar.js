import React from 'react';
import { useApp } from '../../context/AppContext';
import './Sidebar.css';

const Sidebar = ({ activeView, onNavClick, isMobileOpen, onClose }) => {
  const { userRole, location } = useApp();

  const candidateMenuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'form', label: 'Onboarding Form' },
    { id: 'documents', label: 'Documents' },
    { id: 'validation', label: 'AI Validation' },
    { id: 'support', label: 'Support' }
  ];

  const hrMenuItems = [
    { id: 'hr', label: 'HR Dashboard' },
    { id: 'exceptions', label: 'Exceptions' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'support', label: 'Support' }
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

