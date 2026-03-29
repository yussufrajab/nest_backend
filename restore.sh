#!/bin/bash

set -e

# ============================================
# CSMS Restore Script
# Restores PostgreSQL database and MinIO documents from backup
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
    DB_USER=$(echo "$db_url" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo "$db_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo "$db_url" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$db_url" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$db_url" | sed -n 's/.*\/\([^?]*\).*/\1/p')
}

list_backups() {
    log_info "Available backups:"
    echo ""

    local backups=()
    while IFS= read -r file; do
        local timestamp
        timestamp=$(basename "$file" | sed 's/backup-\(.*\)\.json/\1/')
        backups+=("$timestamp")
    done < <(find "$BACKUP_DIR" -name "backup-*.json" -type f 2>/dev/null | sort -r)

    if [ ${#backups[@]} -eq 0 ]; then
        log_warning "No backups found in $BACKUP_DIR"
        exit 1
    fi

    printf "%-20s %-15s\n" "Timestamp" "Date"
    echo "-------------------------------------------"
    for ts in "${backups[@]}"; do
        local manifest_file="$BACKUP_DIR/backup-${ts}.json"
        if [ -f "$manifest_file" ]; then
            local date_str
            date_str=$(date -d "${ts:0:8} ${ts:9:2}:${ts:11:2}:${ts:13:2}" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "Unknown")
            printf "%-20s %-15s\n" "$ts" "$date_str"
        fi
    done
    echo ""
}

# ============================================
# Restore Functions
# ============================================

restore_database() {
    local timestamp="$1"
    local backup_file="$BACKUP_DIR/db-backup-${timestamp}.sql.gz"

    if [ ! -f "$backup_file" ]; then
        log_error "Database backup not found: $backup_file"
        exit 1
    fi

    log_info "Restoring database from: $backup_file"

    local db_url
    db_url=$(get_database_url)
    parse_db_connection "$db_url"

    log_warning "This will OVERWRITE the existing database: $DB_NAME"
    read -p "Are you sure? Type 'yes' to continue: " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi

    # Drop and recreate database
    log_info "Dropping existing database..."
    PGPASSWORD="$DB_PASS" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d postgres \
        -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" 2>/dev/null || {
        log_error "Failed to drop database"
        exit 1
    }

    log_info "Creating new database..."
    PGPASSWORD="$DB_PASS" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d postgres \
        -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null || {
        log_error "Failed to create database"
        exit 1
    }

    # Restore from backup
    log_info "Restoring data..."
    if zcat "$backup_file" | PGPASSWORD="$DB_PASS" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" 2>/tmp/restore_errors; then
        log_success "Database restore completed"
    else
        log_error "Database restore failed"
        if [ -f /tmp/restore_errors ]; then
            cat /tmp/restore_errors
        fi
        exit 1
    fi
}

restore_minio() {
    local timestamp="$1"
    local backup_file="$BACKUP_DIR/minio-backup-${timestamp}.tar.gz"

    if [ ! -f "$backup_file" ]; then
        log_warning "MinIO backup not found: $backup_file (skipping)"
        return
    fi

    log_info "Restoring MinIO data from: $backup_file"

    if [ ! -d "$S3_DATA_DIR" ]; then
        log_info "Creating MinIO data directory: $S3_DATA_DIR"
        mkdir -p "$S3_DATA_DIR"
    fi

    log_warning "This will OVERWRITE existing MinIO data"
    read -p "Are you sure? Type 'yes' to continue: " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "MinIO restore skipped"
        return
    fi

    # Clear existing data
    log_info "Clearing existing MinIO data..."
    rm -rf "${S3_DATA_DIR:?}/"*

    # Extract backup
    log_info "Extracting MinIO data..."
    if tar -xzf "$backup_file" -C "$S3_DATA_DIR" 2>/tmp/tar_errors; then
        log_success "MinIO restore completed"
    else
        log_error "MinIO restore failed"
        if [ -f /tmp/tar_errors ]; then
            cat /tmp/tar_errors
        fi
        exit 1
    fi
}

# ============================================
# Main
# ============================================

main() {
    echo "==================================="
    echo "CSMS Restore Process"
    echo "==================================="
    echo ""

    if [ $# -eq 0 ]; then
        # No timestamp provided, list available backups
        list_backups
        echo "Usage: $0 <timestamp>"
        echo ""
        echo "Example: $0 20250329-120000"
        exit 0
    fi

    local TIMESTAMP="$1"

    # Verify backup exists
    local manifest_file="$BACKUP_DIR/backup-${TIMESTAMP}.json"
    if [ ! -f "$manifest_file" ]; then
        log_error "Backup not found for timestamp: $TIMESTAMP"
        echo ""
        list_backups
        exit 1
    fi

    log_info "Starting restore from backup: $TIMESTAMP"

    # Run restores
    restore_database "$TIMESTAMP"
    restore_minio "$TIMESTAMP"

    echo ""
    echo "==================================="
    log_success "Restore process completed!"
    echo "==================================="
    echo ""
    echo "Note: You may need to restart the application:"
    echo "  pm2 restart all"
}

# Run if not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
