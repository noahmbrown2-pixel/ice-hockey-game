# Custom Agents

Thư mục này chứa các custom agents cho Claude Code.

## Cấu trúc Agent

Mỗi agent là một file `.md` với format:

```yaml
---
name: agent-name
description: Mô tả ngắn về agent
---

# Agent Instructions

[Chi tiết hướng dẫn cho agent]
```

## Agents có sẵn từ BMAD

Các agent BMAD nằm trong `_bmad/bmm/agents/`:
- `analyst.md` - Business Analyst
- `architect.md` - Solution Architect
- `dev.md` - Developer
- `pm.md` - Product Manager
- `sm.md` - Scrum Master
- `ux-designer.md` - UX Designer
- `tech-writer.md` - Technical Writer
- `quinn.md` - Quality Engineer

## Cách sử dụng

Gọi agent qua commands:
- `/bmad-agent-ba` - Load BA agent
- `/bmad-agent-arch` - Load Architect agent
- `/bmad-agent-dev` - Load Dev agent
