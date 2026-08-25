# Layout & Navigation Specification — Intern Management System (IMS)

## 1. Overview & Architectural Consistency
This specification defines the exact visual layout structure, page archetypes, component spatial alignment, and navigation mechanics for both the **Admin Portal** and the **Intern Portal**. All spatial metrics and component definitions strictly adhere to the Phase 2A design system tokens (`docs/design-system.md`).

---

## 2. Admin Layout (`AdminLayout`)

The Admin Portal uses a **Desktop-First Persistent Sidebar + Header Shell**.

```
+-------------------------------------------------------------------------+
| [IMS Logo]  | Top Header (Breadcrumb / Portal Switch / User)    (60px) |
+-------------+-----------------------------------------------------------+
| Sidebar     | Main Content Area (Fluid Container)                       |
| (240px)     |                                                           |
|             |  +-----------------------------------------------------+  |
| - Dashboard |  | Standard Page Header / Action Bar                   |  |
| - Interns   |  +-----------------------------------------------------+  |
| - Depts     |  | Filter Toolbar / Search                             |  |
| - Projects  |  +-----------------------------------------------------+  |
| - Attendance|  | Main Data Table / Cards Grid / Metrics Summary      |  |
|             |  +-----------------------------------------------------+  |
|             |                                                           |
+-------------+-----------------------------------------------------------+
```

### 2.1 Spatial Dimensions & Structural Regions
* **Sidebar Width:** Fixed 240px (`w-60`).
* **Header Height:** Fixed 60px (`h-15`).
* **Main Content Padding:** 24px (`space-6`).
* **Max Content Width:** 1280px (`max-w-7xl mx-auto`).
* **Sidebar Item Spacing:** 4px gap (`space-1`) between items, 8px 12px padding (`space-2` x `space-3`).

### 2.2 Navigation States
* **Active Navigation State:** Background `#EFF6FF` (Subtle Indigo tint), Text `#2563EB` (Primary Accent), Left Accent Border 3px `#2563EB`, Font weight 600.
* **Hover State:** Background `#F1F5F9`, Text `#0F172A`, Transition duration 150ms.
* **Inactive State:** Background Transparent, Text `#475569`, Font weight 500.

### 2.3 Navigation Items (Admin)
1. **Dashboard** (`/admin`)
2. **Interns** (`/admin/interns`)
3. **Departments** (`/admin/departments`)
4. **Projects** (`/admin/projects`)
5. **Attendance** (`/admin/attendance`)

---

## 3. Intern Layout (`InternLayout`)

The Intern Portal shares the structural geometry of the Admin Layout but features a simplified navigation tree tailored exclusively to personal views.

### 3.1 Navigation Items (Intern)
1. **Dashboard** (`/intern`)
2. **My Projects** (`/intern/projects`)
3. **My Attendance** (`/intern/attendance`)
4. **My Profile** (`/intern/profile`)

### 3.2 Portal Switch & Identity Indicator
The top header includes a clear indicator showing the logged view context (*"Intern Portal — Sarah Jenkins"*) with an option to preview/switch views for evaluation purposes.

---

## 4. Mobile Navigation & Responsive Drawer

On viewports narrower than 768px:

* **Sidebar Collapse:** The 240px persistent sidebar slides off-screen (`hidden md:block`).
* **Top Header Adjustments:** Displays a hamburger toggle icon button (44x44px minimum touch target) on the left side.
* **Mobile Drawer:** Toggling opens a slide-over navigation overlay from the left covering 280px with a backdrop backdrop-blur overlay (`bg-slate-900/50`).
* **Active Route Indicator:** Active route item is highlighted with background `#EFF6FF` and text `#2563EB` within the mobile menu drawer.

---

## 5. Reusable Page Header Structure

Every page utilizes a unified header component (`PageHeader`) maintaining visual rhythm:

```
+-------------------------------------------------------------------------+
| Breadcrumbs: Admin / Interns / Sarah Jenkins                            |
|                                                                         |
|  Page Title (H1 22px)                             [ Primary Action ]   |
|  Short description sentence describing purpose    [ Secondary Action ] |
+-------------------------------------------------------------------------+
```

### Example Declarations:
* **Interns Page:**
  * **Breadcrumbs:** `Admin / Interns`
  * **Title:** `Intern Management`
  * **Description:** `Manage intern records, profiles, departmental assignments, and status.`
  * **Action:** `[+ Register Intern]` (Primary Button)
* **Projects Page:**
  * **Breadcrumbs:** `Admin / Projects`
  * **Title:** `Project Directory`
  * **Description:** `Create, assign, and monitor project progress and deadlines.`
  * **Action:** `[+ Create Project]` (Primary Button)

---

## 6. Page Archetype Layouts

### 6.1 Dashboard Layout Archetype
Optimized for rapid scanning and operational overview.

* **Admin Dashboard Stack:**
  1. **Top Section:** 4-Column Metric Grid (`Total Interns`, `Active Interns`, `Completed Interns`, `Active Projects`).
  2. **Middle Section:** 2-Column Split Grid — *Recent Registered Interns* (Left 50%) + *Recent Active Projects* (Right 50%).
  3. **Bottom Section:** Full-width *Today's Attendance Summary Card* (Present / Absent / Leave breakdown & progress bars).
* **Intern Dashboard Stack:**
  1. **Top Section:** *Intern Identity Summary Banner* (Name, ID, Department, Role, Internship Period, Status Badge).
  2. **Middle Section:** *My Assigned Projects Grid* (Card list of active projects with progress bars).
  3. **Bottom Section:** *Personal Attendance Summary Card* (Attendance percentage, Present/Absent/Leave counters).

### 6.2 List Page Layout Archetype (Interns, Departments, Projects, Attendance)
Standardized multi-record layout:

1. **Page Header:** Title, description, and primary create action.
2. **Toolbar Container:** Integrated Search Input field (left) + Filter Select Dropdowns (status, department, date picker) + Clear Filters button.
3. **Data Display:** Responsive Data Table (or empty state container if record count is 0).
4. **Pagination Strip:** Record count display (*"Showing 1-10 of 42 interns"*), page size select, and Previous/Next buttons.

### 6.3 Detail Page Layout Archetype (`/admin/interns/:id`, `/admin/projects/:id`)
Structured for deep resource review:

1. **Page Header:** Back navigation breadcrumbs, record title (e.g. Intern Name or Project Title), primary edit action button.
2. **Overview Card:** High-level key metadata grid (3-4 columns displaying key fields like Intern ID, Email, Department, Status).
3. **Tab / Section Panels:** Detailed breakdown cards (e.g., Assigned Projects list on Intern Detail page; Attendance history log).
4. **Secondary Action Footer:** Delete record or archive buttons.

### 6.4 Form Layout Archetype (Modals & Form Views)
Clean, readable form layout:

* **Desktop:** 2-Column form grid for side-by-side related fields (e.g., First Name / Email; Start Date / End Date).
* **Mobile:** Automatically collapses to a single-column layout.
* **Structure:** Section Title -> Form Field Groups (Label + Input + Helper Text) -> Bottom Action Bar (`[Cancel]` Secondary + `[Save Changes]` Primary).

---

## 7. Responsive Breakpoint Rules

| Viewport Category | Width Range | Layout Adjustments |
|---|---|---|
| **Mobile** | `< 768px` | Sidebar hidden into Drawer, Tables convert to scrollable containers or stacked cards, Forms switch to single-column, Action buttons full-width stack. |
| **Tablet** | `768px – 1024px` | Persistent sidebar visible, Dashboard metric grid switches to 2x2, Toolbar controls stack into two lines. |
| **Desktop** | `> 1024px` | Full persistent sidebar (240px), Max content container 1280px, 4-Column metric grid, side-by-side form grids. |

---

## 8. Accessibility Requirements

* **Keyboard Navigation:** All sidebar links, buttons, tab triggers, and table actions must be fully reachable via `Tab` key and activate via `Enter` / `Space`.
* **Focus States:** Distinct 2px primary ring (`#2563EB`) with 1px offset on all focused interactive elements.
* **Landmarks:** Proper HTML5 structural elements (`<aside>` for sidebar, `<header>` for top bar, `<main>` for content area, `<nav>` for menus).
* **Touch Targets:** All clickable controls on mobile must maintain a minimum height and width of **44x44px**.
* **Accessible Labels:** All icon-only buttons include `aria-label` descriptors. Active navigation states set `aria-current="page"`.
