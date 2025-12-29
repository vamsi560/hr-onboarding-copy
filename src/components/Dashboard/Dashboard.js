import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import ProgressBar from '../UI/ProgressBar';
import Breadcrumbs from '../UI/Breadcrumbs';
import { calculateProgress } from '../../utils/progress';
import './Dashboard.css';
import Modal from '../UI/Modal';
import Icon from '../UI/Icon';

const onboardingSteps = [
  { label: 'Complete Personal Details Form', key: 'form', completed: true },
  { label: 'Upload Documents', key: 'documents', completed: false },
  { label: 'Sign Offer Letter', key: 'offer', completed: false },
  { label: 'Read Company Handbook', key: 'handbook', completed: false },
  { label: 'Enroll in Benefits Program', key: 'benefits', completed: false },
  { label: 'Setup Workstation & IT Account', key: 'it', completed: false }
];

const upcomingEvents = [
  { title: 'Orientation Session', date: 'May 14, 10:00 AM' },
  { title: 'Team Welcome Lunch', date: 'May 17, 12:30 PM' }
];

const companyLinks = [
  { icon: 'linkedin', label: 'Follow us on LinkedIn', url: 'https://www.linkedin.com/company/valuemomentum/' },
  { icon: 'info', label: 'About Us', url: 'https://www.valuemomentum.com/about/' }
];

const helpfulResources = [
  { icon: 'linkedin', label: 'Follow us on LinkedIn', url: 'https://www.linkedin.com/company/valuemomentum/' },
  { icon: 'info', label: 'About Us', url: 'https://www.valuemomentum.com/about/' }
];
const quickLinks = [
  { icon: 'portal', label: 'Employee Portal' },
  { icon: 'faq', label: 'FAQs & Help Center' },
  { icon: 'support', label: 'Contact HR Support' }
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
    <div className="dashboard dashboard-modern">
      {/* Personalized Welcome Section */}
      <div className="dashboard-hero-text dashboard-hero-bg">
        <h1 className="dashboard-title">Welcome Aboard, {displayName}!</h1>
        <p className="dashboard-subtitle">We're excited to have you join us. Your onboarding journey is underway!</p>
        <div className="progress-bar-welcome">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: progress + '%' }} />
          </div>
          <span className="progress-bar-label">{progress}% Complete</span>
        </div>
      </div>

      <div className="dashboard-modern-grid">
        {/* Timeline/Progress Tracker */}
        <Card className="dashboard-card timeline-card">
          <h2 className="section-title">Onboarding Steps</h2>
          <ul className="timeline-list">
            {onboardingSteps.map((step, idx) => (
              <li key={step.key} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                <span className="timeline-icon">{step.completed ? <Icon name="check" /> : <Icon name="circle" />}</span>
                <span className="timeline-label">{step.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Left Column: Profile & Tasks */}
        <Card className="dashboard-card profile-tasks-card">
          <div className="profile-block">
            <img src={formData.photoUrl || process.env.PUBLIC_URL + '/images/shashank.jpg'} alt={displayName} className="profile-avatar-modern" />
            <div className="profile-info-modern">
              <div className="profile-name-modern">{displayName}</div>
              <div className="profile-role-modern">{formData.designation || 'Marketing Specialist'}</div>
              <div className="profile-date-modern">
                <Icon name="calendar" /> Starts {joiningDateText}
              </div>
            </div>
          </div>
          <div className="tasks-list-modern">
            <div className="tasks-title-modern">Onboarding Tasks to Complete</div>
            <ul>
              {tasksToShow.map((task, idx) => (
                <li key={idx} className="task-item-modern">
                  <span className="task-check-modern">{idx === 0 ? <Icon name="check" /> : null}</span>
                  <span className="task-name-modern">{task}</span>
                  {idx === 1 && tasksToShow.length > 2 && (
                    <span className="pending-badge-modern">{tasksToShow.length - 1} Pending</span>
                  )}
                </li>
              ))}
            </ul>
            <button className="view-tasks-btn-modern">View All Tasks</button>
          </div>
        </Card>

        {/* Center Column: Welcome & Events */}
        <Card className="dashboard-card welcome-main-card">
          <div className="welcome-title-modern">Welcome to the Team!</div>
          <div className="welcome-video-modern">
            <iframe
              className="welcome-video-iframe-modern"
              src="https://www.youtube.com/embed/j6Y4iwrf6ow"
              title="Welcome Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
            <div className="video-overlay-modern">
              <Icon name="play" /> Watch Welcome Video
            </div>
          </div>
          <div className="events-block-modern">
            <div className="events-title-modern">Upcoming Events</div>
            <ul className="events-list-modern">
              {upcomingEvents.map((event, idx) => (
                <li key={idx} className="event-item-modern">
                  <span className="event-name-modern">{event.title}</span>
                  <span className="event-date-modern">{event.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Upcoming Events Calendar */}
        <Card className="dashboard-card events-card">
          <h2 className="section-title">Upcoming Events</h2>
          <ul className="events-list-modern">
            {upcomingEvents.map((event, idx) => (
              <li key={idx} className="event-item-modern">
                <span className="event-name-modern">{event.title}</span>
                <span className="event-date-modern">{event.date}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Right Column: Resources & Links */}
        <Card className="dashboard-card resources-links-card">
          <div className="resources-block-modern">
            <div className="resources-title-modern">Connect & Learn More</div>
            <div className="resources-list-modern">
              {helpfulResources.map((res, idx) => (
                <a key={idx} className="resource-item-modern" href={res.url} target="_blank" rel="noopener noreferrer">
                  <Icon name={res.icon} /> {res.label}
                </a>
              ))}
            </div>
          </div>
          <div className="quicklinks-block-modern">
            <div className="quicklinks-title-modern">Quick Links</div>
            <div className="quicklinks-list-modern">
              {quickLinks.map((link, idx) => (
                <div key={idx} className="quicklink-item-modern">
                  <Icon name={link.icon} /> {link.label}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Company Social Links */}
        <Card className="dashboard-card company-links-card">
          <h2 className="section-title">Connect & Learn More</h2>
          <div className="company-links-list">
            {companyLinks.map((link, idx) => (
              <a key={idx} className="company-link-item" href={link.url} target="_blank" rel="noopener noreferrer">
                <Icon name={link.icon} /> {link.label}
              </a>
            ))}
          </div>
        </Card>
      </div>
      {/* Footer Bar */}
      <div className="dashboard-footer-modern">
        <div className="footer-help-modern">
          <Icon name="chat" /> Questions? We're here to help!
        </div>
        <div className="footer-actions-modern">
          <button className="footer-btn-modern"><Icon name="chat" /> Chat with HR</button>
          <span className="footer-phone-modern"><Icon name="phone" /> +1-800-123 4567</span>
          <button className="footer-btn-modern"><Icon name="email" /> Email HR</button>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={modalTitle}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default Dashboard;

