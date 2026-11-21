#!/bin/bash
#
# Workflow Scheduler Service Installation Script
#
# BLP Coverage:
# - BLP-021 (Durability): Install as persistent system service
# - BLP-024 (Graceful Shutdown): Configure proper service management
#
# Usage:
#   sudo ./install_service.sh [install|uninstall|status]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
SERVICE_NAME="workflow-scheduler"
SERVICE_FILE="$SKILL_DIR/systemd/workflow-scheduler.service"
SYSTEMD_DIR="/etc/systemd/system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

create_directories() {
    log_info "Creating required directories..."

    mkdir -p "$SKILL_DIR/data"
    mkdir -p "$SKILL_DIR/logs"
    mkdir -p "$SKILL_DIR/config"

    # Set ownership
    chown -R craigmbrown:craigmbrown "$SKILL_DIR/data"
    chown -R craigmbrown:craigmbrown "$SKILL_DIR/logs"
    chown -R craigmbrown:craigmbrown "$SKILL_DIR/config"

    log_info "Directories created"
}

install_dependencies() {
    log_info "Checking Python dependencies..."

    # Check for required packages
    REQUIRED_PACKAGES=(croniter pytz pyyaml)

    for pkg in "${REQUIRED_PACKAGES[@]}"; do
        if ! /home/craigmbrown/Project/venv/bin/pip show "$pkg" > /dev/null 2>&1; then
            log_info "Installing $pkg..."
            /home/craigmbrown/Project/venv/bin/pip install "$pkg"
        else
            log_info "$pkg already installed"
        fi
    done
}

install_service() {
    check_root

    log_info "Installing Workflow Scheduler Service..."

    # Create directories
    create_directories

    # Install dependencies
    install_dependencies

    # Check if service file exists
    if [[ ! -f "$SERVICE_FILE" ]]; then
        log_error "Service file not found: $SERVICE_FILE"
        exit 1
    fi

    # Copy service file
    log_info "Copying service file to $SYSTEMD_DIR..."
    cp "$SERVICE_FILE" "$SYSTEMD_DIR/$SERVICE_NAME.service"

    # Reload systemd
    log_info "Reloading systemd daemon..."
    systemctl daemon-reload

    # Enable service
    log_info "Enabling $SERVICE_NAME service..."
    systemctl enable "$SERVICE_NAME"

    # Start service
    log_info "Starting $SERVICE_NAME service..."
    systemctl start "$SERVICE_NAME"

    # Check status
    sleep 2
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_info "✅ $SERVICE_NAME is running!"
        systemctl status "$SERVICE_NAME" --no-pager
    else
        log_error "Failed to start $SERVICE_NAME"
        journalctl -u "$SERVICE_NAME" -n 20 --no-pager
        exit 1
    fi
}

uninstall_service() {
    check_root

    log_info "Uninstalling Workflow Scheduler Service..."

    # Stop service if running
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_info "Stopping $SERVICE_NAME..."
        systemctl stop "$SERVICE_NAME"
    fi

    # Disable service
    if systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
        log_info "Disabling $SERVICE_NAME..."
        systemctl disable "$SERVICE_NAME"
    fi

    # Remove service file
    if [[ -f "$SYSTEMD_DIR/$SERVICE_NAME.service" ]]; then
        log_info "Removing service file..."
        rm "$SYSTEMD_DIR/$SERVICE_NAME.service"
    fi

    # Reload systemd
    systemctl daemon-reload

    log_info "✅ $SERVICE_NAME uninstalled"
}

show_status() {
    log_info "Workflow Scheduler Service Status"
    echo "=================================="

    if [[ -f "$SYSTEMD_DIR/$SERVICE_NAME.service" ]]; then
        echo "Service file: Installed"
    else
        echo "Service file: Not installed"
    fi

    if systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
        echo "Enabled: Yes"
    else
        echo "Enabled: No"
    fi

    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "Status: Running"
        echo ""
        systemctl status "$SERVICE_NAME" --no-pager
    else
        echo "Status: Stopped"
    fi

    echo ""
    echo "Recent logs:"
    journalctl -u "$SERVICE_NAME" -n 10 --no-pager 2>/dev/null || echo "No logs available"
}

show_usage() {
    echo "Usage: sudo $0 [install|uninstall|status|restart|logs]"
    echo ""
    echo "Commands:"
    echo "  install    - Install and start the service"
    echo "  uninstall  - Stop and remove the service"
    echo "  status     - Show service status"
    echo "  restart    - Restart the service"
    echo "  logs       - Show recent logs (follow mode)"
    echo ""
}

# Main
case "${1:-}" in
    install)
        install_service
        ;;
    uninstall)
        uninstall_service
        ;;
    status)
        show_status
        ;;
    restart)
        check_root
        log_info "Restarting $SERVICE_NAME..."
        systemctl restart "$SERVICE_NAME"
        sleep 2
        show_status
        ;;
    logs)
        journalctl -u "$SERVICE_NAME" -f
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
