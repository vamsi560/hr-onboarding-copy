import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Breadcrumbs from '../UI/Breadcrumbs';
import './DocumentExpiry.css';

const DocumentExpiry = () => {
  const { candidates, documents, documentExpiry, setDocumentExpiry, logAction } = useApp();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const [formData, setFormData] = useState({
    candidateId: '',
    documentType: '',
    documentName: '',
    expiryDate: '',
    issueDate: '',
    documentNumber: '',
    notes: ''
  });

  // MOCK DATA for document expiry
  const mockDocumentExpiry = [
    {
      id: 1,
      candidateId: 101,
      candidateName: 'Shashank Tudum',
      documentType: 'passport',
      documentName: 'Passport',
      documentNumber: 'A1234567',
      issueDate: '2020-01-01',
      expiryDate: '2024-12-31',
      daysUntilExpiry: -10,
      status: 'expired',
      notes: 'Expired, needs renewal.',
      createdAt: '2020-01-01',
      updatedAt: '2024-12-31',
      reminderSent: false
    },
    {
      id: 2,
      candidateId: 101,
      candidateName: 'Shashank Tudum',
      documentType: 'visa',
      documentName: 'Work Visa',
      documentNumber: 'VISA9876',
      issueDate: '2022-01-01',
      expiryDate: '2025-01-15',
      daysUntilExpiry: 17,
      status: 'critical',
      notes: 'Visa expiring soon.',
      createdAt: '2022-01-01',
      updatedAt: '2024-12-15',
      reminderSent: false
    },
    {
      id: 3,
      candidateId: 102,
      candidateName: 'Priya Sharma',
      documentType: 'aadhar',
      documentName: 'Aadhaar Card',
      documentNumber: 'AAD123456789',
      issueDate: '2018-05-10',
      expiryDate: '2030-05-10',
      daysUntilExpiry: 1600,
      status: 'valid',
      notes: '',
      createdAt: '2018-05-10',
      updatedAt: '2024-12-15',
      reminderSent: false
    }
  ];

  // Find candidate name by ID utility
  const getCandidateName = (id) => {
    const candidateMap = {
      101: 'Shashank Tudum',
      102: 'Priya Sharma',
      103: 'Rahul Verma',
      104: 'Aditi Singh',
      105: 'Vikram Patel'
    };
    return candidateMap[id] || 'Unknown';
  };

  useEffect(() => {
    // Auto-create expiry entries from uploaded documents if they don't exist
    if (documents && documents.length > 0 && documentExpiry) {
      documents.forEach(doc => {
        const docTypes = ['passport', 'visa', 'aadhar', 'certification'];
        if (docTypes.some(type => doc.title.toLowerCase().includes(type))) {
          const exists = documentExpiry.find(exp => 
            exp.documentName === doc.title && exp.candidateId === doc.candidateId
          );
          if (!exists) {
            // Could auto-create here, but for now we'll let HR add manually
          }
        }
      });
    }
  }, [documents, documentExpiry]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'unknown';
    const days = calculateDaysUntilExpiry(expiryDate);
    if (days < 0) return 'expired';
    if (days <= 30) return 'critical';
    if (days <= 60) return 'warning';
    if (days <= 90) return 'attention';
    return 'valid';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const daysUntilExpiry = calculateDaysUntilExpiry(formData.expiryDate);
    const status = getExpiryStatus(formData.expiryDate);

    const newExpiry = {
      id: editingDoc ? editingDoc.id : Date.now(),
      candidateId: formData.candidateId,
      candidateName: candidates.find(c => c.id === parseInt(formData.candidateId))?.name || 'Unknown',
      documentType: formData.documentType,
      documentName: formData.documentName,
      documentNumber: formData.documentNumber,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate,
      daysUntilExpiry: daysUntilExpiry,
      status: status,
      notes: formData.notes,
      createdAt: editingDoc?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderSent: editingDoc?.reminderSent || false
    };

    if (editingDoc) {
      setDocumentExpiry(prev => prev.map(exp => exp.id === editingDoc.id ? newExpiry : exp));
      showToast('Document expiry updated successfully', 'success');
    } else {
      setDocumentExpiry(prev => [...prev, newExpiry]);
      showToast('Document expiry tracking added', 'success');
    }

    if (logAction) {
      logAction('document_expiry_' + (editingDoc ? 'updated' : 'created'), {
        candidateId: formData.candidateId,
        documentType: formData.documentType,
        expiryDate: formData.expiryDate
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      candidateId: '',
      documentType: '',
      documentName: '',
      expiryDate: '',
      issueDate: '',
      documentNumber: '',
      notes: ''
    });
    setShowAddForm(false);
    setEditingDoc(null);
  };

  const handleEdit = (exp) => {
    setEditingDoc(exp);
    setFormData({
      candidateId: exp.candidateId.toString(),
      documentType: exp.documentType,
      documentName: exp.documentName,
      expiryDate: exp.expiryDate,
      issueDate: exp.issueDate || '',
      documentNumber: exp.documentNumber || '',
      notes: exp.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expiry tracking?')) {
      setDocumentExpiry(prev => prev.filter(exp => exp.id !== id));
      showToast('Document expiry tracking removed', 'success');
      if (logAction) {
        logAction('document_expiry_deleted', { id });
      }
    }
  };

  const handleSendReminder = (id) => {
    setDocumentExpiry(prev => prev.map(exp => 
      exp.id === id ? { ...exp, reminderSent: true, updatedAt: new Date().toISOString() } : exp
    ));
    showToast('Reminder email sent to candidate', 'success');
    if (logAction) {
      logAction('document_expiry_reminder_sent', { id });
    }
  };

  const documentExpiryWithMock = (documentExpiry && documentExpiry.length > 0)
    ? documentExpiry
    : mockDocumentExpiry.map(exp => ({ ...exp, candidateName: getCandidateName(exp.candidateId) }));

  const filteredExpiry = (documentExpiryWithMock || []).filter(exp => {
    const candidate = { name: exp.candidateName };
    const matchesSearch = !searchTerm || 
      exp.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || exp.documentType === filterType;
    const matchesStatus = !filterStatus || exp.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status, daysUntilExpiry) => {
    const statusConfig = {
      expired: { label: 'Expired', class: 'status-expired', icon: '⚠️' },
      critical: { label: `Expires in ${daysUntilExpiry} days`, class: 'status-critical', icon: '🔴' },
      warning: { label: `Expires in ${daysUntilExpiry} days`, class: 'status-warning', icon: '🟠' },
      attention: { label: `Expires in ${daysUntilExpiry} days`, class: 'status-attention', icon: '🟡' },
      valid: { label: 'Valid', class: 'status-valid', icon: '✅' },
      unknown: { label: 'Unknown', class: 'status-unknown', icon: '❓' }
    };
    const config = statusConfig[status] || statusConfig.unknown;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Group by status for summary
  const summary = {
    expired: filteredExpiry.filter(exp => exp.status === 'expired').length,
    critical: filteredExpiry.filter(exp => exp.status === 'critical').length,
    warning: filteredExpiry.filter(exp => exp.status === 'warning').length,
    attention: filteredExpiry.filter(exp => exp.status === 'attention').length,
    valid: filteredExpiry.filter(exp => exp.status === 'valid').length
  };

  // Only show three main status filters: Expired, Not Valid, Valid
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'expired', label: 'Expired' },
    { value: 'critical', label: 'Not Valid' },
    { value: 'valid', label: 'Valid' }
  ];

  return (
    <div className="document-expiry">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Document Expiry' }]} />
      
      {/* Summary & Legend */}
      <div className="expiry-summary-grid">
        <Card className="summary-card summary-expired">
          <div className="summary-value">{summary.expired}</div>
          <div className="summary-label">Expired</div>
        </Card>
        <Card className="summary-card summary-critical">
          <div className="summary-value">{summary.critical}</div>
          <div className="summary-label">Critical (≤30 days)</div>
        </Card>
        <Card className="summary-card summary-warning">
          <div className="summary-value">{summary.warning}</div>
          <div className="summary-label">Warning (31-60 days)</div>
        </Card>
        <Card className="summary-card summary-attention">
          <div className="summary-value">{summary.attention}</div>
          <div className="summary-label">Attention (61-90 days)</div>
        </Card>
        <Card className="summary-card summary-valid">
          <div className="summary-value">{summary.valid}</div>
          <div className="summary-label">Valid</div>
        </Card>
      </div>

      <Card>
        <div className="expiry-header">
          <div>
            <h3>Document Expiry Overview</h3>
            <p className="small">
              Track important expiry dates for passports, visas, certifications and other compliance documents.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            + Add Document Expiry
          </Button>
        </div>

        {/* Filters */}
        <div className="expiry-filters">
          <Input
            type="text"
            placeholder="Search by candidate or document name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Document Types</option>
            <option value="passport">Passport</option>
            <option value="visa">Visa</option>
            <option value="aadhar">Aadhaar</option>
            <option value="certification">Certification</option>
            <option value="license">License</option>
            <option value="other">Other</option>
          </select>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="expiry-form-card">
            <div className="form-header">
              <h4>{editingDoc ? 'Edit Document Expiry' : 'Add Document Expiry'}</h4>
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Candidate *</label>
                  <select
                    className="input"
                    value={formData.candidateId}
                    onChange={(e) => handleChange('candidateId', e.target.value)}
                    required
                  >
                    <option value="">Select Candidate</option>
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Document Type *</label>
                  <select
                    className="input"
                    value={formData.documentType}
                    onChange={(e) => handleChange('documentType', e.target.value)}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="passport">Passport</option>
                    <option value="visa">Visa</option>
                    <option value="aadhar">Aadhaar</option>
                    <option value="certification">Certification</option>
                    <option value="license">License</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Document Name *</label>
                  <Input
                    value={formData.documentName}
                    onChange={(e) => handleChange('documentName', e.target.value)}
                    placeholder="e.g., Passport, Work Visa, AWS Certification"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Document Number</label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => handleChange('documentNumber', e.target.value)}
                    placeholder="Document ID/Number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Issue Date</label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleChange('issueDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="input"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows="3"
                  placeholder="Additional notes about this document..."
                />
              </div>

              <div className="form-actions">
                <Button type="submit">
                  {editingDoc ? 'Update' : 'Add Tracking'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Expiry List */}
        <div className="expiry-list">
          {filteredExpiry.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>No document expiry records found. Add a document to start tracking.</p>
            </div>
          ) : (
            filteredExpiry.map(exp => {
              const candidate = candidates.find(c => c.id === parseInt(exp.candidateId));
              return (
                <Card key={exp.id} className={`expiry-card expiry-${exp.status}`}>
                  <div className="expiry-card-header">
                    <div>
                      <h4>{exp.documentName}</h4>
                      <p className="small">Candidate: <strong>{candidate?.name || 'Unknown'}</strong></p>
                    </div>
                    {getStatusBadge(exp.status, exp.daysUntilExpiry)}
                  </div>

                  <div className="expiry-card-body">
                    <div className="expiry-info-grid">
                      <div className="info-item">
                        <span className="info-label">Type:</span>
                        <span className="text-capitalize">{exp.documentType}</span>
                      </div>
                      {exp.documentNumber && (
                        <div className="info-item">
                          <span className="info-label">Number:</span>
                          <span>{exp.documentNumber}</span>
                        </div>
                      )}
                      {exp.issueDate && (
                        <div className="info-item">
                          <span className="info-label">Issue Date:</span>
                          <span>{new Date(exp.issueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="info-label">Expiry Date:</span>
                        <span className={exp.status === 'expired' ? 'text-danger' : ''}>
                          {new Date(exp.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      {exp.daysUntilExpiry !== null && (
                        <div className="info-item">
                          <span className="info-label">Days Until Expiry:</span>
                          <span className={exp.daysUntilExpiry < 0 ? 'text-danger' : exp.daysUntilExpiry <= 30 ? 'text-warning' : ''}>
                            {exp.daysUntilExpiry < 0 ? `Expired ${Math.abs(exp.daysUntilExpiry)} days ago` : `${exp.daysUntilExpiry} days`}
                          </span>
                        </div>
                      )}
                    </div>

                    {exp.notes && (
                      <div className="expiry-notes">
                        <strong>Notes:</strong> {exp.notes}
                      </div>
                    )}
                  </div>

                  <div className="expiry-card-actions">
                    {(exp.status === 'critical' || exp.status === 'warning' || exp.status === 'attention') && (
                      <Button
                        variant="secondary"
                        onClick={() => handleSendReminder(exp.id)}
                        disabled={exp.reminderSent}
                      >
                        {exp.reminderSent ? '✓ Reminder Sent' : 'Send Reminder'}
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(exp)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(exp.id)}
                      style={{ color: 'var(--error)' }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default DocumentExpiry;

