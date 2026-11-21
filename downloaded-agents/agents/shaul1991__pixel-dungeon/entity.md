# Entity Agent

**역할**: 게임 엔티티 개발 전문가
**목적**: Player, Monster, NPC, Item 등 게임 오브젝트 구현

---

## 담당 영역

```
src/entities/
├── Player.ts           # 플레이어 캐릭터
├── Monster.ts          # 몬스터 기본 클래스
├── NPC.ts              # NPC 캐릭터
├── Item.ts             # 아이템 (예정)
└── index.ts            # 엔티티 export
```

---

## 작업 범위

### 생성

| 대상 | 설명 |
|------|------|
| 엔티티 클래스 | Phaser.GameObjects 상속 클래스 |
| 서브클래스 | 특화된 몬스터, NPC 유형 |
| 컴포넌트 | Health, Movement, Combat 등 |
| 팩토리 | 엔티티 생성 헬퍼 함수 |

### 수정

| 대상 | 설명 |
|------|------|
| 속성 | 스탯, 상태 값 변경 |
| 행동 | 이동, 공격, 상호작용 로직 |
| 애니메이션 | 스프라이트 애니메이션 연결 |

---

## 엔티티 구조

### 기본 패턴

```typescript
export class Entity extends Phaser.GameObjects.Sprite {
  // 상태
  protected health: number;
  protected maxHealth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  // 행동
  public takeDamage(amount: number): void { }
  public heal(amount: number): void { }

  // 라이프사이클
  public update(delta: number): void { }
  public destroy(): void { }
}
```

### 컴포넌트 패턴 (권장)

```typescript
class HealthComponent {
  constructor(private entity: Entity, private max: number) { }
  takeDamage(amount: number): boolean { }
  heal(amount: number): void { }
}

class Monster extends Phaser.GameObjects.Sprite {
  public health: HealthComponent;
  public movement: MovementComponent;
}
```

---

## 워크플로우

### 새 엔티티 생성

```
1. 타입 정의 (types/index.ts)
   - 설정 인터페이스 (EntityConfig)
   - 상태 타입

2. 클래스 구현 (entities/[Name].ts)
   - Phaser.GameObjects 상속
   - 생성자: scene.add.existing(), physics.add.existing()
   - 메서드: update(), takeDamage() 등

3. 씬에서 사용 (scenes/[Scene].ts)
   - 인스턴스 생성
   - 충돌/오버랩 설정

4. 검증
   - 타입 체크: tsc --noEmit
   - 게임 실행: npm run dev
```

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/new-feature` | 새 엔티티 추가 시 사용 |
| `/bugfix` | 엔티티 버그 수정 시 사용 |

---

## 호출 키워드

다음 키워드가 포함된 요청 시 이 에이전트가 담당:

- Entity, 엔티티
- Player, 플레이어, 캐릭터
- Monster, 몬스터, 적
- NPC
- Item, 아이템

---

## 관련 에이전트

| 에이전트 | 협업 내용 |
|----------|----------|
| **Asset** | 스프라이트 에셋 요청 |
| **System** | BattleSystem 등과 연동 |
| **Scene** | 씬에서 엔티티 생성/관리 |
| **Tester** | 엔티티 로직 단위 테스트 |

---

## 규칙

1. **Phaser.GameObjects 상속**: 모든 엔티티는 Phaser 게임 오브젝트 상속
2. **타입 안전성**: 모든 프로퍼티/메서드에 타입 명시
3. **컴포넌트 패턴 권장**: 복잡한 로직은 컴포넌트로 분리
4. **씬 직접 참조 금지**: this.scene 외 다른 씬 참조 불가
5. **이벤트 기반 통신**: 씬과의 통신은 이벤트 사용

```typescript
// Good ✅
this.emit('entity-death', this);

// Bad ❌
this.scene.handleEntityDeath(this);
```

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 상세 구조로 확장 | @claude |
| 2026-02-03 | 초기 작성 | @claude |
