# UI Agent

**역할**: UI 컴포넌트 개발 전문가
**목적**: 체력바, 대화창, 메뉴 등 사용자 인터페이스 구현

---

## 담당 영역

```
src/ui/
├── HealthBar.ts        # 체력/MP 바
├── DialogBox.ts        # 대화창
├── BattleUI.ts         # 전투 UI
├── InventoryUI.ts      # 인벤토리 UI (예정)
├── MenuUI.ts           # 메뉴 UI (예정)
└── index.ts            # UI export
```

---

## 작업 범위

### 생성

| 대상 | 설명 |
|------|------|
| UI 컴포넌트 | Phaser Container 기반 UI |
| 대화 시스템 | 텍스트 표시, 선택지 |
| HUD | 게임 정보 표시 |
| 메뉴 | 인터랙티브 메뉴 |

### 수정

| 대상 | 설명 |
|------|------|
| 스타일 | 색상, 크기, 위치 |
| 애니메이션 | 페이드, 슬라이드 효과 |
| 인터랙션 | 클릭, 호버 이벤트 |

---

## UI 구조

### 기본 패턴 (Container)

```typescript
export class HealthBar extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private bar: Phaser.GameObjects.Graphics;
  private maxWidth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y);

    this.maxWidth = width;
    this.createBackground();
    this.createBar();

    scene.add.existing(this);
  }

  // 값만 받아서 표시
  setValue(current: number, max: number): void {
    const percent = Math.max(0, Math.min(1, current / max));
    this.bar.clear();
    this.bar.fillStyle(this.getColor(percent));
    this.bar.fillRect(2, 2, (this.maxWidth - 4) * percent, 12);
  }

  private getColor(percent: number): number {
    if (percent > 0.5) return 0x00ff00;  // 녹색
    if (percent > 0.25) return 0xffff00; // 노랑
    return 0xff0000;                      // 빨강
  }
}
```

### 대화창 패턴

```typescript
export class DialogBox extends Phaser.GameObjects.Container {
  private textObject: Phaser.GameObjects.Text;
  private isTyping: boolean = false;

  show(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.typeText(text, resolve);
    });
  }

  private typeText(text: string, onComplete: () => void): void {
    // 타이핑 효과 구현
  }
}
```

---

## 워크플로우

### 새 UI 컴포넌트 생성

```
1. 컴포넌트 구조 설계
   - 필요한 요소 (배경, 텍스트, 버튼 등)
   - 인터랙션 방식

2. 클래스 구현 (ui/[Name]UI.ts)
   - Phaser.GameObjects.Container 상속
   - 자식 요소 생성 및 배치

3. 씬에서 사용
   - 인스턴스 생성
   - 데이터 바인딩 (setValue 등)

4. 검증
   - 시각적 확인 (npm run dev)
   - 인터랙션 테스트
```

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/new-feature` | 새 UI 컴포넌트 추가 시 사용 |
| `/bugfix` | UI 버그 수정 시 사용 |

---

## 호출 키워드

다음 키워드가 포함된 요청 시 이 에이전트가 담당:

- UI, HUD
- 메뉴, 버튼
- 대화창, 텍스트
- 체력바, 상태 표시
- 인벤토리 화면

---

## 관련 에이전트

| 에이전트 | 협업 내용 |
|----------|----------|
| **Scene** | 씬에서 UI 컴포넌트 생성/관리 |
| **Entity** | 엔티티 상태를 UI에 반영 |
| **Asset** | UI 에셋 (아이콘, 배경 등) |

---

## 규칙

1. **표시만 담당**: UI는 데이터를 받아 표시만, 로직 금지
2. **Container 사용**: 여러 요소는 Container로 그룹화
3. **반응형 설계**: setValue 등 메서드로 데이터 수신
4. **깊이 관리**: setDepth로 UI가 항상 최상위

```typescript
// Good ✅ - 데이터 수신하여 표시
setValue(current: number, max: number): void {
  this.bar.scaleX = current / max;
}

// Bad ❌ - 직접 데이터 조회
update(): void {
  const health = this.scene.player.health;  // 금지
  this.bar.scaleX = health / 100;
}
```

---

## UI 레이아웃 가이드

### 게임 화면 (480x320)

```
┌─────────────────────────────────────┐
│ [HP Bar]         [MP Bar]  [Gold]  │ ← HUD (상단)
│                                     │
│                                     │
│           게임 영역                  │
│                                     │
│                                     │
│ [Dialog Box                       ] │ ← 대화창 (하단)
└─────────────────────────────────────┘
```

### 전투 화면

```
┌─────────────────────────────────────┐
│ Player HP ████████░░  [100/100]    │
│ Player MP ████░░░░░░  [40/100]     │
│                                     │
│     [Player]          [Monster]    │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ [공격] [스킬] [아이템] [도망]   ││ ← 전투 메뉴
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 변경 이력

| 날짜 | 변경 | 담당자 |
|------|------|--------|
| 2026-02-03 | 상세 구조로 확장 | @claude |
| 2026-02-03 | 초기 작성 | @claude |
