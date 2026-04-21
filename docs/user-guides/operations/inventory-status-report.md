# Inventory Status Report

This report breaks stock down by operational status so the warehouse can see at a glance what's ready to ship, what's in QC, and what's on the way. Find it at **Inventory > Reporting > Inventory Status**.

## What the Columns Mean

| Column | What it means | Where it comes from |
|--------|--------------|-------------------|
| **SKU** | Product internal reference | Product record |
| **Product** | Product name | Product record |
| **RTS** | Ready to Ship. Stock that's cleared QC and is available to sell or ship. | Sum of quantities in `HOU/Stock` and `Reno/Stock` (includes sub-locations/bins) |
| **Awaiting QC** | Stock that's arrived but hasn't cleared quality check or configuration yet. | Sum of quantities in `HOU/Awaiting QC & Config` and `Reno/Awaiting QC & Config` |
| **Incoming** | Stock expected but not yet received. Open PO receipts and inbound transfers. | Odoo standard field. Based on pending stock moves, not a location. |
| **Outgoing** | Stock allocated to orders but not yet shipped. | Odoo standard field. Based on pending stock moves, not a location. |
| **Total On Hand** | Everything physically in any warehouse location. | Odoo standard field. Sum of all internal location quantities. |

## Default Filter

The report opens with **"Has Stock"** active, hiding products with zero quantity and no pending moves. Remove this filter to see all products.

## Searching and Grouping

- Search by product name or SKU using the search bar
- Group by **Category** to see quantities rolled up by product category

## Changing Columns

The columns on this report are hardcoded to specific warehouse locations. They are not configurable through the Odoo UI. If you need to add a column, change which locations roll up into a column, or rename a column, contact Noah or J2E. This is a code change.
