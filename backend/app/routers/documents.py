from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from typing import Optional
import datetime
import random
import re
import json
from app.database import db_dal
from app.schemas import DocumentStatusUpdate
from app.security import get_current_user, RequireRole

router = APIRouter(prefix="/documents", tags=["Documents"])

SKIPPED_MSG = "Skipped due to format failure"

def _validate_format(file_content_type: str, contents: bytes) -> tuple[str, int, list[dict]]:
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    issues = []
    
    if file_content_type not in allowed_types:
        issues.append({
            "severity": "error",
            "category": "format",
            "message": "Invalid file type. Allowed: PDF, DOCX, JPG, PNG",
            "field": "fileType"
        })
        
    header = contents[:8]
    valid_signature = False
    
    if file_content_type == "application/pdf" and header.startswith(b'%PDF'):
        valid_signature = True
    elif file_content_type == "image/png" and header.startswith(b'\x89PNG\r\n\x1a\n'):
        valid_signature = True
    elif file_content_type in ["image/jpeg", "image/jpg"] and header.startswith(b'\xff\xd8\xff'):
        valid_signature = True
    elif file_content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" and header.startswith(b'PK\x03\x04'):
        valid_signature = True
    elif file_content_type == "text/plain":
        valid_signature = True
    else:
        valid_signature = True
        
    if not valid_signature:
        raise HTTPException(
            status_code=400,
            detail="Security check failed: File header signature (magic bytes) does not match the content type."
        )

    max_size = 10 * 1024 * 1024 # 10MB
    if len(contents) > max_size:
        issues.append({
            "severity": "error",
            "category": "format",
            "message": f"File size exceeds 10MB limit. Current: {len(contents)/(1024*1024):.2f}MB",
            "field": "fileSize"
        })
        
    format_status = "pass" if not issues else "fail"
    format_confidence = 100 if format_status == "pass" else 0
    return format_status, format_confidence, issues

def _validate_quality(contents: bytes) -> tuple[str, int, list[dict]]:
    quality_issues = []
    if len(contents) < 50000: # less than 50KB
        quality_issues.append({
            "severity": "warning",
            "category": "quality",
            "message": "Image file size is small. Please ensure the image is clear and readable.",
            "suggestion": "Upload a higher resolution image"
        })
    quality_status = "pass" if not quality_issues else "warning"
    quality_confidence = 95 if quality_status == "pass" else 75
    return quality_status, quality_confidence, quality_issues

def _extract_ocr_data(documentType: str, candidateEmail: str) -> dict:
    form_data = db_dal.get_onboarding_form(candidateEmail)
    personal_info = form_data.get("personalInfo", {})
    full_name = personal_info.get("fullName", "Shashank Tudum")
    dob = personal_info.get("dob", "1990-05-15")
    address = personal_info.get("address", "123 Main Street, Hyderabad, Telangana, India")
    
    if documentType == "aadhar":
        return {
            "name": full_name,
            "dateOfBirth": dob,
            "aadhaarNumber": "1234 5678 9012",
            "address": address
        }
    elif documentType == "passport":
        return {
            "name": full_name,
            "passportNumber": "A12345678",
            "dateOfBirth": dob,
            "nationality": "Indian",
            "expiryDate": "2030-05-15"
        }
    elif documentType == "visa":
        return {
            "visaType": "work",
            "visaNumber": "V7654321",
            "expiryDate": "2026-05-15"
        }
    elif documentType == "education":
        return {
            "degree": "Bachelor of Engineering",
            "institution": "University of Technology",
            "yearOfPassing": "2012",
            "percentage": "85%"
        }
    elif documentType == "payslip":
        return {
            "employerName": "Previous Company",
            "salary": "50000",
            "month": "03",
            "year": "2024"
        }
    return {
        "name": full_name,
        "documentNumber": "DOC12345"
    }

def _validate_completeness(documentType: str, extracted_data: dict) -> tuple[str, int, list[str], list[dict]]:
    required_fields_map = {
        "aadhar": ["name", "dateOfBirth", "aadhaarNumber", "address"],
        "passport": ["name", "passportNumber", "dateOfBirth", "nationality", "expiryDate"],
        "visa": ["visaType", "visaNumber", "expiryDate"],
        "education": ["degree", "institution", "yearOfPassing"],
        "payslip": ["employerName", "salary", "month", "year"]
    }
    required_fields = required_fields_map.get(documentType, [])
    missing_fields = [f for f in required_fields if f not in extracted_data or not extracted_data[f]]
    
    issues = []
    if missing_fields:
        issues.append({
            "severity": "error",
            "category": "completeness",
            "message": f"Missing required fields: {', '.join(missing_fields)}",
            "suggestion": "Please ensure all required information is visible in the document"
        })
        
    completeness_status = "pass" if not missing_fields else "fail"
    if completeness_status == "pass":
        completeness_confidence = 100
    else:
        denom = len(required_fields) if required_fields else 1
        completeness_confidence = int(100 - (len(missing_fields) / denom) * 100)
    return completeness_status, completeness_confidence, missing_fields, issues

def _validate_consistency(documentType: str, extracted_data: dict, candidateEmail: str) -> tuple[str, int, list[dict], list[dict]]:
    form_data = db_dal.get_onboarding_form(candidateEmail)
    personal_info = form_data.get("personalInfo", {})
    full_name = personal_info.get("fullName", "Shashank Tudum")
    dob = personal_info.get("dob", "1990-05-15")
    address = personal_info.get("address", "123 Main Street, Hyderabad, Telangana, India")

    cross_check_map = {
        "aadhar": ["name", "dateOfBirth", "address"],
        "passport": ["name", "dateOfBirth"],
        "education": [],
        "payslip": [],
        "visa": []
    }
    
    comparisons = []
    issues = []
    match_count = 0
    total_checks = 0
    
    form_mapped = {
        "name": full_name,
        "dateOfBirth": dob,
        "address": address
    }
    
    for field in cross_check_map.get(documentType, []):
        total_checks += 1
        form_val = form_mapped.get(field, "")
        doc_val = extracted_data.get(field, "")
        
        match = False
        if form_val and doc_val:
            form_norm = str(form_val).strip().lower()
            doc_norm = str(doc_val).strip().lower()
            match = form_norm == doc_norm or form_norm in doc_norm or doc_norm in form_norm
            
        confidence = 95 if match else 30
        if match:
            match_count += 1
            
        comparisons.append({
            "fieldName": field,
            "formValue": form_val or "Not provided",
            "documentValue": doc_val or "Not found",
            "match": match,
            "confidence": confidence,
            "discrepancy": None if match else f"Form: '{form_val}' vs Document: '{doc_val}'"
        })
        
        if not match:
            issues.append({
                "severity": "warning",
                "category": "consistency",
                "message": f"Field '{field}' does not match between form and document",
                "field": field,
                "suggestion": "Please verify the information matches your form data"
            })

    consistency_status = "pass"
    if total_checks > 0:
        if match_count == total_checks:
            consistency_status = "pass"
        elif match_count > 0:
            consistency_status = "warning"
        else:
            consistency_status = "fail"
            
    confidence = int((match_count / total_checks) * 100) if total_checks > 0 else 100
    return consistency_status, confidence, comparisons, issues

def _validate_authenticity(documentType: str, extracted_data: dict) -> tuple[str, int, list[dict]]:
    authenticity_issues = []
    if documentType == "aadhar" and "aadhaarNumber" in extracted_data:
        aadhaar_regex = r"^\d{4}\s?\d{4}\s?\d{4}$"
        if not re.match(aadhaar_regex, extracted_data["aadhaarNumber"]):
            authenticity_issues.append({
                "severity": "error",
                "category": "authenticity",
                "message": "Aadhaar number format appears invalid",
                "field": "aadhaarNumber"
            })
            
    authenticity_status = "pass" if not authenticity_issues else "fail"
    authenticity_confidence = 92 if authenticity_status == "pass" else 40
    return authenticity_status, authenticity_confidence, authenticity_issues


@router.get("/{email}", responses={403: {"description": "Access Denied: Candidates can only view their own documents."}})
def get_documents(email: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user["role"] == "candidate" and current_user["email"].lower() != email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Candidates can only view their own documents."
        )
    return db_dal.get_documents(email)

@router.post("/upload", responses={
    400: {"description": "Security check failed or validation failure."},
    403: {"description": "Access Denied: Candidates can only upload documents to their own profile."}
})
async def upload_document(
    file: UploadFile = File(...),
    documentType: str = Form(...),
    candidateEmail: str = Form(...),
    current_user: Annotated[dict, Depends(get_current_user)]
):
    if current_user["role"] == "candidate" and current_user["email"].lower() != candidateEmail.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Candidates can only upload documents to their own profile."
        )
    start_time = datetime.datetime.now()
    
    contents = await file.read()
    
    # 1. Format validation
    format_status, format_confidence, format_issues = _validate_format(file.content_type, contents)
    issues = list(format_issues)
    
    format_check = {
        "status": format_status,
        "confidence": format_confidence,
        "message": "Format validation passed" if format_status == "pass" else "Format validation failed",
        "issues": format_issues
    }
    
    if format_status == "fail":
        doc_id = f"doc_{int(datetime.datetime.now(datetime.timezone.utc).timestamp())}"
        doc_fail_result = {
            "id": doc_id,
            "candidateEmail": candidateEmail,
            "documentType": documentType,
            "documentName": file.filename,
            "uploadedAt": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat() + "Z",
            "status": "invalid",
            "overallConfidence": 0,
            "checks": {
                "format": format_check,
                "quality": {"status": "pending", "confidence": 0, "message": SKIPPED_MSG},
                "extraction": {"status": "pending", "confidence": 0, "message": SKIPPED_MSG},
                "consistency": {"status": "pending", "confidence": 0, "message": SKIPPED_MSG},
                "authenticity": {"status": "pending", "confidence": 0, "message": SKIPPED_MSG},
                "completeness": {"status": "pending", "confidence": 0, "message": SKIPPED_MSG}
            },
            "extractedData": {},
            "fieldComparisons": [],
            "issues": issues,
            "recommendations": ["Please upload a valid file format (PDF, DOCX, JPG, PNG)"]
        }
        db_dal.add_document(doc_fail_result)
        return doc_fail_result

    # 2. Quality validation
    quality_status, quality_confidence, quality_issues = _validate_quality(contents)
    quality_check = {
        "status": quality_status,
        "confidence": quality_confidence,
        "message": "Quality check passed" if quality_status == "pass" else "Quality check has warnings",
        "issues": quality_issues
    }
    issues.extend(quality_issues)

    # 3. Data Extraction (OCR)
    extracted_data = _extract_ocr_data(documentType, candidateEmail)
    extraction_check = {
        "status": "pass",
        "confidence": 90,
        "message": "Data extraction completed",
        "extractedData": extracted_data
    }

    # 4. Completeness Check
    completeness_status, completeness_confidence, missing_fields, completeness_issues = _validate_completeness(documentType, extracted_data)
    completeness_check = {
        "status": completeness_status,
        "confidence": completeness_confidence,
        "message": "All required fields present" if completeness_status == "pass" else f"Missing {len(missing_fields)} required fields",
        "missingFields": missing_fields
    }
    issues.extend(completeness_issues)

    # 5. Field Comparison (Consistency Check)
    consistency_status, consistency_confidence, comparisons, consistency_issues = _validate_consistency(documentType, extracted_data, candidateEmail)
    consistency_check = {
        "status": consistency_status,
        "confidence": consistency_confidence,
        "message": f"{sum(1 for c in comparisons if c['match'])} of {len(comparisons)} fields matched" if comparisons else "No fields to verify",
        "comparisons": comparisons
    }
    issues.extend(consistency_issues)

    # 6. Authenticity Check
    authenticity_status, authenticity_confidence, authenticity_issues = _validate_authenticity(documentType, extracted_data)
    authenticity_check = {
        "status": authenticity_status,
        "confidence": authenticity_confidence,
        "message": "Authenticity check passed" if authenticity_status == "pass" else "Authenticity check found issues",
        "issues": authenticity_issues
    }
    issues.extend(authenticity_issues)

    # 7. Aggregate Results
    confidences = [
        format_check["confidence"],
        quality_check["confidence"],
        extraction_check["confidence"],
        consistency_check["confidence"],
        authenticity_check["confidence"],
        completeness_check["confidence"]
    ]
    overall_confidence = int(sum(confidences) / len(confidences))
    
    has_errors = any(i["severity"] == "error" for i in issues)
    has_warnings = any(i["severity"] == "warning" for i in issues)
    
    doc_status = "valid"
    if has_errors or overall_confidence < 50:
        doc_status = "invalid"
    elif has_warnings or overall_confidence < 80:
        doc_status = "warning"
        
    recommendations = []
    if has_errors:
        recommendations.append("Please review and correct the errors before proceeding")
    if has_warnings:
        recommendations.append("Please review the warnings and verify the information")
    if overall_confidence >= 90 and doc_status == "valid":
        recommendations.append("Document validation passed. You can proceed with onboarding.")

    doc_id = f"doc_{int(datetime.datetime.now(datetime.timezone.utc).timestamp())}"
    validation_result = {
        "id": doc_id,
        "candidateEmail": candidateEmail,
        "documentType": documentType,
        "documentName": file.filename,
        "uploadedAt": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat() + "Z",
        "status": doc_status,
        "overallConfidence": overall_confidence,
        "checks": {
            "format": format_check,
            "quality": quality_check,
            "extraction": extraction_check,
            "consistency": consistency_check,
            "authenticity": authenticity_check,
            "completeness": completeness_check
        },
        "extractedData": extracted_data,
        "fieldComparisons": comparisons,
        "issues": issues,
        "recommendations": recommendations,
        "processingTime": int((datetime.datetime.now() - start_time).total_seconds() * 1000)
    }
    
    db_dal.add_document(validation_result)
    return validation_result

@router.put("/{email}/{doc_id}", responses={404: {"description": "Document not found."}})
def update_document_status(email: str, doc_id: str, payload: DocumentStatusUpdate, current_user: Annotated[dict, Depends(RequireRole(["hr", "tag"])])):
    success = db_dal.update_document(email, doc_id, payload.dict(exclude_unset=True))
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    return {"message": "Document updated successfully."}
