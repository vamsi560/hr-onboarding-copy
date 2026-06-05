import React from 'react';
import Card from '../UI/Card';
import './AlumniHome.css';

const AlumniHome = () => {
  // Mock alumni data
  const alumniData = {
    name: 'Suresh Iyer',
    employeeId: 'VM-2018-001',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    joinedDate: '2018-01-15',
    leftDate: '2023-06-30',
    yearsServed: 5.5,
    location: 'Hyderabad, India',
    manager: 'Raghavendra Raju',
    team: 'Backend Development',
    email: 'suresh.iyer@alumni.valuemomentum.com',
    phone: '+91 9876543210'
  };

  const calculateTenure = (joinDate, leftDate) => {
    const start = new Date(joinDate);
    const end = new Date(leftDate);
    const years = Math.floor((end - start) / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor(((end - start) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    return `${years} years, ${months} months`;
  };

  return (
    <div className="alumni-home">
      <div className="alumni-home-header">
        <h1>Welcome Back, {alumniData.name}!</h1>
        <p>Your journey with ValueMomentum</p>
      </div>

      <div className="alumni-home-grid">
        {/* Profile Overview */}
        <Card className="alumni-profile-card">
          <div className="alumni-profile-header">
            <div className="alumni-avatar-large">
              {alumniData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="alumni-profile-info">
              <h2>{alumniData.name}</h2>
              <p className="alumni-designation">{alumniData.designation}</p>
              <p className="alumni-department">{alumniData.department}</p>
            </div>
          </div>
        </Card>

        {/* Employment Summary */}
        <Card className="alumni-summary-card">
          <h3>Employment Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value">{alumniData.yearsServed}</div>
              <div className="stat-label">Years Served</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">2018-2023</div>
              <div className="stat-label">Tenure Period</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">5+</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>
        </Card>

        {/* Employment Details */}
        <Card className="alumni-details-card">
          <h3>Employment Details</h3>
          <div className="details-grid">
            <div className="detail-row">
              <span className="detail-label">Employee ID:</span>
              <span className="detail-value">{alumniData.employeeId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Joined Date:</span>
              <span className="detail-value">{new Date(alumniData.joinedDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Working Day:</span>
              <span className="detail-value">{new Date(alumniData.leftDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Tenure:</span>
              <span className="detail-value">{calculateTenure(alumniData.joinedDate, alumniData.leftDate)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{alumniData.location}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reporting Manager:</span>
              <span className="detail-value">{alumniData.manager}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Team:</span>
              <span className="detail-value">{alumniData.team}</span>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="alumni-contact-card">
          <h3>Contact Information</h3>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <div className="contact-label">Email</div>
                <div className="contact-value">{alumniData.email}</div>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <div>
                <div className="contact-label">Phone</div>
                <div className="contact-value">{alumniData.phone}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="alumni-actions-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">🏆</span>
              <span>View Achievements</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">💰</span>
              <span>Download Payslips</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📄</span>
              <span>Work Documents</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📞</span>
              <span>Contact HR</span>
            </button>
          </div>
        </Card>

        {/* Alumni Message */}
        <Card className="alumni-message-card">
          <h3>Thank You Message</h3>
          <div className="thank-you-message">
            <p>
              Dear {alumniData.name.split(' ')[0]},
            </p>
            <p>
              Thank you for your dedicated service of <strong>{alumniData.yearsServed} years</strong> with ValueMomentum. 
              Your contributions to the {alumniData.department} team have been invaluable, and we wish you 
              continued success in your future endeavors.
            </p>
            <p>
              You will always be part of the ValueMomentum family. Stay connected!
            </p>
            <div className="message-signature">
              <strong>- ValueMomentum HR Team</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AlumniHome;