import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import HRCandidateWorkflow from './HRCandidateWorkflow';
import './HRReview.css';

const HRReview = () => {
  const { candidates, setCandidates } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

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

  if (selectedCandidateId) {
    return (
      <HRCandidateWorkflow
        candidateId={selectedCandidateId}
        onBack={handleBackToWorkflows}
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
          <Button>
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

          <table className="candidates-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Name</th>
                <th>Status</th>
                <th>Docs</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(candidate => (
                <tr 
                  key={candidate.id} 
                  className={candidate.selected ? 'selected' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    // Don't trigger if clicking checkbox or button
                    if (e.target.type !== 'checkbox' && e.target.tagName !== 'BUTTON') {
                      handleCandidateClick(candidate.id);
                    }
                  }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={candidate.selected}
                      onChange={() => toggleCandidate(candidate.id)}
                    />
                  </td>
                  <td style={{ fontWeight: '500', color: 'var(--brand)' }}>{candidate.name}</td>
                  <td>
                    <div className="flex">
                      <span className={`status-dot status-${candidate.status === 'ready' ? 'approved' : 'pending'}`}></span>
                      <span className="small">{candidate.status}</span>
                    </div>
                  </td>
                  <td>{candidate.docs}/{candidate.total}</td>
                  <td>{candidate.dept}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="secondary"
                      onClick={() => handleCandidateClick(candidate.id)}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Card>
    </div>
  );
};

export default HRReview;

