# Database Design Document — Intern Management System (IMS)

## 1. Relational Overview

The database is built on MySQL 8+ and consists of **four approved core entities**:

1. `departments`
2. `interns`
3. `projects`
4. `attendance`

### Entity Relationship Diagram (ERD)

```
+-----------------+          +--------------------+
|   departments   |          |      interns       |
+-----------------+          +--------------------+
| id (PK)         | 1      * | id (PK)            |
| name            |----------| intern_id (UNIQUE) |
| description     |          | full_name          |
+-----------------+          | email (UNIQUE)     |
                             | phone              |
                             | department_id (FK) |
                             | role               |
                             | university         |
                             | start_date         |
                             | end_date           |
                             | status             |
                             | created_at         |
                             | updated_at         |
                             +--------------------+
                               |                |
                             1 |              1 |
                               |                |
                               *                *
                     +------------------+  +-------------------------------+
                     |     projects     |  |          attendance           |
                     +------------------+  +-------------------------------+
                     | id (PK)          |  | id (PK)                       |
                     | name             |  | intern_id (FK)                |
                     | description      |  | attendance_date               |
                     | intern_id (FK)   |  | status                        |
                     | start_date       |  | remarks                       |
                     | deadline         |  | created_at                    |
                     | status           |  +-------------------------------+
                     | progress         |  | UNIQUE(intern_id, date)       |
                     | created_at       |  +-------------------------------+
                     | updated_at       |
                     +------------------+
```

---

## 2. Entity Specifications

### 2.1 Table: `departments`
Stores organizational department classifications.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique internal department identifier |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Department name (e.g. Software Engineering) |
| `description` | TEXT | NULLABLE | Department description |

**Constraints:**
* `name` must be non-null and unique.

---

### 2.2 Table: `interns`
Stores intern records and profile information.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique database record ID |
| `intern_id` | VARCHAR(50) | NOT NULL, UNIQUE | Unique business ID (e.g., INT-2026-001) |
| `full_name` | VARCHAR(150) | NOT NULL | Full legal name of intern |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Email address |
| `phone` | VARCHAR(20) | NULLABLE | Contact telephone number |
| `department_id` | INT | NOT NULL, FOREIGN KEY | Foreign key referencing `departments(id)` |
| `role` | VARCHAR(100) | NOT NULL | Assigned intern role (e.g. Frontend Intern) |
| `university` | VARCHAR(150) | NULLABLE | Educational institution |
| `start_date` | DATE | NOT NULL | Internship start date |
| `end_date` | DATE | NOT NULL | Internship scheduled end date |
| `status` | ENUM | DEFAULT 'ACTIVE' | Options: `ACTIVE`, `COMPLETED`, `TERMINATED` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last record update timestamp |

**Constraints & Rules:**
* `intern_id` and `email` must be unique.
* `department_id` must reference a valid `departments` record.
* Validation rule: `end_date` cannot precede `start_date`.

---

### 2.3 Table: `projects`
Stores projects assigned to interns.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique project record ID |
| `name` | VARCHAR(150) | NOT NULL | Project title |
| `description` | TEXT | NULLABLE | Project scope & requirements |
| `intern_id` | INT | NOT NULL, FOREIGN KEY | Assigned intern ID referencing `interns(id)` |
| `start_date` | DATE | NOT NULL | Project assignment start date |
| `deadline` | DATE | NOT NULL | Project submission deadline |
| `status` | ENUM | DEFAULT 'NOT_STARTED' | Options: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD` |
| `progress` | INT | DEFAULT 0 | Percentage completed (0 to 100) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last record update timestamp |

**Constraints:**
* `intern_id` must reference a valid `interns` record.
* `progress` must be bounded between 0 and 100.

---

### 2.4 Table: `attendance`
Logs daily attendance records for interns.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique attendance entry ID |
| `intern_id` | INT | NOT NULL, FOREIGN KEY | Intern ID referencing `interns(id)` |
| `attendance_date` | DATE | NOT NULL | Date of attendance log |
| `status` | ENUM | NOT NULL | Options: `PRESENT`, `ABSENT`, `LEAVE` |
| `remarks` | VARCHAR(255) | NULLABLE | Notes or leave reasons |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Log entry timestamp |

**Constraints:**
* Composite Unique Constraint: `UNIQUE(intern_id, attendance_date)` — Ensures an intern cannot have duplicate attendance records for the same calendar date.

---

## 3. Referential Integrity & Deletion Rules

All foreign-key relationships enforce `ON DELETE RESTRICT` to guarantee data safety and prevent orphan records:
* **Department $\rightarrow$ Intern (`interns.department_id`)**: A department cannot be deleted if any interns are currently assigned to it (returns HTTP 409 Conflict).
* **Intern $\rightarrow$ Project (`projects.intern_id`)**: An intern cannot be deleted if active projects are assigned to them (returns HTTP 409 Conflict).
* **Intern $\rightarrow$ Attendance (`attendance.intern_id`)**: An intern cannot be deleted if attendance logs are recorded under their account (returns HTTP 409 Conflict).

---

## 4. Alembic Migration Chain

Database schema evolution is managed via version-controlled Alembic migrations located in `backend/alembic/versions/`:

| Revision ID | Migration File | Description | Target Table |
|---|---|---|---|
| `a1c0d9f4e2b1` | `a1c0d9f4e2b1_create_departments_table.py` | Initial table creation with unique name constraint | `departments` |
| `b2d1e8f5a3c2` | `b2d1e8f5a3c2_create_interns_table.py` | Intern profiles, unique `intern_id`/`email`, FK to departments | `interns` |
| `c3e2f9a6b4d3` | `c3e2f9a6b4d3_create_projects_table.py` | Deliverables, FK to interns, progress check (0–100) | `projects` |
| `d4f3a8b7c5e4` | `d4f3a8b7c5e4_create_attendance_table.py` | Attendance logs, composite unique `(intern_id, date)` | `attendance` |

* **Current Migration Head**: `d4f3a8b7c5e4`
* **Schema Upgrade Command**: `alembic upgrade head`
* **Schema Check Command**: `alembic current`

