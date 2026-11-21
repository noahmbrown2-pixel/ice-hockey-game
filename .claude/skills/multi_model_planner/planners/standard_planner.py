#!/usr/bin/env python3
"""
Standard Planner - Gemini 2.0 Flash for implementation planning.
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
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class StandardPlanner(BasePlanner):
    """
    Standard planner using Google Gemini for implementation plans.
    """

    SYSTEM_PROMPT = """You are an implementation specialist. Create detailed,
actionable implementation plans for software enhancements. Focus on:
- Concrete implementation steps
- Code organization
- Testing strategy
- Integration points"""

    def __init__(self, model: str = "gemini-2.0-flash"):
        super().__init__(PlannerType.STANDARD)
        self.model_name = model
        self.model = None
        if GEMINI_AVAILABLE:
            api_key = os.getenv("GOOGLE_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                try:
                    self.model = genai.GenerativeModel(model)
                except Exception:
                    # Fallback to older model
                    self.model = genai.GenerativeModel("gemini-1.5-flash")

    def plan(self, context: EnhancementContext) -> PlannerResult:
        """Generate implementation plan using Gemini."""
        start_time = datetime.now()

        if not self.validate_context(context):
            return PlannerResult(
                planner_type=self.planner_type,
                success=False,
                error="Invalid context"
            )

        if not self.model:
            return PlannerResult(
                planner_type=self.planner_type,
                success=True,
                plan_steps=[
                    "Set up development environment",
                    "Create feature branch",
                    "Implement core logic",
                    "Write unit tests",
                    "Run integration tests",
                    "Submit for review"
                ],
                confidence=0.70,
                reasoning="Mock plan - Gemini API not configured",
                model_used="mock"
            )

        try:
            prompt = f"""{self.SYSTEM_PROMPT}

Enhancement: {context.title}
Description: {context.description}
Type: {context.intent}

Create a step-by-step implementation plan."""

            response = self.model.generate_content(prompt)
            content = response.text
            generation_time = (datetime.now() - start_time).total_seconds()

            return PlannerResult(
                planner_type=self.planner_type,
                success=True,
                plan_steps=self._parse_steps(content),
                files_to_modify=self._parse_files(content),
                confidence=0.80,
                reasoning=content,
                model_used=self.model_name,
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
        """Parse steps from response."""
        steps = []
        for line in content.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('*')):
                steps.append(line.lstrip('0123456789.-*)# '))
        return steps[:10] if steps else ["Implement requested changes"]

    def _parse_files(self, content: str) -> list:
        """Parse file references."""
        import re
        files = re.findall(r'`([^`]+\.[a-z]+)`', content)
        return list(set(files))[:10]


# Standard I/O Pattern compliance
if __name__ == "__main__":
    planner = StandardPlanner()
    print("SUCCESS: standard_planner module loaded")
    print(f"Model: {planner.model_name}")
    print(f"Gemini available: {GEMINI_AVAILABLE}")
    print(f"Model configured: {planner.model is not None}")
