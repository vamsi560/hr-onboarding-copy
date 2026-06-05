# 🚀 ValueMomentum HR Onboarding Platform - Local Execution Guide

This document contains step-by-step instructions to set up, run, and verify both the React frontend and the Python FastAPI backend of the unified ValueMomentum Onboarding & Offer Letter Management Platform on your local machine.

---

## 🏗️ Architecture Overview

The application operates as a classic single-page React app communicating with an asynchronous Python FastAPI server.

```mermaid
graph LR
    subgraph Client [Frontend (React)]
        A[Browser Client] -->|Fetch / JWT Bearer| B(API Gateway client)
    end
    subgraph Server [Backend (FastAPI)]
        B -->|Port 8000| C(App Router / Security)
        C --> D(Service Pipelines)
        D -->|USE_POSTGRES=False| E[(In-Memory Mock Store)]
        D -->|USE_POSTGRES=True| F[(PostgreSQL Database)]
    end
```

---

## 📋 Prerequisites

Ensure the following tools are installed on your system:
1. **Node.js** (Version 16.x or newer; 18.x recommended)
2. **Python** (Version 3.10.x or newer; 3.12.x recommended)
3. **npm** (usually packaged with Node.js)
4. *(Optional)* **PostgreSQL** (if you wish to enable persistent DB storage)

---

## ⚡ Step 1: Running the Backend (FastAPI Server)

The backend is built with FastAPI and runs on Uvicorn. By default, it falls back to an **In-Memory database store** prepopulated with seed data, meaning **no database configuration is required to get started immediately**.

### 1. Navigate to the Workspace root
Open your terminal/command prompt and make sure you are in the project folder:
```powershell
cd c:\Users\azureuser\Surya\hr-onboatrding-copy\hr-onboarding-copy
```

### 2. Set Up a Virtual Environment (Optional & Recommended)
If your local machine has Python path conflicts (e.g. pointing to LibreOffice's embedded Python interpreter), create and activate your virtual environment using the **explicit standard Python absolute path**:

**On Powershell/Command Prompt:**
```powershell
C:\Users\azureuser\AppData\Local\Programs\Python\Python312\python.exe -m venv .venv
```

**Activate the Virtual Environment:**
*   **Powershell:**
    ```powershell
    .venv\Scripts\Activate.ps1
    ```
*   **Command Prompt (cmd):**
    ```cmd
    .venv\Scripts\activate.bat
    ```

> 💡 *Note: If PowerShell complains about execution policies when running `Activate.ps1`, you can bypass activation entirely by prefixing python commands with `.venv\Scripts\python.exe` directly!*

### 3. Install Python Dependencies
Install all package requirements:
*   **Without Venv (Directly on standard Python path):**
    ```powershell
    C:\Users\azureuser\AppData\Local\Programs\Python\Python312\python.exe -m pip install -r backend/requirements.txt
    ```
*   **With Venv:**
    ```powershell
    .venv\Scripts\python.exe -m pip install -r backend/requirements.txt
    ```

### 4. (Optional) Configure PostgreSQL Database
If you wish to configure and use PostgreSQL instead of the default In-Memory store:
1. Open the configuration file `backend/app/config.py` or create a `.env` in the `backend/` folder.
2. Provide your Postgres connection string (e.g. `DATABASE_URL=postgresql://user:password@localhost:5432/hr_onboarding`).
3. Set the database toggle to `True`:
   ```env
   USE_POSTGRES=True
   ```
4. Run the schema creation and data-seeding migration script:
   *   **Without Venv:**
       ```powershell
       C:\Users\azureuser\AppData\Local\Programs\Python\Python312\python.exe backend/app/migrate.py
       ```
   *   **With Venv:**
       ```powershell
       .venv\Scripts\python.exe backend/app/migrate.py
       ```

### 5. Launch the FastAPI Server
Run the startup script:
*   **Without Venv (Easiest):**
    ```powershell
    C:\Users\azureuser\AppData\Local\Programs\Python\Python312\python.exe backend/run.py
    ```
*   **With Venv:**
    ```powershell
    .venv\Scripts\python.exe backend/run.py
    ```

Once started, the backend API server will be listening at **`http://localhost:8000`**. You can verify it is running by visiting the interactive Swagger documentation page: **`http://localhost:8000/docs`**.

---

## 🎨 Step 2: Running the Frontend (React Application)

The React client interacts with the FastAPI backend over HTTP dispatches using Bearer JWT authentication tokens.

### 1. Install Node Packages
Navigate to the root directory (where `package.json` is located) and install dependencies:
```powershell
npm install
```

### 2. Configure Environment Variables
Ensure there is a `.env` file in the root directory containing the backend API coordinates:
```env
REACT_APP_API_BASE=http://localhost:8000/api
```

### 3. Launch the Development Server
Start the local React development client:
```powershell
npm start
```

Your default browser should automatically open **`http://localhost:3000`**.

---

## 🔐 Step 3: Login & Role Testing

To test different role matrices and dashboards, use the following pre-registered seed user logins:

| Role | Username / Email | Password | Allowed Dashboards & Features |
| :--- | :--- | :--- | :--- |
| **TAG Recruiter** | `tag@valuemomentum.com` | `password123` | **Offer Letters** (dashboard, CTC breakups, review forms, email dispatcher) |
| **HR Operations** | `hr@valuemomentum.com` | `password123` | Onboarding dashboard, Reference checks, Expiries tracker, Audit logs |
| **Candidate** | `john.doe@gmail.com` | `password123` | Personal information forms, Documents upload panel, support chatbot |
| **Alumni** | `alumni@valuemomentum.com` | `password123` | Former employee portals, relief clearances, experience letter requests |

---

## 🛠️ Verification & Troubleshooting

- **FastAPI Port Collision:** If port `8000` is already in use by another application, open `backend/run.py` and change the `port=8000` argument inside `uvicorn.run()` to another value (e.g. `8080`), and update `REACT_APP_API_BASE` in the React `.env` file to match.
- **Offline Mode Fallback:** If the backend FastAPI server is stopped, the frontend React application will seamlessly transition into **Offline Mode** utilizing LocalStorage fallback engines to calculate salaries, mock documents, and update statuses, preventing any hard crashes.
