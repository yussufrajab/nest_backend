# CSMS UI Design & Implementation Prompt

You are a senior product designer + frontend engineer.
Design and implement a modern, clean, eye-pleasing Civil Service Management System (CSMS) web UI using:

## Tech Stack

- Next.js 16 (App Router) + React 18 + TypeScript
- Tailwind CSS v3+
- Custom components (following existing component patterns)
- React Query for server state
- Custom hooks for auth state

## UI/UX Goals

- Light color palette (soft blues, whites, subtle gradients)
- Professional government/civil service look (trustworthy, minimal, no dark theme)
- Clean spacing, rounded cards, soft shadows
- Accessible typography (large readable headings, high contrast text)
- Responsive layout (desktop-first, tablet-friendly)
- WCAG 2.1 AA accessible color contrast

## System Modules

1. **Auth Pages**: Login, Forgot Password, Reset Password
2. **Dashboard**: Role-based views (Admin, HRO, HHRMD, HRMO, DO, CSCS, etc.)
3. **Employee Management**: List, Profile, Create, Edit, Certificates
4. **Request Types** (8 types):
   - Confirmation Requests
   - Promotion Requests
   - Leave Without Pay (LWOP)
   - Cadre Change Requests
   - Service Extension Requests
   - Retirement Requests
   - Resignation Requests
   - Separation Requests (Termination/Dismissal)
5. **Complaints**: Disciplinary complaint handling
6. **Reports**: Analytics and summaries
7. **Admin**: User management, Institution management

## Components to Create

- **Sidebar** with icons and role-based menu (collapsible)
- **Top navigation bar** with user profile, notifications
- **Stat cards** (Employees, Pending Requests, Approved Today, Alerts)
- **Tables** with search, filters, pagination
- **Forms** with validation
- **Status badges** (PENDING, APPROVED, REJECTED, RETURNED)
- **Review stage badges** (HRO, HRMO, HHRMD, CSCS)
- **Request type badges** (8 different colors/types)
- **Employee info cards** with photo, status, key details
- **Document uploader** with drag-and-drop
- **Employee search** (by ZanID or Payroll Number)

## UI Style Rules

- Use Tailwind utility classes only (no custom CSS files)
- Soft shadows (`shadow-sm`, `shadow-md`)
- Rounded corners (`rounded-lg`, `rounded-xl`)
- Subtle hover states and micro-interactions
- Empty states with friendly messages
- Form validation errors with clear messaging

## Color Palette (based on existing system)

```javascript
// Status colors
PENDING: bg-yellow-100 text-yellow-800
APPROVED: bg-green-100 text-green-800
REJECTED: bg-red-100 text-red-800
RETURNED: bg-orange-100 text-orange-800

// Review stage colors
HRO: bg-blue-100 text-blue-800
HRMO: bg-purple-100 text-purple-800
HHRMD: bg-indigo-100 text-indigo-800
CSCS: bg-teal-100 text-teal-800

// Employee status colors
On Probation: bg-yellow-100 text-yellow-800
Confirmed: bg-green-100 text-green-800
On LWOP: bg-blue-100 text-blue-800
Terminated/Dismissed: bg-red-100 text-red-800
Retired: bg-gray-100 text-gray-800
Resigned: bg-gray-100 text-gray-800
```

## Output Requirements

- Provide full Next.js App Router page structure
- Provide reusable UI components
- Follow existing folder structure:
  ```
  frontend/
  ├── app/
  │   ├── (auth)/          # Login, forgot/reset password (no sidebar)
  │   ├── (main)/           # Authenticated routes with sidebar
  │   │   ├── admin/        # User/institution management (Admin only)
  │   │   ├── employees/    # Employee CRUD
  │   │   ├── requests/     # HR request submission/tracking
  │   │   ├── complaints/   # Complaint handling
  │   │   ├── reports/      # Analytics and reports
  │   │   └── dashboard/    # Dashboard home
  ├── components/
  │   └── Sidebar.tsx       # Main navigation component
  │   └── requests/         # Request-specific components
  ├── services/             # API client wrappers (axios-based)
  ├── hooks/                # React hooks (use-auth, etc.)
  └── types/                # TypeScript type definitions
  ```
- Include layout.tsx, sidebar.tsx, dashboard cards, table components
- Ensure the UI looks professional and suitable for government/civil service use
- Add realistic dummy data for Zanzibar civil service context
- Follow existing patterns for API service integration
- Use existing type definitions from types/ folder

## Design Inspiration

- Modern government admin dashboards
- Civil service HR management systems
- Clean institutional UI (white + soft blue + subtle accents)

## Prioritize

Beauty, clarity, and real-world usability over complexity.
Follow existing codebase patterns and conventions.
