# Playwright helper workspace

This directory is reserved for future browser automation assets that run against the `pleasanter` service inside Docker Compose.

- Put Playwright specs under `tests/`
- Put one-off helper scripts under `scripts/`
- Use `PLAYWRIGHT_APP_URL` to point scripts at the in-network app URL
- Do not commit credentials or recorded sessions

## Quick check

Use this before adding real UI automation steps.

```bash
docker compose run --rm playwright npm run check:ui
```

The script prints the target URL, HTTP status, final URL, page title, and a short body text snippet to the terminal.
