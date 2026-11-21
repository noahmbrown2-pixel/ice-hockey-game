"""Declarative damage-control rules loader.

Plan A item 5 (RQ-189) — single source of truth at .claude/damage-control-rules.yaml.
Designed to be importable from .claude/hooks/pre_tool_use.py without changing
its existing behavior. The hook will adopt this in a follow-up edit.

Public API:
    load_rules(path=None) -> Rules
    Rules.match_bash(command: str) -> list[BashHit]
    Rules.classify_path(path: str, op: Literal["read","write","delete"]) -> PathVerdict
    Rules.marketplace_violation(file_path: str, code: str) -> list[str]
"""
from __future__ import annotations

import fnmatch
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover
    yaml = None

DEFAULT_RULES_PATH = Path(__file__).resolve().parents[2] / "damage-control-rules.yaml"


@dataclass(frozen=True)
class BashHit:
    rule_id: str
    severity: str
    reason: str


@dataclass(frozen=True)
class PathVerdict:
    severity: str  # "P0", "P1", "P2", "ok"
    rule_id: str
    reason: str


@dataclass
class Rules:
    version: int
    bash_patterns: list[dict] = field(default_factory=list)
    zero_access_paths: list[str] = field(default_factory=list)
    read_only_paths: list[str] = field(default_factory=list)
    no_delete_paths: list[str] = field(default_factory=list)
    marketplace_oauth_guard: dict = field(default_factory=dict)
    _compiled_patterns: list[tuple[re.Pattern, dict]] = field(default_factory=list)

    @classmethod
    def from_dict(cls, raw: dict) -> "Rules":
        rules = cls(
            version=int(raw.get("version", 1)),
            bash_patterns=list(raw.get("bash_patterns", [])),
            zero_access_paths=list(raw.get("zero_access_paths", [])),
            read_only_paths=list(raw.get("read_only_paths", [])),
            no_delete_paths=list(raw.get("no_delete_paths", [])),
            marketplace_oauth_guard=dict(raw.get("marketplace_oauth_guard", {})),
        )
        rules._compiled_patterns = [
            (re.compile(p["pattern"]), p) for p in rules.bash_patterns if "pattern" in p
        ]
        return rules

    def match_bash(self, command: str) -> list[BashHit]:
        out: list[BashHit] = []
        for pat, rule in self._compiled_patterns:
            if pat.search(command):
                out.append(BashHit(rule_id=rule["id"], severity=rule["severity"], reason=rule["reason"]))
        return out

    def classify_path(self, path: str, op: Literal["read", "write", "delete"]) -> PathVerdict:
        for glob in self.zero_access_paths:
            if fnmatch.fnmatch(path, glob):
                return PathVerdict("P0", "zero-access", f"{op} on protected path matches {glob}")
        if op in ("write", "delete"):
            for glob in self.read_only_paths:
                if fnmatch.fnmatch(path, glob):
                    return PathVerdict("P0", "read-only", f"{op} forbidden on {glob}")
        if op == "delete":
            for glob in self.no_delete_paths:
                if fnmatch.fnmatch(path, glob):
                    return PathVerdict("P0", "no-delete", f"delete forbidden on {glob}")
        return PathVerdict("ok", "default-allow", "")

    def marketplace_violation(self, file_path: str, code: str) -> list[str]:
        guard = self.marketplace_oauth_guard
        if not guard:
            return []
        if not any(fnmatch.fnmatch(file_path, g) for g in guard.get("apply_when_path_matches", [])):
            return []
        violations: list[str] = []
        for imp in guard.get("forbidden_imports", []):
            if re.search(rf"\b(?:from\s+{re.escape(imp)}|import\s+{re.escape(imp)})\b", code):
                violations.append(f"forbidden_import:{imp}")
        for s in guard.get("forbidden_strings", []):
            if s in code:
                violations.append(f"forbidden_string:{s}")
        return violations


def load_rules(path: str | os.PathLike | None = None) -> Rules:
    if yaml is None:
        raise RuntimeError("PyYAML is required: pip install pyyaml")
    src = Path(path) if path else DEFAULT_RULES_PATH
    raw = yaml.safe_load(src.read_text())
    return Rules.from_dict(raw or {})


def cli_check(argv: list[str]) -> int:
    """Quick CLI: `python yaml_loader.py [--bash CMD | --path PATH OP | --rules]`"""
    if not argv:
        rules = load_rules()
        print(json.dumps({
            "version": rules.version,
            "bash_patterns": len(rules.bash_patterns),
            "zero_access_paths": len(rules.zero_access_paths),
            "read_only_paths": len(rules.read_only_paths),
            "no_delete_paths": len(rules.no_delete_paths),
            "marketplace_guard": bool(rules.marketplace_oauth_guard),
        }, indent=2))
        return 0
    rules = load_rules()
    if argv[0] == "--bash" and len(argv) >= 2:
        hits = rules.match_bash(" ".join(argv[1:]))
        print(json.dumps([h.__dict__ for h in hits], indent=2))
        return 1 if any(h.severity == "P0" for h in hits) else 0
    if argv[0] == "--path" and len(argv) >= 3:
        verdict = rules.classify_path(argv[1], argv[2])  # type: ignore[arg-type]
        print(json.dumps(verdict.__dict__, indent=2))
        return 1 if verdict.severity == "P0" else 0
    print("usage: yaml_loader.py [--bash CMD | --path PATH read|write|delete]", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(cli_check(sys.argv[1:]))
