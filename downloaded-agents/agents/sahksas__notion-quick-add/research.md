# Research Agent

## 役割

Flow Launcher と Notion API の技術仕様を調査し、実装に必要な情報を収集するエージェント。

## 参照ドキュメント

- `docs/requirements.md`: 要件定義書（4. 制約条件）

## 主な責務

### 1. Flow Launcher プラグイン仕様の調査

#### JSON-RPC 通信形式

- **入力形式**: `process.argv[2]` で受け取る JSON の構造
  - `method`: メソッド名（例: `query`）
  - `parameters`: パラメータ配列（例: ユーザー入力文字列）
  - `settings`: プラグイン設定
- **出力形式**: `console.log(JSON.stringify())` で返す ResponseItem
  - `title`: タイトル
  - `subtitle`: サブタイトル
  - `JsonRPCAction`: アクション定義
  - `IcoPath`: アイコンパス

#### SettingsTemplate.yaml の書き方

- **テキスト入力**: API Key などの文字列入力
- **パスワード入力**: API Key のマスク表示
- **プルダウン選択**: データベース、プロパティの選択
- **ボタン**: 接続テストなどのアクション
- **複数選択**: Multi-select 型の値選択
- **チェックボックス**: Checkbox 型の ON/OFF

#### 設定データの保存方法

- Flow Launcher がどこに設定を保存するか
- `settings` オブジェクトからの設定読み込み方法

#### plugin.json の必須フィールド

- `ID`: プラグイン UUID
- `ActionKeyword`: デフォルト値 `n`
- `Name`: プラグイン名
- `Description`: 説明
- `Author`: 作者名
- `Version`: バージョン番号
- `Language`: `javascript`
- `ExecuteFileName`: エントリーポイント（例: `src/index.js`）
- `IcoPath`: アイコンパス（例: `assets/icon.png`）

### 2. Notion API v1 の調査

#### データベース一覧の取得 (FR-006)

- API エンドポイント: `POST https://api.notion.com/v1/search`
- フィルタ: `{ "filter": { "property": "object", "value": "database" } }`
- レスポンス: データベース名と ID のリスト

#### プロパティ一覧の取得 (FR-007)

- API エンドポイント: `GET https://api.notion.com/v1/databases/{database_id}`
- レスポンス: プロパティ名、タイプ、選択肢（Select/Multi-select）
- Title 型プロパティの自動検出方法

#### ユーザー一覧の取得 (FR-007)

- API エンドポイント: `GET https://api.notion.com/v1/users`
- レスポンス: ユーザー名と ID のリスト
- People 型プロパティへの設定方法

#### ページ作成 (FR-003)

- API エンドポイント: `POST https://api.notion.com/v1/pages`
- リクエストボディ:
  - `parent`: データベース ID
  - `properties`: プロパティと値のマップ
- 各プロパティタイプの値の形式:
  - Title: `{ "title": [{ "text": { "content": "タスク名" } }] }`
  - Text: `{ "rich_text": [{ "text": { "content": "値" } }] }`
  - Select: `{ "select": { "name": "選択肢名" } }`
  - Multi-select: `{ "multi_select": [{ "name": "選択肢1" }, { "name": "選択肢2" }] }`
  - Date: `{ "date": { "start": "2025-10-12" } }` または `{ "date": { "start": "2025-10-12T12:34:56+09:00" } }`
  - Checkbox: `{ "checkbox": true }`
  - Number: `{ "number": 10 }`
  - URL: `{ "url": "https://example.com" }`
  - Email: `{ "email": "user@example.com" }`
  - Phone: `{ "phone_number": "090-1234-5678" }`
  - People: `{ "people": [{ "id": "user-id" }] }`

#### エラーレスポンスの形式 (FR-009)

- HTTP ステータスコード: 401, 404, 429, 500 など
- エラーメッセージの構造

#### レート制限 (4. 制約条件)

- 3 リクエスト/秒
- レート制限エラー（429）の `Retry-After` ヘッダー

### 3. 実装上の注意点

#### 文字エンコーディング (FR-002)

- 日本語・英語・数字・記号の正しい処理
- JSON 特殊文字（`"`, `\`）のエスケープ

#### タイムゾーン (FR-003)

- 今日の日付: ローカルタイムゾーンで YYYY-MM-DD 形式
- 現在日時: ローカルタイムゾーンで ISO 8601 形式

#### リトライロジック (FR-009)

- 指数バックオフの実装方法
- リトライ回数の制限

## 調査結果の記録

調査結果は以下に記録する:

- 実装時の参考情報として docs/ に追加するか
- コード内のコメントとして記載
