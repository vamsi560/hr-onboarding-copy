import os
import secrets
import sys

def load_env(env_path: str):
    """Zero-dependency .env parser to populate environment variables dynamically."""
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        val = val.strip().strip('"').strip("'")
                        os.environ[key.strip()] = val
        except Exception as e:
            print(f"Warning: Failed to load env file {env_path}: {e}", file=sys.stderr)

# Load env file from possible path contexts
possible_paths = (".env", "../.env", "backend/.env")
for path in possible_paths:
    load_env(path)
    load_env(os.path.join(os.path.dirname(__file__), path))
    load_env(os.path.join(os.path.dirname(os.path.dirname(__file__)), path))

class Settings:
    PROJECT_NAME: str = "ValueMomentum HR Onboarding API"
    
    def __init__(self):
        env = os.getenv("ENV", "development").lower()
        secret_key = os.getenv("SECRET_KEY")
        jwt_secret = os.getenv("JWT_SECRET")
        acs_conn = os.getenv("ACS_CONNECTION_STRING")
        sas_url = os.getenv("AZURE_STORAGE_SAS_URL")
        
        if env == "production":
            if not secret_key:
                print("FATAL: SECRET_KEY environment variable is not set in production!", file=sys.stderr)
                sys.exit(1)
            if not jwt_secret:
                print("FATAL: JWT_SECRET environment variable is not set in production!", file=sys.stderr)
                sys.exit(1)
            if not acs_conn:
                print("FATAL: ACS_CONNECTION_STRING environment variable is not set in production!", file=sys.stderr)
                sys.exit(1)
            if not sas_url:
                print("FATAL: AZURE_STORAGE_SAS_URL environment variable is not set in production!", file=sys.stderr)
                sys.exit(1)
        
        self.SECRET_KEY = secret_key or secrets.token_urlsafe(32)
        self.JWT_SECRET = jwt_secret or self.SECRET_KEY
        self.JWT_ALGORITHM = "HS256"
        self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60
        self.CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
        
        # Azure Communication & Storage Configurations (loaded from env)
        self.ACS_CONNECTION_STRING = acs_conn or ""
        self.ACS_SENDER_ADDRESS = os.getenv("ACS_SENDER_ADDRESS", "DoNotReply@692bd015-d555-4021-b69a-51be375951e2.azurecomm.net")
        self.AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
        self.AZURE_STORAGE_CONTAINER = os.getenv("AZURE_STORAGE_CONTAINER", "offer-letters")
        self.AZURE_STORAGE_SAS_URL = sas_url or ""
        
        # Togglable database configuration
        self.USE_POSTGRES = os.getenv("USE_POSTGRES", "False").lower() in ("true", "1", "yes")
        
        # PostgreSQL Connection String
        self.DATABASE_URL = os.getenv("DATABASE_URL", "")

settings = Settings()



