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
  const [documents, setDocuments] = useState([]);
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'John Doe', status: 'ready', docs: 12, total: 12, dept: 'engineering', selected: false },
    { id: 2, name: 'Sarah Lee', status: 'pending', docs: 9, total: 12, dept: 'sales', selected: false },
    { id: 3, name: 'Mike Johnson', status: 'ready', docs: 12, total: 12, dept: 'engineering', selected: false }
  ]);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [validationHistory, setValidationHistory] = useState([]);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
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
    documents,
    setDocuments,
    addDocument,
    updateDocument,
    candidates,
    setCandidates,
    chatHistory,
    addChatMessage,
    validationHistory,
    setValidationHistory
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

