from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, candidates, forms, documents, reference, chat, audit, expiry, offer_letters

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for ValueMomentum HR Onboarding Platform",
    version="1.0.0"
)

# CORS middleware configuration to enable local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(forms.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(reference.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(expiry.router, prefix="/api")
app.include_router(offer_letters.router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "ValueMomentum HR Onboarding System API is running.",
        "version": "1.0.0"
    }
