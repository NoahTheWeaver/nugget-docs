---
title: Purchase Configurator
---

# Purchase Configurator

Adds product template selection and variant configuration to Purchase Orders and inventory receiving (Stock Picks), mirroring the sales order configurator pattern.

## Why this exists

Nugget purchases Hamilton STAR systems with configurable options (deck size, pipetting channels, accessories). Standard Odoo purchase lines require selecting a specific product variant from a flat list — unusable when a product has dozens of variants. This module lets users select a product template first, then configure the specific variant using a visual configurator dialog.

## How it works

### The configuration flow

1. User opens a Purchase Order or Stock Picking form
2. On the order line, selects a **product template** (not a variant)
3. If the template has one variant → auto-selected silently
4. If the template has multiple variants → configurator dialog opens
5. User selects attribute values (e.g., deck size, channel count)
6. Dialog returns the matching variant as the line's product
7. Pencil icon appears on configured lines for re-configuration

### What's different from sales configurator

- **No pricing display** — purchase pricing comes from vendor pricelists, not the configurator
- **No optional products** — cross-sell is a sales concept
- **Works on Stock Picks** — not just POs, so you can configure during receiving too

::: warning JS Components
This module includes OWL 2 JavaScript components that extend the sale module's configurator dialog. Check the browser console for errors after Odoo upgrades.
:::

## Key Views

- **Purchase Order form** — product template field replaces product field on order lines, with pencil icon for re-configuration
- **Stock Picking form** — same template selector on move lines for receiving

## Configuration

No settings required. The configurator appears automatically for products that have configurable attributes. To make a product configurable, set up product attributes and values on the product template under the "Attributes & Variants" tab.

## Test Plan

### Basic configuration

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Create a PO, select a product template with multiple variants | Configurator dialog opens |
| 02 | Select attribute values and confirm | Correct variant appears on the PO line |
| 03 | Click pencil icon on a configured line | Configurator reopens with current selection |
| 04 | Change configuration and confirm | PO line updates to new variant |

### Single variant

| # | Test | Expected Result |
|---|------|-----------------|
| 05 | Select a template with only one variant | Variant auto-selected, no dialog |
| 06 | Select a template with no configurable attributes | Product set directly, no dialog |

### Stock picking

| # | Test | Expected Result |
|---|------|-----------------|
| 07 | Create a receipt (incoming shipment), select a configurable template | Configurator dialog opens |
| 08 | Configure and confirm | Correct variant on the move line |

### Edge cases

| # | Test | Expected Result |
|---|------|-----------------|
| 09 | Favorite products appear first in dropdown | Products marked as favorites sort to top |
| 10 | Non-purchasable products excluded from PO template dropdown | Only `purchase_ok = True` products appear |

## Cross-Module Dependencies

- **`sale`** (Odoo core) — provides the product configurator dialog assets that this module extends.
- **`purchase`** (Odoo core) — provides the purchase order model and views.
- **`stock`** (Odoo core) — provides stock picking views where the configurator is also injected.
