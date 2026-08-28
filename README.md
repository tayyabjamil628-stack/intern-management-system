# Intern Management System (IMS)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1.svg)](https://www.mysql.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00.svg)](https://www.sqlalchemy.org/)
[![Alembic](https://img.shields.io/badge/Alembic-1.13+-gray.svg)](https://alembic.sqlalchemy.org/)
[![Pytest](https://img.shields.io/badge/Tests-102%20Passed-brightgreen.svg)](https://docs.pytest.org/)

---

## 1. Project Overview

The **Intern Management System (IMS)** is an enterprise web application engineered for organizations to administer internship cohorts, departmental placements, project deliverables, and daily attendance tracking within a centralized platform.

### Primary User Personas & Architectural Scopes
* **Administrators (Admin Portal — `/admin/*`)**: Full operational oversight backed by a **live FastAPI REST API backend and MySQL 8+ relational persistence**. Administrators manage organizational departments, register interns, allocate project deliverables, and track daily cohort attendance.
* **Interns (Intern Portal — `/intern/*`)**: A personal client-side interface powered by **React Context and demo datasets** (featuring demo persona `Sarah Jenkins`, `INT-2026-001`). Interns view assigned projects, personal attendance records, and profile details.

---

## 2. Key Features

| Module | Features & Capabilities | Data Architecture |
| :--- | :--- | :--- |
| **Admin Dashboard** | Real-time aggregate operational metrics (Total Interns, Active/Completed status, Active Projects, Today's Attendance summary). | **Live Backend API & MySQL** |
| **Department Management** | Complete CRUD operations for organizational departments, intern count badges, search filtering, and deletion protection. | **Live Backend API & MySQL** |
| **Intern Management** | Complete CRUD operations for intern profiles, status management (`ACTIVE`, `COMPLETED`, `TERMINATED`), and department assignment. | **Live Backend API & MySQL** |
| **Project Management** | Project allocation, deadline scheduling, milestone status tracking (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`), and progress sliders (0–100%). | **Live Backend API & MySQL** |
| **Attendance Tracker** | Daily attendance logging (`PRESENT`, `ABSENT`, `LEAVE`), daily duplicate prevention, date filtering, and status summaries. | **Live Backend API & MySQL** |
| **Intern Portal** | Personal dashboard, my assigned projects, attendance history calendar, and profile overview. | *React Context / Mock Data* |
| **Messages & Chat** | Interactive team communication channels and direct messaging interface. | *React Context / Local State* |
| **Instructor Directory** | Instructor profiles, departmental classifications, and contact directory. | *React Context / Mock Data* |
| **Notifications & Alerts** | System notification center, broadcast alerts, and actionable toast dialogs. | *React Context / Local State* |

---

## 3. Technology Stack

### Frontend Application
* **Framework**: React 19 with TypeScript (Strict Mode)
* **Build Tool**: Vite 6+
* **Routing**: React Router DOM v7
* **Styling**: Tailwind CSS
* **Icons & Animation**: Lucide React, Motion (`motion/react`)

### Backend REST API
* **Runtime**: Python 3.10+
* **Framework**: FastAPI
* **Server**: Uvicorn (ASGI)
* **Validation & Schemas**: Pydantic v2 & `pydantic-settings`
* **ORM**: SQLAlchemy 2.0+
* **Database Driver**: PyMySQL

### Database & Persistence
* **Database Engine**: MySQL 8.0+ (InnoDB engine, `utf8mb4` charset)
* **Schema Evolution**: Alembic (4 versioned migration revisions)

### Testing Frameworks
* **Backend**: Pytest & HTTPX (102 automated tests over in-memory SQLite with foreign key enforcement)
* **Frontend**: TypeScript Compiler (`tsc --noEmit`) & Vite production bundler

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INTERN MANAGEMENT SYSTEM (IMS)                        │
└─────────────────────────────────────────────────────────────────────────────────┘

   ADMIN PORTAL (Live Full-Stack)                     INTERN PORTAL (Demo Context)
 ┌───────────────────────────────────┐               ┌───────────────────────────┐
 │     React 19 Admin Views          │               │   React 19 Intern Views   │
 └─────────────────┬─────────────────┘               └─────────────┬─────────────┘
                   │                                               │
                   ▼                                               ▼
 ┌───────────────────────────────────┐               ┌───────────────────────────┐
 │    TypeScript Service Layer       │               │ React Context & Mock Data │
 │  (departments, interns, etc.)     │               │  (Sarah Jenkins persona)  │
 └─────────────────┬─────────────────┘               └───────────────────────────┘
                   │
                   ▼
 ┌───────────────────────────────────┐
 │    Fetch Client (`apiClient.ts`)  │
 └─────────────────┬─────────────────┘
                   │ HTTP / REST (JSON)
                   ▼
 ┌───────────────────────────────────────────────────────────────────────────────┐
 │                     FASTAPI BACKEND SERVICE (Port 8000)                       │
 │                                                                               │
 │  API Routers ──► Service Layer ──► Repository Layer ──► SQLAlchemy 2.0 ORM    │
 └───────────────────────────────────────┬───────────────────────────────────────┘
                                         │ Connection Pool
                                         ▼
 ┌───────────────────────────────────────────────────────────────────────────────┐
 │                           MYSQL 8+ DATABASE (Port 3306)                       │
 │                                                                               │
 │   [departments] ──(1:N RESTRICT)──► [interns] ──(1:N RESTRICT)──► [projects]  │
 │                                        │                                      │
 │                                        └──────(1:N RESTRICT)──► [attendance]  │
 └───────────────────────────────────────────────────────────────────────────────┘
```

*For detailed architectural layers and boundaries, see [docs/architecture.md](./docs/architecture.md).*

---

## 5. Project Directory Structure

```
IMS/
├── backend/                     # FastAPI REST API backend service
│   ├── alembic/                 # Alembic migration environment & scripts
│   │   └── versions/            # 4 versioned migration files (Head: d4f3a8b7c5e4)
│   ├── app/                     # Application source code
│   │   ├── api/                 # Endpoint routers & dependency injection
│   │   ├── core/                # Configuration (`config.py`) & database engine (`database.py`)
│   │   ├── models/              # SQLAlchemy ORM models (Department, Intern, Project, Attendance)
│   │   ├── repositories/        # Database query & data-access abstraction layer
│   │   ├── schemas/             # Pydantic request/response validation schemas
│   │   ├── services/            # Domain business logic & validation layer
│   │   └── main.py              # FastAPI application entry point & CORS configuration
│   ├── tests/                   # 102 automated Pytest endpoint & model tests
│   ├── Dockerfile               # Backend containerization Dockerfile
│   ├── alembic.ini              # Alembic configuration
│   ├── requirements.txt         # Python package dependencies
│   └── README.md                # Dedicated backend documentation
├── frontend/                    # Standalone React + TypeScript SPA application
│   ├── src/                     # React source code (components, pages, services, context)
│   │   ├── components/          # Reusable UI component library (Button, Modal, Table, Badge, etc.)
│   │   ├── layouts/             # Navigation layout shells (AdminLayout, InternLayout)
│   │   ├── pages/               # Page view components (Admin & Intern views)
│   │   ├── services/            # Live backend API client services (fetch)
│   │   ├── context/             # Client-side state contexts (Demo Intern & Chat data)
│   │   └── types/               # TypeScript interfaces, types, and domain models
│   ├── public/                  # Static web assets & icons
│   ├── package.json             # Frontend dependencies & scripts
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite bundler configuration
├── docs/                        # Complete technical documentation suite (10 specifications)
├── src/                         # Workspace dev server wrapper (re-exports frontend/src/App)
├── .env.example                 # Root environment template
├── metadata.json                # Project metadata configuration
└── README.md                    # Primary project entry point & user guide
```

---

## 6. Local Installation & Setup

### Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: 18.x or higher (with `npm`)
* **MySQL**: 8.0 or higher running locally on port 3306

---

### Step 1: Backend Setup (FastAPI + MySQL)

1. Open PowerShell / terminal and navigate to the backend directory:
   ```powershell
   cd backend/
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   # Windows PowerShell:
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS:
   # python3 -m venv .venv
   # source .venv/bin/activate
   ```
   *(If PowerShell displays a script execution error, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*

3. Upgrade `pip` and install backend dependencies:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Create the MySQL database and dedicated application user in MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS intern_management_system 
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- Recommended: create dedicated user
   CREATE USER IF NOT EXISTS 'ims_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON intern_management_system.* TO 'ims_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. Configure backend environment file:
   ```powershell
   cp .env.example .env
   ```
   Update `.env` with your MySQL credentials:
   ```env
   APP_ENV=development
   DEBUG=true
   API_PREFIX=/api/v1
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   DATABASE_URL=mysql+pymysql://ims_user:YOUR_PASSWORD@localhost:3306/intern_management_system
   ```
   *(Note: URL-encode any special characters in passwords, e.g. `@` becomes `%40`)*

6. Run database migrations to apply the schema:
   ```powershell
   python -m alembic upgrade head
   ```

7. Start the FastAPI backend server:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * Health endpoint: `http://127.0.0.1:8000/api/v1/health` $\rightarrow$ `{"status": "ok"}`
   * Swagger documentation: `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup (React + TypeScript + Vite)

1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd frontend/
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Configure the frontend environment:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_BASE_URL` points to the running backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at: **`http://localhost:3000`** (or `http://localhost:5173`).

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | String | `development` | Runtime environment (`development` / `production`) |
| `DEBUG` | Boolean | `true` | Enables detailed error logging (set `false` in production) |
| `API_PREFIX` | String | `/api/v1` | URL prefix for all REST endpoints |
| `ALLOWED_ORIGINS` | Comma-separated | `http://localhost:3000,http://localhost:5173` | Allowed frontend CORS origins |
| `DATABASE_URL` | String (URI) | `mysql+pymysql://USER:PASS@localhost:3306/intern_management_system` | SQLAlchemy database connection URI |

### Frontend (`frontend/.env`)

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | String (URL) | `http://localhost:8000/api/v1` | Base URL for FastAPI REST endpoints |

---

## 8. REST API Summary (21 Endpoints)

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/v1/health` | Health check endpoint (`{"status": "ok"}`) |
| **Departments** | `GET` | `/api/v1/departments` | List all departments (with name search filter) |
| | `GET` | `/api/v1/departments/{id}` | Retrieve single department by ID |
| | `POST` | `/api/v1/departments` | Create a new department |
| | `PUT` | `/api/v1/departments/{id}` | Update department details |
| | `DELETE` | `/api/v1/departments/{id}` | Delete department (enforces `ON DELETE RESTRICT`) |
| **Interns** | `GET` | `/api/v1/interns` | List interns (search, department, status filters) |
| | `GET` | `/api/v1/interns/{id}` | Retrieve intern profile by ID |
| | `POST` | `/api/v1/interns` | Register a new intern |
| | `PUT` | `/api/v1/interns/{id}` | Update intern record |
| | `DELETE` | `/api/v1/interns/{id}` | Remove intern record (enforces `ON DELETE RESTRICT`) |
| **Projects** | `GET` | `/api/v1/projects` | List projects (search, intern, status filters) |
| | `GET` | `/api/v1/projects/{id}` | Retrieve project details by ID |
| | `POST` | `/api/v1/projects` | Create and assign a project deliverable |
| | `PUT` | `/api/v1/projects/{id}` | Update project progress, status, and deadline |
| | `DELETE` | `/api/v1/projects/{id}` | Delete project deliverable |
| **Attendance** | `GET` | `/api/v1/attendance` | List attendance logs (intern, date, status filters) |
| | `GET` | `/api/v1/attendance/{id}` | Retrieve single attendance record |
| | `POST` | `/api/v1/attendance` | Log daily attendance (`PRESENT`, `ABSENT`, `LEAVE`) |
| | `PUT` | `/api/v1/attendance/{id}` | Update attendance status or remarks |
| | `DELETE` | `/api/v1/attendance/{id}` | Delete attendance log |

*For complete request/response schemas and error models, see [docs/api-design.md](./docs/api-design.md).*  
*Interactive documentation available at `/docs` (Swagger UI), `/redoc` (ReDoc), and `/openapi.json`.*

---

## 9. Database Design Summary

* **Tables**: `departments`, `interns`, `projects`, `attendance`, `alembic_version`.
* **Referential Integrity**: All foreign keys enforce `ON DELETE RESTRICT` to prevent accidental orphaned child records.
* **Constraints**:
  - `projects.progress`: Validated between `0` and `100` (`CHECK` constraint).
  - `attendance`: Composite uniqueness enforced on `(intern_id, attendance_date)` to prevent duplicate daily check-ins.
* **Alembic Revisions**:
  1. `a1c0d9f4e2b1_create_departments_table`
  2. `b2d1e8f5a3c2_create_interns_table`
  3. `c3e2f9a6b4d3_create_projects_table`
  4. `d4f3a8b7c5e4_create_attendance_table` (**Head: `d4f3a8b7c5e4`**)

*For detailed schema definitions and the complete ERD, see [docs/database-design.md](./docs/database-design.md).*

---

## 10. Automated Testing & Verification

### Run Backend Tests (Pytest)
```powershell
cd backend/
python -m pytest -q
```
**Latest Verified Result**: `102 passed, 1 skipped in 2.38s` (0 failures).

### Run Frontend Type-Check & Build
```powershell
cd frontend/
# TypeScript compiler validation:
tsc --noEmit
# Production asset compilation:
npm run build
```
**Latest Verified Result**: `0 errors, 0 warnings` (`dist/` generated cleanly).

---

## 11. Recommended Demonstration Walkthrough

To verify the end-to-end full-stack integration during a demonstration:

1. **Create Department**: Navigate to **Departments** $\rightarrow$ Click `[+ Add Department]` $\rightarrow$ Register `"Cloud Infrastructure"`.
2. **Register Intern**: Navigate to **Interns** $\rightarrow$ Click `[+ Register Intern]` $\rightarrow$ Create intern `"Alex Rivera"` (`INT-2026-101`) assigned to `"Cloud Infrastructure"`.
3. **Assign Project**: Navigate to **Projects** $\rightarrow$ Click `[+ Create Project]` $\rightarrow$ Assign `"Kubernetes Cluster Setup"` to Alex Rivera with a 40% initial progress.
4. **Log Attendance**: Navigate to **Attendance** $\rightarrow$ Click `[+ Log Attendance]` $\rightarrow$ Mark Alex Rivera as `PRESENT` for today.
5. **Verify Persistence**: Refresh the browser page (`F5`) $\rightarrow$ Confirm all created records persist in MySQL.
6. **Update Progress**: Edit the project and advance progress to `100%` $\rightarrow$ Change status to `COMPLETED`.
7. **Test Validation**: Attempt to register another department named `"Cloud Infrastructure"` $\rightarrow$ Observe `409 Conflict` duplicate prevention alert.
8. **Test Referential Protection**: Attempt to delete the `"Cloud Infrastructure"` department $\rightarrow$ Observe deletion blocked by `ON DELETE RESTRICT` protection because Alex Rivera is assigned to it.

---

## 12. Security, Known Limitations & Future Roadmap

### Current Scope & Operational Boundaries (Version 1)
* **Authentication Boundary**: Version 1 operates with open role-based access for local development and demonstration. No backend JWT, session cookies, or OAuth authorization middlewares are implemented.
* **UI Role Separation**: The top-bar portal switcher toggles between Admin and Intern views for evaluation; this is a presentation layout switch, not a cryptographic security boundary.
* **Intern Portal Scope**: The Intern Portal interface is backed by client-side React Context and structured mock datasets for demo persona `Sarah Jenkins` (`INT-2026-001`).
* **Auxiliary Modules**: Instructor management, chat channels, and notification broadcasts operate via client-side state models.

### Future Development Roadmap

| Priority | Milestone | Why It Matters | Dependencies |
| :--- | :--- | :--- | :--- |
| **P1** | **Authentication & RBAC** | Password hashing, JWT auth, and protected API routes. | Core API |
| **P2** | **Intern Portal API Integration** | Replaces mock data with user-scoped authenticated REST endpoints. | P1 (Auth) |
| **P3** | **Instructor Backend Domain** | `instructors` database table, supervision mapping, and CRUD APIs. | P1 (Auth) |
| **P4** | **Communications Backend** | Persistent broadcast/announcement model with delivery tracking. | P1, P3 |
| **P5** | **Persistent Real-Time Chat** | Database-backed chat channels with WebSocket live transport. | P1, WebSockets |
| **P6** | **Event-Driven Notifications** | Automated event-driven alerts for deadlines and attendance changes. | P1–P3 |
| **P7** | **Production Hardening** | Nginx reverse proxy, TLS/HTTPS, rate limiting, and CI/CD pipelines. | P1–P6 |

*For complete implementation details, task breakdowns, and dependency analysis, see the [Development Plan & Roadmap](./docs/development-plan.md).*

---

## 13. Technical Documentation Index

| Specification Document | Path | Description |
| :--- | :--- | :--- |
| **Architecture Blueprint** | [`docs/architecture.md`](./docs/architecture.md) | System architecture, layered patterns, and boundaries |
| **Database Design** | [`docs/database-design.md`](./docs/database-design.md) | Relational schemas, ERD, indexes, and migration history |
| **REST API Reference** | [`docs/api-design.md`](./docs/api-design.md) | Complete 21 endpoints reference, schemas, and status codes |
| **Production Deployment** | [`docs/deployment.md`](./docs/deployment.md) | Production topology, Docker packaging, and release checklist |
| **Development Plan** | [`docs/development-plan.md`](./docs/development-plan.md) | 12-phase project lifecycle and milestone tracker |
| **Functional Requirements** | [`docs/functional-requirements.md`](./docs/functional-requirements.md) | Workflows, role capabilities, and business rules |
| **Design System** | [`docs/design-system.md`](./docs/design-system.md) | Color tokens, typography scales, and spacing math |
| **UI Components** | [`docs/ui-components.md`](./docs/ui-components.md) | Reusable presentation component library specifications |
| **Layout & Navigation** | [`docs/layout-navigation.md`](./docs/layout-navigation.md) | Layout shells (`AdminLayout`, `InternLayout`) and routes |
| **Interaction States** | [`docs/interaction-states.md`](./docs/interaction-states.md) | 4-stage CRUD lifecycle, form states, and confirmation dialogs |
| **Backend Guide** | [`backend/README.md`](./backend/README.md) | Python virtual environment, MySQL, and Alembic execution guide |

---

## 14. Academic Submission & Handoff Summary

* **Project Title**: Intern Management System (IMS)
* **Architecture**: Decoupled Modern SPA (React + TypeScript + Vite) paired with high-performance REST API (Python + FastAPI + SQLAlchemy + MySQL).
* **Scope Achieved**: Full-stack CRUD capabilities across 4 core administrative entities (Departments, Interns, Projects, Attendance) backed by MySQL relational persistence, Alembic migrations, and comprehensive automated test suites.
* **Submission State**: Fully verified, documented, and ready for evaluation.
