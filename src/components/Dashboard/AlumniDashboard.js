import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import './AlumniDashboard.css';

const AlumniDashboard = () => {
  const { userInfo } = useApp();
  const [selectedDocument, setSelectedDocument] = useState(null);

  const displayName = userInfo?.name || 'Suresh Iyer';
  const yearsWorked = userInfo?.yearsWorked || 5.5;
  const joinedDate = userInfo?.joinedDate || '2018-01-15';
  const leftDate = userInfo?.leftDate || '2023-06-30';
  const designation = userInfo?.designation || 'Senior Software Engineer';

  // Mock achievements data with ValueMomentum recognitions
  const achievements = [
    {
      id: 1,
      title: 'Star of the Month',
      category: 'Mark of Excellence',
      date: '2023-03-15',
      description: 'Outstanding performance in Q1 2023 project delivery',
      icon: '⭐',
      color: '#FFD700'
    },
    {
      id: 2,
      title: 'Spot Award for Professional Contribution',
      category: 'Recognition',
      date: '2022-11-20',
      description: 'Exceptional contribution to client satisfaction and code quality',
      icon: '🏆',
      color: '#FF6B35'
    },
    {
      id: 3,
      title: 'Star of the Quarter',
      category: 'Mark of Excellence',
      date: '2022-06-30',
      description: 'Consistent high performance and team leadership in Q2 2022',
      icon: '🌟',
      color: '#4CAF50'
    },
    {
      id: 4,
      title: 'Innovation Award',
      category: 'Technical Excellence',
      date: '2021-12-10',
      description: 'Developed automated testing framework reducing deployment time by 40%',
      icon: '💡',
      color: '#2196F3'
    },
    {
      id: 5,
      title: 'Client Appreciation',
      category: 'Customer Success',
      date: '2021-08-15',
      description: 'Received direct appreciation from client for exceptional service delivery',
      icon: '👏',
      color: '#9C27B0'
    }
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

  return (
    <div className="alumni-dashboard">
      <div className="alumni-hero">
        <h1 className="alumni-title">Welcome Back, {displayName}!</h1>
        <p className="alumni-subtitle">Alumni Portal - Your Journey with ValueMomentum</p>
      </div>

      <div className="alumni-info-card">
        <Card>
          <div className="alumni-profile">
            <div className="alumni-avatar">
              {displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="alumni-details">
              <h3>{displayName}</h3>
              <p className="alumni-role">{designation}</p>
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
        {/* Achievements Section */}
        <Card className="alumni-section-card achievements-card">
          <div className="section-header">
            <Icon name="star" size={24} />
            <h2>Your Achievements</h2>
          </div>
          <p className="section-description">
            Recognition and awards earned during your journey with ValueMomentum
          </p>
          <div className="achievements-list">
            {achievements.map(achievement => (
              <div key={achievement.id} className="achievement-item">
                <div className="achievement-icon" style={{ backgroundColor: achievement.color }}>
                  {achievement.icon}
                </div>
                <div className="achievement-content">
                  <div className="achievement-title">{achievement.title}</div>
                  <div className="achievement-category">{achievement.category}</div>
                  <div className="achievement-description">{achievement.description}</div>
                  <div className="achievement-date">{new Date(achievement.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

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
                This portal provides access to your employment history, achievements, and documents. 
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

