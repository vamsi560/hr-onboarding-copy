import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import ProgressBar from '../UI/ProgressBar';
import Breadcrumbs from '../UI/Breadcrumbs';
import Modal from '../UI/Modal';
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
  const { formData, documents, userRole } = useApp();
  const [progress, setProgress] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const progressData = calculateProgress(formData, documents);
    setProgress(progressData.percent);
    setPendingTasks(progressData.pendingTasks);
    setCompletedCount(progressData.completed);
    setTotalCount(progressData.total);
  }, [formData, documents]);

  // Always show Shashank Tudum as the candidate name
  const displayName = formData.name || 'Shashank Tudum';

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

  // Show welcome modal for candidate login only
  useEffect(() => {
    if (userRole === 'candidate') {
      setShowWelcomeModal(true);
      const timer = setTimeout(() => setShowWelcomeModal(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [userRole]);

  return (
    <div className="dashboard">
      <Modal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} title={`Welcome, ${displayName}!`}>
        <div style={{ whiteSpace: 'pre-line', fontSize: 15 }}>
          {`Dear ${displayName},
Warm greetings from ValueMomentum!
We’re excited to have you onboard and are glad to welcome you to our Onboarding Portal.
This portal is designed to help you get started even before Day 1. Here, you can:
• Complete required documentation
• Review important onboarding information
• Track your pre-joining tasks and progress
• Get familiar with our culture, values, and ways of working. Follow us on LinkedIn and explore the “About ValueMomentum” section to learn more about our Journey.

Please take some time to go through the sections available in the portal and complete the assigned actions within the timelines mentioned. This will help ensure a smooth and hassle-free joining experience.

If you have any questions or need assistance at any stage, feel free to reach out to the HR team using the chat support provided in the portal.

We’re looking forward to welcoming you soon and wish you a great start to your journey with ValueMomentum!!

Warm regards,
Team HR, ValueMomentum`}
        </div>
      </Modal>
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

