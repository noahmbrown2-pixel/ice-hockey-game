# SmartPack Agent Directory Navigation

**AGENT CATALOG - DO NOT DELETE**

This navigation file provides instant agent discovery and capability understanding, reducing token usage by cataloging all agents without reading each XML file.

**Purpose**: Agent inventory, specialization guide, handoff protocols
**Status**: Critical file for agent coordination and selection

## Directory Purpose

The `.claude/agents/` directory contains specialized AI agent definitions that handle specific aspects of SmartPack development. Each agent has unique expertise and follows structured handoff protocols for efficient collaboration.

## Agent Inventory by Priority

### Ship-Critical Agents (Priority 1)
Must work perfectly for application launch.

#### `smartpack-bug-crusher.xml`
**Specialization**: Critical bug identification and root cause analysis
- Identifies ship-blocking bugs
- Provides detailed reproduction steps
- Analyzes error patterns
- Creates fix recommendations
- **Handoff**: → code-fixer for implementation

#### `smartpack-functional-validator.xml`
**Specialization**: End-to-end functionality validation
- Manual-first testing approach
- Fail-fast validation protocol
- Ship readiness assessment
- Integration health checks
- **Handoff**: ← All agents for validation, → coordinator for decisions

#### `smartpack-ui-polish-specialist.xml`
**Specialization**: Visual polish and animations
- Smooth transitions
- Micro-interactions
- Loading states
- Visual feedback
- Professional polish
- **Handoff**: → functional-validator for UX validation

### Ship-Quality Agents (Priority 2)
Enhance user experience and product quality.

#### `smartpack-visual-designer.xml`
**Specialization**: Design system and visual consistency
- Color schemes
- Typography
- Component styling
- Brand consistency
- Responsive design
- **Handoff**: → ui-polish-specialist for implementation

#### `smartpack-mobile-ux-specialist.xml`
**Specialization**: Mobile-first experience optimization
- Touch interactions
- Responsive layouts
- Mobile performance
- Gesture support
- Device-specific features
- **Handoff**: → functional-validator for mobile testing

#### `smartpack-integration-fixer.xml`
**Specialization**: API and service integration
- Ollama AI integration
- Weather API connectivity
- LocalStorage management
- Service reliability
- Error recovery
- **Handoff**: ← bug-crusher for integration issues

#### `smartpack-performance-enhancer.xml`
**Specialization**: Application performance optimization
- Bundle size reduction
- Load time improvement
- Runtime optimization
- Memory management
- Caching strategies
- **Handoff**: → functional-validator for performance validation

### Foundation Agents (Priority 3)
Core implementation and coordination support.

#### `smartpack-coordinator.xml`
**Specialization**: Workflow orchestration and agent coordination
- Task assignment
- Priority management
- Handoff coordination
- Progress tracking
- Ship timeline management
- **Handoff**: ↔ All agents for task coordination

#### `smartpack-code-fixer.xml`
**Specialization**: Code implementation and bug fixes
- Feature development
- Bug resolution
- Refactoring
- Code quality
- Technical debt
- **Handoff**: ← bug-crusher for fixes, → functional-validator for testing

#### `smartpack-architecture-analyzer.xml`
**Specialization**: System analysis and architecture
- Dependency analysis
- Architecture decisions
- System design
- Technical planning
- Migration strategies
- **Handoff**: → coordinator for planning, → code-fixer for implementation

#### `smartpack-test-specialist.xml`
**Specialization**: Focused component testing
- Unit test creation
- Test fixes
- Coverage improvement
- Mock implementation
- Test patterns
- **Handoff**: → test-auditor for comprehensive analysis

#### `smartpack-test-auditor.xml`
**Specialization**: System-wide test analysis
- Test suite health
- Coverage analysis
- Test strategy
- Quality metrics
- Testing gaps
- **Handoff**: ← test-specialist for specific fixes

#### `smartpack-context-extractor.xml`
**Specialization**: Conversation context preservation
- Context extraction
- Documentation updates
- Knowledge preservation
- Session summaries
- Memory management
- **Handoff**: → coordinator for context sharing

#### `smartpack-ux-flow-optimizer.xml`
**Specialization**: User experience flow enhancement
- Workflow optimization
- User journey improvement
- Friction reduction
- Intuitive navigation
- Conversion optimization
- **Handoff**: → functional-validator for UX validation

#### `smartpack-integrity-auditor.xml`
**Specialization**: File and documentation protection
- Protects critical files
- Prevents accidental deletion
- Maintains documentation integrity
- Enforces protocols
- **Handoff**: → coordinator for violations

## Agent Coordination Patterns

### Bug Resolution Flow
```
1. bug-crusher (identify) 
   ↓
2. code-fixer (implement)
   ↓
3. functional-validator (verify)
   ↓
4. coordinator (close)
```

### Feature Implementation Flow
```
1. architecture-analyzer (design)
   ↓
2. code-fixer (implement)
   ↓
3. test-specialist (test)
   ↓
4. functional-validator (validate)
   ↓
5. ui-polish-specialist (polish)
```

### UX Enhancement Flow
```
1. ux-flow-optimizer (analyze)
   ↓
2. visual-designer (design)
   ↓
3. ui-polish-specialist (implement)
   ↓
4. mobile-ux-specialist (optimize)
   ↓
5. functional-validator (validate)
```

### Integration Fix Flow
```
1. bug-crusher (identify issue)
   ↓
2. integration-fixer (diagnose)
   ↓
3. code-fixer (implement fix)
   ↓
4. functional-validator (verify)
```

## Agent Selection Guide

### When to Use Each Agent

**For Bugs and Errors**:
- Start with `bug-crusher` for identification
- Use `code-fixer` for implementation
- Validate with `functional-validator`

**For UI/UX Issues**:
- Use `ux-flow-optimizer` for workflow issues
- Use `visual-designer` for design problems
- Use `ui-polish-specialist` for polish
- Use `mobile-ux-specialist` for mobile issues

**For Integration Problems**:
- Use `integration-fixer` for API issues
- Use `bug-crusher` for error analysis
- Use `code-fixer` for implementation

**For Performance Issues**:
- Use `performance-enhancer` for optimization
- Use `architecture-analyzer` for system issues
- Use `functional-validator` for validation

**For Testing**:
- Use `test-specialist` for specific tests
- Use `test-auditor` for comprehensive analysis
- Use `functional-validator` for E2E testing

**For Coordination**:
- Use `coordinator` for task management
- Use `context-extractor` for knowledge preservation
- Use `integrity-auditor` for file protection

## Agent Communication Protocol

### Scratchpad Integration
All agents use `.claude/scratchpad.xml` for:
- Current session context
- Task assignments
- Progress updates
- Handoff notes
- Validation results

### Handoff Protocol
1. **Completing agent** updates scratchpad with results
2. **Completing agent** identifies next agent needed
3. **Coordinator** assigns task to next agent
4. **Receiving agent** reads context from scratchpad
5. **Receiving agent** continues work

### Status Tracking
Agents update task status in scratchpad:
- `PENDING` - Not started
- `IN_PROGRESS` - Currently working
- `TESTING` - In validation
- `BLOCKED` - Waiting for dependency
- `COMPLETED` - Finished successfully
- `FAILED` - Could not complete

## Agent Files

### Core Files
- **Agent Definitions** (`*.xml`) - Detailed agent specifications
- **`detailed-descriptions.xml`** - Extended agent descriptions
- **`CLAUDE.md`** - This navigation file

### Supporting Files
- **Scratchpad** (`../.claude/scratchpad.xml`) - Session context
- **Active Worktrees** (`../active-worktrees/`) - Task tracking
- **Schemas** (`../schemas/`) - XML validation schemas

## Best Practices

### Agent Usage
1. Always start with the right specialist
2. Follow established handoff patterns
3. Update scratchpad with progress
4. Validate work with functional-validator
5. Coordinate through coordinator

### Task Assignment
1. Identify the problem domain
2. Select appropriate specialist
3. Provide clear context
4. Define success criteria
5. Track progress in scratchpad

### Quality Assurance
1. All changes validated by functional-validator
2. UI changes reviewed by ui-polish-specialist
3. Mobile changes tested by mobile-ux-specialist
4. Integration changes verified by integration-fixer
5. Ship readiness confirmed by functional-validator

## Common Workflows

### Adding New Feature
1. `architecture-analyzer` - Design approach
2. `code-fixer` - Implement feature
3. `test-specialist` - Add tests
4. `ui-polish-specialist` - Add polish
5. `functional-validator` - Validate complete

### Fixing Critical Bug
1. `bug-crusher` - Analyze issue
2. `code-fixer` - Implement fix
3. `test-specialist` - Add regression test
4. `functional-validator` - Verify fix
5. `coordinator` - Close issue

### Improving Performance
1. `performance-enhancer` - Identify bottlenecks
2. `architecture-analyzer` - Design solution
3. `code-fixer` - Implement optimizations
4. `functional-validator` - Verify improvements

## Agent Capabilities Matrix

| Agent | Bug Fix | Feature | UI/UX | Testing | Analysis | Validation |
|-------|---------|---------|--------|---------|----------|------------|
| bug-crusher | ✓✓✓ | | | ✓ | ✓✓✓ | |
| code-fixer | ✓✓ | ✓✓✓ | ✓ | | | |
| functional-validator | | | ✓ | ✓✓✓ | ✓ | ✓✓✓ |
| ui-polish-specialist | | ✓ | ✓✓✓ | | | |
| visual-designer | | ✓ | ✓✓✓ | | ✓ | |
| mobile-ux-specialist | | ✓ | ✓✓✓ | ✓ | | |
| integration-fixer | ✓✓ | ✓ | | ✓ | ✓✓ | |
| performance-enhancer | ✓ | ✓ | | | ✓✓✓ | |
| architecture-analyzer | | ✓✓ | | | ✓✓✓ | |
| test-specialist | | | | ✓✓✓ | | |
| test-auditor | | | | ✓✓ | ✓✓✓ | |
| ux-flow-optimizer | | ✓ | ✓✓✓ | | ✓✓ | |
| coordinator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Legend: ✓✓✓ = Primary expertise, ✓✓ = Secondary capability, ✓ = Basic support