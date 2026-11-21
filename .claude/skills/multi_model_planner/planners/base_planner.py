#!/usr/bin/env python3
"""
Base Planner - Abstract interface for multi-model planners.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class PlannerType(Enum):
    """Types of planners."""
    COMPLEX = "complex"      # O3/O1 - Architectural
    STANDARD = "standard"    # Gemini 2.0 - Implementation
    CODE = "code"            # DeepSeek R1 - Code-focused
    ANALYSIS = "analysis"    # Grok-4 - Large context


@dataclass
class EnhancementContext:
    """Context for enhancement planning."""
    title: str
    description: str
    intent: str  # /feature, /bug, /chore, /enhancement
    priority: str = "medium"
    repository: str = "craigmbrown/ETAC-System"
    related_files: List[str] = field(default_factory=list)
    codebase_context: str = ""
    constraints: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class PlannerResult:
    """Result from a planner."""
    planner_type: PlannerType
    success: bool
    plan_steps: List[str] = field(default_factory=list)
    files_to_modify: List[str] = field(default_factory=list)
    confidence: float = 0.0
    reasoning: str = ""
    estimated_complexity: str = "medium"
    risks: List[str] = field(default_factory=list)
    error: Optional[str] = None
    model_used: str = ""
    tokens_used: int = 0
    generation_time: float = 0.0


class BasePlanner(ABC):
    """Abstract base class for planners."""

    def __init__(self, planner_type: PlannerType):
        self.planner_type = planner_type
        self.model_name = ""

    @abstractmethod
    def plan(self, context: EnhancementContext) -> PlannerResult:
        """Generate a plan for the enhancement."""
        pass

    def validate_context(self, context: EnhancementContext) -> bool:
        """Validate that context has required fields."""
        return bool(context.title and context.description)


# Standard I/O Pattern compliance
if __name__ == "__main__":
    print("SUCCESS: base_planner module loaded")
    print(f"Planner types: {[p.value for p in PlannerType]}")
    print(f"EnhancementContext fields: {len(EnhancementContext.__dataclass_fields__)}")
    print(f"PlannerResult fields: {len(PlannerResult.__dataclass_fields__)}")
