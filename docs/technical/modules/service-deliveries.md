---
title: Service Deliveries
---

# Service Deliveries

Links delivery orders to project tasks, in both directions: a **Task** field on outgoing delivery orders, and a **Deliveries** stat button on the task. Module: `nugget_service_deliveries`.

## Why This Exists

Field work is anchored on the task. Parts, loaners, and replacement systems ship as delivery orders. Before v2, the only association between the two was J2E's Maintenance Request field on the picking, which nobody used (zero linked pickings on production as of July 2026), so answering "did the part for this job ship?" meant leaving the task and hunting through Inventory.

The direct link makes the task the single source: work, tickets (via `nugget_helpdesk_task`), and now deliveries all hang off it. Helpdesk tickets deliberately get no delivery field of their own, since a ticket already links to its task.

## How It Works

### The direct link

`stock.picking.nugget_task_id` is a plain many2one to `project.task`, shown on the delivery form for **outgoing pickings only** (receipts and internal transfers don't get the field, deliberately, to keep custom-module footprint on the shared picking form small). It is editable in every state, including done: linking a task is bookkeeping, not a stock operation, and backfilling a shipped delivery is legitimate. Changes are tracked in chatter.

The picker displays tasks as `T-00042 Task Name` and finds them by reference or name. The T-##### rendering comes from `nugget_task_ref` (v1.3+), gated on the `nugget_ref_display` context key so it only appears where a view opts in, not in every breadcrumb.

### The rollup on the task

`delivery_order_ids` on the task is the union of two paths:

```
direct:  stock.picking.nugget_task_id ──────────────────────► project.task
legacy:  stock.picking ─► maintenance.request ─► task
         (track_location_analytics)   (nugget_service_requests)
```

The legacy two-hop path is still honored because the service request form's own Pickings button can still create links through it. The Maintenance Request field on the delivery form itself is hidden as of v2 (hidden, not removed: `track_location_analytics` owns the field and its data).

The rollup is computed and non-stored on purpose. The stat button reads it one record at a time, and storing it would chain invalidations through stock for what is a passive count.

## Key Fields

| Model | Field | Purpose |
|-------|-------|---------|
| `stock.picking` | `nugget_task_id` | Direct link to the task (outgoing forms only, tracked) |
| `project.task` | `direct_delivery_ids` | One2many inverse of the direct link |
| `project.task` | `delivery_order_ids` / `delivery_order_count` | Computed union of direct + legacy paths, drives the stat button |

## Key Views

- **Delivery order form** - Task field where the Maintenance Request field used to sit (that field is now hidden)
- **Pickings list search** - Task is searchable and groupable; typing a T-##### in the search box works
- **Task form** - Deliveries stat button (truck icon), hidden when the count is zero; opens the form directly when there is exactly one delivery

## Test Plan

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Open an outgoing delivery order | Task field visible; Maintenance Request field gone |
| 02 | Open a receipt or internal transfer | No Task field |
| 03 | Type a T-##### reference in the Task picker | Matching task found, shown as "T-##### Task Name" |
| 04 | Type part of a task name in the picker | Matching tasks found, each prefixed with its reference |
| 05 | Link a delivery, open the task | Deliveries button shows count 1; clicking opens the delivery form |
| 06 | Link a second delivery to the same task | Button count 2; clicking opens a list of both |
| 07 | Link a picking to the task via a service request's Pickings button | Legacy-path delivery also counted on the task's button |
| 08 | Open a task with no linked deliveries | No Deliveries button |
| 09 | Edit the Task field on a done delivery | Allowed; change logged in chatter |
| 10 | Open a task elsewhere (kanban, breadcrumb, other pickers) | No T-##### prefix leaking outside the opted-in picker |

## Cross-Module Dependencies

| Module | Relationship |
|--------|-------------|
| `nugget_task_ref` | T-##### display and search in the task picker |
| `nugget_service_requests` | Legacy task ↔ service request hop |
| `track_location_analytics` (J2E) | Legacy service request ↔ picking hop; owns the hidden Maintenance Request field and the picking view this module inherits |

## History

v1 (May 2026) was a read-only bridge that rolled the legacy two-hop path up onto the task. v2 (July 2026) added the direct Task field and hid the unused Maintenance Request field from the delivery form.
