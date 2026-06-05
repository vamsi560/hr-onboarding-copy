// Route definitions for the HR Onboarding application
export const ROUTES = {
  // Authentication
  LOGIN: '/login',
  
  // General routes
  DASHBOARD: '/dashboard',
  FORM: '/form',
  DOCUMENTS: '/documents',
  VALIDATION: '/validation',
  SUPPORT: '/support',
  
  // HR-only routes
  HR_DASHBOARD: '/hr',
  REGISTER_CANDIDATE: '/register',
  EXCEPTIONS: '/exceptions',
  WORKFLOWS: '/workflows',
  REFERENCES: '/references',
  DOCUMENT_EXPIRY: '/expiry',
  ANALYTICS: '/analytics',
  HR_CHAT: '/chat',
  AUDIT_LOG: '/auditlog',
  
  // Alumni routes
  ALUMNI: '/alumni'
};

// Route permissions
export const HR_ONLY_ROUTES = [
  ROUTES.HR_DASHBOARD,
  ROUTES.REGISTER_CANDIDATE,
  ROUTES.EXCEPTIONS,
  ROUTES.WORKFLOWS,
  ROUTES.REFERENCES,
  ROUTES.DOCUMENT_EXPIRY,
  ROUTES.ANALYTICS,
  ROUTES.HR_CHAT,
  ROUTES.AUDIT_LOG
];

export const CANDIDATE_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.FORM,
  ROUTES.DOCUMENTS,
  ROUTES.VALIDATION,
  ROUTES.SUPPORT
];

export const ALUMNI_ROUTES = [
  ROUTES.ALUMNI
];