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
    <div className=\"smart-autofill-container\">
      <div className=\"autofill-upload-section\">
        <div className=\"upload-area\">
          <input
            type=\"file\"
            accept={acceptedTypes}
            onChange={handleFileUpload}
            disabled={isProcessing}
            className=\"file-input\"
            id=\"smart-upload\"\n          />
          <label htmlFor=\"smart-upload\" className=\"upload-label\">\n            {isProcessing ? (\n              <div className=\"processing-indicator\">\n                <div className=\"spinner\"></div>\n                <span>Processing document...</span>\n              </div>\n            ) : (\n              <>\n                <div className=\"upload-icon\">📄</div>\n                <div className=\"upload-text\">\n                  <strong>Smart Auto-Fill</strong>\n                  <p>Upload a document to automatically extract and fill form data</p>\n                </div>\n              </>\n            )}\n          </label>\n        </div>\n      </div>\n\n      {extractedData && (\n        <div className=\"extracted-data-preview\">\n          <div className=\"preview-header\">\n            <h4>📋 Extracted Data Preview</h4>\n            <p>Review the information extracted from your document:</p>\n          </div>\n          \n          <div className=\"data-sections\">\n            <div className=\"data-section\">\n              <h5>Personal Information</h5>\n              <div className=\"data-grid\">\n                <div className=\"data-item\">\n                  <span className=\"label\">Name:</span>\n                  <span className=\"value\">{extractedData.firstName} {extractedData.lastName}</span>\n                </div>\n                <div className=\"data-item\">\n                  <span className=\"label\">Email:</span>\n                  <span className=\"value\">{extractedData.email}</span>\n                </div>\n                <div className=\"data-item\">\n                  <span className=\"label\">Phone:</span>\n                  <span className=\"value\">{extractedData.mobile}</span>\n                </div>\n                <div className=\"data-item\">\n                  <span className=\"label\">Address:</span>\n                  <span className=\"value\">{extractedData.address}</span>\n                </div>\n              </div>\n            </div>\n\n            <div className=\"data-section\">\n              <h5>Professional Information</h5>\n              <div className=\"data-grid\">\n                <div className=\"data-item\">\n                  <span className=\"label\">Position:</span>\n                  <span className=\"value\">{extractedData.designation}</span>\n                </div>\n                <div className=\"data-item\">\n                  <span className=\"label\">Skills:</span>\n                  <span className=\"value\">{extractedData.skills}</span>\n                </div>\n              </div>\n            </div>\n\n            {extractedData.educationalQualifications?.length > 0 && (\n              <div className=\"data-section\">\n                <h5>Education</h5>\n                {extractedData.educationalQualifications.map((edu, index) => (\n                  <div key={index} className=\"data-grid\">\n                    <div className=\"data-item\">\n                      <span className=\"label\">Degree:</span>\n                      <span className=\"value\">{edu.degree}</span>\n                    </div>\n                    <div className=\"data-item\">\n                      <span className=\"label\">Institution:</span>\n                      <span className=\"value\">{edu.institution}</span>\n                    </div>\n                  </div>\n                ))}\n              </div>\n            )}\n          </div>\n\n          <div className=\"preview-actions\">\n            <Button variant=\"secondary\" onClick={discardExtractedData}>\n              Discard\n            </Button>\n            <Button onClick={applyExtractedData}>\n              Apply to Form\n            </Button>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n};\n\nexport default SmartAutoFill;