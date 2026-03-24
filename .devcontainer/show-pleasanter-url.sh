#!/usr/bin/env bash
set -euo pipefail

port="50001"

if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  url="https://${CODESPACE_NAME}-${port}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  context="Codespaces"
else
  url="http://localhost:${port}"
  context="Local VS Code"
fi

echo "[info] Pleasanter URL (${context}): ${url}"
