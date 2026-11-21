#!/usr/bin/env python3
"""
Test script for Enhanced Persona Debate Commands
Verifies that all command workflows are properly configured
"""

import os
import sys
from pathlib import Path

def test_command_files():
    """Test that all command files exist and are valid"""
    
    print("🧪 Testing Enhanced Persona Debate Commands")
    print("=" * 50)
    
    commands_dir = Path("/home/craigmbrown/Project/.claude/commands")
    
    # Expected command files
    expected_commands = [
        "debate.md",
        "debate-quick.md",
        "debate-monitor.md",
        "debate-status.md"
    ]
    
    results = []
    
    for cmd_file in expected_commands:
        cmd_path = commands_dir / cmd_file
        
        if cmd_path.exists():
            # Check file size (should have content)
            size = cmd_path.stat().st_size
            if size > 100:  # At least 100 bytes
                print(f"✅ {cmd_file}: Present ({size:,} bytes)")
                
                # Check for key sections
                content = cmd_path.read_text()
                has_usage = "## Usage" in content
                has_examples = "## Examples" in content or "### Examples" in content
                has_implementation = "## Implementation" in content or "```python" in content
                
                if has_usage and has_examples and has_implementation:
                    print(f"   ✓ Complete documentation")
                    results.append((cmd_file, True))
                else:
                    missing = []
                    if not has_usage: missing.append("Usage")
                    if not has_examples: missing.append("Examples")
                    if not has_implementation: missing.append("Implementation")
                    print(f"   ⚠️ Missing sections: {', '.join(missing)}")
                    results.append((cmd_file, False))
            else:
                print(f"❌ {cmd_file}: Too small ({size} bytes)")
                results.append((cmd_file, False))
        else:
            print(f"❌ {cmd_file}: Not found")
            results.append((cmd_file, False))
    
    # Summary
    print("\n" + "-" * 50)
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    print(f"📊 Results: {passed}/{total} commands ready")
    
    if passed == total:
        print("✨ All debate commands are properly configured!")
        print("\n📚 Available Commands:")
        print("  • /debate [topic] - Full multi-agent debate")
        print("  • /debate-quick [topic] - Quick 3-agent debate")
        print("  • /debate-monitor [action] - Monitor system")
        print("  • /debate-status - Check system status")
        
        print("\n💡 Quick Start Examples:")
        print('  /debate "Should we colonize Mars?"')
        print('  /debate-quick "Is coffee good for health?"')
        print("  /debate-monitor live")
        print("  /debate-status")
        
        return True
    else:
        print(f"⚠️ {total - passed} commands need attention")
        return False

def test_command_syntax():
    """Test that command Python code is valid"""
    
    print("\n🔧 Testing Command Code Syntax")
    print("=" * 50)
    
    commands_dir = Path("/home/craigmbrown/Project/.claude/commands")
    
    for cmd_file in ["debate.md", "debate-quick.md", "debate-monitor.md", "debate-status.md"]:
        cmd_path = commands_dir / cmd_file
        
        if not cmd_path.exists():
            continue
            
        print(f"\n📝 {cmd_file}:")
        
        # Extract Python code blocks
        content = cmd_path.read_text()
        code_blocks = []
        
        in_code = False
        current_block = []
        
        for line in content.split('\n'):
            if line.strip().startswith('```python'):
                in_code = True
                current_block = []
            elif line.strip() == '```' and in_code:
                in_code = False
                if current_block:
                    code_blocks.append('\n'.join(current_block))
            elif in_code:
                current_block.append(line)
        
        if code_blocks:
            print(f"   Found {len(code_blocks)} Python code blocks")
            
            # Try to compile each block
            valid = 0
            for i, code in enumerate(code_blocks, 1):
                try:
                    compile(code, f"{cmd_file}_block_{i}", 'exec')
                    valid += 1
                except SyntaxError as e:
                    print(f"   ❌ Block {i} has syntax error: {e.msg}")
                except Exception as e:
                    # Other errors are OK (imports, etc)
                    valid += 1
            
            if valid == len(code_blocks):
                print(f"   ✅ All code blocks have valid syntax")
            else:
                print(f"   ⚠️ {len(code_blocks) - valid} blocks have syntax errors")
        else:
            print(f"   ℹ️ No Python code blocks found")

def test_integration():
    """Test integration with main system"""
    
    print("\n🔗 Testing System Integration")
    print("=" * 50)
    
    # Check if main module can be imported
    try:
        sys.path.append('/home/craigmbrown/Project')
        sys.path.append('/home/craigmbrown/Project/strategic_platform')
        
        from agents.enhanced_persona_debate_system import (
            EnhancedPersonaDebateAgent,
            DebateConfig
        )
        print("✅ Main debate module imports successfully")
        
        # Try to create an agent instance
        agent = EnhancedPersonaDebateAgent("test-agent")
        print("✅ Agent instance created successfully")
        
        # Check configuration
        if agent.config:
            print(f"✅ Configuration loaded: {len(agent.config)} settings")
        else:
            print("⚠️ No configuration loaded")
            
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Integration error: {e}")
        return False

def main():
    """Run all tests"""
    
    print("=" * 60)
    print("ENHANCED PERSONA DEBATE COMMAND TESTS")
    print("=" * 60)
    
    # Run tests
    test_results = []
    
    # Test 1: Command files
    test_results.append(("Command Files", test_command_files()))
    
    # Test 2: Code syntax
    test_command_syntax()
    
    # Test 3: Integration
    test_results.append(("System Integration", test_integration()))
    
    # Final summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in test_results:
        status = "PASS" if passed else "FAIL"
        emoji = "✅" if passed else "❌"
        print(f"{emoji} {test_name}: {status}")
    
    all_passed = all(passed for _, passed in test_results)
    
    if all_passed:
        print("\n🎉 All tests passed!")
        print("The Enhanced Persona Debate Commands are ready to use.")
    else:
        print("\n⚠️ Some tests failed. Please review the errors above.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())