from typing import Annotated
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import CandidateRegister, CandidateUpdate
from app.database import db_dal
from app.security import RequireRole

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("")
def get_candidates(current_user: Annotated[dict, Depends(RequireRole(["hr", "tag"])])):
    return db_dal.get_candidates()

@router.post("")
def register_candidate(payload: CandidateRegister, current_user: Annotated[dict, Depends(RequireRole(["hr"])])):
    # Check if candidate email already registered
    existing_user = db_dal.get_user_by_email(payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate email is already registered."
        )
    
    new_candidate = db_dal.register_candidate(payload.dict())
    return new_candidate

@router.put("/{email}")
def update_candidate(email: str, payload: CandidateUpdate, current_user: Annotated[dict, Depends(RequireRole(["hr", "tag"])])):
    success = db_dal.update_candidate_status(email, payload.status, payload.pending)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found."
        )
    return {"message": "Candidate updated successfully."}
