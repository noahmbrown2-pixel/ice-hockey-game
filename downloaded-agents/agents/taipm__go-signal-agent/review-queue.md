# Learning Review Queue

**Last Updated:** 2025-12-29 09:55
**Pending Items:** 0
**Agent:** go-dev-agent

---

## Critical Priority

| ID | Type | Title | Created | Evidence | Confidence |
|----|------|-------|---------|----------|------------|
| - | - | No critical items | - | - | - |

---

## High Priority

| ID | Type | Title | Created | Evidence | Confidence |
|----|------|-------|---------|----------|------------|
| - | - | No high priority items | - | - | - |

---

## Medium Priority

| ID | Type | Title | Created | Evidence | Confidence |
|----|------|-------|---------|----------|------------|
| - | - | No medium priority items | - | - | - |

---

## Review Commands

```
*learn-review           # Start reviewing from top of queue
*learn-approve:ID       # Approve item
*learn-reject:ID        # Reject with reason prompt
*learn-modify:ID        # Open for modification
*learn-defer:ID         # Move to end of queue
*learn-details:ID       # View full details of item
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Reviewed | 2 |
| Approved | 2 |
| Rejected | 0 |
| Modified | 0 |
| Deferred | 0 |
| Avg Review Time | ~3 min |

---

## Recent Activity

| Date | Action | ID | Title | Decision |
|------|--------|----|-------|----------|
| 2025-12-29 | Escalated | L001 | Context Timeout for External API Calls | - |
| 2025-12-29 | Escalated | L002 | Signal Handler Goroutine Leak | - |
| 2025-12-29 | Reviewed | L002 | Signal Handler Goroutine Leak | **APPROVED** |
| 2025-12-29 | Reviewed | L001 | Context Timeout for External API Calls | **APPROVED** |

---

## Queue Empty

All pending items have been reviewed. The learning system will capture new learnings as the agent works on tasks.

To manually capture a learning:
```
*learn-capture
```
