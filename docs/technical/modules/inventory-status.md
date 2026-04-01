---
title: Inventory Status
---

# Inventory Status

Daily operations report showing product quantities segmented by inventory state: Ready to Ship, Awaiting QC, Incoming, and Outgoing.

## Why this exists

Standard Odoo stock reports show total on-hand quantity but don't break it down by operational status. Warehouse staff need to know at a glance: what's ready to ship, what's stuck in QC, and what's coming in or going out. This report provides that single-screen view.

## How it works

The module adds two computed fields to `product.product`:

- `qty_ready_to_ship` — total quantity across Ready to Ship locations
- `qty_awaiting_qc` — total quantity across QC locations

These are computed by querying `stock.quant` records at specific warehouse locations.

### Hardcoded locations

::: warning Location Names Are Hardcoded
The module uses specific location names to identify RTS and QC areas. If these locations are renamed in Inventory > Configuration > Locations, the report will break.
:::

| Status | Locations |
|--------|-----------|
| Ready to Ship | `HOU/Stock`, `Reno/Stock` (includes child locations/bins) |
| Awaiting QC | `HOU/Awaiting QC & Config`, `Reno/Awaiting QC & Config` (leaf locations only) |

Incoming and Outgoing quantities use Odoo's standard `incoming_qty` and `outgoing_qty` fields.

## Key Views

- **Inventory Status list** — Inventory > Reporting > Inventory Status
  - Columns: SKU, Product Name, RTS, Awaiting QC (optional), Incoming, Outgoing, Total On Hand
  - Default filter: "Has Stock" (products with any quantity or pending moves)
  - Sortable by SKU
  - Searchable by product name/SKU, groupable by product category

## Configuration

No settings required. The report works as soon as the module is installed, provided the expected warehouse locations exist.

## Test Plan

### Report accuracy

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Open Inventory > Reporting > Inventory Status | Report loads with product list |
| 02 | Check a product with stock in HOU/Stock | RTS column shows correct quantity |
| 03 | Check a product with stock in Awaiting QC location | QC column shows correct quantity |
| 04 | Check a product with pending incoming transfer | Incoming column shows expected quantity |
| 05 | Check a product with pending outgoing transfer | Outgoing column shows expected quantity |
| 06 | Verify "Has Stock" filter excludes zero-stock products | Only products with activity appear |

### Edge cases

| # | Test | Expected Result |
|---|------|-----------------|
| 07 | Product with stock in both HOU and Reno | RTS sums across both warehouses |
| 08 | Product with no stock anywhere | Does not appear with "Has Stock" filter on |

## Cross-Module Dependencies

- **`nugget_component_inventory`** — depends on this module and mirrors its location logic. Location name changes must be synchronized.
