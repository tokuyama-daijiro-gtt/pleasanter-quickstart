#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
codedefiner_marker_file="${script_dir}/.codedefiner_initialized"
initial_setup_marker_file="${script_dir}/.pleasanter_initial_setup_initialized"
legacy_playwright_marker_file="${script_dir}/.playwright_initialized"

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

if [[ -f "${legacy_playwright_marker_file}" && ! -f "${initial_setup_marker_file}" ]]; then
  touch "${initial_setup_marker_file}"
fi

if [[ ! -f "${initial_setup_marker_file}" ]]; then
  echo "[init] Running Pleasanter initial setup with: docker compose up --build pleasanter-initial-setup"
  if docker compose up --build pleasanter-initial-setup; then
    touch "${initial_setup_marker_file}"
    echo "[init] Pleasanter initial setup command succeeded."
  else
    echo "[init] Pleasanter initial setup command failed." >&2
    exit 1
  fi
else
  echo "[init] Pleasanter initial setup was already completed. Skipping."
fi
