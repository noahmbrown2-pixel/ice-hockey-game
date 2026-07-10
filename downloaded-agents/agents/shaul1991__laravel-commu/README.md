# Team Agents

팀별 자동화 에이전트 정의. 각 에이전트는 특정 도메인의 작업을 자율적으로 수행한다.

## 구조

```
.claude/
├── agents/           # 에이전트 정의 (자율 실행)
├── skills/           # 역할 정의 (컨텍스트)
└── commands/         # 슬래시 명령어 (사용자 호출)
```

## Development Principles

### Backend TDD (필수)
모든 백엔드 개발은 TDD 방식으로 진행한다:
```
Red → Green → Refactor
1. PM/QA 요구사항을 테스트로 작성 (실패)
2. 테스트를 통과시키는 코드 작성
3. 코드 리팩토링 (테스트 유지)
```

### Documentation Management (필수)
모든 백엔드 작업은 문서화와 함께 진행한다:
```
1. [Git] 작업 전 feature 브랜치 생성
2. [Commit] Jira 티켓당 1 commit
3. [Jira] 완료 시 작업 내용 코멘트 기록
4. [Confluence] 상세 기술 문서 작성
```

## 에이전트 목록

| Agent | File | 역할 | MCP Tools |
|-------|------|------|-----------|
| PM | `pm.md` | 프로젝트 관리, Jira/Confluence | Jira, Confluence, Slack |
| Design | `design.md` | UX/UI 디자인, 스펙 문서화 | Jira, Confluence, Slack |
| Frontend | `frontend.md` | Blade/Tailwind 개발 | Jira, Confluence, Playwright |
| Backend | `backend.md` | Laravel API, DB 개발 **(TDD 필수)** | Jira, Confluence, Sentry |
| DevOps | `devops.md` | 인프라, CI/CD, 모니터링 | Jira, Confluence, Sentry |
| QA | `qa.md` | 테스트, 품질 보증 | Jira, Confluence, Playwright, Sentry |
| Docs | `docs.md` | 기술 문서, 다이어그램 | Confluence, Jira |

## 사용법

### Task Tool로 호출
```
Task(subagent_type="general-purpose", prompt="PM Agent로서 새 기능 Epic을 생성하라. Context: .claude/agents/pm.md")
```

### 워크플로우 예시
```
1. [Git] feature 브랜치 생성
2. PM Agent: Epic 생성, 요구사항 문서화
3. Design Agent: 디자인 스펙 작성
4. Frontend Agent: UI 개발
5. Backend Agent (TDD):
   - 테스트 먼저 작성 (Red)
   - 코드 구현 (Green)
   - 리팩토링 (Refactor)
   - 티켓별 커밋 + Jira 코멘트
6. DevOps Agent: 인프라/배포
7. QA Agent: 테스트 수행
8. Docs Agent: 문서 업데이트
9. [Git] PR/Merge
```

## 에이전트 vs 스킬 vs 명령어

| 구분 | 목적 | 실행 방식 |
|------|------|-----------|
| Agent | 자율 작업 수행 | Task tool + context |
| Skill | 역할/도메인 지식 | 컨텍스트 로드 |
| Command | 사용자 직접 호출 | /namespace:name |

## 협업 흐름

```
PM ─────→ Design ─────→ Frontend
  │                        ↑
  └───→ Backend ───────────┘
           │
           ↓
        DevOps ←──── QA
           │
           ↓
         Docs
```

## 공통 MCP Tools

### Jira (작업 관리)
- `jira_create_issue`: 이슈 생성
- `jira_update_issue`: 이슈 업데이트
- `jira_transition_issue`: 상태 전환
- `jira_search`: 이슈 검색

### Confluence (문서)
- `confluence_create_page`: 페이지 생성
- `confluence_update_page`: 페이지 업데이트
- `confluence_search`: 문서 검색

### Sentry (모니터링)
- `search_issues`: 에러 검색
- `get_issue_details`: 에러 상세
- `analyze_issue_with_seer`: AI 분석

### Playwright (테스트)
- `browser_navigate`: 페이지 이동
- `browser_snapshot`: 스냅샷
- `browser_click`: 클릭 테스트
