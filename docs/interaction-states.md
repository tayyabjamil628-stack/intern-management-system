# Interaction & UI State Specification — Intern Management System (IMS)

## 1. Overview & Architectural Principles
This document specifies the exact interaction flows, visual feedback states, error handling patterns, and operational behaviors for all user interfaces across the Intern Management System (IMS). 

---

## 2. CRUD Action Feedback & Operations

Every state mutation (Create, Update, Delete) follows a deterministic 4-stage lifecycle:

```
[ User Initiates Action ] 
            │
            ▼
[ Submitting State ] ──► (Disables inputs, shows spinner inside button)
            │
    ┌───────┴────────┐
    ▼                ▼
[ Success ]     [ Error State ]
    │                │
    ▼                ▼
(Toast & Modal  (Inline validation or
 Close)          alert message)
```

### 2.1 Create Operations
* **Trigger:** Admin clicks a primary action button (e.g., `[+ Register Intern]`, `[+ Create Project]`).
* **Modal Launch:** Opens the creation modal with clear section headers and empty form fields.
* **Submission Behavior:** Primary submit button enters `Submitting` state (disabled, showing spinner). Form inputs become read-only.
* **Success Feedback:** Modal closes automatically, a green success toast appears top-right (e.g., *"Intern registered successfully"*), and the data table updates instantly.
* **Error Feedback:** Modal remains open. Inline red validation messages appear under invalid fields, or a red alert banner appears at the top of the modal for server errors.

### 2.2 Update Operations
* **Trigger:** Admin clicks `[Edit]` row action or button on detail view.
* **Modal Launch:** Opens edit modal pre-populated with existing record data.
* **Submission Behavior:** Primary submit button enters `Submitting` state.
* **Success Feedback:** Modal closes, success toast appears (e.g., *"Project details updated"*), and the row updates.
* **Error Feedback:** Modal remains open; validation errors highlighted inline.

### 2.3 Delete Operations & Confirmation Pattern
To prevent accidental data destruction, single-click deletions are strictly forbidden.

#### Delete Confirmation Modal (`ConfirmDialog`):
* **Trigger:** Admin clicks `[Delete]` action button.
* **Modal Layout:**
  * **Title:** `Confirm Deletion`
  * **Warning Text:** Identifies the exact record being deleted (e.g., *"Are you sure you want to delete intern 'Sarah Jenkins'? This action cannot be undone."*)
  * **Action Buttons:** `[Cancel]` (Secondary button) + `[Delete Record]` (Destructive Red button).
* **Submission:** Destructive button enters loading state upon click.
* **Success:** Modal closes, red toast confirms removal (*"Intern record deleted"*), and table refreshes.

---

## 3. Form States & Validation Behavior

Forms across all modules (Interns, Departments, Projects, Attendance) support 7 distinct operational states:

1. **Default State:** Clean background, subtle border (`#CBD5E1`), dark label (`#334155`), placeholder text (`#94A3B8`).
2. **Focus State:** 2px primary ring (`#2563EB`) with 1px offset, border `#2563EB`.
3. **Disabled State:** Opacity 50%, background `#F1F5F9`, cursor `not-allowed`.
4. **Submitting State:** Inputs locked (`readOnly`), action button displays loading spinner and text (e.g., *"Saving..."*).
5. **Success Feedback:** Brief green highlight on modified inputs or immediate modal closure with toast.
6. **Validation Error State:**
   * Input border becomes red (`#DC2626`).
   * Red focus ring (`#DC2626`).
   * Explicit error text appears directly beneath the input field (e.g., *"Email address must be valid"*).
7. **Server Error State:** An alert box renders at the top of the form with clear human-readable messaging (e.g., *"An intern with ID 'INT-2026-001' already exists"*).

---

## 4. Table & List View States

Data tables (`DataTable`) implement 4 core visual states:

* **Loading State:** Table renders header row with 5 animated skeleton pulse rows (`animate-pulse bg-slate-100`).
* **Populated State:** Displays interactive rows with hover highlighting (`bg-slate-50`), aligned text columns, status badges, and action menus.
* **Empty State:** Displayed when 0 records exist in the database for the resource.
  * *Layout:* Centered icon, heading (*"No interns registered yet"*), description (*"Get started by registering your first intern."*), and a primary `[Register Intern]` action button.
* **Error State:** Displayed when API data fetching fails.
  * *Layout:* Centered error icon, message (*"Unable to load data. Please check your connection."*), and a `[Retry]` secondary button.

---

## 5. Search & Filter Interactions

* **Active Search:** Typing into the `SearchBar` debounces (300ms) before filtering the underlying table.
* **Active Filters:** Selecting dropdown filters (e.g., Department, Status) instantly updates table results and displays an active filter counter or chip tags.
* **Clear Filters Action:** A `[Clear Filters]` button appears whenever search or dropdown filters are active. Clicking it resets all inputs to default.
* **No Filter Results State:** When search/filter criteria match 0 records:
  * *Heading:* *"No matching records found"*
  * *Description:* *"No interns match your current search or filter criteria."*
  * *Action:* Primary `[Clear Filters]` button to easily reset the view.

---

## 6. Pagination Interactions

* **Page Information:** Displays current record scope (e.g., *"Showing 1–10 of 42 interns"*).
* **Controls:** `[Previous]` and `[Next]` pagination buttons alongside page numbers.
* **Disabled Behavior:** `[Previous]` is disabled on page 1. `[Next]` is disabled on the final page.
* **Single-Page Hide:** If total records count is less than or equal to page size (e.g. ≤ 10), pagination controls remain hidden to clean up UI clutter.

---

## 7. Domain-Specific Interaction Rules

### 7.1 Project Progress Interactions
* **Valid Bounded Range:** Progress must be an integer between `0` and `100` inclusive.
* **Admin Interaction:** Admin can adjust progress via a numeric input field or slider control inside the project edit form/modal.
* **Intern Interaction:** Interns can view progress readouts, progress bars, and completion percentages in their personal portal (Read-only).
* **Status Synchronization:** When progress reaches `100%`, the status indicator visually updates to `COMPLETED`. No automatic calculations or unrequested background calculations are introduced.

### 7.2 Attendance Logging & Duplicate-Date Prevention
* **Form Inputs:** Date picker, Intern select dropdown, Status select (`PRESENT`, `ABSENT`, `LEAVE`), and optional Remarks textarea.
* **Duplicate Entry Guard:** The backend/form validates against logging duplicate attendance for the same intern on the same date.
* **Duplicate Feedback:** If an entry already exists for that intern and date:
  * Input displays inline error: *"Attendance record already logged for this intern on 2026-08-13."*
  * Form submission is blocked until date or intern selection is adjusted.

---

## 8. Responsive Interaction Rules

* **Mobile Viewports (`< 768px`):**
  * Sidebar transitions into a slide-over mobile drawer toggled via a top bar hamburger button.
  * Multi-column data tables become horizontally scrollable containers (`overflow-x-auto`) or collapse into individual `DataCard` views.
  * Filter bars stack vertically with full-width select inputs.
  * Action buttons inside page headers expand to 100% width for easy thumb reach.
  * Modals adjust to full-screen slide-up sheets with sticky bottom action bars.

---

## 9. Accessibility & Focus Rules

* **Keyboard Trapping:** Modals and dialogs trap keyboard focus (`Tab` / `Shift+Tab`) within the dialog while open.
* **Escape Key Dismissal:** Pressing `Escape` closes open dropdown menus, mobile drawers, and modal dialogs (unless form submission is active).
* **Focus Management:** Opening a modal automatically focuses the first interactive form field. Closing a modal restores focus to the triggering element.
* **Screen Reader Live Regions:** Notifications and state changes utilize `aria-live="polite"` so screen readers announce success toasts and inline form validation errors automatically.
* **Accessible Labels:** All icon buttons feature explicit `aria-label` tags, and form fields connect strictly to labels via `htmlFor` / `id` pairings.
