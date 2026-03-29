# Remaining Tasks Implementation Plan

**Document:** CSMS Implementation Roadmap - Remaining Tasks
**Date:** March 29, 2026
**Prepared By:** Technical Implementation Team

---

## Current Implementation Status

| Phase | Status | Completion |
|-------|--------|------------|
| **Phase 1: Foundation** | Complete | 100% |
| **Phase 2: Authentication** | Mostly Complete | 90% |
| **Phase 3: Core Modules** | Mostly Complete | 85% |
| **Phase 4: Document Management** | Complete | 100% |
| **Phase 5: Advanced Features** | Partial | 50% |
| **Phase 6: Testing & Deployment** | Not Started | 0% |

---

## What's Implemented vs Missing

### Fully Implemented
- Database schema with all entities (Prisma)
- Authentication system (JWT, guards, decorators)
- All 8 request types with validation and workflow
- Complaint management with AI enhancements
- MinIO file upload service
- Basic PDF report generation
- Audit logging service
- Notification service (in-app)
- Frontend UI with role-based navigation

### Partially Implemented / Missing

| Feature | Status | Priority |
|---------|--------|----------|
| Email notifications (SMTP) | Service exists but `sendEmail()` is TODO | High |
| Real-time analytics dashboard | Only basic stats, needs charts/visualizations | Medium |
| Notification center UI | Backend exists, frontend missing | High |
| Request filtering/search | Basic lists exist, advanced filters needed | Medium |
| Unit/integration tests | None written | High |
| Production deployment scripts | Partial (PM2 scripts exist) | Medium |
| Rate limiting | Mentioned but not implemented | Low |
| Data seeding | Basic seed possible, needs comprehensive data | Low |

---

## Implementation Roadmap

### Sprint 1: Critical Missing Features (Week 1-2)

#### 1. Email Notification System
**Backend Tasks:**
- [ ] Integrate nodemailer for SMTP email sending
- [ ] Complete `sendEmail()` method in `NotificationsService`
- [ ] Create email templates for:
  - Request approved notification
  - Request rejected notification
  - Request sent back for rectification
  - Complaint resolved notification
  - Password reset OTP email
- [ ] Add email queue for bulk notifications (optional: use Bull queue)
- [ ] Test email delivery with Gmail/SendGrid SMTP

**Files to modify:**
- `backend/src/notifications/notifications.service.ts`
- `backend/src/notifications/templates/*.html` (new)

**Estimated Effort:** 2-3 days

#### 2. Frontend Notification Center
**Frontend Tasks:**
- [ ] Create notification dropdown/panel component
- [ ] Add notification badge to header showing unread count
- [ ] Implement real-time polling for new notifications
- [ ] Add "Mark as read" / "Mark all as read" functionality
- [ ] Add notification detail view with links to related entities

**New Files:**
- `frontend/components/notifications/NotificationDropdown.tsx`
- `frontend/components/notifications/NotificationItem.tsx`
- `frontend/hooks/use-notifications.ts`

**Files to modify:**
- `frontend/components/Sidebar.tsx` or header component

**Estimated Effort:** 2-3 days

---

### Sprint 2: Dashboard & Analytics (Week 3-4)

#### 3. Enhanced Dashboard
**Backend Tasks:**
- [ ] Extend `DashboardService` with:
  - Request statistics by type (confirmation, promotion, etc.)
  - Request trends over time (last 30 days)
  - Employee status distribution
  - Institution-wise request counts
  - Pending items by role
- [ ] Add new dashboard endpoints to `DashboardController`

**Frontend Tasks:**
- [ ] Install chart library (Recharts or Chart.js)
- [ ] Create dashboard widgets:
  - Request status pie chart
  - Request trends line chart
  - Employee statistics bar chart
  - Recent activities list
  - Quick action buttons
- [ ] Role-specific dashboard views

**Files to modify:**
- `backend/src/dashboard/dashboard.service.ts`
- `backend/src/dashboard/dashboard.controller.ts`
- `frontend/app/(main)/dashboard/page.tsx`

**New Files:**
- `frontend/components/dashboard/RequestStatsChart.tsx`
- `frontend/components/dashboard/EmployeeStatsWidget.tsx`
- `frontend/components/dashboard/RecentActivities.tsx`

**Estimated Effort:** 4-5 days

#### 4. Advanced Request Management
**Backend Tasks:**
- [ ] Add search functionality to requests endpoint (by employee name, ZanID)
- [ ] Add date range filtering
- [ ] Add institution filtering
- [ ] Implement pagination for large datasets
- [ ] Add export to CSV/Excel functionality

**Frontend Tasks:**
- [ ] Build advanced filter panel
- [ ] Add search input with debouncing
- [ ] Implement date range picker
- [ ] Add sortable columns to request tables
- [ ] Add export buttons

**Files to modify:**
- `backend/src/requests/requests.controller.ts`
- `backend/src/requests/requests.service.ts`
- `frontend/app/(main)/requests/page.tsx`
- `frontend/services/requestService.ts`

**Estimated Effort:** 3-4 days

---

### Sprint 3: Testing (Week 5-6)

#### 5. Unit Testing
**Backend Tasks:**
- [ ] Test `AuthService` (login, register, password reset)
- [ ] Test `RequestsService` (create, approve, reject workflows)
- [ ] Test `EmployeesService` (CRUD operations)
- [ ] Test validators (confirmation, promotion, etc.)
- [ ] Target: 80% code coverage

**Frontend Tasks:**
- [ ] Test authentication hook (`use-auth.tsx`)
- [ ] Test form components (LoginForm, EmployeeForm)
- [ ] Test utility functions
- [ ] Test API client wrappers

**New Files:**
- `backend/src/**/*.spec.ts` (unit tests)
- `frontend/**/*.test.tsx` (component tests)

**Estimated Effort:** 5-6 days

#### 6. Integration Testing
**Backend Tasks:**
- [ ] Test API endpoints with Supertest
- [ ] Test authentication flow end-to-end
- [ ] Test request workflow (create -> approve)
- [ ] Test complaint submission workflow
- [ ] Test file upload/download

**Frontend Tasks:**
- [ ] E2E tests with Cypress or Playwright
- [ ] Test critical user journeys:
  - Login -> Dashboard
  - Create employee -> Submit request
  - Submit complaint -> Review complaint

**New Files:**
- `backend/test/*.e2e-spec.ts`
- `frontend/cypress/e2e/*.cy.ts`

**Estimated Effort:** 4-5 days

---

### Sprint 4: Polish & Deployment (Week 7-8)

#### 7. Production Readiness
**Tasks:**
- [ ] Complete production deployment scripts
- [ ] Create environment configuration validation
- [ ] Set up database migration strategy
- [ ] Create backup/restore procedures
- [ ] Document deployment process
- [ ] Add health check endpoints
- [ ] Configure PM2 for production

**Files:**
- `start.sh` (update)
- `deploy.sh` (new)
- `backend/src/health/health.controller.ts` (new)

**Estimated Effort:** 3-4 days

#### 8. Performance Optimization
**Backend Tasks:**
- [ ] Add response caching for frequently accessed data
- [ ] Optimize database queries (add indexes, reduce N+1)
- [ ] Implement connection pooling
- [ ] Add request compression

**Frontend Tasks:**
- [ ] Optimize bundle size (code splitting)
- [ ] Add image optimization
- [ ] Implement lazy loading for heavy components
- [ ] Add service worker for caching

**Estimated Effort:** 3-4 days

---

## Quick Wins (Immediate Implementation)

These features can be implemented quickly with existing infrastructure:

### 1. Complete Email Notifications
**Why:** Backend structure exists, just needs SMTP implementation
**Impact:** High - enables email alerts for users
**Effort:** 1 day

### 2. Notification Center UI
**Why:** Backend API already exists (`/notifications`)
**Impact:** High - improves user experience
**Effort:** 1-2 days

### 3. Dashboard Charts
**Why:** Stats endpoints exist, just needs visualization
**Impact:** Medium - improves data visibility
**Effort:** 1-2 days

### 4. Request Search/Filter
**Why:** Basic endpoints exist, just needs query params
**Impact:** Medium - improves usability
**Effort:** 1-2 days

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Email notifications | High | Low | **P1 - Critical** |
| Notification center UI | High | Low | **P1 - Critical** |
| Unit tests | High | High | **P2 - High** |
| Dashboard charts | Medium | Low | **P2 - High** |
| Request search/filter | Medium | Low | **P3 - Medium** |
| Integration tests | High | High | **P3 - Medium** |
| Production deployment | High | Medium | **P3 - Medium** |
| Performance optimization | Medium | Medium | **P4 - Low** |

---

## Resources Required

| Sprint | Developer Days | Dependencies |
|--------|-----------------|--------------|
| Sprint 1 | 4-6 days | SMTP credentials |
| Sprint 2 | 7-9 days | Chart library |
| Sprint 3 | 9-11 days | Test environment |
| Sprint 4 | 6-8 days | Production server |
| **Total** | **26-34 days** | |

---

## Success Criteria

- [ ] All email notifications working
- [ ] Notification center functional
- [ ] Dashboard shows real-time charts
- [ ] 80% test coverage achieved
- [ ] Production deployment documented and tested
- [ ] Application performs under load (500+ concurrent users)

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 29, 2026 | Technical Team | Initial remaining tasks plan |

