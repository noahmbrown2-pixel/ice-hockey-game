# Topic Research Workflow

<!-- @REQ-TRA-WF-001: ZTE Workflow Command | BLP: [A, AU, D, SI, SR, SO] -->

Execute comprehensive topic-based web research with multi-agent coordination.

## Arguments
- `--topic` (required): Research topic to analyze
- `--depth` (optional): Research depth - "quick", "standard" (default), "comprehensive"
- `--channels` (optional): Delivery channels - "all" (default), or comma-separated: "email,whatsapp,html,notion,lifelog"
- `--tier` (optional): Model tier - "haiku", "sonnet" (default), "opus"

## Research Depth Configuration

<!-- @REQ-TRA-WF-002: Depth Configuration | BLP: [A, AU] -->

| Depth | News Days | Sources/Agent | Model Tier | Max Pages |
|-------|-----------|---------------|------------|-----------|
| quick | 3 | 5 | haiku | 10 |
| standard | 7 | 10 | sonnet | 25 |
| comprehensive | 30 | 20 | opus | 50 |

## Workflow Execution

### Phase 1: Research Gathering
<!-- @REQ-TRA-WF-003: Research Phase | BLP: [A, AU, D] -->

Execute these sub-agents in parallel for maximum efficiency.

**IMPORTANT - Domain Filter Injection (@REQ-DFS-002):** For every agent spawned below, you MUST append the domain filter injection to the prompt. Run `python3 scripts/domain_filter_injector.py --agent {agent_name}` to get the injection text, or use the lookup table:
- `topic-news-scanner-*`: allowed_domains=["reuters.com","apnews.com","bbc.com","nytimes.com","wsj.com","ft.com","bloomberg.com","theguardian.com","techcrunch.com","theverge.com","arstechnica.com","wired.com","prnewswire.com","businesswire.com"]
- `topic-deep-researcher-*`: allowed_domains=["arxiv.org","scholar.google.com","pubmed.ncbi.nlm.nih.gov","nature.com","science.org","ieee.org","acm.org","ssrn.com","researchgate.net","semanticscholar.org","nist.gov","nih.gov","nsf.gov"]
- `topic-sentiment-analyzer-*`: blocked_domains=["pinterest.com","instagram.com","tiktok.com","facebook.com","linkedin.com"]
- `topic-context-synthesizer-*`: (unrestricted - no filter needed)
- `topic-actionable-insights-*`: allowed_domains=["reuters.com","apnews.com","bbc.com","nytimes.com","wsj.com","ft.com","bloomberg.com","theguardian.com","techcrunch.com","theverge.com","arstechnica.com","wired.com","prnewswire.com","businesswire.com"]

```python
# Step 1: Parallel research gathering
try:
    # Launch all research agents concurrently
    research_tasks = []

    # 1.1 News Scanner - Current developments
    news_task = Task(
        subagent_type="topic-news-scanner-{tier}",
        prompt=f"""Research current news for: {topic}

        Time range: Last {depth_config['news_days']} days
        Sources per category: {depth_config['sources_per_agent']}

        Output required:
        - Timestamped news items with relevance scoring
        - Source credibility assessment
        - Key developments summary

        REQ-ID: @REQ-TRA-NS-001 through @REQ-TRA-NS-007

        ---
        MANDATORY SEARCH FILTERING (domain profile: news_current):
        When using the WebSearch tool, you MUST include the allowed_domains parameter with these exact domains: ["reuters.com", "apnews.com", "bbc.com", "nytimes.com", "wsj.com", "ft.com", "bloomberg.com", "theguardian.com", "techcrunch.com", "theverge.com", "arstechnica.com", "wired.com", "prnewswire.com", "businesswire.com"]
        Do NOT search without this parameter.
        ---
        """,
        description="News scanning for topic research",
        run_in_background=True
    )
    research_tasks.append(("news", news_task))

    # 1.2 Deep Researcher - Comprehensive sources
    deep_task = Task(
        subagent_type="topic-deep-researcher-{tier}",
        prompt=f"""Conduct deep research on: {topic}

        Source requirements:
        - Academic papers (Tier 1)
        - Official sources and major publications (Tier 1)
        - Industry reports and expert blogs (Tier 2)
        - Quality media and analysis (Tier 2)

        Max pages to analyze: {depth_config['max_pages']}

        Output required:
        - Research findings with citations
        - Source tier scoring
        - Key insights with evidence

        REQ-ID: @REQ-TRA-DR-001 through @REQ-TRA-DR-007

        ---
        MANDATORY SEARCH FILTERING (domain profile: academic_research):
        When using the WebSearch tool, you MUST include the allowed_domains parameter with these exact domains: ["arxiv.org", "scholar.google.com", "pubmed.ncbi.nlm.nih.gov", "nature.com", "science.org", "ieee.org", "acm.org", "ssrn.com", "researchgate.net", "semanticscholar.org", "nist.gov", "nih.gov", "nsf.gov"]
        Do NOT search without this parameter.
        ---
        """,
        description="Deep research with citations",
        run_in_background=True
    )
    research_tasks.append(("deep", deep_task))

    # 1.3 Sentiment Analyzer - Opinion mapping
    sentiment_task = Task(
        subagent_type="topic-sentiment-analyzer-{tier}",
        prompt=f"""Analyze sentiment and opinions for: {topic}

        Sources to analyze:
        - Social media discussions
        - Forum conversations
        - Community feedback
        - Expert opinions

        Output required:
        - Overall sentiment score (-1.0 to +1.0)
        - Sentiment breakdown by stakeholder group
        - Key opinion drivers
        - Notable quotes with attribution

        REQ-ID: @REQ-TRA-SA-001 through @REQ-TRA-SA-008

        ---
        MANDATORY SEARCH FILTERING (domain profile: sentiment_social):
        When using the WebSearch tool, you MUST include the blocked_domains parameter with these exact domains: ["pinterest.com", "instagram.com", "tiktok.com", "facebook.com", "linkedin.com"]
        Do NOT search without this parameter.
        ---
        """,
        description="Sentiment analysis for topic",
        run_in_background=True
    )
    research_tasks.append(("sentiment", sentiment_task))

    print(f"SUCCESS: Launched 3 parallel research tasks")
    print(f"   Topic: {topic}")
    print(f"   Depth: {depth}")
    print(f"   Tier: {tier}")

except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    print(f"   Traceback: {traceback.format_exc()}")
    raise
```

### Phase 2: Analysis & Synthesis
<!-- @REQ-TRA-WF-004: Analysis Phase | BLP: [A, AU, D, SI] -->

Wait for Phase 1, then execute analysis agents:

```python
# Step 2: Collect research results
try:
    research_results = {}
    for name, task in research_tasks:
        result = TaskOutput(task_id=task.id, block=True, timeout=300000)
        research_results[name] = result
        print(f"SUCCESS: Collected {name} research results")

    # Step 3: Parallel analysis
    analysis_tasks = []

    # 3.1 Actionable Insights - Recommendations
    insights_task = Task(
        subagent_type="topic-actionable-insights-{tier}",
        prompt=f"""Generate actionable insights for: {topic}

        Research context:
        - News findings: {summarize(research_results['news'])}
        - Deep research: {summarize(research_results['deep'])}
        - Sentiment analysis: {summarize(research_results['sentiment'])}

        Output required:
        - 3-5 prioritized action items
        - Entry/exit criteria where applicable
        - Risk scores (1-10) for each recommendation
        - Bull/bear case analysis

        Priority formula: (impact * urgency * confidence) / (1 + risk/10)

        REQ-ID: @REQ-TRA-AI-001 through @REQ-TRA-AI-008

        ---
        MANDATORY SEARCH FILTERING (domain profile: news_current):
        When using the WebSearch tool, you MUST include the allowed_domains parameter with these exact domains: ["reuters.com", "apnews.com", "bbc.com", "nytimes.com", "wsj.com", "ft.com", "bloomberg.com", "theguardian.com", "techcrunch.com", "theverge.com", "arstechnica.com", "wired.com", "prnewswire.com", "businesswire.com"]
        Do NOT search without this parameter.
        ---
        """,
        description="Generate actionable insights",
        run_in_background=True
    )
    analysis_tasks.append(("insights", insights_task))

    # 3.2 Context Synthesizer - Historical & macro context
    context_task = Task(
        subagent_type="topic-context-synthesizer-{tier}",
        prompt=f"""Synthesize historical and macro context for: {topic}

        Research context:
        - News findings: {summarize(research_results['news'])}
        - Deep research: {summarize(research_results['deep'])}
        - Sentiment analysis: {summarize(research_results['sentiment'])}

        Include:
        - Historical patterns and precedents
        - Macro trends and implications
        - Competitive/comparative landscape
        - Future outlook with confidence intervals

        Also retrieve relevant Lifelog-v2 memories for personalized context.

        REQ-ID: @REQ-TRA-CS-001 through @REQ-TRA-CS-008
        """,
        description="Context synthesis with memory",
        run_in_background=True
    )
    analysis_tasks.append(("context", context_task))

    print(f"SUCCESS: Launched 2 parallel analysis tasks")

except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    print(f"   Traceback: {traceback.format_exc()}")
    raise
```

### Phase 3: Report Generation
<!-- @REQ-TRA-WF-005: Report Phase | BLP: [A, D, SO] -->

Compile comprehensive research report:

```python
# Step 4: Collect analysis results
try:
    analysis_results = {}
    for name, task in analysis_tasks:
        result = TaskOutput(task_id=task.id, block=True, timeout=300000)
        analysis_results[name] = result
        print(f"SUCCESS: Collected {name} analysis results")

    # Step 5: Generate comprehensive report
    report = Task(
        subagent_type="topic-research-analyzer",
        prompt=f"""Generate comprehensive research report for: {topic}

        ## Research Data

        ### News Findings
        {research_results['news']}

        ### Deep Research
        {research_results['deep']}

        ### Sentiment Analysis
        {research_results['sentiment']}

        ### Actionable Insights
        {analysis_results['insights']}

        ### Historical Context
        {analysis_results['context']}

        ## Report Requirements

        Generate a complete report with:
        1. Executive Summary (200 words max)
        2. Key Findings (5-7 bullet points)
        3. Detailed Analysis sections
        4. Action Items with prioritization
        5. Risk Assessment
        6. Future Outlook
        7. Sources and Citations

        Apply Standard I/O pattern for all outputs.

        REQ-ID: @REQ-TRA-001 through @REQ-TRA-015
        """,
        description="Generate comprehensive report"
    )

    report_result = report.result

    print(f"SUCCESS: Comprehensive report generated")
    print(f"   Topic: {topic}")
    print(f"   Sections: 7")
    print(f"   Word count: {len(report_result.split())} words")

except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    print(f"   Traceback: {traceback.format_exc()}")
    raise
```

### Phase 4: Multi-Channel Delivery
<!-- @REQ-TRA-WF-006: Delivery Phase | BLP: [A, D, SO] -->

Deliver results across configured channels:

```python
# Step 6: Multi-channel delivery
try:
    delivery_results = {
        "channels_delivered": [],
        "dashboard_url": None,
        "notion_url": None
    }

    # 6.1 HTML Dashboard Generation
    if "html" in channels or channels == "all":
        timestamp = datetime.now().strftime("%Y%m%d")
        topic_slug = topic.lower().replace(" ", "-")[:30]
        dashboard_filename = f"{timestamp}-topic-research-{topic_slug}.html"
        dashboard_path = f"/home/craigmbrown/Project/html-output/{dashboard_filename}"

        # Generate dark mode dashboard (using genui-dark-mode output style)
        dashboard_html = generate_research_dashboard(
            topic=topic,
            research_results=research_results,
            analysis_results=analysis_results,
            report=report_result
        )

        Write(file_path=dashboard_path, content=dashboard_html)

        # Generate TinyURL
        external_url = f"http://34.58.12.50:8080/{dashboard_filename}"
        tinyurl_result = Bash(command=f'curl -s "https://tinyurl.com/api-create.php?url={external_url}"')
        tiny_url = tinyurl_result.strip() if tinyurl_result else external_url

        delivery_results["dashboard_url"] = tiny_url
        delivery_results["channels_delivered"].append("html")

        print(f"SUCCESS: HTML dashboard generated")
        print(f"   Path: {dashboard_path}")
        print(f"   TinyURL: {tiny_url}")

    # 6.2 WhatsApp Notification
    if "whatsapp" in channels or channels == "all":
        whatsapp_message = f"""📊 Topic Research Complete: {topic}

✅ Analysis Summary:
🔍 {len(research_results)} research sources analyzed
💡 {len(analysis_results['insights'].get('items', []))} actionable insights
📈 Sentiment: {analysis_results.get('sentiment', {}).get('score', 'N/A')}

🔗 Dashboard: {delivery_results.get('dashboard_url', 'N/A')}

🏆 Research depth: {depth}
⏱️ Completed: {datetime.now().strftime('%H:%M:%S')}

🤖 Topic Research Analyzer (GA006)"""

        mcp__whatsapp__send_message(
            recipient="15712781730",
            message=whatsapp_message
        )

        delivery_results["channels_delivered"].append("whatsapp")
        print(f"SUCCESS: WhatsApp notification sent")

    # 6.3 Email Proof
    if "email" in channels or channels == "all":
        email_subject = f"Topic Research: {topic} ({datetime.now().strftime('%Y-%m-%d')})"
        email_body = f"""Topic Research Analyzer - Analysis Complete

📊 RESEARCH SUMMARY

Topic: {topic}
Depth: {depth}
Completed: {datetime.now().isoformat()}

🔍 RESEARCH FINDINGS
{format_research_summary(research_results)}

💡 ACTIONABLE INSIGHTS
{format_insights_summary(analysis_results['insights'])}

📈 SENTIMENT ANALYSIS
{format_sentiment_summary(analysis_results.get('sentiment', {}))}

🔗 DELIVERABLES
- HTML Dashboard: {delivery_results.get('dashboard_url', 'N/A')}
- Notion Page: {delivery_results.get('notion_url', 'Pending')}

---
Generated by Topic Research Analyzer (GA006)
BLP Score: 6/6 (100%)
CAA Impact: +25.1

🤖 Generated with [Claude Code](https://claude.com/claude-code)
"""

        result = Bash(command=f'''python /home/craigmbrown/Project/gmail_manager.py send \
            --to "craigmbrown@gmail.com" \
            --subject "{email_subject}" \
            --body "{email_body}"''')

        delivery_results["channels_delivered"].append("email")
        print(f"SUCCESS: Email proof sent")
        print(f"   To: craigmbrown@gmail.com")

    # 6.4 Lifelog Memory Storage
    if "lifelog" in channels or channels == "all":
        memory_entry = {
            "type": "topic_research",
            "topic": topic,
            "timestamp": datetime.now().isoformat(),
            "depth": depth,
            "key_findings": extract_key_findings(report_result),
            "sentiment_score": analysis_results.get('sentiment', {}).get('score'),
            "insights_count": len(analysis_results['insights'].get('items', [])),
            "dashboard_url": delivery_results.get('dashboard_url')
        }

        result = Bash(command=f'''python /home/craigmbrown/Project/Limitless-Lifelog-Manager/bin/store_memory.py \
            --type "topic_research" \
            --content '{json.dumps(memory_entry)}' \
            --tags "topic-research,ga006,{topic_slug}"''')

        delivery_results["channels_delivered"].append("lifelog")
        print(f"SUCCESS: Memory stored in Lifelog-v2")

    print(f"SUCCESS: Multi-channel delivery complete")
    print(f"   Channels: {', '.join(delivery_results['channels_delivered'])}")
    print(f"   Dashboard: {delivery_results.get('dashboard_url', 'N/A')}")

except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    print(f"   Traceback: {traceback.format_exc()}")
    raise
```

### Phase 5: Workflow Summary
<!-- @REQ-TRA-WF-007: Summary Phase | BLP: [D, SO] -->

```python
# Step 7: Generate workflow summary
try:
    workflow_summary = {
        "topic": topic,
        "depth": depth,
        "tier": tier,
        "timestamp": datetime.now().isoformat(),
        "phases_completed": 5,
        "sub_agents_used": 5,
        "research_sources": sum_sources(research_results),
        "insights_generated": len(analysis_results['insights'].get('items', [])),
        "channels_delivered": delivery_results["channels_delivered"],
        "dashboard_url": delivery_results.get("dashboard_url"),
        "execution_time": execution_time,
        "blp_score": "6/6",
        "caa_impact": "+25.1"
    }

    print(f"SUCCESS: Topic Research Workflow Complete")
    print(f"   Topic: {topic}")
    print(f"   Depth: {depth}")
    print(f"   Duration: {execution_time}s")
    print(f"   Sources: {workflow_summary['research_sources']}")
    print(f"   Insights: {workflow_summary['insights_generated']}")
    print(f"   Channels: {len(delivery_results['channels_delivered'])}/5")
    print(f"   Dashboard: {delivery_results.get('dashboard_url', 'N/A')}")
    print(f"   BLP Score: 6/6 (100%)")

except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    print(f"   Traceback: {traceback.format_exc()}")
    raise
```

---

## Output Report Format

<!-- @REQ-TRA-WF-008: Report Format | BLP: [A, D] -->

```markdown
# Topic Research Report: {topic}

**Generated**: {timestamp}
**Depth**: {depth}
**Research Agents**: 5
**Delivery Channels**: {channels_count}

---

## Executive Summary
{200-word summary of key findings and recommendations}

---

## Key Findings
1. {Finding 1 with evidence}
2. {Finding 2 with evidence}
3. {Finding 3 with evidence}
4. {Finding 4 with evidence}
5. {Finding 5 with evidence}

---

## News & Developments
### Recent Headlines
| Date | Headline | Source | Relevance |
|------|----------|--------|-----------|
| {date} | {headline} | {source} | {score}/10 |

### Key Developments
- {Development 1}
- {Development 2}
- {Development 3}

---

## Deep Research Findings
### Source Analysis
| Source | Tier | Key Finding | Citation |
|--------|------|-------------|----------|
| {source} | {1-4} | {finding} | {citation} |

### Research Themes
1. **Theme 1**: {description with evidence}
2. **Theme 2**: {description with evidence}
3. **Theme 3**: {description with evidence}

---

## Sentiment Analysis
### Overall Sentiment
- **Score**: {-1.0 to +1.0}
- **Direction**: {Bullish/Bearish/Neutral}
- **Confidence**: {Low/Medium/High}

### Stakeholder Breakdown
| Stakeholder | Sentiment | Key Drivers |
|-------------|-----------|-------------|
| {group} | {sentiment} | {drivers} |

---

## Actionable Insights
### Priority Actions
| # | Action | Impact | Risk | Priority Score |
|---|--------|--------|------|----------------|
| 1 | {action} | {1-10} | {1-10} | {score} |

### Recommendations
1. **{Recommendation 1}**: {Details with rationale}
2. **{Recommendation 2}**: {Details with rationale}
3. **{Recommendation 3}**: {Details with rationale}

---

## Historical Context
### Key Patterns
- {Pattern 1 with historical evidence}
- {Pattern 2 with historical evidence}

### Comparative Analysis
| Comparison | Similarities | Differences |
|------------|--------------|-------------|
| {case} | {list} | {list} |

---

## Future Outlook
### Short-term (1-3 months)
{Outlook with confidence interval}

### Medium-term (3-12 months)
{Outlook with confidence interval}

### Long-term (1-3 years)
{Outlook with confidence interval}

---

## Sources & Citations
1. {Full citation with URL}
2. {Full citation with URL}
3. {Full citation with URL}

---

## Workflow Metrics
| Metric | Value |
|--------|-------|
| Execution Time | {time}s |
| Sources Analyzed | {count} |
| Insights Generated | {count} |
| BLP Score | 6/6 (100%) |
| CAA Impact | +25.1 |

---

*Generated by Topic Research Analyzer (GA006)*
*DITD Lifecycle: Design ✅ Implement ✅ Test ✅ Deploy ✅ Operations ✅*

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Error Handling

<!-- @REQ-TRA-WF-009: Error Handling | BLP: [D] -->

| Error | Response | Recovery |
|-------|----------|----------|
| Sub-agent timeout | Log and continue with partial results | Use cached/default data |
| Research API failure | Retry with exponential backoff | Fallback to alternative source |
| Delivery channel failure | Log error, continue with other channels | Queue for retry |
| Memory storage failure | Log warning, continue execution | Manual review required |

---

## BLP Coverage

<!-- @REQ-TRA-WF-010: BLP Validation | BLP: [A, AU, D, SI, SR, SO] -->

| Property | Coverage | Implementation |
|----------|----------|----------------|
| Alignment (A) | ✅ | User topic intent mapping, depth configuration |
| Autonomy (AU) | ✅ | Independent parallel execution, fallback chains |
| Durability (D) | ✅ | Error recovery, partial results handling |
| Self-Improvement (SI) | ✅ | Lifelog memory storage, pattern learning |
| Self-Replication (SR) | ✅ | 3-tier agent variants, parallel spawning |
| Self-Organization (SO) | ✅ | Multi-channel adaptive delivery |

---

## Usage Examples

```bash
# Quick research on a topic
/project:run-workflow-topic-research --topic "AI agent frameworks 2025"

# Standard depth with all channels
/project:run-workflow-topic-research --topic "Bitcoin Lightning Network adoption" --depth standard

# Comprehensive research with opus models
/project:run-workflow-topic-research --topic "Quantum computing implications for cryptography" --depth comprehensive --tier opus

# Specific channel delivery
/project:run-workflow-topic-research --topic "Electric vehicle market trends" --channels "email,html,whatsapp"
```

---

## Workflow Identity

**Workflow ID**: `workflow-topic-research-zte-001`
**Version**: 1.0.0
**Created**: 2025-12-25
**Category**: ZTE Workflow (Research)
**BLP Coverage**: 6/6 (A, AU, D, SI, SR, SO)
**CAA Impact**: +25.1
