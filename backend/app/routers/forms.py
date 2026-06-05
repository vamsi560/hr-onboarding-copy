from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from app.schemas import OnboardingFormSave
from app.database import db_dal
from app.security import get_current_user

router = APIRouter(prefix="/forms", tags=["Onboarding Forms"])

@router.get("/{email}", responses={403: {"description": "Access Denied: Candidates can only view their own onboarding details."}})
def get_onboarding_form(email: str, current_user: Annotated[dict, Depends(get_current_user)]):
    # External privilege checks: Candidates can only retrieve their own form. HR/TAG can retrieve any.
    if current_user["role"] == "candidate" and current_user["email"].lower() != email.lower():
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Candidates can only view their own onboarding details."
        )
    form = db_dal.get_onboarding_form(email)
    return form

@router.post("/{email}", responses={
    400: {"description": "Failed to save onboarding form."},
    403: {"description": "Access Denied: Candidates can only modify their own onboarding details."}
})
def save_onboarding_form(email: str, payload: OnboardingFormSave, current_user: Annotated[dict, Depends(get_current_user)]):
    # External privilege checks: Candidates can only modify their own form. HR/TAG can modify any.
    if current_user["role"] == "candidate" and current_user["email"].lower() != email.lower():
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Candidates can only modify their own onboarding details."
        )
    success = db_dal.save_onboarding_form(email, payload.dict())
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to save onboarding form."
        )
    return {"message": "Onboarding form saved successfully."}
