from typing import Annotated
from fastapi import APIRouter, Depends
from app.schemas import AuditLogCreate
from app.database import db_dal
from app.security import RequireRole, get_current_user
import datetime

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])

@router.get("")
def get_audit_logs(current_user: Annotated[dict, Depends(RequireRole(["hr", "tag"])])):
    return db_dal.get_audit_logs()

@router.post("")
def add_audit_log(payload: AuditLogCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    log_data = payload.dict()
    log_data["timestamp"] = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat() + "Z"
    db_dal.add_audit_log(log_data)
    return {"message": "Audit log added successfully."}
