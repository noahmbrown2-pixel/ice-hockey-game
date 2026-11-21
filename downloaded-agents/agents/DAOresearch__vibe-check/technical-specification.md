# Technical Specification: @dao/vibe-check

**Version**: 1.4
**Status**: Implementation Ready
**Purpose**: Authoritative technical reference for implementation

**Changelog**:
- v1.4 (2025-10-06): **Final Release - Implementation Ready** ✅
  - All 53 specification issues resolved (Phase 2: 24 issues, Phase 2.1: 29 issues)
  - Complete type system with all interfaces defined
  - Full implementation guidance in Section 6
  - Battle-tested through 2 comprehensive audit cycles
  - Status changed from "Phase 2.1 In Progress" to "Implementation Ready"
- v1.4-beta.4 (2025-10-06): **Phase 2.1 - Batch 5: Spec Issues (Documentation Gaps Deferred)** ✅
  - **Added Section 3.5: Bundle Cleanup Policy** - Time-based retention with manual override
    - Automatic cleanup of bundles older than 30 days (configurable)
    - Manual cleanup API: `cleanupBundles({ maxAgeDays: 7 })`
    - Protected bundles via `.vibe-keep` marker file
    - Disk space threshold monitoring (`minFreeDiskMb`)
    - CI-specific configuration guidance
  - **Enhanced watcher execution documentation** - Clarified sequential guarantees
    - Added execution guarantees to Section 1.2 (AgentExecution.watch JSDoc)
    - Added detailed comment to Section 6.3 (ContextManager.runWatchers)
    - Explicitly documented: sequential execution, no parallelism, no race conditions
  - **Verification of false positives:**
    - Issue #26 (Reporter Naming): Already fixed in v1.4
    - Issue #27 (TestAttachment): Already fixed in v1.4-beta.2 (duplicate of Batch 2 Issue #8)
    - Issue #28 (judge() Signature): Already fixed in v1.4-alpha.3
  - **Documentation Gaps (#16-24): DEFERRED** - MDX docs will be completed in Phase 3
  - **Issues Resolved**: #25 (Bundle Cleanup), #29 (Watcher Race Conditions clarified)
- v1.4-beta.3 (2025-10-06): **Phase 2.1 - Batch 4: Structural Improvements** ✅
  - **Structural Reorganization**: Improved spec organization and clarity
    - Created Section 1.12: AgentConfig interface (moved from Section 2.3)
    - Created Section 1.13: Constants (DEFAULT_MODEL moved from Section 2.4)
    - Created Section 2.9: MCP Server Integration Examples (moved from Section 1.9)
    - Updated Section 2.3: defineAgent now references AgentConfig from Section 1.12
    - Updated Section 2.4: References DEFAULT_MODEL from Section 1.13
  - Fixed file structure in Section 5.3: Removed non-existent WorkflowRunner.ts
  - Enhanced timeline documentation in Section 1.5: Added batching behavior explanation with examples
  - **Result**: All type definitions in Section 1, constants centralized, examples in Section 2
  - **Issues Resolved**: All 5 structural issues from Batch 4 (#11-#15)
- v1.4-beta.2 (2025-10-06): **Phase 2.1 - Batch 2 & 3: Missing Implementations + API Consistency** ✅
  - Fixed TestAttachment type conflict: removed custom definition, use vitest's type
  - Verified 5 other audit issues were false positives (already implemented in v1.4):
    - ContextManager.getPartialResult() exists (Section 4.2:1573)
    - ContextManager.processHookEvent() exists with full implementation (Section 4.2:1580-1684)
    - Git detection logic exists: detectGitRepo() + captureGitState() (Section 4.2:1690-1720)
    - Judge formatJudgePrompt() exists (Section 6.4:2640-2664)
    - Judge parseJudgmentResponse() exists (Section 6.4:2670-2682)
  - **Issues Resolved**: Issue #6 fixed, Issues #5, #8 confirmed as non-issues
- v1.4-beta.1 (2025-10-06): **Phase 2.1 - Batch 1: Type System Conflicts** ✅
  - **BREAKING**: Unified Rubric to ONE standard format with custom criteria support
    - Rubric is now a proper interface (not union type or unknown)
    - Fixed structure: name, criteria array, optional model/passThreshold
    - Users define their own criteria within the standard format
    - Renamed StandardRubricSchema → RubricSchema (runtime validation)
  - Removed helper functions: validateRubric() and createStructuredRubric() (not needed)
  - Removed SDKUserMessage fallback definition (SDK type confirmed to exist)
  - Updated SDK bridge layer (Section 5.5): removed fallback types, simplified imports
  - Added Section 6.5: prompt() Implementation showing async generator pattern
  - Fixed file path: sdk/types.ts → sdk/bridge.ts throughout spec
  - **Issues Resolved**: Critical blockers #2, #3, #4, #7 from Audit v2
- v1.4 (Batch 7/7): Naming, Documentation & Minor Fixes
  - Fixed reporter naming: Clarified VibeCostReporter vs VibeHtmlReporter (Section 4.3)
  - Renamed TestContextManager → _TestContextManager to mark as internal (Sections 4.4, 5.3)
  - Added workspace configuration precedence documentation (Section 4.4)
  - Clarified file lazy loading API: when to use text() vs stream() (Section 1.6)
  - Added MCP server configuration examples (Section 1.9)
  - **All 24 specification issues resolved** ✅
- v1.4-alpha.6 (Batch 6/7): Hook Capture & RunResult Enhancements
  - Added hookCaptureStatus field to RunResult interface (Section 1.5)
  - Added Section 4.2.2: Error Handling and Git Detection with graceful degradation
  - Updated Section 7.1: Formalized graceful degradation policy for hook failures
  - Added toHaveCompleteHookData() matcher (Section 2.8)
  - Added git detection logic (detectGitRepo, captureGitState methods)
  - Established error logging standards (stderr for warnings, structured format)
- v1.4-alpha.5 (Batch 5/7): API Signature Alignments & Model Defaults
  - Added DEFAULT_MODEL constant with env var support (Section 2.4)
  - Updated RunAgentOptions: prompt now accepts string | AsyncIterable<SDKUserMessage> (Section 1.9)
  - Updated defineAgent implementation to use DEFAULT_MODEL (Section 2.3)
  - Added Section 5.6: Model Selection and Cost Optimization guide
  - Fixed model default documentation throughout spec
- v1.4-alpha.4 (Batch 4/7): Dependencies & Package Setup
  - Added zod-to-json-schema to dependencies (Section 5.1)
  - Fixed: All core dependencies now explicitly listed
- v1.4-alpha.3 (Batch 3/7): Judge System Complete
  - **BREAKING**: Changed Rubric type from `unknown` to union of StructuredRubric | FreeformRubric
  - Added StructuredRubric interface for type-safe rubrics (Section 1.10)
  - Added FreeformRubric type for flexible rubrics (Section 1.10)
  - Updated DefaultJudgmentResult with criteria field (Section 1.10)
  - Added Section 2.5: Helper Functions (createStructuredRubric, validateRubric)
  - Renumbered sections: 2.5→2.6, 2.6→2.7, 2.7→2.8
  - Added JUDGE_SYSTEM_PROMPT constant (Section 6.4)
  - Added JudgmentFailedError class (Section 6.4)
  - Added parseJudgmentResponse function (Section 6.4)
  - Added zodToJsonSchema import (Section 6.4)
  - Fixed: judge() signatures now consistent between fixture and standalone
- v1.4-alpha.2 (Batch 2/7): AgentExecution & Reactive Watchers
  - **BREAKING**: Changed AgentExecution from Promise subclass to thenable class
  - Added WatcherFn type definition (Section 1.2)
  - Updated AgentExecution with then/catch/finally/abort methods
  - Added real-time watcher processing (Section 4.2.1)
  - Updated runAgent() return type: AgentExecution (not Promise<RunResult>)
  - Added ContextManager methods: getPartialResult(), processHookEvent()
- v1.4-alpha.1 (Batch 1/7): SDK Integration & Type Foundations
  - Added Section 5.5: SDK Integration Layer (bridge pattern)
  - Fixed: SDKUserMessage type import via SDK bridge
  - Fixed: query() function import via SDK bridge
  - Fixed: TestAttachment import from vitest
- v1.3: Updated prompt() for multi-modal support; Updated judge() with generic type parameter and user-defined rubrics
- v1.2: Added cumulative state tracking to VibeTestContext (files, tools, timeline)
- v1.1: Added reactive watchers for early test failure (AgentExecution.watch)
- v1.0: Initial specification

---

## 1. Core Type Definitions

### 1.1 VibeTestContext

```typescript
// Type imports
import type { TestAttachment } from 'vitest';

/**
 * Context provided to vibeTest functions via test.extend fixtures.
 * Optimized for evaluation and testing workflows.
 */
export interface VibeTestContext {
  /**
   * Execute an agent with the given options.
   * Automatically captures hooks, git state, file changes, and tool calls.
   * Returns an AgentExecution (Promise + watch method) for reactive assertions.
   *
   * State accumulates across multiple runAgent() calls in the same test.
   * Access cumulative state via context.files, context.tools, etc.
   */
  runAgent(opts: RunAgentOptions): AgentExecution;

  /**
   * Evaluate a RunResult using LLM-based judgment.
   * Judge is a specialized agent that formats rubric into a prompt internally.
   *
   * @param result - The RunResult to evaluate
   * @param options - Judgment configuration
   * @returns Structured judgment result (type-safe via generic)
   */
  judge<T = DefaultJudgmentResult>(
    result: RunResult,
    options: {
      /** Evaluation criteria (user-defined structure) */
      rubric: Rubric;
      /** Custom instructions for how to evaluate */
      instructions?: string;
      /** Expected output format schema (Zod schema for type safety) */
      resultFormat?: z.ZodType<T>;
      /** Throw error if judgment fails */
      throwOnFail?: boolean;
    }
  ): Promise<T>;

  /**
   * Context-bound expect for snapshot concurrency safety.
   * Use this instead of global expect in concurrent tests.
   */
  expect: typeof import('vitest')['expect'];

  /**
   * Stream annotations to reporters in real-time.
   * Vitest moves attachment paths to attachmentsDir automatically.
   */
  annotate(
    message: string,
    type?: string,
    attachment?: TestAttachment
  ): Promise<void>;

  /**
   * Access to Vitest task metadata for custom meta storage.
   */
  task: import('vitest').TestContext['task'];

  /**
   * Access cumulative file changes across all runAgent() calls in this test.
   * Similar to WorkflowContext.files but for test context.
   */
  files: {
    /** Get all files changed across all agent runs in this test */
    changed(): FileChange[];
    /** Get specific file by path */
    get(path: string): FileChange | undefined;
    /** Filter files by glob pattern */
    filter(glob: string | string[]): FileChange[];
    /** Get change statistics */
    stats(): {
      added: number;
      modified: number;
      deleted: number;
      renamed: number;
      total: number;
    };
  };

  /**
   * Access cumulative tool calls across all runAgent() calls in this test.
   */
  tools: {
    /** Get all tool calls */
    all(): ToolCall[];
    /** Count uses of a specific tool */
    used(name: string): number;
    /** Find first use of a specific tool */
    findFirst(name: string): ToolCall | undefined;
    /** Get failed tool calls */
    failed(): ToolCall[];
    /** Get successful tool calls */
    succeeded(): ToolCall[];
  };

  /**
   * Access unified timeline of events across all runAgent() calls.
   */
  timeline: {
    /** Async iterator over all timeline events */
    events(): AsyncIterable<TimelineEvent>;
  };
}

declare module 'vitest' {
  export interface TestContext extends VibeTestContext {}
}
```

### 1.2 AgentExecution

```typescript
/**
 * WatcherFn is called during agent execution with partial state.
 * Can be sync or async. If it throws, execution aborts immediately.
 */
export type WatcherFn = (ctx: PartialRunResult) => void | Promise<void>;

/**
 * Execution handle returned by runAgent() and stage().
 * Thenable class (not Promise subclass) with reactive watch capabilities.
 *
 * Allows assertions to run during agent execution for early test failure.
 *
 * NOTE: This is a thenable object (implements then/catch/finally) but NOT
 * a Promise subclass. It's fully awaitable and works with Promise.all/race,
 * but `instanceof Promise` returns false.
 */
export class AgentExecution {
  private promise: Promise<RunResult>;
  private abortController: AbortController;
  private watchers: WatcherFn[];

  /**
   * Register a watcher function that runs during execution.
   * Watchers are invoked after each significant hook event:
   * - PostToolUse (after each tool completes)
   * - TodoUpdate (when TODO status changes)
   * - Notification (when agent sends notifications)
   *
   * **Execution Guarantees:**
   * - Watchers execute SEQUENTIALLY in registration order (not parallel)
   * - Each watcher completes before the next starts
   * - If any watcher throws, execution aborts immediately (subsequent watchers don't run)
   * - No race conditions: only one watcher runs at a time
   *
   * Use expect() inside watchers to assert conditions for fail-fast behavior.
   *
   * @param fn - Watcher function receiving partial execution state
   * @returns this (for chaining)
   *
   * @example Fail-fast on file violations
   * const execution = runAgent({ agent, prompt: '/refactor' });
   * execution.watch(({ files }) => {
   *   expect(files).toModifyOnly(['src/**']);
   * });
   * const result = await execution; // Aborts if database files touched
   *
   * @example Multiple watchers (sequential execution, first failure aborts)
   * execution
   *   .watch(({ tools }) => expect(tools.failed().length).toBeLessThan(3))
   *   .watch(({ metrics }) => expect(metrics.totalCostUsd).toBeLessThan(5.0));
   * // Watcher 1 runs first, then watcher 2 (if watcher 1 passes)
   */
  watch(fn: WatcherFn): this;

  /**
   * Make AgentExecution awaitable (thenable interface).
   * Allows: await execution, Promise.all([execution1, execution2]), etc.
   */
  then<T, U>(
    onFulfilled?: (value: RunResult) => T | Promise<T>,
    onRejected?: (reason: unknown) => U | Promise<U>
  ): Promise<T | U>;

  /**
   * Handle errors from execution or watchers.
   */
  catch<U>(onRejected?: (reason: unknown) => U | Promise<U>): Promise<RunResult | U>;

  /**
   * Cleanup handler (runs whether success or failure).
   */
  finally(onFinally?: () => void): Promise<RunResult>;

  /**
   * Manually abort the execution.
   * Use this to cancel long-running agents programmatically.
   *
   * @param reason - Optional abort reason
   *
   * @example Timeout implementation
   * const execution = runAgent({ agent, prompt });
   * setTimeout(() => execution.abort('Timeout'), 60000);
   * await execution; // Rejects with abort reason
   */
  abort(reason?: string): void;
}
```

### 1.3 PartialRunResult

```typescript
/**
 * Partial execution state available during agent run.
 * Similar to RunResult but represents in-progress execution.
 * Used by watchers for reactive assertions.
 */
export interface PartialRunResult {
  /**
   * Current metrics (incomplete until execution finishes).
   */
  readonly metrics: {
    /** Total tokens consumed so far */
    totalTokens?: number;
    /** Total cost in USD so far */
    totalCostUsd?: number;
    /** Wall clock duration so far (ms) */
    durationMs?: number;
    /** Number of tool calls completed */
    toolCalls?: number;
    /** Number of files changed so far */
    filesChanged?: number;
  };

  /**
   * Tool calls completed or in-progress.
   */
  readonly tools: {
    /** All tool calls (completed + in-progress) */
    all(): ToolCall[];
    /** Failed tool calls */
    failed(): ToolCall[];
    /** Successful tool calls */
    succeeded(): ToolCall[];
    /** Tool calls in progress (PreToolUse received, no PostToolUse yet) */
    inProgress(): ToolCall[];
  };

  /**
   * TODO items with current status.
   */
  readonly todos: Array<{
    text: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;

  /**
   * Files changed so far (based on completed tool calls).
   * May be incomplete if execution is still in progress.
   */
  readonly files: {
    /** Files changed so far */
    changed(): FileChange[];
    /** Get specific file */
    get(path: string): FileChange | undefined;
  };

  /**
   * Whether execution has completed.
   * False during execution, true after finalization.
   */
  readonly isComplete: boolean;
}
```

### 1.4 WorkflowContext

```typescript
/**
 * Context provided to vibeWorkflow functions.
 * Optimized for multi-stage automation pipelines with cumulative state.
 */
export interface WorkflowContext {
  /**
   * Execute one stage of the workflow.
   * Returns AgentExecution for this stage and accumulates into workflow state.
   */
  stage(name: string, opts: RunAgentOptions): AgentExecution;

  /**
   * Access cumulative file changes across all stages.
   */
  files: {
    /** Get all files changed across all stages */
    allChanged(): FileChange[];
    /** Get files changed in a specific stage (or current if omitted) */
    byStage(stageName?: string): FileChange[];
  };

  /**
   * Access cumulative tool calls across all stages.
   */
  tools: {
    /** Get all tool calls with stage context */
    all(): Array<{ stage: string; call: ToolCall }>;
  };

  /**
   * Access unified timeline of events across all stages.
   */
  timeline: {
    /** Async iterator over timeline events with stage context */
    events(): AsyncIterable<{ stage: string; evt: TimelineEvent }>;
  };

  /**
   * Loop helper for iterative workflows.
   * Executes body until predicate returns true or max iterations reached.
   *
   * @param predicate - Function that receives latest RunResult and returns true to stop
   * @param body - Function to execute each iteration (returns RunResult)
   * @param opts.maxIterations - Maximum iterations before stopping (default: 10)
   * @returns Array of RunResults from all iterations
   */
  until(
    predicate: (latest: RunResult) => boolean | Promise<boolean>,
    body: () => Promise<RunResult>,
    opts?: { maxIterations?: number }
  ): Promise<RunResult[]>;

  /**
   * Default configuration for all stages in this workflow.
   * Individual stages can override these values.
   */
  defaults: {
    workspace?: string;
    model?: string;
  };
}
```

### 1.5 RunResult

```typescript
/**
 * Result of an agent execution with auto-captured context.
 * All heavy data is persisted in a RunBundle on disk.
 * This interface provides lazy accessors to that data.
 */
export interface RunResult {
  /**
   * Absolute path to the on-disk RunBundle directory.
   * Contains: events.ndjson, hooks.ndjson, summary.json, files/{before,after}/
   */
  readonly bundleDir: string;

  /**
   * High-level metrics aggregated from SDK usage and wall time.
   */
  readonly metrics: {
    /** Total tokens consumed (input + output) */
    totalTokens?: number;
    /** Total cost in USD */
    totalCostUsd?: number;
    /** Wall clock duration in milliseconds */
    durationMs?: number;
    /** Number of tool calls executed */
    toolCalls?: number;
    /** Number of files changed */
    filesChanged?: number;
  };

  /**
   * Conversation messages (assistant/user/tool) with lazy content loading.
   * Only summaries are kept in memory; full content loaded on demand.
   */
  readonly messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    /** First 120 chars or structured title */
    summary: string;
    /** Unix timestamp (ms) */
    ts: number;
    /** Load full message content from bundle */
    load(): Promise<unknown>;
  }>;

  /**
   * TODO items tracked by SDK stream with final status.
   */
  readonly todos: Array<{
    text: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;

  /**
   * Git state before and after agent execution (if workspace is git-managed).
   */
  readonly git: {
    /** Git state before execution */
    before?: { head: string; dirty: boolean };
    /** Git state after execution */
    after?: { head: string; dirty: boolean };
    /** Number of files changed (shortcut) */
    changedCount: number;
    /**
     * Parsed output of `git diff --name-status`
     * Lazy-loaded from bundle
     */
    diffSummary(): Promise<
      Array<{
        path: string;
        change: 'A' | 'M' | 'D' | 'R';
        oldPath?: string;
      }>
    >;
  };

  /**
   * File changes correlated from hooks + git with lazy content access.
   * File contents are stored content-addressed in bundle; loaded on demand.
   */
  readonly files: {
    /** Get all changed files as structured objects */
    changed(): FileChange[];
    /** Fast lookup by path */
    get(path: string): FileChange | undefined;
    /** Filter by glob pattern(s) */
    filter(glob: string | string[]): FileChange[];
    /** Get change statistics */
    stats(): {
      added: number;
      modified: number;
      deleted: number;
      renamed: number;
      total: number;
    };
  };

  /**
   * Tool calls correlated from PreToolUse/PostToolUse hooks.
   */
  readonly tools: {
    /** Get all tool calls */
    all(): ToolCall[];
    /** Count uses of a specific tool */
    used(name: string): number;
    /** Find first use of a specific tool */
    findFirst(name: string): ToolCall | undefined;
  };

  /**
   * Unified timeline of SDK events + hook events.
   * Reporters iterate this to render execution flow.
   */
  readonly timeline: {
    /**
     * Async iterator over timeline events.
     *
     * Events are normally yielded individually, but may be batched when:
     * - Multiple events occur within the same event loop tick
     * - Reporter needs to group related events (e.g., tool call + result)
     *
     * Consumers should handle both single events and arrays.
     *
     * @example Handling batched events
     * for await (const item of result.timeline.events()) {
     *   const events = Array.isArray(item) ? item : [item];
     *   for (const event of events) {
     *     console.log(event.type, event.timestamp);
     *   }
     * }
     */
    events(): AsyncIterable<TimelineEvent | TimelineEvent[]>;
  };

  /**
   * Hook capture status and diagnostics.
   * Indicates whether all hook events were successfully captured.
   * Used for debugging hook capture issues in graceful degradation mode.
   */
  readonly hookCaptureStatus: {
    /** Whether all expected hook events were captured */
    complete: boolean;
    /** Names of hook events that failed to capture */
    missingEvents: string[];
    /** Warning messages from hook capture failures */
    warnings: string[];
  };

  /**
   * Optional: forward annotations from test code to reporters.
   * Useful for custom milestones or debugging.
   */
  annotate?(
    message: string,
    type?: string,
    attachment?: {
      path?: string;
      body?: string | Buffer;
      contentType?: string;
    }
  ): Promise<void>;
}
```

### 1.6 FileChange

```typescript
/**
 * Represents one file change with lazy content access.
 * Content is stored content-addressed in RunBundle; loaded on demand.
 */
export interface FileChange {
  /** Relative path from workspace root */
  path: string;

  /** Type of change */
  changeType: 'added' | 'modified' | 'deleted' | 'renamed';

  /** If renamed, the previous path */
  oldPath?: string;

  /**
   * File content before change (if exists).
   * Content loaded lazily from bundle.
   */
  before?: {
    /** SHA-256 hash of content (for content-addressed storage) */
    sha256: string;
    /** File size in bytes */
    size: number;
    /**
     * Load full text content into memory (decompresses if gzipped).
     * Use for files <10MB. For larger files, use stream() instead.
     */
    text(): Promise<string>;
    /**
     * Stream file content for memory-efficient processing.
     * Use for files >10MB or when processing line-by-line.
     * Returns a readable stream that can be piped or iterated.
     */
    stream(): NodeJS.ReadableStream;
  };

  /**
   * File content after change (if exists).
   * Content loaded lazily from bundle.
   */
  after?: {
    sha256: string;
    size: number;
    /**
     * Load full text content into memory (decompresses if gzipped).
     * Use for files <10MB. For larger files, use stream() instead.
     */
    text(): Promise<string>;
    /**
     * Stream file content for memory-efficient processing.
     * Use for files >10MB or when processing line-by-line.
     * Returns a readable stream that can be piped or iterated.
     */
    stream(): NodeJS.ReadableStream;
  };

  /**
   * Quick diff statistics (lines added/deleted/chunks).
   * Computed from git diff; included in summary.json.
   */
  stats?: {
    added: number;
    deleted: number;
    chunks: number;
  };

  /**
   * Render a diff patch for this file.
   * @param format - 'unified' (default) or 'json' structured diff
   */
  patch(format?: 'unified' | 'json'): Promise<string | object>;
}
```

### 1.7 ToolCall

```typescript
/**
 * Represents one tool invocation correlated from PreToolUse/PostToolUse hooks.
 */
export interface ToolCall {
  /** Tool name (e.g., 'Edit', 'Bash', 'Read') */
  name: string;

  /** JSON-safe input parameters */
  input: unknown;

  /** JSON-safe output/response (if PostToolUse received) */
  output?: unknown;

  /** Success status (false if missing PostToolUse or error) */
  ok: boolean;

  /** Working directory when tool was invoked */
  cwd?: string;

  /** Unix timestamp (ms) when tool started */
  startedAt: number;

  /** Unix timestamp (ms) when tool completed (if PostToolUse received) */
  endedAt?: number;

  /** Duration in milliseconds (if completed) */
  durationMs?: number;

  /**
   * Raw hook payload references for reporters.
   * Offsets into hooks.ndjson file.
   */
  raw?: {
    preHookOffset: number;
    postHookOffset?: number;
  };
}
```

### 1.8 TimelineEvent

```typescript
/**
 * Unified timeline event from SDK stream or hooks.
 * Reporters use this to visualize execution flow.
 */
export type TimelineEvent =
  | {
      type: 'sdk-message';
      role: 'assistant' | 'user' | 'tool';
      ts: number;
      /** Reference to message index */
      ref?: number;
    }
  | {
      type: 'hook';
      name:
        | 'PreToolUse'
        | 'PostToolUse'
        | 'Notification'
        | 'Stop'
        | 'SubagentStop'
        | 'SessionStart'
        | 'SessionEnd';
      ts: number;
      /** Reference to hook index */
      ref?: number;
    }
  | {
      type: 'todo';
      ts: number;
      items: Array<{ text: string; status: string }>;
    };
```

### 1.9 RunAgentOptions

```typescript
/**
 * Configuration for agent execution.
 * Used by both runAgent (vibeTest) and stage (vibeWorkflow).
 */
export interface RunAgentOptions {
  /** User prompt (string or multi-modal message iterable from prompt() helper) */
  prompt: string | AsyncIterable<SDKUserMessage>;

  /** Model to use (default: DEFAULT_MODEL from environment or 'claude-3-5-sonnet-latest') */
  model?: string;

  /** Allowed tools whitelist (restricts tool access) */
  allowedTools?: string[];

  /** MCP server configurations (namespaced tool exposure) */
  mcpServers?: Record<string, MCPServerConfig>;

  /** Execution timeout in milliseconds (default: 300000 = 5min) */
  timeoutMs?: number;

  /** Maximum conversation turns (default: 20) */
  maxTurns?: number;

  /** System prompt configuration */
  systemPrompt?: {
    /** Preset name (e.g., 'default', 'creative') */
    preset?: string;
    /** Additional text to append to system prompt */
    append?: string;
  };

  /**
   * Workspace directory override.
   * If not specified, uses default from workflow/test config.
   */
  workspace?: string;

  /**
   * Previous context to continue from.
   * Used for multi-turn workflows.
   */
  context?: RunResult;
}

/**
 * MCP server configuration.
 * Model Context Protocol servers extend agent capabilities with custom tools.
 *
 * @see https://modelcontextprotocol.io for MCP specification
 */
export interface MCPServerConfig {
  /** Server command (e.g., 'node', 'python') */
  command: string;
  /** Server arguments */
  args?: string[];
  /** Environment variables */
  env?: Record<string, string>;
  /** Allowed tool names from this server */
  allowedTools?: string[];
}
```

**Note:** See Section 2.9 for MCP server usage examples.

### 1.10 JudgeResult & Rubric

```typescript
/**
 * Rubric: Standard format for defining evaluation criteria.
 *
 * Define your own criteria - the structure is fixed, but the criteria are yours.
 *
 * @example Basic rubric with custom criteria
 * const rubric: Rubric = {
 *   name: "Code Quality",
 *   criteria: [
 *     {
 *       name: "correctness",
 *       description: "Code works as intended",
 *       weight: 0.5
 *     },
 *     {
 *       name: "style",
 *       description: "Follows style guide",
 *       weight: 0.3
 *     },
 *     {
 *       name: "tests",
 *       description: "Has comprehensive tests",
 *       weight: 0.2
 *     }
 *   ],
 *   passThreshold: 0.7
 * };
 *
 * @example Simple rubric (equal weights)
 * const rubric: Rubric = {
 *   name: "PR Review",
 *   criteria: [
 *     { name: "has_tests", description: "Has tests" },
 *     { name: "no_todos", description: "No TODO comments" },
 *     { name: "clean_code", description: "Code is readable" }
 *   ]
 * };
 */
export interface Rubric {
  /** Name of the rubric */
  name: string;

  /** Evaluation criteria - define your own! */
  criteria: Array<{
    /** Unique name for this criterion */
    name: string;
    /** What this criterion evaluates */
    description: string;
    /** Optional: Importance weight (0-1, defaults to equal weighting) */
    weight?: number;
    /** Optional: Minimum score to pass this criterion (0-1, default 0.5) */
    threshold?: number;
  }>;

  /** Optional: Model to use for judging (overrides default) */
  model?: string;

  /** Optional: Overall pass threshold (0-1, default 0.7) */
  passThreshold?: number;
}

/**
 * Default judgment result structure.
 * Returned by judge() when no custom resultFormat is provided.
 *
 * Users can define custom result types via the generic parameter:
 * judge<MyCustomResult>(result, { resultFormat: MyCustomSchema })
 */
export interface DefaultJudgmentResult {
  /** Overall pass/fail */
  passed: boolean;

  /** Overall score (0-1, optional) */
  score?: number;

  /** Per-criterion evaluation results */
  criteria: Record<string, {
    /** Whether this criterion passed */
    passed: boolean;
    /** Explanation for the judgment */
    reason: string;
  }>;

  /** Overall feedback (optional) */
  feedback?: string;
}
```

### 1.12 Agent Configuration

```typescript
/**
 * Agent configuration interface.
 * Used by defineAgent() to create reusable agent configurations.
 */
export interface AgentConfig {
  /** Agent name (for logging and debugging) */
  name: string;

  /** Model to use (defaults to DEFAULT_MODEL) */
  model?: string;

  /** System prompt configuration */
  systemPrompt?: string | { preset?: string; append?: string };

  /** Allowed tools whitelist */
  allowedTools?: string[];

  /** MCP server configurations */
  mcpServers?: Record<string, MCPServerConfig>;

  /** Execution timeout in milliseconds */
  timeoutMs?: number;

  /** Maximum conversation turns */
  maxTurns?: number;

  /** Default workspace directory */
  workspace?: string;
}
```

### 1.13 Constants

```typescript
/**
 * Default model for agent execution.
 * Can be overridden via VIBE_DEFAULT_MODEL environment variable.
 *
 * @default 'claude-3-5-sonnet-latest'
 * @example
 * // Set via environment variable
 * process.env.VIBE_DEFAULT_MODEL = 'claude-3-5-haiku-latest';
 *
 * // Or in .env file
 * VIBE_DEFAULT_MODEL=claude-3-5-haiku-latest
 */
export const DEFAULT_MODEL = process.env.VIBE_DEFAULT_MODEL || 'claude-3-5-sonnet-latest';
```

---

## 2. API Signatures

### 2.1 vibeTest

```typescript
/**
 * Create a test with vibe-check fixtures and context.
 * Uses Vitest test.extend to inject runAgent, judge, expect, task, annotate.
 *
 * @param name - Test name
 * @param fn - Test function receiving VibeTestContext
 * @param timeoutOrOpts - Timeout (ms) or options object
 */
export function vibeTest(
  name: string,
  fn: (ctx: VibeTestContext) => Promise<void> | void,
  timeoutOrOpts?: number | { timeout?: number }
): void;

// Namespace for test modifiers
export namespace vibeTest {
  export const skip: typeof vibeTest;
  export const only: typeof vibeTest;
  export const concurrent: typeof vibeTest;
  export const sequential: typeof vibeTest;
  export const todo: typeof vibeTest;
  export const fails: typeof vibeTest;
}
```

**Example with Reactive Watchers** (for early test failure):

```typescript
vibeTest('fail fast on too many errors', async ({ runAgent, expect }) => {
  const execution = runAgent({
    prompt: '/refactor src/',
    maxTurns: 20
  });

  // Watch execution and fail early if conditions met
  execution.watch((ctx) => {
    // Fail if 3+ failed tool calls
    expect(ctx.tools.failed().length).toBeLessThan(3);

    // Fail if cost exceeds $5
    expect(ctx.metrics.totalCostUsd).toBeLessThan(5.0);
  });

  // Test fails immediately if watcher assertion fails
  // Otherwise, continues to completion
  const result = await execution;

  // Final assertions (only run if watchers didn't fail)
  expect(result).toCompleteAllTodos();
});
```

**Example with Cumulative State** (multiple agent runs):

```typescript
vibeTest('multi-agent refactor', async ({ runAgent, files, tools, expect }) => {
  // First agent: analyze code
  const analyze = await runAgent({
    agent: analyzer,
    prompt: '/analyze src/'
  });

  // Second agent: apply fixes
  const fix = await runAgent({
    agent: fixer,
    prompt: '/fix issues'
  });

  // Access cumulative state from context (across both runs)
  expect(files.changed()).toHaveLength(10);
  expect(files.filter('**/*.ts')).toHaveLength(8);
  expect(tools.used('Edit')).toBeGreaterThan(5);

  // Or use matchers on individual results
  expect(analyze).toHaveUsedTool('Read');
  expect(fix).toHaveChangedFiles(['src/**/*.ts']);

  // Or use matchers on context cumulative state
  expect(files.stats()).toEqual({
    added: 2,
    modified: 8,
    deleted: 0,
    renamed: 0,
    total: 10
  });
});
```

**Example with Judge and Custom Result Format:**

```typescript
vibeTest('quality evaluation', async ({ runAgent, judge, expect }) => {
  const result = await runAgent({
    prompt: prompt({
      text: "Implement the feature described in the PRD",
      files: ["./docs/prd.md"],
    })
  });

  // Custom judgment result with Zod schema
  const CustomJudgment = z.object({
    meetsRequirements: z.boolean(),
    missingFeatures: z.array(z.string()),
    codeQualityScore: z.number(),
  });

  const judgment = await judge<z.infer<typeof CustomJudgment>>(result, {
    rubric: {
      requirements: loadPRD("./docs/prd.md"),
      quality: ["Has tests", "Follows patterns", "No TODO comments"]
    },
    resultFormat: CustomJudgment,
    throwOnFail: true,
  });

  expect(judgment.meetsRequirements).toBe(true);
  expect(judgment.codeQualityScore).toBeGreaterThan(0.8);
});
```

### 2.2 vibeWorkflow

```typescript
/**
 * Create a multi-stage workflow with cumulative context.
 * Optimized for automation pipelines with loops and stage management.
 *
 * @param name - Workflow name
 * @param fn - Workflow function receiving WorkflowContext
 * @param options - Workflow options
 */
export function vibeWorkflow(
  name: string,
  fn: (ctx: WorkflowContext) => Promise<void>,
  options?: {
    /** Timeout in milliseconds */
    timeout?: number;
    /** Default configuration for all stages */
    defaults?: {
      workspace?: string;
      model?: string;
    };
  }
): void;

// Namespace for workflow modifiers
export namespace vibeWorkflow {
  export const skip: typeof vibeWorkflow;
  export const only: typeof vibeWorkflow;
  export const todo: typeof vibeWorkflow;
}
```

### 2.3 defineAgent

```typescript
/**
 * Define a reusable agent configuration.
 * See Section 1.12 for AgentConfig interface definition.
 *
 * @param config - Agent configuration (all fields except name are optional)
 * @returns Complete agent configuration with defaults applied
 */
export function defineAgent(config: Partial<AgentConfig> & { name: string }): AgentConfig;
```

**Implementation Note:**

`defineAgent()` should use `DEFAULT_MODEL` when model is not provided:

```typescript
export function defineAgent(config: Partial<AgentConfig>): AgentConfig {
  return {
    name: config.name || 'agent',
    model: config.model || DEFAULT_MODEL, // Uses env var or sonnet fallback
    systemPrompt: config.systemPrompt,
    allowedTools: config.allowedTools,
    mcpServers: config.mcpServers,
    timeoutMs: config.timeoutMs,
    maxTurns: config.maxTurns,
  };
}
```

### 2.4 Standalone Functions

```typescript
// SDK imports (via bridge layer - see Section 5.5)
import type { SDKUserMessage } from '../sdk/types';
import { query } from '../sdk/types';

// DEFAULT_MODEL constant defined in Section 1.13
import { DEFAULT_MODEL } from '../types';

/**
 * Standalone runAgent function (can be used outside fixtures).
 * Useful for programmatic execution or helper functions.
 *
 * Returns AgentExecution (thenable) which can be awaited or watched.
 */
export function runAgent(opts: RunAgentOptions): AgentExecution;

/**
 * Evaluate a RunResult using LLM-based judgment.
 * Judge is a specialized agent that formats rubric into a prompt internally.
 *
 * @param result - The RunResult to evaluate
 * @param options - Judgment configuration
 * @returns Structured judgment result (type-safe via generic)
 */
export function judge<T = DefaultJudgmentResult>(
  result: RunResult,
  options: {
    /** Evaluation criteria (user-defined structure) */
    rubric: Rubric;
    /** Custom instructions for how to evaluate */
    instructions?: string;
    /** Expected output format schema (Zod schema for type safety) */
    resultFormat?: z.ZodType<T>;
    /** Throw error if judgment fails */
    throwOnFail?: boolean;
  }
): Promise<T>;

/**
 * Build multi-modal user messages for Claude SDK.
 * Returns async iterable that can be passed directly to query().
 *
 * @param config - Message configuration
 * @returns AsyncIterable<SDKUserMessage> for SDK query()
 */
export function prompt(config: {
  /** Text content for the message */
  text?: string;

  /** Images (file paths or buffers) */
  images?: Array<string | Buffer>;

  /** Files to include (e.g., PRD documents) - content will be read and included */
  files?: Array<string>;

  /** Slash command to execute (e.g., '/refactor', '/analyze') */
  command?: string;
}): AsyncIterable<SDKUserMessage>;
```

**Implementation Details:**

`prompt()` implementation:
- Reads file contents from files array
- Converts images to base64 if needed
- Builds SDKUserMessage with multiple content blocks (text + images + file content)
- Returns as async iterable compatible with query() function
- Reference SDK docs: query() accepts AsyncIterable<SDKUserMessage>

**Example Usage:**

```typescript
// Text + images + files
const messages = prompt({
  text: "Evaluate this implementation against the PRD",
  images: ["./screenshot.png"],
  files: ["./docs/prd.md"],
});

const result = await runAgent({ prompt: messages });

// Just a slash command
const messages = prompt({ command: "/refactor" });
```

### 2.5 Helper Functions

**Rubric Creation**

Define rubrics using the standard `Rubric` interface (Section 1.10). No special helper functions needed.

```typescript
import type { Rubric } from './types';

// Define your rubric with custom criteria
const rubric: Rubric = {
  name: "Code Quality",
  criteria: [
    { name: "correctness", description: "Works as intended", weight: 0.5 },
    { name: "style", description: "Follows style guide", weight: 0.3 },
    { name: "tests", description: "Has comprehensive tests", weight: 0.2 }
  ],
  passThreshold: 0.7
};

// Optional: Validate at runtime with RubricSchema (useful for user input)
import { RubricSchema } from './judge/rubric';
const validatedRubric = RubricSchema.parse(userProvidedData);
```

### 2.6 defineTestSuite (Matrix Testing)

```typescript
/**
 * Define a test suite with matrix expansion (Cartesian product).
 * Generates N tests from matrix configurations.
 *
 * Recommended: Use with test.for for better fixture integration.
 */
export function defineTestSuite<T extends Record<string, any[]>>(config: {
  /** Matrix parameters (each key maps to array of values) */
  matrix: T;
  /** Optional suite name */
  name?: string;
  /** Test function receiving one combination */
  test: (combo: { [K in keyof T]: T[K][number] }) => void;
}): void;

// Example usage:
// defineTestSuite({
//   matrix: {
//     agent: [sonnetAgent, opusAgent],
//     maxTurns: [8, 16]
//   },
//   test: ({ agent, maxTurns }) => {
//     vibeTest(`${agent.name} with ${maxTurns} turns`, async ({ runAgent }) => {
//       const result = await runAgent({ agent, prompt: '/refactor', maxTurns });
//       expect(result).toStayUnderCost(5);
//     });
//   }
// });
```

### 2.7 defineVibeConfig

```typescript
/**
 * Helper to create Vitest config with vibe-check defaults.
 * Merges user config with sensible defaults for agent testing.
 */
export function defineVibeConfig(
  userConfig?: import('vitest/config').UserConfig
): import('vitest/config').UserConfig;

// Sets defaults:
// - reporters: ['default', VibeCostReporter, VibeHtmlReporter]
// - test.maxWorkers: '50%'
// - test.timeout: 300000 (5min)
// - test.setupFiles: ['@dao/vibe-check/setup']
```

### 2.8 Custom Matchers

**Note**: Custom matchers work on `RunResult` objects. For cumulative state from context (e.g., `files`, `tools`), use standard `expect()` assertions.

```typescript
/**
 * Custom matchers auto-registered via setupFiles.
 * Work on RunResult objects from runAgent() / stage().
 */
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      /**
       * Assert that specific files were changed (supports globs).
       */
      toHaveChangedFiles(paths: string | string[]): T;

      /**
       * Assert no files were deleted.
       */
      toHaveNoDeletedFiles(): T;

      /**
       * Assert a specific tool was used (optionally with min count).
       */
      toHaveUsedTool(name: string, opts?: { min?: number }): T;

      /**
       * Assert only allowed tools were used.
       */
      toUseOnlyTools(allowlist: string[]): T;

      /**
       * Assert all TODOs completed.
       */
      toCompleteAllTodos(): T;

      /**
       * Assert no errors in logs.
       */
      toHaveNoErrorsInLogs(): T;

      /**
       * Assert cost stayed under budget.
       */
      toStayUnderCost(maxUsd: number): T;

      /**
       * Assert rubric passes (uses judge internally).
       */
      toPassRubric(rubric: Rubric): Promise<T>;

      /**
       * Assert all hook events were captured successfully.
       * Fails if hookCaptureStatus.complete is false.
       * Use this matcher when you need strict hook capture validation.
       *
       * @example
       * expect(result).toHaveCompleteHookData();
       */
      toHaveCompleteHookData(): T;
    }
  }
}
```

### 2.9 MCP Server Integration Examples

Model Context Protocol (MCP) servers extend agent capabilities with custom tools. See Section 1.9 for `MCPServerConfig` interface definition.

```typescript
// Example 1: Database MCP server for SQL operations
const databaseAgent = defineAgent({
  name: 'db-admin',
  mcpServers: {
    database: {
      command: 'npx',
      args: ['@modelcontextprotocol/server-postgres'],
      env: {
        POSTGRES_URL: process.env.DATABASE_URL,
      },
      allowedTools: ['query', 'schema', 'migrate'],
    },
  },
});

// Example 2: Filesystem MCP server with restricted access
vibeTest('filesystem operations', async ({ runAgent }) => {
  const result = await runAgent({
    prompt: 'List all TypeScript files',
    mcpServers: {
      filesystem: {
        command: 'npx',
        args: ['@modelcontextprotocol/server-filesystem', './src'],
        allowedTools: ['read_file', 'list_directory'],
      },
    },
  });

  expect(result).toHaveUsedTool('list_directory');
});

// Example 3: Multiple MCP servers
vibeWorkflow('full-stack deployment', async (wf) => {
  await wf.stage('deploy backend', {
    prompt: '/deploy',
    mcpServers: {
      database: { command: 'npx', args: ['@mcp/postgres'] },
      docker: { command: 'npx', args: ['@mcp/docker'] },
    },
  });
});

// Example 4: Per-stage MCP configuration
vibeWorkflow('multi-stage deployment', async (wf) => {
  // Stage 1: Use database MCP only
  await wf.stage('migrate database', {
    prompt: '/migrate',
    mcpServers: {
      database: { command: 'npx', args: ['@mcp/postgres'] },
    },
  });

  // Stage 2: Use docker MCP only
  await wf.stage('deploy containers', {
    prompt: '/deploy',
    mcpServers: {
      docker: { command: 'npx', args: ['@mcp/docker'] },
    },
  });
});
```

**Best Practices:**

1. **Security**: Use `allowedTools` to whitelist only necessary tools
2. **Environment Variables**: Pass sensitive data via `env` field, not as args
3. **Resource Cleanup**: MCP servers are automatically terminated after test/workflow completes
4. **Error Handling**: Server failures are captured in `RunResult.errors`

**Common MCP Servers:**

| Server | Package | Use Case |
|--------|---------|----------|
| Filesystem | `@modelcontextprotocol/server-filesystem` | File operations with path restrictions |
| PostgreSQL | `@modelcontextprotocol/server-postgres` | SQL database operations |
| Docker | `@modelcontextprotocol/server-docker` | Container management |
| Git | `@modelcontextprotocol/server-git` | Version control operations |

**See Also:**
- [MCP Specification](https://modelcontextprotocol.io)
- Section 1.9: MCPServerConfig interface

---

## 3. Storage & Data Contracts

### 3.1 RunBundle Directory Structure

```
.vibe-artifacts/{testId}/
├── events.ndjson           # SDK stream events (NDJSON format)
├── hooks.ndjson            # Claude Code hook events (NDJSON format)
├── summary.json            # Lightweight summary with pointers
└── files/
    ├── before/
    │   └── {sha256}        # Content-addressed file content (pre-change)
    └── after/
        └── {sha256}        # Content-addressed file content (post-change)
```

### 3.2 summary.json Schema

```typescript
interface Summary {
  /** Test ID */
  testId: string;

  /** Aggregated metrics */
  metrics: {
    totalTokens?: number;
    totalCostUsd?: number;
    durationMs?: number;
    toolCalls?: number;
    filesChanged?: number;
  };

  /** Git state */
  git?: {
    before?: { head: string; dirty: boolean };
    after?: { head: string; dirty: boolean };
  };

  /** File change summaries (not full content) */
  fileStats: {
    added: number;
    modified: number;
    deleted: number;
    renamed: number;
    total: number;
  };

  /** Tool call summaries (minimized for size) */
  toolCalls: Array<{
    name: string;
    ok: boolean;
    startedAt: number;
    endedAt?: number;
    durationMs?: number;
    /** Offset into hooks.ndjson for full data */
    hookRef: { pre: number; post?: number };
  }>;

  /** TODO summaries */
  todos: Array<{
    text: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}
```

### 3.3 NDJSON Formats

**events.ndjson** - SDK stream events:
```jsonl
{"type":"message","role":"assistant","content":"...","ts":1234567890}
{"type":"usage","tokens":{"input":100,"output":200},"cost":0.015}
{"type":"todo","action":"add","text":"Implement feature","ts":1234567891}
```

**Note**: SDK events contain messages, usage/cost, and todos. Tool execution details are NOT in the SDK stream—use `hooks.ndjson` for tool calls.

**hooks.ndjson** - Claude Code hook events:
```jsonl
{"hook":"PreToolUse","tool_name":"Edit","tool_input":"{...}","cwd":"/repo","session_id":"abc","ts":1234567890}
{"hook":"PostToolUse","tool_name":"Edit","tool_response":"{...}","cwd":"/repo","session_id":"abc","ts":1234567892}
```

**Note**: Hooks provide precise tool execution data. Correlated in pairs (PreToolUse + PostToolUse) to build ToolCall objects.

### 3.4 task.meta Schema

**Constraint**: Must be JSON-serializable and small (<10KB recommended).

```typescript
interface TaskMeta {
  /** Cost metrics for reporter aggregation */
  metrics?: {
    totalTokens?: number;
    totalCostUsd?: number;
    durationMs?: number;
  };

  /** Pointer to RunBundle directory */
  bundleDir?: string;

  /** Optional user-defined metadata */
  maxCost?: number;
  tags?: string[];

  /** DO NOT store large data here (use bundleDir instead) */
}
```

### 3.5 Bundle Cleanup Policy

**Problem**: RunBundles stored in `.vibe-artifacts/` accumulate indefinitely, consuming disk space over time.

**Solution**: Time-based retention with manual override API.

#### Automatic Cleanup

**Default Policy**: Delete bundles older than 30 days on test suite startup.

```typescript
// src/artifacts/cleanup.ts
export interface CleanupConfig {
  /** Maximum age in days (default: 30) */
  maxAgeDays?: number;
  /** Minimum free disk space in MB (cleanup if below threshold) */
  minFreeDiskMb?: number;
  /** Disable automatic cleanup */
  disabled?: boolean;
}

/**
 * Clean up old RunBundles based on retention policy.
 * Called automatically before test suite starts (via setup file).
 */
export async function cleanupBundles(config: CleanupConfig = {}): Promise<{
  deleted: number;
  freedMb: number;
  errors: string[];
}> {
  const maxAgeDays = config.maxAgeDays ?? 30;
  const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

  const bundleDirs = await fs.readdir('.vibe-artifacts');
  let deleted = 0;
  let freedMb = 0;
  const errors: string[] = [];

  for (const dir of bundleDirs) {
    const bundlePath = join('.vibe-artifacts', dir);
    const stats = await fs.stat(bundlePath);

    if (stats.mtimeMs < cutoffTime) {
      try {
        const size = await getFolderSize(bundlePath);
        await fs.rm(bundlePath, { recursive: true });
        deleted++;
        freedMb += size / (1024 * 1024);
      } catch (err) {
        errors.push(`Failed to delete ${dir}: ${err.message}`);
      }
    }
  }

  return { deleted, freedMb, errors };
}
```

#### Configuration

Set cleanup policy in Vitest config:

```typescript
// vitest.config.ts
export default defineVibeConfig({
  cleanup: {
    maxAgeDays: 7,          // Delete bundles older than 7 days
    minFreeDiskMb: 1000,    // Clean up if <1GB free space
    disabled: false,        // Enable automatic cleanup
  },
});
```

#### Manual Cleanup API

For CI/CD pipelines or manual cleanup:

```typescript
import { cleanupBundles } from '@dao/vibe-check/artifacts';

// Delete all bundles older than 7 days
const result = await cleanupBundles({ maxAgeDays: 7 });
console.log(`Deleted ${result.deleted} bundles, freed ${result.freedMb.toFixed(2)} MB`);

// Delete ALL bundles (use with caution!)
const result = await cleanupBundles({ maxAgeDays: 0 });
```

#### Best Practices

1. **Local Development**: Use default 30-day retention
2. **CI Environments**: Set `maxAgeDays: 1` to clean up after each run
3. **Critical Tests**: Exclude specific bundles using `.vibe-keep` marker file
4. **Disk Space Monitoring**: Use `minFreeDiskMb` threshold for automatic cleanup

#### Protected Bundles

Create `.vibe-keep` file in bundle directory to prevent deletion:

```bash
# Protect important test run
touch .vibe-artifacts/test-abc123/.vibe-keep
```

Bundles with `.vibe-keep` are never automatically deleted (manual deletion only).

---

## 4. Integration Contracts

### 4.1 Hook Capture Protocol

**Setup** (`.claude/settings.json`):
```json
{
  "hooks": {
    "PreToolUse": ".claude/hooks/vibe-hook.js",
    "PostToolUse": ".claude/hooks/vibe-hook.js",
    "Notification": ".claude/hooks/vibe-hook.js",
    "Stop": ".claude/hooks/vibe-hook.js"
  }
}
```

**Hook Script Contract**:
- Reads JSON from stdin
- Writes to `$VIBE_BUNDLE_DIR/hooks.ndjson` (environment variable set by runner)
- Non-blocking (exits immediately after write)
- Handles malformed JSON gracefully (fallback to raw write)

**Hook Payload Structure**:
```typescript
interface HookPayload {
  hook: 'PreToolUse' | 'PostToolUse' | 'Notification' | 'Stop' | 'SubagentStop' | 'SessionStart' | 'SessionEnd';
  session_id: string;
  transcript_path?: string;
  cwd?: string;
  tool_name?: string;        // PreToolUse, PostToolUse
  tool_input?: string;        // PreToolUse (JSON string)
  tool_response?: string;     // PostToolUse (JSON string)
  message?: string;           // Notification
  ts?: number;                // Unix timestamp (ms)
}
```

### 4.2 ContextManager API

```typescript
/**
 * Manages RunContext lifecycle for one test/workflow stage.
 */
export class ContextManager {
  constructor(opts: {
    testId: string;
    workspace?: string;
    annotate?: (m: string, t?: string, a?: any) => Promise<void>;
  });

  /** Path to on-disk RunBundle */
  readonly bundleDir: string;

  /**
   * Called during SDK stream to capture event.
   * Writes to events.ndjson and updates in-memory summary.
   */
  onSDKEvent(evt: SDKEvent): Promise<void>;

  /**
   * Called by hook script to write hook payload.
   * Appends to hooks.ndjson.
   */
  onHookPayload(json: unknown): Promise<void>;

  /**
   * Called after agent execution completes.
   * Processes hooks, correlates tool calls, computes file changes,
   * writes summary.json, and returns lazy RunResult.
   */
  finalize(): Promise<RunResult>;

  /**
   * Optional cleanup (e.g., compress old bundles).
   */
  cleanup?(): Promise<void>;

  /**
   * Get current partial result for watcher callbacks.
   * Called during execution to provide real-time state to watchers.
   */
  getPartialResult(): PartialRunResult;

  /**
   * Process a hook event and update partial state.
   * Called after each hook event (PostToolUse, TodoUpdate, Notification).
   * Returns updated partial result for watcher invocation.
   */
  processHookEvent(event: HookEvent): Promise<PartialRunResult>;
}
```

#### 4.2.1 Real-Time Watcher Processing

**How AgentExecution invokes watchers during execution:**

```typescript
// Inside AgentExecution.executeWithWatchers()
async function executeWithWatchers(opts: RunAgentOptions): Promise<RunResult> {
  const contextManager = new ContextManager({...});

  // Start agent execution with hook capture
  const hookStream = startAgentWithHooks(opts, this.abortController.signal);

  try {
    // Monitor hook events as they arrive
    for await (const hookEvent of hookStream) {
      // Update partial state based on hook event
      const partialResult = await contextManager.processHookEvent(hookEvent);

      // Only invoke watchers on significant events
      if (isSignificantEvent(hookEvent)) {
        // Run all watchers sequentially
        for (const watcherFn of this.watchers) {
          try {
            await watcherFn(partialResult);
          } catch (error) {
            // Watcher assertion failed - abort execution
            console.error('[vibe-check] Watcher assertion failed:', error.message);
            this.abortController.abort('Watcher assertion failed');
            throw error; // Reject the promise
          }
        }
      }
    }

    // Execution completed successfully - finalize
    return await contextManager.finalize();
  } catch (error) {
    await contextManager.cleanup?.();
    throw error;
  }
}

function isSignificantEvent(event: HookEvent): boolean {
  // Trigger watchers on these events
  return [
    'PostToolUse',    // After each tool completes
    'TodoUpdate',     // When TODO status changes
    'Notification',   // When agent sends notifications
  ].includes(event.type);
}
```

**Key behaviors:**

1. **Trigger frequency**: Watchers run after significant hook events (not every event)
2. **Execution order**: Sequential in registration order (not parallel)
3. **Error handling**: First watcher failure aborts execution immediately
4. **Async support**: Watchers can be sync or async functions

#### 4.2.2 Error Handling and Git Detection

**Graceful Degradation Policy:**

Hook capture failures should **NOT** fail tests. The framework uses graceful degradation:
- Log warnings to stderr (not stdout)
- Continue execution with partial data
- Track failures in `hookCaptureStatus`
- Allow users to opt-in to strict validation via matchers

**Implementation Example:**

```typescript
export class ContextManager {
  private hookCaptureStatus = {
    complete: true,
    missingEvents: [] as string[],
    warnings: [] as string[],
  };

  /**
   * Process hook event with graceful error handling.
   * Logs warnings but doesn't throw - tests pass/fail based on assertions, not infrastructure.
   */
  async processHookEvent(event: HookEvent): Promise<PartialRunResult> {
    try {
      // Process hook event (correlate tools, update state, etc.)
      await this.correlateAndUpdate(event);
    } catch (error) {
      // Graceful degradation - log warning, mark incomplete, continue
      const warning = `Failed to process ${event.type} hook: ${error.message}`;
      console.warn(`[vibe-check] ${warning}`);

      this.hookCaptureStatus.complete = false;
      this.hookCaptureStatus.missingEvents.push(event.type);
      this.hookCaptureStatus.warnings.push(warning);

      // Don't throw - continue execution
    }

    return this.getPartialResult();
  }

  /**
   * Detect if workspace is git-managed.
   * Used to determine whether to capture git state.
   */
  private async detectGitRepo(workspace: string): Promise<boolean> {
    try {
      const { exitCode } = await exec('git rev-parse --git-dir', { cwd: workspace });
      return exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Capture git state before/after execution.
   * Only runs if workspace is git-managed (detected via detectGitRepo).
   */
  private async captureGitState(): Promise<{ head: string; dirty: boolean } | undefined> {
    const isGitRepo = await this.detectGitRepo(this.workspace);
    if (!isGitRepo) return undefined;

    try {
      const head = await exec('git rev-parse HEAD', { cwd: this.workspace });
      const status = await exec('git status --porcelain', { cwd: this.workspace });
      return {
        head: head.stdout.trim(),
        dirty: status.stdout.trim().length > 0,
      };
    } catch (error) {
      // Graceful degradation - log warning, return undefined
      console.warn(`[vibe-check] Failed to capture git state: ${error.message}`);
      this.hookCaptureStatus.warnings.push(`Git state capture failed: ${error.message}`);
      return undefined;
    }
  }
}
```

**Error Logging Standards:**

- **stderr** for warnings (hook failures, git detection failures)
- **stdout** for user-facing output (test results, annotations)
- **Prefix format**: `[vibe-check]` for all framework messages
- **Structured logging**: Include context (event type, timestamp, error message)

**User Control via Matchers:**

Users who need strict hook capture can use the `toHaveCompleteHookData()` matcher:

```typescript
vibeTest('strict hook capture', async ({ runAgent, expect }) => {
  const result = await runAgent({ prompt: '/refactor' });

  // This assertion will fail if any hooks failed to capture
  expect(result).toHaveCompleteHookData();

  // Also check specific expectations
  expect(result).toHaveChangedFiles(['src/**']);
});
```

### 4.3 Reporter Interface

**Reporter Implementations:**
- **VibeCostReporter** - Terminal reporter for cost aggregation and summary
- **VibeHtmlReporter** - HTML report generator with transcripts and timelines

All reporters extend `vitest/reporters/BaseReporter`:

```typescript
import { BaseReporter } from 'vitest/reporters';
import type { Reporter, TestCase, TestModule } from 'vitest/node';

/**
 * Base reporter interface example.
 * Actual implementations: VibeCostReporter (terminal) and VibeHtmlReporter (HTML).
 */
export class VibeCostReporter extends BaseReporter implements Reporter {
  /**
   * Called when test annotation is emitted.
   * Use for real-time terminal updates.
   */
  onTestAnnotate?(
    testCase: TestCase,
    message: string,
    type?: string,
    attachment?: TestAttachment
  ): void;

  /**
   * Called when test completes.
   * Access task.meta() to get bundleDir and metrics.
   */
  onTestCaseResult?(testCase: TestCase): void;

  /**
   * Called when all tests complete.
   * Write final reports (HTML, JSON, etc.).
   */
  onTestRunEnd?(
    modules: readonly TestModule[],
    errors: unknown[]
  ): Promise<void>;
}
```

### 4.4 Vitest Fixture Integration

**Key Implementation**: Test context maintains cumulative state across multiple `runAgent()` calls.

```typescript
// src/test/vibeTest.ts
import { test as base } from 'vitest';
import { _TestContextManager } from '../runner/_TestContextManager';
import { createJudge } from '../judge/llmJudge';

/**
 * _TestContextManager (internal) tracks cumulative state across multiple agent runs
 * in the same test. Similar to WorkflowRunner but for test context.
 *
 * Note: Prefixed with underscore to indicate this is an internal implementation detail.
 * Users should not import or use this class directly.
 */
class _TestContextManager {
  private runs: RunResult[] = [];
  private cumulativeFiles: FileChange[] = [];
  private cumulativeTools: ToolCall[] = [];

  async runAgent(opts: RunAgentOptions): Promise<AgentExecution> {
    const ctx = new ContextManager({
      testId: this.testId,
      workspace: opts.workspace ?? this.defaultWorkspace,
      annotate: this.annotate,
    });

    const execution = await ctx.execute(opts);

    // After execution completes, accumulate state
    execution.then((result) => {
      this.runs.push(result);
      this.cumulativeFiles.push(...result.files.changed());
      this.cumulativeTools.push(...result.tools.all());
    });

    return execution;
  }

  // Cumulative accessors
  get files() {
    return {
      changed: () => this.cumulativeFiles,
      get: (path: string) => this.cumulativeFiles.find(f => f.path === path),
      filter: (glob: string | string[]) => {
        // Use minimatch to filter
        const patterns = Array.isArray(glob) ? glob : [glob];
        return this.cumulativeFiles.filter(f =>
          patterns.some(p => minimatch(f.path, p))
        );
      },
      stats: () => {
        const added = this.cumulativeFiles.filter(f => f.changeType === 'added').length;
        const modified = this.cumulativeFiles.filter(f => f.changeType === 'modified').length;
        const deleted = this.cumulativeFiles.filter(f => f.changeType === 'deleted').length;
        const renamed = this.cumulativeFiles.filter(f => f.changeType === 'renamed').length;
        return { added, modified, deleted, renamed, total: this.cumulativeFiles.length };
      },
    };
  }

  get tools() {
    return {
      all: () => this.cumulativeTools,
      used: (name: string) => this.cumulativeTools.filter(t => t.name === name).length,
      findFirst: (name: string) => this.cumulativeTools.find(t => t.name === name),
      failed: () => this.cumulativeTools.filter(t => !t.ok),
      succeeded: () => this.cumulativeTools.filter(t => t.ok),
    };
  }

  get timeline() {
    return {
      events: async function* () {
        for (const run of this.runs) {
          yield* run.timeline.events();
        }
      }.bind(this),
    };
  }
}

export const vibeTest = base.extend<VibeTestContext>({
  // Cumulative state manager (one per test)
  _testManager: async ({ task }, use) => {
    const manager = new _TestContextManager({
      testId: task.id,
      defaultWorkspace: undefined,
      annotate: task.context?.annotate,
    });

    await use(manager);

    // Cleanup: aggregate metrics for reporters
    const allResults = manager.runs;
    const totalCost = allResults.reduce((sum, r) => sum + (r.metrics.totalCostUsd ?? 0), 0);
    const totalTokens = allResults.reduce((sum, r) => sum + (r.metrics.totalTokens ?? 0), 0);

    task.meta.metrics = {
      totalCostUsd: totalCost,
      totalTokens: totalTokens,
      runs: allResults.length,
    };
    task.meta.bundleDir = allResults[0]?.bundleDir;  // First run's bundle
  },

  // runAgent fixture (uses manager)
  runAgent: async ({ _testManager }, use) => {
    await use((opts: RunAgentOptions) => _testManager.runAgent(opts));
  },

  // files fixture (cumulative accessor)
  files: async ({ _testManager }, use) => {
    await use(_testManager.files);
  },

  // tools fixture (cumulative accessor)
  tools: async ({ _testManager }, use) => {
    await use(_testManager.tools);
  },

  // timeline fixture (cumulative accessor)
  timeline: async ({ _testManager }, use) => {
    await use(_testManager.timeline);
  },

  // judge fixture (standalone)
  judge: async ({}, use) => {
    const j = createJudge();
    await use(j.evaluate.bind(j));
  },

  // expect, task, annotate inherited from Vitest TestContext
});
```

**How it works**:

1. **_TestContextManager** (internal) maintains cumulative state across runs
2. Each `runAgent()` call adds to cumulative files/tools/timeline
3. Fixtures `files`, `tools`, `timeline` provide direct access to cumulative state
4. Users can access via context destructuring: `async ({ files, tools, ... }) => { }`
5. At test end, aggregate metrics written to `task.meta` for reporters

**Workspace Configuration Precedence:**

The framework resolves workspace paths with the following precedence (highest to lowest):

1. **runAgent() call-site override**: `runAgent({ workspace: '/specific/path', ... })`
2. **vibeWorkflow defaults**: `vibeWorkflow('name', fn, { defaults: { workspace: '/default/path' } })`
3. **Current working directory**: `process.cwd()` (if no workspace specified)

**Example - Multi-Repo Workflow:**

```typescript
vibeWorkflow('deploy across repos', async (wf) => {
  // All stages inherit workspace from workflow defaults
  await wf.stage('build app', { prompt: '/build' });
  await wf.stage('test app', { prompt: '/test' });

  // Override workspace for docs deployment (different repo)
  await wf.stage('deploy docs', {
    prompt: '/deploy',
    workspace: '/path/to/docs-repo',  // Override for this stage only
  });

  // Back to default workspace
  await wf.stage('cleanup', { prompt: '/cleanup' });
}, {
  defaults: {
    workspace: '/path/to/app-repo',  // Default for all stages
  }
});
```

**Best Practices:**

- Set workflow defaults for single-repo projects
- Use call-site overrides for multi-repo workflows
- Prefer explicit workspace over relying on cwd (avoids confusion)

---

## 5. Implementation Requirements

### 5.1 Dependencies

```json
{
  "name": "@dao/vibe-check",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./reporters": "./dist/reporters/index.js",
    "./setup": "./dist/setup.js"
  },
  "peerDependencies": {
    "vitest": "^3.2.0",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "@anthropic-ai/claude-code": "^0.1.0",
    "zod": "^3.23.0",
    "zod-to-json-schema": "^3.23.0",
    "p-limit": "^5.0.0",
    "pathe": "^1.1.2",
    "fs-extra": "^11.2.0",
    "minimatch": "^10.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "@types/node": "^20.11.0",
    "vitest": "^3.2.0"
  }
}
```

### 5.2 Build Configuration

**tsup.config.ts**:
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'reporters/index': 'src/reporters/index.ts',
    setup: 'src/setup.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
});
```

### 5.3 File Structure Requirements

```
src/
├── index.ts                    # Main exports
├── setup.ts                    # Auto-setup (matchers registration)
├── sdk/
│   └── types.ts               # SDK bridge layer (see Section 5.5)
├── test/
│   ├── vibeTest.ts            # vibeTest with fixtures
│   ├── vibeWorkflow.ts        # vibeWorkflow implementation
│   ├── context.ts             # Context type definitions
│   └── matchers.ts            # Custom matcher implementations
├── runner/
│   ├── ContextManager.ts        # RunContext lifecycle manager
│   ├── _TestContextManager.ts   # Internal: Cumulative state for vibeTest
│   └── agentRunner.ts           # Claude SDK integration
├── judge/
│   ├── rubric.ts              # Rubric schema (Zod)
│   └── llmJudge.ts            # LLM evaluation logic
├── reporters/
│   ├── index.ts               # Reporter exports
│   ├── cost.ts                # VibeCostReporter
│   └── html.ts                # VibeHtmlReporter
├── matrix/
│   └── defineTestSuite.ts     # Matrix test generator
├── config/
│   └── index.ts               # defineVibeConfig
├── artifacts/
│   ├── bundle.ts              # RunBundle utilities
│   └── lazy.ts                # Lazy loading helpers
└── types/
    └── index.ts               # Core type exports
```

### 5.4 Runtime Schemas (Zod)

```typescript
// src/judge/rubric.ts
import { z } from 'zod';

/**
 * Criterion schema for runtime validation.
 * Matches the Criterion type from Rubric interface (Section 1.10).
 */
export const CriterionSchema = z.object({
  name: z.string(),
  description: z.string(),
  weight: z.number().min(0).max(1).optional(),
  threshold: z.number().min(0).max(1).optional(),
});

/**
 * RubricSchema: Runtime validation for Rubric interface.
 *
 * Use this to validate rubrics at runtime (e.g., from user input or config files).
 * Matches the Rubric interface from Section 1.10.
 *
 * @example Validate user-provided rubric
 * import { RubricSchema } from './judge/rubric';
 *
 * const rubric = RubricSchema.parse(userInput);
 * // Now TypeScript knows rubric is Rubric type
 *
 * @example Use in judge() call
 * const judgment = await judge(result, {
 *   rubric: {
 *     name: "Code Quality",
 *     criteria: [
 *       { name: "correctness", description: "Works as intended", weight: 0.5 },
 *       { name: "style", description: "Follows style guide", weight: 0.5 }
 *     ],
 *     passThreshold: 0.7
 *   }
 * });
 */
export const RubricSchema = z.object({
  name: z.string(),
  criteria: z.array(CriterionSchema).min(1),
  model: z.string().optional(),
  passThreshold: z.number().min(0).max(1).optional(),
});

// Type should match the interface from Section 1.10
export type Rubric = z.infer<typeof RubricSchema>;
```

```typescript
// src/runner/options.ts
import { z } from 'zod';

export const RunAgentOptionsSchema = z.object({
  prompt: z.string(),
  model: z.string().optional(),
  allowedTools: z.array(z.string()).optional(),
  mcpServers: z.record(z.any()).optional(),
  timeoutMs: z.number().positive().optional(),
  maxTurns: z.number().positive().optional(),
  systemPrompt: z
    .union([
      z.string(),
      z.object({
        preset: z.string().optional(),
        append: z.string().optional(),
      }),
    ])
    .optional(),
  workspace: z.string().optional(),
  context: z.any().optional(), // RunResult
});

export type RunAgentOptions = z.infer<typeof RunAgentOptionsSchema>;
```

### 5.5 SDK Integration Layer

**Purpose**: Isolate dependency on `@anthropic-ai/claude-code` SDK to enable easy version changes and testing.

**File**: `src/sdk/bridge.ts`

```typescript
/**
 * SDK Bridge Layer
 *
 * This file re-exports types and functions from the Claude Code SDK.
 * It provides a single point of coupling, making it easy to:
 * - Swap SDK packages if the official package name changes
 * - Mock the SDK for testing
 */

/**
 * Re-export types and functions from Claude SDK.
 */
export type { SDKUserMessage } from '@anthropic-ai/claude-code';
export { query } from '@anthropic-ai/claude-code';
```

**Usage in vibe-check code**:

```typescript
// DO THIS (import from bridge)
import type { SDKUserMessage } from '../sdk/bridge';
import { query } from '../sdk/bridge';

// DON'T DO THIS (direct SDK import)
import type { SDKUserMessage } from '@anthropic-ai/claude-code';
import { query } from '@anthropic-ai/claude-code';
```

**Benefits**:
- **Resilience**: Easy to adapt if SDK package name changes
- **Maintainability**: All SDK imports in one file (easier to update)
- **Testability**: Can mock SDK functions by swapping bridge implementation

### 5.6 Model Selection and Cost Optimization

**Default Model Behavior:**

The framework uses `DEFAULT_MODEL` constant which checks the `VIBE_DEFAULT_MODEL` environment variable:

```typescript
export const DEFAULT_MODEL = process.env.VIBE_DEFAULT_MODEL || 'claude-3-5-sonnet-latest';
```

**Environment Configuration:**

Create a `.env` file in your project root:

```bash
# Default model for agent execution (optional)
# If not set, defaults to claude-3-5-sonnet-latest
VIBE_DEFAULT_MODEL=claude-3-5-sonnet-latest

# For CI environments, you can use a cheaper model
# VIBE_DEFAULT_MODEL=claude-3-5-haiku-latest
```

**Model Selection Guide:**

| Use Case | Recommended Model | Rationale |
|----------|------------------|-----------|
| Local development | `claude-3-5-sonnet-latest` | Best balance of capability and cost |
| CI/automation | `claude-3-5-haiku-latest` | Faster, cheaper for simple tasks |
| Complex evaluation | `claude-3-5-opus-latest` | Highest capability for difficult tasks |
| Judge function | `claude-3-5-haiku-latest` | Cost-effective for evaluation |

**Cost Optimization Strategies:**

1. **Environment-based defaults**: Set `VIBE_DEFAULT_MODEL=claude-3-5-haiku-latest` in CI
2. **Per-agent overrides**: Use more expensive models only where needed
3. **Budget enforcement**: Use `toStayUnderCost()` matcher to catch overruns
4. **Judge separately**: Configure judge to use cheaper model via options

**Example: Mixed Model Usage**

```typescript
// Use cheaper model by default in CI
const DEFAULT_MODEL = process.env.VIBE_DEFAULT_MODEL || 'claude-3-5-haiku-latest';

// Override for complex agents
const complexAgent = defineAgent({
  name: 'architect',
  model: 'claude-3-5-opus-latest', // Override default
});

// Use default for simple agents
const simpleAgent = defineAgent({
  name: 'formatter',
  // Uses DEFAULT_MODEL (haiku in CI, sonnet locally)
});
```

---

## 6. Key Algorithms

### 6.1 Tool Call Correlation

**Input**: Array of hook payloads from hooks.ndjson
**Output**: Array of ToolCall objects

```typescript
function correlateToolCalls(hooks: HookPayload[]): ToolCall[] {
  const toolCalls: ToolCall[] = [];
  const pending = new Map<string, HookPayload>(); // key: session_id + tool_name

  for (const hook of hooks) {
    if (hook.hook === 'PreToolUse') {
      const key = `${hook.session_id}:${hook.tool_name}`;
      pending.set(key, hook);
    } else if (hook.hook === 'PostToolUse') {
      const key = `${hook.session_id}:${hook.tool_name}`;
      const pre = pending.get(key);

      if (pre) {
        toolCalls.push({
          name: hook.tool_name!,
          input: JSON.parse(pre.tool_input || '{}'),
          output: JSON.parse(hook.tool_response || '{}'),
          ok: true,
          cwd: hook.cwd,
          startedAt: pre.ts!,
          endedAt: hook.ts,
          durationMs: hook.ts! - pre.ts!,
        });
        pending.delete(key);
      } else {
        // PostToolUse without PreToolUse (shouldn't happen)
        toolCalls.push({
          name: hook.tool_name!,
          input: {},
          output: JSON.parse(hook.tool_response || '{}'),
          ok: false,
          cwd: hook.cwd,
          startedAt: hook.ts!,
          endedAt: hook.ts,
        });
      }
    }
  }

  // Handle PreToolUse without PostToolUse (timed out or error)
  for (const [key, pre] of pending) {
    toolCalls.push({
      name: pre.tool_name!,
      input: JSON.parse(pre.tool_input || '{}'),
      ok: false,
      cwd: pre.cwd,
      startedAt: pre.ts!,
    });
  }

  return toolCalls.sort((a, b) => a.startedAt - b.startedAt);
}
```

### 6.2 File Change Detection

**Input**: Workspace path, tool calls, git state
**Output**: Array of FileChange objects

```typescript
async function detectFileChanges(
  workspace: string,
  git: { before: string; after: string }
): Promise<FileChange[]> {
  // 1. Run git diff --name-status
  const diff = await execGit(workspace, [
    'diff',
    '--name-status',
    git.before,
    git.after,
  ]);

  // 2. Parse diff output
  const changes: FileChange[] = [];
  for (const line of diff.split('\n')) {
    if (!line.trim()) continue;

    const [status, ...paths] = line.split('\t');
    const changeType = parseStatus(status); // A/M/D/R -> added/modified/deleted/renamed

    const path = paths[0];
    const oldPath = status.startsWith('R') ? paths[0] : undefined;
    const newPath = status.startsWith('R') ? paths[1] : path;

    changes.push({
      path: newPath,
      changeType,
      oldPath,
      // Content loaded lazily via before/after accessors
    });
  }

  // 3. Store content content-addressed
  for (const change of changes) {
    if (change.changeType !== 'added') {
      await storeFileContent(workspace, change.path, 'before', git.before);
    }
    if (change.changeType !== 'deleted') {
      await storeFileContent(workspace, change.path, 'after', git.after);
    }
  }

  return changes;
}

async function storeFileContent(
  workspace: string,
  path: string,
  type: 'before' | 'after',
  commit: string
): Promise<void> {
  const content = await execGit(workspace, ['show', `${commit}:${path}`]);
  const sha256 = crypto.createHash('sha256').update(content).digest('hex');
  const destPath = join(bundleDir, 'files', type, sha256);

  // Store gzipped if >10MB
  if (content.length > 10 * 1024 * 1024) {
    await writeFile(destPath + '.gz', zlib.gzipSync(content));
  } else {
    await writeFile(destPath, content);
  }
}
```

### 6.3 Reactive Watchers

**Purpose**: Enable early test failure by asserting conditions during agent execution.

**How It Works**:

1. **Registration**: User calls `.watch()` on AgentExecution to register watcher function
2. **Execution**: ContextManager invokes watchers after each significant event (tool completion, cost update)
3. **Assertion**: Watcher uses `expect()` to assert conditions on PartialRunResult
4. **Failure**: If assertion fails, error propagates to Vitest → test fails immediately → SDK stream aborts

**Implementation**:

```typescript
// src/runner/ContextManager.ts
export class ContextManager {
  private watchers: Array<(ctx: PartialRunResult) => void | Promise<void>> = [];
  private pendingTools = new Map<string, ToolCall>();
  private completedTools: ToolCall[] = [];

  /**
   * Register a watcher function.
   * Called from AgentExecution.watch()
   */
  addWatcher(fn: (ctx: PartialRunResult) => void | Promise<void>): void {
    this.watchers.push(fn);
  }

  /**
   * Get current partial result for watchers.
   * Includes in-progress data.
   */
  getPartialResult(): PartialRunResult {
    return {
      metrics: {
        ...this.summary.metrics,
        durationMs: performance.now() - this.startTime,
      },
      tools: {
        all: () => [...this.completedTools, ...Array.from(this.pendingTools.values())],
        failed: () => this.completedTools.filter(t => !t.ok),
        succeeded: () => this.completedTools.filter(t => t.ok),
        inProgress: () => Array.from(this.pendingTools.values()),
      },
      todos: this.summary.todos,
      files: {
        changed: () => this.partialFileChanges,
        get: (path: string) => this.partialFileChanges.find(f => f.path === path),
      },
      isComplete: false,
    };
  }

  /**
   * Run watchers after significant events.
   * Throws if any watcher assertion fails.
   *
   * IMPORTANT: Watchers execute SEQUENTIALLY in registration order.
   * - No parallelism: each watcher completes before next starts
   * - First failure stops execution: subsequent watchers don't run
   * - Race conditions impossible: only one watcher runs at a time
   * - Agent execution continues only if all watchers pass
   */
  private async runWatchers(): Promise<void> {
    if (this.watchers.length === 0) return;

    const partial = this.getPartialResult();

    // Sequential execution: await each watcher before starting next
    for (const watcher of this.watchers) {
      await watcher(partial);  // Throws on failed expect(), stops loop
    }
  }

  /**
   * Called after tool completion.
   * Correlates hooks incrementally and runs watchers.
   */
  async onHookPayload(json: HookPayload): Promise<void> {
    await this.hookWriter.write(json);

    // Incremental tool correlation
    if (json.hook === 'PreToolUse') {
      const key = `${json.session_id}:${json.tool_name}`;
      this.pendingTools.set(key, {
        name: json.tool_name!,
        input: JSON.parse(json.tool_input || '{}'),
        ok: false,
        startedAt: json.ts!,
      });
    } else if (json.hook === 'PostToolUse') {
      const key = `${json.session_id}:${json.tool_name}`;
      const pending = this.pendingTools.get(key);

      if (pending) {
        const completed: ToolCall = {
          ...pending,
          output: JSON.parse(json.tool_response || '{}'),
          ok: true,
          endedAt: json.ts,
          durationMs: json.ts! - pending.startedAt,
        };

        this.completedTools.push(completed);
        this.pendingTools.delete(key);

        // Run watchers after tool completion
        await this.runWatchers();
      }
    }
  }
}
```

```typescript
// src/runner/agentRunner.ts
export class AgentExecution extends Promise<RunResult> {
  constructor(
    executor: (resolve: (value: RunResult) => void, reject: (reason?: any) => void) => void,
    private contextManager: ContextManager
  ) {
    super(executor);
  }

  watch(fn: (ctx: PartialRunResult) => void | Promise<void>): void {
    this.contextManager.addWatcher(fn);
  }
}

export async function runAgent(opts: RunAgentOptions): AgentExecution {
  const contextManager = new ContextManager({ /* ... */ });

  const execution = new AgentExecution(async (resolve, reject) => {
    try {
      const stream = query({ /* ... */ });

      for await (const evt of stream) {
        await contextManager.onSDKEvent(evt);
        // Watchers run in onHookPayload when tools complete
      }

      const result = await contextManager.finalize();
      resolve(result);
    } catch (err) {
      reject(err);  // Propagates watcher errors to Vitest
    }
  }, contextManager);

  return execution;
}
```

**Example Usage**:

```typescript
vibeTest('fail fast on errors', async ({ runAgent, expect }) => {
  const execution = runAgent({ prompt: '/refactor' });

  // Register watcher for early failure
  execution.watch((ctx) => {
    expect(ctx.tools.failed().length).toBeLessThan(3);
    expect(ctx.metrics.totalCostUsd).toBeLessThan(5.0);
  });

  // Test fails immediately if watcher assertion fails
  const result = await execution;

  // Only reaches here if watchers never threw
  expect(result).toCompleteAllTodos();
});
```

**When Watchers Run**:
- After each tool call completes (PostToolUse received)
- After significant cost updates (every N tokens)
- Can be customized via ContextManager configuration

**Error Propagation**:
1. Watcher assertion fails → `expect()` throws
2. Error propagates through `runWatchers()` → `onHookPayload()` → agent execution loop
3. AgentExecution promise rejects
4. Vitest catches rejection → marks test as failed
5. AbortController cancels SDK stream → cleanup runs

### 6.4 Judge Implementation

**How judge() works internally**:

1. **Format rubric into prompt**: Judge takes user's rubric + instructions and formats them into a structured prompt
2. **Execute via SDK**: Uses `query()` internally (judge is a specialized agent)
3. **Parse structured output**: Parses response according to `resultFormat` schema
4. **Return typed result**: Returns user-defined judgment structure

**Implementation sketch**:

```typescript
// SDK imports (via bridge layer - see Section 5.5)
import type { SDKUserMessage } from '../sdk/types';
import { query } from '../sdk/types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

/**
 * System prompt for judge agent.
 * Instructs the LLM to act as an objective code evaluator.
 */
const JUDGE_SYSTEM_PROMPT = `You are an expert code evaluator and quality reviewer.

Your role is to objectively evaluate code execution results against provided rubrics.

Guidelines:
- Be thorough and objective in your assessment
- Base judgments on evidence from the execution result (files changed, tools used, costs)
- Provide constructive feedback with specific examples
- When using structured rubrics, evaluate each criterion independently
- Be strict but fair - don't pass code that doesn't meet requirements
- Provide actionable next steps for improvements

Always structure your response according to the required output format (if provided).`;

/**
 * Error thrown when judgment fails and throwOnFail is true.
 */
export class JudgmentFailedError extends Error {
  constructor(public judgment: unknown) {
    super('Judgment failed');
    this.name = 'JudgmentFailedError';
  }
}

export async function judge<T = DefaultJudgmentResult>(
  result: RunResult,
  options: {
    rubric: Rubric;
    instructions?: string;
    resultFormat?: z.ZodType<T>;
    throwOnFail?: boolean;
  }
): Promise<T> {
  // 1. Format rubric + instructions into prompt
  const judgePrompt = formatJudgePrompt({
    rubric: options.rubric,
    instructions: options.instructions,
    result: result,
    outputSchema: options.resultFormat,
  });

  // 2. Execute using SDK (judge is a specialized agent)
  const response = await query({
    prompt: judgePrompt,
    options: {
      model: 'claude-3-5-sonnet-latest',
      systemPrompt: JUDGE_SYSTEM_PROMPT,
    }
  });

  // 3. Parse structured output
  const judgment = parseJudgmentResponse(response, options.resultFormat);

  // 4. Throw if requested and failed
  if (options.throwOnFail && !judgment.passed) {
    throw new JudgmentFailedError(judgment);
  }

  return judgment as T;
}

function formatJudgePrompt(config: {
  rubric: Rubric;
  instructions?: string;
  result: RunResult;
  outputSchema?: z.ZodType<any>;
}): AsyncIterable<SDKUserMessage> {
  return prompt({
    text: `
      # Evaluation Task

      ${config.instructions || 'Evaluate the following result against the rubric.'}

      ## Rubric
      ${JSON.stringify(config.rubric, null, 2)}

      ## Result to Evaluate
      - Files changed: ${config.result.files.stats().total}
      - Tools used: ${config.result.tools.all().length}
      - Cost: ${config.result.metrics.totalCostUsd}

      ${config.outputSchema ? `## Required Output Format\n${zodToJsonSchema(config.outputSchema)}` : ''}
    `,
    files: config.result.files.changed().map(f => f.path),  // Include changed files for context
  });
}

/**
 * Parse LLM response into structured judgment result.
 * Validates against Zod schema if provided.
 */
function parseJudgmentResponse<T>(
  response: unknown,
  schema?: z.ZodType<T>
): T {
  if (schema) {
    // Custom schema provided - validate and parse
    return schema.parse(response);
  }

  // No schema - return as DefaultJudgmentResult
  // Assume LLM returned correct structure (or cast)
  return response as T;
}
```

**Key Points**:
- Judge formats rubric into a prompt internally (user doesn't see this)
- Uses `prompt()` helper to build multi-modal messages
- Executes via SDK like any agent
- Parses response into structured output

**Example Usage with Custom Types**:

```typescript
// Using default judgment result
const judgment = await judge(result, {
  rubric: {
    criteria: [
      { name: "Correctness", description: "Code works as expected" },
      { name: "Testing", description: "Has adequate test coverage" }
    ]
  },
  instructions: "Be strict about test coverage",
});

console.log(judgment.passed);  // boolean
console.log(judgment.feedback);  // string

// Using custom typed judgment result
const CustomJudgmentSchema = z.object({
  passed: z.boolean(),
  scores: z.record(z.number()),
  criticalIssues: z.array(z.string()),
});

type CustomJudgment = z.infer<typeof CustomJudgmentSchema>;

const judgment = await judge<CustomJudgment>(result, {
  rubric: myRubric,
  resultFormat: CustomJudgmentSchema,
});

console.log(judgment.scores);  // Record<string, number> - typed!
console.log(judgment.criticalIssues);  // string[] - typed!
```

### 6.5 prompt() Implementation

**Purpose**: Build multi-modal user messages from text, images, and files.

**Return Type**: `AsyncIterable<SDKUserMessage>` (async generator)

```typescript
// src/helpers/prompt.ts
import { readFile } from 'node:fs/promises';
import type { SDKUserMessage } from '../sdk/bridge';

/**
 * Create a multi-modal user message for Claude SDK.
 * Returns async iterable to match SDK query() signature.
 */
export async function* prompt(config: {
  text?: string;
  images?: Array<string | Buffer>;
  files?: Array<string>;
  command?: string;
}): AsyncIterable<SDKUserMessage> {
  const content: Array<{ type: 'text' | 'image'; text?: string; image?: string }> = [];

  // Add slash command if provided
  if (config.command) {
    content.push({ type: 'text', text: config.command });
  }

  // Add text content
  if (config.text) {
    content.push({ type: 'text', text: config.text });
  }

  // Add file contents
  if (config.files) {
    for (const filePath of config.files) {
      try {
        const fileContent = await readFile(filePath, 'utf-8');
        content.push({
          type: 'text',
          text: `File: ${filePath}\n\n${fileContent}`,
        });
      } catch (err) {
        // Log error but continue
        console.warn(`[vibe-check] Failed to read file ${filePath}: ${err.message}`);
      }
    }
  }

  // Add images (convert to base64)
  if (config.images) {
    for (const img of config.images) {
      try {
        const base64 = Buffer.isBuffer(img)
          ? img.toString('base64')
          : (await readFile(img)).toString('base64');

        content.push({ type: 'image', image: base64 });
      } catch (err) {
        console.warn(`[vibe-check] Failed to load image: ${err.message}`);
      }
    }
  }

  // Yield single message
  // If only one text block, use string format (simpler)
  // Otherwise use array format for multi-modal
  yield {
    role: 'user',
    content:
      content.length === 1 && content[0].type === 'text' && content[0].text
        ? content[0].text
        : content,
  };
}
```

**Key Design Decisions**:

1. **Async Generator**: Returns `AsyncIterable<SDKUserMessage>` to match SDK `query()` signature
2. **Single Message**: Always yields exactly one message (could be extended for conversation chains)
3. **Error Handling**: File/image loading errors logged but don't fail the function
4. **Content Format**: Uses string for simple text, array for multi-modal

**Usage**:

```typescript
// Simple text prompt
const msg1 = prompt({ text: 'Fix the bug in auth.ts' });

// Multi-modal prompt with files and images
const msg2 = prompt({
  text: 'Review this design',
  files: ['requirements.md', 'spec.txt'],
  images: ['mockup.png'],
});

// With slash command
const msg3 = prompt({
  command: '/refactor',
  files: ['legacy-code.js'],
});

// Pass to runAgent
await runAgent({
  agent: myAgent,
  prompt: msg2,  // AsyncIterable<SDKUserMessage>
});
```

---

## 7. Error Handling Patterns

### 7.1 Hook Capture Failures

**Strategy**: Graceful degradation with logging

**Policy**: Hook capture failures should **NEVER** fail tests. Tests pass or fail based on user assertions, not infrastructure issues.

**Implementation Requirements**:

1. **Error Logging**: Log to stderr with `[vibe-check]` prefix
2. **Track Failures**: Update `hookCaptureStatus` in RunResult
3. **Continue Execution**: Don't throw errors, proceed with partial data
4. **User Control**: Provide `toHaveCompleteHookData()` matcher for strict mode

```typescript
class ContextManager {
  private hookCaptureStatus = {
    complete: true,
    missingEvents: [] as string[],
    warnings: [] as string[],
  };

  async onHookPayload(json: unknown) {
    try {
      await this.hookWriter.write(json);
    } catch (err) {
      // Graceful degradation - log to stderr, track failure, continue
      const warning = `Hook write failed: ${err.message}`;
      console.warn(`[vibe-check] ${warning}`);

      this.hookCaptureStatus.complete = false;
      this.hookCaptureStatus.warnings.push(warning);

      // Don't throw - test continues with partial data
    }
  }

  async finalize(): Promise<RunResult> {
    // ... process hooks, correlate tool calls, etc.

    return {
      bundleDir: this.bundleDir,
      // ... other fields
      hookCaptureStatus: this.hookCaptureStatus, // Include capture status
    };
  }
}
```

**Rationale**:
- **Resilient CI**: Transient filesystem/timing issues don't break builds
- **Automation-first**: Workflows proceed even with partial data
- **User choice**: Strict validation available via matchers when needed
- **Industry standard**: Matches approach of Jest, Playwright, and other test frameworks

**See Also**: Section 4.2.2 for detailed error handling implementation

### 7.2 Agent Execution Timeouts

**Strategy**: AbortSignal propagation + cleanup

```typescript
async function runAgent(
  opts: RunAgentOptions,
  ctx: { signal?: AbortSignal }
): Promise<RunResult> {
  const controller = new AbortController();
  const signal = ctx.signal ?? controller.signal;

  const timeout = setTimeout(() => {
    controller.abort();
  }, opts.timeoutMs ?? 300000);

  try {
    const stream = query({
      prompt: opts.prompt,
      options: { ...opts, signal },
    });

    for await (const evt of stream) {
      if (signal.aborted) throw new Error('Aborted');
      await contextManager.onSDKEvent(evt);
    }

    return await contextManager.finalize();
  } finally {
    clearTimeout(timeout);
  }
}
```

### 7.3 Missing PostToolUse

**Strategy**: Mark as incomplete, include in report

```typescript
// In correlateToolCalls:
if (!postHook) {
  toolCalls.push({
    name: preHook.tool_name!,
    input: JSON.parse(preHook.tool_input || '{}'),
    ok: false, // Mark as failed
    incomplete: true, // Flag for reporters
    cwd: preHook.cwd,
    startedAt: preHook.ts!,
  });
}
```

---

## 8. Performance Considerations

### 8.1 Lazy Loading

- **Never** load all file contents into memory
- Use `text()` / `stream()` accessors on demand
- Matchers should read only what's needed (e.g., first 1000 lines for sampling)

### 8.2 Content-Addressed Storage

- Deduplicate identical file contents across tests
- SHA-256 hash as filename prevents collisions
- Gzip files >10MB to save disk space

### 8.3 NDJSON Streaming

- Append-only writes during execution (no blocking reads)
- Read/parse only during finalization (after agent completes)
- Supports very large execution traces without memory issues

### 8.4 Task Meta Constraints

- Keep `task.meta` <10KB (Vitest serializes via IPC)
- Store only: metrics summary + bundleDir pointer
- Reporters read heavy data from disk, not meta

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Target**: Individual functions and utilities

```typescript
// src/test/matchers.test.ts
describe('toHaveChangedFiles', () => {
  it('matches exact file paths', () => {
    const result = mockRunResult({
      files: [{ path: 'src/index.ts', changeType: 'modified' }],
    });
    expect(result).toHaveChangedFiles(['src/index.ts']);
  });

  it('supports glob patterns', () => {
    const result = mockRunResult({
      files: [
        { path: 'src/index.ts', changeType: 'modified' },
        { path: 'src/utils.ts', changeType: 'modified' },
      ],
    });
    expect(result).toHaveChangedFiles(['src/**/*.ts']);
  });
});
```

### 9.2 Integration Tests

**Target**: Fixture lifecycle, reporters, context manager

```typescript
// test/integration/vibeTest.test.ts
vibeTest('integration: runAgent captures context', async ({ runAgent }) => {
  const result = await runAgent({
    prompt: 'Create README.md',
    workspace: testFixture,
  });

  // Verify auto-capture
  expect(result.bundleDir).toBeTruthy();
  expect(result.files.get('README.md')).toBeTruthy();
  expect(result.tools.used('Write')).toBeGreaterThan(0);
});
```

### 9.3 E2E Tests

**Target**: Live SDK integration (gated by env var)

```typescript
// test/e2e/live-agent.test.ts
vibeTest.skipIf(!process.env.CLAUDE_API_KEY)(
  'e2e: live agent execution',
  async ({ runAgent, task }) => {
    task.meta.maxCost = 2.0; // Budget for live test

    const result = await runAgent({
      model: 'claude-3-5-sonnet-latest',
      prompt: '/analyze',
      workspace: testFixture,
    });

    expect(result).toStayUnderCost(2.0);
    expect(result.metrics.totalCostUsd).toBeGreaterThan(0);
  }
);
```

---

## 10. Changelog & Versioning

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to public API
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, performance improvements

**Breaking Changes** (require major version bump):
- Changes to `VibeTestContext` / `WorkflowContext` signatures
- Changes to `RunResult` interface
- Changes to `RunAgentOptions` (removing fields)
- Changes to matcher signatures
- Changes to RunBundle structure (breaking reporters)

**Non-Breaking Changes** (minor version bump):
- Adding new matchers
- Adding new fields to `RunResult` (optional)
- Adding new reporters
- New helper functions

---

## 11. Migration Guide (Future)

### From vibeTest to vibeWorkflow

```typescript
// Before (vibeTest with manual sequencing):
vibeTest('multi-stage', async ({ runAgent }) => {
  const analyze = await runAgent({ prompt: '/analyze' });
  const fix = await runAgent({ prompt: '/fix' });
  // Manual state tracking...
});

// After (vibeWorkflow with automatic accumulation):
vibeWorkflow('multi-stage', async (wf) => {
  await wf.stage('analyze', { prompt: '/analyze' });
  await wf.stage('fix', { prompt: '/fix' });
  // Cumulative state available via wf.files.allChanged(), etc.
});
```

### From Manual Assertions to Matchers

```typescript
// Before (manual file checking):
vibeTest('check files', async ({ runAgent }) => {
  const result = await runAgent({ prompt: '/refactor' });
  const files = result.files.changed();
  expect(files.some((f) => f.path === 'src/index.ts')).toBe(true);
});

// After (declarative matcher):
vibeTest('check files', async ({ runAgent }) => {
  const result = await runAgent({ prompt: '/refactor' });
  expect(result).toHaveChangedFiles(['src/index.ts']);
});
```

---

## 12. References

### External Documentation

- **Vitest**: https://vitest.dev
  - Test Context: https://vitest.dev/guide/test-context
  - Task Metadata: https://vitest.dev/advanced/metadata
  - Reporters: https://vitest.dev/advanced/api/reporters
  - Test API: https://vitest.dev/api/

- **Claude Code**:
  - Hooks: https://docs.claude.com/en/docs/claude-code/hooks
  - Agent SDK: https://docs.claude.com/en/api/agent-sdk/typescript

- **TypeScript**:
  - Module Augmentation: https://www.typescriptlang.org/docs/handbook/declaration-merging.html

### Internal Documentation

- Technical Specification: `.claude/docs/vibecheck/technical-specification.md` (this document)
- Documentation Structure Plan: `.claude/docs/vibecheck/docs-structure-plan-alternative.md`
- Project Overview: `CLAUDE.md`

---

**Document Version**: 1.4
**Last Updated**: 2025-10-06
**Status**: Ready for Implementation

**Key Features**:
- Multi-modal prompt() with support for text, images, files, and commands
- Generic judge() with type-safe custom result formats via Zod schemas
- User-defined rubric structures (framework does not prescribe structure)
- Cumulative state tracking in VibeTestContext (files, tools, timeline)
- Reactive watchers for early test failure (AgentExecution.watch)
- Incremental tool correlation during execution
- PartialRunResult for in-progress assertions
- _TestContextManager (internal) for multi-run state accumulation
- Unified API between vibeTest and vibeWorkflow for state access
