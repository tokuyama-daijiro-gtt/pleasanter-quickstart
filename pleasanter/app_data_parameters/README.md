# app_data_parameters

このフォルダ配下のファイルは、Docker build 時に以下へコピーされます。

- Pleasanter: `App_Data/Parameters/`
- CodeDefiner: `/app/Implem.Pleasanter/App_Data/Parameters/`

例:

- `Search.json`
- `Service.json`
- `McpServer.json`
- 拡張機能用フォルダ/ファイル

運用上の注意:

- ここを変更したら `docker compose build` を再実行してください。
- 配置するファイルは、利用する `PLEASANTER_VERSION` と同じバージョン由来のものを使用してください。
