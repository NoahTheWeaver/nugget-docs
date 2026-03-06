# Custom Modules

All custom modules follow the `nugget_<feature>` naming convention to distinguish them from standard Odoo modules. Contractor-built modules use descriptive names without the prefix.

## Nugget Modules

| Module | Technical Name | Risk | Status |
|--------|---------------|------|--------|
| [Variant Name](./variant-name) | `nugget_variant_name` | Low | Active |
| [Inventory Status](./inventory-status) | `nugget_inventory_status` | Low | Active |
| [Task Analytics](./task-analytics) | `nugget_task_analytics` | Low | Active |
| [Component Inventory](./component-inventory) | `nugget_component_inventory` | Low-Med | Active |
| [Purchase Configurator](./purchase-configurator) | `nugget_purchase_configurator` | Med | Active |
| [Service Requests](./service-requests) | `nugget_service_requests` | Med | Active |
| [Per Diem Tracking](./per-diem) | `nugget_per_diem` | High | Active |

## Contractor Modules

| Module | Technical Name | Risk | Status |
|--------|---------------|------|--------|
| [Track Location Analytics](./track-location-analytics) | `track_location_analytics` | Med-High | Active |
| [Timesheet Posting](./timesheet-posting) | `account_timesheet_posting` | High | Active |
| [Maintenance Checklist](./maintenance-checklist) | `maintenance_checklist_report` | Med | Active |
| [Google Sheet Integration](./google-sheet-integration) | `google_sheet_integration` | Med | Active |
| [Trip Management](./trip-management) | `trip_management` | Low-Med | Active |

## Module Design Principles

- **One module = one business capability.** If you can't explain it in one sentence without "and," it's probably two modules.
- **Minimal customization.** Always propose standard Odoo solutions first.
- **Dependencies flow one direction.** If module B depends on A, module A should never need to know B exists.
- **Separate cosmetic from behavioral.** Terminology changes and business logic changes have different risk profiles.
