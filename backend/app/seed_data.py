JOHN_DOE_EMAIL = "john.doe@gmail.com"
SHASHANK_NAME = "Shashank Tudum"
SOFTWARE_ENGINEER = "Software Engineer"
VAMSI_NAME = "Sai Surya Vamsi Sapireddy"
DEFAULT_DATE = "2024-05-20T09:00:00.000Z"

# Seed Data for HR Onboarding System
# Mirroring user databases, candidates, reference checks, document expiry, and audit logs from the React frontend.

import os

# Demo seed defaults; override these in deployed environments.
DEMO_USER_PASSWORD = os.getenv("DEMO_USER_PASSWORD", "".join(("password", "123")))
DEFAULT_CANDIDATE_PASSWORD = os.getenv("DEFAULT_CANDIDATE_PASSWORD", "".join(("demo", "123")))
REFERENCE_TOKEN_1 = os.getenv("REFERENCE_TOKEN_1", "-".join(("ref", "token", "1")))
REFERENCE_TOKEN_2 = os.getenv("REFERENCE_TOKEN_2", "-".join(("ref", "token", "2")))
REFERENCE_TOKEN_3 = os.getenv("REFERENCE_TOKEN_3", "-".join(("ref", "token", "3")))

USER_DATABASE = {
    JOHN_DOE_EMAIL: {
        "password": DEMO_USER_PASSWORD,
        "name": SHASHANK_NAME,
        "role": "candidate",
        "location": "india",
        "joiningBonus": True,
        "relocation": False,
        "relocationCity": "",
        "alumni": False,
        "designation": "Senior Software Engineer",
        "department": "Engineering"
    },
    "jane.smith@outlook.com": {
        "password": DEMO_USER_PASSWORD,
        "name": "Priya Patel",
        "role": "candidate",
        "location": "us",
        "joiningBonus": False,
        "relocation": True,
        "relocationCity": "hyderabad",
        "alumni": False,
        "designation": "Product Manager",
        "department": "Product"
    },
    "mike.johnson@gmail.com": {
        "password": DEMO_USER_PASSWORD,
        "name": "Vikram Singh",
        "role": "candidate",
        "location": "us",
        "joiningBonus": True,
        "relocation": True,
        "relocationCity": "pune",
        "alumni": False,
        "designation": "Tech Lead",
        "department": "Engineering"
    },
    "sarah.williams@outlook.com": {
        "password": DEMO_USER_PASSWORD,
        "name": "Anjali Gupta",
        "role": "candidate",
        "location": "india",
        "joiningBonus": False,
        "relocation": False,
        "relocationCity": "",
        "alumni": False,
        "designation": SOFTWARE_ENGINEER,
        "department": "Engineering"
    },
    "alumni@gmail.com": {
        "password": DEMO_USER_PASSWORD,
        "name": "Suresh Iyer",
        "role": "alumni",
        "location": "india",
        "joiningBonus": False,
        "relocation": False,
        "relocationCity": "",
        "alumni": True,
        "designation": "Former Senior Developer",
        "department": "Engineering",
        "joinedDate": "2018-01-15",
        "leftDate": "2023-06-30",
        "yearsWorked": 5.5
    },
    "hr@valuemomentum.com": {
        "password": DEMO_USER_PASSWORD,
        "name": "Raghavendra Raju",
        "role": "hr",
        "location": "india",
        "joiningBonus": False,
        "relocation": False,
        "relocationCity": "",
        "alumni": False,
        "designation": "HR Manager",
        "department": "HR"
    },
    "tag@valuemomentum.com": {
        "password": DEMO_USER_PASSWORD,
        "name": "TAG Team",
        "role": "tag",
        "location": "india",
        "joiningBonus": False,
        "relocation": False,
        "relocationCity": "",
        "alumni": False,
        "designation": "Recruitment Team",
        "department": "TAG"
    }
}

DEFAULT_CANDIDATE = {
    "email": "shashank@valuemomentum.com",
    "password": DEFAULT_CANDIDATE_PASSWORD,
    "name": SHASHANK_NAME,
    "role": "candidate",
    "location": "india",
    "joiningBonus": False,
    "relocation": False,
    "relocationCity": "",
    "alumni": False,
    "designation": SOFTWARE_ENGINEER,
    "department": "Sales"
}

CANDIDATES = [
    {
        "id": 1,
        "name": VAMSI_NAME,
        "email": "sai.sapireddy@valuemomentum.com",
        "status": "ready",
        "docs": 12,
        "total": 12,
        "dept": "engineering",
        "selected": False,
        "pending": []
    },
    {
        "id": 2,
        "name": SHASHANK_NAME,
        "email": JOHN_DOE_EMAIL,
        "status": "pending",
        "docs": 9,
        "total": 12,
        "dept": "sales",
        "selected": False,
        "pending": ["Identity proof", "Visa document"]
    },
    {
        "id": 3,
        "name": "Pankaj Kumar",
        "email": "pankaj.kumar@valuemomentum.com",
        "status": "pending",
        "docs": 10,
        "total": 12,
        "dept": "engineering",
        "selected": False,
        "pending": ["Financial documents", "Photo"]
    }
]

REFERENCE_CHECKS = [
    {
        "id": 1,
        "candidateId": "1",
        "candidateName": VAMSI_NAME,
        "referenceName": "Raghavendra Raju",
        "referenceEmail": "raghavendra@valuemomentum.com",
        "referencePhone": "+91 90000 00001",
        "referenceCompany": "ValueMomentum",
        "referencePosition": "Engineering Manager",
        "relationship": "manager",
        "requestDate": "2024-05-10",
        "responseDate": "2024-05-12",
        "status": "completed",
        "rating": 5,
        "feedback": "Excellent performer with strong Python skills and ownership.",
        "sentDate": "2024-05-10",
        "token": REFERENCE_TOKEN_1,
        "createdAt": "2024-05-10T10:00:00.000Z",
        "updatedAt": "2024-05-12T14:00:00.000Z"
    },
    {
        "id": 2,
        "candidateId": "2",
        "candidateName": SHASHANK_NAME,
        "referenceName": "Supriya Rangdal",
        "referenceEmail": "supriya@valuemomentum.com",
        "referencePhone": "+91 90000 00002",
        "referenceCompany": "ValueMomentum",
        "referencePosition": "HR Manager",
        "relationship": "manager",
        "requestDate": "2024-05-15",
        "responseDate": None,
        "status": "pending",
        "rating": None,
        "feedback": "",
        "sentDate": "2024-05-15",
        "token": REFERENCE_TOKEN_2,
        "createdAt": "2024-05-15T09:00:00.000Z",
        "updatedAt": "2024-05-15T09:00:00.000Z"
    },
    {
        "id": 3,
        "candidateId": "3",
        "candidateName": "Pankaj Kumar",
        "referenceName": "Kavya",
        "referenceEmail": "kavya@valuemomentum.com",
        "referencePhone": "+91 90000 00003",
        "referenceCompany": "ValueMomentum",
        "referencePosition": "Sales Lead",
        "relationship": "manager",
        "requestDate": "2024-05-18",
        "responseDate": "2024-05-20",
        "status": "completed",
        "rating": 4,
        "feedback": "Strong sales skills and good client handling.",
        "sentDate": "2024-05-18",
        "token": REFERENCE_TOKEN_3,
        "createdAt": "2024-05-18T09:00:00.000Z",
        "updatedAt": "2024-05-20T11:00:00.000Z"
    }
]

DOCUMENT_EXPIRY = [
    {
        "id": 1,
        "candidateId": "1",
        "candidateName": VAMSI_NAME,
        "documentType": "passport",
        "documentName": "Passport",
        "documentNumber": "P1234567",
        "issueDate": "2020-01-01",
        "expiryDate": "2030-01-01",
        "daysUntilExpiry": 1825,
        "status": "valid",
        "notes": "",
        "createdAt": "2024-05-01T10:00:00.000Z",
        "updatedAt": "2024-05-01T10:00:00.000Z",
        "reminderSent": False
    },
    {
        "id": 2,
        "candidateId": "2",
        "candidateName": SHASHANK_NAME,
        "documentType": "visa",
        "documentName": "Work Visa",
        "documentNumber": "V7654321",
        "issueDate": "2022-06-01",
        "expiryDate": "2024-07-01",
        "daysUntilExpiry": 20,
        "status": "critical",
        "notes": "Renewal in progress",
        "createdAt": DEFAULT_DATE,
        "updatedAt": DEFAULT_DATE,
        "reminderSent": False
    }
]

AUDIT_LOGS = [
    {
        "id": 1717135000000,
        "timestamp": DEFAULT_DATE,
        "userRole": "hr",
        "action": "login",
        "details": {"email": "hr@valuemomentum.com"},
        "location": "india"
    }
]

# Sample preloaded documents for Shashank Tudum (Candidate)
DOCUMENTS = [
    {
        "id": "doc_1",
        "candidateEmail": JOHN_DOE_EMAIL,
        "documentType": "aadhar",
        "documentName": "Aadhaar Card.pdf",
        "uploadedAt": "2024-05-14T10:00:00.000Z",
        "status": "valid",
        "overallConfidence": 95,
        "checks": {
            "format": {"status": "pass", "confidence": 100, "message": "Format validation passed"},
            "quality": {"status": "pass", "confidence": 95, "message": "Quality check passed"},
            "extraction": {"status": "pass", "confidence": 90, "message": "Data extraction completed"},
            "consistency": {"status": "pass", "confidence": 95, "message": "Fields match between form and document"},
            "authenticity": {"status": "pass", "confidence": 92, "message": "Authenticity check passed"},
            "completeness": {"status": "pass", "confidence": 100, "message": "All required fields present"}
        },
        "extractedData": {
            "name": SHASHANK_NAME,
            "dateOfBirth": "1990-05-15",
            "aadhaarNumber": "1234 5678 9012",
            "address": "123 Main Street, Hyderabad, Telangana, India"
        }
    }
]

FORMS = {
    JOHN_DOE_EMAIL: {
        "personalInfo": {
            "fullName": SHASHANK_NAME,
            "dob": "1990-05-15",
            "gender": "male",
            "phone": "+91 9876543210",
            "email": JOHN_DOE_EMAIL
        },
        "education": [
            {
                "degree": "Bachelor of Technology",
                "institution": "JNTU",
                "yearOfPassing": "2012",
                "percentage": "82"
            }
        ],
        "employment": [
            {
                "company": "Cognizant",
                "designation": SOFTWARE_ENGINEER,
                "fromDate": "2012-06-01",
                "toDate": "2015-08-30",
                "reasonForLeaving": "Career growth"
            }
        ]
    }
}

CHAT_HISTORY = {
    JOHN_DOE_EMAIL: [
        {"message": "Hello! Welcome to the ValueMomentum onboarding portal.", "type": "bot", "timestamp": 1717135000000},
        {"message": "How can I help you complete your documentation?", "type": "bot", "timestamp": 1717135010000}
    ]
}

import hashlib
import secrets

for email, data in list(USER_DATABASE.items()):
    salt = secrets.token_hex(16)
    password = data.pop("password")
    hash_bytes = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    data["password_hash"] = hash_bytes.hex()
    data["password_salt"] = salt

# Hash default candidate password too
demo_salt = secrets.token_hex(16)
demo_pass = DEFAULT_CANDIDATE.pop("password")
demo_hash_bytes = hashlib.pbkdf2_hmac('sha256', demo_pass.encode('utf-8'), demo_salt.encode('utf-8'), 100000)
DEFAULT_CANDIDATE["password_hash"] = demo_hash_bytes.hex()
DEFAULT_CANDIDATE["password_salt"] = demo_salt

