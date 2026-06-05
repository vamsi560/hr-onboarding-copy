from typing import Annotated
import hashlib
import secrets
import jwt
import datetime
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import db_dal

security = HTTPBearer()

# --- PASSWORD HASHING UTILITIES (PBKDF2-HMAC-SHA256) ---
# Zero-dependency, secure, out-of-the-box cross-platform hashing helper.
def generate_salt() -> str:
    return secrets.token_hex(16)

def hash_password(password: str, salt: str) -> str:
    password_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    
    # 100,000 iterations of SHA-256
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password_bytes,
        salt_bytes,
        100000
    )
    return hash_bytes.hex()

def verify_password(plain_password: str, hashed_password: str, salt: str) -> bool:
    return hash_password(plain_password, salt) == hashed_password


# --- JWT AUTHENTICATION UTILITIES ---
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) + datetime.timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"}
        )


# --- FASTAPI AUTHENTICATION DEPENDENCIES (RBAC) ---
def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]) -> dict:
    token = credentials.credentials
    payload = verify_access_token(token)
    email = payload.get("sub")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token payload invalid.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    user = db_dal.get_user_by_email(email)
    
    # Handle default candidate check in security
    if not user and email.lower() == "shashank@valuemomentum.com":
        user = {
            "email": "shashank@valuemomentum.com",
            "name": "Shashank Tudum",
            "role": "candidate",
            "location": "india",
            "joiningBonus": False,
            "relocation": False,
            "relocationCity": "",
            "alumni": False,
            "designation": "Software Engineer",
            "department": "Sales"
        }
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    return user


class RequireRole:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles
        
    def __call__(self, current_user: Annotated[dict, Depends(get_current_user)]) -> dict:
        if current_user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Insufficient role privileges."
            )
        return current_user
