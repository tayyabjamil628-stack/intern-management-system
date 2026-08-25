# REST API Developer Reference — Intern Management System (IMS)

## 1. Overview & Base Configuration

The Intern Management System (IMS) backend is built with **FastAPI** and provides a RESTful API communicating strictly via JSON payloads over HTTP.

### Base URL & Path Configuration
* **Server Root**: `http://127.0.0.1:8000` (or `http://localhost:8000`)
* **API Prefix**: `/api/v1`
* **Content-Type**: `application/json`

### Interactive Documentation & Schema
* **Swagger UI**: `http://127.0.0.1:8000/docs`
* **ReDoc**: `http://127.0.0.1:8000/redoc`
* **OpenAPI JSON**: `http://127.0.0.1:8000/openapi.json`

---

## 2. HTTP Status Codes & Error Response Format

### Standard HTTP Status Codes

| Code | Status | Usage in IMS Backend |
| :--- | :--- | :--- |
| `200` | **OK** | Successful `GET`, `PUT` resource retrieval or update |
| `201` | **Created** | Successful `POST` resource creation |
| `204` | **No Content** | Successful `DELETE` operation (empty body) |
| `400` | **Bad Request** | Logical domain violation (e.g. invalid date ranges) |
| `404` | **Not Found** | Specified entity ID does not exist in the database |
| `409` | **Conflict** | Unique constraint violation (duplicate name, email, intern ID, or duplicate attendance date) or `ON DELETE RESTRICT` foreign key violation |
| `422` | **Unprocessable Entity** | Pydantic schema validation failure or malformed payload |
| `500` | **Internal Server Error** | Unexpected server-side failure (sanitized, zero SQL or secrets leaked) |

### Error Payload Format

#### Standard Domain Error (`400`, `404`, `409`):
```json
{
  "detail": "Department with ID 999 not found"
}
```

#### Duplicate Conflict Error (`409`):
```json
{
  "detail": "Department with name 'Engineering' already exists"
}
```

#### Foreign Key Deletion Restriction Error (`409`):
```json
{
  "detail": "Cannot delete department: 4 intern(s) are currently assigned to it"
}
```

#### Pydantic Schema Validation Error (`422`):
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error"
    }
  ]
}
```

---

## 3. System Endpoints

### Health Check
* **Endpoint**: `GET /api/v1/health`
* **Purpose**: Verifies that the FastAPI application and runtime are responsive.
* **Query Parameters**: None
* **Request Body**: None
* **Success Status**: `200 OK`
* **Response Body**:
  ```json
  {
    "status": "ok"
  }
  ```

---

## 4. Departments API (`/api/v1/departments`)

Manages organizational departments that house interns.

### Endpoints Inventory

| Method | Path | Summary | Success Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/departments` | List all departments (with optional name search) | `200 OK` |
| `GET` | `/api/v1/departments/{department_id}` | Get single department by ID | `200 OK` |
| `POST` | `/api/v1/departments` | Create a new department | `201 Created` |
| `PUT` | `/api/v1/departments/{department_id}` | Update department name / description | `200 OK` |
| `DELETE`| `/api/v1/departments/{department_id}` | Delete department (enforces RESTRICT) | `204 No Content` |

### Query Parameters for `GET /api/v1/departments`
* `search` *(string, optional)*: Case-insensitive substring filter against department `name`.

### Request & Response Models

#### Create Department Payload (`POST /api/v1/departments`):
```json
{
  "name": "Engineering",
  "description": "Software, platform, and infrastructure teams"
}
```
* **Validation Rules**:
  * `name`: Required, string, non-empty, max 100 characters. Unique across all departments.
  * `description`: Optional string.

#### Department Response Object (`200 OK` / `201 Created`):
```json
{
  "id": 1,
  "name": "Engineering",
  "description": "Software, platform, and infrastructure teams",
  "created_at": "2026-08-17T10:00:00Z",
  "updated_at": "2026-08-17T10:00:00Z"
}
```

---

## 5. Interns API (`/api/v1/interns`)

Manages intern profiles, departmental placements, and internship terms.

### Endpoints Inventory

| Method | Path | Summary | Success Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/interns` | List interns with search & multi-field filters | `200 OK` |
| `GET` | `/api/v1/interns/{intern_id}` | Get detailed intern profile by database ID | `200 OK` |
| `POST` | `/api/v1/interns` | Register a new intern | `201 Created` |
| `PUT` | `/api/v1/interns/{intern_id}` | Update intern profile details | `200 OK` |
| `DELETE`| `/api/v1/interns/{intern_id}` | Remove intern (enforces RESTRICT) | `204 No Content` |

### Query Parameters for `GET /api/v1/interns`
* `search` *(string, optional)*: Searches across `full_name`, `intern_id`, or `email`.
* `department_id` *(integer, optional)*: Filters interns assigned to a specific department ID.
* `status` *(string, optional)*: Filters by status: `ACTIVE`, `COMPLETED`, `TERMINATED`.

### Request & Response Models

#### Create Intern Payload (`POST /api/v1/interns`):
```json
{
  "intern_id": "INT-2026-001",
  "full_name": "Sarah Jenkins",
  "email": "sarah.jenkins@example.com",
  "phone": "+1-555-0199",
  "department_id": 1,
  "role": "Frontend Engineering Intern",
  "university": "State University",
  "start_date": "2026-06-01",
  "end_date": "2026-08-31",
  "status": "ACTIVE"
}
```

* **Validation Rules**:
  * `intern_id`: Required, max 50 chars, non-empty, unique.
  * `full_name`: Required, max 150 chars, non-empty.
  * `email`: Required, valid email format (`EmailStr`), max 150 chars, unique.
  * `phone`: Optional, max 20 chars.
  * `department_id`: Required, integer, must reference an existing `departments.id`.
  * `role`: Required, max 100 chars, non-empty.
  * `university`: Optional, max 150 chars.
  * `start_date` & `end_date`: Required ISO dates (`YYYY-MM-DD`). `end_date >= start_date` enforced.
  * `status`: Valid enum value (`ACTIVE`, `COMPLETED`, `TERMINATED`). Defaults to `ACTIVE`.

#### Intern Response Object (`200 OK` / `201 Created`):
```json
{
  "id": 1,
  "intern_id": "INT-2026-001",
  "full_name": "Sarah Jenkins",
  "email": "sarah.jenkins@example.com",
  "phone": "+1-555-0199",
  "department_id": 1,
  "role": "Frontend Engineering Intern",
  "university": "State University",
  "start_date": "2026-06-01",
  "end_date": "2026-08-31",
  "status": "ACTIVE",
  "created_at": "2026-08-17T10:00:00Z",
  "updated_at": "2026-08-17T10:00:00Z"
}
```

---

## 6. Projects API (`/api/v1/projects`)

Tracks deliverables, progress, and assignments allocated to interns.

### Endpoints Inventory

| Method | Path | Summary | Success Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | List projects with search & status filters | `200 OK` |
| `GET` | `/api/v1/projects/{project_id}` | Get single project deliverable by ID | `200 OK` |
| `POST` | `/api/v1/projects` | Create deliverable and assign to intern | `201 Created` |
| `PUT` | `/api/v1/projects/{project_id}` | Update progress, status, or assignment | `200 OK` |
| `DELETE`| `/api/v1/projects/{project_id}` | Delete deliverable | `204 No Content` |

### Query Parameters for `GET /api/v1/projects`
* `search` *(string, optional)*: Substring match across project `name` or `description`.
* `intern_id` *(integer, optional)*: Filters deliverables assigned to a specific intern ID.
* `status` *(string, optional)*: Filters by status: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`.

### Request & Response Models

#### Create Project Payload (`POST /api/v1/projects`):
```json
{
  "name": "Design System Modernization",
  "description": "Implement accessible UI component library for intern workspace",
  "intern_id": 1,
  "start_date": "2026-06-15",
  "deadline": "2026-08-20",
  "status": "IN_PROGRESS",
  "progress": 65
}
```

* **Validation Rules**:
  * `name`: Required, max 150 chars, non-empty.
  * `description`: Optional string.
  * `intern_id`: Required integer, must reference an existing `interns.id`.
  * `start_date` & `deadline`: Required ISO dates (`YYYY-MM-DD`). `deadline >= start_date` enforced.
  * `status`: Valid enum value (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`).
  * `progress`: Integer constrained between `0` and `100`.
  * *Business Rule*: Setting status to `COMPLETED` automatically synchronizes `progress` to `100%`.

#### Project Response Object (`200 OK` / `201 Created`):
```json
{
  "id": 1,
  "name": "Design System Modernization",
  "description": "Implement accessible UI component library for intern workspace",
  "intern_id": 1,
  "start_date": "2026-06-15",
  "deadline": "2026-08-20",
  "status": "IN_PROGRESS",
  "progress": 65,
  "created_at": "2026-08-17T10:00:00Z",
  "updated_at": "2026-08-17T10:00:00Z"
}
```

---

## 7. Attendance API (`/api/v1/attendance`)

Logs daily attendance status and remarks for interns.

### Endpoints Inventory

| Method | Path | Summary | Success Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/attendance` | List attendance logs with multi-field filters | `200 OK` |
| `GET` | `/api/v1/attendance/{attendance_id}` | Get single attendance record by ID | `200 OK` |
| `POST` | `/api/v1/attendance` | Log daily attendance record | `201 Created` |
| `PUT` | `/api/v1/attendance/{attendance_id}` | Update attendance record status / remarks | `200 OK` |
| `DELETE`| `/api/v1/attendance/{attendance_id}` | Delete attendance record | `204 No Content` |

### Query Parameters for `GET /api/v1/attendance`
* `intern_id` *(integer, optional)*: Filters attendance logs for a specific intern ID.
* `status` *(string, optional)*: Filters by status: `PRESENT`, `ABSENT`, `LEAVE`.
* `date` *(string, optional)*: Filters for a specific calendar date in `YYYY-MM-DD` format.

### Request & Response Models

#### Log Attendance Payload (`POST /api/v1/attendance`):
```json
{
  "intern_id": 1,
  "attendance_date": "2026-08-17",
  "status": "PRESENT",
  "remarks": "On-site arrival on time"
}
```

* **Validation Rules**:
  * `intern_id`: Required integer, must reference an existing `interns.id`.
  * `attendance_date`: Required ISO date (`YYYY-MM-DD`).
  * `status`: Valid enum value (`PRESENT`, `ABSENT`, `LEAVE`).
  * `remarks`: Optional string, max 255 characters.
  * *Uniqueness Rule*: Only one attendance entry is permitted per intern per calendar date (`uq_attendance_intern_date`). Attempting duplicate entries triggers `409 Conflict`.

#### Attendance Response Object (`200 OK` / `201 Created`):
```json
{
  "id": 1,
  "intern_id": 1,
  "attendance_date": "2026-08-17",
  "status": "PRESENT",
  "remarks": "On-site arrival on time",
  "created_at": "2026-08-17T10:00:00Z"
}
```

---

## 8. Referential Integrity & Deletion Rules

All foreign keys in the IMS database enforce `ON DELETE RESTRICT` to protect data consistency:
1. **Departments (`/api/v1/departments/{department_id}`)**:
   - Cannot be deleted if any interns reference `interns.department_id`.
   - Backend returns `409 Conflict`: `"Cannot delete department: N intern(s) are currently assigned to it"`.
2. **Interns (`/api/v1/interns/{intern_id}`)**:
   - Cannot be deleted if any projects reference `projects.intern_id` or attendance logs reference `attendance.intern_id`.
   - Backend returns `409 Conflict`: `"Cannot delete intern: Dependent project or attendance records exist"`.
3. **Projects & Attendance**:
   - Can be deleted directly without dependent parent cascade blocks.

---

## 9. Windows-Compatible cURL Examples

### System Health
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/health"
```

### Departments
```bash
# List departments with search
curl -X GET "http://127.0.0.1:8000/api/v1/departments?search=Eng"

# Create department
curl -X POST "http://127.0.0.1:8000/api/v1/departments" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Engineering\", \"description\": \"Core engineering teams\"}"
```

### Interns
```bash
# List active interns in department 1
curl -X GET "http://127.0.0.1:8000/api/v1/interns?department_id=1&status=ACTIVE"

# Create intern
curl -X POST "http://127.0.0.1:8000/api/v1/interns" ^
  -H "Content-Type: application/json" ^
  -d "{\"intern_id\": \"INT-2026-001\", \"full_name\": \"Sarah Jenkins\", \"email\": \"sarah@example.com\", \"department_id\": 1, \"role\": \"Frontend Intern\", \"start_date\": \"2026-06-01\", \"end_date\": \"2026-08-31\", \"status\": \"ACTIVE\"}"
```

### Projects
```bash
# List in-progress projects for intern 1
curl -X GET "http://127.0.0.1:8000/api/v1/projects?intern_id=1&status=IN_PROGRESS"

# Create project
curl -X POST "http://127.0.0.1:8000/api/v1/projects" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"IMS Portal\", \"description\": \"Build management portal\", \"intern_id\": 1, \"start_date\": \"2026-06-15\", \"deadline\": \"2026-08-20\", \"status\": \"IN_PROGRESS\", \"progress\": 50}"
```

### Attendance
```bash
# List attendance for a specific date
curl -X GET "http://127.0.0.1:8000/api/v1/attendance?date=2026-08-17"

# Log attendance
curl -X POST "http://127.0.0.1:8000/api/v1/attendance" ^
  -H "Content-Type: application/json" ^
  -d "{\"intern_id\": 1, \"attendance_date\": \"2026-08-17\", \"status\": \"PRESENT\", \"remarks\": \"On-site\"}"
```

---

## 10. Frontend API Consumption Architecture

The React frontend interacts with the REST API using dedicated service wrappers that call `apiClient.ts`:

```
[React Page / View]
        │
        ▼
[Service Layer]
├── departmentService.ts  (getDepartments, createDepartment, updateDepartment, deleteDepartment)
├── internService.ts      (getInterns, getInternById, createIntern, updateIntern, deleteIntern)
├── projectService.ts     (getProjects, getProjectById, createProject, updateProject, deleteProject)
└── attendanceService.ts  (getAttendance, createAttendance, updateAttendance, deleteAttendance)
        │
        ▼
[apiClient.ts (Central HTTP Client)]
        │ - Injects application/json headers
        │ - Handles query parameter serialization
        │ - Intercepts HTTP errors (404, 409, 422, 500)
        │ - Sanitizes error messages for user-friendly UI display
        ▼
[FastAPI REST Endpoints (/api/v1/*)]
```

---

## 11. Version 1 API Limitations & Security Notice

* **No Backend Authentication**: The API currently operates without authentication headers, session cookies, or JWT verification.
* **No Authorization / Permissions Layer**: Role enforcement is handled at the presentation layer; endpoints are open for local network administration.
* **Scope Boundary**: There are currently no backend endpoints for Instructor profiles, Chat, Communications, or Push Notifications. These remain mock/context features in the client UI.
