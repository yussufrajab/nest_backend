# Requests Module Refactoring Plan

## Overview

This document outlines the comprehensive refactoring plan for the Requests module to align with the SRS and Inception Report requirements.

---

## 1. Navigation Structure Changes

### 1.1 Current State
- Single "Requests" menu item in sidebar
- All request types accessed via dropdown on `/requests` page

### 1.2 Target State
- "Requests" becomes a collapsible parent menu with 8 sub-items:
  - Confirmation Requests
  - Promotion Requests
  - LWOP Requests
  - Cadre Change Requests
  - Retirement Requests
  - Resignation Requests
  - Service Extension Requests
  - Dismissal and Termination Requests (unconfirmed employee is terminated while confirmed employee is dismissed)

### 1.3 Role-Based Navigation Visibility

| Request Type | HRO | HRMO | HHRMD | DO | HRRP |
|--------------|-----|-------|-------|----|----|
| Confirmation | ✓ | ✓ | ✓ | ✗ | ✓ |
| Promotion | ✓ | ✓ | ✓ | ✗ | ✓ |
| LWOP | ✓ | ✓ | ✓ | ✗ | ✓ |
| Cadre Change | ✓ | ✓ | ✓ | ✗ | ✓ |
| Retirement | ✓ | ✓ | ✓ | ✗ | ✓ |
| Resignation | ✓ | ✓ | ✓ | ✗ | ✓ |
| Service Extension | ✓ | ✓ | ✓ | ✗ | ✓ |
| Separation* | ✓ | ✓ | ✓ | ✓ | ✓ |
| Complaints* | ✗ | ✗ | ✓ | ✓ | ✗ |



*Separation includes Termination and Dismissal (disciplinary requests visible to DO)

*Employee can send complaints while hhrmd and DO can review the complaints

---

## 2. HRO Request Submission Workflow

### 2.1 Current Flow
1. Navigate to `/requests`
2. Click "New Request" dropdown
3. Select request type
4. Select employee from dropdown

### 2.2 Target Flow (Per SRS Section 1.3, Use Case 1)

```
┌────────────────────────────────────────────────────────────┐
│                  HRO REQUEST SUBMISSION                    │
└────────────────────────────────────────────────────────────┘

[HRO Login]
    │
    ▼
[Navigate to Specific Request Type]
    │  e.g., /requests/confirmation/new
    │  e.g., /requests/promotion/new
    ▼
[Search Employee by ZanID or Payroll Number]
    │  - Input field for ZanID (9 digits)
    │  - OR Input field for Payroll Number
    │  - Search button
    ▼
[Employee Information Displayed]
    │  - Full Name
    │  - ZanID, Payroll Number, ZSSF Number
    │  - Institution
    │  - Current Cadre/Position
    │  - Employment Date
    │  - Current Status (On Probation, Confirmed, etc.)
    │  - Photo (if available)
    ▼
[Request Form - Type Specific Fields]
    │  See Section 3 for form fields per type
    ▼
[Document Upload Section]
    │  - List of required documents per request type
    │  - PDF only, max 2MB each
    │  - Drag-drop or file picker
    │  - Progress indicator
    ▼
[Review and Submit]
    │  - Preview all entered data
    │  - List of attached documents
    │  - Submit button
    ▼
[System Validation]
    │  - Business rule validation (see Section 4)
    │  - Required fields check
    │  - Document validation
    ▼
[Success - Request ID Generated]
    │  - Display request ID (e.g., CONF-INST-2026-000001)
    │  - Notification sent to approvers
    │  - Option to print submission receipt
```

### 2.3 New Components Required

| Component | Path | Purpose |
|-----------|------|---------|
| `EmployeeSearch` | `frontend/components/requests/EmployeeSearch.tsx` | Search by ZanID/Payroll |
| `EmployeeInfoCard` | `frontend/components/requests/EmployeeInfoCard.tsx` | Display employee details |
| `DocumentUploader` | `frontend/components/requests/DocumentUploader.tsx` | Multi-file PDF upload |
| `RequestReviewModal` | `frontend/components/requests/RequestReviewModal.tsx` | Preview before submit |
| `RequestTypeSelector` | `frontend/components/requests/RequestTypeSelector.tsx` | Navigate to specific type |

---

## 3. Request Type Forms Specification

### 3.1 Confirmation Request
**Route:** `/requests/confirmation/new`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Employee | Search (ZanID/Payroll) | Yes | Must exist, must be on probation |
| Proposed Confirmation Date | Date | Yes | Cannot be before probation end date |
| Institution | Auto-filled | - | From employee record |
| Notes | Textarea | No | Max 1000 chars |

**Required Documents:**
1. Appointment Letter (PDF)
2. Probation Assessment Report (PDF)
3. Ardhilhali (Employee Certificate) (PDF)

**Business Rules:**
- Employee must be on probation (12-18 months)
- Cannot submit if already confirmed

---

### 3.2 Promotion Request
**Route:** `/requests/promotion/new`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Employee | Search (ZanID/Payroll) | Yes | Must be confirmed employee |
| Proposed Cadre | Select | Yes | Senior, Middle, Junior |
| Promotion Type | Select | Yes | Meritorious, Normal |
| Studied Outside Country | Checkbox | No | Triggers TCU verification requirement |

**Required Documents:**
1. Academic Certificates (PDF)
2. Appointment Letter to Current Position (PDF)
3. Performance Appraisal Reports (last 2 years) (PDF)
4. TCU Verification Letter (if studied outside country) (PDF)

**Business Rules:**
- Minimum 2 years in current position for normal promotion
- Meritorious promotion requires exceptional performance

---

### 3.3 LWOP Request
**Route:** `/requests/lwop/new`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Employee | Search (ZanID/Payroll) | Yes | Must be confirmed employee |
| Duration | Text | Yes | e.g., "6 months", "2 years" |
| Reason | Select + Text | Yes | Must be valid reason |
| Start Date | Date | Yes | Cannot be in past |
| End Date | Date | Yes | Must be after start date, max 3 years |

**Required Documents:**
1. LWOP Application Letter (PDF)
2. Supporting Documents (based on reason) (PDF)
3. Loan Guarantee Letter (if has government loan) (PDF)

**Business Rules:**
- Minimum 1 month, maximum 3 years
- Maximum 2 LWOP periods in career
- Valid reasons: Medical, Family Emergency, Education, Personal
- Cannot exceed 3 years cumulative LWOP

---

### 3.4 Cadre Change Request
**Route:** `/requests/cadre-change/new`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Employee | Search (ZanID/Payroll) | Yes | Must be confirmed |
| New Cadre | Select | Yes | Valid cadre options |
| Reason | Textarea | Yes | Justification for change |
| Studied Outside Country | Checkbox | No | Triggers TCU requirement |

**Required Documents:**
1. Academic Qualifications (PDF)
2. Current Appointment Letter (PDF)
3. TCU Verification Letter (if applicable) (PDF)
4. Job Description for New Cadre (PDF)

**Business Rules:**
- Must have required qualifications for new cadre
- TCU verification required for foreign qualifications

---

### 3.5 Retirement Request
**Route:** `/requests/retirement/new`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Employee | Search (ZanID/Payroll) | Yes | Any confirmed employee |
| Retirement Type | Select | Yes | Normal, Medical, Voluntary |
| Proposed Date | Date | Yes | Cannot be in past |
| Illness Description | Textarea | Conditional | Required for Medical Retirement |
| Delay Reason | Textarea | No | If retiring after normal age |

**Required Documents:**
1. Retirement Application Letter (PDF)
2. Age Verification Documents (PDF)
3. Medical Board Report (for medical retirement) (PDF)
4. Handover Plan (PDF)

**Business Rules:**
- Normal retirement age: 60 years
- Medical retirement requires medical board certification
- Voluntary retirement requires minimum service years

---

### 3.6 Resignation Request
**Route:** `/requests/resignation/new`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Employee | Search (ZanID/Payroll) | Yes | Confirmed employee |
| Effective Date | Date | Yes | Minimum 3 months from submission |
| Reason | Textarea | No | Optional explanation |

**Required Documents:**
1. Resignation Letter (PDF)
2. Clearance Form (PDF)

**Business Rules:**
- 3 months notice period required
- Can be waived with payment in lieu

---

### 3.7 Service Extension Request
**Route:** `/requests/service-extension/new`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Employee | Search (ZanID/Payroll) | Yes | Near retirement age |
| Current Retirement Date | Date | Yes | Auto-filled from employee |
| Requested Extension Period | Select | Yes | 6 months, 1 year, 2 years |
| Justification | Textarea | Yes | Detailed reason for extension |

**Required Documents:**
1. Extension Request Letter (PDF)
2. Justification/Need for Extension (PDF)
3. Performance Assessment (PDF)

**Business Rules:**
- Maximum 2 extensions in career
- Maximum extension period: 3 years total
- Must be submitted before current retirement date

---

### 3.8 Separation Request (Termination/Dismissal)
**Route:** `/requests/separation/new`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Employee | Search (ZanID/Payroll) | Yes | Any employee |
| Type | Select | Yes | Termination, Dismissal |
| Reason | Select + Text | Yes | Disciplinary reason |

**Required Documents:**
1. Disciplinary Committee Report (PDF)
2. Evidence Documents (PDF)
3. Show Cause Letter Response (PDF)
4. Hearing Minutes (PDF)

**Business Rules:**
- Termination: For confirmed employees
- Dismissal: For probationary employees
- Requires completed disciplinary process

---

## 4. Role-Based Request Review/Approval

### 4.1 Request Visibility by Role

| Role | Can View | Can Approve |
|------|----------|-------------|
| **HRO** | Own institution only | No |
| **HRMO** | All institutions | HR requests only (not disciplinary) |
| **HHRMD** | All institutions | All requests including disciplinary |
| **DO** | All institutions | Disciplinary only (Termination, Dismissal, Complaints) |
| **HRRP** | Own institution (read-only) | No |

### 4.2 Request List Pages by Role

**HRO View:**
- `/requests` - All requests from their institution
- Filter by: Status, Type, Employee
- Actions: View, Delete (if PENDING and submitted by self)

**HRMO View:**
- `/requests/review` - Pending requests requiring HRMO approval
- Filter by: Type (excluding disciplinary), Review Stage
- Actions: Approve, Reject, Return

**HHRMD View:**
- `/requests/review` - All pending requests
- Filter by: Type, Review Stage, Institution
- Actions: Approve, Reject, Return

**DO View:**
- `/requests/disciplinary` - Disciplinary requests only
- Filter by: Status, Type (Termination, Dismissal)
- Actions: Approve, Reject, Return

### 4.3 Review Actions

| Action | Effect | Notification |
|--------|--------|--------------|
| Approve | Request → APPROVED, Update employee status | HRO, Employee, HRRP |
| Reject | Request → REJECTED, No status change | HRO, Employee |
| Return | Request → RETURNED, Back to HRO for rectification | HRO only |

---

## 5. File Structure Changes

### 5.1 New Directory Structure

```
frontend/
├── app/(main)/
│   └── requests/
│       ├── page.tsx                    # Main list (all requests)
│       ├── review/
│       │   └── page.tsx                # Review page (HRMO/HHRMD/DO)
│       ├── disciplinary/
│       │   └── page.tsx                # Disciplinary requests (DO only)
│       ├── new/
│       │   └── [type]/
│       │       └── page.tsx            # Dynamic new request form
│       ├── [type]/                     # NEW: Type-specific routes
│       │   ├── page.tsx                # Type-specific list
│       │   └── new/
│       │       └── page.tsx            # Type-specific new form
│       └── [id]/
│           └── page.tsx                # Request detail
├── components/
│   └── requests/
│       ├── EmployeeSearch.tsx
│       ├── EmployeeInfoCard.tsx
│       ├── DocumentUploader.tsx
│       ├── RequestReviewModal.tsx
│       ├── RequestTypeSelector.tsx
│       └── RequestList.tsx
└── services/
    └── requestService.ts               # Update with new methods
```

### 5.2 Sidebar Update

```typescript
// Sidebar.tsx - Requests submenu structure
const requestsMenu = [
  {
    title: 'Requests',
    href: '/requests',
    icon: '📝',
    roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP', 'PO', 'HRRP'],
    children: [
      { title: 'Confirmation', href: '/requests/confirmation', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'] },
      { title: 'Promotion', href: '/requests/promotion', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'] },
      { title: 'LWOP', href: '/requests/lwop', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'] },
      { title: 'Cadre Change', href: '/requests/cadre-change', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'] },
      { title: 'Retirement', href: '/requests/retirement', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'] },
      { title: 'Resignation', href: '/requests/resignation', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'] },
      { title: 'Service Extension', href: '/requests/service-extension', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'] },
      { title: 'Separation', href: '/requests/separation', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'] },
    ]
  }
]
```

---

## 6. Implementation Phases

### Phase 1: Navigation and Routing (2 days)
- [ ] Update Sidebar.tsx with collapsible Requests menu
- [ ] Create type-specific routes `/requests/[type]`
- [ ] Implement role-based menu visibility

### Phase 2: Employee Search Component (2 days)
- [ ] Create `EmployeeSearch.tsx` component
- [ ] Implement ZanID search
- [ ] Implement Payroll Number search
- [ ] Add validation and error handling

### Phase 3: Employee Info Card (1 day)
- [ ] Create `EmployeeInfoCard.tsx` component
- [ ] Display all employee fields
- [ ] Add photo display
- [ ] Add institution badge

### Phase 4: Document Uploader (2 days)
- [ ] Create `DocumentUploader.tsx` component
- [ ] Implement drag-drop
- [ ] Add PDF validation
- [ ] Add file size validation (2MB limit)
- [ ] Show upload progress
- [ ] List required documents per request type

### Phase 5: Update Request Forms (3 days)
- [ ] Update all 8 request type forms
- [ ] Integrate EmployeeSearch
- [ ] Integrate EmployeeInfoCard
- [ ] Integrate DocumentUploader
- [ ] Add type-specific validation

### Phase 6: Review Pages (2 days)
- [ ] Create `/requests/review` page
- [ ] Create `/requests/disciplinary` page
- [ ] Implement role-based filtering
- [ ] Add approve/reject/return actions

### Phase 7: Testing and Polish (2 days)
- [ ] Test all user roles
- [ ] Test all request types
- [ ] Fix bugs
- [ ] Add loading states
- [ ] Add error messages

---

## 7. API Endpoints Required

### 7.1 Employee Search
```
GET /employees/search?zanId=xxx
GET /employees/search?payrollNumber=xxx
```

### 7.2 Request Submission (existing, keep)
```
POST /requests/confirmation
POST /requests/promotion
POST /requests/lwop
POST /requests/cadre-change
POST /requests/retirement
POST /requests/resignation
POST /requests/service-extension
POST /requests/separation
```

### 7.3 Request Review (existing, keep)
```
GET /requests?status=PENDING&type=xxx
POST /requests/:id/approve
POST /requests/:id/reject
POST /requests/:id/return
```

---

## 8. Validation Rules Summary

| Request Type | Key Validation Rules |
|--------------|---------------------|
| Confirmation | Employee on probation (12-18 months) |
| Promotion | Min 2 years in position, TCU if foreign study |
| LWOP | 1 month - 3 years, max 2 lifetime, valid reason |
| Cadre Change | Qualifications match new cadre |
| Retirement | Age 60 for normal, medical board for medical |
| Resignation | 3 months notice |
| Service Extension | Max 2 lifetime, before retirement date |
| Separation | Completed disciplinary process |

---

## 9. Success Criteria

- [ ] HRO can search employee by ZanID or Payroll Number
- [ ] Employee information displays correctly after search
- [ ] Document upload works for all request types
- [ ] All 8 request types have correct form fields
- [ ] Business rule validations prevent invalid submissions
- [ ] HRMO sees only HR requests (not disciplinary)
- [ ] DO sees only disciplinary requests
- [ ] HHRMD sees all requests
- [ ] Sidebar shows all 8 request types as sub-menus
- [ ] Role-based navigation works correctly

---

## 10. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Employee search returns no results | High | Clear error messages, suggest checking input |
| Document upload fails | High | Retry mechanism, clear error messages |
| Business rules too strict | Medium | Allow override with reason for edge cases |
| Role permissions incorrect | Critical | Thorough testing with each role |

---

## 11. Related Documents

- [System Requirements Specification](./System_Requirements_Specification.md)
- [Inception Report](./Inception_Report.md)
- [Business Process Document](./Business_Process_Document.md)
- [CSMS User Roles and Access Guide](./CSMS_User_Roles_and_Access_Guide.md)
