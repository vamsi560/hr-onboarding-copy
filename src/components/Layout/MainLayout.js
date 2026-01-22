import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import TAGDashboard from '../TAG/TAGDashboard';
import Support from '../Support/Support';
import ChatWidget from '../Chat/ChatWidget';
import ToastContainer from '../UI/ToastContainer';
import LoadingOverlay from '../UI/LoadingOverlay';
import OfferAcceptance from '../Auth/OfferAcceptance';
import Card from '../UI/Card';
import './MainLayout.css';

const OfferRejectedView = () => {
  const { organization } = useApp();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '20px' }}>
      <Card style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--error)', marginBottom: '16px' }}>Offer Rejected</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.6' }}>
          Thank you for your interest in {organization === 'owlsure' ? 'OwlSure' : 'ValueMomentum'}. 
          The onboarding portal is not available as the offer has been rejected.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          If you have any questions, please contact HR at{' '}
          <a href={`mailto:hr@${organization === 'owlsure' ? 'owlsure' : 'valuemomentum'}.com`} style={{ color: 'var(--brand)' }}>
            hr@{organization === 'owlsure' ? 'owlsure' : 'valuemomentum'}.com
          </a>
        </p>
      </Card>
    </div>
  );
};

const MainLayout = ({ onLogout }) => {
  const { userRole, offerAcceptanceStatus, organization } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Show alumni dashboard - limited access
  if (userRole === 'alumni') {
    return (
      <div className="main-layout main-layout-no-sidebar">
        <Header 
          onMenuClick={() => {}} 
          onLogout={onLogout}
        />
        <main className="main-content main-content-full-width fade-in">
          <div className="main-content-wrapper">
            <Routes>
              <Route path="/alumni" element={<AlumniDashboard />} />
              <Route path="/*" element={<Navigate to="/alumni" replace />} />
            </Routes>
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
            <Routes>
              <Route path="/*" element={<OfferRejectedView />} />
            </Routes>
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
            <Routes>
              <Route path="/*" element={<OfferAcceptance />} />
            </Routes>
          </div>
        </main>
        <ToastContainer />
        <LoadingOverlay />
      </div>
    );
  }

  const handleNavClick = (view) => {
    const route = `/${view}`;
    navigate(route);
    if (window.innerWidth <= 900) {
      setIsMobileNavOpen(false);
    }
  };

  return (
    <div className="main-layout">
      <Sidebar
        activeView={location.pathname.substring(1)}
        onNavClick={handleNavClick}
        isMobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      <Header 
        onMenuClick={() => setIsMobileNavOpen(!isMobileNavOpen)} 
        onLogout={onLogout}
        sidebarCollapsed={isSidebarCollapsed}
      />
      <main className={`main-content fade-in ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className={`main-content-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Routes>
            <Route path="/dashboard" element={userRole === 'hr' ? <Navigate to="/hr" replace /> : <Dashboard />} />
            <Route path="/form" element={<OnboardingForm />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/validation" element={<Validation />} />
            <Route path="/support" element={<Support />} />
            {userRole === 'hr' && (
              <>
                <Route path="/hr" element={<HRReview />} />
                <Route path="/exceptions" element={<HRExceptions />} />
                <Route path="/workflows" element={<HRWorkflows />} />
                <Route path="/references" element={<ReferenceCheck />} />
                <Route path="/expiry" element={<DocumentExpiry />} />
                <Route path="/analytics" element={<HRAnalytics />} />
                <Route path="/chat" element={<HRChat />} />
                <Route path="/auditlog" element={<AuditLog />} />
              </>
            )}
            {userRole === 'tag' && (
              <>
                <Route path="/tag" element={<TAGDashboard />} />
                <Route path="/register" element={<RegisterCandidate />} />
              </>
            )}
            <Route path="/*" element={<Navigate to={userRole === 'hr' ? "/hr" : userRole === 'tag' ? "/tag" : "/dashboard"} replace />} />
          </Routes>
        </div>
      </main>
      <ChatWidget />
      <ToastContainer />
      <LoadingOverlay />
    </div>
  );
};

export default MainLayout;

