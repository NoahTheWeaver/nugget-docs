# Google Sheet Integration

Creates pre-filled spreadsheets from templates for maintenance requests. Completed spreadsheets are saved as XLSX attachments and posted to the maintenance request's chatter.

## How It Works

1. Configure spreadsheet templates under **Maintenance > Configuration > Google Sheets > Sheet Templates**
2. On a maintenance request, click **Spreadsheet Report** in the header
3. Select a template from the wizard — the module creates a new spreadsheet from the template
4. Placeholders in the template are automatically replaced with request data
5. When the spreadsheet is downloaded as XLSX, it is attached to the maintenance request and posted to the chatter

## Template Placeholders

| Placeholder | Replaced With |
|-------------|---------------|
| `{{maintenance_name}}` | Maintenance request name |
| `{{technician}}` | Assigned technician |
| `{{employee}}` | Request creator |
| `{{equipment}}` | Equipment name |
| `{{date}}` | Current date |

## Key Views

- **Sheet Templates list** — Maintenance > Configuration > Google Sheets > Sheet Templates
- **Maintenance request form** — "Spreadsheet Report" header button
- **Template selector wizard** — Modal to pick a spreadsheet template
