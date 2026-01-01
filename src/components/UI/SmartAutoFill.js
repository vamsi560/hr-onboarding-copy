import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Button from '../UI/Button';
import './SmartAutoFill.css';

const SmartAutoFill = ({ onDataExtracted, acceptedTypes = '.pdf,.doc,.docx,.jpg,.png' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const { showToast } = useToast();

  // Mock OCR/AI extraction - In production, this would call an AI service
  const extractDataFromDocument = async (file) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted data based on file type
    const mockData = {
      // Personal Information
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      mobile: '+1 555-123-4567',
      address: '123 Main Street, City, State 12345',
      
      // Professional Information
      designation: 'Senior Software Engineer',
      skills: 'JavaScript, React, Node.js, Python, AWS',
      
      // Educational Information
      educationalQualifications: [
        {
          degree: 'bachelor',
          institution: 'University of Technology',
          board: 'State University',
          yearOfPassing: '2018',
          percentage: '85%'
        }
      ],
      
      // Professional Experience
      professionalDetails: [
        {
          company: 'Tech Solutions Inc.',
          position: 'Software Engineer',
          startDate: '2018-06-01',
          endDate: '2023-05-31',
          responsibilities: 'Developed web applications using React and Node.js',
          achievements: 'Led a team of 3 developers, improved system performance by 40%'
        }
      ],
      
      // Certifications
      certifications: [
        {
          name: 'AWS Certified Developer',
          number: 'AWS-DEV-2023-001',
          expiryDate: '2026-12-31'
        }
      ]
    };
    
    setExtractedData(mockData);
    setIsProcessing(false);
    
    showToast('Document processed successfully! Review the extracted data below.', 'success');
    
    return mockData;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      showToast('Please upload a valid document format', 'error');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size should be less than 10MB', 'error');
      return;
    }

    try {
      const data = await extractDataFromDocument(file);
      setExtractedData(data);
    } catch (error) {
      showToast('Failed to process document. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const applyExtractedData = () => {
    if (extractedData && onDataExtracted) {
      onDataExtracted(extractedData);
      showToast('Form auto-filled successfully!', 'success');
      setExtractedData(null);
    }
  };

  const discardExtractedData = () => {
    setExtractedData(null);
    showToast('Extracted data discarded', 'info');
  };

  return (
    <div className="smart-autofill-container">
      <div className="autofill-upload-section">
        <div className="upload-area">
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="file-input"
            id="smart-upload"
          />
          <label htmlFor="smart-upload" className="upload-label">
            {isProcessing ? (
              <div className="processing-indicator">
                <div className="spinner"></div>
                <span>Processing document...</span>
              </div>
            ) : (
              <>
                <div className="upload-icon">📄</div>
                <div className="upload-text">
                  <strong>Smart Auto-Fill</strong>
                  <p>Upload a document to automatically extract and fill form data</p>
                </div>
              </>
            )}
          </label>
        </div>
      </div>

      {extractedData && (
        <div className="extracted-data-preview">
          <div className="preview-header">
            <h4>📋 Extracted Data Preview</h4>
            <p>Review the information extracted from your document:</p>
          </div>
          
          <div className="data-sections">
            <div className="data-section">
              <h5>Personal Information</h5>
              <div className="data-grid">
                <div className="data-item">
                  <span className="label">Name:</span>
                  <span className="value">{extractedData.firstName} {extractedData.lastName}</span>
                </div>
                <div className="data-item">
                  <span className="label">Email:</span>
                  <span className="value">{extractedData.email}</span>
                </div>
                <div className="data-item">
                  <span className="label">Phone:</span>
                  <span className="value">{extractedData.mobile}</span>
                </div>
                <div className="data-item">
                  <span className="label">Address:</span>
                  <span className="value">{extractedData.address}</span>
                </div>
              </div>
            </div>

            <div className="data-section">
              <h5>Professional Information</h5>
              <div className="data-grid">
                <div className="data-item">
                  <span className="label">Position:</span>
                  <span className="value">{extractedData.designation}</span>
                </div>
                <div className="data-item">
                  <span className="label">Skills:</span>
                  <span className="value">{extractedData.skills}</span>
                </div>
              </div>
            </div>

            {extractedData.educationalQualifications?.length > 0 && (
              <div className="data-section">
                <h5>Education</h5>
                {extractedData.educationalQualifications.map((edu, index) => (
                  <div key={index} className="data-grid">
                    <div className="data-item">
                      <span className="label">Degree:</span>
                      <span className="value">{edu.degree}</span>
                    </div>
                    <div className="data-item">
                      <span className="label">Institution:</span>
                      <span className="value">{edu.institution}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="preview-actions">
            <Button variant="secondary" onClick={discardExtractedData}>
              Discard
            </Button>
            <Button onClick={applyExtractedData}>
              Apply to Form
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAutoFill;