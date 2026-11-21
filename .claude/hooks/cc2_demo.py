#!/usr/bin/env python3
"""
Continuous-Claude-v2 Hooks: Real-Life Demonstration

This demo shows the complete value of the Continuous-Claude-v2 hooks system
through a realistic 3-day development scenario.
"""

import sys
import os
from datetime import datetime, timedelta
from pathlib import Path
import json

# Import the hooks modules
from ledger_manager import LedgerManager
from status_line_provider import get_statusline_data, format_statusline_display
from context_monitor import get_warning_level, WARNING_THRESHOLD_1, WARNING_THRESHOLD_2, CRITICAL_THRESHOLD
from utils.context_estimator import estimate_tokens, calculate_context_percentage

def main():
    print('='*70)
    print('CONTINUOUS-CLAUDE-V2 HOOKS: REAL-LIFE DEMONSTRATION')
    print('='*70)
    print()

    # Initialize LedgerManager with test directory
    test_dir = Path('/tmp/cc2_demo')
    test_dir.mkdir(exist_ok=True)
    manager = LedgerManager(thoughts_dir=test_dir)

    # ============================================================================
    # COMPONENT 1: LedgerManager - Session State Persistence
    # ============================================================================
    print('COMPONENT 1: LedgerManager - Session State Persistence')
    print('-'*50)
    print()
    print('Scenario: Developer working on a complex refactoring task over multiple days')
    print()

    # Simulate session timeline
    session_id = 'refactor-auth-system'

    # Day 1: Initial exploration
    ledger1_path = manager.create_ledger(
        session_id=session_id,
        context_summary='Started analyzing authentication system for refactoring',
        active_tasks=['Map current auth flow', 'Identify pain points', 'Document dependencies'],
        key_decisions=['Will use OAuth2 with PKCE', 'Keep backward compatibility'],
        pending_actions=['Review JWT token handling'],
        files_modified=[],
        learnings=['Current system has 15 auth-related files'],
        metadata={'day': 1, 'phase': 'exploration'},
        context_percentage=35.0
    )
    print(f'📝 Day 1 Ledger Created: {ledger1_path.name}')
    print(f'   Context: Started analyzing authentication system for refactoring')
    print(f'   Tasks: 3 active')
    print(f'   Context %: 35.0%')
    print()

    # Day 2: Implementation started
    ledger2_path = manager.create_ledger(
        session_id=session_id,
        context_summary='Implemented new OAuth2 flow, migrated 8 of 15 files',
        active_tasks=['Migrate remaining 7 files', 'Write tests for new flow'],
        key_decisions=['Use refresh token rotation', 'Add rate limiting'],
        pending_actions=['Update API documentation', 'Notify frontend team'],
        files_modified=['auth/oauth.py', 'auth/tokens.py', 'auth/middleware.py', 'tests/test_oauth.py'],
        learnings=['Found edge case in token refresh logic', 'Need to handle concurrent requests'],
        metadata={'day': 2, 'phase': 'implementation'},
        context_percentage=68.0
    )
    print(f'📝 Day 2 Ledger Created: {ledger2_path.name}')
    print(f'   Context: Implemented new OAuth2 flow, migrated 8 of 15 files')
    print(f'   Files Modified: 4')
    print(f'   Context %: 68.0%')
    print()

    # Day 3: Approaching context limit
    ledger3_path = manager.create_ledger(
        session_id=session_id,
        context_summary='Completed migration, running full test suite, debugging 2 failing tests',
        active_tasks=['Fix rate limiting test', 'Fix concurrent refresh test'],
        key_decisions=['Add circuit breaker for token refresh', 'Implement retry with backoff'],
        pending_actions=['Deploy to staging', 'Run load tests'],
        files_modified=['auth/oauth.py', 'auth/tokens.py', 'auth/middleware.py', 'auth/rate_limit.py',
                       'auth/circuit_breaker.py', 'tests/test_oauth.py', 'tests/test_rate_limit.py'],
        learnings=['Circuit breaker pattern works well here', 'Need 500ms backoff for retries'],
        metadata={'day': 3, 'phase': 'debugging'},
        context_percentage=85.0
    )
    print(f'📝 Day 3 Ledger Created: {ledger3_path.name}')
    print(f'   Context: Completed migration, running full test suite, debugging 2 failing tests')
    print(f'   Files Modified: 7')
    print(f'   Context %: 85.0% ⚠️ HIGH')
    print()

    # Show ledger history
    ledgers = manager.list_ledgers(limit=10)
    print(f'📊 Ledger History: {len(ledgers)} entries available')
    for i, l in enumerate(ledgers[:3], 1):
        print(f'   Entry {i}: {l.get("filename", "Unknown") if isinstance(l, dict) else l}')
    print()

    # ============================================================================
    # COMPONENT 2: Handoff System - Seamless Session Continuity
    # ============================================================================
    print()
    print('COMPONENT 2: Handoff System - Seamless Session Continuity')
    print('-'*50)
    print()
    print('Scenario: Context at 85% - time to create handoff before hitting limit')
    print()

    # Create handoff when approaching limit
    handoff_path = manager.create_handoff(
        session_id=session_id,
        context='Authentication system refactoring - Day 3, near completion',
        next_steps=[
            'Fix failing test in test_concurrent_refresh',
            'Deploy to staging environment',
            'Run load tests with 1000 concurrent users',
            'Update API documentation with new endpoints'
        ],
        critical_info={
            'failing_tests': ['test_concurrent_refresh', 'test_rate_limit_edge'],
            'circuit_breaker_config': {'failure_threshold': 5, 'reset_timeout': 30},
            'backoff_strategy': {'initial': 500, 'max': 5000, 'multiplier': 2}
        }
    )

    handoff_name = handoff_path.name if hasattr(handoff_path, 'name') else str(handoff_path).split('/')[-1]
    print(f'🔄 Handoff Created: {handoff_name}')
    print()

    # Simulate loading handoff in new session
    handoff_data = manager.get_pending_handoff()
    if handoff_data:
        print('📥 Handoff Loaded in New Session:')
        print(f'   Context: {handoff_data.get("context", "N/A")}')
        next_steps = handoff_data.get('next_steps', [])
        print(f'   Next Steps: {len(next_steps)} items')
        for i, step in enumerate(next_steps[:3], 1):
            print(f'      {i}. {step}')
        if len(next_steps) > 3:
            print(f'      ... and {len(next_steps) - 3} more')
        print(f'   Critical Info Keys: {list(handoff_data.get("critical_info", {}).keys())}')
        resume = handoff_data.get('resume_instructions', 'N/A')
        if len(resume) > 60:
            resume = resume[:60] + '...'
        print(f'   Resume Instructions: {resume}')
    print()

    # ============================================================================
    # COMPONENT 3: StatusLine Provider - Real-Time Visibility
    # ============================================================================
    print()
    print('COMPONENT 3: StatusLine Provider - Real-Time Visibility')
    print('-'*50)
    print()
    print('StatusLine shows context usage at every moment:')
    print()

    # Simulate different context levels
    stages = [
        (5000, 'Session Start'),
        (45000, 'After reading codebase'),
        (95000, 'Deep analysis complete'),
        (142000, 'Implementation phase'),
        (164000, 'Extended debugging'),
        (186000, 'Near context limit')
    ]

    for tokens, description in stages:
        percentage = (tokens / 200000) * 100
        level, _, _ = get_warning_level(percentage)

        # Format warning indicator
        if level == 'warning':
            indicator = ' [!]'
            color_note = '(yellow)'
        elif level == 'high':
            indicator = ' [!!]'
            color_note = '(orange)'
        elif level == 'critical':
            indicator = ' [!!!]'
            color_note = '(red)'
        else:
            indicator = ''
            color_note = '(green)'

        # Format token count
        if tokens >= 1000:
            token_str = f'{tokens/1000:.1f}K'
        else:
            token_str = str(tokens)

        statusline = f'[{token_str} | {percentage:.0f}%{indicator}] feature/auth-refactor'
        print(f'  {statusline:45} ← {description} {color_note}')
    print()

    # ============================================================================
    # COMPONENT 4: Context Monitor - Proactive Warnings
    # ============================================================================
    print()
    print('COMPONENT 4: Context Monitor - Proactive Warnings')
    print('-'*50)
    print()
    print('Graduated warnings prevent unexpected context exhaustion:')
    print()

    # Show warnings at each threshold
    warning_examples = [
        (71, 'After major implementation'),
        (82, 'During extended debugging'),
        (93, 'Near session limit')
    ]

    for percentage, scenario in warning_examples:
        level, threshold, recommendation = get_warning_level(percentage)
        if level != 'ok':
            if level == 'warning':
                icon = '⚠️'
                indicator = '[!]'
            elif level == 'high':
                icon = '🔶'
                indicator = '[!!]'
            else:
                icon = '🔴'
                indicator = '[!!!]'

            print(f'{icon} At {percentage}% ({scenario}):')
            print(f'   {indicator} Context at {percentage}% - {recommendation}')
            print()

    # ============================================================================
    # INTEGRATED WORKFLOW: Complete Session Lifecycle
    # ============================================================================
    print()
    print('='*70)
    print('INTEGRATED WORKFLOW: Complete Session Lifecycle')
    print('='*70)
    print()
    print('Timeline of a real 3-day development session:')
    print()

    timeline = [
        ('Day 1, 9:00 AM', 'Session starts', '[5.0K | 2%] feature/auth', 'Fresh context, begin exploration'),
        ('Day 1, 12:00 PM', 'Read 15 files', '[45.0K | 22%] feature/auth', 'Understanding codebase'),
        ('Day 1, 5:00 PM', 'End of day', '[68.0K | 34%] feature/auth', 'Create ledger, go home'),
        ('Day 2, 9:00 AM', 'Resume work', '[5.0K | 2%] feature/auth', 'Load ledger, restored context'),
        ('Day 2, 3:00 PM', 'Major implementation', '[142.0K | 71% [!]] feature/auth', '⚠️ First warning - consider saving'),
        ('Day 2, 5:00 PM', 'Save and leave', '[156.0K | 78%] feature/auth', 'Create ledger before warning escalates'),
        ('Day 3, 9:00 AM', 'Resume work', '[5.0K | 2%] feature/auth', 'Load ledger, fresh context'),
        ('Day 3, 2:00 PM', 'Deep debugging', '[164.0K | 82% [!!]] feature/auth', '🔶 High warning - checkpoint time'),
        ('Day 3, 2:15 PM', 'Create handoff', '[168.0K | 84%] feature/auth', 'Save handoff for next session'),
        ('Day 3, 2:30 PM', 'New session', '[5.0K | 2%] feature/auth', 'Load handoff, continue seamlessly')
    ]

    for time, action, statusline, note in timeline:
        print(f'  {time:16} | {action:20} | {statusline:35}')
        print(f'                   | {note}')
        print()

    # ============================================================================
    # VALUE COMPARISON: BEFORE vs AFTER
    # ============================================================================
    print()
    print('='*70)
    print('VALUE COMPARISON: BEFORE vs AFTER Continuous-Claude-v2')
    print('='*70)
    print()

    print('❌ WITHOUT Continuous-Claude-v2:')
    print('   • Work until context compaction happens unexpectedly')
    print('   • Lose track of which files were modified')
    print('   • Forget key decisions made during session')
    print('   • Start from scratch in new session')
    print('   • Re-explain context repeatedly')
    print('   • Risk losing critical work-in-progress')
    print()

    print('✅ WITH Continuous-Claude-v2:')
    print('   • See context usage in real-time via StatusLine')
    print('   • Get graduated warnings at 70%/80%/90%')
    print('   • Automatically track decisions, files, learnings')
    print('   • Create handoffs with full context preservation')
    print('   • Resume seamlessly with complete state')
    print('   • Zero surprise context exhaustion')
    print()

    print('='*70)
    print('DEMONSTRATION COMPLETE')
    print('='*70)
    print()
    print('Files created during demo:')
    for f in sorted(test_dir.glob('*')):
        print(f'  • {f.name}')


if __name__ == '__main__':
    main()
