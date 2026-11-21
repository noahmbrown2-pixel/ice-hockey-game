"""
Enhancement Request - Multi-source request monitoring and classification.
"""

from .triggers.notion_trigger import NotionTrigger
from .triggers.email_trigger import EmailTrigger
from .triggers.tb_trigger import TBTrigger
from .triggers.github_trigger import GitHubTrigger
from .classifier.intent_classifier import IntentClassifier, EnhancementIntent

__all__ = [
    'NotionTrigger', 'EmailTrigger', 'TBTrigger', 'GitHubTrigger',
    'IntentClassifier', 'EnhancementIntent'
]
__version__ = '1.0.0'
