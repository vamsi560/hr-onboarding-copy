import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import ProgressBar from '../UI/ProgressBar';
import Breadcrumbs from '../UI/Breadcrumbs';
import OfferAcceptance from '../Auth/OfferAcceptance';
import { calculateProgress } from '../../utils/progress';
import './Dashboard.css';

const upcomingEvents = [
  {
    title: 'Orientation Session',
    date: 'May 14, 10:00 AM',
    icon: '📅'
  },
  {
    title: 'Team Welcome Lunch',
    date: 'June 16, 12:30 PM',
    icon: '🍽️'
  }
];

const Dashboard = () => {
  const { formData, documents, userRole, userInfo } = useApp();
  const [progress, setProgress] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showJoiningBonus, setShowJoiningBonus] = useState(false);
  const [showRelocation, setShowRelocation] = useState(false);

  useEffect(() => {
    const progressData = calculateProgress(formData, documents);
    setProgress(progressData.percent);
    setPendingTasks(progressData.pendingTasks);
    setCompletedCount(progressData.completed);
    setTotalCount(progressData.total);
  }, [formData, documents]);

  // Get display name - for john.doe@gmail.com, always show Shashank Tudum
  const displayName = userInfo?.email === 'john.doe@gmail.com' 
    ? 'Shashank Tudum' 
    : (userInfo?.name || formData.name || 'Shashank Tudum');
  
  // Check eligibility for joining bonus and relocation
  const hasJoiningBonus = userInfo?.joiningBonus === true;
  const hasRelocation = userInfo?.relocation === true;

  const joiningDateText = formData.joiningDate
    ? new Date(formData.joiningDate).toLocaleDateString()
    : 'To be confirmed';

  const locationText = formData.location || 'Your assigned office';

  const mockPendingTasks = [
    'Complete Personal Details Form',
    'Upload Documents',
    'Sign Offer Letter',
    'Read Company Handbook',
  ];
  const tasksToShow = pendingTasks.length > 0 ? pendingTasks : mockPendingTasks;

  return (
    <div className="dashboard">
      <div className="dashboard-hero-text dashboard-hero-bg">
        <h1 className="dashboard-title">Welcome, {displayName}!</h1>
        <p className="dashboard-subtitle">Get Started on Your Journey with Us</p>
      </div>
      <div className="dashboard-main-grid dashboard-main-grid-v2">
        {/* Progress Card */}
        <Card className="dashboard-card progress-card">
          <h2 className="section-title">Your Progress</h2>
          <div className="progress-bar-visual-container">
            <div className="progress-bar-visual">
              <div className="progress-bar-fill" style={{ width: progress + '%' }} />
              <span className="progress-bar-label">{progress}%</span>
            </div>
            <div className="progress-donut-caption-block">
              <span className="progress-donut-caption">{completedCount} of {totalCount} Tasks Completed</span>
            </div>
          </div>
        </Card>

        {/* Pending Tasks Card */}
        <Card className="dashboard-card pending-tasks-card">
          <h2 className="section-title">Pending Tasks</h2>
          <ul className="pending-tasks-list">
            {tasksToShow.slice(0, 4).map((task, idx) => (
              <li key={idx} className="pending-task-item">
                <span className="pending-task-check">✔️</span>
                <span className="pending-task-name">{task}</span>
                {idx === 1 && tasksToShow.length > 2 && (
                  <span className="pending-badge">{tasksToShow.length} Pending</span>
                )}
              </li>
            ))}
          </ul>
          <button
            className="view-tasks-btn"
            title={['All Tasks:', ...tasksToShow].join('\n')}
          >
            View All Tasks
          </button>
        </Card>

        {/* Welcome Card (Follow us on LinkedIn + About Us) */}
        <Card className="dashboard-card welcome-card">
          <h2 className="section-title">Know about us!</h2>
          <p className="dashboard-subtitle">We're excited to have you on board! Follow us on the below social media to know more about ValueMomentum.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              className="linkedin-btn"
              href="https://www.linkedin.com/company/valuemomentum"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="linkedin-icon">in</span> Follow us on LinkedIn
            </a>
            <a
              className="aboutus-btn"
              href="https://www.valuemomentum.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              About Us
            </a>
          </div>
        </Card>

        {/* Welcome to the Team Card with YouTube Video */}
        <Card className="dashboard-card welcome-video-card">
          <h2 className="section-title">Welcome to the Team!</h2>
          <p className="dashboard-subtitle">We're excited to have you on board! Watch our welcome video to get started on your onboarding journey.</p>
          <div className="welcome-video-wrapper">
            <iframe
              className="welcome-video-iframe"
              src="https://www.youtube.com/embed/j6Y4iwrf6ow"
              title="Welcome Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </Card>

        {/* Profile Card */}
        <Card className="dashboard-card profile-detail-card">
          <div className="profile-detail-main">
            <img
              src={process.env.PUBLIC_URL + '/images/shashank.jpg'}
              alt={displayName}
              className="profile-detail-avatar"
            />
            <div className="profile-detail-info">
              <div className="profile-detail-name">{displayName}</div>
              <div className="profile-detail-role">{formData.designation || 'Your Role'}</div>
              <div className="profile-detail-meta">
                <div><span className="meta-label">Starting Date:</span> <span className="meta-value">{joiningDateText}</span></div>
                <div><span className="meta-label">Location:</span> <span className="meta-value text-capitalize">{locationText}</span></div>
              </div>
              <button
                className="email-hr-btn"
                title="Email sent to hr@valuemomentum.com"
              >
                Email HR
              </button>
            </div>
          </div>
        </Card>

        {/* Joining Bonus Card - Only for eligible candidates */}
        {hasJoiningBonus && (
          <Card className="dashboard-card joining-bonus-card" style={{ border: '2px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h2 className="section-title" style={{ color: 'var(--success)', margin: 0 }}>Joining Bonus</h2>
              <button 
                className="info-btn"
                onClick={() => setShowJoiningBonus(!showJoiningBonus)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--success)' }}
              >
                {showJoiningBonus ? '▼' : '▶'}
              </button>
            </div>
            <p className="dashboard-subtitle" style={{ marginBottom: '12px' }}>
              Congratulations! You are eligible for a joining bonus.
            </p>
            {showJoiningBonus && (
              <div className="bonus-details" style={{ marginTop: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--text)' }}>Bonus Details:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li><strong>Bonus Amount:</strong> ₹50,000 / $1,000 (one-time payment)</li>
                  <li><strong>Payment Schedule:</strong> Bonus will be paid in your first salary after successful completion of 3 months</li>
                  <li><strong>Eligibility Criteria:</strong> Must complete onboarding and join on the agreed start date</li>
                </ul>
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(40, 167, 69, 0.1)', borderRadius: '6px', borderLeft: '4px solid var(--success)' }}>
                  <h5 style={{ marginBottom: '8px', color: 'var(--success)' }}>Terms & Conditions:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                    <li>Bonus is subject to successful completion of probation period (3 months)</li>
                    <li>If you leave the company within 12 months, the bonus amount will be recovered</li>
                    <li>Bonus is taxable as per applicable income tax laws</li>
                    <li>All disputes will be subject to company policies and local jurisdiction</li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Relocation Card - Only for eligible candidates */}
        {hasRelocation && (
          <Card className="dashboard-card relocation-card" style={{ border: '2px solid var(--info)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h2 className="section-title" style={{ color: 'var(--info)', margin: 0 }}>Relocation Assistance</h2>
              <button 
                className="info-btn"
                onClick={() => setShowRelocation(!showRelocation)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--info)' }}
              >
                {showRelocation ? '▼' : '▶'}
              </button>
            </div>
            <p className="dashboard-subtitle" style={{ marginBottom: '12px' }}>
              You are eligible for relocation assistance to help with your move.
            </p>
            {showRelocation && (
              <div className="relocation-details" style={{ marginTop: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--text)' }}>Relocation Benefits:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li><strong>Moving Expenses:</strong> Up to ₹1,00,000 / $2,000 reimbursement for moving expenses</li>
                  <li><strong>Temporary Accommodation:</strong> 30 days of company-provided temporary housing</li>
                  <li><strong>Travel Allowance:</strong> Economy class airfare for you and immediate family</li>
                  <li><strong>Shipping:</strong> Reimbursement for shipping personal belongings (up to specified limit)</li>
                </ul>
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', borderLeft: '4px solid var(--info)' }}>
                  <h5 style={{ marginBottom: '8px', color: 'var(--info)' }}>Important Information:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                    <li>All expenses must be supported by valid receipts and invoices</li>
                    <li>Reimbursement will be processed after submission of documents</li>
                    <li>Relocation benefits must be utilized within 90 days of joining</li>
                    <li>Contact HR for relocation coordinator contact details</li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Upcoming Events Card */}
        <Card className="dashboard-card events-card">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="upcoming-events-list-v2">
            {upcomingEvents.map((event, idx) => (
              <div key={event.title} className="event-item-v2">
                <div className="event-title">{event.title}</div>
                <div className="event-date small">{event.date}</div>
              </div>
            ))}
          </div>
          <button
            className="view-calendar-btn"
            title={['Upcoming Events:', ...upcomingEvents.map(e => `${e.title} - ${e.date}`)].join('\n')}
          >
            View Calendar
          </button>
        </Card>
      </div>
      <div className="dashboard-footer-bar">
        <div className="footer-assist">
          <span className="footer-assist-icon">?</span> Need Assistance? <a href="#support" className="footer-link">Contact HR Support</a>
        </div>
        <button className="footer-faq-btn" onClick={() => alert('FAQs & Help Center coming soon!')}>FAQs &amp; Help Center</button>
      </div>
    </div>
  );
};

export default Dashboard;

