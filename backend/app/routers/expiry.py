from typing import Annotated
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import DocumentExpiryCreate, DocumentExpiryUpdate
from app.database import db_dal
from app.security import RequireRole
import datetime

router = APIRouter(prefix="/document-expiry", tags=["Document Expiry Tracker"])

@router.get("")
def get_document_expiries(current_user: Annotated[dict, Depends(RequireRole(["hr", "tag"])])):
    return db_dal.get_document_expiries()

@router.post("")
def add_document_expiry(payload: DocumentExpiryCreate, current_user: Annotated[dict, Depends(RequireRole(["hr"])])):
    expiry_data = payload.dict()
    expiry_data["reminderSent"] = False
    db_dal.add_document_expiry(expiry_data)
    return {"message": "Document expiry entry created successfully."}

@router.put("/{expiry_id}")
def update_document_expiry(expiry_id: int, payload: DocumentExpiryUpdate, current_user: Annotated[dict, Depends(RequireRole(["hr"])])):
    success = db_dal.update_document_expiry(expiry_id, payload.dict(exclude_unset=True))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document expiry entry not found."
        )
    return {"message": "Document expiry entry updated successfully."}
