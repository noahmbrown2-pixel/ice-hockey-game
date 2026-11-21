"""
ZTE Bridge - Interface layer for production ZTE pipeline.

This skill provides a clean interface to call ZTE without modifying it.
"""

from .zte_client import ZTEClient
from .issue_formatter import IssueFormatter
from .status_tracker import StatusTracker

__all__ = ['ZTEClient', 'IssueFormatter', 'StatusTracker']
__version__ = '1.0.0'
