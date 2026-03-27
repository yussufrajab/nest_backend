# Civil Service Management System (CSMS)

## Overview

The Civil Service Management System (CSMS) is a comprehensive web-based HR management system designed to automate and streamline HR processes for the Civil Service Commission of Zanzibar.

This system is built with:
- **Frontend:** Next.js 16 (React framework with SSR/SSG capabilities)
- **Backend:** Nest.js 10 (Node.js framework with TypeScript support)
- **ORM:** Prisma (Type-safe database access)
- **Database:** PostgreSQL 15
- **Object Storage:** Minio (S3-compatible on-premise storage)

## Quick Start

### Prerequisites

1. Node.js 18 LTS or higher
2. PostgreSQL 15 (local installation)
3. Minio server (local installation)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nestjs
   ```

2. **Configure environment variables:**

   **Backend (.env):**
   Create a `.env` file in the `backend` directory:
   ```bash
   NODE_ENV=production
   PORT=3001
   DATABASE_URL="postgresql://user:password@localhost:5432/csms"
   JWT_SECRET="your-secret-key"
   MINIO_ENDPOINT="localhost"
   MINIO_PORT=9001
   MINIO_ACCESS_KEY="minioadmin"
   MINIO_SECRET_KEY="minioadmin"
   MINIO_BUCKET="csms-documents"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-password"
   ```

   **Frontend (.env.production):**
   Create a `.env.production` file in the `frontend` directory:
   ```bash
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   NEXT_PUBLIC_MINIO_ENDPOINT="http://localhost:9001"
   NEXT_PUBLIC_MINIO_BUCKET="csms-documents"
   ```

3. **Start the system:**
   ```bash
   # Grant execute permissions (only needed once)
   chmod +x backend/start.sh frontend/start.sh start.sh

   # Start all services
   ./start.sh
   ```

## Manual Startup

### Backend

```bash
cd backend
./start.sh
```

### Frontend

```bash
cd frontend
./start.sh
```

## System Requirements

### Server Specifications

| Component | Specification |
|-----------|---------------|
| CPU | 8 cores (2.5+ GHz) |
| RAM | 16 GB |
| Storage | 1 TB SSD |
| Network | 1 Gbps |
| OS | Ubuntu Server 24.04 LTS |

### Client Requirements

| Device | Minimum Specs |
|--------|---------------|
| Desktop | 4GB RAM, 1024x768 display, 2 Mbps internet |
| Tablet | 10" or larger, 4GB RAM, 2 Mbps internet |

## Documentation

- **Implementation Plan:** `/docs/IMPLEMENTATION_PLAN.md` - Detailed implementation roadmap
- **Technical Architecture:** `/docs/Technical_Architecture_Document.md` - System architecture design
- **System Requirements:** `/docs/System_Requirements_Specification.md` - Complete system requirements
- **Database Design:** `/docs/Database_Design_Document.md` - Database schema and relationships
- **RBAC Matrix:** `/docs/RBAC_MATRIX.md` - Role-based access control permissions

## Maintenance

### Stopping the System

```bash
pm2 stop all
```

### Restarting the System

```bash
pm2 restart all
```

### Viewing Logs

```bash
pm2 logs csms-backend
pm2 logs csms-frontend
```

### Database Maintenance

```bash
cd backend
npx prisma migrate deploy  # Run migrations
npx prisma studio          # Open Prisma Studio
```

## Support

For technical support, please contact the IT department at `ict@zanajira.go.tz`.

---

**Version:** 2.0
**Date:** March 24, 2026
**Author:** Civil Service Commission of Zanzibar
