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

import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import './Dashboard.css';

const Dashboard = () => {
  const { formData, userRole, location, documents } = useApp();
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

  return (
    <div className="modern-dashboard">
      <div className="dashboard-header-row">
        <div className="dashboard-header-title">
          <h1>Welcome Aboard, {candidateName}!</h1>
          <p>Get Started on Your Journey with Us</p>
        </div>
      </div>
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

