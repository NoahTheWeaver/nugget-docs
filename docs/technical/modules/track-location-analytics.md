---
title: Track Location Analytics
---

# Track Location Analytics

Links inventory transfers to service requests and tracks analytic distributions on stock moves for flagged warehouse locations. Built by J2E.

## Why This Exists

When parts move through the warehouse (receiving, shipping, consuming on a service call), the cost needs to land on the right analytic account. Standard Odoo tracks analytics on purchase and sale orders, but not on internal transfers or service-related stock moves. This module fills that gap.

It also connects inventory transfers to service requests, so when an FSE consumes parts on a job, the picking is linked back to the maintenance request for traceability.

## How It Works

### Flagging locations for analytics

Any stock location can be flagged with "Is Track Analytics." When a transfer involves a flagged location (source or destination), the analytic distribution field appears on the picking and its move lines.

### Analytic distribution flow

```
User flags a warehouse location as "Is Track Analytics"
  > Transfer created to/from that location
    > Analytic distribution field appears on picking header
      > User sets the distribution (e.g., 100% to Project X)
        > Distribution propagates to individual move lines
          > When picking is validated, distribution posts to journal entry debit lines
```

### Maintenance request linkage

Each stock picking can be linked to a maintenance request (service request). The service request form shows a "Pickings" stat button with a count of linked transfers.

## Key Fields

| Model | Field | Purpose |
|-------|-------|---------|
| `stock.location` | `is_track_analytics` | Enables analytic tracking for moves to/from this location |
| `stock.picking` | `analytic_account` | JSON analytic distribution on the transfer header |
| `stock.picking` | `maintanence_request_id` | Links picking to a service request |
| `stock.move` | `analytic_distribution` | JSON analytic distribution per move line |
| `maintenance.request` | `picking_ids` / `picking_count` | Related transfers and stat button |

## Key Views

- **Stock location form** - "Is Track Analytics" checkbox in Additional Info
- **Stock picking form** - Analytic Account field (visible when location is tracked), Maintenance Request field
- **Stock picking list** - Custom JS "Search Moves" button to filter by analytic account
- **Maintenance request form** - Pickings stat button (truck icon)

## Configuration

1. Go to **Inventory > Configuration > Locations**
2. Open the location you want to track (e.g., HOU/Stock)
3. Check **Is Track Analytics** in the Additional Info section
4. Transfers to/from this location will now show analytic distribution fields

## Test Plan

### Location flag

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Enable "Is Track Analytics" on a stock location | Flag saves on the location record |
| 02 | Create a transfer TO a flagged location | Analytic distribution field appears on the picking |
| 03 | Create a transfer FROM a flagged location | Analytic distribution field appears on the picking |
| 04 | Create a transfer between two unflagged locations | No analytic distribution field visible |

### Analytic distribution

| # | Test | Expected Result |
|---|------|-----------------|
| 05 | Set analytic distribution on picking header | Distribution propagates to all move lines |
| 06 | Edit analytic distribution on an individual move line | Only that line changes, others keep header value |
| 07 | Validate the picking | Journal entry debit lines carry the analytic distribution |
| 08 | Validate picking with no analytic distribution set | Journal entry posts normally, no analytics |

### Maintenance request linkage

| # | Test | Expected Result |
|---|------|-----------------|
| 09 | Link a picking to a service request | Service request field populated on picking |
| 10 | Check stat button on service request | Pickings count shows, clicking opens the list |
| 11 | Create a new picking from the service request stat button | New picking pre-filled with service request link |

### Search functionality

| # | Test | Expected Result |
|---|------|-----------------|
| 12 | Click "Search Moves" on picking list, select an analytic account | List filters to pickings containing moves with that account |

### Cascade delete

| # | Test | Expected Result |
|---|------|-----------------|
| 13 | Delete a service request that has linked pickings | Pickings should NOT be deleted (currently they are, see Known Issues) |

## Known Issues

1. **Typo in field name.** `maintanence_request_id` is misspelled in J2E's code. Don't rename it (would break the database column). Just know it's "maintanence" not "maintenance" when referencing in code.

2. **Cascade delete risk.** The `maintanence_request_id` field uses `ondelete='cascade'`. If a service request is deleted, all linked pickings get deleted. That's inventory data gone. Should be `ondelete='set null'`. Fix before launch.

## Cross-Module Dependencies

| Module | Relationship |
|--------|-------------|
| `nugget_service_requests` | Service requests that pickings link to |
| `account_accountant` (Odoo) | GL posting of analytic distributions |
| `stock` (Odoo) | Inventory transfers and move lines |
| `maintenance` (Odoo) | Maintenance request model |
