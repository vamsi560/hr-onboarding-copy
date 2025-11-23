import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import './Documents.css';

const Documents = () => {
  const { documents, addDocument } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const documentCategories = {
    identity: ['Passport / ID Proof', 'Address Proof', 'Photo'],
    education: ['Education Certificate', 'Degree Certificate'],
    financial: ['Bank Proof', 'Tax Document', 'Salary Slip'],
    other: ['NDA', 'Contract', 'Other Documents']
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    const matchesCategory = !categoryFilter || doc.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="documents">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Documents' }]} />
      <Card>
        <h3>Document Upload Center</h3>
        <p className="small">Upload the required documents. AI will validate and provide feedback.</p>

        <div className="search-filter">
          <input
            type="text"
            className="search-box"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="uploaded">Uploaded</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="identity">Identity</option>
            <option value="education">Education</option>
            <option value="financial">Financial</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="upload-area">
          <div>Drag & drop files here or click to browse</div>
          <div className="small" style={{ marginTop: '8px' }}>
            Accepted formats: PDF, JPG, PNG — Max 10MB per file
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">DOC</div>
            <div>No documents yet. Upload your first document to get started.</div>
          </div>
        ) : (
          <div className="doc-grid">
            {filteredDocuments.map(doc => (
              <Card key={doc.id} className="doc-card">
                <div className="doc-meta">
                  <strong>{doc.title}</strong>
                  <div className="small">{doc.status.toUpperCase()}</div>
                </div>
                <div className="small">
                  Status: <span className={`status-dot status-${doc.status}`}></span> {doc.status}
                </div>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  {doc.file && <Button variant="secondary">View</Button>}
                  <Button>{doc.file ? 'Re-upload' : 'Upload'}</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Documents;

