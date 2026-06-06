import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import Card from '../../UI/Card';
import Breadcrumbs from '../../UI/Breadcrumbs';
import Icon from '../../UI/Icon';
import { api } from '../../../utils/api';
import './OfferLetterForm.css';

// Accordion helper for form groupings
const FormAccordion = ({ title, isOpen, onToggle, children, iconName }) => {
  return (
    <div className="form-accordion-section">
      <button
        type="button"
        onClick={onToggle}
        className="accordion-header-btn"
      >
        <span className="header-label">
          {iconName && <Icon name={iconName} size={18} className="accordion-icon" />}
          <span>{title}</span>
        </span>
        <span className={`chevron-indicator ${isOpen ? 'rotated' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="accordion-body fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const OfferLetterForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    // General/Recruitment Section
    status: 'Draft',
    tag_poc: '',
    pos_id: '',
    source: 'Direct',
    source_type: '',
    source_details: '',
    candidate_name: '',
    years_of_experience: '',
    offer_approval_email_sent_date: '',
    offer_approval_received_date: '',
    date_of_offer: new Date().toISOString().split('T')[0],
    primary_skill: '',
    secondary_skill: '',
    current_location: '',
    candidate_phone: '',
    candidate_email: '',
    candidate_address: '',
    pan: '',
    prev_org: '',
    comments: '',
    // Position Section
    designation: '',
    position: '',
    grade: '',
    department: '',
    business_unit: 'ValueMomentum',
    tsc: 'Platform, App & Infra',
    sub_tsc: 'App',
    allocation_unit: 'ValueMomentum',
    account: 'Internal Projects',
    project: '',
    employment_type: 'Full-time',
    facility: 'Hyderabad',
    work_location: 'Hyderabad',
    work_mode: 'Hybrid', 
    reporting_manager: '',
    joining_date: '',
    probation_period: '6 months',
    notice_period: '90 days',
    // Compensation Section
    current_ctc: '',
    ectc: '',
    vam_proposed_ctc: '',
    revised_ctc: '',
    total_salary: '',
    deviation: '',
    jb_amt: '',
    jb_reason: '',
    days_lapsed: '',
    np_buyout_amt: '',
    np_buyout_mail_approval_date: '',
  });

  const [expandedSections, setExpandedSections] = useState({
    candidateDemographics: true,
    recruiterDetails: true,
    orgPlacement: true,
    roleSpecs: true,
    compBase: true,
  });

  const [salaryBreakdown, setSalaryBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculatingBreakdown, setCalculatingBreakdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Auto-Save Draft logic for creation
  useEffect(() => {
    if (!id) {
      const timer = setTimeout(() => {
        localStorage.setItem('offer_letter_draft', JSON.stringify(formData));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [formData, id]);

  // Load candidate details if edit state
  useEffect(() => {
    if (id) {
      setLoading(true);
      api.getOfferLetterById(id)
        .then((data) => {
          const extra = data.extra_data || {};
          setFormData(prev => ({
            ...prev,
            candidate_name: data.candidate_name || '',
            candidate_email: data.candidate_email || '',
            candidate_phone: data.candidate_phone || '',
            pan: data.candidate_pan || '',
            status: data.status || 'Draft',
            source: data.source || 'Direct',
            designation: data.designation || '',
            position: data.position || '',
            department: data.department || '',
            joining_date: data.joining_date || '',
            facility: data.facility || 'Hyderabad',
            work_mode: data.work_mode || 'Hybrid',
            total_salary: data.total_salary ? String(data.total_salary) : '',
            current_ctc: data.current_ctc ? String(data.current_ctc) : '',
            tsc: extra.tsc || 'Platform, App & Infra',
            ectc: extra.ectc ? String(extra.ectc) : '',
            grade: extra.grade || '',
            jb_amt: extra.jb_amt ? String(extra.jb_amt) : '',
            pos_id: extra.pos_id || '',
            account: extra.account || 'Internal Projects',
            project: extra.project || '',
            sub_tsc: extra.sub_tsc || 'App',
            tag_poc: extra.tag_poc || '',
            comments: extra.comments || '',
            prev_org: extra.prev_org || '',
            deviation: extra.deviation ? String(extra.deviation) : '',
            jb_reason: extra.jb_reason || '',
            days_lapsed: extra.days_lapsed ? String(extra.days_lapsed) : '',
            revised_ctc: extra.revised_ctc ? String(extra.revised_ctc) : '',
            source_type: extra.source_type || '',
            business_unit: extra.business_unit || 'ValueMomentum',
            date_of_offer: extra.date_of_offer || '',
            notice_period: extra.notice_period || '90 days',
            np_buyout_amt: extra.np_buyout_amt ? String(extra.np_buyout_amt) : '',
            primary_skill: extra.primary_skill || '',
            work_location: extra.work_location || 'Hyderabad',
            source_details: extra.source_details || '',
            allocation_unit: extra.allocation_unit || 'ValueMomentum',
            employment_type: extra.employment_type || 'Full-time',
            secondary_skill: extra.secondary_skill || '',
            current_location: extra.current_location || '',
            probation_period: extra.probation_period || '6 months',
            vam_proposed_ctc: extra.vam_proposed_ctc ? String(extra.vam_proposed_ctc) : '',
            candidate_address: extra.candidate_address || '',
            reporting_manager: extra.reporting_manager || '',
            years_of_experience: extra.years_of_experience ? String(extra.years_of_experience) : '',
            np_buyout_mail_approval_date: extra.np_buyout_mail_approval_date || '',
            offer_approval_received_date: extra.offer_approval_received_date || '',
            offer_approval_email_sent_date: extra.offer_approval_email_sent_date || '',
          }));
          if (data.salary_breakdown) {
            try {
              setSalaryBreakdown(JSON.parse(data.salary_breakdown));
            } catch {
            }
          }
          showToast('Candidate offer details loaded successfully.', 'success');
        })
        .catch(() => {
          showToast('Failed to load candidate offer letter data.', 'error');
        })
        .finally(() => setLoading(false));
    } else {
      // Restore Draft Check
      const savedDraft = localStorage.getItem('offer_letter_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.candidate_name || parsed.candidate_email) {
            showToast('Draft offer letter recovered. Use "Restore" if you wish.', 'info');
          }
        } catch {
        }
      }
    }
  }, [id, showToast]);

  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem('offer_letter_draft');
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
        showToast('Form draft restored successfully!', 'success');
      } catch (err) {
        showToast('Failed to restore draft.', 'error');
      }
    }
  };

  const autoPopulateData = () => {
    const today = new Date().toISOString().split('T')[0];
    const joiningDate = new Date();
    joiningDate.setDate(joiningDate.getDate() + 30);
    const joiningDateStr = joiningDate.toISOString().split('T')[0];

    const mockData = {
      ...formData,
      status: 'Draft',
      tag_poc: 'Srikanth Chintala',
      pos_id: 'POS-8902',
      source: 'Direct',
      source_type: 'Job Board',
      source_details: 'Naukri.com',
      candidate_name: 'Pankaj Kumar',
      years_of_experience: '6.2',
      offer_approval_email_sent_date: today,
      offer_approval_received_date: today,
      date_of_offer: today,
      primary_skill: 'Python / Django',
      secondary_skill: 'FastAPI / React',
      current_location: 'Hyderabad',
      candidate_phone: '+91 91000 12345',
      candidate_email: 'pankaj.kumar@valuemomentum.com',
      candidate_address: 'Gachibowli Phase 2, Hyderabad, TS - 500032',
      pan: 'ABCDE1234F',
      prev_org: 'Infosys Limited',
      comments: 'Highly proficient Python engineer, cleared all rounds with high ratings.',
      designation: 'Tech Lead',
      position: 'Senior Python Developer',
      grade: 'Grade C',
      department: 'Engineering',
      business_unit: 'ValueMomentum',
      tsc: 'Platform, App & Infra',
      sub_tsc: 'App',
      allocation_unit: 'ValueMomentum',
      account: 'Internal Projects',
      project: 'Core HR Modernization',
      employment_type: 'Full-time',
      facility: 'Hyderabad',
      work_location: 'Hyderabad',
      work_mode: 'Hybrid',
      reporting_manager: 'Raghavendra Raju',
      joining_date: joiningDateStr,
      probation_period: '6 months',
      notice_period: '90 days',
      current_ctc: '1400000',
      ectc: '1850000',
      vam_proposed_ctc: '1800000',
      revised_ctc: '',
      total_salary: '1800000',
    };
    
    setFormData(mockData);
    showToast('Form pre-populated with sample candidate data!', 'success');
  };

  const handleCalculateBreakdown = async () => {
    const totalSalary = formData.total_salary;
    if (!totalSalary || Number.parseFloat(totalSalary) <= 0) {
      showToast('Please enter a valid Compensation Annual CTC amount first.', 'warning');
      return;
    }
    setCalculatingBreakdown(true);
    try {
      const res = await api.getSalaryBreakdown(Number.parseFloat(totalSalary));
      setSalaryBreakdown(res);
      showToast('Salary breakups calculated successfully!', 'success');
    } catch {
      showToast('Failed to calculate CTC salary breakdown.', 'error');
    } finally {
      setCalculatingBreakdown(false);
    }
  };

  const calculateDeviation = () => {
    const currentCtc = Number.parseFloat(formData.current_ctc) || 0;
    const totalSalary = Number.parseFloat(formData.total_salary) || 0;
    if (currentCtc > 0) {
      return (((totalSalary - currentCtc) / currentCtc) * 100).toFixed(1);
    }
    return '';
  };

  const handleChange = (name, value) => {
    const normalizedValue = name === 'pan' ? value.toUpperCase().replace(/\s+/g, '') : value;
    setFormData(prev => ({
      ...prev,
      [name]: normalizedValue
    }));
  };

  const requiredFieldsByStep = {
    1: [
      { key: 'candidate_name', label: 'Candidate Name' },
      { key: 'candidate_email', label: 'Candidate Email' },
      { key: 'candidate_phone', label: 'Candidate Phone' },
      { key: 'pan', label: 'PAN Card Number' },
      { key: 'tag_poc', label: 'Recruiter TAG POC' },
    ],
    2: [
      { key: 'designation', label: 'Designation' },
      { key: 'position', label: 'Position / Role' },
      { key: 'department', label: 'Department' },
      { key: 'joining_date', label: 'Joining Date' },
    ],
    3: [
      { key: 'total_salary', label: 'Proposed CTC' },
    ],
  };

  const isPanValid = () => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test((formData.pan || '').trim());

  const validateStep = (step) => {
    const fields = requiredFieldsByStep[step] || [];
    const missing = [];
    fields.forEach(f => {
      if (!String(formData[f.key] ?? '').trim()) {
        missing.push(f.label);
      }
    });

    if (step === 1 && formData.pan.trim() && !isPanValid()) {
      missing.push('Valid PAN Card Format (e.g. ABCDE1234F)');
    }

    return missing;
  };

  const handleNextStep = () => {
    const missing = validateStep(currentStep);
    if (missing.length > 0) {
      showToast(`Please complete required fields: ${missing.join(', ')}`, 'warning');
      return;
    }
    if (currentStep === 3) {
      // Calculate breakdown if not calculated
      if (!salaryBreakdown) {
        handleCalculateBreakdown();
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingStep1 = validateStep(1);
    const missingStep2 = validateStep(2);
    const missingStep3 = validateStep(3);
    const allMissing = [...missingStep1, ...missingStep2, ...missingStep3];

    if (allMissing.length > 0) {
      showToast(`Missing required details: ${allMissing.join(', ')}`, 'error');
      return;
    }

    setLoading(true);
    try {
      const computedDeviation = calculateDeviation();
      const payload = {
        ...formData,
        total_salary: Number.parseFloat(formData.total_salary),
        current_ctc: formData.current_ctc ? Number.parseFloat(formData.current_ctc) : undefined,
        ectc: formData.ectc ? Number.parseFloat(formData.ectc) : undefined,
        vam_proposed_ctc: formData.vam_proposed_ctc ? Number.parseFloat(formData.vam_proposed_ctc) : undefined,
        revised_ctc: formData.revised_ctc ? Number.parseFloat(formData.revised_ctc) : undefined,
        deviation: computedDeviation ? Number.parseFloat(computedDeviation) : undefined,
        jb_amt: formData.jb_amt ? Number.parseFloat(formData.jb_amt) : undefined,
        jb_date: formData.jb_date,
        np_buyout_amt: formData.np_buyout_amt ? Number.parseFloat(formData.np_buyout_amt) : undefined,
      };

      if (id) {
        await api.updateOfferLetter(id, payload);
      } else {
        await api.generateOfferLetter(payload);
      }

      // Clean local draft
      localStorage.removeItem('offer_letter_draft');
      showToast(id ? 'Offer letter updated successfully!' : 'Offer letter generation started!', 'success');
      
      setTimeout(() => {
        navigate('/offer-letters');
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Failed to generate offer letter.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '₹ 0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const deviationVal = calculateDeviation();

  return (
    <div className="offer-form-container">
      <Breadcrumbs items={[
        { label: 'Home' }, 
        { label: 'Offer Letters', path: '/offer-letters' }, 
        { label: id ? 'Edit Offer' : 'Create Offer' }
      ]} />
      
      <div className="form-header-row">
        <div>
          <h2>{id ? 'Edit Offer Letter' : 'Generate New Offer Letter'}</h2>
          <p className="small">Fill details below to render the corporate Word layout and secure PDF template.</p>
        </div>
        <div className="form-actions-top">
          {!id && (
            <>
              <button type="button" className="btn-draft-restore" onClick={handleRestoreDraft}>
                Recover Draft
              </button>
              <button type="button" className="btn-autofill" onClick={autoPopulateData}>
                Auto Fill Sample
              </button>
            </>
          )}
          <button type="button" className="btn-cancel" onClick={() => navigate('/offer-letters')}>
            Cancel
          </button>
        </div>
      </div>

      <div className="steps-bar">
        {[1, 2, 3].map(step => {
          const getStepBubbleClass = (s) => {
            if (s === currentStep) return 'active';
            if (s < currentStep) return 'passed';
            return '';
          };
          return (
          <div key={step} className="step-item-container">
            <div className="step-bubble-wrapper">
              <button 
                type="button"
                className={`step-bubble ${getStepBubbleClass(step)}`}
                onClick={() => {
                  if (step < currentStep) setCurrentStep(step);
                }}
              >
                {step < currentStep ? '✓' : step}
              </button>
              <span className={`step-label ${step === currentStep ? 'active' : ''}`}>
                {step === 1 && 'General & Recruiter'}
                {step === 2 && 'Position Details'}
                {step === 3 && 'Compensation / CTC'}
              </span>
            </div>
            {step < 3 && (
              <div className={`step-connector ${step < currentStep ? 'passed' : ''}`} />
            )}
          </div>
        )})}
      </div>

      <form onSubmit={handleSubmit} className="offer-form">
        <Card className="form-step-card">
          
          {/* STEP 1: General & Recruitment */}
          {currentStep === 1 && (
            <div className="step-fields fade-in">
              <h3 className="section-title">General & Recruiter Details</h3>
              
              <FormAccordion
                title="Candidate Information"
                isOpen={expandedSections.candidateDemographics}
                onToggle={() => toggleSection('candidateDemographics')}
                iconNameName="user"
                iconName="user"
              >
                <div className="fields-grid-3">
                  <div className="form-group-item">
                    <label htmlFor="field_495">Candidate Full Name *</label>
                    <input id="field_495" 
                      type="text" 
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.candidate_name}
                      onChange={e => handleChange('candidate_name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group-item">
                    <label htmlFor="field_506">Candidate Email *</label>
                    <input id="field_506" 
                      type="email" 
                      placeholder="e.g. candidate@example.com"
                      value={formData.candidate_email}
                      onChange={e => handleChange('candidate_email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_517">Mobile Number *</label>
                    <input id="field_517" 
                      type="tel" 
                      placeholder="e.g. +91 99000 12345"
                      value={formData.candidate_phone}
                      onChange={e => handleChange('candidate_phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_528">PAN Card Number *</label>
                    <input id="field_528" 
                      type="text" 
                      placeholder="e.g. ABCDE1234F"
                      value={formData.pan}
                      onChange={e => handleChange('pan', e.target.value)}
                      maxLength={10}
                      required
                    />
                    {formData.pan && !isPanValid() && (
                      <span className="error-text">Invalid PAN card syntax.</span>
                    )}
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_543">Current Location</label>
                    <input id="field_543" 
                      type="text" 
                      placeholder="e.g. Bangalore"
                      value={formData.current_location}
                      onChange={e => handleChange('current_location', e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_553">Candidate Address</label>
                    <input id="field_553" 
                      type="text" 
                      placeholder="Street, City, Zip"
                      value={formData.candidate_address}
                      onChange={e => handleChange('candidate_address', e.target.value)}
                    />
                  </div>
                </div>
              </FormAccordion>

              <FormAccordion
                title="Recruitment Details"
                isOpen={expandedSections.recruiterDetails}
                onToggle={() => toggleSection('recruiterDetails')}
                iconName="search"
              >
                <div className="fields-grid-3">
                  <div className="form-group-item">
                    <label htmlFor="field_572">Recruiter TAG POC Name *</label>
                    <input id="field_572" 
                      type="text" 
                      placeholder="TAG Point of Contact"
                      value={formData.tag_poc}
                      onChange={e => handleChange('tag_poc', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_583">Position / Requisition ID</label>
                    <input id="field_583" 
                      type="text" 
                      placeholder="e.g. POS-2345"
                      value={formData.pos_id}
                      onChange={e => handleChange('pos_id', e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_593">Candidate Source</label>
                    <select id="field_593"
                      value={formData.source}
                      onChange={e => handleChange('source', e.target.value)}
                    >
                      <option value="Direct">Direct</option>
                      <option value="Referral">Referral</option>
                      <option value="Agency">Agency</option>
                      <option value="Internal Transfer">Internal Transfer</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_606">Source Details</label>
                    <input id="field_606" 
                      type="text" 
                      placeholder="e.g. LinkedIn / Naukri"
                      value={formData.source_details}
                      onChange={e => handleChange('source_details', e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_616">Total Experience (Years)</label>
                    <input id="field_616" 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g. 5.5"
                      value={formData.years_of_experience}
                      onChange={e => handleChange('years_of_experience', e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_627">Previous Organization</label>
                    <input id="field_627" 
                      type="text" 
                      placeholder="Former Employer Name"
                      value={formData.prev_org}
                      onChange={e => handleChange('prev_org', e.target.value)}
                    />
                  </div>
                </div>
              </FormAccordion>
            </div>
          )}

          {/* STEP 2: Position Details */}
          {currentStep === 2 && (
            <div className="step-fields fade-in">
              <h3 className="section-title">Job & Position Details</h3>
              
              <FormAccordion
                title="Organizational Placement"
                isOpen={expandedSections.orgPlacement}
                onToggle={() => toggleSection('orgPlacement')}
                iconName="dashboard"
              >
                <div className="fields-grid-3">
                  <div className="form-group-item">
                    <label htmlFor="field_653">Department *</label>
                    <input id="field_653" 
                      type="text" 
                      placeholder="e.g. Engineering / Product"
                      value={formData.department}
                      onChange={e => handleChange('department', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_664">Business Unit</label>
                    <input id="field_664" 
                      type="text" 
                      value={formData.business_unit}
                      onChange={e => handleChange('business_unit', e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_673">Technology Solutions Center (TSC)</label>
                    <select id="field_673"
                      value={formData.tsc}
                      onChange={e => handleChange('tsc', e.target.value)}
                    >
                      <option value="Platform, App & Infra">Platform, App & Infra</option>
                      <option value="Data & Analytics">Data & Analytics</option>
                      <option value="Enterprise Services">Enterprise Services</option>
                      <option value="Digital Experience">Digital Experience</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_686">Sub-TSC</label>
                    <input id="field_686" 
                      type="text" 
                      value={formData.sub_tsc}
                      onChange={e => handleChange('sub_tsc', e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_695">Allocation Unit</label>
                    <input id="field_695" 
                      type="text" 
                      value={formData.allocation_unit}
                      onChange={e => handleChange('allocation_unit', e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_704">Client Account</label>
                    <input id="field_704" 
                      type="text" 
                      value={formData.account}
                      onChange={e => handleChange('account', e.target.value)}
                    />
                  </div>
                </div>
              </FormAccordion>

              <FormAccordion
                title="Role Specifications"
                isOpen={expandedSections.roleSpecs}
                onToggle={() => toggleSection('roleSpecs')}
                iconName="form"
              >
                <div className="fields-grid-3">
                  <div className="form-group-item">
                    <label htmlFor="field_722">Corporate Designation *</label>
                    <input id="field_722" 
                      type="text" 
                      placeholder="e.g. Tech Lead"
                      value={formData.designation}
                      onChange={e => handleChange('designation', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_733">Position / Role Title *</label>
                    <input id="field_733" 
                      type="text" 
                      placeholder="e.g. Senior Python Developer"
                      value={formData.position}
                      onChange={e => handleChange('position', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_744">Grade *</label>
                    <input id="field_744" 
                      type="text" 
                      placeholder="e.g. Grade C"
                      value={formData.grade}
                      onChange={e => handleChange('grade', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_755">Employment Type *</label>
                    <select id="field_755"
                      value={formData.employment_type}
                      onChange={e => handleChange('employment_type', e.target.value)}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contractor">Contractor</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_767">Joining Location Facility *</label>
                    <select id="field_767"
                      value={formData.facility}
                      onChange={e => handleChange('facility', e.target.value)}
                    >
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Bangalore">Bangalore</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_780">Work Mode *</label>
                    <select id="field_780"
                      value={formData.work_mode}
                      onChange={e => handleChange('work_mode', e.target.value)}
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Offline">Offline (From Office)</option>
                      <option value="Remote">Remote (WFH)</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_792">Reporting Manager Name</label>
                    <input id="field_792" 
                      type="text" 
                      placeholder="Manager Name"
                      value={formData.reporting_manager}
                      onChange={e => handleChange('reporting_manager', e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_802">Joining Date *</label>
                    <input id="field_802" 
                      type="date" 
                      value={formData.joining_date}
                      onChange={e => handleChange('joining_date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_812">Notice Period</label>
                    <input id="field_812" 
                      type="text" 
                      placeholder="e.g. 90 days"
                      value={formData.notice_period}
                      onChange={e => handleChange('notice_period', e.target.value)}
                    />
                  </div>
                </div>
              </FormAccordion>
            </div>
          )}

          {/* STEP 3: Compensation */}
          {currentStep === 3 && (
            <div className="step-fields fade-in">
              <h3 className="section-title">Compensation & Benefits</h3>
              
              <FormAccordion
                title="Compensation Structure"
                isOpen={expandedSections.compBase}
                onToggle={() => toggleSection('compBase')}
                iconName="expiry"
              >
                <div className="fields-grid-3">
                  <div className="form-group-item">
                    <label htmlFor="field_838">Proposed Annual CTC *</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input id="field_838" 
                        type="number" 
                        placeholder="e.g. 1800000"
                        value={formData.total_salary}
                        onChange={e => {
                          handleChange('total_salary', e.target.value);
                          setSalaryBreakdown(null); // Clear calculated breakdown
                        }}
                        required
                      />
                    </div>
                    {formData.total_salary && (
                      <span className="currency-preview-badge">
                        {formatCurrency(Number.parseFloat(formData.total_salary))}
                      </span>
                    )}
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_860">Current Candidate CTC</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input id="field_860" 
                        type="number" 
                        placeholder="e.g. 1400000"
                        value={formData.current_ctc}
                        onChange={e => handleChange('current_ctc', e.target.value)}
                      />
                    </div>
                    {formData.current_ctc && (
                      <span className="currency-preview-badge">
                        {formatCurrency(Number.parseFloat(formData.current_ctc))}
                      </span>
                    )}
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_878">Expected CTC (ECTC)</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input id="field_878" 
                        type="number" 
                        placeholder="e.g. 1900000"
                        value={formData.ectc}
                        onChange={e => handleChange('ectc', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_891">VAM Proposed CTC</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input id="field_891" 
                        type="number" 
                        placeholder="e.g. 1800000"
                        value={formData.vam_proposed_ctc}
                        onChange={e => handleChange('vam_proposed_ctc', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_904">Calculated CTC Increase (%)</label>
                    <input id="field_904" 
                      type="text" 
                      value={deviationVal ? `${deviationVal}%` : 'N/A'}
                      readOnly
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="field_914">Joining Bonus Amount</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input id="field_914" 
                        type="number" 
                        placeholder="e.g. 100000"
                        value={formData.jb_amt}
                        onChange={e => handleChange('jb_amt', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                  <button
                    type="button"
                    onClick={handleCalculateBreakdown}
                    disabled={calculatingBreakdown || !formData.total_salary}
                    className="btn-calculate-ctc"
                  >
                    {calculatingBreakdown ? (
                      <>
                        <span className="loader-small" style={{ marginRight: '8px', borderLeftColor: '#fff', borderRightColor: '#fff', borderTopColor: '#fff' }}></span>
                        <span>Calculating Breakdowns...</span>
                      </>
                    ) : (
                      <span>Calculate Salary Breakdown</span>
                    )}
                  </button>
                </div>
              </FormAccordion>

              {/* Dynamic salary breakdown preview table */}
              {salaryBreakdown && (
                <div className="breakdown-preview-panel fade-in">
                  <h4 className="preview-heading">Indian Salary Breakdown Stack-Up Preview</h4>
                  <div className="breakdown-table-wrapper">
                    <table className="breakdown-table">
                      <thead>
                        <tr>
                          <th>Salary Component</th>
                          <th style={{ textAlign: 'right' }}>Monthly Amount</th>
                          <th style={{ textAlign: 'right' }}>Annual Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Basic Salary</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.basicMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.basicAnnual}</td>
                        </tr>
                        <tr>
                          <td>House Rent Allowance (HRA)</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.hraMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.hraAnnual}</td>
                        </tr>
                        <tr>
                          <td>Conveyance Allowance</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.conveyanceMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.conveyanceAnnual}</td>
                        </tr>
                        <tr>
                          <td>LTA (Flexible)</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.ltaMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.ltaAnnual}</td>
                        </tr>
                        <tr>
                          <td>Meal Card (Food allowance)</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.foodMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.foodAnnual}</td>
                        </tr>
                        <tr className="subtotal-row">
                          <td><strong>Total Gross Earnings</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.totalEarningsMonthly}</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.totalEarningsAnnual}</strong></td>
                        </tr>
                        <tr>
                          <td>Employer Provident Fund (Statutory)</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.employerPfMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.employerPfAnnual}</td>
                        </tr>
                        <tr>
                          <td>Gratuity Provision</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.gratuityMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.gratuityAnnual}</td>
                        </tr>
                        <tr className="subtotal-row">
                          <td><strong>Total Statutory Benefits</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.statutoryTotalMonthly}</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.statutoryTotalAnnual}</strong></td>
                        </tr>
                        <tr className="grandtotal-row">
                          <td><strong>TOTAL ANNUAL CTC (Cost to Company)</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.ctcMonthly}</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.ctcAnnual}</strong></td>
                        </tr>
                        <tr className="deductions-header">
                          <td colSpan="3"><strong>Deductions & Net Pay Estimates</strong></td>
                        </tr>
                        <tr>
                          <td>Provident Fund Deductions (Employee + Employer)</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.deductionPfMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.deductionPfAnnual}</td>
                        </tr>
                        <tr>
                          <td>Professional Tax</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.professionalTaxMonthly}</td>
                          <td style={{ textAlign: 'right' }}>{salaryBreakdown.professionalTaxAnnual}</td>
                        </tr>
                        <tr className="subtotal-row deductions">
                          <td><strong>Total Monthly Deductions</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.totalDeductionsMonthly}</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.totalDeductionsAnnual}</strong></td>
                        </tr>
                        <tr className="netpay-row">
                          <td><strong>ESTIMATED NET TAKE-HOME SALARY</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.netMonthly}</strong></td>
                          <td style={{ textAlign: 'right' }}><strong>{salaryBreakdown.netAnnual}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Actions Bottom */}
          <div className="card-actions-bottom">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn-back"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous Step
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button" 
                className="btn-next"
                onClick={handleNextStep}
                style={{ marginLeft: 'auto' }}
              >
                Next Step
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading || !salaryBreakdown}
                style={{ marginLeft: 'auto' }}
              >
                {(() => {
                  if (loading) return 'Processing...';
                  if (id) return 'Update Offer details';
                  return 'Submit & Build PDF';
                })()}
              </button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
};



// Auto-generated PropTypes
FormAccordion.propTypes = {
  children: PropTypes.any,
  iconName: PropTypes.any,
  isOpen: PropTypes.any,
  onToggle: PropTypes.any,
  title: PropTypes.any,
};

export default OfferLetterForm;
