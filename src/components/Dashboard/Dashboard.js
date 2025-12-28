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
      {/* Notification Bell and Header */}
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
      {/* ...existing dashboard grid and cards... */}
      <div className="dashboard-main-grid">
        {/* ...existing code... */}
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

