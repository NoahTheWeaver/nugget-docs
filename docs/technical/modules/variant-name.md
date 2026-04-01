---
title: Variant Name
---

# Variant Name

Adds a custom display name field to product variants, replacing Odoo's default attribute-based naming with human-readable names.

## Why this exists

Odoo names product variants by appending attribute values to the template name: "Hamilton STAR (96-Channel, Large Deck)". For Nugget's product catalog, these auto-generated names are often too long, too technical, or don't match how the team refers to products. This module lets each variant have its own clean display name.

## How it works

Adds a `variant_name` field to `product.product`. The `display_name` computation is overridden:

- If `variant_name` is set → display name is the variant name (replaces template name entirely)
- If `variant_name` is blank → display name is the template name (no attribute suffix)

The internal reference (SKU) is not included in the display name.

### CSV import/export

The `variant_name` field supports standard Odoo CSV import/export for bulk updates.

## Key Views

- **Product variant form** — `variant_name` field after SKU, placeholder: "Leave blank to use template name"
- **Product variant quick-edit modal** — same field in the simplified edit view
- **Product variant list** — `display_name` column replaces default `name` column (with text-wrap)

## Configuration

No configuration required. Just edit the `variant_name` field on any product variant.

## Test Plan

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Set variant_name on a product variant | Display name shows the custom name everywhere |
| 02 | Clear variant_name on a product variant | Display name falls back to template name |
| 03 | Check display in PO line, SO line, inventory move | Custom name renders correctly in all contexts |
| 04 | Check display in product list view | Custom name with text-wrap rendering |
| 05 | Export products to CSV | variant_name column included |
| 06 | Import CSV with variant_name values | Names update correctly |

## Cross-Module Dependencies

- **`nugget_component_inventory`** — uses `variant_name` in its SQL query to display component names in the report.
