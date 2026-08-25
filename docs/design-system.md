# Design System & Visual Guidelines — Intern Management System (IMS)

## 1. Visual Principles & Design Character
The Intern Management System (IMS) visual language is designed specifically for **operational productivity, legibility, and high data density**. It avoids marketing-oriented SaaS clichés, glassmorphism, floating gradients, animated backgrounds, or decorative fluff.

### Core Principles:
* **Operational & Practical:** Clean, structural grid layouts prioritizing content and data display over decorative elements.
* **Restrained Palette:** Slate neutral surfaces paired with a crisp, professional indigo/navy accent (`#2563EB` / `#1E40AF`) for key action focus.
* **Optimal Scannability:** High-contrast text, clear visual hierarchy, and distinct status badges with icons and text labels.
* **Compact Spacing:** Tight padding math suited for enterprise administrative dashboards, dense tables, and form cards.

---

## 2. Color System (Design Tokens)

The IMS color palette utilizes a Slate-neutral base with functional semantic accents.

| Token | Role | Light Mode Hex | Usage |
|---|---|---|---|
| `bg-app` | Application Background | `#F8FAFC` | Page canvas background |
| `surface` | Card / Panel Background | `#FFFFFF` | Cards, tables, modals, input backgrounds |
| `surface-muted` | Muted Surface | `#F1F5F9` | Table headers, disabled inputs, code blocks |
| `border-subtle` | Subtle Border | `#E2E8F0` | Dividers, card outlines, table gridlines |
| `border-strong` | Active / Hover Border | `#CBD5E1` | Input outlines, hover borders |
| `text-primary` | Primary Text | `#0F172A` | Headings, primary labels, main body text |
| `text-secondary` | Secondary / Muted Text | `#475569` | Metadata, subtitles, table headers, captions |
| `primary` | Primary Accent | `#2563EB` | Primary buttons, active tabs, focus rings |
| `primary-hover` | Primary Hover Accent | `#1D4ED8` | Hover state for primary actions |
| `success` | Success Functional | `#16A34A` | Completed status, present attendance badges |
| `success-bg` | Success Background | `#DCFCE7` | Background for success badges / alerts |
| `warning` | Warning Functional | `#CA8A04` | On-hold status, leave attendance badges |
| `warning-bg` | Warning Background | `#FEF9C3` | Background for warning badges |
| `error` | Error / Destructive | `#DC2626` | Terminated status, absent attendance, delete actions |
| `error-bg` | Error Background | `#FEE2E2` | Background for error badges / alerts |
| `info` | Informational | `#0284C7` | In-progress project status, general info badges |
| `info-bg` | Info Background | `#E0F2FE` | Background for info badges |

---

## 3. Typography System

The system uses standard sans-serif system font stacks (`Inter`, system-ui, `-apple-system`, `BlinkMacSystemFont`) for clean rendering across platforms.

| Scale Token | Font Size | Line Height | Weight | Application |
|---|---|---|---|---|
| `display` | 28px (`1.75rem`) | 36px (`2.25rem`) | 700 (Bold) | Dashboard summary numbers, key metric metrics |
| `h1` | 22px (`1.375rem`) | 28px (`1.75rem`) | 600 (SemiBold) | Page titles (e.g. *Interns Directory*, *Department Management*) |
| `h2` | 18px (`1.125rem`) | 24px (`1.5rem`) | 600 (SemiBold) | Section headers, card titles, modal titles |
| `h3` | 15px (`0.9375rem`) | 20px (`1.25rem`) | 600 (SemiBold) | Table headers, form section labels |
| `body` | 14px (`0.875rem`) | 20px (`1.25rem`) | 400 (Regular) | Primary table cells, body text, form input values |
| `body-bold` | 14px (`0.875rem`) | 20px (`1.25rem`) | 600 (SemiBold) | Emphasized body text, active buttons, key values |
| `caption` | 12px (`0.75rem`) | 16px (`1.0rem`) | 500 (Medium) | Metadata, timestamp captions, status badge labels |

---

## 4. Spacing Scale

Spacing uses a strict 4px grid system:

| Token | Value | Applied To |
|---|---|---|
| `space-1` | 4px | Micro spacing, icon-to-label gaps inside badges |
| `space-2` | 8px | Button inline gaps, badge padding, tight element gaps |
| `space-3` | 12px | Table cell padding (vertical), input field padding |
| `space-4` | 16px | Container padding, card inner padding, standard gap |
| `space-6` | 24px | Page section spacing, modal container padding |
| `space-8` | 32px | Major layout block division |
| `space-12` | 48px | Outer page margin padding |

---

## 5. Border Radius Scale

Restrained border-radii ensure crisp, modern outlines without looking cartoonish or over-rounded.

* **`radius-sm` (4px):** Badge pills, small tag labels, form input controls, table row highlights.
* **`radius-md` (6px):** Buttons, dropdown menus, alert boxes.
* **`radius-lg` (8px):** Cards, modals, primary container panels.
* **`radius-full` (9999px):** Avatar icons, status dot indicators.

---

## 6. Button System

All buttons feature crisp padding, high legibility, explicit hover states, and clear disabled styling.

| Variant | Background | Text Color | Border | Hover State | Disabled State |
|---|---|---|---|---|---|
| **Primary** | `#2563EB` | `#FFFFFF` | None | `#1D4ED8` | Opacity 50%, Cursor Not-Allowed |
| **Secondary** | `#FFFFFF` | `#0F172A` | 1px `#CBD5E1` | `#F8FAFC`, Border `#94A3B8` | Opacity 50%, Cursor Not-Allowed |
| **Ghost** | Transparent | `#475569` | None | `#F1F5F9`, Text `#0F172A` | Opacity 50%, Cursor Not-Allowed |
| **Destructive**| `#DC2626` | `#FFFFFF` | None | `#B91C1C` | Opacity 50%, Cursor Not-Allowed |
| **Success** | `#16A34A` | `#FFFFFF` | None | `#15803D` | Opacity 50%, Cursor Not-Allowed |

---

## 7. Status Badge System

Status indicators combine explicit color coding with clear textual status and icon badges for accessibility.

### Intern Status
* **`ACTIVE`:** Background `#DCFCE7`, Text `#15803D`, Border `#86EFAC`
* **`COMPLETED`:** Background `#E0F2FE`, Text `#0369A1`, Border `#7DD3FC`
* **`TERMINATED`:** Background `#FEE2E2`, Text `#B91C1C`, Border `#FCA5A5`

### Project Status
* **`NOT_STARTED`:** Background `#F1F5F9`, Text `#475569`, Border `#CBD5E1`
* **`IN_PROGRESS`:** Background `#E0F2FE`, Text `#0369A1`, Border `#7DD3FC`
* **`COMPLETED`:** Background `#DCFCE7`, Text `#15803D`, Border `#86EFAC`
* **`ON_HOLD`:** Background `#FEF9C3`, Text `#A16207`, Border `#FDE047`

### Attendance Status
* **`PRESENT`:** Background `#DCFCE7`, Text `#15803D`, Icon Checkmark
* **`ABSENT`:** Background `#FEE2E2`, Text `#B91C1C`, Icon Cross
* **`LEAVE`:** Background `#FEF9C3`, Text `#A16207`, Icon Calendar/Clock

---

## 8. Form System

Input controls prioritize visual clarity, distinct focus rings, and explicit validation feedback.

* **Input Height:** 38px (Compact operational density)
* **Padding:** 8px 12px (`space-2` x `space-3`)
* **Label Style:** Font size 13px, Medium (500), Color `#334155`, margin-bottom 4px.
* **Placeholder:** Color `#94A3B8`, Font size 14px.
* **Focus State:** Outline ring 2px `#2563EB` with offset 1px. Border `#2563EB`.
* **Error State:** Border 1px `#DC2626`, Focus ring 2px `#DC2626`.
* **Helper / Error Text:** Font size 12px, Color `#DC2626` (Error) or `#64748B` (Helper).

---

## 9. Table System

Tables are the central data presentation mechanism across the application.

* **Header:** Background `#F8FAFC`, Text color `#475569`, Font size 12px, Uppercase, Tracking-wider, Height 36px, Border-bottom 1px `#E2E8F0`.
* **Row:** Background `#FFFFFF`, Height 48px, Border-bottom 1px `#F1F5F9`.
* **Row Hover:** Background `#F8FAFC` on mouse enter.
* **Selected Row State:** Background `#EFF6FF` (Subtle blue tint), Left accent border 3px `#2563EB`.
* **Empty State Container:** Centered icon, title ("No interns found"), description ("Try adjusting your search filters"), and clear filters button.
* **Pagination Control:** Compact footer strip displaying total records count, records per page dropdown, and Previous/Next page buttons.

---

## 10. Responsive Layout Principles

* **Desktop First Layout:** Side-by-side navigation sidebar (240px width) + main fluid content panel (`max-w-7xl`).
* **Mobile Layout Adapts:**
  * Navigation sidebar collapses into a top bar with a collapsible drawer toggle.
  * Multi-column data tables convert into responsive stacked data cards or horizontally scrollable containers.
  * Action buttons stack vertically on screens smaller than 640px.
