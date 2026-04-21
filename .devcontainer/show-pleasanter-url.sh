#!/usr/bin/env bash
set -euo pipefail

port="50001"
url="http://localhost:${port}"
ui_port="3000"
ui_url="http://localhost:${ui_port}"

cat <<EOF
========================================
Pleasanter quickstart is ready
========================================
Pleasanter:
  ${url}

UI:
  ${ui_url}

How to open:
  1) Ctrl (or Cmd) + Click the URL above
  2) Or copy and paste it into your browser

Initial login:
  ID: Administrator
  PASSWORD: pleasanter
========================================
EOF
