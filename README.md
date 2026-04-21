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

## パラメータ変更手順

1. 変更したいパラメータファイル（例: `Search.json`）を `pleasanter/app_data_parameters/` に配置
2. `docker compose build`
3. 初回セットアップ時は `docker compose run --rm codedefiner _rds /l "ja" /z "Asia/Tokyo"`
4. `docker compose up -d pleasanter`

## 注意

- パラメータファイルを変更した場合、`docker compose restart` だけでは反映されません。
- 反映には毎回 `docker compose build` が必要です。
- `PLEASANTER_VERSION` は、`pleasanter/app_data_parameters/` に置いたパラメータファイルの取得元バージョンに合わせてください。

## Playwrightでログイン確認

Pleasanter 起動後に、以下で Playwright サービスから画面へアクセスし、初期ユーザーでログインします。
初回ログイン時にパスワード変更ダイアログが表示された場合は、`pleasanter-qs` に変更します。

```bash
docker compose up --build playwright
```

Compose ネットワーク内からアクセスするため、対象 URL は `http://pleasanter:8080` にしています。
これはホスト側で開く `http://localhost:50001` と同じ Pleasanter 画面です。

devcontainer 初回起動時は `.devcontainer/init-codedefiner.sh` から自動実行されます。
一度成功すると `.devcontainer/.playwright_initialized` が作成され、以降は自動実行をスキップします。

## Next.js UI

`ui/` 配下に、Pleasanter を永続層として使う業務アプリケーションのベースになる Next.js アプリを配置しています。

- App Router / TypeScript / ESLint を使用
- 画面本体は Client Component として実装
- SSR のデータ取得は使わず、ブラウザ側の操作で Pleasanter API を呼び出し
- Pleasanter API キーは Playwright の初期処理で `.devcontainer/pleasanter-api-key` に保存
- UI サービス起動時に `ui/public/runtime-config.json` を生成し、API キーと API ベースパスを画面へ渡す
- Compose ネットワーク内では Next.js の rewrite で `/pleasanter/*` を `http://pleasanter:8080/*` に転送

devcontainer では API キー取得後に `ui` サービスが起動し、`http://localhost:3000` で開けます。

手動で起動する場合は以下を実行してください。

```bash
docker compose up --build ui
```
