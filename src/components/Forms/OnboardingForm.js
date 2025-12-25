import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Breadcrumbs from '../UI/Breadcrumbs';
import './OnboardingForm.css';

const OnboardingForm = () => {
  const { formData, updateFormData, logAction } = useApp();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState(formData);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setFormValues(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    const newValues = { ...formValues, [field]: value };
    setFormValues(newValues);
    
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

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
          {[1, 2, 3, 4].map(step => (
            <React.Fragment key={step}>
              <div className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                {step}
              </div>
              {step < 4 && <div className="step-connector"></div>}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="form-step">
              <h4>Personal Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <Input
                    value={formValues.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <Input
                    value={formValues.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <Input
                    type="email"
                    value={formValues.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@domain.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile *</label>
                  <Input
                    type="tel"
                    value={formValues.mobile || ''}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="+1 555 555 5555"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
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

          {/* Step 2: Professional Details */}
          {currentStep === 2 && (
            <div className="form-step">
              <h4>Professional Details</h4>
              <div className="form-group">
                <label>Designation</label>
                <Input
                  value={formValues.designation || ''}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  className="input"
                  value={formValues.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                >
                  <option value="">Select Department</option>
                  <option value="engineering">Engineering</option>
                  <option value="sales">Sales</option>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <Input
                  type="date"
                  value={formValues.joiningDate || ''}
                  onChange={(e) => handleChange('joiningDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <Input
                  type="url"
                  value={formValues.linkedinUrl || ''}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  placeholder="https://www.linkedin.com/in/yourprofile"
                />
              </div>
              <div className="form-group">
                <label>Certifications</label>
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
                <label>Skills</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formValues.skills || ''}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  placeholder="List primary skills and technologies"
                />
              </div>
              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={prevStep}>Previous</Button>
                <Button type="button" onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <div className="form-step">
              <h4>Additional Information</h4>
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
                  <div className="small">
                    Please upload your Visa document under the <strong>Government ID</strong> category in the Documents tab.
                  </div>
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
                      <strong>Information Consent:</strong> I hereby confirm that all the information provided in this onboarding form is accurate, complete, and true to the best of my knowledge. I understand that providing false or misleading information may result in termination of my employment or other legal consequences.
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
                      <strong>Document Consent:</strong> I consent to the collection, storage, and processing of all documents uploaded during the onboarding process. I understand that these documents will be used for verification purposes and will be stored securely in accordance with company policies and applicable data protection laws.
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
                      <strong>Background Check Consent:</strong> I consent to ValueMomentum conducting background checks, including but not limited to employment verification, education verification, criminal record checks, and reference checks. I authorize all previous employers, educational institutions, and other relevant parties to release information about me.
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
                      <strong>Data Processing Consent:</strong> I consent to ValueMomentum processing my personal data for employment-related purposes, including payroll, benefits administration, performance management, and compliance with legal obligations. I understand that my data will be handled in accordance with applicable privacy laws and company policies.
                    </span>
                  </label>
                </div>
              </div>

              <div className="signature-section">
                <div className="form-group">
                  <label>Digital Signature *</label>
                  <div className="signature-box-container">
                    <div className="signature-box">
                      {formValues.signature ? (
                        <div className="signature-display">
                          <div className="signature-text">{formValues.signature}</div>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleChange('signature', '')}
                            style={{ fontSize: '12px', marginTop: '8px' }}
                          >
                            Clear Signature
                          </Button>
                        </div>
                      ) : (
                        <Input
                          type="text"
                          value={formValues.signature || ''}
                          onChange={(e) => handleChange('signature', e.target.value)}
                          placeholder="Type your full name to sign"
                          required
                        />
                      )}
                    </div>
                    <div className="small" style={{ marginTop: '8px', color: 'var(--muted)' }}>
                      By typing your full name, you are providing your digital signature and agreeing to all the consents above.
                    </div>
                  </div>
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
    </div>
  );
};

export default OnboardingForm;

