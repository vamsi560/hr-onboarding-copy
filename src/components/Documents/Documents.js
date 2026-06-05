import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import './Documents.css';

const DocumentCategorySection = ({ title, description, categoryName, documentTypes, getDocumentStatus, handleDocumentUpload, fileInputRefs, downloadCriminalVerificationForm }) => {
  return (
    <div className="document-category-section">
      <h4 className="category-title">{title}</h4>
      <p className="category-description">{description}</p>
      <div className="document-types-grid">
        {documentTypes.filter(dt => dt.category === categoryName).map(docType => {
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
  );
};

const CompanyDocumentsSection = ({ title, description, getDocumentStatus, handleDocumentUpload, fileInputRefs, triggerDownload }) => {
  const companyDocs = [
    {
      id: 'code_of_conduct',
      name: 'Code of Conduct',
      file: process.env.PUBLIC_URL + '/documents/Code of Conduct_Global_V1.0_New (1).pdf',
      uploadAccept: '.pdf',
    },
    {
      id: 'onboarding_doc',
      name: 'Full Time Employee Consolidated Onboarding Document',
      file: process.env.PUBLIC_URL + '/documents/Full Time Employee_Consolidated Onboarding document (1).pdf',
      uploadAccept: '.pdf',
    },
    {
      id: 'nominee_ff',
      name: 'Nominee Declaration form (F&F)',
      file: process.env.PUBLIC_URL + '/documents/Nominee Declaration form_F&F.pdf',
      uploadAccept: '.pdf',
    },
    {
      id: 'nominee_insurance',
      name: 'Nominee Declaration form (Insurance)',
      file: process.env.PUBLIC_URL + '/documents/Nominee Declaration form_Insurance.pdf',
      uploadAccept: '.pdf',
    },
    {
      id: 'pf_nominee',
      name: 'PF Nominee Declaration',
      file: process.env.PUBLIC_URL + '/documents/PF nominee declaration.pdf',
      uploadAccept: '.pdf',
    },
  ];

  return (
    <div className="document-category-section">
      <h4 className="category-title">{title}</h4>
      <p className="category-description">{description}</p>
      <div className="document-types-grid">
        {companyDocs.map(docType => {
          const uploadedDoc = getDocumentStatus(docType.id);
          return (
            <Card
              key={docType.id}
              className={`document-type-card ${uploadedDoc ? 'uploaded' : ''}`}
            >
              <h5>{docType.name}</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                  variant="secondary"
                  onClick={e => {
                    e.stopPropagation();
                    triggerDownload(docType.file, `${docType.name}.pdf`);
                  }}
                  style={{ fontSize: '12px' }}
                >
                  Download
                </Button>
                <Button
                  variant="primary"
                  style={{ fontSize: '12px' }}
                  onClick={() => {
                    if (!fileInputRefs.current[docType.id]) {
                      fileInputRefs.current[docType.id] = document.createElement('input');
                      fileInputRefs.current[docType.id].type = 'file';
                      fileInputRefs.current[docType.id].accept = docType.uploadAccept;
                      fileInputRefs.current[docType.id].onchange = (e) => handleDocumentUpload(docType.id, e);
                    }
                    fileInputRefs.current[docType.id].click();
                  }}
                >
                  {uploadedDoc ? 'Re-upload' : 'Upload'}
                </Button>
                {uploadedDoc && (
                  <div className="document-status">
                    <span className="status-badge status-uploaded">Uploaded</span>
                    <div className="small" style={{ marginTop: '4px' }}>{uploadedDoc.file}</div>
                  </div>
                )}
                {!uploadedDoc && (
                  <div className="document-status">
                    <span className="status-badge status-pending">Pending</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const Documents = () => {
  const { documents, addDocument, updateDocument, logAction, setValidationHistory, organization, userInfo } = useApp();
  const { showToast } = useToast();
  
  const getOrganizationName = () => {
    return organization === 'owlsure' ? 'OwlSure' : 'ValueMomentum';
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const fileInputRefs = useRef({});

  const triggerDownload = (href, filename) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCriminalVerificationForm = () => {
    // Create a simple form template as PDF-like content
    const formContent = `
CRIMINAL VERIFICATION FORM
${getOrganizationName()} Software Services Private Limited

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
    { id: 'aadhar', name: 'Aadhaar Card', category: 'identity' },
    { id: 'passport', name: 'Passport', category: 'identity' },
    { id: 'visa', name: 'Visa Document', category: 'identity' },
    { id: 'pan', name: 'PAN Card', category: 'identity' },
    { id: 'photo', name: 'Passport Size Photo', category: 'identity' },
    { id: 'secondary', name: 'Secondary Education (10th)', category: 'education' },
    { id: 'higherSecondary', name: 'Higher Secondary / 12th', category: 'education' },
    { id: 'graduation', name: 'Graduation Degree', category: 'education' },
    { id: 'postGraduation', name: 'Post Graduation Degree (if applicable)', category: 'education' },
    { id: 'payslip', name: 'Last 3 Months Pay Slips', category: 'financial' },
    { id: 'pf', name: 'Bank account statement - 6 months', category: 'financial' },
    { id: 'form12b', name: 'Form 12b', category: 'financial' },
    { id: 'expLetter1', name: 'Experience Letter from Previous Company 1', category: 'experience' },
    { id: 'expLetter2', name: 'Experience Letter from Previous Company 2', category: 'experience' },
    { id: 'relievingLetter', name: 'Relieving Letter from Previous Company', category: 'experience' },
    { id: 'salaryCert', name: 'Salary Certificate from Previous Company', category: 'experience' },
    { id: 'nda', name: 'NDA / Contract', category: 'other' },
    { id: 'criminal', name: 'Criminal Verification Form', category: 'other' },
    { id: 'code_of_conduct', name: 'Code of Conduct', category: 'company' },
    { id: 'onboarding_doc', name: 'Full Time Employee Consolidated Onboarding Document', category: 'company' },
    { id: 'nominee_ff', name: 'Nominee Declaration form (F&F)', category: 'company' },
    { id: 'nominee_insurance', name: 'Nominee Declaration form (Insurance)', category: 'company' },
    { id: 'pf_nominee', name: 'PF Nominee Declaration', category: 'company' },
  ];

  const handleDocumentUpload = async (docType, e) => {
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
      const email = userInfo ? userInfo.email : 'john.doe@gmail.com';
      const newDoc = {
        id: `doc_${Date.now()}`,
        title: docTypeInfo.name,
        category: docTypeInfo.category,
        status: 'uploaded',
        file: file.name,
        uploadedAt: new Date().toISOString(),
        docType: docType
      };
      
      addDocument(newDoc);
      showToast(`${docTypeInfo.name} uploaded successfully`, 'success');
      
      // Trigger AI validation on backend
      showToast('Starting AI validation on backend...', 'info');
      
      try {
        const validationResult = await api.uploadDocument(email, file, docType);
        
        // Add to validation history
        setValidationHistory(prev => [validationResult, ...prev]);
        
        // Update document with validation status
        const updatedStatus = validationResult.status === 'valid' ? 'validated' : 
                             validationResult.status === 'warning' ? 'warning' : 
                             validationResult.status === 'invalid' ? 'invalid' : 'uploaded';
        
        updateDocument(newDoc.id, { 
          status: updatedStatus,
          checks: validationResult.checks,
          extractedData: validationResult.extractedData
        });
        
        // Show validation result toast
        if (validationResult.status === 'valid') {
          showToast(`✅ ${docTypeInfo.name} validated successfully (${validationResult.overallConfidence}% confidence)`, 'success');
        } else if (validationResult.status === 'warning') {
          showToast(`⚠️ ${docTypeInfo.name} has warnings. Please review validation results.`, 'warning');
        } else {
          showToast(`❌ ${docTypeInfo.name} validation failed. Please check the issues.`, 'error');
        }
        
      } catch {
        showToast('Validation failed. Please try again.', 'error');
      }
      
      if (logAction) {
        logAction('document_uploaded', { 
          documentType: docTypeInfo.name, 
          fileName: file.name, 
          fileSize: file.size,
          category: docTypeInfo.category
        });
      }
      e.target.value = '';
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
          <DocumentCategorySection
            title="Government ID Documents"
            description="Upload government-issued identity verification documents"
            categoryName="identity"
            documentTypes={documentTypes}
            getDocumentStatus={getDocumentStatus}
            handleDocumentUpload={handleDocumentUpload}
            fileInputRefs={fileInputRefs}
            downloadCriminalVerificationForm={downloadCriminalVerificationForm}
          />

          <DocumentCategorySection
            title="Education Documents"
            description="Upload educational qualification certificates"
            categoryName="education"
            documentTypes={documentTypes}
            getDocumentStatus={getDocumentStatus}
            handleDocumentUpload={handleDocumentUpload}
            fileInputRefs={fileInputRefs}
            downloadCriminalVerificationForm={downloadCriminalVerificationForm}
          />

          <DocumentCategorySection
            title="Financial Documents"
            description="Upload financial and employment-related documents"
            categoryName="financial"
            documentTypes={documentTypes}
            getDocumentStatus={getDocumentStatus}
            handleDocumentUpload={handleDocumentUpload}
            fileInputRefs={fileInputRefs}
            downloadCriminalVerificationForm={downloadCriminalVerificationForm}
          />

          <DocumentCategorySection
            title="Experience Documents"
            description="Upload experience-related documents from your previous companies"
            categoryName="experience"
            documentTypes={documentTypes}
            getDocumentStatus={getDocumentStatus}
            handleDocumentUpload={handleDocumentUpload}
            fileInputRefs={fileInputRefs}
            downloadCriminalVerificationForm={downloadCriminalVerificationForm}
          />

          <DocumentCategorySection
            title="Other Documents"
            description="Upload additional required documents"
            categoryName="other"
            documentTypes={documentTypes}
            getDocumentStatus={getDocumentStatus}
            handleDocumentUpload={handleDocumentUpload}
            fileInputRefs={fileInputRefs}
            downloadCriminalVerificationForm={downloadCriminalVerificationForm}
          />

          <CompanyDocumentsSection
            title="Company Forms/Policies"
            description="Download, fill, and upload required company forms and policies"
            getDocumentStatus={getDocumentStatus}
            handleDocumentUpload={handleDocumentUpload}
            fileInputRefs={fileInputRefs}
            triggerDownload={triggerDownload}
          />
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
            <option value="experience">Experience Documents</option>
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

