import uvicorn
import os
import sys

# Add the parent directory of this file to the python path so imports resolve properly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting ValueMomentum HR Onboarding Backend Server...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
