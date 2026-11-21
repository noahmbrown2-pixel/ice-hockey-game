#!/usr/bin/env python3
"""
Code Planner - DeepSeek R1 for code-focused planning.
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


class CodePlanner(BasePlanner):
    """
    Code-focused planner using DeepSeek R1.
    """

    SYSTEM_PROMPT = """You are an expert programmer. Provide detailed code-level plans
for implementations. Focus on:
- Specific code changes
- Function signatures
- Data structures
- Code organization patterns"""

    DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"

    def __init__(self, model: str = "deepseek-reasoner"):
        super().__init__(PlannerType.CODE)
        self.model_name = model
        self.client = None
        if OPENAI_AVAILABLE:
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if api_key:
                self.client = OpenAI(
                    api_key=api_key,
                    base_url=self.DEEPSEEK_BASE_URL
                )

    def plan(self, context: EnhancementContext) -> PlannerResult:
        """Generate code-focused plan using DeepSeek."""
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
                    "Define function signatures",
                    "Create data models",
                    "Implement core algorithm",
                    "Add error handling",
                    "Write test cases"
                ],
                files_to_modify=["src/core.py", "tests/test_core.py"],
                confidence=0.72,
                reasoning="Mock plan - DeepSeek API not configured",
                model_used="mock"
            )

        try:
            prompt = f"""{self.SYSTEM_PROMPT}

Enhancement: {context.title}
Description: {context.description}
Related Files: {', '.join(context.related_files) if context.related_files else 'None'}

Provide specific code changes needed."""

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4096
            )

            content = response.choices[0].message.content
            generation_time = (datetime.now() - start_time).total_seconds()

            return PlannerResult(
                planner_type=self.planner_type,
                success=True,
                plan_steps=self._parse_code_steps(content),
                files_to_modify=self._parse_files(content),
                confidence=0.82,
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

    def _parse_code_steps(self, content: str) -> list:
        """Parse code-focused steps."""
        steps = []
        for line in content.split('\n'):
            line = line.strip()
            if line and len(line) > 10:
                if line[0].isdigit() or line.startswith('-'):
                    steps.append(line.lstrip('0123456789.-) '))
        return steps[:12] if steps else ["Implement code changes"]

    def _parse_files(self, content: str) -> list:
        """Parse file paths from code response."""
        import re
        patterns = [
            r'`([^`]+\.py)`',
            r'"([^"]+\.py)"',
            r'([a-zA-Z_/]+\.py)'
        ]
        files = []
        for pattern in patterns:
            files.extend(re.findall(pattern, content))
        return list(set(files))[:10]


# Standard I/O Pattern compliance
if __name__ == "__main__":
    planner = CodePlanner()
    print("SUCCESS: code_planner module loaded")
    print(f"Model: {planner.model_name}")
    print(f"DeepSeek base URL: {planner.DEEPSEEK_BASE_URL}")
    print(f"Client configured: {planner.client is not None}")
