import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import './HRCandidateWorkflow.css';

const HRCandidateWorkflow = ({ candidateId, onBack }) => {
  const { candidates } = useApp();
  const [activeTab, setActiveTab] = useState('workflow');
  const [expandedSections, setExpandedSections] = useState({
    beforeFirstDay: true,
    welcomeOfficeTour: false,
    paperWork: true
  });
  const [hiddenMode, setHiddenMode] = useState(false);

  const candidate = candidates.find(c => c.id === candidateId) || {
    id: candidateId,
    name: 'Sai Surya Vamsi Sapireddy',
    status: 'pending',
    dept: 'engineering'
  };

  const workflowPhases = [
    {
      id: 'beforeFirstDay',
      title: 'Before First Day',
      tasks: [
        {
          id: 1,
          task: 'Prepare welcome kit',
          type: 'checkmark',
          documentName: 'welcomekit.zip',
          assignedTo: 'Supriya Rangdal',
          employeeName: candidate.name,
          dueDate: '07/10/2020'
        },
        {
          id: 2,
          task: 'Prepare workspace, software, access',
          type: 'checkmark',
          documentName: '-',
          assignedTo: 'Supriya Rangdal',
          employeeName: candidate.name,
          dueDate: '07/10/2020'
        },
        {
          id: 3,
          task: 'Meeting with HR manager',
          type: 'checkmark',
          documentName: '-',
          assignedTo: 'Raghavendra Raju',
          employeeName: candidate.name,
          dueDate: '07/10/2020'
        }
      ]
    },
    {
      id: 'welcomeOfficeTour',
      title: 'Welcome, Office Tour, Company Vision',
      tasks: []
    },
    {
      id: 'paperWork',
      title: 'Paper Work - First Week on the Job',
      tasks: [
        {
          id: 4,
          task: 'Training',
          type: 'monitor',
          documentName: 'Data Security.pdf',
          assignedTo: 'Kavya',
          employeeName: candidate.name,
          dueDate: '07/10/2020'
        },
        {
          id: 5,
          task: 'Sign the W-4 Form',
          type: 'document',
          documentName: 'W4 Form.pdf',
          assignedTo: 'Raghavendra Raju',
          employeeName: candidate.name,
          dueDate: '07/24/2020'
        },
        {
          id: 6,
          task: 'Sign the SAC Form',
          type: 'document',
          documentName: 'special-agreement.doc',
          assignedTo: 'Raghavendra Raju',
          employeeName: candidate.name,
          dueDate: '07/27/2020'
        },
        {
          id: 7,
          task: 'Sign I-9 (+supporting documents)',
          type: 'document',
          documentName: 'I-9.pdf',
          assignedTo: 'Raghavendra Raju',
          employeeName: candidate.name,
          dueDate: '07/27/2020'
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'checkmark':
        return (
          <span className="type-icon-checkmark" title="Task">Task</span>
        );
      case 'monitor':
        return (
          <span className="type-icon-monitor" title="Training">Training</span>
        );
      case 'document':
        return (
          <span className="type-icon-document" title="Document">Doc</span>
        );
      default:
        return <span className="type-icon-default">•</span>;
    }
  };

  return (
    <div className="hr-candidate-workflow">
      <div className="workflow-header">
        <div>
          <Breadcrumbs items={[{ label: 'Home' }, { label: 'HR Review' }, { label: candidate.name }]} />
          <h2 style={{ margin: '8px 0' }}>Onboarding</h2>
        </div>
        <div className="workflow-header-actions">
          <div className="switch-container">
            <label className="switch-label">
              <span>Switch to hidden</span>
              <input
                type="checkbox"
                checked={hiddenMode}
                onChange={(e) => setHiddenMode(e.target.checked)}
                className="switch-input"
              />
            </label>
          </div>
          <Button onClick={onBack} variant="secondary">
            ← Back to Workflows
          </Button>
        </div>
      </div>

      <Card className="workflow-tabs-card">
        <div className="workflow-tabs">
          <button
            className={`tab-button ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            Workflow
          </button>
          <button
            className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
        </div>
      </Card>

      {activeTab === 'workflow' && (
        <div className="workflow-phases">
          {workflowPhases.map((phase) => (
            <Card key={phase.id} className="workflow-phase-card">
              <div
                className="workflow-phase-header"
                onClick={() => toggleSection(phase.id)}
              >
                <div className="phase-title-row">
                  <span className="expand-icon">
                    {expandedSections[phase.id] ? '▼' : '▶'}
                  </span>
                  <h3 className="phase-title">{phase.title}</h3>
                </div>
              </div>

              {expandedSections[phase.id] && phase.tasks.length > 0 && (
                <div className="workflow-tasks-table-container">
                  <table className="workflow-tasks-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Type</th>
                        <th>Document Name</th>
                        <th>Assigned To</th>
                        <th>Name of Employee</th>
                        <th>Due Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phase.tasks.map((task) => (
                        <tr key={task.id}>
                          <td>{task.task}</td>
                          <td>
                            <span className="task-type-icon">{getTypeIcon(task.type)}</span>
                          </td>
                          <td>{task.documentName}</td>
                          <td>{task.assignedTo}</td>
                          <td>{task.employeeName}</td>
                          <td>{task.dueDate}</td>
                          <td>
                            <div className="task-actions">
                              <button className="action-btn" title="View">View</button>
                              <button className="action-btn" title="Edit">Edit</button>
                              <button className="action-btn" title="Folder">Folder</button>
                              <button className="action-btn" title="Delete">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {expandedSections[phase.id] && phase.tasks.length === 0 && (
                <div className="empty-phase">
                  <p className="small" style={{ color: 'var(--muted)' }}>No tasks in this phase yet.</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'assignments' && (
        <Card>
          <h3>Assignments</h3>
          <p className="small" style={{ color: 'var(--muted)' }}>Assignment details will be shown here.</p>
        </Card>
      )}

      <button className="new-step-fab" title="New Step">
        <span className="fab-icon">+</span>
        <span className="fab-label">New Step</span>
      </button>
    </div>
  );
};

export default HRCandidateWorkflow;

