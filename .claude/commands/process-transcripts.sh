#!/bin/bash

# Claude Custom Command: Process Transcripts to Notion
# Usage: Run from Claude with `/process-transcripts [days]`
# 
# This script automates the entire transcript processing workflow:
# 1. Fetches latest transcripts from Limitless
# 2. Converts them to drop zone format
# 3. Uploads them to Notion
# 4. Reports results with URLs

set -e  # Exit on any error

# Configuration
PROJECT_DIR="/home/craigmbrown/Project"
LIFELOG_DIR="$PROJECT_DIR/Limitless-Lifelog-Manager"
DROPZONE_DIR="$PROJECT_DIR/drop-zones"
STAGING_DIR="$DROPZONE_DIR/staging"
ARCHIVE_DIR="$LIFELOG_DIR/transcripts_archive"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
DAYS=${1:-1}  # Default to 1 day if not specified

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}    📝 Transcript Processing Pipeline${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Fetch latest transcripts
echo -e "${YELLOW}[1/5]${NC} Fetching transcripts from last $DAYS day(s)..."
cd "$LIFELOG_DIR"

# Check if lifelog command exists
if command -v lifelog &> /dev/null; then
    lifelog --days "$DAYS" --verbose || {
        echo -e "${YELLOW}⚠️  Lifelog fetch completed (may already be up to date)${NC}"
    }
else
    echo -e "${YELLOW}⚠️  Lifelog command not found, using existing archive${NC}"
fi

# Step 2: Find latest transcript files
echo -e "${YELLOW}[2/5]${NC} Finding transcript files..."
TODAY=$(date +%Y-%m-%d)
TRANSCRIPT_DIR="$ARCHIVE_DIR/$TODAY"

if [ ! -d "$TRANSCRIPT_DIR" ]; then
    # Try yesterday if today's directory doesn't exist
    YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)
    TRANSCRIPT_DIR="$ARCHIVE_DIR/$YESTERDAY"
fi

if [ ! -d "$TRANSCRIPT_DIR" ]; then
    echo -e "${RED}❌ No transcript directory found for recent dates${NC}"
    echo "Checked: $ARCHIVE_DIR/$TODAY and $ARCHIVE_DIR/$YESTERDAY"
    exit 1
fi

TRANSCRIPT_COUNT=$(find "$TRANSCRIPT_DIR" -name "*.json" -type f 2>/dev/null | wc -l)
echo -e "${GREEN}✓${NC} Found $TRANSCRIPT_COUNT transcript(s) in $TRANSCRIPT_DIR"

# Step 3: Prepare staging directory
echo -e "${YELLOW}[3/5]${NC} Preparing staging directory..."
cd "$DROPZONE_DIR"

# Backup existing staging files
if [ "$(ls -A $STAGING_DIR/*.json 2>/dev/null | wc -l)" -gt 0 ]; then
    BACKUP_DIR="$STAGING_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    mv "$STAGING_DIR"/*.json "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${YELLOW}  → Backed up existing files to $BACKUP_DIR${NC}"
fi

# Clear queue and hashes for fresh start
echo '[]' > "$STAGING_DIR/queue.json"
echo '{"hashes": []}' > "$DROPZONE_DIR/drop-zones/staging/processed_hashes.json"

# Step 4: Convert and stage transcripts
echo -e "${YELLOW}[4/5]${NC} Converting transcripts to drop zone format..."

# Python script to convert transcripts
python3 << 'PYTHON_SCRIPT'
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Configuration
archive_dir = sys.argv[1] if len(sys.argv) > 1 else "/home/craigmbrown/Project/Limitless-Lifelog-Manager/transcripts_archive"
staging_dir = "/home/craigmbrown/Project/drop-zones/staging"
today = datetime.now().strftime("%Y-%m-%d")

# Find transcript directory
transcript_dir = Path(archive_dir) / today
if not transcript_dir.exists():
    # Try yesterday
    from datetime import timedelta
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    transcript_dir = Path(archive_dir) / yesterday

if not transcript_dir.exists():
    print(f"❌ No transcript directory found")
    sys.exit(1)

# Process each transcript
processed = 0
errors = 0

for transcript_file in transcript_dir.glob("*.json"):
    try:
        with open(transcript_file, 'r') as f:
            transcript = json.load(f)
        
        # Skip if not a valid transcript
        if not transcript.get('id') or not transcript.get('markdown', transcript.get('content')):
            continue
            
        # Convert to drop zone format
        drop_zone_item = {
            "type": "Research",
            "title": f"📝 Transcript - {transcript.get('title', 'Untitled')[:50]}",
            "content": transcript.get('markdown', transcript.get('content', '')),
            "metadata": {
                "source": "lifelog",
                "transcript_id": transcript.get('id'),
                "date": transcript.get('startTime', today),
                "duration": f"{transcript.get('startTime', '')} to {transcript.get('endTime', '')}",
                "processed_at": datetime.now().isoformat(),
                "original_file": transcript_file.name
            }
        }
        
        # Save to staging
        output_file = Path(staging_dir) / f"transcript_{transcript.get('id', 'unknown')}.json"
        with open(output_file, 'w') as f:
            json.dump(drop_zone_item, f, indent=2)
        
        processed += 1
        print(f"  ✓ Processed: {transcript.get('title', 'Untitled')[:40]}...")
        
    except Exception as e:
        errors += 1
        print(f"  ✗ Error processing {transcript_file.name}: {str(e)}")

print(f"\n📊 Summary: {processed} processed, {errors} errors")
PYTHON_SCRIPT "$TRANSCRIPT_DIR"

# Step 5: Upload to Notion
echo -e "${YELLOW}[5/5]${NC} Uploading to Notion..."
cd "$DROPZONE_DIR"

# Run batch upload and capture output
UPLOAD_OUTPUT=$(python3 batch_upload.py --process-staging 2>&1)

# Extract URLs from output
echo "$UPLOAD_OUTPUT" | grep -E "URL:|Successfully uploaded:" | while read -r line; do
    if [[ $line == *"URL:"* ]]; then
        URL=$(echo "$line" | grep -oE "https://[^ ]+")
        echo -e "${GREEN}  🔗 $URL${NC}"
    elif [[ $line == *"Successfully uploaded:"* ]]; then
        TITLE=$(echo "$line" | sed 's/.*Successfully uploaded: //')
        echo -e "${BLUE}  📄 $TITLE${NC}"
    fi
done

# Final summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if upload was successful
if echo "$UPLOAD_OUTPUT" | grep -q "Upload process complete"; then
    # Extract statistics
    UPLOADED=$(echo "$UPLOAD_OUTPUT" | grep -oE "Uploaded: [0-9]+" | grep -oE "[0-9]+")
    FAILED=$(echo "$UPLOAD_OUTPUT" | grep -oE "Failed: [0-9]+" | grep -oE "[0-9]+")
    
    echo -e "${GREEN}✅ Upload Complete!${NC}"
    echo -e "  • Uploaded: ${GREEN}$UPLOADED${NC}"
    echo -e "  • Failed: ${RED}$FAILED${NC}"
    
    # Send WhatsApp notification if available
    if command -v python3 &> /dev/null && [ "$UPLOADED" -gt 0 ]; then
        python3 << 'NOTIFY'
import subprocess
import sys
try:
    uploaded = sys.argv[1] if len(sys.argv) > 1 else "0"
    message = f"📝 Transcript Upload Complete!\n✅ {uploaded} transcripts uploaded to Notion\n🔗 Check your Notion database"
    # This would call WhatsApp notification if configured
    # For now, just print
    print(f"\n📱 Notification: {message}")
except:
    pass
NOTIFY "$UPLOADED"
    fi
else
    echo -e "${YELLOW}⚠️  Upload may have completed with issues. Check output above.${NC}"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📚 For detailed logs, check: $DROPZONE_DIR/drop-zones/archived/"
echo "📖 Documentation: $DROPZONE_DIR/TRANSCRIPT_PROCESSING_WORKFLOW.md"