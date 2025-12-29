import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import ProgressBar from '../UI/ProgressBar';
import Breadcrumbs from '../UI/Breadcrumbs';
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
  const { formData, documents } = useApp();
  const [progress, setProgress] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const progressData = calculateProgress(formData, documents);
    setProgress(progressData.percent);
    setPendingTasks(progressData.pendingTasks);
    setCompletedCount(progressData.completed);
    setTotalCount(progressData.total);
  }, [formData, documents]);

  // Always show Shashank Tudum as the candidate name
  const displayName = 'Shashank Tudum';

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
        <h1 className="dashboard-title">Welcome Aboard, {displayName}!</h1>
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
          <button className="view-tasks-btn" onClick={() => alert('All Tasks:\n' + tasksToShow.join('\n'))}>View All Tasks</button>
        </Card>

        {/* Welcome Card (Follow us on LinkedIn + About Us) */}
        <Card className="dashboard-card welcome-card">
          <h2 className="section-title">Welcome to the Team!</h2>
          <p className="dashboard-subtitle">We're excited to have you on board! Explore the tasks below to get started on your onboarding journey.</p>
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

        {/* Start Date Card */}
        <Card className="dashboard-card start-date-card">
          <h2 className="section-title">Your Start Date</h2>
          <div className="start-date-details">
            <div><span className="meta-label">Joining Date:</span> <span className="meta-value">{joiningDateText}</span></div>
            <div><span className="meta-label">Location:</span> <span className="meta-value text-capitalize">{locationText}</span></div>
          </div>
        </Card>

        {/* Profile Card */}
        <Card className="dashboard-card profile-detail-card">
          <div className="profile-detail-main">
            <img
              src={formData.photoUrl || process.env.PUBLIC_URL + '/images/shashank.jpg'}
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
              <button className="email-hr-btn" onClick={() => alert('Email sent to hr@valuemomentum.com')}>Email HR</button>
            </div>
          </div>
        </Card>

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
          <button className="view-calendar-btn" onClick={() => alert('Upcoming Events:\n' + upcomingEvents.map(e => `${e.title} - ${e.date}`).join('\n'))}>View Calendar</button>
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

