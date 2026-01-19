import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AlumniHome from './AlumniHome';
import AlumniAchievements from './AlumniAchievements';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import './AlumniDashboard.css';

const AlumniDashboard = () => {
  const { userInfo } = useApp();
  const [currentPage, setCurrentPage] = useState('home');

  const displayName = userInfo?.name || 'Suresh Iyer';
  const designation = userInfo?.designation || 'Senior Software Engineer';

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'payslips', label: 'Payslips', icon: '💰' },
    { id: 'documents', label: 'Documents', icon: '📄' },
  ];

  // Mock payslips and documents
  const payslips = [
    { id: 1, month: 'June 2023', year: 2023, amount: '₹85,000', status: 'available' },
    { id: 2, month: 'May 2023', year: 2023, amount: '₹85,000', status: 'available' },
    { id: 3, month: 'April 2023', year: 2023, amount: '₹85,000', status: 'available' },
    { id: 4, month: 'March 2023', year: 2023, amount: '₹82,000', status: 'available' },
    { id: 5, month: 'February 2023', year: 2023, amount: '₹82,000', status: 'available' },
  ];

  const workDocuments = [
    { id: 1, name: 'Employment Certificate', date: '2023-06-30', type: 'certificate' },
    { id: 2, name: 'Experience Letter', date: '2023-06-30', type: 'letter' },
    { id: 3, name: 'Relieving Letter', date: '2023-06-30', type: 'letter' },
    { id: 4, name: 'Form 16 (2022-23)', date: '2023-05-15', type: 'tax' },
    { id: 5, name: 'Form 16 (2021-22)', date: '2022-05-15', type: 'tax' },
  ];

  const handleDownload = (doc) => {
    alert(`Downloading ${doc.name || doc.month}...`);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <AlumniHome />;
      case 'achievements':
        return <AlumniAchievements />;
      case 'payslips':
        return (
          <div className="alumni-page">
            <h1>Payslips</h1>
            <p>Download your payslips from your employment period</p>
            <div className="payslips-list">
              {payslips.map(payslip => (
                <Card key={payslip.id} className="payslip-item-card">
                  <div className="payslip-info">
                    <div className="payslip-month">{payslip.month}</div>
                    <div className="payslip-amount">{payslip.amount}</div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleDownload(payslip)}
                    style={{ fontSize: '14px' }}
                  >
                    <Icon name="download" size={16} />
                    Download
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="alumni-page">
            <h1>Work Documents</h1>
            <p>Access your employment-related documents</p>
            <div className="documents-list">
              {workDocuments.map(doc => (
                <Card key={doc.id} className="document-item-card">
                  <div className="document-info">
                    <div className="document-name">{doc.name}</div>
                    <div className="document-date">{new Date(doc.date).toLocaleDateString()}</div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleDownload(doc)}
                    style={{ fontSize: '14px' }}
                  >
                    <Icon name="download" size={16} />
                    Download
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return <AlumniHome />;
    }
  };

  return (
    <div className="alumni-dashboard-layout">
      {/* Sidebar */}
      <div className="alumni-sidebar">
        <div className="alumni-sidebar-header">
          <div className="alumni-sidebar-avatar">
            {displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div className="alumni-sidebar-info">
            <h3>{displayName}</h3>
            <p>{designation}</p>
          </div>
        </div>
        
        <nav className="alumni-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`alumni-nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="alumni-main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AlumniDashboard;

