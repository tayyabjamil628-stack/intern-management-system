# Intern Management System (IMS) — FastAPI Backend

## Purpose
The FastAPI backend service provides RESTful API endpoints for the Intern Management System (`C:\Projects\IMS\backend`).

## Python Environment & Dependencies
- Python 3.10+
- `fastapi`
- `uvicorn`
- `pydantic` & `pydantic-settings`
- `email-validator` (required for Pydantic `EmailStr` field validation)
- `SQLAlchemy` (ORM)
- `PyMySQL` (MySQL driver)
- `alembic` (database schema migrations)
- `pytest` & `httpx` (automated testing)

---

## Local Installation & Setup

### 1. Windows (PowerShell) Setup
```powershell
cd C:\Projects\IMS\backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

*Note on Windows Execution Policy:* If PowerShell prevents running activation scripts (`PSSecurityException`), run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Linux / macOS Setup
```bash
cd /path/to/IMS/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## MySQL Database Setup (MySQL 8+)

1. Verify MySQL service is running:
   ```powershell
   # Windows PowerShell
   Get-Service MySQL80
   ```
2. Create the database and dedicated user using MySQL CLI or Workbench:
   ```sql
   CREATE DATABASE IF NOT EXISTS intern_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   -- Recommended: create dedicated user rather than using root
   CREATE USER IF NOT EXISTS 'ims_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON intern_management_system.* TO 'ims_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Configure `.env` file:
   ```bash
   cp .env.example .env
   ```
   *Note on `DATABASE_URL`:* Passwords containing URL-reserved characters (e.g. `@`, `#`, `:`, `/`, `?`, `%`) must be URL-encoded (e.g. `@` becomes `%40`).

---

## Database Migrations (Alembic)

Alembic manages schema evolution for the IMS database.

Apply all database migrations:
```bash
python -m alembic upgrade head
```

This ensures all 4 core relational tables and migration metadata are created:
1. `departments` (`a1c0d9f4e2b1`)
2. `interns` (`b2d1e8f5a3c2`)
3. `projects` (`c3e2f9a6b4d3`)
4. `attendance` (`d4f3a8b7c5e4` — Current Head)
5. `alembic_version`

Verify current migration status:
```bash
python -m alembic current
```

---

## Running the Backend Server

Start the Uvicorn ASGI server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

* Health check: `http://127.0.0.1:8000/api/v1/health` $\rightarrow$ `{"status": "ok"}`
* Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
* ReDoc API Documentation: `http://127.0.0.1:8000/redoc`

---

## CORS Configuration
- **Development Origins**: `http://localhost:3000`, `http://localhost:5173` (configured via `ALLOWED_ORIGINS` in `.env`)
- **Production Consideration**: Wildcard origins (`*`) must never be used in combination with credentials. Production URLs must be explicitly enumerated in `ALLOWED_ORIGINS`.

---

## Running Tests
Run automated test suite:
```bash
python -m pytest -q
```
* Backend tests utilize an isolated in-memory SQLite database (`sqlite:///:memory:`) with foreign key enforcement (`PRAGMA foreign_keys=ON`) for fast, non-destructive execution.
* If a live MySQL server is unavailable during local execution, live MySQL integration tests are gracefully skipped without failing the test suite.

---

## Security Warnings
- **Never commit `.env` files**, database passwords, API secrets, or private keys to version control.
- **Do not use the MySQL `root` account in production**; always assign least-privilege dedicated credentials.
- **Authentication Note**: The application currently operates with open role-based access for local development; no JWT/OAuth backend authentication exists in Version 1.
