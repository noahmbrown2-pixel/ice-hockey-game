#!/usr/bin/env python3
"""
Claude Code-based Integration Planner for TB Request Workflow

Uses Claude Code CLI to generate REAL integration plans that:
1. Analyze the existing codebase for integration points
2. Find existing patterns to leverage (not build standalone)
3. Identify specific files/functions to modify
4. Create contextual, codebase-aware implementation steps

BLP Properties:
- Alignment: Plans aligned with existing architecture
- Self-Organization: Leverages codebase patterns
- Durability: Integration-first approach
"""

import os
import sys
import json
import subprocess
import tempfile
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, field

# Import existing plan structures
sys.path.insert(0, str(Path(__file__).parent))
from integration_planner import (
    IntegrationPlan, ImplementationStep, RiskMitigation,
    format_plan_markdown, format_plan_summary
)
from deep_researcher import ResearchResult


@dataclass
class ClaudeCodePlanResult:
    """Result from Claude Code planning session."""
    success: bool
    plan_content: str
    session_id: str
    duration_seconds: float
    error: Optional[str] = None


class ClaudeCodePlanner:
    """Generate integration plans using Claude Code CLI."""

    def __init__(self):
        self.state_path = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow/state")
        self.state_path.mkdir(parents=True, exist_ok=True)
        self.project_root = Path("/home/craigmbrown/Project")

    def generate_plan(self, research: ResearchResult) -> IntegrationPlan:
        """Generate plan using Claude Code CLI for codebase analysis."""

        start_time = time.time()

        # Create planning prompt file
        prompt_file = self._create_planning_prompt(research)

        # Run Claude Code in non-interactive mode with the prompt
        result = self._run_claude_code_planning(prompt_file, research)

        if result.success:
            # Parse Claude Code output into IntegrationPlan
            plan = self._parse_claude_output(result.plan_content, research)
            # Save plan
            self._save_plan(plan)
            duration = time.time() - start_time
            print(f"SUCCESS: generate_plan completed in {duration:.1f}s")
            return plan
        else:
            # FAIL FAST: Do NOT create template plans — they produce garbage GitHub issues
            # with no real file analysis, generic steps, and wrong files_to_modify.
            # Better to fail explicitly so the user can re-run when Claude Code is available.
            print(f"ERROR: Claude Code planning failed: {result.error}")
            print("REFUSING to create template fallback plan — would produce low-value GitHub issue")
            print("Re-run the TB command when Claude Code CLI is available for real codebase analysis")
            return None

    def _create_planning_prompt(self, research: ResearchResult) -> Path:
        """Create prompt file for Claude Code planning session."""

        # Build context from research
        existing_patterns = "\n".join([
            f"- {p.get('skill', 'unknown')}: {p.get('file', '')}"
            for p in research.codebase.existing_patterns[:10]
        ])

        related_docs = "\n".join([
            f"- {d.get('title', 'doc')}: {d.get('path', '')}"
            for d in research.external.documentation[:5]
        ])

        dependencies = ", ".join(research.codebase.dependencies) if research.codebase.dependencies else "None identified"

        prompt = f'''# TB Request: Integration Planning Task

## Request
{research.request_text}

## Request ID
{research.request_id}

## CRITICAL REQUIREMENTS
1. DO NOT create a standalone solution
2. INTEGRATE with existing codebase patterns and systems
3. Find SPECIFIC files/functions to modify or extend
4. Leverage existing implementations, don't rebuild

## Your Task
Analyze the codebase and create a REAL integration plan. You must:

1. **Search the codebase** for:
   - Similar existing implementations to extend
   - Integration points (APIs, hooks, event systems)
   - Configuration patterns to follow
   - Testing patterns to match

2. **Identify SPECIFIC files** that should be:
   - Modified (with line numbers if possible)
   - Extended (existing classes/functions to enhance)
   - Created (only if no existing code can be extended)

3. **Create integration steps** that:
   - Reference actual file paths
   - Describe specific code changes
   - Follow existing patterns in the codebase

## Context From Research

### Existing Patterns Found
{existing_patterns}

### Documentation References
{related_docs}

### Dependencies
{dependencies}

### Best Practices
{chr(10).join(research.external.best_practices)}

### User Preferences
{chr(10).join(research.historical.user_preferences)}

## OUTPUT FORMAT (JSON)
Output your plan as JSON with this exact structure:

```json
{{
  "plan_title": "Integration: [brief title]",
  "integration_approach": "Brief description of how this integrates with existing code",
  "files_to_modify": [
    {{
      "path": "/full/path/to/file.py",
      "reason": "Why this file needs modification",
      "changes": "Specific changes to make"
    }}
  ],
  "files_to_create": [
    {{
      "path": "/full/path/to/new_file.py",
      "reason": "Why this file is needed (only if can't extend existing)"
    }}
  ],
  "existing_code_to_leverage": [
    {{
      "file": "/path/to/existing.py",
      "component": "ClassName or function_name",
      "how_to_use": "How to extend/use this existing code"
    }}
  ],
  "steps": [
    {{
      "step_number": 1,
      "title": "Step title",
      "description": "Detailed description with specific file/function references",
      "files_affected": ["/path/to/file.py"],
      "estimated_minutes": 15,
      "validation": "How to verify this step is complete"
    }}
  ],
  "risks": [
    {{
      "risk": "Risk description",
      "severity": "low|medium|high",
      "mitigation": "How to mitigate",
      "affected_files": ["/path/if/relevant"]
    }}
  ],
  "success_criteria": ["Specific, testable criteria"],
  "rollback_commands": ["git checkout -- /path/to/file.py"]
}}
```

Now analyze the codebase at /home/craigmbrown/Project and create this integration plan.
Focus on finding existing code to extend, not creating from scratch.
'''

        prompt_file = self.state_path / f"planning_prompt_{research.request_id}.md"
        prompt_file.write_text(prompt)

        return prompt_file

    def _run_claude_code_planning(self, prompt_file: Path, research: ResearchResult) -> ClaudeCodePlanResult:
        """Run Claude Code CLI for planning using create_plan.md methodology."""

        session_id = f"plan_{research.request_id}"
        start_time = time.time()

        # Output file for Claude Code results
        output_file = self.state_path / f"claude_plan_output_{research.request_id}.txt"

        # Build context from research for prompt
        existing_patterns = "\n".join([
            f"   - {p.get('skill', p.get('name', 'pattern'))}: {p.get('file', p.get('path', ''))}"
            for p in research.codebase.existing_patterns[:8]
        ])

        # Focused prompt following /create_plan.md methodology - optimized for speed
        prompt = f'''Create an integration plan for: "{research.request_text}"

CRITICAL RULES:
1. Find EXISTING code to modify - don't build standalone
2. Include SPECIFIC file paths with line numbers
3. Reference real functions/classes found in codebase

QUICK SEARCH: Use Glob to find relevant Python files in:
- /home/craigmbrown/Project/scripts/*.py (automation)
- /home/craigmbrown/Project/agent-system-status.py (monitoring)
- /home/craigmbrown/Project/.claude/skills/*/scripts/*.py (skills)

{f"Known patterns:{chr(10)}{existing_patterns}" if existing_patterns else ""}

OUTPUT this JSON plan (search codebase first, then output):

{{
  "plan_title": "Integration: [title]",
  "files_to_modify": [{{"path": "/full/path.py", "reason": "why", "changes": "what to change", "line_refs": "lines X-Y"}}],
  "files_to_create": [{{"path": "/full/path.py", "reason": "only if needed"}}],
  "existing_code_to_leverage": [{{"file": "/path.py", "component": "func_name (lines X-Y)", "how_to_use": "description"}}],
  "steps": [{{"step_number": 1, "title": "title", "description": "with file refs", "files_affected": ["/paths"], "estimated_minutes": 15, "dependencies": [], "validation": "python test.py --verify"}}],
  "risks": [{{"risk": "description", "severity": "medium", "mitigation": "steps", "fallback": "alternative"}}],
  "success_criteria": ["✅ Automated: command to test", "✅ Manual: what to verify"],
  "rollback_plan": "git checkout -- /files.py"
}}

Search now, find real files, output the JSON.'''

        # Use claude with --print mode and --dangerously-skip-permissions for tool access
        cmd = [
            "claude",
            "--print",
            "--dangerously-skip-permissions",  # Allow tool use
            "--output-format", "text",
            prompt
        ]

        try:
            print(f"🔍 Running Claude Code CLI for codebase analysis (5 min timeout)...")

            # Run Claude Code with the planning prompt
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout for thorough analysis
                cwd=str(self.project_root)
            )

            duration = time.time() - start_time

            # Save output for debugging
            output_file.write_text(result.stdout + "\n\nSTDERR:\n" + result.stderr)
            print(f"📄 Claude Code output saved to: {output_file}")

            if result.returncode == 0 and result.stdout.strip():
                print(f"✅ Claude Code analysis completed in {duration:.1f}s")
                return ClaudeCodePlanResult(
                    success=True,
                    plan_content=result.stdout,
                    session_id=session_id,
                    duration_seconds=duration
                )
            else:
                error_msg = result.stderr if result.stderr else "No output received"
                print(f"⚠️ Claude Code returned: {error_msg[:200]}")
                return ClaudeCodePlanResult(
                    success=False,
                    plan_content="",
                    session_id=session_id,
                    duration_seconds=duration,
                    error=f"Claude Code exited with code {result.returncode}: {error_msg[:500]}"
                )

        except subprocess.TimeoutExpired:
            return ClaudeCodePlanResult(
                success=False,
                plan_content="",
                session_id=session_id,
                duration_seconds=300,
                error="Claude Code planning timed out after 5 minutes - falling back to template"
            )
        except FileNotFoundError:
            return ClaudeCodePlanResult(
                success=False,
                plan_content="",
                session_id=session_id,
                duration_seconds=0,
                error="Claude Code CLI not found in PATH"
            )
        except Exception as e:
            return ClaudeCodePlanResult(
                success=False,
                plan_content="",
                session_id=session_id,
                duration_seconds=time.time() - start_time,
                error=str(e)
            )

    def _parse_claude_output(self, output: str, research: ResearchResult) -> IntegrationPlan:
        """Parse Claude Code output into IntegrationPlan structure."""

        try:
            # Try to extract JSON from the output
            json_start = output.find('{')
            json_end = output.rfind('}') + 1

            if json_start >= 0 and json_end > json_start:
                json_str = output[json_start:json_end]
                plan_data = json.loads(json_str)

                return self._convert_to_integration_plan(plan_data, research)
            else:
                # Try to parse as structured text
                return self._parse_text_plan(output, research)

        except json.JSONDecodeError:
            print("WARNING: Could not parse JSON from Claude output, using text parsing")
            return self._parse_text_plan(output, research)

    def _convert_to_integration_plan(self, data: Dict, research: ResearchResult) -> IntegrationPlan:
        """Convert parsed JSON data to IntegrationPlan."""

        # Extract files
        files_to_modify = [f.get("path", "") for f in data.get("files_to_modify", [])]
        files_to_create = [f.get("path", "") for f in data.get("files_to_create", [])]

        # Convert steps
        steps = []
        for s in data.get("steps", []):
            steps.append(ImplementationStep(
                step_number=s.get("step_number", len(steps) + 1),
                title=s.get("title", "Implementation step"),
                description=s.get("description", ""),
                estimated_minutes=s.get("estimated_minutes", 15),
                files_affected=s.get("files_affected", []),
                dependencies=[s.get("step_number", 1) - 1] if s.get("step_number", 1) > 1 else [],
                validation=s.get("validation", "Verify completion")
            ))

        # Convert risks
        risks = []
        for r in data.get("risks", []):
            risks.append(RiskMitigation(
                risk=r.get("risk", "Implementation risk"),
                severity=r.get("severity", "medium"),
                mitigation=r.get("mitigation", "Monitor closely"),
                fallback=r.get("fallback")
            ))

        # Build rollback plan from commands
        rollback_cmds = data.get("rollback_commands", [])
        rollback_plan = "# Rollback Plan\n\n```bash\n" + "\n".join(rollback_cmds) + "\n```"

        # Extract existing code to leverage for components
        components = [
            f"{c.get('component', 'component')} from {c.get('file', 'existing code')}"
            for c in data.get("existing_code_to_leverage", [])
        ]

        if not components:
            components = ["Integration with existing codebase"]

        # Map to DITD phases
        ditd_phases = self._map_steps_to_ditd(steps)

        return IntegrationPlan(
            request_id=research.request_id,
            request_text=research.request_text,
            plan_title=data.get("plan_title", f"Integration: {research.request_text[:150]}"),
            created_at=datetime.now().isoformat(),
            plan_source="claude_code",  # REQ-111: Successfully parsed from Claude Code CLI
            files_to_modify=files_to_modify,
            files_to_create=files_to_create,
            new_components=components,
            apis_required=self._extract_apis(research),
            steps=steps,
            total_estimated_minutes=sum(s.estimated_minutes for s in steps),
            risks=risks if risks else [RiskMitigation("Standard integration risk", "low", "Follow DITD workflow")],
            success_criteria=data.get("success_criteria", ["Integration complete", "All tests pass"]),
            rollback_plan=rollback_plan,
            ditd_phases=ditd_phases
        )

    def _parse_text_plan(self, output: str, research: ResearchResult) -> IntegrationPlan:
        """Parse Claude's text output into a plan when JSON parsing fails."""

        # Extract what we can from the text
        lines = output.strip().split('\n')

        steps = []
        files_to_modify = []
        files_to_create = []

        current_step = 0
        for line in lines:
            # Look for file paths
            if '/home/craigmbrown/' in line or '/Project/' in line:
                # Extract path
                import re
                paths = re.findall(r'/home/craigmbrown/[^\s\'"]+', line)
                for path in paths:
                    if 'modify' in line.lower() or 'update' in line.lower() or 'change' in line.lower():
                        files_to_modify.append(path)
                    elif 'create' in line.lower() or 'new' in line.lower():
                        files_to_create.append(path)

            # Look for numbered steps
            if line.strip() and line.strip()[0].isdigit() and '.' in line[:5]:
                current_step += 1
                step_text = line.strip().split('.', 1)[-1].strip()
                steps.append(ImplementationStep(
                    step_number=current_step,
                    title=step_text[:60],
                    description=step_text,
                    estimated_minutes=15,
                    files_affected=[],
                    dependencies=[current_step - 1] if current_step > 1 else [],
                    validation=f"Verify step {current_step} complete"
                ))

        # Ensure we have at least some steps
        if not steps:
            steps = [
                ImplementationStep(1, "Analyze integration points",
                    "Review codebase for integration opportunities", 15, [], [], "Analysis complete"),
                ImplementationStep(2, "Implement integration",
                    "Integrate with existing code patterns", 30, [], [1], "Integration complete"),
                ImplementationStep(3, "Test integration",
                    "Verify integration works correctly", 15, [], [2], "Tests pass"),
                ImplementationStep(4, "Deploy changes",
                    "Deploy integrated solution", 10, [], [3], "Deployment verified")
            ]

        return IntegrationPlan(
            request_id=research.request_id,
            request_text=research.request_text,
            plan_title=f"Integration: {research.request_text[:150]}",
            created_at=datetime.now().isoformat(),
            plan_source="claude_code",  # REQ-111: From Claude Code CLI (text parsing fallback)
            files_to_modify=list(set(files_to_modify)),
            files_to_create=list(set(files_to_create)),
            new_components=["Codebase integration"],
            apis_required=self._extract_apis(research),
            steps=steps,
            total_estimated_minutes=sum(s.estimated_minutes for s in steps),
            risks=[RiskMitigation("Integration complexity", "medium", "Incremental implementation")],
            success_criteria=["Integration complete", "Existing functionality preserved", "All tests pass"],
            rollback_plan="# Rollback\n\n```bash\ngit checkout -- .\n```",
            ditd_phases=self._map_steps_to_ditd(steps)
        )

    def _fallback_enhanced_plan(self, research: ResearchResult) -> IntegrationPlan:
        """Enhanced fallback when Claude Code is unavailable."""

        # Use research to create a more contextual plan
        files_to_modify = []
        files_to_create = []

        # Get files from existing patterns
        for pattern in research.codebase.existing_patterns[:5]:
            if 'file' in pattern:
                files_to_modify.append(pattern['file'])

        # Build steps based on request type
        request_lower = research.request_text.lower()

        if 'skill' in request_lower or 'agent' in request_lower:
            steps = self._skill_integration_steps(research)
        elif 'notification' in request_lower or 'alert' in request_lower:
            steps = self._notification_integration_steps(research)
        elif 'api' in request_lower or 'endpoint' in request_lower:
            steps = self._api_integration_steps(research)
        else:
            steps = self._generic_integration_steps(research)

        return IntegrationPlan(
            request_id=research.request_id,
            request_text=research.request_text,
            plan_title=f"Integration: {research.request_text[:150]}",
            created_at=datetime.now().isoformat(),
            plan_source="template",  # REQ-111: Template fallback - Claude Code unavailable/timed out
            files_to_modify=files_to_modify,
            files_to_create=files_to_create,
            new_components=["Integration module"],
            apis_required=self._extract_apis(research),
            steps=steps,
            total_estimated_minutes=sum(s.estimated_minutes for s in steps),
            risks=[RiskMitigation("Integration risk", "medium", "Incremental approach with testing")],
            success_criteria=["Integration complete", "Existing tests pass", "New functionality verified"],
            rollback_plan="# Rollback\n\n```bash\ngit checkout -- .\ngit clean -fd\n```",
            ditd_phases=self._map_steps_to_ditd(steps)
        )

    def _skill_integration_steps(self, research: ResearchResult) -> List[ImplementationStep]:
        """Steps for skill/agent integration."""
        return [
            ImplementationStep(1, "Analyze existing skill patterns",
                "Review existing skills in .claude/skills/ for patterns to follow",
                20, ["/home/craigmbrown/Project/.claude/skills/"], [], "Patterns documented"),
            ImplementationStep(2, "Design skill integration architecture",
                "Plan how new skill integrates with existing skill system and hooks",
                15, [], [1], "Architecture designed"),
            ImplementationStep(3, "Extend existing skill infrastructure",
                "Modify existing skill loader/registry if needed",
                25, [], [2], "Infrastructure updated"),
            ImplementationStep(4, "Implement skill core logic",
                "Create skill scripts using existing patterns",
                45, [], [3], "Core logic complete"),
            ImplementationStep(5, "Add skill to registry and test",
                "Register skill and run integration tests",
                20, [], [4], "Skill registered and tested"),
            ImplementationStep(6, "Update documentation",
                "Add skill to docs and update SKILL.md",
                10, [], [5], "Documentation complete")
        ]

    def _notification_integration_steps(self, research: ResearchResult) -> List[ImplementationStep]:
        """Steps for notification system integration."""
        return [
            ImplementationStep(1, "Analyze existing notification channels",
                "Review WhatsApp, Nostr, email notification patterns",
                15, [], [], "Channels documented"),
            ImplementationStep(2, "Identify integration points",
                "Find existing notification hooks and event triggers",
                20, [], [1], "Integration points found"),
            ImplementationStep(3, "Extend notification infrastructure",
                "Add new notification type to existing system",
                30, [], [2], "Infrastructure extended"),
            ImplementationStep(4, "Implement aggregation/filtering",
                "Add logic for notification consolidation",
                35, [], [3], "Aggregation complete"),
            ImplementationStep(5, "Test with existing channels",
                "Verify integration with WhatsApp, Nostr, Email",
                20, [], [4], "All channels working"),
            ImplementationStep(6, "Deploy and monitor",
                "Enable in production with monitoring",
                10, [], [5], "Deployed and monitored")
        ]

    def _api_integration_steps(self, research: ResearchResult) -> List[ImplementationStep]:
        """Steps for API/endpoint integration."""
        return [
            ImplementationStep(1, "Review existing API patterns",
                "Analyze current API structure and conventions",
                15, [], [], "API patterns documented"),
            ImplementationStep(2, "Design endpoint integration",
                "Plan endpoint that follows existing patterns",
                15, [], [1], "Endpoint designed"),
            ImplementationStep(3, "Extend API router/handler",
                "Add new endpoint to existing router",
                25, [], [2], "Router extended"),
            ImplementationStep(4, "Implement endpoint logic",
                "Create handler using existing service patterns",
                30, [], [3], "Handler complete"),
            ImplementationStep(5, "Add authentication/validation",
                "Integrate with existing auth system",
                15, [], [4], "Auth integrated"),
            ImplementationStep(6, "Write API tests",
                "Add tests following existing test patterns",
                20, [], [5], "Tests pass")
        ]

    def _generic_integration_steps(self, research: ResearchResult) -> List[ImplementationStep]:
        """Generic integration steps."""
        return [
            ImplementationStep(1, "Analyze codebase for integration points",
                "Search for existing patterns and extension points",
                20, [], [], "Integration points identified"),
            ImplementationStep(2, "Design integration approach",
                "Plan minimal-change integration strategy",
                15, [], [1], "Approach designed"),
            ImplementationStep(3, "Extend existing components",
                "Modify existing code to add new functionality",
                35, [], [2], "Components extended"),
            ImplementationStep(4, "Implement new logic",
                "Add new code following existing patterns",
                30, [], [3], "Logic implemented"),
            ImplementationStep(5, "Integration testing",
                "Test with existing systems",
                20, [], [4], "Integration tests pass"),
            ImplementationStep(6, "Deploy and verify",
                "Deploy changes and verify production",
                10, [], [5], "Deployed successfully")
        ]

    def _extract_apis(self, research: ResearchResult) -> List[str]:
        """Extract required APIs from research."""
        apis = []

        # From dependencies
        dep_api_map = {
            "anthropic": "Anthropic Claude API",
            "openai": "OpenAI API",
            "elevenlabs": "ElevenLabs TTS API",
            "notion-client": "Notion API",
            "python-nostr": "Nostr Relay Protocol",
            "whatsapp-mcp": "WhatsApp API"
        }

        for dep in research.codebase.dependencies:
            for key, api in dep_api_map.items():
                if key in dep.lower():
                    apis.append(api)

        return list(set(apis))

    def _map_steps_to_ditd(self, steps: List[ImplementationStep]) -> Dict[str, List[int]]:
        """Map steps to DITD phases based on titles."""
        ditd = {"design": [], "implement": [], "test": [], "deploy": []}

        for step in steps:
            title_lower = step.title.lower()

            if any(w in title_lower for w in ['analyze', 'design', 'plan', 'review', 'identify']):
                ditd["design"].append(step.step_number)
            elif any(w in title_lower for w in ['test', 'verify', 'integration test']):
                ditd["test"].append(step.step_number)
            elif any(w in title_lower for w in ['deploy', 'document', 'monitor', 'register']):
                ditd["deploy"].append(step.step_number)
            else:
                ditd["implement"].append(step.step_number)

        return ditd

    def _save_plan(self, plan: IntegrationPlan):
        """Save plan to state directory."""
        output_file = self.state_path / f"plan_{plan.request_id}.json"

        plan_dict = {
            "request_id": plan.request_id,
            "request_text": plan.request_text,
            "plan_title": plan.plan_title,
            "created_at": plan.created_at,
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


if __name__ == "__main__":
    # Test with a sample research result
    from deep_researcher import ResearchResult, CodebaseAnalysis, ExternalResearch, HistoricalContext

    test_research = ResearchResult(
        request_id="test_cc_plan",
        request_text="TB: Add a visual progress indicator for long-running agent tasks",
        timestamp=datetime.now().isoformat(),
        codebase=CodebaseAnalysis(
            related_files=[],
            existing_patterns=[
                {"skill": "nostr-dm-notifier", "file": "/home/craigmbrown/Project/.claude/skills/nostr-dm-notifier/SKILL.md"},
                {"skill": "fork-terminal", "file": "/home/craigmbrown/Project/.claude/skills/fork-terminal/SKILL.md"}
            ],
            dependencies=["anthropic", "requests"],
            test_coverage=0.6,
            complexity_estimate="medium"
        ),
        external=ExternalResearch(
            documentation=[],
            best_practices=["Follow existing patterns"],
            security_considerations=["No security concerns"],
            cost_implications=["Minimal cost"]
        ),
        historical=HistoricalContext(
            similar_requests=[],
            success_patterns=["DITD lifecycle"],
            failure_patterns=[],
            user_preferences=["Integration over standalone"]
        ),
        research_duration_seconds=10.0,
        confidence_score=0.75
    )

    planner = ClaudeCodePlanner()
    plan = planner.generate_plan(test_research)

    print("\n" + "="*60)
    print("CLAUDE CODE INTEGRATION PLAN")
    print("="*60)
    print(format_plan_markdown(plan))
