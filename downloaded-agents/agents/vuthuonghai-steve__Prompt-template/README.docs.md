File cấu hình cho sub-agent trong Claude Code sử dụng định dạng Markdown với YAML frontmatter[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents). Cấu trúc cơ bản bao gồm hai phần chính:

## Cấu trúc file

File sub-agent có phần YAML frontmatter (giữa các dấu `---`) để cấu hình metadata, theo sau là nội dung Markdown làm system prompt[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents):

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)

## Các trường trong frontmatter

Chỉ có `name` và `description` là bắt buộc[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents). Các trường được hỗ trợ:

- **name**: Định danh duy nhất sử dụng chữ thường và dấu gạch ngang[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **description**: Mô tả khi nào Claude nên ủy quyền cho sub-agent này[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **tools**: Các công cụ mà sub-agent có thể sử dụng. Kế thừa tất cả công cụ nếu bỏ qua[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **disallowedTools**: Các công cụ bị từ chối, loại bỏ khỏi danh sách kế thừa hoặc được chỉ định[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **model**: Model sử dụng: `sonnet`, `opus`, `haiku`, hoặc `inherit`. Mặc định là `inherit`[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **permissionMode**: Chế độ quyền: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, hoặc `plan`[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **maxTurns**: Số lượt agentic tối đa trước khi sub-agent dừng[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **skills**: Các kỹ năng được tải vào ngữ cảnh của sub-agent khi khởi động[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **mcpServers**: Các MCP server có sẵn cho sub-agent này[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **hooks**: Lifecycle hooks trong phạm vi sub-agent này[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **memory**: Phạm vi bộ nhớ liên tục: `user`, `project`, hoặc `local`[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **background**: Đặt thành `true` để luôn chạy sub-agent này như tác vụ nền. Mặc định: `false`[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)
- **isolation**: Đặt thành `worktree` để chạy sub-agent trong git worktree tạm thời[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents)

Phần nội dung Markdown trở thành system prompt hướng dẫn hành vi của sub-agent[(1)](https://code.claude.com/docs/en/sub-agents#configure-subagents).
