#!/usr/bin/env python3
"""
BLP Capabilities for Golden Agents
@requirement: REQ-GA-004 - BLP Properties integration for golden standard agents
@component: Golden Agent BLP Integration Layer

This module provides real, executable BLP capabilities for golden agents.
Import from strategic_platform/core/blp/ and provide agent-specific wrappers.

Usage:
    from blp_capabilities import GoldenBLPAgent, create_golden_agent

    # Create an agent with full BLP capabilities
    agent = create_golden_agent(
        agent_id="agent-core-codebase-analyzer-ga001",
        category="core",
        name="codebase-analyzer"
    )

    # Use BLP capabilities
    if agent.is_action_safe(action):
        agent.execute_with_accountability(action, reasoning="User requested analysis")
"""

import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List, Callable
from dataclasses import dataclass, field

# Add strategic_platform to path for BLP imports
STRATEGIC_PLATFORM_PATH = Path("/home/craigmbrown/Project/strategic_platform")
if str(STRATEGIC_PLATFORM_PATH) not in sys.path:
    sys.path.insert(0, str(STRATEGIC_PLATFORM_PATH))

# Import BLP implementations
from core.blp import (
    # Safety & Alignment
    SafetyMonitor, SafetyConstraint, Action,
    EthicalFramework, EthicalPrinciple, Scenario,
    AccountabilityModule, ActionRecord,
    ManipulationRobustness, TrustScore, Input,
    AutonomyController, AutonomyLevel, ActionRequest,
    # Transparency & Value Learning
    TransparencyProvider, Decision,
    GoalAlignment, Goal, HumanValues,
    # Self-Replication
    EvolutionaryReplicator, AgentPhenotype,
)

# Import BLPAgent from integration layer
from core.blp.blp_integration import BLPAgent, BLPUsageEvent, create_blp_agent


@dataclass
class GoldenAgentConfig:
    """Configuration for a Golden Standard Agent"""
    agent_id: str
    category: str
    name: str
    blp_properties: List[str] = field(default_factory=lambda: ["A", "AU", "D", "SI", "SR", "SO"])
    security_level: str = "INTERNAL"
    llm_router_enabled: bool = True
    camel_security_enabled: bool = True
    nostr_pubkey: Optional[str] = None
    payment_enabled: bool = False


class GoldenBLPAgent(BLPAgent):
    """
    Golden Standard Agent with full BLP capabilities.

    Extends BLPAgent with golden agent-specific features:
    - REQ tag tracking
    - Nostr identity support
    - LLM Router integration hooks
    - CaMel security integration

    Usage:
        agent = GoldenBLPAgent(
            agent_id="agent-core-codebase-analyzer-ga001",
            config=GoldenAgentConfig(...)
        )

        # Check safety before any action
        if agent.is_action_safe(action):
            result = agent.execute_safely(action, reasoning="User request")
    """

    def __init__(self, agent_id: str, config: Optional[GoldenAgentConfig] = None):
        super().__init__(agent_id)

        self.config = config or GoldenAgentConfig(
            agent_id=agent_id,
            category="core",
            name=agent_id.split("-")[-2] if "-" in agent_id else agent_id
        )

        # Golden agent specific tracking
        self.req_coverage: Dict[str, bool] = {
            "REQ-GA-001": True,  # Usage recommendations (template)
            "REQ-GA-002": True,  # Error handling
            "REQ-GA-003": True,  # REQ tags
            "REQ-GA-004": True,  # BLP properties (this integration)
            "REQ-GA-005": self.config.llm_router_enabled,
            "REQ-GA-006": self.config.camel_security_enabled,
            "REQ-GA-007": True,  # Persistent ID
            "REQ-GA-008": self.config.payment_enabled,
            "REQ-GA-009": True,  # Integration points
            "REQ-GA-010": True,  # Standard I/O
        }

        # Add golden agent safety constraints
        self._add_golden_safety_constraints()

        # Add golden agent ethical principles
        self._add_golden_ethical_principles()

        print(f"✅ GoldenBLPAgent '{agent_id}' initialized")
        print(f"   Category: {self.config.category}")
        print(f"   BLP Properties: {', '.join(self.config.blp_properties)}")
        print(f"   REQ Coverage: {self.get_req_coverage_percent()}%")

    def _add_golden_safety_constraints(self):
        """Add golden agent-specific safety constraints"""

        # Constraint: Respect read-only agents
        if self.config.category in ["core", "research"]:
            self.safety_monitor.add_constraint(SafetyConstraint(
                name="read_only_constraint",
                validator=lambda a: not any(word in a.description.lower()
                                           for word in ["write", "modify", "delete", "create"])
            ))

        # Constraint: Rate limiting for external APIs
        self.safety_monitor.add_constraint(SafetyConstraint(
            name="api_rate_limit",
            validator=lambda a: a.parameters.get("api_calls", 0) < 100
        ))

    def _add_golden_ethical_principles(self):
        """Add golden agent-specific ethical principles"""

        # Principle: User privacy
        self.ethics.add_principle(EthicalPrinciple(
            id="user_privacy",
            description="Protect user data and privacy",
            evaluator=lambda data: 0.9 if not data.get("exposes_pii", False) else -1.0
        ))

        # Principle: Resource efficiency
        self.ethics.add_principle(EthicalPrinciple(
            id="resource_efficiency",
            description="Use compute resources efficiently",
            evaluator=lambda data: 0.8 if data.get("token_count", 0) < 100000 else 0.2
        ))

    def is_action_safe(self, action: Action) -> bool:
        """Check if an action passes all safety constraints"""
        return self.safety_monitor.is_action_safe(action)

    def execute_with_accountability(self, action: Action, reasoning: str) -> Dict[str, Any]:
        """Execute action with full BLP validation and accountability tracking"""

        # Use parent's execute_safely which does full BLP validation
        result = self.execute_safely(action, reasoning)

        # Track for golden agent metrics
        if result.get("executed", False):
            self._track_event(
                property_id="GA-BLP",
                category=self.config.category,
                action="golden_agent_execution",
                success=True,
                details={
                    "agent_id": self.agent_id,
                    "action_id": action.id,
                    "reasoning": reasoning
                }
            )

        return result

    def get_req_coverage_percent(self) -> float:
        """Calculate REQ coverage percentage"""
        met = sum(1 for v in self.req_coverage.values() if v)
        return round(met / len(self.req_coverage) * 100, 1)

    def get_blp_status(self) -> Dict[str, Any]:
        """Get current BLP capability status"""
        return {
            "agent_id": self.agent_id,
            "category": self.config.category,
            "blp_properties": self.config.blp_properties,
            "safety_constraints": len(self.safety_monitor.constraints) if hasattr(self.safety_monitor, 'constraints') else 0,
            "ethical_principles": len(self.ethics.principles) if hasattr(self.ethics, 'principles') else 0,
            "autonomy_level": self.autonomy_controller.current_level if hasattr(self.autonomy_controller, 'current_level') else 2,
            "usage_events": len(self.usage_events),
            "req_coverage": self.get_req_coverage_percent()
        }


def create_golden_agent(
    agent_id: str,
    category: str = "core",
    name: str = "default",
    custom_constraints: Optional[List[SafetyConstraint]] = None,
    custom_principles: Optional[List[EthicalPrinciple]] = None,
    payment_enabled: bool = False
) -> GoldenBLPAgent:
    """
    Factory function to create a Golden BLP Agent.

    Args:
        agent_id: Unique identifier (e.g., "agent-core-codebase-analyzer-ga001")
        category: Agent category (core, research, workflow, crypto, etc.)
        name: Agent name
        custom_constraints: Additional safety constraints
        custom_principles: Additional ethical principles
        payment_enabled: Enable Nostr payment identity

    Returns:
        Configured GoldenBLPAgent

    Example:
        agent = create_golden_agent(
            agent_id="agent-research-intelligence-synthesizer-ga002",
            category="research",
            name="intelligence-synthesizer",
            custom_constraints=[
                SafetyConstraint(name="custom", validator=lambda a: True)
            ]
        )
    """
    config = GoldenAgentConfig(
        agent_id=agent_id,
        category=category,
        name=name,
        payment_enabled=payment_enabled
    )

    agent = GoldenBLPAgent(agent_id, config)

    if custom_constraints:
        for constraint in custom_constraints:
            agent.safety_monitor.add_constraint(constraint)

    if custom_principles:
        for principle in custom_principles:
            agent.ethics.add_principle(principle)

    return agent


# Convenience imports for golden agents
__all__ = [
    # Main classes
    'GoldenBLPAgent',
    'GoldenAgentConfig',
    'create_golden_agent',

    # BLP primitives (re-exported)
    'SafetyMonitor', 'SafetyConstraint', 'Action',
    'EthicalFramework', 'EthicalPrinciple', 'Scenario',
    'AccountabilityModule', 'ActionRecord',
    'ManipulationRobustness', 'TrustScore', 'Input',
    'AutonomyController', 'AutonomyLevel', 'ActionRequest',
    'TransparencyProvider', 'Decision',
    'GoalAlignment', 'Goal', 'HumanValues',
    'EvolutionaryReplicator', 'AgentPhenotype',

    # Usage event tracking
    'BLPUsageEvent',
]


if __name__ == "__main__":
    # Demo: Create and test a golden agent
    print("=" * 60)
    print("Golden BLP Agent Demo")
    print("=" * 60)

    # Create agent
    agent = create_golden_agent(
        agent_id="agent-demo-test-agent-ga999",
        category="demo",
        name="test-agent"
    )

    # Create a test action
    test_action = Action(
        id="demo-action-001",
        description="Analyze codebase structure",
        parameters={"target": "/home/craigmbrown/Project", "read_only": True}
    )

    # Check if action is safe
    print(f"\n🔍 Testing action: {test_action.description}")
    is_safe = agent.is_action_safe(test_action)
    print(f"   Safe: {is_safe}")

    # Execute with accountability
    if is_safe:
        result = agent.execute_with_accountability(
            test_action,
            reasoning="Demo execution to test BLP integration"
        )
        print(f"   Executed: {result['executed']}")
        print(f"   Reason: {result['reason']}")

    # Show BLP status
    print(f"\n📊 BLP Status:")
    status = agent.get_blp_status()
    for key, value in status.items():
        print(f"   {key}: {value}")

    print("\n✅ Golden BLP Agent Demo Complete")
