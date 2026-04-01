# Track Location Analytics

**Technical name:** `track_location_analytics`\
**Depends on:** `base`, `sale_management`, `stock_delivery`, `analytic`, `purchase`, `account_accountant`, `maintenance`\
**Author:** J2 Enterprise Resource Partners

Links stock pickings (inventory transfers) to maintenance requests and adds analytic distribution tracking on inventory moves for flagged warehouse locations.

## What It Does

- Adds an **Is Track Analytics** flag on stock locations. When enabled, any transfer to/from that location shows an analytic distribution field on the picking and its move lines.
- Analytic distributions are propagated from the picking header to individual move lines via onchange, and applied to the debit side of journal entries when stock moves are posted.
- Adds a **Pickings** stat button on maintenance requests showing all linked inventory transfers.

## Key Fields

| Model | Field | Purpose |
|-------|-------|---------|
| `stock.location` | `is_track_analytics` | Enables analytic tracking for moves to/from this location |
| `stock.picking` | `analytic_account` | JSON analytic distribution on the transfer |
| `stock.picking` | `maintanence_request_id` | Links picking to a maintenance request |
| `stock.move` | `analytic_distribution` | JSON analytic distribution per move line |
| `maintenance.request` | `picking_ids` / `picking_count` | Related transfers and stat button |

## Key Views

- **Stock location form** — "Is Track Analytics" checkbox in Additional Info
- **Stock picking form** — Analytic Account field (visible when location is tracked), Maintenance Request field
- **Stock picking list** — Custom search via JS component
- **Maintenance request form** — Pickings stat button
