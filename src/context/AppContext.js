import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [offerAcceptanceStatus, setOfferAcceptanceStatus] = useState(() => {
    const saved = localStorage.getItem('offerAcceptanceStatus');
    return saved ? saved : null; // null = not responded, 'accepted' = accepted, 'rejected' = rejected
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
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('location', location);
  }, [location]);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
  }, [auditLog]);

  useEffect(() => {
    localStorage.setItem('referenceChecks', JSON.stringify(referenceChecks));
  }, [referenceChecks]);

  useEffect(() => {
    localStorage.setItem('documentExpiry', JSON.stringify(documentExpiry));
  }, [documentExpiry]);

  useEffect(() => {
    if (offerAcceptanceStatus !== null) {
      localStorage.setItem('offerAcceptanceStatus', offerAcceptanceStatus);
    }
  }, [offerAcceptanceStatus]);

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const logAction = (action, details = {}) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userRole: userRole,
      action: action,
      details: details,
      location: location
    };
    setAuditLog(prev => [logEntry, ...prev].slice(0, 1000)); // Keep last 1000 entries
  };

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const addDocument = (doc) => {
    setDocuments(prev => [...prev, doc]);
  };

  const updateDocument = (id, updates) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, ...updates } : doc));
  };

  const addChatMessage = (message, type) => {
    const newMessage = { message, type, timestamp: Date.now() };
    setChatHistory(prev => [...prev, newMessage]);
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

