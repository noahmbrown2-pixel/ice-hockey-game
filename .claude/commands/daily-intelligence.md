# Daily Intelligence Aggregator - Autonomous ZTE Workflow

<!-- @REQ-WKFL-013: Daily intelligence synthesis from multiple sources | BLP: [Autonomy: 100%, Durability: High, Self-Organization: Adaptive] -->

**Description:** Aggregates intelligence from Gmail, GitHub starred repos, X bookmarks (BTC/AI only), and Limitless lifelogs. Performs multi-LLM synthesis and delivers insights to all channels: WhatsApp, HTML Dashboard, Notion, Email, and Nostr.

**Autonomy Level:** FULLY AUTONOMOUS (100% - no human intervention required)

**Schedule:** Daily at 06:00 UTC

---

## Workflow Steps

### 1. Initialize Collection
<!-- @REQ-WKFL-014: Set date range and initialize data structures | BLP: [Autonomy: 100%, Durability: Stateful, Alignment: Consistent] -->

```python
# Set collection window (last 24 hours)
collection_start = datetime.now() - timedelta(hours=24)
collection_end = datetime.now()

# Initialize collection buckets
intelligence_items = {
    "gmail": [],
    "github": [],
    "x_bookmarks": [],
    "lifelogs": []
}

# Load deduplication cache
seen_hashes = load_dedup_cache()
```

### 2. Parallel Data Collection
<!-- @REQ-WKFL-015: Fetch from all sources concurrently with async | BLP: [Autonomy: 100%, Durability: Resilient, Self-Organization: Efficient] -->

**Concurrent Fetching:**
```python
import asyncio

async def collect_all_sources():
    results = await asyncio.gather(
        fetch_gmail_unread(hours=24),
        fetch_github_starred(since=collection_start),
        fetch_x_bookmarks(filters=["BTC", "AI"]),
        fetch_lifelogs(date=yesterday),
        return_exceptions=True  # Don't fail entire collection if one source fails
    )
    return results
```

#### 2.1 Gmail Collection
<!-- @REQ-WKFL-016: Fetch unread emails from last 24 hours | BLP: [Autonomy: 100%, Durability: API-backed, Alignment: Filtered] -->

```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Query: Unread emails from last 24 hours
query = f"is:unread after:{int(collection_start.timestamp())}"

service = build('gmail', 'v1', credentials=credentials)
messages = service.users().messages().list(userId='me', q=query).execute()

for msg in messages.get('messages', []):
    email = service.users().messages().get(userId='me', id=msg['id']).execute()
    intelligence_items["gmail"].append({
        "id": msg['id'],
        "subject": extract_subject(email),
        "from": extract_sender(email),
        "snippet": email['snippet'],
        "url": f"https://mail.google.com/mail/u/0/#inbox/{msg['id']}",
        "collected_at": datetime.now().isoformat()
    })
```

#### 2.2 GitHub Starred Repos
<!-- @REQ-WKFL-017: Fetch repos starred in last 24 hours | BLP: [Autonomy: 100%, Durability: API-backed, Alignment: Timestamped] -->

```bash
# Fetch starred repos since yesterday
gh api \
  -H "Accept: application/vnd.github+json" \
  /user/starred \
  --jq '.[] | select(.starred_at >= "'$collection_start'") | {id, full_name, description, html_url, language, stargazers_count, topics, starred_at}'
```

#### 2.3 X Bookmarks (BTC/AI Filter)
<!-- @REQ-WKFL-018: Fetch X bookmarks, filter for BTC and AI topics only | BLP: [Autonomy: 100%, Durability: Filtered, Alignment: Focused] -->

**Filter Keywords:**
```python
BTC_KEYWORDS = [
    "bitcoin", "btc", "crypto", "cryptocurrency", "defi", "eth", "ethereum",
    "satoshi", "mining", "blockchain", "lightning", "ordinals", "runes"
]

AI_KEYWORDS = [
    "ai", "llm", "gpt", "claude", "anthropic", "openai", "agent", "agents",
    "agi", "ml", "machine learning", "neural", "transformer", "reasoning",
    "multimodal", "embeddings", "rag", "fine-tuning"
]

def filter_bookmark(text: str) -> Optional[str]:
    """Returns 'btc', 'ai', or None based on keyword matching."""
    text_lower = text.lower()

    btc_matches = sum(1 for kw in BTC_KEYWORDS if kw in text_lower)
    ai_matches = sum(1 for kw in AI_KEYWORDS if kw in text_lower)

    if btc_matches >= 2:
        return "btc"
    elif ai_matches >= 2:
        return "ai"
    else:
        return None
```

**X API Collection:**
```python
# Fetch bookmarks (last 50)
bookmarks = x_api.get_bookmarks(max_results=50)

for bookmark in bookmarks:
    category = filter_bookmark(bookmark['text'])
    if category:  # Only keep BTC or AI bookmarks
        intelligence_items["x_bookmarks"].append({
            "id": bookmark['id'],
            "author": bookmark['author_username'],
            "text": bookmark['text'],
            "url": f"https://twitter.com/{bookmark['author_username']}/status/{bookmark['id']}",
            "category": category,
            "engagement": bookmark['public_metrics'],
            "collected_at": datetime.now().isoformat()
        })
```

#### 2.4 Limitless Lifelogs
<!-- @REQ-WKFL-019: Fetch lifelogs from yesterday | BLP: [Autonomy: 100%, Durability: Time-bound, Alignment: Contextual] -->

```bash
# Fetch yesterday's lifelogs
limitless-cli query \
  --date $(date -d yesterday +%Y-%m-%d) \
  --format json \
  > /tmp/yesterday_lifelogs.json
```

### 3. Deduplication & Categorization
<!-- @REQ-WKFL-020: Remove duplicates and categorize by topic | BLP: [Autonomy: 100%, Durability: Hash-based, Self-Organization: Learning] -->

**Deduplication:**
```python
import hashlib

def deduplicate(items: List[Dict]) -> List[Dict]:
    """Remove duplicates based on normalized URL + title hash."""
    seen = set()
    unique = []

    for item in items:
        # Normalize URL and title
        url_normalized = item.get('url', '').lower().rstrip('/')
        title_normalized = item.get('title', item.get('subject', '')).lower().strip()

        # Generate hash
        content_hash = hashlib.sha256(
            f"{url_normalized}|{title_normalized}".encode()
        ).hexdigest()

        if content_hash not in seen:
            seen.add(content_hash)
            unique.append(item)
            item['content_hash'] = content_hash

    return unique
```

**Categorization (LLM-based):**
```python
# Prompt for categorization
categorization_prompt = f"""
Categorize these intelligence items into BTC, AI, or Other:

{json.dumps(items, indent=2)}

For each item, return:
{{
  "id": "...",
  "category": "btc|ai|other",
  "tags": ["tag1", "tag2"],
  "relevance_score": 0.0-1.0
}}
"""

# Use Sonnet 4.5 for fast categorization
categories = await anthropic_sonnet_4_5(categorization_prompt)
```

### 4. Priority Ranking
<!-- @REQ-WKFL-021: Score items by relevance, recency, and source trust | BLP: [Autonomy: 100%, Durability: Weighted, Self-Organization: Adaptive] -->

**Priority Scoring Formula:**
```python
def calculate_priority(item: Dict) -> float:
    """
    Priority = 0.4 * relevance + 0.3 * recency + 0.3 * source_trust

    Relevance: 0.0-1.0 (from LLM categorization)
    Recency: 1.0 if < 6hr old, 0.5 if < 18hr, 0.2 if < 24hr
    Source Trust: 0.9 (github), 0.8 (gmail), 0.7 (x), 0.6 (lifelog)
    """
    relevance = item.get('relevance_score', 0.5)

    # Recency score
    age_hours = (datetime.now() - parse_iso(item['collected_at'])).total_seconds() / 3600
    if age_hours < 6:
        recency = 1.0
    elif age_hours < 18:
        recency = 0.5
    else:
        recency = 0.2

    # Source trust
    source_trust_map = {
        "github": 0.9,
        "gmail": 0.8,
        "x_bookmarks": 0.7,
        "lifelogs": 0.6
    }
    source_trust = source_trust_map.get(item['source'], 0.5)

    priority = 0.4 * relevance + 0.3 * recency + 0.3 * source_trust
    return priority
```

### 5. Multi-LLM Synthesis
<!-- @REQ-WKFL-022: Use multiple LLMs for comprehensive analysis | BLP: [Autonomy: 100%, Durability: Multi-Model, Self-Organization: Ensemble] -->

**Synthesis Strategy:**
```python
# Route by category for domain expertise
synthesis_results = {}

# BTC items → Claude Opus 4.5 (best reasoning)
btc_items = [i for i in all_items if i['category'] == 'btc']
if btc_items:
    synthesis_results['btc'] = await anthropic_opus_4_5(btc_synthesis_prompt(btc_items))

# AI items → Claude Sonnet 4.5 (fast + capable)
ai_items = [i for i in all_items if i['category'] == 'ai']
if ai_items:
    synthesis_results['ai'] = await anthropic_sonnet_4_5(ai_synthesis_prompt(ai_items))

# Other → Haiku (efficient)
other_items = [i for i in all_items if i['category'] == 'other']
if other_items:
    synthesis_results['other'] = await anthropic_haiku_4(other_synthesis_prompt(other_items))
```

**Synthesis Prompt Template:**
```
You are synthesizing daily intelligence from multiple sources.

Intelligence Items ({count}):
{items_json}

Your task:
1. Identify the top 3-5 key themes/trends
2. Extract actionable insights
3. Flag contradictions or conflicts
4. Suggest follow-up actions
5. Generate executive summary (2-3 paragraphs)

Return structured JSON:
{
  "executive_summary": "...",
  "key_themes": [
    {"theme": "...", "significance": 0.0-1.0, "supporting_items": ["id1", "id2"]}
  ],
  "insights": [
    {"insight": "...", "actionable": true/false, "priority": "high|medium|low"}
  ],
  "contradictions": [
    {"claim_a": "...", "claim_b": "...", "source_a": "...", "source_b": "..."}
  ],
  "action_items": [
    {"action": "...", "deadline": "...", "importance": 0.0-1.0}
  ]
}
```

### 6. Generate Artifacts
<!-- @REQ-WKFL-023: Create deliverables for all channels | BLP: [Autonomy: 100%, Durability: Multi-Format, Alignment: Comprehensive] -->

#### 6.1 HTML Dashboard
```python
# Generate dark-themed responsive dashboard
dashboard_html = render_template(
    "daily_intelligence_dashboard.html",
    date=today,
    summary=synthesis_results,
    btc_count=len(btc_items),
    ai_count=len(ai_items),
    other_count=len(other_items),
    top_items=sorted(all_items, key=lambda x: x['priority'], reverse=True)[:10],
    themes=synthesis_results.get('key_themes', []),
    insights=synthesis_results.get('insights', [])
)

dashboard_path = f"/home/craigmbrown/Project/html-output/{today}-daily-intelligence.html"
with open(dashboard_path, 'w') as f:
    f.write(dashboard_html)

# Generate TinyURL
dashboard_url = f"http://34.58.12.50:8080/{today}-daily-intelligence.html"
tinyurl = create_tinyurl(dashboard_url)
```

#### 6.2 Email Report (Full Details)
```python
email_html = render_template(
    "email_daily_intelligence.html",
    summary=synthesis_results,
    items_by_category={
        "BTC": btc_items,
        "AI": ai_items,
        "Other": other_items
    },
    dashboard_link=tinyurl,
    metrics={
        "total_items": len(all_items),
        "sources_queried": 4,
        "processing_time": processing_time
    }
)
```

#### 6.3 WhatsApp Summary
```python
whatsapp_message = f"""
📊 Daily Intelligence ({today})

Total Items: {len(all_items)}
- 💰 BTC: {len(btc_items)}
- 🤖 AI: {len(ai_items)}
- 📌 Other: {len(other_items)}

🔑 Top Insights:
{format_top_insights(synthesis_results['insights'][:3])}

📈 Key Themes:
{format_themes(synthesis_results['key_themes'][:3])}

📊 Dashboard: {tinyurl}

---
Auto-generated at {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}
"""
```

#### 6.4 Notion Database Entry
```python
notion_page = {
    "parent": {"database_id": NOTION_INTELLIGENCE_DB_ID},
    "properties": {
        "Title": {"title": [{"text": {"content": f"Daily Intelligence - {today}"}}]},
        "Date": {"date": {"start": today}},
        "BTC Count": {"number": len(btc_items)},
        "AI Count": {"number": len(ai_items)},
        "Total Items": {"number": len(all_items)},
        "Dashboard": {"url": dashboard_url},
        "Status": {"select": {"name": "completed"}}
    },
    "children": [
        # Rich text content with synthesis results
        notion_block_summary(synthesis_results),
        notion_block_themes(synthesis_results['key_themes']),
        notion_block_insights(synthesis_results['insights']),
        notion_block_items(all_items[:20])
    ]
}
```

#### 6.5 Nostr Post (Public Highlights)
```python
nostr_post = f"""
📊 Daily Intelligence - {today}

{synthesis_results['executive_summary'][:200]}...

🔑 Top Trends:
{format_themes_short(synthesis_results['key_themes'][:3])}

📚 Sources: Gmail, GitHub, X, Lifelogs
📊 Full report: {tinyurl}

#bitcoin #ai #intelligence #dailyreport
"""
```

### 7. Multi-Channel Delivery
<!-- @REQ-WKFL-024: Parallel delivery to all channels with retry | BLP: [Autonomy: 100%, Durability: Resilient, Alignment: Multi-Path] -->

```python
async def deliver_to_all_channels():
    """Deliver intelligence report to all channels in parallel."""
    delivery_tasks = [
        send_email(to="craigmbrown@gmail.com", subject=f"Daily Intelligence - {today}", html=email_html),
        send_whatsapp(message=whatsapp_message),
        create_notion_page(page=notion_page),
        post_to_nostr(content=nostr_post),
        comment_on_github_issue(repo="craigmbrown/ETAC-System", issue_number=DAILY_INTEL_ISSUE, comment=github_comment)
    ]

    # Run all deliveries concurrently with 30s timeout each
    results = await asyncio.gather(*delivery_tasks, return_exceptions=True)

    # Track delivery status
    delivery_status = {
        "email": isinstance(results[0], Exception) == False,
        "whatsapp": isinstance(results[1], Exception) == False,
        "notion": isinstance(results[2], Exception) == False,
        "nostr": isinstance(results[3], Exception) == False,
        "github": isinstance(results[4], Exception) == False
    }

    return delivery_status
```

**Retry Logic for Failed Channels:**
```python
failed_channels = [ch for ch, success in delivery_status.items() if not success]

if failed_channels:
    # Queue for retry in 1 hour
    for channel in failed_channels:
        queue_retry(
            workflow="daily_intelligence",
            channel=channel,
            payload=get_channel_payload(channel),
            retry_at=datetime.now() + timedelta(hours=1)
        )

    # Log warning
    logger.warning(f"Failed to deliver to: {', '.join(failed_channels)}")
```

---

## Exception Handling

<!-- @REQ-WKFL-025: Graceful degradation for all error scenarios | BLP: [Durability: Self-Healing, Alignment: Reliable] -->

### Source API Failure
- **Detection:** HTTP errors, timeouts during collection
- **Recovery:** Skip source, proceed with others
- **Notification:** Log warning (no user alert)
- **Degradation:** Continue with partial data

### Rate Limit Hit
- **Detection:** 429 response from any API
- **Recovery:** Wait for rate limit reset OR skip if time-constrained
- **Notification:** Email if multiple sources rate-limited
- **Degradation:** Use cached data if available

### Empty Results
- **Detection:** No items collected from any source
- **Recovery:** Generate "no intelligence today" report
- **Notification:** WhatsApp info message
- **Degradation:** Skip synthesis, send summary only

### LLM Synthesis Failure
- **Detection:** Timeout, error response from LLM
- **Recovery:** Use fallback template-based summary
- **Notification:** Log error, proceed with degraded output
- **Degradation:** Basic categorization instead of deep analysis

### Dashboard Generation Failure
- **Detection:** Template rendering error
- **Recovery:** Skip dashboard, deliver text-only reports
- **Notification:** Email warning to sysadmin
- **Degradation:** Plain text summary in all channels

### All Channels Delivery Failure
- **Detection:** All async delivery tasks fail
- **Recovery:** Store report in filesystem, retry hourly
- **Notification:** WhatsApp URGENT alert via fallback mechanism
- **Escalation:** Create high-priority GitHub issue

---

## State Persistence

<!-- @REQ-WKFL-026: Checkpoint-based recovery for long-running workflow | BLP: [Durability: Persistent, Alignment: Recoverable] -->

**Checkpoint Strategy:**
```python
checkpoints = {
    "collection_complete": False,
    "deduplication_complete": False,
    "synthesis_complete": False,
    "artifacts_generated": False,
    "delivery_attempted": False
}

def save_checkpoint(phase: str, data: Dict):
    """Save checkpoint to resume from failures."""
    checkpoint_path = f"/home/craigmbrown/Project/autonomous-zte-workflows/data/checkpoints/daily_intel_{today}.json"
    checkpoint = {
        "phase": phase,
        "timestamp": datetime.now().isoformat(),
        "data": data,
        "checkpoints": checkpoints
    }
    with open(checkpoint_path, 'w') as f:
        json.dump(checkpoint, f, indent=2)

def load_checkpoint() -> Optional[Dict]:
    """Load checkpoint if exists."""
    checkpoint_path = f"/home/craigmbrown/Project/autonomous-zte-workflows/data/checkpoints/daily_intel_{today}.json"
    if Path(checkpoint_path).exists():
        with open(checkpoint_path) as f:
            return json.load(f)
    return None
```

**Resume Logic:**
```python
checkpoint = load_checkpoint()

if checkpoint:
    # Resume from last successful phase
    if checkpoint["checkpoints"]["collection_complete"]:
        items = checkpoint["data"]["items"]
        # Skip to deduplication
    elif checkpoint["checkpoints"]["synthesis_complete"]:
        synthesis = checkpoint["data"]["synthesis"]
        # Skip to artifact generation
    # ... etc
```

---

## BLP Metrics

<!-- @REQ-WKFL-027: Track autonomy, durability, and self-organization | BLP: [Self-Organization: Measurable, Alignment: Optimizing] -->

### Autonomy Metrics
- **Full Autonomy Rate:** 100% (no human decisions)
- **Source Coverage:** % of configured sources successfully queried
- **Synthesis Success Rate:** % of items successfully categorized

### Durability Metrics
- **Completion Rate:** % of scheduled runs that complete
- **Partial Success Rate:** % of runs with at least one delivery channel
- **Recovery Time:** Average time to recover from API failures

### Self-Organization Metrics
- **Optimal Collection Time:** Learning best time to query each source
- **Source Priority:** Adaptive weighting based on item quality
- **LLM Selection:** Routing efficiency (cost vs quality)

**Metric Recording:**
```python
metrics.record({
    "workflow": "daily_intelligence",
    "date": today,
    "autonomy_source_coverage": successful_sources / total_sources,
    "durability_completion_rate": 1.0 if all_phases_complete else 0.0,
    "self_org_collection_efficiency": collection_time_seconds,
    "items_collected": len(all_items),
    "btc_count": len(btc_items),
    "ai_count": len(ai_items),
    "delivery_channels_success": sum(delivery_status.values()),
    "timestamp": datetime.now().isoformat()
})
```

---

## Configuration

**Location:** `/home/craigmbrown/Project/autonomous-zte-workflows/config/workflows.yaml`

```yaml
daily_intelligence:
  enabled: true
  schedule: "0 6 * * *"  # 06:00 UTC daily
  timeout: 600  # 10 minutes max

  sources:
    gmail:
      enabled: true
      lookback_hours: 24
      max_messages: 100

    github:
      enabled: true
      lookback_hours: 24

    x_bookmarks:
      enabled: true
      max_bookmarks: 50
      filters:
        btc_keywords: ["bitcoin", "btc", "crypto", "defi"]
        ai_keywords: ["ai", "llm", "gpt", "claude", "agent"]
        min_matches: 2

    lifelogs:
      enabled: true
      lookback_days: 1

  synthesis:
    llm_routing:
      btc: "anthropic_opus_4.5"
      ai: "anthropic_sonnet_4.5"
      other: "anthropic_haiku_4"

    priority_weights:
      relevance: 0.4
      recency: 0.3
      source_trust: 0.3

  delivery:
    channels:
      - email
      - whatsapp
      - notion
      - nostr
      - github

    retry_policy:
      max_attempts: 3
      retry_interval_hours: 1

  notion:
    database_id: "{NOTION_INTELLIGENCE_DB_ID}"
```

---

## Usage

**Manual Trigger:**
```bash
# Run daily intelligence now
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow daily_intelligence

# Test with specific date
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow daily_intelligence \
  --date 2025-12-12

# Retry failed deliveries
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow daily_intelligence \
  --retry-failed

# Show metrics
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow daily_intelligence \
  --metrics --days 30
```

**Cron Schedule:**
```bash
# Automatic daily execution at 06:00 UTC
0 6 * * * /usr/bin/python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py --workflow daily_intelligence >> /home/craigmbrown/Project/logs/daily_intel.log 2>&1
```

---

## Success Criteria

- **Collection Coverage:** > 95% of configured sources successfully queried
- **Processing Time:** < 10 minutes total (collection → delivery)
- **Synthesis Quality:** > 90% of items successfully categorized
- **Delivery Success:** 100% to at least one channel, 95% to all channels
- **Uptime:** 99% (max 3.6 hours downtime per month)
- **Data Loss:** 0% (all checkpoints recoverable)

---

**Auto-generated by Autonomous ZTE Workflows**
**Version:** 1.0.0
**Last Updated:** 2025-12-13
