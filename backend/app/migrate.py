import os
import sys
import json
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Setup pathing to resolve imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.models import Base
import app.seed_data as seed

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("DatabaseMigration")

def _migrate_users(session):
    # A. Migrate Users Table
    logger.info("Migrating Users credentials registry...")
    user_count = 0
    for email, data in seed.USER_DATABASE.items():
        email_clean = email.strip().lower()
        
        # Check if user already exists
        existing_user = session.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": email_clean}
        ).first()
        
        if not existing_user:
            session.execute(
                text("""
                    INSERT INTO users (
                        email, password_hash, password_salt, name, role, location,
                        joining_bonus, relocation, relocation_city, alumni,
                        designation, department, joined_date, left_date, years_worked
                    ) VALUES (
                        :email, :password_hash, :password_salt, :name, :role, :location,
                        :joining_bonus, :relocation, :relocation_city, :alumni,
                        :designation, :department, :joined_date, :left_date, :years_worked
                    )
                """),
                {
                    "email": email_clean,
                    "password_hash": data["password_hash"],
                    "password_salt": data["password_salt"],
                    "name": data["name"],
                    "role": data["role"],
                    "location": data["location"],
                    "joining_bonus": data.get("joiningBonus", False),
                    "relocation": data.get("relocation", False),
                    "relocation_city": data.get("relocationCity", ""),
                    "alumni": data.get("alumni", False),
                    "designation": data.get("designation", ""),
                    "department": data.get("department", ""),
                    "joined_date": data.get("joinedDate"),
                    "left_date": data.get("leftDate"),
                    "years_worked": data.get("yearsWorked", 0.0)
                }
            )
            user_count += 1
    logger.info(f"Successfully migrated {user_count} User accounts.")

def _migrate_candidates(session):
    # B. Migrate Candidates Table
    logger.info("Migrating Candidate profiles...")
    candidate_count = 0
    for c in seed.CANDIDATES:
        email_clean = c["email"].strip().lower()
        
        existing_cand = session.execute(
            text("SELECT id FROM candidates WHERE email = :email"),
            {"email": email_clean}
        ).first()
        
        if not existing_cand:
            # Ensure the user account exists first
            existing_user = session.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": email_clean}
            ).first()
            
            if not existing_user:
                # Create default user account if missing
                demo_user = seed.DEFAULT_CANDIDATE
                session.execute(
                    text("""
                        INSERT INTO users (email, password_hash, password_salt, name, role, location)
                        VALUES (:email, :hash, :salt, :name, :role, :loc)
                    """),
                    {
                        "email": email_clean,
                        "hash": demo_user["password_hash"],
                        "salt": demo_user["password_salt"],
                        "name": c["name"],
                        "role": "candidate",
                        "loc": "india"
                    }
                )
            
            session.execute(
                text("""
                    INSERT INTO candidates (name, email, status, docs, total, dept, selected, pending_docs)
                    VALUES (:name, :email, :status, :docs, :total, :dept, :selected, :pending_docs)
                """),
                {
                    "name": c["name"],
                    "email": email_clean,
                    "status": c["status"],
                    "docs": c["docs"],
                    "total": c["total"],
                    "dept": c["dept"],
                    "selected": c.get("selected", False),
                    "pending_docs": json.dumps(c.get("pending", []))
                }
            )
            candidate_count += 1
    logger.info(f"Successfully migrated {candidate_count} Candidate tracker profiles.")

def _migrate_forms(session):
    # C. Migrate Onboarding Forms
    logger.info("Migrating Onboarding Forms...")
    form_count = 0
    for email, data in seed.FORMS.items():
        email_clean = email.strip().lower()
        
        existing_form = session.execute(
            text("SELECT id FROM onboarding_forms WHERE candidate_email = :email"),
            {"email": email_clean}
        ).first()
        
        if not existing_form:
            session.execute(
                text("""
                    INSERT INTO onboarding_forms (candidate_email, personal_info, education, employment)
                    VALUES (:email, :personal_info, :education, :employment)
                """),
                {
                    "email": email_clean,
                    "personal_info": json.dumps(data.get("personalInfo", {})),
                    "education": json.dumps(data.get("education", [])),
                    "employment": json.dumps(data.get("employment", []))
                }
            )
            form_count += 1
    logger.info(f"Successfully migrated {form_count} Onboarding Forms.")

def _migrate_documents(session):
    # D. Migrate Documents
    logger.info("Migrating Candidate Document Upload metadata...")
    doc_count = 0
    for d in seed.DOCUMENTS:
        email_clean = d["candidateEmail"].strip().lower()
        
        existing_doc = session.execute(
            text("SELECT id FROM documents WHERE id = :id"),
            {"id": d["id"]}
        ).first()
        
        if not existing_doc:
            session.execute(
                text("""
                    INSERT INTO documents (id, candidate_email, document_type, document_name, uploaded_at, status, overall_confidence, checks, extracted_data)
                    VALUES (:id, :email, :type, :name, :uploaded_at, :status, :confidence, :checks, :extracted_data)
                """),
                {
                    "id": d["id"],
                    "email": email_clean,
                    "type": d["documentType"],
                    "name": d["documentName"],
                    "uploaded_at": d["uploadedAt"],
                    "status": d["status"],
                    "confidence": d["overallConfidence"],
                    "checks": json.dumps(d.get("checks", {})),
                    "extracted_data": json.dumps(d.get("extractedData", {}))
                }
            )
            doc_count += 1
    logger.info(f"Successfully migrated {doc_count} Document Upload records.")

def _migrate_reference_checks(session):
    # E. Migrate Reference Checks
    logger.info("Migrating Reference Checks tracker...")
    ref_count = 0
    for r in seed.REFERENCE_CHECKS:
        existing_ref = session.execute(
            text("SELECT id FROM reference_checks WHERE id = :id"),
            {"id": r["id"]}
        ).first()
        
        if not existing_ref:
            session.execute(
                text("""
                    INSERT INTO reference_checks (
                        id, candidate_id, candidate_name, reference_name, reference_email, reference_phone,
                        reference_company, reference_position, relationship, request_date, response_date,
                        status, rating, feedback, sent_date, created_at, updated_at
                    ) VALUES (
                        :id, :cand_id, :cand_name, :ref_name, :ref_email, :ref_phone,
                        :ref_company, :ref_position, :relationship, :req_date, :res_date,
                        :status, :rating, :feedback, :sent_date, :created_at, :updated_at
                    )
                """),
                {
                    "id": r["id"],
                    "cand_id": str(r["candidateId"]),
                    "cand_name": r["candidateName"],
                    "ref_name": r["referenceName"],
                    "ref_email": r["referenceEmail"],
                    "ref_phone": r["referencePhone"],
                    "ref_company": r["referenceCompany"],
                    "ref_position": r["referencePosition"],
                    "relationship": r["relationship"],
                    "req_date": r["requestDate"],
                    "res_date": r.get("responseDate"),
                    "status": r["status"],
                    "rating": r.get("rating"),
                    "feedback": r.get("feedback", ""),
                    "sent_date": r["sentDate"],
                    "created_at": r["createdAt"],
                    "updated_at": r["updatedAt"]
                }
            )
            ref_count += 1
    # Sync primary key sequences in postgres to prevent collision on new auto-increments
    session.execute(text("SELECT setval(pg_get_serial_sequence('reference_checks', 'id'), coalesce(max(id), 1)) FROM reference_checks"))
    logger.info(f"Successfully migrated {ref_count} Reference Check workflows.")

def _migrate_document_expiry(session):
    # F. Migrate Document Expiry tracker
    logger.info("Migrating Document Expiry logs...")
    exp_count = 0
    for e in seed.DOCUMENT_EXPIRY:
        existing_exp = session.execute(
            text("SELECT id FROM document_expiry WHERE id = :id"),
            {"id": e["id"]}
        ).first()
        
        if not existing_exp:
            session.execute(
                text("""
                    INSERT INTO document_expiry (
                        id, candidate_id, candidate_name, document_type, document_name, document_number,
                        issue_date, expiry_date, days_until_expiry, status, notes, created_at, updated_at, reminder_sent
                    ) VALUES (
                        :id, :cand_id, :cand_name, :type, :doc_name, :doc_num,
                        :issue_date, :expiry_date, :days, :status, :notes, :created_at, :updated_at, :reminder_sent
                    )
                """),
                {
                    "id": e["id"],
                    "cand_id": str(e["candidateId"]),
                    "cand_name": e["candidateName"],
                    "type": e["documentType"],
                    "doc_name": e["documentName"],
                    "doc_num": e["documentNumber"],
                    "issue_date": e["issueDate"],
                    "expiry_date": e["expiryDate"],
                    "days": e["daysUntilExpiry"],
                    "status": e["status"],
                    "notes": e.get("notes", ""),
                    "created_at": e["createdAt"],
                    "updated_at": e["updatedAt"],
                    "reminder_sent": e.get("reminderSent", False)
                }
            )
            exp_count += 1
    session.execute(text("SELECT setval(pg_get_serial_sequence('document_expiry', 'id'), coalesce(max(id), 1)) FROM document_expiry"))
    logger.info(f"Successfully migrated {exp_count} Document Expiry tracking entries.")

def _migrate_audit_logs(session):
    # G. Migrate Audit Logs
    logger.info("Migrating Audit Trail logs...")
    audit_count = 0
    for l in seed.AUDIT_LOGS:
        existing_log = session.execute(
            text("SELECT id FROM audit_logs WHERE id = :id"),
            {"id": l["id"]}
        ).first()
        
        if not existing_log:
            session.execute(
                text("""
                    INSERT INTO audit_logs (id, timestamp, user_role, action, details, location)
                    VALUES (:id, :timestamp, :role, :action, :details, :location)
                """),
                {
                    "id": l["id"],
                    "timestamp": l["timestamp"],
                    "role": l["userRole"],
                    "action": l["action"],
                    "details": json.dumps(l.get("details", {})),
                    "location": l["location"]
                }
            )
            audit_count += 1
    session.execute(text("SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), coalesce(max(id), 1)) FROM audit_logs"))
    logger.info(f"Successfully migrated {audit_count} Audit Trail entries.")

def _migrate_chat_history(session):
    # H. Migrate Chat History
    logger.info("Migrating Chat History logs...")
    chat_count = 0
    for email, hist in seed.CHAT_HISTORY.items():
        email_clean = email.strip().lower()
        
        for msg in hist:
            # To prevent duplicate chats, check if message with timestamp exists
            existing_chat = session.execute(
                text("SELECT id FROM chat_history WHERE candidate_email = :email AND timestamp = :ts"),
                {"email": email_clean, "ts": msg["timestamp"]}
            ).first()
            
            if not existing_chat:
                session.execute(
                    text("""
                        INSERT INTO chat_history (candidate_email, message, type, timestamp)
                        VALUES (:email, :message, :type, :timestamp)
                    """),
                    {
                        "email": email_clean,
                        "message": msg["message"],
                        "type": msg["type"],
                        "timestamp": msg["timestamp"]
                    }
                )
                chat_count += 1
    logger.info(f"Successfully migrated {chat_count} Support Chat messages.")

def run_migrations():
    logger.info("Initializing PostgreSQL schema migrations...")
    logger.info(f"Target Database URL: {settings.DATABASE_URL}")
    
    # 1. Establish database engine
    try:
        engine = create_engine(settings.DATABASE_URL)
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection verified successfully.")
    except Exception:
        logger.exception("Failed to connect to PostgreSQL database:")
        logger.error("Please verify that your database server is running, the database exists, and credentials are correct.")
        sys.exit(1)
        
    # 2. Read and apply schema.sql
    schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")
    if not os.path.exists(schema_path):
        logger.error(f"schema.sql not found at {schema_path}")
        sys.exit(1)
        
    try:
        logger.info("Reading schema DDL statements...")
        with open(schema_path, "r") as f:
            ddl_sql = f.read()
            
        # Split DDL by double newlines or lines to clean comments
        logger.info("Applying DDL statements to build tables and indexes...")
        with engine.begin() as conn:
            conn.execute(text(ddl_sql))
        logger.info("All tables, constraints, check boundaries, and indexes built successfully.")
    except Exception:
        logger.exception("Error applying DDL statements:")
        sys.exit(1)

    # 3. Seed initial database data from seed_data.py
    logger.info("Starting data migration from mock seed data stores...")
    SessionClass = sessionmaker(bind=engine)
    session = SessionClass()
    
    try:
        _migrate_users(session)
        _migrate_candidates(session)
        _migrate_forms(session)
        _migrate_documents(session)
        _migrate_reference_checks(session)
        _migrate_document_expiry(session)
        _migrate_audit_logs(session)
        _migrate_chat_history(session)
        
        session.commit()
        logger.info("Data Seeding & Schema Migrations COMPLETED successfully!")
        
    except Exception:
        session.rollback()
        logger.exception("Migration failed due to database seeding error:")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    run_migrations()
