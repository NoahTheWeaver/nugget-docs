---
title: Component Inventory
---

# Component Inventory

Tracks BOM components across two states: standalone (the component itself in stock) and mounted (inside parent assemblies in stock). Answers the question: "How many of this component do we actually have, including the ones inside built systems?"

## Why this exists

Standard Odoo inventory shows how many of a component you have on the shelf, but doesn't account for components already assembled into parent products. If you have 5 standalone pumps and 10 STAR systems each containing a pump, you actually have 15 pumps — but Odoo only shows 5. This module bridges that gap.

## How it works

The module creates a read-only report model (`component.inventory`) backed by a dynamic SQL query, not a real database table. The query:

1. Finds all components referenced in BOMs (`mrp.bom.line`)
2. For each component, calculates standalone quantities (the component itself in stock)
3. For each component, finds parent assemblies that contain it and calculates mounted quantities
4. Breaks both down by location status (RTS, QC, Incoming, Outgoing)
5. Sums to a total on-hand across all states

### Location matching

::: warning Location Names Must Match
This module uses SQL pattern matching (`%/Stock%`, `%Awaiting QC%`) to identify RTS and QC locations. These patterns must stay in sync with the hardcoded location names in `nugget_inventory_status`.
:::

### Drill-down actions

Each row has "View" buttons that open the underlying `stock.quant` records:
- **View Standalone** — shows quants for the component product at relevant locations
- **View Mounted** — shows quants for parent assemblies containing the component

## Key Views

- **Component Inventory list** — Inventory > Reporting > Component Inventory
  - Columns grouped into Standalone (RTS, QC, In, Out) and Mounted (RTS, QC, In, Out) sections
  - Total On Hand column summing all states
  - Default filter: "Has Inventory" (total > 0)
  - Additional filters: "Has Standalone", "Has Mounted"

## Configuration

No settings required. The report auto-discovers components from existing BOMs. To see data, you need:
- Products with BOMs defined (Manufacturing > Bills of Materials)
- Stock in the expected warehouse locations

## Test Plan

### Report accuracy

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Open Inventory > Reporting > Component Inventory | Report loads with component list |
| 02 | Check a component with standalone stock | Standalone RTS column shows correct quantity |
| 03 | Check a component mounted in an assembly that's in stock | Mounted RTS column shows correct quantity |
| 04 | Verify Total On Hand = standalone + mounted | Math checks out |

### Drill-down

| # | Test | Expected Result |
|---|------|-----------------|
| 05 | Click "View" on standalone column | Opens stock quants for the component |
| 06 | Click "View" on mounted column | Opens stock quants for parent assemblies |

### Filters

| # | Test | Expected Result |
|---|------|-----------------|
| 07 | "Has Inventory" filter (default) | Only components with stock appear |
| 08 | "Has Mounted" filter | Only components inside assemblies appear |
| 09 | Component with no BOM | Does not appear in report |

## Cross-Module Dependencies

- **`nugget_inventory_status`** — shares location-based quantity logic. Location name changes must be synchronized between both modules.
- **`nugget_variant_name`** — uses `variant_name` field in the SQL query for display names.
- **`mrp`** (Odoo core) — provides BOM data that drives the component discovery.
