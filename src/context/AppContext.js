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
    logAction
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

