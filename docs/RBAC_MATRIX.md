# Role-Based Access Control (RBAC) Matrix

This document provides a comprehensive overview of which roles can access which routes in the CSMS system.

## Role Definitions

| Role Code | Role Name | Description | Institution Access |
|-----------|-----------|-------------|-------------------|
| **HRO** | HR Officer | Submits requests on behalf of employees | Institution-specific |
| **HHRMD** | Head of HR Management | Approves/rejects most HR requests | All institutions (CSC internal) |
| **HRMO** | HR Management Officer | Approves/rejects HR requests (excluding disciplinary) | All institutions for their modules (CSC internal) |
| **DO** | Disciplinary Officer | Handles complaints, termination, dismissal | All institutions for their modules (CSC internal) |
| **EMPLOYEE** | Employee | Submits complaints, views own profile | Own data only |
| **CSCS** | Civil Service Commission Secretary | Views all activities, highest authority | All institutions (view all) |
| **HRRP** | HR Responsible Personnel | Supervises HRO, monitors institution HR | Own institution only |
| **PO** | Planning Officer | Views reports and analytics | All institutions (read-only) |
| **Admin** | System Administrator | Manages system, users, institutions | System-wide |

## Access Control Matrix

| Route | HRO | HHRMD | HRMO | DO | EMP | CSCS | HRRP | PO | Admin |
|-------|-----|-------|------|----|----|------|------|-------|-------|
| **Admin Routes** |
| `/dashboard/admin/*` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/admin/users` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/admin/institutions` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/admin/fetch-data` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/admin/audit-trail` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **HR Management Routes** |
| `/dashboard/confirmation` | ✅ Submit | ✅ Approve | ✅ Approve | ❌ | ❌ | ✅ View | ✅ Monitor | ❌ | ❌ |
| `/dashboard/lwop` | ✅ Submit | ✅ Approve | ✅ Approve | ❌ | ❌ | ✅ View | ✅ Monitor | ❌ | ❌ |
| `/dashboard/promotion` | ✅ Submit | ✅ Approve | ✅ Approve | ❌ | ❌ | ✅ View | ✅ Monitor | ❌ | ❌ |
| `/dashboard/cadre-change` | ✅ Submit | ✅ Approve | ✅ Approve | ❌ | ❌ | ✅ View | ✅ Monitor | ❌ | ❌ |
| `/dashboard/retirement` | ✅ Submit | ✅ Approve | ✅ Approve | ❌ | ❌ | ✅ View | ✅ Monitor | ❌ | ❌ |
| `/dashboard/resignation` | ✅ Submit | ✅ Approve | ✅ Approve | ❌ | ❌ | ✅ View | ✅ Monitor | ❌ | ❌ |
| `/dashboard/service-extension` | ✅ Submit | ✅ Approve | ✅ Approve | ❌ | ❌ | ✅ View | ✅ Monitor | ❌ | ❌ |
| **Disciplinary Routes** |
| `/dashboard/complaints` | ❌ | ✅ Handle | ❌ | ✅ Handle | ✅ Submit | ✅ View | ❌ | ❌ | ❌ |
| `/dashboard/termination` | ✅ Submit | ✅ Approve | ❌ | ✅ Approve | ❌ | ✅ View | ❌ | ❌ | ❌ |
| `/dashboard/dismissal` | ✅ Submit | ✅ Approve | ❌ | ✅ Approve | ❌ | ✅ View | ❌ | ❌ | ❌ |
| **Information & Monitoring** |
| `/dashboard/institutions` | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `/dashboard/profile` | ✅ | ✅ | ✅ | ✅ | ✅ Own | ✅ | ✅ | ✅ | ❌ |
| `/dashboard/urgent-actions` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `/dashboard/track-status` | ✅ | ✅ | ✅ | ✅ | ✅ Own | ✅ | ✅ | ✅ | ❌ |
| `/dashboard/recent-activities` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `/dashboard/reports` | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ Read-only | ❌ |
| `/dashboard` (Home) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Workflow Clarifications

### HR Management Workflows (Confirmation, LWOP, Promotion, etc.)

```
┌─────────────────────────────────────────────────────────────┐
│  HRO (Institution)                                          │
│  ├─ Submits request on behalf of employee                   │
│  └─ Can only see own institution's requests                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  CSC (HHRMD or HRMO)                                        │
│  ├─ Reviews request from any institution                    │
│  ├─ Approves, Rejects, or Sends back for rectification      │
│  └─ Can view all institutions' requests                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  CSCS                                                       │
│  ├─ Views all activities (monitoring only)                  │
│  └─ Can see status of all requests                          │
└─────────────────────────────────────────────────────────────┘
```

### Disciplinary Workflows (Complaints, Termination, Dismissal)

```
┌─────────────────────────────────────────────────────────────┐
│  EMPLOYEE or HRO                                            │
│  ├─ Employee submits complaint                              │
│  ├─ HRO submits termination/dismissal request               │
│  └─ Visible to submitter only initially                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  CSC (HHRMD or DO)                                          │
│  ├─ Either HHRMD or DO can handle (first come)              │
│  ├─ Approves or Rejects                                     │
│  └─ Can view all institutions' cases                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  CSCS                                                       │
│  └─ Views all activities (monitoring only)                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Permissions Summary

### HHRMD (Head of HR Management)
**Scope:** All institutions, all HR modules + disciplinary
- ✅ Approves: Confirmation, Promotion, LWOP, Cadre Change, Retirement, Resignation, Service Extension
- ✅ Handles: Complaints, Termination, Dismissal
- ✅ Views: All institutions, all data
- ✅ Access: Full access to all HR and disciplinary modules

### HRMO (HR Management Officer)
**Scope:** All institutions, HR modules only (NO disciplinary)
- ✅ Approves: Confirmation, Promotion, LWOP, Cadre Change, Retirement, Resignation, Service Extension
- ❌ NO Access: Complaints, Termination, Dismissal
- ✅ Views: All institutions for modules they approve
- ⚠️ **Important:** HRMO does NOT handle disciplinary actions

### DO (Disciplinary Officer)
**Scope:** All institutions, disciplinary modules only
- ✅ Handles: Complaints, Termination, Dismissal
- ❌ NO Access: Other HR modules (Confirmation, Promotion, LWOP, etc.)
- ✅ Views: All institutions for disciplinary cases
- ⚠️ **Important:** DO only handles disciplinary, not regular HR requests

### HRO (HR Officer)
**Scope:** Own institution only
- ✅ Submits: All requests on behalf of employees (except Complaints)
- ❌ Cannot approve own requests
- ✅ Views: Only own institution's data
- 🔒 **Restricted to institution:** Cannot see other institutions

### CSCS (Civil Service Commission Secretary)
**Scope:** All institutions, all modules (view-only monitoring)
- ✅ Views: All actions by HHRMD, HRMO, DO
- ✅ Access: Employee profiles across all institutions
- ✅ Reports: System-wide and institutional reports
- 📊 **Monitoring role:** Can see everything but doesn't approve

### HRRP (HR Responsible Personnel)
**Scope:** Own institution only, supervisory
- ✅ Monitors: HRO activities in their institution
- ✅ Views: Request status and processing by HHRMD/HRMO/DO
- ✅ Access: Employee profiles in own institution
- ✅ Reports: Institution-specific only
- 🔒 **Restricted to institution:** Cannot see other institutions

### PO (Planning Officer)
**Scope:** All institutions, reports only (read-only)
- ✅ Views: System-wide reports and analytics
- ✅ Access: Dashboards and aggregated data
- ✅ Export: Reports for strategic planning
- 📊 **Read-only:** Cannot submit, approve, or modify anything

### EMPLOYEE
**Scope:** Own data only
- ✅ Submits: Complaints only
- ✅ Views: Own profile and own complaints
- ✅ Track: Own request status
- 🔒 **Highly restricted:** Cannot see other employees' data

### Admin
**Scope:** System-wide technical management
- ✅ User Management: Create, update, deactivate users, reset passwords
- ✅ Institution Management: Add/manage institutions
- ✅ System Configuration: Module configs, logs, system health
- ⚙️ **Technical role:** Not involved in HR workflows

## Security Enforcement

### Server-Side Protection (Middleware)
✅ All routes are protected by Next.js middleware
✅ Validates authentication before page load
✅ Checks role permissions server-side
✅ Redirects unauthorized users immediately

### Client-Side Protection
✅ Route guard components for UX
✅ Navigation items hidden based on role
✅ Error messages for unauthorized access

### Defense-in-Depth
✅ Cannot bypass by typing URL directly
✅ Cannot bypass by disabling JavaScript
✅ Cannot bypass by manipulating cookies (backend validates)

---

**Last Updated:** 2025-12-27
**Version:** 2.0 (Updated with CSCS and HRRP roles)
