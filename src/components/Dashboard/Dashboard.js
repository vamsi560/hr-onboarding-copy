import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ProgressBar from '../UI/ProgressBar';
import Breadcrumbs from '../UI/Breadcrumbs';
import { calculateProgress } from '../../utils/progress';
import './Dashboard.css';

const Dashboard = () => {
  const { formData, documents } = useApp();
  const [progress, setProgress] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const progressData = calculateProgress(formData, documents);
    setProgress(progressData.percent);
    setPendingTasks(progressData.pendingTasks);
  }, [formData, documents]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const completedTasks = pendingTasks.length === 0 ? 0 : pendingTasks.filter((_, i) => i < 2).length;
  const totalTasks = Math.max(pendingTasks.length, 1);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1 className="dashboard-title">{getGreeting()}! 👋</h1>
          <p className="dashboard-subtitle">Welcome to your onboarding journey</p>
        </div>
        <div className="dashboard-stats-mini">
          <div className="stat-mini">
            <div className="stat-mini-value">{progress}%</div>
            <div className="stat-mini-label">Complete</div>
          </div>
          <div className="stat-mini">
            <div className="stat-mini-value">{completedTasks}/{totalTasks}</div>
            <div className="stat-mini-label">Tasks</div>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <Card className="progress-timeline-card">
        <div className="progress-timeline">
          <div className="timeline-node completed">
            <div className="node-circle">
              <span className="checkmark">✓</span>
            </div>
            <div className="node-label">Pre-Onboarding</div>
            <div className="node-date">(05/10/2024)</div>
          </div>
          <div className="timeline-connector completed"></div>
          <div className="timeline-node completed">
            <div className="node-circle">
              <span className="checkmark">✓</span>
            </div>
            <div className="node-label">Onboarding</div>
            <div className="node-date">(06/10/2024)</div>
          </div>
          <div className="timeline-connector active"></div>
          <div className="timeline-node active">
            <div className="node-circle">
              <span className="checkmark">✓</span>
            </div>
            <div className="node-label">Post-Onboarding</div>
            <div className="node-date">(09/10/2024)</div>
          </div>
        </div>
      </Card>

      {/* Progress Summary */}
      <Card className="progress-summary-card enhanced-card">
        <div className="progress-header">
          <div className="progress-header-content">
            <div className="progress-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="progress-title">Overall Progress</h3>
              <p className="progress-subtitle">Your onboarding journey</p>
            </div>
          </div>
          <div className="progress-percentage">
            <span className="progress-number">{progress}</span>
            <span className="progress-percent">%</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <ProgressBar value={progress} className="enhanced-progress" />
          <div className="progress-milestones">
            <span className={progress >= 25 ? 'milestone reached' : 'milestone'}>25%</span>
            <span className={progress >= 50 ? 'milestone reached' : 'milestone'}>50%</span>
            <span className={progress >= 75 ? 'milestone reached' : 'milestone'}>75%</span>
            <span className={progress >= 100 ? 'milestone reached' : 'milestone'}>100%</span>
          </div>
        </div>
        <div className="progress-message">
          {progress < 25 && (
            <span className="message-text">🚀 Getting started - Complete your personal information</span>
          )}
          {progress >= 25 && progress < 50 && (
            <span className="message-text">📝 Great start! Continue with professional details</span>
          )}
          {progress >= 50 && progress < 75 && (
            <span className="message-text">📄 Keep going! Upload your documents</span>
          )}
          {progress >= 75 && progress < 100 && (
            <span className="message-text">✨ Almost there! Complete the final steps</span>
          )}
          {progress >= 100 && (
            <span className="message-text success">🎉 Congratulations! You've completed onboarding</span>
          )}
        </div>
      </Card>

      {/* Tasks Section */}
      <Card className="tasks-card enhanced-card">
        <div className="section-header">
          <div className="section-header-content">
            <div className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="section-title">Your Tasks</h2>
          </div>
          <div className="task-count-badge">
            {completedTasks}/{totalTasks}
          </div>
        </div>
        <div className="tasks-list">
          {pendingTasks.length === 0 ? (
            <div className="task-empty-state">
              <div className="task-empty-icon">✅</div>
              <div className="task-empty-text">
                <strong>All tasks completed!</strong>
                <p>You're all set. Great job!</p>
              </div>
            </div>
          ) : (
            <>
              {pendingTasks.slice(0, 2).map((task, index) => (
                <div key={index} className="task-item completed enhanced-task">
                  <div className="task-checkbox completed">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="task-content">
                    <div className="task-name completed">{task}</div>
                    <div className="task-meta">
                      <span className="task-date">Completed {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="task-badge completed-badge">Done</span>
                    </div>
                  </div>
                </div>
              ))}
              {pendingTasks.slice(2).map((task, index) => (
                <div key={index + 2} className="task-item enhanced-task">
                  <div className="task-checkbox">
                    <div className="checkbox-inner"></div>
                  </div>
                  <div className="task-content">
                    <div className="task-name">{task}</div>
                    <div className="task-meta">
                      <span className="task-date">Due {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="task-badge pending-badge">Pending</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Quick Actions Grid */}
      <div className="dashboard-grid">
        <Card className="dashboard-card enhanced-action-card" onClick={() => window.location.hash = '#documents'}>
          <div className="card-icon-wrapper">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="card-content">
            <h4>Upload Documents</h4>
            <p className="card-description">Submit required documents for verification</p>
            <div className="card-action-hint">
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </Card>

        <Card className="dashboard-card enhanced-action-card" onClick={() => window.location.hash = '#form'}>
          <div className="card-icon-wrapper">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="card-content">
            <h4>Complete Form</h4>
            <p className="card-description">Fill out your onboarding information</p>
            <div className="card-action-hint">
              <span>Continue</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </Card>

        <Card className="dashboard-card enhanced-action-card" onClick={() => window.location.hash = '#validation'}>
          <div className="card-icon-wrapper">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="card-content">
            <h4>AI Validation</h4>
            <p className="card-description">View document validation results</p>
            <div className="card-action-hint">
              <span>View Results</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

