# Core UI Component Specification — Intern Management System (IMS)

## 1. Overview & Architectural Principles
This specification defines the complete inventory of reusable UI components for the Intern Management System. Every component is designed to conform to the design tokens defined in `docs/design-system.md` and the structural patterns in `docs/layout-navigation.md`.

### Core Rules:
* **Single Source of Truth:** Components must be reused across all pages rather than duplicated per-view.
* **Accessibility First:** Minimum 44px touch targets on mobile, visible focus rings, explicit ARIA roles, and semantic HTML structure.
* **Zero Marketing Effects:** No glassmorphism, glowing shadows, or unrequested animations. Focus on high operational data density.

---

## 2. Common Components

### 2.1 `Button`
* **Purpose:** Trigger actions, submit forms, or open dialogs.
* **Variants:** `Primary` (Indigo `#2563EB`), `Secondary` (White with `#CBD5E1` border), `Ghost` (Transparent), `Destructive` (Red `#DC2626`), `Success` (Green `#16A34A`).
* **States:** Default, Hover, Active, Focus (2px ring), Disabled (Opacity 50%, `cursor-not-allowed`), Loading (Spinner inside).
* **Accessibility:** Minimum 44px height on mobile (`h-11`), `aria-disabled` when disabled.

### 2.2 `Input` / `TextInput` / `EmailInput` / `DateInput`
* **Purpose:** Collect text, email, and date user input.
* **Height:** 38px (`h-9.5`).
* **States:** Default (Border `#CBD5E1`), Hover, Focus (Border `#2563EB`, Ring 2px), Error (Border `#DC2626`, Ring 2px `#DC2626`), Disabled.
* **Features:** Integrated label, required asterisk (`*`), error message display, and optional helper text.

### 2.3 `Select`
* **Purpose:** Choose one value from a structured options list.
* **Height:** 38px.
* **States:** Standard form states matching `Input`.
* **Accessibility:** Native `<select>` or custom dropdown with ARIA `combobox` / `listbox` roles and full keyboard arrow navigation.

### 2.4 `Textarea`
* **Purpose:** Multi-line text input for project descriptions, leave remarks, and notes.
* **Min Height:** 80px (3 rows).
* **States:** Standard form states matching `Input`.

### 2.5 `Badge` / `StatusBadge`
* **Purpose:** Display operational status values clearly.
* **Features:** Combines colored background pill, readable text label, and icon indicator.
* **Variants:** See Section 6 for explicit status mapping.

### 2.6 `Card`
* **Purpose:** Structural panel container for grouping related content, forms, or metrics.
* **Styling:** Background `#FFFFFF`, Border 1px `#E2E8F0`, Radius 8px (`rounded-lg`), Padding 16px/24px (`p-4` or `p-6`).

### 2.7 `Modal`
* **Purpose:** Focus-trap dialog container for creating/editing records (e.g., *Register Intern*, *Create Project*).
* **Structure:** Backdrop overlay (`bg-slate-900/50`), Modal Header (Title + Close Button), Scrollable Body, Modal Footer (Cancel + Submit Buttons).
* **Accessibility:** Traps focus inside modal, closes on `Escape` key press, `aria-modal="true"`.

### 2.8 `ConfirmDialog`
* **Purpose:** Special modal specifically for destructive operations (e.g. *Delete Intern*, *Delete Project*).
* **Features:** Explicitly names the target record being deleted (e.g., *"Are you sure you want to delete intern 'Sarah Jenkins'?"*), Destructive Red primary action button.

### 2.9 `Alert`
* **Purpose:** Inline feedback notification for system warnings, validation summaries, or info notices.
* **Variants:** `Success` (Green), `Warning` (Yellow), `Error` (Red), `Info` (Blue).

### 2.10 `Toast`
* **Purpose:** Transient floating feedback notification following successful actions (e.g., *"Project successfully created"*).
* **Duration:** Auto-dismisses after 4 seconds. Top-right screen positioning.

### 2.11 `LoadingState`
* **Purpose:** Skeleton shimmer boxes or spinner indicators during data fetching.

### 2.12 `EmptyState`
* **Purpose:** Feedback container displayed when list/table record count is zero.
* **Structure:** Centered icon, title, description, and "Clear Filters" or "Add Record" action button.

---

## 3. Navigation Components

### 3.1 `Sidebar`
* **Purpose:** Persistent desktop navigation menu (240px width).
* **Behavior:** Renders navigation links with active indigo highlight, icon, and label. Collapses off-screen on mobile.

### 3.2 `MobileDrawer`
* **Purpose:** Slide-over navigation menu on mobile viewports triggered by header hamburger toggle.

### 3.3 `TopHeader`
* **Purpose:** Global header strip (60px height) featuring portal view context label (*Admin Portal* vs. *Intern Portal*) and mobile menu toggle.

### 3.4 `Breadcrumbs`
* **Purpose:** Hierarchical route location path (e.g. `Admin / Interns / Sarah Jenkins`).

### 3.5 `PageHeader`
* **Purpose:** Reusable top banner for content pages featuring Breadcrumbs, Page Title (H1), Short Description, and Action Button slot.

### 3.6 `Pagination`
* **Purpose:** Footer control for data tables displaying total records count (*"Showing 1-10 of 42"*), records per page selector, and Previous/Next buttons.

---

## 4. Data Components

### 4.1 `DataTable`
* **Purpose:** Central tabular data display component.
* **Features:** Column headers with sorting indicators, clean row padding, hover highlighting, integrated `LoadingState`, `EmptyState`, `Pagination`, and responsive horizontal overflow wrapper.

### 4.2 `MetricCard`
* **Purpose:** High-level summary block on dashboards (e.g. *Total Interns*, *Active Projects*).
* **Structure:** Icon, Metric Value (28px Bold), Label (13px Muted Text), and optional trend indicator.

### 4.3 `SearchBar`
* **Purpose:** Text input with search icon and instant filter dispatch.

### 4.4 `FilterBar`
* **Purpose:** Toolbar container combining `SearchBar`, dropdown select filters (department, status), date range pickers, and a "Clear Filters" button.

### 4.5 `DataCard`
* **Purpose:** Compact card layout representing a record on mobile viewports when multi-column tables are squeezed.

---

## 5. Form Components

All form input controls are wrapped in a unified form field component featuring:
* **Label:** `text-xs font-medium text-slate-700`
* **Required Indicator:** Red asterisk (`*`) for mandatory fields
* **Error Text:** `text-xs text-red-600`
* **Helper Text:** `text-xs text-slate-500`
* **Focus State:** `ring-2 ring-blue-600 border-blue-600`

Form controls inventory: `TextInput`, `EmailInput`, `DateInput`, `Select`, `Textarea`, `SearchInput`.

---

## 6. IMS-Specific Domain Components

### 6.1 `InternCard`
* **Purpose:** Compact summary card for an intern displaying name, Intern ID, avatar placeholder, department badge, role, and quick links.

### 6.2 `ProjectCard`
* **Purpose:** Project overview card displaying project title, assigned intern, deadline date, status badge, and progress bar component.

### 6.3 `ProjectProgress`
* **Purpose:** Visual progress bar indicator for project completion (0 to 100%).
* **Features:** Bounded numeric percentage label alongside a smooth colored bar (Blue for in-progress, Green for 100% completed).

### 6.4 `AttendanceStatus`
* **Purpose:** Visual and textual indicator for attendance records (`PRESENT`, `ABSENT`, `LEAVE`).

### 6.5 `InternSummary`
* **Purpose:** High-level header card on Intern detail and portal dashboard pages summarizing identity, email, university, department, and internship period.

### 6.6 `AttendanceSummary`
* **Purpose:** Aggregate attendance status card showing total Present, Absent, and Leave days with percentage calculations.

---

## 7. Status Badge Mapping Matrix

| Domain Entity | Status ENUM | Visual Style | Icon |
|---|---|---|---|
| **Intern** | `ACTIVE` | Green Pill (`bg-emerald-100 text-emerald-800`) | Check Circle |
| **Intern** | `COMPLETED` | Blue Pill (`bg-sky-100 text-sky-800`) | Award / Check |
| **Intern** | `TERMINATED` | Red Pill (`bg-red-100 text-red-800`) | Alert Octagon |
| **Project** | `NOT_STARTED` | Gray Pill (`bg-slate-100 text-slate-700`) | Circle |
| **Project** | `IN_PROGRESS` | Blue Pill (`bg-sky-100 text-sky-800`) | Play Circle |
| **Project** | `COMPLETED` | Green Pill (`bg-emerald-100 text-emerald-800`) | Check Circle |
| **Project** | `ON_HOLD` | Yellow Pill (`bg-amber-100 text-amber-800`) | Pause Circle |
| **Attendance** | `PRESENT` | Green Pill (`bg-emerald-100 text-emerald-800`) | Checkmark |
| **Attendance** | `ABSENT` | Red Pill (`bg-red-100 text-red-800`) | Cross |
| **Attendance** | `LEAVE` | Yellow Pill (`bg-amber-100 text-amber-800`) | Calendar / Clock |

*All badges include readable status text alongside color indicators for full accessibility.*

---

## 8. Feedback System & Operational States

1. **Loading State:** Displays skeleton pulse cards or data table loader rows during asynchronous data fetching.
2. **Empty Data State:** Friendly messaging when no data exists (e.g. *"No interns found matching filter"*).
3. **Success State:** Toast notification confirming successful operations (e.g., *"Intern record saved successfully"*).
4. **Validation Error State:** Explicit field-level error messages directly beneath affected inputs (e.g., *"End date cannot precede start date"*).
5. **Server Error State:** Non-intrusive alert notification summarizing server/network issues cleanly.

---

## 9. Accessibility & Keyboard Navigation Rules

* **Focus Management:** All interactive elements feature a visible 2px focus ring (`ring-2 ring-blue-600 offset-1`).
* **Touch Targets:** Minimum 44x44px interactive bounds on mobile viewports.
* **Dialog Traps:** Modals and confirmation dialogs trap keyboard focus and dismiss gracefully on `Escape`.
* **Aria Roles:** Modals use `role="dialog"` and `aria-modal="true"`. Data tables use proper `<thead>`, `<tbody>`, `<th scope="col">` markup. Form inputs are explicitly connected to labels via `id` / `htmlFor`.

---

## 10. Component Reuse Rules

To prevent code duplication:
* **DO NOT** create page-specific duplicate buttons or inputs. Use `Button` and `Input` everywhere.
* **DO NOT** create custom modal containers per page. Use `Modal` and `ConfirmDialog`.
* **DO NOT** write custom badge styles inline. Always use `StatusBadge`.
* **DO NOT** re-implement table layout logic. Always use `DataTable`.
