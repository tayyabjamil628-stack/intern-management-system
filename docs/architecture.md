# System Architecture Document — Intern Management System (IMS)

## 1. System Overview & Active Project Paths

The **Intern Management System (IMS)** is engineered as a clean, production-grade **Modular Monolith** with strict separation between the client presentation layer and the backend service layer.

### Active Project Repository
* **Project Root**: `C:\Projects\IMS`
* **Active Frontend**: `C:\Projects\IMS\frontend`
* **Active Backend**: `C:\Projects\IMS\backend`

---

## 2. High-Level Architecture

```
                            IMS ARCHITECTURE
                                   │
                ┌──────────────────┴──────────────────┐
                │                                     │
          ADMIN PORTAL                          INTERN PORTAL
          (/admin/*)                            (/intern/*)
                │                                     │
           [API-Backed]                          [Mock-Backed]
                │                                     │
            apiClient                            React Context
                │                                     │
           HTTP / JSON                            Mock Data
         (/api/v1/*)                                  │
                │                           (Sarah Jenkins Persona)
                ▼
        FastAPI Backend
                │
         Router Layer (app/api)
                │
        Pydantic Schemas (app/schemas)
                │
         Service Layer (app/services)
                │
       Repository Layer (app/repositories)
                │
        SQLAlchemy ORM (app/models)
                │
         MySQL 8+ Database
    (departments, interns, projects, attendance)
```

### Architectural Boundaries by Portal:
* **Admin Portal (`/admin/*`) — Live REST API Backed**:
  - **Departments**: Real-time CRUD backed by MySQL.
  - **Interns**: Real-time CRUD backed by MySQL with relational link to departments.
  - **Projects**: Real-time deliverable tracking backed by MySQL with intern assignment.
  - **Attendance**: Real-time logging backed by MySQL with composite uniqueness enforcement.
* **Intern Portal (`/intern/*`) — Client-Side Demo Context**:
  - **Dashboard, My Projects, My Attendance, My Profile**: Read-only demo interface powered by React Context (`useInterns()`, `useProjects()`) and structured mock data for demo persona `INT-2026-001` (`Sarah Jenkins`).
  - **Messages & Official Chat**: Local context state (`useCommunication()`) for announcements and acknowledgments.

---

## 3. Frontend Architecture

The frontend is built with **React 19**, **TypeScript**, and **Vite**, styled with **Tailwind CSS**, featuring **Lucide Icons** and **Motion** transitions.

```
frontend/src/
├── components/          # Reusable UI controls (Button, Input, Select, DataTable, DataCard, Modal, Alert)
├── pages/
│   ├── admin/           # API-backed Admin pages (Departments, Interns, Projects, Attendance, Dashboard)
│   └── intern/          # Read-only demo Intern pages (Dashboard, My Projects, My Attendance, Profile, Messages)
├── layouts/
│   ├── AdminLayout.tsx  # Admin navigation shell with persistent sidebar, mobile drawer, and header
│   └── InternLayout.tsx # Intern navigation shell with portal switcher
├── routes/              # Centralized route configuration (AppRouter.tsx)
├── services/            # Type-safe API client wrappers (departmentService, internService, projectService, attendanceService)
├── types/               # Shared TypeScript schemas matching backend Pydantic models
├── context/             # Demo React contexts (InternsContext, ProjectsContext, CommunicationContext)
├── data/                # Static mock records for demo intern views (mockInternsData, mockProjectsData, mockAttendanceData)
└── hooks/               # Custom hooks for debounced search, sequence tracking, and notifications
```

### Component to API Communication Boundary
```
[React Page / Component]
          │ (Invokes typed method)
          ▼
[Service Layer (e.g. internService)]
          │ (Passes endpoint & payload)
          ▼
[apiClient.ts (Fetch wrapper)]
          │ (Sets headers, handles network timeouts & sanitizes errors)
          ▼
[FastAPI Backend (/api/v1/*)]
```

---

## 4. Backend Architecture

The backend is built with **FastAPI**, **SQLAlchemy 2.0**, and **Pydantic v2**, structured into distinct architectural layers:

```
backend/app/
├── api/                 # Router dispatchers & HTTP endpoint handlers (endpoints/departments.py, etc.)
├── schemas/             # Pydantic schemas for request validation & response serialization
├── services/            # Domain business logic, relational validation & cross-entity rules
├── repositories/        # Database access layer executing SQLAlchemy queries
├── models/              # SQLAlchemy ORM entity models with table schemas & relationships
├── db/                  # Database session factory (session.py) & declarative base (base.py)
├── core/                # Custom exceptions and application error definitions
└── config.py            # Environment settings management via pydantic-settings
```

### Layer Responsibilities
1. **`app/api` (HTTP Layer)**: Parses incoming requests, executes Pydantic validation, injects database sessions via FastAPI `Depends(get_db)`, and returns standard JSON responses.
2. **`app/schemas` (Validation Layer)**: Enforces field bounds (e.g. `min_length=1`, `max_length=100`, email formats via `EmailStr`, date sequences, and status enums).
3. **`app/services` (Business Logic Layer)**: Coordinates domain workflows, verifies foreign-key existence (e.g. ensuring `department_id` exists before creating an intern), checks duplicate values, and enforces relational constraints.
4. **`app/repositories` (Data Access Layer)**: Encapsulates all SQL execution, filtering, pagination, and transactional commits via SQLAlchemy `Session`.
5. **`app/models` (Entity Model Layer)**: Maps Python class definitions to relational MySQL tables.
6. **`app/db` (Database Session Layer)**: Manages connection pool lifecycle and SQLAlchemy engine instantiation.
7. **`app/config.py` (Configuration Layer)**: Reads and validates environment variables (`APP_ENV`, `DATABASE_URL`, `ALLOWED_ORIGINS`).

---

## 5. Database Architecture & Relationships

* **Database Engine**: MySQL 8+
* **Database Name**: `intern_management_system`

```
   ┌────────────────────┐
   │    departments     │
   │────────────────────│
   │ PK  id             │
   │ UQ  name           │
   │     description    │
   └─────────┬──────────┘
             │ 1
             │ (ON DELETE RESTRICT)
             │ N
   ┌─────────▼──────────┐
   │      interns       │
   │────────────────────│
   │ PK  id             │
   │ UQ  intern_id      │
   │ UQ  email          │
   │ FK  department_id  │
   │     status         │
   └─────┬────────────┬─┘
         │ 1          │ 1
         │ (RESTRICT) │ (RESTRICT)
         │ N          │ N
┌────────▼──────────┐ ┌▼───────────────────────────────────┐
│     projects      │ │            attendance              │
│───────────────────│ │────────────────────────────────────│
│ PK  id            │ │ PK  id                             │
│ FK  intern_id     │ │ FK  intern_id                      │
│     progress      │ │     attendance_date                │
│     (0 to 100)    │ │ UQ  (intern_id, attendance_date)   │
└───────────────────┘ └────────────────────────────────────┘
```

### Relational Constraints
* **Department 1 $\rightarrow$ Many Interns**: Foreign key `interns.department_id` references `departments.id` with `ON DELETE RESTRICT`. A department with assigned interns cannot be deleted.
* **Intern 1 $\rightarrow$ Many Projects**: Foreign key `projects.intern_id` references `interns.id` with `ON DELETE RESTRICT`.
* **Intern 1 $\rightarrow$ Many Attendance**: Foreign key `attendance.intern_id` references `interns.id` with `ON DELETE RESTRICT`.
* **Project Progress**: Enforced check constraint `0 <= progress <= 100`.
* **Attendance Composite Uniqueness**: Unique constraint `uq_attendance_intern_date(intern_id, attendance_date)` prevents duplicate check-ins on the same calendar day.

---

## 6. Alembic Migration Architecture

The database schema is strictly version-controlled via a single linear Alembic migration chain:

```
[Base]
  │
  ▼
[a1c0d9f4e2b1] create_departments_table
  │
  ▼
[b2d1e8f5a3c2] create_interns_table
  │
  ▼
[c3e2f9a6b4d3] create_projects_table
  │
  ▼
[d4f3a8b7c5e4] create_attendance_table (CURRENT HEAD)
```

* **Current Migration Head**: `d4f3a8b7c5e4`
* **Upgrade Command**: `python -m alembic upgrade head`
* **Verification Command**: `python -m alembic current`

---

## 7. API Architecture & Data Flow Examples

### Core API Endpoints
* **System Health**: `GET /api/v1/health` $\rightarrow$ `{"status": "ok"}`
* **Departments CRUD**: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` on `/api/v1/departments`
* **Interns CRUD**: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` on `/api/v1/interns`
* **Projects CRUD**: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` on `/api/v1/projects`
* **Attendance CRUD**: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` on `/api/v1/attendance`

### Data Flow Scenarios

#### 1. Create Department Flow
$$\text{Admin UI} \xrightarrow{\text{submit}} \text{departmentService} \xrightarrow{\text{apiClient}} \text{POST /api/v1/departments} \xrightarrow{\text{Pydantic check}} \text{DepartmentService} \xrightarrow{\text{unique name check}} \text{Repository.create()} \xrightarrow{\text{commit}} \text{MySQL}$$

#### 2. Create Intern Flow
$$\text{Admin UI} \xrightarrow{\text{submit}} \text{internService} \xrightarrow{\text{apiClient}} \text{POST /api/v1/interns} \xrightarrow{\text{validate department\_id}} \text{InternService} \xrightarrow{\text{unique intern\_id/email check}} \text{Repository.create()} \xrightarrow{\text{commit}} \text{MySQL}$$

#### 3. Create Project Flow
$$\text{Admin UI} \xrightarrow{\text{submit}} \text{projectService} \xrightarrow{\text{apiClient}} \text{POST /api/v1/projects} \xrightarrow{\text{validate intern\_id}} \text{ProjectService} \xrightarrow{\text{check progress (0–100)}} \text{Repository.create()} \xrightarrow{\text{commit}} \text{MySQL}$$

#### 4. Mark Attendance Flow
$$\text{Admin UI} \xrightarrow{\text{submit}} \text{attendanceService} \xrightarrow{\text{apiClient}} \text{POST /api/v1/attendance} \xrightarrow{\text{validate intern\_id}} \text{AttendanceService} \xrightarrow{\text{check duplicate date}} \text{Repository.create()} \xrightarrow{\text{commit}} \text{MySQL}$$

---

## 8. Error Handling Architecture

The application implements standardized HTTP status codes and error sanitization:

| Status Code | Condition | Backend Trigger | Frontend Handling |
| :--- | :--- | :--- | :--- |
| **400 Bad Request** | Logical domain rule violation | Service exception | Displays user alert |
| **404 Not Found** | Record ID does not exist | Repository lookup returns `None` | Renders `EmptyState` component |
| **409 Conflict** | Unique key collision or FK delete restriction | Duplicate entry / FK constraint | Displays modal error message |
| **422 Unprocessable** | Request schema / validation failure | Pydantic schema validation | Highlights invalid form fields |
| **500 Server Error** | Unexpected exception or network outage | Unhandled exception | Displays sanitized error banner with Retry |

### Error Sanitization
`apiClient.ts` intercepts all HTTP error responses and network errors, stripping raw SQL queries, database hostnames, credentials, and Python stack traces before rendering friendly messages in UI banners.

---

## 9. Security Architecture & Boundaries

### Current Architecture Limitations (Version 1)
* **No Authentication / JWT**: The application currently operates with open role-based access for local development.
* **No Authorization Middleware**: Endpoint permissions are not evaluated against authenticated user sessions.
* **Development CORS**: Pre-configured to allow local frontend origins (`http://localhost:3000`, `http://localhost:5173`).

### Security Precautions
* **Credential Hygiene**: `.env` files are excluded in `.gitignore`; no live credentials or secrets are committed.
* **Least Privilege**: Dedicated MySQL users (e.g. `ims_user`) should be used rather than `root`.
* **Production CORS**: Wildcards (`*`) must not be used with credentials; explicit production domains must be defined.

---

## 10. Testing Architecture

```
                             TESTING SUITES
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
      BACKEND PYTEST                             FRONTEND SUITE
      (102+ Tests)                                (TypeScript & Vite)
             │                                           │
   ┌─────────┴─────────┐                         ┌───────┴───────┐
   │                   │                         │               │
Unit & API        Integration                Type Check     Prod Build
 (In-Memory        (Real MySQL                (tsc --noEmit) (npm run build)
  SQLite)           Fallback)
```

* **Test Database Engine**: In-memory SQLite (`sqlite:///:memory:`) using `StaticPool` and enforced foreign keys (`PRAGMA foreign_keys=ON`) for fast, isolated, non-destructive execution.
* **Live MySQL Fallback**: Pytest gracefully skips live MySQL integration tests if a MySQL instance is unavailable during CI/test runs.
* **Full-Stack E2E Verification**: Manual and smoke-test verification using local browser, Vite frontend dev server, FastAPI backend, and MySQL database.

---

## 11. Deployment Architecture (Conceptual)

```
                            PRODUCTION DEPLOYMENT
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
        STATIC WEB SERVER                          APPLICATION SERVER
      (Nginx / CDN / S3)                           (FastAPI + Uvicorn)
                 │                                         │
      React SPA Build Assets                        Python Backend API
            (dist/*)                                  (Port 8000)
                 │                                         │
                 └──────────────────┬──────────────────────┘
                                    │
                            DATABASE SERVER
                               (MySQL 8+)
```

* **Frontend**: Compiled static bundle generated via `npm run build` outputting optimized JavaScript, CSS, and HTML to `dist/`.
* **Backend**: ASGI application executed using `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
* **Database**: Managed MySQL 8+ instance upgraded with `python -m alembic upgrade head`.
* **Environment Configuration**: Set `VITE_API_BASE_URL` in frontend build and `DATABASE_URL` / `ALLOWED_ORIGINS` in backend runtime environment.
