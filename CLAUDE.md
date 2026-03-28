# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Civil Service Management System (CSMS) - HR management system for the Civil Service Commission of Zanzibar.

- **Frontend:** Next.js 16 + React 18 + TypeScript + Tailwind CSS
- **Backend:** NestJS 10 + TypeScript + Prisma ORM
- **Database:** PostgreSQL 15
- **Object Storage:** MinIO (S3-compatible)

## Development Commands

### Backend (`/backend`)

```bash
npm run start:dev    # Start dev server (port 3001)
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run ESLint
npm test             # Run unit tests
npm run test:e2e     # Run e2e tests
npx prisma studio    # Open Prisma Studio (DB browser)
npx prisma db push   # Sync schema to database
npx prisma migrate dev  # Create and apply migration
```

### Frontend (`/frontend`)

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Full System

```bash
./start.sh           # Start PostgreSQL, MinIO, backend, and frontend
```

## Architecture

### Backend Structure

```
backend/src/
├── app.module.ts          # Root module (imports all feature modules)
├── main.ts                # Entry point (validation pipe, CORS)
├── auth/                  # JWT authentication, passport strategies
├── users/                 # User management
├── employees/             # Employee records and certificates
├── institutions/          # Institution/organization management
├── requests/              # HR request workflows (promotion, LWOP, retirement, etc.)
├── complaints/            # Disciplinary complaints handling
├── dashboard/             # Dashboard metrics and summaries
├── reports/               # Report generation
├── upload/                # File upload to MinIO
├── audit-logs/            # Activity logging
├── notifications/         # User notifications
├── ai/                    # AI-powered features
└── prisma/                # Prisma client module
```

**Pattern:** Controller → Service → Prisma Repository

- **Controllers:** Handle HTTP requests, validation via DTOs
- **Services:** Business logic, transaction management
- **Guards:** `jwt-auth.guard.ts`, `roles.guard.ts` for authorization
- **Decorators:** `@Roles()`, `@User()` for auth metadata

### Frontend Structure

```
frontend/
├── app/
│   ├── (auth)/            # Login, forgot/reset password (no sidebar)
│   ├── (main)/            # Authenticated routes with sidebar
│   │   ├── admin/         # User/institution management (Admin only)
│   │   ├── employees/     # Employee CRUD
│   │   ├── requests/      # HR request submission/tracking
│   │   ├── complaints/    # Complaint handling
│   │   ├── reports/       # Analytics and reports
│   │   └── dashboard/     # Dashboard home
│   └── api/               # (if any API routes)
├── components/
│   └── Sidebar.tsx        # Main navigation component
├── services/              # API client wrappers (axios-based)
├── hooks/                 # React hooks (use-auth, etc.)
└── types/                 # TypeScript type definitions
```

**State Management:** React Query for server state, custom hooks for auth

### Database Schema

Prisma schema defines core entities: `Institution`, `User`, `Employee`, `Request` (with polymorphic types), `Complaint`, `Notification`, `AuditLog`. See `backend/prisma/schema.prisma`.

**Request Types:** Confirmation, Promotion, LWOP, Cadre Change, Retirement, Resignation, Service Extension, Separation

### Authentication & Authorization

- JWT-based authentication with passport
- Roles: Admin, HRO, HHRMD, HRMO, DO, EMPLOYEE, CSCS, HRRP, PO
- RBAC enforced via `@Roles()` decorator + `RolesGuard`
- See `docs/RBAC_MATRIX.md` for full permissions

## Environment Variables

### Backend (`.env`)

```env
DATABASE_URL="postgresql://..."
PORT=3001
JWT_SECRET="..."
JWT_EXPIRATION="24h"
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9001
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="csms-documents"
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9001
NEXT_PUBLIC_MINIO_BUCKET=csms-documents
```

## Key Documentation

- `docs/RBAC_MATRIX.md` - Role permissions
- `docs/Technical_Architecture_Document.md` - System architecture
- `docs/Database_Design_Document.md` - Database schema details
- `docs/IMPLEMENTATION_PLAN.md` - Implementation roadmap
