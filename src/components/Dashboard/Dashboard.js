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

  const displayName = formData.firstName
    ? `${formData.firstName}${formData.lastName ? ` ${formData.lastName}` : ''}`
    : 'There';

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
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Dashboard' }]} />

      <div className="dashboard-hero-text">
        <h1 className="dashboard-title">Welcome Aboard, {displayName}!</h1>
        <p className="dashboard-subtitle">
          Let&apos;s start your onboarding journey with ValueMomentum.
        </p>
      </div>

      <div className="dashboard-main-grid">
        {/* Left: Welcome / Profile card */}
        <Card className="dashboard-card profile-card">
          <h2 className="profile-title">Welcome Aboard, {displayName}!</h2>
          <p className="profile-subtitle">
            Here&apos;s a quick snapshot of your joining details.
          </p>
          <div className="profile-main">
            <div className="profile-avatar">
              <span>{initials}</span>
            </div>
            <div className="profile-info">
              <div className="profile-name">
                {displayName}
              </div>
              <div className="profile-role">
                {formData.designation || 'Your Role'}
              </div>
              <div className="profile-meta">
                <div className="profile-meta-item">
                  <span className="meta-label">Start Date</span>
                  <span className="meta-value">{joiningDateText}</span>
                </div>
                <div className="profile-meta-item">
                  <span className="meta-label">Location</span>
                  <span className="meta-value text-capitalize">{locationText}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Center: Welcome video + events */}
        <Card className="dashboard-card events-card">
          <h2 className="section-title">Welcome to the Team!</h2>
          <p className="dashboard-subtitle">
            Start on the right foot with a quick welcome message and upcoming events.
          </p>
          <div className="welcome-video-placeholder">
            <div className="welcome-video-overlay">
              <button className="welcome-video-play" type="button">
                ▶
              </button>
              <span>Watch Welcome Video</span>
            </div>
          </div>
          <div className="upcoming-events-header">
            <span className="section-title-small">Upcoming Events</span>
          </div>
          <div className="upcoming-events-list">
            {upcomingEvents.map((event) => (
              <div key={event.title} className="event-item">
                <div className="event-icon">{event.icon}</div>
                <div className="event-content">
                  <div className="event-title">{event.title}</div>
                  <div className="event-date small">{event.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column: Progress + Next steps */}
        <div className="dashboard-right-column">
          <Card className="dashboard-card progress-card">
            <h2 className="section-title">Onboarding Progress</h2>
            <div
              className="progress-donut"
              style={{ '--progress': progress } as React.CSSProperties}
            >
              <div className="progress-donut-inner">
                <span className="progress-donut-value">{progress}%</span>
                <span className="progress-donut-caption">
                  {completedCount} of {totalCount} tasks completed
                </span>
              </div>
            </div>
            <div className="progress-bar-container">
              <ProgressBar value={progress} />
            </div>
          </Card>

          <Card className="dashboard-card next-steps-card">
            <h2 className="section-title">Next Steps for You</h2>
            <div className="tasks-list compact">
              {pendingTasks.length === 0 ? (
                <div className="task-empty-state small">
                  <div className="task-empty-icon">✅</div>
                  <div className="task-empty-text">
                    <strong>All steps completed!</strong>
                    <p>HR will connect with you if anything else is needed.</p>
                  </div>
                </div>
              ) : (
                pendingTasks.slice(0, 4).map((task, index) => (
                  <div key={index} className="task-item mini">
                    <div className="task-checkbox small-box">
                      <div className="checkbox-inner" />
                    </div>
                    <div className="task-content">
                      <div className="task-name">{task}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="support-bar">
        <div className="support-text">
          Need help or have questions? Contact HR Support anytime.
        </div>
        <div className="support-actions">
          <button
            type="button"
            className="support-link"
            onClick={() => {
              window.location.hash = '#chat';
            }}
          >
            Chat with HR
          </button>
          <a href="tel:+911234567890" className="support-link">
            +91 12345 67890
          </a>
          <a href="mailto:hr@valuemomentum.com" className="support-link">
            Email HR
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

