import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Breadcrumbs from '../UI/Breadcrumbs';
import './OnboardingForm.css';

const OnboardingForm = () => {
  const { formData, updateFormData } = useApp();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState(formData);

  useEffect(() => {
    setFormValues(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    const newValues = { ...formValues, [field]: value };
    setFormValues(newValues);
    updateFormData(newValues);
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
      if (currentStep < 3) {
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
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Onboarding Form' }]} />
      <Card>
        <h3>Onboarding Form</h3>
        <div className="step-indicator">
          {[1, 2, 3].map(step => (
            <React.Fragment key={step}>
              <div className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                {step}
              </div>
              {step < 3 && <div className="step-connector"></div>}
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
                <label>Certifications</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formValues.certifications || ''}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  placeholder="List your key certifications (e.g., AWS, Azure, PMP)"
                />
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
                    Please upload your Visa document under the <strong>Identity</strong> category in the Documents tab.
                  </div>
                )}
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

