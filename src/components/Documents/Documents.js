import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import './Documents.css';

const Documents = () => {
  const { documents, addDocument } = useApp();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const fileInputRefs = useRef({});

  const documentCategories = {
    identity: [
      'Identity: Aadhaar / Passport',
      'Visa (if applicable)',
      'Recent passport-size photo'
    ],
    education: [
      'Highest degree certificate'
    ],
    financial: [
      'Last three months pay slips',
      'PF account statement (if available)'
    ],
    resumes: [
      'Resume Type 1 (ValueMomentum format)',
      'Resume Type 2 (ValueMomentum format)'
    ],
    other: [
      'NDA / Contract',
      'Any other supporting documents'
    ]
  };

  const downloadCriminalVerificationForm = () => {
    // Create a simple form template as PDF-like content
    const formContent = `
CRIMINAL VERIFICATION FORM
ValueMomentum Software Services Private Limited

================================================================================
PERSONAL INFORMATION
================================================================================

Full Name: _________________________________________________

Date of Birth: _____________________________________________

Address: __________________________________________________
         __________________________________________________
         __________________________________________________

Phone Number: ______________________________________________

Email: _____________________________________________________

================================================================================
CRIMINAL HISTORY DECLARATION
================================================================================

Have you ever been convicted of a criminal offense?  Yes [ ]  No [ ]

If Yes, please provide details:
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

Have you ever been charged with a criminal offense?  Yes [ ]  No [ ]

If Yes, please provide details:
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

Are there any pending criminal cases against you?  Yes [ ]  No [ ]

If Yes, please provide details:
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

================================================================================
DECLARATION
================================================================================

I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that any false information may result in termination of my employment.

Signature: _________________________________________________

Date: ______________________________________________________

Witness Name: ______________________________________________

Witness Signature: __________________________________________

Date: ______________________________________________________
`;

    // Create a blob with the form content
    const blob = new Blob([formContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Criminal_Verification_Form.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Criminal Verification form downloaded. Please fill and upload.', 'success');
  };


  const documentTypes = [
    { id: 'aadhar', name: 'Aadhaar / Passport', category: 'identity', icon: '🆔' },
    { id: 'visa', name: 'Visa Document', category: 'identity', icon: '✈️' },
    { id: 'photo', name: 'Passport Size Photo', category: 'identity', icon: '📷' },
    { id: 'degree', name: 'Highest Degree Certificate', category: 'education', icon: '🎓' },
    { id: 'payslip', name: 'Last 3 Months Pay Slips', category: 'financial', icon: '💰' },
    { id: 'pf', name: 'PF Account Statement', category: 'financial', icon: '📊' },
    { id: 'resume1', name: 'Resume Type 1 (ValueMomentum)', category: 'resumes', icon: '📄' },
    { id: 'resume2', name: 'Resume Type 2 (ValueMomentum)', category: 'resumes', icon: '📄' },
    { id: 'nda', name: 'NDA / Contract', category: 'other', icon: '📋' },
    { id: 'criminal', name: 'Criminal Verification Form', category: 'other', icon: '🔒' }
  ];

  const handleDocumentUpload = (docType, e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/png', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        showToast('Please upload valid file format', 'error');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size should be less than 10MB', 'error');
        return;
      }

      const docTypeInfo = documentTypes.find(dt => dt.id === docType);
      const newDoc = {
        id: Date.now(),
        title: docTypeInfo.name,
        category: docTypeInfo.category,
        status: 'uploaded',
        file: file.name,
        uploadedAt: new Date().toISOString(),
        docType: docType
      };
      
      addDocument(newDoc);
      showToast(`${docTypeInfo.name} uploaded successfully`, 'success');
      e.target.value = '';
      setUploadingDoc(null);
    }
  };

  const getDocumentStatus = (docType) => {
    return documents.find(doc => doc.docType === docType);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    const matchesCategory = !categoryFilter || doc.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="documents">
      <div className="back-button-container">
        <button className="back-button" onClick={() => window.location.hash = '#dashboard'}>
          ← Back
        </button>
      </div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Documents' }]} />
      <Card>
        <h3>Document Upload Center</h3>
        <p className="small">Upload the required documents. AI will validate and provide feedback.</p>

        <div className="document-types-grid">
          {documentTypes.map(docType => {
            const uploadedDoc = getDocumentStatus(docType.id);
            return (
              <Card 
                key={docType.id} 
                className={`document-type-card ${uploadedDoc ? 'uploaded' : ''}`}
                onClick={() => {
                  if (!fileInputRefs.current[docType.id]) {
                    fileInputRefs.current[docType.id] = document.createElement('input');
                    fileInputRefs.current[docType.id].type = 'file';
                    fileInputRefs.current[docType.id].accept = docType.id === 'criminal' ? '.pdf,.doc,.docx,.txt' : '.pdf,.doc,.docx,.jpg,.png';
                    fileInputRefs.current[docType.id].onchange = (e) => handleDocumentUpload(docType.id, e);
                  }
                  fileInputRefs.current[docType.id].click();
                }}
              >
                <div className="document-type-icon">{docType.icon}</div>
                <h4>{docType.name}</h4>
                {uploadedDoc ? (
                  <div className="document-status">
                    <span className="status-badge status-uploaded">✓ Uploaded</span>
                    <div className="small" style={{ marginTop: '4px' }}>{uploadedDoc.file}</div>
                  </div>
                ) : (
                  <div className="document-status">
                    <span className="status-badge status-pending">Pending</span>
                  </div>
                )}
                {docType.id === 'criminal' && (
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadCriminalVerificationForm();
                    }}
                    style={{ marginTop: '8px', fontSize: '12px' }}
                  >
                    Download Form
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

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
            <option value="resumes">Resumes</option>
            <option value="other">Other</option>
          </select>
        </div>

        {filteredDocuments.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ marginBottom: '16px' }}>Uploaded Documents</h4>
            <div className="doc-grid">
              {filteredDocuments.map(doc => (
                <Card key={doc.id} className="doc-card">
                  <div className="doc-meta">
                    <strong>{doc.title}</strong>
                    <div className="small">{doc.status.toUpperCase()}</div>
                  </div>
                  <div className="small" style={{ marginTop: '8px' }}>
                    <span className={`status-dot status-${doc.status}`}></span> {doc.status}
                  </div>
                  {doc.file && (
                    <div className="small" style={{ marginTop: '4px', color: 'var(--muted)' }}>
                      {doc.file}
                    </div>
                  )}
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {doc.file && <Button variant="secondary" style={{ fontSize: '12px' }}>View</Button>}
                    <Button 
                      style={{ fontSize: '12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (fileInputRefs.current[doc.docType]) {
                          fileInputRefs.current[doc.docType].click();
                        }
                      }}
                    >
                      {doc.file ? 'Re-upload' : 'Upload'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Documents;

