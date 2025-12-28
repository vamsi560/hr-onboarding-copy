// Dashboard Enhancements Suggestions:
// - Add a personalized greeting based on time of day ("Good Morning, Shashank!")
// - Show a timeline or stepper for onboarding phases (e.g., Pre-Onboarding, Onboarding, Post-Onboarding)
// - Integrate a notification bell for alerts (pending tasks, document status, HR messages)
// - Display recent activity or status updates ("Offer letter signed", "Document approved")
// - Add a quick links section for most-used actions (e.g., Download Offer Letter, Update Bank Details)
// - Show a motivational quote or onboarding tip of the day
// - Integrate a mini chat widget for direct HR/candidate communication
// - Add a section for feedback or onboarding survey
// - Display badges or milestones for completed steps ("Profile Complete", "All Documents Uploaded")
// - Make the dashboard theme customizable (light/dark, accent color)

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import './Dashboard.css';

const motivationalTips = [
  "Every step brings you closer to success!",
  "Your onboarding journey is the start of something great.",
  "Stay curious, stay motivated!",
  "Small progress is still progress.",
  "Your future at ValueMomentum starts here!"
];

const onboardingPhases = [
  { label: 'Pre-Onboarding', date: 'Dec 20, 2025' },
  { label: 'Onboarding', date: 'Dec 30, 2025' },
  { label: 'Post-Onboarding', date: 'Jan 10, 2026' }
];

const badgeList = [
  { key: 'profile', label: 'Profile Complete', condition: (formData) => formData.personalDetailsCompleted },
  { key: 'docs', label: 'All Documents Uploaded', condition: (formData, documents) => (documents?.length || 0) >= 4 },
  { key: 'offer', label: 'Offer Letter Signed', condition: (formData) => formData.offerLetterSigned },
  { key: 'handbook', label: 'Handbook Read', condition: (formData) => formData.handbookRead }
];

const quickLinks = [
  { label: 'Download Offer Letter', icon: 'download', onClick: () => alert('Download Offer Letter') },
  { label: 'Update Bank Details', icon: 'edit', onClick: () => alert('Update Bank Details') },
  { label: 'Contact HR', icon: 'mail', onClick: () => window.location.href = 'mailto:hr@valuemomentum.com' }
];

const getGreeting = (name) => {
  const hour = new Date().getHours();
  let greet = 'Hello';
  if (hour < 12) greet = 'Good Morning';
  else if (hour < 18) greet = 'Good Afternoon';
  else greet = 'Good Evening';
  return `${greet}, ${name}!`;
};

const getRandomTip = () => {
  const idx = Math.floor((new Date().getDate() + new Date().getMonth()) % motivationalTips.length);
  return motivationalTips[idx];
};

const Dashboard = () => {
  const { formData, userRole, location, documents, auditLog } = useApp();
  // Updated default candidate info
  const candidateName = formData.fullName || 'Shashank Tudum';
  const candidateRole = formData.role || 'Software Engineer';
  const candidatePhoto = formData.photoUrl || process.env.PUBLIC_URL + '/images/shashank.jpg';
  const joiningDate = formData.joiningDate || 'December 30, 2025';
  const officeLocation = location === 'us' ? 'New York Office' : 'Hyderabad Office';
  const progress = Math.round(((documents?.length || 0) + (formData.personalDetailsCompleted ? 1 : 0) + (formData.offerLetterSigned ? 1 : 0) + (formData.handbookRead ? 1 : 0)) / 4 * 100);
  const totalTasks = 4;
  const completedTasks = [formData.personalDetailsCompleted, documents?.length, formData.offerLetterSigned, formData.handbookRead].filter(Boolean).length;
  const pendingTasks = [
    !formData.personalDetailsCompleted && 'Complete Personal Details Form',
    !(documents?.length > 0) && 'Upload Documents',
    !formData.offerLetterSigned && 'Sign Offer Letter',
    !formData.handbookRead && 'Read Company Handbook',
  ].filter(Boolean);
  const events = [
    { name: 'Orientation Session', date: 'Jan 2, 10:00 AM' },
    { name: 'Team Welcome Lunch', date: 'Jan 4, 12:30 PM' },
  ];
  const resources = [
    { name: 'HR Policies', icon: '👤', link: '#' },
    { name: 'IT Setup Guide', icon: '💻', link: '#' },
    { name: 'Benefits Info', icon: '🩺', link: '#' },
    { name: 'Office Map', icon: '📍', link: '#' },
  ];
  // Profile completion calculation (fields + docs)
  const profileFields = ['personalDetailsCompleted', 'offerLetterSigned', 'handbookRead'];
  const filledFields = profileFields.filter(f => formData[f]).length;
  const profileCompletion = Math.round(((filledFields + (documents?.length > 0 ? 1 : 0)) / (profileFields.length + 1)) * 100);
  // Badges
  const earnedBadges = badgeList.filter(b => b.condition(formData, documents));
  // Recent activity (last 5 actions)
  const recentActivity = useMemo(() => (auditLog || []).slice(0, 5), [auditLog]);
  // Notification count (pending tasks + events)
  const notificationCount = pendingTasks.length + events.length;

  return (
    <div className="modern-dashboard">
      {/* Notification Bell */}
      <div className="dashboard-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="dashboard-header-title">
          <h1>{getGreeting(candidateName)}</h1>
          <p className="motivational-tip">{getRandomTip()}</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="notification-bell" title="Notifications">
            <Icon name="bell" size={24} />
            {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
          </div>
        </div>
      </div>
      {/* Onboarding Timeline/Stepper */}
      <div className="onboarding-timeline">
        {onboardingPhases.map((phase, idx) => (
          <div key={phase.label} className={`timeline-phase${idx <= 1 ? ' completed' : ''}${idx === 1 ? ' active' : ''}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-label">{phase.label}</div>
            <div className="timeline-date">{phase.date}</div>
            {idx < onboardingPhases.length - 1 && <div className="timeline-connector"></div>}
          </div>
        ))}
      </div>
      {/* Profile Completion Meter */}
      <div className="profile-completion-row">
        <div className="profile-completion-label">Profile Completion</div>
        <div className="profile-completion-bar">
          <div className="profile-completion-fill" style={{ width: `${profileCompletion}%` }}></div>
        </div>
        <div className="profile-completion-percent">{profileCompletion}%</div>
        {profileCompletion < 100 && (
          <div className="profile-next-step">Next: {pendingTasks[0] || 'All steps complete!'}</div>
        )}
      </div>
      {/* Badges & Achievements */}
      <div className="badges-row">
        {earnedBadges.map(badge => (
          <span key={badge.key} className="badge-earned">🏅 {badge.label}</span>
        ))}
      </div>
      {/* Quick Links Panel */}
      <div className="quick-links-row">
        {quickLinks.map(link => (
          <Button key={link.label} className="quick-link-btn" onClick={link.onClick}>
            <Icon name={link.icon} size={16} /> {link.label}
          </Button>
        ))}
      </div>
      {/* ...existing dashboard grid and cards... */}
      <div className="dashboard-main-grid">
        <div className="dashboard-col dashboard-progress-col">
          <Card className="dashboard-progress-card">
            <div className="progress-circle-container">
              <svg className="progress-circle" width="90" height="90">
                <circle cx="45" cy="45" r="40" stroke="#e6e6e6" strokeWidth="8" fill="none" />
                <circle
                  cx="45" cy="45" r="40"
                  stroke="#2e7d32"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s' }}
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="1.3em" fill="#2e7d32">{progress}%</text>
              </svg>
              <div className="progress-tasks-label">{completedTasks} of {totalTasks} Tasks Completed</div>
            </div>
          </Card>
          <Card className="dashboard-pending-card">
            <h3>Pending Tasks</h3>
            <ul className="pending-tasks-list">
              {pendingTasks.length === 0 ? (
                <li className="task-done">All tasks completed!</li>
              ) : (
                pendingTasks.map((task, idx) => (
                  <li key={idx} className="task-pending">{task} {task === 'Upload Documents' && <span className="pending-badge">Pending</span>}</li>
                ))
              )}
            </ul>
            <Button className="view-tasks-btn">View All Tasks</Button>
          </Card>
        </div>
        <div className="dashboard-col dashboard-center-col">
          <Card className="dashboard-welcome-card">
            <h2>Welcome to the Team!</h2>
            <p>We're excited to have you on board! Explore the tasks below to get started on your onboarding journey.</p>
            <Button className="welcome-video-btn">Watch Welcome Video</Button>
          </Card>
          <div className="dashboard-row">
            <Card className="dashboard-date-card">
              <h4>Your Start Date</h4>
              <div><b>Joining Date:</b> {joiningDate}</div>
              <div><b>Location:</b> {officeLocation}</div>
            </Card>
            <Card className="dashboard-resources-card">
              <h4>Helpful Resources</h4>
              <div className="resources-grid">
                {resources.map((res, idx) => (
                  <a key={idx} href={res.link} className="resource-item" title={res.name}>
                    <span className="resource-icon">{res.icon}</span>
                    <span className="resource-label">{res.name}</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
        <div className="dashboard-col dashboard-profile-col">
          <Card className="dashboard-profile-card">
            <div className="profile-row">
              <img src={candidatePhoto} alt={candidateName} className="profile-photo" />
              <div className="profile-info">
                <div className="profile-name">{candidateName}</div>
                <div className="profile-role">{candidateRole}</div>
                <div className="profile-date"><b>Starting Date:</b> {joiningDate}</div>
                <div className="profile-location"><b>Location:</b> {officeLocation}</div>
                <Button className="email-hr-btn">Email HR</Button>
              </div>
            </div>
          </Card>
          <Card className="dashboard-events-card">
            <h4>Upcoming Events</h4>
            <ul className="events-list">
              {events.map((event, idx) => (
                <li key={idx} className="event-item">
                  <span className="event-name">{event.name}</span>
                  <span className="event-date">{event.date}</span>
                </li>
              ))}
            </ul>
            <Button className="view-calendar-btn">View Calendar</Button>
          </Card>
          {/* Recent Activity Feed */}
          <Card className="dashboard-activity-card">
            <h4>Recent Activity</h4>
            <ul className="activity-list">
              {recentActivity.length === 0 ? (
                <li className="activity-empty">No recent activity.</li>
              ) : (
                recentActivity.map((act, idx) => (
                  <li key={idx} className="activity-item">
                    <span className="activity-action">{act.action}</span>
                    <span className="activity-time">{new Date(act.timestamp).toLocaleString()}</span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
      <div className="dashboard-footer-row">
        <div className="dashboard-footer-left">
          <Button className="contact-hr-btn" variant="secondary">Need Assistance? Contact HR Support</Button>
        </div>
        <div className="dashboard-footer-right">
          <Button className="faq-btn" variant="secondary">FAQs & Help Center</Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

