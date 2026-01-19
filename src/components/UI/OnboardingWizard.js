import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';
import './OnboardingWizard.css';

const OnboardingWizard = ({ onComplete, onSkip }) => {
  const { userRole, userInfo } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const candidateSteps = [
    {
      title: "Welcome to ValueMomentum! 🎉",
      content: "We're excited to have you join our team. This wizard will guide you through the onboarding process.",
      action: "Let's get started!",
      highlight: ".dashboard-title"
    },
    {
      title: "Your Dashboard 📊",
      content: "This is your personal dashboard where you can track your onboarding progress and see important updates.",
      action: "Show me more",
      highlight: ".progress-card"
    },
    {
      title: "Complete Your Profile 📝",
      content: "Click on 'Onboarding Form' to fill out your personal and professional information.",
      action: "Got it",
      highlight: "[data-nav='form']"
    },
    {
      title: "Upload Documents 📄",
      content: "Upload all required documents in the Documents section. Our AI will help validate them.",
      action: "Understood",
      highlight: "[data-nav='documents']"
    },
    {
      title: "Need Help? 💬",
      content: "Use the chat widget anytime if you need assistance. We're here to help!",
      action: "Perfect!",
      highlight: ".chat-fab"
    }
  ];

  const hrSteps = [
    {
      title: "Welcome to HR Dashboard! 👋",
      content: "Manage candidates, track progress, and streamline your onboarding workflow from here.",
      action: "Show me around",
      highlight: ".hr-header-row"
    },
    {
      title: "Candidate Management 👥",
      content: "View all candidates, their progress, and manage their onboarding status in one place.",
      action: "Next",
      highlight: ".candidates-cards-grid"
    },
    {
      title: "Analytics & Reports 📈",
      content: "Access detailed analytics and generate reports to track onboarding efficiency.",
      action: "Great!",
      highlight: "[data-nav='analytics']"
    },
    {
      title: "Register New Candidates ➕",
      content: "Easily register new candidates and send them onboarding invitations.",
      action: "Finish",
      highlight: ".hr-header-row button"
    }
  ];

  const steps = userRole === 'hr' ? hrSteps : candidateSteps;

  useEffect(() => {
    // Check if user has seen the wizard before
    const hasSeenWizard = localStorage.getItem(`wizard_${userRole}_${userInfo?.email}`);
    if (!hasSeenWizard) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, [userRole, userInfo, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`wizard_${userRole}_${userInfo?.email}`, 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(`wizard_${userRole}_${userInfo?.email}`, 'true');
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  const highlightElement = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('wizard-highlight');
      setTimeout(() => {
        element.classList.remove('wizard-highlight');
      }, 3000);
    }
  };

  useEffect(() => {
    if (isVisible && steps[currentStep]?.highlight) {
      setTimeout(() => {
        highlightElement(steps[currentStep].highlight);
      }, 500);
    }
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <>
      <div className="wizard-overlay" />
      <div className="onboarding-wizard">
        <div className="wizard-content">
          <div className="wizard-header">
            <h3>{step.title}</h3>
            <button className="wizard-close" onClick={handleSkip}>×</button>
          </div>
          
          <div className="wizard-body">
            <p>{step.content}</p>
          </div>
          
          <div className="wizard-footer">
            <div className="wizard-progress">
              <span>{currentStep + 1} of {steps.length}</span>
              <div className="progress-dots">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`dot ${index <= currentStep ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="wizard-actions">
              <Button variant="secondary" onClick={handleSkip}>
                Skip Tour
              </Button>
              <Button onClick={handleNext}>
                {step.action}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingWizard;