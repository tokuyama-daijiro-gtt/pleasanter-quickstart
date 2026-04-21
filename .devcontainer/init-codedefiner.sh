#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
codedefiner_marker_file="${script_dir}/.codedefiner_initialized"
playwright_marker_file="${script_dir}/.playwright_initialized"

cd "${repo_root}"

if [[ ! -f "${codedefiner_marker_file}" ]]; then
  docker compose run --rm codedefiner _rds /y /l "ja" /z "Asia/Tokyo"
  touch "${codedefiner_marker_file}"
fi

echo "[init] Starting pleasanter with: docker compose up -d pleasanter"
if docker compose up -d pleasanter; then
  echo "[init] pleasanter startup command succeeded."
else
  echo "[init] pleasanter startup command failed." >&2
  exit 1
fi

if [[ ! -f "${playwright_marker_file}" ]]; then
  echo "[init] Running initial Playwright login with: docker compose up --build playwright"
  if docker compose up --build playwright; then
    touch "${playwright_marker_file}"
    echo "[init] initial playwright login command succeeded."
  else
    echo "[init] initial playwright login command failed." >&2
    exit 1
  fi
else
  echo "[init] initial playwright login was already completed. Skipping."
fi
