# SYSTEM REQUIREMENTS SPECIFICATION (SRS)
## CIVIL SERVICE MANAGEMENT SYSTEM (CSMS)

---

## Document Control

| Item | Details |
|------|---------|
| **Document Title** | System Requirements Specification - Civil Service Management System |
| **Project Name** | Civil Service Management System (CSMS) |
| **Version** | 2.0 |
| **Date Prepared** | March 24, 2026 |
| **Prepared By** | Project Team |
| **Reviewed By** | ___________________ |
| **Approved By** | ___________________ |
| **Status** | Draft for Approval |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Appendices](#appendices)

---

## 1. Introduction

### 1.1 Purpose

This System Requirements Specification (SRS) document provides a complete description of all functional and non-functional requirements for the Civil Service Management System (CSMS). This document is intended for:
- **Development Team:** To understand system requirements and build accordingly
- **Testers:** To develop comprehensive test plans and test cases
- **Project Managers:** To plan, track, and manage project progress
- **Stakeholders:** To validate requirements meet business needs
- **Maintenance Team:** To understand system functionality for future support

### 1.2 Scope

**Product Name:** Civil Service Management System (CSMS)

**Product Description:** CSMS is a comprehensive web-based HR management system designed to automate and streamline HR processes for the Civil Service Commission of Zanzibar, managing employees across all government ministries and institutions.

**Key Capabilities:**
- Employee profile management with secure document storage
- Employment confirmation workflow automation (probation to confirmed status)
- Leave Without Pay (LWOP) request processing with validation
- Promotion management (education-based and performance-based)
- Change of cadre request processing
- Service extension management for employees nearing retirement
- Retirement processing (voluntary, compulsory, illness-based)
- Resignation request handling with notice period management
- Termination and dismissal workflow management
- Employee complaint management and resolution
- Comprehensive reporting and analytics (10+ report types)
- Role-based access control with institutional data isolation
- Complete audit trail for compliance and security
- Integration capability with external HRIMS system

**Benefits:**
- 70% reduction in HR request processing time
- Complete elimination of paper-based processes
- Enhanced transparency and accountability
- Real-time request status tracking for all stakeholders
- Improved data security and centralized document management
- Strategic workforce planning through advanced analytics
- Full compliance with civil service regulations
- Reduced administrative overhead and errors

### 1.3 Definitions, Acronyms, and Abbreviations

**Key Terms:**
| Term | Definition |
|------|------------|
| **Ardhilhali** | Swahili term for employment certificate document |
| **Cadre** | Job category or classification within civil service structure |
| **Confirmed Employee** | Employee who has successfully completed probation period (minimum 12 months) |
| **Dismissal** | Termination of employment for probationary employees |
| **Institution** | Government ministry, department, or agency |
| **LWOP** | Leave Without Pay - unpaid leave period (1 month to 3 years) |
| **On Probation** | Employee status during initial evaluation period (12-18 months) |
| **Probation Period** | Initial employment period for performance evaluation |
| **Termination** | Separation of confirmed employee due to disciplinary reasons |
| **Vote Number** | Budget allocation identifier for government institution |

**Acronyms:**
| Acronym | Full Form |
|---------|-----------|
| API | Application Programming Interface |
| CSMS | Civil Service Management System |
| CSC | Civil Service Commission |
| CRUD | Create, Read, Update, Delete |
| DO | Disciplinary Officer |
| EMP | Employee |
| HHRMD | Head of HR Management Division |
| HRO | HR Officer |
| HRRP | HR Responsible Personnel |
| HRMO | HR Management Officer |
| HRIMS | HR Information Management System |
| JWT | JSON Web Token |
| LWOP | Leave Without Pay |
| ORM | Object-Relational Mapping |
| OTP | One-Time Password |
| PO | Planning Officer |
| RBAC | Role-Based Access Control |
| SLA | Service Level Agreement |
| SRS | System Requirements Specification |
| TCU | Tanzania Commission for Universities |
| UAT | User Acceptance Testing |
| ZanID | Zanzibar Identification Number |
| ZSSF | Zanzibar Social Security Fund |

### 1.4 References

1. Inception Report - CSMS Project, Version 1.0, December 25, 2025
2. Ultimate Document for All Requirements of CSMS (Source Document)
3. User Acceptance Test Document - CSMS
4. Civil Service Commission Regulations (Zanzibar)
5. Data Privacy and Protection Act
6. Government IT Security Standards
7. Next.js 16 Documentation
8. Nest.js 10 Documentation
9. PostgreSQL 15 Documentation
10. Prisma ORM Documentation
11. MinIO Object Storage Documentation

---

## 2. Overall Description

### 2.1 Product Perspective

CSMS is a new, decoupled web-based system designed to replace manual paper-based HR processes at the Civil Service Commission of Zanzibar. The system will manage HR operations for 50,000+ employees across all government institutions.

**System Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                External Users (9 User Roles)                │
│  HRO | HHRMD | HRMO | DO | EMP | PO | CSCS | HRRP | ADMIN  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (Port 443)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Nginx Reverse Proxy Server                     │
│                  (Port 80/443)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌───────────────────────┐   ┌───────────────────────┐
│   Next.js 16 Frontend       │   Nest.js 10 Backend │
│   (Port 3000)              │   (Port 3001)         │
│                             │
│  ┌────────────────────────┐ │  ┌───────────────────┐
│  │ React Components       │ │  │ Controllers       │
│  │ Tailwind CSS           │ │  │ Middleware        │
│  │ Radix UI               │ │  │ Services          │
│  │ Lucide React Icons     │ │  │ Repositories      │
│  │ React Query            │ │  │ Prisma ORM        │
│  └────────────────────────┘ │  └───────────────────┘
└───────────┬─────────────────┴───────────┬───────────┘
            │                             │
            ▼                             ▼
┌───────────────────────┐   ┌─────────────────────────────────┐
│  PostgreSQL 15        │   │    MinIO Object Storage         │
│  Database Server      │   │    (S3-Compatible)              │
│  (Port 5432)          │   │    (Port 9001)                  │
│                       │   │                                 │
│  - Employee Records   │   │  - Profile Images (JPG/PNG)     │
│  - Request Data       │   │  - Employee Documents (PDF)     │
│  - User Accounts      │   │  - Certificates (PDF)           │
│  - Audit Logs         │   │  - Request Attachments (PDF)    │
│  - Institutions       │   │  - Complaint Evidence           │
│  - Metadata           │   │  - Decision Letters (PDF)       │
└───────────────────────┘   └─────────────────────────────────┘
            │
            ▼
┌───────────────────────┐
│  External Systems     │
│  (Future Integration) │
│  - HRIMS              │
│  - Pension System     │
│  - TCU Verification   │
└───────────────────────┘
```

**Key System Boundaries:**
- Web-based access only (no mobile app)
- Supports desktop and tablet devices
- Internal government network + internet access
- Integration points defined for future expansion
- Centralized data storage and management

### 2.2 Product Functions

The system provides the following major functional areas:
- User Management & Security
- Employee Information Management
- HR Request Processing (8 Request Types)
- Complaint Management
- Workflow Management
- Reporting & Analytics
- Audit & Compliance
- System Administration

### 2.3 User Classes and Characteristics

| User Class | Count | Description | Technical Expertise | Usage Frequency | Critical Functions |
|------------|-------|-------------|---------------------|-----------------|-------------------|
| **HRO** (HR Officer) | 50-100 | Institution-level HR personnel who submit requests on behalf of employees | Basic | Daily | Submit all HR requests (except complaints), view institutional employee data, track request status |
| **HHRMD** (Head of HR Management Division) | 2-3 | Senior approver at CSC with authority over all HR and disciplinary matters | Intermediate | Daily | Approve/reject all request types, view all institutional data, generate reports, executive oversight |
| **HRMO** (HR Management Officer) | 5-10 | CSC officers who approve HR requests (excluding disciplinary matters) | Intermediate | Daily | Approve/reject HR requests (confirmation, promotion, LWOP, etc.), view all HR data, generate reports |
| **DO** (Disciplinary Officer) | 2-3 | CSC officers handling complaints and disciplinary actions | Intermediate | As needed | Approve/reject complaints, termination, dismissal requests; resolve employee grievances |
| **Employee** (EMP) | 50,000+ | Government employees who can submit complaints and view their own data | Basic | Occasionally | Submit complaints, view personal profile, track complaint status |
| **PO** (Planning Officer) | 3-5 | CSC planning officers using reports for strategic workforce planning | Intermediate-Advanced | Weekly | View and generate all reports, access analytics dashboards, export data for analysis |
| **CSCS** (CSC Secretary) | 1 | Highest executive authority with oversight of all commission activities | Intermediate | Weekly | Executive dashboard access, view all activities, download all reports, monitor institutional performance |
| **HRRP** (HR Responsible Personnel) | 50-100 | Institutional supervisors who monitor HR activities within their institution | Intermediate | Daily | Monitor institutional HR activities, view institutional reports, track request processing status |
| **ADMIN** (Administrator) | 2-3 | System administrators managing technical operations and user accounts | Advanced | Daily | User management, system configuration, institution setup, audit log review, troubleshooting |

### 2.4 Operating Environment

#### 2.4.1 Server Environment

**Operating System:**
- Ubuntu Server 24.04 LTS
- 64-bit architecture
- Kernel 5.15 or higher

**Control Panel:**
- aaPanel (latest version)
- Web-based server management

**Web Server:**
- Nginx 1.24 or higher
- Reverse proxy configuration
- SSL/TLS termination

**Frontend Server:**
- Node.js 18 LTS or higher
- Next.js 16 application
- PM2 process manager
- Port 3000 (internal)

**Backend Server:**
- Node.js 18 LTS or higher
- Nest.js 10 application
- PM2 process manager
- Port 3001 (internal)

**Database Server:**
- PostgreSQL 15.x
- Port 5432 (internal only)
- UTF-8 character encoding
- Africa/Dar_es_Salaam timezone

**Object Storage:**
- MinIO (latest stable version)
- S3-compatible API
- Port 9001 (internal only)
- Bucket-based organization

**Installation Directory:**
- Frontend: `/www/wwwroot/frontend`
- Backend: `/www/wwwroot/backend`
- Logs: `/www/wwwroot/logs`
- Uploads: Managed by MinIO

**System Requirements:**
- Minimum 16GB RAM (32GB recommended)
- Minimum 8 CPU cores (16 cores recommended)
- Minimum 1TB storage (2TB recommended)
- SSD for database (recommended)
- Redundant power supply
- 1 Gbps network interface

#### 2.4.2 Client Environment

**Device Types:**
- Desktop computers
- Laptop computers
- Tablet devices (10" or larger)
- Mobile devices not supported

**Operating Systems:**
- Windows 10 or higher
- macOS 10.15 (Catalina) or higher
- Linux (Ubuntu 20.04 or higher)

**Web Browsers (Latest Versions):**
- Google Chrome 90+
- Mozilla Firefox 88+
- Microsoft Edge 90+
- Safari 14+ (macOS only)

**Display Requirements:**
- Minimum resolution: 1024x768
- Recommended: 1920x1080 (Full HD)
- Color depth: 24-bit or higher

**Network Requirements:**
- Internet connection: Minimum 2 Mbps
- Recommended: 10 Mbps or higher
- Latency: <200ms for optimal experience

**Additional Software:**
- PDF Reader (Adobe Acrobat Reader, browser built-in)
- Modern JavaScript-enabled browser
- Cookies and local storage enabled

#### 2.4.3 Network Environment

**Ports:**
- 80 (HTTP - redirects to HTTPS)
- 443 (HTTPS - public access)
- 3000 (Frontend - internal only)
- 3001 (Backend - internal only)
- 5432 (PostgreSQL - internal only)
- 9001 (MinIO - internal only)
- 22 (SSH - admin access only)

**Protocols:**
- HTTPS (TLS 1.2 or higher)
- HTTP/2 supported
- WebSocket (for real-time features)

**Security:**
- Firewall configuration
- VPN access for remote admin (optional)
- IP whitelisting for admin functions
- DDoS protection (recommended)

### 2.5 Design and Implementation Constraints

#### 2.5.1 Technology Stack Constraints

**Mandatory Technologies:**
- **Frontend Framework:** Next.js 16 (required)
- **Backend Framework:** Nest.js 10 (required)
- **Database:** PostgreSQL 15 (required)
- **ORM:** Prisma (required)
- **Object Storage:** MinIO (required)
- **Styling:** Tailwind CSS (required)
- **UI Components:** Radix UI (required)
- **Icons:** Lucide React (required)

**Prohibited Technologies:**
- No other frontend frameworks (React standalone, Vue, Angular)
- No other backend frameworks (Express.js, Koa)
- No other databases (MySQL, MongoDB, SQL Server)
- No other ORMs (TypeORM, Sequelize)
- No mobile framework (React Native, Flutter)
- No containerization (Docker)

#### 2.5.2 Deployment Constraints

- **Ports:** Frontend (3000), Backend (3001), PostgreSQL (5432), MinIO (9001)
- **Installation Path:** `/www/wwwroot/`
- **Control Panel:** Must work with aaPanel
- **Web Server:** Nginx reverse proxy required
- **Platform:** Ubuntu Server only (no Windows)

#### 2.5.3 File Handling Constraints

**Document Uploads:**
- **File Format:** PDF only (no Word, Excel, images as documents)
- **Profile Images:** JPEG/PNG only
- **Maximum File Size:** 2MB per file (1MB for complaint attachments)
- **Virus Scanning:** Required before storage
- **Storage:** MinIO object storage (no local file system)

#### 2.5.4 Regulatory Constraints

**Compliance Requirements:**
- Civil Service Commission Regulations (Zanzibar)
- Data Privacy and Protection Act
- Government IT Security Standards
- Financial Management Regulations
- Public Service Act

**Data Retention:**
- Audit logs: 10 years minimum
- Employee records: Indefinite (even after separation)
- Request records: 10 years minimum
- Retirement records: 10 years minimum
- Complaint records: 10 years minimum

**Language Support:**
- Must support English and Swahili (bilingual)
- All user-facing content must be translatable
- Reports must be available in both languages

---

## 3. System Features

### 3.1 Authentication & Authorization Module

**Priority:** Critical
**Description:** Secure user authentication and comprehensive role-based authorization system

#### FR1.01: User Login with Username and Password
- Secure authentication using username and password credentials
- Account lockout after 5 failed attempts (15-minute lockout)
- Session management with 10-minute inactivity timeout

#### FR1.02: Password Recovery via Email OTP
- Password recovery mechanism using one-time password sent to registered email
- OTP valid for 60 minutes
- One active OTP per user at any time

#### FR1.03: Strong Password Policy
- Minimum 8 characters, mixed case, number, special character
- Cannot contain username or name
- Cannot be common password (top 1000 list)

#### FR1.04: Session Management and Auto-Logout
- JWT token-based session management
- httpOnly cookie storage (prevents XSS)
- Auto-logout after 10 minutes of inactivity
- Inactivity warning at 9 minutes

#### FR1.05: User Account Management
- Complete user lifecycle management (create, edit, activate, deactivate, delete)
- Role assignment and management
- Password reset capabilities
- Account unlock functionality

#### FR1.06: Role-Based Access Control (RBAC)
- Role-based resource access with institutional data isolation
- 9 distinct user roles with specific permissions
- Function-level access control
- Data filters based on user role

### 3.2 Dashboard Module

**Priority:** High
**Description:** Role-based personalized dashboard providing at-a-glance information and quick access to common functions

#### FR2.01: Personalized Role-Based Dashboard
- Display personalized dashboard content based on user's role
- Widgets showing pending requests, recent activities, employee summaries
- Quick access buttons to common functions

#### FR2.02: Real-Time Request Counts
- Display real-time counts of pending requests per category with visual indicators
- Color-coded by urgency (green/yellow/orange/red)
- Click to navigate to filtered request list

#### FR2.03: Quick Access Links
- Role-based quick access links to commonly used modules
- Primary actions (large buttons) for most frequent functions
- Secondary actions (dropdown menu) for less frequent but important functions

#### FR2.04: Urgent Alerts and SLA Notifications
- Display urgent alerts for pending actions nearing or exceeding SLA deadlines
- Critical alerts (red) for requests pending >7 days
- Warning alerts (orange) for requests pending 5-7 days
- Email notifications for urgent requests

---

## 4. External Interface Requirements

### 4.1 User Interfaces

**General UI Requirements:**
- Clean, professional design
- Consistent navigation
- Responsive (desktop 1024px+, tablet 768-1023px)
- Bilingual toggle (English/Swahili)
- Accessibility: WCAG 2.1 Level AA
- Tailwind CSS + Radix UI components
- Lucide React icons

**Key Screens:**
- Login Screen (username/password)
- Employee Login (ZanID/Payroll/ZSSF)
- Role-specific Dashboards
- Employee Profile Screen
- Request Forms (all types)
- Request Review Screens
- Reports Interface
- Audit Log Viewer

### 4.2 Hardware Interfaces

**Server:**
- Ubuntu 24 LTS, 16GB RAM min, 8 CPU cores min
- 1TB storage min, 1Gbps network

**Client:**
- 4GB RAM min, 1024x768 display min
- 2 Mbps internet min

### 4.3 Software Interfaces

**Database:** PostgreSQL 15 via Prisma ORM, port 5432, UTF-8, pooling max 20 connections

**Object Storage:** MinIO S3-API, port 9001, bucket structure for document types

**Email Service:** SMTP/TLS, port 587, HTML templates for notifications

**External Systems (Future):**
- HRIMS: RESTful API, JSON, OAuth 2.0
- Pension System: File or API based
- TCU Verification: API endpoint (future)

### 4.4 Communication Interfaces

**Protocols:** HTTPS (TLS 1.2+), HTTP/2, WebSocket (optional)

**Data Formats:** JSON (APIs), Multipart (uploads), PDF (documents)

**API Standards:** RESTful, rate limiting 100 req/min per user

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| Requirement | Target | Priority |
|------------|--------|----------|
| Authentication Availability | 99.9% uptime | Critical |
| Login Response Time | <1.5s (95th percentile) | High |
| Dashboard Load Time | <5s | High |
| Search Results | <1s (<10K records) | High |
| System Scalability | 50,000+ employees | Critical |
| Report Generation | <30s (10K+ records) | Medium |

### 5.2 Security Requirements

| Requirement | Implementation | Priority |
|------------|----------------|----------|
| Account Lockout | 5 failed attempts, 15 min lockout | Critical |
| OTP Security | Cryptographically random, 60 min expiry | High |
| Data Encryption | AES-256 for documents at rest | Critical |
| RBAC | JWT with role claims, Nest.js guards | Critical |
| Immutable Audit Logs | Cryptographic signing, write-only | Critical |
| Audit Retention | 10 years minimum | High |

### 5.3 Usability Requirements

| Requirement | Target | Priority |
|------------|--------|----------|
| Intuitive UI | Max 1 hour training | High |
| Error Handling | Clear validation messages | High |
| Bilingual Support | English/Swahili toggle | High |
| Responsive Design | Desktop + Tablet | Medium |

### 5.4 Availability and Reliability

| Requirement | Target | Priority |
|------------|--------|----------|
| System Availability | 99.5% (business hours) | High |
| Backup and Recovery | RTO: 4 hours, RPO: 24 hours | Critical |
| Error Recovery | Graceful handling, user-friendly messages | High |

### 5.5 Data Retention and Compliance

| Data Type | Retention Period | Priority |
|-----------|------------------|----------|
| LWOP Records | 5 years post-retirement | Medium |
| Termination Records | Immutable after approval | High |
| Retirement Data | 10 years minimum | High |
| Resignation Records | 10 years post-departure | Medium |
| Audit Logs | 10 years minimum | Critical |

### 5.6 Maintainability

- Code Coverage: 80% minimum
- Documentation: API (Swagger), database schema, user manuals
- Modularity: Independent module updates

### 5.7 Portability

- Browser Compatibility: Chrome 90+, Firefox 88+, Edge 90+
- Database Portability: Standard SQL via Prisma ORM

---

## 6. Data Requirements

### 6.1 Core Tables Overview

**Users and Security:**
- users (authentication, roles, permissions)
- institutions (government institutions)
- password_reset_tokens (OTP management)

**Employee Data:**
- employees (complete profile)
- employee_documents (Ardhilhali, contracts, etc.)
- employee_certificates (educational qualifications)

**Requests (8 types):**
- confirmation_requests
- lwop_requests
- promotion_requests
- cadre_change_requests
- retirement_requests
- resignation_requests
- service_extension_requests
- termination_requests
- dismissal_requests
- request_documents (attachments)

**Complaints:**
- complaints
- complaint_documents
- complaint_responses

**System:**
- audit_logs (all user actions)
- notifications (in-app alerts)

### 6.2 Key Field Specifications

**Employee Table (employees):**
- Primary Key: employee_id (UUID)
- Unique: payroll_number, zan_id, zssf_number
- Foreign Key: institution_id → institutions
- Status ENUM: On Probation, Confirmed, On LWOP, Retired, Resigned, Terminated, Dismissed, Deceased

**User Table (users):**
- Primary Key: user_id (UUID)
- Unique: username, email
- Role ENUM: HRO, HHRMD, HRMO, DO, EMP, PO, CSCS, HRRP, ADMIN
- Status ENUM: Active, Inactive, Locked, Deleted

**Request Tables (common pattern):**
- Primary Key: request_id (UUID)
- Foreign Keys: employee_id, submitted_by, approved_by
- Status ENUM: Pending, Approved, Rejected, Returned
- Timestamps: submission_date, approval_date

### 6.3 Data Integrity Constraints

**Referential Integrity:**
- Foreign keys with appropriate ON DELETE/UPDATE rules
- Cascade for dependent data
- Restrict for master data

**Validation:**
- CHECK constraints for date logic
- ENUM for controlled values
- NOT NULL for required fields
- UNIQUE for identifiers

**Indexes:**
- Primary keys (auto-indexed)
- Foreign keys
- Search fields: payroll_number, zan_id, zssf_number, username, email
- Status and date fields

---

## Appendices

### Appendix A: Use Case Examples

**Use Case 1: HRO Submits Confirmation Request**
1. HRO logs in → Dashboard
2. Clicks "Submit Confirmation Request"
3. Searches employee by payroll number
4. System displays employee, validates 12-month probation
5. HRO fills form, uploads 3 required documents
6. Reviews and submits
7. System validates, creates request (status: Pending)
8. Routes to HHRMD/HRMO, sends notification
9. HRO sees confirmation with request ID

**Use Case 2: HHRMD Approves Retirement**
1. HHRMD logs in → Dashboard shows pending requests
2. Clicks on retirement request
3. Reviews employee details, documents, reason
4. Verifies age/service eligibility
5. Clicks "Approve"
6. Uploads signed retirement approval letter
7. Adds comments, confirms
8. System updates: request → Approved, employee → Retired
9. Notifications sent to HRO, employee, HRRP
10. Audit log entry created

**Use Case 3: Employee Submits Complaint**
1. Employee navigates to employee login
2. Enters ZanID, Payroll, ZSSF
3. System validates all three match
4. Employee clicks "Submit Complaint"
5. Selects category, fills description, uploads evidence
6. Submits complaint
7. System generates ID (COMP2025-000001)
8. Routes to DO/HHRMD
9. Employee receives confirmation

### Appendix B: Validation Rules Summary

**Passwords:**
- 8-128 characters, mixed case, number, special char
- Cannot contain username or name
- Not in common password list

**Files:**
- Documents: PDF only, max 2MB
- Profile images: JPEG/PNG, max 2MB
- Complaints: PDF/JPEG/PNG, max 1MB, max 5 files
- Virus scan required

**Dates:**
- DOB: Must be 18+ years before employment
- Employment Date: Cannot be future
- End Date > Start Date (LWOP, extensions)

**Identifiers:**
- ZanID: Exactly 9 digits, unique
- Payroll: Alphanumeric, unique
- ZSSF: Alphanumeric, unique

**Business Rules:**
- Probation: 12-18 months
- LWOP: 1 month - 3 years, max 2 lifetime
- Service promotion: Min 2 years in position
- Extensions: Max 2 lifetime, 6 months - 3 years
- Retirement age: 60 (compulsory)

### Appendix C: Report Specifications

**10 Standard Reports:**
1. Employee Profile Report (all fields, filterable)
2. Confirmation Status Report (probation tracking)
3. Promotion History Report (all promotions)
4. LWOP Summary Report (active and historical)
5. Retirement Pipeline Report (5-year projection)
6. Complaint Status Report (all complaints)
7. Pending Requests Report (SLA monitoring)
8. Institutional Summary Report (per-institution stats)
9. Termination/Dismissal Report (separations log)
10. Audit Activity Report (complete audit trail)

**Features:**
- Bilingual (English/Swahili)
- Export: PDF (formatted) and Excel (data)
- Filters: Date range, institution, status, etc.
- Scheduled distribution via email

### Appendix D: Error Messages Catalog

**Authentication:**
- "Invalid username or password"
- "Account locked. Try again in 15 minutes."
- "Session expired. Please login again."

**Validation:**
- "File type not supported. PDF only."
- "File exceeds 2MB limit."
- "Employee has not completed 12-month probation."
- "Maximum LWOP period is 3 years."
- "This reason is not permitted for LWOP."

**Authorization:**
- "Access denied. Insufficient permissions."
- "You can only view data from your institution."

### Appendix E: Glossary

(See Section 1.3 for complete definitions and acronyms)

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Project Sponsor (CSCS)** | | | |
| **Head of HR Management Division** | | | |
| **IT Department Head** | | | |
| **Project Manager** | | | |
| **Lead Developer** | | | |
| **QA Lead** | | | |
| **Business Analyst** | | | |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Dec 20, 2025 | Project Team | Initial draft |
| 0.5 | Dec 23, 2025 | Project Team | Added detailed requirements |
| 1.0 | Dec 25, 2025 | Project Team | Final version for approval |
| 2.0 | Mar 24, 2026 | Project Team | Updated for Next.js + Nest.js architecture |

---

**END OF SYSTEM REQUIREMENTS SPECIFICATION**

*This document is confidential and proprietary to the Civil Service Commission of Zanzibar. Unauthorized distribution or reproduction is prohibited.*
