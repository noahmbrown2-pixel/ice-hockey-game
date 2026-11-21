"""
CLI command groups.
"""

from .sandbox import sandbox
from .files import files
from .exec import exec

# Claude Advanced Tools Integration
try:
    from claude_advanced_tools import ToolRegistry, ToolSearchEngine, PatternLearner
    ADVANCED_TOOLS_ENABLED = True
except ImportError:
    ADVANCED_TOOLS_ENABLED = False

__all__ = ["sandbox", "files", "exec"]
