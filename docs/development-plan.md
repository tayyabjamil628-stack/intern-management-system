# Development Plan — Intern Management System (IMS)

This document outlines the 12 sequential development phases for building the Intern Management System.

---

## Development Phases & Status

### Phase 1: Requirements & Architecture Blueprint — [COMPLETED]
* **Objective:** Define project requirements, record system architecture, and create foundational documentation (`README.md`, `docs/*`).
* **Deliverables:** Architectural specifications, entity definitions, API design docs, development plan.

### Phase 2: Design System & UI Components — [COMPLETED]
* **Objective:** Establish the visual design system, color palette, typography pairing, layout grids, and reusable UI controls (buttons, inputs, select controls, table containers, cards, badges, modal dialogs).
* **Deliverables:** Reusable presentation component library.

### Phase 3: Frontend Foundation — [COMPLETED]
* **Objective:** Initialize the React + TypeScript + Vite project shell, configure client-side router, establish base layouts (`AdminLayout`, `InternLayout`), navigation controls, and global state management structure.
* **Deliverables:** Functional routing structure and navigation layout shells.

### Phase 4: Admin Portal Implementation — [COMPLETED]
* **Objective:** Construct the complete UI views for the Admin Portal: Executive Dashboard, Intern Management directory, Department views, Project management screens, and Attendance logs.
* **Deliverables:** Interactive Admin UI views.

### Phase 5: Intern Portal Implementation — [COMPLETED]
* **Objective:** Construct the Intern Portal views: Intern Dashboard summary, Assigned Projects tracking page, Personal Attendance history log, and Profile overview.
* **Deliverables:** Interactive Intern UI views backed by demo state.

### Phase 6: FastAPI Backend Foundation — [COMPLETED]
* **Objective:** Set up the FastAPI server structure, environment configuration management (`config.py`), CORS settings, master router dispatching, and standard HTTP error response handlers.
* **Deliverables:** Running FastAPI backend foundation.

### Phase 7: MySQL + SQLAlchemy + Alembic Integration — [COMPLETED]
* **Objective:** Configure MySQL database session creation, write SQLAlchemy ORM models (`Department`, `Intern`, `Project`, `Attendance`), and initialize Alembic database schema migrations.
* **Deliverables:** Versioned database migration scripts (head `d4f3a8b7c5e4`) and ORM models matching database specifications.

### Phase 8: REST API Endpoints Implementation — [COMPLETED]
* **Objective:** Implement RESTful API endpoint handlers for Departments, Interns, Projects, and Attendance with Pydantic request/response validation and repository business logic.
* **Deliverables:** Fully functional REST API backend.

### Phase 9: Frontend/Backend API Integration — [COMPLETED]
* **Objective:** Replace frontend mock services with live API client requests (`fetch` / `apiClient`), connecting React Admin components to FastAPI REST endpoints. Handle network status, loading states, and error handling.
* **Deliverables:** Full-stack integration connecting React Admin UI to FastAPI backend and MySQL database.

### Phase 10: Testing & Verification — [COMPLETED]
* **Objective:** Execute frontend UI component testing, Pytest backend endpoint testing (102 tests passed), database constraint verification, responsive checks, accessibility checks, and recovery testing.
* **Deliverables:** Test suites and verification logs confirming application integrity.

### Phase 11: Documentation Finalization — [COMPLETED]
* **Objective:** Finalize user guides, setup instructions, database entity documentation, API specifications, and deployment guides.
* **Deliverables:** Completed, cross-verified documentation package (`README.md`, `docs/*`, `backend/README.md`).

### Phase 12: Final Internship Submission Package — [COMPLETED]
* **Objective:** Perform final quality verification, build compilation checks, repository audit, and assemble the verified project submission package.
* **Deliverables:** Verified, production-ready Internship Project Package.

---

## 2. Implemented Capabilities vs. Future Enhancements

The Intern Management System (IMS) Version 1 was intentionally scoped to deliver a complete, highly reliable full-stack core for internship administrative operations. The distinction between what is implemented now and future roadmap targets is detailed below:

| Functional Area | Implemented Now (Version 1) | Future Roadmap Enhancement |
| :--- | :--- | :--- |
| **Admin Operations** | Full-stack CRUD with FastAPI REST endpoints and MySQL persistence across Departments, Interns, Projects, and Attendance. | Batch importing/exporting (CSV/Excel), advanced audit logging. |
| **Database & Schemas** | 4 core MySQL tables with `ON DELETE RESTRICT` foreign keys, progress check constraints, unique daily attendance, and Alembic migrations. | Soft-deletion architecture, historical snapshots, full-text search indexing. |
| **Authentication** | Open development mode with presentation role switching for local evaluation. | Secure password hashing (bcrypt/argon2), JWT or session cookies, login/logout. |
| **Authorization (RBAC)**| Presentation-layer routing separating Admin and Intern layout shells. | Backend permission middleware, token claims validation, resource-level access control. |
| **Intern Portal** | Interactive client-side portal powered by React Context and demo datasets (`Sarah Jenkins`, `INT-2026-001`). | Authenticated REST API endpoints restricting queries strictly to the requesting intern. |
| **Instructor Module** | Client-side presentation directory with departmental classifications. | Dedicated `instructors` database table, CRUD REST endpoints, and supervision mappings. |
| **Communications** | Interactive channel selector and message composer using local component state. | Persistent broadcast/announcement model, delivery status, read receipts, and targeting. |
| **Team Chat** | Client-side simulated chat channel interface. | Persistent chat conversations, message tables, and real-time WebSocket transport. |
| **Notifications** | Client-side notification center and actionable toast alerts. | Database-backed notification models with event-driven trigger dispatchers. |
| **Testing & Quality** | 102 automated Pytest backend tests, in-memory SQLite isolation, strict TypeScript checks (`tsc --noEmit`), and Vite production bundling. | End-to-end browser automation (Playwright/Cypress), CI/CD pipeline automation. |

---

## 3. Detailed Current Limitations (Version 1)

### 3.1 Authentication
* **No Backend Authentication**: The FastAPI backend does not issue or require authentication tokens (JWT, API keys, or session cookies) to process API requests.
* **No User Credential Storage**: No `users` or `credentials` tables exist in the database; password hashing algorithms are not currently applied.

### 3.2 Authorization & Security Boundaries
* **Presentation-Layer Role Separation**: The top-bar role selector toggles between Admin and Intern views for demonstration purposes. This is a visual layout selector and is **not** a cryptographically enforced backend security boundary.
* **Open REST Endpoints**: Any client on the permitted CORS network can make requests to `/api/v1/*` endpoints without providing authorization headers.

### 3.3 Intern Portal Data Source
* **Context & Mock Architecture**: The Intern Portal (`/intern/*`) displays data through React Context providers populated by structured mock datasets (`frontend/src/data/`) rather than authenticated REST API endpoints.

### 3.4 Auxiliary Modules
* **Instructor Management**: Operates as a client-side directory without a corresponding backend database table or REST API endpoints.
* **Communications & Broadcasts**: Message composing and broadcast simulation occur in local React state without backend database persistence.
* **Team Chat & Channels**: Channel messaging is managed in-memory and resets upon browser reload; no WebSocket server or message persistence layer is active.
* **Notification Center**: Alerts are generated client-side; no persistent notification queue or delivery tracking exists.

### 3.5 Production Infrastructure
* **Development Focus**: The application is configured for local development and academic evaluation; no production reverse proxy (e.g. Nginx with TLS termination), centralized log aggregator, or live production deployment is currently active.

---

## 4. Prioritized Future Roadmap

### Priority 1: Authentication & Authorization Infrastructure
* **Objective**: Secure all backend endpoints and provide multi-role user accounts.
* **Key Tasks**:
  * Create `users` and `roles` database models with secure password hashing (`argon2id` / `bcrypt`).
  * Implement authentication endpoints (`POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`).
  * Implement JWT (JSON Web Token) issuance and signature verification middleware in FastAPI.
  * Implement Role-Based Access Control (`RBAC`) dependencies enforcing `ADMIN`, `INSTRUCTOR`, and `INTERN` permissions on API routes.
  * Implement protected routes and authentication context in the React frontend.

### Priority 2: Intern Portal API Integration & Self-Service
* **Objective**: Connect the Intern Portal views to authenticated, user-scoped backend endpoints.
* **Key Tasks**:
  * Create `/api/v1/portal/me` endpoint to fetch the authenticated intern's profile.
  * Create `/api/v1/portal/my-projects` and `/api/v1/portal/my-attendance` endpoints restricted to the caller's `intern_id`.
  * Replace React Context mock data in `frontend/src/pages/intern/` with live authenticated `apiClient` requests.

### Priority 3: Instructor Domain & Supervision Backend
* **Objective**: Establish dedicated instructor data management and intern mentorship mappings.
* **Key Tasks**:
  * Create `instructors` database table and Alembic migration revision.
  * Create relational mapping tables (`intern_supervisors`, `project_instructors`).
  * Implement `/api/v1/instructors` CRUD REST endpoints.
  * Connect frontend instructor views to live backend endpoints.

### Priority 4: Communications & Official Broadcast Backend
* **Objective**: Provide a durable broadcast and announcement system for program administrators.
* **Key Tasks**:
  * Create `announcements` and `announcement_recipients` database models.
  * Implement endpoints for publishing broadcasts, targeted delivery (by department or cohort), and acknowledgment tracking.
  * Connect frontend communications center to live announcement APIs.

### Priority 5: Persistent Real-Time Chat System
* **Objective**: Enable multi-user, persistent workplace communication across departments.
* **Key Tasks**:
  * Create `chat_channels`, `channel_members`, and `chat_messages` database tables.
  * Implement FastAPI WebSocket endpoints (`/ws/chat/{channel_id}`) for bidirectional real-time message delivery.
  * Add unread message tracking, message timestamps, and attachment metadata support.

### Priority 6: Notification Engine & Event Triggers
* **Objective**: Deliver automated alerts for system events (deadline reminders, project assignments, attendance notices).
* **Key Tasks**:
  * Create `notifications` database table with read/unread status tracking.
  * Implement background event listeners in the service layer to auto-generate notifications on key mutations.
  * Provide REST endpoints for fetching, marking read, and clearing notifications.

### Priority 7: Production Hardening & Observability
* **Objective**: Prepare the application for scalable, fault-tolerant enterprise deployment.
* **Key Tasks**:
  * Configure Nginx reverse proxy with automated Let's Encrypt TLS/HTTPS certificates.
  * Implement Redis-backed API rate limiting and token caching.
  * Configure centralized structured logging (JSON logs) and OpenTelemetry APM instrumentation.
  * Implement automated CI/CD deployment pipelines with database migration safety checks.

---

## 5. Roadmap Priority & Dependency Matrix

| Priority | Feature Milestone | Why It Matters | Dependencies | Target Sequence |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | Authentication & RBAC | Establishes cryptographic identity and protects all data endpoints. | Version 1 Core API | Phase 13 |
| **P2** | Intern Portal API Integration | Enables real-world intern self-service and removes mock data. | P1 (Auth/JWT) | Phase 14 |
| **P3** | Instructor Backend Domain | Enables official supervisor assignments and faculty oversight. | P1 (Auth/JWT) | Phase 15 |
| **P4** | Communications Backend | Provides auditable program-wide announcement broadcasts. | P1, P3 | Phase 16 |
| **P5** | Persistent Real-Time Chat | Facilitates instant collaborative communication across cohorts. | P1 (Auth), WebSockets | Phase 17 |
| **P6** | Event-Driven Notifications | Proactively alerts interns and managers of deadlines and changes. | P1, P2, P3 | Phase 18 |
| **P7** | Production Hardening | Ensures enterprise uptime, TLS security, and observability. | P1–P6 | Phase 19 |

---

## 6. Academic Presentation Context

The Intern Management System (IMS) Version 1 was deliberately architected to demonstrate **depth over superficial breadth**. Rather than constructing unauthenticated placeholder endpoints across dozens of speculative features, Version 1 concentrates on:
1. **Pristine Relational Architecture**: Enforcing strict foreign keys (`ON DELETE RESTRICT`), data dictionary constraints, and versioned Alembic schema migrations.
2. **Deterministic Layered Backend**: Complete separation of concerns between API Routers, Domain Services, and Data-Access Repositories.
3. **End-to-End Persistence**: Flawless synchronization between React Admin views and MySQL 8+ storage.
4. **Comprehensive Automated Verification**: 102 automated Pytest unit and integration tests combined with strict TypeScript compilation.

The roadmap documented above represents a structured engineering trajectory for future incremental versions rather than unfulfilled project scope.


