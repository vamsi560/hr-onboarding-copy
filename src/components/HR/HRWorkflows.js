import React from 'react';
import Card from '../UI/Card';
import Breadcrumbs from '../UI/Breadcrumbs';
import './HRReview.css';

const HRWorkflows = () => {
  return (
    <div className="hr-review">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Workflows' }]} />
      <Card>
        <h3>Onboarding Workflows</h3>
        <p className="small">
          High-level view of the onboarding process and HR checkpoints.
        </p>
        <div className="workflow-grid">
          <Card className="workflow-card">
            <h4>1. Candidate Registration</h4>
            <ul>
              <li>Create candidate record</li>
              <li>Assign joining location (India / US)</li>
              <li>Share onboarding portal link</li>
            </ul>
          </Card>
          <Card className="workflow-card">
            <h4>2. Personal & Professional Details</h4>
            <ul>
              <li>Personal information + photo</li>
              <li>Professional details, certifications, skills</li>
              <li>Visa information (if applicable)</li>
            </ul>
          </Card>
          <Card className="workflow-card">
            <h4>3. Documents Collection</h4>
            <ul>
              <li>Identity: Aadhaar / Passport / Visa</li>
              <li>Education: Highest degree certificate</li>
              <li>Financial: Pay slips / PF statement</li>
            </ul>
          </Card>
          <Card className="workflow-card">
            <h4>4. HR Review & Closure</h4>
            <ul>
              <li>AI validation checks & manual review</li>
              <li>Resolve exceptions</li>
              <li>Confirm onboarding completion</li>
            </ul>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default HRWorkflows;


