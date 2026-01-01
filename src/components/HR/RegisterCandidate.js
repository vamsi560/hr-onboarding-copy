import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Breadcrumbs from '../UI/Breadcrumbs';
import './RegisterCandidate.css';

// Mock position data
const POSITION_DATA = {
  'POS-3456': {
    department: 'engineering',
    designation: 'Senior Software Engineer',
    location: 'india',
    joiningBonus: true,
    relocation: false
  },
  'POS-7891': {
    department: 'sales',
    designation: 'Sales Manager',
    location: 'us',
    joiningBonus: true,
    relocation: true
  },
  'POS-2345': {
    department: 'engineering',
    designation: 'Frontend Developer',
    location: 'india',
    joiningBonus: false,
    relocation: false
  },
  'POS-5678': {
    department: 'hr',
    designation: 'HR Business Partner',
    location: 'us',
    joiningBonus: false,
    relocation: true
  },
  'POS-9012': {
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
    relocationCity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePositionChange = (positionId) => {
    const positionData = POSITION_DATA[positionId];
    if (positionData) {
      setFormData(prev => ({
        ...prev,
        positionId,
        department: positionData.department,
        designation: positionData.designation,
        location: positionData.location,
        joiningBonus: positionData.joiningBonus,
        relocation: positionData.relocation
      }));
      showToast('Position details auto-filled successfully!', 'success');
    } else {
      setFormData(prev => ({ ...prev, positionId }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newCandidate = {
        id: Date.now(),
        name: `${formData.firstName} ${formData.lastName}`,
        status: 'pending',
        docs: 0,
        total: 12,
        dept: formData.department,
        positionId: formData.positionId,
        dateOfJoining: formData.dateOfJoining,
        joiningBonus: formData.joiningBonus,
        relocation: formData.relocation,
        relocationCity: formData.relocationCity,
        selected: false,
        pending: []
      };
      
      setCandidates(prev => [...prev, newCandidate]);
      setIsSubmitting(false);
      showToast('Email has been sent to the candidate successfully!', 'success');
      
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
              <option value="POS-3456">POS-3456 - Senior Software Engineer (India)</option>
              <option value="POS-7891">POS-7891 - Sales Manager (US)</option>
              <option value="POS-2345">POS-2345 - Frontend Developer (India)</option>
              <option value="POS-5678">POS-5678 - HR Business Partner (US)</option>
              <option value="POS-9012">POS-9012 - Financial Analyst (India)</option>
            </select>
            <small className="form-hint">Select a position to auto-fill job details</small>
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

