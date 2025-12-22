import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import HRCandidateWorkflow from './HRCandidateWorkflow';
import RegisterCandidate from './RegisterCandidate';
import './HRReview.css';

const HRReview = () => {
  const { candidates, setCandidates } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesDept = !deptFilter || c.dept === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const selectedCount = candidates.filter(c => c.selected).length;

  const toggleCandidate = (id) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  const toggleSelectAll = (checked) => {
    setCandidates(prev => prev.map(c => ({ ...c, selected: checked })));
  };

  const handleCandidateClick = (candidateId) => {
    setSelectedCandidateId(candidateId);
  };

  const handleBackToWorkflows = () => {
    setSelectedCandidateId(null);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterForm(false);
  };

  if (selectedCandidateId) {
    return (
      <HRCandidateWorkflow
        candidateId={selectedCandidateId}
        onBack={handleBackToWorkflows}
      />
    );
  }

  if (showRegisterForm) {
    return (
      <RegisterCandidate
        onBack={() => setShowRegisterForm(false)}
        onSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <div className="hr-review">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'HR Review' }]} />
      <Card>
        <div className="hr-header-row">
          <div>
            <h3>HR Review Dashboard</h3>
            <p className="small">View onboarding status for all employees.</p>
          </div>
          <Button onClick={() => setShowRegisterForm(true)}>
            Register New Candidate
          </Button>
        </div>
        <Card style={{ marginTop: '12px' }}>
          <div className="hr-filters">
            <input
              type="text"
              className="search-box"
              placeholder="Search candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ready">Ready</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
            </select>
            <select
              className="filter-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="sales">Sales</option>
              <option value="hr">HR</option>
            </select>
          </div>

          {selectedCount > 0 && (
            <div className="bulk-actions">
              <span>{selectedCount} selected</span>
              <Button>Approve Selected</Button>
              <Button variant="secondary">Reject Selected</Button>
              <Button variant="secondary" onClick={() => toggleSelectAll(false)}>Clear</Button>
            </div>
          )}

          <div className="candidates-cards-grid">
            {filteredCandidates.map(candidate => (
              <Card 
                key={candidate.id} 
                className={`candidate-card ${candidate.selected ? 'selected' : ''}`}
                onClick={() => handleCandidateClick(candidate.id)}
              >
                <div className="candidate-card-header">
                  <input
                    type="checkbox"
                    checked={candidate.selected}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleCandidate(candidate.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="candidate-avatar">
                    {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="candidate-card-body">
                  <h4 className="candidate-name">{candidate.name}</h4>
                  <div className="candidate-info">
                    <span className="candidate-dept">{candidate.dept}</span>
                    <span className={`status-badge status-${candidate.status === 'ready' ? 'approved' : 'pending'}`}>
                      {candidate.status}
                    </span>
                  </div>
                  <div className="candidate-docs">
                    <span className="docs-progress">{candidate.docs}/{candidate.total} Documents</span>
                    <div className="docs-progress-bar">
                      <div 
                        className="docs-progress-fill" 
                        style={{ width: `${(candidate.docs / candidate.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="candidate-card-footer">
                  <Button 
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCandidateClick(candidate.id);
                    }}
                  >
                    View Details →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default HRReview;

