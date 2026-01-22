import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Breadcrumbs from '../UI/Breadcrumbs';
import './RegisterCandidate.css';

// Mock position data with Indian names and contact details
const POSITION_DATA = {
  'POS-3456': {
    firstName: 'Arjun',
    lastName: 'Sharma',
    email: 'arjun.sharma@gmail.com',
    mobile: '+91 9876543210',
    department: 'engineering',
    designation: 'Senior Software Engineer',
    location: 'india',
    joiningBonus: true,
    relocation: false
  },
  'POS-7891': {
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@outlook.com',
    mobile: '+1 555-123-4567',
    department: 'sales',
    designation: 'Sales Manager',
    location: 'us',
    joiningBonus: true,
    relocation: true
  },
  'POS-2345': {
    firstName: 'Rahul',
    lastName: 'Gupta',
    email: 'rahul.gupta@gmail.com',
    mobile: '+91 8765432109',
    department: 'engineering',
    designation: 'Frontend Developer',
    location: 'india',
    joiningBonus: false,
    relocation: false
  },
  'POS-5678': {
    firstName: 'Kavya',
    lastName: 'Reddy',
    email: 'kavya.reddy@outlook.com',
    mobile: '+1 555-987-6543',
    department: 'hr',
    designation: 'HR Business Partner',
    location: 'us',
    joiningBonus: false,
    relocation: true
  },
  'POS-9012': {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@gmail.com',
    mobile: '+91 7654321098',
    department: 'finance',
    designation: 'Financial Analyst',
    location: 'india',
    joiningBonus: true,
    relocation: false
  }
};

const RegisterCandidate = ({ onBack, onSuccess }) => {
  const { setCandidates } = useApp();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    positionId: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    department: '',
    designation: '',
    location: 'india',
    dateOfJoining: '',
    joiningBonus: false,
    relocation: false,
    relocationCity: '',
    resume: null,
    pan: null,
    aadhaar: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        showToast('Please upload a valid file format (PDF, DOC, DOCX, JPG, PNG)', 'error');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size should be less than 10MB', 'error');
        return;
      }
      
      setFormData(prev => ({ ...prev, [field]: file }));
      showToast(`${field === 'resume' ? 'Resume' : field === 'pan' ? 'PAN Card' : 'Aadhaar Card'} uploaded successfully`, 'success');
    }
  };

  const handlePositionChange = (positionId) => {
    const positionData = POSITION_DATA[positionId];
    if (positionData) {
      setFormData(prev => ({
        ...prev,
        positionId,
        firstName: positionData.firstName,
        lastName: positionData.lastName,
        email: positionData.email,
        mobile: positionData.mobile,
        department: positionData.department,
        designation: positionData.designation,
        location: positionData.location,
        joiningBonus: positionData.joiningBonus,
        relocation: positionData.relocation
      }));
      showToast('Position details and candidate information auto-filled successfully!', 'success');
    } else {
      setFormData(prev => ({ ...prev, positionId }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Count uploaded documents
      const uploadedDocsCount = [formData.resume, formData.pan, formData.aadhaar].filter(Boolean).length;
      
      const newCandidate = {
        id: Date.now(),
        name: `${formData.firstName} ${formData.lastName}`,
        status: 'pending',
        docs: uploadedDocsCount,
        total: 12,
        dept: formData.department,
        positionId: formData.positionId,
        dateOfJoining: formData.dateOfJoining,
        joiningBonus: formData.joiningBonus,
        relocation: formData.relocation,
        relocationCity: formData.relocationCity,
        selected: false,
        pending: [],
        uploadedDocuments: {
          resume: formData.resume ? formData.resume.name : null,
          pan: formData.pan ? formData.pan.name : null,
          aadhaar: formData.aadhaar ? formData.aadhaar.name : null
        }
      };
      
      setCandidates(prev => [...prev, newCandidate]);
      setIsSubmitting(false);
      
      const docMessage = uploadedDocsCount > 0 
        ? ` with ${uploadedDocsCount} document${uploadedDocsCount > 1 ? 's' : ''} uploaded`
        : '';
      showToast(`Email has been sent to the candidate successfully!${docMessage}`, 'success');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    }, 1500);
  };

  return (
    <div className="register-candidate">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'HR Dashboard' }, { label: 'Register New Candidate' }]} />
      <div className="back-button-container">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
      </div>
      <Card>
        <h3>Register New Candidate</h3>
        <p className="small">Enter candidate details to send onboarding invitation email.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group position-id-group">
            <label>Position ID *</label>
            <select
              className="input position-select"
              value={formData.positionId}
              onChange={(e) => handlePositionChange(e.target.value)}
              required
            >
              <option value="">Select Position ID</option>
              <option value="POS-3456">POS-3456 - Arjun Sharma - Senior Software Engineer (India)</option>
              <option value="POS-7891">POS-7891 - Priya Patel - Sales Manager (US)</option>
              <option value="POS-2345">POS-2345 - Rahul Gupta - Frontend Developer (India)</option>
              <option value="POS-5678">POS-5678 - Kavya Reddy - HR Business Partner (US)</option>
              <option value="POS-9012">POS-9012 - Vikram Singh - Financial Analyst (India)</option>
            </select>
            <small className="form-hint">Select a position to auto-fill candidate and job details</small>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Email Address *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="candidate@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Mobile Number *</label>
              <Input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+91 1234567890"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <select
                className="input"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                required
              >
                <option value="">Select Department</option>
                <option value="engineering">Engineering</option>
                <option value="sales">Sales</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Designation *</label>
              <Input
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Location *</label>
            <select
              className="input"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            >
              <option value="india">India</option>
              <option value="us">US</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date of Joining *</label>
              <Input
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Joining Bonus Applicable</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="joiningBonus"
                    value="yes"
                    checked={formData.joiningBonus === true}
                    onChange={(e) => handleChange('joiningBonus', true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="joiningBonus"
                    value="no"
                    checked={formData.joiningBonus === false}
                    onChange={(e) => handleChange('joiningBonus', false)}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Relocation Assistance</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="relocation"
                    value="yes"
                    checked={formData.relocation === true}
                    onChange={(e) => handleChange('relocation', true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="relocation"
                    value="no"
                    checked={formData.relocation === false}
                    onChange={(e) => handleChange('relocation', false)}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Joining Bonus Amount and Details (updated as per HR requirements) */}
          {formData.joiningBonus === true && (
            <div className="form-group">
              <label>Joining Bonus Details</label>
              <div className="joining-bonus-details-box" style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 16, background: '#fafbfc', marginTop: 8 }}>
                <div style={{ marginBottom: 12 }}>
                  <strong>Bonus Amount:</strong> ₹
                  <Input
                    type="number"
                    min="0"
                    value={formData.joiningBonusAmount || ''}
                    onChange={(e) => handleChange('joiningBonusAmount', e.target.value)}
                    placeholder="Enter joining bonus amount"
                    style={{ width: 140, display: 'inline-block', marginLeft: 8 }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Payment Schedule:</strong> This bonus will be paid <Input
                    type="text"
                    value={formData.joiningBonusSchedule || ''}
                    onChange={(e) => handleChange('joiningBonusSchedule', e.target.value)}
                    placeholder="e.g. after 30 days of employment"
                    style={{ width: 220, display: 'inline-block', marginLeft: 8 }}
                    required
                  />
                </div>
                <div>
                  <strong>Conditions:</strong> Should you leave the company within
                  <Input
                    type="text"
                    value={formData.joiningBonusCondition || ''}
                    onChange={(e) => handleChange('joiningBonusCondition', e.target.value)}
                    placeholder="e.g. 1 year of joining"
                    style={{ width: 140, display: 'inline-block', marginLeft: 8, marginRight: 8 }}
                    required
                  />
                  this bonus will be subject to repayment.
                </div>
              </div>
            </div>
          )}
          
          {formData.relocation && (
            <div className="form-group">
              <label>Relocation City *</label>
              <select
                className="input"
                value={formData.relocationCity}
                onChange={(e) => handleChange('relocationCity', e.target.value)}
                required={formData.relocation}
              >
                <option value="">Select City</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="pune">Pune</option>
                <option value="coimbatore">Coimbatore</option>
              </select>
            </div>
          )}

          {/* Optional Document Uploads */}
          <div className="form-section-divider" style={{ marginTop: '32px', marginBottom: '24px', borderTop: '1px solid #e0e0e0', paddingTop: '24px' }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Optional Documents</h4>
            <p className="small" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              You can upload candidate documents here. These are optional and can be uploaded later.
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label>Resume</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('resume', e)}
                    className="file-input"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="file-upload-label">
                    {formData.resume ? (
                      <span style={{ color: 'var(--success)' }}>✓ {formData.resume.name}</span>
                    ) : (
                      <span>Choose Resume File (PDF, DOC, DOCX)</span>
                    )}
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>PAN Card</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('pan', e)}
                    className="file-input"
                    id="pan-upload"
                  />
                  <label htmlFor="pan-upload" className="file-upload-label">
                    {formData.pan ? (
                      <span style={{ color: 'var(--success)' }}>✓ {formData.pan.name}</span>
                    ) : (
                      <span>Choose PAN Card (PDF, JPG, PNG)</span>
                    )}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Aadhaar Card</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('aadhaar', e)}
                  className="file-input"
                  id="aadhaar-upload"
                />
                <label htmlFor="aadhaar-upload" className="file-upload-label">
                  {formData.aadhaar ? (
                    <span style={{ color: 'var(--success)' }}>✓ {formData.aadhaar.name}</span>
                  ) : (
                    <span>Choose Aadhaar Card (PDF, JPG, PNG)</span>
                  )}
                </label>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Submit & Send Email'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterCandidate;

