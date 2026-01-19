/**
 * Document Validation Service
 * Handles AI-powered document validation including OCR, data extraction, and cross-validation
 */

// Document type configurations
export const DOCUMENT_RULES = {
  aadhar: {
    name: 'Aadhaar Card',
    requiredFields: ['name', 'dateOfBirth', 'aadhaarNumber', 'address'],
    formatChecks: {
      aadhaarNumber: /^\d{4}\s?\d{4}\s?\d{4}$/,
      name: /^[A-Za-z\s]{3,50}$/
    },
    crossCheckFields: ['name', 'dateOfBirth', 'address']
  },
  passport: {
    name: 'Passport',
    requiredFields: ['name', 'passportNumber', 'dateOfBirth', 'nationality', 'expiryDate'],
    formatChecks: {
      passportNumber: /^[A-Z]{1,2}\d{7,9}$/,
      expiryDate: /^\d{4}-\d{2}-\d{2}$/
    },
    crossCheckFields: ['name', 'dateOfBirth']
  },
  visa: {
    name: 'Visa Document',
    requiredFields: ['visaType', 'visaNumber', 'expiryDate'],
    formatChecks: {
      visaNumber: /^[A-Z0-9]{6,20}$/
    },
    crossCheckFields: []
  },
  education: {
    name: 'Educational Certificate',
    requiredFields: ['degree', 'institution', 'yearOfPassing'],
    formatChecks: {
      yearOfPassing: /^\d{4}$/,
      percentage: /^\d{1,3}(\.\d{1,2})?%?$/
    },
    crossCheckFields: ['institution', 'yearOfPassing']
  },
  payslip: {
    name: 'Pay Slip',
    requiredFields: ['employerName', 'salary', 'month', 'year'],
    formatChecks: {
      salary: /^\d+$/,
      month: /^(0[1-9]|1[0-2])$/,
      year: /^\d{4}$/
    },
    crossCheckFields: ['employerName']
  },
  bankStatement: {
    name: 'Bank Statement',
    requiredFields: ['accountNumber', 'bankName', 'statementPeriod'],
    formatChecks: {
      accountNumber: /^\d{9,18}$/
    },
    crossCheckFields: ['accountNumber']
  }
};

/**
 * Format validation - Check file type, size, and basic format
 */
export const validateFormat = (file) => {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/jpeg',
    'image/png'
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  const issues = [];
  
  if (!validTypes.includes(file.type)) {
    issues.push({
      severity: 'error',
      category: 'format',
      message: `Invalid file type. Allowed: PDF, DOCX, JPG, PNG`,
      field: 'fileType'
    });
  }
  
  if (file.size > maxSize) {
    issues.push({
      severity: 'error',
      category: 'format',
      message: `File size exceeds 10MB limit. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      field: 'fileSize'
    });
  }
  
  return {
    status: issues.length === 0 ? 'pass' : 'fail',
    confidence: issues.length === 0 ? 100 : 0,
    message: issues.length === 0 ? 'Format validation passed' : 'Format validation failed',
    issues
  };
};

/**
 * Quality validation - Check image/document quality
 */
export const validateQuality = async (file) => {
  // Mock quality check - In production, this would use image processing
  const issues = [];
  
  // Simulate quality checks
  if (file.type.startsWith('image/')) {
    // Check if image is too small (mock)
    if (file.size < 50000) { // Less than 50KB might be low quality
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: 'Image file size is small. Please ensure the image is clear and readable.',
        suggestion: 'Upload a higher resolution image'
      });
    }
  }
  
  return {
    status: issues.length === 0 ? 'pass' : 'warning',
    confidence: issues.length === 0 ? 95 : 75,
    message: issues.length === 0 ? 'Quality check passed' : 'Quality check has warnings',
    issues
  };
};

/**
 * OCR and Data Extraction - Extract text and structured data from document
 * In production, this would call OCR service (AWS Textract, Tesseract, etc.)
 */
export const extractDocumentData = async (file, documentType) => {
  // Mock extraction - In production, this would use OCR service
  
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock extracted data based on document type
  const mockExtractedData = {
    aadhar: {
      name: 'Shashank Tudum',
      dateOfBirth: '1990-05-15',
      aadhaarNumber: '1234 5678 9012',
      address: '123 Main Street, Hyderabad, Telangana, India'
    },
    passport: {
      name: 'Shashank Tudum',
      passportNumber: 'A12345678',
      dateOfBirth: '1990-05-15',
      nationality: 'Indian',
      expiryDate: '2030-05-15'
    },
    education: {
      degree: 'Bachelor of Engineering',
      institution: 'University of Technology',
      yearOfPassing: '2012',
      percentage: '85%'
    },
    payslip: {
      employerName: 'Previous Company',
      salary: '50000',
      month: '03',
      year: '2024'
    }
  };
  
  const extractedData = mockExtractedData[documentType] || {};
  
  return {
    status: 'pass',
    confidence: 90,
    message: 'Data extraction completed',
    extractedData,
    rawText: 'Mock OCR extracted text...' // In production, this would be actual OCR text
  };
};

/**
 * Field Comparison - Compare extracted data with form data
 */
export const compareFields = (extractedData, formData, documentType) => {
  const rules = DOCUMENT_RULES[documentType];
  if (!rules) {
    return {
      status: 'warning',
      confidence: 50,
      message: 'No validation rules found for this document type',
      comparisons: []
    };
  }
  
  const comparisons = [];
  let matchCount = 0;
  let totalChecks = 0;
  
  rules.crossCheckFields.forEach(field => {
    totalChecks++;
    const formValue = formData[field] || '';
    const docValue = extractedData[field] || '';
    
    // Normalize values for comparison
    const normalizedForm = formValue.toString().toLowerCase().trim();
    const normalizedDoc = docValue.toString().toLowerCase().trim();
    
    // Fuzzy matching (simple version - in production, use more sophisticated matching)
    const match = normalizedForm === normalizedDoc || 
                  normalizedForm.includes(normalizedDoc) || 
                  normalizedDoc.includes(normalizedForm);
    
    const confidence = match ? 95 : 30;
    if (match) matchCount++;
    
    comparisons.push({
      fieldName: field,
      formValue: formValue || 'Not provided',
      documentValue: docValue || 'Not found',
      match,
      confidence,
      discrepancy: match ? null : `Form: "${formValue}" vs Document: "${docValue}"`
    });
  });
  
  const overallConfidence = totalChecks > 0 ? (matchCount / totalChecks) * 100 : 0;
  
  return {
    status: matchCount === totalChecks ? 'pass' : matchCount > 0 ? 'warning' : 'fail',
    confidence: overallConfidence,
    message: `${matchCount} of ${totalChecks} fields matched`,
    comparisons
  };
};

/**
 * Authenticity Check - Detect tampering, fraud, or inconsistencies
 */
export const checkAuthenticity = async (file, extractedData, documentType) => {
  const issues = [];
  
  // Mock authenticity checks
  // In production, this would use:
  // - Image forensics (detect editing)
  // - Template matching
  // - Security feature detection
  // - ML-based fraud detection
  
  // Simulate some checks
  if (extractedData && Object.keys(extractedData).length === 0) {
    issues.push({
      severity: 'warning',
      category: 'authenticity',
      message: 'Could not extract sufficient data from document. Please ensure document is clear and readable.',
      suggestion: 'Upload a clearer image or scan'
    });
  }
  
  // Check for suspicious patterns (mock)
  if (documentType === 'aadhar' && extractedData.aadhaarNumber) {
    // Check if Aadhaar number format is valid
    const aadhaarRegex = /^\d{4}\s?\d{4}\s?\d{4}$/;
    if (!aadhaarRegex.test(extractedData.aadhaarNumber)) {
      issues.push({
        severity: 'error',
        category: 'authenticity',
        message: 'Aadhaar number format appears invalid',
        field: 'aadhaarNumber'
      });
    }
  }
  
  return {
    status: issues.length === 0 ? 'pass' : issues.some(i => i.severity === 'error') ? 'fail' : 'warning',
    confidence: issues.length === 0 ? 92 : issues.some(i => i.severity === 'error') ? 40 : 75,
    message: issues.length === 0 ? 'Authenticity check passed' : 'Authenticity check found issues',
    issues
  };
};

/**
 * Completeness Check - Verify all required fields are present
 */
export const checkCompleteness = (extractedData, documentType) => {
  const rules = DOCUMENT_RULES[documentType];
  if (!rules) {
    return {
      status: 'warning',
      confidence: 50,
      message: 'No validation rules found',
      missingFields: []
    };
  }
  
  const missingFields = rules.requiredFields.filter(field => {
    const value = extractedData[field];
    return !value || value.toString().trim() === '';
  });
  
  return {
    status: missingFields.length === 0 ? 'pass' : 'fail',
    confidence: missingFields.length === 0 ? 100 : 100 - (missingFields.length / rules.requiredFields.length) * 100,
    message: missingFields.length === 0 
      ? 'All required fields present' 
      : `Missing ${missingFields.length} required field(s)`,
    missingFields
  };
};

/**
 * Main Validation Function - Orchestrates all validation checks
 */
export const validateDocument = async (file, documentType, formData = {}) => {
  const startTime = Date.now();
  const allIssues = [];
  const recommendations = [];
  
  try {
    // 1. Format Validation
    const formatCheck = validateFormat(file);
    allIssues.push(...(formatCheck.issues || []));
    
    if (formatCheck.status === 'fail') {
      return {
        documentId: Date.now().toString(),
        documentType,
        documentName: file.name,
        uploadedAt: new Date().toISOString(),
        status: 'invalid',
        overallConfidence: 0,
        checks: {
          format: formatCheck,
          quality: { status: 'pending', confidence: 0, message: 'Skipped due to format failure' },
          extraction: { status: 'pending', confidence: 0, message: 'Skipped due to format failure' },
          consistency: { status: 'pending', confidence: 0, message: 'Skipped due to format failure' },
          authenticity: { status: 'pending', confidence: 0, message: 'Skipped due to format failure' },
          completeness: { status: 'pending', confidence: 0, message: 'Skipped due to format failure' }
        },
        extractedData: {},
        fieldComparisons: [],
        issues: allIssues,
        recommendations: ['Please upload a valid file format (PDF, DOCX, JPG, PNG)'],
        processingTime: Date.now() - startTime,
        aiModel: 'mock-v1.0',
        version: '1.0.0'
      };
    }
    
    // 2. Quality Validation
    const qualityCheck = await validateQuality(file);
    allIssues.push(...(qualityCheck.issues || []));
    
    // 3. Data Extraction (OCR)
    const extractionResult = await extractDocumentData(file, documentType);
    allIssues.push(...(extractionResult.issues || []));
    
    // 4. Completeness Check
    const completenessCheck = checkCompleteness(extractionResult.extractedData, documentType);
    if (completenessCheck.missingFields.length > 0) {
      allIssues.push({
        severity: 'error',
        category: 'completeness',
        message: `Missing required fields: ${completenessCheck.missingFields.join(', ')}`,
        suggestion: 'Please ensure all required information is visible in the document'
      });
    }
    
    // 5. Field Comparison
    const consistencyCheck = compareFields(
      extractionResult.extractedData,
      formData,
      documentType
    );
    
    // Add mismatches as issues
    consistencyCheck.comparisons.forEach(comp => {
      if (!comp.match) {
        allIssues.push({
          severity: 'warning',
          category: 'consistency',
          message: `Field "${comp.fieldName}" does not match between form and document`,
          field: comp.fieldName,
          suggestion: 'Please verify the information matches your form data'
        });
      }
    });
    
    // 6. Authenticity Check
    const authenticityCheck = await checkAuthenticity(
      file,
      extractionResult.extractedData,
      documentType
    );
    allIssues.push(...(authenticityCheck.issues || []));
    
    // Aggregate results
    const checks = {
      format: formatCheck,
      quality: qualityCheck,
      extraction: extractionResult,
      consistency: consistencyCheck,
      authenticity: authenticityCheck,
      completeness: completenessCheck
    };
    
    // Calculate overall confidence
    const confidences = [
      formatCheck.confidence,
      qualityCheck.confidence,
      extractionResult.confidence,
      consistencyCheck.confidence,
      authenticityCheck.confidence,
      completenessCheck.confidence
    ].filter(c => c > 0);
    
    const overallConfidence = confidences.length > 0
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 0;
    
    // Determine overall status
    const hasErrors = allIssues.some(i => i.severity === 'error');
    const hasWarnings = allIssues.some(i => i.severity === 'warning');
    
    let status = 'valid';
    if (hasErrors || overallConfidence < 50) {
      status = 'invalid';
    } else if (hasWarnings || overallConfidence < 80) {
      status = 'warning';
    }
    
    // Generate recommendations
    if (hasErrors) {
      recommendations.push('Please review and correct the errors before proceeding');
    }
    if (hasWarnings) {
      recommendations.push('Please review the warnings and verify the information');
    }
    if (overallConfidence >= 90) {
      recommendations.push('Document validation passed. You can proceed with onboarding.');
    }
    
    return {
      documentId: Date.now().toString(),
      documentType,
      documentName: file.name,
      uploadedAt: new Date().toISOString(),
      status,
      overallConfidence,
      checks,
      extractedData: extractionResult.extractedData,
      fieldComparisons: consistencyCheck.comparisons,
      issues: allIssues,
      recommendations,
      processingTime: Date.now() - startTime,
      aiModel: 'mock-v1.0',
      version: '1.0.0'
    };
    
  } catch (error) {
    console.error('Validation error:', error);
    return {
      documentId: Date.now().toString(),
      documentType,
      documentName: file.name,
      uploadedAt: new Date().toISOString(),
      status: 'error',
      overallConfidence: 0,
      checks: {},
      extractedData: {},
      fieldComparisons: [],
      issues: [{
        severity: 'error',
        category: 'system',
        message: 'Validation failed due to system error',
        suggestion: 'Please try uploading again or contact support'
      }],
      recommendations: ['Please try uploading the document again'],
      processingTime: Date.now() - startTime,
      aiModel: 'mock-v1.0',
      version: '1.0.0',
      error: error.message
    };
  }
};

/**
 * Batch validation for multiple documents
 */
export const validateDocuments = async (files, documentTypes, formData) => {
  const results = await Promise.all(
    files.map((file, index) => 
      validateDocument(file, documentTypes[index] || 'other', formData)
    )
  );
  
  return results;
};

