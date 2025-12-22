import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../Dashboard/Dashboard';
import OnboardingForm from '../Forms/OnboardingForm';
import Documents from '../Documents/Documents';
import Validation from '../Validation/Validation';
import HRReview from '../HR/HRReview';
import HRExceptions from '../HR/HRExceptions';
import HRWorkflows from '../HR/HRWorkflows';
import HRAnalytics from '../HR/HRAnalytics';
import HRChat from '../HR/HRChat';
import RegisterCandidate from '../HR/RegisterCandidate';
import Support from '../Support/Support';
import ChatWidget from '../Chat/ChatWidget';
import ToastContainer from '../UI/ToastContainer';
import LoadingOverlay from '../UI/LoadingOverlay';
import './MainLayout.css';

const MainLayout = ({ onLogout }) => {
  const { userRole } = useApp();
  const [activeView, setActiveView] = useState(userRole === 'hr' ? 'hr' : 'dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const views = {
    dashboard: Dashboard,
    form: OnboardingForm,
    documents: Documents,
    validation: Validation,
    hr: HRReview,
    support: Support,
    exceptions: HRExceptions,
    workflows: HRWorkflows,
    analytics: HRAnalytics,
    chat: HRChat
  };

  const ActiveComponent = views[activeView] || Dashboard;

  const handleNavClick = (view) => {
    // Only allow chat view for HR users
    if (view === 'chat' && userRole !== 'hr') {
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
      />
      <Header 
        onMenuClick={() => setIsMobileNavOpen(!isMobileNavOpen)} 
        onLogout={onLogout}
      />
      <main className="main-content fade-in">
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

