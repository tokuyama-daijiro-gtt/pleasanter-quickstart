#!/usr/bin/env bash
set -euo pipefail

chrome_bin="/usr/bin/google-chrome"

install_google_chrome() {
  if command -v google-chrome >/dev/null 2>&1; then
    echo "[mcp] Google Chrome is already installed: $(command -v google-chrome)"
    return
  fi

  echo "[mcp] Installing Google Chrome Stable for Chrome DevTools MCP."
  sudo apt-get update
  sudo apt-get install -y ca-certificates wget gnupg
  sudo install -d -m 0755 /etc/apt/keyrings
  sudo rm -f /etc/apt/keyrings/google-chrome.gpg
  wget -qO- https://dl.google.com/linux/linux_signing_key.pub \
    | sudo gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg
  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
    | sudo tee /etc/apt/sources.list.d/google-chrome.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y google-chrome-stable
}

verify_node() {
  if ! command -v node >/dev/null 2>&1 || ! command -v npx >/dev/null 2>&1; then
    echo "[mcp] Node.js/npx was not found. Rebuild the devcontainer so the node feature can install Node.js 22." >&2
    exit 1
  fi

  echo "[mcp] Node: $(node --version)"
  echo "[mcp] npx: $(npx --version)"
}

register_codex_mcp() {
  if ! command -v codex >/dev/null 2>&1; then
    echo "[mcp] Codex CLI was not found. Skipping Codex MCP registration."
    return
  fi

  if codex mcp get chrome-devtools >/dev/null 2>&1; then
    echo "[mcp] Codex MCP server 'chrome-devtools' is already registered."
    return
  fi

  echo "[mcp] Registering Chrome DevTools MCP for Codex."
  codex mcp add \
    --env CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS=true \
    --env CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=true \
    chrome-devtools -- \
    npx -y chrome-devtools-mcp@latest \
      --headless=true \
      --isolated=true \
      --executablePath="${chrome_bin}"
}

install_google_chrome
verify_node
register_codex_mcp

echo "[mcp] Chrome DevTools MCP setup is complete."
echo "[mcp] Restart Codex or reload VS Code/Copilot if the MCP tools are not visible yet."
