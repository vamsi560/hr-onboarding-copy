from fastapi import APIRouter, HTTPException, status
from app.schemas import LoginRequest
from app.database import db_dal
from app.security import verify_password, create_access_token
from app.seed_data import DEFAULT_CANDIDATE

router = APIRouter(prefix="/auth", tags=["Authentication"])
TOKEN_TYPE_BEARER = "bearer"  # nosec B105

@router.post("/login")
def login(payload: LoginRequest):
    user = db_dal.get_user_by_email(payload.email)
    
    # Check default candidate as well
    if not user and payload.email.lower() == "shashank@valuemomentum.com":
        user = DEFAULT_CANDIDATE
    
    if not user or not verify_password(payload.password, user["password_hash"], user["password_salt"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # Generate JWT token
    token_data = {
        "sub": user["email"],
        "role": user["role"],
        "location": user.get("location", "india")
    }
    access_token = create_access_token(token_data)
    
    # Return user object (excluding cryptographic hashes)
    user_response = user.copy()
    user_response.pop("password_hash", None)
    user_response.pop("password_salt", None)
    
    return {
        "user": user_response,
        "access_token": access_token,
        "token_type": TOKEN_TYPE_BEARER
    }
