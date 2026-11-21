#!/usr/bin/env python3
"""
Integration Plan Generator for TB Request Workflow
REQ-103: Generate detailed implementation plans

BLP Properties:
- Alignment: Plans ensure correct implementation approach
- Self-Organization: Adaptive planning based on complexity

Generates:
- Implementation steps with time estimates
- Files to modify/create
- Risk mitigation strategies
- Success criteria
- Rollback plans
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict, field

# Import research module
sys.path.insert(0, str(Path(__file__).parent))
from deep_researcher import ResearchResult


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
class ImplementationStep:
    """Single implementation step."""
    step_number: int
    title: str
    description: str
    estimated_minutes: int
    files_affected: List[str]
    dependencies: List[int]  # Step numbers this depends on
    validation: str  # How to validate completion


@dataclass
class RiskMitigation:
    """Risk and its mitigation strategy."""
    risk: str
    severity: str  # low, medium, high, critical
    mitigation: str
    fallback: Optional[str] = None


@dataclass
class IntegrationPlan:
    """Complete integration plan for a TB request."""
    request_id: str
    request_text: str
    plan_title: str
    created_at: str

    # Request classification
    request_type: str = "feature"  # feature, bug_fix, reminder, skill, question

    # REQ-111: Plan source for transparency in GitHub issues
    # Values: "claude_code" (from Claude Code CLI planning session) or "template" (fallback)
    plan_source: str = "template"

    # Scope
    files_to_modify: List[str] = field(default_factory=list)
    files_to_create: List[str] = field(default_factory=list)
    new_components: List[str] = field(default_factory=list)
    apis_required: List[str] = field(default_factory=list)

    # Implementation
    steps: List[ImplementationStep] = field(default_factory=list)
    total_estimated_minutes: int = 0

    # Risk Management
    risks: List[RiskMitigation] = field(default_factory=list)

    # Success Criteria
    success_criteria: List[str] = field(default_factory=list)

    # Rollback
    rollback_plan: str = ""

    # DITD Phase Mapping
    ditd_phases: Dict[str, List[int]] = field(default_factory=dict)  # phase -> step numbers


class IntegrationPlanner:
    """Generate integration plans from research results."""

    def __init__(self):
        self.state_path = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow/state")
        self.state_path.mkdir(parents=True, exist_ok=True)

        # Templates for common patterns
        self.step_templates = self._load_step_templates()

    def _load_step_templates(self) -> Dict[str, List[Dict]]:
        """Load common step templates."""
        return {
            "feature": [
                {"title": "Design component architecture", "phase": "design", "minutes": 15},
                {"title": "Create directory structure", "phase": "implement", "minutes": 5},
                {"title": "Implement core logic", "phase": "implement", "minutes": 30},
                {"title": "Add error handling", "phase": "implement", "minutes": 10},
                {"title": "Write unit tests", "phase": "test", "minutes": 20},
                {"title": "Integration testing", "phase": "test", "minutes": 15},
                {"title": "Update documentation", "phase": "deploy", "minutes": 10},
                {"title": "Deploy and verify", "phase": "deploy", "minutes": 10}
            ],
            "bug_fix": [
                {"title": "Reproduce and diagnose issue", "phase": "design", "minutes": 10},
                {"title": "Identify root cause", "phase": "design", "minutes": 15},
                {"title": "Implement fix", "phase": "implement", "minutes": 20},
                {"title": "Add regression test", "phase": "test", "minutes": 15},
                {"title": "Verify fix in dev", "phase": "test", "minutes": 10},
                {"title": "Deploy fix", "phase": "deploy", "minutes": 5}
            ],
            "reminder": [
                {"title": "Create Google Calendar event with reminder details", "phase": "implement", "minutes": 2},
                {"title": "Send confirmation notification", "phase": "deploy", "minutes": 1}
            ],
            "question": [
                {"title": "Research codebase for relevant information", "phase": "design", "minutes": 5},
                {"title": "Analyze findings and formulate answer", "phase": "design", "minutes": 3},
                {"title": "Send answer via WhatsApp", "phase": "deploy", "minutes": 1}
            ],
            "skill": [
                {"title": "Design skill structure", "phase": "design", "minutes": 20},
                {"title": "Create SKILL.md specification", "phase": "design", "minutes": 15},
                {"title": "Create directory structure", "phase": "implement", "minutes": 5},
                {"title": "Implement core scripts", "phase": "implement", "minutes": 45},
                {"title": "Create prompts/templates", "phase": "implement", "minutes": 15},
                {"title": "Write skill tests", "phase": "test", "minutes": 20},
                {"title": "Integration testing", "phase": "test", "minutes": 15},
                {"title": "Update skills registry", "phase": "deploy", "minutes": 5},
                {"title": "Add to ops-agent dashboard", "phase": "deploy", "minutes": 10}
            ]
        }

    @safe_execute("generate_plan")
    def generate_plan(self, research: ResearchResult) -> IntegrationPlan:
        """Generate integration plan from research results."""

        # Classify request type
        request_type = self._classify_request(research.request_text)

        # Generate plan title
        title = self._generate_title(research.request_text, request_type)

        # Determine files to modify/create
        files_modify, files_create = self._plan_file_changes(research, request_type)

        # Identify new components
        components = self._identify_components(research, request_type)

        # Identify required APIs
        apis = self._identify_apis(research)

        # Generate implementation steps
        steps = self._generate_steps(research, request_type, files_modify, files_create)

        # Calculate total time
        total_minutes = sum(s.estimated_minutes for s in steps)

        # Generate risks
        risks = self._generate_risks(research, request_type)

        # Generate success criteria
        criteria = self._generate_success_criteria(research, request_type)

        # Generate rollback plan
        rollback = self._generate_rollback_plan(request_type, files_modify, files_create)

        # Map to DITD phases
        ditd = self._map_to_ditd(steps)

        plan = IntegrationPlan(
            request_id=research.request_id,
            request_text=research.request_text,
            plan_title=title,
            created_at=datetime.now().isoformat(),
            request_type=request_type,  # Include classified type
            files_to_modify=files_modify,
            files_to_create=files_create,
            new_components=components,
            apis_required=apis,
            steps=steps,
            total_estimated_minutes=total_minutes,
            risks=risks,
            success_criteria=criteria,
            rollback_plan=rollback,
            ditd_phases=ditd
        )

        # Save plan
        self._save_plan(plan)

        return plan

    def _classify_request(self, request_text: str) -> str:
        """Classify request into type.

        REQ-100a: Added 'question' type for queries that need answers, not implementation.
        Questions should be answered directly, not turned into implementation plans.
        """
        import re
        text_lower = request_text.lower()

        # Strip TB prefix for cleaner analysis
        clean_text = re.sub(r'(?i)^(tb|thebaby)[,:]?\s*', '', text_lower).strip()

        # QUESTION patterns - queries that need ANSWERS, not implementation
        # REQ-100a: Questions should be answered, not planned
        question_patterns = [
            r'^(are we|am i|is there|is it|is this|do we|does|did|can we|could|would|should|what|why|how|where|when|which|who)\b',  # Question starters
            r'\?$',  # Ends with question mark
            r'^what (is|are|does|do|about|if)\b',
            r'^how (is|are|does|do|can|should|would|to)\b',
            r'^why (is|are|does|do|did|would|should)\b',
            r'^(explain|tell me|describe|show me|clarify)\b',
            r'\bwhat are we doing with\b',
            r'\bare we (getting|using|doing|processing)\b',
            r'\bdo we (have|get|use|need)\b',
            r'\bhow does .* work\b',
            r'\bif so\b',  # "...and if so what are we doing..."
        ]
        for pattern in question_patterns:
            if re.search(pattern, clean_text):
                return "question"

        # Explicit reminder keywords
        if any(w in text_lower for w in ['remind', 'reminder', 'don\'t forget', 'remember to']):
            return "reminder"

        # Natural language reminder patterns (personal activities, travel, appointments)
        reminder_patterns = [
            r'\bi need to (go|travel|visit|call|email|meet|pick up|drop off|buy|get|schedule)',
            r'\bi have to (go|travel|visit|call|email|meet|pick up|drop off|buy|get)',
            r'\bi should (go|travel|visit|call|email|meet|pick up|drop off)',
            r'\bgo to [a-z]+',  # "go to Arizona", "go to the store"
            r'\bvisit [a-z]+',  # "visit mom", "visit the office"
            r'\bappointment',
            r'\bmeeting with\b',
            r'\bcall (my|the|dr|doctor|dentist)',
            r'\bpick up\b',
            r'\bdrop off\b',
            r'\bbuy (tickets|groceries|gift|supplies)',
            r'\bbook (flight|hotel|appointment|reservation)',
            r'\bschedule (meeting|call|appointment)',
        ]
        for pattern in reminder_patterns:
            if re.search(pattern, text_lower):
                return "reminder"

        # Bug fix patterns
        if any(w in text_lower for w in ['fix', 'bug', 'error', 'broken', 'issue', 'not working']):
            return "bug_fix"

        # Skill/automation patterns
        if any(w in text_lower for w in ['skill', 'agent', 'workflow', 'automat']):
            return "skill"

        return "feature"

    def _generate_title(self, request_text: str, request_type: str) -> str:
        """Generate plan title."""
        import re

        # Remove TB prefix
        clean = re.sub(r'(?i)^(tb|thebaby)[,:]?\s*', '', request_text)

        # Truncate and capitalize
        if len(clean) > 60:
            clean = clean[:57] + "..."

        type_prefix = {
            "feature": "Feature:",
            "bug_fix": "Bug Fix:",
            "reminder": "Reminder:",
            "skill": "Skill:",
            "question": "Question:"
        }

        return f"{type_prefix.get(request_type, 'Task:')} {clean}"

    def _plan_file_changes(self, research: ResearchResult,
                           request_type: str) -> tuple[List[str], List[str]]:
        """Plan which files to modify vs create."""

        files_modify = []
        files_create = []

        # Existing files from research are candidates for modification
        for f in research.codebase.related_files[:10]:
            if Path(f).exists():
                files_modify.append(f)

        # Determine new files based on type
        if request_type == "skill":
            base = f"/home/craigmbrown/Project/.claude/skills/{research.request_id}"
            files_create.extend([
                f"{base}/SKILL.md",
                f"{base}/scripts/main.py",
                f"{base}/tests/test_skill.py"
            ])
        elif request_type == "feature":
            # Generic feature files
            if not files_modify:
                files_create.append("/home/craigmbrown/Project/src/new_feature.py")

        return files_modify, files_create

    def _identify_components(self, research: ResearchResult, request_type: str) -> List[str]:
        """Identify new components to create."""
        components = []

        text_lower = research.request_text.lower()

        if 'api' in text_lower:
            components.append("API endpoint handler")
        if 'webhook' in text_lower:
            components.append("Webhook receiver")
        if 'notification' in text_lower:
            components.append("Notification sender")
        if 'database' in text_lower or 'store' in text_lower:
            components.append("Data persistence layer")
        if 'ui' in text_lower or 'dashboard' in text_lower:
            components.append("UI/Dashboard component")

        if request_type == "skill":
            components.extend(["Skill configuration", "Skill scripts"])

        return components if components else ["Core implementation module"]

    def _identify_apis(self, research: ResearchResult) -> List[str]:
        """Identify required APIs."""
        apis = []

        # From dependencies
        dep_api_map = {
            "anthropic": "Anthropic Claude API",
            "openai": "OpenAI API",
            "elevenlabs": "ElevenLabs TTS API",
            "notion-client": "Notion API",
            "requests": "HTTP/REST APIs"
        }

        for dep in research.codebase.dependencies:
            if dep in dep_api_map:
                apis.append(dep_api_map[dep])

        # From text
        text_lower = research.request_text.lower()
        if 'nostr' in text_lower:
            apis.append("Nostr relay protocol")
        if 'whatsapp' in text_lower:
            apis.append("WhatsApp messaging API")
        if 'github' in text_lower:
            apis.append("GitHub API")

        return list(set(apis))

    def _generate_steps(self, research: ResearchResult, request_type: str,
                        files_modify: List[str], files_create: List[str]) -> List[ImplementationStep]:
        """Generate implementation steps."""

        template = self.step_templates.get(request_type, self.step_templates["feature"])
        steps = []

        # Adjust times based on complexity
        time_multiplier = {
            "low": 0.5,
            "medium": 1.0,
            "high": 1.5
        }.get(research.codebase.complexity_estimate, 1.0)

        for i, tmpl in enumerate(template, 1):
            # Determine affected files for this step
            if "design" in tmpl["title"].lower() or "architecture" in tmpl["title"].lower():
                affected = []
            elif "test" in tmpl["title"].lower():
                affected = [f for f in files_create + files_modify if "test" in f.lower()]
            else:
                affected = files_modify[:3] + files_create[:2]

            step = ImplementationStep(
                step_number=i,
                title=tmpl["title"],
                description=f"Execute {tmpl['title'].lower()} for this request",
                estimated_minutes=int(tmpl["minutes"] * time_multiplier),
                files_affected=affected,
                dependencies=[i-1] if i > 1 else [],
                validation=f"Verify {tmpl['title'].lower()} complete"
            )
            steps.append(step)

        return steps

    def _generate_risks(self, research: ResearchResult, request_type: str) -> List[RiskMitigation]:
        """Generate risk assessment."""
        risks = []

        # Complexity risk
        if research.codebase.complexity_estimate == "high":
            risks.append(RiskMitigation(
                risk="High implementation complexity",
                severity="medium",
                mitigation="Break into smaller sub-tasks, implement incrementally",
                fallback="Simplify scope if timeline exceeded"
            ))

        # Security risks from research
        for sec in research.external.security_considerations[:2]:
            if "sensitive" in sec.lower():
                risks.append(RiskMitigation(
                    risk=sec,
                    severity="high",
                    mitigation="Follow security best practices, require approval for sensitive ops",
                    fallback="Revert changes if security issue found"
                ))

        # API dependency risk
        if research.codebase.dependencies:
            risks.append(RiskMitigation(
                risk="External API dependency",
                severity="low",
                mitigation="Implement retry logic and fallback handling",
                fallback="Use cached data or mock responses"
            ))

        # Low test coverage risk
        if research.codebase.test_coverage < 0.5:
            risks.append(RiskMitigation(
                risk="Low existing test coverage",
                severity="medium",
                mitigation="Write comprehensive tests for new code",
                fallback="Manual testing before deploy"
            ))

        # Default risk
        if not risks:
            risks.append(RiskMitigation(
                risk="Standard implementation risk",
                severity="low",
                mitigation="Follow DITD workflow with proper testing",
                fallback="Rollback via git revert"
            ))

        return risks

    def _generate_success_criteria(self, research: ResearchResult,
                                   request_type: str) -> List[str]:
        """Generate success criteria."""
        criteria = []

        # Type-specific criteria
        if request_type == "bug_fix":
            criteria.append("Bug is resolved and cannot be reproduced")
            criteria.append("Regression test passes")
        elif request_type == "feature":
            criteria.append("Feature works as specified")
            criteria.append("All unit tests pass")
            criteria.append("Integration tests pass")
        elif request_type == "skill":
            criteria.append("Skill SKILL.md documentation complete")
            criteria.append("Skill scripts execute without errors")
            criteria.append("Skill appears in skills registry")
        elif request_type == "reminder":
            criteria.append("Reminder is scheduled correctly")
            criteria.append("Notification will be sent at specified time")

        # Generic criteria
        criteria.append("No new errors in logs")
        criteria.append("WhatsApp completion notification sent")

        return criteria

    def _generate_rollback_plan(self, request_type: str,
                                files_modify: List[str],
                                files_create: List[str]) -> str:
        """Generate rollback plan."""

        lines = ["# Rollback Plan", ""]

        if files_modify:
            lines.append("## Modified Files")
            lines.append("```bash")
            lines.append("# Revert modified files")
            for f in files_modify[:5]:
                lines.append(f"git checkout HEAD -- {f}")
            lines.append("```")
            lines.append("")

        if files_create:
            lines.append("## Created Files")
            lines.append("```bash")
            lines.append("# Remove created files")
            for f in files_create[:5]:
                lines.append(f"rm -f {f}")
            lines.append("```")
            lines.append("")

        lines.append("## Full Rollback")
        lines.append("```bash")
        lines.append("# Full git revert if needed")
        lines.append("git log --oneline -5  # Find commit hash")
        lines.append("git revert <commit_hash>")
        lines.append("```")

        return "\n".join(lines)

    def _map_to_ditd(self, steps: List[ImplementationStep]) -> Dict[str, List[int]]:
        """Map steps to DITD phases."""
        ditd = {
            "design": [],
            "implement": [],
            "test": [],
            "deploy": []
        }

        for step in steps:
            title_lower = step.title.lower()

            if any(w in title_lower for w in ['design', 'architect', 'plan', 'diagnose', 'identify']):
                ditd["design"].append(step.step_number)
            elif any(w in title_lower for w in ['test', 'verify']):
                ditd["test"].append(step.step_number)
            elif any(w in title_lower for w in ['deploy', 'document', 'update', 'register']):
                ditd["deploy"].append(step.step_number)
            else:
                ditd["implement"].append(step.step_number)

        return ditd

    def _save_plan(self, plan: IntegrationPlan):
        """Save integration plan to state."""
        output_file = self.state_path / f"plan_{plan.request_id}.json"

        # Convert dataclasses to dict
        plan_dict = {
            "request_id": plan.request_id,
            "request_text": plan.request_text,
            "plan_title": plan.plan_title,
            "created_at": plan.created_at,
            "request_type": plan.request_type,
            "plan_source": plan.plan_source,  # REQ-111: Track plan origin
            "files_to_modify": plan.files_to_modify,
            "files_to_create": plan.files_to_create,
            "new_components": plan.new_components,
            "apis_required": plan.apis_required,
            "steps": [asdict(s) for s in plan.steps],
            "total_estimated_minutes": plan.total_estimated_minutes,
            "risks": [asdict(r) for r in plan.risks],
            "success_criteria": plan.success_criteria,
            "rollback_plan": plan.rollback_plan,
            "ditd_phases": plan.ditd_phases
        }

        output_file.write_text(json.dumps(plan_dict, indent=2))
        print(f"Plan saved to: {output_file}")


def format_plan_markdown(plan: IntegrationPlan) -> str:
    """Format integration plan as markdown."""
    lines = []

    lines.append(f"# {plan.plan_title}")
    lines.append(f"*Generated: {plan.created_at}*")
    lines.append(f"*Request ID: {plan.request_id}*")
    lines.append("")

    # REQ-111: Show warning if plan is from template (not Claude Code)
    if hasattr(plan, 'plan_source') and plan.plan_source == "template":
        lines.append("> ⚠️ **Note:** This is a **template-based plan**. Claude Code planning was unavailable or timed out.")
        lines.append("> ")
        lines.append("> For a more detailed, codebase-specific plan, consider:")
        lines.append("> - Re-running the request when Claude Code is available")
        lines.append("> - Adding more context to the request")
        lines.append("> - Using `/plan` in Claude Code CLI for interactive planning")
        lines.append("")

    # Scope
    lines.append("## Scope")
    lines.append(f"- **Files to modify**: {len(plan.files_to_modify)}")
    lines.append(f"- **Files to create**: {len(plan.files_to_create)}")
    lines.append(f"- **New components**: {', '.join(plan.new_components)}")
    lines.append(f"- **APIs required**: {', '.join(plan.apis_required) or 'None'}")
    lines.append(f"- **Total estimated time**: {plan.total_estimated_minutes} minutes")
    lines.append("")

    # Implementation Steps
    lines.append("## Implementation Steps")
    for step in plan.steps:
        deps = f" (depends on: {step.dependencies})" if step.dependencies else ""
        lines.append(f"{step.step_number}. **{step.title}** - {step.estimated_minutes} min{deps}")
        if step.files_affected:
            lines.append(f"   - Files: {', '.join(step.files_affected[:3])}")
    lines.append("")

    # DITD Phase Mapping
    lines.append("## DITD Phase Mapping")
    for phase, step_nums in plan.ditd_phases.items():
        if step_nums:
            lines.append(f"- **{phase.upper()}**: Steps {step_nums}")
    lines.append("")

    # Risks
    lines.append("## Risk Assessment")
    for risk in plan.risks:
        lines.append(f"- **{risk.risk}** [{risk.severity}]")
        lines.append(f"  - Mitigation: {risk.mitigation}")
    lines.append("")

    # Success Criteria
    lines.append("## Success Criteria")
    for criterion in plan.success_criteria:
        lines.append(f"- [ ] {criterion}")
    lines.append("")

    # Rollback
    lines.append("## Rollback Plan")
    lines.append(plan.rollback_plan)

    return "\n".join(lines)


def format_plan_summary(plan: IntegrationPlan) -> str:
    """Format condensed plan summary for notifications."""
    summary = []

    summary.append(f"📋 {len(plan.steps)} steps")
    summary.append(f"⏱️ {plan.total_estimated_minutes} min estimated")
    summary.append(f"📝 {len(plan.files_to_modify)} files to modify")
    summary.append(f"🆕 {len(plan.files_to_create)} files to create")
    summary.append(f"⚠️ {len(plan.risks)} risks identified")

    return "\n".join(summary)


if __name__ == "__main__":
    # Test with mock research
    from deep_researcher import ResearchResult, CodebaseAnalysis, ExternalResearch, HistoricalContext

    mock_research = ResearchResult(
        request_id="test123",
        request_text="TB create a new skill for automated testing",
        timestamp=datetime.now().isoformat(),
        codebase=CodebaseAnalysis(
            related_files=[
                "/home/craigmbrown/Project/.claude/skills/self-healing/SKILL.md",
                "/home/craigmbrown/Project/.claude/skills/notifications/SKILL.md"
            ],
            existing_patterns=[{"skill": "notifications", "type": "skill_implementation"}],
            dependencies=["pytest", "requests"],
            test_coverage=0.6,
            complexity_estimate="medium"
        ),
        external=ExternalResearch(
            documentation=[{"title": "Skill Guide", "path": "/docs/SKILLS.md"}],
            best_practices=["Use standard exception handling"],
            security_considerations=["No sensitive operations"],
            cost_implications=["Minimal API costs"]
        ),
        historical=HistoricalContext(
            similar_requests=[],
            success_patterns=["DITD lifecycle"],
            failure_patterns=[],
            user_preferences=["Dark mode reports"]
        ),
        research_duration_seconds=10.0,
        confidence_score=0.8
    )

    planner = IntegrationPlanner()
    plan = planner.generate_plan(mock_research)

    print("\n" + "="*60)
    print("INTEGRATION PLAN")
    print("="*60)
    print(format_plan_markdown(plan))
