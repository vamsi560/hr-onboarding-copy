from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from app.schemas import ChatMsgRequest
from app.database import db_dal
from app.security import get_current_user
import datetime

router = APIRouter(prefix="/chat", tags=["AI Support Chat"])

@router.get("/{email}", responses={403: {"description": "Access Denied: You cannot view other candidate chat logs."}})
def get_chat_history(email: str, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user["role"] == "candidate" and current_user["email"].lower() != email.lower():
        raise HTTPException(status_code=403, detail="Access Denied: You cannot view other candidate chat logs.")
    return db_dal.get_chat_history(email)

@router.post("/{email}", responses={403: {"description": "Access Denied: You cannot chat on behalf of another candidate."}})
def send_chat_message(email: str, payload: ChatMsgRequest, current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user["role"] == "candidate" and current_user["email"].lower() != email.lower():
        raise HTTPException(status_code=403, detail="Access Denied: You cannot chat on behalf of another candidate.")
    # Save the incoming user message
    user_msg = payload.dict()
    if not user_msg.get("timestamp"):
        user_msg["timestamp"] = datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000
    db_dal.add_chat_message(email, user_msg)
    
    # Simple rule-based chatbot assistant replies
    query = payload.message.lower()
    reply = ""
    
    if "passport" in query:
        reply = "For passport validation, please upload a clear scanned copy of the first and last page showing your photo, details, and signature. Ensure the document isn't expired."
    elif "visa" in query:
        reply = "If you are joining in the US, uploading a valid Visa document (like H1-B or OPT EAD) is mandatory. Ensure the text and expiry dates are clearly readable."
    elif "form" in query or "onboard" in query:
        reply = "You can fill in your Personal details, Education, and Work History directly under the Onboarding Form section. Don't forget to click Save progress!"
    elif "bonus" in query or "relocation" in query:
        reply = "Your eligibility tags (such as Joining Bonus or Relocation Benefits) are determined by HR based on your offer letter. They will be processed upon document completion."
    elif "hello" in query or "hi" in query:
        reply = "Hello! I am your ValueMomentum Onboarding Assistant. How can I help you with your documentation or onboarding tasks today?"
    else:
        reply = "Thank you for reaching out. I've received your query about onboarding. If this requires manual verification, our HR team will review it shortly. Is there anything else I can assist with?"
        
    bot_msg = {
        "message": reply,
        "type": "bot",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc).timestamp() + 1) * 1000
    }
    db_dal.add_chat_message(email, bot_msg)
    
    return bot_msg
