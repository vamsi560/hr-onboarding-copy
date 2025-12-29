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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = formData.firstName && formData.lastName
    ? `${formData.firstName} ${formData.lastName}`
    : 'Shashank Tudum';

  const joiningDateText = formData.joiningDate
    ? new Date(formData.joiningDate).toLocaleDateString()
    : 'To be confirmed';

  const locationText = formData.location || 'Your assigned office';

  const initials = formData.firstName || formData.lastName
    ? `${(formData.firstName || formData.lastName)[0]}${
        formData.lastName ? formData.lastName[0] : ''
      }`.toUpperCase()
    : 'VM';

  const totalTasks = totalCount || pendingTasks.length;

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
          <div className="progress-donut" style={{ '--progress': progress }}>
            <div className="progress-donut-inner">
              <span className="progress-donut-value">{progress}% Complete</span>
              <span className="progress-donut-caption">{completedCount} of {totalCount} Tasks Completed</span>
            </div>
          </div>
        </Card>

        {/* Pending Tasks Card */}
        <Card className="dashboard-card pending-tasks-card">
          <h2 className="section-title">Pending Tasks</h2>
          <ul className="pending-tasks-list">
            {pendingTasks.slice(0, 4).map((task, idx) => (
              <li key={idx} className="pending-task-item">
                <span className="pending-task-check">{task.completed ? '✔️' : '✔️'}</span>
                <span className="pending-task-name">{task}</span>
                {/* Example: show pending badge for the first pending task */}
                {idx === 1 && pendingTasks.length > 1 && (
                  <span className="pending-badge">{pendingTasks.length} Pending</span>
                )}
              </li>
            ))}
          </ul>
          <button className="view-tasks-btn">View All Tasks</button>
        </Card>

        {/* Welcome Card (Follow us on LinkedIn) */}
        <Card className="dashboard-card welcome-card">
          <h2 className="section-title">Welcome to the Team!</h2>
          <p className="dashboard-subtitle">We're excited to have you on board! Explore the tasks below to get started on your onboarding journey.</p>
          <a
            className="linkedin-btn"
            href="https://www.linkedin.com/company/valuemomentum/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="linkedin-icon">in</span> Follow us on LinkedIn
          </a>
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
              <a href="mailto:hr@valuemomentum.com" className="email-hr-btn">Email HR</a>
            </div>
          </div>
        </Card>

        {/* Upcoming Events Card */}
        <Card className="dashboard-card events-card">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="upcoming-events-list-v2">
            {upcomingEvents.map((event) => (
              <div key={event.title} className="event-item-v2">
                <div className="event-title">{event.title}</div>
                <div className="event-date small">{event.date}</div>
              </div>
            ))}
          </div>
          <button className="view-calendar-btn">View Calendar</button>
        </Card>
      </div>
      <div className="dashboard-footer-bar">
        <div className="footer-assist">
          <span className="footer-assist-icon">?</span> Need Assistance? <a href="#support" className="footer-link">Contact HR Support</a>
        </div>
        <button className="footer-faq-btn">FAQs &amp; Help Center</button>
      </div>
    </div>
  );
};

export default Dashboard;

