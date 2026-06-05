from typing import Annotated
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import ReferenceRequest, ReferenceFeedback
from app.database import db_dal
from app.security import RequireRole
import datetime

router = APIRouter(prefix="/reference-checks", tags=["Reference Checks"])

@router.get("")
def get_reference_checks(current_user: Annotated[dict, Depends(RequireRole(["hr", "tag"])])):
    return db_dal.get_reference_checks()

@router.post("")
def add_reference_check(payload: ReferenceRequest, current_user: Annotated[dict, Depends(RequireRole(["hr"])])):
    ref_data = payload.dict()
    ref_data["status"] = "pending"
    ref_data["rating"] = None
    ref_data["feedback"] = ""
    ref_data["requestDate"] = datetime.date.today().isoformat()
    ref_data["sentDate"] = datetime.date.today().isoformat()
    
    new_check = db_dal.add_reference_check(ref_data)
    return new_check

@router.get("/feedback/{token}")
def get_feedback_by_token(token: str):
    ref = db_dal.get_reference_check_by_token(token)
    if not ref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference check not found"
        )
    return {
        "candidateName": ref["candidateName"],
        "referenceName": ref["referenceName"]
    }

@router.put("/feedback/{token}")
def submit_reference_feedback(token: str, payload: ReferenceFeedback):
    ref = db_dal.get_reference_check_by_token(token)
    if not ref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference check not found"
        )
    
    updates = {
        "status": "completed",
        "rating": payload.rating,
        "feedback": payload.feedback,
        "responseDate": datetime.date.today().isoformat()
    }
    
    success = db_dal.update_reference_check_by_token(token, updates)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update reference check"
        )
    return {"message": "Feedback submitted successfully"}

