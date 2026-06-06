from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models import (
    Base, UserModel, CandidateModel, OnboardingFormModel,
    DocumentModel, ReferenceCheckModel, DocumentExpiryModel,
    AuditLogModel, ChatHistoryModel, OfferDetailModel
)
import app.seed_data as seed
import datetime
import logging
import json
import uuid


IDENTITY_PROOF = "Identity proof"
VISA_DOCUMENT = "Visa document"
FINANCIAL_DOCUMENTS = "Financial documents"
PHOTO = "Photo"
PASSPORT = "Passport"

logger = logging.getLogger(__name__)

# --- PostgreSQL Database Engine & Session Setup ---
# The engine and session below are fully set up.
# When settings.USE_POSTGRES is set to True, these will be used.
engine = None
SessionLocal = None

if settings.USE_POSTGRES:
    try:
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        # Create all tables in Postgres if they do not exist
        Base.metadata.create_all(bind=engine)
        logger.info("Successfully connected to PostgreSQL database.")
    except Exception as e:
        logger.exception("Error connecting to PostgreSQL database:")
        logger.warning("Falling back to In-Memory Database store.")
        # Override setting since connection failed
        settings.USE_POSTGRES = False


# --- In-Memory Mock Database Store ---
# Mimics a real SQL database to allow the backend to run immediately without any setup.
class InMemoryDatabase:
    def __init__(self):
        self.users = {email.lower(): data.copy() for email, data in seed.USER_DATABASE.items()}
        self.candidates = [c.copy() for c in seed.CANDIDATES]
        self.forms = {email.lower(): data.copy() for email, data in seed.FORMS.items()}
        self.documents = [d.copy() for d in seed.DOCUMENTS]
        self.reference_checks = [r.copy() for r in seed.REFERENCE_CHECKS]
        self.document_expiry = [e.copy() for e in seed.DOCUMENT_EXPIRY]
        self.audit_logs = [l.copy() for l in seed.AUDIT_LOGS]
        self.chat_histories = {email.lower(): [h.copy() for h in hist] for email, hist in seed.CHAT_HISTORY.items()}
        self.offer_details = []


# Singleton instance of our In-Memory store
in_memory_db = InMemoryDatabase()


# --- Centralized Data Access Layer (DAL) ---
# Directs queries to either PostgreSQL or the In-Memory Store based on Settings.
class DatabaseDAL:

    def _get_postgres_session(self):
        if SessionLocal:
            return SessionLocal()
        return None

    # --- User Operations ---
    def get_user_by_email(self, email: str):
        email_clean = email.strip().lower()
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    user = db.query(UserModel).filter(UserModel.email == email_clean).first()
                    if user:
                        return {
                            "email": user.email,
                            "password_hash": user.password_hash,
                            "password_salt": user.password_salt,
                            "name": user.name,
                            "role": user.role,
                            "location": user.location,
                            "joiningBonus": user.joining_bonus,
                            "relocation": user.relocation,
                            "relocationCity": user.relocation_city,
                            "alumni": user.alumni,
                            "designation": user.designation,
                            "department": user.department,
                            "joinedDate": user.joined_date,
                            "leftDate": user.left_date,
                            "yearsWorked": user.years_worked
                        }
                finally:
                    db.close()
        
        # In-Memory fallback
        return in_memory_db.users.get(email_clean)

    # --- Candidate Operations ---
    def get_candidates(self):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    candidates = db.query(CandidateModel).all()
                    return [
                        {
                            "id": c.id,
                            "name": c.name,
                            "email": c.email,
                            "status": c.status,
                            "docs": c.docs,
                            "total": c.total,
                            "dept": c.dept,
                            "selected": c.selected,
                            "pending": c.pending_docs
                        } for c in candidates
                    ]
                finally:
                    db.close()
        
        return in_memory_db.candidates

    def _register_candidate_postgres(self, email_clean: str, user_info: dict, candidate_data: dict):
        db = self._get_postgres_session()
        if db:
            try:
                db_user = UserModel(
                    email=email_clean,
                    password_hash=user_info["password_hash"],
                    password_salt=user_info["password_salt"],
                    name=user_info["name"],
                    role=user_info["role"],
                    location=user_info["location"],
                    joining_bonus=user_info["joiningBonus"],
                    relocation=user_info["relocation"],
                    relocation_city=user_info["relocationCity"],
                    alumni=user_info["alumni"],
                    designation=user_info["designation"],
                    department=user_info["department"]
                )
                db.add(db_user)
                
                db_candidate = CandidateModel(
                    name=candidate_data["name"],
                    email=email_clean,
                    status="pending",
                    docs=0,
                    total=12,
                    dept=candidate_data["department"].lower(),
                    selected=False,
                    pending_docs=[IDENTITY_PROOF, VISA_DOCUMENT, FINANCIAL_DOCUMENTS, PHOTO, PASSPORT]
                )
                db.add(db_candidate)
                db.commit()
                db.refresh(db_candidate)
                
                return {
                    "id": db_candidate.id,
                    "name": db_candidate.name,
                    "email": db_candidate.email,
                    "status": db_candidate.status,
                    "docs": db_candidate.docs,
                    "total": db_candidate.total,
                    "dept": db_candidate.dept,
                    "selected": db_candidate.selected,
                    "pending": db_candidate.pending_docs
                }
            finally:
                db.close()
        return None

    def _register_candidate_in_memory(self, email_clean: str, user_info: dict, candidate_data: dict):
        in_memory_db.users[email_clean] = user_info
        
        new_id = max([c["id"] for c in in_memory_db.candidates]) + 1 if in_memory_db.candidates else 1
        new_cand = {
            "id": new_id,
            "name": candidate_data["name"],
            "email": email_clean,
            "status": "pending",
            "docs": 0,
            "total": 12,
            "dept": candidate_data["department"].lower(),
            "selected": False,
            "pending": [IDENTITY_PROOF, VISA_DOCUMENT, FINANCIAL_DOCUMENTS, PHOTO, PASSPORT]
        }
        in_memory_db.candidates.append(new_cand)
        return new_cand

    def register_candidate(self, candidate_data: dict):
        email_clean = candidate_data["email"].strip().lower()
        
        from app.security import generate_salt, hash_password
        salt = generate_salt()
        hashed = hash_password(seed.DEMO_USER_PASSWORD, salt)
        
        user_info = {
            "password_hash": hashed,
            "password_salt": salt,
            "name": candidate_data["name"],
            "role": "candidate",
            "location": candidate_data["location"],
            "joiningBonus": candidate_data.get("joiningBonus", False),
            "relocation": candidate_data.get("relocation", False),
            "relocationCity": candidate_data.get("relocationCity", ""),
            "alumni": candidate_data.get("alumni", False),
            "designation": candidate_data.get("designation", "Software Engineer"),
            "department": candidate_data["department"]
        }
        
        if settings.USE_POSTGRES:
            res = self._register_candidate_postgres(email_clean, user_info, candidate_data)
            if res:
                return res

        return self._register_candidate_in_memory(email_clean, user_info, candidate_data)

    def _update_candidate_status_postgres(self, email_clean: str, status: str, pending_docs: list) -> bool:
        db = self._get_postgres_session()
        if db:
            try:
                c = db.query(CandidateModel).filter(CandidateModel.email == email_clean).first()
                if c:
                    c.status = status
                    if pending_docs is not None:
                        c.pending_docs = pending_docs
                        c.docs = max(0, c.total - len(pending_docs))
                    db.commit()
                    db.refresh(c)
                    return True
            finally:
                db.close()
        return False

    def _update_candidate_status_in_memory(self, email_clean: str, status: str, pending_docs: list) -> bool:
        for c in in_memory_db.candidates:
            if c["email"].lower() == email_clean:
                c["status"] = status
                if pending_docs is not None:
                    c["pending"] = pending_docs
                    c["docs"] = max(0, c["total"] - len(pending_docs))
                return True
        return False

    def update_candidate_status(self, email: str, status: str, pending_docs: list = None):
        email_clean = email.strip().lower()
        if settings.USE_POSTGRES:
            return self._update_candidate_status_postgres(email_clean, status, pending_docs)
        return self._update_candidate_status_in_memory(email_clean, status, pending_docs)

    # --- Onboarding Form Operations ---
    def get_onboarding_form(self, email: str):
        email_clean = email.strip().lower()
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    form = db.query(OnboardingFormModel).filter(OnboardingFormModel.candidate_email == email_clean).first()
                    if form:
                        return {
                            "personalInfo": form.personal_info,
                            "education": form.education,
                            "employment": form.employment
                        }
                finally:
                    db.close()
        
        # In-Memory fallback
        return in_memory_db.forms.get(email_clean, {"personalInfo": {}, "education": [], "employment": []})

    def save_onboarding_form(self, email: str, form_data: dict):
        email_clean = email.strip().lower()
        
        personal_info = form_data.get("personalInfo", {})
        education = form_data.get("education", [])
        employment = form_data.get("employment", [])
        
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    form = db.query(OnboardingFormModel).filter(OnboardingFormModel.candidate_email == email_clean).first()
                    if not form:
                        form = OnboardingFormModel(
                            candidate_email=email_clean,
                            personal_info=personal_info,
                            education=education,
                            employment=employment
                        )
                        db.add(form)
                    else:
                        form.personal_info = personal_info
                        form.education = education
                        form.employment = employment
                    db.commit()
                    return True
                except Exception as e:
                    logger.exception(f"Error saving onboarding form for {email_clean}:")
                    return False
                finally:
                    db.close()
            else:
                return False
        
        # In-Memory
        in_memory_db.forms[email_clean] = {
            "personalInfo": personal_info,
            "education": education,
            "employment": employment
        }
        return True

    # --- Document Operations ---
    def get_documents(self, email: str):
        email_clean = email.strip().lower()
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    docs = db.query(DocumentModel).filter(DocumentModel.candidate_email == email_clean).all()
                    return [
                        {
                            "id": d.id,
                            "candidateEmail": d.candidate_email,
                            "documentType": d.document_type,
                            "documentName": d.document_name,
                            "uploadedAt": d.uploaded_at,
                            "status": d.status,
                            "overallConfidence": d.overall_confidence,
                            "checks": d.checks,
                            "extractedData": d.extracted_data
                        } for d in docs
                    ]
                finally:
                    db.close()
        
        # In-Memory fallback
        return [d for d in in_memory_db.documents if d["candidateEmail"].lower() == email_clean]

    def add_document(self, doc_data: dict):
        email_clean = doc_data["candidateEmail"].strip().lower()
        
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    # Remove existing same-type document to overwrite it
                    db.query(DocumentModel).filter(
                        DocumentModel.candidate_email == email_clean,
                        DocumentModel.document_type == doc_data["documentType"]
                    ).delete()
                    
                    db_doc = DocumentModel(
                        id=doc_data["id"],
                        candidate_email=email_clean,
                        document_type=doc_data["documentType"],
                        document_name=doc_data["documentName"],
                        uploaded_at=doc_data.get("uploadedAt", datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()),
                        status=doc_data["status"],
                        overall_confidence=doc_data["overallConfidence"],
                        checks=doc_data["checks"],
                        extracted_data=doc_data["extractedData"]
                    )
                    db.add(db_doc)
                    db.commit()
                    db.refresh(db_doc)
                    
                    # Update candidate documents count and pending list
                    self._recalculate_candidate_docs(db, email_clean)
                    return True
                except Exception as e:
                    logger.exception(f"Error adding document for {email_clean}:")
                    return False
                finally:
                    db.close()
            else:
                return False
                    
        # In-Memory
        in_memory_db.documents = [d for d in in_memory_db.documents if not (d["candidateEmail"].lower() == email_clean and d["documentType"] == doc_data["documentType"])]
        in_memory_db.documents.append(doc_data)
        
        # Recalculate pending document details for candidate
        self._recalculate_candidate_docs_in_memory(email_clean)
        return True

    def _update_document_postgres(self, email_clean: str, doc_id: str, updates: dict) -> bool:
        db = self._get_postgres_session()
        if db:
            try:
                doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
                if doc:
                    if "status" in updates:
                        doc.status = updates["status"]
                    if "overallConfidence" in updates:
                        doc.overall_confidence = updates["overallConfidence"]
                    if "checks" in updates:
                        doc.checks = updates["checks"]
                    if "extractedData" in updates:
                        doc.extracted_data = updates["extractedData"]
                    db.commit()
                    self._recalculate_candidate_docs(db, email_clean)
                    return True
            finally:
                db.close()
        return False

    def _update_document_in_memory(self, email_clean: str, doc_id: str, updates: dict) -> bool:
        for d in in_memory_db.documents:
            if d["id"] == doc_id:
                if "status" in updates:
                    d["status"] = updates["status"]
                if "overallConfidence" in updates:
                    d["overallConfidence"] = updates["overallConfidence"]
                if "checks" in updates:
                    d["checks"] = updates["checks"]
                if "extractedData" in updates:
                    d["extractedData"] = updates["extractedData"]
                self._recalculate_candidate_docs_in_memory(email_clean)
                return True
        return False

    def update_document(self, email: str, doc_id: str, updates: dict):
        email_clean = email.strip().lower()
        if settings.USE_POSTGRES:
            return self._update_document_postgres(email_clean, doc_id, updates)
        return self._update_document_in_memory(email_clean, doc_id, updates)

    def _recalculate_candidate_docs(self, db, email: str):
        c = db.query(CandidateModel).filter(CandidateModel.email == email).first()
        if c:
            docs = db.query(DocumentModel).filter(DocumentModel.candidate_email == email, DocumentModel.status == "valid").all()
            valid_types = {d.document_type for d in docs}
            
            pending = []
            
            # Map type fields
            type_mapping = {
                "aadhar": IDENTITY_PROOF,
                "visa": VISA_DOCUMENT,
                "bankStatement": FINANCIAL_DOCUMENTS,
                "photo": PHOTO,
                "passport": PASSPORT
            }
            
            for doc_type, label in type_mapping.items():
                if doc_type not in valid_types:
                    pending.append(label)
                    
            c.pending_docs = pending
            c.docs = max(0, c.total - len(pending))
            
            if len(pending) == 0:
                c.status = "ready"
            else:
                c.status = "pending"
            db.commit()

    def _recalculate_candidate_docs_in_memory(self, email: str):
        valid_types = {d["documentType"] for d in in_memory_db.documents if d["candidateEmail"].lower() == email and d["status"] == "valid"}
        pending = []
        
        type_mapping = {
            "aadhar": IDENTITY_PROOF,
            "visa": VISA_DOCUMENT,
            "bankStatement": FINANCIAL_DOCUMENTS,
            "photo": PHOTO,
            "passport": PASSPORT
        }
        
        for doc_type, label in type_mapping.items():
            if doc_type not in valid_types:
                pending.append(label)
        
        # In-Memory update
        for c in in_memory_db.candidates:
            if c["email"].lower() == email:
                c["pendingDocs"] = pending
                c["docs"] = max(0, c["total"] - len(pending))
                c["status"] = "ready" if len(pending) == 0 else "pending"

    # --- Reference Checks Operations ---
    def get_reference_checks(self):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    checks = db.query(ReferenceCheckModel).all()
                    return [
                        {
                            "id": r.id,
                            "candidateId": r.candidate_id,
                            "candidateName": r.candidate_name,
                            "referenceName": r.reference_name,
                            "referenceEmail": r.reference_email,
                            "referencePhone": r.reference_phone,
                            "referenceCompany": r.reference_company,
                            "referencePosition": r.reference_position,
                            "relationship": r.relationship,
                            "requestDate": r.request_date,
                            "responseDate": r.response_date,
                            "status": r.status,
                            "rating": r.rating,
                            "feedback": r.feedback,
                            "sentDate": r.sent_date,
                            "token": r.token,
                            "createdAt": r.created_at,
                            "updatedAt": r.updated_at
                        } for r in checks
                    ]
                finally:
                    db.close()
        
        return in_memory_db.reference_checks

    def add_reference_check(self, ref_data: dict):
        import uuid
        referee_token = str(uuid.uuid4())
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    db_ref = ReferenceCheckModel(
                        candidate_id=str(ref_data["candidateId"]),
                        candidate_name=ref_data["candidateName"],
                        reference_name=ref_data["referenceName"],
                        reference_email=ref_data["referenceEmail"],
                        reference_phone=ref_data["referencePhone"],
                        reference_company=ref_data["referenceCompany"],
                        reference_position=ref_data["referencePosition"],
                        relationship=ref_data["relationship"],
                        request_date=ref_data.get("requestDate", datetime.date.today().isoformat()),
                        response_date=ref_data.get("responseDate"),
                        status=ref_data.get("status", "pending"),
                        rating=ref_data.get("rating"),
                        feedback=ref_data.get("feedback", ""),
                        sent_date=ref_data.get("sentDate", datetime.date.today().isoformat()),
                        token=referee_token,
                        created_at=datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat(),
                        updated_at=datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
                    )
                    db.add(db_ref)
                    db.commit()
                    db.refresh(db_ref)
                    return {
                        "id": db_ref.id,
                        "candidateId": db_ref.candidate_id,
                        "candidateName": db_ref.candidate_name,
                        "referenceName": db_ref.reference_name,
                        "referenceEmail": db_ref.reference_email,
                        "referencePhone": db_ref.reference_phone,
                        "referenceCompany": db_ref.reference_company,
                        "referencePosition": db_ref.reference_position,
                        "relationship": db_ref.relationship,
                        "requestDate": db_ref.request_date,
                        "responseDate": db_ref.response_date,
                        "status": db_ref.status,
                        "rating": db_ref.rating,
                        "feedback": db_ref.feedback,
                        "sentDate": db_ref.sent_date,
                        "token": db_ref.token,
                        "createdAt": db_ref.created_at,
                        "updatedAt": db_ref.updated_at
                    }
                finally:
                    db.close()
                    
        # In-Memory fallback
        new_id = max([r["id"] for r in in_memory_db.reference_checks]) + 1 if in_memory_db.reference_checks else 1
        new_ref = ref_data.copy()
        new_ref["id"] = new_id
        new_ref["status"] = ref_data.get("status", "pending")
        new_ref["feedback"] = ref_data.get("feedback", "")
        new_ref["requestDate"] = ref_data.get("requestDate", datetime.date.today().isoformat())
        new_ref["sentDate"] = ref_data.get("sentDate", datetime.date.today().isoformat())
        new_ref["token"] = referee_token
        new_ref["createdAt"] = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
        new_ref["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
        in_memory_db.reference_checks.append(new_ref)
        return new_ref

    def get_reference_check_by_token(self, token: str):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    c = db.query(ReferenceCheckModel).filter(ReferenceCheckModel.token == token).first()
                    if not c:
                        return None
                    return {
                        "id": c.id,
                        "candidateId": c.candidate_id,
                        "candidateName": c.candidate_name,
                        "referenceName": c.reference_name,
                        "referenceEmail": c.reference_email,
                        "referencePhone": c.reference_phone,
                        "referenceCompany": c.reference_company,
                        "referencePosition": c.reference_position,
                        "relationship": c.relationship,
                        "requestDate": c.request_date,
                        "responseDate": c.response_date,
                        "status": c.status,
                        "rating": c.rating,
                        "feedback": c.feedback,
                        "sentDate": c.sent_date,
                        "token": c.token,
                        "createdAt": c.created_at,
                        "updatedAt": c.updated_at
                    }
                finally:
                    db.close()
        
        # In-Memory
        for r in in_memory_db.reference_checks:
            if r.get("token") == token:
                return r.copy()
        return None

    def update_reference_check_by_token(self, token: str, updates: dict):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    ref = db.query(ReferenceCheckModel).filter(ReferenceCheckModel.token == token).first()
                    if ref:
                        if "status" in updates:
                            ref.status = updates["status"]
                        if "rating" in updates:
                            ref.rating = updates["rating"]
                        if "feedback" in updates:
                            ref.feedback = updates["feedback"]
                        if "responseDate" in updates:
                            ref.response_date = updates["responseDate"]
                        ref.updated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
                        db.commit()
                        return True
                finally:
                    db.close()
        
        # In-Memory
        for r in in_memory_db.reference_checks:
            if r.get("token") == token:
                if "status" in updates:
                    r["status"] = updates["status"]
                if "rating" in updates:
                    r["rating"] = updates["rating"]
                if "feedback" in updates:
                    r["feedback"] = updates["feedback"]
                if "responseDate" in updates:
                    r["responseDate"] = updates["responseDate"]
                r["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
                return True
        return False

    def update_reference_check(self, ref_id: int, updates: dict):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    ref = db.query(ReferenceCheckModel).filter(ReferenceCheckModel.id == ref_id).first()
                    if ref:
                        if "status" in updates:
                            ref.status = updates["status"]
                        if "rating" in updates:
                            ref.rating = updates["rating"]
                        if "feedback" in updates:
                            ref.feedback = updates["feedback"]
                        if "responseDate" in updates:
                            ref.response_date = updates["responseDate"]
                        ref.updated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
                        db.commit()
                        return True
                finally:
                    db.close()
        
        # In-Memory
        for r in in_memory_db.reference_checks:
            if r["id"] == ref_id:
                if "status" in updates:
                    r["status"] = updates["status"]
                if "rating" in updates:
                    r["rating"] = updates["rating"]
                if "feedback" in updates:
                    r["feedback"] = updates["feedback"]
                if "responseDate" in updates:
                    r["responseDate"] = updates["responseDate"]
                r["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
                return True
        return False

    def get_document_expiries(self):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    expiries = db.query(DocumentExpiryModel).all()
                    return [
                        {
                            "id": e.id,
                            "candidateId": e.candidate_id,
                            "candidateName": e.candidate_name,
                            "documentType": e.document_type,
                            "documentName": e.document_name,
                            "documentNumber": e.document_number,
                            "issueDate": e.issue_date,
                            "expiryDate": e.expiry_date,
                            "daysUntilExpiry": e.days_until_expiry,
                            "status": e.status,
                            "notes": e.notes,
                            "createdAt": e.created_at,
                            "updatedAt": e.updated_at,
                            "reminderSent": e.reminder_sent
                        } for e in expiries
                    ]
                finally:
                    db.close()
        
        return in_memory_db.document_expiry

    def add_document_expiry(self, expiry_data: dict):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    db_expiry = DocumentExpiryModel(
                        candidate_id=str(expiry_data["candidateId"]),
                        candidate_name=expiry_data["candidateName"],
                        document_type=expiry_data["documentType"],
                        document_name=expiry_data["documentName"],
                        document_number=expiry_data["documentNumber"],
                        issue_date=expiry_data["issueDate"],
                        expiry_date=expiry_data["expiryDate"],
                        days_until_expiry=int(expiry_data.get("daysUntilExpiry", 30)),
                        status=expiry_data.get("status", "valid"),
                        notes=expiry_data.get("notes", ""),
                        reminder_sent=expiry_data.get("reminderSent", False),
                        created_at=datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat(),
                        updated_at=datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
                    )
                    db.add(db_expiry)
                    db.commit()
                    db.refresh(db_expiry)
                    return True
                except Exception as e:
                    logger.exception(f"Error adding document expiry for {expiry_data.get('candidateName')}:")
                    return False
                finally:
                    db.close()
            else:
                return False
                    
        # In-Memory fallback
        new_id = max([e["id"] for e in in_memory_db.document_expiry]) + 1 if in_memory_db.document_expiry else 1
        new_exp = expiry_data.copy()
        new_exp["id"] = new_id
        new_exp["createdAt"] = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
        new_exp["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
        in_memory_db.document_expiry.append(new_exp)
        return True

    def _update_document_expiry_postgres(self, expiry_id: int, updates: dict) -> bool:
        db = self._get_postgres_session()
        if db:
            try:
                exp = db.query(DocumentExpiryModel).filter(DocumentExpiryModel.id == expiry_id).first()
                if exp:
                    if "status" in updates:
                        exp.status = updates["status"]
                    if "notes" in updates:
                        exp.notes = updates["notes"]
                    if "reminderSent" in updates:
                        exp.reminder_sent = updates["reminderSent"]
                    exp.updated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
                    db.commit()
                    return True
            finally:
                db.close()
        return False

    def _update_document_expiry_in_memory(self, expiry_id: int, updates: dict) -> bool:
        for e in in_memory_db.document_expiry:
            if e["id"] == expiry_id:
                if "status" in updates:
                    e["status"] = updates["status"]
                if "notes" in updates:
                    e["notes"] = updates["notes"]
                if "reminderSent" in updates:
                    e["reminderSent"] = updates["reminderSent"]
                e["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
                return True
        return False

    def update_document_expiry(self, expiry_id: int, updates: dict):
        if settings.USE_POSTGRES:
            return self._update_document_expiry_postgres(expiry_id, updates)
        return self._update_document_expiry_in_memory(expiry_id, updates)

    # --- Audit Log Operations ---
    def get_audit_logs(self):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    logs = db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).all()
                    return [
                        {
                            "id": l.id,
                            "timestamp": l.timestamp,
                            "userRole": l.user_role,
                            "action": l.action,
                            "details": l.details,
                            "location": l.location
                        } for l in logs
                    ]
                finally:
                    db.close()
        
        return in_memory_db.audit_logs

    def add_audit_log(self, log_data: dict):
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    db_log = AuditLogModel(
                        timestamp=log_data.get("timestamp", datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()),
                        user_role=log_data["userRole"],
                        action=log_data["action"],
                        details=log_data.get("details", {}),
                        location=log_data["location"]
                    )
                    db.add(db_log)
                    db.commit()
                    return True
                except Exception as e:
                    logger.exception("Error adding audit log:")
                    return False
                finally:
                    db.close()
            else:
                return False
                    
        # In-Memory
        new_log = log_data.copy()
        new_log["id"] = int(datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).timestamp() * 1000)
        new_log["timestamp"] = log_data.get("timestamp", datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat())
        in_memory_db.audit_logs.insert(0, new_log)
        if len(in_memory_db.audit_logs) > 1000:
            in_memory_db.audit_logs.pop()
        return True

    # --- Chat Operations ---
    def get_chat_history(self, email: str):
        email_clean = email.strip().lower()
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    history = db.query(ChatHistoryModel).filter(ChatHistoryModel.candidate_email == email_clean).order_by(ChatHistoryModel.timestamp.asc()).all()
                    return [
                        {
                            "message": h.message,
                            "type": h.type,
                            "timestamp": h.timestamp
                        } for h in history
                    ]
                finally:
                    db.close()
                    
        # In-Memory fallback
        return in_memory_db.chat_histories.get(email_clean, [
            {"message": "Hello! Welcome to the ValueMomentum onboarding portal.", "type": "bot", "timestamp": 1717135000000},
            {"message": "How can I help you complete your documentation?", "type": "bot", "timestamp": 1717135010000}
        ])

    def add_chat_message(self, email: str, msg: dict):
        email_clean = email.strip().lower()
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    db_msg = ChatHistoryModel(
                        candidate_email=email_clean,
                        message=msg["message"],
                        type=msg["type"],
                        timestamp=float(msg.get("timestamp", datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).timestamp() * 1000))
                    )
                    db.add(db_msg)
                    db.commit()
                    return True
                except Exception as e:
                    logger.exception(f"Error adding chat message for {email_clean}:")
                    return False
                finally:
                    db.close()
            else:
                return False
                    
        if email_clean not in in_memory_db.chat_histories:
            in_memory_db.chat_histories[email_clean] = []
        in_memory_db.chat_histories[email_clean].append(msg)
        return True

    # --- Offer Letters Operations (TAG Exclusive) ---
    def _get_offer_candidates_by_user_postgres(self, username_clean: str) -> list:
        db = self._get_postgres_session()
        if db:
            try:
                candidates = db.query(OfferDetailModel).filter(
                    OfferDetailModel.username.ilike(username_clean)
                ).order_by(OfferDetailModel.created_at.desc()).all()
                
                output = []
                for c in candidates:
                    tag_poc = ""
                    if c.extra_data and isinstance(c.extra_data, dict):
                        tag_poc = c.extra_data.get("tag_poc", "")
                    output.append({
                        "id": c.id,
                        "name": c.candidate_name,
                        "email": c.candidate_email,
                        "position": c.position,
                        "department": c.department,
                        "salary": float(c.total_salary),
                        "joining_date": c.joining_date.strftime('%Y-%m-%d') if c.joining_date else "",
                        "created_at": c.created_at.strftime('%Y-%m-%d') if c.created_at else "",
                        "pdf_path": c.pdf_path,
                        "salary_breakdown": c.salary_breakdown,
                        "status": c.status,
                        "offer_date": c.joining_date.strftime('%Y-%m-%d') if c.joining_date else "",
                        "facility": c.facility,
                        "tag_poc": tag_poc
                    })
                return output
            finally:
                db.close()
        return []

    def _get_offer_candidates_by_user_in_memory(self, username_clean: str) -> list:
        output = []
        for c in in_memory_db.offer_details:
            if c["username"].strip().lower() == username_clean:
                output.append(c.copy())
        return sorted(output, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_offer_candidates_by_user(self, username: str) -> list:
        username_clean = username.strip().lower()
        if settings.USE_POSTGRES:
            return self._get_offer_candidates_by_user_postgres(username_clean)
        return self._get_offer_candidates_by_user_in_memory(username_clean)

    def _create_offer_details_postgres(self, offer_id: str, username: str, offer_data: dict, salary_breakdown: dict, joining_dt_parsed, extra_data: dict):
        db = self._get_postgres_session()
        if db:
            try:
                new_record = OfferDetailModel(
                    id=offer_id,
                    username=username,
                    candidate_name=offer_data["candidate_name"],
                    candidate_email=offer_data["candidate_email"],
                    candidate_phone=offer_data["candidate_phone"],
                    candidate_pan=offer_data["pan"],
                    status=offer_data["status"],
                    source=offer_data["source"],
                    designation=offer_data["designation"],
                    position=offer_data["position"],
                    department=offer_data["department"],
                    joining_date=joining_dt_parsed,
                    facility=offer_data["facility"],
                    work_mode=offer_data.get("work_mode") or offer_data["employment_type"],
                    total_salary=float(offer_data["total_salary"]),
                    current_ctc=float(offer_data.get("current_ctc") or 0.0),
                    extra_data=extra_data,
                    created_at=datetime.datetime.now(),
                    pdf_path=offer_data.get("pdf_path"),
                    salary_breakdown=json.dumps(salary_breakdown)
                )
                db.add(new_record)
                db.commit()
                return offer_id
            finally:
                db.close()
        return None

    def _create_offer_details_in_memory(self, offer_id: str, username: str, offer_data: dict, salary_breakdown: dict, joining_dt, extra_data: dict):
        new_inmem = {
            "id": offer_id,
            "username": username,
            "candidate_name": offer_data["candidate_name"],
            "candidate_email": offer_data["candidate_email"],
            "candidate_phone": offer_data["candidate_phone"],
            "candidate_pan": offer_data["pan"],
            "status": offer_data["status"],
            "source": offer_data["source"],
            "designation": offer_data["designation"],
            "position": offer_data["position"],
            "department": offer_data["department"],
            "joining_date": joining_dt,
            "facility": offer_data["facility"],
            "work_mode": offer_data.get("work_mode") or offer_data["employment_type"],
            "total_salary": float(offer_data["total_salary"]),
            "current_ctc": float(offer_data.get("current_ctc") or 0.0),
            "extra_data": extra_data,
            "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "pdf_path": offer_data.get("pdf_path"),
            "salary_breakdown": json.dumps(salary_breakdown)
        }
        new_inmem.update({
            "name": offer_data["candidate_name"],
            "email": offer_data["candidate_email"],
            "salary": float(offer_data["total_salary"]),
            "offer_date": joining_dt,
            "tag_poc": offer_data.get("tag_poc", "")
        })
        in_memory_db.offer_details.append(new_inmem)
        return offer_id

    def create_offer_details_record(self, username: str, offer_data: dict, salary_breakdown: dict) -> str:
        offer_id = str(uuid.uuid4())
        
        joining_dt = offer_data.get("joining_date")
        if isinstance(joining_dt, str):
            joining_dt_parsed = datetime.datetime.strptime(joining_dt, "%Y-%m-%d").date()
        else:
            joining_dt_parsed = joining_dt
            
        extra_keys = [
            "tag_poc", "pos_id", "source_type", "source_details", "years_of_experience",
            "offer_approval_email_sent_date", "offer_approval_received_date", "date_of_offer",
            "primary_skill", "secondary_skill", "current_location", "candidate_address",
            "prev_org", "comments", "grade", "business_unit", "tsc", "sub_tsc",
            "allocation_unit", "account", "project", "employment_type", "work_location",
            "reporting_manager", "probation_period", "notice_period", "ectc",
            "vam_proposed_ctc", "revised_ctc", "deviation", "jb_amt", "jb_reason",
            "days_lapsed", "np_buyout_amt", "np_buyout_mail_approval_date", "benefits",
            "terms_and_conditions"
        ]
        extra_data = {}
        for k in extra_keys:
            if k in offer_data:
                extra_data[k] = offer_data[k]
                
        if settings.USE_POSTGRES:
            res = self._create_offer_details_postgres(offer_id, username, offer_data, salary_breakdown, joining_dt_parsed, extra_data)
            if res:
                return res
                    
        return self._create_offer_details_in_memory(offer_id, username, offer_data, salary_breakdown, joining_dt, extra_data)

    def _get_offer_detail_by_id_postgres(self, offer_id: str, username_clean: str) -> dict:
        db = self._get_postgres_session()
        if db:
            try:
                c = db.query(OfferDetailModel).filter(
                    OfferDetailModel.id == offer_id
                ).filter(
                    OfferDetailModel.username.ilike(username_clean)
                ).first()
                if not c:
                    return None
                return {
                    "id": c.id,
                    "username": c.username,
                    "candidate_name": c.candidate_name,
                    "candidate_email": c.candidate_email,
                    "candidate_phone": c.candidate_phone,
                    "candidate_pan": c.candidate_pan,
                    "status": c.status,
                    "source": c.source,
                    "designation": c.designation,
                    "position": c.position,
                    "department": c.department,
                    "joining_date": c.joining_date.strftime('%Y-%m-%d') if c.joining_date else "",
                    "facility": c.facility,
                    "work_mode": c.work_mode,
                    "total_salary": float(c.total_salary),
                    "current_ctc": float(c.current_ctc),
                    "extra_data": c.extra_data,
                    "created_at": c.created_at.strftime('%Y-%m-%d') if c.created_at else "",
                    "pdf_path": c.pdf_path,
                    "salary_breakdown": c.salary_breakdown
                }
            finally:
                db.close()
        return None

    def _get_offer_detail_by_id_in_memory(self, offer_id: str, username_clean: str) -> dict:
        for c in in_memory_db.offer_details:
            if c["id"] == offer_id and c["username"].strip().lower() == username_clean:
                return c.copy()
        return None

    def get_offer_detail_by_id(self, offer_id: str, username: str) -> dict:
        username_clean = username.strip().lower()
        if settings.USE_POSTGRES:
            return self._get_offer_detail_by_id_postgres(offer_id, username_clean)
        return self._get_offer_detail_by_id_in_memory(offer_id, username_clean)

    def _update_offer_details_record_postgres(self, offer_id: str, username_clean: str, offer_data: dict, salary_breakdown: dict, pdf_path: str, joining_dt_parsed, extra_data: dict) -> bool:
        db = self._get_postgres_session()
        if db:
            try:
                record = db.query(OfferDetailModel).filter(
                    OfferDetailModel.id == offer_id
                ).filter(
                    OfferDetailModel.username.ilike(username_clean)
                ).first()
                if not record:
                    return False
                
                record.candidate_name = offer_data["candidate_name"]
                record.candidate_email = offer_data["candidate_email"]
                record.candidate_phone = offer_data["candidate_phone"]
                record.candidate_pan = offer_data["pan"]
                record.status = offer_data["status"]
                record.source = offer_data["source"]
                record.designation = offer_data["designation"]
                record.position = offer_data["position"]
                record.department = offer_data["department"]
                record.joining_date = joining_dt_parsed
                record.facility = offer_data["facility"]
                record.work_mode = offer_data.get("work_mode") or offer_data["employment_type"]
                record.total_salary = float(offer_data["total_salary"])
                record.current_ctc = float(offer_data.get("current_ctc") or 0.0)
                record.extra_data = extra_data
                record.salary_breakdown = json.dumps(salary_breakdown)
                if pdf_path:
                    record.pdf_path = pdf_path
                    
                db.commit()
                return True
            finally:
                db.close()
        return False

    def _update_offer_details_record_in_memory(self, offer_id: str, username_clean: str, offer_data: dict, salary_breakdown: dict, pdf_path: str, joining_dt, extra_data: dict) -> bool:
        for c in in_memory_db.offer_details:
            if c["id"] == offer_id and c["username"].strip().lower() == username_clean:
                c.update({
                    "candidate_name": offer_data["candidate_name"],
                    "candidate_email": offer_data["candidate_email"],
                    "candidate_phone": offer_data["candidate_phone"],
                    "candidate_pan": offer_data["pan"],
                    "status": offer_data["status"],
                    "source": offer_data["source"],
                    "designation": offer_data["designation"],
                    "position": offer_data["position"],
                    "department": offer_data["department"],
                    "joining_date": joining_dt,
                    "facility": offer_data["facility"],
                    "work_mode": offer_data.get("work_mode") or offer_data["employment_type"],
                    "total_salary": float(offer_data["total_salary"]),
                    "current_ctc": float(offer_data.get("current_ctc") or 0.0),
                    "extra_data": extra_data,
                    "salary_breakdown": json.dumps(salary_breakdown)
                })
                c.update({
                    "name": offer_data["candidate_name"],
                    "email": offer_data["candidate_email"],
                    "salary": float(offer_data["total_salary"]),
                    "offer_date": joining_dt,
                    "tag_poc": offer_data.get("tag_poc", "")
                })
                if pdf_path:
                    c["pdf_path"] = pdf_path
                return True
        return False

    def update_offer_details_record(self, offer_id: str, username: str, offer_data: dict, salary_breakdown: dict, pdf_path: str = None) -> bool:
        username_clean = username.strip().lower()
        joining_dt = offer_data.get("joining_date")
        if isinstance(joining_dt, str):
            joining_dt_parsed = datetime.datetime.strptime(joining_dt, "%Y-%m-%d").date()
        else:
            joining_dt_parsed = joining_dt
            
        extra_keys = [
            "tag_poc", "pos_id", "source_type", "source_details", "years_of_experience",
            "offer_approval_email_sent_date", "offer_approval_received_date", "date_of_offer",
            "primary_skill", "secondary_skill", "current_location", "candidate_address",
            "prev_org", "comments", "grade", "business_unit", "tsc", "sub_tsc",
            "allocation_unit", "account", "project", "employment_type", "work_location",
            "reporting_manager", "probation_period", "notice_period", "ectc",
            "vam_proposed_ctc", "revised_ctc", "deviation", "jb_amt", "jb_reason",
            "days_lapsed", "np_buyout_amt", "np_buyout_mail_approval_date", "benefits",
            "terms_and_conditions"
        ]
        extra_data = {}
        for k in extra_keys:
            if k in offer_data:
                extra_data[k] = offer_data[k]
                
        if settings.USE_POSTGRES:
            return self._update_offer_details_record_postgres(offer_id, username_clean, offer_data, salary_breakdown, pdf_path, joining_dt_parsed, extra_data)
        return self._update_offer_details_record_in_memory(offer_id, username_clean, offer_data, salary_breakdown, pdf_path, joining_dt, extra_data)

    def update_offer_letter_status_db(self, offer_id: str, status: str, username: str) -> bool:
        username_clean = username.strip().lower()
        if settings.USE_POSTGRES:
            db = self._get_postgres_session()
            if db:
                try:
                    record = db.query(OfferDetailModel).filter(
                        OfferDetailModel.id == offer_id
                    ).filter(
                        OfferDetailModel.username.ilike(username_clean)
                    ).first()
                    if not record:
                        return False
                    record.status = status
                    db.commit()
                    return True
                finally:
                    db.close()
                    
        # In-Memory
        for c in in_memory_db.offer_details:
            if c["id"] == offer_id and c["username"].strip().lower() == username_clean:
                c["status"] = status
                return True
        return False

    def _get_offer_letters_by_user_postgres(self, username_clean: str) -> list:
        db = self._get_postgres_session()
        if db:
            try:
                offers = db.query(OfferDetailModel).filter(
                    OfferDetailModel.username.ilike(username_clean)
                ).all()
                
                output = []
                for c in offers:
                    output.append({
                        "id": c.id,
                        "candidate_name": c.candidate_name,
                        "candidate_email": c.candidate_email,
                        "position": c.position,
                        "department": c.department,
                        "total_salary": float(c.total_salary),
                        "joining_date": c.joining_date.strftime('%Y-%m-%d') if c.joining_date else "",
                        "created_at": c.created_at.strftime('%Y-%m-%d') if c.created_at else "",
                        "pdf_path": c.pdf_path,
                        "salary_breakdown": c.salary_breakdown
                    })
                return output
            finally:
                db.close()
        return []

    def _get_offer_letters_by_user_in_memory(self, username_clean: str) -> list:
        output = []
        for c in in_memory_db.offer_details:
            if c["username"].strip().lower() == username_clean:
                output.append({
                    "id": c["id"],
                    "candidate_name": c["candidate_name"],
                    "candidate_email": c["candidate_email"],
                    "position": c["position"],
                    "department": c["department"],
                    "total_salary": float(c["total_salary"]),
                    "joining_date": c["joining_date"],
                    "created_at": c["created_at"],
                    "pdf_path": c.get("pdf_path"),
                    "salary_breakdown": c.get("salary_breakdown")
                })
        return output

    def get_offer_letters_by_user(self, username: str) -> list:
        username_clean = username.strip().lower()
        if settings.USE_POSTGRES:
            return self._get_offer_letters_by_user_postgres(username_clean)
        return self._get_offer_letters_by_user_in_memory(username_clean)


# Export a single global Data Access Layer object
db_dal = DatabaseDAL()
