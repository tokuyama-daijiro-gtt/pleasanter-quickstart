# Pleasanter API Site Creation Example

This is a concrete local execution example for creating a small inquiry
management site through the Pleasanter API. Use it in the Codespaces/Docker
Compose environment from this repository.

References:

- Site creation API: `POST /api/items/{parent site ID}/createsite`
  - https://pleasanter.org/en/manual/api-site-create
- Site update API: `POST /api/items/{site ID}/updatesite`
  - https://pleasanter.org/en/manual/api-site-update
- Site retrieval API: `POST /api/items/{site ID}/getsite`
  - https://www.pleasanter.org/manual/api-site-get
- Record bulk upsert API: `POST /api/items/{site ID}/bulkupsert`
  - https://www.pleasanter.org/en/manual/api-record-bulkupsert

The official Pleasanter API documentation notes that site create/update API
operations require an API key and tenant administrator privileges.

## Preconditions

- Pleasanter is running at `http://localhost:50001`.
- Initial setup has created `.devcontainer/pleasanter-api-key`.
- You are working in a local or development environment.
- You know the parent site ID where the new site should be created.
- Do not run this against production.

## 1. Prepare Shell Variables

```bash
PLEASANTER_URL="http://localhost:50001"
API_KEY="$(tr -d '\n' < .devcontainer/pleasanter-api-key)"
PARENT_SITE_ID="1"
```

`PARENT_SITE_ID` is the site under which the new app is created. Change it to a
known development parent site.

## 2. Create The Site

This creates a record table for inquiry management. `EditorColumnHash` controls
which items appear on the editor screen, and `GridColumns` controls the list
screen columns.

```bash
curl -sS \
  -X POST \
  -H "Content-Type: application/json" \
  "${PLEASANTER_URL}/api/items/${PARENT_SITE_ID}/createsite" \
  -d "{
    \"ApiVersion\": 1.1,
    \"ApiKey\": \"${API_KEY}\",
    \"Title\": \"問い合わせ管理\",
    \"ReferenceType\": \"Results\",
    \"ParentId\": ${PARENT_SITE_ID},
    \"InheritPermission\": 1,
    \"SiteSettings\": {
      \"ReferenceType\": \"Results\",
      \"GridColumns\": [
        \"ResultId\",
        \"Title\",
        \"Status\",
        \"ClassA\",
        \"ClassB\",
        \"ClassC\",
        \"DateA\",
        \"UpdatedTime\"
      ],
      \"EditorColumnHash\": {
        \"General\": [
          \"ResultId\",
          \"Ver\",
          \"Title\",
          \"Body\",
          \"Status\",
          \"ClassA\",
          \"ClassB\",
          \"ClassC\",
          \"ClassD\",
          \"DateA\",
          \"DateB\",
          \"DescriptionA\",
          \"DescriptionB\",
          \"Comments\"
        ]
      }
    }
  }"
```

Record the returned site ID as `SITE_ID`.

```bash
SITE_ID="REPLACE_WITH_CREATED_SITE_ID"
```

## 3. Confirm The Created Site

```bash
curl -sS \
  -X POST \
  -H "Content-Type: application/json" \
  "${PLEASANTER_URL}/api/items/${SITE_ID}/getsite" \
  -d "{
    \"ApiVersion\": 1.1,
    \"ApiKey\": \"${API_KEY}\"
  }"
```

Check that:

- `Title` is `問い合わせ管理`
- `ReferenceType` is `Results`
- `SiteSettings.EditorColumnHash.General` contains the expected columns
- `SiteSettings.GridColumns` contains the expected list columns

## 4. Update Site Items If Needed

Use `updatesite` when the first payload needs adjustment. This example adds
`Manager` and `Owner` to the editor and grid after creation.

```bash
curl -sS \
  -X POST \
  -H "Content-Type: application/json" \
  "${PLEASANTER_URL}/api/items/${SITE_ID}/updatesite" \
  -d "{
    \"ApiVersion\": 1.1,
    \"ApiKey\": \"${API_KEY}\",
    \"Title\": \"問い合わせ管理\",
    \"ReferenceType\": \"Results\",
    \"ParentId\": ${PARENT_SITE_ID},
    \"InheritPermission\": 1,
    \"SiteSettings\": {
      \"ReferenceType\": \"Results\",
      \"GridColumns\": [
        \"ResultId\",
        \"Title\",
        \"Status\",
        \"Manager\",
        \"Owner\",
        \"ClassA\",
        \"ClassB\",
        \"ClassC\",
        \"DateA\",
        \"UpdatedTime\"
      ],
      \"EditorColumnHash\": {
        \"General\": [
          \"ResultId\",
          \"Ver\",
          \"Title\",
          \"Body\",
          \"Status\",
          \"Manager\",
          \"Owner\",
          \"ClassA\",
          \"ClassB\",
          \"ClassC\",
          \"ClassD\",
          \"DateA\",
          \"DateB\",
          \"DescriptionA\",
          \"DescriptionB\",
          \"Comments\"
        ]
      }
    }
  }"
```

For richer settings such as labels, choices, notifications, and permissions,
first retrieve or export a known-good site configuration, then update only the
smallest required `SiteSettings` fields. Keep that payload documented before
applying it.

## 5. Seed A Sample Inquiry Record

```bash
curl -sS \
  -X POST \
  -H "Content-Type: application/json" \
  "${PLEASANTER_URL}/api/items/${SITE_ID}/bulkupsert" \
  -d "{
    \"ApiVersion\": 1.1,
    \"ApiKey\": \"${API_KEY}\",
    \"Keys\": [\"ClassD\"],
    \"KeyNotFoundCreate\": true,
    \"Data\": [
      {
        \"Title\": \"ログインできない\",
        \"Body\": \"初期確認用の問い合わせレコードです。\",
        \"ClassHash\": {
          \"ClassA\": \"障害\",
          \"ClassB\": \"高\",
          \"ClassC\": \"未割当\",
          \"ClassD\": \"INQ-0001\"
        },
        \"DateHash\": {
          \"DateA\": \"2026-04-22T09:00:00\",
          \"DateB\": \"2026-04-24\"
        },
        \"DescriptionHash\": {
          \"DescriptionA\": \"再現手順と影響範囲を確認する。\",
          \"DescriptionB\": \"一次回答案を作成する。\"
        }
      }
    ]
  }"
```

## 6. Verification Checklist

- `getsite` returns status code 200.
- The new site appears under the expected parent in Pleasanter UI.
- The editor screen shows the intended columns.
- The list screen shows the intended grid columns.
- The seeded record appears and can be searched by title or `ClassD`.
- No production URL, production site ID, or secret value was printed in a report.

## Reporting Format

```text
Target:
- Environment:
- Parent site ID:
- Created site ID:

API operations:
- createsite:
- getsite:
- updatesite:
- bulkupsert:

Verification:
- UI:
- API:

Remaining work:
- Labels/choices:
- Permissions:
- Notifications:
```
