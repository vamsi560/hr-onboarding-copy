import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Breadcrumbs from '../UI/Breadcrumbs';
import Icon from '../UI/Icon';
import ContextualHelp from '../UI/ContextualHelp';
import DigitalSignature from '../UI/DigitalSignature';
import './OnboardingForm.css';

const OnboardingForm = () => {
  const { formData, updateFormData, logAction } = useApp();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState(formData);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [showLinkedInConsent, setShowLinkedInConsent] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setFormValues(formData);
  }, [formData]);

  const validateField = (field, value) => {
    const errors = {};
    
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field] = 'Please enter a valid email address';
        }
        break;
      case 'mobile':
        if (value && !/^[\d\s+\-()]+$/.test(value)) {
          errors[field] = 'Please enter a valid phone number';
        }
        break;
      case 'linkedinUrl':
        if (value && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(value)) {
          errors[field] = 'Please enter a valid LinkedIn profile URL';
        }
        break;
      case 'firstName':
      case 'lastName':
        if (!value || value.trim().length < 2) {
          errors[field] = 'This field must be at least 2 characters';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const handleChange = (field, value) => {
    const newValues = { ...formValues, [field]: value };
    setFormValues(newValues);
    
    // Show LinkedIn consent popup when valid LinkedIn URL is entered
    if (field === 'linkedinUrl' && value && /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(value) && !formValues.linkedinAutofilled) {
      setShowLinkedInConsent(true);
    }
    
    // Real-time validation
    if (touchedFields[field]) {
      const errors = validateField(field, value);
      setFieldErrors(prev => ({ ...prev, ...errors }));
      if (errors[field]) {
        delete fieldErrors[field];
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
    
    // Debounced auto-save
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      try {
        updateFormData(newValues);
        setSaveStatus('saved');
        if (logAction) {
          logAction('form_field_updated', { field, value: value?.substring(0, 50) });
        }
      } catch (error) {
        setSaveStatus('error');
      }
    }, 1000); // Save after 1 second of inactivity
  };

  const handleBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const errors = validateField(field, formValues[field]);
    setFieldErrors(prev => ({ ...prev, ...errors }));
  };

  const handleCertificationChange = (index, field, value) => {
    const currentCerts = formValues.certifications || [];
    const updatedCerts = [...currentCerts];
    updatedCerts[index] = { ...updatedCerts[index], [field]: value };
    handleChange('certifications', updatedCerts);
  };

  const addCertification = () => {
    const currentCerts = formValues.certifications || [];
    handleChange('certifications', [...currentCerts, { name: '', number: '', document: '' }]);
  };

  const handleProfessionalDetailChange = (index, field, value) => {
    const currentDetails = formValues.professionalDetails || [];
    const updatedDetails = [...currentDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    handleChange('professionalDetails', updatedDetails);
  };

  const addProfessionalDetail = () => {
    const currentDetails = formValues.professionalDetails || [];
    handleChange('professionalDetails', [...currentDetails, { 
      company: '', 
      position: '', 
      startDate: '', 
      endDate: '', 
      responsibilities: '',
      achievements: ''
    }]);
  };

  const handleSkillChange = (skillName, rating) => {
    const currentSkills = formValues.skillsWithRating || [];
    const existingIndex = currentSkills.findIndex(s => s.name === skillName);
    let updatedSkills;
    
    if (existingIndex >= 0) {
      updatedSkills = [...currentSkills];
      updatedSkills[existingIndex] = { name: skillName, rating };
    } else {
      updatedSkills = [...currentSkills, { name: skillName, rating }];
    }
    
    handleChange('skillsWithRating', updatedSkills);
  };

  const addSkill = () => {
    setShowSkillInput(true);
  };

  const handleAddSkill = () => {
    if (newSkillName && newSkillName.trim()) {
      handleSkillChange(newSkillName.trim(), 0);
      setNewSkillName('');
      setShowSkillInput(false);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleAutofill = async (source) => {
    showToast(`Autofilling data from ${source}...`, 'info');
    // Simulate autofill - in real implementation, this would parse resume or LinkedIn
    setTimeout(() => {
      const autofilledData = {
        firstName: formValues.firstName || (source === 'LinkedIn' ? 'Jane' : 'John'),
        lastName: formValues.lastName || (source === 'LinkedIn' ? 'Smith' : 'Doe'),
        email: formValues.email || (source === 'LinkedIn' ? 'jane.smith@example.com' : 'john.doe@example.com'),
        mobile: formValues.mobile || '+91 9876543210',
        address: formValues.address || '123 Main Street, Hyderabad, Telangana, India',
        designation: formValues.designation || (source === 'LinkedIn' ? 'Senior Software Engineer' : 'Software Engineer')
      };
      setFormValues(prev => ({ ...prev, ...autofilledData }));
      handleChange('autofilled', true);
      if (source === 'LinkedIn') {
        handleChange('linkedinAutofilled', true);
      }
      showToast(`Data autofilled from ${source}. Please review and update as needed.`, 'success');
    }, 1500);
  };

  const handleLinkedInConsent = (consent) => {
    setShowLinkedInConsent(false);
    if (consent) {
      handleAutofill('LinkedIn');
    }
  };

  const validateStep = (step) => {
    const step1Fields = ['firstName', 'lastName', 'email', 'mobile'];
    if (step === 1) {
      const missing = step1Fields.filter(f => !formValues[f]);
      if (missing.length > 0) {
        showToast('Please fill all required fields', 'error');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      showToast('Form submitted successfully!', 'success');
    }
  };

  return (
    <div className="onboarding-form">
      <div className="back-button-container">
        <button className="back-button" onClick={() => window.location.hash = '#dashboard'}>
          ← Back
        </button>
      </div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Onboarding Form' }]} />
      <Card>
        <div className="form-header-row">
          <h3>Onboarding Form</h3>
          <div className={`auto-save-indicator ${saveStatus}`}>
            {saveStatus === 'saving' && (
              <>
                <span className="save-spinner"></span>
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <span className="save-checkmark">✓</span>
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <span className="save-error">✕</span>
                <span>Error saving</span>
              </>
            )}
          </div>
        </div>
        <div className="step-indicator">
          {[
            { num: 1, label: 'Personal' },
            { num: 2, label: 'Educational' },
            { num: 3, label: 'Professional' },
            { num: 4, label: 'Consent' }
          ].map((step, index) => (
            <React.Fragment key={step.num}>
              <div 
                className={`step ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                data-label={step.label}
              >
                {currentStep > step.num ? '' : step.num}
              </div>
              {index < 3 && <div className={`step-connector ${currentStep > step.num ? 'completed' : ''}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="form-step">
              <h4>Personal Information</h4>
              
              {/* Resume Upload Section */}
              <div className="form-group">
                <label>
                  Upload Resume
                  <ContextualHelp 
                    content="Upload your resume in PDF or Word format. We can autofill your information from the resume."
                    type="tip"
                  />
                </label>
                <div className="resume-upload-section">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="input"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        handleChange('resumeFile', file.name);
                        showToast('Resume uploaded successfully', 'success');
                        // Auto-trigger autofill after resume upload
                        setTimeout(() => handleAutofill('resume'), 500);
                      }
                    }}
                  />
                  {formValues.resumeFile && (
                    <div className="file-uploaded-indicator">
                      <Icon name="check" size={16} className="field-status-icon valid-icon" />
                      <span>{formValues.resumeFile}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  LinkedIn Profile URL
                  <ContextualHelp 
                    content="Enter your LinkedIn profile URL for professional reference."
                    type="tip"
                  />
                </label>
                <div className="input-wrapper">
                  <Input
                    type="url"
                    value={formValues.linkedinUrl || ''}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    onBlur={() => handleBlur('linkedinUrl')}
                    placeholder="https://www.linkedin.com/in/yourprofile"
                    className={fieldErrors.linkedinUrl ? 'error' : touchedFields.linkedinUrl && formValues.linkedinUrl && !fieldErrors.linkedinUrl ? 'valid' : ''}
                  />
                  {touchedFields.linkedinUrl && formValues.linkedinUrl && !fieldErrors.linkedinUrl && (
                    <Icon name="check" size={16} className="field-status-icon valid-icon" />
                  )}
                  {fieldErrors.linkedinUrl && (
                    <Icon name="x" size={16} className="field-status-icon error-icon" />
                  )}
                </div>
                {fieldErrors.linkedinUrl && (
                  <div className="field-error-message">
                    <Icon name="alert" size={14} />
                    {fieldErrors.linkedinUrl}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    First Name *
                    <ContextualHelp 
                      content="Enter your legal first name as it appears on official documents"
                      type="tip"
                    />
                  </label>
                  <div className="input-wrapper">
                    <Input
                      value={formValues.firstName || ''}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      placeholder="John"
                      className={fieldErrors.firstName ? 'error' : touchedFields.firstName && formValues.firstName ? 'valid' : ''}
                      required
                    />
                    {touchedFields.firstName && formValues.firstName && !fieldErrors.firstName && (
                      <Icon name="check" size={16} className="field-status-icon valid-icon" />
                    )}
                    {fieldErrors.firstName && (
                      <Icon name="x" size={16} className="field-status-icon error-icon" />
                    )}
                  </div>
                  {fieldErrors.firstName && (
                    <div className="field-error-message">
                      <Icon name="alert" size={14} />
                      {fieldErrors.firstName}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Last Name *
                    <ContextualHelp 
                      content="Enter your legal last name (surname) as it appears on official documents"
                      type="tip"
                    />
                  </label>
                  <div className="input-wrapper">
                    <Input
                      value={formValues.lastName || ''}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      placeholder="Doe"
                      className={fieldErrors.lastName ? 'error' : touchedFields.lastName && formValues.lastName ? 'valid' : ''}
                      required
                    />
                    {touchedFields.lastName && formValues.lastName && !fieldErrors.lastName && (
                      <Icon name="check" size={16} className="field-status-icon valid-icon" />
                    )}
                    {fieldErrors.lastName && (
                      <Icon name="x" size={16} className="field-status-icon error-icon" />
                    )}
                  </div>
                  {fieldErrors.lastName && (
                    <div className="field-error-message">
                      <Icon name="alert" size={14} />
                      {fieldErrors.lastName}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Email *
                    <ContextualHelp 
                      content="Enter your professional email address. This will be used for all communications."
                      type="tip"
                    />
                  </label>
                  <div className="input-wrapper">
                    <Input
                      type="email"
                      value={formValues.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@domain.com"
                      className={fieldErrors.email ? 'error' : touchedFields.email && formValues.email && !fieldErrors.email ? 'valid' : ''}
                      required
                    />
                    {touchedFields.email && formValues.email && !fieldErrors.email && (
                      <Icon name="check" size={16} className="field-status-icon valid-icon" />
                    )}
                    {fieldErrors.email && (
                      <Icon name="x" size={16} className="field-status-icon error-icon" />
                    )}
                  </div>
                  {fieldErrors.email && (
                    <div className="field-error-message">
                      <Icon name="alert" size={14} />
                      {fieldErrors.email}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Mobile *
                    <ContextualHelp 
                      content="Enter your mobile number with country code (e.g., +1 555 555 5555)"
                      type="tip"
                    />
                  </label>
                  <div className="input-wrapper">
                    <Input
                      type="tel"
                      value={formValues.mobile || ''}
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      onBlur={() => handleBlur('mobile')}
                      placeholder="+1 555 555 5555"
                      className={fieldErrors.mobile ? 'error' : touchedFields.mobile && formValues.mobile && !fieldErrors.mobile ? 'valid' : ''}
                      required
                    />
                    {touchedFields.mobile && formValues.mobile && !fieldErrors.mobile && (
                      <Icon name="check" size={16} className="field-status-icon valid-icon" />
                    )}
                    {fieldErrors.mobile && (
                      <Icon name="x" size={16} className="field-status-icon error-icon" />
                    )}
                  </div>
                  {fieldErrors.mobile && (
                    <div className="field-error-message">
                      <Icon name="alert" size={14} />
                      {fieldErrors.mobile}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>
                  Address
                  <ContextualHelp 
                    content="Enter your complete address including street, city, state, and postal code"
                    type="tip"
                  />
                </label>
                <textarea
                  className="input"
                  value={formValues.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows="2"
                  placeholder="Street, City, State"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Upload Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="input"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      handleChange('photoFileName', file ? file.name : '');
                    }}
                  />
                  <div className="small">
                    Recent passport-size photo. JPG/PNG, max 5MB.
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={() => window.location.hash = '#dashboard'}>
                  Back
                </Button>
                <Button type="button" onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 2: Educational Information */}
          {currentStep === 2 && (
            <div className="form-step">
              <h4>Educational Information</h4>
              <p className="small" style={{ marginBottom: '20px', color: 'var(--muted)' }}>
                Please provide your educational qualifications and certifications.
              </p>
              
              {/* Educational Qualifications */}
              <div className="form-group">
                <label>Educational Qualifications</label>
                <p className="small" style={{ marginBottom: '12px', color: 'var(--muted)' }}>
                  Add your educational qualifications
                </p>
                {(formValues.educationalQualifications && formValues.educationalQualifications.length > 0 ? formValues.educationalQualifications : [{ 
                  degree: '', 
                  institution: '', 
                  board: '', 
                  yearOfPassing: '', 
                  percentage: '', 
                  document: '' 
                }]).map((edu, index) => (
                  <Card key={index} className="certification-item-card">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Degree/Qualification *</label>
                        <select
                          className="input"
                          value={edu.degree || ''}
                          onChange={(e) => {
                            const currentEdu = formValues.educationalQualifications || [];
                            const updatedEdu = [...currentEdu];
                            updatedEdu[index] = { ...updatedEdu[index], degree: e.target.value };
                            handleChange('educationalQualifications', updatedEdu);
                          }}
                          required
                        >
                          <option value="">Select Qualification</option>
                          <option value="10th">10th / Secondary Education</option>
                          <option value="12th">12th / Higher Secondary</option>
                          <option value="diploma">Diploma</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="phd">PhD</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Institution/University *</label>
                        <Input
                          placeholder="Institution Name"
                          value={edu.institution || ''}
                          onChange={(e) => {
                            const currentEdu = formValues.educationalQualifications || [];
                            const updatedEdu = [...currentEdu];
                            updatedEdu[index] = { ...updatedEdu[index], institution: e.target.value };
                            handleChange('educationalQualifications', updatedEdu);
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Board/University</label>
                        <Input
                          placeholder="Board or University Name"
                          value={edu.board || ''}
                          onChange={(e) => {
                            const currentEdu = formValues.educationalQualifications || [];
                            const updatedEdu = [...currentEdu];
                            updatedEdu[index] = { ...updatedEdu[index], board: e.target.value };
                            handleChange('educationalQualifications', updatedEdu);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Year of Passing *</label>
                        <Input
                          type="number"
                          placeholder="YYYY"
                          min="1980"
                          max={new Date().getFullYear()}
                          value={edu.yearOfPassing || ''}
                          onChange={(e) => {
                            const currentEdu = formValues.educationalQualifications || [];
                            const updatedEdu = [...currentEdu];
                            updatedEdu[index] = { ...updatedEdu[index], yearOfPassing: e.target.value };
                            handleChange('educationalQualifications', updatedEdu);
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Percentage/CGPA</label>
                        <Input
                          placeholder="e.g., 85% or 8.5"
                          value={edu.percentage || ''}
                          onChange={(e) => {
                            const currentEdu = formValues.educationalQualifications || [];
                            const updatedEdu = [...currentEdu];
                            updatedEdu[index] = { ...updatedEdu[index], percentage: e.target.value };
                            handleChange('educationalQualifications', updatedEdu);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Document Upload</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          className="input"
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            const currentEdu = formValues.educationalQualifications || [];
                            const updatedEdu = [...currentEdu];
                            updatedEdu[index] = { ...updatedEdu[index], document: file ? file.name : '' };
                            handleChange('educationalQualifications', updatedEdu);
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const currentEdu = formValues.educationalQualifications || [];
                    handleChange('educationalQualifications', [...currentEdu, { 
                      degree: '', 
                      institution: '', 
                      board: '', 
                      yearOfPassing: '', 
                      percentage: '', 
                      document: '' 
                    }]);
                  }}
                  style={{ marginTop: '8px', fontSize: '14px' }}
                >
                  + Add More Educational Qualifications
                </Button>
              </div>

              <div className="form-group">
                <label>Certifications</label>
                <p className="small" style={{ marginBottom: '12px', color: 'var(--muted)' }}>
                  Add any professional certifications you hold
                </p>
                {(formValues.certifications && formValues.certifications.length > 0 ? formValues.certifications : [{ name: '', number: '', document: '' }]).map((cert, index) => (
                  <Card key={index} className="certification-item-card">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Certification Name</label>
                        <Input
                          placeholder="Certification Name"
                          value={cert.name || ''}
                          onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Certification Number</label>
                        <Input
                          placeholder="Certification Number"
                          value={cert.number || ''}
                          onChange={(e) => handleCertificationChange(index, 'number', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Certification Document Upload</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        className="input"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          handleCertificationChange(index, 'document', file ? file.name : '');
                        }}
                      />
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addCertification}
                  style={{ marginTop: '8px', fontSize: '14px' }}
                >
                  + Add More Certifications
                </Button>
              </div>

              <div className="form-group">
                <label>Additional Educational Notes</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formValues.educationalNotes || ''}
                  onChange={(e) => handleChange('educationalNotes', e.target.value)}
                  placeholder="Any additional educational information or achievements..."
                />
              </div>

              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={prevStep}>Previous</Button>
                <Button type="button" onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 3: Professional Information */}
          {currentStep === 3 && (
            <div className="form-step">
              <h4>Professional Information</h4>
              <div className="form-group">
                <label>Professional Experience</label>
                <p className="small" style={{ marginBottom: '12px', color: 'var(--muted)' }}>
                  Add your previous professional experience
                </p>
                {(formValues.professionalDetails && formValues.professionalDetails.length > 0 ? formValues.professionalDetails : [{ company: '', position: '', startDate: '', endDate: '', responsibilities: '', achievements: '' }]).map((detail, index) => (
                  <Card key={index} className="certification-item-card">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Company Name *</label>
                        <Input
                          placeholder="Company Name"
                          value={detail.company || ''}
                          onChange={(e) => handleProfessionalDetailChange(index, 'company', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Position *</label>
                        <Input
                          placeholder="Job Title"
                          value={detail.position || ''}
                          onChange={(e) => handleProfessionalDetailChange(index, 'position', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Start Date *</label>
                        <Input
                          type="date"
                          value={detail.startDate || ''}
                          onChange={(e) => handleProfessionalDetailChange(index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <Input
                          type="date"
                          value={detail.endDate || ''}
                          onChange={(e) => handleProfessionalDetailChange(index, 'endDate', e.target.value)}
                          placeholder="Leave blank if current"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Key Responsibilities</label>
                      <textarea
                        className="input"
                        rows="2"
                        value={detail.responsibilities || ''}
                        onChange={(e) => handleProfessionalDetailChange(index, 'responsibilities', e.target.value)}
                        placeholder="Describe your key responsibilities..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Achievements</label>
                      <textarea
                        className="input"
                        rows="2"
                        value={detail.achievements || ''}
                        onChange={(e) => handleProfessionalDetailChange(index, 'achievements', e.target.value)}
                        placeholder="Key achievements in this role..."
                      />
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addProfessionalDetail}
                  style={{ marginTop: '8px', fontSize: '14px' }}
                >
                  + Add More Professional Experience
                </Button>
              </div>

              <div className="form-group">
                <label>Skills with Self-Rating</label>
                <p className="small" style={{ marginBottom: '12px', color: 'var(--muted)' }}>
                  Add your skills and rate your proficiency level (1-5, where 5 is expert)
                </p>
                <div className="skills-container">
                  {(formValues.skillsWithRating && formValues.skillsWithRating.length > 0 ? formValues.skillsWithRating : []).map((skill, index) => (
                    <div key={index} className="skill-rating-item">
                      <div className="skill-name">{skill.name}</div>
                      <div className="skill-rating">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            className={`rating-star ${skill.rating >= rating ? 'active' : ''}`}
                            onClick={() => handleSkillChange(skill.name, rating)}
                            title={`Rate ${rating} out of 5`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="rating-value">{skill.rating > 0 ? `${skill.rating}/5` : 'Not rated'}</span>
                      </div>
                      <button
                        type="button"
                        className="remove-skill-btn"
                        onClick={() => {
                          const updated = formValues.skillsWithRating.filter((_, i) => i !== index);
                          handleChange('skillsWithRating', updated);
                        }}
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addSkill}
                  style={{ marginTop: '12px', fontSize: '14px' }}
                >
                  + Add Skill
                </Button>
              </div>
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <Input
                  value={formValues.emergencyContact || ''}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  placeholder="Contact Name"
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact Number</label>
                <Input
                  type="tel"
                  value={formValues.emergencyPhone || ''}
                  onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                  placeholder="+1 555 555 5555"
                />
              </div>
              
              <div className="form-group">
                <label>References</label>
                <p className="small" style={{ marginBottom: '12px', color: 'var(--muted)' }}>
                  Provide contact details for professional references (previous managers, colleagues, etc.)
                </p>
                {(formValues.references && formValues.references.length > 0 ? formValues.references : [{ name: '', email: '', phone: '', company: '', position: '', relationship: '' }]).map((ref, index) => (
                  <Card key={index} className="certification-item-card">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Reference Name *</label>
                        <Input
                          placeholder="John Doe"
                          value={ref.name || ''}
                          onChange={(e) => {
                            const currentRefs = formValues.references || [];
                            const updatedRefs = [...currentRefs];
                            updatedRefs[index] = { ...updatedRefs[index], name: e.target.value };
                            handleChange('references', updatedRefs);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <Input
                          type="email"
                          placeholder="john@company.com"
                          value={ref.email || ''}
                          onChange={(e) => {
                            const currentRefs = formValues.references || [];
                            const updatedRefs = [...currentRefs];
                            updatedRefs[index] = { ...updatedRefs[index], email: e.target.value };
                            handleChange('references', updatedRefs);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone</label>
                        <Input
                          type="tel"
                          placeholder="+1 555 555 5555"
                          value={ref.phone || ''}
                          onChange={(e) => {
                            const currentRefs = formValues.references || [];
                            const updatedRefs = [...currentRefs];
                            updatedRefs[index] = { ...updatedRefs[index], phone: e.target.value };
                            handleChange('references', updatedRefs);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Company</label>
                        <Input
                          placeholder="Previous Company"
                          value={ref.company || ''}
                          onChange={(e) => {
                            const currentRefs = formValues.references || [];
                            const updatedRefs = [...currentRefs];
                            updatedRefs[index] = { ...updatedRefs[index], company: e.target.value };
                            handleChange('references', updatedRefs);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Position</label>
                        <Input
                          placeholder="Manager, Director, etc."
                          value={ref.position || ''}
                          onChange={(e) => {
                            const currentRefs = formValues.references || [];
                            const updatedRefs = [...currentRefs];
                            updatedRefs[index] = { ...updatedRefs[index], position: e.target.value };
                            handleChange('references', updatedRefs);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Relationship *</label>
                        <select
                          className="input"
                          value={ref.relationship || ''}
                          onChange={(e) => {
                            const currentRefs = formValues.references || [];
                            const updatedRefs = [...currentRefs];
                            updatedRefs[index] = { ...updatedRefs[index], relationship: e.target.value };
                            handleChange('references', updatedRefs);
                          }}
                        >
                          <option value="">Select Relationship</option>
                          <option value="manager">Previous Manager</option>
                          <option value="colleague">Colleague</option>
                          <option value="client">Client</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const currentRefs = formValues.references || [];
                    handleChange('references', [...currentRefs, { name: '', email: '', phone: '', company: '', position: '', relationship: '' }]);
                  }}
                  style={{ marginTop: '8px', fontSize: '14px' }}
                >
                  + Add More References
                </Button>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="input"
                  value={formValues.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows="3"
                  placeholder="Any additional information..."
                />
              </div>
              <div className="form-group">
                <label>Visa Status</label>
                <div className="visa-options">
                  <label>
                    <input
                      type="radio"
                      name="hasVisa"
                      value="yes"
                      checked={formValues.hasVisa === 'yes'}
                      onChange={(e) => handleChange('hasVisa', e.target.value)}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="hasVisa"
                      value="no"
                      checked={formValues.hasVisa === 'no'}
                      onChange={(e) => handleChange('hasVisa', e.target.value)}
                    />
                    No
                  </label>
                </div>
                {formValues.hasVisa === 'yes' && (
                  <>
                    <div className="form-group" style={{ marginTop: '12px' }}>
                      <label>Visa Type *</label>
                      <select
                        className="input"
                        value={formValues.visaType || ''}
                        onChange={(e) => handleChange('visaType', e.target.value)}
                        required={formValues.hasVisa === 'yes'}
                      >
                        <option value="">Select Visa Type</option>
                        <option value="H1B">H1B</option>
                        <option value="L1">L1</option>
                        <option value="F1">F1</option>
                        <option value="B1/B2">B1/B2</option>
                        <option value="Work Permit">Work Permit</option>
                        <option value="Permanent Resident">Permanent Resident</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="small">
                      Please upload your Visa document under the <strong>Government ID</strong> category in the Documents tab.
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label>Document Expiry Dates</label>
                <p className="small" style={{ marginBottom: '12px', color: 'var(--muted)' }}>
                  Please provide expiry dates for important documents
                </p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Passport Expiry Date</label>
                    <Input
                      type="date"
                      value={formValues.passportExpiry || ''}
                      onChange={(e) => handleChange('passportExpiry', e.target.value)}
                    />
                  </div>
                  {formValues.hasVisa === 'yes' && (
                    <div className="form-group">
                      <label>Visa Expiry Date</label>
                      <Input
                        type="date"
                        value={formValues.visaExpiry || ''}
                        onChange={(e) => handleChange('visaExpiry', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                {(formValues.certifications && formValues.certifications.length > 0) && (
                  <div style={{ marginTop: '12px' }}>
                    <label className="small" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Certification Expiry Dates
                    </label>
                    {formValues.certifications.map((cert, index) => (
                      cert.name && (
                        <div key={index} className="form-row" style={{ marginBottom: '8px' }}>
                          <div className="form-group">
                            <label className="small">{cert.name} Expiry</label>
                            <Input
                              type="date"
                              value={cert.expiryDate || ''}
                              onChange={(e) => {
                                const currentCerts = formValues.certifications || [];
                                const updatedCerts = [...currentCerts];
                                updatedCerts[index] = { ...updatedCerts[index], expiryDate: e.target.value };
                                handleChange('certifications', updatedCerts);
                              }}
                            />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={prevStep}>Previous</Button>
                <Button type="button" onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 4: Consent & Signature */}
          {currentStep === 4 && (
            <div className="form-step">
              <h4>Consent & Signature</h4>
              
              <div className="consent-section">
                <div className="consent-item">
                  <label className="consent-checkbox">
                    <input
                      type="checkbox"
                      checked={formValues.consentInformation || false}
                      onChange={(e) => handleChange('consentInformation', e.target.checked)}
                      required
                    />
                    <span className="consent-text">
                      <strong>Information Accuracy:</strong> I confirm that all information provided is true, complete, and accurate to the best of my knowledge. I understand that any misrepresentation or omission may result in withdrawal of the offer or termination of employment.
                    </span>
                  </label>
                </div>

                <div className="consent-item">
                  <label className="consent-checkbox">
                    <input
                      type="checkbox"
                      checked={formValues.consentDocuments || false}
                      onChange={(e) => handleChange('consentDocuments', e.target.checked)}
                      required
                    />
                    <span className="consent-text">
                      <strong>Document Submission:</strong> I consent to the collection, storage, and verification of all documents submitted as part of the onboarding process. I acknowledge that these documents will be used solely for employment and compliance purposes, and will be handled in accordance with applicable laws and company policy.
                    </span>
                  </label>
                </div>

                <div className="consent-item">
                  <label className="consent-checkbox">
                    <input
                      type="checkbox"
                      checked={formValues.consentBackgroundCheck || false}
                      onChange={(e) => handleChange('consentBackgroundCheck', e.target.checked)}
                      required
                    />
                    <span className="consent-text">
                      <strong>Background Verification:</strong> I authorize ValueMomentum and its representatives to conduct background checks, including verification of employment history, education, and references, as well as criminal record checks if required. I release all parties from liability for any information provided in good faith.
                    </span>
                  </label>
                </div>

                <div className="consent-item">
                  <label className="consent-checkbox">
                    <input
                      type="checkbox"
                      checked={formValues.consentDataProcessing || false}
                      onChange={(e) => handleChange('consentDataProcessing', e.target.checked)}
                      required
                    />
                    <span className="consent-text">
                      <strong>Data Privacy:</strong> I consent to the processing of my personal data by ValueMomentum for employment-related purposes, including payroll, benefits, and compliance. I understand my data will be protected and processed in accordance with applicable data protection laws and company policy.
                    </span>
                  </label>
                </div>
              </div>

              <div className="signature-section">
                <DigitalSignature
                  label="Digital Signature"
                  required={true}
                  onSave={(signature, type) => {
                    handleChange('signature', signature);
                    handleChange('signatureType', type);
                    showToast('Signature saved successfully', 'success');
                  }}
                  onClear={() => {
                    handleChange('signature', '');
                    handleChange('signatureType', '');
                  }}
                  value={formValues.signature}
                />
                <div className="small" style={{ marginTop: '8px', color: 'var(--muted)' }}>
                  By providing your digital signature, you are agreeing to all the consents above.
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <Input
                      type="date"
                      value={formValues.signatureDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => handleChange('signatureDate', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={prevStep}>Previous</Button>
                <Button type="submit">Save & Complete</Button>
              </div>
            </div>
          )}
        </form>
      </Card>
      
      {/* LinkedIn Consent Popup */}
      {showLinkedInConsent && (
        <div className="consent-popup-overlay">
          <div className="consent-popup">
            <div className="consent-popup-header">
              <h3>LinkedIn Profile Autofill</h3>
              <button 
                className="consent-close-btn"
                onClick={() => setShowLinkedInConsent(false)}
              >
                ×
              </button>
            </div>
            <div className="consent-popup-content">
              <div className="consent-icon">🔗</div>
              <p>
                We can automatically fill your form using information from your LinkedIn profile. 
                This will help speed up the onboarding process.
              </p>
              <div className="consent-note">
                <strong>Note:</strong> We will only use publicly available information from your LinkedIn profile. 
                You can review and modify any auto-filled data before submitting.
              </div>
            </div>
            <div className="consent-popup-actions">
              <Button 
                variant="secondary" 
                onClick={() => handleLinkedInConsent(false)}
              >
                No, I'll fill manually
              </Button>
              <Button 
                onClick={() => handleLinkedInConsent(true)}
              >
                Yes, autofill from LinkedIn
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Popup */}
      {showSkillInput && (
        <div className="consent-popup-overlay">
          <div className="consent-popup">
            <div className="consent-popup-header">
              <h3>Add New Skill</h3>
              <button 
                className="consent-close-btn"
                onClick={() => {
                  setShowSkillInput(false);
                  setNewSkillName('');
                }}
              >
                ×
              </button>
            </div>
            <div className="consent-popup-content">
              <div className="form-group">
                <label>Skill Name</label>
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Enter skill name (e.g., JavaScript, Python, etc.)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSkill();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <div className="consent-popup-actions">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowSkillInput(false);
                  setNewSkillName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddSkill}
                disabled={!newSkillName.trim()}
              >
                Add Skill
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingForm;

