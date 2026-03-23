#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
marker_file="${script_dir}/.codedefiner_initialized"

if [[ -f "${marker_file}" ]]; then
  exit 0
fi

cd "${repo_root}"

docker compose up -d db
docker compose run --rm codedefiner _rds /y /l "ja" /z "Asia/Tokyo"

touch "${marker_file}"
