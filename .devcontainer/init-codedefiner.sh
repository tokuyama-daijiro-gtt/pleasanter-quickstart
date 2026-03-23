#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
marker_file="${script_dir}/.codedefiner_initialized"

cd "${repo_root}"

if [[ ! -f "${marker_file}" ]]; then
  docker compose run --rm codedefiner _rds /y /l "ja" /z "Asia/Tokyo"
  touch "${marker_file}"
fi

echo "[init] Starting pleasanter with: docker compose up -d pleasanter"
if docker compose up -d pleasanter; then
  echo "[init] pleasanter startup command succeeded."
else
  echo "[init] pleasanter startup command failed." >&2
  exit 1
fi
