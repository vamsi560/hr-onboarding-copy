import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Breadcrumbs from '../UI/Breadcrumbs';
import './ReferenceCheck.css';

const ReferenceCheck = () => {
  const { candidates, referenceChecks, setReferenceChecks, logAction } = useApp();
  const { showToast } = useToast();
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRef, setEditingRef] = useState(null);

  const [formData, setFormData] = useState({
    candidateId: '',
    referenceName: '',
    referenceEmail: '',
    referencePhone: '',
    referenceCompany: '',
    referencePosition: '',
    relationship: '',
    requestDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newReference = {
      id: editingRef ? editingRef.id : Date.now(),
      candidateId: formData.candidateId,
      candidateName: candidates.find(c => c.id === parseInt(formData.candidateId))?.name || 'Unknown',
      referenceName: formData.referenceName,
      referenceEmail: formData.referenceEmail,
      referencePhone: formData.referencePhone,
      referenceCompany: formData.referenceCompany,
      referencePosition: formData.referencePosition,
      relationship: formData.relationship,
      requestDate: formData.requestDate,
      responseDate: editingRef?.responseDate || null,
      status: formData.status,
      rating: editingRef?.rating || null,
      feedback: editingRef?.feedback || '',
      sentDate: editingRef?.sentDate || new Date().toISOString(),
      createdAt: editingRef?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingRef) {
      setReferenceChecks(prev => prev.map(ref => ref.id === editingRef.id ? newReference : ref));
      showToast('Reference check updated successfully', 'success');
    } else {
      setReferenceChecks(prev => [...prev, newReference]);
      showToast('Reference check request created and email sent', 'success');
    }

    if (logAction) {
      logAction('reference_check_' + (editingRef ? 'updated' : 'created'), {
        candidateId: formData.candidateId,
        referenceName: formData.referenceName
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      candidateId: '',
      referenceName: '',
      referenceEmail: '',
      referencePhone: '',
      referenceCompany: '',
      referencePosition: '',
      relationship: '',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
    setShowAddForm(false);
    setEditingRef(null);
  };

  const handleEdit = (ref) => {
    setEditingRef(ref);
    setFormData({
      candidateId: ref.candidateId.toString(),
      referenceName: ref.referenceName,
      referenceEmail: ref.referenceEmail,
      referencePhone: ref.referencePhone,
      referenceCompany: ref.referenceCompany,
      referencePosition: ref.referencePosition,
      relationship: ref.relationship,
      requestDate: ref.requestDate,
      status: ref.status
    });
    setShowAddForm(true);
  };

  const handleUpdateResponse = (refId, rating, feedback) => {
    const updated = referenceChecks.map(ref => {
      if (ref.id === refId) {
        return {
          ...ref,
          status: 'completed',
          responseDate: new Date().toISOString(),
          rating: rating,
          feedback: feedback,
          updatedAt: new Date().toISOString()
        };
      }
      return ref;
    });
    setReferenceChecks(updated);
    showToast('Reference check response recorded', 'success');
    if (logAction) {
      logAction('reference_check_response', { refId, rating });
    }
  };

  const handleResendRequest = (refId) => {
    showToast('Reference check request email resent', 'success');
    if (logAction) {
      logAction('reference_check_resent', { refId });
    }
  };

  // MOCK DATA for reference checks
  const mockReferences = [
    {
      id: 1,
      candidateId: 101,
      candidateName: 'Shashank Tudum',
      referenceName: 'Ravi Kumar',
      referenceEmail: 'ravi.kumar@abc.com',
      referencePhone: '+91 9876543210',
      referenceCompany: 'ABC Technologies',
      referencePosition: 'Manager',
      relationship: 'manager',
      requestDate: '2024-12-01',
      responseDate: '2024-12-05',
      status: 'completed',
      rating: 5,
      feedback: 'Excellent team player and quick learner.',
      sentDate: '2024-12-01',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-05'
    },
    {
      id: 2,
      candidateId: 102,
      candidateName: 'Priya Sharma',
      referenceName: 'Anil Mehta',
      referenceEmail: 'anil.mehta@xyz.com',
      referencePhone: '+91 9123456780',
      referenceCompany: 'XYZ Solutions',
      referencePosition: 'Colleague',
      relationship: 'colleague',
      requestDate: '2024-12-10',
      responseDate: null,
      status: 'pending',
      rating: null,
      feedback: '',
      sentDate: '2024-12-10',
      createdAt: '2024-12-10',
      updatedAt: '2024-12-10'
    }
  ];

  const referenceChecksWithMock = (referenceChecks && referenceChecks.length > 0) ? referenceChecks : mockReferences;

  const filteredReferences = (referenceChecksWithMock || []).filter(ref => {
    const candidate = candidates.find(c => c.id === parseInt(ref.candidateId));
    const matchesSearch = !searchTerm || 
      ref.referenceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || ref.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', class: 'status-pending' },
      sent: { label: 'Sent', class: 'status-sent' },
      responded: { label: 'Responded', class: 'status-responded' },
      completed: { label: 'Completed', class: 'status-completed' },
      expired: { label: 'Expired', class: 'status-expired' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const getRatingStars = (rating) => {
    if (!rating) return 'N/A';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="reference-check">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Reference Checks' }]} />
      <Card>
        <div className="reference-header">
          <div>
            <h3>Reference Check Management</h3>
            <p className="small">Manage reference checks for candidates</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            + Add Reference Check
          </Button>
        </div>

        {/* Filters */}
        <div className="reference-filters">
          <Input
            type="text"
            placeholder="Search by candidate or reference name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="responded">Responded</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="reference-form-card">
            <div className="form-header">
              <h4>{editingRef ? 'Edit Reference Check' : 'Add Reference Check'}</h4>
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
                  <label>Status *</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="responded">Responded</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Reference Name *</label>
                  <Input
                    value={formData.referenceName}
                    onChange={(e) => handleChange('referenceName', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reference Email *</label>
                  <Input
                    type="email"
                    value={formData.referenceEmail}
                    onChange={(e) => handleChange('referenceEmail', e.target.value)}
                    placeholder="john@company.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Reference Phone</label>
                  <Input
                    type="tel"
                    value={formData.referencePhone}
                    onChange={(e) => handleChange('referencePhone', e.target.value)}
                    placeholder="+1 555 555 5555"
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <Input
                    value={formData.referenceCompany}
                    onChange={(e) => handleChange('referenceCompany', e.target.value)}
                    placeholder="Previous Company"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <Input
                    value={formData.referencePosition}
                    onChange={(e) => handleChange('referencePosition', e.target.value)}
                    placeholder="Manager, Director, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Relationship *</label>
                  <select
                    className="input"
                    value={formData.relationship}
                    onChange={(e) => handleChange('relationship', e.target.value)}
                    required
                  >
                    <option value="">Select Relationship</option>
                    <option value="manager">Previous Manager</option>
                    <option value="colleague">Colleague</option>
                    <option value="client">Client</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Request Date *</label>
                <Input
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => handleChange('requestDate', e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <Button type="submit">
                  {editingRef ? 'Update' : 'Create & Send Request'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Reference Checks List */}
        <div className="reference-list">
          {filteredReferences.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No reference checks found. Add a reference check to get started.</p>
            </div>
          ) : (
            filteredReferences.map(ref => {
              const candidate = candidates.find(c => c.id === parseInt(ref.candidateId));
              return (
                <Card key={ref.id} className="reference-card">
                  <div className="reference-card-header">
                    <div>
                      <h4>{ref.referenceName}</h4>
                      <p className="small">Reference for: <strong>{candidate?.name || 'Unknown'}</strong></p>
                    </div>
                    {getStatusBadge(ref.status)}
                  </div>

                  <div className="reference-card-body">
                    <div className="reference-info-grid">
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span>{ref.referenceEmail}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Phone:</span>
                        <span>{ref.referencePhone || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Company:</span>
                        <span>{ref.referenceCompany || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Position:</span>
                        <span>{ref.referencePosition || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Relationship:</span>
                        <span>{ref.relationship}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Request Date:</span>
                        <span>{new Date(ref.requestDate).toLocaleDateString()}</span>
                      </div>
                      {ref.responseDate && (
                        <div className="info-item">
                          <span className="info-label">Response Date:</span>
                          <span>{new Date(ref.responseDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {ref.rating && (
                        <div className="info-item">
                          <span className="info-label">Rating:</span>
                          <span className="rating-display">{getRatingStars(ref.rating)}</span>
                        </div>
                      )}
                    </div>

                    {ref.feedback && (
                      <div className="reference-feedback">
                        <strong>Feedback:</strong>
                        <p>{ref.feedback}</p>
                      </div>
                    )}

                    {ref.status === 'completed' && !ref.rating && (
                      <Card className="response-form-card">
                        <h5>Record Response</h5>
                        <ResponseForm
                          refId={ref.id}
                          onUpdate={handleUpdateResponse}
                        />
                      </Card>
                    )}
                  </div>

                  <div className="reference-card-actions">
                    {ref.status !== 'completed' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleResendRequest(ref.id)}
                        >
                          Resend Request
                        </Button>
                        {ref.status === 'responded' && (
                          <Button
                            onClick={() => {
                              const rating = prompt('Enter rating (1-5):');
                              const feedback = prompt('Enter feedback:');
                              if (rating && feedback) {
                                handleUpdateResponse(ref.id, parseInt(rating), feedback);
                              }
                            }}
                          >
                            Record Response
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(ref)}
                    >
                      Edit
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

// Response Form Component
const ResponseForm = ({ refId, onUpdate }) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(refId, rating, feedback);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Rating (1-5) *</label>
        <select
          className="input"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          required
        >
          {[1, 2, 3, 4, 5].map(r => (
            <option key={r} value={r}>{r} {r === 1 ? 'Star' : 'Stars'}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Feedback *</label>
        <textarea
          className="input"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows="4"
          placeholder="Enter reference feedback..."
          required
        />
      </div>
      <Button type="submit">Save Response</Button>
    </form>
  );
};

export default ReferenceCheck;

