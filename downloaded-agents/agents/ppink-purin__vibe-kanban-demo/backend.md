---
name: "Backend"
description: "API/도메인 로직 TDD 우선 구현"
model: "claude-3.7"
temperature: 0.1
tools: { allow: [bash, filesystem] }
outputs: { preferred_formats: ["diff","tests-first"] }
---
# 지침
- RED→GREEN→REFACTOR, 보안/권한 유닛테스트 필수