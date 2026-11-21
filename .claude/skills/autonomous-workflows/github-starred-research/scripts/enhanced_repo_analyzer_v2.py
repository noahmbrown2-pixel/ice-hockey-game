#!/usr/bin/env python3
"""
Enhanced Repository Analyzer v2 with Business Case & Approval Workflow

Generates comprehensive code review emails including:
- Repository images (social preview, README images, screenshots)
- Design plans with architecture recommendations
- BLP/CA scoring with detailed breakdown
- BUSINESS CASE with informed approval recommendation
- ACTION BUTTONS for approval workflow
- GitHub Issue creation for tracking
- Claude Code implementation plan

@REQ-043: Enhanced Code Review with Approval Workflow | BLP: [A, AU, SI, SO, D]
"""

import argparse
import base64
import json
import os
import re
import requests
import subprocess
import sys
import urllib.parse
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple

# Configuration
GMAIL_MANAGER = Path("/home/craigmbrown/Project/gmail_manager.py")
STATE_DB = Path(__file__).parent.parent / "state" / "github_state.db"
LOGS_DIR = Path("/home/craigmbrown/Project/logs")
PLANS_DIR = Path("/home/craigmbrown/Project/.claude/plans/github-starred")
ISSUES_LOG = LOGS_DIR / "github_issues_created.json"
HTML_OUTPUT_DIR = Path("/home/craigmbrown/Project/html-output")
BLP_METRICS_FILE = Path("/home/craigmbrown/Project/CC-Monitor/state/blp_metrics.json")
TINYURL_API = "https://tinyurl.com/api-create.php"
WEB_BASE_URL = "http://34.58.12.50:8080"

# Codebase Integration Points - Used for comprehensive plan generation
CODEBASE_INTEGRATION_MAP = {
    "mcp_servers": {
        "base_path": "/home/craigmbrown/Project",
        "pattern": "*-mcp/",
        "existing": ["agent-metric-mcp", "whatsapp-mcp", "notion-mcp-server", "quick-data-mcp",
                     "gemini-deep-research-mcp", "chainlink-prediction-markets-mcp-enhanced"],
        "structure": {
            "pyproject.toml": "UV-based dependencies",
            "src/mcp_server/tools/": "Individual tool implementations",
            "src/mcp_server/server.py": "Main MCP server",
            "main.py": "Entry point"
        }
    },
    "agents": {
        "thebaby": {
            "path": "/home/craigmbrown/Project/TheBaby_Agents",
            "count": 19,
            "pattern": "Single File Agent (SFA)",
            "base_class": "base_agent.py"
        },
        "orchestrator": {
            "path": "/home/craigmbrown/Project/Orchestrator-Agent",
            "count": 13,
            "capabilities": ["workflow orchestration", "human-in-the-loop", "agent lifecycle"]
        },
        "whatsapp": {
            "path": "/home/craigmbrown/Project/WhatsApp-Manager-Agent",
            "count": 6,
            "capabilities": ["notifications", "messaging", "webhooks"]
        }
    },
    "workflows": {
        "path": "/home/craigmbrown/Project/.claude/skills/autonomous-workflows",
        "existing": ["github-starred-research", "email-to-action", "daily-intelligence",
                     "x-bookmarks-insights", "tb-command-processor", "cost-review"],
        "structure": {
            "WORKFLOW.md": "BLP properties, state machine",
            "config/": "YAML configurations",
            "scripts/": "Python implementations",
            "state/": "Deduplication tracking"
        }
    },
    "strategic_platform": {
        "path": "/home/craigmbrown/Project/strategic_platform",
        "components": {
            "core/blp/": "Base Level Properties implementations",
            "core/compute_advantage_calculator.py": "CA scoring",
            "agents/security/": "CaMel 4-layer architecture",
            "monitoring/": "Property validation"
        }
    },
    "memory_system": {
        "path": "/home/craigmbrown/Project/unified-communication/v4/memory",
        "types": 14,
        "capabilities": ["pattern storage", "semantic search", "cross-references"],
        "files": {
            "memory_types_v4.py": "Memory classifications",
            "rag_memory_loader_v4.py": "RAG integration",
            "semantic_search_engine.py": "Vector search"
        }
    },
    "hooks": {
        "path": "/home/craigmbrown/Project/.claude/hooks",
        "capabilities": ["pre/post tool use", "observability", "audit logging"],
        "files": {
            "pre_tool_use.py": "Pre-execution validation",
            "post_tool_use.py": "Code quality checks",
            "observability_hook.py": "16+ metrics"
        }
    },
    "delivery_channels": {
        "email": "/home/craigmbrown/Project/gmail_manager.py",
        "whatsapp": "/home/craigmbrown/Project/WhatsApp-Manager-Agent/send_direct_message.py",
        "notion": "/home/craigmbrown/Project/notion-mcp-server",
        "html": "/home/craigmbrown/Project/html-output"
    }
}


@dataclass
class BLPScore:
    """Base Level Properties scoring"""
    alignment: float = 0.0
    autonomy: float = 0.0
    durability: float = 0.0
    self_improvement: float = 0.0
    self_replication: float = 0.0
    self_organization: float = 0.0

    def total_score(self) -> float:
        return round((
            self.alignment + self.autonomy + self.durability +
            self.self_improvement + self.self_replication + self.self_organization
        ) / 6 * 100, 1)

    def calculate_ca(self) -> float:
        numerator = self.self_replication * self.autonomy
        time_factor = max(0.1, 1 - self.self_improvement)
        effort_factor = max(0.1, 1 - self.self_organization)
        cost_factor = max(0.1, 1 - self.durability)
        denominator = time_factor + effort_factor + cost_factor
        if denominator == 0:
            return 0.0
        return round(min(100, (numerator / denominator) * 100), 1)


@dataclass
class DesignPlan:
    """Integration design plan"""
    title: str
    overview: str
    architecture_diagram: str
    phases: List[Dict[str, str]]
    estimated_effort: str
    dependencies: List[str]
    risks: List[str]
    success_criteria: List[str]


@dataclass
class LLMAnalysis:
    """LLM-powered analysis result with integrate/compete/ignore verdict"""
    verdict: str  # INTEGRATE, COMPETE, IGNORE
    confidence: float  # 0-100
    rationale: str
    tb_overlap: List[str]  # TB capabilities that overlap with this repo
    tb_gaps: List[str]  # Gaps this repo fills that TB doesn't have
    competitive_edge: str  # Why integrate vs build our own
    plan_content: str  # plan_w_team format plan (for INTEGRATE only)
    llm_cost_usd: float = 0.0


@dataclass
class BusinessCase:
    """Business case for approval"""
    verdict: str  # INTEGRATE, COMPETE, IGNORE (upgraded from APPROVE/DEFER/REJECT)
    confidence: float  # 0-100
    strategic_fit: str
    value_proposition: List[str]
    concerns: List[str]
    next_steps: List[str]
    time_to_value: str
    roi_estimate: str


@dataclass
class RepoImage:
    """Image from repository"""
    url: str
    alt_text: str
    image_type: str


@dataclass
class EnhancedAnalysis:
    """Complete enhanced analysis"""
    repo_name: str
    repo_url: str
    description: str
    language: str
    stars: int
    forks: int
    topics: List[str]
    analyzed_at: str
    images: List[RepoImage]
    social_preview_url: Optional[str]
    architecture_summary: str
    key_features: List[str]
    code_quality_notes: str
    tech_stack: List[str]
    blp_scores: BLPScore
    blp_total: float
    ca_score: float
    design_plan: DesignPlan
    business_case: BusinessCase
    recommended_integration: str
    priority_level: str
    overall_recommendation: str
    claude_code_plan: str
    github_issue_url: Optional[str] = None
    dashboard_path: Optional[str] = None
    dashboard_tinyurl: Optional[str] = None


class EnhancedRepoAnalyzerV2:
    """Enhanced analyzer with business case and approval workflow"""

    def __init__(self):
        self.email_recipient = os.environ.get("EMAIL_RECIPIENT", "craigmbrown@gmail.com")
        PLANS_DIR.mkdir(parents=True, exist_ok=True)

        self.blp_indicators = {
            "alignment": ["api", "integration", "compatible", "standard", "protocol", "interface", "mcp", "sdk"],
            "autonomy": ["autonomous", "agent", "automatic", "self-", "independent", "daemon", "background", "cron"],
            "durability": ["persistent", "state", "recovery", "fault-tolerant", "resilient", "stable", "production", "enterprise"],
            "self_improvement": ["learning", "adaptive", "optimization", "improve", "train", "evolve", "ml", "ai"],
            "self_replication": ["scale", "distributed", "parallel", "spawn", "clone", "multi-", "cluster", "horizontal"],
            "self_organization": ["orchestrat", "workflow", "pipeline", "coordinate", "manage", "organize", "schedule"]
        }

    def run_llm_analysis(self, full_name: str, readme: str, details: Dict) -> Optional[LLMAnalysis]:
        """Run LLM-powered analysis comparing repo to TB capabilities.

        Uses claude --print to analyze the repo README against TB's actual codebase,
        producing an INTEGRATE/COMPETE/IGNORE verdict with rationale.
        For INTEGRATE verdicts, generates a plan_w_team format plan to specs/.
        """
        import shutil
        claude_bin = shutil.which("claude")
        if not claude_bin:
            print("  Warning: claude CLI not found, skipping LLM analysis")
            return None

        description = details.get("description", "No description")
        stars = details.get("stargazers_count", 0)
        language = details.get("language", "Unknown")
        topics = details.get("topics", [])
        readme_excerpt = readme[:8000]  # Keep prompt reasonable

        prompt = f"""You are analyzing a GitHub repository to decide how it relates to TheBaby (TB),
a multi-agent system ecosystem with 42+ agents, 10+ MCP servers, BLP framework, and DITD lifecycle.

## Repository Under Review
- **Name**: {full_name}
- **Description**: {description}
- **Language**: {language}
- **Stars**: {stars:,}
- **Topics**: {', '.join(topics[:15])}

## README (first 8000 chars)
{readme_excerpt}

## TB Capabilities (for comparison)
- 42+ specialized agents (TheBaby_Agents, Orchestrator-Agent, WhatsApp-Manager-Agent)
- 10+ MCP servers (agent-metric-mcp, whatsapp-mcp, quick-data-mcp, etc.)
- BLP framework (60 properties across 6 categories: Alignment, Autonomy, Durability, Self-Improvement, Self-Replication, Self-Organization)
- DITD lifecycle (Design-Implement-Test-Deploy) with multi-CLI adapter routing
- Claude Code hooks observability (16+ metrics)
- LLM cost optimization (79-83% reduction via multi-provider routing)
- Proof DB system, Agent Trust Infrastructure, Nostr proof publishing
- Fedimint agent economy, payment gateway
- Python 3.11+, systemd services, cron scheduling

## Your Task
Analyze this repository and produce a JSON response with EXACTLY this structure:
```json
{{
  "verdict": "INTEGRATE" or "COMPETE" or "IGNORE",
  "confidence": 0-100,
  "rationale": "2-3 sentence explanation of why this verdict",
  "tb_overlap": ["list of TB capabilities that already do what this repo does"],
  "tb_gaps": ["list of capabilities this repo provides that TB lacks"],
  "competitive_edge": "Why integrate this vs build our own (or why ignore/compete)",
  "integration_approach": "For INTEGRATE: specific plan for how to add to TB. For COMPETE: what to build instead. For IGNORE: why it's not relevant."
}}
```

## Verdict Guidelines
- **INTEGRATE**: This repo provides clear value TB doesn't have. Worth adding as MCP server, SFA agent, library, or workflow.
- **COMPETE**: TB already does this OR we should build our own version because the repo's approach doesn't fit TB's architecture.
- **IGNORE**: Not relevant to TB's mission, too immature, or overlaps completely with existing capability.

Output ONLY the JSON. No markdown fences, no explanation outside the JSON."""

        cmd = [
            claude_bin,
            "--print",
            "--output-format", "text",
            "--dangerously-skip-permissions",
            "--max-budget-usd", "1.50",
            "-p", prompt,
        ]

        try:
            # Strip CLAUDECODE env var to prevent nested session errors
            env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=120, cwd="/home/craigmbrown/Project", env=env
            )

            output = result.stdout.strip()
            # Try to extract JSON from output
            # Handle potential markdown fences
            if "```json" in output:
                output = output.split("```json")[1].split("```")[0].strip()
            elif "```" in output:
                output = output.split("```")[1].split("```")[0].strip()

            data = json.loads(output)

            verdict = data.get("verdict", "IGNORE").upper()
            if verdict not in ("INTEGRATE", "COMPETE", "IGNORE"):
                verdict = "IGNORE"

            # For INTEGRATE verdicts, generate plan_w_team format plan
            plan_content = ""
            if verdict == "INTEGRATE":
                plan_content = self._generate_plan_w_team_format(
                    full_name, description, language, stars, topics,
                    data.get("tb_gaps", []),
                    data.get("integration_approach", ""),
                    data.get("rationale", ""),
                )

            return LLMAnalysis(
                verdict=verdict,
                confidence=min(100, max(0, float(data.get("confidence", 50)))),
                rationale=data.get("rationale", ""),
                tb_overlap=data.get("tb_overlap", []),
                tb_gaps=data.get("tb_gaps", []),
                competitive_edge=data.get("competitive_edge", ""),
                plan_content=plan_content,
                llm_cost_usd=0.0,  # claude --print doesn't expose cost in text mode
            )

        except json.JSONDecodeError as e:
            print(f"  Warning: LLM returned non-JSON output: {e}")
            print(f"  Raw output (first 500 chars): {result.stdout[:500] if result.stdout else 'empty'}")
            return None
        except subprocess.TimeoutExpired:
            print(f"  Warning: LLM analysis timed out after 120s")
            return None
        except Exception as e:
            print(f"  Warning: LLM analysis failed: {e}")
            return None

    def _generate_plan_w_team_format(self, full_name: str, description: str, language: str,
                                     stars: int, topics: List[str], tb_gaps: List[str],
                                     integration_approach: str, rationale: str) -> str:
        """Generate a plan in /plan_w_team format and save to specs/.

        This produces the exact format consumed by the DITD pipeline:
        specs/plan-starred-{slug}.md
        """
        slug = re.sub(r'[^a-z0-9]+', '-', full_name.lower().replace('/', '-'))[:60]
        plan_path = Path(f"/home/craigmbrown/Project/specs/plan-starred-{slug}.md")
        now = datetime.now().strftime('%Y-%m-%d %H:%M UTC')

        gaps_text = "\n".join(f"- {g}" for g in tb_gaps) if tb_gaps else "- See integration approach"

        plan = f"""# Plan: Integrate {full_name}

## Metadata
- **Created**: {now}
- **Source**: GitHub Starred Repo Analysis (LLM-powered)
- **Priority**: P1
- **Complexity**: medium
- **Task Type**: enhancement
- **Repository**: https://github.com/{full_name}
- **Stars**: {stars:,}
- **Language**: {language}
- **Generated By**: enhanced_repo_analyzer_v2.py (LLM analysis)

## Task Description
Integrate [{full_name}](https://github.com/{full_name}) into the TB ecosystem.
{description}

## Objective
Add the capabilities from {full_name} that TB currently lacks, following ETAC patterns
(Python 3.11+, type hints, pydantic). Success = feature functional, tested, and integrated.

## Problem Statement
{rationale}

## TB Gaps This Fills
{gaps_text}

## Solution Approach
{integration_approach}

## Relevant Files
Files will be identified by the design agent via codebase analysis.

### Existing Files
- To be determined by design agent (Glob/Grep/Read analysis of TB codebase)

### New Files (if needed)
- To be determined during design phase

## Team Orchestration

### Team Members

| Role | Agent | Responsibility |
|------|-------|----------------|
| Designer | ditd-design-agent | Architecture, file identification, requirement mapping |
| Builder | ditd-implementation-agent | Core implementation with full tool access |
| Tester | ditd-test-agent | Test creation, coverage analysis |
| Deployer | ditd-deploy-agent | PR creation, deployment configuration |
| Validator | validator-agent | Read-only code quality validation |

### Coordination Protocol
1. Design agent analyzes TB codebase + starred repo for integration points
2. Implementation agent builds integration based on design spec
3. Test agent validates with comprehensive tests
4. Deploy agent creates PR and handles deployment
5. Validator reviews at each phase transition

## Implementation Phases

### Phase 1: Design
- Analyze {full_name} repo structure and API surface
- Map integration points in TB codebase
- Determine integration type (MCP server / SFA agent / library / workflow)
- Produce architecture spec with REQ-IDs

### Phase 2: Implementation
- Implement integration following ETAC patterns
- Add type hints, pydantic models where appropriate
- Wire into existing TB infrastructure

### Phase 3: Testing
- Unit tests for new integration
- Integration tests with existing TB components
- Edge case and error handling coverage

### Phase 4: Deployment
- Create PR with documentation
- Service configuration if needed
- Production deployment verification

## Step by Step Tasks

### 1. Design Analysis
**Assigned to**: ditd-design-agent
**Depends on**: None
**Complexity**: Medium

- [ ] Clone/read {full_name} repo README and key source files
- [ ] Identify which TB subsystem this integrates with
- [ ] Map capabilities to BLP properties
- [ ] Produce architecture specification
- [ ] Determine if MCP wrapper, SFA, or library integration

### 2. Core Implementation
**Assigned to**: ditd-implementation-agent
**Depends on**: Task 1
**Complexity**: Medium

- [ ] Implement core integration per design spec
- [ ] Follow ETAC patterns (Python 3.11+, type hints)
- [ ] Add requirement annotations to code
- [ ] Write inline documentation

### 3. Testing
**Assigned to**: ditd-test-agent
**Depends on**: Task 2
**Complexity**: Medium

- [ ] Create unit tests
- [ ] Create integration tests
- [ ] Verify the new capability works end-to-end
- [ ] Run full test suite

### 4. Code Review
**Assigned to**: validator-agent
**Depends on**: Tasks 2-3

- [ ] Code quality review
- [ ] Pattern compliance check
- [ ] Security review (if applicable)
- [ ] BLP property validation

### 5. Deployment
**Assigned to**: ditd-deploy-agent
**Depends on**: Tasks 3-4
**Complexity**: Low

- [ ] Create GitHub PR with documentation
- [ ] Configure any new services
- [ ] Verify production readiness

## Testing Strategy

- Unit tests for new integration code
- Integration tests with existing TB components
- Edge case coverage for API boundaries
- Performance validation

## Acceptance Criteria

- [ ] Integration with {full_name} is functional
- [ ] All tests passing
- [ ] Code follows ETAC patterns (Python 3.11+, type hints)
- [ ] PR created with proper documentation
- [ ] BLP properties maintained or improved

## Validation Commands

```bash
# Syntax check
python3 -m py_compile <new_files>

# Run tests
pytest tests/ -v

# Type checking
mypy <new_files> --ignore-missing-imports
```

## Notes

- **Source Repository**: https://github.com/{full_name} ({stars:,} stars, {language})
- **Topics**: {', '.join(topics[:10])}
- **Risks**: External dependency may change API; pin version
- **Follow-up**: Monitor upstream releases for breaking changes
"""

        plan_path.parent.mkdir(parents=True, exist_ok=True)
        plan_path.write_text(plan)
        print(f"  Saved plan_w_team format plan: {plan_path}")
        return str(plan_path)

    def fetch_repo_details(self, full_name: str) -> Dict:
        """Fetch detailed repo info from GitHub API"""
        try:
            result = subprocess.run(
                ["gh", "api", f"/repos/{full_name}"],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0:
                return json.loads(result.stdout)
        except Exception as e:
            print(f"  Warning: Could not fetch repo details: {e}")
        return {}

    def fetch_readme(self, full_name: str) -> str:
        """Fetch README content"""
        try:
            result = subprocess.run(
                ["gh", "api", f"/repos/{full_name}/readme", "--jq", ".content"],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0 and result.stdout.strip():
                content = base64.b64decode(result.stdout.strip()).decode('utf-8', errors='ignore')
                return content[:15000]
        except Exception as e:
            print(f"  Warning: Could not fetch README: {e}")
        return ""

    def extract_images(self, full_name: str, readme: str, repo_details: Dict) -> Tuple[List[RepoImage], Optional[str]]:
        """Extract images from repo"""
        images = []
        social_preview = None

        og_image = repo_details.get("open_graph_image_url")
        if og_image:
            social_preview = og_image
            images.append(RepoImage(url=og_image, alt_text="Repository Preview", image_type="social_preview"))

        raw_url_base = f"https://raw.githubusercontent.com/{full_name}/main/"
        img_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        for match in re.finditer(img_pattern, readme):
            alt_text = match.group(1) or "Image"
            img_url = match.group(2)
            if any(skip in img_url.lower() for skip in ['badge', 'shield', 'travis', 'codecov', 'npm', 'pypi']):
                continue
            if not img_url.startswith(('http://', 'https://')):
                img_url = raw_url_base + img_url.lstrip('./')
            images.append(RepoImage(url=img_url, alt_text=alt_text[:50], image_type="readme"))
            if len(images) >= 5:
                break

        return images[:5], social_preview

    def calculate_blp_scores(self, repo: Dict, readme: str, details: Dict) -> BLPScore:
        """Calculate BLP scores with enhanced analysis"""
        text = f"{repo.get('description', '')} {readme} {' '.join(details.get('topics', []))}".lower()
        scores = BLPScore()

        for category, keywords in self.blp_indicators.items():
            matches = sum(1 for kw in keywords if kw in text)
            score = min(1.0, matches / len(keywords) * 1.5)
            setattr(scores, category, score)

        stars = details.get('stargazers_count', 0)
        forks = details.get('forks_count', 0)

        if stars > 10000:
            scores.durability = min(1.0, scores.durability + 0.4)
        elif stars > 1000:
            scores.durability = min(1.0, scores.durability + 0.25)

        if forks > 1000:
            scores.self_replication = min(1.0, scores.self_replication + 0.3)

        topics = details.get('topics', [])
        if any(t in topics for t in ['agent', 'autonomous', 'ai-agent']):
            scores.autonomy = min(1.0, scores.autonomy + 0.4)
        if any(t in topics for t in ['mcp', 'langchain', 'llm']):
            scores.alignment = min(1.0, scores.alignment + 0.3)
        if any(t in topics for t in ['workflow', 'orchestration', 'pipeline']):
            scores.self_organization = min(1.0, scores.self_organization + 0.3)

        return scores

    def generate_business_case(self, repo: Dict, readme: str, details: Dict, blp: BLPScore, design_plan: DesignPlan) -> BusinessCase:
        """Generate informed business case for approval"""
        full_name = repo.get('full_name', 'unknown')
        stars = details.get('stargazers_count', 0)
        forks = details.get('forks_count', 0)
        blp_total = blp.total_score()
        ca_score = blp.calculate_ca()
        text = f"{repo.get('description', '')} {readme}".lower()
        topics = details.get('topics', [])

        # Strategic fit analysis
        strategic_keywords = ['agent', 'mcp', 'llm', 'ai', 'automation', 'workflow', 'orchestration', 'claude']
        strategic_matches = sum(1 for kw in strategic_keywords if kw in text or kw in topics)
        strategic_fit_score = min(100, strategic_matches * 15)

        if strategic_fit_score >= 60:
            strategic_fit = f"STRONG FIT ({strategic_fit_score}%) - Directly aligns with multi-agent ecosystem goals"
        elif strategic_fit_score >= 30:
            strategic_fit = f"MODERATE FIT ({strategic_fit_score}%) - Useful capabilities that extend current functionality"
        else:
            strategic_fit = f"WEAK FIT ({strategic_fit_score}%) - Limited strategic alignment, consider as reference only"

        # Value proposition
        value_props = []
        if 'mcp' in text or 'model context protocol' in text:
            value_props.append("🔌 Native MCP support enables direct Claude Code integration")
        if 'agent' in text or any(t in topics for t in ['agent', 'ai-agent']):
            value_props.append("🤖 Agent capabilities can extend TheBaby/Orchestrator ecosystem")
        if stars > 5000:
            value_props.append(f"⭐ High community adoption ({stars:,} stars) indicates production readiness")
        if blp.autonomy > 0.5:
            value_props.append("🚀 Strong autonomy score suggests minimal oversight required")
        if blp.self_organization > 0.5:
            value_props.append("📊 Good self-organization enables workflow integration")
        if 'api' in text or 'sdk' in text:
            value_props.append("🔗 API/SDK available for programmatic integration")
        if not value_props:
            value_props.append("📚 Useful as reference implementation or learning resource")

        # Concerns
        concerns = []
        if stars < 100:
            concerns.append("⚠️ Low community adoption - may lack support/documentation")
        if not details.get('license'):
            concerns.append("⚠️ License unclear - verify before commercial use")
        if 'experimental' in text or 'beta' in text or 'alpha' in text:
            concerns.append("⚠️ Experimental/beta status - API may change")
        if blp.durability < 0.3:
            concerns.append("⚠️ Low durability score - may require additional hardening")
        if forks < 10 and stars < 500:
            concerns.append("⚠️ Limited fork activity suggests low community contribution")

        # Determine verdict
        if blp_total >= 50 and ca_score >= 20 and strategic_fit_score >= 45:
            verdict = "APPROVE"
            confidence = min(95, 60 + strategic_fit_score * 0.3 + blp_total * 0.2)
            time_to_value = "1-2 weeks"
            roi_estimate = "HIGH - Direct productivity gains expected"
        elif blp_total >= 35 or (stars > 2000 and strategic_fit_score >= 30):
            verdict = "NEEDS_MORE_ANALYSIS"
            confidence = min(80, 40 + strategic_fit_score * 0.3 + blp_total * 0.2)
            time_to_value = "2-4 weeks (after deeper analysis)"
            roi_estimate = "MEDIUM - Value depends on specific use case"
        elif strategic_fit_score >= 20 or stars > 500:
            verdict = "DEFER"
            confidence = min(70, 30 + strategic_fit_score * 0.2)
            time_to_value = "Unknown - requires further evaluation"
            roi_estimate = "UNCERTAIN - Need to validate use cases"
        else:
            verdict = "REJECT"
            confidence = min(60, 20 + blp_total * 0.3)
            time_to_value = "N/A"
            roi_estimate = "LOW - Limited integration value"

        # Next steps based on verdict
        if verdict == "APPROVE":
            next_steps = [
                f"1. Create GitHub issue for tracking: {full_name}-integration",
                "2. Generate Claude Code implementation plan",
                "3. Set up development branch and begin Phase 1",
                "4. Schedule 30-min review after initial integration"
            ]
        elif verdict == "NEEDS_MORE_ANALYSIS":
            next_steps = [
                "1. Deep-dive into API documentation and examples",
                "2. Test with isolated proof-of-concept",
                "3. Evaluate integration complexity in sandbox",
                "4. Re-assess with findings in 1 week"
            ]
        elif verdict == "DEFER":
            next_steps = [
                "1. Add to watchlist for future consideration",
                "2. Monitor repository for maturity indicators",
                "3. Re-evaluate when specific use case arises"
            ]
        else:
            next_steps = [
                "1. Archive analysis for reference",
                "2. No immediate action required"
            ]

        return BusinessCase(
            verdict=verdict,
            confidence=round(confidence, 1),
            strategic_fit=strategic_fit,
            value_proposition=value_props,
            concerns=concerns if concerns else ["No significant concerns identified"],
            next_steps=next_steps,
            time_to_value=time_to_value,
            roi_estimate=roi_estimate
        )

    def generate_design_plan(self, repo: Dict, readme: str, details: Dict, blp: BLPScore) -> DesignPlan:
        """Generate integration design plan"""
        full_name = repo.get('full_name', 'unknown')
        language = details.get('language', 'Unknown')
        topics = details.get('topics', [])
        text = f"{repo.get('description', '')} {readme}".lower()

        if any(kw in text for kw in ['mcp', 'model context protocol']):
            integration_type = "MCP Server"
            arch_diagram = f"""
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code CLI                           │
│                         │                                    │
│    ┌───────────────────┼───────────────────┐                │
│    │                   ▼                   │                │
│    │         MCP Server Manager            │                │
│    │              │                        │                │
│    │    ┌────────┼────────┐               │                │
│    │    ▼        ▼        ▼               │                │
│  [Existing]  [NEW: {full_name.split('/')[-1][:12]}]  [Other MCP]   │
│   Servers      Server       Servers       │                │
│    │              │           │            │                │
│    └──────────────┼───────────┘            │                │
│                   ▼                        │                │
│          Tool/Resource Access              │                │
└─────────────────────────────────────────────────────────────┘"""
            phases = [
                {"phase": "1. Setup", "description": "Clone repo, install dependencies, configure environment", "effort": "30 min"},
                {"phase": "2. MCP Wrapper", "description": "Create MCP server wrapper if not native MCP", "effort": "1-2 hours"},
                {"phase": "3. Configuration", "description": "Add to claude_desktop_config.json", "effort": "15 min"},
                {"phase": "4. Testing", "description": "Test tool discovery and execution", "effort": "30 min"},
                {"phase": "5. Integration", "description": "Document usage patterns, add to agent workflows", "effort": "1 hour"},
            ]
            effort = "3-4 hours"

        elif any(kw in text for kw in ['agent', 'autonomous', 'langchain', 'autogen']):
            integration_type = "Agent Integration"
            arch_diagram = f"""
┌─────────────────────────────────────────────────────────────┐
│              Multi-Agent Orchestration System               │
│                         │                                    │
│    ┌───────────────────┼───────────────────┐                │
│    │                   ▼                   │                │
│    │         Orchestrator Agent            │                │
│    │              │                        │                │
│    │    ┌────────┼────────┐               │                │
│    │    ▼        ▼        ▼               │                │
│  [TheBaby]  [NEW: {full_name.split('/')[-1][:12]}]  [Specialized]  │
│   Agents     Agent         Agents         │                │
│    │              │           │            │                │
│    └──────────────┼───────────┘            │                │
│                   ▼                        │                │
│        Shared Memory / State Store         │                │
└─────────────────────────────────────────────────────────────┘"""
            phases = [
                {"phase": "1. Analysis", "description": "Study agent architecture and capabilities", "effort": "1 hour"},
                {"phase": "2. SFA Wrapper", "description": "Create Single File Agent wrapper", "effort": "2-3 hours"},
                {"phase": "3. Registry", "description": "Register in agent_registry.json", "effort": "15 min"},
                {"phase": "4. Orchestration", "description": "Add to orchestrator workflow definitions", "effort": "1 hour"},
                {"phase": "5. Testing", "description": "End-to-end agent collaboration testing", "effort": "1-2 hours"},
            ]
            effort = "5-7 hours"

        elif any(kw in text for kw in ['cli', 'command', 'terminal', 'shell']) or language == 'Shell':
            integration_type = "CLI Tool"
            arch_diagram = f"""
┌─────────────────────────────────────────────────────────────┐
│                    Bash Tool Interface                       │
│                         │                                    │
│    ┌───────────────────┼───────────────────┐                │
│    │                   ▼                   │                │
│    │         scripts/ directory            │                │
│    │              │                        │                │
│    │    ┌────────┼────────┐               │                │
│    │    ▼        ▼        ▼               │                │
│  [Existing]  [NEW: {full_name.split('/')[-1][:12]}]  [Other CLI]   │
│   Scripts     Wrapper       Tools         │                │
│    │              │           │            │                │
│    └──────────────┼───────────┘            │                │
│                   ▼                        │                │
│           Output Processing                │                │
└─────────────────────────────────────────────────────────────┘"""
            phases = [
                {"phase": "1. Install", "description": "Install binary or clone repo", "effort": "15 min"},
                {"phase": "2. Wrapper", "description": "Create wrapper script with error handling", "effort": "30 min"},
                {"phase": "3. PATH", "description": "Add to PATH or create alias", "effort": "5 min"},
                {"phase": "4. Integration", "description": "Document usage in agent workflows", "effort": "30 min"},
            ]
            effort = "1-2 hours"

        else:
            integration_type = "Library/Reference"
            arch_diagram = f"""
┌─────────────────────────────────────────────────────────────┐
│                   Code Integration                           │
│                         │                                    │
│    ┌───────────────────┼───────────────────┐                │
│    │                   ▼                   │                │
│    │         requirements.txt              │                │
│    │              │                        │                │
│    │    ┌────────┼────────┐               │                │
│    │    ▼        ▼        ▼               │                │
│  [Current]  [NEW: {full_name.split('/')[-1][:12]}]  [Other Deps]   │
│    Deps       Package                      │                │
│    │              │           │            │                │
│    └──────────────┼───────────┘            │                │
│                   ▼                        │                │
│          Import in Existing Code           │                │
└─────────────────────────────────────────────────────────────┘"""
            phases = [
                {"phase": "1. Install", "description": "pip install or add to requirements", "effort": "5 min"},
                {"phase": "2. Import", "description": "Add imports to relevant modules", "effort": "15 min"},
                {"phase": "3. Implement", "description": "Use library functions in code", "effort": "1-2 hours"},
                {"phase": "4. Test", "description": "Write tests for integration", "effort": "30 min"},
            ]
            effort = "2-3 hours"

        deps = []
        if 'python' in language.lower():
            deps.append("Python 3.10+")
        if 'typescript' in language.lower() or 'javascript' in language.lower():
            deps.append("Node.js 18+")
        if 'docker' in text:
            deps.append("Docker")
        if 'api' in text:
            deps.append("API credentials (if required)")

        risks = []
        if details.get('stargazers_count', 0) < 100:
            risks.append("Low community adoption - may have limited support")
        if not details.get('license'):
            risks.append("License unclear - verify before commercial use")
        if 'experimental' in text or 'beta' in text:
            risks.append("Experimental/beta status - API may change")

        criteria = [
            "Tool/library accessible from Claude Code",
            "Error handling implemented",
            "Documentation updated",
            "Integration tested with sample workflows"
        ]
        if blp.autonomy > 0.5:
            criteria.append("Autonomous operation verified")

        return DesignPlan(
            title=f"{integration_type} Integration: {full_name}",
            overview=f"Integrate {full_name} into the multi-agent ecosystem as a {integration_type.lower()}.",
            architecture_diagram=arch_diagram,
            phases=phases,
            estimated_effort=effort,
            dependencies=deps,
            risks=risks if risks else ["Standard integration risks only"],
            success_criteria=criteria
        )

    def load_blp_metrics(self) -> Dict:
        """Load BLP metrics from CC-Monitor state file"""
        if BLP_METRICS_FILE.exists():
            try:
                metrics = json.loads(BLP_METRICS_FILE.read_text())
                return metrics
            except Exception as e:
                print(f"  Warning: Could not load BLP metrics: {e}")
        # Return default structure if file doesn't exist
        return {
            "summary": {"total_properties": 60, "achieved": 2, "achievement_rate": 3.3},
            "categories": {
                "alignment": {"properties_total": 10, "avg_progress": 50.0},
                "autonomy": {"properties_total": 10, "avg_progress": 45.0},
                "durability": {"properties_total": 10, "avg_progress": 48.0},
                "self_improvement": {"properties_total": 10, "avg_progress": 52.0},
                "self_replication": {"properties_total": 10, "avg_progress": 47.0},
                "self_organization": {"properties_total": 10, "avg_progress": 49.0}
            }
        }

    def analyze_integration_points(self, analysis_data: Dict) -> Dict:
        """Analyze codebase to determine optimal integration points with reasoning"""
        integration_type = analysis_data.get('recommended_integration', '')
        repo_name = analysis_data.get('repo_name', '')
        language = analysis_data.get('language', 'python').lower()
        description = analysis_data.get('description', '').lower()
        topics = [t.lower() for t in analysis_data.get('topics', [])]

        integration_points = {
            "where": [],
            "how": [],
            "why": [],
            "blp_impact": {},
            "affected_files": [],
            "new_files": [],
            "dependencies_to_add": []
        }

        # Determine integration category based on type
        if 'MCP Server' in integration_type:
            integration_points["where"] = [
                {
                    "path": f"{CODEBASE_INTEGRATION_MAP['mcp_servers']['base_path']}/{repo_name.split('/')[-1]}-mcp/",
                    "description": "New MCP server directory following established pattern",
                    "reason": "MCP servers provide Claude Code with direct tool access"
                },
                {
                    "path": f"{CODEBASE_INTEGRATION_MAP['mcp_servers']['base_path']}/.claude/settings.local.json",
                    "description": "Register MCP server in Claude Code configuration",
                    "reason": "Required for Claude Code to discover and use the MCP tools"
                }
            ]
            integration_points["how"] = [
                {
                    "step": "Create MCP server structure",
                    "details": "Copy template from existing MCP server (e.g., quick-data-mcp)",
                    "pattern": CODEBASE_INTEGRATION_MAP['mcp_servers']['structure'],
                    "code_example": """# pyproject.toml structure
[project]
name = "{repo_name}-mcp"
version = "0.1.0"
dependencies = ["mcp", "pydantic", "httpx"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/{package_name}"]"""
                },
                {
                    "step": "Implement tools",
                    "details": "Create tool functions with @mcp.tool decorator",
                    "code_example": """from mcp.server import Server
from mcp.types import Tool, TextContent

@server.tool()
async def primary_tool(param: str) -> list[TextContent]:
    \"\"\"Tool description for Claude Code\"\"\"
    result = await call_external_api(param)
    return [TextContent(type="text", text=result)]"""
                },
                {
                    "step": "Register in settings",
                    "details": "Add to mcpServers in .claude/settings.local.json",
                    "code_example": """"{repo_name.split('/')[-1]}-mcp": {{
    "command": "uv",
    "args": ["--directory", "{path}", "run", "main.py"],
    "env": {{}}
}}"""
                }
            ]
            integration_points["why"] = [
                "MCP servers provide the most powerful integration - Claude Code can directly call tools",
                f"Existing pattern: {len(CODEBASE_INTEGRATION_MAP['mcp_servers']['existing'])} MCP servers already in use",
                "UV-based deployment ensures isolated dependencies without conflicts",
                "Enables autonomous operation through direct tool invocation"
            ]
            integration_points["blp_impact"] = {
                "alignment": "+15%: Direct tool access improves task-specific capabilities",
                "autonomy": "+25%: Claude Code can use tools without human intervention",
                "durability": "+10%: Isolated MCP server can be independently maintained",
                "self_replication": "+20%: Pattern can be replicated for similar tools"
            }
            integration_points["new_files"] = [
                f"{repo_name.split('/')[-1]}-mcp/pyproject.toml",
                f"{repo_name.split('/')[-1]}-mcp/main.py",
                f"{repo_name.split('/')[-1]}-mcp/src/mcp_server/server.py",
                f"{repo_name.split('/')[-1]}-mcp/src/mcp_server/tools/*.py"
            ]

        elif 'TheBaby Agent' in integration_type or 'agent' in description:
            integration_points["where"] = [
                {
                    "path": f"{CODEBASE_INTEGRATION_MAP['agents']['thebaby']['path']}/sfa_{repo_name.split('/')[-1].replace('-', '_')}.py",
                    "description": "New Single File Agent following SFA pattern",
                    "reason": "SFA pattern enables self-contained, reusable agent capabilities"
                },
                {
                    "path": f"{CODEBASE_INTEGRATION_MAP['agents']['thebaby']['path']}/base_agent.py",
                    "description": "Import base class for consistent behavior",
                    "reason": "Ensures standard agent lifecycle and error handling"
                }
            ]
            integration_points["how"] = [
                {
                    "step": "Create SFA structure",
                    "details": "Single file with UV dependencies, imports, and main execution",
                    "code_example": """#!/usr/bin/env python3
# /// script
# dependencies = ["anthropic", "httpx", "rich"]
# ///
\"\"\"Single File Agent: {repo_name}\"\"\"

import anthropic
from base_agent import BaseAgent

class {class_name}Agent(BaseAgent):
    def __init__(self):
        super().__init__(name="{agent_name}")

    async def execute(self, task: str) -> str:
        # Integration logic here
        pass

if __name__ == "__main__":
    agent = {class_name}Agent()
    asyncio.run(agent.run())"""
                }
            ]
            integration_points["why"] = [
                f"TheBaby has {CODEBASE_INTEGRATION_MAP['agents']['thebaby']['count']} existing SFA agents - proven pattern",
                "Single file agents are easy to test, deploy, and maintain",
                "Can be invoked via Claude Code Task tool with subagent_type"
            ]
            integration_points["blp_impact"] = {
                "alignment": "+20%: Task-specific agent improves goal achievement",
                "autonomy": "+30%: Agent can operate independently once invoked",
                "self_improvement": "+15%: Agent can be enhanced without system changes"
            }

        elif 'Workflow' in integration_type or any(w in topics for w in ['automation', 'workflow', 'pipeline']):
            integration_points["where"] = [
                {
                    "path": f"{CODEBASE_INTEGRATION_MAP['workflows']['path']}/{repo_name.split('/')[-1]}/",
                    "description": "New autonomous workflow directory",
                    "reason": "Workflows enable scheduled, unattended execution"
                },
                {
                    "path": f"{CODEBASE_INTEGRATION_MAP['workflows']['path']}/{repo_name.split('/')[-1]}/WORKFLOW.md",
                    "description": "Workflow documentation with BLP properties",
                    "reason": "Required for workflow discovery and execution"
                }
            ]
            integration_points["how"] = [
                {
                    "step": "Create workflow structure",
                    "details": "Follow established pattern with WORKFLOW.md, config/, scripts/, state/",
                    "pattern": CODEBASE_INTEGRATION_MAP['workflows']['structure'],
                    "code_example": f"""# Example structure:
{repo_name.split('/')[-1]}/
├── WORKFLOW.md           # BLP properties, state machine docs
├── config/
│   └── workflow.yaml     # Configuration parameters
├── scripts/
│   └── main_processor.py # Python implementation
└── state/
    └── processed.json    # Deduplication tracking"""
                }
            ]
            integration_points["why"] = [
                f"Follows pattern of {len(CODEBASE_INTEGRATION_MAP['workflows']['existing'])} existing autonomous workflows",
                "Enables cron-based scheduled execution",
                "State tracking prevents duplicate processing"
            ]
            integration_points["blp_impact"] = {
                "durability": "+25%: Workflows run continuously without intervention",
                "self_organization": "+20%: Can restructure based on results",
                "alignment": "+15%: Focuses on specific automation goals"
            }

        else:  # Library/CLI integration
            integration_points["where"] = [
                {
                    "path": f"{CODEBASE_INTEGRATION_MAP['strategic_platform']['path']}/integrations/{repo_name.split('/')[-1]}/",
                    "description": "Integration module in strategic platform",
                    "reason": "Strategic platform provides unified integration layer"
                }
            ]
            integration_points["how"] = [
                {
                    "step": "Add to requirements",
                    "details": "Add dependency to relevant requirements.txt",
                    "code_example": f"# In requirements.txt\n{repo_name.split('/')[-1]}>=0.1.0"
                },
                {
                    "step": "Create wrapper module",
                    "details": "Create Python module with error handling and logging",
                    "code_example": """# strategic_platform/integrations/{name}/client.py
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class {ClassName}Client:
    def __init__(self, config: dict):
        self.config = config

    async def execute(self, params: dict) -> dict:
        try:
            # Integration logic
            return {"status": "success", "result": result}
        except Exception as e:
            logger.error(f"Integration error: {e}")
            return {"status": "error", "message": str(e)}"""
                }
            ]
            integration_points["why"] = [
                "Library integration provides reusable functionality across agents",
                "Wrapper pattern enables consistent error handling",
                "Can be imported by any TheBaby agent or workflow"
            ]
            integration_points["blp_impact"] = {
                "alignment": "+10%: Adds new capability to ecosystem",
                "self_improvement": "+10%: Can optimize over time"
            }

        # Add memory system integration if applicable
        if 'memory' in description or 'cache' in description or 'store' in description:
            integration_points["affected_files"].append({
                "path": CODEBASE_INTEGRATION_MAP['memory_system']['path'],
                "reason": "Memory system integration for pattern storage",
                "integration": "Add memory type or use existing semantic search"
            })

        # Add delivery channel integrations
        if 'notify' in description or 'alert' in description or 'message' in description:
            integration_points["affected_files"].append({
                "path": CODEBASE_INTEGRATION_MAP['delivery_channels']['whatsapp'],
                "reason": "WhatsApp notification integration",
                "integration": "Use existing send_direct_message.py for notifications"
            })

        return integration_points

    def generate_claude_code_plan(self, analysis_data: Dict) -> str:
        """Generate comprehensive Claude Code implementation plan with WHERE/HOW/WHY sections"""
        repo_name = analysis_data['repo_name']
        safe_name = repo_name.replace('/', '_')
        plan_file = PLANS_DIR / f"{safe_name}_plan.md"

        # Load live BLP metrics from CC-Monitor
        blp_metrics = self.load_blp_metrics()

        # Analyze integration points
        integration = self.analyze_integration_points(analysis_data)

        # Calculate enhanced CA score based on 60-property system
        current_achievement = blp_metrics.get('summary', {}).get('achievement_rate', 3.3)
        projected_achievement = current_achievement
        for category, impact in integration['blp_impact'].items():
            if '+' in impact:
                try:
                    increase = float(impact.split('+')[1].split('%')[0])
                    projected_achievement += increase / 6  # Spread across 6 categories
                except:
                    pass

        plan_content = f"""# Claude Code Implementation Plan: {repo_name}

## 📋 Overview
- **Repository**: [{repo_name}](https://github.com/{repo_name})
- **Integration Type**: {analysis_data['recommended_integration']}
- **Priority**: {analysis_data['priority_level'].upper()}
- **Estimated Effort**: {analysis_data['design_plan']['estimated_effort']}
- **Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M')}

---

## 📊 Business Case
**Verdict**: {analysis_data['business_case']['verdict']}
**Confidence**: {analysis_data['business_case']['confidence']}%

### Strategic Fit
{analysis_data['business_case']['strategic_fit']}

### Value Proposition
{chr(10).join('- ' + v for v in analysis_data['business_case']['value_proposition'])}

### Concerns
{chr(10).join('- ' + c for c in analysis_data['business_case']['concerns'])}

---

## 📍 WHERE: Codebase Integration Points

### Primary Integration Locations
"""
        for loc in integration['where']:
            plan_content += f"""
#### `{loc['path']}`
- **Description**: {loc['description']}
- **Reason**: {loc['reason']}
"""

        if integration['affected_files']:
            plan_content += "\n### Additional Affected Files\n"
            for af in integration['affected_files']:
                plan_content += f"""
- **{af['path']}**
  - Reason: {af['reason']}
  - Integration: {af['integration']}
"""

        if integration['new_files']:
            plan_content += "\n### New Files to Create\n```\n"
            plan_content += "\n".join(integration['new_files'])
            plan_content += "\n```\n"

        plan_content += f"""

---

## 🔧 HOW: Integration Approach

### Step-by-Step Implementation
"""
        for i, step in enumerate(integration['how'], 1):
            plan_content += f"""
### Step {i}: {step['step']}
**Details**: {step['details']}

"""
            if 'pattern' in step:
                plan_content += "**Pattern Reference**:\n```\n"
                for key, val in step['pattern'].items():
                    plan_content += f"{key}: {val}\n"
                plan_content += "```\n\n"

            if 'code_example' in step:
                plan_content += f"""**Code Example**:
```python
{step['code_example']}
```

"""

        plan_content += f"""
---

## 💡 WHY: Integration Reasoning

### Rationale for This Approach
{chr(10).join('- ' + w for w in integration['why'])}

### BLP Impact Analysis
Based on the 60-property BLP framework from CC-Monitor:

| Category | Current Progress | Projected Impact |
|----------|-----------------|------------------|
"""
        categories = blp_metrics.get('categories', {})
        for cat, impact in integration['blp_impact'].items():
            current = categories.get(cat, {}).get('avg_progress', 0)
            plan_content += f"| {cat.replace('_', ' ').title()} | {current:.1f}% | {impact} |\n"

        plan_content += f"""
### System-Wide Impact
- **Current BLP Achievement**: {blp_metrics.get('summary', {}).get('achievement_rate', 3.3):.1f}% ({blp_metrics.get('summary', {}).get('achieved', 2)}/{blp_metrics.get('summary', {}).get('total_properties', 60)} properties)
- **Projected Achievement**: {projected_achievement:.1f}%
- **Properties Affected**: {len(integration['blp_impact'])} categories

---

## 📋 Implementation Phases

"""
        for phase in analysis_data['design_plan']['phases']:
            plan_content += f"""### {phase['phase']}
- **Description**: {phase['description']}
- **Effort**: {phase['effort']}
- **Status**: ⬜ Not Started

"""

        plan_content += f"""---

## 🏗️ Architecture

```
{analysis_data['design_plan']['architecture_diagram']}
```

---

## 📦 Dependencies
{chr(10).join('- ' + d for d in analysis_data['design_plan']['dependencies'])}

---

## ✅ Success Criteria
{chr(10).join('- [ ] ' + c for c in analysis_data['design_plan']['success_criteria'])}

---

## ⚠️ Risks & Mitigations
{chr(10).join('- ' + r for r in analysis_data['design_plan']['risks'])}

---

## 📈 BLP Scores (Repository Analysis)
| Property | Score | System Avg |
|----------|-------|------------|
| Alignment | {round(analysis_data['blp_scores']['alignment'] * 100)}% | {categories.get('alignment', {}).get('avg_progress', 50):.0f}% |
| Autonomy | {round(analysis_data['blp_scores']['autonomy'] * 100)}% | {categories.get('autonomy', {}).get('avg_progress', 45):.0f}% |
| Durability | {round(analysis_data['blp_scores']['durability'] * 100)}% | {categories.get('durability', {}).get('avg_progress', 48):.0f}% |
| Self-Improvement | {round(analysis_data['blp_scores']['self_improvement'] * 100)}% | {categories.get('self_improvement', {}).get('avg_progress', 52):.0f}% |
| Self-Replication | {round(analysis_data['blp_scores']['self_replication'] * 100)}% | {categories.get('self_replication', {}).get('avg_progress', 47):.0f}% |
| Self-Organization | {round(analysis_data['blp_scores']['self_organization'] * 100)}% | {categories.get('self_organization', {}).get('avg_progress', 49):.0f}% |
| **Total BLP** | **{analysis_data['blp_total']}%** | **{blp_metrics.get('summary', {}).get('average_progress', 48.5):.1f}%** |
| **CA Score** | **{analysis_data['ca_score']}** | - |

---

## 🎯 Next Steps
{chr(10).join(analysis_data['business_case']['next_steps'])}

---

## 🔗 Codebase References
- **MCP Servers**: {', '.join(CODEBASE_INTEGRATION_MAP['mcp_servers']['existing'][:3])}...
- **TheBaby Agents**: {CODEBASE_INTEGRATION_MAP['agents']['thebaby']['count']} SFAs at `{CODEBASE_INTEGRATION_MAP['agents']['thebaby']['path']}`
- **Workflows**: {len(CODEBASE_INTEGRATION_MAP['workflows']['existing'])} active at `{CODEBASE_INTEGRATION_MAP['workflows']['path']}`
- **BLP Metrics**: Live from `{BLP_METRICS_FILE}`

---
*Plan generated by Enhanced Repo Analyzer v2 with Codebase Integration Analysis*
*System BLP Coverage: {blp_metrics.get('summary', {}).get('achievement_rate', 3.3):.1f}% | Generated: {datetime.now().isoformat()}*
"""

        plan_file.parent.mkdir(parents=True, exist_ok=True)
        plan_file.write_text(plan_content)
        return str(plan_file)

    def create_github_issue(self, analysis_data: Dict) -> Optional[str]:
        """Create GitHub issue for tracking integration"""
        repo_name = analysis_data['repo_name']
        safe_title = f"[Integration] {repo_name}"

        body = f"""## Integration Request: {repo_name}

### Summary
- **Repository**: https://github.com/{repo_name}
- **Integration Type**: {analysis_data['recommended_integration']}
- **Priority**: {analysis_data['priority_level'].upper()}
- **BLP Score**: {analysis_data['blp_total']}%
- **CA Score**: {analysis_data['ca_score']}
- **Estimated Effort**: {analysis_data['design_plan']['estimated_effort']}

### Business Case
**Verdict**: {analysis_data['business_case']['verdict']}
**Confidence**: {analysis_data['business_case']['confidence']}%

{analysis_data['business_case']['strategic_fit']}

### Value Proposition
{chr(10).join('- ' + v for v in analysis_data['business_case']['value_proposition'])}

### Implementation Phases
{chr(10).join('- [ ] ' + p['phase'] + ': ' + p['description'] for p in analysis_data['design_plan']['phases'])}

### Success Criteria
{chr(10).join('- [ ] ' + c for c in analysis_data['design_plan']['success_criteria'])}

### Concerns/Risks
{chr(10).join('- ' + c for c in analysis_data['business_case']['concerns'])}

---
*Generated by Enhanced Repo Analyzer v2 | {datetime.now().strftime('%Y-%m-%d %H:%M')}*
"""

        try:
            # Create issue in the main project repo
            result = subprocess.run(
                ["gh", "issue", "create",
                 "--repo", "craigmbrown/Project",
                 "--title", safe_title,
                 "--body", body,
                 "--label", "integration,github-starred"],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0:
                issue_url = result.stdout.strip()
                # Log the created issue
                log_entry = {
                    "repo": repo_name,
                    "issue_url": issue_url,
                    "created_at": datetime.now().isoformat(),
                    "verdict": analysis_data['business_case']['verdict']
                }
                self._log_issue(log_entry)
                return issue_url
        except Exception as e:
            print(f"  Warning: Could not create GitHub issue: {e}")
        return None

    def _log_issue(self, entry: Dict):
        """Log created issue"""
        issues = []
        if ISSUES_LOG.exists():
            try:
                issues = json.loads(ISSUES_LOG.read_text())
            except:
                pass
        issues.append(entry)
        ISSUES_LOG.write_text(json.dumps(issues, indent=2))

    def create_tinyurl(self, url: str) -> Optional[str]:
        """Create TinyURL for a given URL"""
        try:
            response = requests.get(TINYURL_API, params={"url": url}, timeout=10)
            if response.status_code == 200:
                return response.text.strip()
        except Exception as e:
            print(f"  Warning: Could not create TinyURL: {e}")
        return None

    def generate_dashboard(self, analysis: 'EnhancedAnalysis') -> Tuple[Optional[str], Optional[str]]:
        """Generate GenUI HTML dashboard and return path and TinyURL"""
        HTML_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        safe_name = analysis.repo_name.replace('/', '-').lower()
        date_str = datetime.now().strftime('%Y%m%d')
        filename = f"{date_str}-starred-{safe_name}.html"
        filepath = HTML_OUTPUT_DIR / filename

        verdict_colors = {"APPROVE": "#4caf50", "NEEDS_MORE_ANALYSIS": "#ff9800", "DEFER": "#9e9e9e", "REJECT": "#f44336"}
        verdict_color = verdict_colors.get(analysis.business_case.verdict, "#808080")

        def score_color(score: float) -> str:
            if score >= 0.7: return "#4caf50"
            if score >= 0.4: return "#ff9800"
            return "#808080"

        # Build phases HTML
        phases_html = ""
        for phase in analysis.design_plan.phases:
            phases_html += f'''
                <div class="phase-item">
                    <div class="phase-header">
                        <strong>{phase['phase']}</strong>
                        <span class="effort-tag">{phase['effort']}</span>
                    </div>
                    <p>{phase['description']}</p>
                </div>'''

        # Build images HTML
        images_html = ""
        if analysis.images:
            images_html = '<div class="images-section"><h3>Repository Images</h3><div class="images-grid">'
            for img in analysis.images[:3]:
                images_html += f'''<div class="image-card">
                    <img src="{img.url}" alt="{img.alt_text}" onerror="this.parentElement.style.display='none'">
                    <span class="image-caption">{img.alt_text}</span>
                </div>'''
            images_html += '</div></div>'

        html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{analysis.business_case.verdict}: {analysis.repo_name} Analysis</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #e0e0e0;
            background: #1a1a1a;
            margin: 0;
            padding: 20px;
        }}
        article {{
            max-width: 900px;
            margin: 0 auto;
            background: #2d2d2d;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }}
        h1, h2, h3 {{ color: #e0e0e0; }}
        h1 {{ border-bottom: 3px solid {verdict_color}; padding-bottom: 15px; }}
        h2 {{ border-left: 4px solid #4a9eff; padding-left: 10px; margin-top: 30px; }}
        .verdict-banner {{
            background: linear-gradient(135deg, {verdict_color}22 0%, #2d2d2d 100%);
            border-left: 4px solid {verdict_color};
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }}
        .verdict-badge {{
            background: {verdict_color};
            color: #fff;
            padding: 6px 16px;
            border-radius: 4px;
            font-weight: bold;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }}
        .stat-card {{
            background: #1a1a1a;
            border: 1px solid #404040;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }}
        .stat-value {{ font-size: 28px; font-weight: bold; color: #4a9eff; }}
        .stat-label {{ color: #b0b0b0; font-size: 13px; margin-top: 5px; }}
        .blp-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 15px 0;
        }}
        .blp-item {{
            background: #1a1a1a;
            padding: 12px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
        }}
        .phase-item {{
            background: #1a1a1a;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 3px solid #4a9eff;
        }}
        .phase-header {{ display: flex; justify-content: space-between; align-items: center; }}
        .phase-item p {{ color: #b0b0b0; margin: 8px 0 0 0; }}
        .effort-tag {{ background: #e65100; color: #ff9800; padding: 2px 8px; border-radius: 4px; font-size: 12px; }}
        .value-list, .concern-list {{ margin: 0; padding-left: 20px; }}
        .value-list li {{ color: #4caf50; margin: 5px 0; }}
        .concern-list li {{ color: #ff9800; margin: 5px 0; }}
        pre {{
            background: #0d1117;
            border-left: 3px solid #4a9eff;
            padding: 15px;
            overflow-x: auto;
            border-radius: 4px;
        }}
        code {{ color: #79c0ff; font-family: 'Monaco', 'Menlo', monospace; }}
        a {{ color: #4a9eff; text-decoration: none; }}
        a:hover {{ color: #79c0ff; text-decoration: underline; }}
        .info-section {{
            background: #1e3a5f;
            border-left: 4px solid #4a9eff;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }}
        .topic-tag {{
            display: inline-block;
            background: #1e3a5f;
            color: #4a9eff;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin: 2px;
        }}
        .images-section {{ margin: 20px 0; }}
        .images-grid {{ display: flex; gap: 15px; flex-wrap: wrap; }}
        .image-card {{ flex: 1; min-width: 200px; max-width: 280px; }}
        .image-card img {{ width: 100%; border-radius: 8px; border: 1px solid #404040; }}
        .image-caption {{ display: block; color: #808080; font-size: 11px; text-align: center; margin-top: 5px; }}
        footer {{
            text-align: center;
            color: #808080;
            padding: 20px;
            border-top: 1px solid #404040;
            margin-top: 30px;
        }}
    </style>
</head>
<body>
    <article>
        <header>
            <h1>{analysis.repo_name}</h1>
        </header>

        <div class="verdict-banner">
            <span class="verdict-badge">{analysis.business_case.verdict}</span>
            <span style="margin-left: 15px; color: #b0b0b0;">Confidence: <strong style="color: {verdict_color};">{analysis.business_case.confidence}%</strong></span>
            <p style="margin: 15px 0 5px 0; font-size: 18px;"><a href="{analysis.repo_url}">{analysis.repo_url}</a></p>
            <p style="color: #b0b0b0; margin: 0;">{analysis.description}</p>
            <div style="margin-top: 15px;">
                <span style="color: #ffd700;">⭐ {analysis.stars:,}</span>
                <span style="color: #4a9eff; margin-left: 15px;">🍴 {analysis.forks:,}</span>
                <span style="color: #4a9eff; margin-left: 15px;">📂 {analysis.language}</span>
            </div>
            <div style="margin-top: 10px;">{"".join(f'<span class="topic-tag">{t}</span>' for t in analysis.topics[:8])}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{analysis.blp_total}%</div>
                <div class="stat-label">BLP Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{analysis.ca_score}</div>
                <div class="stat-label">CA Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{analysis.priority_level.upper()}</div>
                <div class="stat-label">Priority</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{analysis.design_plan.estimated_effort}</div>
                <div class="stat-label">Est. Effort</div>
            </div>
        </div>

        <h2>💼 Business Case</h2>
        <div class="info-section">
            <strong>Strategic Fit:</strong> {analysis.business_case.strategic_fit}
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            <div>
                <h3 style="color: #4caf50;">✅ Value Proposition</h3>
                <ul class="value-list">{"".join(f'<li>{v}</li>' for v in analysis.business_case.value_proposition)}</ul>
            </div>
            <div>
                <h3 style="color: #ff9800;">⚠️ Concerns</h3>
                <ul class="concern-list">{"".join(f'<li>{c}</li>' for c in analysis.business_case.concerns)}</ul>
            </div>
        </div>
        <p><strong>Time to Value:</strong> {analysis.business_case.time_to_value} | <strong>ROI:</strong> {analysis.business_case.roi_estimate}</p>

        <h2>📊 BLP Property Scores</h2>
        <div class="blp-grid">
            <div class="blp-item"><span>Alignment</span><span style="color: {score_color(analysis.blp_scores.alignment)};">{round(analysis.blp_scores.alignment * 100)}%</span></div>
            <div class="blp-item"><span>Autonomy</span><span style="color: {score_color(analysis.blp_scores.autonomy)};">{round(analysis.blp_scores.autonomy * 100)}%</span></div>
            <div class="blp-item"><span>Durability</span><span style="color: {score_color(analysis.blp_scores.durability)};">{round(analysis.blp_scores.durability * 100)}%</span></div>
            <div class="blp-item"><span>Self-Improvement</span><span style="color: {score_color(analysis.blp_scores.self_improvement)};">{round(analysis.blp_scores.self_improvement * 100)}%</span></div>
            <div class="blp-item"><span>Self-Replication</span><span style="color: {score_color(analysis.blp_scores.self_replication)};">{round(analysis.blp_scores.self_replication * 100)}%</span></div>
            <div class="blp-item"><span>Self-Organization</span><span style="color: {score_color(analysis.blp_scores.self_organization)};">{round(analysis.blp_scores.self_organization * 100)}%</span></div>
        </div>

        {images_html}

        <h2>📋 Integration Design Plan</h2>
        <p><strong>Type:</strong> {analysis.recommended_integration}</p>
        <p style="color: #b0b0b0;">{analysis.design_plan.overview}</p>

        <h3>Architecture</h3>
        <pre><code>{analysis.design_plan.architecture_diagram}</code></pre>

        <h3>Implementation Phases</h3>
        {phases_html}

        <h2>📍 Next Steps</h2>
        <ol style="padding-left: 20px;">{"".join(f'<li style="margin: 8px 0; color: #79c0ff;">{s}</li>' for s in analysis.business_case.next_steps)}</ol>

        <h2>📄 Claude Code Plan</h2>
        <div class="info-section">
            <p>Full implementation plan: <code>{analysis.claude_code_plan}</code></p>
        </div>

        <footer>
            <p>💡 {analysis.overall_recommendation}</p>
            <p>Enhanced Repo Analyzer v2 | Analyzed: {analysis.analyzed_at[:16].replace('T', ' ')} UTC</p>
        </footer>
    </article>
</body>
</html>'''

        try:
            filepath.write_text(html_content)
            web_url = f"{WEB_BASE_URL}/{filename}"
            tinyurl = self.create_tinyurl(web_url)
            return str(filepath), tinyurl
        except Exception as e:
            print(f"  Warning: Could not generate dashboard: {e}")
            return None, None

    def analyze_repo(self, full_name: str, create_issue: bool = False) -> EnhancedAnalysis:
        """Perform complete enhanced analysis"""
        print(f"  Fetching repo details...")
        details = self.fetch_repo_details(full_name)

        print(f"  Fetching README...")
        readme = self.fetch_readme(full_name)

        repo_data = {
            "full_name": full_name,
            "description": details.get("description", ""),
        }

        print(f"  Extracting images...")
        images, social_preview = self.extract_images(full_name, readme, details)

        # LLM-powered analysis: INTEGRATE / COMPETE / IGNORE
        print(f"  Running LLM analysis (integrate/compete/ignore)...")
        llm_result = self.run_llm_analysis(full_name, readme, details)
        if llm_result:
            print(f"  LLM verdict: {llm_result.verdict} (confidence: {llm_result.confidence}%)")
            if llm_result.plan_content:
                print(f"  Plan saved: {llm_result.plan_content}")
        else:
            print(f"  LLM analysis unavailable, falling back to heuristic scoring")

        print(f"  Calculating BLP scores...")
        blp_scores = self.calculate_blp_scores(repo_data, readme, details)
        blp_total = blp_scores.total_score()
        ca_score = blp_scores.calculate_ca()

        print(f"  Generating design plan...")
        design_plan = self.generate_design_plan(repo_data, readme, details, blp_scores)

        print(f"  Generating business case...")
        business_case = self.generate_business_case(repo_data, readme, details, blp_scores, design_plan)

        # Override verdict with LLM analysis if available
        if llm_result:
            # Map LLM verdicts to business case
            verdict_map = {"INTEGRATE": "INTEGRATE", "COMPETE": "COMPETE", "IGNORE": "IGNORE"}
            business_case.verdict = verdict_map.get(llm_result.verdict, business_case.verdict)
            business_case.confidence = llm_result.confidence
            # Enrich value_proposition with LLM insights
            if llm_result.tb_gaps:
                business_case.value_proposition = [f"TB Gap: {g}" for g in llm_result.tb_gaps[:3]] + business_case.value_proposition[:2]
            if llm_result.tb_overlap:
                business_case.concerns = [f"TB already has: {o}" for o in llm_result.tb_overlap[:3]] + business_case.concerns[:2]
            business_case.strategic_fit = f"{llm_result.verdict} — {llm_result.rationale}"

        # Extract features
        features = []
        feature_patterns = [
            r'(?:features?|capabilities?)[:\s]*\n((?:[-*•]\s*.+\n)+)',
            r'##\s*Features?\s*\n((?:[-*•]\s*.+\n)+)',
        ]
        for pattern in feature_patterns:
            match = re.search(pattern, readme, re.IGNORECASE)
            if match:
                for line in match.group(1).split('\n')[:5]:
                    line = re.sub(r'^[-*•]\s*', '', line.strip())
                    if line and len(line) > 5:
                        features.append(line[:100])
                break

        if not features:
            features = [details.get("description", "No description available")]

        tech_stack = [details.get("language", "Unknown")]
        topics = details.get("topics", [])
        tech_keywords = ['react', 'vue', 'angular', 'nextjs', 'fastapi', 'flask', 'django', 'express', 'docker', 'kubernetes']
        tech_stack.extend([t for t in topics if t in tech_keywords])

        if blp_total >= 60 and ca_score >= 30:
            priority = "high"
            recommendation = "🔥 High priority integration - strong BLP alignment and automation potential"
        elif blp_total >= 40 or ca_score >= 15:
            priority = "medium"
            recommendation = "📊 Worth exploring - good potential for specific use cases"
        else:
            priority = "low"
            recommendation = "📚 Keep as reference - limited direct integration value"

        # Prepare analysis data for plan generation
        analysis_data = {
            "repo_name": full_name,
            "recommended_integration": design_plan.title.split(':')[0],
            "priority_level": priority,
            "blp_total": blp_total,
            "ca_score": ca_score,
            "blp_scores": asdict(blp_scores),
            "design_plan": {
                "estimated_effort": design_plan.estimated_effort,
                "phases": design_plan.phases,
                "architecture_diagram": design_plan.architecture_diagram,
                "dependencies": design_plan.dependencies,
                "risks": design_plan.risks,
                "success_criteria": design_plan.success_criteria
            },
            "business_case": asdict(business_case)
        }

        # Only generate plans for INTEGRATE verdicts (real plans, not simulated)
        if llm_result and llm_result.verdict == "INTEGRATE" and llm_result.plan_content:
            plan_path = llm_result.plan_content  # LLM-generated plan_w_team in specs/
            print(f"  INTEGRATE plan saved: {plan_path}")
        elif business_case.verdict in ("INTEGRATE", "APPROVE"):
            print(f"  Generating Claude Code plan...")
            plan_path = self.generate_claude_code_plan(analysis_data)
        else:
            plan_path = ""  # No plan for COMPETE/IGNORE
            print(f"  No plan generated ({business_case.verdict} verdict)")

        # Create GitHub issue if requested and verdict is INTEGRATE or COMPETE
        github_issue_url = None
        if create_issue and business_case.verdict in ["INTEGRATE", "COMPETE", "APPROVE", "NEEDS_MORE_ANALYSIS"]:
            print(f"  Creating GitHub issue...")
            github_issue_url = self.create_github_issue(analysis_data)

        # Create initial analysis object (dashboard generated after)
        analysis = EnhancedAnalysis(
            repo_name=full_name,
            repo_url=f"https://github.com/{full_name}",
            description=details.get("description", "No description"),
            language=details.get("language", "Unknown"),
            stars=details.get("stargazers_count", 0),
            forks=details.get("forks_count", 0),
            topics=topics[:10],
            analyzed_at=datetime.now().isoformat(),
            images=images,
            social_preview_url=social_preview,
            architecture_summary=f"{design_plan.title.split(':')[0]} ({details.get('language', 'Unknown')})",
            key_features=features[:5],
            code_quality_notes=f"{details.get('stargazers_count', 0):,} stars, {details.get('forks_count', 0):,} forks, {len(topics)} topics",
            tech_stack=tech_stack[:5],
            blp_scores=blp_scores,
            blp_total=blp_total,
            ca_score=ca_score,
            design_plan=design_plan,
            business_case=business_case,
            recommended_integration=design_plan.title.split(':')[0],
            priority_level=priority,
            overall_recommendation=recommendation,
            claude_code_plan=plan_path,
            github_issue_url=github_issue_url
        )

        # Generate GenUI dashboard with TinyURL
        print(f"  Generating dashboard...")
        dashboard_path, dashboard_tinyurl = self.generate_dashboard(analysis)
        analysis.dashboard_path = dashboard_path
        analysis.dashboard_tinyurl = dashboard_tinyurl

        return analysis

    def format_email_html(self, analysis: EnhancedAnalysis) -> Tuple[str, str]:
        """Format email with LLM-powered INTEGRATE/COMPETE/IGNORE analysis.

        Green-on-black theme. Content adapts to verdict:
        - INTEGRATE: Shows gaps TB needs, integration plan, action buttons
        - COMPETE: Shows what to build ourselves, patterns to steal
        - IGNORE: Short rationale, dashboard link, done
        """
        verdict = analysis.business_case.verdict
        subject = f"[{verdict}] {analysis.repo_name} | {analysis.stars:,} stars | BLP {analysis.blp_total}%"

        verdict_colors = {
            "INTEGRATE": "#00ff41", "COMPETE": "#4a9eff", "IGNORE": "#808080",
            "APPROVE": "#00ff41", "NEEDS_MORE_ANALYSIS": "#ff9800", "DEFER": "#808080", "REJECT": "#f44336"
        }
        verdict_color = verdict_colors.get(verdict, "#808080")

        # Build topics HTML
        topics_html = "".join(
            f'<span style="display:inline-block;background:#0a0a0a;color:#00ff41;padding:3px 10px;border-radius:12px;font-size:14px;margin:2px;border:1px solid #1a3a1a;">{t}</span>'
            for t in analysis.topics[:8]
        )

        # Build value props / concerns from LLM-enriched business case
        value_html = "".join(f'<tr><td style="padding:8px 12px;border-bottom:1px solid #1a3a1a;color:#00ff41;font-size:16px;">{v}</td></tr>' for v in analysis.business_case.value_proposition[:5])
        concerns_html = "".join(f'<tr><td style="padding:8px 12px;border-bottom:1px solid #3a1a1a;color:#ff9800;font-size:16px;">{c}</td></tr>' for c in analysis.business_case.concerns[:5])

        # Verdict-specific action buttons
        integrate_subject = urllib.parse.quote(f"INTEGRATE: {analysis.repo_name}")
        integrate_body = urllib.parse.quote(f"I approve integrating {analysis.repo_name} into TB.\n\nMy notes:\n\n\nRepo: https://github.com/{analysis.repo_name}")
        compete_subject = urllib.parse.quote(f"COMPETE: {analysis.repo_name} - Build our own")
        compete_body = urllib.parse.quote(f"Build our own version inspired by {analysis.repo_name}.\n\nFeatures to steal:\n\n\nRepo: https://github.com/{analysis.repo_name}")
        ignore_subject = urllib.parse.quote(f"IGNORE: {analysis.repo_name}")
        ignore_body = urllib.parse.quote(f"Confirmed IGNORE for {analysis.repo_name}.\n\nRepo: https://github.com/{analysis.repo_name}")

        # Dashboard link
        dash_url = analysis.dashboard_tinyurl or '#'

        # Verdict-specific middle section
        if verdict in ("INTEGRATE", "APPROVE"):
            middle_section = f'''
        <div style="background:#0a0a0a;border-left:4px solid #00ff41;padding:20px;margin-bottom:20px;border-radius:0 8px 8px 0;">
            <h2 style="color:#00ff41;font-size:20px;margin:0 0 12px 0;">TB GAPS THIS FILLS</h2>
            <table style="width:100%;border-collapse:collapse;">{value_html}</table>
        </div>
        <div style="background:#0a0a0a;border-left:4px solid #ff9800;padding:20px;margin-bottom:20px;border-radius:0 8px 8px 0;">
            <h2 style="color:#ff9800;font-size:20px;margin:0 0 12px 0;">CONCERNS / TB ALREADY HAS</h2>
            <table style="width:100%;border-collapse:collapse;">{concerns_html}</table>
        </div>'''
        elif verdict == "COMPETE":
            middle_section = f'''
        <div style="background:#0a0a0a;border-left:4px solid #4a9eff;padding:20px;margin-bottom:20px;border-radius:0 8px 8px 0;">
            <h2 style="color:#4a9eff;font-size:20px;margin:0 0 12px 0;">WHAT THEY DO vs WHAT TB DOES</h2>
            <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#808080;font-size:14px;border-bottom:1px solid #1a1a1a;" colspan="2"><strong style="color:#4a9eff;">THEM:</strong></td></tr>
                {value_html}
                <tr><td style="padding:12px 0 8px 0;color:#808080;font-size:14px;border-bottom:1px solid #1a1a1a;" colspan="2"><strong style="color:#00ff41;">TB ALREADY HAS:</strong></td></tr>
                {concerns_html}
            </table>
        </div>
        <div style="background:#0a0a0a;border-left:4px solid #00ff41;padding:20px;margin-bottom:20px;border-radius:0 8px 8px 0;">
            <h2 style="color:#00ff41;font-size:20px;margin:0 0 12px 0;">PATTERNS TO STEAL</h2>
            <p style="color:#00ff41;font-size:16px;margin:0;">{analysis.business_case.strategic_fit}</p>
        </div>'''
        else:  # IGNORE
            middle_section = f'''
        <div style="background:#0a0a0a;border-left:4px solid #808080;padding:20px;margin-bottom:20px;border-radius:0 8px 8px 0;">
            <h2 style="color:#808080;font-size:20px;margin:0 0 12px 0;">WHY IGNORE</h2>
            <p style="color:#b0b0b0;font-size:16px;margin:0;">{analysis.business_case.strategic_fit}</p>
        </div>'''

        # Key features (all verdicts)
        features_items = "".join(f'<li style="color:#00ff41;font-size:16px;margin:6px 0;">{f}</li>' for f in analysis.key_features[:5])

        body = f'''<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:monospace,'Courier New',Courier;background:#0a0a0a;color:#00ff41;">
<div style="max-width:700px;margin:0 auto;padding:20px;">

    <!-- VERDICT HEADER -->
    <div style="background:#0a0a0a;border:2px solid {verdict_color};border-radius:8px;padding:24px;margin-bottom:20px;">
        <div style="text-align:center;margin-bottom:16px;">
            <span style="background:{verdict_color};color:#0a0a0a;padding:8px 28px;border-radius:4px;font-weight:bold;font-size:24px;letter-spacing:2px;">{verdict}</span>
            <span style="color:#808080;font-size:16px;margin-left:15px;">{analysis.business_case.confidence}% confidence</span>
        </div>
        <h1 style="margin:12px 0 8px 0;color:#00ff41;font-size:22px;text-align:center;">
            <a href="{analysis.repo_url}" style="color:#00ff41;text-decoration:none;">{analysis.repo_name}</a>
        </h1>
        <p style="margin:0;color:#b0b0b0;font-size:16px;text-align:center;">{analysis.description}</p>
        <div style="text-align:center;margin-top:12px;font-size:16px;">
            <span style="color:#ffd700;">* {analysis.stars:,}</span>
            <span style="color:#808080;margin:0 10px;">|</span>
            <span style="color:#4a9eff;">{analysis.language}</span>
            <span style="color:#808080;margin:0 10px;">|</span>
            <span style="color:#808080;">{analysis.design_plan.estimated_effort}</span>
        </div>
        <div style="text-align:center;margin-top:10px;">{topics_html}</div>
    </div>

    <!-- LLM ANALYSIS -->
    <div style="background:#0a0a0a;border-left:4px solid {verdict_color};padding:20px;margin-bottom:20px;border-radius:0 8px 8px 0;">
        <h2 style="color:{verdict_color};font-size:20px;margin:0 0 12px 0;">ANALYSIS</h2>
        <p style="color:#00ff41;font-size:18px;margin:0;line-height:1.5;">{analysis.business_case.strategic_fit}</p>
    </div>

    {middle_section}

    <!-- KEY FEATURES -->
    <div style="background:#0a0a0a;border-left:4px solid #00ff41;padding:20px;margin-bottom:20px;border-radius:0 8px 8px 0;">
        <h2 style="color:#00ff41;font-size:20px;margin:0 0 12px 0;">KEY FEATURES</h2>
        <ul style="margin:0;padding-left:20px;">{features_items}</ul>
    </div>

    <!-- SCORES -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
            <td style="background:#0a0a0a;border:1px solid #1a3a1a;padding:16px;text-align:center;width:33%;">
                <div style="font-size:28px;font-weight:bold;color:#00ff41;">{analysis.blp_total}%</div>
                <div style="font-size:14px;color:#808080;">BLP</div>
            </td>
            <td style="background:#0a0a0a;border:1px solid #1a3a1a;padding:16px;text-align:center;width:33%;">
                <div style="font-size:28px;font-weight:bold;color:#4a9eff;">{analysis.ca_score}</div>
                <div style="font-size:14px;color:#808080;">CA</div>
            </td>
            <td style="background:#0a0a0a;border:1px solid #1a3a1a;padding:16px;text-align:center;width:33%;">
                <div style="font-size:28px;font-weight:bold;color:{verdict_color};">{analysis.priority_level.upper()}</div>
                <div style="font-size:14px;color:#808080;">PRIORITY</div>
            </td>
        </tr>
    </table>

    <!-- ACTION BUTTONS -->
    <div style="background:#0a0a0a;border:2px solid #00ff41;border-radius:8px;padding:20px;margin-bottom:20px;text-align:center;">
        <h2 style="color:#00ff41;font-size:18px;margin:0 0 16px 0;">YOUR DECISION</h2>
        <div>
            <a href="mailto:babyproject418@gmail.com?subject={integrate_subject}&body={integrate_body}"
               style="display:inline-block;background:#00ff41;color:#0a0a0a;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:18px;margin:4px;">
                INTEGRATE
            </a>
            <a href="mailto:babyproject418@gmail.com?subject={compete_subject}&body={compete_body}"
               style="display:inline-block;background:#4a9eff;color:#0a0a0a;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:18px;margin:4px;">
                COMPETE
            </a>
            <a href="mailto:babyproject418@gmail.com?subject={ignore_subject}&body={ignore_body}"
               style="display:inline-block;background:#808080;color:#0a0a0a;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:18px;margin:4px;">
                IGNORE
            </a>
        </div>
        <p style="color:#808080;font-size:14px;margin:12px 0 0 0;">Reply with your notes. INTEGRATE queues to DITD.</p>
    </div>

    <!-- DASHBOARD LINK -->
    <div style="text-align:center;margin-bottom:20px;">
        <a href="{dash_url}" style="display:inline-block;background:#0a0a0a;color:#00ff41;padding:14px 40px;border:2px solid #00ff41;border-radius:8px;text-decoration:none;font-weight:bold;font-size:18px;">
            FULL DASHBOARD: {dash_url}
        </a>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;color:#808080;padding:16px;font-size:12px;border-top:1px solid #1a3a1a;">
        <p style="margin:4px 0;">LLM-Powered Repo Analysis v2 | {analysis.analyzed_at[:16].replace('T', ' ')} UTC</p>
    </div>
</div>
</body></html>'''

        return subject, body

    def send_email(self, subject: str, body: str, attachment_path: Optional[str] = None) -> bool:
        """Send email using Gmail Manager with optional file attachment"""
        try:
            cmd = [
                "python", str(GMAIL_MANAGER), "send",
                "--to", self.email_recipient,
                "--subject", subject,
                "--body", body
            ]
            # Add attachment if provided and file exists
            if attachment_path and Path(attachment_path).exists():
                cmd.extend(["--attachments", attachment_path])
                print(f"  📎 Attaching: {Path(attachment_path).name}")

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            return result.returncode == 0
        except Exception as e:
            print(f"  Error sending email: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description="Enhanced repo analyzer v2 with business case and approval workflow")
    parser.add_argument("--repo", type=str, required=True, help="Repository to analyze (owner/repo)")
    parser.add_argument("--create-issue", action="store_true", help="Create GitHub issue for tracking")
    parser.add_argument("--skip-llm", action="store_true", help="Skip LLM analysis, use heuristic scoring only")
    args = parser.parse_args()

    analyzer = EnhancedRepoAnalyzerV2()

    print(f"\n🔍 Enhanced Analysis v2: {args.repo}")
    print("=" * 60)

    analysis = analyzer.analyze_repo(args.repo, create_issue=args.create_issue)

    print(f"\n📊 Results:")
    print(f"   BLP Score: {analysis.blp_total}%")
    print(f"   CA Score: {analysis.ca_score}")
    print(f"   Priority: {analysis.priority_level}")
    print(f"   Integration: {analysis.recommended_integration}")
    print(f"   Images: {len(analysis.images)}")
    print(f"   Effort: {analysis.design_plan.estimated_effort}")
    print(f"\n💼 Business Case:")
    print(f"   Verdict: {analysis.business_case.verdict}")
    print(f"   Confidence: {analysis.business_case.confidence}%")
    print(f"   Time to Value: {analysis.business_case.time_to_value}")
    print(f"   ROI: {analysis.business_case.roi_estimate}")
    print(f"\n📄 Claude Code Plan: {analysis.claude_code_plan}")
    if analysis.dashboard_path:
        print(f"🌐 Dashboard: {analysis.dashboard_path}")
    if analysis.dashboard_tinyurl:
        print(f"🔗 TinyURL: {analysis.dashboard_tinyurl}")
    if analysis.github_issue_url:
        print(f"📌 GitHub Issue: {analysis.github_issue_url}")

    # Send email — only attach plan for INTEGRATE verdicts (real plans only)
    print(f"\n📧 Sending email...")
    subject, body = analyzer.format_email_html(analysis)

    # Only attach plan if INTEGRATE verdict AND plan file exists
    plan_attachment = None
    if analysis.business_case.verdict in ("INTEGRATE", "APPROVE") and analysis.claude_code_plan:
        plan_path = Path(analysis.claude_code_plan)
        if plan_path.exists():
            plan_attachment = str(plan_path)

    if analyzer.send_email(subject, body, attachment_path=plan_attachment):
        print(f"✅ Email sent to {analyzer.email_recipient}")
        if plan_attachment:
            print(f"   📎 Plan attached: {Path(plan_attachment).name}")
        if analysis.dashboard_tinyurl:
            print(f"   🔗 Dashboard: {analysis.dashboard_tinyurl}")
    else:
        print(f"❌ Failed to send email")

    print(f"\n💡 {analysis.overall_recommendation}")


if __name__ == "__main__":
    main()
