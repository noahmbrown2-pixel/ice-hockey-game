#!/usr/bin/env python3
"""
Consensus Builder - Synthesize multiple planner outputs using Claude.
"""

import os
from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

# Handle imports for both direct execution and package import
try:
    from ..planners.base_planner import PlannerResult, PlannerType
except ImportError:
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from planners.base_planner import PlannerResult, PlannerType

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class ConsensusResult:
    """Result from consensus building."""
    success: bool
    unified_steps: List[str] = field(default_factory=list)
    all_files: List[str] = field(default_factory=list)
    confidence: float = 0.0
    agreement_score: float = 0.0
    conflicts_resolved: List[str] = field(default_factory=list)
    final_reasoning: str = ""
    contributing_planners: List[str] = field(default_factory=list)


class ConsensusBuilder:
    """
    Build consensus from multiple planner outputs using Claude Sonnet 4.
    """

    SYNTHESIS_PROMPT = """You are synthesizing multiple implementation plans into one unified plan.

Review these plans from different specialized planners and create a consensus:

{plans_text}

Create a unified plan that:
1. Combines the best elements from each plan
2. Resolves any conflicts
3. Provides clear, actionable steps
4. Lists all files to modify

Output format:
UNIFIED STEPS:
1. [step]
2. [step]
...

FILES TO MODIFY:
- [file]
- [file]

CONFIDENCE: [0-100]%
CONFLICTS RESOLVED: [list any conflicts you resolved]"""

    def __init__(self, model: str = "claude-sonnet-4-20250514"):
        self.model_name = model
        self.client = None
        if ANTHROPIC_AVAILABLE:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                self.client = anthropic.Anthropic(api_key=api_key)

    def build_consensus(self, results: List[PlannerResult]) -> ConsensusResult:
        """
        Build consensus from multiple planner results.

        Args:
            results: List of PlannerResult objects

        Returns:
            ConsensusResult with unified plan
        """
        if not results:
            return ConsensusResult(success=False)

        # Filter successful results
        successful = [r for r in results if r.success]
        if not successful:
            return ConsensusResult(success=False)

        # If only one result, return it directly
        if len(successful) == 1:
            r = successful[0]
            return ConsensusResult(
                success=True,
                unified_steps=r.plan_steps,
                all_files=r.files_to_modify,
                confidence=r.confidence,
                agreement_score=1.0,
                contributing_planners=[r.planner_type.value]
            )

        # Build prompt with all plans
        plans_text = self._format_plans(successful)

        if not self.client:
            # Mock consensus when API unavailable
            return self._mock_consensus(successful)

        try:
            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=4096,
                messages=[{
                    "role": "user",
                    "content": self.SYNTHESIS_PROMPT.format(plans_text=plans_text)
                }]
            )

            content = response.content[0].text
            return self._parse_consensus(content, successful)

        except Exception as e:
            return self._mock_consensus(successful)

    def _format_plans(self, results: List[PlannerResult]) -> str:
        """Format planner results for synthesis."""
        sections = []
        for r in results:
            section = f"""
=== {r.planner_type.value.upper()} PLANNER ({r.model_used}) ===
Confidence: {r.confidence:.0%}

Steps:
{chr(10).join(f'- {s}' for s in r.plan_steps)}

Files:
{chr(10).join(f'- {f}' for f in r.files_to_modify)}
"""
            sections.append(section)
        return "\n".join(sections)

    def _parse_consensus(
        self,
        content: str,
        results: List[PlannerResult]
    ) -> ConsensusResult:
        """Parse Claude's consensus response."""
        steps = []
        files = []
        confidence = 0.85
        conflicts = []

        lines = content.split('\n')
        current_section = None

        for line in lines:
            line = line.strip()
            if 'UNIFIED STEPS' in line:
                current_section = 'steps'
            elif 'FILES TO MODIFY' in line:
                current_section = 'files'
            elif 'CONFIDENCE' in line:
                try:
                    confidence = float(line.split(':')[1].strip().rstrip('%')) / 100
                except (ValueError, IndexError):
                    pass
            elif 'CONFLICTS RESOLVED' in line:
                current_section = 'conflicts'
            elif line and current_section:
                if current_section == 'steps' and (line[0].isdigit() or line.startswith('-')):
                    steps.append(line.lstrip('0123456789.-) '))
                elif current_section == 'files' and line.startswith('-'):
                    files.append(line.lstrip('- '))
                elif current_section == 'conflicts':
                    conflicts.append(line.lstrip('- '))

        return ConsensusResult(
            success=True,
            unified_steps=steps if steps else self._merge_steps(results),
            all_files=files if files else self._merge_files(results),
            confidence=confidence,
            agreement_score=self._calculate_agreement(results),
            conflicts_resolved=conflicts,
            final_reasoning=content,
            contributing_planners=[r.planner_type.value for r in results]
        )

    def _mock_consensus(self, results: List[PlannerResult]) -> ConsensusResult:
        """Create mock consensus without API."""
        return ConsensusResult(
            success=True,
            unified_steps=self._merge_steps(results),
            all_files=self._merge_files(results),
            confidence=sum(r.confidence for r in results) / len(results),
            agreement_score=self._calculate_agreement(results),
            contributing_planners=[r.planner_type.value for r in results]
        )

    def _merge_steps(self, results: List[PlannerResult]) -> List[str]:
        """Merge steps from all results."""
        all_steps = []
        for r in results:
            all_steps.extend(r.plan_steps)
        # Deduplicate while preserving order
        seen = set()
        unique = []
        for step in all_steps:
            normalized = step.lower()[:50]
            if normalized not in seen:
                seen.add(normalized)
                unique.append(step)
        return unique[:12]

    def _merge_files(self, results: List[PlannerResult]) -> List[str]:
        """Merge files from all results."""
        all_files = set()
        for r in results:
            all_files.update(r.files_to_modify)
        return list(all_files)[:15]

    def _calculate_agreement(self, results: List[PlannerResult]) -> float:
        """Calculate agreement score between planners."""
        if len(results) < 2:
            return 1.0

        # Simple overlap calculation
        all_steps = [set(r.plan_steps) for r in results]
        total_pairs = 0
        agreement_sum = 0.0

        for i in range(len(all_steps)):
            for j in range(i + 1, len(all_steps)):
                if all_steps[i] and all_steps[j]:
                    intersection = len(all_steps[i] & all_steps[j])
                    union = len(all_steps[i] | all_steps[j])
                    agreement_sum += intersection / union if union else 0
                    total_pairs += 1

        return agreement_sum / total_pairs if total_pairs else 0.5


# Standard I/O Pattern compliance
if __name__ == "__main__":
    builder = ConsensusBuilder()
    print("SUCCESS: consensus/builder module loaded")
    print(f"Model: {builder.model_name}")
    print(f"Anthropic available: {ANTHROPIC_AVAILABLE}")
    print(f"Client configured: {builder.client is not None}")
