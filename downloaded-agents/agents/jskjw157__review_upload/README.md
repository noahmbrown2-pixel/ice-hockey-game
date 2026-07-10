# Development Skills for Cafe24 Review Manager

이 디렉토리에는 Cafe24 Review Manager 개발을 위한 자동화된 작업 에이전트(Skills)가 포함되어 있습니다.

## 사용 방법

Claude Code CLI에서 다음과 같이 skill을 실행할 수 있습니다:

```bash
# Skill 실행
/<skill-name>

# 예시
/add-ipc-channel
/check-auth
```

## 사용 가능한 Agents

### 🌟 0. create-agent (Meta-Agent)

**목적:** 새로운 커스텀 에이전트를 자동으로 설계하고 생성하는 메타 에이전트

**사용 시기:**
- 반복적인 작업 패턴을 발견했을 때
- 프로젝트 특화 자동화가 필요할 때
- 기존 에이전트로 커버되지 않는 워크플로우가 있을 때
- 복잡한 멀티 스텝 작업을 자동화하고 싶을 때

**자동화되는 작업:**
1. 사용자 요구사항 대화형 수집
2. 프로젝트 문서 분석 (CLAUDE.md, tasks.md, .cursor/rules)
3. 기존 에이전트 패턴 학습
4. 적절한 모델 선택 (haiku/sonnet/opus)
5. 구조화된 시스템 프롬프트 작성
6. `.claude/agents/` 에 JSON 파일 생성
7. README.md 문서 자동 업데이트

**예시:**
```bash
/create-agent
# 대화형 질문:
# - 이 에이전트가 자동화할 작업은?
# - 어떤 문제를 해결하나요?
# - 파일 읽기/쓰기가 필요한가요?
# - 사용자와 상호작용해야 하나요?
# - 어떤 출력을 제공해야 하나요?
```

**결과:**
- Claude Code 공식 문서 패턴을 따르는 완전한 에이전트
- 프로젝트별 규칙이 적용된 맞춤형 시스템 프롬프트
- 즉시 사용 가능한 JSON 파일
- 업데이트된 README 문서

**특별 기능:**
- ✨ Claude Code 공식 가이드 학습
- 🎯 프로젝트 특화 패턴 자동 적용
- 🔍 기존 에이전트 분석을 통한 일관성 유지
- 📚 자동 문서화
- 🧪 테스트 가이드 제공
- 🤖 모든 에이전트가 자동으로 당신의 모델 설정 상속 (`model: inherit`)

**Meta-Agent의 의사결정 프로세스:**
1. **요구사항 수집** → 사용자와 대화하여 정확한 니즈 파악
2. **컨텍스트 분석** → CLAUDE.md, tasks.md 읽어서 프로젝트 이해
3. **패턴 매칭** → 기존 에이전트와 유사한 패턴 찾기
4. **모델 선택** → 작업 복잡도에 따라 haiku/sonnet/opus 추천
5. **프롬프트 설계** → 다단계, 구조화된 시스템 프롬프트 작성
6. **검증** → JSON 문법 체크 및 테스트 권장사항 제공

---

### 0.5. scaffold-task

**목적:** tasks.md의 Task를 분석하여 구현에 필요한 파일 구조와 함수 스켈레톤을 자동 생성

**사용 시기:**
- 새로운 Phase/Task 구현을 시작할 때
- 파일 구조와 함수 정의가 필요할 때
- "뭘 해야 할지 모를 때" 실마리를 잡고 싶을 때
- 현재 진행 상황에 맞는 다음 작업을 추천받고 싶을 때

**자동화되는 작업:**
1. tasks.md 분석 → 현재 Phase/진행 상황 파악
2. 구현할 Task 선택 (Task 번호, 설명, 또는 "다음 작업")
3. 필요한 파일 목록 생성
4. 각 파일의 함수 스켈레톤 + JSDoc 생성 (중간 수준의 상세 주석)
5. 구현 순서 및 가이드 제공
6. 관련 패턴 및 참고 코드 제시

**예시:**
```bash
/scaffold-task
# 대화형 질문:
# - 어떤 task를 구현하시겠어요? (Task 번호, 설명, 또는 "다음 task")
# → 자동으로 필요한 파일과 함수 스켈레톤 생성
# → 구현 순서와 가이드 제공
```

**결과:**
- 모든 필요한 파일 목록과 디렉토리 구조
- 각 파일의 함수 시그니처 + 상세한 JSDoc
- 구현 단계별 체크리스트
- "먼저 뭘 하면 되는지" 명확한 가이드
- 기존 패턴과 참고 코드 제시

**특징:**
- 📊 현재 진행 상황을 반영한 실마리 제공
- 📝 중간 수준의 상세한 주석 (이해하기 쉽지만 지나치게 복잡하지 않음)
- 🔗 기존 코드 패턴과 CLAUDE.md 규칙 참고
- 📋 구현 체크리스트로 놓친 부분 방지
- 🎯 다음 task 자동 추천 기능

---

### 1. add-ipc-channel

**목적:** 새로운 타입 안전 IPC 채널을 프로젝트 패턴에 따라 추가

**사용 시기:**
- Renderer에서 Main 프로세스로 데이터를 전송해야 할 때
- 새로운 API 기능을 노출해야 할 때
- 파일 작업, 네트워크 요청 등 Node.js 기능이 필요할 때

**자동화되는 작업:**
1. `src/types/ipc.ts` - 페이로드 및 응답 타입 정의
2. `src/main/main.ts` - IPC 핸들러 등록
3. `src/main/preload.ts` - contextBridge API 노출
4. `src/types/global.d.ts` - window.reviewApi 타입 업데이트

**예시:**
```bash
/add-ipc-channel
# 그러면 대화형으로 다음을 질문:
# - Channel name (예: 'product:search')
# - Payload 구조
# - Response 구조
# - 호출할 서비스 함수
```

**결과:**
- 4개 파일이 자동으로 업데이트됨
- 타입 안전성이 보장된 IPC 통신 구현
- Renderer에서 바로 사용 가능한 API

---

### 2. add-cafe24-endpoint

**목적:** Cafe24 API 엔드포인트 연동 (OAuth, 에러 처리, 재시도 로직 포함)

**사용 시기:**
- 새로운 Cafe24 API를 사용해야 할 때
- 상품, 주문, 회원 등 관리 API 호출이 필요할 때
- RESTful API 통합이 필요한 경우

**자동화되는 작업:**
1. Service 함수 작성 (`src/main/services/`)
2. OAuth 토큰 검증 및 자동 갱신 로직
3. 401 에러 처리 및 재시도 패턴
4. 표준화된 응답 형식 반환
5. 에러 메시지 한국어 매핑

**예시:**
```bash
/add-cafe24-endpoint
# 대화형 질문:
# - API 엔드포인트 경로 (예: '/admin/products')
# - HTTP 메서드 (GET, POST, PUT, DELETE)
# - Request payload 구조
# - Expected response 구조
```

**결과:**
- 토큰 관리가 자동화된 API 호출 함수
- Rate limiting 고려한 구현
- 네트워크 오류 처리 포함

---

### 3. add-ui-component

**목적:** shadcn/ui 기반 React 컴포넌트를 프로젝트 규칙에 따라 추가

**사용 시기:**
- 새로운 UI 화면이나 위젯이 필요할 때
- 폼, 버튼, 카드 등 인터랙티브 요소를 추가할 때
- 기존 컴포넌트를 리팩토링할 때

**자동화되는 작업:**
1. TypeScript 컴포넌트 파일 생성
2. shadcn/ui 컴포넌트 사용 (Button, Card, Input 등)
3. Tailwind CSS 스타일링
4. 커스텀 hooks 연결 (useAuth, useReview)
5. 로딩/에러 상태 처리

**예시:**
```bash
/add-ui-component
# 대화형 질문:
# - 컴포넌트 이름 (예: 'ProductSearch')
# - Props 인터페이스
# - 상태 관리 요구사항
# - 사용자 인터랙션 (버튼, 폼 등)
```

**결과:**
- 프로젝트 패턴을 따르는 컴포넌트
- Path alias (@/*) 사용
- 반응형 디자인 적용

---

### 4. update-tasks

**목적:** tasks.md 파일을 현재 개발 진행 상황에 맞게 업데이트

**사용 시기:**
- 작업을 완료했을 때
- 새로운 작업을 발견했을 때
- Phase 진행률을 업데이트해야 할 때
- 다음 단계 권장사항을 변경해야 할 때

**자동화되는 작업:**
1. 완료된 작업 체크박스 업데이트 (`[ ]` → `[x]`)
2. 새 작업 추가 (적절한 Phase에)
3. Phase 완료율 재계산
4. "현재 진행 상황" 섹션 업데이트
5. "다음 단계 권장" 수정

**예시:**
```bash
/update-tasks
# 대화형 질문:
# - 완료된 작업은?
# - 진행 중인 작업은?
# - 추가할 새 작업은?
```

**결과:**
- 정확한 프로젝트 진행 상황 추적
- 팀/이해관계자에게 투명한 진행도 제공
- 다음 우선순위 작업 명확화

---

### 5. check-auth

**목적:** OAuth 인증 문제 진단 및 토큰 상태 검증

**사용 시기:**
- 로그인이 작동하지 않을 때
- "인증 만료" 에러가 발생할 때
- API 호출이 401 에러를 반환할 때
- 토큰 갱신이 실패할 때

**자동화되는 진단:**
1. 토큰 파일 존재 여부 및 구조 검증
2. 토큰 만료 시간 확인
3. OAuth 설정 (mallId, clientId 등) 확인
4. 토큰 암호화 상태 검증
5. Auth service 함수 정상 여부
6. IPC 채널 등록 확인

**예시:**
```bash
/check-auth
# 자동으로 모든 체크 수행하고 리포트 제공
```

**결과:**
- 인증 시스템 전체 상태 리포트
- 발견된 문제 목록
- 구체적인 해결 방법 제시
- 필요한 명령어 예시 제공

---

### 6. build-and-test

**목적:** 빌드, 린트, 테스트를 자동으로 실행하고 에러를 진단하여 수정 방법 제안

**사용 시기:**
- 코드 커밋 전 검증이 필요할 때
- 리팩토링 후 전체 빌드 확인이 필요할 때
- CI/CD 실패 시 로컬에서 원인 파악할 때
- 빌드 결과물 크기 확인이 필요할 때

**자동화되는 작업:**
1. 환경 검증 (Node.js 버전, dependencies)
2. TypeScript 빌드 실행 (`npm run build`)
3. 빌드 결과물 검증 (`dist/`, `dist-electron/`)
4. 번들 크기 리포트
5. ESLint 실행 (설정된 경우)
6. 테스트 실행 (설정된 경우)
7. 에러 분석 및 수정 방법 제안

**지원 플래그:**
- `--fix` - 린트 에러 자동 수정
- `--verbose` - 상세 출력 (모든 경고 포함)
- `--skip-build` - 빌드 생략, 린트/테스트만 실행
- `--skip-lint` - 린트 생략
- `--skip-test` - 테스트 생략

**예시:**
```bash
/build-and-test
# 전체 빌드 및 테스트 실행

/build-and-test --fix
# 린트 에러 자동 수정 후 빌드

/build-and-test --verbose --skip-test
# 상세 출력으로 빌드와 린트만 실행
```

**결과:**
- 구조화된 빌드 리포트 (성공/실패, 에러 수, 번들 크기)
- 에러별 파일 위치, 원인, 수정 방법 제시
- CI/CD 파이프라인과 호환되는 출력 형식
- 권장 개선사항 (ESLint/Vitest 설정 등)

**특징:**
- 빠른 실행을 위한 haiku 모델 사용
- Pre-commit hook으로 사용 가능
- 병렬 실행으로 성능 최적화
- 일반적인 TypeScript/Vite 에러 패턴 자동 인식

---

## Agent 개발 가이드

### 새로운 Agent 추가하기

**⭐ 권장 방법: Meta-Agent 사용**

가장 쉬운 방법은 `/create-agent` 메타 에이전트를 사용하는 것입니다:

```bash
/create-agent
```

Meta-Agent가 대화형으로 질문하고, 자동으로 완벽한 에이전트를 생성해줍니다.

---

**🔧 수동으로 만들기 (고급 사용자용)**

1. **Agent 파일 생성** (`.claude/agents/your-agent-name.md`):

```markdown
---
name: your-agent-name
description: Brief description with 'Use when...' trigger
model: sonnet
---

Your detailed system prompt goes here.

## Section 1
Step-by-step instructions...

## Section 2
More details...
```

2. **Prompt 작성 가이드:**
   - 명확한 목표 설명
   - 단계별 작업 리스트
   - 파일 경로 명시
   - 프로젝트 규칙 참조 (CLAUDE.md의 패턴)
   - 사용자에게 질문할 내용 정의
   - 완료 후 제공할 정보 명시
   - 제약사항 및 에러 처리 포함

3. **모델 선택:**
   - **`haiku`**: 진단/검증 작업, 간단한 파일 읽기/쓰기 (빠른 응답, 저비용)
   - **`sonnet`**: 코드 생성, 여러 파일 조율, API 통합 (균형잡힌 능력)
   - **`opus`**: 복잡한 설계/분석, 메타 에이전트 개발 (최고 능력)

4. **README 업데이트:**
   - 이 파일에 새 agent 설명 추가
   - 사용 시기, 예시, 결과 명시

5. **YAML Frontmatter 검증:**
   - `name`, `description`, `model` 필드가 `---` 블록 안에 있는지 확인
   - 모델은 `haiku`, `sonnet`, `opus` 중 하나

6. **테스트:**
   ```bash
   /your-agent-name
   ```

---

## 프로젝트 패턴 참조

모든 Skills는 다음 문서의 규칙을 따릅니다:
- **CLAUDE.md** - 전체 아키텍처, 코드 규칙
- **tasks.md** - 개발 로드맵, 작업 구조
- **.cursor/rules/** - Electron, IPC, Cafe24 API 상세 규칙

---

## 문제 해결

### Agent가 실행되지 않을 때

1. YAML Frontmatter 확인:
   - 파일 시작이 `---`로 시작하는지 확인
   - `name`, `description`, `model` 필드가 있는지 확인
   - 닫는 `---`가 있는지 확인

2. 파일 이름이 올바른지 확인 (`.md` 확장자 필수)

3. Claude Code CLI 버전 확인 (최신 버전 사용)

### Agent가 예상대로 동작하지 않을 때

1. Prompt가 충분히 상세한지 확인
2. 프로젝트 구조 변경 시 Agent 업데이트 필요
3. CLAUDE.md 참조하여 최신 패턴 반영

---

## 기여

새로운 반복 작업 패턴을 발견하면:
1. `/create-agent` 메타 에이전트 사용 (권장)
2. 또는 수동으로 `.md` 파일 생성
3. 이 README에 문서 추가
4. 팀과 공유

---

**마지막 업데이트:** 2025-12-22
**Agents 버전:** 1.1.0 (Markdown 형식으로 마이그레이션)
