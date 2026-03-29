#!/bin/bash

set -e

# ============================================
# CSMS Backup Script
# Backs up PostgreSQL database and MinIO documents
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
BACKUP_DIR="$SCRIPT_DIR/backups"
S3_DATA_DIR="$HOME/minio-data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Configuration
# ============================================

# Retention policy: keep backups for 30 days
RETENTION_DAYS=30

# ============================================
# Logging Functions
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# Helper Functions
# ============================================

get_database_url() {
    if [ -f "$BACKEND_DIR/.env" ]; then
        grep "DATABASE_URL" "$BACKEND_DIR/.env" | cut -d'=' -f2- | tr -d '"'
    else
        log_error "Backend .env file not found"
        exit 1
    fi
}

parse_db_connection() {
    local db_url="$1"
    # Parse postgresql://user:pass@host:port/dbname format
    DB_USER=$(echo "$db_url" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo "$db_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo "$db_url" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$db_url" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$db_url" | sed -n 's/.*\/\([^?]*\).*/\1/p')
}

# ============================================
# Backup Functions
# ============================================

backup_database() {
    log_info "Starting database backup..."

    local db_url
    db_url=$(get_database_url)

    if [ -z "$db_url" ]; then
        log_error "Could not extract DATABASE_URL"
        exit 1
    fi

    parse_db_connection "$db_url"

    local backup_file="$BACKUP_DIR/db-backup-${TIMESTAMP}.sql"

    log_info "Backing up database: $DB_NAME"

    if PGPASSWORD="$DB_PASS" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -F plain \
        --verbose \
        --no-owner \
        --no-privileges \
        > "$backup_file" 2>/tmp/pg_dump_errors; then

        log_success "Database backup completed: $backup_file"

        # Compress the backup
        log_info "Compressing database backup..."
        gzip -f "$backup_file"
        log_success "Database backup compressed: ${backup_file}.gz"

        # Calculate size
        local size
        size=$(du -h "${backup_file}.gz" | cut -f1)
        log_info "Database backup size: $size"
    else
        log_error "Database backup failed"
        if [ -f /tmp/pg_dump_errors ]; then
            cat /tmp/pg_dump_errors
        fi
        exit 1
    fi
}

backup_minio() {
    log_info "Starting MinIO backup..."

    if [ ! -d "$S3_DATA_DIR" ]; then
        log_warning "MinIO data directory not found at $S3_DATA_DIR"
        log_warning "Skipping MinIO backup"
        return
    fi

    local backup_file="$BACKUP_DIR/minio-backup-${TIMESTAMP}.tar.gz"

    log_info "Backing up MinIO data from $S3_DATA_DIR"

    if tar -czf "$backup_file" -C "$S3_DATA_DIR" . 2>/tmp/tar_errors; then
        log_success "MinIO backup completed: $backup_file"

        local size
        size=$(du -h "$backup_file" | cut -f1)
        log_info "MinIO backup size: $size"
    else
        log_error "MinIO backup failed"
        if [ -f /tmp/tar_errors ]; then
            cat /tmp/tar_errors
        fi
        exit 1
    fi
}

create_backup_manifest() {
    local manifest_file="$BACKUP_DIR/backup-${TIMESTAMP}.json"

    cat > "$manifest_file" << EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$(date -Iseconds)",
    "hostname": "$(hostname)",
    "backups": {
        "database": "db-backup-${TIMESTAMP}.sql.gz",
        "minio": "minio-backup-${TIMESTAMP}.tar.gz"
    },
    "retention_days": $RETENTION_DAYS
}
EOF

    log_success "Backup manifest created: $manifest_file"
}

cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."

    local deleted=0

    # Clean up database backups
    while IFS= read -r file; do
        rm -f "$file"
        ((deleted++))
    done < <(find "$BACKUP_DIR" -name "db-backup-*.sql.gz" -mtime +$RETENTION_DAYS 2>/dev/null)

    # Clean up MinIO backups
    while IFS= read -r file; do
        rm -f "$file"
        ((deleted++))
    done < <(find "$BACKUP_DIR" -name "minio-backup-*.tar.gz" -mtime +$RETENTION_DAYS 2>/dev/null)

    # Clean up manifests
    while IFS= read -r file; do
        rm -f "$file"
        ((deleted++))
    done < <(find "$BACKUP_DIR" -name "backup-*.json" -mtime +$RETENTION_DAYS 2>/dev/null)

    if [ $deleted -gt 0 ]; then
        log_info "Cleaned up $deleted old backup files"
    else
        log_info "No old backups to clean up"
    fi
}

# ============================================
# Main
# ============================================

main() {
    echo "==================================="
    echo "CSMS Backup Process"
    echo "==================================="
    echo ""

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Generate timestamp
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)

    # Run backups
    backup_database
    backup_minio
    create_backup_manifest
    cleanup_old_backups

    echo ""
    echo "==================================="
    log_success "Backup process completed!"
    echo "==================================="
    echo ""
    echo "Backup location: $BACKUP_DIR"
    echo "Timestamp: $TIMESTAMP"
    echo ""
    echo "To restore, use:"
    echo "  ./restore.sh $TIMESTAMP"
}

# Run if not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
