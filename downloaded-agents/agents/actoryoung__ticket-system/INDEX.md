---
name: agent-collection
description: Claude Code 模板的可用于 Task tool 的 Agent 索引。启动时仅加载此索引，完整 Agent 内容按需加载。
version: 1.0
---

# Agent Collection Index

这是模板中所有可用 Agent 的索引文件。**启动时仅加载此索引**，完整 Agent 内容在激活时按需加载，实现渐进式上下文管理。

## When to Use This Index

使用此索引当：
- 需要查找可用的 Agent
- 需要了解每个 Agent 的触发条件
- 需要选择合适的 Agent 处理任务

## Agent Map

### 主控代理

| Agent | 触发条件 | 文件 |
|-------|----------|------|
| **orchestrator** | 复杂多步骤任务、需要多 Agent 协作 | `orchestrator.md` |

**核心能力**：任务分解、智能调度、结果整合

**调度模式**：
- 串行：依赖任务按顺序执行
- 并行：独立任务同时执行
- 混合：部分并行、部分串行

---

### 专业代理

| Agent | 触发条件 | 文件 |
|-------|----------|------|
| **spec-writer** | 创建规范、基于规范生成测试 | `spec-writer.md` |
| **code-writer** | 实现功能代码、编写组件 | `code-writer.md` |
| **test-writer** | 编写测试、补充测试用例 | `test-writer.md` |
| **code-reviewer** | PR 审查、代码质量检查 | `code-reviewer.md` |
| **debugger** | Bug 诊断、错误分析 | `debugger.md` |
| **refactor-agent** | 代码重构、结构优化 | `refactor-agent.md` |

---

### 扩展代理

| Agent | 继承自 | 触发条件 | 文件 |
|-------|--------|----------|------|
| **frontend-writer** | code-writer | 前端代码实现 | 用户自定义 |
| **backend-writer** | code-writer | 后端代码实现 | 用户自定义 |
| **ai-writer** | code-writer | AI/ML 代码实现 | 用户自定义 |

---

## Quick Reference

### 按任务类型选择 Agent

| 任务类型 | 推荐流程 | 涉及 Agent |
|---------|----------|------------|
| **规范驱动开发** | SPEC → 测试 → 代码 | spec-writer → test-writer → code-writer |
| **新功能开发** | 设计 → 实现 → 测试 → 审查 | Plan → code-writer → test-writer → code-reviewer |
| **Bug 修复** | 探索 → 诊断 → 修复 | Explore → debugger → code-writer |
| **代码审查** | 直接审查 | code-reviewer |
| **重构** | 诊断 → 重构 → 测试 | debugger → refactor-agent → test-writer |

### 按角色选择 Agent

| 角色 | Agent | 说明 |
|------|-------|------|
| **产品/设计** | spec-writer | 编写功能规范 |
| **开发者** | code-writer | 实现代码 |
| **测试工程师** | test-writer | 编写测试 |
| **代码审查者** | code-reviewer | 审查代码 |
| **调试专家** | debugger | 诊断问题 |

---

## Progressive Loading

此索引设计实现 **渐进式上下文加载**：

```
启动阶段
  ↓
仅加载 INDEX.md（约 50 行）
  ↓
显示所有 Agent 名称和触发条件
  ↓
用户选择任务 → 加载对应 Agent 完整内容
  ↓
执行任务 → 释放不需要的 Agent 上下文
```

**优势**：
- 启动时占用最少 token
- 只加载需要的 Agent 内容
- 减少 context 混淆
- 提高响应速度

---

## Creating Custom Agents

基于现有 Agent 创建自定义 Agent：

### 1. 选择父 Agent

```bash
# 例如：基于 code-writer 创建 frontend-writer
cp .claude/agents/code-writer.md .claude/agents/frontend-writer.md
```

### 2. 修改元数据

```yaml
---
name: frontend-writer
description: 前端代码实现（React/Vue/Angular）
version: 1.0
extends: code-writer
---
```

### 3. 覆盖特定配置

```markdown
## 技术栈（覆盖）
固定识别为前端技术栈

## 编码规范（扩展）
添加前端特定规范

## Snippets 引用（覆盖）
snippets_dir: .claude/snippets/frontend/
```

### 4. 在此索引中注册

```markdown
### 扩展代理
| Agent | 继承自 | 触发条件 |
|-------|--------|----------|
| **frontend-writer** | code-writer | 前端代码实现 |
```

---

## Agent Metadata

每个 Agent 文件包含以下元数据：

```yaml
---
name: agent-name
description: 一句话描述 Agent 的用途和触发条件
version: 1.0
extends: null | parent-agent-name
extensions:
  - name: extension-name
    description: 扩展描述
role: agent | supervisor
---
```

**元数据说明**：

| 字段 | 说明 | 必填 |
|------|------|------|
| `name` | Agent 名称（用于 Task tool 的 subagent_type） | 是 |
| `description` | 简洁描述，包含触发条件 | 是 |
| `version` | 版本号 | 是 |
| `extends` | 继承的父 Agent（null 表示独立 Agent） | 否 |
| `extensions` | 此 Agent 的扩展列表 | 否 |
| `role` | 角色：agent（子代理）或 supervisor（主控代理） | 否 |

---

## Related Files

- `.claude/agents/*.md` - 各 Agent 的完整定义
- `.claude/workflows/spec-driven-tdd.md` - 规范驱动 TDD 工作流
- `.claude/docs/agents.md` - Agent 详细文档
