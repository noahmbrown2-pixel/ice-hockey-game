# .claude/agents — Claude Code 서브에이전트 정의

> Claude Code의 `/agents` 명령으로 노출되는 서브에이전트 목록.
> 마음챙김 포춘텔러 5일 MVP 구현 파이프라인 자동화.

---

## 사용법

```bash
# Claude Code 진입 후
/agents

# 또는 직접 트리거
"orchestrator 에이전트로 전체 파이프라인 실행해줘"
```

`orchestrator`만 한 번 실행하면 phase-0 → phase-1 → phase-2(병렬 9) → phase-2.5 → phase-3a → phase-3b(병렬 7) → phase-4까지 자동 연쇄.

---

## 에이전트 목록

### 오케스트레이션
- **orchestrator** — 전체 파이프라인 제어. Task tool로 다른 에이전트 호출.
- **reviewer** — 모든 Phase 검수. 권한 분리(Read/Grep/Bash만, Write 불가).

### 단일 Phase (직렬)
- **phase-00-spec-prep** — 시나리오 ID 부여 + 정합성 점검
- **phase-01-infra** — shared types/schemas + DB + 미들웨어 + Pinia 골격
- **phase-02.5-integration** — main.ts 통합 + 시나리오 23개 통합 테스트
- **phase-03a-frontend-common** — 공통 컴포넌트·composable
- **phase-04-e2e** — 시나리오 23개 E2E + 수동 점검

### 병렬 Phase 템플릿 (orchestrator가 인스턴스 데이터 주입)
- **phase-02-domain** — 백엔드 도메인 1개 책임 (B1~B9 중 하나)
- **phase-03b-page-group** — 페이지 그룹 1개 책임 (F1~F7 중 하나)

---

## 인스턴스 데이터 출처

병렬 Phase는 orchestrator가 다음 매트릭스를 읽어 한 행씩 주입:
- `prompts/phase-02-domain-matrix.md` (B1~B9, 9개 인스턴스)
- `prompts/phase-03b-group-matrix.md` (F1~F7, 7개 인스턴스)

---

## 파이프라인 흐름

```
orchestrator
   ├── phase-00-spec-prep        → reviewer (Phase 0 컨텍스트)
   ├── phase-01-infra            → reviewer (Phase 1)
   ├── phase-02-domain × 9       → reviewer × 9 (도메인별)  ← 병렬
   ├── phase-02.5-integration    → reviewer
   ├── phase-03a-frontend-common → reviewer
   ├── phase-03b-page-group × 7  → reviewer × 7 (그룹별)    ← 병렬
   └── phase-04-e2e              → reviewer
```

각 단계에서 reviewer 반려 시 원 구현 에이전트 재호출 (자가 개선 루틴 명시).

---

## 자가 개선 루틴

모든 구현 에이전트는 `.claude/rules/self-improvement.md`를 따른다:
1. 단순 재시도 3회
2. 자가 개선 루틴 4단계 (레퍼런스 → 명세 → 영향 → 외부 도움)
3. 명세/레퍼런스 변경은 Additive Versioning + 사용자 컨펌

orchestrator는 변경 제안서를 큐에 적재하고 사용자 부재 시 다른 작업으로 진행 (TASKS.md §14).
