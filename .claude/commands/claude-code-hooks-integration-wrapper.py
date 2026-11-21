#!/usr/bin/env python3
"""
Claude Code Hooks Integration Wrapper
Replaces AgentOps with native Claude Code hooks observability system

This module provides the integration layer between existing workflows and 
the Claude Code hooks multi-agent observability system.
"""

import sys
import os
import json
import time
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, asdict
from pathlib import Path

# Add project to path for imports
sys.path.insert(0, '/home/craigmbrown/Project')

@dataclass
class HookEvent:
    """Standardized hook event structure"""
    source_app: str
    session_id: str
    event_type: str
    timestamp: float
    payload: Dict[str, Any]
    agent_id: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

class ClaudeCodeHooksWrapper:
    """
    Wrapper to replace AgentOps functionality with Claude Code hooks
    Provides the same interface but uses the hooks observability system
    """
    
    def __init__(self, source_app: str, session_id: Optional[str] = None):
        self.source_app = source_app
        self.session_id = session_id or f"{source_app}-{int(time.time())}"
        self.start_time = time.time()
        self.events: List[HookEvent] = []
        self.metrics = {
            'total_events': 0,
            'execution_time': 0,
            'cost_estimate': 0.0,
            'agent_interactions': 0,
            'memory_operations': 0,
            'error_count': 0,
            'success_rate': 1.0,
            'throughput': 0.0,
            'latency_avg': 0.0,
            'resource_usage': {},
            'model_usage': {},
            'token_usage': {'input': 0, 'output': 0},
            'cache_hits': 0,
            'cache_misses': 0,
            'debate_rounds': 0,
            'consensus_score': 0.0
        }
        
        # Initialize session
        self._send_event('SessionStart', {
            'source_app': self.source_app,
            'session_id': self.session_id,
            'start_time': self.start_time
        })
    
    def _send_event(self, event_type: str, payload: Dict[str, Any], agent_id: Optional[str] = None):
        """Send event to Claude Code hooks system"""
        
        event = HookEvent(
            source_app=self.source_app,
            session_id=self.session_id,
            event_type=event_type,
            timestamp=time.time(),
            payload=payload,
            agent_id=agent_id,
            metrics=self.metrics.copy()
        )
        
        self.events.append(event)
        self.metrics['total_events'] += 1
        
        # Try to send to hooks observability system
        try:
            self._send_to_hooks_system(event)
        except Exception as e:
            print(f"⚠️  Could not send to hooks system: {e}")
            # Continue execution - observability failure shouldn't break workflow
    
    def _send_to_hooks_system(self, event: HookEvent):
        """Send event to the actual hooks observability system"""
        
        # Check if hooks system is available
        hooks_dir = Path('/home/craigmbrown/Project/disler/claude-code-hooks-multi-agent-observability')
        if not hooks_dir.exists():
            return
            
        # Import and use the hooks send_event function
        try:
            sys.path.insert(0, str(hooks_dir))
            from apps.server.src.index import send_event_to_server
            
            # Convert our event to hooks format
            hooks_payload = {
                'source_app': event.source_app,
                'session_id': event.session_id,
                'hook_event_type': event.event_type,
                'timestamp': event.timestamp,
                'payload': event.payload,
                'metrics': event.metrics
            }
            
            # Send to hooks server
            send_event_to_server(hooks_payload)
            
        except ImportError:
            # Fallback: Write to local log file
            self._write_to_local_log(event)
    
    def _write_to_local_log(self, event: HookEvent):
        """Fallback: Write event to local log file"""
        
        log_dir = Path('/home/craigmbrown/Project/logs/claude_code_hooks')
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f'{self.source_app}_{datetime.now().strftime("%Y%m%d")}.json'
        
        with open(log_file, 'a') as f:
            json.dump(asdict(event), f)
            f.write('\n')
    
    def record_agent_action(self, agent_name: str, action: str, result: Any = None, **kwargs):
        """Record an agent action (replaces agentops.record)"""
        
        self._send_event('AgentAction', {
            'agent_name': agent_name,
            'action': action,
            'result': str(result) if result else None,
            'metadata': kwargs
        }, agent_id=agent_name)
        
        self.metrics['agent_interactions'] += 1
        
        # Update latency metrics
        if 'duration' in kwargs:
            current_avg = self.metrics['latency_avg']
            count = self.metrics['agent_interactions']
            self.metrics['latency_avg'] = (current_avg * (count - 1) + kwargs['duration']) / count
    
    def record_llm_usage(self, model: str, tokens_in: int, tokens_out: int, cost: float = 0.0):
        """Record LLM usage metrics"""
        
        self._send_event('LLMUsage', {
            'model': model,
            'tokens_input': tokens_in,
            'tokens_output': tokens_out,
            'cost': cost
        })
        
        # Update metrics
        self.metrics['token_usage']['input'] += tokens_in
        self.metrics['token_usage']['output'] += tokens_out
        self.metrics['cost_estimate'] += cost
        
        if model not in self.metrics['model_usage']:
            self.metrics['model_usage'][model] = {'calls': 0, 'tokens': 0, 'cost': 0.0}
        
        self.metrics['model_usage'][model]['calls'] += 1
        self.metrics['model_usage'][model]['tokens'] += tokens_in + tokens_out
        self.metrics['model_usage'][model]['cost'] += cost
    
    def record_debate_round(self, round_number: int, challenger: str, challenged: str, resolution: str = None):
        """Record agent debate rounds (new capability)"""
        
        self._send_event('DebateRound', {
            'round_number': round_number,
            'challenger_agent': challenger,
            'challenged_agent': challenged,
            'resolution': resolution,
            'resolved': resolution is not None
        })
        
        self.metrics['debate_rounds'] += 1
    
    def record_memory_operation(self, operation: str, memory_type: str, success: bool = True):
        """Record V4 memory operations"""
        
        self._send_event('MemoryOperation', {
            'operation': operation,
            'memory_type': memory_type,
            'success': success
        })
        
        self.metrics['memory_operations'] += 1
        
        if success:
            self.metrics['cache_hits'] += 1
        else:
            self.metrics['cache_misses'] += 1
    
    def record_error(self, error: Exception, context: Dict[str, Any] = None):
        """Record errors and exceptions"""
        
        self._send_event('Error', {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context or {}
        })
        
        self.metrics['error_count'] += 1
        
        # Update success rate
        total_operations = self.metrics['agent_interactions'] + self.metrics['memory_operations']
        if total_operations > 0:
            self.metrics['success_rate'] = 1.0 - (self.metrics['error_count'] / total_operations)
    
    def end_session(self, final_result: Any = None):
        """End the session and calculate final metrics"""
        
        end_time = time.time()
        execution_time = end_time - self.start_time
        
        self.metrics['execution_time'] = execution_time
        
        # Calculate throughput
        if execution_time > 0:
            self.metrics['throughput'] = self.metrics['total_events'] / execution_time
        
        # Calculate consensus score for research workflows
        if self.metrics['debate_rounds'] > 0:
            # Simple consensus scoring based on resolution success
            self.metrics['consensus_score'] = min(1.0, self.metrics['debate_rounds'] / 5.0)
        
        self._send_event('SessionEnd', {
            'session_id': self.session_id,
            'end_time': end_time,
            'execution_time': execution_time,
            'final_result': str(final_result) if final_result else None,
            'final_metrics': self.metrics
        })
        
        return self.metrics

# Decorator for easy workflow integration
def claude_code_hooks_instrumentation(source_app: str, session_id: Optional[str] = None):
    """Decorator to instrument functions with Claude Code hooks"""
    
    def decorator(func: Callable):
        def wrapper(*args, **kwargs):
            hooks = ClaudeCodeHooksWrapper(source_app, session_id)
            
            try:
                # Record function start
                hooks.record_agent_action('system', f'start_{func.__name__}')
                
                # Execute function
                result = func(hooks, *args, **kwargs)
                
                # Record function success
                hooks.record_agent_action('system', f'complete_{func.__name__}', result)
                
                return result
                
            except Exception as e:
                hooks.record_error(e, {'function': func.__name__, 'args': str(args)})
                raise
            finally:
                final_metrics = hooks.end_session()
                print(f"📊 Session {hooks.session_id} completed with {final_metrics['total_events']} events")
        
        return wrapper
    return decorator

# Context manager for workflow blocks
class HooksInstrumentedWorkflow:
    """Context manager for workflow instrumentation"""
    
    def __init__(self, source_app: str, workflow_name: str):
        self.source_app = source_app
        self.workflow_name = workflow_name
        self.hooks = None
    
    def __enter__(self):
        self.hooks = ClaudeCodeHooksWrapper(self.source_app)
        self.hooks.record_agent_action('workflow', f'start_{self.workflow_name}')
        return self.hooks
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.hooks.record_error(exc_val, {'workflow': self.workflow_name})
        else:
            self.hooks.record_agent_action('workflow', f'complete_{self.workflow_name}')
        
        self.hooks.end_session()

# Migration helpers for existing AgentOps code
class AgentOpsCompatibilityLayer:
    """Compatibility layer for existing AgentOps code"""
    
    def __init__(self, api_key: str = None):
        self.hooks = ClaudeCodeHooksWrapper('agentops-migration')
    
    def init(self, **kwargs):
        """Initialize (AgentOps compatibility)"""
        self.hooks.record_agent_action('system', 'agentops_init', kwargs)
    
    def record(self, event_type: str, **kwargs):
        """Record event (AgentOps compatibility)"""
        self.hooks.record_agent_action('agentops', event_type, kwargs)
    
    def end_session(self, end_state: str = 'Success'):
        """End session (AgentOps compatibility)"""
        return self.hooks.end_session(end_state)

if __name__ == '__main__':
    # Test the wrapper
    with HooksInstrumentedWorkflow('test-app', 'test-workflow') as hooks:
        hooks.record_agent_action('test_agent', 'test_action', 'success')
        hooks.record_llm_usage('claude-3-sonnet', 100, 50, 0.01)
        hooks.record_memory_operation('store', 'learned', True)
        hooks.record_debate_round(1, 'fact_checker', 'evidence_gatherer', 'resolved')
        
        print("✅ Claude Code Hooks integration test completed")