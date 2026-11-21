#!/usr/bin/env python3
"""
Scheduled Workflow Engine - Dependency Graph Resolver
PLAN-ID: PLAN-WKFL-026

REQ-WKFL-026-003: DAG-based dependency graph validation and execution ordering

BLP Properties:
- BLP-025: Stable multi-agent coordination mechanisms
- BLP-028: Distributed task coordination via dependencies
- BLP-029: Resource allocation optimization

Author: Craig Brown
Created: 2025-12-29
"""

import logging
from typing import Dict, List, Set, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, deque
from datetime import datetime

logger = logging.getLogger("workflow-scheduler.dependency")


class DependencyType(Enum):
    """Types of workflow dependencies"""
    REQUIRED = "required"      # Must complete successfully
    OPTIONAL = "optional"      # Preferred but not required
    CONDITIONAL = "conditional"  # Depends on output condition


class DependencyStatus(Enum):
    """Status of a dependency check"""
    SATISFIED = "satisfied"
    PENDING = "pending"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class Dependency:
    """
    REQ-WKFL-026-003: Workflow dependency definition

    BLP-028: Dependency specification
    """
    source_id: str            # Workflow that must complete first
    target_id: str            # Workflow that depends on source
    dependency_type: DependencyType = DependencyType.REQUIRED
    condition: Optional[str] = None  # Condition expression for conditional deps
    timeout_seconds: int = 3600      # Max wait time for dependency
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DependencyNode:
    """
    REQ-WKFL-026-003: Node in dependency graph

    BLP-025: Graph node representation
    """
    workflow_id: str
    workflow_name: str
    dependencies: Set[str] = field(default_factory=set)
    dependents: Set[str] = field(default_factory=set)
    execution_status: Optional[str] = None
    last_execution_time: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class CircularDependencyError(Exception):
    """Raised when circular dependencies are detected"""
    def __init__(self, cycle: List[str]):
        self.cycle = cycle
        super().__init__(f"Circular dependency detected: {' -> '.join(cycle)}")


class DependencyNotFoundError(Exception):
    """Raised when a dependency reference doesn't exist"""
    pass


class DependencyResolver:
    """
    REQ-WKFL-026-003: DAG-based dependency graph resolver

    Implements topological sorting and cycle detection for workflow dependencies.

    BLP Properties:
    - BLP-025: Stable coordination via validated dependency graphs
    - BLP-028: Distributed task coordination
    - BLP-029: Optimized execution ordering
    """

    def __init__(self):
        """Initialize the dependency resolver"""
        self.nodes: Dict[str, DependencyNode] = {}
        self.dependencies: List[Dependency] = []
        self._adjacency_list: Dict[str, Set[str]] = defaultdict(set)
        self._reverse_adjacency: Dict[str, Set[str]] = defaultdict(set)

        logger.info("DependencyResolver initialized")

    def add_workflow(
        self,
        workflow_id: str,
        workflow_name: str,
        dependencies: Optional[List[str]] = None,
        metadata: Optional[Dict] = None
    ) -> DependencyNode:
        """
        REQ-WKFL-026-003: Add a workflow to the dependency graph

        BLP-028: Register workflow node

        Args:
            workflow_id: Unique workflow identifier
            workflow_name: Human-readable name
            dependencies: List of workflow IDs this depends on
            metadata: Additional metadata

        Returns:
            Created DependencyNode
        """
        node = DependencyNode(
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            dependencies=set(dependencies or []),
            metadata=metadata or {}
        )

        self.nodes[workflow_id] = node

        # Update adjacency lists
        for dep_id in node.dependencies:
            self._adjacency_list[dep_id].add(workflow_id)
            self._reverse_adjacency[workflow_id].add(dep_id)

            # Create dependency record
            self.dependencies.append(Dependency(
                source_id=dep_id,
                target_id=workflow_id
            ))

        logger.debug(f"Added workflow {workflow_id} with {len(node.dependencies)} dependencies")
        return node

    def remove_workflow(self, workflow_id: str) -> bool:
        """
        Remove a workflow from the dependency graph

        Args:
            workflow_id: Workflow to remove

        Returns:
            True if removed, False if not found
        """
        if workflow_id not in self.nodes:
            return False

        node = self.nodes[workflow_id]

        # Clean up adjacency lists
        for dep_id in node.dependencies:
            self._adjacency_list[dep_id].discard(workflow_id)

        for dependent_id in node.dependents:
            self._reverse_adjacency[dependent_id].discard(workflow_id)

        # Remove from nodes
        del self.nodes[workflow_id]

        # Remove related dependencies
        self.dependencies = [
            d for d in self.dependencies
            if d.source_id != workflow_id and d.target_id != workflow_id
        ]

        logger.debug(f"Removed workflow {workflow_id}")
        return True

    def validate_graph(self) -> Tuple[bool, Optional[str]]:
        """
        REQ-WKFL-026-003: Validate the dependency graph for consistency

        BLP-025: Ensure graph is a valid DAG

        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check for missing dependencies
            for workflow_id, node in self.nodes.items():
                for dep_id in node.dependencies:
                    if dep_id not in self.nodes:
                        return False, f"Workflow {workflow_id} depends on non-existent workflow {dep_id}"

            # Check for circular dependencies
            self.check_circular_dependencies()

            return True, None

        except CircularDependencyError as e:
            return False, str(e)
        except Exception as e:
            return False, f"Validation error: {str(e)}"

    def check_circular_dependencies(self) -> bool:
        """
        REQ-WKFL-026-003: Detect circular dependencies using DFS

        BLP-025: Cycle detection

        Raises:
            CircularDependencyError if cycles detected

        Returns:
            True if no cycles found
        """
        # Track visited and recursion stack
        visited: Set[str] = set()
        rec_stack: Set[str] = set()
        path: List[str] = []

        def dfs(node_id: str) -> bool:
            visited.add(node_id)
            rec_stack.add(node_id)
            path.append(node_id)

            # Check all dependents
            for dependent_id in self._adjacency_list.get(node_id, set()):
                if dependent_id not in visited:
                    if dfs(dependent_id):
                        return True
                elif dependent_id in rec_stack:
                    # Found cycle - construct cycle path
                    cycle_start = path.index(dependent_id)
                    cycle = path[cycle_start:] + [dependent_id]
                    raise CircularDependencyError(cycle)

            path.pop()
            rec_stack.discard(node_id)
            return False

        # Run DFS from each unvisited node
        for node_id in self.nodes:
            if node_id not in visited:
                dfs(node_id)

        return True

    def resolve_execution_order(
        self,
        workflow_ids: Optional[List[str]] = None
    ) -> List[str]:
        """
        REQ-WKFL-026-003: Resolve execution order using topological sort

        BLP-029: Optimized execution ordering

        Args:
            workflow_ids: Specific workflows to order (None = all)

        Returns:
            List of workflow IDs in execution order
        """
        # Validate graph first
        is_valid, error = self.validate_graph()
        if not is_valid:
            raise ValueError(f"Invalid dependency graph: {error}")

        # Determine scope
        if workflow_ids:
            scope = set(workflow_ids)
            # Include all dependencies
            scope = self._get_dependency_closure(scope)
        else:
            scope = set(self.nodes.keys())

        # Kahn's algorithm for topological sort
        in_degree: Dict[str, int] = defaultdict(int)
        for node_id in scope:
            in_degree[node_id] = 0

        for node_id in scope:
            node = self.nodes.get(node_id)
            if node:
                for dep_id in node.dependencies:
                    if dep_id in scope:
                        in_degree[node_id] += 1

        # Start with nodes that have no dependencies
        queue = deque([
            node_id for node_id in scope
            if in_degree[node_id] == 0
        ])

        result: List[str] = []

        while queue:
            node_id = queue.popleft()
            result.append(node_id)

            # Reduce in-degree for dependents
            for dependent_id in self._adjacency_list.get(node_id, set()):
                if dependent_id in scope:
                    in_degree[dependent_id] -= 1
                    if in_degree[dependent_id] == 0:
                        queue.append(dependent_id)

        # Check for remaining nodes (indicates cycle, shouldn't happen after validation)
        if len(result) != len(scope):
            remaining = scope - set(result)
            raise CircularDependencyError(list(remaining))

        logger.debug(f"Resolved execution order: {result}")
        return result

    def _get_dependency_closure(self, workflow_ids: Set[str]) -> Set[str]:
        """
        Get transitive closure of dependencies

        Args:
            workflow_ids: Starting workflow IDs

        Returns:
            Set including all dependent workflows
        """
        closure = set(workflow_ids)
        queue = deque(workflow_ids)

        while queue:
            node_id = queue.popleft()
            node = self.nodes.get(node_id)

            if node:
                for dep_id in node.dependencies:
                    if dep_id not in closure:
                        closure.add(dep_id)
                        queue.append(dep_id)

        return closure

    def get_parallel_groups(
        self,
        workflow_ids: Optional[List[str]] = None
    ) -> List[List[str]]:
        """
        REQ-WKFL-026-003: Group workflows into parallel execution batches

        BLP-029: Identify parallelization opportunities

        Args:
            workflow_ids: Specific workflows (None = all)

        Returns:
            List of groups that can execute in parallel
        """
        execution_order = self.resolve_execution_order(workflow_ids)

        if not execution_order:
            return []

        # Group by dependency depth level
        depth: Dict[str, int] = {}

        for node_id in execution_order:
            node = self.nodes.get(node_id)
            if not node or not node.dependencies:
                depth[node_id] = 0
            else:
                max_dep_depth = max(
                    depth.get(dep_id, 0) for dep_id in node.dependencies
                    if dep_id in depth
                )
                depth[node_id] = max_dep_depth + 1

        # Group by depth
        max_depth = max(depth.values()) if depth else 0
        groups: List[List[str]] = [[] for _ in range(max_depth + 1)]

        for node_id, d in depth.items():
            groups[d].append(node_id)

        logger.debug(f"Created {len(groups)} parallel execution groups")
        return groups

    def get_ready_workflows(
        self,
        completed_workflows: Set[str],
        failed_workflows: Optional[Set[str]] = None
    ) -> List[str]:
        """
        REQ-WKFL-026-003: Get workflows ready for execution

        BLP-028: Determine executable workflows

        Args:
            completed_workflows: Set of successfully completed workflow IDs
            failed_workflows: Set of failed workflow IDs (optional)

        Returns:
            List of workflow IDs ready to execute
        """
        failed = failed_workflows or set()
        ready = []

        for node_id, node in self.nodes.items():
            # Skip already completed or failed
            if node_id in completed_workflows or node_id in failed:
                continue

            # Check if all dependencies are satisfied
            all_deps_satisfied = True
            for dep_id in node.dependencies:
                dep = self.nodes.get(dep_id)
                if not dep:
                    continue

                # Find dependency record
                dep_record = next(
                    (d for d in self.dependencies
                     if d.source_id == dep_id and d.target_id == node_id),
                    None
                )

                if dep_record and dep_record.dependency_type == DependencyType.REQUIRED:
                    if dep_id not in completed_workflows:
                        all_deps_satisfied = False
                        break
                elif dep_record and dep_record.dependency_type == DependencyType.OPTIONAL:
                    # Optional deps don't block, but we check if they failed
                    pass

            if all_deps_satisfied:
                ready.append(node_id)

        return ready

    def check_dependency_status(
        self,
        workflow_id: str,
        completed_workflows: Set[str],
        failed_workflows: Optional[Set[str]] = None
    ) -> Dict[str, DependencyStatus]:
        """
        REQ-WKFL-026-003: Check status of all dependencies for a workflow

        Args:
            workflow_id: Workflow to check
            completed_workflows: Completed workflow IDs
            failed_workflows: Failed workflow IDs

        Returns:
            Dict mapping dependency ID to status
        """
        failed = failed_workflows or set()
        node = self.nodes.get(workflow_id)

        if not node:
            return {}

        status: Dict[str, DependencyStatus] = {}

        for dep_id in node.dependencies:
            if dep_id in completed_workflows:
                status[dep_id] = DependencyStatus.SATISFIED
            elif dep_id in failed:
                status[dep_id] = DependencyStatus.FAILED
            else:
                status[dep_id] = DependencyStatus.PENDING

        return status

    def get_dependents(self, workflow_id: str) -> List[str]:
        """
        Get workflows that depend on the given workflow

        Args:
            workflow_id: Workflow to check

        Returns:
            List of dependent workflow IDs
        """
        return list(self._adjacency_list.get(workflow_id, set()))

    def get_dependencies(self, workflow_id: str) -> List[str]:
        """
        Get workflows that the given workflow depends on

        Args:
            workflow_id: Workflow to check

        Returns:
            List of dependency workflow IDs
        """
        node = self.nodes.get(workflow_id)
        if node:
            return list(node.dependencies)
        return []

    def get_graph_statistics(self) -> Dict[str, Any]:
        """
        REQ-WKFL-026-003: Get dependency graph statistics

        BLP-025: Graph analysis
        """
        total_nodes = len(self.nodes)
        total_edges = len(self.dependencies)

        if total_nodes == 0:
            return {
                "total_workflows": 0,
                "total_dependencies": 0,
                "max_depth": 0,
                "avg_dependencies": 0,
                "independent_workflows": 0,
                "leaf_workflows": 0
            }

        # Calculate depths
        depths = self._calculate_depths()
        max_depth = max(depths.values()) if depths else 0

        # Count independent workflows (no dependencies)
        independent = len([n for n in self.nodes.values() if not n.dependencies])

        # Count leaf workflows (no dependents)
        leaf = len([
            n for n in self.nodes.values()
            if n.workflow_id not in self._adjacency_list or
            not self._adjacency_list[n.workflow_id]
        ])

        # Average dependencies
        total_deps = sum(len(n.dependencies) for n in self.nodes.values())
        avg_deps = total_deps / total_nodes

        return {
            "total_workflows": total_nodes,
            "total_dependencies": total_edges,
            "max_depth": max_depth,
            "avg_dependencies": round(avg_deps, 2),
            "independent_workflows": independent,
            "leaf_workflows": leaf,
            "calculated_at": datetime.now().isoformat()
        }

    def _calculate_depths(self) -> Dict[str, int]:
        """Calculate depth of each node in the graph"""
        depths: Dict[str, int] = {}

        try:
            order = self.resolve_execution_order()

            for node_id in order:
                node = self.nodes.get(node_id)
                if not node or not node.dependencies:
                    depths[node_id] = 0
                else:
                    max_dep_depth = max(
                        depths.get(dep_id, 0) for dep_id in node.dependencies
                        if dep_id in depths
                    )
                    depths[node_id] = max_dep_depth + 1

        except Exception:
            pass

        return depths

    def to_dict(self) -> Dict[str, Any]:
        """Serialize graph to dictionary"""
        return {
            "nodes": {
                node_id: {
                    "workflow_id": node.workflow_id,
                    "workflow_name": node.workflow_name,
                    "dependencies": list(node.dependencies),
                    "dependents": list(node.dependents),
                    "metadata": node.metadata
                }
                for node_id, node in self.nodes.items()
            },
            "dependencies": [
                {
                    "source_id": d.source_id,
                    "target_id": d.target_id,
                    "type": d.dependency_type.value,
                    "condition": d.condition
                }
                for d in self.dependencies
            ],
            "statistics": self.get_graph_statistics()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DependencyResolver':
        """Create resolver from dictionary"""
        resolver = cls()

        # Add nodes
        for node_id, node_data in data.get("nodes", {}).items():
            resolver.add_workflow(
                workflow_id=node_data["workflow_id"],
                workflow_name=node_data.get("workflow_name", node_id),
                dependencies=node_data.get("dependencies", []),
                metadata=node_data.get("metadata", {})
            )

        return resolver


# Convenience function for creating resolver
def create_resolver() -> DependencyResolver:
    """Create a new DependencyResolver instance"""
    return DependencyResolver()


# Main execution for testing
if __name__ == "__main__":
    import json

    # Create resolver
    resolver = DependencyResolver()

    # Add sample workflows with dependencies
    resolver.add_workflow("data_fetch", "Data Fetch", [])
    resolver.add_workflow("data_clean", "Data Cleaning", ["data_fetch"])
    resolver.add_workflow("data_validate", "Data Validation", ["data_fetch"])
    resolver.add_workflow("data_transform", "Data Transform", ["data_clean", "data_validate"])
    resolver.add_workflow("report_generate", "Report Generation", ["data_transform"])
    resolver.add_workflow("email_notify", "Email Notification", ["report_generate"])

    # Validate graph
    is_valid, error = resolver.validate_graph()
    print(f"Graph valid: {is_valid}")
    if error:
        print(f"Error: {error}")

    # Get execution order
    order = resolver.resolve_execution_order()
    print(f"Execution order: {order}")

    # Get parallel groups
    groups = resolver.get_parallel_groups()
    print(f"Parallel groups: {groups}")

    # Get ready workflows
    completed = {"data_fetch"}
    ready = resolver.get_ready_workflows(completed)
    print(f"Ready workflows (after data_fetch): {ready}")

    # Get statistics
    stats = resolver.get_graph_statistics()
    print(f"Statistics: {json.dumps(stats, indent=2)}")

    # Test circular dependency detection
    print("\nTesting circular dependency detection...")
    resolver2 = DependencyResolver()
    resolver2.add_workflow("A", "Workflow A", ["C"])
    resolver2.add_workflow("B", "Workflow B", ["A"])
    resolver2.add_workflow("C", "Workflow C", ["B"])

    is_valid, error = resolver2.validate_graph()
    print(f"Circular graph valid: {is_valid}")
    print(f"Error: {error}")
