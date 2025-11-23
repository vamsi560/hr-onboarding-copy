import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import './HRReview.css';

const HRReview = () => {
  const { candidates, setCandidates } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

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

  return (
    <div className="hr-review">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'HR Review' }]} />
      <Card>
        <h3>HR Review Dashboard</h3>
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
                <tr key={candidate.id} className={candidate.selected ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={candidate.selected}
                      onChange={() => toggleCandidate(candidate.id)}
                    />
                  </td>
                  <td>{candidate.name}</td>
                  <td>
                    <div className="flex">
                      <span className={`status-dot status-${candidate.status === 'ready' ? 'approved' : 'pending'}`}></span>
                      <span className="small">{candidate.status}</span>
                    </div>
                  </td>
                  <td>{candidate.docs}/{candidate.total}</td>
                  <td>{candidate.dept}</td>
                  <td><Button variant="secondary">Review</Button></td>
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

