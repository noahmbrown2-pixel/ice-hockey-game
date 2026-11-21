# X Bookmarks to Insights - Autonomous ZTE Workflow

<!-- @REQ-WKFL-053: XAI/Grok analysis of X bookmarks (BTC/AI only) | BLP: [Autonomy: 100%, Durability: High, Self-Organization: Trend-tracking] -->

**Description:** Fetches X/Twitter bookmarks, filters for BTC and AI topics only, performs deep analysis with XAI Grok-4 (2M context), identifies trends and contradictions, and delivers insights to all channels: WhatsApp, HTML Dashboard, Notion, Email, and Nostr.

**Autonomy Level:** FULLY AUTONOMOUS (100% - no human intervention)

**Schedule:** Daily at 10:00 UTC

---

## Workflow Steps

### 1. Fetch X Bookmarks
<!-- @REQ-WKFL-054: Retrieve recent bookmarks via X API or XAI fallback | BLP: [Autonomy: 100%, Durability: API-backed, Alignment: Source-flexible] -->

```python
def fetch_x_bookmarks(max_results=50) -> List[Dict]:
    """
    Fetch recent X/Twitter bookmarks.

    Primary: X API v2
    Fallback: XAI API with scraping
    """
    try:
        # Try X API v2 first
        bookmarks = fetch_via_x_api(max_results)
    except Exception as e:
        logger.warning(f"X API failed: {e}, using XAI fallback")
        bookmarks = fetch_via_xai_scraping(max_results)

    return bookmarks

def fetch_via_x_api(max_results: int) -> List[Dict]:
    """Fetch bookmarks via official X API v2."""
    import tweepy

    client = tweepy.Client(bearer_token=X_API_BEARER_TOKEN)

    # Fetch bookmarks
    response = client.get_bookmarks(
        max_results=max_results,
        tweet_fields=['created_at', 'public_metrics', 'entities', 'author_id'],
        expansions=['author_id', 'referenced_tweets.id'],
        user_fields=['username', 'name']
    )

    bookmarks = []
    for tweet in response.data:
        # Get author info
        author = next((u for u in response.includes['users'] if u.id == tweet.author_id), None)

        bookmarks.append({
            "id": tweet.id,
            "text": tweet.text,
            "author_id": tweet.author_id,
            "author_username": author.username if author else "unknown",
            "author_name": author.name if author else "Unknown",
            "created_at": tweet.created_at.isoformat(),
            "url": f"https://twitter.com/{author.username}/status/{tweet.id}" if author else "",
            "engagement": {
                "likes": tweet.public_metrics['like_count'],
                "retweets": tweet.public_metrics['retweet_count'],
                "replies": tweet.public_metrics['reply_count']
            },
            "entities": tweet.entities or {}
        })

    return bookmarks
```

### 2. Filter for BTC and AI Topics
<!-- @REQ-WKFL-055: Apply strict keyword filtering (BTC/AI only) | BLP: [Autonomy: 100%, Durability: Focused, Alignment: Domain-specific] -->

**Filter Keywords:**
```python
BTC_KEYWORDS = [
    # Core terms
    "bitcoin", "btc", "$btc",
    # Ecosystem
    "crypto", "cryptocurrency", "blockchain",
    "ethereum", "eth", "defi", "web3",
    "lightning", "ordinals", "runes",
    # People/projects
    "satoshi", "nakamoto", "mining",
    # Market
    "hodl", "halving", "sats"
]

AI_KEYWORDS = [
    # Core AI
    "ai", "artificial intelligence", "agi",
    # Models
    "llm", "gpt", "claude", "gemini", "grok",
    "transformer", "neural network",
    # Companies
    "anthropic", "openai", "deepmind",
    # Techniques
    "agent", "agents", "agentic",
    "embeddings", "rag", "fine-tuning",
    "reasoning", "multimodal", "o1", "o3",
    # Applications
    "ml", "machine learning", "deep learning"
]

def filter_bookmarks(bookmarks: List[Dict]) -> Dict[str, List[Dict]]:
    """
    Filter bookmarks into BTC and AI categories.

    Requirements:
    - Minimum 2 keyword matches for inclusion
    - Case-insensitive matching
    - Check text + entities (hashtags, cashtags)

    Returns: {"btc": [...], "ai": [...]}
    """
    filtered = {"btc": [], "ai": []}

    for bookmark in bookmarks:
        # Combine text and hashtags
        text_lower = bookmark['text'].lower()
        hashtags = [tag['tag'].lower() for tag in bookmark.get('entities', {}).get('hashtags', [])]
        cashtags = [tag['tag'].lower() for tag in bookmark.get('entities', {}).get('cashtags', [])]

        combined_text = f"{text_lower} {' '.join(hashtags)} {' '.join(cashtags)}"

        # Count matches
        btc_matches = sum(1 for kw in BTC_KEYWORDS if kw in combined_text)
        ai_matches = sum(1 for kw in AI_KEYWORDS if kw in combined_text)

        # Categorize (minimum 2 matches)
        if btc_matches >= 2:
            bookmark['category'] = 'btc'
            bookmark['match_count'] = btc_matches
            filtered['btc'].append(bookmark)
        elif ai_matches >= 2:
            bookmark['category'] = 'ai'
            bookmark['match_count'] = ai_matches
            filtered['ai'].append(bookmark)

    logger.info(f"Filtered: {len(filtered['btc'])} BTC, {len(filtered['ai'])} AI bookmarks")
    return filtered
```

**Skip if Empty:**
```python
if not filtered['btc'] and not filtered['ai']:
    logger.info("No BTC or AI bookmarks found, skipping workflow")
    return {"status": "skipped", "reason": "no_matching_bookmarks"}
```

### 3. Enrich Context
<!-- @REQ-WKFL-056: Fetch full threads and linked content | BLP: [Autonomy: 100%, Durability: Deep-context, Self-Organization: Comprehensive] -->

```python
async def enrich_bookmarks(bookmarks: List[Dict]) -> List[Dict]:
    """Enrich bookmarks with thread context and linked articles."""
    enriched = []

    for bookmark in bookmarks:
        enrichment = {
            "thread_tweets": [],
            "linked_urls": [],
            "media": []
        }

        # Fetch thread if this is a reply
        if bookmark.get('referenced_tweets'):
            enrichment['thread_tweets'] = await fetch_thread(bookmark['id'])

        # Extract and fetch linked URLs
        urls = bookmark.get('entities', {}).get('urls', [])
        for url_entity in urls:
            expanded_url = url_entity.get('expanded_url', url_entity.get('url'))
            if expanded_url and not is_twitter_url(expanded_url):
                # Fetch article title and snippet
                article_data = await fetch_url_metadata(expanded_url)
                enrichment['linked_urls'].append(article_data)

        # Extract media
        media_entities = bookmark.get('entities', {}).get('media', [])
        enrichment['media'] = [m['url'] for m in media_entities]

        bookmark['enrichment'] = enrichment
        enriched.append(bookmark)

    return enriched

async def fetch_thread(tweet_id: str) -> List[Dict]:
    """Fetch conversation thread for a tweet."""
    try:
        # Use X API to get conversation
        response = tweepy_client.get_tweet(
            tweet_id,
            expansions=['referenced_tweets.id'],
            tweet_fields=['text', 'author_id', 'created_at']
        )

        # Recursively fetch parent tweets
        thread = []
        if response.includes and 'tweets' in response.includes:
            thread = [
                {
                    "id": t.id,
                    "text": t.text,
                    "created_at": t.created_at.isoformat()
                }
                for t in response.includes['tweets']
            ]

        return thread
    except Exception as e:
        logger.warning(f"Failed to fetch thread for {tweet_id}: {e}")
        return []
```

### 4. Analyze with XAI Grok-4
<!-- @REQ-WKFL-057: Deep analysis with Grok-4's 2M context window | BLP: [Autonomy: 100%, Durability: Advanced-reasoning, Self-Organization: Domain-expert] -->

**Analysis Prompt:**
```python
async def analyze_with_grok(bookmarks_btc: List[Dict], bookmarks_ai: List[Dict]) -> Dict:
    """
    Analyze bookmarks with XAI Grok-4.

    Grok-4 advantages:
    - 2M token context (fits entire bookmark set)
    - Twitter-native (trained on X data)
    - Real-time awareness
    - Excellent at detecting sarcasm, memes, sentiment
    """
    analysis_prompt = f"""
You are analyzing X/Twitter bookmarks for BTC and AI insights.

**BTC Bookmarks ({len(bookmarks_btc)}):**
{json.dumps([format_bookmark_for_analysis(b) for b in bookmarks_btc], indent=2)}

**AI Bookmarks ({len(bookmarks_ai)}):**
{json.dumps([format_bookmark_for_analysis(b) for b in bookmarks_ai], indent=2)}

Your task:

1. **Identify Top Trends** (3-5 per category):
   - What are the most significant developments or discussions?
   - Assess significance (0.0-1.0) and credibility (0.0-1.0)
   - Cite source tweets

2. **Extract Key Claims**:
   - What specific claims are being made?
   - Rate credibility based on source, evidence, consensus

3. **Detect Contradictions**:
   - Are there conflicting claims between different sources?
   - Explain the contradiction and assess which is more credible

4. **Sentiment Analysis**:
   - Overall sentiment (bullish/bearish/neutral)
   - Fear/greed indicators
   - Community consensus vs contrarian takes

5. **Meme Potential**:
   - Which insights/takes are meme-worthy?
   - Score meme potential (0.0-1.0) based on absurdity + virality
   - Explain the meme context

6. **Action Items**:
   - What should a reader do with these insights?
   - Research follow-ups, portfolio actions, tech to explore

7. **Contrarian Takes**:
   - What unpopular or minority opinions are surfacing?
   - Are they worth considering?

Return structured JSON:
{{
  "executive_summary": "2-3 paragraph overview of key insights",

  "btc_trends": [
    {{
      "trend": "Brief description",
      "significance": 0.0-1.0,
      "credibility": 0.0-1.0,
      "source_tweets": ["tweet_id1", "tweet_id2"],
      "supporting_evidence": ["evidence1", "evidence2"]
    }}
  ],

  "ai_trends": [ /* same structure */ ],

  "key_claims": [
    {{
      "category": "btc|ai",
      "claim": "Specific claim text",
      "source": "tweet_id",
      "credibility": 0.0-1.0,
      "evidence": "Supporting evidence or reasoning"
    }}
  ],

  "contradictions": [
    {{
      "claim_a": "First claim",
      "claim_b": "Contradicting claim",
      "source_a": "tweet_id1",
      "source_b": "tweet_id2",
      "analysis": "Which is more credible and why"
    }}
  ],

  "sentiment": {{
    "btc": {{"overall": "bullish|bearish|neutral", "score": -1.0 to 1.0}},
    "ai": {{"overall": "bullish|bearish|neutral", "score": -1.0 to 1.0}},
    "fear_greed": "extreme_fear|fear|neutral|greed|extreme_greed"
  }},

  "meme_worthy": [
    {{
      "content": "Tweet text or paraphrase",
      "meme_score": 0.0-1.0,
      "context": "Why this is memeable",
      "source": "tweet_id"
    }}
  ],

  "action_items": [
    {{
      "action": "What to do",
      "category": "research|portfolio|technical|social",
      "priority": "high|medium|low",
      "details": "Specific steps"
    }}
  ],

  "contrarian_takes": [
    {{
      "take": "Unpopular opinion",
      "source": "tweet_id",
      "worth_considering": true|false,
      "reasoning": "Why this might be valuable"
    }}
  ]
}}
"""

    # Use XAI Grok-4 API
    try:
        response = await xai_grok_4(
            prompt=analysis_prompt,
            max_tokens=8000,
            temperature=0.5  # Balance creativity and consistency
        )

        analysis = json.loads(response)
        return analysis

    except Exception as e:
        logger.error(f"Grok-4 analysis failed: {e}, using fallback")
        return await fallback_analysis(bookmarks_btc, bookmarks_ai)

async def xai_grok_4(prompt: str, max_tokens: int, temperature: float) -> str:
    """Call XAI Grok-4 API."""
    import aiohttp

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://api.x.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "grok-4",
                "messages": [
                    {"role": "system", "content": "You are an expert analyst of cryptocurrency and AI trends on X/Twitter."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": max_tokens,
                "temperature": temperature
            },
            timeout=600  # 10 minute timeout for large analysis
        ) as response:
            response.raise_for_status()
            data = await response.json()
            return data['choices'][0]['message']['content']
```

### 5. Cross-Reference with External Data
<!-- @REQ-WKFL-058: Validate insights against prediction markets and research | BLP: [Autonomy: 100%, Durability: Multi-source, Self-Organization: Validating] -->

```python
async def cross_reference(analysis: Dict) -> Dict:
    """
    Cross-reference insights with:
    - Polymarket prediction markets
    - Recent research papers (ArXiv)
    - Previous insights database

    Returns enriched analysis with validation flags.
    """
    enriched = analysis.copy()

    # Check Polymarket for BTC-related predictions
    if analysis['btc_trends']:
        polymarket_data = await fetch_polymarket_btc_markets()
        enriched['btc_market_validation'] = match_trends_to_markets(
            analysis['btc_trends'],
            polymarket_data
        )

    # Check ArXiv for AI-related papers
    if analysis['ai_trends']:
        recent_papers = await search_arxiv_recent(
            query=" OR ".join([t['trend'] for t in analysis['ai_trends'][:5]]),
            max_results=10
        )
        enriched['ai_research_validation'] = match_trends_to_papers(
            analysis['ai_trends'],
            recent_papers
        )

    # Check against previous insights for trend tracking
    previous_insights = db.query(
        "SELECT * FROM x_insights WHERE date >= ? ORDER BY date DESC LIMIT 7",
        (datetime.now() - timedelta(days=7)).isoformat()
    )
    enriched['trend_continuity'] = analyze_trend_evolution(
        analysis,
        previous_insights
    )

    return enriched

async def fetch_polymarket_btc_markets() -> List[Dict]:
    """Fetch active BTC-related Polymarket markets."""
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.polymarket.com/markets?active=true&tag=crypto") as response:
            markets = await response.json()
            return [m for m in markets if 'btc' in m['question'].lower() or 'bitcoin' in m['question'].lower()]
```

### 6. Store in Notion Database
<!-- @REQ-WKFL-059: Create searchable, structured Notion entries | BLP: [Autonomy: 100%, Durability: Persistent, Alignment: Organized] -->

```python
async def store_in_notion(analysis: Dict, bookmarks_btc: List[Dict], bookmarks_ai: List[Dict]):
    """Create Notion database entry for insights."""
    notion_page = {
        "parent": {"database_id": NOTION_INSIGHTS_DB_ID},
        "properties": {
            "Title": {
                "title": [{"text": {"content": f"X Insights - {today}"}}]
            },
            "Date": {"date": {"start": today}},
            "BTC Bookmarks": {"number": len(bookmarks_btc)},
            "AI Bookmarks": {"number": len(bookmarks_ai)},
            "BTC Sentiment": {
                "select": {"name": analysis['sentiment']['btc']['overall'].capitalize()}
            },
            "AI Sentiment": {
                "select": {"name": analysis['sentiment']['ai']['overall'].capitalize()}
            },
            "Top Trend (BTC)": {
                "rich_text": [{"text": {"content": analysis['btc_trends'][0]['trend'] if analysis['btc_trends'] else "None"}}]
            },
            "Top Trend (AI)": {
                "rich_text": [{"text": {"content": analysis['ai_trends'][0]['trend'] if analysis['ai_trends'] else "None"}}]
            },
            "Tags": {
                "multi_select": [
                    {"name": "BTC"} if bookmarks_btc else None,
                    {"name": "AI"} if bookmarks_ai else None,
                    {"name": analysis['sentiment']['fear_greed']}
                ]
            }
        },
        "children": [
            # Executive Summary
            notion_heading_2("Executive Summary"),
            notion_paragraph(analysis['executive_summary']),

            # BTC Trends
            notion_heading_2(f"BTC Trends ({len(analysis['btc_trends'])})"),
            *[notion_callout(
                f"**{t['trend']}**\n\nSignificance: {t['significance']:.1f} | Credibility: {t['credibility']:.1f}\n\nSources: {', '.join(t['source_tweets'])}"
            ) for t in analysis['btc_trends']],

            # AI Trends
            notion_heading_2(f"AI Trends ({len(analysis['ai_trends'])})"),
            *[notion_callout(
                f"**{t['trend']}**\n\nSignificance: {t['significance']:.1f} | Credibility: {t['credibility']:.1f}\n\nSources: {', '.join(t['source_tweets'])}"
            ) for t in analysis['ai_trends']],

            # Contradictions
            notion_heading_2("Contradictions Detected"),
            *[notion_toggle(
                f"{c['claim_a']} vs {c['claim_b']}",
                c['analysis']
            ) for c in analysis['contradictions']],

            # Meme Worthy
            notion_heading_2("Meme Potential"),
            *[notion_quote(
                f"{m['content']}\n\nMeme Score: {m['meme_score']:.2f} | {m['context']}"
            ) for m in analysis['meme_worthy']],

            # Action Items
            notion_heading_2("Action Items"),
            *[notion_todo(
                f"[{a['category'].upper()}] {a['action']}",
                a['priority'] == 'high'
            ) for a in analysis['action_items']]
        ]
    }

    response = await notion_client.pages.create(**notion_page)
    return response['id'], response['url']
```

### 7. Multi-Channel Delivery
<!-- @REQ-WKFL-060: Deliver to all channels with format optimization | BLP: [Autonomy: 100%, Durability: Multi-path, Alignment: Accessible] -->

#### 7.1 HTML Dashboard
```python
dashboard_html = render_template(
    "x_insights_dashboard.html",
    date=today,
    summary=analysis['executive_summary'],
    btc_trends=analysis['btc_trends'],
    ai_trends=analysis['ai_trends'],
    contradictions=analysis['contradictions'],
    meme_worthy=analysis['meme_worthy'],
    sentiment=analysis['sentiment'],
    action_items=analysis['action_items'],
    bookmarks_btc=bookmarks_btc,
    bookmarks_ai=bookmarks_ai
)

dashboard_path = f"/home/craigmbrown/Project/html-output/{today}-x-insights.html"
with open(dashboard_path, 'w') as f:
    f.write(dashboard_html)

dashboard_url = f"http://34.58.12.50:8080/{today}-x-insights.html"
tinyurl = create_tinyurl(dashboard_url)
```

#### 7.2 WhatsApp TL;DR
```python
whatsapp_message = f"""
🐦 X Insights - {today}

📊 Analyzed: {len(bookmarks_btc)} BTC + {len(bookmarks_ai)} AI bookmarks

🔥 Top 3 Insights:

1. {analysis['btc_trends'][0]['trend'] if analysis['btc_trends'] else 'N/A'}

2. {analysis['ai_trends'][0]['trend'] if analysis['ai_trends'] else 'N/A'}

3. {analysis['contrarian_takes'][0]['take'] if analysis['contrarian_takes'] else 'N/A'}

😎 Sentiment:
- BTC: {analysis['sentiment']['btc']['overall']} ({analysis['sentiment']['btc']['score']:+.2f})
- AI: {analysis['sentiment']['ai']['overall']} ({analysis['sentiment']['ai']['score']:+.2f})

📊 Full report: {tinyurl}

---
Auto-generated at {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}
"""
```

#### 7.3 Email Full Report
```python
email_html = render_template(
    "email_x_insights.html",
    analysis=analysis,
    bookmarks_btc=bookmarks_btc,
    bookmarks_ai=bookmarks_ai,
    dashboard_link=tinyurl,
    notion_link=notion_url
)
```

#### 7.4 Nostr Highlights
```python
nostr_post = f"""
🐦 X Insights - {today}

{analysis['executive_summary'][:250]}...

🚀 Top BTC Trend: {analysis['btc_trends'][0]['trend'] if analysis['btc_trends'] else 'N/A'}

🤖 Top AI Trend: {analysis['ai_trends'][0]['trend'] if analysis['ai_trends'] else 'N/A'}

📊 Full analysis: {tinyurl}

#bitcoin #ai #insights #xbookmarks
"""
```

**Parallel Delivery:**
```python
delivery_results = await asyncio.gather(
    send_email(to="craigmbrown@gmail.com", subject=f"X Insights - {today}", html=email_html),
    send_whatsapp(whatsapp_message),
    post_to_nostr(nostr_post),
    # Notion already created above
    return_exceptions=True
)
```

---

## Exception Handling

<!-- @REQ-WKFL-061: Handle API failures and empty results | BLP: [Durability: Resilient, Alignment: Reliable] -->

### X API Rate Limit
- **Detection:** 429 response
- **Recovery:** Wait for reset OR use XAI scraping fallback
- **Notification:** Log warning
- **Degradation:** XAI API as primary data source

### XAI API Failure
- **Detection:** 5xx errors, timeout > 10 minutes
- **Recovery:** Retry 3x, fallback to Claude Opus 4.5
- **Notification:** Email if XAI consistently fails
- **Degradation:** Use Claude with smaller context window

### Empty Bookmarks (No BTC/AI)
- **Detection:** Filtering returns 0 results
- **Recovery:** Generate "no insights today" report
- **Notification:** Silent skip (no alert)
- **Degradation:** N/A

### Grok Analysis Timeout
- **Detection:** Request exceeds 10 minutes
- **Recovery:** Use smaller context (fewer bookmarks)
- **Notification:** Log warning
- **Degradation:** Analyze top 20 bookmarks only

### Cross-Reference Failure
- **Detection:** Polymarket/ArXiv API down
- **Recovery:** Skip validation step, proceed with analysis
- **Notification:** Log warning
- **Degradation:** Analysis without external validation

### All Delivery Channels Fail
- **Detection:** All async delivery tasks fail
- **Recovery:** Store report in filesystem, retry hourly
- **Notification:** WhatsApp URGENT via fallback
- **Escalation:** Create GitHub issue

---

## BLP Metrics

<!-- @REQ-WKFL-062: Track trend prediction accuracy and user engagement | BLP: [Self-Organization: Predictive, Alignment: Valuable] -->

### Autonomy Metrics
- **Full Automation:** 100%
- **Filter Precision:** % of filtered bookmarks validated as relevant
- **Analysis Completion:** % of days with successful Grok analysis

### Durability Metrics
- **Uptime:** % of scheduled runs that complete
- **Delivery Success:** % to at least one channel
- **Data Retention:** 180 days in Notion, S3 archive

### Self-Organization Metrics
- **Keyword Learning:** Adaptive filter based on user engagement
- **Trend Prediction Accuracy:** % of trends validated by subsequent events
- **LLM Routing:** Grok vs Claude usage optimization

**Metric Recording:**
```python
metrics.record({
    "workflow": "x_insights",
    "date": today,
    "bookmarks_total": len(all_bookmarks),
    "bookmarks_btc": len(bookmarks_btc),
    "bookmarks_ai": len(bookmarks_ai),
    "autonomy_filter_precision": filtered_count / total_count,
    "durability_grok_success": 1.0 if grok_succeeded else 0.0,
    "self_org_avg_analysis_time": analysis_time_seconds,
    "sentiment_btc": analysis['sentiment']['btc']['score'],
    "sentiment_ai": analysis['sentiment']['ai']['score'],
    "trends_identified": len(analysis['btc_trends']) + len(analysis['ai_trends']),
    "contradictions_found": len(analysis['contradictions'])
})
```

---

## Configuration

**Location:** `/home/craigmbrown/Project/autonomous-zte-workflows/config/workflows.yaml`

```yaml
x_insights:
  enabled: true
  schedule: "0 10 * * *"  # 10:00 UTC daily
  timeout: 600  # 10 minutes

  bookmarks:
    max_bookmarks: 50
    fetch_strategy: "x_api_v2"  # or "xai_fallback"

    filters:
      btc_keywords: ["bitcoin", "btc", "crypto", "defi", "eth"]
      ai_keywords: ["ai", "llm", "gpt", "claude", "agent", "agi"]
      min_matches: 2

  enrichment:
    fetch_threads: true
    fetch_linked_urls: true
    max_url_fetch: 10

  analysis:
    primary_llm: "xai_grok_4"
    fallback_llm: "anthropic_opus_4.5"
    max_tokens: 8000
    temperature: 0.5

  cross_reference:
    polymarket: true
    arxiv: true
    previous_insights_days: 7

  delivery:
    channels:
      - email
      - whatsapp
      - notion
      - nostr
      - html_dashboard

  notion:
    database_id: "{NOTION_INSIGHTS_DB_ID}"
```

---

## Usage

**Manual Trigger:**
```bash
# Analyze today's bookmarks
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow x_insights

# Test with specific date
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow x_insights \
  --date 2025-12-12

# Reanalyze existing bookmarks
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow x_insights \
  --reanalyze

# Show metrics
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow x_insights \
  --metrics --days 30
```

**Cron Schedule:**
```bash
# Daily execution at 10:00 UTC
0 10 * * * /usr/bin/python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py --workflow x_insights >> /home/craigmbrown/Project/logs/x_insights.log 2>&1
```

---

## Success Criteria

- **Bookmark Coverage:** > 90% of BTC/AI bookmarks analyzed
- **Analysis Quality:** > 85% of trends validated as significant
- **Processing Time:** < 10 minutes total
- **Grok Uptime:** > 95% (XAI API availability)
- **Delivery Success:** 100% to Notion, 95% to all channels
- **Trend Accuracy:** > 70% of predictions confirmed within 7 days

---

**Auto-generated by Autonomous ZTE Workflows**
**Version:** 1.0.0
**Last Updated:** 2025-12-13
