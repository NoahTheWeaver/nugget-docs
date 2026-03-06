# Technical Documentation

Internal reference for developers and system administrators.

## Custom Modules

| Module | Technical Name | Risk | Status |
|--------|---------------|------|--------|
| [Variant Name](./modules/variant-name) | `nugget_variant_name` | Low | Active |
| [Inventory Status](./modules/inventory-status) | `nugget_inventory_status` | Low | Active |
| [Task Analytics](./modules/task-analytics) | `nugget_task_analytics` | Low | Active |
| [Component Inventory](./modules/component-inventory) | `nugget_component_inventory` | Low-Med | Active |
| [Purchase Configurator](./modules/purchase-configurator) | `nugget_purchase_configurator` | Med | Active |
| [Service Requests](./modules/service-requests) | `nugget_service_requests` | Med | Active |
| [Per Diem Tracking](./modules/per-diem) | `nugget_per_diem` | High | Active |
| [Track Location Analytics](./modules/track-location-analytics) | `track_location_analytics` | Med-High | Active |
| [Timesheet Posting](./modules/timesheet-posting) | `account_timesheet_posting` | High | Active |
| [Maintenance Checklist](./modules/maintenance-checklist) | `maintenance_checklist_report` | Med | Active |
| [Google Sheet Integration](./modules/google-sheet-integration) | `google_sheet_integration` | Med | Active |
| [Trip Management](./modules/trip-management) | `trip_management` | Low-Med | Active |

### Module Design Principles

- **One module = one business capability.** If you can't explain it in one sentence without "and," it's probably two modules.
- **Minimal customization.** Always propose standard Odoo solutions first.
- **Dependencies flow one direction.** If module B depends on A, module A should never need to know B exists.
- **Separate cosmetic from behavioral.** Terminology changes and business logic changes have different risk profiles.

## Developer Guides

- [Dev Environment Setup](./dev-setup) — Local Odoo 19 dev environment on macOS
- [Odoo Docs Tile](./odoo-docs-tile) — Add a Documentation app to the Odoo home screen
