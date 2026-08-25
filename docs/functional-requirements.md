# Functional Requirements & User Workflows — Intern Management System (IMS)

## 1. Overview & System Purpose
This document defines the detailed user workflows, functional specifications, validation rules, UI operational states, and role boundaries for the **Intern Management System (IMS)** based on the registered architecture.

---

## 2. Role Boundaries & Access Scope

### 2.1 Administrator Scope (`Admin`)
Administrators possess complete operational oversight across the organization.

**Admin Capabilities:**
* **Departments:** Create, View, Edit, Delete departments.
* **Interns:** Create, View, Edit, Delete intern records, manage intern status.
* **Projects:** Create projects, assign projects to interns, edit project details, update progress/status, delete projects.
* **Attendance:** Log daily attendance, edit existing attendance records, view attendance logs, filter attendance data.

### 2.2 Intern Scope (`Intern`)
Interns possess a personal portal restricted exclusively to their own data.

**Intern Capabilities:**
* View personal dashboard metrics and profile details.
* View assigned projects and project progress status.
* View personal attendance logs and attendance history.

**Intern Functional Boundaries (Strictly Prohibited):**
* ❌ Cannot create or manage departments.
* ❌ Cannot view, edit, or search other interns' profiles or data.
* ❌ Cannot create or delete projects.
* ❌ Cannot edit or log attendance for themselves or others.

*(Note: Version 1 focuses on functional specification boundaries; authentication infrastructure is omitted per project requirements.)*

---

## 3. Admin Workflows

```
                   ADMIN WORKFLOW HIERARCHY
                             
                         [ Admin Dashboard ]
                                  |
    +-----------------+-----------+-----------+------------------+
    |                 |                       |                  |
    v                 v                       v                  v
[ Interns ]    [ Departments ]           [ Projects ]      [ Attendance ]
    |
    v
[ Intern Details ]
```

### 3.1 Admin Dashboard
* **Purpose:** Provides executive oversight and high-level operational statistics.
* **Viewable Metrics:**
  * Total Interns count
  * Active Interns count
  * Completed Interns count
  * Active Projects count
  * Today's Attendance summary (Present / Absent / Leave counts)
  * Recent Interns list (latest registrations)
  * Recent Projects list (latest created/assigned projects)
* **Actions:** Quick links to management sections.

### 3.2 Intern Management (`/admin/interns`)
* **Purpose:** Centralized directory for managing all intern records in the system.
* **View:** Full tabular list of interns displaying Intern ID, Full Name, Email, Department, Role, Start/End Dates, and Status (`ACTIVE`, `COMPLETED`, `TERMINATED`).
* **Create:** Register new intern records via modal/form.
* **Edit:** Update profile details, department assignment, or status.
* **Delete:** Remove intern records with confirmation dialog.
* **Search & Filter:** Search by name, email, or Intern ID; filter by department or status.

### 3.3 Intern Details (`/admin/interns/:id`)
* **Purpose:** Comprehensive deep-dive into an individual intern's record.
* **View:** Full profile details, university, phone, assigned projects history, and attendance records log.
* **Edit/Delete:** Direct shortcuts to update or delete the record.

### 3.4 Department Management (`/admin/departments`)
* **Purpose:** Organize organizational departments.
* **View:** List of all departments with intern count per department.
* **Create:** Add new department with unique name and description.
* **Edit:** Update department name or description.
* **Delete:** Remove department (only if no active interns are assigned).
* **Search:** Filter departments by name.

### 3.5 Project Management (`/admin/projects`)
* **Purpose:** Track organizational projects and assignments.
* **View:** Table/Card view of projects displaying Title, Assigned Intern, Deadline, Status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`), and Progress percentage (0–100%).
* **Create:** Create new project and assign to an active intern.
* **Edit:** Modify title, description, deadline, assigned intern, or status.
* **Update Progress:** Adjust progress slider or numeric input (0–100%).
* **Delete:** Remove project with confirmation.
* **Search & Filter:** Search by project title; filter by status or assigned intern.

### 3.6 Attendance Management (`/admin/attendance`)
* **Purpose:** Log and monitor daily attendance across all interns.
* **View:** Tabular daily or historical attendance log.
* **Create (Mark Attendance):** Log attendance for a specific intern and date with status (`PRESENT`, `ABSENT`, `LEAVE`) and optional remarks.
* **Edit:** Correct attendance status or update remarks.
* **Search & Filter:** Filter logs by specific date, date range, status, or intern.

---

## 4. Intern Workflows

```
                   INTERN WORKFLOW HIERARCHY
                             
                        [ Intern Dashboard ]
                                 |
    +----------------------------+----------------------------+
    |                            |                            |
    v                            v                            v
[ My Projects ]           [ My Attendance ]             [ My Profile ]
```

### 4.1 Intern Dashboard (`/intern`)
* **Information Displayed:**
  * Intern identity (Full Name, Intern ID, Avatar placeholder)
  * Department and Role
  * Internship period (Start Date to End Date)
  * Active projects overview & progress summary
  * Personal attendance summary (Total Present, Absent, Leave days)
* **Actions Available:** Navigation to detailed personal pages.

### 4.2 My Projects (`/intern/projects`)
* **Information Displayed:** List of assigned projects with descriptions, deadlines, status, and current progress percentages.
* **Actions Available:** View project specifications and progress readout.
* **Data Relationship:** Read-only query from `projects` table filtered by `intern_id`.

### 4.3 My Attendance (`/intern/attendance`)
* **Information Displayed:** Historical log of personal attendance records ordered by date, showing date, status, and remarks.
* **Actions Available:** Date range filter for personal records.
* **Data Relationship:** Read-only query from `attendance` table filtered by `intern_id`.

### 4.4 My Profile (`/intern/profile`)
* **Information Displayed:** Registered personal details (Full Name, Email, Phone, University, Department, Role, Start/End Dates, Status).
* **Actions Available:** View profile (Read-only).
* **Data Relationship:** Query from `interns` and `departments` tables.

---

## 5. Detailed Validation Rules

### 5.1 Intern Fields & Validation
* **`intern_id`:** Required, string, **MUST be unique**.
* **`full_name`:** Required, non-empty string.
* **`email`:** Required, string, **MUST be valid email format**, **MUST be unique**.
* **`phone`:** Optional string.
* **`department_id`:** Required, **MUST reference a valid department**.
* **`role`:** Required string.
* **`university`:** Optional string.
* **`start_date`:** Required, valid date format (`YYYY-MM-DD`).
* **`end_date`:** Required, valid date format (`YYYY-MM-DD`). **Validation Rule: `end_date` CANNOT precede `start_date`**.
* **`status`:** Required ENUM (`ACTIVE`, `COMPLETED`, `TERMINATED`). Default: `ACTIVE`.

### 5.2 Department Fields & Validation
* **`name`:** Required, string, **MUST be unique**.
* **`description`:** Optional string.

### 5.3 Project Fields & Validation
* **`name`:** Required, non-empty string.
* **`description`:** Optional string.
* **`intern_id`:** Required, **MUST reference a valid intern**.
* **`start_date`:** Required date.
* **`deadline`:** Required date. **Validation Rule: `deadline` CANNOT precede `start_date`**.
* **`status`:** Required ENUM (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`).
* **`progress`:** Required integer, **Validation Rule: MUST be bounded between 0 and 100 inclusive**.

### 5.4 Attendance Fields & Validation
* **`intern_id`:** Required, **MUST reference a valid intern**.
* **`attendance_date`:** Required date.
* **`status`:** Required ENUM (`PRESENT`, `ABSENT`, `LEAVE`).
* **`remarks`:** Optional string.
* **Composite Unique Constraint:** **`UNIQUE(intern_id, attendance_date)`** — **Validation Rule: System MUST reject duplicate attendance entries for the same intern on the same date**.

---

## 6. UI Operational & Feedback States

To ensure a smooth user experience, all UI views must handle six standard states:

1. **Loading State:** Displays subtle skeleton loaders or spinners while fetching asynchronous API/mock data.
2. **Empty State:** Shows friendly placeholder messaging when no records exist (e.g., *"No active projects assigned yet"* or *"No interns match the search filter"*).
3. **Validation Error State:** Displays field-level error feedback immediately when validation rules fail (e.g., *"End date cannot precede start date"*).
4. **Server Error State:** Displays non-intrusive alert messages if an API request fails or returns an error response.
5. **Successful Operation Feedback:** Brief toast/alert notification confirming actions (e.g., *"Intern profile successfully updated"*).
6. **Delete Confirmation State:** Requires explicit user modal confirmation before performing permanent deletion operations.

---

## 7. Scope Boundaries Confirmation

The following capabilities are explicitly **OUT OF SCOPE** for the Intern Management System:
* ❌ Recruitment marketplace & public applicant tracking
* ❌ Payroll, stipend processing, or payment gateways
* ❌ AI capabilities, resume parsing, or automated evaluation models
* ❌ Email notifications, SMS gateways, or push notifications
* ❌ External file storage (S3, Cloud Storage)
* ❌ Redis, Celery, or background task queues
* ❌ Microservices architecture
* ❌ Advanced business intelligence or custom reporting engines
