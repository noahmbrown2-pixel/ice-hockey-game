# AutoPrompt_3Agent Instance Binding — lamda-power-trading

> **Framework**: `skills/auto_prompt_3agents/SKILL.md`
> **This file binds** role names, modes, models, and project-specific context to the abstract framework.

## 🔀 Mode-to-Role Mapping (Roo 自动识别)

Roo 通过以下映射关系，将用户触发词中的模式名自动对应到角色：

| 触发模式 | 对应角色 | 角色名 | Roo 模式 slug |
|---------|---------|------|:---------:|
| Architect / 以Architect角色 / 给流萤发 | {{ROLE_DESIGNER}} | {{DESIGNER_NAME}} | `architect` |
| Code / 以Code角色 / 给银狼发 | {{ROLE_CODER}} | {{CODER_NAME}} | `code` |
| Ask / 以Ask角色 / 给黑塔发 | {{ROLE_REVIEWER}} | {{REVIEWER_NAME}} | `ask` |

**触发词示例**:
```
给流萤发：以Architect角色，使用auto_prompt_3agents生成XX项目的架构任务书
给银狼发：以Code角色，使用auto_prompt_3agents实现XX功能
给黑塔发：以Ask角色，使用auto_prompt_3agents审核XX代码是否符合规则
```

## 🔗 Role-Mode Bindings

| Template Variable | Value |
|------|------|
| `{{PROJECT_NAME}}` | lamda-power-trading |
| `{{PROJECT_DOMAIN}}` | 电力市场分析 / 储能技术投资 / 政策研究 |
| `{{PROJECT_PHASE}}` | 储能硬技术投资方案 v2.1（已融入 AI+储能政策背书） |
| `{{PROJECT_VERSION}}` | v2.1 |
| `{{PROJECT_TECH_ROUTES}}` | 全钒液流（35%）/ 压缩空气（25%）/ 氢储能（10%）/ 钠离子（10%）/ 固态锂（10%）/ LFP（10%） |
| `{{CODE_PATHS}}` | 代码/python/（主力）/ 代码/stata/（辅助） |
| `{{DATA_PATHS}}` | 数据/work_first/ |
| `{{REVIEW_DIMENSIONS}}` | 战略定位、逻辑闭环、数据支撑、面试表现力 |

## 👤 User Identity

| Variable | Value |
|------|------|
| `{{USER_NAME}}` | 杰 |

## 👨‍💼 Designer

| Variable | Value |
|------|------|
| `{{ROLE_DESIGNER}}` | 总设计师 |
| `{{DESIGNER_NAME}}` | 流萤 |
| `{{DESIGNER_MODE}}` | architect |
| `{{DESIGNER_MODEL}}` | Kimi |
| `{{DESIGNER_PERMISSIONS}}` | 只能修改 .md 文件（规划/设计文档） |

## 👨‍💻 Coder

| Variable | Value |
|------|------|
| `{{ROLE_CODER}}` | 总代码师 |
| `{{CODER_NAME}}` | 银狼 |
| `{{CODER_MODE}}` | code |
| `{{CODER_MODEL}}` | DeepSeek |
| `{{CODER_PERMISSIONS}}` | 可修改所有文件 |

## 👨‍🔬 Reviewer

| Variable | Value |
|------|------|
| `{{ROLE_REVIEWER}}` | 总审核师 |
| `{{REVIEWER_NAME}}` | 黑塔 |
| `{{REVIEWER_MODE}}` | ask |
| `{{REVIEWER_MODEL}}` | GLM |
| `{{REVIEWER_PERMISSIONS}}` | 只能查看/分析，不能直接修改文件 |

## 🌐 Environment

| Variable | Value |
|------|------|
| `{{DEFAULT_LANGUAGE}}` | 简体中文 |
| `{{ENV_SHELL}}` | PowerShell 7 |
| `{{ENV_CONSTRAINTS}}` | PowerShell 7 + Windows 11 环境约束 |

## 📜 Active Safety Protocols

From `.roo/rules/`:
- `silver-wolf-protocol.txt` — 银狼安全协议（静默原则 / 本地优先 / 代码安全自查）
- `rules.md` — Memos MCP 记忆管理
- `self-improvement-triggers.md` — 自动学习触发规则

## 📂 Project File Structure

```
lamda-power-trading/
├── .roo/
│   ├── rules/         # Project rules
│   └── skills/        # Project-specific skills
├── skills/            # Global cross-project skills
├── prompts/           # Prompt backups
├── 代码/python/       # Main code
├── 代码/stata/        # Stata analysis
├── 数据/work_first/   # Raw data & pipelines
├── 报告/              # Final reports
└── 图表/final/        # Final figures
```
