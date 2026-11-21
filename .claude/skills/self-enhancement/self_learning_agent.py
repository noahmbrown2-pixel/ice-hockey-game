#!/usr/bin/env python3
"""
Self-Learning Agent - Agent with V4 Memory Integration
REQ-004: Self-Learning Agent with Memory Integration
BLP Properties: SI (Self-Improvement), A (Alignment)

This module provides:
- Load learnings from V4 memory system
- Append learnings to agent prompt suffix
- Store new learnings after each execution
- Keep last 10 learnings per agent

Standard I/O: All exceptions print details, all success prints before return (REQ-009)
"""

import os
import sys
import json
import time
import traceback
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field

# REQ-005: VM Portability Configuration
PROJECT_DIR = Path(os.environ.get("TB_OPS_PROJECT_DIR", "/home/craigmbrown/Project"))
LOGS_DIR = Path(os.environ.get("TB_OPS_LOGS_DIR", PROJECT_DIR / "logs"))
SKILLS_DIR = PROJECT_DIR / ".claude" / "skills"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Import model randomizer
try:
    from model_randomizer import select_model, get_randomizer
except ImportError:
    sys.path.insert(0, str(SKILLS_DIR / "self-enhancement"))
    from model_randomizer import select_model, get_randomizer


@dataclass
class Learning:
    """A single learning captured from task execution."""
    learning_id: str
    agent_id: str
    task_type: str
    pattern: str
    insight: str
    model_used: str
    success: bool
    execution_time: float
    timestamp: str
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "learning_id": self.learning_id,
            "agent_id": self.agent_id,
            "task_type": self.task_type,
            "pattern": self.pattern,
            "insight": self.insight,
            "model_used": self.model_used,
            "success": self.success,
            "execution_time": self.execution_time,
            "timestamp": self.timestamp,
            "tags": self.tags
        }


class V4MemoryLoader:
    """
    REQ-004: Interface to V4 memory system for agent learnings
    BLP: SI (Self-Improvement) - Retrieves past learnings

    Memory Types:
    - LEARNED: Patterns learned from task execution
    - PROCEDURAL: How-to knowledge for specific tasks
    - METACOGNITIVE: Self-awareness about agent capabilities
    - STRATEGIC: Long-term optimization strategies
    """

    MEMORY_TYPES = {
        "LEARNED": "Patterns learned from task execution",
        "PROCEDURAL": "How-to knowledge for specific tasks",
        "METACOGNITIVE": "Self-awareness about agent capabilities",
        "STRATEGIC": "Long-term optimization strategies"
    }

    def __init__(self, db_path: Path = None):
        self.db_path = db_path or SKILLS_DIR / "self-enhancement" / "agent_learnings.db"
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database for learnings storage."""
        func_name = "_init_database"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS learnings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learning_id TEXT UNIQUE NOT NULL,
                    agent_id TEXT NOT NULL,
                    memory_type TEXT NOT NULL,
                    task_type TEXT,
                    pattern TEXT,
                    insight TEXT,
                    model_used TEXT,
                    success INTEGER,
                    execution_time REAL,
                    tags TEXT,
                    created_at TEXT NOT NULL,
                    embedding_vector BLOB
                )
            """)

            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_agent_id ON learnings(agent_id)
            """)

            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_memory_type ON learnings(memory_type)
            """)

            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_task_type ON learnings(task_type)
            """)

            conn.commit()
            conn.close()
            print(f"SUCCESS: {func_name} - Agent learnings database initialized")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    def store(self, memory_type: str, content: Dict, tags: List[str] = None) -> str:
        """
        REQ-004: Store learning in V4 memory
        BLP: SI (Self-Improvement) - Persists learnings
        """
        func_name = "store"
        try:
            if memory_type not in self.MEMORY_TYPES:
                raise ValueError(f"Invalid memory type: {memory_type}")

            learning_id = f"{content.get('agent_id', 'unknown')}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}"

            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO learnings
                (learning_id, agent_id, memory_type, task_type, pattern, insight,
                 model_used, success, execution_time, tags, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                learning_id,
                content.get("agent_id", "unknown"),
                memory_type,
                content.get("task_type"),
                content.get("pattern"),
                content.get("insight"),
                content.get("model_used"),
                1 if content.get("success") else 0,
                content.get("execution_time"),
                json.dumps(tags or []),
                datetime.now().isoformat()
            ))

            conn.commit()
            conn.close()

            print(f"SUCCESS: {func_name} - Stored learning {learning_id} ({memory_type})")
            return learning_id

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            raise

    def query(self, query: str = None, memory_type: str = "LEARNED",
              agent_id: str = None, limit: int = 5) -> List[Dict]:
        """
        REQ-004: Query relevant learnings from memory
        BLP: SI (Self-Improvement) - Retrieves applicable patterns
        """
        func_name = "query"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            # Build query
            sql = "SELECT * FROM learnings WHERE memory_type = ?"
            params = [memory_type]

            if agent_id:
                sql += " AND agent_id = ?"
                params.append(agent_id)

            if query:
                # Simple keyword matching (could be enhanced with embeddings)
                sql += " AND (pattern LIKE ? OR insight LIKE ? OR task_type LIKE ?)"
                search_term = f"%{query}%"
                params.extend([search_term, search_term, search_term])

            sql += " ORDER BY created_at DESC LIMIT ?"
            params.append(limit)

            cursor.execute(sql, params)
            rows = cursor.fetchall()
            conn.close()

            learnings = []
            for row in rows:
                learnings.append({
                    "learning_id": row[1],
                    "agent_id": row[2],
                    "memory_type": row[3],
                    "task_type": row[4],
                    "pattern": row[5],
                    "insight": row[6],
                    "model_used": row[7],
                    "success": bool(row[8]),
                    "execution_time": row[9],
                    "tags": json.loads(row[10] or "[]"),
                    "created_at": row[11]
                })

            print(f"SUCCESS: {func_name} - Retrieved {len(learnings)} learnings")
            return learnings

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return []

    def get_agent_learnings(self, agent_id: str, limit: int = 10) -> List[Dict]:
        """Get all learnings for an agent."""
        return self.query(agent_id=agent_id, limit=limit)


class SelfLearningAgent:
    """
    REQ-004: Agent that learns from execution and updates its own prompts
    BLP: SI (Self-Improvement) - Continuously improves from experience
    BLP: A (Alignment) - Adapts to specific task patterns
    """

    def __init__(self, agent_id: str, base_prompt: str):
        self.agent_id = agent_id
        self.base_prompt = base_prompt
        self.learned_suffix = ""
        self.v4_memory = V4MemoryLoader()
        self.execution_count = 0
        self._load_learned_suffix()

    def _load_learned_suffix(self):
        """Load previous learnings into suffix."""
        func_name = "_load_learned_suffix"
        try:
            learnings = self.v4_memory.get_agent_learnings(self.agent_id, limit=10)
            if learnings:
                lines = []
                for l in learnings:
                    if l.get("insight"):
                        lines.append(f"- [{l.get('task_type', 'general')}] {l['insight']}")
                self.learned_suffix = "\n".join(lines)
                print(f"SUCCESS: {func_name} - Loaded {len(learnings)} learnings for {self.agent_id}")

        except Exception as e:
            print(f"WARNING: {func_name} - Could not load suffix: {e}")

    def build_enhanced_prompt(self, task: Dict) -> str:
        """
        REQ-004: Build prompt with base + learned patterns + task-specific memory
        BLP: SI (Self-Improvement) - Enhances prompt with learnings
        """
        func_name = "build_enhanced_prompt"
        try:
            # 1. Start with base prompt
            prompt = self.base_prompt

            # 2. Load relevant learnings from V4 memory
            task_description = task.get("description", "")
            relevant_learnings = self.v4_memory.query(
                query=task_description,
                memory_type="LEARNED",
                limit=5
            )

            if relevant_learnings:
                prompt += "\n\n## Learned Patterns (from previous executions)\n"
                for learning in relevant_learnings:
                    if learning.get("pattern") and learning.get("insight"):
                        prompt += f"- {learning['pattern']}: {learning['insight']}\n"

            # 3. Append accumulated learnings suffix
            if self.learned_suffix:
                prompt += f"\n\n## Agent-Specific Learnings\n{self.learned_suffix}"

            # 4. Add task context
            prompt += f"\n\n## Current Task\n{task_description}"

            if task.get("context"):
                prompt += f"\n\n### Context\n{task['context']}"

            print(f"SUCCESS: {func_name} - Built enhanced prompt ({len(prompt)} chars)")
            return prompt

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return self.base_prompt + f"\n\n## Current Task\n{task.get('description', '')}"

    def determine_task_category(self, task: Dict) -> str:
        """Determine the appropriate model category for task."""
        func_name = "determine_task_category"
        try:
            description = task.get("description", "").lower()
            task_type = task.get("type", "").lower()

            # Category detection
            if any(kw in description for kw in ["code", "function", "implement", "debug"]):
                category = "code_generation"
            elif any(kw in description for kw in ["reason", "why", "complex", "analyze deeply"]):
                category = "reasoning"
            elif any(kw in description for kw in ["quick", "simple", "translate", "format"]):
                category = "fast_simple"
            elif any(kw in description for kw in ["large", "document", "entire", "long"]):
                category = "massive_context"
            else:
                category = "analysis"

            print(f"SUCCESS: {func_name} - Task categorized as '{category}'")
            return category

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return "analysis"

    def extract_pattern(self, task: Dict, result: Dict) -> str:
        """Extract pattern from task execution."""
        task_type = task.get("type", "general")
        success = result.get("success", False)

        if success:
            return f"Successful {task_type} execution"
        else:
            error = result.get("error", "unknown error")
            return f"Failed {task_type}: {error[:100]}"

    def extract_insight(self, result: Dict) -> str:
        """Extract insight from execution result."""
        if result.get("success"):
            return result.get("insight", "Task completed successfully")
        else:
            return f"Avoid: {result.get('error', 'unknown error')[:100]}"

    async def execute_and_learn(self, task: Dict) -> Dict:
        """
        REQ-004: Execute task and capture learnings
        BLP: SI (Self-Improvement) - Learns from every execution
        """
        func_name = "execute_and_learn"
        try:
            self.execution_count += 1

            # Build enhanced prompt
            prompt = self.build_enhanced_prompt(task)

            # Select model randomly from appropriate category
            category = self.determine_task_category(task)
            provider, model_id = select_model(category)

            # Simulate execution (in real use, this would call the LLM)
            start_time = time.time()

            # This is where the actual LLM call would happen
            result = {
                "success": True,
                "output": f"Executed with {provider}:{model_id}",
                "insight": f"Task type '{task.get('type', 'general')}' works well with {category} models"
            }

            execution_time = time.time() - start_time

            # Capture learnings
            learning = {
                "agent_id": self.agent_id,
                "task_type": task.get("type", "general"),
                "model_used": f"{provider}:{model_id}",
                "success": result.get("success", False),
                "execution_time": execution_time,
                "pattern": self.extract_pattern(task, result),
                "insight": self.extract_insight(result),
                "timestamp": datetime.now().isoformat()
            }

            # Store in V4 memory
            learning_id = self.v4_memory.store(
                memory_type="LEARNED",
                content=learning,
                tags=[task.get("type"), f"{provider}:{model_id}", self.agent_id]
            )

            # Update agent's learned suffix (keep last 10 learnings)
            self._update_learned_suffix(learning)

            # Return result to orchestrator
            response = {
                "agent_id": self.agent_id,
                "result": result,
                "learning": learning,
                "learning_id": learning_id,
                "model_used": f"{provider}:{model_id}",
                "execution_count": self.execution_count
            }

            print(f"SUCCESS: {func_name} - Executed task and stored learning {learning_id}")
            return response

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            raise

    def _update_learned_suffix(self, learning: Dict):
        """
        REQ-004: Append learning to agent's prompt suffix
        BLP: SI (Self-Improvement) - Accumulates learnings
        """
        func_name = "_update_learned_suffix"
        try:
            new_learning = f"- [{learning.get('task_type', 'general')}] {learning.get('insight', '')}"

            # Parse existing learnings
            lines = self.learned_suffix.split("\n") if self.learned_suffix else []
            lines = [l for l in lines if l.strip()]  # Remove empty lines
            lines.append(new_learning)

            # Keep only last 10 learnings
            lines = lines[-10:]
            self.learned_suffix = "\n".join(lines)

            print(f"SUCCESS: {func_name} - Updated suffix with {len(lines)} learnings")

        except Exception as e:
            print(f"WARNING: {func_name} - Failed to update suffix: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """Get agent statistics."""
        learnings = self.v4_memory.get_agent_learnings(self.agent_id, limit=100)

        successful = sum(1 for l in learnings if l.get("success"))
        total = len(learnings)

        return {
            "agent_id": self.agent_id,
            "execution_count": self.execution_count,
            "total_learnings": total,
            "successful_learnings": successful,
            "success_rate": successful / total if total > 0 else 0,
            "learned_suffix_length": len(self.learned_suffix),
            "base_prompt_length": len(self.base_prompt)
        }


def create_agent(agent_id: str, specialization: str = "general") -> SelfLearningAgent:
    """Factory function to create specialized agents."""
    func_name = "create_agent"

    base_prompts = {
        "general": "You are a helpful AI assistant that learns from experience.",
        "code": "You are an expert software engineer that learns from coding patterns.",
        "analysis": "You are a data analyst that learns from analysis patterns.",
        "oracle": "You are an oracle monitoring agent that learns from price feed patterns.",
        "orchestrator": "You are a master orchestrator that coordinates other agents."
    }

    base_prompt = base_prompts.get(specialization, base_prompts["general"])
    agent = SelfLearningAgent(agent_id, base_prompt)

    print(f"SUCCESS: {func_name} - Created {specialization} agent: {agent_id}")
    return agent


if __name__ == "__main__":
    import argparse
    import asyncio

    parser = argparse.ArgumentParser(description="Self-Learning Agent")
    parser.add_argument("--create", nargs=2, metavar=("AGENT_ID", "SPEC"), help="Create agent")
    parser.add_argument("--execute", type=str, help="Execute task with agent")
    parser.add_argument("--stats", type=str, help="Show stats for agent")
    parser.add_argument("--learnings", type=str, help="Show learnings for agent")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()

    if args.create:
        agent_id, spec = args.create
        agent = create_agent(agent_id, spec)
        stats = agent.get_stats()
        if args.json:
            print(json.dumps(stats, indent=2))
        else:
            print(f"Created agent: {agent_id} ({spec})")

    elif args.execute:
        # Demo execution
        agent = create_agent("demo-agent", "general")
        task = {
            "description": args.execute,
            "type": "general",
            "context": "Demo execution"
        }
        result = asyncio.run(agent.execute_and_learn(task))
        if args.json:
            print(json.dumps(result, indent=2, default=str))
        else:
            print(f"\nExecution Result:")
            print(f"  Model: {result['model_used']}")
            print(f"  Learning ID: {result['learning_id']}")
            print(f"  Success: {result['result']['success']}")

    elif args.stats:
        agent = create_agent(args.stats, "general")
        stats = agent.get_stats()
        if args.json:
            print(json.dumps(stats, indent=2))
        else:
            print(f"\n=== Agent Stats: {args.stats} ===")
            print(f"Executions: {stats['execution_count']}")
            print(f"Total Learnings: {stats['total_learnings']}")
            print(f"Success Rate: {stats['success_rate']:.1%}")

    elif args.learnings:
        memory = V4MemoryLoader()
        learnings = memory.get_agent_learnings(args.learnings, limit=10)
        if args.json:
            print(json.dumps(learnings, indent=2))
        else:
            print(f"\n=== Learnings for {args.learnings} ===")
            for l in learnings:
                status = "✅" if l.get("success") else "❌"
                print(f"{status} [{l.get('task_type')}] {l.get('insight', 'N/A')[:60]}")

    else:
        parser.print_help()
