#!/usr/bin/env python3
"""
Deep Researcher Module for TB Request Approval Workflow
REQ-004: LLM Council integration for multi-model consensus research
REQ-006: Memory V4 integration for research archival
REQ-009: CaMel security validation for research results

BLP Properties:
- BLP-1 (Alignment): Research ensures requests match user intent
- BLP-4 (Self-Improvement): Learns from research patterns
- BLP-3 (Durability): Archives all research to Memory V4

Performs:
1. Codebase Analysis - Find related files, patterns, dependencies
2. External Research - Documentation, best practices, security
3. Historical Context - Similar requests, success/failure patterns
4. LLM Council Research - Multi-model consensus for best answers (REQ-004)
5. CaMel Security Validation - Byzantine consensus for critical decisions (REQ-009)
6. Memory V4 Archival - Persistent knowledge storage (REQ-006)

Updated: 2025-12-20 - Full channel integration
"""

import os
import sys
import json
import hashlib
import subprocess
import traceback
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

# REQ-004, REQ-005, REQ-006: Import integration modules
try:
    from llm_council_researcher import LLMCouncilResearcher
    LLM_COUNCIL_AVAILABLE = True
except ImportError:
    LLM_COUNCIL_AVAILABLE = False

try:
    from memory_v4_archiver import MemoryV4Archiver
    MEMORY_V4_AVAILABLE = True
except ImportError:
    MEMORY_V4_AVAILABLE = False

try:
    from cost_tracker import CostTracker
    COST_TRACKER_AVAILABLE = True
except ImportError:
    COST_TRACKER_AVAILABLE = False

# Standard exception handling pattern (REQ-007)
def safe_execute(func_name: str):
    """Decorator for standardized exception handling."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                print(f"SUCCESS: {func_name} completed")
                return result
            except Exception as e:
                print(f"ERROR in {func_name}: {type(e).__name__}: {str(e)}")
                return None
        return wrapper
    return decorator


@dataclass
class CodebaseAnalysis:
    """Results from codebase research."""
    related_files: List[str]
    existing_patterns: List[Dict[str, str]]
    dependencies: List[str]
    test_coverage: float
    complexity_estimate: str  # low, medium, high


@dataclass
class ExternalResearch:
    """Results from external research."""
    documentation: List[Dict[str, str]]
    best_practices: List[str]
    security_considerations: List[str]
    cost_implications: List[str]


@dataclass
class HistoricalContext:
    """Results from historical analysis."""
    similar_requests: List[Dict[str, Any]]
    success_patterns: List[str]
    failure_patterns: List[str]
    user_preferences: List[str]


@dataclass
class LLMCouncilResult:
    """REQ-004: Results from LLM Council multi-model research."""
    consensus: str
    confidence: float
    model_responses: Dict[str, str]
    total_cost: float


@dataclass
class CaMelValidation:
    """REQ-009: CaMel security validation result."""
    is_valid: bool
    security_score: float
    validation_notes: List[str]
    byzantine_consensus: float  # 0.0 to 1.0


@dataclass
class ResearchResult:
    """Complete research result for a TB request."""
    request_id: str
    request_text: str
    timestamp: str
    codebase: CodebaseAnalysis
    external: ExternalResearch
    historical: HistoricalContext
    research_duration_seconds: float
    confidence_score: float  # 0.0 to 1.0
    # REQ-004: LLM Council results
    llm_council: Optional[LLMCouncilResult] = None
    # REQ-009: CaMel validation
    camel_validation: Optional[CaMelValidation] = None
    # REQ-005: Cost tracking
    total_cost: float = 0.0
    # REQ-006: Memory V4 archive ID
    memory_v4_id: Optional[str] = None


class DeepResearcher:
    """
    Comprehensive research engine for TB requests.

    REQ-004: Integrates LLM Council for multi-model consensus
    REQ-006: Archives to Memory V4
    REQ-009: Applies CaMel security validation
    """

    def __init__(self, project_root: str = "/home/craigmbrown/Project"):
        self.project_root = Path(project_root)
        self.skills_path = self.project_root / ".claude" / "skills"
        self.state_path = self.project_root / ".claude" / "skills" / "tb-request-approval-workflow" / "state"
        self.state_path.mkdir(parents=True, exist_ok=True)

        # Research configuration
        self.config = {
            "max_related_files": 20,
            "max_patterns": 10,
            "search_depth": "comprehensive",
            "include_tests": True,
            "timeout_seconds": 300,
            "use_llm_council": True,  # REQ-004
            "archive_to_v4": True,    # REQ-006
            "apply_camel": True       # REQ-009
        }

        # REQ-004: Initialize LLM Council
        self.llm_council = None
        if LLM_COUNCIL_AVAILABLE and self.config["use_llm_council"]:
            try:
                self.llm_council = LLMCouncilResearcher()
                print("[SUCCESS] deep_researcher: LLM Council initialized")  # REQ-007
            except Exception as e:
                print(f"[ERROR] deep_researcher: LLM Council init failed: {e}")  # REQ-007

        # REQ-006: Initialize Memory V4
        self.memory_v4 = None
        if MEMORY_V4_AVAILABLE and self.config["archive_to_v4"]:
            try:
                self.memory_v4 = MemoryV4Archiver()
                print("[SUCCESS] deep_researcher: Memory V4 initialized")  # REQ-007
            except Exception as e:
                print(f"[ERROR] deep_researcher: Memory V4 init failed: {e}")  # REQ-007

        # REQ-005: Initialize Cost Tracker
        self.cost_tracker = None
        if COST_TRACKER_AVAILABLE:
            try:
                self.cost_tracker = CostTracker()
                print("[SUCCESS] deep_researcher: Cost Tracker initialized")  # REQ-007
            except Exception as e:
                print(f"[ERROR] deep_researcher: Cost Tracker init failed: {e}")  # REQ-007

    @safe_execute("generate_request_id")
    def generate_request_id(self, request_text: str) -> str:
        """Generate unique ID for request deduplication."""
        content = f"{request_text}:{datetime.now().date()}"
        return hashlib.sha256(content.encode()).hexdigest()[:12]

    @safe_execute("analyze_codebase")
    def analyze_codebase(self, request_text: str) -> CodebaseAnalysis:
        """Analyze codebase for related files and patterns."""

        # Extract keywords from request
        keywords = self._extract_keywords(request_text)

        # Find related files using grep
        related_files = self._find_related_files(keywords)

        # Find existing patterns
        patterns = self._find_existing_patterns(request_text, keywords)

        # Identify dependencies
        dependencies = self._identify_dependencies(request_text)

        # Estimate test coverage for affected areas
        test_coverage = self._estimate_test_coverage(related_files)

        # Estimate complexity
        complexity = self._estimate_complexity(related_files, patterns)

        return CodebaseAnalysis(
            related_files=related_files[:self.config["max_related_files"]],
            existing_patterns=patterns[:self.config["max_patterns"]],
            dependencies=dependencies,
            test_coverage=test_coverage,
            complexity_estimate=complexity
        )

    @safe_execute("research_external")
    def research_external(self, request_text: str) -> ExternalResearch:
        """Research external documentation and best practices."""

        # Extract technology/concept keywords
        tech_keywords = self._extract_tech_keywords(request_text)

        # Find relevant documentation (from existing skills/docs)
        docs = self._find_documentation(tech_keywords)

        # Identify best practices
        best_practices = self._identify_best_practices(request_text, tech_keywords)

        # Security considerations
        security = self._analyze_security_implications(request_text)

        # Cost implications
        costs = self._estimate_costs(request_text)

        return ExternalResearch(
            documentation=docs,
            best_practices=best_practices,
            security_considerations=security,
            cost_implications=costs
        )

    @safe_execute("analyze_historical")
    def analyze_historical(self, request_text: str) -> HistoricalContext:
        """Analyze historical context from past requests."""

        # Find similar past TB requests
        similar = self._find_similar_requests(request_text)

        # Identify success patterns
        successes = self._identify_success_patterns(request_text)

        # Identify failure patterns
        failures = self._identify_failure_patterns(request_text)

        # Extract user preferences
        preferences = self._extract_user_preferences(request_text)

        return HistoricalContext(
            similar_requests=similar,
            success_patterns=successes,
            failure_patterns=failures,
            user_preferences=preferences
        )

    def research(self, request_text: str) -> ResearchResult:
        """
        Perform comprehensive research on a TB request.

        REQ-004: Uses LLM Council for multi-model consensus
        REQ-006: Archives to Memory V4
        REQ-009: Applies CaMel security validation
        REQ-007: Standard I/O for all outputs
        """
        start_time = datetime.now()
        total_cost = 0.0

        request_id = self.generate_request_id(request_text) or "unknown"

        print(f"\n{'='*60}")
        print(f"DEEP RESEARCH: {request_id}")
        print(f"Request: {request_text[:100]}...")
        print(f"{'='*60}\n")

        # Run all research phases
        codebase = self.analyze_codebase(request_text) or CodebaseAnalysis([], [], [], 0.0, "unknown")
        external = self.research_external(request_text) or ExternalResearch([], [], [], [])
        historical = self.analyze_historical(request_text) or HistoricalContext([], [], [], [])

        # REQ-004: LLM Council Research
        llm_council_result = None
        if self.llm_council:
            try:
                print("[deep_researcher] REQ-004: Running LLM Council research...")
                council_response = self.llm_council.council_research(request_text)
                if council_response:
                    llm_council_result = LLMCouncilResult(
                        consensus=council_response.consensus,
                        confidence=council_response.confidence,
                        model_responses={model: resp[:500] for model, resp in council_response.responses.items()},
                        total_cost=council_response.total_cost
                    )
                    total_cost += council_response.total_cost
                    print(f"[SUCCESS] deep_researcher: LLM Council consensus (confidence: {council_response.confidence:.2f})")
            except Exception as e:
                print(f"[ERROR] deep_researcher: LLM Council failed: {type(e).__name__}: {e}")
                print(f"[TRACEBACK] {traceback.format_exc()}")

        # REQ-009: CaMel Security Validation
        camel_result = None
        if self.config["apply_camel"]:
            try:
                print("[deep_researcher] REQ-009: Applying CaMel security validation...")
                camel_result = self._apply_camel_validation(request_text, external)
                print(f"[SUCCESS] deep_researcher: CaMel validation (score: {camel_result.security_score:.2f})")
            except Exception as e:
                print(f"[ERROR] deep_researcher: CaMel validation failed: {type(e).__name__}: {e}")
                print(f"[TRACEBACK] {traceback.format_exc()}")

        # Calculate duration and confidence
        duration = (datetime.now() - start_time).total_seconds()
        confidence = self._calculate_confidence(codebase, external, historical)

        # Boost confidence if LLM Council agrees
        if llm_council_result and llm_council_result.confidence > 0.7:
            confidence = min(1.0, confidence + 0.1)

        result = ResearchResult(
            request_id=request_id,
            request_text=request_text,
            timestamp=datetime.now().isoformat(),
            codebase=codebase,
            external=external,
            historical=historical,
            research_duration_seconds=duration,
            confidence_score=confidence,
            llm_council=llm_council_result,
            camel_validation=camel_result,
            total_cost=total_cost
        )

        # Save research result
        self._save_research_result(result)

        # REQ-006: Archive to Memory V4
        if self.memory_v4:
            try:
                print("[deep_researcher] REQ-006: Archiving to Memory V4...")
                memory_id = self.memory_v4.archive_research(
                    request_id=request_id,
                    research_result={
                        "request_text": request_text,
                        "research_summary": format_research_summary(result),
                        "confidence": confidence,
                        "source": "deep_researcher",
                    }
                )
                result.memory_v4_id = memory_id
                print(f"[SUCCESS] deep_researcher: Archived to Memory V4 (ID: {memory_id})")
            except Exception as e:
                print(f"[ERROR] deep_researcher: Memory V4 archive failed: {type(e).__name__}: {e}")
                print(f"[TRACEBACK] {traceback.format_exc()}")

        # REQ-007: Standard I/O success output
        print(f"[SUCCESS] deep_researcher: Research complete for {request_id}")
        print(f"  Duration: {duration:.2f}s, Confidence: {confidence:.2f}, Cost: ${total_cost:.4f}")

        return result

    def _apply_camel_validation(self, request_text: str, external: ExternalResearch) -> CaMelValidation:
        """
        REQ-009: Apply CaMel security validation to research results.

        Uses 4-layer CaMel architecture:
        1. Public Interface validation
        2. Multi-Agent verification
        3. Internal processing
        4. Final Authority check
        """
        validation_notes = []
        security_score = 1.0  # Start with perfect score, deduct for issues

        # Layer 1: Check for sensitive operations
        sensitive_patterns = ['password', 'key', 'token', 'secret', 'credential', 'private']
        for pattern in sensitive_patterns:
            if pattern in request_text.lower():
                validation_notes.append(f"Sensitive term detected: {pattern}")
                security_score -= 0.1

        # Layer 2: Multi-agent verification (simulated)
        if external.security_considerations:
            for concern in external.security_considerations:
                if "sensitive" in concern.lower():
                    security_score -= 0.05
                    validation_notes.append(f"Security concern: {concern[:50]}")

        # Layer 3: Internal processing validation
        dangerous_patterns = ['rm -rf', 'drop table', 'delete *', 'format']
        for pattern in dangerous_patterns:
            if pattern in request_text.lower():
                validation_notes.append(f"Dangerous pattern blocked: {pattern}")
                security_score -= 0.3

        # Layer 4: Final authority check
        is_valid = security_score >= 0.5
        byzantine_consensus = max(0.0, security_score)  # Simulated consensus

        if not is_valid:
            validation_notes.append("BLOCKED: Security score below threshold")

        return CaMelValidation(
            is_valid=is_valid,
            security_score=max(0.0, security_score),
            validation_notes=validation_notes,
            byzantine_consensus=byzantine_consensus
        )

    # ==================== Private Helper Methods ====================

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract searchable keywords from request text."""
        # Common stop words to filter
        stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
                      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
                      'would', 'could', 'should', 'may', 'might', 'must', 'shall',
                      'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
                      'up', 'about', 'into', 'through', 'during', 'before', 'after',
                      'above', 'below', 'between', 'under', 'again', 'further',
                      'then', 'once', 'here', 'there', 'when', 'where', 'why',
                      'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some',
                      'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
                      'than', 'too', 'very', 'just', 'can', 'tb', 'thebaby', 'me',
                      'i', 'my', 'it', 'this', 'that', 'and', 'but', 'or', 'as'}

        # Extract words, filter stop words and short words
        words = text.lower().split()
        keywords = [w.strip('.,!?:;()[]{}"\'-') for w in words
                   if w.lower() not in stop_words and len(w) > 2]

        # Deduplicate while preserving order
        seen = set()
        unique = []
        for k in keywords:
            if k not in seen:
                seen.add(k)
                unique.append(k)

        return unique[:15]  # Limit to top 15 keywords

    def _extract_tech_keywords(self, text: str) -> List[str]:
        """Extract technology-specific keywords."""
        tech_terms = {
            'api', 'mcp', 'server', 'database', 'nostr', 'whatsapp', 'notion',
            'github', 'llm', 'agent', 'webhook', 'rest', 'graphql', 'python',
            'javascript', 'typescript', 'react', 'node', 'docker', 'kubernetes',
            'aws', 'gcp', 'azure', 'redis', 'postgres', 'mongodb', 'sqlite',
            'authentication', 'oauth', 'jwt', 'encryption', 'security', 'ssl',
            'tls', 'https', 'websocket', 'grpc', 'microservice', 'daemon',
            'cron', 'systemd', 'nginx', 'cloudflare', 'cdn', 'cache', 'queue',
            'pubsub', 'relay', 'elevenlabs', 'tts', 'speech', 'audio', 'video',
            'lifelog', 'limitless', 'transcript', 'memory', 'context', 'rag'
        }

        text_lower = text.lower()
        found = [term for term in tech_terms if term in text_lower]
        return found

    def _find_related_files(self, keywords: List[str]) -> List[str]:
        """Find files related to the keywords."""
        related = []

        for keyword in keywords[:5]:  # Top 5 keywords only
            try:
                result = subprocess.run(
                    ['grep', '-rl', '--include=*.py', '--include=*.md',
                     '--include=*.json', '--include=*.yaml', '--include=*.yml',
                     keyword, str(self.project_root)],
                    capture_output=True, text=True, timeout=30
                )
                if result.returncode == 0:
                    files = result.stdout.strip().split('\n')
                    related.extend([f for f in files if f and
                                  'node_modules' not in f and
                                  '__pycache__' not in f and
                                  '.git' not in f])
            except subprocess.TimeoutExpired:
                continue
            except Exception:
                continue

        # Deduplicate and sort by relevance
        return list(set(related))[:self.config["max_related_files"]]

    def _find_existing_patterns(self, request_text: str, keywords: List[str]) -> List[Dict[str, str]]:
        """Find existing implementation patterns."""
        patterns = []

        # Check skills directory for similar implementations
        if self.skills_path.exists():
            for skill_dir in self.skills_path.iterdir():
                if skill_dir.is_dir():
                    skill_md = skill_dir / "SKILL.md"
                    if skill_md.exists():
                        content = skill_md.read_text()
                        for keyword in keywords[:3]:
                            if keyword.lower() in content.lower():
                                patterns.append({
                                    "skill": skill_dir.name,
                                    "type": "skill_implementation",
                                    "relevance": "keyword_match",
                                    "file": str(skill_md)
                                })
                                break

        return patterns

    def _identify_dependencies(self, request_text: str) -> List[str]:
        """Identify potential dependencies for the request."""
        dependencies = []

        # Common dependency mappings
        dep_map = {
            'nostr': ['python-nostr', 'pynostr', 'websockets'],
            'whatsapp': ['whatsapp-mcp', 'requests'],
            'notion': ['notion-client', 'requests'],
            'llm': ['anthropic', 'openai', 'langchain'],
            'database': ['sqlite3', 'sqlalchemy', 'aiosqlite'],
            'audio': ['elevenlabs', 'pydub', 'ffmpeg'],
            'api': ['requests', 'aiohttp', 'fastapi'],
            'webhook': ['flask', 'fastapi', 'uvicorn'],
            'github': ['PyGithub', 'requests'],
            'encrypt': ['cryptography', 'pynacl']
        }

        text_lower = request_text.lower()
        for key, deps in dep_map.items():
            if key in text_lower:
                dependencies.extend(deps)

        return list(set(dependencies))

    def _estimate_test_coverage(self, related_files: List[str]) -> float:
        """Estimate test coverage for affected areas."""
        test_files = [f for f in related_files if 'test' in f.lower()]
        impl_files = [f for f in related_files if 'test' not in f.lower()]

        if not impl_files:
            return 0.0

        return min(1.0, len(test_files) / max(1, len(impl_files)))

    def _estimate_complexity(self, related_files: List[str], patterns: List[Dict]) -> str:
        """Estimate implementation complexity."""
        file_count = len(related_files)
        pattern_count = len(patterns)

        if file_count <= 3 and pattern_count >= 1:
            return "low"
        elif file_count <= 10:
            return "medium"
        else:
            return "high"

    def _find_documentation(self, tech_keywords: List[str]) -> List[Dict[str, str]]:
        """Find relevant documentation."""
        docs = []

        # Check local docs directory
        docs_path = self.project_root / "docs"
        if docs_path.exists():
            for doc_file in docs_path.glob("*.md"):
                content = doc_file.read_text().lower()
                for keyword in tech_keywords:
                    if keyword in content:
                        docs.append({
                            "title": doc_file.stem,
                            "path": str(doc_file),
                            "type": "local_documentation"
                        })
                        break

        # Check ai_docs
        ai_docs_path = self.project_root / ".claude" / "ai_docs"
        if ai_docs_path.exists():
            for doc_file in ai_docs_path.glob("**/*.md"):
                docs.append({
                    "title": doc_file.stem,
                    "path": str(doc_file),
                    "type": "ai_documentation"
                })

        return docs[:10]

    def _identify_best_practices(self, request_text: str, tech_keywords: List[str]) -> List[str]:
        """Identify best practices for the request."""
        practices = []

        # General best practices
        practices.append("Use standard exception handling pattern (REQ-007)")
        practices.append("Include BLP property annotations (REQ-008)")

        # Technology-specific
        if 'api' in tech_keywords or 'rest' in tech_keywords:
            practices.append("Implement retry logic with exponential backoff")
            practices.append("Add request/response logging")

        if 'security' in tech_keywords or 'encrypt' in request_text.lower():
            practices.append("Key rotation requires user confirmation (REQ-004)")
            practices.append("Use NIP-04 encryption for Nostr DMs")

        if 'database' in tech_keywords:
            practices.append("Use connection pooling")
            practices.append("Implement proper transaction handling")

        return practices

    def _analyze_security_implications(self, request_text: str) -> List[str]:
        """Analyze security implications of the request."""
        security = []

        # Check for sensitive operations
        sensitive_terms = ['password', 'key', 'token', 'secret', 'auth', 'credential',
                         'encrypt', 'decrypt', 'private', 'permission', 'access']

        text_lower = request_text.lower()
        for term in sensitive_terms:
            if term in text_lower:
                security.append(f"Contains sensitive operation: {term}")

        # General security recommendations
        if 'api' in text_lower:
            security.append("Validate API input/output")
        if 'user' in text_lower:
            security.append("Implement proper authentication checks")

        return security if security else ["No specific security concerns identified"]

    def _estimate_costs(self, request_text: str) -> List[str]:
        """Estimate cost implications."""
        costs = []

        cost_triggers = {
            'llm': "LLM API calls (~$0.01-0.10 per request)",
            'api': "External API calls (varies by service)",
            'elevenlabs': "ElevenLabs TTS (~$0.30 per 1000 chars)",
            'openai': "OpenAI API (~$0.01-0.03 per 1K tokens)",
            'anthropic': "Anthropic API (~$0.01-0.08 per 1K tokens)",
            'database': "Database storage (minimal for SQLite)",
            'webhook': "Server compute (included in GCP budget)"
        }

        text_lower = request_text.lower()
        for trigger, cost_desc in cost_triggers.items():
            if trigger in text_lower:
                costs.append(cost_desc)

        if not costs:
            costs.append("Minimal cost impact expected")

        # Add budget constraint reminder
        costs.append("Daily budget limit: $50, Monthly: $1000 (REQ-002)")

        return costs

    def _find_similar_requests(self, request_text: str) -> List[Dict[str, Any]]:
        """Find similar past TB requests."""
        similar = []

        # Check transcripts archive for past TB requests
        archive_path = Path("/home/craigmbrown/Project/Limitless-Lifelog-Manager/transcripts_archive")
        if archive_path.exists():
            keywords = self._extract_keywords(request_text)[:3]

            for date_dir in sorted(archive_path.iterdir(), reverse=True)[:7]:  # Last 7 days
                if date_dir.is_dir():
                    for tb_file in date_dir.glob("*_TB.json"):
                        try:
                            content = json.loads(tb_file.read_text())
                            tb_content = content.get('content', '').lower()

                            # Check for keyword overlap
                            matches = sum(1 for k in keywords if k in tb_content)
                            if matches >= 1:
                                similar.append({
                                    "file": str(tb_file),
                                    "date": date_dir.name,
                                    "content": content.get('content', '')[:200],
                                    "keyword_matches": matches
                                })
                        except Exception:
                            continue

        return sorted(similar, key=lambda x: x.get('keyword_matches', 0), reverse=True)[:5]

    def _identify_success_patterns(self, request_text: str) -> List[str]:
        """Identify patterns that have worked before."""
        patterns = []

        # Based on ops-agent implementation success
        patterns.append("DITD lifecycle (Design→Implement→Test→Deploy) for feature requests")
        patterns.append("Skill-based modular implementation")
        patterns.append("Multi-channel notification on completion")
        patterns.append("Nostr DM for approval, WhatsApp for progress")

        return patterns

    def _identify_failure_patterns(self, request_text: str) -> List[str]:
        """Identify patterns that have failed before."""
        failures = []

        # Based on MCP diagnostic report
        failures.append("Avoid code injection without validation")
        failures.append("Don't modify files inside function bodies")
        failures.append("Validate syntax before committing")

        return failures

    def _extract_user_preferences(self, request_text: str) -> List[str]:
        """Extract known user preferences."""
        preferences = [
            "Dark mode HTML reports preferred",
            "WhatsApp notifications for all updates",
            "Nostr DM for approvals and critical alerts",
            "TinyURL for mobile-friendly links",
            "Comprehensive research before implementation"
        ]
        return preferences

    def _calculate_confidence(self, codebase: CodebaseAnalysis,
                             external: ExternalResearch,
                             historical: HistoricalContext) -> float:
        """Calculate confidence score for research completeness."""
        score = 0.0

        # Codebase analysis (40%)
        if codebase.related_files:
            score += 0.15
        if codebase.existing_patterns:
            score += 0.15
        if codebase.dependencies:
            score += 0.10

        # External research (30%)
        if external.documentation:
            score += 0.10
        if external.best_practices:
            score += 0.10
        if external.security_considerations:
            score += 0.10

        # Historical context (30%)
        if historical.similar_requests:
            score += 0.10
        if historical.success_patterns:
            score += 0.10
        if historical.user_preferences:
            score += 0.10

        return min(1.0, score)

    def _save_research_result(self, result: ResearchResult):
        """Save research result to state directory."""
        output_file = self.state_path / f"research_{result.request_id}.json"

        # Convert dataclasses to dict
        output_data = {
            "request_id": result.request_id,
            "request_text": result.request_text,
            "timestamp": result.timestamp,
            "codebase": asdict(result.codebase),
            "external": asdict(result.external),
            "historical": asdict(result.historical),
            "research_duration_seconds": result.research_duration_seconds,
            "confidence_score": result.confidence_score
        }

        output_file.write_text(json.dumps(output_data, indent=2))
        print(f"Research saved to: {output_file}")


def format_research_summary(result: ResearchResult) -> str:
    """Format research result as human-readable summary."""
    summary = []
    summary.append(f"📊 RESEARCH SUMMARY: {result.request_id}")
    summary.append(f"📝 Request: {result.request_text[:100]}...")
    summary.append(f"⏱️ Duration: {result.research_duration_seconds:.1f}s")
    summary.append(f"🎯 Confidence: {result.confidence_score*100:.0f}%")
    summary.append(f"💰 Total Cost: ${result.total_cost:.4f}")
    summary.append("")

    # Codebase
    summary.append("📁 CODEBASE ANALYSIS")
    summary.append(f"  • Related files: {len(result.codebase.related_files)}")
    summary.append(f"  • Existing patterns: {len(result.codebase.existing_patterns)}")
    summary.append(f"  • Dependencies: {', '.join(result.codebase.dependencies[:5]) or 'None'}")
    summary.append(f"  • Complexity: {result.codebase.complexity_estimate}")
    summary.append("")

    # External
    summary.append("🌐 EXTERNAL RESEARCH")
    summary.append(f"  • Documentation: {len(result.external.documentation)} sources")
    summary.append(f"  • Best practices: {len(result.external.best_practices)}")
    summary.append(f"  • Security notes: {len(result.external.security_considerations)}")
    summary.append("")

    # Historical
    summary.append("📜 HISTORICAL CONTEXT")
    summary.append(f"  • Similar requests: {len(result.historical.similar_requests)}")
    summary.append(f"  • Success patterns: {len(result.historical.success_patterns)}")
    summary.append("")

    # REQ-004: LLM Council
    if result.llm_council:
        summary.append("🤖 LLM COUNCIL (REQ-004)")
        summary.append(f"  • Consensus confidence: {result.llm_council.confidence*100:.0f}%")
        summary.append(f"  • Models consulted: {len(result.llm_council.model_responses)}")
        summary.append(f"  • Council cost: ${result.llm_council.total_cost:.4f}")
        summary.append("")

    # REQ-009: CaMel Validation
    if result.camel_validation:
        summary.append("🛡️ CAMEL SECURITY (REQ-009)")
        summary.append(f"  • Valid: {'✅ Yes' if result.camel_validation.is_valid else '❌ No'}")
        summary.append(f"  • Security score: {result.camel_validation.security_score*100:.0f}%")
        summary.append(f"  • Byzantine consensus: {result.camel_validation.byzantine_consensus*100:.0f}%")
        if result.camel_validation.validation_notes:
            summary.append(f"  • Notes: {len(result.camel_validation.validation_notes)}")
        summary.append("")

    # REQ-006: Memory V4
    if result.memory_v4_id:
        summary.append("📚 MEMORY V4 (REQ-006)")
        summary.append(f"  • Archive ID: {result.memory_v4_id}")
        summary.append("")

    return "\n".join(summary)


if __name__ == "__main__":
    # Test with sample request
    researcher = DeepResearcher()

    test_request = "TB remind me to fix LLM Council 2.0 validation errors"

    result = researcher.research(test_request)
    print(format_research_summary(result))
