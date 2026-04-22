# Chrome DevTools MCP Playbook For Pleasanter

Use this playbook to build Pleasanter apps through the running Codespaces/local
Pleasanter UI. Chrome DevTools MCP is the primary implementation path for this
repository. API calls are fallback or bulk-data support.

## Allowed Use

- Confirm Pleasanter is reachable.
- Confirm login state.
- Create a new app site in a non-production Pleasanter environment.
- Configure table management settings, editor fields, list columns, filters,
  and basic views.
- Create or update test records in the intended site.
- Capture evidence for the final report.

## Prohibited Use

- Production destructive actions.
- Deleting sites, records, users, groups, permissions, or parameter files.
- Browsing through administration screens without a named target.
- Changing tenant-wide settings.
- Copying full API keys or secrets into logs or reports.

## Preconditions

- Target URL is known, usually `http://localhost:50001`.
- Target environment is local, Codespaces, or development.
- Target app name and expected field list are known.
- Intended action and expected result are written down.
- Rollback or manual recovery note exists for any write operation.
- Chrome DevTools MCP is available from the agent session. If not, rebuild the
  Codespace and restart the agent so `.devcontainer/setup-chrome-devtools-mcp.sh`
  and `.vscode/mcp.json` can take effect.

## Playbook 1: Open Pleasanter And Confirm Login

1. Open `http://localhost:50001`.
2. Wait for the page to finish loading.
3. If the login form is shown, login with the development credentials from
   `README.md`.
4. If a password change prompt appears in a fresh environment, stop and report
   that initial setup may not have completed.
5. Confirm the current URL and page title in the report.

Evidence to capture:

- final URL
- page title
- whether login was required

## Playbook 2: Create A New App Site

Inputs:

- app name, for example `筋トレ進捗管理`
- app type, usually record table
- parent location, usually top-level or a known development folder

Steps:

1. Open the top page or target parent folder.
2. Use the UI command for creating a new site/table.
3. Select a record table when the workflow stores repeated business records.
4. Enter the app name.
5. Save or create the site.
6. Record the created site URL and site ID from the address bar.

Evidence to capture:

- URL
- visible app/site title
- site ID
- parent location

## Playbook 3: Configure Fields And Views

Inputs:

- `SITE_ID`
- field list with Pleasanter column mapping
- list columns and editor columns
- required fields and choice values

Steps:

1. Open the created site.
2. Open the table management or site settings screen from the UI.
3. Configure editor fields:
   - enable needed standard columns
   - set display labels where available
   - set choices for classification/status fields where available
   - set required flags only when the workflow truly needs them
4. Configure list/grid columns for daily operation.
5. Configure useful views or filters when the UI exposes them clearly.
6. Save settings.
7. Return to the site index and new-record screen to verify the changes.

Evidence to capture:

- settings screen URL
- changed columns/labels/choices
- saved result message
- verified list/editor fields

## Playbook 4: Create UI Test Records

Use this only in a non-production site when UI save behavior must be verified.

Inputs:

- `SITE_ID`
- one or two sample records that match the app design

Steps:

1. Navigate to `http://localhost:50001/items/${SITE_ID}/new`.
2. Fill only the agreed test values.
3. Save the record.
4. Record the created item URL or ID.
5. Navigate back to the site index.
6. Search for the unique test key.
7. Confirm the record appears.

Example test values:

- Title: a realistic record title
- Body: short verification note
- Key or unique field: a clearly synthetic value

Stop conditions:

- The target URL is not local/development.
- The site title does not match the expected target.
- Save would affect real business data.
- The form shows unexpected required fields.

## Playbook 5: Report A UI Verification Run

Use this structure in the final report:

```text
Chrome DevTools MCP verification:
- Target URL:
- Site ID:
- Expected title:
- Login required:
- Created/configured screens:
- Visible columns/fields:
- Test record ID:
- Missing or unexpected UI:
- Screenshots or observations:
```

## Troubleshooting

- If `http://localhost:50001` is not reachable, check `docker compose ps`.
- If login fails, rerun or inspect the initial setup service.
- If fields are missing, confirm `getsite` output before editing through the UI.
- If a required field blocks test record creation, stop and report the field
  instead of guessing a value.
