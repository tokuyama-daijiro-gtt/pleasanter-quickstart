#!/usr/bin/env bash
set -euo pipefail

port="50001"
url="http://localhost:${port}"

cat <<EOF
========================================
Pleasanter is ready
========================================
URL:
  ${url}

How to open:
  1) Ctrl (or Cmd) + Click the URL above
  2) Or copy and paste it into your browser

Initial login:
  ID: Administrator
  PASSWORD: pleasanter
========================================
EOF
