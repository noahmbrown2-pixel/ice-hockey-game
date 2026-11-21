# SkillDistiller Instance Binding — lamda-power-trading

> **Framework**: `skills/skilldistiller/SKILL.md`
> **This file binds** role names from `auto_prompt_instance.md` for distillation.

## 🔗 Role References

All role names are loaded from `.roo/skills/auto_prompt_instance.md`:

| Template Variable | Source | Value |
|------|------|------|
| `{{DESIGNER_NAME}}` | auto_prompt_instance | 流萤 |
| `{{CODER_NAME}}` | auto_prompt_instance | 银狼 |
| `{{REVIEWER_NAME}}` | auto_prompt_instance | 黑塔 |

## 🎯 Project-Specific Distillation Targets

When distilling this project, extract patterns for these domains:

| Domain | Priority | Example |
|--------|:-------:|---------|
| 电力市场数据分析 | P0 | Market clearing simulation, price forecasting |
| 储能技术投资方案 | P0 | Investment framework, tech route comparison |
| 政策文件分析融入 | P1 | AI+Electricity policy, national strategy alignment |
| Python 数据分析图表 | P1 | Scatter/heatmap/time-series visualization |
| 三Agent协作优化 | P2 | Loop correction, solidification workflows |

## 📊 Known Patterns (For Cross-Project Reuse)

Patterns that have been validated in this project and ready for cross-project distillation:

| Pattern | Type | Domain | Validations |
|------|------|------|:---:|
| 市场出清三层架构（ISO→Bid→Clearing） | Architecture | 电力市场 | 1 |
| 五维投资评估矩阵（壁垒/协同/量产/市场/团队） | Decision | 储能投资 | 1 |
| 政策融入三段法（摘要/逻辑/矩阵） | Meta | 通用 | 1 |
| 量化数据区间估算+数据诚实声明 | Best Practice | 通用 | 1 |
| P0/P1/P2 三级审核优先级 | Review | 通用 | 1 |

## 🔄 Cross-Project Gate

A pattern graduates from "project-specific" to "cross-project" when:
- Validated in ≥ 2 projects
- Reviewed by {{REVIEWER_NAME}}
- Promoted to `.roo/rules/` or `skills/auto_prompt_<domain>_v<N>/`

---

## 🧠 RuleMemory 存储与复用流程（自进化闭环）

每次 SkillDistiller 完成蒸馏后，自动触发以下 RuleMemory 存储流程：

### 存储触发条件

蒸馏报告满足以下任一条件时，自动存入 RuleMemory：
- 项目评分 ≥ 4/5
- 提取的模式数 ≥ 3
- {{REVIEWER_NAME}} 审核通过

### 存储工作流

```
SkillDistiller 蒸馏完成
        ↓
提取所有 pattern_key（去重）
        ↓
对每个 pattern_key 调用 search_memory
        ↓
已存在？ → 更新 Recurrence-Count + Last-Seen
        ↓ 不存在
    调用 add_message 创建新 RuleMemory
        ↓
标注字段：
  - memory_type: RuleMemory
  - pattern_key: {domain}.{category}.{description}
  - confidence: 0.9+（基于项目评分）
  - source: skill_distillation
  - project: {PROJECT_NAME}
        ↓
Recurrence-Count ≥ 3？
        ↓ 是
    建议提升为 .roo/rules/{pattern_key}.md
        ↓
    用户确认后写入永久规则
```

### 下次同类项目复用

当新项目触发 "生成项目目前的专属提示词" 时：

1. `auto_prompt_3agents` 自动调用 `search_memory`
2. 检索所有 `memory_type: RuleMemory` 且 `pattern_key` 匹配当前领域的记录
3. 将匹配的规则自动注入到生成的任务书中
4. 标注："本规则基于 {n} 次项目验证"

### Memos MCP 调用示例

```
调用 mcp--memos-api-mcp--add_message:
  conversation_first_message: 当前对话首条消息
  messages: [{
    role: "assistant",
    content: "[SkillDistiller] pattern_key: latex.table_spacing | 标题: LaTeX表格间距三层控制法 | 详情: booktabs参数化+全局配置+标准化模板 | 验证次数: 1 | 来源项目: lamda-power-trading"
  }]
```

> **安全注意**：存储时剥离项目特定内容，只保留结构、关系、规则等不变量。

---

## ⏳ 规则过期/淘汰机制（记忆库净化）

确保记忆库中的规则始终有效，防止过时或长期未验证的规则污染检索结果和影响新项目决策。

### 规则状态流转

```
RuleMemory 创建 → status: active
        ↓
  每次 search_memory 命中 → 更新 last_hit_at
        ↓
  超过 90 天无命中？
        ↓ 是
  status: stale（标记为待验证）
        ↓
  下次 search_memory 仍无命中？
        ↓ 是（再 30 天）
  status: expired
        ↓
  用户确认后删除 OR 重新验证后 recovery
```

### 状态定义

| 状态 | 含义 | 条件 | search_memory 行为 |
|------|------|------|-------------------|
| `active` | 活跃规则，正常使用 | 最近 90 天内有命中 | 正常返回 |
| `stale` | 待验证规则，可能过时 | 90-120 天无命中 | 返回但标注 `[待验证]`，降权排序 |
| `expired` | 已过期，需清理 | > 120 天无命中 | **不返回**（排除） |
| `recovered` | 重新验证通过 | 原规则被新项目引用且验证通过 | 恢复为 `active` |

### 自动过期检查流程

每次 SkillDistiller 蒸馏完成或 auto_prompt_3agents 生成任务书时，自动执行：

```
1. search_memory 按 domain 检索所有 active/stale 的 RuleMemory
2. 计算每条规则的 last_hit_at 距今时间
3. 距今日 > 90 天 → 更新 status: stale
4. 距今日 > 120 天 → 更新 status: expired
5. 向用户报告：
   "检测到 X 条待验证规则（stale）, Y 条已过期规则（expired）。"
```

### 清理确认

- `stale` 规则：自动标记，下次被命中时重新验证
- `expired` 规则：输出列表请用户确认是否删除
  ```
  ## ⏳ 过期规则清理建议
  | Pattern-Key | 最后命中 | 距今 | 操作 |
  |------------|---------|:---:|------|
  | latex.table_spacing | 2026-01-15 | 122天 | [删除]/[重新验证] |
  ```
- 用户确认后调用 `delete_memory` 或重置为 `recovered`

### Memos MCP 更新示例

```
调用 mcp--memos-api-mcp--add_feedback:
  feedback_content: "规则过期标记: pattern_key latex.table_spacing 超过120天无命中，标记为 expired。请确认是否删除。"
```
