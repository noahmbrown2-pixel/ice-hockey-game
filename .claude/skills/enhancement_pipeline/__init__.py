"""
Enhancement Pipeline - End-to-end orchestration for enhancements.
"""

from .state.workflow_state import WorkflowState, PipelineStage, StateManager
from .approval.auto_approve import AutoApprover, ApprovalDecision
from .approval.human_gate import HumanGate
from .pipeline import EnhancementPipeline

__all__ = [
    'WorkflowState', 'PipelineStage', 'StateManager',
    'AutoApprover', 'ApprovalDecision', 'HumanGate',
    'EnhancementPipeline'
]
__version__ = '1.0.0'
