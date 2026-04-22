# Pleasanter Quickstart Agent Instructions

This repository is a Pleasanter quickstart environment. Treat Pleasanter as the
system of record and keep changes small, reproducible, and safe.

## Repository Context

- `compose.yaml` starts PostgreSQL, Pleasanter, CodeDefiner, the initial setup
  service, and the Next.js UI.
- `pleasanter/app_data_parameters/` is copied into Pleasanter and CodeDefiner
  images at build time.
- `pleasanter/app_data_parameters/McpServer.json` enables the Pleasanter MCP
  server settings for future integration.
- `pleasanter/InitialSetup/` uses Playwright to complete initial login and save
  a Pleasanter API key.
- `ui/` is a client-rendered Next.js app that calls Pleasanter API through the
  `/pleasanter` rewrite.
- Shared agent operating guidance, Chrome DevTools MCP playbooks, and API
  fallback examples live in `AGENT.md` and `docs/pleasanter-agent/`.

## Operating Principles

1. Read existing files before changing structure or behavior.
2. Prefer Chrome DevTools MCP against the Codespaces Pleasanter UI for app
   creation and configuration.
3. Use API flows as fallback, verification, or bulk-data support after UI
   behavior is understood.
4. Never run destructive operations against production environments.
5. Keep generated app proposals reproducible: record site target, fields,
   choices, assumptions, payloads, and validation results.
6. Preserve existing Docker, devcontainer, and UI responsibilities unless the
   requested task explicitly requires changing them.

## Default Workflow

1. Confirm the target use case: inquiry management, task management, request
   management, or another named business workflow.
2. Produce a short design proposal: fields, statuses, views, roles, and risks.
3. If applying changes, work in the Codespaces/local Pleasanter UI with Chrome
   DevTools MCP.
4. Follow `docs/pleasanter-agent/chrome-devtools-mcp-playbook.md` for login,
   site creation, table management, field setup, views, and verification.
5. Use `docs/pleasanter-agent/api-create-site-example.md` only when API fallback
   or repeatable data seeding is useful.
6. Report what changed, what was verified, and what remains manual.

## Safety Rules

- Do not delete sites, records, users, groups, permissions, or parameter files
  unless the user explicitly asks and the target is confirmed as non-production.
- Do not expose or commit API keys. `.devcontainer/pleasanter-api-key` and
  `ui/public/runtime-config.json` are intentionally ignored.
- Do not change `PLEASANTER_VERSION` or database settings casually; parameter
  files must match the Pleasanter version in use.
- Before API writes, state the endpoint, target site ID, intended payload shape,
  and expected result.
- Stop and report if the environment, site ID, or authentication state is
  unclear.

## Output Style

For app creation support, answer with:

- assumptions
- proposed Pleasanter fields and statuses
- Chrome DevTools MCP screens/actions used
- API endpoints and payload files used, if any
- implementation steps
- safety checks
- verification result
- remaining work
