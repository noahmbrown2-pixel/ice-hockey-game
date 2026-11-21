#!/usr/bin/env python3
"""
Complex Planner - O3/O1 for architectural decisions.
"""

import os
import sys
from datetime import datetime
from typing import Optional
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


class ComplexPlanner(BasePlanner):
    """
    Complex planner using OpenAI O3/O1 for architectural decisions.
    """

    SYSTEM_PROMPT = """You are an expert software architect. Analyze enhancement requests
and provide detailed architectural plans. Focus on:
- System design decisions
- Component interactions
- Scalability considerations
- Risk mitigation strategies

Output structured plans with clear steps and file modifications."""

    def __init__(self, model: str = "o3-mini"):
        super().__init__(PlannerType.COMPLEX)
        self.model_name = model
        self.client = None
        if OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.client = OpenAI(api_key=api_key)

    def plan(self, context: EnhancementContext) -> PlannerResult:
        """Generate architectural plan using O3/O1."""
        start_time = datetime.now()

        if not self.validate_context(context):
            return PlannerResult(
                planner_type=self.planner_type,
                success=False,
                error="Invalid context"
            )

        if not self.client:
            # Return mock result when API unavailable
            return PlannerResult(
                planner_type=self.planner_type,
                success=True,
                plan_steps=[
                    "Analyze existing architecture",
                    "Design component interfaces",
                    "Implement core functionality",
                    "Add comprehensive tests",
                    "Update documentation"
                ],
                files_to_modify=["src/main.py", "tests/test_main.py"],
                confidence=0.75,
                reasoning="Mock plan - API key not configured",
                model_used="mock",
                generation_time=0.1
            )

        try:
            prompt = f"""Enhancement Request:
Title: {context.title}
Description: {context.description}
Intent: {context.intent}
Priority: {context.priority}

Provide an architectural plan with:
1. Design decisions
2. Implementation steps
3. Files to modify
4. Risks and mitigations"""

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4096
            )

            content = response.choices[0].message.content
            generation_time = (datetime.now() - start_time).total_seconds()

            return PlannerResult(
                planner_type=self.planner_type,
                success=True,
                plan_steps=self._parse_steps(content),
                files_to_modify=self._parse_files(content),
                confidence=0.85,
                reasoning=content,
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

    def _parse_steps(self, content: str) -> list:
        """Parse implementation steps from response."""
        steps = []
        for line in content.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-')):
                steps.append(line.lstrip('0123456789.-) '))
        return steps[:10] if steps else ["Review and implement changes"]

    def _parse_files(self, content: str) -> list:
        """Parse file paths from response."""
        files = []
        for word in content.split():
            if '/' in word and ('.' in word or word.endswith('/')):
                clean = word.strip('`"\'(),')
                if clean and not clean.startswith('http'):
                    files.append(clean)
        return list(set(files))[:10]


# Standard I/O Pattern compliance
if __name__ == "__main__":
    planner = ComplexPlanner()
    print("SUCCESS: complex_planner module loaded")
    print(f"Model: {planner.model_name}")
    print(f"OpenAI available: {OPENAI_AVAILABLE}")
    print(f"Client configured: {planner.client is not None}")
