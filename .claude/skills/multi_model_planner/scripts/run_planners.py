#!/usr/bin/env python3
"""
Run Planners - Coordinate parallel execution of multiple planners.
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Optional
from dataclasses import dataclass
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from planners.base_planner import EnhancementContext, PlannerResult, PlannerType
from planners.complex_planner import ComplexPlanner
from planners.standard_planner import StandardPlanner
from planners.code_planner import CodePlanner
from planners.analysis_planner import AnalysisPlanner
from consensus.builder import ConsensusBuilder, ConsensusResult


@dataclass
class PlanningConfig:
    """Configuration for planning execution."""
    use_complex: bool = True
    use_standard: bool = True
    use_code: bool = True
    use_analysis: bool = False  # Only for large context
    max_workers: int = 4
    auto_consensus: bool = True


class PlannerCoordinator:
    """
    Coordinates multiple planners and builds consensus.
    """

    INTENT_PLANNERS = {
        "/feature": [PlannerType.COMPLEX, PlannerType.STANDARD, PlannerType.CODE],
        "/bug": [PlannerType.CODE, PlannerType.STANDARD],
        "/chore": [PlannerType.STANDARD],
        "/enhancement": [PlannerType.COMPLEX, PlannerType.STANDARD, PlannerType.CODE, PlannerType.ANALYSIS],
    }

    def __init__(self, config: Optional[PlanningConfig] = None):
        self.config = config or PlanningConfig()
        self.planners = self._init_planners()
        self.consensus_builder = ConsensusBuilder()

    def _init_planners(self) -> Dict[PlannerType, object]:
        """Initialize available planners."""
        planners = {}
        if self.config.use_complex:
            planners[PlannerType.COMPLEX] = ComplexPlanner()
        if self.config.use_standard:
            planners[PlannerType.STANDARD] = StandardPlanner()
        if self.config.use_code:
            planners[PlannerType.CODE] = CodePlanner()
        if self.config.use_analysis:
            planners[PlannerType.ANALYSIS] = AnalysisPlanner()
        return planners

    def run_parallel(
        self,
        context: EnhancementContext,
        planner_types: Optional[List[PlannerType]] = None
    ) -> List[PlannerResult]:
        """
        Run planners in parallel.

        Args:
            context: Enhancement context
            planner_types: Optional specific planners to run

        Returns:
            List of planner results
        """
        if planner_types is None:
            planner_types = self.INTENT_PLANNERS.get(
                context.intent,
                [PlannerType.STANDARD]
            )

        # Filter to available planners
        available = [pt for pt in planner_types if pt in self.planners]

        results = []
        with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            futures = {
                executor.submit(self.planners[pt].plan, context): pt
                for pt in available
            }

            for future in futures:
                try:
                    result = future.result(timeout=120)
                    results.append(result)
                except Exception as e:
                    results.append(PlannerResult(
                        planner_type=futures[future],
                        success=False,
                        error=str(e)
                    ))

        return results

    def plan_with_consensus(
        self,
        context: EnhancementContext
    ) -> ConsensusResult:
        """
        Run planners and build consensus.

        Args:
            context: Enhancement context

        Returns:
            ConsensusResult with unified plan
        """
        results = self.run_parallel(context)
        return self.consensus_builder.build_consensus(results)


# Standard I/O Pattern compliance
if __name__ == "__main__":
    coordinator = PlannerCoordinator()
    print("SUCCESS: run_planners module loaded")
    print(f"Available planners: {list(coordinator.planners.keys())}")
    print(f"Intent mappings: {list(coordinator.INTENT_PLANNERS.keys())}")

    # Test with mock context
    context = EnhancementContext(
        title="Test Enhancement",
        description="A test enhancement request",
        intent="/feature"
    )
    print(f"Test context created: {context.title}")
