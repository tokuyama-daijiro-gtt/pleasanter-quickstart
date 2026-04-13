#!/usr/bin/env bash
set -euo pipefail

if [[ "${PLAYWRIGHT_WAIT_FOR_APP:-1}" == "1" ]]; then
  target_url="${PLAYWRIGHT_APP_URL:-http://pleasanter:8080}"
  timeout_ms="${PLAYWRIGHT_WAIT_TIMEOUT_MS:-90000}"

  node - "$target_url" "$timeout_ms" <<'NODE'
const [targetUrl, timeoutMsRaw] = process.argv.slice(2);
const timeoutMs = Number(timeoutMsRaw);
const deadline = Date.now() + timeoutMs;

async function waitForApp() {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(targetUrl, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) {
        process.exit(0);
      }
    } catch (error) {
      // Retry until timeout because the app container may still be booting.
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.error(`[playwright] Timed out waiting for ${targetUrl}`);
  process.exit(1);
}

waitForApp();
NODE
fi

exec "$@"
