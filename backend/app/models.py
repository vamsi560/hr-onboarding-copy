from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON, ForeignKey, Date
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    password_salt = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # candidate, hr, tag, alumni
    location = Column(String, nullable=False)  # india, us
    joining_bonus = Column(Boolean, default=False)
    relocation = Column(Boolean, default=False)
    relocation_city = Column(String, nullable=True)
    alumni = Column(Boolean, default=False)
    designation = Column(String, nullable=True)
    department = Column(String, nullable=True)
    joined_date = Column(String, nullable=True)
    left_date = Column(String, nullable=True)
    years_worked = Column(Float, nullable=True)

class CandidateModel(Base):
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="pending")  # ready, pending
    docs = Column(Integer, default=0)
    total = Column(Integer, default=12)
    dept = Column(String, nullable=False)
    selected = Column(Boolean, default=False)
    pending_docs = Column(JSON, default=list)  # List of pending documents

class OnboardingFormModel(Base):
    __tablename__ = "onboarding_forms"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_email = Column(String, unique=True, index=True, nullable=False)
    personal_info = Column(JSON, default=dict)
    education = Column(JSON, default=list)
    employment = Column(JSON, default=list)

class DocumentModel(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, index=True)
    candidate_email = Column(String, index=True, nullable=False)
    document_type = Column(String, nullable=False)
    document_name = Column(String, nullable=False)
    uploaded_at = Column(String, default=lambda: datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat())
    status = Column(String, default="pending")  # valid, invalid, warning
    overall_confidence = Column(Integer, default=0)
    checks = Column(JSON, default=dict)
    extracted_data = Column(JSON, default=dict)

class ReferenceCheckModel(Base):
    __tablename__ = "reference_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, nullable=False)
    candidate_name = Column(String, nullable=False)
    reference_name = Column(String, nullable=False)
    reference_email = Column(String, nullable=False)
    reference_phone = Column(String, nullable=False)
    reference_company = Column(String, nullable=False)
    reference_position = Column(String, nullable=False)
    relationship = Column(String, nullable=False)
    request_date = Column(String, nullable=False)
    response_date = Column(String, nullable=True)
    status = Column(String, default="pending")  # completed, pending
    rating = Column(Integer, nullable=True)
    feedback = Column(String, default="")
    sent_date = Column(String, nullable=False)
    token = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(String, default=lambda: datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat())
    updated_at = Column(String, default=lambda: datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat())

class DocumentExpiryModel(Base):
    __tablename__ = "document_expiry"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, nullable=False)
    candidate_name = Column(String, nullable=False)
    document_type = Column(String, nullable=False)
    document_name = Column(String, nullable=False)
    document_number = Column(String, nullable=False)
    issue_date = Column(String, nullable=False)
    expiry_date = Column(String, nullable=False)
    days_until_expiry = Column(Integer, nullable=False)
    status = Column(String, nullable=False)  # valid, critical, warning
    notes = Column(String, default="")
    created_at = Column(String, default=lambda: datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat())
    updated_at = Column(String, default=lambda: datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat())
    reminder_sent = Column(Boolean, default=False)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String, default=lambda: datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat())
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(JSON, default=dict)
    location = Column(String, nullable=False)

class ChatHistoryModel(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_email = Column(String, index=True, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # bot, user, system
    timestamp = Column(Float, default=lambda: datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)

class OfferDetailModel(Base):
    __tablename__ = "offer_details"
    
    id = Column(String(100), primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    candidate_name = Column(String(255), nullable=False)
    candidate_email = Column(String(255), nullable=False, index=True)
    candidate_phone = Column(String(50), nullable=False)
    candidate_pan = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    source = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    joining_date = Column(Date, nullable=False)
    facility = Column(String(255), nullable=False)
    work_mode = Column(String(255), nullable=False)
    total_salary = Column(Float, nullable=False)
    current_ctc = Column(Float, nullable=False)
    extra_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None))
    pdf_path = Column(String(500), nullable=True)
    salary_breakdown = Column(String, nullable=True)

