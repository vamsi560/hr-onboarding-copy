import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import HRCandidateWorkflow from './HRCandidateWorkflow';
import RegisterCandidate from './RegisterCandidate';
import './HRReview.css';

const HRReview = () => {
  const { candidates, setCandidates, logAction } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    candidateId: null,
    status: '',
    reason: ''
  });

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

  const openStatusModal = (candidate) => {
    setStatusModal({
      open: true,
      candidateId: candidate.id,
      status: candidate.status && !['ready', 'pending', 'reviewed'].includes(candidate.status)
        ? candidate.status
        : '',
      reason: candidate.statusReason || ''
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      open: false,
      candidateId: null,
      status: '',
      reason: ''
    });
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!statusModal.status) return;

    setCandidates(prev =>
      prev.map(c =>
        c.id === statusModal.candidateId
          ? {
              ...c,
              status: statusModal.status,
              statusReason: statusModal.reason,
              statusUpdatedAt: new Date().toISOString()
            }
          : c
      )
    );

    if (logAction) {
      logAction('candidate_status_updated', {
        candidateId: statusModal.candidateId,
        status: statusModal.status,
        reason: statusModal.reason
      });
    }

    closeStatusModal();
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
                  <div className="candidate-footer-actions">
                    <Button 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCandidateClick(candidate.id);
                      }}
                    >
                      View Details →
                    </Button>
                    <Button
                      variant="secondary"
                      className="status-update-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openStatusModal(candidate);
                      }}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </Card>

      {statusModal.open && (
        <div className="status-modal-backdrop" onClick={closeStatusModal}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Update Candidate Status</h4>
            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label>Status *</label>
                <select
                  className="input"
                  value={statusModal.status}
                  onChange={(e) =>
                    setStatusModal(prev => ({ ...prev, status: e.target.value }))
                  }
                  required
                >
                  <option value="">Select Status</option>
                  <option value="joined">Joined</option>
                  <option value="offer_revoked">Offer Revoked</option>
                  <option value="rejected">Rejected</option>
                  <option value="absconded">No show</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  className="input"
                  rows="3"
                  value={statusModal.reason}
                  onChange={(e) =>
                    setStatusModal(prev => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="Enter reason for this status change"
                  required
                />
              </div>
              <div className="form-actions modal-actions">
                <Button type="button" variant="secondary" onClick={closeStatusModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRReview;

