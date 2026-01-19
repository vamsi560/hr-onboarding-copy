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
  const [joiningDateModal, setJoiningDateModal] = useState({
    open: false,
    selectedIds: [],
    joiningDate: ''
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

  const handleJoiningDateSubmit = (e) => {
    e.preventDefault();
    if (!joiningDateModal.joiningDate) return;

    // Convert YYYY-MM-DD to MM/DD/YYYY format
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return (date.getMonth() + 1).toString().padStart(2, '0') + '/' + 
             date.getDate().toString().padStart(2, '0') + '/' + 
             date.getFullYear();
    };

    setCandidates(prev =>
      prev.map(c =>
        joiningDateModal.selectedIds.includes(c.id)
          ? { ...c, joiningDate: formatDate(joiningDateModal.joiningDate) }
          : c
      )
    );

    setJoiningDateModal({ open: false, selectedIds: [], joiningDate: '' });
  };

  const closeJoiningDateModal = () => {
    setJoiningDateModal({ open: false, selectedIds: [], joiningDate: '' });
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
              <Button variant="secondary" onClick={() => setJoiningDateModal({ open: true, selectedIds: candidates.filter(c => c.selected).map(c => c.id) })}>Edit Joining Date</Button>
              <Button variant="secondary" onClick={() => toggleSelectAll(false)}>Clear</Button>
            </div>
          )}

          <Card className="analytics-table-card">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={filteredCandidates.length > 0 && filteredCandidates.every(c => c.selected)}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Hiring Lead</th>
                  <th>Offer Date</th>
                  <th>Accept Date</th>
                  <th>Joining Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(candidate => (
                  <tr key={candidate.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={candidate.selected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleCandidate(candidate.id);
                        }}
                      />
                    </td>
                    <td>
                      <button 
                        type="button" 
                        className="candidate-name-link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCandidateClick(candidate.id);
                        }}
                      >
                        {candidate.name}
                      </button>
                    </td>
                    <td>{candidate.position || 'Software Developer'}</td>
                    <td>{candidate.dept}</td>
                    <td>{candidate.hiringLead || 'Raghavendra Raju'}</td>
                    <td>{candidate.offerDate || '12/15/2024'}</td>
                    <td>{candidate.acceptDate || '12/17/2024'}</td>
                    <td>{candidate.joiningDate || '01/02/2025'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
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

      {joiningDateModal.open && (
        <div className="status-modal-backdrop" onClick={closeJoiningDateModal}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Edit Joining Date</h4>
            <p>Update joining date for {joiningDateModal.selectedIds.length} selected candidate(s)</p>
            <form onSubmit={handleJoiningDateSubmit}>
              <div className="form-group">
                <label>Joining Date *</label>
                <input
                  type="date"
                  className="input"
                  value={joiningDateModal.joiningDate}
                  onChange={(e) =>
                    setJoiningDateModal(prev => ({ ...prev, joiningDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-actions modal-actions">
                <Button type="button" variant="secondary" onClick={closeJoiningDateModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update
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

