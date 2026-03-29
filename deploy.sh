#!/bin/bash

set -e

# ============================================
# CSMS Production Deployment Script
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
DEPLOY_LOG="$SCRIPT_DIR/deploy.log"
BACKUP_DIR="$SCRIPT_DIR/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Logging Functions
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$DEPLOY_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1" >> "$DEPLOY_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $1" >> "$DEPLOY_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$DEPLOY_LOG"
}

# ============================================
# Environment Validation
# ============================================

validate_environment() {
    log_info "Validating environment configuration..."

    local env_file="$BACKEND_DIR/.env"

    if [[ ! -f "$env_file" ]]; then
        log_error "Backend .env file not found at $env_file"
        exit 1
    fi

    # Required environment variables
    local required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_EXPIRATION"
        "PORT"
        "NODE_ENV"
    )

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=$" "$env_file"; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi

    # Check Node.js version
    local node_version
    node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $node_version -lt 18 ]]; then
        log_error "Node.js version 18+ required. Current: $(node -v)"
        exit 1
    fi

    log_success "Environment validation passed"
}

# ============================================
# Pre-deployment Checks
# ============================================

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check required commands
    local commands=("node" "npm" "pm2" "psql" "systemctl")

    for cmd in "${commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "$cmd is not installed"
            exit 1
        fi
    done

    # Check PostgreSQL
    if ! systemctl is-active --quiet postgresql; then
        log_error "PostgreSQL is not running"
        exit 1
    fi

    # Check MinIO
    if ! pgrep -x "minio" > /dev/null; then
        log_warning "MinIO is not running"
    fi

    # Check disk space
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        log_error "Disk usage is at ${disk_usage}%. Free up space before deploying."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# ============================================
# Database Migration
# ============================================

migrate_database() {
    log_info "Running database migrations..."

    cd "$BACKEND_DIR"

    # Create backup before migration
    if [[ -d "$BACKUP_DIR" ]]; then
        local backup_file="$BACKUP_DIR/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
        log_info "Creating pre-deployment backup..."
        pg_dump "$(grep DATABASE_URL .env | cut -d'=' -f2-)" > "$backup_file" || {
            log_warning "Failed to create backup, continuing..."
        }
    fi

    # Generate Prisma Client
    npx prisma generate || {
        log_error "Failed to generate Prisma client"
        exit 1
    }

    # Run migrations
    npx prisma migrate deploy || {
        log_error "Database migration failed"
        exit 1
    }

    log_success "Database migration completed"
}

# ============================================
# Application Build
# ============================================

build_applications() {
    log_info "Building applications..."

    # Build Backend
    log_info "Building backend..."
    cd "$BACKEND_DIR"

    # Clean previous build
    rm -rf dist

    # Install dependencies
    npm ci || {
        log_error "Failed to install backend dependencies"
        exit 1
    }

    # Build
    npm run build || {
        log_error "Backend build failed"
        exit 1
    }

    log_success "Backend built successfully"

    # Build Frontend
    log_info "Building frontend..."
    cd "$FRONTEND_DIR"

    # Clean previous build
    rm -rf .next

    # Install dependencies
    npm ci || {
        log_error "Failed to install frontend dependencies"
        exit 1
    }

    # Build
    npm run build || {
        log_error "Frontend build failed"
        exit 1
    }

    log_success "Frontend built successfully"
}

# ============================================
# PM2 Configuration
# ============================================

configure_pm2() {
    log_info "Configuring PM2..."

    # Create PM2 ecosystem file
    cat > "$SCRIPT_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'csms-backend',
      cwd: './backend',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_file: './logs/backend-combined.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 3000,
      watch: false,
      autorestart: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
      health_check_grace_period: 30000
    },
    {
      name: 'csms-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_file: './logs/frontend-combined.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 3000,
      watch: false,
      autorestart: true,
      kill_timeout: 5000,
      listen_timeout: 10000
    }
  ]
};
EOF

    # Create logs directory
    mkdir -p "$SCRIPT_DIR/logs"

    log_success "PM2 configuration created"
}

# ============================================
# Deployment
# ============================================

deploy() {
    log_info "Starting deployment..."

    cd "$SCRIPT_DIR"

    # Stop existing PM2 processes
    log_info "Stopping existing processes..."
    pm2 delete csms-backend csms-frontend 2>/dev/null || true
    sleep 2

    # Start new processes
    log_info "Starting new processes..."
    pm2 start ecosystem.config.js --env production || {
        log_error "Failed to start applications"
        exit 1
    }

    # Save PM2 configuration
    pm2 save

    log_success "Deployment completed"
}

# ============================================
# Health Check
# ============================================

health_check() {
    log_info "Running health checks..."

    local max_attempts=30
    local attempt=1

    # Check backend
    log_info "Checking backend health..."
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            log_success "Backend is healthy"
            break
        fi

        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Backend health check failed after $max_attempts attempts"
            pm2 logs csms-backend --lines 20
            exit 1
        fi

        sleep 2
        ((attempt++))
    done

    # Check frontend
    attempt=1
    log_info "Checking frontend health..."
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            log_success "Frontend is healthy"
            break
        fi

        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Frontend health check failed after $max_attempts attempts"
            pm2 logs csms-frontend --lines 20
            exit 1
        fi

        sleep 2
        ((attempt++))
    done

    log_success "All health checks passed"
}

# ============================================
# Rollback
# ============================================

rollback() {
    log_warning "Deployment failed! Initiating rollback..."

    # Stop new processes
    pm2 delete csms-backend csms-frontend 2>/dev/null || true

    # Restore from backup if available
    local latest_backup
    latest_backup=$(ls -t "$BACKUP_DIR"/pre-deploy-*.sql 2>/dev/null | head -1)

    if [[ -n "$latest_backup" ]]; then
        log_info "Restoring database from $latest_backup..."
        # psql command to restore
        log_warning "Database restore needs to be done manually: psql < $latest_backup"
    fi

    log_info "Rollback completed. Check logs for details."
}

# ============================================
# Main
# ============================================

main() {
    echo "==================================="
    echo "CSMS Production Deployment"
    echo "==================================="
    echo ""

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Initialize log file
    touch "$DEPLOY_LOG"

    # Set trap for rollback on error
    trap 'rollback' ERR

    # Run deployment steps
    validate_environment
    check_prerequisites
    migrate_database
    build_applications
    configure_pm2
    deploy
    health_check

    echo ""
    echo "==================================="
    log_success "CSMS deployed successfully!"
    echo "==================================="
    echo ""
    echo "Backend:  http://localhost:3001"
    echo "Frontend: http://localhost:3000"
    echo ""
    echo "PM2 Status:"
    pm2 status
    echo ""
    echo "To view logs:"
    echo "  Backend: pm2 logs csms-backend"
    echo "  Frontend: pm2 logs csms-frontend"
    echo ""
    echo "To restart:"
    echo "  pm2 restart ecosystem.config.js"
}

# Run if not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
