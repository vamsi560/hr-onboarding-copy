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
  const resumeType1InputRef = useRef(null);
  const resumeType2InputRef = useRef(null);
  const criminalFormInputRef = useRef(null);

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

  const handleResumeUpload = (e, resumeType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!validTypes.includes(file.type)) {
        showToast('Please upload PDF or DOCX format only', 'error');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size should be less than 10MB', 'error');
        return;
      }

      const newDoc = {
        id: Date.now(),
        title: `Resume Type ${resumeType} (ValueMomentum Format)`,
        category: 'resumes',
        status: 'uploaded',
        file: file.name,
        uploadedAt: new Date().toISOString()
      };
      
      addDocument(newDoc);
      showToast(`Resume Type ${resumeType} uploaded successfully`, 'success');
      e.target.value = ''; // Reset input
    }
  };

  const handleCriminalFormUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        showToast('Please upload PDF, DOCX, or TXT format only', 'error');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size should be less than 10MB', 'error');
        return;
      }

      const newDoc = {
        id: Date.now(),
        title: 'Criminal Verification Form',
        category: 'other',
        status: 'uploaded',
        file: file.name,
        uploadedAt: new Date().toISOString()
      };
      
      addDocument(newDoc);
      showToast('Criminal Verification form uploaded successfully', 'success');
      e.target.value = ''; // Reset input
    }
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

        <div className="document-category-grid">
          <Card className="document-category-card identity">
            <h4>Identity</h4>
            <ul>
              <li>Aadhaar / Passport</li>
              <li>Visa (if applicable)</li>
              <li>Recent passport-size photo</li>
            </ul>
          </Card>
          <Card className="document-category-card education">
            <h4>Education</h4>
            <ul>
              <li>Highest degree certificate</li>
            </ul>
          </Card>
          <Card className="document-category-card financial">
            <h4>Financial</h4>
            <ul>
              <li>Last three months pay slips</li>
              <li>PF account statement (if available)</li>
            </ul>
          </Card>
          <Card className="document-category-card resumes">
            <h4>Resumes</h4>
            <ul>
              <li>Resume Type 1 (ValueMomentum format)</li>
              <li>Resume Type 2 (ValueMomentum format)</li>
            </ul>
              <div className="resume-upload-section">
              <div className="resume-upload-buttons">
                <input
                  ref={resumeType1InputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleResumeUpload(e, 1)}
                />
                <Button 
                  variant="secondary" 
                  onClick={() => resumeType1InputRef.current?.click()}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Upload Type 1
                </Button>
                <input
                  ref={resumeType2InputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleResumeUpload(e, 2)}
                />
                <Button 
                  variant="secondary" 
                  onClick={() => resumeType2InputRef.current?.click()}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Upload Type 2
                </Button>
              </div>
              <p className="small" style={{ marginTop: '8px', color: 'var(--muted)', fontSize: '11px' }}>
                Both resumes must be in ValueMomentum format
              </p>
            </div>
          </Card>
          <Card className="document-category-card other">
            <h4>Others</h4>
            <ul>
              <li>NDA / Contract</li>
              <li>Any other supporting documents</li>
            </ul>
          </Card>
        </div>

        {/* Criminal Verification Form Section */}
        <Card className="criminal-verification-card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Criminal Verification Form</h4>
              <p className="small" style={{ margin: '0 0 12px 0', color: 'var(--muted)' }}>
                Download the form, fill it out, and upload the completed form here.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button onClick={downloadCriminalVerificationForm}>
                  Download Form
                </Button>
                <input
                  ref={criminalFormInputRef}
                  type="file"
                  id="criminal-form"
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={handleCriminalFormUpload}
                />
                <Button 
                  variant="secondary"
                  onClick={() => criminalFormInputRef.current?.click()}
                >
                  Upload Filled Form
                </Button>
              </div>
            </div>
          </div>
        </Card>

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

        <div className="upload-area">
          <div>Drag & drop files here or click to browse</div>
          <div className="small" style={{ marginTop: '8px' }}>
            Accepted formats: PDF, DOCX, XLSX, JPG, PNG — Max 10MB per file
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

