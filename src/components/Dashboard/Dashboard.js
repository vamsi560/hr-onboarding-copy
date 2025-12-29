import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import ProgressBar from '../UI/ProgressBar';
import Breadcrumbs from '../UI/Breadcrumbs';
import { calculateProgress } from '../../utils/progress';
import './Dashboard.css';
import Modal from '../UI/Modal';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

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

  const handleOpenModal = (type) => {
    if (type === 'email') {
      setModalTitle('Contact HR');
      setModalContent(
        <div>
          <p>You can reach HR at <b>hr@valuemomentum.com</b>.</p>
          <a href="mailto:hr@valuemomentum.com" className="modal-action-link">Send Email</a>
        </div>
      );
    } else if (type === 'tasks') {
      setModalTitle('All Pending Tasks');
      setModalContent(
        <ul className="modal-tasks-list">
          {tasksToShow.map((task, idx) => (
            <li key={idx}>{task}</li>
          ))}
        </ul>
      );
    } else if (type === 'calendar') {
      setModalTitle('Upcoming Events');
      setModalContent(
        <ul className="modal-events-list">
          {upcomingEvents.map((event, idx) => (
            <li key={idx}><b>{event.title}</b> - {event.date}</li>
          ))}
        </ul>
      );
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalContent(null);
    setModalTitle('');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-hero-text dashboard-hero-bg">
        <h1 className="dashboard-title">Welcome, {displayName}!</h1>
        <p className="dashboard-subtitle">Get Started on Your Journey with Us</p>
      </div>
      <div className="dashboard-main-grid dashboard-main-grid-v2">
        {/* First row: Progress, Pending Tasks, Upcoming Events */}
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
            onClick={() => handleOpenModal('tasks')}
            title="View all pending tasks"
          >
            View All Tasks
          </button>
        </Card>
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
            onClick={() => handleOpenModal('calendar')}
            title="View upcoming events"
          >
            View Calendar
          </button>
        </Card>

        {/* Second row: Welcome (span 2 columns), Start Date, Profile */}
        <Card className="dashboard-card welcome-card expanded-welcome-card">
          <h2 className="section-title">Welcome to the Team!</h2>
          <p className="dashboard-subtitle">We're excited to have you on board! Explore the tasks below to get started on your onboarding journey.</p>
          <div className="welcome-video-section">
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
          </div>
        </Card>
        <Card className="dashboard-card start-date-card beside-welcome">
          <h2 className="section-title">Your Start Date</h2>
          <div className="start-date-details">
            <div><span className="meta-label">Joining Date:</span> <span className="meta-value">{joiningDateText}</span></div>
            <div><span className="meta-label">Location:</span> <span className="meta-value text-capitalize">{locationText}</span></div>
          </div>
        </Card>
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
              <button
                className="email-hr-btn"
                onClick={() => handleOpenModal('email')}
                title="Contact HR via email"
              >
                Email HR
              </button>
            </div>
          </div>
        </Card>
      </div>
      <div className="dashboard-footer-bar">
        <div className="footer-assist">
          <span className="footer-assist-icon">?</span> Need Assistance? <a href="#support" className="footer-link">Contact HR Support</a>
        </div>
        <button className="footer-faq-btn" onClick={() => alert('FAQs & Help Center coming soon!')}>FAQs &amp; Help Center</button>
      </div>
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={modalTitle}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default Dashboard;

