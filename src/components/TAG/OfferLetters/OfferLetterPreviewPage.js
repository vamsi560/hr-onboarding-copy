import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import Card from '../../UI/Card';
import Breadcrumbs from '../../UI/Breadcrumbs';
import Icon from '../../UI/Icon';
import { api } from '../../../utils/api';
import { randomNumberBetween } from '../../../utils/random';
import './OfferLetterPreviewPage.css';

const OfferLetterPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState(null);
  const [salaryBreakdown, setSalaryBreakdown] = useState(null);
  const [documentSequence] = useState(() => randomNumberBetween(100, 999));

  // Email state variables
  const [showEmailPanel] = useState(true);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const loadOfferLetter = useCallback(async () => {
    try {
      const data = await api.getOfferLetterById(id);
      setCandidateData(data);
      if (data.salary_breakdown) {
        try {
          setSalaryBreakdown(JSON.parse(data.salary_breakdown));
        } catch {
        }
      }
      
      // Initialize email template defaults
      setEmailSubject(`ValueMomentum Offer Letter - Congratulations ${data.candidate_name}!`);
      
      const extra = data.extra_data || {};
      const tagPocName = extra.tag_poc || 'HR Recruitment Team';
      const facilityVal = data.facility || 'Hyderabad';
      const workModeVal = data.work_mode || 'Hybrid';
      
      setEmailBody(`Dear ${data.candidate_name},

Congratulations!

Further to our conversation, we are pleased to extend an offer of employment to you on behalf of ValueMomentum Services Private Limited (ValueMomentum) as per the details mentioned below. The India Development Center is going through an exciting and challenging growth phase, and we would be happy to have you be a part of this journey.

Role: ${data.designation}
Date of Joining: ${data.joining_date}
Facility: ${facilityVal}
Work Mode: ${workModeVal}

We kindly ask you to thoroughly review the attached documents, namely the Offer Letter (PDF) and Flexi Benefit Document (PDF).

Please note that this offer (along with the final form of any referenced documents), represents the entire agreement between you and ValueMomentum.

You may communicate your decision over an email by tomorrow so that we can organize the next set of formalities.

Joining Co-ordinates:
Time: 10:00 AM
Facility: ${facilityVal}
Onboarding Point of Contact: HR Operations Team
TAG Recruiter POC: ${tagPocName}

Please feel free to call your TAG Recruiter POC in case you have any queries or need further information.

Thanks and Regards,
Talent Acquisition Team`);
      
    } catch {
      showToast('Failed to load candidate offer letter details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    if (id) {
      loadOfferLetter();
    }
  }, [id, loadOfferLetter]);

  const handlePrint = () => {
    globalThis.print();
  };

  const handleDownloadDocx = async () => {
    if (!candidateData) return;
    try {
      showToast('Downloading Word document draft...', 'info');
      // Format properties for docx generator
      const extra = candidateData.extra_data || {};
      const payload = {
        ...candidateData,
        pan: candidateData.candidate_pan,
        total_salary: candidateData.total_salary,
        current_ctc: candidateData.current_ctc,
        tag_poc: extra.tag_poc || 'TAG Recruiter',
        pos_id: extra.pos_id || '',
        employment_type: extra.employment_type || 'Full-time',
        grade: extra.grade || 'Grade A',
        facility: candidateData.facility || 'Hyderabad',
        work_mode: candidateData.work_mode || 'Hybrid',
      };
      const response = await api.generateDocx(payload);
      
      const link = document.createElement('a');
      link.href = response.docx_path;
      link.download = `vm_offer_letter_${candidateData.candidate_name.replace(/\s+/g, '_')}.docx`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('DOCX downloaded successfully!', 'success');
    } catch {
      showToast('Failed to download Word document.', 'error');
    }
  };

  const handleSendEmail = async () => {
    if (!candidateData) return;
    setEmailSending(true);
    try {
      const extra = candidateData.extra_data || {};
      await api.sendOfferLetterEmail({
        candidate_email: candidateData.candidate_email,
        pdf_path: candidateData.pdf_path || `/generated_offer_letters/vm_offer_letter_${candidateData.candidate_name.replace(/\s+/g, '_')}_mock.pdf`,
        candidate_name: candidateData.candidate_name,
        subject: emailSubject,
        body: emailBody.replaceAll('\n', '<br>'),
        cc_email: ccEmail || undefined,
        designation: candidateData.designation,
        joining_date: candidateData.joining_date,
        facility: candidateData.facility || 'Hyderabad',
        work_mode: candidateData.work_mode || 'Hybrid',
        tag_poc: extra.tag_poc || 'Recruiter Team'
      });
      
      // Update status locally & on backend to Offer Made
      await api.updateOfferLetterStatus(candidateData.id, 'Offer Made');
      
      setEmailSent(true);
      showToast('Offer letter email dispatched to candidate!', 'success');
      setTimeout(() => {
        navigate('/offer-letters');
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Failed to dispatch offer email.', 'error');
    } finally {
      setEmailSending(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹ 0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '[Date]';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading Offer Document Preview...</p>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="offer-preview-container text-center" style={{ padding: '60px 20px' }}>
        <Icon name="alert" size={48} style={{ color: 'var(--error)', marginBottom: '16px' }} />
        <h3>Offer details not found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>The requested candidate profile does not exist.</p>
        <button onClick={() => navigate('/offer-letters')} className="btn-back-main" style={{ marginTop: '16px', padding: '8px 20px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
    );
  }

  const extra = candidateData.extra_data || {};
  const tscVal = extra.tsc || 'Platform, App & Infra';
  const gradeVal = extra.grade || 'Grade A';

  return (
    <div className="offer-preview-container">
      <Breadcrumbs items={[
        { label: 'Home' }, 
        { label: 'Offer Letters', path: '/offer-letters' }, 
        { label: 'Review & Send' }
      ]} />

      <div className="preview-layout-row">
        
        {/* Recruiter Action Dispatch Panel (Left or Right) */}
        <div className="recruiter-dispatch-sidebar no-print">
          <Card className="dispatch-card">
            <h3>Recruiter Panel</h3>
            <p className="small">Verify computations, customize the email body, and send the secure PDF offer letter.</p>
            
            <div className="meta-details-box">
              <div className="meta-item">
                <span>Candidate</span>
                <strong>{candidateData.candidate_name}</strong>
              </div>
              <div className="meta-item">
                <span>Proposed CTC</span>
                <strong className="ctc-val">{formatCurrency(candidateData.total_salary)}</strong>
              </div>
              <div className="meta-item">
                <span>PAN Security</span>
                <strong>{candidateData.candidate_pan || 'Offer2024'}</strong>
              </div>
            </div>

            {/* Email Edit section */}
            {showEmailPanel && (
              <div className="email-edit-panel fade-in">
                <div className="form-group-field">
                  <label htmlFor="emailSubject">Email Subject</label>
                  <input 
                    id="emailSubject"
                    type="text" 
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                  />
                </div>
                
                <div className="form-group-field">
                  <label htmlFor="ccEmail">Cc Email Address (Optional)</label>
                  <input 
                    id="ccEmail"
                    type="email" 
                    placeholder="e.g. manager@valuemomentum.com"
                    value={ccEmail}
                    onChange={e => setCcEmail(e.target.value)}
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="emailBody">Email Message Copy</label>
                  <textarea 
                    id="emailBody"
                    rows={12}
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="dispatch-buttons">
              <button 
                type="button" 
                className="btn-print"
                onClick={handlePrint}
              >
                Print Preview
              </button>
              <button 
                type="button" 
                className="btn-docx"
                onClick={handleDownloadDocx}
              >
                Download DOCX
              </button>
              <button 
                type="button" 
                className="btn-send"
                onClick={handleSendEmail}
                disabled={emailSending}
              >
                {emailSending ? 'Sending...' : emailSent ? 'Email Dispatched!' : 'Send Secure Offer'}
              </button>
            </div>
          </Card>
        </div>

        {/* Times New Roman Corporate Layout Print Page (Middle) */}
        <div className="print-canvas">
          <div className="times-new-roman-canvas">
            
            {/* PAGE 1: Core Offer Details */}
            <div className="letter-page">
              <div className="page-header">
                <span className="company-watermark">ValueMomentum Software Services Private Limited</span>
                <span className="page-index">Page 1</span>
              </div>
              
              <div className="letterhead-header">
                <div className="logo-section">
                  <div className="logo-letter-square">VM</div>
                  <div>
                    <h4>ValueMomentum Software Services</h4>
                    <h5>Private Limited</h5>
                    <p>Hyderabad | Coimbatore | Pune | Bangalore</p>
                  </div>
                </div>
                <div className="doc-id-box font-sans">
                  <span className="doc-lbl">DOCUMENT ID</span>
                  <span className="doc-num">OL-{new Date().getFullYear()}-{String(documentSequence).padStart(3, '0')}</span>
                </div>
              </div>

              <div className="letter-title">
                <h2>OFFER LETTER</h2>
                <p>Date of Offer: {formatDate(candidateData.created_at || new Date())}</p>
              </div>

              <div className="salutation font-bold">
                Dear {candidateData.candidate_name},
              </div>

              <div className="letter-paragraphs text-justify">
                <p>
                  With reference to the interviews and subsequent discussions you had with us, we are pleased to extend an offer with <strong>ValueMomentum Software Services Private Limited</strong> (hereafter referred to as ValueMomentum or VM) as <span className="font-bold underline">{candidateData.designation}</span> & <span className="font-bold underline">{gradeVal}</span> in <span className="font-bold underline">{candidateData.work_location || candidateData.facility || 'Hyderabad'}</span>.
                </p>
                
                <p>
                  ValueMomentum is a leading solutions provider for the global Property & Casualty insurance industry. We help insurers stay ahead with sustained growth and high performance, enhancing stakeholder value and fostering resilient societies. Having served over 100 insurers, ValueMomentum is one of the largest services providers exclusively focused on P&C insurance.
                </p>
                
                <p>
                  We are excited to have you join our <strong>{tscVal}</strong> Technology Solution Center Team.
                </p>
                
                <p>
                  Technology Solution Centers at ValueMomentum thrive on tackling complex business challenges with innovative solutions while transforming the P&C insurance value chain. We achieve this through a strong engineering foundation and continuously refining our processes, methodologies, tools, agile delivery teams, and core engineering archetypes.
                </p>
                
                <p>
                  Our Platform, App & Infra Technology Solutions Center, you’ll be part of a team that is redefining how enterprise applications are designed, delivered, and deployed on modern cloud infrastructure. We are re-shaping the future of enterprise solutions by harnessing the power of Cloud, AI, and GenAI to build smarter, faster, and more resilient systems.
                </p>
                
                <p className="font-bold font-italic" style={{ marginTop: '12px' }}>
                  We look forward to you becoming an integral member of this team of passionate engineers.
                </p>

                {/* Required Documents Block */}
                <div className="doc-requirements-box">
                  <h5>At the time of joining, you are required to submit the following:</h5>
                  <ul className="doc-list-grid">
                    <li>1. All Educational Certificates (Mandatory)</li>
                    <li>6. Form 26 AS (Mandatory)</li>
                    <li>2. Relieving/Service Letters from all employers (Mandatory)</li>
                    <li>7. 3 Passport size photographs (Mandatory)</li>
                    <li>3. Resignation acceptance letter from previous employer</li>
                    <li>8. Aadhar Card Copy (Mandatory)</li>
                    <li>4. Last 3 Months Salary Pay Slips (Mandatory)</li>
                    <li>9. Passport Copy (Optional)</li>
                    <li>5. Form 12B or previous Employer Tax Computation</li>
                    <li>10. Pan Card Copy (Mandatory)</li>
                  </ul>
                </div>
                
                <p className="verification-clause italic font-sans">
                  Please carry all the certificates supporting your educational qualifications along with mark sheets in the original for verification. Kindly note that all the above-mentioned documents shared by you will be subject to verification.
                </p>
              </div>

              <div className="page-footer">
                <span className="footer-clause">Confidential Offer Letter Document</span>
                <span className="page-index-footer">1 of 2</span>
              </div>
            </div>

            {/* PAGE 2: Legal Terms & Salary Table */}
            <div className="letter-page" style={{ marginTop: '24px' }}>
              <div className="page-header">
                <span className="company-watermark">ValueMomentum Software Services Private Limited</span>
                <span className="page-index">Page 2</span>
              </div>

              <div className="legal-blocks text-justify">
                <div className="legal-item">
                  <h6>Background Verifications / Checks</h6>
                  <p>
                    As part of our hiring process, we conduct comprehensive background checks, which may include a criminal record check, previous employment verification, educational verification, identity validation, drug testing, and other checks. If any discrepancies or issues arise during background verification, this may affect the outcome of your employment offer or result in termination.
                  </p>
                </div>

                <div className="legal-item">
                  <h6>Assignments/Transfer/Deputation</h6>
                  <p>
                    Though you have been engaged for a specific position, shift or location, the company reserves the right to send you on training/deputation/transfer/other assignments to our other offices, sister companies, client's location, or third parties whether in India or abroad.
                  </p>
                </div>

                <div className="legal-item">
                  <h6>Termination of employment</h6>
                  <p>
                    Either party may terminate this employment by providing a notice of <strong>90 days</strong> to the other. In cases of serious misconduct, VM reserves the right to end the employment immediately without notice.
                  </p>
                </div>
              </div>

              {/* Compensation Details Table */}
              <div className="compensation-details-block" style={{ marginTop: '16px' }}>
                <div className="compensation-header-strip">
                  <h5>STACK UP DETAILS OF COMPENSATION</h5>
                  <p>Candidate Name: <strong>{candidateData.candidate_name}</strong></p>
                </div>

                <table className="preview-details-table border-collapse">
                  <thead>
                    <tr className="component-row-title">
                      <th colSpan="3">Component A - Earnings</th>
                    </tr>
                    <tr className="subheader-columns font-sans">
                      <th>Earnings</th>
                      <th style={{ textAlign: 'right', width: '25%' }}>Monthly Amount</th>
                      <th style={{ textAlign: 'right', width: '25%' }}>Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Basic Salary</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Monthly_Basic)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Annual_Basic)}</td>
                    </tr>
                    <tr>
                      <td>House Rent Allowance</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Monthly_HRA)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Annual_HRA)}</td>
                    </tr>
                    <tr>
                      <td>Conveyance</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Monthly_Conveyance)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Annual_Conveyance)}</td>
                    </tr>
                    <tr>
                      <td>LTA</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Monthly_LTA)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Annual_LTA)}</td>
                    </tr>
                    <tr>
                      <td>Food allowance</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Monthly_Food)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Annual_Food)}</td>
                    </tr>
                    <tr className="bold-subtotal-row">
                      <td>Total Earnings (A)</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Total_Earnings_Monthly)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Total_Earnings_Annual)}</td>
                    </tr>

                    <tr className="component-row-title">
                      <th colSpan="3">Component B - Statutory Benefits</th>
                    </tr>
                    <tr>
                      <td>Employer PF</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Employer_PF_Monthly)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Employer_PF_Annual)}</td>
                    </tr>
                    <tr>
                      <td>Gratuity</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Monthly_Gratuity)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Annual_Gratuity)}</td>
                    </tr>
                    <tr className="bold-subtotal-row">
                      <td>Total Statutory (B)</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Total_Statutory_Monthly)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Total_Statutory_Annual)}</td>
                    </tr>
                    
                    <tr className="bold-grand-row">
                      <td>Total Annual CTC (A+B)</td>
                      <td></td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(candidateData.total_salary)}</td>
                    </tr>

                    <tr className="component-row-title">
                      <th colSpan="3">Deductions</th>
                    </tr>
                    <tr>
                      <td>Provident Fund (Employee + Employer)</td>
                      <td style={{ textAlign: 'right' }}>₹ 3,600 (1800+1800)</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Annual_PF)}</td>
                    </tr>
                    <tr>
                      <td>Professional Tax</td>
                      <td style={{ textAlign: 'right' }}>₹ 200</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Annual_Professional_Tax)}</td>
                    </tr>
                    <tr className="bold-subtotal-row deductions">
                      <td>Total Deductions</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Total_Deductions_Monthly)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(salaryBreakdown?.Total_Deductions_Annual)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Note and Validations */}
              <div className="terms-bottom-clause font-sans text-justify" style={{ marginTop: '12px', fontSize: '8.5pt', color: '#555' }}>
                <p><strong>Note:</strong> Deductions will be made towards Provident Fund, Professional Tax, and Income Tax as applicable. You will be entitled to Benefits like Group Mediclaim Personal Insurance as per company policies. This Offer Letter is valid for you to join on or before <strong>{formatDate(candidateData.joining_date)}</strong>.</p>
              </div>

              {/* Signatures Board */}
              <div className="signatures-board flex justify-between font-sans">
                <div className="sig-block-authorized text-left">
                  <span>For ValueMomentum Software Services Private Limited</span>
                  <br />
                  <br />
                  <div className="line-sig-border"></div>
                  <strong className="sig-sub">Authorized Signatory</strong>
                </div>
                <div className="sig-block-candidate text-right">
                  <span>I accept the terms of this letter</span>
                  <br />
                  <br />
                  <div className="line-sig-border" style={{ marginLeft: 'auto' }}></div>
                  <strong className="sig-sub">Candidate's Signature</strong>
                </div>
              </div>

              <div className="page-footer">
                <span className="footer-clause">Confidential Offer Letter Document</span>
                <span className="page-index-footer">2 of 2</span>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default OfferLetterPreviewPage;
