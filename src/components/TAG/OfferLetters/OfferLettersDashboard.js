import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import Card from '../../UI/Card';
import Breadcrumbs from '../../UI/Breadcrumbs';
import Icon from '../../UI/Icon';
import { api } from '../../../utils/api';
import './OfferLettersDashboard.css';

const OfferLettersDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { organization } = useApp();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [savingStatus, setSavingStatus] = useState({});

  // Interactive Filters States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await api.getOfferDashboard();
        setDashboardData(data);
      } catch {
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [showToast]);

  const handleDownloadPdf = async (candidate) => {
    setDownloadingPdf(prev => ({ ...prev, [candidate.id]: true }));
    try {
      if (candidate.pdf_path) {
        // Download handler
        const link = document.createElement('a');
        link.href = candidate.pdf_path;
        link.download = `offer_letter_${candidate.name.replace(/\s+/g, '_')}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`PDF download started: ${candidate.name}`, 'success');
      } else {
        showToast('PDF is still generating in the background. Please wait a moment.', 'warning');
      }
    } catch {
      showToast('Failed to download PDF. Please try again.', 'error');
    } finally {
      setDownloadingPdf(prev => ({ ...prev, [candidate.id]: false }));
    }
  };

  const handleStatusChange = (candidateId, value) => {
    setStatusMap(prev => ({ ...prev, [candidateId]: value }));
  };

  const handleSaveStatus = async (candidate) => {
    const newStatus = statusMap[candidate.id];
    if (!newStatus) return;
    setSavingStatus(prev => ({ ...prev, [candidate.id]: true }));
    try {
      await api.updateOfferLetterStatus(candidate.id, newStatus);
      setDashboardData(prev => ({
        ...prev,
        candidates: prev.candidates.map(c =>
          c.id === candidate.id ? { ...c, status: newStatus } : c
        )
      }));
      setStatusMap(prev => { const s = { ...prev }; delete s[candidate.id]; return s; });
      showToast(`Status updated to "${newStatus}"`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setSavingStatus(prev => ({ ...prev, [candidate.id]: false }));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDept('');
    setSelectedFacility('');
    setSelectedStatus('');
    showToast('Filters cleared', 'success');
  };

  const getFilteredCandidates = () => {
    if (!dashboardData?.candidates) return [];
    return dashboardData.candidates.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDept = selectedDept ? c.department === selectedDept : true;
      const matchFacility = selectedFacility ? c.facility === selectedFacility : true;
      const matchStatus = selectedStatus ? c.status === selectedStatus : true;
      
      return matchSearch && matchDept && matchFacility && matchStatus;
    });
  };

  const filteredCandidates = getFilteredCandidates();

  // Dynamic filter options
  const departments = [...new Set((dashboardData?.candidates || []).map(c => c.department).filter(Boolean))];
  const facilities = [...new Set((dashboardData?.candidates || []).map(c => c.facility).filter(Boolean))];
  const statuses = [...new Set((dashboardData?.candidates || []).map(c => c.status).filter(Boolean))];

  // Bulk operation actions
  const handleSelectRow = (candidateId) => {
    setSelectedIds(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId) 
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredCandidates.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    setBulkProcessing(true);
    let successCount = 0;
    try {
      for (const id of selectedIds) {
        await api.updateOfferLetterStatus(id, bulkStatus);
        successCount++;
      }
      setDashboardData(prev => ({
        ...prev,
        candidates: prev.candidates.map(c => 
          selectedIds.includes(c.id) ? { ...c, status: bulkStatus } : c
        )
      }));
      showToast(`Successfully updated ${successCount} candidates to "${bulkStatus}"`, 'success');
      setSelectedIds([]);
      setBulkStatus('');
    } catch {
      showToast('Error occurred during bulk status shift', 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkExportCSV = () => {
    if (selectedIds.length === 0) return;
    const selectedCandidates = dashboardData.candidates.filter(c => selectedIds.includes(c.id));
    const headers = ['Name', 'Email', 'Position', 'Department', 'Facility', 'Status', 'Date', 'Tag POC'];
    const rows = selectedCandidates.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.position}"`,
      `"${c.department || ''}"`,
      `"${c.facility || ''}"`,
      `"${c.status}"`,
      `"${c.offer_date || ''}"`,
      `"${c.tag_poc || ''}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `offers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`Exported ${selectedCandidates.length} records to CSV!`, 'success');
    setSelectedIds([]);
  };

  const calculateMetrics = (candidates) => {
    if (!candidates || candidates.length === 0) return { oar: '0.0%', tto: '2.5 days' };
    const sentCount = candidates.filter(c => ['Offer Made', 'Accepted', 'Rejected', 'Joined'].includes(c.status)).length;
    const acceptedCount = candidates.filter(c => ['Accepted', 'Joined'].includes(c.status)).length;
    const oar = sentCount > 0 ? ((acceptedCount / sentCount) * 100).toFixed(1) + '%' : '0.0%';
    return { oar, tto: '2.2 days' };
  };

  const metrics = calculateMetrics(dashboardData?.candidates);
  const organizationName = organization === 'owlsure' ? 'OwlSure' : 'ValueMomentum';

  if (loading) {
    return (
      <div className="offer-dashboard-loading" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading Recruiter Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="offer-dashboard">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Offer Letters' }]} />
      
      {/* Header Panel */}
      <div className="offer-header">
        <div>
          <h2>Offer Letter Hub</h2>
          <p className="small">Generate, verify, and monitor candidate offer letters for {organizationName}.</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn-filter ${showFilterPanel ? 'active' : ''}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Icon name="settings" size={16} />
            <span>Filters</span>
          </button>
          <button 
            className="btn-create" 
            onClick={() => navigate('/offer-letters/new')}
          >
            <Icon name="check" size={16} />
            <span>Generate Offer Letter</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-details">
            <span className="stat-label">Total Offers</span>
            <span className="stat-val">{dashboardData?.total_candidates || 0}</span>
          </div>
          <div className="stat-icon-wrapper blue">
            <Icon name="documents" size={24} />
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-details">
            <span className="stat-label">Pending Sign-off</span>
            <span className="stat-val">{dashboardData?.pending_offers || 0}</span>
          </div>
          <div className="stat-icon-wrapper yellow">
            <Icon name="expiry" size={24} />
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-details">
            <span className="stat-label">Offer Acceptance</span>
            <span className="stat-val">{metrics.oar}</span>
          </div>
          <div className="stat-icon-wrapper green">
            <Icon name="validation" size={24} />
          </div>
        </Card>
      </div>

      {/* Advanced filters selectors */}
      {showFilterPanel && (
        <Card className="filter-panel fade-in">
          <div className="filter-header">
            <h4>Filter Criteria</h4>
            <button className="clear-btn" onClick={handleClearFilters}>Reset all</button>
          </div>
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="searchCandidateInput">Search Candidate</label>
              <input 
                id="searchCandidateInput"
                type="text" 
                placeholder="Name, email, position..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-box"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="departmentSelect">Department</label>
              <select 
                id="departmentSelect"
                value={selectedDept} 
                onChange={e => setSelectedDept(e.target.value)}
                className="select-box"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="facilitySelect">Facility</label>
              <select 
                id="facilitySelect"
                value={selectedFacility} 
                onChange={e => setSelectedFacility(e.target.value)}
                className="select-box"
              >
                <option value="">All Facilities</option>
                {facilities.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="statusSelect">Status</label>
              <select 
                id="statusSelect"
                value={selectedStatus} 
                onChange={e => setSelectedStatus(e.target.value)}
                className="select-box"
              >
                <option value="">All Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk operations row */}
      {selectedIds.length > 0 && (
        <Card className="bulk-bar fade-in">
          <div className="bulk-title">
            <Icon name="bell" size={16} />
            <span><strong>{selectedIds.length}</strong> candidates selected</span>
          </div>
          <div className="bulk-actions">
            <select 
              value={bulkStatus} 
              onChange={e => setBulkStatus(e.target.value)}
              className="bulk-select"
            >
              <option value="">Change Status...</option>
              <option value="Draft">Draft</option>
              <option value="Offer Made">Offer Made</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Joined">Joined</option>
            </select>
            <button 
              className="bulk-btn" 
              onClick={handleBulkStatusChange} 
              disabled={bulkProcessing || !bulkStatus}
            >
              Apply Status
            </button>
            <button className="bulk-btn-secondary" onClick={handleBulkExportCSV}>
              Export CSV
            </button>
          </div>
        </Card>
      )}

      {/* Candidate registry card */}
      <Card className="candidate-card">
        <div className="registry-title-row">
          <h3>Candidates Registry</h3>
          <span>{filteredCandidates.length} candidate profiles matching</span>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="empty-registry">
            <Icon name="support" size={48} className="empty-icon animate-pulse" />
            <p>No candidates found matching selected parameters.</p>
            <button onClick={handleClearFilters} className="clear-btn-main">Reset Filters</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="candidate-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length}
                    />
                  </th>
                  <th>Candidate Name</th>
                  <th>Designation / Team</th>
                  <th>Offer Status</th>
                  <th>Date of Joining</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(candidate => (
                  <tr 
                    key={candidate.id}
                    className={selectedIds.includes(candidate.id) ? 'selected-row' : ''}
                  >
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(candidate.id)}
                        onChange={() => handleSelectRow(candidate.id)}
                      />
                    </td>
                    <td>
                      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }} className="candidate-profile-cell" onClick={() => navigate(`/offer-letters/preview/${candidate.id}`)}>
                        <div className="profile-letter-avatar">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <span className="profile-name-link">{candidate.name}</span>
                          <span className="profile-email-sub">{candidate.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="designation-cell">
                        <strong>{candidate.position}</strong>
                        <span className="dept-sub">{candidate.department || 'Recruitment'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {candidate.status === 'Generating' ? (
                          <span className="badge-generating">
                            <span className="loader-small"></span>
                            <span>Generating...</span>
                          </span>
                        ) : candidate.status === 'Generation Failed' ? (
                          <span className="badge-failed">Failed</span>
                        ) : (
                          <>
                            <select
                              value={statusMap[candidate.id] ?? candidate.status}
                              onChange={e => handleStatusChange(candidate.id, e.target.value)}
                              className="table-select-badge"
                            >
                              <option value="Draft">Draft</option>
                              <option value="Offer Made">Offer Made</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Joined">Joined</option>
                            </select>
                            {statusMap[candidate.id] && statusMap[candidate.id] !== candidate.status && (
                              <button 
                                className="table-save-btn"
                                onClick={() => handleSaveStatus(candidate)}
                                disabled={savingStatus[candidate.id]}
                              >
                                {savingStatus[candidate.id] ? 'Saving' : '✓'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="joining-date-text">
                        {candidate.joining_date || 'Not Scheduled'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-row">
                        <button 
                          className="table-action-btn edit" 
                          onClick={() => navigate(`/offer-letters/edit/${candidate.id}`)}
                          title="Edit Details"
                        >
                          Edit
                        </button>
                        {candidate.pdf_path ? (
                          <button 
                            className="table-action-btn pdf"
                            onClick={() => handleDownloadPdf(candidate)}
                            disabled={downloadingPdf[candidate.id]}
                            title="Download Offer Letter PDF"
                          >
                            {downloadingPdf[candidate.id] ? '...' : 'PDF'}
                          </button>
                        ) : (
                          candidate.status === 'Generating' ? (
                            <span className="loading-badge">Generating...</span>
                          ) : (
                            <button 
                              className="table-action-btn draft"
                              onClick={() => navigate(`/offer-letters/preview/${candidate.id}`)}
                            >
                              Preview
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OfferLettersDashboard;
