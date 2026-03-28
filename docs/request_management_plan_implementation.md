# CSMS Request Management Modules Implementation Plan

## Project Overview

**System:** Civil Service Management System (CSMS)
**Document Type:** Implementation Plan
**Version:** 1.0
**Date:** March 28, 2026
**Prepared For:** NestJS Backend + Next.js Frontend Implementation

---

## Executive Summary

This document provides a comprehensive implementation plan for all request management modules in the Civil Service Management System (CSMS). The system manages HR workflows for 50,000+ employees across 41+ government institutions in Zanzibar, replacing manual paper-based processes with automated, transparent, and auditable digital workflows.

**Expected Benefits:**
- 70% reduction in HR request processing time
- Complete elimination of paper-based processes
- Enhanced transparency and accountability through audit trails
- Real-time request status tracking for all stakeholders

---

## Table of Contents

1. [Current Implementation Status](#1-current-implementation-status)
2. [Request Module Overview](#2-request-module-overview)
3. [Implementation Tasks](#3-implementation-tasks)
4. [Detailed Task Breakdown](#4-detailed-task-breakdown)
5. [Business Rules Summary](#5-business-rules-summary)
6. [Approver Authority Matrix](#6-approver-authority-matrix)
7. [Technical Architecture](#7-technical-architecture)
8. [Timeline and Milestones](#8-timeline-and-milestones)

---

## 1. Current Implementation Status

### 1.1 Completed Components

| Component | Status | Location |
|-----------|--------|----------|
| **Authentication System** | Complete | `backend/src/auth/`, `frontend/hooks/use-auth.tsx` |
| **User Management (CRUD)** | Complete | `backend/src/users/`, `frontend/app/(main)/admin/users/` |
| **Employee Management (CRUD)** | Complete | `backend/src/employees/`, `frontend/app/(main)/employees/` |
| **Institution Management (CRUD)** | Complete | `backend/src/institutions/`, `frontend/app/(main)/admin/institutions/` |
| **Prisma Schema** | Complete | `backend/prisma/schema.prisma` |
| **Role-Based Access Control** | Complete | 9 roles implemented |
| **Frontend Page Structure** | Complete | All major routes created |
| **Dashboard Module** | Complete | Basic stats implemented |
| **Requests Module** | Complete | Full workflow with 8 request types |
| **Complaints Module** | Complete | AI-enhanced text processing |
| **Reports Module** | Complete | PDF export with PDFKit |
| **File Upload (MinIO)** | Complete | `backend/src/upload/` |
| **Notifications** | Complete | In-app + email (placeholder) |
| **Audit Logging** | Complete | Full audit trail |
| **Business Rule Validators** | Complete | 8 validators for request types |
| **Employee Status Transitions** | Complete | Auto-update on approval |

### 1.2 Gaps to Address

| Gap | Priority | Impact |
|-----|----------|--------|
| No dedicated DTOs for request types | Critical | Type safety, validation |
| Request workflow not implemented | Critical | Core functionality missing |
| No file upload handling | Critical | Document management required |
| No notification system | High | User awareness |
| No business rule validations | Critical | Data integrity |
| No audit logging | High | Compliance requirement |
| Reports module incomplete | Medium | Strategic planning |
| No employee status transitions | Critical | Record accuracy |

---

## 2. Request Module Overview

### 2.1 Request Types (8 Total)

| # | Request Type | Model | ID Pattern | Description |
|---|--------------|-------|------------|-------------|
| 1 | **Confirmation Request** | `ConfirmationRequest` | `CONF-[INST]-YYYY-NNNNNN` | Transition from probation to confirmed status |
| 2 | **Promotion Request** | `PromotionRequest` | `PROM-[INST]-YYYY-NNNNNN` | Education-based or performance-based promotion |
| 3 | **LWOP Request** | `LwopRequest` | `LWOP-[INST]-YYYY-NNNNNN` | Leave Without Pay (1 month - 3 years) |
| 4 | **Cadre Change Request** | `CadreChangeRequest` | `CADR-[INST]-YYYY-NNNNNN` | Transfer to different job category |
| 5 | **Service Extension Request** | `ServiceExtensionRequest` | `SEXT-[INST]-YYYY-NNNNNN` | Extend service beyond retirement date |
| 6 | **Retirement Request** | `RetirementRequest` | `RETR-[INST]-YYYY-NNNNNN` | Compulsory, voluntary, or illness retirement |
| 7 | **Resignation Request** | `ResignationRequest` | `RESN-[INST]-YYYY-NNNNNN` | Employee resignation (3-month or 24-hour notice) |
| 8 | **Termination/Dismissal Request** | `SeparationRequest` | `TERM-[INST]-YYYY-NNNNNN` | Disciplinary separation (Termination for confirmed, Dismissal for probation) |

### 2.2 Standard Workflow Pattern

All HR requests follow this standard workflow:

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

[HRO Login]
    │
    ▼
[Navigate to Module]
    │
    ▼
[Search/Select Employee]
    │
    ▼
[Fill Request Form]
    │
    ▼
[Upload Required Documents (PDF, max 2MB)]
    │
    ▼
[Submit Request] ────► [System Validates Data]
    │                         │
    │                         ▼
    │                  [Validation Passes?]
    │                    /              \
    │                  Yes              No
    │                   │                │
    │                   ▼                ▼
    │           [Create Request]   [Show Error Message]
    │           [Status: Pending]  [Return to Form]
    │                   │
    │                   ▼
    │      [Route to Approver (HHRMD/HRMO/DO)]
    │                   │
    │                   ▼
    │      [Send Notification to Approver]
    │
    ▼
[Approver Login]
    │
    ▼
[Review Request Dashboard]
    │
    ▼
[Select Pending Request]
    │
    ▼
[Review Details & Documents]
    │
    ▼
[Make Decision: Approve or Reject or Send Back]
    │
    ├─────────────┬─────────────┐
    │             │             │
 Approve      Reject      Send Back
    │             │             │
    ▼             ▼             ▼
[Upload     [Enter         [Request
 Decision    Rejection      Rectification]
 Letter]     Reason]           │
    │             │             │
    ▼             ▼             ▼
[Update     [Update        [Notify HRO
 Request     Request         with
 Status:     Status:        Reason]
 Approved]   Rejected]         │
    │             │             │
    ▼             │             │
[Update     ◄─────┘             │
 Employee                        │
 Record]                         │
    │                            │
    ▼                            │
[Notify                          │
 HRO]                            │
    │                            │
    ▼                            │
[Audit Log Entry]                │
    │                            │
    ▼                            │
[END] ◄──────────────────────────┘
```

---

## 3. Implementation Tasks

### 3.1 Task Summary

| ID | Task Name | Priority | Estimated Effort | Dependencies |
|----|-----------|----------|------------------|--------------|
| 1 | Create DTOs for all request types | Critical | 2 days | None |
| 2 | Implement request module controllers/services | Critical | 5 days | Task 1 |
| 3 | Implement file upload handling with MinIO | Critical | 2 days | None |
| 4 | Implement notification system | High | 2 days | Task 2 |
| 5 | Implement employee status transitions | Critical | 2 days | Task 2 |
| 6 | Create request module frontend pages | High | 5 days | Tasks 1, 2, 3 |
| 7 | Implement business rule validations | Critical | 3 days | Task 1 |
| 8 | Implement audit logging service | High | 2 days | None |
| 9 | Implement reports module with PDF export | Medium | 4 days | Task 2 |
| 10 | Enhance complaints module with AI | Medium | 2 days | Task 4 |

**Total Estimated Effort:** 29 developer-days

---

## 4. Detailed Task Breakdown

### Task 1: Create DTOs for all Request Types

**Priority:** Critical
**Estimated Effort:** 2 days
**Location:** `backend/src/requests/dto/`

#### Deliverables

Create DTOs for each request type with proper validation:

| DTO File | Fields | Validation Rules |
|----------|--------|------------------|
| `create-confirmation-request.dto.ts` | employeeId, proposedConfirmationDate, notes | employeeId must exist, date ≥ 12 months from employment |
| `create-promotion-request.dto.ts` | employeeId, proposedCadre, promotionType, studiedOutsideCountry, notes | employee must be confirmed, min 2 years in cadre |
| `create-lwop-request.dto.ts` | employeeId, duration, reason, startDate, endDate | 1 month ≤ duration ≤ 3 years, max 2 lifetime LWOPs |
| `create-cadre-change-request.dto.ts` | employeeId, newCadre, reason, studiedOutsideCountry | HHRMD-only approval, TCU verification if foreign |
| `create-service-extension-request.dto.ts` | employeeId, requestedExtensionPeriod, justification | 6 months ≤ extension ≤ 3 years, max 2 lifetime |
| `create-retirement-request.dto.ts` | employeeId, retirementType, proposedDate, illnessDescription? | Medical cert required for illness retirement |
| `create-resignation-request.dto.ts` | employeeId, effectiveDate, reason | 3-month notice or payment proof |
| `create-separation-request.dto.ts` | employeeId, type, reason | Type must match employee status |

#### Implementation Notes

- Use `class-validator` decorators for validation
- Transform dates properly
- Include institution ID in request ID generation
- All DTOs extend base request DTO with common fields

---

### Task 2: Implement Request Module Controllers and Services

**Priority:** Critical
**Estimated Effort:** 5 days
**Location:** `backend/src/requests/`

#### Deliverables

| File | Description |
|------|-------------|
| `requests.controller.ts` | Enhanced with workflow endpoints |
| `requests.service.ts` | Enhanced with business logic |
| `confirmation/confirmation.service.ts` | Confirmation-specific logic |
| `promotion/promotion.service.ts` | Promotion-specific logic |
| `lwop/lwop.service.ts` | LWOP-specific logic |
| `cadre-change/cadre-change.service.ts` | Cadre change-specific logic |
| `service-extension/service-extension.service.ts` | Extension-specific logic |
| `retirement/retirement.service.ts` | Retirement-specific logic |
| `resignation/resignation.service.ts` | Resignation-specific logic |
| `separation/separation.service.ts` | Termination/dismissal logic |

#### API Endpoints

**Base Endpoints (All Request Types):**
```
POST   /api/requests/:type          - Submit new request
GET    /api/requests/:type          - List requests (filtered by role)
GET    /api/requests/:type/:id      - Get request details
PATCH  /api/requests/:type/:id      - Update request (HRO only, PENDING/SENT_BACK)
DELETE /api/requests/:type/:id      - Delete request (HRO only, PENDING)
```

**Workflow Endpoints:**
```
POST   /api/requests/:type/:id/approve    - Approve request (approvers only)
POST   /api/requests/:type/:id/reject     - Reject request (approvers only)
POST   /api/requests/:type/:id/send-back  - Send back for rectification (approvers only)
POST   /api/requests/:type/:id/resubmit   - Resubmit sent-back request (HRO only)
```

#### Service Methods (Each Request Type)

```typescript
interface IRequestService {
  // CRUD Operations
  create(data: CreateRequestDto, user: User): Promise<Request>;
  findAll(filters: RequestFilters, user: User): Promise<Request[]>;
  findOne(id: string, user: User): Promise<Request>;
  update(id: string, data: UpdateRequestDto, user: User): Promise<Request>;
  delete(id: string, user: User): Promise<void>;

  // Workflow Actions
  approve(id: string, decisionData: ApproveDto, user: User): Promise<Request>;
  reject(id: string, rejectionData: RejectDto, user: User): Promise<Request>;
  sendBack(id: string, sendBackData: SendBackDto, user: User): Promise<Request>;
  resubmit(id: string, data: UpdateRequestDto, user: User): Promise<Request>;

  // Employee Record Updates (internal)
  updateEmployeeRecord(request: Request): Promise<Employee>;
}
```

---

### Task 3: Implement File Upload Handling with MinIO

**Priority:** Critical
**Estimated Effort:** 2 days
**Location:** `backend/src/upload/`

#### Deliverables

| File | Description |
|------|-------------|
| `upload.controller.ts` | File upload endpoints |
| `upload.service.ts` | MinIO integration, virus scanning |
| `upload.module.ts` | Upload module definition |
| `pipes/file-validation.pipe.ts` | Custom validation pipe |

#### Requirements

| Requirement | Specification |
|-------------|---------------|
| **File Format** | PDF only for documents, JPEG/PNG for profile images |
| **Max File Size** | 2MB for documents, 1MB for complaint attachments |
| **Storage** | MinIO object storage (S3-compatible) |
| **Virus Scanning** | Integration with ClamAV or similar |
| **Bucket Structure** | Separate buckets per document type |

#### API Endpoints

```
POST   /api/upload/request-documents    - Upload request supporting documents
POST   /api/upload/complaint-evidence   - Upload complaint attachments
POST   /api/upload/profile-images       - Upload employee profile images
POST   /api/upload/decision-letters     - Upload approval decision letters
GET    /api/upload/:bucket/:key         - Download/retrieve file
DELETE /api/upload/:bucket/:key         - Delete file
```

#### Bucket Organization

```
csms-documents/
├── confirmation-requests/
├── promotion-requests/
├── lwop-requests/
├── cadre-change-requests/
├── service-extension-requests/
├── retirement-requests/
├── resignation-requests/
├── separation-requests/
├── complaint-evidence/
└── decision-letters/

csms-profiles/
└── employee-photos/
```

---

### Task 4: Implement Notification System

**Priority:** High
**Estimated Effort:** 2 days
**Location:** `backend/src/notifications/`

#### Deliverables

| File | Description |
|------|-------------|
| `notifications.controller.ts` | Notification endpoints |
| `notifications.service.ts` | In-app + email notifications |
| `notifications.gateway.ts` | WebSocket for real-time notifications |
| `templates/email/*.hbs` | Email templates (Handlebars) |

#### Notification Triggers

| Event | Recipient | Type | Content |
|-------|-----------|------|---------|
| Request Submitted | Approver (HHRMD/HRMO/DO) | Email + In-app | New request awaiting review |
| Request Approved | HRO | Email + In-app | Request [ID] approved |
| Request Rejected | HRO | Email + In-app | Request [ID] rejected - see reason |
| Request Sent Back | HRO | Email + In-app | Request [ID] needs rectification |
| Request Resubmitted | Approver | Email + In-app | Request [ID] resubmitted |
| Complaint Submitted | DO/HHRMD | Email + In-app | New complaint [ID] submitted |
| Complaint Resolved | Employee | Email + In-app | Your complaint [ID] resolved |

#### Email Template Structure

```handlebars
<!-- templates/email/request-approved.hbs -->
Subject: [CSMS] Request Approved - {{requestType}} Request {{requestId}}

Dear {{recipientName}},

Your {{requestType}} request for {{employeeName}} has been APPROVED.

Request Details:
- Request ID: {{requestId}}
- Request Type: {{requestType}}
- Employee: {{employeeName}}
- Institution: {{institutionName}}
- Submitted Date: {{submissionDate}}
- Approved Date: {{approvalDate}}

Decision Letter: [Download PDF]

Please log in to CSMS to view full details:
https://csms.zanajira.go.tz

Regards,
CSMS Automated Notification System
```

#### API Endpoints

```
GET    /api/notifications             - Get user notifications
GET    /api/notifications/unread-count - Get unread count
PATCH  /api/notifications/:id/read    - Mark as read
PATCH  /api/notifications/read-all    - Mark all as read
DELETE /api/notifications/:id         - Delete notification
```

---

### Task 5: Implement Employee Status Transitions

**Priority:** Critical
**Estimated Effort:** 2 days
**Location:** `backend/src/employees/` (enhanced)

#### Deliverables

| File | Description |
|------|-------------|
| `employees/status-transitions.service.ts` | Status change logic |
| `employees/status-history.model.ts` | Track status changes |

#### Status Transition Rules

```
Employee Status Transitions:

"On Probation" → "Confirmed" (via Confirmation Approval)
"On Probation" → "Dismissed" (via Dismissal Approval)
"Confirmed" → "On LWOP" (via LWOP Approval)
"Confirmed" → "Retired" (via Retirement Approval)
"Confirmed" → "Resigned" (via Resignation Approval)
"Confirmed" → "Terminated" (via Termination Approval)
"Confirmed" → Cadre Updated (via Promotion/Cadre Change Approval)
"On LWOP" → "Confirmed" (upon LWOP period expiration - scheduled job)

[All status changes are one-way and irreversible]
```

#### Status Update Triggers

| Request Type | Status Change | Additional Updates |
|--------------|---------------|-------------------|
| Confirmation | On Probation → Confirmed | Set confirmationDate |
| Promotion | (No status change) | Update cadre, salaryScale |
| LWOP | Confirmed → On LWOP | Set lwopStartDate, lwopEndDate |
| Cadre Change | (No status change) | Update cadre, department |
| Service Extension | (No status change) | Update retirementDate |
| Retirement | Confirmed → Retired | Set retirementDate, retirementType |
| Resignation | Confirmed → Resigned | Set resignationDate |
| Termination | Confirmed → Terminated | Set terminationDate, reason |
| Dismissal | On Probation → Dismissed | Set dismissalDate, reason |

#### Implementation Pattern

```typescript
// In request service approve() method
async approve(requestId: string, userId: string) {
  const request = await this.getRequest(requestId);

  // Update request status
  await this.prisma.request.update({
    where: { id: requestId },
    data: {
      status: 'APPROVED',
      reviewedById: userId,
      decisionDate: new Date()
    }
  });

  // Update employee record based on request type
  await this.updateEmployeeRecord(request);

  // Send notifications
  await this.notifications.sendApprovalNotification(request);

  // Log audit
  await this.auditLog.log({ /* ... */ });
}
```

---

### Task 6: Create Request Module Frontend Pages

**Priority:** High
**Estimated Effort:** 5 days
**Location:** `frontend/app/(main)/requests/`

#### Deliverables

| Page | Description |
|------|-------------|
| `requests/page.tsx` | Enhanced listing with filters, status badges |
| `requests/[type]/new/page.tsx` | Dynamic new request form |
| `requests/[type]/[id]/page.tsx` | Request detail with timeline |
| `requests/[type]/[id]/review/page.tsx` | Approver review interface |
| `requests/pending/page.tsx` | Pending requests dashboard widget |
| `requests/my-requests/page.tsx` | HRO's submitted requests |

#### Form Components (Per Request Type)

Each request type needs a dedicated form component:

```
frontend/components/requests/
├── confirmation-request-form.tsx
├── promotion-request-form.tsx
├── lwop-request-form.tsx
├── cadre-change-request-form.tsx
├── service-extension-request-form.tsx
├── retirement-request-form.tsx
├── resignation-request-form.tsx
└── separation-request-form.tsx
```

#### Form Features

- Employee search/selection with autocomplete
- Auto-fill employee details (name, ZanID, payroll, institution)
- Document upload with preview
- Validation error display
- Draft save functionality
- Submit confirmation dialog

#### Review Interface Features

- Request summary card
- Employee profile summary
- Document viewer (PDF preview)
- Request history/timeline
- Action buttons (Approve, Reject, Send Back)
- Decision letter upload (for approval)
- Rejection reason textarea (min 20 chars)
- Send back instructions textarea

#### Status Badge Component

```tsx
// Reusable status badge with color coding
<StatusBadge status="PENDING" />     // Yellow
<StatusBadge status="APPROVED" />    // Green
<StatusBadge status="REJECTED" />    // Red
<StatusBadge status="SENT_BACK" />   // Orange
```

---

### Task 7: Implement Business Rule Validations

**Priority:** Critical
**Estimated Effort:** 3 days
**Location:** `backend/src/requests/validators/`

#### Deliverables

| File | Description |
|------|-------------|
| `confirmation.validator.ts` | Probation period validation |
| `promotion.validator.ts` | Cadre, service years, TCU verification |
| `lwop.validator.ts` | Duration limits, lifetime count, prohibited reasons |
| `cadre-change.validator.ts` | HHRMD authority, qualification alignment |
| `service-extension.validator.ts` | Extension limits, retirement date checks |
| `retirement.validator.ts` | Age eligibility, medical certificate |
| `resignation.validator.ts` | Notice period validation |
| `separation.validator.ts` | Status-type matching |

#### Business Rules Summary

| Rule ID | Request Type | Rule | Validation |
|---------|--------------|------|------------|
| BR-CONF-001 | Confirmation | Min 12 months probation | `today - employmentDate >= 365 days` |
| BR-PROM-001 | Promotion | Employee must be confirmed | `employee.status === 'Confirmed'` |
| BR-PROM-002 | Promotion | Min 2 years in current cadre | `yearsInCadre >= 2` |
| BR-PROM-003 | Promotion | TCU verification for foreign quals | `if studiedOutsideCountry, require TCU letter` |
| BR-LWOP-001 | LWOP | Duration 1 month - 3 years | `duration >= 1 month && duration <= 3 years` |
| BR-LWOP-002 | LWOP | Max 2 lifetime LWOPs | `count(LWOP history) < 2` |
| BR-LWOP-003 | LWOP | Prohibited reasons check | Manual verification by approver |
| BR-CADR-001 | Cadre Change | HHRMD-only approval | `if user.role !== 'HHRMD', deny` |
| BR-SEXT-001 | Service Ext | Max 2 lifetime extensions | `count(extension history) < 2` |
| BR-SEXT-002 | Service Ext | 6 months - 3 years | `extension >= 6 months && <= 3 years` |
| BR-RESN-001 | Resignation | 3-month notice required | `effectiveDate - submissionDate >= 90 days` |
| BR-RESN-002 | Resignation | 24-hour needs payment proof | `if noticeType === '24-hour', require payment proof` |
| BR-TERM-001 | Termination | Type matches status | `if Confirmed → Termination, if Probation → Dismissal` |

#### Validator Pattern

```typescript
// Example: confirmation.validator.ts
@Injectable()
export class ConfirmationValidator {
  constructor(private prisma: PrismaService) {}

  async validate(employeeId: string): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { institution: true }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.status !== 'On Probation') {
      throw new BadRequestException(
        `Employee status is "${employee.status}". Only "On Probation" employees can be confirmed.`
      );
    }

    const probationPeriod = differenceInMonths(new Date(), employee.employmentDate);
    if (probationPeriod < 12) {
      throw new BadRequestException(
        `Employee has only completed ${probationPeriod} months. Minimum 12 months required.`
      );
    }

    const existingRequest = await this.prisma.confirmationRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'SENT_BACK'] }
      }
    });

    if (existingRequest) {
      throw new BadRequestException(
        `Employee already has pending confirmation request: ${existingRequest.request.id}`
      );
    }
  }
}
```

---

### Task 8: Implement Audit Logging Service

**Priority:** High
**Estimated Effort:** 2 days
**Location:** `backend/src/audit-logs/`

#### Deliverables

| File | Description |
|------|-------------|
| `audit-logs.controller.ts` | Audit log endpoints |
| `audit-logs.service.ts` | Logging and retrieval |
| `decorators/audit.decorator.ts` | Method decorator for auto-logging |
| `interceptors/audit.interceptor.ts` | Request interceptor for auto-logging |

#### Audit Log Fields

```typescript
interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'LOGIN' | 'LOGOUT';
  entityType: string;  // 'Employee', 'Request', 'User', etc.
  entityId: string;
  userId: string;
  changes?: Record<string, { before: any; after: any }>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

#### API Endpoints

```
GET /api/audit-logs                    - List audit logs (admin/approvers)
GET /api/audit-logs/:id                - Get specific log entry
GET /api/audit-logs/entity/:type/:id   - Get logs for specific entity
GET /api/audit-logs/user/:userId       - Get logs for specific user
GET /api/audit-logs/export             - Export logs (CSV/PDF)
```

#### Retention Policy

- **Audit logs:** 10 years minimum (immutable)
- **Implementation:** Soft delete only, no hard delete for audit logs
- **Compliance:** Monthly compliance reports auto-generated

#### Usage Pattern

```typescript
// Manual logging
await this.auditLog.log({
  action: 'APPROVE',
  entityType: 'ConfirmationRequest',
  entityId: requestId,
  userId: user.id,
  changes: {
    status: { before: 'PENDING', after: 'APPROVED' }
  },
  ipAddress: request.ip
});

// Decorator usage
@Audit({ entityType: 'Request', action: 'CREATE' })
@Post()
async create(@Body() dto: CreateRequestDto, @User() user: User) {
  return this.requestsService.create(dto, user);
}
```

---

### Task 9: Implement Reports Module with PDF Export

**Priority:** Medium
**Estimated Effort:** 4 days
**Location:** `backend/src/reports/`, `frontend/app/(main)/reports/`

#### Deliverables

| File | Description |
|------|-------------|
| `reports/reports.controller.ts` | Enhanced reports endpoints |
| `reports/reports.service.ts` | Report generation logic |
| `reports/templates/*.hbs` | Report templates (Handlebars + PDF) |
| `reports/generators/pdf.generator.ts` | PDF generation utility |
| `reports/generators/excel.generator.ts` | Excel generation utility |

#### Standard Reports (10 Total)

| # | Report Name | Description | Primary Users |
|---|-------------|-------------|---------------|
| 1 | **Employee Profile Report** | Complete employee records | All roles (filtered) |
| 2 | **Confirmation Status Report** | Employees on probation, confirmation dates | HHRMD, HRMO, PO, CSCS |
| 3 | **Promotion History Report** | All promotions by type, date, institution | HHRMD, HRMO, PO, CSCS |
| 4 | **LWOP Summary Report** | Active and historical LWOP periods | HHRMD, HRMO, PO, CSCS |
| 5 | **Retirement Pipeline Report** | Employees nearing retirement (5-year projection) | HHRMD, HRMO, PO, CSCS |
| 6 | **Complaint Status Report** | All complaints by category and status | DO, HHRMD, CSCS |
| 7 | **Pending Requests Report** | All pending requests across modules | All CSC internal users |
| 8 | **Institutional Summary Report** | Employee count and status by institution | All roles (filtered) |
| 9 | **Termination/Dismissal Report** | All separations with reasons | DO, HHRMD, CSCS |
| 10 | **Audit Activity Report** | User actions and system changes | ADMIN, CSCS, HHRMD |

#### Report Features

| Feature | Specification |
|---------|---------------|
| **Export Formats** | PDF (formatted), Excel (data analysis) |
| **Language Support** | English and Swahili (user-selectable) |
| **Filters** | Date range, institution, status, employee status |
| **Scheduling** | On-demand + scheduled email distribution |
| **Frequency** | Daily, Weekly, Monthly options |

#### API Endpoints

```
GET  /api/reports/:type              - Generate report (JSON)
POST /api/reports/:type/export       - Export report (PDF/Excel)
POST /api/reports/:type/schedule     - Schedule recurring report
GET  /api/reports/scheduled          - List scheduled reports
```

#### PDF Generation (using pdfmake or puppeteer)

```typescript
// Example report generation
async generateConfirmationStatusReport(filters: ReportFilters): Promise<Buffer> {
  const data = await this.getConfirmationData(filters);

  const docDefinition = {
    content: [
      { text: 'Confirmation Status Report', style: 'header' },
      { text: `Generated: ${new Date().toLocaleString()}`, style: 'subheader' },
      this.buildDataTable(data),
      this.buildSummaryTable(data)
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 12, color: '#666', margin: [0, 0, 0, 20] }
    }
  };

  return pdfmake.createPdf(docDefinition);
}
```

---

### Task 10: Enhance Complaints Module with AI Rewriting

**Priority:** Medium
**Estimated Effort:** 2 days
**Location:** `backend/src/complaints/`, `frontend/app/(main)/complaints/`

#### Deliverables

| File | Description |
|------|-------------|
| `complaints/complaints.service.ts` | Enhanced with AI rewriting |
| `complaints/ai-rewrite.service.ts` | Google Genkit integration |
| `complaints/employee-portal.controller.ts` | Employee-specific endpoints |
| `frontend/app/(main)/employee-portal/` | Employee complaint portal |

#### Employee Authentication

Employees authenticate with three identifiers:
- ZanID (9 digits)
- Payroll Number (alphanumeric)
- ZSSF Number (alphanumeric)

```typescript
// Employee login DTO
class EmployeeLoginDto {
  @IsString()
  zanId: string;  // Exactly 9 digits

  @IsString()
  payrollNumber: string;

  @IsString()
  zssfNumber: string;
}
```

#### AI Rewriting Flow

```
[Employee writes complaint]
         ↓
[Submit complaint]
         ↓
[Google Genkit analyzes text]
         ↓
{Poorly formatted?}
    /          \
  YES          NO
   ↓            ↓
[Rewrite for   [Keep original]
 clarity]
   ↓
[Show suggestion to employee]
         ↓
{Employee accepts?}
    /          \
  YES          NO
   ↓            ↓
[Use rewritten]  [Use original]
   ↓
[Submit to system]
```

#### AI Enhancement Rules

- Maintain factual accuracy (don't change facts)
- Improve clarity and structure
- Add proper paragraph breaks
- Fix grammar and spelling
- Employee can review and accept/decline
- Original text always retained in audit log

#### Complaint Categories

| Category | Description | Assigned Officer |
|----------|-------------|------------------|
| **Unconfirmed Employees** | Probation-related complaints | DO/HHRMD |
| **Job-Related** | Work conditions, assignments, disputes | DO/HHRMD |
| **Other** | Miscellaneous concerns | DO/HHRMD |

#### Employee Portal Pages

```
frontend/app/(main)/employee-portal/
├── login/page.tsx        - Employee authentication
├── dashboard/page.tsx    - Employee dashboard
├── complaints/
│   ├── page.tsx         - My complaints list
│   ├── new/page.tsx     - Submit new complaint
│   └── [id]/page.tsx    - View complaint details
└── profile/page.tsx      - View own profile (read-only)
```

---

## 5. Business Rules Summary

### 5.1 System-Wide Rules

| Rule | Description |
|------|-------------|
| **BR-001** | Request ID uniqueness with format: `[TYPE]-[INST]-YYYY-NNNNNN` |
| **BR-002** | All documents must be PDF, max 2MB |
| **BR-003** | Valid status transitions: PENDING → APPROVED/REJECTED/SENT_BACK |
| **BR-004** | Review stage tracking: Submitted → Under Review → Decision Made |
| **BR-005** | Approval authority by role (see matrix below) |
| **BR-006** | Institutional data isolation for HRO/HRRP |
| **BR-007** | Mandatory fields: Employee ID, Institution, Documents, Submitter |
| **BR-008** | Automatic notifications on all status changes |
| **BR-009** | Complete audit logging for all actions |
| **BR-010** | Data retention: 10 years for audit logs, approved requests |

### 5.2 Process-Specific Rules

See Task 7 for detailed business rules per request type.

---

## 6. Approver Authority Matrix

| Request Type | HHRMD | HRMO | DO | HRO |
|--------------|-------|------|----|-----|
| Confirmation | ✓ | ✓ | ✗ | Submit only |
| Promotion | ✓ | ✓ | ✗ | Submit only |
| LWOP | ✓ | ✓ | ✗ | Submit only |
| Cadre Change | ✓ Only | ✗ | ✗ | Submit only |
| Service Extension | ✓ | ✓ | ✗ | Submit only |
| Retirement | ✓ | ✓ | ✗ | Submit only |
| Resignation | ✓ | ✓ | ✗ | Submit only |
| Termination/Dismissal | ✓ | ✗ | ✓ | Submit only |
| Complaints | ✓ | ✗ | ✓ | N/A |

**Notes:**
- HRO can only submit requests, not approve
- Cadre Change requires HHRMD approval only (HRMO cannot approve)
- Disciplinary matters (Termination, Dismissal, Complaints) handled by DO or HHRMD
- HRMO handles standard HR requests only

---

## 7. Technical Architecture

### 7.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, Tailwind CSS, Radix UI, Lucide React |
| **Backend** | Nest.js 10, Prisma ORM, JWT Authentication |
| **Database** | PostgreSQL 15 |
| **Object Storage** | MinIO (S3-compatible) |
| **Deployment** | Ubuntu Server + aaPanel + Nginx |

### 7.2 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web Browser                          │
│            (Desktop/Tablet Responsive)                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx Reverse Proxy                        │
│                  (Port 80/443)                          │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌───────────────────────┐   ┌───────────────────────┐
│   Next.js 16 Frontend │   │   Nest.js 10 Backend  │
│   (Port 3000)         │   │   (Port 3001)         │
└───────────┬───────────┘   └───────────┬───────────┘
            │                           │
            ▼                           ▼
┌───────────────────────┐   ┌─────────────────────────────┐
│  PostgreSQL Database  │   │    MinIO Object Storage     │
│      (Port 5432)      │   │       (Port 9001)           │
└───────────────────────┘   └─────────────────────────────┘
```

### 7.3 Database Models

Core models involved in request management:

- `Request` (base table with common fields)
- `ConfirmationRequest`
- `PromotionRequest`
- `LwopRequest`
- `CadreChangeRequest`
- `RetirementRequest`
- `ResignationRequest`
- `ServiceExtensionRequest`
- `SeparationRequest`
- `Employee`
- `User`
- `Institution`
- `Complaint`
- `AuditLog`
- `Notification`

See `backend/prisma/schema.prisma` for complete schema.

---

## 8. Timeline and Milestones

### 8.1 Phase Breakdown

| Phase | Duration | Tasks | Deliverables |
|-------|----------|-------|--------------|
| **Phase 1: Foundation** | Week 1-2 | Tasks 1, 3, 7, 8 | DTOs, file upload, validators, audit logging |
| **Phase 2: Core Logic** | Week 2-4 | Tasks 2, 5 | Controllers, services, status transitions |
| **Phase 3: Frontend** | Week 4-6 | Task 6 | All request module pages |
| **Phase 4: Enhanced Features** | Week 6-7 | Tasks 4, 9, 10 | Notifications, reports, AI complaints |
| **Phase 5: Testing** | Week 8 | All | Integration testing, bug fixes |

### 8.2 Milestone Schedule

| Milestone | Target Date | Success Criteria |
|-----------|-------------|-----------------|
| M1: DTOs Complete | Week 1 | All 8 request type DTOs with validation |
| M2: Upload Working | Week 1 | MinIO integration, file validation |
| M3: Validators Complete | Week 2 | All business rules implemented |
| M4: Services Complete | Week 3 | All CRUD + workflow endpoints functional |
| M5: Status Transitions | Week 4 | Employee records update correctly |
| M6: Frontend Complete | Week 5 | All request pages deployed |
| M7: Notifications | Week 6 | Email + in-app working |
| M8: Reports | Week 7 | 10 standard reports with export |
| M9: AI Complaints | Week 7 | Genkit integration complete |
| M10: UAT Ready | Week 8 | All features tested, ready for UAT |

### 8.3 Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MinIO integration issues | Medium | High | Test early, have S3 fallback |
| Business rule complexity | High | Medium | Incremental implementation, thorough testing |
| Frontend page overload | Medium | Medium | Reusable components, code sharing |
| AI integration delays | Low | Low | Make AI optional, launch without if needed |
| Performance with 50K+ records | Medium | High | Implement pagination, indexing early |

---

## Appendix A: File Structure

### Backend Structure

```
backend/src/
├── auth/
├── users/
├── employees/
│   ├── employees.controller.ts
│   ├── employees.service.ts
│   ├── employees.module.ts
│   ├── dto/
│   │   ├── create-employee.dto.ts
│   │   └── update-employee.dto.ts
│   └── status-transitions.service.ts (new)
├── institutions/
├── requests/
│   ├── requests.controller.ts
│   ├── requests.service.ts
│   ├── requests.module.ts
│   ├── dto/
│   │   ├── base-request.dto.ts
│   │   ├── create-confirmation-request.dto.ts
│   │   ├── create-promotion-request.dto.ts
│   │   ├── create-lwop-request.dto.ts
│   │   ├── create-cadre-change-request.dto.ts
│   │   ├── create-service-extension-request.dto.ts
│   │   ├── create-retirement-request.dto.ts
│   │   ├── create-resignation-request.dto.ts
│   │   └── create-separation-request.dto.ts
│   ├── validators/
│   │   ├── confirmation.validator.ts
│   │   ├── promotion.validator.ts
│   │   ├── lwop.validator.ts
│   │   ├── cadre-change.validator.ts
│   │   ├── service-extension.validator.ts
│   │   ├── retirement.validator.ts
│   │   ├── resignation.validator.ts
│   │   └── separation.validator.ts
│   └── services/
│       ├── confirmation.service.ts
│       ├── promotion.service.ts
│       ├── lwop.service.ts
│       ├── cadre-change.service.ts
│       ├── service-extension.service.ts
│       ├── retirement.service.ts
│       ├── resignation.service.ts
│       └── separation.service.ts
├── complaints/
├── notifications/
├── audit-logs/
├── reports/
├── upload/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── strategies/
└── prisma/
    └── prisma.service.ts
```

### Frontend Structure

```
frontend/
├── app/
│   ├── (auth)/
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── requests/
│   │   │   ├── page.tsx
│   │   │   ├── pending/
│   │   │   ├── my-requests/
│   │   │   └── [type]/
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           ├── page.tsx
│   │   │           └── review/
│   │   │               └── page.tsx
│   │   ├── complaints/
│   │   ├── reports/
│   │   └── admin/
│   └── (main)/employee-portal/ (new)
│       ├── login/
│       ├── dashboard/
│       ├── complaints/
│       └── profile/
├── components/
│   ├── Sidebar.tsx
│   ├── requests/
│   │   ├── confirmation-request-form.tsx
│   │   ├── promotion-request-form.tsx
│   │   ├── lwop-request-form.tsx
│   │   ├── cadre-change-request-form.tsx
│   │   ├── service-extension-request-form.tsx
│   │   ├── retirement-request-form.tsx
│   │   ├── resignation-request-form.tsx
│   │   └── separation-request-form.tsx
│   ├── common/
│   │   ├── status-badge.tsx
│   │   ├── document-upload.tsx
│   │   ├── employee-search.tsx
│   │   └── request-timeline.tsx
│   └── reports/
├── services/
│   ├── requestService.ts
│   └── ...
├── hooks/
└── types/
```

---

## Appendix B: Reference Documents

1. Inception_Report.md - Project overview and scope
2. System_Requirements_Specification.md - Detailed functional/non-functional requirements
3. CSMS_User_Roles_and_Access_Guide.md - User role definitions and permissions
4. Business_Process_Document.md - Complete workflow specifications

---

**Document End**

*This implementation plan is confidential and proprietary to the Civil Service Commission of Zanzibar.*
