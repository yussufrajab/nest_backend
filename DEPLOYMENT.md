# CSMS Production Deployment Guide

Complete guide for deploying the Civil Service Management System (CSMS) to production.

## Prerequisites

### Server Requirements
- Ubuntu 20.04 LTS or higher
- Node.js 18+
- PostgreSQL 15+
- MinIO (or AWS S3)
- PM2 (process manager)
- Nginx (reverse proxy)

### Minimum Hardware
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD

## Installation Steps

### 1. System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install other dependencies
sudo apt install -y nginx git curl build-essential

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Create database user
sudo -u postgres psql -c "CREATE USER csms WITH PASSWORD 'your_secure_password';"

# Create database
sudo -u postgres psql -c "CREATE DATABASE csms_db OWNER csms;"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE csms_db TO csms;"
```

### 3. MinIO Setup (Optional - for local file storage)

```bash
# Download and install MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Create data directory
mkdir -p ~/minio-data

# Start MinIO (for production, use systemd service)
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=minioadmin123
minio server ~/minio-data --address ":9000" --console-address ":9001"
```

### 4. Application Deployment

```bash
# Clone repository
git clone <repository-url> /var/www/csms
cd /var/www/csms

# Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Configure frontend environment
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with production values

# Run deployment script
./deploy.sh
```

## Environment Variables

### Backend (.env)

```env
# Required
DATABASE_URL="postgresql://csms:password@localhost:5432/csms_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRATION="24h"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://your-domain.com"

# MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=csms-documents

# SMTP (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="CSMS <noreply@csms.gov.zm>"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_MINIO_ENDPOINT=https://files.your-domain.com
```

## Nginx Configuration

Create `/etc/nginx/sites-available/csms`:

```nginx
# Backend API
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com api.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/csms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Health Monitoring

### Health Check Endpoints

- `GET /health` - Basic health check
- `GET /health/detailed` - Full system health
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /health/metrics` - System metrics

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs csms-backend
pm2 logs csms-frontend

# Monitor resources
pm2 monit
```

## Backup and Restore

### Automated Backups

Add to crontab (`crontab -e`):

```bash
# Daily backup at 2 AM
0 2 * * * /var/www/csms/backup.sh >> /var/log/csms-backup.log 2>>1

# Weekly full backup on Sundays at 3 AM
0 3 * * 0 /var/www/csms/backup.sh >> /var/log/csms-weekly-backup.log 2>>1
```

### Manual Backup

```bash
cd /var/www/csms
./backup.sh
```

### Restore from Backup

```bash
cd /var/www/csms
./restore.sh 20250329-120000
```

## Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check logs
pm2 logs

# Check environment variables
cat backend/.env

# Verify database connection
pm2 stop csms-backend
cd backend
npx prisma db pull
```

**Database connection errors:**
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check connection
sudo -u postgres psql -c "SELECT 1;"

# Verify user exists
sudo -u postgres psql -c "\du"
```

**File upload not working:**
```bash
# Check MinIO status
systemctl status minio

# Verify bucket exists
mc ls local/

# Check permissions
ls -la ~/minio-data/
```

## Security Checklist

- [ ] Change default database password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Configure SMTP with app-specific password
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (ufw) - allow only necessary ports
- [ ] Set up fail2ban for brute force protection
- [ ] Regular security updates
- [ ] Database backups encrypted

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_request_status ON "Request"(status);
CREATE INDEX idx_request_employee ON "Request"(employeeId);
CREATE INDEX idx_employee_status ON "Employee"(status);
CREATE INDEX idx_notification_user_read ON "Notification"(userId, isRead);
```

### PM2 Cluster Mode (Optional)

For high traffic, enable cluster mode in `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'csms-backend',
      script: './dist/main.js',
      instances: 2, // Number of CPU cores
      exec_mode: 'cluster',
      // ... rest of config
    }
  ]
};
```

## Support

For issues and support:
- Check logs: `pm2 logs`
- Health check: `curl http://localhost:3001/health`
- Documentation: `/docs` directory
