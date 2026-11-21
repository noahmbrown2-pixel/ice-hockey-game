#!/usr/bin/env python3
"""
Enhancement Pipeline - Main orchestrator for the enhancement workflow.
"""

import sys
import time
import uuid
from pathlib import Path
from typing import Optional
from datetime import datetime

# Add parent paths
sys.path.insert(0, str(Path(__file__).parent.parent))

from enhancement_pipeline.state.workflow_state import (
    WorkflowState, PipelineStage, StateManager
)
from enhancement_pipeline.approval.auto_approve import AutoApprover, ApprovalStatus
from enhancement_pipeline.approval.human_gate import HumanGate

# Import sibling skills
try:
    from multi_model_planner.scripts.run_planners import PlannerCoordinator
    from multi_model_planner.planners.base_planner import EnhancementContext
    from zte_bridge.zte_client import ZTEClient
    from zte_bridge.issue_formatter import IssueFormatter, IssueType
    SKILLS_AVAILABLE = True
except ImportError:
    SKILLS_AVAILABLE = False


class EnhancementPipeline:
    """
    Orchestrate the full enhancement pipeline.

    Stages:
    1. Request → Process incoming request
    2. Context → Load memory and codebase context
    3. Plan → Multi-model planning
    4. Approve → Auto or human approval
    5. Issue → Create GitHub issue
    6. ZTE → Execute ZTE pipeline
    7. Track → Monitor completion
    """

    def __init__(self):
        self.state_manager = StateManager()
        self.auto_approver = AutoApprover()
        self.human_gate = HumanGate()

        if SKILLS_AVAILABLE:
            self.planner = PlannerCoordinator()
            self.zte_client = ZTEClient()
            self.issue_formatter = IssueFormatter()
        else:
            self.planner = None
            self.zte_client = None
            self.issue_formatter = None

    def start_workflow(
        self,
        source: str,
        source_id: str,
        title: str,
        description: str,
        intent: str,
        priority: str = "medium"
    ) -> WorkflowState:
        """
        Start a new enhancement workflow.

        Args:
            source: Request source (notion, github, tb, email)
            source_id: ID from source system
            title: Enhancement title
            description: Description
            intent: Intent type (/feature, /bug, etc.)
            priority: Priority level

        Returns:
            Initial WorkflowState
        """
        workflow_id = f"wf-{uuid.uuid4().hex[:8]}"

        state = WorkflowState(
            workflow_id=workflow_id,
            request_source=source,
            request_id=source_id,
            title=title,
            description=description,
            intent=intent,
            priority=priority
        )

        self.state_manager.save(state)
        return state

    def run(self, state: WorkflowState) -> WorkflowState:
        """
        Run the pipeline for a workflow.

        Args:
            state: Current workflow state

        Returns:
            Updated workflow state
        """
        try:
            # Stage 1: Context loading
            state = self._stage_context(state)
            if state.stage == PipelineStage.FAILED:
                return state

            # Stage 2: Planning
            state = self._stage_plan(state)
            if state.stage == PipelineStage.FAILED:
                return state

            # Stage 3: Approval
            state = self._stage_approve(state)
            if state.stage in [PipelineStage.FAILED, PipelineStage.REJECTED,
                               PipelineStage.AWAITING_APPROVAL]:
                return state

            # Stage 4: Issue creation
            state = self._stage_issue(state)
            if state.stage == PipelineStage.FAILED:
                return state

            # Stage 5: ZTE execution
            state = self._stage_zte(state)

            return state

        except Exception as e:
            state.fail(str(e))
            self.state_manager.save(state)
            return state

    def _stage_context(self, state: WorkflowState) -> WorkflowState:
        """Load context for planning."""
        state.advance_to(PipelineStage.CONTEXT_LOADING)
        self.state_manager.save(state)

        # Context loading would use memory-orchestrator here
        # For now, advance to loaded state

        state.advance_to(PipelineStage.CONTEXT_LOADED)
        self.state_manager.save(state)
        return state

    def _stage_plan(self, state: WorkflowState) -> WorkflowState:
        """Execute multi-model planning."""
        state.advance_to(PipelineStage.PLANNING)
        self.state_manager.save(state)

        if not self.planner:
            # Mock planning without skill
            state.plan_steps = [
                "Analyze requirements",
                "Design implementation",
                "Write code",
                "Add tests",
                "Update documentation"
            ]
            state.confidence = 0.75
            state.advance_to(PipelineStage.PLAN_READY)
            self.state_manager.save(state)
            return state

        context = EnhancementContext(
            title=state.title,
            description=state.description,
            intent=state.intent,
            priority=state.priority
        )

        result = self.planner.plan_with_consensus(context)

        if result.success:
            state.plan_steps = result.unified_steps
            state.files_to_modify = result.all_files
            state.confidence = result.confidence
            state.advance_to(PipelineStage.PLAN_READY)
        else:
            state.fail("Planning failed")

        self.state_manager.save(state)
        return state

    def _stage_approve(self, state: WorkflowState) -> WorkflowState:
        """Handle approval (auto or human)."""
        decision = self.auto_approver.evaluate(
            confidence=state.confidence,
            intent=state.intent,
            priority=state.priority
        )

        if decision.status == ApprovalStatus.AUTO_APPROVED:
            state.advance_to(PipelineStage.APPROVED)
            state.metadata['approval'] = 'auto'
        else:
            state.advance_to(PipelineStage.AWAITING_APPROVAL)
            # Request human approval
            self.human_gate.request_approval(
                workflow_id=state.workflow_id,
                title=state.title,
                summary=state.description,
                plan_steps=state.plan_steps,
                confidence=state.confidence
            )

        self.state_manager.save(state)
        return state

    def _stage_issue(self, state: WorkflowState) -> WorkflowState:
        """Create GitHub issue."""
        state.advance_to(PipelineStage.ISSUE_CREATING)
        self.state_manager.save(state)

        if not self.issue_formatter:
            state.github_issue_number = 0  # Mock
            state.advance_to(PipelineStage.ISSUE_CREATED)
            self.state_manager.save(state)
            return state

        intent_map = {
            "/feature": IssueType.FEATURE,
            "/bug": IssueType.BUG,
            "/chore": IssueType.CHORE,
            "/enhancement": IssueType.ENHANCEMENT,
        }

        formatted = self.issue_formatter.format_issue(
            title=state.title,
            description=state.description,
            plan_steps=state.plan_steps,
            files=state.files_to_modify,
            acceptance_criteria=["Implementation complete", "Tests pass"],
            issue_type=intent_map.get(state.intent, IssueType.ENHANCEMENT),
            confidence=state.confidence
        )

        issue_number = self.issue_formatter.create_issue(formatted)
        if issue_number:
            state.github_issue_number = issue_number
            state.advance_to(PipelineStage.ISSUE_CREATED)
        else:
            state.fail("Failed to create GitHub issue")

        self.state_manager.save(state)
        return state

    def _stage_zte(self, state: WorkflowState) -> WorkflowState:
        """Execute ZTE pipeline."""
        if not state.github_issue_number:
            state.fail("No issue number for ZTE")
            self.state_manager.save(state)
            return state

        state.advance_to(PipelineStage.ZTE_EXECUTING)
        self.state_manager.save(state)

        if not self.zte_client:
            # Mock ZTE
            state.advance_to(PipelineStage.COMPLETED)
            self.state_manager.save(state)
            return state

        result = self.zte_client.execute(state.github_issue_number)

        if result.success:
            state.pr_url = result.pr_url
            state.advance_to(PipelineStage.COMPLETED)
        else:
            state.fail(result.error_message or "ZTE execution failed")

        self.state_manager.save(state)
        return state

    def run_daemon(self, poll_interval: int = 60):
        """
        Run as background daemon.

        Args:
            poll_interval: Seconds between checks
        """
        print(f"Starting enhancement pipeline daemon (interval: {poll_interval}s)")

        while True:
            # Process active workflows
            for state in self.state_manager.list_active():
                if state.stage == PipelineStage.AWAITING_APPROVAL:
                    # Check for approval responses
                    response = self.human_gate.check_response(
                        state.metadata.get('approval_request_id', '')
                    )
                    if response == "approved":
                        state.advance_to(PipelineStage.APPROVED)
                        self.state_manager.save(state)
                        self.run(state)
                    elif response == "rejected":
                        state.advance_to(PipelineStage.REJECTED)
                        self.state_manager.save(state)

            time.sleep(poll_interval)


# Standard I/O Pattern compliance
if __name__ == "__main__":
    pipeline = EnhancementPipeline()
    print("SUCCESS: pipeline module loaded")
    print(f"Skills available: {SKILLS_AVAILABLE}")
    print(f"Stages: {len(PipelineStage)}")

    # Test workflow creation
    state = pipeline.start_workflow(
        source="test",
        source_id="test-1",
        title="Test Enhancement",
        description="A test enhancement request",
        intent="/feature",
        priority="medium"
    )
    print(f"\nTest workflow created: {state.workflow_id}")
    print(f"Initial stage: {state.stage.value}")
