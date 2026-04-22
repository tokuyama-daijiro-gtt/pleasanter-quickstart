# Pleasanter Agent Skills

These skill cards describe the minimum shared behavior expected from agents in
this repository. They are intentionally small and can be expanded as real runs
produce better examples.

## App Design

Use when translating a business workflow into a Pleasanter app proposal.

Inputs:

- workflow name and goal
- required users or teams
- required fields
- current process pain points
- reporting or search needs

Steps:

1. Select a known workflow type or state that a custom workflow is needed.
2. Propose fields with data types, required flags, and example values.
3. Propose statuses and transitions.
4. Propose views for operators, assignees, managers, and auditors.
5. Call out assumptions and items that need user validation.

Output:

- concise design proposal
- field list
- status list
- view list
- safety and migration notes

## Chrome DevTools MCP App Build

Use when the user asks to create or configure a Pleasanter app in the running
Codespaces/local Pleasanter UI.

Steps:

1. Open the Pleasanter UI URL from `README.md`.
2. Confirm login state and target environment.
3. Create the target site through the UI.
4. Configure table/editor/list settings through the UI.
5. Add one or two sample records through the UI.
6. Verify list, editor, search/filter, and record update behavior.
7. Report the exact screens/actions used.

Fallback:

- Use API examples only when UI operation is blocked, repetitive data seeding is
  needed, or a setting is easier to verify through API output.

## UI Operation Via Chrome DevTools MCP

Use as the primary app-building skill for this repository. Operations may be
substantial, but each step must be named, observable, and limited to the intended
development target.

Preconditions:

- target URL is known
- login state is understood
- target environment is non-production
- intended action and expected result are documented
- app design and field list are drafted

Rules:

- Navigate purposefully through administration screens needed for app creation.
- Do not delete records, sites, users, groups, or permissions.
- Capture enough evidence to report what was verified.
- Prefer UI operations for app creation; use API only for fallback or bulk seed
  data.

## Safety Rules

Use before any write operation.

Checklist:

- Environment is local, Codespaces, development, or explicitly confirmed as safe.
- API key and runtime config are not printed in full or committed.
- Target URL, target site, and intended UI screen are known.
- Operation is additive or reversible.
- Destructive operations are absent or explicitly approved for non-production.

Stop conditions:

- ambiguous production target
- unclear site ID
- missing authentication context
- request to remove data without a confirmed backup or non-production target

## Result Reporting

Use at the end of app design, implementation, or verification work.

Report format:

- assumptions
- Chrome DevTools MCP screens/actions used
- API example or payload path used, if any
- changes made or proposed
- files or Pleasanter targets touched
- verification performed
- known gaps
- recommended next step

For failed runs, include:

- failing step
- observed error
- likely cause
- safe retry path

## Troubleshooting

Use when Pleasanter, the UI, or API calls fail.

Checks:

1. Confirm services with `docker compose ps`.
2. Confirm Pleasanter is reachable on `http://localhost:50001`.
3. Confirm the Next.js UI is reachable on `http://localhost:3000`.
4. Confirm `.devcontainer/pleasanter-api-key` exists.
5. Confirm `ui/public/runtime-config.json` is generated and ignored by Git.
6. Confirm parameter changes were followed by `docker compose build`.

Common notes:

- `docker compose restart` is not enough for changed files under
  `pleasanter/app_data_parameters/`.
- The UI calls Pleasanter through `/pleasanter` and the Next.js rewrite.
- UI write attempts should report screen, target site, intended field/value, and
  verification result.
- API write attempts, when used, should report endpoint, target site ID, and
  payload shape.
