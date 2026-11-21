"""

# Claude Advanced Tools Integration
try:
    from claude_advanced_tools import ToolRegistry, ToolSearchEngine, PatternLearner
    ADVANCED_TOOLS_ENABLED = True
except ImportError:
    ADVANCED_TOOLS_ENABLED = False
E2B Sandbox CLI package.
"""

__version__ = "0.1.0"
