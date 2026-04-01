# Technical Documentation

Internal reference for developers and system administrators. Built by humans, watched over by machines of loving grace.

## Custom Modules

| Module | Technical Name | Description |
|--------|---------------|-------------|
| [Service Requests](./modules/service-requests) | `nugget_service_requests` | Renames Maintenance to Service; adds service task flag |
| [Task Analytics](./modules/task-analytics) | `nugget_task_analytics` | Per-task analytic accounts for cost tracking |
| [Timesheet Posting](./modules/timesheet-posting) | `account_timesheet_posting` | Converts timesheets to journal entries (J2E) |
| [Per Diem Tracking](./modules/per-diem) | `nugget_per_diem` | Auto-computes per diem from timesheets; posts to GL |
| [Purchase Configurator](./modules/purchase-configurator) | `nugget_purchase_configurator` | Hamilton STAR product configurator for POs |
| [Inventory Status](./modules/inventory-status) | `nugget_inventory_status` | Stock report by status: On Hand, QC, Incoming, Outgoing |
| [Component Inventory](./modules/component-inventory) | `nugget_component_inventory` | Tracks components standalone vs mounted in assemblies |
| [Variant Name](./modules/variant-name) | `nugget_variant_name` | Custom display names for product variants |
| [Track Location Analytics](./modules/track-location-analytics) | `track_location_analytics` | Inventory location tracking on stock moves (J2E) |
| [Maintenance Checklist](./modules/maintenance-checklist) | `maintenance_checklist_report` | Maintenance worksheet report with checklists (J2E) |
| [Google Sheet Integration](./modules/google-sheet-integration) | `google_sheet_integration` | Google Sheets sync for service requests (J2E) |


### Module Documentation Structure

Every module doc follows this pattern:

1. **Title + metadata** — Technical name, dependencies, author, one-paragraph summary
2. **Why this exists** — The business problem. 2-3 sentences.
3. **How it works** — Technical detail, diagrams, override methods. Module-specific depth lives here.
4. **Key Views** — Where to find it in the UI (menu paths, field locations)
5. **Configuration** — Settings table, or "No configuration required"
6. **Test Plan** — Grouped tables with test cases
7. **Cross-Module Dependencies** — What this module reads from or writes to

Some modules have additional sections specific to their domain (e.g., "Business Rules" for per diem thresholds, "What happens when no analytic is set" for task analytics). These go between "How it works" and "Key Views."

For changelogs, see git history: [`Nugget-ERP`](https://github.com/NoahTheWeaver/Nugget-ERP) for code changes, [`nugget-docs`](https://github.com/NoahTheWeaver/nugget-docs) for documentation changes.

### Module Design Principles

- **One module = one business capability.** If you can't explain it in one sentence without "and," it's probably two modules.
- **Minimal customization.** Always propose standard Odoo solutions first.
- **Dependencies flow one direction.** If module B depends on A, module A should never need to know B exists.
- **Separate cosmetic from behavioral.** Terminology changes and business logic changes have different risk profiles.

## Developer Guides

- [Dev Environment Setup](./dev-setup) — Local Odoo 19 dev environment on macOS
- [Odoo Docs Tile](./odoo-docs-tile) — Add a Documentation app to the Odoo home screen
