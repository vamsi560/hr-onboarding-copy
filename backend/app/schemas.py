from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class CandidateRegister(BaseModel):
    name: str
    email: str
    location: str
    department: str
    joiningBonus: Optional[bool] = False
    relocation: Optional[bool] = False
    relocationCity: Optional[str] = ""
    alumni: Optional[bool] = False
    designation: Optional[str] = "Software Engineer"

class CandidateUpdate(BaseModel):
    status: str
    pending: Optional[List[str]] = None

class OnboardingFormSave(BaseModel):
    personalInfo: Dict[str, Any]
    education: List[Dict[str, Any]]
    employment: List[Dict[str, Any]]

class DocumentStatusUpdate(BaseModel):
    status: str
    overallConfidence: Optional[int] = None
    checks: Optional[Dict[str, Any]] = None
    extractedData: Optional[Dict[str, Any]] = None

class ReferenceRequest(BaseModel):
    candidateId: str
    candidateName: str
    referenceName: str
    referenceEmail: str
    referencePhone: str
    referenceCompany: str
    referencePosition: str
    relationship: str

class ReferenceFeedback(BaseModel):
    rating: int
    feedback: str

class DocumentExpiryCreate(BaseModel):
    candidateId: str
    candidateName: str
    documentType: str
    documentName: str
    documentNumber: str
    issueDate: str
    expiryDate: str
    daysUntilExpiry: int
    status: str
    notes: Optional[str] = ""

class DocumentExpiryUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    reminderSent: Optional[bool] = None

class AuditLogCreate(BaseModel):
    userRole: str
    action: str
    details: Dict[str, Any]
    location: str

class ChatMsgRequest(BaseModel):
    message: str
    type: str  # user, bot, system
    timestamp: Optional[float] = None

class SalaryBreakdown(BaseModel):
    basic_salary: float
    hra: float
    special_allowance: float
    transport_allowance: float
    medical_allowance: float
    provident_fund: float
    professional_tax: float
    total_deductions: float
    net_salary: float

class OfferLetterRequest(BaseModel):
    # General/Recruitment Section
    status: str
    tag_poc: str
    pos_id: str
    source: str
    source_type: str
    source_details: Optional[str] = None
    candidate_name: str
    years_of_experience: Optional[float] = None
    offer_approval_email_sent_date: Optional[str] = None
    offer_approval_received_date: Optional[str] = None
    date_of_offer: Optional[str] = None
    primary_skill: Optional[str] = None
    secondary_skill: Optional[str] = None
    current_location: Optional[str] = None
    candidate_phone: str
    candidate_email: str
    pan: str
    candidate_address: Optional[str] = None
    prev_org: Optional[str] = None
    comments: Optional[str] = None

    # Position Section
    designation: str
    position: str
    grade: str
    department: str
    business_unit: str
    tsc: str
    sub_tsc: str
    allocation_unit: str
    account: str
    project: str
    employment_type: str
    facility: str
    work_location: str
    reporting_manager: str
    joining_date: str
    probation_period: Optional[str] = None
    notice_period: Optional[str] = None

    # Compensation Section
    current_ctc: Optional[float] = None
    ectc: Optional[float] = None
    vam_proposed_ctc: Optional[float] = None
    revised_ctc: Optional[float] = None
    total_salary: Optional[float] = None
    deviation: Optional[int] = None
    jb_amt: Optional[float] = None
    jb_reason: Optional[str] = None
    days_lapsed: Optional[int] = None
    np_buyout_amt: Optional[float] = None
    np_buyout_mail_approval_date: Optional[str] = None
    benefits: Optional[str] = None
    terms_and_conditions: Optional[str] = None

class OfferLetterResponse(BaseModel):
    success: bool
    message: str
    offer_letter_id: str
    pdf_path: Optional[str] = None

class SendOfferLetterEmailRequest(BaseModel):
    candidate_email: str
    pdf_path: str
    candidate_name: str
    subject: Optional[str] = None
    body: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[str] = None
    facility: Optional[str] = None
    work_mode: Optional[str] = None
    tag_poc: Optional[str] = None
    cc_email: Optional[str] = None

