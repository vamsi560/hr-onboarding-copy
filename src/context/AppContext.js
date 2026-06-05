import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { api } from '../utils/api';
import { sanitizeData, safeStringify } from '../utils/sanitize';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('formData');
    return saved ? JSON.parse(saved) : {};
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'candidate';
  });
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('location') || 'india';
  });
  const [organization, setOrganization] = useState(() => {
    return localStorage.getItem('organization') || 'valuemomentum';
  });
  const [offerAcceptanceStatus, setOfferAcceptanceStatus] = useState(() => {
    const saved = localStorage.getItem('offerAcceptanceStatus');
    // For demo purposes, always start with null for new sessions
    if (!saved || saved === 'null') return null;
    return saved;
  });
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [documents, setDocuments] = useState([]);
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Sai Surya Vamsi Sapireddy', status: 'ready', docs: 12, total: 12, dept: 'engineering', selected: false, pending: [] },
    { id: 2, name: 'Shashank Tudum', status: 'pending', docs: 9, total: 12, dept: 'sales', selected: false, pending: ['Identity proof', 'Visa document'] },
    { id: 3, name: 'Pankaj Kumar', status: 'pending', docs: 10, total: 12, dept: 'engineering', selected: false, pending: ['Financial documents', 'Photo'] }
  ]);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [validationHistory, setValidationHistory] = useState([]);
  const [auditLog, setAuditLog] = useState(() => {
    const saved = localStorage.getItem('auditLog');
    return saved ? JSON.parse(saved) : [];
  });
  const [referenceChecks, setReferenceChecks] = useState(() => {
    const saved = localStorage.getItem('referenceChecks');
    if (saved) return JSON.parse(saved);
    // Seed sample reference checks for demo
    return [
      {
        id: 1,
        candidateId: '1',
        candidateName: 'Sai Surya Vamsi Sapireddy',
        referenceName: 'Raghavendra Raju',
        referenceEmail: 'raghavendra@valuemomentum.com',
        referencePhone: '+91 90000 00001',
        referenceCompany: 'ValueMomentum',
        referencePosition: 'Engineering Manager',
        relationship: 'manager',
        requestDate: '2024-05-10',
        responseDate: '2024-05-12',
        status: 'completed',
        rating: 5,
        feedback: 'Excellent performer with strong Python skills and ownership.',
        sentDate: '2024-05-10',
        createdAt: '2024-05-10T10:00:00.000Z',
        updatedAt: '2024-05-12T14:00:00.000Z'
      },
      {
        id: 2,
        candidateId: '2',
        candidateName: 'Shashank Tudum',
        referenceName: 'Supriya Rangdal',
        referenceEmail: 'supriya@valuemomentum.com',
        referencePhone: '+91 90000 00002',
        referenceCompany: 'ValueMomentum',
        referencePosition: 'HR Manager',
        relationship: 'manager',
        requestDate: '2024-05-15',
        responseDate: null,
        status: 'pending',
        rating: null,
        feedback: '',
        sentDate: '2024-05-15',
        createdAt: '2024-05-15T09:00:00.000Z',
        updatedAt: '2024-05-15T09:00:00.000Z'
      },
      {
        id: 3,
        candidateId: '3',
        candidateName: 'Pankaj Kumar',
        referenceName: 'Kavya',
        referenceEmail: 'kavya@valuemomentum.com',
        referencePhone: '+91 90000 00003',
        referenceCompany: 'ValueMomentum',
        referencePosition: 'Sales Lead',
        relationship: 'manager',
        requestDate: '2024-05-18',
        responseDate: '2024-05-20',
        status: 'completed',
        rating: 4,
        feedback: 'Strong sales skills and good client handling.',
        sentDate: '2024-05-18',
        createdAt: '2024-05-18T09:00:00.000Z',
        updatedAt: '2024-05-20T11:00:00.000Z'
      }
    ];
  });
  const [documentExpiry, setDocumentExpiry] = useState(() => {
    const saved = localStorage.getItem('documentExpiry');
    if (saved) return JSON.parse(saved);
    // Seed sample document expiry records for demo
    return [
      {
        id: 1,
        candidateId: '1',
        candidateName: 'Sai Surya Vamsi Sapireddy',
        documentType: 'passport',
        documentName: 'Passport',
        documentNumber: 'P1234567',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysUntilExpiry: 365 * 5,
        status: 'valid',
        notes: '',
        createdAt: '2024-05-01T10:00:00.000Z',
        updatedAt: '2024-05-01T10:00:00.000Z',
        reminderSent: false
      },
      {
        id: 2,
        candidateId: '2',
        candidateName: 'Shashank Tudum',
        documentType: 'visa',
        documentName: 'Work Visa',
        documentNumber: 'V7654321',
        issueDate: '2022-06-01',
        expiryDate: '2024-07-01',
        daysUntilExpiry: 20,
        status: 'critical',
        notes: 'Renewal in progress',
        createdAt: '2024-05-20T09:00:00.000Z',
        updatedAt: '2024-05-20T09:00:00.000Z',
        reminderSent: false
      }
    ];
  });

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', sanitizeData(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('userRole', sanitizeData(userRole));
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('location', sanitizeData(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('organization', sanitizeData(organization));
  }, [organization]);

  useEffect(() => {
    localStorage.setItem('formData', safeStringify(sanitizeData(formData)));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('chatHistory', safeStringify(sanitizeData(chatHistory)));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('auditLog', safeStringify(sanitizeData(auditLog)));
  }, [auditLog]);

  useEffect(() => {
    localStorage.setItem('referenceChecks', safeStringify(sanitizeData(referenceChecks)));
  }, [referenceChecks]);

  useEffect(() => {
    localStorage.setItem('documentExpiry', safeStringify(sanitizeData(documentExpiry)));
  }, [documentExpiry]);

  useEffect(() => {
    if (offerAcceptanceStatus !== null && offerAcceptanceStatus !== 'null') {
      localStorage.setItem('offerAcceptanceStatus', sanitizeData(offerAcceptanceStatus));
    } else {
      localStorage.removeItem('offerAcceptanceStatus');
    }
  }, [offerAcceptanceStatus]);

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', safeStringify(sanitizeData(userInfo)));
    }
  }, [userInfo]);

  // Load data from FastAPI backend when authenticated candidate / HR / TAG logs in
  useEffect(() => {
    const loadBackendData = async () => {
      if (!userInfo) return;
      
      try {
        // Fetch audit logs
        const logs = await api.getAuditLogs();
        if (logs && logs.length > 0) setAuditLog(logs);
        
        if (userRole === 'candidate') {
          // Candidates sync their own forms, docs, and chat history
          const form = await api.getOnboardingForm(userInfo.email);
          if (form && Object.keys(form.personalInfo || {}).length > 0) {
            setFormData(form);
          }
          
          const docs = await api.getDocuments(userInfo.email);
          if (docs && docs.length > 0) {
            const mappedDocs = docs.map(d => ({
              id: d.id,
              title: d.documentName,
              category: d.documentType === 'aadhar' ? 'identity' : d.documentType === 'passport' ? 'identity' : d.documentType === 'visa' ? 'identity' : 'other',
              status: d.status === 'valid' ? 'validated' : d.status === 'warning' ? 'warning' : d.status === 'invalid' ? 'invalid' : 'uploaded',
              file: d.documentName,
              uploadedAt: d.uploadedAt,
              docType: d.documentType,
              checks: d.checks,
              extractedData: d.extractedData
            }));
            setDocuments(mappedDocs);
          }
          
          const chats = await api.getChatHistory(userInfo.email);
          if (chats && chats.length > 0) setChatHistory(chats);
        } else if (userRole === 'hr' || userRole === 'tag') {
          // HR and TAG load candidates list, reference checks, document expiry tracker
          const candidateList = await api.getCandidates();
          if (candidateList && candidateList.length > 0) setCandidates(candidateList);
          
          const references = await api.getReferenceChecks();
          if (references && references.length > 0) setReferenceChecks(references);
          
          const expiries = await api.getDocumentExpiries();
          if (expiries && expiries.length > 0) setDocumentExpiry(expiries);
        }
      } catch {
      }
    };
    
    loadBackendData();
  }, [userInfo, userRole]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const logAction = async (action, details = {}) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userRole: userRole,
      action: action,
      details: details,
      location: location
    };
    setAuditLog(prev => [logEntry, ...prev].slice(0, 1000)); // Keep last 1000 entries
    try {
      await api.addAuditLog(userRole, action, details, location);
    } catch {
    }
  };

  const updateFormData = async (data) => {
    setFormData(prev => {
      const updated = { ...prev, ...data };
      if (userInfo?.email) {
        api.saveOnboardingForm(userInfo.email, updated).catch(() => {});
      }
      return updated;
    });
  };

  const addDocument = async (doc) => {
    setDocuments(prev => {
      const filtered = prev.filter(d => !(d.docType === doc.docType));
      const updated = [...filtered, doc];
      if (userInfo?.email) {
        const payload = {
          id: doc.id ? doc.id.toString() : `doc_${Date.now()}`,
          candidateEmail: userInfo.email,
          documentType: doc.docType,
          documentName: doc.file || doc.title,
          uploadedAt: doc.uploadedAt || new Date().toISOString(),
          status: doc.status === 'validated' ? 'valid' : doc.status === 'invalid' ? 'invalid' : doc.status === 'warning' ? 'warning' : 'pending',
          overallConfidence: doc.checks ? 95 : 0,
          checks: doc.checks || {},
          extractedData: doc.extractedData || {}
        };
        api.updateDocumentStatus(userInfo.email, payload.id, payload).catch(() => {});
      }
      return updated;
    });
  };

  const updateDocument = async (id, updates) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, ...updates } : doc));
    if (userInfo?.email) {
      try {
        const backendUpdates = { ...updates };
        if (updates.status) {
          backendUpdates.status = updates.status === 'validated' ? 'valid' : 
                                  updates.status === 'invalid' ? 'invalid' : 
                                  updates.status === 'warning' ? 'warning' : 'pending';
        }
        await api.updateDocumentStatus(userInfo.email, id, backendUpdates);
      } catch {
      }
    }
  };

  const addChatMessage = async (message, type) => {
    const newMessage = { message, type, timestamp: Date.now() };
    setChatHistory(prev => [...prev, newMessage]);
    if (userInfo?.email) {
      try {
        const botReply = await api.sendChatMessage(userInfo.email, message, type);
        if (botReply) {
          setChatHistory(prev => [...prev, botReply]);
        }
      } catch {
      }
    }
  };

  const resetOfferAcceptance = () => {
    setOfferAcceptanceStatus(null);
    localStorage.removeItem('offerAcceptanceStatus');
  };

  const value = {
    darkMode,
    toggleDarkMode,
    formData,
    updateFormData,
    userRole,
    setUserRole,
    location,
    setLocation,
    organization,
    setOrganization,
    offerAcceptanceStatus,
    setOfferAcceptanceStatus,
    userInfo,
    setUserInfo,
    documents,
    setDocuments,
    addDocument,
    updateDocument,
    candidates,
    setCandidates,
    chatHistory,
    addChatMessage,
    resetOfferAcceptance,
    validationHistory,
    setValidationHistory,
    auditLog,
    logAction,
    referenceChecks,
    setReferenceChecks,
    documentExpiry,
    setDocumentExpiry
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};



// Auto-generated PropTypes
AppProvider.propTypes = {
  children: PropTypes.any,
};
