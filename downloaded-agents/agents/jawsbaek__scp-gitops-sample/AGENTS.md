<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 -->

# .claude/agents/ — 커스텀 에이전트

## Purpose

SCP GitOps 프로젝트의 특화된 작업을 수행하는 Claude Code 에이전트입니다.
영향범위 분석, SCP 보안 정책 검토 등 프로젝트 고유의 리뷰를 자동화합니다.

## Key Files

| 파일 | 이름 | 역할 |
|------|------|------|
| `impact-reviewer.md` | Impact Reviewer | 파일 변경 영향범위 분석 |
| `scp-reviewer.md` | SCP Reviewer | SCP 보안 정책 검토 |

## impact-reviewer.md — 영향범위 분석 에이전트

### 역할

파일 변경 시 영향받는 상위 리소스와 검증 항목을 자동으로 파악합니다.

### 사용 방법

```bash
# CLI
/project:review-impact

# 또는 파일 변경 후 자동 트리거
# (pre-commit hook 또는 PR 자동 분석)
```

### 분석 로직

```
1. 변경 파일 목록 수집
   git diff --name-only origin/main

2. dependency-map.json에서 의존성 조회
   jq '.["파일명"].referenced_by' .claude/dependency-map.json

3. 상위 모듈/환경 식별
   예: modules/vpc/main.tf → 
       environments/{dev,staging,prod}/main.tf

4. 각 환경별 영향 분석
   - 변경된 변수 확인
   - 호출 부분 라인 번호 추출

5. 권장 검증 항목 제시
   - 각 환경 tofu plan 실행
   - 테스트 시나리오
```

### 출력 형식

```
파일 변경 영향범위 분석
=======================

변경 파일:
- modules/security/main.tf (security group 규칙)

영향받는 리소스:
1. environments/dev/main.tf (line 34-40)
   - security 모듈 호출
   - 변수: ingress_cidr_blocks, egress_rules

2. environments/staging/main.tf (line 28-35)
   - security 모듈 호출

3. environments/prod/main.tf (line 41-48)
   - security 모듈 호출
   - 변수: ingress_cidr_blocks, egress_rules

권장 검증:
- [ ] dev 환경 검증
  tofu plan -var-file=dev.tfvars | grep security_group
  
- [ ] staging 환경 검증
  tofu plan -var-file=staging.tfvars | grep security_group
  
- [ ] 정책 검증
  conftest test plan.json
```

### 관련 파일

- `.claude/dependency-map.json` — 파일 의존성 맵
- `Makefile` — 검증 명령어
- `scripts/find-impact.sh` — 의존성 분석 스크립트

## scp-reviewer.md — SCP 보안 정책 검토 에이전트

### 역할

SCP 보안 정책(CLAUDE.md)을 기반으로 코드 변경의 정책 준수 여부를 검토합니다.

### 사용 방법

```bash
# CLI
/project:security-check

# 또는 PR 자동 분석
```

### 검사 항목

| 항목 | 정책 | 확인 방법 |
|------|------|---------|
| **자격증명** | 환경변수만 사용 | grep -r 'TF_VAR_\|AWS_ACCESS\|SCP_TF' |
| **리전** | kr-west1, kr-east1만 | grep -r 'region\|availability_zone' |
| **이미지 레지스트리** | harbor.scp.internal만 | grep -r 'image:' |
| **이미지 태그** | latest 금지 | grep -r ':latest' |
| **Pod 보안** | SecurityContext 필수 | grep -r 'runAsNonRoot\|readOnlyRootFilesystem' |
| **DB 서버 타입** | db1v*, dbh2v* 형식 | grep -r 'instance_type.*db' |
| **상태 파일** | encrypt=true | grep 'encrypt' backend.tf |

### 검사 로직

```bash
# 1. 파일 타입별 분류
if [[ $file == *.tf ]]; then
  check_terraform_policies
elif [[ $file == *.yaml ]] || [[ $file == *.yml ]]; then
  check_kubernetes_policies
fi

# 2. 정책 검증
check_credentials_hardcoded
check_allowed_regions
check_image_registries
check_image_tags
check_pod_security_context
check_db_instance_types
check_encryption_settings

# 3. 결과 집계
report_violations
report_warnings
report_passed_checks
```

### 출력 형식

```
SCP 보안 정책 검토
================

✅ PASS — 자격증명 정책
  모든 파일에서 환경변수 사용 확인

❌ FAIL — 리전 정책
  파일: environments/prod/main.tf (line 15)
  문제: region = "us-east-1" (금지됨)
  수정: region = "kr-west1" 또는 "kr-east1"

⚠️ WARN — 이미지 태그 정책
  파일: cluster-services/argocd/kustomization.yaml
  문제: image: harbor.scp.internal/argocd:latest
  권장: 명시적 버전 사용 (예: v2.10.3)

✅ PASS — Pod 보안 컨텍스트
  모든 Pod에 runAsNonRoot: true 확인

체크리스트:
- [ ] FAIL 항목 모두 수정
- [ ] WARN 항목 검토 및 조치
- [ ] 변경 후 재검증
```

### 관련 파일

- `../CLAUDE.md` — SCP 보안 정책
- `../commands/security-check.md` — 보안 검증 명령어
- `../../policies/` — OPA, Kyverno, Conftest 정책

## For AI Agents

### 에이전트 구현 패턴

**1. 에이전트 메타데이터**

```markdown
<!-- .claude/agents/my-agent.md -->

> 에이전트명: My Agent
> 버전: 1.0.0
> 마지막 업데이트: 2026-04-02

## Role
이 에이전트의 역할을 간단히 설명

## When to Use
어떤 상황에서 호출할 것인가

## Instructions
상세 지시사항 (단계별)
```

**2. 파일 분석 패턴**

```bash
# 변경 파일 목록
git diff --name-only origin/main

# 파일 내용 읽기
cat "$file"

# 정책 기준 파일 참조
cat .claude/CLAUDE.md
cat policies/*/AGENTS.md
```

**3. 결과 생성 패턴**

```markdown
# 제목

## 결과 요약
[체크마크 + 상태]

## 상세 분석
파일별 검사 결과

## 권장 조치
다음 단계
```

## 에이전트 테스트

**impact-reviewer 테스트:**

```bash
# 테스트 파일 변경
echo '# test' >> modules/vpc/main.tf

# 에이전트 실행
/project:review-impact

# 예상 결과: 
# - environments/{dev,staging,prod} 영향 표시
# - tofu plan 실행 권장
```

**scp-reviewer 테스트:**

```bash
# 정책 위반 파일 추가
cat > test-violation.tf <<'EOF'
region = "us-east-1"  # 금지된 리전
EOF

# 에이전트 실행
/project:security-check

# 예상 결과:
# - FAIL: 리전 정책 위반 표시
# - 수정 방법 제시
```

## 에이전트 업데이트 체크리스트

- [ ] 새로운 정책 추가 시 scp-reviewer.md 업데이트
- [ ] 파일 구조 변경 시 dependency-map.json 재생성
- [ ] 새로운 검사 항목은 CLAUDE.md와 동기화
- [ ] 로컬 테스트 실행
- [ ] 문서 예제 업데이트

## 참고 자료

- `../AGENTS.md` — .claude/ 디렉토리 개요
- `../commands/AGENTS.md` — 명령어 가이드
- `../../AGENTS.md` — 루트 컨텍스트
- `../../CLAUDE.md` — 보안 정책
