from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from typing import List, Optional
import datetime
from app.schemas import (
    OfferLetterRequest, SalaryBreakdown, OfferLetterResponse, SendOfferLetterEmailRequest
)
from app.security import RequireRole
from app.database import db_dal
from app.services.offer_letter_service import (
    generate_offer_letter_pdf,
    calculate_salary_breakdown,
    generate_offer_letter_docx,
    send_offer_letter_email
)

router = APIRouter(tags=["Offer Letters"])

OFFER_NOT_FOUND_MSG = "Offer letter not found or not authorized"


def generate_offer_letter_background_task(
    offer_id: str,
    username: str,
    offer_data: OfferLetterRequest,
    salary_breakdown: dict
):
    try:
        print(f"[Background Task] Starting offer letter PDF generation for Offer ID: {offer_id}")
        pdf_docx_urls = generate_offer_letter_pdf(offer_data, salary_breakdown, username)
        pdf_path = pdf_docx_urls["pdf_url"]
        
        # Update record with PDF path and status as "Offer Made"
        offer_data_dict = offer_data.model_dump()
        offer_data_dict["status"] = "Offer Made"
        db_dal.update_offer_details_record(offer_id, username, offer_data_dict, salary_breakdown, pdf_path)
        print(f"[Background Task] Finished offer letter PDF generation for Offer ID: {offer_id} successfully.")
    except Exception as e:
        print(f"[Background Task] Error generating offer letter for Offer ID: {offer_id}: {e}")
        # Update status to "Generation Failed"
        try:
            db_dal.update_offer_letter_status_db(offer_id, "Generation Failed", username)
        except Exception as update_err:
            print(f"[Background Task] Error updating status to Generation Failed: {update_err}")

@router.get("/offer-letter/dashboard")
def get_offer_dashboard(current_user: Annotated[dict, Depends(RequireRole(["tag"])])):
    """Retrieve offer letter dashboard statistics and records for TAG team."""
    username = current_user["email"]
    candidates = db_dal.get_offer_candidates_by_user(username)
    
    pending_offers = sum(1 for c in candidates if c.get("status") in ("Pending", "Generating", "Draft"))
    sent_offers = sum(1 for c in candidates if c.get("status") == "Offer Made")
    
    return {
        "user": {
            "username": current_user["email"],
            "name": current_user["name"],
            "role": current_user["role"]
        },
        "candidates": candidates,
        "total_candidates": len(candidates),
        "pending_offers": pending_offers,
        "sent_offers": sent_offers
    }

@router.post("/offer-letter/generate", response_model=OfferLetterResponse, responses={500: {"description": "Internal Server Error"}})
def generate_offer_letter(
    offer_data: OfferLetterRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[dict, Depends(RequireRole(["tag"])])
):
    """Generate offer letter PDF asynchronously in the background using BackgroundTasks"""
    try:
        username = current_user["email"]
        salary_breakdown = calculate_salary_breakdown(offer_data.total_salary)
        
        # Mark initial state as "Generating"
        offer_data_dict = offer_data.model_dump()
        offer_data_dict["status"] = "Generating"
        
        # Save record with Generating state
        offer_letter_id = db_dal.create_offer_details_record(
            username=username,
            offer_data=offer_data_dict,
            salary_breakdown=salary_breakdown,
        )
        
        # Dispatch background task for generation & upload
        background_tasks.add_task(
            generate_offer_letter_background_task,
            offer_letter_id,
            username,
            offer_data,
            salary_breakdown
        )
        
        return {
            "success": True,
            "message": "Offer letter generation initiated in the background.",
            "offer_letter_id": offer_letter_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initiating offer letter: {str(e)}")

@router.post("/offer-letter/send-email", responses={500: {"description": "Internal Server Error"}})
def send_offer_letter_email_endpoint(
    data: SendOfferLetterEmailRequest = Body(...),
    current_user: Annotated[dict, Depends(RequireRole(["tag"])])
):
    """Send offer letter email to candidate (and optional CC)"""
    try:
        result = send_offer_letter_email(
            data.candidate_email,
            data.pdf_path,
            data.candidate_name,
            subject=data.subject or f"Offer Letter - Congratulations {data.candidate_name}!",
            body=data.body or None,
            designation=data.designation,
            joining_date=data.joining_date,
            facility=data.facility,
            work_mode=data.work_mode,
            tag_poc=data.tag_poc,
            cc_email=data.cc_email
        )
        return {"success": True, "message": "Offer letter email sent successfully", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send offer letter email: {str(e)}")

@router.get("/offer-letters", response_model=List[dict])
def get_offer_letters(current_user: Annotated[dict, Depends(RequireRole(["tag"])])):
    """Get all offer letters created by the user"""
    username = current_user["email"]
    return db_dal.get_offer_letters_by_user(username)

@router.get("/offer-letter/salary-breakdown/{total_salary}")
def get_salary_breakdown_endpoint(total_salary: float, current_user: Annotated[dict, Depends(RequireRole(["tag"])])):
    """Get salary breakdown for a given total salary"""
    breakdown = calculate_salary_breakdown(total_salary)
    return breakdown

@router.get("/offer-letter/{offer_id}", responses={404: {"description": "Not Found"}})
def get_offer_letter_by_id(
    offer_id: str,
    current_user: Annotated[dict, Depends(RequireRole(["tag"])])
):
    """Get a single offer letter by ID"""
    username = current_user["email"]
    record = db_dal.get_offer_detail_by_id(offer_id, username)
    if not record:
        raise HTTPException(status_code=404, detail=OFFER_NOT_FOUND_MSG)
    return record

@router.put("/offer-letter/{offer_id}", response_model=OfferLetterResponse, responses={404: {"description": "Not Found"}, 500: {"description": "Internal Server Error"}})
def update_offer_letter(
    offer_id: str,
    offer_data: OfferLetterRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[dict, Depends(RequireRole(["tag"])])
):
    """Update and regenerate an existing offer letter record asynchronously in the background"""
    try:
        username = current_user["email"]
        salary_breakdown = calculate_salary_breakdown(offer_data.total_salary)
        
        # Set status to Generating so the dashboard indicates background processing
        offer_data_dict = offer_data.model_dump()
        offer_data_dict["status"] = "Generating"
        
        updated = db_dal.update_offer_details_record(
            offer_id=offer_id,
            username=username,
            offer_data=offer_data_dict,
            salary_breakdown=salary_breakdown,
        )
        if not updated:
            raise HTTPException(status_code=404, detail=OFFER_NOT_FOUND_MSG)
        
        # Dispatch background workflow task to regenerate the documents
        background_tasks.add_task(
            generate_offer_letter_background_task,
            offer_id,
            username,
            offer_data,
            salary_breakdown
        )
        
        return {
            "success": True,
            "message": "Offer letter update initiated in the background.",
            "offer_letter_id": offer_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating offer letter: {str(e)}")

@router.post("/offer-letter/generate-docx", responses={500: {"description": "Internal Server Error"}})
def generate_offer_letter_docx_endpoint(
    offer_data: OfferLetterRequest = Body(...),
    current_user: Annotated[dict, Depends(RequireRole(["tag"])])
):
    """Generate offer letter using docx template and return file path"""
    try:
        username = current_user["email"]
        salary_breakdown_dict = calculate_salary_breakdown(offer_data.total_salary)
        
        # Create a SalaryBreakdown Pydantic object to match signature
        salary_breakdown = SalaryBreakdown(
            basic_salary=salary_breakdown_dict["Monthly_Basic"],
            hra=salary_breakdown_dict["Monthly_HRA"],
            special_allowance=salary_breakdown_dict["Monthly_LTA"], # Fallback/mapping
            transport_allowance=salary_breakdown_dict["Monthly_Conveyance"],
            medical_allowance=0.0,
            provident_fund=1800.0,
            professional_tax=200.0,
            total_deductions=salary_breakdown_dict["Total_Deductions_Monthly"],
            net_salary=salary_breakdown_dict["Net_Monthly_Salary"]
        )
        
        docx_path = generate_offer_letter_docx(offer_data, salary_breakdown, username)
        return {"success": True, "docx_path": docx_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating docx offer letter: {str(e)}")

@router.post("/offer-letter/change-status/{offer_id}/{status}", responses={404: {"description": "Not Found"}, 500: {"description": "Internal Server Error"}})
def update_offer_letter_status(
    offer_id: str,
    status: str,
    current_user: Annotated[dict, Depends(RequireRole(["tag"])])
):
    """Update the status of an existing offer letter"""
    try:
        username = current_user["email"]
        updated = db_dal.update_offer_letter_status_db(offer_id, status, username)
        if not updated:
            raise HTTPException(status_code=404, detail=OFFER_NOT_FOUND_MSG)
        return {
            "success": True,
            "message": "Offer letter status updated successfully",
            "offer_letter_id": offer_id,
            "new_status": status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating offer letter status: {str(e)}")
