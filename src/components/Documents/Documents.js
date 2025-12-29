import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import Icon from '../UI/Icon';
import './Documents.css';

const Documents = () => {
  const { documents, addDocument, logAction } = useApp();
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
      'Secondary Education (10th)',
      'Higher Secondary / 12th',
      'Graduation Degree',
      'Post Graduation Degree (if applicable)'
    ],
    financial: [
      'Last three months pay slips',
      'Bank account statement - 6 months'
    ],
    resumes: [
      'ValueMomentum Format Resume',
      'Personal Resume'
    ],
    other: [
      'NDA / Contract',
      'Any other supporting documents'
    ]
  };

  const downloadResumeSample = () => {
    // Download the actual VAM format resume sample document
    const link = document.createElement('a');
    link.href = `${process.env.PUBLIC_URL || ''}/VAM_format_resume_sample.docx`;
    link.download = 'VAM_format_resume_sample.docx';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (logAction) {
      logAction('resume_sample_downloaded', { fileName: 'VAM_format_resume_sample.docx' });
    }
    
    showToast('ValueMomentum resume template downloaded. Please fill and upload.', 'success');
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
    { id: 'aadhar', name: 'Aadhaar / Passport', category: 'identity' },
    { id: 'visa', name: 'Visa Document', category: 'identity' },
    { id: 'photo', name: 'Passport Size Photo', category: 'identity' },
    { id: 'secondary', name: 'Secondary Education (10th)', category: 'education' },
    { id: 'higherSecondary', name: 'Higher Secondary / 12th', category: 'education' },
    { id: 'graduation', name: 'Graduation Degree', category: 'education' },
    { id: 'postGraduation', name: 'Post Graduation Degree (if applicable)', category: 'education' },
    { id: 'payslip', name: 'Last 3 Months Pay Slips', category: 'financial' },
    { id: 'pf', name: 'Bank account statement - 6 months', category: 'financial' },
    { id: 'resume1', name: 'ValueMomentum Format Resume', category: 'resumes' },
    { id: 'resume2', name: 'Personal Resume', category: 'resumes' },
    { id: 'nda', name: 'NDA / Contract', category: 'other' },
    { id: 'criminal', name: 'Criminal Verification Form', category: 'other' }
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
      if (logAction) {
        logAction('document_uploaded', { 
          documentType: docTypeInfo.name, 
          fileName: file.name, 
          fileSize: file.size,
          category: docTypeInfo.category
        });
      }
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

        {/* Document Categories */}
        <div className="document-categories-container">
          {/* Government ID Category */}
          <div className="document-category-section">
            <h4 className="category-title">Government ID Documents</h4>
            <p className="category-description">Upload government-issued identity verification documents</p>
            <div className="document-types-grid">
              {documentTypes.filter(dt => dt.category === 'identity').map(docType => {
                const uploadedDoc = getDocumentStatus(docType.id);
                return (
                  <Card 
                    key={docType.id} 
                    className={`document-type-card ${uploadedDoc ? 'uploaded' : ''}`}
                    onClick={() => {
                      if (!fileInputRefs.current[docType.id]) {
                        fileInputRefs.current[docType.id] = document.createElement('input');
                        fileInputRefs.current[docType.id].type = 'file';
                        fileInputRefs.current[docType.id].accept = '.pdf,.doc,.docx,.jpg,.png';
                        fileInputRefs.current[docType.id].onchange = (e) => handleDocumentUpload(docType.id, e);
                      }
                      fileInputRefs.current[docType.id].click();
                    }}
                  >
                    <h5>{docType.name}</h5>
                    {uploadedDoc ? (
                      <div className="document-status">
                        <span className="status-badge status-uploaded">Uploaded</span>
                        <div className="small" style={{ marginTop: '4px' }}>{uploadedDoc.file}</div>
                      </div>
                    ) : (
                      <div className="document-status">
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Education Category */}
          <div className="document-category-section">
            <h4 className="category-title">Education Documents</h4>
            <p className="category-description">Upload educational qualification certificates</p>
            <div className="document-types-grid">
              {documentTypes.filter(dt => dt.category === 'education').map(docType => {
                const uploadedDoc = getDocumentStatus(docType.id);
                return (
                  <Card 
                    key={docType.id} 
                    className={`document-type-card ${uploadedDoc ? 'uploaded' : ''}`}
                    onClick={() => {
                      if (!fileInputRefs.current[docType.id]) {
                        fileInputRefs.current[docType.id] = document.createElement('input');
                        fileInputRefs.current[docType.id].type = 'file';
                        fileInputRefs.current[docType.id].accept = '.pdf,.doc,.docx,.jpg,.png';
                        fileInputRefs.current[docType.id].onchange = (e) => handleDocumentUpload(docType.id, e);
                      }
                      fileInputRefs.current[docType.id].click();
                    }}
                  >
                    <h5>{docType.name}</h5>
                    {uploadedDoc ? (
                      <div className="document-status">
                        <span className="status-badge status-uploaded">Uploaded</span>
                        <div className="small" style={{ marginTop: '4px' }}>{uploadedDoc.file}</div>
                      </div>
                    ) : (
                      <div className="document-status">
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Financial Category */}
          <div className="document-category-section">
            <h4 className="category-title">Financial Documents</h4>
            <p className="category-description">Upload financial and employment-related documents</p>
            <div className="document-types-grid">
              {documentTypes.filter(dt => dt.category === 'financial').map(docType => {
                const uploadedDoc = getDocumentStatus(docType.id);
                return (
                  <Card 
                    key={docType.id} 
                    className={`document-type-card ${uploadedDoc ? 'uploaded' : ''}`}
                    onClick={() => {
                      if (!fileInputRefs.current[docType.id]) {
                        fileInputRefs.current[docType.id] = document.createElement('input');
                        fileInputRefs.current[docType.id].type = 'file';
                        fileInputRefs.current[docType.id].accept = '.pdf,.doc,.docx,.jpg,.png';
                        fileInputRefs.current[docType.id].onchange = (e) => handleDocumentUpload(docType.id, e);
                      }
                      fileInputRefs.current[docType.id].click();
                    }}
                  >
                    <h5>{docType.name}</h5>
                    {uploadedDoc ? (
                      <div className="document-status">
                        <span className="status-badge status-uploaded">Uploaded</span>
                        <div className="small" style={{ marginTop: '4px' }}>{uploadedDoc.file}</div>
                      </div>
                    ) : (
                      <div className="document-status">
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Resumes Category */}
          <div className="document-category-section">
            <h4 className="category-title">Resumes</h4>
            <p className="category-description">Upload resumes in ValueMomentum format</p>
            <div style={{ marginBottom: '16px' }}>
              <Button
                variant="secondary"
                onClick={downloadResumeSample}
                style={{ fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Icon name="download" size={16} />
                Download ValueMomentum Resume Sample Template
              </Button>
              <div className="small" style={{ marginTop: '8px', color: 'var(--muted)' }}>
                Download the resume template, fill it out, and upload it in the format below.
              </div>
            </div>
            <div className="document-types-grid">
              {documentTypes.filter(dt => dt.category === 'resumes').map(docType => {
                const uploadedDoc = getDocumentStatus(docType.id);
                return (
                  <Card 
                    key={docType.id} 
                    className={`document-type-card ${uploadedDoc ? 'uploaded' : ''}`}
                    onClick={() => {
                      if (!fileInputRefs.current[docType.id]) {
                        fileInputRefs.current[docType.id] = document.createElement('input');
                        fileInputRefs.current[docType.id].type = 'file';
                        fileInputRefs.current[docType.id].accept = '.pdf,.doc,.docx';
                        fileInputRefs.current[docType.id].onchange = (e) => handleDocumentUpload(docType.id, e);
                      }
                      fileInputRefs.current[docType.id].click();
                    }}
                  >
                    <h5>{docType.name}</h5>
                    {uploadedDoc ? (
                      <div className="document-status">
                        <span className="status-badge status-uploaded">Uploaded</span>
                        <div className="small" style={{ marginTop: '4px' }}>{uploadedDoc.file}</div>
                      </div>
                    ) : (
                      <div className="document-status">
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Other Category */}
          <div className="document-category-section">
            <h4 className="category-title">Other Documents</h4>
            <p className="category-description">Upload additional required documents</p>
            <div className="document-types-grid">
              {documentTypes.filter(dt => dt.category === 'other').map(docType => {
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
                    <h5>{docType.name}</h5>
                    {uploadedDoc ? (
                      <div className="document-status">
                        <span className="status-badge status-uploaded">Uploaded</span>
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
          </div>
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
            <option value="identity">Government ID</option>
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

