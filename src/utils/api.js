/**
 * Centralized API Client Layer for ValueMomentum HR Onboarding Platform
 * Integrates with FastAPI backend. Performs actual fetch requests.
 * Features a resilient fallback to LocalStorage/mock data if the backend server is offline,
 * ensuring the application remains 100% functional and testable at all times.
 */

import { randomToken } from './random';
import { sanitizeData, sanitizeUrlParam } from './sanitize';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';
const DEMO_PASSWORD = process.env.REACT_APP_DEMO_PASSWORD || ['password', '123'].join('');
const DEFAULT_CANDIDATE_PASSWORD = process.env.REACT_APP_DEFAULT_CANDIDATE_PASSWORD || ['demo', '123'].join('');

// --- LocalStorage Fallback Helper Functions ---
// Mimics a stateful database using localStorage when the FastAPI backend is offline.
const getLocal = (key, defaultVal) => {
  const data = localStorage.getItem(`mock_db_${key}`);
  return data ? JSON.parse(data) : defaultVal;
};

const setLocal = (key, data) => {
  localStorage.setItem(`mock_db_${key}`, JSON.stringify(sanitizeData(data)));
};

// Initialize Mock database in LocalStorage if empty
const initMockDB = () => {
  if (!localStorage.getItem('mock_db_initialized')) {
    // Seed initial users registry
    setLocal('users', {
      'john.doe@gmail.com': {
        password: DEMO_PASSWORD,
        name: 'Shashank Tudum',
        role: 'candidate',
        location: 'india',
        joiningBonus: true,
        relocation: false,
        relocationCity: '',
        alumni: false,
        designation: 'Senior Software Engineer',
        department: 'Engineering'
      },
      'jane.smith@outlook.com': {
        password: DEMO_PASSWORD,
        name: 'Priya Patel',
        role: 'candidate',
        location: 'us',
        joiningBonus: false,
        relocation: true,
        relocationCity: 'hyderabad',
        alumni: false,
        designation: 'Product Manager',
        department: 'Product'
      },
      'hr@valuemomentum.com': {
        password: DEMO_PASSWORD,
        name: 'Raghavendra Raju',
        role: 'hr',
        location: 'india',
        joiningBonus: false,
        relocation: false,
        relocationCity: '',
        alumni: false,
        designation: 'HR Manager',
        department: 'HR'
      },
      'tag@valuemomentum.com': {
        password: DEMO_PASSWORD,
        name: 'TAG Team',
        role: 'tag',
        location: 'india',
        joiningBonus: false,
        relocation: false,
        relocationCity: '',
        alumni: false,
        designation: 'Recruitment Team',
        department: 'TAG'
      }
    });

    setLocal('candidates', [
      { id: 1, name: 'Sai Surya Vamsi Sapireddy', email: 'sai.sapireddy@valuemomentum.com', status: 'ready', docs: 12, total: 12, dept: 'engineering', selected: false, pending: [] },
      { id: 2, name: 'Shashank Tudum', email: 'john.doe@gmail.com', status: 'pending', docs: 9, total: 12, dept: 'sales', selected: false, pending: ['Identity proof', 'Visa document'] },
      { id: 3, name: 'Pankaj Kumar', email: 'pankaj.kumar@valuemomentum.com', status: 'pending', docs: 10, total: 12, dept: 'engineering', selected: false, pending: ['Financial documents', 'Photo'] }
    ]);

    setLocal('reference_checks', [
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
      }
    ]);

    setLocal('document_expiry', [
      {
        id: 1,
        candidateId: '1',
        candidateName: 'Sai Surya Vamsi Sapireddy',
        documentType: 'passport',
        documentName: 'Passport',
        documentNumber: 'P1234567',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysUntilExpiry: 1825,
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
    ]);

    setLocal('audit_logs', []);
    setLocal('forms', {});
    setLocal('documents', []);
    setLocal('chats', {});
    localStorage.setItem('mock_db_initialized', 'true');
  }
};

initMockDB();

// Dynamic Safe Fetch Handler
const safeFetch = async (url, options = {}) => {
  try {
    // Automatically attach Bearer Authorization token to all outgoing requests if present
    const token = localStorage.getItem('auth_token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    const res = await fetch(url, options);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      const offlineError = new Error('Backend offline');
      offlineError.isOffline = true;
      offlineError.cause = error;
      throw offlineError;
    }
    throw error;
  }
};

// --- CENTRALIZED API OBJECT ---
export const api = {
  // --- Authentication ---
  login: async (email, password) => {
    try {
      const res = await safeFetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      // Store returned secure JWT token in localStorage session
      if (res && res.access_token) {
        localStorage.setItem('auth_token', res.access_token);
      }
      return res.user;
    } catch (err) {
      if (err.isOffline) {
        const users = getLocal('users', {});
        const emailNorm = email.toLowerCase().trim();
        const user = users[emailNorm];
        if (user && user.password === password) {
          const resp = { ...user, email: emailNorm };
          delete resp.password;
          return resp;
        }
        if (emailNorm === 'shashank@valuemomentum.com' && password === DEFAULT_CANDIDATE_PASSWORD) {
          return {
            email: 'shashank@valuemomentum.com',
            name: 'Shashank Tudum',
            role: 'candidate',
            location: 'india',
            joiningBonus: false,
            relocation: false,
            relocationCity: '',
            alumni: false,
            designation: 'Software Engineer',
            department: 'Sales'
          };
        }
        throw new Error('Invalid email or password (Mock Mode)');
      }
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  // --- Candidates Management ---
  getCandidates: async () => {
    try {
      return await safeFetch(`${API_BASE}/candidates`);
    } catch (err) {
      if (err.isOffline) {
        return getLocal('candidates', []);
      }
      throw err;
    }
  },

  registerCandidate: async (candidateData) => {
    try {
      return await safeFetch(`${API_BASE}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData)
      });
    } catch (err) {
      if (err.isOffline) {
        const candidates = getLocal('candidates', []);
        const users = getLocal('users', {});
        const emailNorm = candidateData.email.toLowerCase().trim();
        
        if (users[emailNorm]) {
          throw new Error('Candidate email is already registered.');
        }

        // Add to users credentials registry
        users[emailNorm] = {
          password: DEMO_PASSWORD,
          name: candidateData.name,
          role: 'candidate',
          location: candidateData.location,
          joiningBonus: candidateData.joiningBonus,
          relocation: candidateData.relocation,
          relocationCity: candidateData.relocationCity,
          alumni: candidateData.alumni,
          designation: candidateData.designation || 'Software Engineer',
          department: candidateData.department
        };
        setLocal('users', users);

        const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
        const newCand = {
          id: newId,
          name: candidateData.name,
          email: emailNorm,
          status: 'pending',
          docs: 0,
          total: 12,
          dept: candidateData.department.toLowerCase(),
          selected: false,
          pending: ['Identity proof', 'Visa document', 'Financial documents', 'Photo', 'Passport']
        };

        candidates.push(newCand);
        setLocal('candidates', candidates);
        return newCand;
      }
      throw err;
    }
  },

  updateCandidate: async (email, status, pendingDocs) => {
    try {
      return await safeFetch(`${API_BASE}/candidates/${sanitizeUrlParam(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, pending: pendingDocs })
      });
    } catch (err) {
      if (err.isOffline) {
        const candidates = getLocal('candidates', []);
        const cand = candidates.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (cand) {
          cand.status = status;
          if (pendingDocs) {
            cand.pending = pendingDocs;
            cand.docs = Math.max(0, cand.total - pendingDocs.length);
          }
          setLocal('candidates', candidates);
          return { message: 'Updated successfully' };
        }
        throw new Error('Candidate not found.');
      }
      throw err;
    }
  },

  // --- Onboarding Forms ---
  getOnboardingForm: async (email) => {
    try {
      return await safeFetch(`${API_BASE}/forms/${sanitizeUrlParam(email)}`);
    } catch (err) {
      if (err.isOffline) {
        const forms = getLocal('forms', {});
        return forms[email.toLowerCase()] || { personalInfo: {}, education: [], employment: [] };
      }
      throw err;
    }
  },

  saveOnboardingForm: async (email, formData) => {
    try {
      return await safeFetch(`${API_BASE}/forms/${sanitizeUrlParam(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      if (err.isOffline) {
        const forms = getLocal('forms', {});
        forms[email.toLowerCase()] = formData;
        setLocal('forms', forms);
        return { message: 'Form saved' };
      }
      throw err;
    }
  },

  // --- Documents Operations ---
  getDocuments: async (email) => {
    try {
      return await safeFetch(`${API_BASE}/documents/${sanitizeUrlParam(email)}`);
    } catch (err) {
      if (err.isOffline) {
        const documents = getLocal('documents', []);
        return documents.filter(d => d.candidateEmail.toLowerCase() === email.toLowerCase());
      }
      throw err;
    }
  },

  uploadDocument: async (email, file, documentType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('candidateEmail', email);

      return await safeFetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      if (err.isOffline) {
        // Fallback simulated document validation matching frontend rules
        const mockResult = {
          id: `doc_${Date.now()}`,
          candidateEmail: email,
          documentType,
          documentName: file.name,
          uploadedAt: new Date().toISOString(),
          status: 'valid',
          overallConfidence: 95,
          checks: {
            format: { status: 'pass', confidence: 100, message: 'Format check passed' },
            quality: { status: 'pass', confidence: 95, message: 'Quality check passed' },
            extraction: { status: 'pass', confidence: 90, message: 'Extraction completed' },
            consistency: { status: 'pass', confidence: 95, message: 'Consistency check passed' },
            authenticity: { status: 'pass', confidence: 92, message: 'Authenticity check passed' },
            completeness: { status: 'pass', confidence: 100, message: 'All fields present' }
          },
          extractedData: {
            name: 'Shashank Tudum',
            dateOfBirth: '1990-05-15',
            aadhaarNumber: '1234 5678 9012'
          },
          fieldComparisons: [],
          issues: [],
          recommendations: ['Document validation passed. You can proceed.']
        };

        const documents = getLocal('documents', []);
        // Remove existing same-type document
        const filteredDocs = documents.filter(d => !(d.candidateEmail.toLowerCase() === email.toLowerCase() && d.documentType === documentType));
        filteredDocs.push(mockResult);
        setLocal('documents', filteredDocs);

        // Recalculate candidate pending list
        const candidates = getLocal('candidates', []);
        const cand = candidates.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (cand) {
          const typeMapping = {
            aadhar: 'Identity proof',
            visa: 'Visa document',
            bankStatement: 'Financial documents',
            photo: 'Photo',
            passport: 'Passport'
          };
          const validTypes = filteredDocs.filter(d => d.candidateEmail.toLowerCase() === email.toLowerCase() && d.status === 'valid').map(d => d.documentType);
          const pending = [];
          
          Object.keys(typeMapping).forEach(type => {
            if (!validTypes.includes(type)) {
              pending.push(typeMapping[type]);
            }
          });

          cand.pending = pending;
          cand.docs = Math.max(0, cand.total - pending.length);
          cand.status = pending.length === 0 ? 'ready' : 'pending';
          setLocal('candidates', candidates);
        }

        return mockResult;
      }
      throw err;
    }
  },

  updateDocumentStatus: async (email, docId, updates) => {
    try {
      return await safeFetch(`${API_BASE}/documents/${sanitizeUrlParam(email)}/${sanitizeUrlParam(docId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      if (err.isOffline) {
        const documents = getLocal('documents', []);
        const doc = documents.find(d => d.id === docId);
        if (doc) {
          Object.assign(doc, updates);
          setLocal('documents', documents);
          return { message: 'Document updated successfully' };
        }
        throw new Error('Document not found');
      }
      throw err;
    }
  },

  // --- Reference Checks ---
  getReferenceChecks: async () => {
    try {
      return await safeFetch(`${API_BASE}/reference-checks`);
    } catch (err) {
      if (err.isOffline) {
        return getLocal('reference_checks', []);
      }
      throw err;
    }
  },

  addReferenceCheck: async (refData) => {
    try {
      return await safeFetch(`${API_BASE}/reference-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refData)
      });
    } catch (err) {
      if (err.isOffline) {
        const checks = getLocal('reference_checks', []);
        const newId = checks.length > 0 ? Math.max(...checks.map(c => c.id)) + 1 : 1;
        const newCheck = {
          ...refData,
          id: newId,
          status: 'pending',
          rating: null,
          feedback: '',
          requestDate: new Date().toISOString().split('T')[0],
          sentDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        checks.push(newCheck);
        setLocal('reference_checks', checks);
        return newCheck;
      }
      throw err;
    }
  },

  getReferenceFeedbackByToken: async (token) => {
    try {
      return await safeFetch(`${API_BASE}/reference-checks/feedback/${sanitizeUrlParam(token)}`);
    } catch (err) {
      if (err.isOffline) {
        const checks = getLocal('reference_checks', []);
        const check = checks.find(c => c.token === token);
        if (check) {
          return {
            candidateName: check.candidateName,
            referenceName: check.referenceName
          };
        }
        throw new Error('Reference check not found');
      }
      throw err;
    }
  },

  submitReferenceFeedback: async (token, rating, feedback) => {
    try {
      return await safeFetch(`${API_BASE}/reference-checks/feedback/${sanitizeUrlParam(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback })
      });
    } catch (err) {
      if (err.isOffline) {
        const checks = getLocal('reference_checks', []);
        const check = checks.find(c => c.token === token);
        if (check) {
          check.status = 'completed';
          check.rating = rating;
          check.feedback = feedback;
          check.responseDate = new Date().toISOString().split('T')[0];
          check.updatedAt = new Date().toISOString();
          setLocal('reference_checks', checks);
          return { message: 'Feedback submitted successfully' };
        }
        throw new Error('Reference check not found');
      }
      throw err;
    }
  },


  // --- Document Expiries ---
  getDocumentExpiries: async () => {
    try {
      return await safeFetch(`${API_BASE}/document-expiry`);
    } catch (err) {
      if (err.isOffline) {
        return getLocal('document_expiry', []);
      }
      throw err;
    }
  },

  addDocumentExpiry: async (expiryData) => {
    try {
      return await safeFetch(`${API_BASE}/document-expiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expiryData)
      });
    } catch (err) {
      if (err.isOffline) {
        const expiries = getLocal('document_expiry', []);
        const newId = expiries.length > 0 ? Math.max(...expiries.map(e => e.id)) + 1 : 1;
        const newExpiry = {
          ...expiryData,
          id: newId,
          reminderSent: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        expiries.push(newExpiry);
        setLocal('document_expiry', expiries);
        return newExpiry;
      }
      throw err;
    }
  },

  updateDocumentExpiry: async (expiryId, updates) => {
    try {
      return await safeFetch(`${API_BASE}/document-expiry/${sanitizeUrlParam(expiryId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      if (err.isOffline) {
        const expiries = getLocal('document_expiry', []);
        const expiry = expiries.find(e => e.id === parseInt(expiryId));
        if (expiry) {
          Object.assign(expiry, updates);
          expiry.updatedAt = new Date().toISOString();
          setLocal('document_expiry', expiries);
          return { message: 'Expiry entry updated successfully' };
        }
        throw new Error('Expiry entry not found');
      }
      throw err;
    }
  },

  // --- Audit Logs ---
  getAuditLogs: async () => {
    try {
      return await safeFetch(`${API_BASE}/audit-logs`);
    } catch (err) {
      if (err.isOffline) {
        return getLocal('audit_logs', []);
      }
      throw err;
    }
  },

  addAuditLog: async (userRole, action, details, location) => {
    try {
      return await safeFetch(`${API_BASE}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole, action, details, location })
      });
    } catch (err) {
      if (err.isOffline) {
        const logs = getLocal('audit_logs', []);
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          userRole,
          action,
          details,
          location
        };
        logs.unshift(newLog);
        if (logs.length > 100) logs.pop();
        setLocal('audit_logs', logs);
        return { message: 'Audit logged successfully' };
      }
      throw err;
    }
  },

  // --- AI Chat Support ---
  getChatHistory: async (email) => {
    try {
      return await safeFetch(`${API_BASE}/chat/${sanitizeUrlParam(email)}`);
    } catch (err) {
      if (err.isOffline) {
        const chats = getLocal('chats', {});
        return chats[email.toLowerCase()] || [
          { message: 'Hello! Welcome to the ValueMomentum onboarding portal.', type: 'bot', timestamp: Date.now() - 10000 },
          { message: 'How can I help you complete your documentation?', type: 'bot', timestamp: Date.now() - 5000 }
        ];
      }
      throw err;
    }
  },

  sendChatMessage: async (email, message, type) => {
    try {
      return await safeFetch(`${API_BASE}/chat/${sanitizeUrlParam(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type })
      });
    } catch (err) {
      if (err.isOffline) {
        const chats = getLocal('chats', {});
        const emailClean = email.toLowerCase();
        if (!chats[emailClean]) {
          chats[emailClean] = [
            { message: 'Hello! Welcome to the ValueMomentum onboarding portal.', type: 'bot', timestamp: Date.now() - 10000 },
            { message: 'How can I help you complete your documentation?', type: 'bot', timestamp: Date.now() - 5000 }
          ];
        }

        const userMsg = { message, type, timestamp: Date.now() };
        chats[emailClean].push(userMsg);

        // Simple mock reply matching router behavior
        const query = message.toLowerCase();
        let reply = "Thank you for reaching out. I've received your query about onboarding. If this requires manual verification, our HR team will review it shortly.";
        if (query.includes('passport')) {
          reply = "For passport validation, please upload a clear scanned copy of the first and last page showing your photo, details, and signature. Ensure the document isn't expired.";
        } else if (query.includes('visa')) {
          reply = "If you are joining in the US, uploading a valid Visa document (like H1-B or OPT EAD) is mandatory. Ensure the text and expiry dates are clearly readable.";
        } else if (query.includes('form') || query.includes('onboard')) {
          reply = "You can fill in your Personal details, Education, and Work History directly under the Onboarding Form section. Don't forget to click Save progress!";
        } else if (query.includes('bonus') || query.includes('relocation')) {
          reply = "Your eligibility tags (such as Joining Bonus or Relocation Benefits) are determined by HR based on your offer letter. They will be processed upon document completion.";
        } else if (query.includes('hello') || query.includes('hi')) {
          reply = "Hello! I am your ValueMomentum Onboarding Assistant. How can I help you with your documentation or onboarding tasks today?";
        }

        const botMsg = { message: reply, type: 'bot', timestamp: Date.now() + 1000 };
        chats[emailClean].push(botMsg);
        setLocal('chats', chats);
        
        return botMsg;
      }
      throw err;
    }
  },

  // --- Offer Letters (TAG Exclusive) ---
  getOfferDashboard: async () => {
    try {
      return await safeFetch(`${API_BASE}/offer-letter/dashboard`);
    } catch (err) {
      if (err.isOffline) {
        const candidates = getLocal('offer_details', []);
        const pending = candidates.filter(c => ['Pending', 'Generating', 'Draft'].includes(c.status)).length;
        const sent = candidates.filter(c => c.status === 'Offer Made').length;
        return {
          user: { username: 'tag@valuemomentum.com', name: 'TAG Team', role: 'tag' },
          candidates: candidates,
          total_candidates: candidates.length,
          pending_offers: pending,
          sent_offers: sent
        };
      }
      throw err;
    }
  },

  generateOfferLetter: async (offerData) => {
    try {
      return await safeFetch(`${API_BASE}/offer-letter/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });
    } catch (err) {
      if (err.isOffline) {
        const id = `off_${randomToken()}`;
        const candidates = getLocal('offer_details', []);
        const breakdown = localCalculateSalaryBreakdown(offerData.total_salary);
        const newRecord = {
          id: id,
          username: 'tag@valuemomentum.com',
          candidate_name: offerData.candidate_name,
          candidate_email: offerData.candidate_email,
          candidate_phone: offerData.candidate_phone,
          candidate_pan: offerData.pan,
          status: 'Offer Made', // Generate instantly in offline mock
          source: offerData.source,
          designation: offerData.designation,
          position: offerData.position,
          department: offerData.department,
          joining_date: offerData.joining_date,
          facility: offerData.facility,
          work_mode: offerData.work_mode || offerData.employment_type || 'hybrid',
          total_salary: Number.parseFloat(offerData.total_salary),
          current_ctc: Number.parseFloat(offerData.current_ctc || 0),
          extra_data: { tag_poc: offerData.tag_poc, vam_proposed_ctc: offerData.vam_proposed_ctc },
          created_at: new Date().toISOString().split('T')[0],
          pdf_path: `/generated_offer_letters/vm_offer_letter_${offerData.candidate_name.replace(/\s+/g, '_')}_mock.pdf`,
          salary_breakdown: JSON.stringify(breakdown),
          name: offerData.candidate_name,
          email: offerData.candidate_email,
          salary: Number.parseFloat(offerData.total_salary),
          offer_date: offerData.joining_date,
          tag_poc: offerData.tag_poc
        };
        candidates.unshift(newRecord);
        setLocal('offer_details', candidates);
        return {
          success: true,
          message: "Offer letter generated locally in offline database.",
          offer_letter_id: id
        };
      }
      throw err;
    }
  },

  getSalaryBreakdown: async (totalSalary) => {
    try {
      return await safeFetch(`${API_BASE}/offer-letter/salary-breakdown/${sanitizeUrlParam(totalSalary)}`);
    } catch (err) {
      if (err.isOffline) {
        return localCalculateSalaryBreakdown(totalSalary);
      }
      throw err;
    }
  },

  getOfferLetters: async () => {
    try {
      return await safeFetch(`${API_BASE}/offer-letters`);
    } catch (err) {
      if (err.isOffline) {
        return getLocal('offer_details', []);
      }
      throw err;
    }
  },

  sendOfferLetterEmail: async (emailData) => {
    try {
      return await safeFetch(`${API_BASE}/offer-letter/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
    } catch (err) {
      if (err.isOffline) {
        const candidates = getLocal('offer_details', []);
        const cand = candidates.find(c => c.candidate_email === emailData.candidate_email);
        if (cand) {
          cand.status = 'Offer Made';
          setLocal('offer_details', candidates);
        }
        return { success: true, message: "Email sent successfully in offline mode." };
      }
      throw err;
    }
  },

  generateDocx: async (offerData) => {
    try {
      return await safeFetch(`${API_BASE}/offer-letter/generate-docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });
    } catch (err) {
      if (err.isOffline) {
        return { success: true, docx_path: `/generated_offer_letters/vm_offer_letter_${offerData.candidate_name.replace(/\s+/g, '_')}_mock.docx` };
      }
      throw err;
    }
  },

  updateOfferLetterStatus: async (offerId, status) => {
    try {
      return await safeFetch(`${API_BASE}/offer-letter/change-status/${sanitizeUrlParam(offerId)}/${sanitizeUrlParam(status)}`, {
        method: 'POST'
      });
    } catch (err) {
      if (err.isOffline) {
        const candidates = getLocal('offer_details', []);
        const cand = candidates.find(c => c.id === offerId);
        if (cand) {
          cand.status = status;
          setLocal('offer_details', candidates);
          return { success: true, message: "Status updated successfully in offline mode." };
        }
        throw new Error("Offer detail not found");
      }
      throw err;
    }
  },

  getOfferLetterById: async (offerId) => {
    try {
      return await safeFetch(`${API_BASE}/offer-letter/${sanitizeUrlParam(offerId)}`);
    } catch (err) {
      if (err.isOffline) {
        const candidates = getLocal('offer_details', []);
        const cand = candidates.find(c => c.id === offerId);
        if (cand) return cand;
        throw new Error("Offer letter not found");
      }
      throw err;
    }
  },

  updateOfferLetter: async (offerId, offerData) => {
    try {
      return await safeFetch(`${API_BASE}/offer-letter/${sanitizeUrlParam(offerId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });
    } catch (err) {
      if (err.isOffline) {
        const candidates = getLocal('offer_details', []);
        const idx = candidates.findIndex(c => c.id === offerId);
        if (idx !== -1) {
          const breakdown = localCalculateSalaryBreakdown(offerData.total_salary);
          candidates[idx] = {
            ...candidates[idx],
            candidate_name: offerData.candidate_name,
            candidate_email: offerData.candidate_email,
            candidate_phone: offerData.candidate_phone,
            candidate_pan: offerData.pan,
            designation: offerData.designation,
            position: offerData.position,
            department: offerData.department,
            joining_date: offerData.joining_date,
            facility: offerData.facility,
            total_salary: Number.parseFloat(offerData.total_salary),
            current_ctc: Number.parseFloat(offerData.current_ctc || 0),
            salary_breakdown: JSON.stringify(breakdown),
            name: offerData.candidate_name,
            email: offerData.candidate_email,
            salary: Number.parseFloat(offerData.total_salary),
            offer_date: offerData.joining_date,
            tag_poc: offerData.tag_poc
          };
          setLocal('offer_details', candidates);
          return { success: true, message: "Offer letter updated locally.", offer_letter_id: offerId };
        }
        throw new Error("Offer letter not found");
      }
      throw err;
    }
  }
};

// Helper utility for local salary calculations
const localCalculateSalaryBreakdown = (totalSalary) => {
  const monthlyCtc = totalSalary / 12;
  const basicMonthly = monthlyCtc * 0.5;
  const basicAnnual = basicMonthly * 12;
  const food = 8800;
  const employerPf = 1800;
  const gratuityAnnual = (basicAnnual / 26) * 15 / 12;
  const gratuityMonthly = gratuityAnnual / 12;
  const remaining = monthlyCtc - (basicMonthly + food + employerPf + gratuityMonthly);
  const hra = remaining * 0.7;
  const conveyance = remaining * 0.1;
  const lta = remaining * 0.2;
  const totalEarningsMonthly = basicMonthly + hra + conveyance + lta + food;
  const totalStatutoryMonthly = employerPf + gratuityMonthly;
  const pfTotal = 3600;
  const professionalTax = 200;
  const totalDeductionsMonthly = pfTotal + professionalTax;
  const netMonthly = monthlyCtc - totalDeductionsMonthly;
  
  return {
    "Monthly_Basic": Math.round(basicMonthly),
    "Annual_Basic": Math.round(basicAnnual),
    "Monthly_HRA": Math.round(hra),
    "Annual_HRA": Math.round(hra * 12),
    "Monthly_Conveyance": Math.round(conveyance),
    "Annual_Conveyance": Math.round(conveyance * 12),
    "Monthly_LTA": Math.round(lta),
    "Annual_LTA": Math.round(lta * 12),
    "Monthly_Food": food,
    "Annual_Food": food * 12,
    "Monthly_Gratuity": Math.round(gratuityMonthly),
    "Annual_Gratuity": Math.round(gratuityMonthly * 12),
    "Employer_PF_Monthly": employerPf,
    "Employer_PF_Annual": employerPf * 12,
    "Total_Earnings_Monthly": Math.round(totalEarningsMonthly),
    "Total_Earnings_Annual": Math.round(totalEarningsMonthly * 12),
    "Total_Statutory_Monthly": Math.round(totalStatutoryMonthly),
    "Total_Statutory_Annual": Math.round(totalStatutoryMonthly * 12),
    "Total_Monthly_CTC": Math.round(monthlyCtc),
    "Total_Annual_CTC": Math.round(totalSalary),
    "Monthly_PF": "3600(1800 + 1800)",
    "Annual_PF": 3600 * 12,
    "Monthly_Professional_Tax": 200,
    "Annual_Professional_Tax": 200 * 12,
    "Total_Deductions_Monthly": totalDeductionsMonthly,
    "Total_Deductions_Annual": totalDeductionsMonthly * 12,
    "Net_Monthly_Salary": Math.round(netMonthly),
    "Net_Annual_Salary": Math.round(netMonthly * 12)
  };
};

