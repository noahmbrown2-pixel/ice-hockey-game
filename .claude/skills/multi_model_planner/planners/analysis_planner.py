#!/usr/bin/env python3
"""
Analysis Planner - Grok-4 for large context analysis.
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# Handle imports for both direct execution and package import
try:
    from .base_planner import BasePlanner, PlannerType, EnhancementContext, PlannerResult
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent))
    from base_planner import BasePlanner, PlannerType, EnhancementContext, PlannerResult

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class AnalysisPlanner(BasePlanner):
    """
    Analysis planner using xAI Grok-4 with 131K context window.
    """

    SYSTEM_PROMPT = """You are an expert code analyst. Analyze large codebases
and provide comprehensive enhancement plans. Focus on:
- Cross-file dependencies
- System-wide impact
- Performance implications
- Integration considerations"""

    XAI_BASE_URL = "https://api.x.ai/v1"
    CONTEXT_WINDOW = 131072

    def __init__(self, model: str = "grok-4"):
        super().__init__(PlannerType.ANALYSIS)
        self.model_name = model
        self.client = None
        if OPENAI_AVAILABLE:
            api_key = os.getenv("XAI_API_KEY")
            if api_key:
                self.client = OpenAI(
                    api_key=api_key,
                    base_url=self.XAI_BASE_URL
                )

    def plan(self, context: EnhancementContext) -> PlannerResult:
        """Generate analysis plan using Grok-4."""
        start_time = datetime.now()

        if not self.validate_context(context):
            return PlannerResult(
                planner_type=self.planner_type,
                success=False,
                error="Invalid context"
            )

        if not self.client:
            return PlannerResult(
                planner_type=self.planner_type,
                success=True,
                plan_steps=[
                    "Analyze codebase structure",
                    "Identify affected components",
                    "Map dependencies",
                    "Assess performance impact",
                    "Plan integration strategy"
                ],
                confidence=0.68,
                reasoning="Mock plan - xAI API not configured",
                model_used="mock"
            )

        try:
            prompt = f"""{self.SYSTEM_PROMPT}

Enhancement: {context.title}
Description: {context.description}
Codebase Context: {context.codebase_context[:50000] if context.codebase_context else 'Not provided'}

Analyze and provide implementation recommendations."""

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=8192
            )

            content = response.choices[0].message.content
            generation_time = (datetime.now() - start_time).total_seconds()

            return PlannerResult(
                planner_type=self.planner_type,
                success=True,
                plan_steps=self._parse_analysis(content),
                files_to_modify=self._identify_impacted_files(content),
                confidence=0.78,
                reasoning=content,
                estimated_complexity=self._assess_complexity(content),
                risks=self._identify_risks(content),
                model_used=self.model_name,
                tokens_used=response.usage.total_tokens if response.usage else 0,
                generation_time=generation_time
            )

        except Exception as e:
            return PlannerResult(
                planner_type=self.planner_type,
                success=False,
                error=str(e),
                model_used=self.model_name
            )

    def _parse_analysis(self, content: str) -> list:
        """Parse analysis steps."""
        steps = []
        for line in content.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-')):
                steps.append(line.lstrip('0123456789.-) '))
        return steps[:15] if steps else ["Perform detailed analysis"]

    def _identify_impacted_files(self, content: str) -> list:
        """Identify files from analysis."""
        import re
        files = re.findall(r'[a-zA-Z_/]+\.[a-z]+', content)
        return [f for f in set(files) if not f.startswith('http')][:15]

    def _assess_complexity(self, content: str) -> str:
        """Assess complexity from content."""
        content_lower = content.lower()
        if 'high complexity' in content_lower or 'major' in content_lower:
            return 'high'
        elif 'simple' in content_lower or 'minor' in content_lower:
            return 'low'
        return 'medium'

    def _identify_risks(self, content: str) -> list:
        """Extract risks from analysis."""
        risks = []
        for line in content.split('\n'):
            if 'risk' in line.lower() or 'caution' in line.lower():
                risks.append(line.strip())
        return risks[:5]


# Standard I/O Pattern compliance
if __name__ == "__main__":
    planner = AnalysisPlanner()
    print("SUCCESS: analysis_planner module loaded")
    print(f"Model: {planner.model_name}")
    print(f"Context window: {planner.CONTEXT_WINDOW:,} tokens")
    print(f"xAI base URL: {planner.XAI_BASE_URL}")
    print(f"Client configured: {planner.client is not None}")
