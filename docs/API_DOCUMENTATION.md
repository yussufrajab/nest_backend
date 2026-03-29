# CSMS API Documentation

Complete API documentation for the Civil Service Management System (CSMS).

**Base URL:** `http://localhost:3001`
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

- [Authentication](#authentication)
- [Employees](#employees)
- [Institutions](#institutions)
- [Requests](#requests)
- [Complaints](#complaints)
- [Dashboard](#dashboard)
- [Reports](#reports)
- [Notifications](#notifications)
- [Health](#health)

---

## Authentication

### POST /auth/login

Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-001",
    "name": "System Administrator",
    "username": "admin",
    "role": "ADMIN",
    "institutionId": "inst-004"
  }
}
```

### POST /auth/register

Register a new user (Admin only).

**Request:**
```json
{
  "name": "New User",
  "username": "newuser",
  "password": "password123",
  "role": "HRO",
  "institutionId": "inst-001",
  "email": "user@example.com"
}
```

### GET /auth/profile

Get current user profile.

**Response:**
```json
{
  "id": "user-001",
  "name": "System Administrator",
  "username": "admin",
  "role": "ADMIN",
  "institution": {
    "id": "inst-004",
    "name": "Zanzibar Civil Service Commission"
  }
}
```

### POST /auth/forgot-password

Request password reset OTP.

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password

Reset password using OTP.

**Request:**
```json
{
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

---

## Employees

### GET /employees

Get paginated employee list.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by name, ZAN ID, or payroll
- `status` (string, optional): Filter by status
- `institutionId` (string, optional): Filter by institution

**Response:**
```json
{
  "employees": [
    {
      "id": "emp-001",
      "name": "John Doe",
      "zanId": "ZAN-1985-001",
      "status": "ACTIVE",
      "cadre": "Senior Accountant",
      "institution": {
        "id": "inst-001",
        "name": "Ministry of Finance"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### GET /employees/:id

Get employee by ID.

**Response:**
```json
{
  "id": "emp-001",
  "name": "John Doe",
  "gender": "Male",
  "zanId": "ZAN-1985-001",
  "phoneNumber": "+255-77-123-4567",
  "cadre": "Senior Accountant",
  "salaryScale": "VII",
  "ministry": "Ministry of Finance",
  "department": "Accounts",
  "status": "ACTIVE",
  "employmentDate": "2015-03-15T00:00:00.000Z",
  "institution": {
    "id": "inst-001",
    "name": "Ministry of Finance"
  }
}
```

### POST /employees

Create new employee.

**Request:**
```json
{
  "name": "New Employee",
  "gender": "Male",
  "zanId": "ZAN-1990-999",
  "phoneNumber": "+255-77-999-9999",
  "cadre": "Accountant",
  "salaryScale": "VIII",
  "ministry": "Ministry of Finance",
  "department": "Finance",
  "appointmentType": "Permanent",
  "contractType": "Indefinite",
  "employmentDate": "2024-01-15",
  "status": "ACTIVE",
  "institutionId": "inst-001"
}
```

### PUT /employees/:id

Update employee.

**Request:** Same as POST with fields to update.

### DELETE /employees/:id

Delete employee.

### GET /employees/search

Search employee by ZAN ID or payroll number.

**Query Parameters:**
- `zanId` (string, optional): ZAN ID
- `payrollNumber` (string, optional): Payroll number

---

## Institutions

### GET /institutions

Get paginated institution list.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `search` (string, optional): Search by name, email, TIN

### GET /institutions/:id

Get institution by ID.

### POST /institutions

Create new institution (Admin only).

**Request:**
```json
{
  "name": "New Ministry",
  "email": "ministry@gov.zm",
  "phoneNumber": "+255-24-999-9999",
  "voteNumber": "V999",
  "tinNumber": "TIN999"
}
```

### PUT /institutions/:id

Update institution (Admin only).

### DELETE /institutions/:id

Delete institution (Admin only).

---

## Requests

### GET /requests

Get paginated request list.

**Query Parameters:**
- `skip` (number, optional): Offset
- `take` (number, optional): Limit
- `status` (string, optional): Filter by status (PENDING, APPROVED, REJECTED)
- `type` (string, optional): Filter by type (confirmation, promotion, lwop, etc.)
- `employeeId` (string, optional): Filter by employee
- `search` (string, optional): Search by employee name
- `dateFrom` (string, optional): Start date (ISO)
- `dateTo` (string, optional): End date (ISO)

### GET /requests/:id

Get request by ID with full details.

### POST /requests/confirmation

Create confirmation request.

**Request:**
```json
{
  "employeeId": "emp-001",
  "proposedConfirmationDate": "2024-12-01",
  "notes": "Employee has completed probation"
}
```

### POST /requests/promotion

Create promotion request.

**Request:**
```json
{
  "employeeId": "emp-001",
  "proposedCadre": "Principal Accountant",
  "promotionType": "Regular",
  "studiedOutsideCountry": false
}
```

### POST /requests/lwop

Create leave without pay request.

**Request:**
```json
{
  "employeeId": "emp-001",
  "duration": "12",
  "reason": "Further Studies",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### POST /requests/retirement

Create retirement request.

**Request:**
```json
{
  "employeeId": "emp-001",
  "retirementType": "Age",
  "proposedDate": "2025-04-20",
  "illnessDescription": null
}
```

### POST /requests/:id/approve

Approve a request.

**Query Parameters:**
- `type` (string): Request type

**Request:**
```json
{
  "decisionDate": "2024-03-29T10:00:00.000Z",
  "commissionDecisionDate": "2024-03-29T10:00:00.000Z"
}
```

### POST /requests/:id/reject

Reject a request.

**Query Parameters:**
- `type` (string): Request type

**Request:**
```json
{
  "rejectionReason": "Insufficient documentation"
}
```

### POST /requests/:id/send-back

Send back request for rectification.

**Query Parameters:**
- `type` (string): Request type

**Request:**
```json
{
  "rectificationInstructions": "Please provide additional documents"
}
```

### GET /requests/export/csv

Export requests to CSV.

**Query Parameters:**
- `status` (string, optional): Filter by status
- `type` (string, optional): Filter by type

**Response:** CSV file download

---

## Complaints

### GET /complaints

Get paginated complaint list.

**Query Parameters:**
- `skip` (number, optional)
- `take` (number, optional)
- `status` (string, optional)
- `type` (string, optional)

### GET /complaints/:id

Get complaint by ID.

### POST /complaints

Create complaint.

**Request:**
```json
{
  "complaintType": "Workplace Issue",
  "subject": "Issue Subject",
  "details": "Detailed description...",
  "complainantId": "user-001",
  "complainantPhoneNumber": "+255-77-123-4567",
  "nextOfKinPhoneNumber": "+255-77-999-9999"
}
```

### POST /complaints/with-ai

Create complaint with AI enhancement.

**Query Parameters:**
- `complainantId` (string): Complainant user ID

**Request:**
```json
{
  "subject": "Issue Subject",
  "details": "Detailed description...",
  "complainantPhoneNumber": "+255-77-123-4567",
  "nextOfKinPhoneNumber": "+255-77-999-9999",
  "attachments": ["file1.pdf"]
}
```

### GET /complaints/:id/ai-analysis

Get AI analysis for complaint.

### PUT /complaints/:id

Update complaint.

### DELETE /complaints/:id

Delete complaint.

---

## Dashboard

### GET /dashboard/stats

Get dashboard statistics (cached 30s).

**Response:**
```json
{
  "totalEmployees": 100,
  "pendingRequests": 50,
  "openComplaints": 10,
  "totalInstitutions": 5
}
```

### GET /dashboard/quick-actions

Get quick action links.

### GET /dashboard/request-stats-by-type

Get request statistics by type (cached 60s).

**Response:**
```json
[
  {
    "type": "Confirmation",
    "count": 10,
    "pending": 5,
    "approved": 3,
    "rejected": 2
  }
]
```

### GET /dashboard/request-trends

Get request trends over time.

**Query Parameters:**
- `days` (number, optional): Number of days (default: 30)

**Response:**
```json
[
  { "date": "2024-03-01", "count": 5 },
  { "date": "2024-03-02", "count": 3 }
]
```

### GET /dashboard/employee-distribution

Get employee status distribution (cached 5min).

**Response:**
```json
[
  { "status": "ACTIVE", "count": 80 },
  { "status": "PROBATION", "count": 20 }
]
```

### GET /dashboard/institution-stats

Get institution statistics.

### GET /dashboard/recent-activities

Get recent activities.

**Query Parameters:**
- `limit` (number, optional): Number of activities (default: 10)

### GET /dashboard/data

Get comprehensive dashboard data.

---

## Reports

### GET /reports/employee

Generate employee report PDF.

**Response:** PDF file download

### GET /reports/request

Generate request report PDF.

### GET /reports/complaint

Generate complaint report PDF.

---

## Notifications

### GET /api/notifications

Get user notifications.

**Query Parameters:**
- `skip` (number, optional)
- `take` (number, optional): Default 20
- `isRead` (boolean, optional): Filter by read status

**Response:**
```json
[
  {
    "id": "notif-001",
    "message": "Your request has been approved",
    "link": "/requests/confirmation/req-001",
    "isRead": false,
    "createdAt": "2024-03-29T10:00:00.000Z"
  }
]
```

### GET /api/notifications/unread-count

Get unread notification count.

**Response:**
```json
{
  "count": 5
}
```

### PATCH /api/notifications/:id/read

Mark notification as read.

### PATCH /api/notifications/read-all

Mark all notifications as read.

### DELETE /api/notifications/:id

Delete notification.

### GET /api/notifications/email-status

Check if email notifications are enabled.

---

## Health

### GET /health

Basic health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-29T10:00:00.000Z",
  "uptime": 3600
}
```

### GET /health/detailed

Detailed health status with service checks.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-29T10:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "up",
      "responseTime": 15
    },
    "storage": {
      "status": "up"
    },
    "memory": {
      "status": "up",
      "used": 512,
      "total": 4096,
      "percentUsed": 12.5
    }
  }
}
```

### GET /health/ready

Readiness probe for Kubernetes.

### GET /health/live

Liveness probe.

### GET /health/metrics

System metrics (memory, CPU).

### GET /health/db

Database health check.

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

- **Default:** 100 requests per minute
- **Auth endpoints:** 10 requests per minute
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Caching

The following endpoints are cached:

- `GET /dashboard/stats` - 30 seconds
- `GET /dashboard/request-stats-by-type` - 60 seconds
- `GET /dashboard/employee-distribution` - 5 minutes

Cache-Control headers are sent with responses.

---

## WebSocket (Future)

Real-time notifications will be available via WebSocket at `ws://localhost:3001/ws`.
