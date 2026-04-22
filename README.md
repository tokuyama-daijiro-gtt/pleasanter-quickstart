## CodespacesでのPleasanter起動方法

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/tokuyama-daijiro-gtt/pleasanter-quickstart)

1. 上の `Open in GitHub Codespaces` ボタンをクリック
2. GitHub画面で `Create codespace` を選択
3. VSCode画面が表示され、アプリの起動が終了するとターミナルに表示されるURLを開く
    - URLの表示は `http://localhost:50001` となっていますが、インターネット上のURLにリダイレクトされます
    - Next.js UI は `http://localhost:3000` で起動します
4. 初期ログインで以下を入力
    - ID: `Administrator`
    - PASSWORD: `pleasanter`
5. パスワード変更を求められるので、任意のパスワードを設定する

# Pleasanter Docker Compose (parameter override enabled)

この構成は、公式手順
`https://www.pleasanter.org/ja/manual/change-parameters-at-docker-image`
に合わせて、`pleasanter/app_data_parameters/` 配下のパラメータファイルを
Pleasanter コンテナへ反映できるようにしてあります。

## ファイル構成

- `compose.yaml`
- `.env`
- `ui/`
- `pleasanter/app_data_parameters/`
- `pleasanter/Pleasanter/Dockerfile`
- `pleasanter/CodeDefiner/Dockerfile`
- `pleasanter/InitialSetup/`

## パラメータ変更手順

1. 変更したいパラメータファイル（例: `Search.json`）を `pleasanter/app_data_parameters/` に配置
2. `docker compose build`
3. 初回セットアップ時は `docker compose run --rm codedefiner _rds /l "ja" /z "Asia/Tokyo"`
4. `docker compose up -d pleasanter`

## 注意

- パラメータファイルを変更した場合、`docker compose restart` だけでは反映されません。
- 反映には毎回 `docker compose build` が必要です。
- `PLEASANTER_VERSION` は、`pleasanter/app_data_parameters/` に置いたパラメータファイルの取得元バージョンに合わせてください。

## Pleasanter 初期セットアップ

Pleasanter 起動後に、以下で初期セットアップサービスから画面へアクセスし、初期ユーザーでログインします。
初回ログイン時にパスワード変更ダイアログが表示された場合は、`pleasanter-qs` に変更します。

```bash
docker compose up --build pleasanter-initial-setup
```

Compose ネットワーク内からアクセスするため、対象 URL は `http://pleasanter:8080` にしています。
これはホスト側で開く `http://localhost:50001` と同じ Pleasanter 画面です。

devcontainer 初回起動時は `.devcontainer/initialize-pleasanter.sh` から自動実行されます。
一度成功すると `.devcontainer/.pleasanter_initial_setup_initialized` が作成され、以降は自動実行をスキップします。

## Next.js UI

`ui/` 配下に、Pleasanter を永続層として使う業務アプリケーションのベースになる Next.js アプリを配置しています。

- App Router / TypeScript / ESLint を使用
- 画面本体は Client Component として実装
- SSR のデータ取得は使わず、ブラウザ側の操作で Pleasanter API を呼び出し
- Pleasanter API キーは Pleasanter 初期セットアップで `.devcontainer/pleasanter-api-key` に保存
- UI サービス起動時に `ui/public/runtime-config.json` を生成し、API キーと API ベースパスを画面へ渡す
- Compose ネットワーク内では Next.js の rewrite で `/pleasanter/*` を `http://pleasanter:8080/*` に転送

devcontainer では API キー取得後に `ui` サービスが起動し、`http://localhost:3000` で開けます。

手動で起動する場合は以下を実行してください。

```bash
docker compose up --build ui
```

## Pleasanter 向け AI エージェント運用資産

GitHub Copilot CLI / Codex 系エージェントから Pleasanter の定型業務アプリ作成支援を扱いやすくするため、最小限の共有資産を追加しています。

- `.github/copilot-instructions.md`: Copilot 向けのリポジトリ前提、実行フロー、安全ルール
- `AGENT.md`: Codex 系エージェント向けのルートガイド
- `docs/pleasanter-agent/README.md`: Pleasanter app 作成支援の運用概要
- `docs/pleasanter-agent/skills.md`: app design / Chrome DevTools MCP app build / safety / reporting / troubleshooting の skill cards
- `docs/pleasanter-agent/chrome-devtools-mcp-playbook.md`: Chrome DevTools MCP で Pleasanter UI を操作してアプリを作成・設定・検証するプレイブック
- `docs/pleasanter-agent/api-create-site-example.md`: UI 操作が詰まった場合や一括投入が必要な場合の API fallback 例

現時点では、既存の Docker Compose / Next.js UI / Pleasanter API 連携の実装は変更せず、Codespaces で起動中の Pleasanter 本体 UI を Chrome DevTools MCP で操作してアプリ作成を進める方針にしています。API は UI 操作が詰まった場合や一括データ投入が必要な場合の fallback として扱います。

Codespace 作成時は `.devcontainer/setup-chrome-devtools-mcp.sh` により、devcontainer 内へ Node.js 22 / Google Chrome Stable を用意し、Codex CLI に `chrome-devtools` MCP server を登録します。VS Code / GitHub Copilot 向けには `.vscode/mcp.json` も配置しています。MCP tools が見えない場合は、Codespace の rebuild 後に VS Code を reload し、Codex セッションを開き直してください。
