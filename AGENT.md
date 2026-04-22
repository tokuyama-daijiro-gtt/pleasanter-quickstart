# Pleasanter Business App Agent Guide

This file is the root entry point for Codex-style agents working in this
repository.

## Purpose

Help create and operate small Pleasanter-backed business applications with
shared instructions, Chrome DevTools MCP skills, safety rules, UI playbooks,
API fallback examples, and reporting formats.
The first target workflows are common internal apps such as inquiry management,
task management, and request management.

## Read First

Before implementing, inspect the current repository:

- `README.md`
- `compose.yaml`
- `.devcontainer/`
- `pleasanter/app_data_parameters/`
- `pleasanter/InitialSetup/`
- `ui/package.json`
- `ui/app/`
- `docs/pleasanter-agent/`

The existing project is a Docker/Codespaces quickstart, not a full app generator.
Avoid changing runtime services unless the task clearly requires it.

## Agent Flow

1. Understand the requested business workflow.
2. Draft a minimal app design: purpose, fields, statuses, views, permissions,
   and validation checks.
3. Use Chrome DevTools MCP against the Codespaces Pleasanter UI as the primary
   implementation path for creating and configuring apps.
4. Use API examples only as fallback, verification, or repeatable bulk-data
   support when UI operation is not enough.
5. Report assumptions, actions, evidence, and remaining risks.

## Guardrails

- Production destructive changes are prohibited.
- Do not delete or overwrite Pleasanter sites, records, users, permissions, or
  parameter files without explicit confirmation and a non-production target.
- Do not commit secrets or runtime-generated files.
- Treat UI automation as the main app-building path in this repository, but keep
  every action named, observable, and reversible where possible.
- Keep changes small and aligned with the existing quickstart structure.

## Shared Assets

- Agent overview: `docs/pleasanter-agent/README.md`
- Skill cards: `docs/pleasanter-agent/skills.md`
- API site creation example: `docs/pleasanter-agent/api-create-site-example.md`
- Chrome DevTools MCP playbook:
  `docs/pleasanter-agent/chrome-devtools-mcp-playbook.md`
- Copilot instructions: `.github/copilot-instructions.md`
