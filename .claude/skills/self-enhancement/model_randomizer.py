#!/usr/bin/env python3
"""
Model Randomizer - Random Model Selection within Categories
REQ-002: Model Randomization within Categories
BLP Properties: A (Alignment), AU (Autonomy)

This module provides:
- 5 model categories with multiple providers
- Weighted random selection based on success rate
- Non-Claude fallback pools
- No single-model dependency

Standard I/O: All exceptions print details, all success prints before return (REQ-009)
"""

import os
import sys
import json
import random
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


@dataclass
class ModelInfo:
    """Model information with metadata."""
    provider: str
    model_id: str
    cost_per_million_input: float
    cost_per_million_output: float
    context_window: int
    success_rate: float = 0.95
    avg_latency_ms: float = 1000.0


# REQ-002: Model Pools Configuration
# BLP: AU (Autonomy) - System can operate with any model in pool
MODEL_POOLS: Dict[str, Dict[str, Any]] = {
    "reasoning": {
        "description": "Complex reasoning and analysis tasks",
        "models": [
            ModelInfo("xai", "grok-4.1", 2.00, 6.00, 131072, 0.94),
            ModelInfo("deepseek", "deepseek-r1-671b", 0.55, 2.19, 65536, 0.92),
            ModelInfo("openai", "o1", 15.00, 60.00, 200000, 0.96),
            ModelInfo("google", "gemini-2.5-pro", 1.25, 5.00, 1000000, 0.93),
            ModelInfo("anthropic", "claude-3-opus", 15.00, 75.00, 200000, 0.97),
        ],
        "selection": "random_weighted",
        "fallback_no_claude": ["xai:grok-4.1", "deepseek:deepseek-r1-671b", "openai:o1"]
    },
    "code_generation": {
        "description": "Code writing and debugging tasks",
        "models": [
            ModelInfo("deepseek", "deepseek-coder-v2", 0.14, 0.28, 128000, 0.93),
            ModelInfo("groq", "kimi-k2", 0.60, 0.60, 131072, 0.91),
            ModelInfo("openai", "gpt-4o", 2.50, 10.00, 128000, 0.95),
            ModelInfo("venice", "qwen3-coder-480b", 0.00, 0.00, 131072, 0.89),
            ModelInfo("anthropic", "claude-sonnet-4", 3.00, 15.00, 200000, 0.96),
        ],
        "selection": "random_weighted",
        "fallback_no_claude": ["deepseek:deepseek-coder-v2", "groq:kimi-k2", "openai:gpt-4o"]
    },
    "analysis": {
        "description": "Data analysis and research tasks",
        "models": [
            ModelInfo("openai", "gpt-4o", 2.50, 10.00, 128000, 0.94),
            ModelInfo("google", "gemini-2.5-pro", 1.25, 5.00, 1000000, 0.93),
            ModelInfo("xai", "grok-4", 2.00, 6.00, 2000000, 0.92),
            ModelInfo("deepseek", "deepseek-v3", 0.27, 1.10, 65536, 0.91),
            ModelInfo("anthropic", "claude-sonnet-4", 3.00, 15.00, 200000, 0.95),
        ],
        "selection": "random_weighted",
        "fallback_no_claude": ["openai:gpt-4o", "xai:grok-4", "deepseek:deepseek-v3"]
    },
    "fast_simple": {
        "description": "Quick, simple tasks requiring low latency",
        "models": [
            ModelInfo("groq", "llama-3.1-8b-instant", 0.05, 0.08, 131072, 0.88, 200),
            ModelInfo("groq", "gpt-oss-20b", 0.20, 0.20, 131072, 0.87, 300),
            ModelInfo("google", "gemini-2.5-flash", 0.075, 0.30, 1000000, 0.90, 400),
            ModelInfo("openai", "gpt-4o-mini", 0.15, 0.60, 128000, 0.92, 500),
            ModelInfo("anthropic", "claude-3-5-haiku", 0.25, 1.25, 200000, 0.93, 350),
        ],
        "selection": "random_uniform",  # Equal probability for fast tasks
        "fallback_no_claude": ["groq:llama-3.1-8b-instant", "google:gemini-2.5-flash", "openai:gpt-4o-mini"]
    },
    "massive_context": {
        "description": "Tasks requiring very large context windows",
        "models": [
            ModelInfo("xai", "grok-4", 2.00, 6.00, 2000000, 0.92),
            ModelInfo("google", "gemini-2.5-pro", 1.25, 5.00, 1000000, 0.93),
            ModelInfo("openai", "gpt-4o", 2.50, 10.00, 128000, 0.94),
            ModelInfo("anthropic", "claude-opus-4", 15.00, 75.00, 200000, 0.96),
        ],
        "selection": "random_weighted",
        "fallback_no_claude": ["xai:grok-4", "google:gemini-2.5-pro", "openai:gpt-4o"]
    }
}


class ModelRandomizer:
    """
    REQ-002: Model Randomizer with weighted selection
    BLP: A (Alignment) - Selects best model for task
    BLP: AU (Autonomy) - Operates independently with any available model
    """

    def __init__(self):
        self.db_path = SKILLS_DIR / "self-enhancement" / "model_usage.db"
        self.exclude_claude = False
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database for model usage tracking."""
        func_name = "_init_database"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    model_id TEXT NOT NULL,
                    selected_at TEXT NOT NULL,
                    success INTEGER DEFAULT 1,
                    latency_ms REAL,
                    tokens_used INTEGER
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model_success_rates (
                    provider_model TEXT PRIMARY KEY,
                    total_calls INTEGER DEFAULT 0,
                    successful_calls INTEGER DEFAULT 0,
                    avg_latency_ms REAL DEFAULT 1000.0,
                    last_updated TEXT
                )
            """)

            conn.commit()
            conn.close()
            print(f"SUCCESS: {func_name} - Model usage database initialized")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    def get_model_success_rate(self, provider: str, model_id: str) -> float:
        """
        REQ-002: Get success rate for weighted selection
        BLP: SI (Self-Improvement) - Learns from model performance
        """
        func_name = "get_model_success_rate"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            provider_model = f"{provider}:{model_id}"
            cursor.execute(
                "SELECT successful_calls, total_calls FROM model_success_rates WHERE provider_model = ?",
                (provider_model,)
            )
            row = cursor.fetchone()
            conn.close()

            if row and row[1] > 0:
                rate = row[0] / row[1]
                print(f"SUCCESS: {func_name} - {provider_model} success rate: {rate:.2%}")
                return rate

            # Default to model's configured success rate
            for pool in MODEL_POOLS.values():
                for model in pool["models"]:
                    if model.provider == provider and model.model_id == model_id:
                        return model.success_rate

            return 0.90  # Default fallback

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return 0.90

    def select_model_randomly(self, category: str, exclude_claude: bool = None) -> Tuple[str, str]:
        """
        REQ-002: Randomly select model from category pool
        BLP: AU (Autonomy) - No single-model dependency
        """
        func_name = "select_model_randomly"
        try:
            if category not in MODEL_POOLS:
                raise ValueError(f"Unknown category: {category}")

            pool = MODEL_POOLS[category]
            use_fallback = exclude_claude if exclude_claude is not None else self.exclude_claude

            if use_fallback:
                # Use non-Claude fallback pool
                models = pool["fallback_no_claude"]
                selected = random.choice(models)
                provider, model_id = selected.split(":")
            else:
                # Use full pool with weighted selection
                models = pool["models"]

                if pool["selection"] == "random_uniform":
                    selected_model = random.choice(models)
                else:
                    # Weighted by success rate
                    weights = [self.get_model_success_rate(m.provider, m.model_id) for m in models]
                    selected_model = random.choices(models, weights=weights, k=1)[0]

                provider = selected_model.provider
                model_id = selected_model.model_id

            # Log selection
            self._log_selection(category, provider, model_id)

            result = (provider, model_id)
            print(f"SUCCESS: {func_name} - Selected {provider}:{model_id} for category '{category}'")
            return result

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            raise

    def _log_selection(self, category: str, provider: str, model_id: str):
        """Log model selection for analytics."""
        func_name = "_log_selection"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO model_usage (category, provider, model_id, selected_at)
                VALUES (?, ?, ?, ?)
            """, (category, provider, model_id, datetime.now().isoformat()))

            conn.commit()
            conn.close()

        except Exception as e:
            print(f"WARNING: {func_name} - Failed to log selection: {e}")

    def record_model_result(self, provider: str, model_id: str, success: bool, latency_ms: float = None):
        """
        REQ-002: Record model result for success rate calculation
        BLP: SI (Self-Improvement) - Updates success rates
        """
        func_name = "record_model_result"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            provider_model = f"{provider}:{model_id}"

            # Update or insert success rate
            cursor.execute("""
                INSERT INTO model_success_rates (provider_model, total_calls, successful_calls, avg_latency_ms, last_updated)
                VALUES (?, 1, ?, ?, ?)
                ON CONFLICT(provider_model) DO UPDATE SET
                    total_calls = total_calls + 1,
                    successful_calls = successful_calls + ?,
                    avg_latency_ms = CASE WHEN ? IS NOT NULL THEN (avg_latency_ms + ?) / 2 ELSE avg_latency_ms END,
                    last_updated = ?
            """, (
                provider_model,
                1 if success else 0,
                latency_ms or 1000.0,
                datetime.now().isoformat(),
                1 if success else 0,
                latency_ms, latency_ms,
                datetime.now().isoformat()
            ))

            conn.commit()
            conn.close()

            print(f"SUCCESS: {func_name} - Recorded {'success' if success else 'failure'} for {provider_model}")

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")

    def set_exclude_claude(self, exclude: bool):
        """
        REQ-006: Toggle Claude exclusion (for non-Claude backup mode)
        BLP: D (Durability) - Maintains operation without Claude
        """
        func_name = "set_exclude_claude"
        self.exclude_claude = exclude
        print(f"SUCCESS: {func_name} - Claude exclusion set to {exclude}")

    def get_category_for_task(self, task_description: str) -> str:
        """
        REQ-002: Determine appropriate category for task
        BLP: A (Alignment) - Routes to optimal model pool
        """
        func_name = "get_category_for_task"
        try:
            task_lower = task_description.lower()

            # Category keywords
            reasoning_keywords = ["reason", "think", "analyze", "complex", "why", "explain", "logic"]
            code_keywords = ["code", "function", "implement", "debug", "program", "script", "fix bug"]
            analysis_keywords = ["data", "research", "summarize", "compare", "investigate", "report"]
            fast_keywords = ["quick", "simple", "translate", "format", "convert", "list"]
            context_keywords = ["large", "long", "document", "book", "corpus", "entire"]

            # Check keywords
            if any(kw in task_lower for kw in context_keywords):
                category = "massive_context"
            elif any(kw in task_lower for kw in code_keywords):
                category = "code_generation"
            elif any(kw in task_lower for kw in reasoning_keywords):
                category = "reasoning"
            elif any(kw in task_lower for kw in fast_keywords):
                category = "fast_simple"
            elif any(kw in task_lower for kw in analysis_keywords):
                category = "analysis"
            else:
                category = "analysis"  # Default

            print(f"SUCCESS: {func_name} - Task categorized as '{category}'")
            return category

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            return "analysis"

    def get_model_stats(self) -> Dict[str, Any]:
        """
        REQ-002: Get model usage statistics
        BLP: SO (Self-Organization) - Visibility into model performance
        """
        func_name = "get_model_stats"
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            # Get usage counts by category
            cursor.execute("""
                SELECT category, COUNT(*) as count
                FROM model_usage
                GROUP BY category
                ORDER BY count DESC
            """)
            category_usage = {row[0]: row[1] for row in cursor.fetchall()}

            # Get success rates
            cursor.execute("""
                SELECT provider_model, total_calls, successful_calls, avg_latency_ms
                FROM model_success_rates
                ORDER BY total_calls DESC
            """)
            success_rates = {}
            for row in cursor.fetchall():
                success_rates[row[0]] = {
                    "total_calls": row[1],
                    "successful_calls": row[2],
                    "success_rate": row[2] / row[1] if row[1] > 0 else 0,
                    "avg_latency_ms": row[3]
                }

            conn.close()

            stats = {
                "category_usage": category_usage,
                "model_success_rates": success_rates,
                "total_selections": sum(category_usage.values()),
                "exclude_claude_mode": self.exclude_claude,
                "generated_at": datetime.now().isoformat()
            }

            print(f"SUCCESS: {func_name} - Retrieved stats for {len(success_rates)} models")
            return stats

        except Exception as e:
            print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            return {}


# Global instance
_randomizer = None


def get_randomizer() -> ModelRandomizer:
    """Get singleton ModelRandomizer instance."""
    global _randomizer
    if _randomizer is None:
        _randomizer = ModelRandomizer()
    return _randomizer


def select_model(category: str, exclude_claude: bool = False) -> Tuple[str, str]:
    """Convenience function for model selection."""
    return get_randomizer().select_model_randomly(category, exclude_claude)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Model Randomizer")
    parser.add_argument("--select", type=str, help="Select model for category")
    parser.add_argument("--task", type=str, help="Categorize task and select model")
    parser.add_argument("--no-claude", action="store_true", help="Exclude Claude models")
    parser.add_argument("--stats", action="store_true", help="Show model stats")
    parser.add_argument("--list-pools", action="store_true", help="List model pools")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()

    randomizer = ModelRandomizer()

    if args.select:
        provider, model_id = randomizer.select_model_randomly(args.select, args.no_claude)
        if args.json:
            print(json.dumps({"provider": provider, "model_id": model_id}))
        else:
            print(f"Selected: {provider}:{model_id}")

    elif args.task:
        category = randomizer.get_category_for_task(args.task)
        provider, model_id = randomizer.select_model_randomly(category, args.no_claude)
        if args.json:
            print(json.dumps({"category": category, "provider": provider, "model_id": model_id}))
        else:
            print(f"Task Category: {category}")
            print(f"Selected Model: {provider}:{model_id}")

    elif args.stats:
        stats = randomizer.get_model_stats()
        if args.json:
            print(json.dumps(stats, indent=2))
        else:
            print("\n=== Model Randomizer Stats ===")
            print(f"Total Selections: {stats.get('total_selections', 0)}")
            print(f"Claude Exclusion Mode: {stats.get('exclude_claude_mode', False)}")
            print("\nCategory Usage:")
            for cat, count in stats.get('category_usage', {}).items():
                print(f"  {cat}: {count}")
            print("\nModel Success Rates:")
            for model, data in stats.get('model_success_rates', {}).items():
                print(f"  {model}: {data['success_rate']:.1%} ({data['total_calls']} calls)")

    elif args.list_pools:
        if args.json:
            pools_json = {
                cat: {
                    "description": pool["description"],
                    "models": [f"{m.provider}:{m.model_id}" for m in pool["models"]],
                    "selection": pool["selection"],
                    "fallback_no_claude": pool["fallback_no_claude"]
                }
                for cat, pool in MODEL_POOLS.items()
            }
            print(json.dumps(pools_json, indent=2))
        else:
            print("\n=== Model Pools ===")
            for cat, pool in MODEL_POOLS.items():
                print(f"\n{cat}: {pool['description']}")
                print(f"  Selection: {pool['selection']}")
                print("  Models:")
                for m in pool["models"]:
                    print(f"    - {m.provider}:{m.model_id} (${m.cost_per_million_input}/M in, {m.context_window:,} ctx)")
                print(f"  Non-Claude fallback: {pool['fallback_no_claude']}")

    else:
        parser.print_help()
