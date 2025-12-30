import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import './OfferAcceptance.css';

const OfferAcceptance = () => {
  const { offerAcceptanceStatus, setOfferAcceptanceStatus, userRole, logAction } = useApp();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Show modal only for candidates who haven't responded yet
  const showModal = userRole === 'candidate' && offerAcceptanceStatus === null;

  const handleAccept = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setOfferAcceptanceStatus('accepted');
      if (logAction) {
        logAction('offer_accepted', { timestamp: new Date().toISOString() });
      }
      showToast('Offer accepted! Welcome to ValueMomentum!', 'success');
      setIsProcessing(false);
    }, 500);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setOfferAcceptanceStatus('rejected');
      if (logAction) {
        logAction('offer_rejected', { timestamp: new Date().toISOString() });
      }
      showToast('Offer has been rejected. Thank you for your interest.', 'info');
      setIsProcessing(false);
    }, 500);
  };

  if (!showModal) return null;

  return (
    <Modal isOpen={showModal} onClose={() => {}} title="Job Offer - ValueMomentum">
      <div className="offer-acceptance-content">
        <div className="offer-header">
          <h2>Congratulations!</h2>
          <p className="offer-subtitle">We are pleased to extend an offer of employment to you</p>
        </div>

        <div className="offer-details">
          <div className="offer-section">
            <h3>Position Details</h3>
            <div className="offer-info-row">
              <span className="offer-label">Position:</span>
              <span className="offer-value">Software Engineer</span>
            </div>
            <div className="offer-info-row">
              <span className="offer-label">Department:</span>
              <span className="offer-value">Engineering</span>
            </div>
            <div className="offer-info-row">
              <span className="offer-label">Location:</span>
              <span className="offer-value">Hyderabad, India</span>
            </div>
            <div className="offer-info-row">
              <span className="offer-label">Start Date:</span>
              <span className="offer-value">To be confirmed</span>
            </div>
          </div>

          <div className="offer-section">
            <h3>Next Steps</h3>
            <p className="offer-description">
              By accepting this offer, you will gain access to our onboarding portal where you can:
            </p>
            <ul className="offer-benefits">
              <li>Complete your onboarding documentation</li>
              <li>Upload required documents</li>
              <li>Review important company information</li>
              <li>Track your onboarding progress</li>
            </ul>
          </div>

          <div className="offer-note">
            <p>
              <strong>Note:</strong> Please review the offer details carefully. 
              You must accept the offer to proceed with the onboarding process.
            </p>
          </div>
        </div>

        <div className="offer-actions">
          <Button
            variant="secondary"
            onClick={handleReject}
            disabled={isProcessing}
            className="offer-reject-btn"
          >
            {isProcessing ? 'Processing...' : 'Reject Offer'}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="offer-accept-btn"
          >
            {isProcessing ? 'Processing...' : 'Accept Offer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OfferAcceptance;

