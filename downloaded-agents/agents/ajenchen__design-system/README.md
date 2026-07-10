# .claude/agents/ Charter

## 這裡只收:**特化 subagent**(scoped tools + isolated context)

每個 agent 一檔 `.md`,格式:
```markdown
---
name: agent-name-kebab-case
description: 何時 invoke(main AI 透過 Task tool `subagent_type: 'agent-name-kebab-case'` 調用)
tools: [Read, Grep, Bash, Glob]  # scoped — 該 agent 需要的最小集
---

System prompt body — agent 收到 prompt + 本檔內容 作為 context。
```

**vs Skill**:skill 是 main AI 跟 user 互動的 workflow(CP / user decision);agent 是 main AI 呼叫的特化 worker(isolated context,返回 summary)。

**vs 一般 general-purpose Agent**:registered agent 有 scoped tools(不能亂改檔)+ 特化 system prompt(專業知識內建)+ 更易 audit。

## 當前居民(0,2026-04-24 retired)

**原 6 個 pilot agents(ds-dim-auditor / visual-auditor / baseline-matrix-builder / governance-health-analyst / performance-auditor / ux-auditor)已 retire 2026-04-24**:Claude Code runtime 此版本不 surface project-level agents 到 `subagent_type` 參數(try invoke 得 "Agent type not found" error)。Skills 改用 `subagent_type: 'Explore'`(built-in)+ dim-specific prompt 達到同效。

Dir 保留 + 本 charter 保留 — 等未來 Claude Code runtime 支援 project agents 再重建。

## 這裡**不收**(反例)

| 疑似要放這但其實不是 | 正確去處 | 為什麼 |
|---------------------|---------|--------|
| 需要 user CP 多次決策的 workflow | `.claude/skills/` | agent 返回一次 summary,user CP 需在 main AI 端處理 = skill |
| 一次性 script | `.claude/commands/` | agent 是 AI worker,不是 script |
| 每 session signal rule | `CLAUDE.md` | agent 只在 invoke 時載入 |
| 機械 tool-level 檢查 | `.claude/hooks/` | hook 是 pre/post tool event,不是 AI agent |

## 新 agent 的 criteria

1. **Scope isolated**(main AI 不需知道 agent 內部思考,只讀 agent return summary)
2. **Scoped tools** 明確寫在 frontmatter(不是「全權」,是 minimal set)
3. **被 ≥ 1 skill 調用**(orphan agent 不建)
4. **Main AI 可 deterministic 消費 return**(agent 輸出結構清楚)

## Skill vs Agent 選擇指南

```
問題需要 user 多次 CP 決策? 
  → YES: skill(main AI 驅動,phase + CP)
  → NO: 
      問題是 scan / analysis / lookup?
        → YES: agent(scoped tools,isolated,可 parallel / background)
        → NO: 用 skill 或 command
```

## 本 pilot 的 rationale(2026-04-24)→ 已 retire

原設計意圖:skill 保留 CP 流程,內部 parallel 調 scoped-tools sub-agent 減 main context pollution。Retire 原因:runtime 限制 — project agents 未 surface 到 Agent tool 的 `subagent_type` enum。

**current workaround**:skill 改用 `subagent_type: 'Explore'`(built-in,Read/Grep/Glob/Bash/WebFetch 已可滿足 audit 類工作),加 `thoroughness` 參數 + dim-specific prompt 達到同效。
