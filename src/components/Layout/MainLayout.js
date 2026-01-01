import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../Dashboard/Dashboard';
import AlumniDashboard from '../Dashboard/AlumniDashboard';
import OnboardingForm from '../Forms/OnboardingForm';
import Documents from '../Documents/Documents';
import Validation from '../Validation/Validation';
import HRReview from '../HR/HRReview';
import HRExceptions from '../HR/HRExceptions';
import HRWorkflows from '../HR/HRWorkflows';
import HRAnalytics from '../HR/HRAnalytics';
import HRChat from '../HR/HRChat';
import AuditLog from '../HR/AuditLog';
import RegisterCandidate from '../HR/RegisterCandidate';
import ReferenceCheck from '../HR/ReferenceCheck';
import DocumentExpiry from '../HR/DocumentExpiry';
import Support from '../Support/Support';
import ChatWidget from '../Chat/ChatWidget';
import ToastContainer from '../UI/ToastContainer';
import LoadingOverlay from '../UI/LoadingOverlay';
import OfferAcceptance from '../Auth/OfferAcceptance';
import Card from '../UI/Card';
import './MainLayout.css';

const OfferRejectedView = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '20px' }}>
      <Card style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--error)', marginBottom: '16px' }}>Offer Rejected</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.6' }}>
          Thank you for your interest in ValueMomentum. 
          The onboarding portal is not available as the offer has been rejected.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          If you have any questions, please contact HR at{' '}
          <a href="mailto:hr@valuemomentum.com" style={{ color: 'var(--brand)' }}>
            hr@valuemomentum.com
          </a>
        </p>
      </Card>
    </div>
  );
};

const MainLayout = ({ onLogout }) => {
  const { userRole, offerAcceptanceStatus, userInfo } = useApp();
  const [activeView, setActiveView] = useState(() => {
    if (userRole === 'hr') return 'hr';
    if (userRole === 'alumni') return 'alumni';
    return 'dashboard';
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Show alumni dashboard - limited access
  if (userRole === 'alumni') {
    return (
      <div className="main-layout">
        <Header 
          onMenuClick={() => {}} 
          onLogout={onLogout}
        />
        <main className="main-content fade-in">
          <div className="main-content-wrapper">
            <AlumniDashboard />
          </div>
        </main>
        <ToastContainer />
        <LoadingOverlay />
      </div>
    );
  }

  // Block portal access for candidates who rejected the offer
  if (userRole === 'candidate' && offerAcceptanceStatus === 'rejected') {
    return (
      <div className="main-layout">
        <Header 
          onMenuClick={() => {}} 
          onLogout={onLogout}
        />
        <main className="main-content fade-in">
          <div className="main-content-wrapper">
            <OfferRejectedView />
          </div>
        </main>
        <ToastContainer />
        <LoadingOverlay />
      </div>
    );
  }

  // Show offer acceptance modal if candidate hasn't responded yet
  const showOfferModal = userRole === 'candidate' && offerAcceptanceStatus === null;

  // Block access if offer hasn't been accepted yet
  if (showOfferModal) {
    return (
      <div className="main-layout">
        <Header 
          onMenuClick={() => {}} 
          onLogout={onLogout}
        />
        <main className="main-content fade-in">
          <div className="main-content-wrapper">
            <OfferAcceptance />
          </div>
        </main>
        <ToastContainer />
        <LoadingOverlay />
      </div>
    );
  }

  const views = {
    dashboard: Dashboard,
    alumni: AlumniDashboard,
    form: OnboardingForm,
    documents: Documents,
    validation: Validation,
    hr: HRReview,
    support: Support,
    exceptions: HRExceptions,
    workflows: HRWorkflows,
    references: ReferenceCheck,
    expiry: DocumentExpiry,
    analytics: HRAnalytics,
    chat: HRChat,
    auditlog: AuditLog
  };

  const ActiveComponent = views[activeView] || Dashboard;

  const handleNavClick = (view) => {
    // Only allow HR-specific views for HR users
    const hrOnlyViews = ['chat', 'auditlog', 'references', 'expiry', 'exceptions', 'workflows', 'analytics', 'hr'];
    if (hrOnlyViews.includes(view) && userRole !== 'hr') {
      return;
    }
    setActiveView(view);
    if (window.innerWidth <= 900) {
      setIsMobileNavOpen(false);
    }
  };

  return (
    <div className="main-layout">
      <Sidebar
        activeView={activeView}
        onNavClick={handleNavClick}
        isMobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      <Header 
        onMenuClick={() => setIsMobileNavOpen(!isMobileNavOpen)} 
        onLogout={onLogout}
      />
      <main className={`main-content fade-in ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="main-content-wrapper">
          <ActiveComponent />
        </div>
      </main>
      <ChatWidget />
      <ToastContainer />
      <LoadingOverlay />
    </div>
  );
};

export default MainLayout;

