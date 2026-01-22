# Login Credentials - HR Onboarding Portal

This document contains all the login credentials for testing different user roles and scenarios in the HR Onboarding Portal.

**Note:** The portal now supports multiple organizations (ValueMomentum and OwlSure). Select the organization from the login dropdown.

---

## 🔐 Login Credentials

### 1. Candidate with Joining Bonus Eligibility
**Email:** `john.doe@gmail.com`  
**Password:** `password123`  
**Name:** Shashank Tudum (displayed in welcome)  
**Role:** Candidate  
**Location:** India  
**Eligibility:**
- ✅ Joining Bonus: **Yes**
- ❌ Relocation: **No**

**Features:**
- Will see "Joining Bonus" card on dashboard
- Can click to view bonus details and terms & conditions
- Welcome message shows "Shashank Tudum"

---

### 2. Candidate with Relocation Eligibility
**Email:** `jane.smith@outlook.com`  
**Password:** `password123`  
**Name:** Priya Patel  
**Role:** Candidate  
**Location:** US  
**Eligibility:**
- ❌ Joining Bonus: **No**
- ✅ Relocation: **Yes**

**Features:**
- Will see "Relocation Assistance" card on dashboard
- Can click to view relocation benefits and information

---

### 3. Candidate with Both Joining Bonus and Relocation
**Email:** `mike.johnson@gmail.com`  
**Password:** `password123`  
**Name:** Vikram Singh  
**Role:** Candidate  
**Location:** US  
**Eligibility:**
- ✅ Joining Bonus: **Yes**
- ✅ Relocation: **Yes**

**Features:**
- Will see both "Joining Bonus" and "Relocation Assistance" cards on dashboard
- Full access to all benefits information

---

### 4. Candidate with No Special Benefits
**Email:** `sarah.williams@outlook.com`  
**Password:** `password123`  
**Name:** Anjali Gupta  
**Role:** Candidate  
**Location:** India  
**Eligibility:**
- ❌ Joining Bonus: **No**
- ❌ Relocation: **No**

**Features:**
- Standard candidate dashboard
- No bonus or relocation cards displayed

---

### 5. Alumni Portal (Former Employee)
**Email:** `alumni@gmail.com`  
**Password:** `password123`  
**Name:** Suresh Iyer  
**Role:** Alumni  
**Location:** India  
**Employment History:**
- Joined: January 15, 2018
- Left: June 30, 2023
- Years Worked: 5.5 years

**Features:**
- Limited access portal
- Can view and download payslips
- Can access work-related documents (employment certificates, experience letters, tax forms)
- All other features disabled (no onboarding form, no document upload, etc.)
- No sidebar navigation

---

### 6. HR Manager
**Email:** `hr@valuemomentum.com`  
**Password:** `password123`  
**Name:** Raghavendra Raju  
**Role:** HR  
**Location:** India  

**Features:**
- Full HR dashboard access
- Candidate review and management
- Workflow management
- Reference checks
- Document expiry tracking
- Analytics
- Audit logs
- **Note:** Register New Candidate button has been removed (moved to TAG)

---

### 7. TAG Team (Recruitment)
**Email:** `tag@valuemomentum.com`  
**Password:** `password123`  
**Name:** TAG Team  
**Role:** TAG  
**Location:** India  

**Features:**
- TAG Dashboard showing all registered candidates
- Register New Candidate functionality (moved from HR)
- Candidate list with search and filters
- View candidate status and documents
- Support access

**Menu Items:**
- Candidates (default page)
- Register New Candidate
- Support

---

### 8. Demo Mode (Default Candidate)
**Email:** Any email (not validated in demo mode)  
**Password:** Any password (not validated in demo mode)  
**Click:** "Try Demo Mode" button  

**Default User:**
- Name: Shashank Tudum
- Role: Candidate
- Location: India
- No special benefits

---

## 📋 Quick Reference Table

| Email | Password | Name | Role | Joining Bonus | Relocation | Special Notes |
|-------|----------|------|------|---------------|------------|---------------|
| john.doe@gmail.com | password123 | Shashank Tudum | Candidate | ✅ Yes | ❌ No | Welcome shows "Shashank Tudum" |
| jane.smith@outlook.com | password123 | Priya Patel | Candidate | ❌ No | ✅ Yes | - |
| mike.johnson@gmail.com | password123 | Vikram Singh | Candidate | ✅ Yes | ✅ Yes | Both benefits |
| sarah.williams@outlook.com | password123 | Anjali Gupta | Candidate | ❌ No | ❌ No | Standard candidate |
| alumni@gmail.com | password123 | Suresh Iyer | Alumni | ❌ No | ❌ No | Limited access only |
| hr@valuemomentum.com | password123 | Raghavendra Raju | HR | ❌ No | ❌ No | Full HR access (no Register button) |
| tag@valuemomentum.com | password123 | TAG Team | TAG | ❌ No | ❌ No | Recruitment team - Register candidates |

---

## 🎯 Testing Scenarios

### Scenario 1: Joining Bonus Display
1. Login as `john.doe@gmail.com` (Shashank Tudum)
2. Accept the offer (offer acceptance popup will appear)
3. Navigate to Dashboard
4. Verify welcome message shows "Shashank Tudum"
5. Verify "Joining Bonus" card is visible
6. Click to expand and view details

### Scenario 2: Relocation Display
1. Login as `jane.smith@outlook.com` (Priya Patel)
2. Accept the offer (offer acceptance popup will appear)
3. Navigate to Dashboard
4. Verify "Relocation Assistance" card is visible
5. Click to expand and view details

### Scenario 3: Both Benefits
1. Login as `mike.johnson@gmail.com` (Vikram Singh)
2. Accept the offer (offer acceptance popup will appear)
3. Navigate to Dashboard
4. Verify both cards are visible

### Scenario 4: No Benefits
1. Login as `sarah.williams@outlook.com` (Anjali Gupta)
2. Accept the offer (offer acceptance popup will appear)
3. Navigate to Dashboard
4. Verify no bonus/relocation cards are shown

### Scenario 5: Alumni Portal
1. Login as `alumni@gmail.com` (Suresh Iyer)
2. Verify alumni dashboard is shown
3. Check payslips section
4. Check work documents section
5. Verify sidebar is hidden
6. Verify other features are disabled

### Scenario 6: TAG Team
1. Login as `tag@valuemomentum.com` (TAG Team)
2. Select "TAG" from Login As dropdown
3. Verify TAG Dashboard is shown with candidates list
4. Check "Register New Candidate" in sidebar
5. Register a new candidate
6. Verify candidate appears in the list

### Scenario 7: Organization Selection (ValueMomentum/OwlSure)
1. On login page, select organization from dropdown:
   - ValueMomentum (default)
   - OwlSure
2. When OwlSure is selected:
   - Logo changes (if OwlSure logo exists, otherwise falls back to ValueMomentum)
   - All "ValueMomentum" text changes to "OwlSure" throughout the app
3. Login with any credentials
4. Verify organization name appears correctly in:
   - Login page title
   - Dashboard welcome messages
   - Offer acceptance modal
   - Document templates
   - Consent forms
   - Email addresses

---

## 🔒 Security Notes

- These are **test credentials** for development/demo purposes only
- In production, implement proper authentication with secure password hashing
- Consider implementing role-based access control (RBAC)
- Add session management and timeout
- Implement password reset functionality
- Add two-factor authentication for sensitive roles

---

## 📝 Notes

- All passwords are currently set to `password123` for easy testing
- Email validation is basic (format check only)
- Password validation requires minimum 6 characters
- User information is stored in localStorage (for demo purposes)
- In production, use secure backend authentication

---

**Last Updated:** 2024  
**Version:** 1.0

