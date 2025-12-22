import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Breadcrumbs from '../UI/Breadcrumbs';
import './AuditLog.css';

const AuditLog = () => {
  const { auditLog } = useApp();
  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filteredLogs = auditLog.filter(log => {
    const matchesSearch = !filter || 
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(filter.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = [...new Set(auditLog.map(log => log.action))];

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionLabel = (action) => {
    const labels = {
      'form_field_updated': 'Form Field Updated',
      'document_uploaded': 'Document Uploaded',
      'export_csv': 'CSV Export',
      'export_pdf': 'PDF Export',
      'candidate_registered': 'Candidate Registered',
      'login': 'User Login',
      'logout': 'User Logout',
      'status_changed': 'Status Changed'
    };
    return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="audit-log">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Audit Log' }]} />
      <Card>
        <div className="audit-log-header">
          <div>
            <h3>Audit Log</h3>
            <p className="small">Track all user actions and system events</p>
          </div>
          <div className="audit-log-stats">
            <span className="stat-item">
              Total Actions: <strong>{auditLog.length}</strong>
            </span>
          </div>
        </div>

        <div className="audit-log-filters">
          <input
            type="text"
            className="search-box"
            placeholder="Search actions or details..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <p>No audit log entries found.</p>
          </div>
        ) : (
          <div className="audit-log-table-container">
            <table className="audit-log-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Role</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="timestamp-cell">{formatTimestamp(log.timestamp)}</td>
                    <td>
                      <span className={`role-badge ${log.userRole}`}>
                        {log.userRole === 'hr' ? 'HR' : 'Candidate'}
                      </span>
                    </td>
                    <td className="action-cell">{getActionLabel(log.action)}</td>
                    <td className="details-cell">
                      {Object.keys(log.details).length > 0 ? (
                        <details>
                          <summary>View Details</summary>
                          <pre>{JSON.stringify(log.details, null, 2)}</pre>
                        </details>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>{log.location === 'us' ? 'US' : 'India'}</td>
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

export default AuditLog;

