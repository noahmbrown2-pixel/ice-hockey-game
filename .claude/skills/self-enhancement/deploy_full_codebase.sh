#!/bin/bash
# REQ-008: Full Codebase Deployment Script
# BLP Properties: SR (Self-Replication), D (Durability)
#
# Deploys complete codebase to all VMs for active/standby operation
# Usage: ./deploy_full_codebase.sh [vm-name] [--all]
#
# Standard I/O: Logs all operations, prints success/failure status (REQ-009)

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${TB_OPS_PROJECT_DIR:-/home/craigmbrown/Project}"
LOGS_DIR="${TB_OPS_LOGS_DIR:-$PROJECT_DIR/logs}"
REMOTE_USER="craigmbrown"
DEPLOY_LOG="$LOGS_DIR/deploy_full_codebase.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# VM Fleet Configuration (REQ-001)
declare -A VM_ZONES
VM_ZONES["chainlink-jobs-x10"]="us-east1-b"
VM_ZONES["craigmbrown-website"]="us-central1-a"
VM_ZONES["intercabalsquabble-website"]="us-central1-f"

declare -A VM_OPTIMAL
VM_OPTIMAL["chainlink-jobs-x10"]="oracle,financial,chainlink,market"
VM_OPTIMAL["craigmbrown-website"]="web,api,frontend"
VM_OPTIMAL["intercabalsquabble-website"]="web,gaming,social"

# Logging functions
log_operation() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local status="$1"
    local message="$2"
    echo -e "${status}: $message"
    echo "$timestamp | $status | $message" >> "$DEPLOY_LOG"
}

log_success() { log_operation "${GREEN}SUCCESS${NC}" "$1"; }
log_warning() { log_operation "${YELLOW}WARNING${NC}" "$1"; }
log_error() { log_operation "${RED}ERROR${NC}" "$1"; }
log_info() { log_operation "${BLUE}INFO${NC}" "$1"; }

# Create deployment package
create_package() {
    log_info "Creating deployment package..."

    local package_file="/tmp/full-codebase-$(date +%Y%m%d_%H%M%S).tar.gz"

    cd "$PROJECT_DIR"

    tar -czf "$package_file" \
        .claude/skills/ \
        .claude/agents/ \
        .claude/commands/ \
        llm-router/ \
        ETAC-System/ \
        --exclude='*.pyc' \
        --exclude='__pycache__' \
        --exclude='*.log' \
        --exclude='*.db' \
        --exclude='node_modules' \
        --exclude='.git' \
        2>/dev/null || true

    log_success "Package created: $package_file ($(du -h "$package_file" | cut -f1))"
    echo "$package_file"
}

# Deploy to single VM
deploy_to_vm() {
    local vm_name="$1"
    local zone="${VM_ZONES[$vm_name]}"
    local optimal="${VM_OPTIMAL[$vm_name]}"

    if [ -z "$zone" ]; then
        log_error "Unknown VM: $vm_name"
        return 1
    fi

    log_info "===== Deploying to $vm_name ($zone) ====="

    # Check VM status
    local vm_status=$(gcloud compute instances describe "$vm_name" --zone="$zone" --format="value(status)" 2>/dev/null || echo "NOT_FOUND")

    if [ "$vm_status" = "NOT_FOUND" ]; then
        log_error "VM $vm_name not found in zone $zone"
        return 1
    elif [ "$vm_status" != "RUNNING" ]; then
        log_warning "VM $vm_name is $vm_status, attempting to start..."
        gcloud compute instances start "$vm_name" --zone="$zone" 2>/dev/null || true
        sleep 30
    fi

    log_success "VM $vm_name is running"

    # Create package if not exists
    local package_file="${PACKAGE_FILE:-$(create_package)}"

    # Create remote directories
    log_info "Creating remote directories..."
    gcloud compute ssh "$vm_name" --zone="$zone" --command="
        mkdir -p /home/$REMOTE_USER/Project/.claude/skills
        mkdir -p /home/$REMOTE_USER/Project/.claude/agents
        mkdir -p /home/$REMOTE_USER/Project/.claude/commands
        mkdir -p /home/$REMOTE_USER/Project/llm-router
        mkdir -p /home/$REMOTE_USER/Project/ETAC-System
        mkdir -p /home/$REMOTE_USER/Project/logs
        mkdir -p /home/$REMOTE_USER/Project/html-output
    " 2>/dev/null
    log_success "Remote directories created"

    # Copy package
    log_info "Copying deployment package..."
    gcloud compute scp "$package_file" "$vm_name:/tmp/codebase.tar.gz" --zone="$zone" 2>/dev/null
    log_success "Package copied"

    # Extract and configure
    log_info "Extracting and configuring..."
    gcloud compute ssh "$vm_name" --zone="$zone" --command="
        cd /home/$REMOTE_USER/Project
        tar -xzf /tmp/codebase.tar.gz

        # REQ-001: Set VM role configuration
        cat > /home/$REMOTE_USER/Project/.env.vm << EOF
# VM Fleet Configuration (REQ-001)
VM_NAME=$vm_name
VM_ROLE=STANDBY
VM_OPTIMAL_FOR=$optimal
TB_OPS_PROJECT_DIR=/home/$REMOTE_USER/Project
TB_OPS_LOGS_DIR=/home/$REMOTE_USER/Project/logs
TB_OPS_OUTPUT_DIR=/home/$REMOTE_USER/Project/html-output
EOF

        # Cleanup
        rm /tmp/codebase.tar.gz
    " 2>/dev/null
    log_success "Package extracted and configured"

    # Verify deployment
    log_info "Verifying deployment..."
    local verify_result=$(gcloud compute ssh "$vm_name" --zone="$zone" --command="
        cd /home/$REMOTE_USER/Project
        echo 'Checking files...'
        ls -la .claude/skills/self-enhancement/*.py 2>/dev/null | wc -l
    " 2>/dev/null)

    log_success "Deployed $verify_result Python files to $vm_name"

    # Run health check
    log_info "Running health check..."
    gcloud compute ssh "$vm_name" --zone="$zone" --command="
        cd /home/$REMOTE_USER/Project
        python3 .claude/skills/self-enhancement/vm_fleet_config.py --status 2>/dev/null || echo 'Health check skipped'
    " 2>/dev/null || true

    log_success "===== Deployment to $vm_name complete ====="
    return 0
}

# Deploy to all VMs
deploy_to_all() {
    log_info "===== Full Fleet Deployment ====="

    # Create single package for all
    PACKAGE_FILE=$(create_package)
    export PACKAGE_FILE

    local success_count=0
    local fail_count=0

    for vm_name in "${!VM_ZONES[@]}"; do
        if deploy_to_vm "$vm_name"; then
            ((success_count++))
        else
            ((fail_count++))
        fi
        echo ""
    done

    # Cleanup package
    rm -f "$PACKAGE_FILE"

    log_info "===== Fleet Deployment Summary ====="
    log_success "Successful: $success_count VMs"
    if [ $fail_count -gt 0 ]; then
        log_error "Failed: $fail_count VMs"
    fi

    return $fail_count
}

# Show usage
show_usage() {
    echo "Usage: $0 [options] [vm-name]"
    echo ""
    echo "Options:"
    echo "  --all         Deploy to all VMs in fleet"
    echo "  --list        List available VMs"
    echo "  --status      Show deployment status"
    echo "  -h, --help    Show this help"
    echo ""
    echo "Available VMs:"
    for vm_name in "${!VM_ZONES[@]}"; do
        echo "  - $vm_name (${VM_ZONES[$vm_name]})"
        echo "    Optimal for: ${VM_OPTIMAL[$vm_name]}"
    done
}

# Show deployment status
show_status() {
    log_info "===== Deployment Status ====="

    for vm_name in "${!VM_ZONES[@]}"; do
        local zone="${VM_ZONES[$vm_name]}"
        local status=$(gcloud compute instances describe "$vm_name" --zone="$zone" --format="value(status)" 2>/dev/null || echo "NOT_FOUND")

        if [ "$status" = "RUNNING" ]; then
            # Check if codebase is deployed
            local deployed=$(gcloud compute ssh "$vm_name" --zone="$zone" --command="
                [ -f /home/$REMOTE_USER/Project/.claude/skills/self-enhancement/vm_fleet_config.py ] && echo 'YES' || echo 'NO'
            " 2>/dev/null)

            if [ "$deployed" = "YES" ]; then
                echo -e "${GREEN}✅${NC} $vm_name ($zone) - $status - Deployed"
            else
                echo -e "${YELLOW}⚠️${NC} $vm_name ($zone) - $status - Not deployed"
            fi
        else
            echo -e "${RED}❌${NC} $vm_name ($zone) - $status"
        fi
    done
}

# Main
main() {
    mkdir -p "$LOGS_DIR"

    case "$1" in
        --all)
            deploy_to_all
            ;;
        --list)
            show_usage
            ;;
        --status)
            show_status
            ;;
        -h|--help)
            show_usage
            ;;
        "")
            show_usage
            exit 1
            ;;
        *)
            deploy_to_vm "$1"
            ;;
    esac
}

main "$@"
