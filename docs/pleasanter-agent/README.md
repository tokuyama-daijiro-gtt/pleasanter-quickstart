# Pleasanter Agent Operations

This directory contains the smallest shared operating kit for AI agents that
support Pleasanter business app creation in this quickstart repository.

## Scope

The agent helps with repeatable, low-risk app creation support for:

- inquiry management
- task management
- request management

The current implementation is Chrome DevTools MCP driven. Agents should operate
the Pleasanter UI running in Codespaces/local Docker as the primary app creation
surface, then use API examples only for fallback, verification, or bulk data.

Codespaces setup:

- `.devcontainer/devcontainer.json` installs Node.js 22 for `npx`.
- `.devcontainer/setup-chrome-devtools-mcp.sh` installs Google Chrome Stable and
  registers `chrome-devtools` with Codex CLI when `codex` is available.
- `.vscode/mcp.json` shares the same Chrome DevTools MCP server with VS Code /
  GitHub Copilot.
- A new or rebuilt Codespace is required for the automatic setup to run.

## Principles

- Start from a small app design, then build it through the Pleasanter UI.
- Prefer Chrome DevTools MCP for site creation, table management, field setup,
  view setup, and sample record verification.
- Use Pleasanter API examples only when UI operation is blocked or when repeatable
  bulk actions are clearly safer.
- Keep production data safe. Destructive production actions are out of scope.
- Record assumptions, targets, payloads, verification evidence, and open issues.

## Standard Execution Flow

1. **Intake**
   - Identify workflow type, target environment, desired users, and required
     approval or escalation steps.
   - If requirements are vague, propose a minimal inquiry/task/request design
     and state assumptions.
2. **Design**
   - Define fields, statuses, views, filters, notifications, and permissions.
   - Keep the first version small enough to validate with real users.
3. **Safety Check**
   - Confirm the environment is not production before write operations.
   - Confirm site ID, API base path, and authentication state.
   - Prepare a rollback or manual recovery note where possible.
4. **Implementation**
   - Use Chrome DevTools MCP to operate the Pleasanter UI.
   - Create the site, configure table columns, define list/editor views, and add
     sample records through observable UI steps.
   - Use API calls only as fallback or to seed repeatable sample data.
5. **Verification**
   - Validate create, read, update, and search behavior.
   - Confirm status transitions and required fields.
6. **Report**
   - Summarize assumptions, UI screens/actions, changed Pleasanter targets,
     verification, API fallback if any, and remaining work.

## Directory Layout

- `skills.md`: reusable skill cards for agent behavior.
- `chrome-devtools-mcp-playbook.md`: primary UI-operation playbook for building
  apps in Pleasanter.
- `api-create-site-example.md`: local Pleasanter API flow for creating and
  updating a small inquiry management site when UI fallback is needed.

## Current Minimal Example

- `chrome-devtools-mcp-playbook.md`: opens the Codespaces Pleasanter UI, creates
  an app site, configures fields/views, adds sample records, and verifies the
  result.

## Future Extensions

- Add app-specific Chrome DevTools MCP runbooks for task management and request
  management.
- Convert proven UI steps into API payloads only when repeatability outweighs
  the clarity of direct UI operation.
- Add report examples under `examples/` once real app creation runs exist.
