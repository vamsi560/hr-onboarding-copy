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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Onboarding</h1>
          <p className="dashboard-subtitle">New Hire Packet (in progress)</p>
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
      <Card className="progress-summary-card">
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>Overall Progress</h3>
            <p className="small" style={{ margin: 0 }}>Your onboarding journey</p>
          </div>
          <div style={{ fontWeight: '700', fontSize: '32px', color: 'var(--brand)' }}>{progress}%</div>
        </div>
        <ProgressBar value={progress} style={{ marginTop: '8px' }} />
        <div className="small" style={{ marginTop: '12px', color: 'var(--muted)' }}>
          {progress < 50 ? 'Getting started...' : progress < 100 ? 'Great progress!' : 'Almost there!'}
        </div>
      </Card>

      {/* Tasks Section */}
      <Card className="tasks-card">
        <h2 className="section-title">Tasks</h2>
        <div className="tasks-list">
          {pendingTasks.length === 0 ? (
            <div className="task-item completed">
              <div className="task-checkbox completed">
                <span className="checkmark-small">✓</span>
              </div>
              <div className="task-content">
                <div className="task-name" style={{ color: 'var(--success)', fontWeight: '500' }}>
                  All tasks completed!
                </div>
              </div>
            </div>
          ) : (
            <>
              {pendingTasks.slice(0, 2).map((task, index) => (
                <div key={index} className="task-item completed">
                  <div className="task-checkbox completed">
                    <span className="checkmark-small">✓</span>
                  </div>
                  <div className="task-content">
                    <div className="task-name">{task}</div>
                    <div className="task-date">Assigned {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
                  </div>
                </div>
              ))}
              {pendingTasks.slice(2).map((task, index) => (
                <div key={index + 2} className="task-item">
                  <div className="task-checkbox"></div>
                  <div className="task-content">
                    <div className="task-name">{task}</div>
                    <div className="task-date">Unassigned {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Quick Actions Grid */}
      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4>Quick Actions</h4>
          <div className="small" style={{ marginBottom: '12px' }}>Upload documents or continue your form.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button onClick={() => window.location.hash = '#documents'}>
              Upload Documents
            </Button>
            <Button variant="secondary" onClick={() => window.location.hash = '#form'}>
              Continue Form
            </Button>
          </div>
        </Card>

        <Card className="dashboard-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4>AI Validation</h4>
          <div className="small" style={{ marginBottom: '12px' }}>View AI-powered document validation results.</div>
          <Button variant="secondary" onClick={() => window.location.hash = '#validation'}>
            View Results
          </Button>
        </Card>

        <Card className="dashboard-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4>Help & Support</h4>
          <div className="small" style={{ marginBottom: '12px' }}>Chat with the onboarding assistant.</div>
          <Button onClick={() => {/* Open chat */}}>
            Open Chat
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

