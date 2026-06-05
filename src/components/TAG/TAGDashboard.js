import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Breadcrumbs from '../UI/Breadcrumbs';
import RegisterCandidate from '../HR/RegisterCandidate';
import './TAGDashboard.css';

const TAGDashboard = () => {
  const { candidates, organization } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesDept = !deptFilter || c.dept === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleRegisterSuccess = () => {
    setShowRegisterForm(false);
  };

  const getOrganizationName = () => {
    return organization === 'owlsure' ? 'OwlSure' : 'ValueMomentum';
  };

  if (showRegisterForm) {
    return (
      <RegisterCandidate
        onBack={() => setShowRegisterForm(false)}
        onSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <div className="tag-dashboard">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Candidates' }]} />
      <Card>
        <div className="tag-header-row">
          <div>
            <h3>Candidates</h3>
            <p className="small">View and manage registered candidates for {getOrganizationName()}.</p>
          </div>
        </div>
        <Card style={{ marginTop: '12px' }}>
          <div className="tag-filters">
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

          <Card className="analytics-table-card">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Documents</th>
                  <th>Offer Date</th>
                  <th>Accept Date</th>
                  <th>Joining Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      <p>No candidates found. Register a new candidate to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map(candidate => (
                    <tr key={candidate.id}>
                      <td>
                        <span className="candidate-name-link">
                          {candidate.name}
                        </span>
                      </td>
                      <td>{candidate.position || 'Software Developer'}</td>
                      <td>{candidate.dept}</td>
                      <td>
                        <span className={`status-badge status-${candidate.status}`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td>{candidate.docs || 0} / {candidate.total || 12}</td>
                      <td>{candidate.offerDate || '12/15/2024'}</td>
                      <td>{candidate.acceptDate || '12/17/2024'}</td>
                      <td>{candidate.joiningDate || '01/02/2025'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </Card>
      </Card>
    </div>
  );
};

export default TAGDashboard;
