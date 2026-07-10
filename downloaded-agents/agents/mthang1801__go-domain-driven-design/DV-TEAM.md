# Data Visualizer — 10 Agents Built

Specialized developer roles for the Data Visualizer project. Each agent bundles relevant skills automatically.

> **Security by Default**: `security-review` skill is bundled with ALL developer-facing agents.

---

## Agent Team Overview

| Agent                     | Role                                                             | Skills Bundled | File                        |
| ------------------------- | ---------------------------------------------------------------- | -------------- | --------------------------- |
| **`DV-ORCHESTRATOR`**     | **Điều phối agents — phân tích task → trả YAML plan**            | —              | `DV-ORCHESTRATOR.md`        |
| `dv-product-analyst`      | Requirements analysis, user stories, scope, edge cases           | 2 skills       | `dv-product-analyst.md`     |
| `dv-architect`            | Architecture decisions, ADR, trade-offs, interface contracts     | 4 skills       | `dv-architect.md`           |
| `dv-data-analyst`         | Data flow analysis, KPIs, analytics schema, reporting            | 3 skills       | `dv-data-analyst.md`        |
| `dv-backend-developer`    | NestJS DDD backend — entities, use-cases, repositories, APIs     | 11 skills      | `dv-backend-developer.md`   |
| `dv-code-reviewer`        | Comprehensive code review with all patterns                      | ALL skills     | `dv-code-reviewer.md`       |
| `dv-refactor-specialist`  | Safe refactoring with patterns                                   | 2 skills       | `dv-refactor-specialist.md` |
| `dv-debugger`             | Bug fixing, log analysis, error tracing                          | 4 skills       | `dv-debugger.md`            |
| `dv-frontend-developer`   | React/Next.js UI — Metabase design system                        | 3 skills       | `dv-frontend-developer.md`  |
| `dv-test-writer`          | TDD — unit, integration, E2E tests                               | 4 skills       | `dv-test-writer.md`         |
| `dv-db-optimizer`         | Query optimization, indexes, schema design                       | 5 skills       | `dv-db-optimizer.md`        |
| **`dv-ui-ux-architect`**  | Design system, component specs, UX flows, accessibility audit    | 4 skills       | `dv-ui-ux-architect.md`     |
| **`dv-devops-engineer`**  | Docker, GitHub Actions, GitLab CI, ArgoCD, Helm, K8s, Istio, IaC | 2 skills       | `dv-devops-engineer.md`     |
| **`dv-technical-writer`** | API docs, CHANGELOG, module docs, onboarding guides              | 2 skills       | `dv-technical-writer.md`    |

---

## Agent Cards

### dv-product-analyst ⭐ NEW

> Phân tích requirements, viết AC, scope, edge cases — **chạy TRƯỚC khi implement**

**Triggers:** Feature request mới, user feedback, scope clarify, "Tính năng X nên làm không?"
**Skills:** `coding-standards` · `jira`

---

### dv-architect ⭐ NEW

> Architecture decisions, ADR, trade-offs, interface contracts — cho feature medium/large

**Triggers:** "Nên dùng X hay Y?", pattern mới, feature lớn, cross-cutting concerns
**Skills:** `backend-patterns-skill` · `microservices` · `saga` · `idempotency-key`

---

### dv-data-analyst ⭐ NEW

> Analytics schema, KPIs, event tracking, reporting queries

**Triggers:** "Feature X dùng nhiều không?", analytics schema, slow query analysis, data retention
**Skills:** `supabase-postgres-best-practices` · `database` · `stream-pipeline`

---

### dv-backend-developer

> NestJS DDD backend hoàn chỉnh — APIs, entities, use-cases, repositories, mappers

**Triggers:** REST API endpoints, Domain entity, Use-case (Command/Query), NestJS Module
**Skills:** `use-case-layer` · `backend-patterns-skill` · `error-handling` · `security-review` · `redis` · `idempotency-key` · `coding-standards` · `database` · `microservices` · `saga` · `tracing`

---

### dv-code-reviewer

> Comprehensive code review with ALL patterns

**Triggers:** After implementation, before PR, "review code"
**Skills:** ALL skills bundled

---

### dv-refactor-specialist

> Safe refactoring with patterns

**Triggers:** Code smells, pattern migration, dead code cleanup
**Skills:** `coding-standards` · `backend-patterns-skill`

---

### dv-debugger

> Bug fixing, log analysis, error tracing

**Triggers:** DI errors, TypeScript errors, runtime exceptions, server won't start
**Skills:** `error-handling` · `backend-patterns-skill` · `coding-standards` · `nestjs-config`

---

### dv-frontend-developer

> Views, Metabase design system, UI components

**Triggers:** React component, Next.js page, UI feature, design system, API integration
**Skills:** `vercel-react-best-practices` · `ui-ux-pro-max` · `web-design-guidelines`

---

### dv-test-writer

> Unit tests with mocks, integration tests, E2E tests

**Triggers:** New feature (TDD), bug fix (failing test first), coverage improvement
**Skills:** `tdd-workflow` · `coding-standards` · `backend-patterns-skill` · `error-handling`

---

### dv-db-optimizer

> Query optimization, indexes, schema design, Supabase best practices

**Triggers:** Slow queries, N+1 problems, new schema, index review
**Skills:** `supabase-postgres-best-practices` · `database` · `backend-patterns-skill` · `stream-pipeline` · `security-review`

---

### dv-ui-ux-architect 🎨 NEW

> Design system tokens, component specs, UX flows, accessibility audit — **chạy trước dv-frontend-developer khi feature có UI**

**Triggers:** Component design, UX flow, Design tokens, Accessibility audit, "Thiết kế UI", Design spec
**Skills:** `ui-ux-pro-max` · `web-design-guidelines` · `frontend-design` · `design-md`

---

### dv-devops-engineer 🚀 NEW

> Infrastructure automation: Docker, GitHub Actions, GitLab CI, ArgoCD, Helm, K8s, Istio, Cloud IaC

**Triggers:** CI/CD setup, Docker config, Deploy, K8s, Helm, ArgoCD, Istio, GitLab CI, GitHub Actions, Infrastructure
**Skills:** `security-review` · `coding-standards`

---

### dv-technical-writer 📚 NEW

> Documentation specialist: API docs, CHANGELOG, module docs, onboarding guides, README

**Triggers:** "Viết docs", CHANGELOG update, API documentation, Onboarding guide, Module docs, README
**Skills:** `coding-standards` · `jira`

---

## Agent Trigger Matrix

When to use which agent based on the task:

| Task                         | Primary Agent                                                                              | Secondary Agent           |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------------- |
| New feature request          | `dv-product-analyst`                                                                       | `dv-architect` (if large) |
| Architecture decision        | `dv-architect`                                                                             | —                         |
| Analytics / KPI / metrics    | `dv-data-analyst`                                                                          | `dv-db-optimizer`         |
| Create domain entity         | `dv-backend-developer`                                                                     | —                         |
| Create use-case              | `dv-backend-developer`                                                                     | `dv-test-writer`          |
| Add API endpoint             | `dv-backend-developer`                                                                     | —                         |
| Full feature backend         | `dv-backend-developer`                                                                     | —                         |
| Full feature frontend        | `dv-frontend-developer`                                                                    | —                         |
| Build UI component           | `dv-frontend-developer`                                                                    | —                         |
| Server won't start           | `dv-debugger`                                                                              | —                         |
| TypeScript errors            | `dv-debugger`                                                                              | —                         |
| Slow query report            | `dv-db-optimizer`                                                                          | `dv-data-analyst`         |
| Before PR submission         | `dv-code-reviewer`                                                                         | —                         |
| Code smells found            | `dv-refactor-specialist`                                                                   | `dv-test-writer`          |
| NL-to-SQL feature            | `dv-backend-developer`                                                                     | —                         |
| Write tests for X            | `dv-test-writer`                                                                           | —                         |
| Schema design                | `dv-db-optimizer`                                                                          | `dv-backend-developer`    |
| Fix bug                      | `dv-debugger` → `dv-test-writer`                                                           | —                         |
| Feature mới có UI component  | `dv-ui-ux-architect` (step 1.5, design spec first)                                         | `dv-frontend-developer`   |
| Review UI implementation     | `dv-ui-ux-architect` (design fidelity) + `dv-code-reviewer` (code quality) — both required | —                         |
| CI/CD pipeline setup/update  | `dv-devops-engineer`                                                                       | —                         |
| Deploy to cloud              | `dv-devops-engineer`                                                                       | —                         |
| K8s / Helm / ArgoCD / Istio  | `dv-devops-engineer`                                                                       | —                         |
| Feature shipped, docs needed | `dv-technical-writer`                                                                      | —                         |
| CHANGELOG update             | `dv-technical-writer`                                                                      | —                         |
| API docs incomplete          | `dv-technical-writer`                                                                      | —                         |

## SDLC Flow

```
0. Product Analysis (cho feature mới)
   └─> dv-product-analyst
       → Output: Feature spec với AC, edge cases, dependencies

1. Architecture Review (cho feature medium/large)
   └─> dv-architect
       → Output: ADR + interface contracts

1.5 UI/UX Design (khi feature có UI component)
   └─> dv-ui-ux-architect
       → Output: design spec in docs/features/<feature>-design-spec.md
       → Handoff to dv-frontend-developer via References column in progress.md

2. Orchestrate (LUÔN CHẠY)
   └─> DV-ORCHESTRATOR
       → Input: feature spec từ dv-product-analyst (hoặc user input)
       → Output: YAML execution plan

3. Write Tests First (TDD)
   └─> dv-test-writer (RED: write failing tests)

4. Implement Backend
   └─> dv-backend-developer (presentation + application + domain + infrastructure)

5. Implement Frontend
   └─> dv-frontend-developer (React components + API integration)

6. Optimize (if needed)
   └─> dv-db-optimizer (queries, indexes)

7. Review
   └─> dv-code-reviewer (ALL patterns check)

8. If Issues Found
   ├─> dv-debugger (bugs, errors)
   └─> dv-refactor-specialist (code quality)

9. AI Features
   └─> dv-backend-developer (LLM integration, streaming)

10. Data Analysis (sau khi feature live)
    └─> dv-data-analyst
        → Define metrics, build tracking

11. Infrastructure / Deploy
    └─> dv-devops-engineer (CI/CD, Docker, K8s, ArgoCD)

12. Documentation
    └─> dv-technical-writer (API docs, CHANGELOG, module docs)
```

## Quy tắc tương tác với Backlog (docs/plan/progress.md)

**TẤT CẢ CÁC AGENT** đều phải tuân thủ 2 điều khoản sau khi làm việc với `progress.md`:

1. **Khi ghi nhận Task hoặc Log Bug:** Cột `References` đã được bổ sung nhằm lưu trữ thông tin. Nếu có tài liệu thiết kế (Implementation plan, Scopes) hoặc hình ảnh/tài liệu evidence nào liên quan, **BẮT BUỘC** chèn link tham chiếu (Markdown link) vào cột này để lưu vết cho hệ thống.
2. **Khi cập nhật Trạng thái (Status):** Tuyệt đối không ghi chú thích dài dòng, block/depends_on hay ngày hoàn thành vào cột `Status`. **BẮT BUỘC** chuyển mọi thông tin phụ chú này sang cột `Note`. Cột `Status` chỉ giữ nguyên trạng thái cốt lõi (vd: **Done**, Open, In Progress).
3. **Khi nhận Task thực thi:** Trước khi tiến hành viết code hay sửa lỗi, Agent chịu trách nhiệm xử lý (vd: `dv-backend-developer`, `dv-frontend-developer`) **BẮT BUỘC** phải kiểm tra cột `References` của task đó. Nếu có file docs/ảnh đính kèm, phải dùng tool `view_file` hoặc tương đương ĐỌC TÀI LIỆU ĐÓ TRƯỚC KHI BẮT ĐẦU. Tuyệt đối không tự suy diễn nếu đã có sẵn thiết kế!

## How to Invoke

### Orchestrator-first (Khuyến khích)

Khi nhận task từ user, AI agent NÊN tham chiếu DV-ORCHESTRATOR để xác định agent nào cần gọi:

```bash
# Bước 1: Đọc DV-ORCHESTRATOR.md, áp dụng quy tắc chọn agent
# Bước 2: Nhận YAML plan
# Bước 3: Thực thi tuần tự từng agent trong plan
#   - Đọc file agent .md tương ứng
#   - Thực hiện task được giao
#   - Nếu next_if_ok → chuyển sang agent tiếp
#   - Nếu lỗi → dừng, báo user
```

### Gọi trực tiếp (khi biết rõ agent cần dùng)

#### Claude Code

```bash
Task: Use dv-product-analyst to analyze requirements for the Export feature
Task: Use dv-architect to evaluate approach for multi-tenant storage
Task: Use dv-backend-developer to create TableMetadata entity
Task: Use dv-code-reviewer to review recent changes
```

#### Cursor IDE

```
@.claude/agents/dv-product-analyst.md
Analyze requirements for adding SQL snippet sharing feature

@.claude/agents/dv-architect.md
Should we use S3 or Supabase Storage for file management?

@.claude/agents/dv-backend-developer.md
Create the SqlSnippet domain entity with title, query, and projectId properties
```

## Security by Default Policy

All developer-facing agents (`dv-backend-developer`, `dv-frontend-developer`) bundle `security-review` skill.

Before outputting any code, these agents MUST verify:

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevention (parameterized queries)
- [ ] Auth guard on protected endpoints
- [ ] Error messages don't expose internals

### Bắt buộc hỏi (STOP & ASK)

| Tình huống                                       | Không được tự assume                      |
| ------------------------------------------------ | ----------------------------------------- |
| Requirement mâu thuẫn hoặc thiếu thông tin       | Hỏi source of truth                       |
| Có ≥2 cách fix/implement với trade-off khác nhau | Trình bày options, đề xuất 1, chờ confirm |
| Fix bug ảnh hưởng behavior của feature khác      | Confirm impact trước khi proceed          |
| Task scope không rõ ràng                         | Hỏi boundary của task                     |
| Breaking change / thay đổi public API            | Bắt buộc confirm trước                    |
| Root cause bug chưa xác định                     | Hỏi thêm context/log, không đoán mò       |
| Code target không có test cover                  | Hỏi: viết test trước hay fix trước        |
| Quyết định kiến trúc có impact lớn               | dv-architect confirm, rồi mới delegate    |

### Không cần hỏi (TỰ QUYẾT)

- Lỗi format/lint rõ ràng (Prettier, ESLint)
- Missing `export`, TypeScript error không ảnh hưởng behavior
- Implement theo pattern đã document trong `architecture.md` hoặc `MEMORY.md`

### Format hỏi chuẩn

```
❓ [TÊN AGENT] cần làm rõ trước khi tiếp tục:

**Vấn đề**: [Mô tả ngắn]
**Lý do cần hỏi**: [Impact nếu assume sai]
**Các lựa chọn**:
  A) [Option A + trade-off]
  B) [Option B + trade-off]
**Đề xuất của tôi**: [Option X] vì [lý do]
```

### Khi bị block hoàn toàn

```
🚫 [TÊN AGENT] bị block — cần thông tin bắt buộc:

**Không thể tiếp tục vì**: [Lý do]
**Cần bạn cung cấp**: [Danh sách cụ thể]
**Trong khi chờ, tôi có thể làm**: [Phần không bị block]
```

> Chi tiết đầy đủ, ví
