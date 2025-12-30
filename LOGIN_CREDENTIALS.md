# Login Credentials - ValueMomentum HR Onboarding Portal

This document contains all the login credentials for testing different user roles and scenarios in the HR Onboarding Portal.

---

## 🔐 Login Credentials

### 1. Candidate with Joining Bonus Eligibility
**Email:** `john.doe@valuemomentum.com`  
**Password:** `password123`  
**Role:** Candidate  
**Location:** India  
**Eligibility:**
- ✅ Joining Bonus: **Yes**
- ❌ Relocation: **No**

**Features:**
- Will see "Joining Bonus" card on dashboard
- Can click to view bonus details and terms & conditions

---

### 2. Candidate with Relocation Eligibility
**Email:** `jane.smith@valuemomentum.com`  
**Password:** `password123`  
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
**Email:** `mike.johnson@valuemomentum.com`  
**Password:** `password123`  
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
**Email:** `sarah.williams@valuemomentum.com`  
**Password:** `password123`  
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
**Email:** `alumni@valuemomentum.com`  
**Password:** `password123`  
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

---

### 7. Demo Mode (Default Candidate)
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

| Email | Password | Role | Joining Bonus | Relocation | Special Notes |
|-------|----------|------|---------------|------------|---------------|
| john.doe@valuemomentum.com | password123 | Candidate | ✅ Yes | ❌ No | - |
| jane.smith@valuemomentum.com | password123 | Candidate | ❌ No | ✅ Yes | - |
| mike.johnson@valuemomentum.com | password123 | Candidate | ✅ Yes | ✅ Yes | Both benefits |
| sarah.williams@valuemomentum.com | password123 | Candidate | ❌ No | ❌ No | Standard candidate |
| alumni@valuemomentum.com | password123 | Alumni | ❌ No | ❌ No | Limited access only |
| hr@valuemomentum.com | password123 | HR | ❌ No | ❌ No | Full HR access |

---

## 🎯 Testing Scenarios

### Scenario 1: Joining Bonus Display
1. Login as `john.doe@valuemomentum.com`
2. Accept the offer
3. Navigate to Dashboard
4. Verify "Joining Bonus" card is visible
5. Click to expand and view details

### Scenario 2: Relocation Display
1. Login as `jane.smith@valuemomentum.com`
2. Accept the offer
3. Navigate to Dashboard
4. Verify "Relocation Assistance" card is visible
5. Click to expand and view details

### Scenario 3: Both Benefits
1. Login as `mike.johnson@valuemomentum.com`
2. Accept the offer
3. Navigate to Dashboard
4. Verify both cards are visible

### Scenario 4: No Benefits
1. Login as `sarah.williams@valuemomentum.com`
2. Accept the offer
3. Navigate to Dashboard
4. Verify no bonus/relocation cards are shown

### Scenario 5: Alumni Portal
1. Login as `alumni@valuemomentum.com`
2. Verify alumni dashboard is shown
3. Check payslips section
4. Check work documents section
5. Verify sidebar is hidden
6. Verify other features are disabled

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

