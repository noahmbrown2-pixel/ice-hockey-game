#!/usr/bin/env python3
"""
Intent Classifier - Classify enhancement request intent and priority.
"""

from dataclasses import dataclass
from typing import List, Tuple, Optional
from enum import Enum


class EnhancementIntent(Enum):
    """Types of enhancement intents."""
    FEATURE = "/feature"
    BUG = "/bug"
    CHORE = "/chore"
    ENHANCEMENT = "/enhancement"


@dataclass
class ClassificationResult:
    """Result of intent classification."""
    intent: EnhancementIntent
    confidence: float
    priority: str
    keywords_matched: List[str]
    reasoning: str


class IntentClassifier:
    """
    Classify enhancement requests by intent and priority.
    """

    INTENT_KEYWORDS = {
        EnhancementIntent.FEATURE: [
            "new", "add", "create", "implement", "feature", "capability",
            "introduce", "enable", "build", "develop"
        ],
        EnhancementIntent.BUG: [
            "bug", "fix", "error", "crash", "broken", "issue", "problem",
            "fail", "wrong", "incorrect", "not working"
        ],
        EnhancementIntent.CHORE: [
            "refactor", "clean", "maintenance", "update", "upgrade", "migrate",
            "dependency", "remove", "delete", "deprecate"
        ],
        EnhancementIntent.ENHANCEMENT: [
            "improve", "enhance", "optimize", "better", "performance",
            "faster", "speed", "efficiency", "usability"
        ],
    }

    PRIORITY_KEYWORDS = {
        "high": ["urgent", "critical", "asap", "important", "priority", "blocking", "severe"],
        "low": ["when possible", "nice to have", "eventually", "minor", "low priority"],
    }

    def classify(self, title: str, description: str = "") -> ClassificationResult:
        """
        Classify intent from title and description.

        Args:
            title: Request title
            description: Request description

        Returns:
            ClassificationResult with intent and confidence
        """
        text = f"{title} {description}".lower()

        # Score each intent
        scores = {}
        matched_keywords = {}

        for intent, keywords in self.INTENT_KEYWORDS.items():
            matches = [kw for kw in keywords if kw in text]
            scores[intent] = len(matches)
            matched_keywords[intent] = matches

        # Find best match
        if not any(scores.values()):
            # Default to enhancement if no keywords match
            best_intent = EnhancementIntent.ENHANCEMENT
            confidence = 0.5
        else:
            best_intent = max(scores, key=scores.get)
            total_possible = len(self.INTENT_KEYWORDS[best_intent])
            confidence = min(0.95, 0.5 + (scores[best_intent] / total_possible) * 0.5)

        # Detect priority
        priority = self._detect_priority(text)

        return ClassificationResult(
            intent=best_intent,
            confidence=confidence,
            priority=priority,
            keywords_matched=matched_keywords.get(best_intent, []),
            reasoning=f"Matched {scores.get(best_intent, 0)} keywords for {best_intent.value}"
        )

    def _detect_priority(self, text: str) -> str:
        """Detect priority from text."""
        for priority, keywords in self.PRIORITY_KEYWORDS.items():
            if any(kw in text for kw in keywords):
                return priority
        return "medium"

    def classify_batch(
        self,
        items: List[Tuple[str, str]]
    ) -> List[ClassificationResult]:
        """
        Classify multiple items.

        Args:
            items: List of (title, description) tuples

        Returns:
            List of ClassificationResult
        """
        return [self.classify(title, desc) for title, desc in items]


# Standard I/O Pattern compliance
if __name__ == "__main__":
    classifier = IntentClassifier()
    print("SUCCESS: intent_classifier module loaded")
    print(f"Intent types: {[e.value for e in EnhancementIntent]}")
    print(f"Total keywords: {sum(len(v) for v in classifier.INTENT_KEYWORDS.values())}")

    # Test classification
    tests = [
        ("Add dark mode feature", "Users want dark mode"),
        ("Fix login crash on mobile", "App crashes when logging in"),
        ("Improve API performance", "Endpoints are slow"),
        ("Refactor authentication module", "Clean up auth code"),
    ]

    print("\nTest classifications:")
    for title, desc in tests:
        result = classifier.classify(title, desc)
        print(f"  '{title}' -> {result.intent.value} ({result.confidence:.0%})")
