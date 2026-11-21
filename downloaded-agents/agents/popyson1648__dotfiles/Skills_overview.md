# Skills overview

`skills/` 配下のうち、各ディレクトリに `SKILL.md` を持つものを「定義済みスキル」として扱い、その用途を簡潔にまとめた文書です。

## スキル一覧

- **aspnet-core**: ASP.NET Core アプリの設計・実装・レビュー・リファクタリング向けのスキル。Blazor、Razor Pages、MVC、Minimal API、SignalR、gRPC、認証/認可、テスト、性能改善、デプロイまで幅広く扱う。
- **chatgpt-apps**: ChatGPT Apps SDK を使ったアプリ開発向けのスキル。MCP サーバーとウィジェット UI の構成、ツール登録、Apps SDK の互換 API、メタデータや CSP 設定、雛形作成を支援する。
- **cloudflare-deploy**: Cloudflare へのデプロイ用スキル。Workers、Pages、Durable Objects、R2、D1 などを含む Cloudflare プラットフォーム上でのホスティングや公開、インフラ設定を支援する。
- **develop-web-game**: Web ゲーム開発向けのスキル。HTML/JavaScript 製ゲームの小さな変更を回しながら、Playwright ベースのテスト、スクリーンショット確認、コンソールエラー調査を行う開発ループを支援する。
- **doc**: `.docx` 文書の読解・作成・編集向けのスキル。特にレイアウトや書式の再現性が重要な Word 文書を扱うときに使う。
- **figma**: Figma 連携向けの基本スキル。Figma MCP サーバーを使ってデザイン情報、スクリーンショット、変数、アセットを取得し、実装に落とし込む。
- **figma-implement-design**: Figma デザインを高い忠実度でコード化するためのスキル。Figma のノードや URL をもとに、実装向けのコンポーネントや画面を 1:1 に近い形で作る。
- **gh-address-comments**: GitHub PR や issue のコメント対応向けのスキル。現在のブランチに紐づくオープン PR を `gh` CLI で確認し、レビューコメントへの対応を進める。
- **gh-fix-ci**: GitHub Actions の CI 失敗調査向けスキル。PR のチェックやログを `gh` で確認し、失敗原因の要約と修正方針の整理を行う。
- **imagegen**: OpenAI Image API を使った画像生成・編集向けのスキル。画像生成、インペイント、背景除去、商品画像、コンセプトアート、バリエーション生成などを扱う。
- **jupyter-notebook**: Jupyter Notebook の作成・編集向けスキル。実験、検証、チュートリアル用の `.ipynb` を雛形から整えて作るときに使う。
- **linear**: Linear 連携スキル。課題、プロジェクト、チームワークフローを読み書きし、チケットの作成・更新・確認を行う。
- **netlify-deploy**: Netlify へのデプロイ用スキル。`npx netlify` を使ってサイトや Web プロジェクトの公開、リンク、プレビュー/本番デプロイを行う。
- **notion-knowledge-capture**: 会話や意思決定を Notion に整理して残すためのスキル。チャットログやメモを、Wiki、FAQ、How-to、決定事項ページへ構造化して変換する。
- **notion-meeting-intelligence**: Notion の情報をもとに会議準備を行うスキル。アジェンダ、事前資料、参加者向けの背景情報整理などを支援する。
- **notion-research-documentation**: Notion 上の複数情報源を横断調査し、文書化するためのスキル。調査メモ、比較表、レポート、ブリーフ作成に向く。
- **notion-spec-to-implementation**: Notion 上の仕様書や PRD を実装計画へ落とすためのスキル。実装タスク分解、計画、進捗管理の整備を支援する。
- **openai-docs**: OpenAI の公式ドキュメント参照向けスキル。OpenAI 製品/API の使い方、最新モデルの選定、GPT-5.4 への移行やプロンプト更新方針を公式情報ベースで確認する。
- **pdf**: PDF の読解・作成・レビュー向けスキル。見た目やレイアウト確認が重要な PDF を扱う際に、レンダリング確認や内容抽出を支援する。
- **playwright**: Playwright CLI によるブラウザ自動操作スキル。ページ遷移、フォーム入力、スナップショット取得、スクリーンショット、UI デバッグ、データ抽出を端末から行う。
- **playwright-interactive**: 永続的なブラウザ/Electron 操作向けスキル。`js_repl` を使って対話的かつ反復的に UI を調査・デバッグする。
- **render-deploy**: Render へのデプロイ用スキル。コードベースを見て `render.yaml` Blueprint を作成し、Render 上での公開やセットアップを支援する。
- **screenshot**: OS レベルのスクリーンショット取得スキル。画面全体、特定アプリ、特定ウィンドウ、矩形領域などを撮る必要があるときに使う。
- **security-best-practices**: セキュリティのベストプラクティスレビュー向けスキル。Python、JavaScript/TypeScript、Go のコードに対して、安全な実装指針や改善案を提示する。
- **security-ownership-map**: セキュリティ観点の所有者分析スキル。Git 履歴から、人とファイルの関係、バス係数、機微コードの所有状況を解析し、可視化用データを出力する。
- **security-threat-model**: リポジトリに基づく脅威モデリング用スキル。資産、信頼境界、攻撃者能力、悪用経路、緩和策を整理し、簡潔な脅威モデル文書を作る。
- **sentry**: Sentry の監視データ参照スキル。Sentry API を通じて issue、イベント、最近の本番障害、基本的な健全性情報を読み取る。
- **skill-creator**: 新しいスキルを作るためのガイドスキル。Codex の能力を拡張するスキルの新規作成や既存スキル改善を支援する。
- **slides**: PowerPoint スライド (`.pptx`) の作成・編集向けスキル。新規デッキ作成、スクリーンショット/PDF からの再現、レイアウト調整、図表追加、崩れ確認を支援する。
- **sora**: OpenAI の Sora 動画 API 向けスキル。動画生成、リミックス、一覧取得、ダウンロード、削除、バッチ生成などを CLI から行う。
- **speech**: OpenAI Audio API を使った音声合成スキル。ナレーション、読み上げ、音声プロンプト、バッチ音声生成を行う。
- **spreadsheet**: スプレッドシート処理スキル。`.xlsx`、`.csv`、`.tsv` の作成、編集、分析、書式調整を、数式や再計算を意識しながら進める。
- **transcribe**: 音声文字起こしスキル。音声/動画ファイルからテキスト化し、必要に応じて話者分離や既知話者ヒントも扱う。
- **ui-ux-design**: UI/UX 設計判断のためのスキル。情報設計、ビジュアル階層、レイアウト、色、タイポグラフィ、間隔、インタラクション設計などを整理する。
- **ui-ux-professional**: フロントエンド実装で UI/UX のベストプラクティスを徹底するスキル。デザイントークン、WCAG 2.2 AA アクセシビリティ、レスポンシブ設計、一貫した操作パターン、視覚階層、性能を意識した UI 実装を促す。
- **vercel-deploy**: Vercel へのデプロイ用スキル。アプリや Web サイトの公開、本番/プレビュー配備、デプロイ URL の取得を支援する。
- **winui-app**: WinUI 3 デスクトップアプリ開発スキル。Windows App SDK を使った C# / XAML アプリの新規作成、設計、レビュー、環境構築、トラブルシュートを支援する。
- **yeet**: GitHub PR 作成までを一気通貫で進めるスキル。変更の stage、commit、push、PR 作成を `gh` CLI でまとめて行う。

## 補足

- `skills/logs` はディレクトリとして存在するが、確認時点では `SKILL.md` を持たなかったため、この文書では定義済みスキルに含めていない。
