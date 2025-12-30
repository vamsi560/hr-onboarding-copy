import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import './AlumniDashboard.css';

const AlumniDashboard = () => {
  const { userInfo } = useApp();
  const [selectedDocument, setSelectedDocument] = useState(null);

  const displayName = userInfo?.name || 'Alumni User';
  const yearsWorked = userInfo?.yearsWorked || 0;
  const joinedDate = userInfo?.joinedDate || '2018-01-15';
  const leftDate = userInfo?.leftDate || '2023-06-30';

  // Mock payslips and documents
  const payslips = [
    { id: 1, month: 'June 2023', year: 2023, amount: '$8,500', status: 'available' },
    { id: 2, month: 'May 2023', year: 2023, amount: '$8,500', status: 'available' },
    { id: 3, month: 'April 2023', year: 2023, amount: '$8,500', status: 'available' },
    { id: 4, month: 'March 2023', year: 2023, amount: '$8,200', status: 'available' },
    { id: 5, month: 'February 2023', year: 2023, amount: '$8,200', status: 'available' },
  ];

  const workDocuments = [
    { id: 1, name: 'Employment Certificate', date: '2023-06-30', type: 'certificate' },
    { id: 2, name: 'Experience Letter', date: '2023-06-30', type: 'letter' },
    { id: 3, name: 'Relieving Letter', date: '2023-06-30', type: 'letter' },
    { id: 4, name: 'Form 16 (2022-23)', date: '2023-05-15', type: 'tax' },
    { id: 5, name: 'Form 16 (2021-22)', date: '2022-05-15', type: 'tax' },
  ];

  const handleDownload = (doc) => {
    // Simulate download
    alert(`Downloading ${doc.name || doc.month}...`);
  };

  return (
    <div className="alumni-dashboard">
      <div className="alumni-hero">
        <h1 className="alumni-title">Welcome Back, {displayName}!</h1>
        <p className="alumni-subtitle">Alumni Portal - Access Your Work Documents</p>
      </div>

      <div className="alumni-info-card">
        <Card>
          <div className="alumni-profile">
            <div className="alumni-avatar">
              {displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="alumni-details">
              <h3>{displayName}</h3>
              <p className="alumni-role">{userInfo?.designation || 'Former Employee'}</p>
              <div className="alumni-meta">
                <div><strong>Joined:</strong> {new Date(joinedDate).toLocaleDateString()}</div>
                <div><strong>Left:</strong> {new Date(leftDate).toLocaleDateString()}</div>
                <div><strong>Years Worked:</strong> {yearsWorked} years</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="alumni-content-grid">
        {/* Payslips Section */}
        <Card className="alumni-section-card">
          <div className="section-header">
            <Icon name="documents" size={24} />
            <h2>Payslips</h2>
          </div>
          <p className="section-description">
            Download your payslips from your employment period
          </p>
          <div className="payslips-list">
            {payslips.map(payslip => (
              <div key={payslip.id} className="payslip-item">
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
              </div>
            ))}
          </div>
          <Button variant="secondary" style={{ marginTop: '16px', width: '100%' }}>
            View All Payslips
          </Button>
        </Card>

        {/* Work Documents Section */}
        <Card className="alumni-section-card">
          <div className="section-header">
            <Icon name="documents" size={24} />
            <h2>Work Documents</h2>
          </div>
          <p className="section-description">
            Access your employment-related documents
          </p>
          <div className="documents-list">
            {workDocuments.map(doc => (
              <div key={doc.id} className="document-item">
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
              </div>
            ))}
          </div>
          <Button variant="secondary" style={{ marginTop: '16px', width: '100%' }}>
            View All Documents
          </Button>
        </Card>
      </div>

      <div className="alumni-notice">
        <Card style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Icon name="info" size={20} style={{ color: 'var(--info)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ marginBottom: '8px' }}>Alumni Portal Information</h4>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--muted)' }}>
                This portal provides limited access to your historical employment documents. 
                For any queries or additional document requests, please contact HR at{' '}
                <a href="mailto:hr@valuemomentum.com" style={{ color: 'var(--brand)' }}>
                  hr@valuemomentum.com
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AlumniDashboard;

