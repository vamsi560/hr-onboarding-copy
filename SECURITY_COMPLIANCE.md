# 🛡️ ValueMomentum HR Onboarding Platform - Security Compliance & Architecture Report

This report outlines the security standards, data privacy compliance, API security measures, and coding standards implemented across the unified ValueMomentum Onboarding & Offer Letter Management Platform to obtain clearance from the **SecOps** and **ITSEC** teams.

---

## 🔑 Executive Summary

The ValueMomentum Onboarding platform has been architected to handle sensitive employee and candidate personal data (PII) securely. The platform incorporates **production-grade cryptography**, **strict role-based access control (RBAC)**, **input signature verification**, and **data minimization principles** aligned with global data protection regulations, including the **EU GDPR** and India's **DPDP Act 2023**.

---

## 🏛️ 1. Security Standards & Cryptography

### A. Password Storage (PBKDF2-HMAC-SHA256)
Plaintext passwords are never stored in the database. 
- **Algorithm**: PBKDF2 (Password-Based Key Derivation Function 2) using SHA-256.
- **Iterations**: 100,000 iterations to guarantee brute-force resistance.
- **Salts**: Every password is cryptographically salted using a unique, securely generated 32-character hexadecimal salt (`secrets.token_hex(16)`) at creation time to prevent rainbow table attacks.
- **Implementation Location**: [backend/app/security.py](file:///c:/Users/azureuser/Surya/hr-onboatrding-copy/hr-onboarding-copy/backend/app/security.py#L12-L31)

### B. Session Management & Token Authentication (JWT)
- **Token Type**: Signed JSON Web Tokens (JWT) using the `HS256` algorithm.
- **Session Duration**: Tokens expire after 60 minutes (`JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60`), mitigating risks from hijacked browser sessions.
- **Authorization Header**: React frontend automatically injects JWTs into the `Authorization: Bearer <Token>` header for all HTTP calls.
- **Implementation Location**: [backend/app/security.py](file:///c:/Users/azureuser/Surya/hr-onboatrding-copy/hr-onboarding-copy/backend/app/security.py#L35-L59)

---

## 📜 2. Data Privacy Compliance (OWASP, GDPR, DPDP Act)

### A. OWASP Top 10 Mitigations

| Vulnerability | Mitigation Implemented in Platform |
| :--- | :--- |
| **A01:2021-Broken Access Control** | Every endpoint verifies the caller's identity and permissions. Endpoints checking candidate-level resources verify that `current_user.email == request_email`, preventing horizontal privilege escalation. |
| **A02:2021-Cryptographic Failures** | Strict PBKDF2-SHA256 hashing is enforced. Sensitive communication and PDF offer letters are encrypted using candidate PAN numbers before dispatch. |
| **A03:2021-Injection** | Parameterized database queries are used throughout via SQLAlchemy ORM, eliminating raw SQL string concatenation and preventing SQL injection. |
| **A05:2021-Security Misconfiguration** | Dual database configuration separates In-Memory mock fallbacks from PostgreSQL. Strict CORS origin restrictions block unauthorized cross-domain browser API calls. |
| **A06:2021-Vulnerable Components** | All dependencies are explicitly pinned in `requirements.txt` and regularly audited to prevent supply-chain vulnerabilities. |
| **A09:2021-Security Logging & Monitoring**| A centralized auditing router records every system action, user role, and operation location, preserving an immutable trace for ITSEC audits. |

### B. GDPR (General Data Protection Regulation) Compliance
- **Data Minimization (Art 5.1c)**: The onboarding forms gather only essential information (Personal info, Education, employment references, and standard statutory documents).
- **Right to Erasure & Rectification (Art 16/17)**: Candidates have full API access to correct, update, and manage their uploaded forms and records prior to onboarding finalization.
- **Security of Processing (Art 32)**: Cryptographic password protection and role separation are strictly enforced.

### C. India DPDP Act 2023 Compliance
India's **Digital Personal Data Protection (DPDP) Act, 2023** governs employee onboarding records. The platform complies with DPDP standards through the following measures:
- **Legitimate Use**: Processing candidate and employee data (e.g. PAN, Aadhaar, bank details, PF allocation) is justified under the **"Employment Purposes" Legitimate Use clause** of the DPDP Act.
- **Purpose Limitation**: Data collected during onboarding is strictly confined to verifying credentials, conducting background screenings, and drafting employment contracts.
- **Obligation of the Data Fiduciary (ValueMomentum)**: The platform maintains strict data integrity and logs audits to prevent unauthorized modifications.
- **Data Deletion Policy**: Candidates who are not hired or withdraw their application can have their data deleted in compliance with statutory retention boundaries.

---

## 🔌 3. API & Endpoint Security

### A. Strict Role-Based Access Control (RBAC)
FastAPI dependency injection enforces role authorization boundaries:
- **RequireRole(["candidate"])**: Restricts access to candidate-only features (uploading personal documents, submitting onboarding profiles, chatbot support).
- **RequireRole(["hr"])**: Grants access to HR tracking interfaces, reference checks, document verification, and audit trail logs.
- **RequireRole(["tag"])**: Grants exclusive access to the **Offer Letter Management** module. Other roles (including candidates and standard HR personnel) are blocked.
- **Implementation Location**: [backend/app/security.py](file:///c:/Users/azureuser/Surya/hr-onboatrding-copy/hr-onboarding-copy/backend/app/security.py#L101-L112)

### B. Data & Identity Isolation
Even within the `candidate` role, candidates are strictly isolated:
- If a candidate with email `john.doe@gmail.com` attempts to view documents or query support chats for `jane.smith@outlook.com`, the API validates the JWT subject against the query payload and blocks the request with a `403 Forbidden` error.

### C. Securing the Reference Check Feedback Endpoint (UUID Tokenization)
To prevent ID enumeration and scraping attacks on the unauthenticated referee reviews:
- **Tokenized Retrieval & Update**: Reference feedback routes do not expose or accept sequential integer IDs (`ref_id`). Instead, a random, cryptographically secure UUID token (`referee_hash_token`) is generated per request.
- **Anonymous Access**: Referees can fetch candidate information via `GET /api/reference-checks/feedback/{token}` and submit reviews via `PUT /api/reference-checks/feedback/{token}` publicly without logging in, whilst preventing unauthorized access to other candidates' records.
- **Implementation Location**: [backend/app/routers/reference.py](file:///c:/Users/azureuser/Surya/hr-onboatrding-copy/hr-onboarding-copy/backend/app/routers/reference.py)

---

## 🐍 4. Python Coding & Architectural Standards

The backend code is maintained to strict Python coding conventions to ensure code readability, maintainability, and clean review:

### A. PEP 8 Standards
- **Naming Conventions**: Classes use `PascalCase` (e.g., `OfferDetailModel`, `DatabaseDAL`), while functions, variables, and database columns use `snake_case` (e.g., `get_user_by_email()`, `password_hash`).
- **Formatting**: Strict 4-space indentations, logical double-newline separations, and clean module imports grouping (Standard library first, third-party next, local application modules last).

### B. Layered Software Architecture
The code separates concerns to avoid side-effects and lock down data interfaces:
1. **Router Layer (`routers/`)**: Receives HTTP requests, executes RBAC checks, validates request payloads against Pydantic schemas, and hands them off to logic layers.
2. **Schema Validation Layer (`schemas.py`)**: Uses Pydantic to strictly type-validate incoming JSON strings, converting them into validated Python objects.
3. **Service Layer (`services/`)**: Houses core logic (such as offer letter rendering templates and ACS email delivery pipelines).
4. **Data Access Layer (`database.py` / `models.py`)**: Directs database CRUD commands cleanly to SQLAlchemy or in-memory caches.

---

## 🔒 5. Additional Security Safeguards

### A. Upload File Signature Validation (Magic Bytes Check)
To prevent attackers from uploading malicious executables or scripts masquerading as harmless images or PDF documents (e.g. `malware.pdf` which is actually an `.exe` file), the platform bypasses the extension name and directly inspects the file's **Magic Bytes** (binary signature):
- **Verification Rule**: File uploads must match the strict signature checks on the backend (e.g. `%PDF-` for PDFs, `\x89PNG\r\n\x1a\n` for PNGs). 
- **Implementation Location**: [backend/app/routers/documents.py](file:///c:/Users/azureuser/Surya/hr-onboatrding-copy/hr-onboarding-copy/backend/app/routers/documents.py)

### B. PDF Password Encryption
- **Encryption**: Generated PDF offer letters are encrypted using the standard RC4/AES algorithm via the `pypdf` library.
- **Passcode Key**: The candidate's **PAN (Permanent Account Number)** is hashed and set as the document password, ensuring that the offer letter remains unreadable even if intercepted or leaked, unless the candidate inputs their credentials.

### C. CORS Protection
The API is configured with strict Cross-Origin Resource Sharing (CORS) rules, allowing communication only from explicitly white-listed domains (e.g. `http://localhost:3000` or production equivalents) to block cross-site request attacks.

### D. Environment Isolation for JWT Secrets (Crash-on-Boot Security)
To enforce environment configuration safety in live production nodes:
- **Boot Assertions**: During initialization, the config module checks if `ENV` is set to `production`.
- **Fatal Error Enforcement**: If `SECRET_KEY` or `JWT_SECRET` are not explicitly defined in the runtime variables under production mode, the server prints a fatal crash warning and immediately exits (`sys.exit(1)`), preventing weak hardcoded fallback security holes.
- **Implementation Location**: [backend/app/config.py](file:///c:/Users/azureuser/Surya/hr-onboatrding-copy/hr-onboarding-copy/backend/app/config.py)

---

## 🔍 6. Future Hardening & Production Gaps (Threat Modeling)

To achieve a flawless ITSEC sign-off before entering production, the following gaps should be addressed:

### A. JWT Storage in Browser Client
- **Current State**: The React client stores the Bearer JWT in LocalStorage, which is susceptible to Cross-Site Scripting (XSS) extraction.
- **Remediation**: Move token storage to `HttpOnly`, `Secure`, and `SameSite=Strict` cookies, preventing malicious script access to session tokens.

### B. File Malware Scanning
- **Current State**: Uploads are checked for size limits and binary header signatures, but not actively scanned for virus content.
- **Remediation**: Integrate a scanning service (e.g., ClamAV API container) into the file upload pipeline before saving files to target directories.


