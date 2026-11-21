---
name: adapt-external-docs
description: 汎用的なエージェント・スキル・ルールをプロジェクト固有の形式に適合させるスキル
invocable: true
---

# 外部ドキュメント適合スキル

汎用的な Rules、Agents、Skills ファイルをプロジェクト固有の形式・規約に適合させるスキルです。

---

## 使用タイミング

- 汎用的なエージェント定義をプロジェクトに導入するとき
- 他のプロジェクトからルールやスキルを移植するとき
- 外部のベストプラクティス文書をプロジェクト規約に統合するとき

---

## 呼び出し方法

```
/adapt-external-docs @{対象ファイル} type={agent|skill|rule}
```

### 例

```bash
# エージェントの適合
/adapt-external-docs @.claude/agents/planner.md type=agent

# ルールの適合
/adapt-external-docs @.claude/rules/new-rule.md type=rule

# スキルの適合
/adapt-external-docs @.claude/skills/new-skill/SKILL.md type=skill
```

---

## 適合プロセス

### 1. 既存ファイルの分析

```
a) 同じ種類の既存ファイルを読み込む
   - agents: .claude/agents/*.md
   - rules: .claude/rules/*.md
   - skills: .claude/skills/*/SKILL.md

b) プロジェクト固有のパターンを把握
   - フロントマター形式
   - セクション構成
   - 参照ドキュメント
   - 連携エージェント
```

### 2. 適合項目

| 項目 | 適合内容 |
|------|----------|
| フロントマター | プロジェクト形式に統一 |
| 言語 | プロジェクトの言語に統一 |
| 参照ドキュメント | プロジェクト固有のパスに置換 |
| コード例 | プロジェクトのパターンに置換 |
| 連携エージェント | 実在するエージェントに置換 |
| コマンド | プロジェクトのパッケージマネージャーに統一 |
| パス | プロジェクト構成に合わせて修正 |

### 3. 検証

```
- フロントマターが正しい形式か
- Markdown構文エラーがないか
- 参照先が実在するか
- プロジェクトパターンとの整合性
```

---

## プロジェクト固有の規約（カスタマイズ必要）

<!-- CUSTOMIZE: 以下をプロジェクト固有の規約に更新してください -->

### フロントマター形式

```yaml
---
name: agent-name
description: "日本語で簡潔な説明"
tools: Read, Write, Edit, Bash, Grep, Glob
model: opus
---
```

### コマンド統一

<!-- CUSTOMIZE: プロジェクトのパッケージマネージャーに合わせて変更 -->

| 変更前 | 変更後 |
|--------|--------|
| `npm install` | `pnpm install` |
| `npm run build` | `pnpm run build` |
| `npm test` | `pnpm run test` |

### プロジェクト構成

<!-- CUSTOMIZE: プロジェクトのディレクトリ構成を記載 -->

```
project/
├── src/
├── docs/
└── .claude/
```

### 実在するエージェント

<!-- CUSTOMIZE: プロジェクトで使用可能なエージェント一覧 -->

| エージェント | 専門領域 |
|-------------|---------|
| `planner` | 実装計画 |
| `code-reviewer` | コードレビュー |

---

## 適合例

### Before（汎用的なエージェント）

```yaml
---
name: planner
description: Expert planning specialist for complex features
tools: ["Read", "Grep", "Glob"]
---

# Planner

You are an expert planning specialist...

## References
- Project documentation
- Architecture docs
```

### After（プロジェクト適合後）

```yaml
---
name: planner
description: "実装計画の専門家。複雑な機能実装時に使用。"
tools: Read, Grep, Glob
model: opus
---

# Planner

複雑な機能実装、リファクタリング、アーキテクチャ変更の計画に特化したエージェントです。

---

## 参照すべきドキュメント

| ドキュメント | パス |
|-------------|------|
| 機能仕様書 | `docs/specs/FEATURE.md` |
```

---

## チェックリスト

適合完了時に確認:

- [ ] フロントマターがプロジェクト形式に統一されている
- [ ] プロジェクトの言語で記述されている
- [ ] 参照ドキュメントが実在するパスになっている
- [ ] 連携エージェントが実在するエージェント名になっている
- [ ] コマンドがプロジェクトのパッケージマネージャーに統一されている
- [ ] セクション間に `---` が入っている

---

## 関連スキル

- **merge-reference-docs**: 複数の参考ドキュメントをマージする場合
