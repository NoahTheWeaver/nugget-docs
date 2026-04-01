---
title: System Registry
---

# System Registry

Owns the identity and ownership of customer systems (instruments). Maps systems to customers and to subscriptions so we can answer two questions: "what systems does this customer have?" and "which of those systems are under contract?"

## Why This Exists

A system (instrument) is a first-class concept at Nugget. It exists independently of any service request, sale, or subscription. Multiple parts of the business need to reference systems:

- **Service** needs to know which system a request is about
- **Sales** needs to know what systems a customer has when quoting
- **Contracts** need to know which systems are covered
- **Operations** needs to see all systems at a customer site for scheduling

## What It Owns

### System → Customer mapping

- `partner_id` on `maintenance.equipment` — which customer company owns/hosts this system
- "Systems" tab on the company contact form — reverse view of all systems at that customer


### System → Product mapping

- `product_id` on `maintenance.equipment` — which product variant this system currently is


### System → Subscription mapping

- `subscription_id` on `maintenance.equipment` — which subscription covers this system
- Contract status visibility — is this system under contract, expired, or not covered?
- "Systems" tab on the subscription form — all systems covered by that contract

Subscriptions in Odoo 19 are `sale.order` records with `is_subscription=True` (module: `sale_subscription`). The `subscription_id` field is a Many2one to `sale.order` with a domain filtering to subscriptions only.

### Auto-creation from inventory receipt

When a serialized product is received into inventory (`stock.picking` confirmed), the module automatically creates a `maintenance.equipment` record linked to that product variant, with the serial number copied to the equipment's built-in `serial_no` field.

This means systems exist as trackable records from the moment they arrive — before they're sold, before they're assigned to a customer. This is important because Nugget works on systems immediately after receipt (refurbishment, QC, configuration).

**Lifecycle:**

```
Serialized product received into inventory
  → System record auto-created (product_id + serial_no, no customer yet)
    → Refurb, QC, configuration work happens (service requests reference this system)
      → System sold and delivered to customer → partner_id set
        → Service contract sold → subscription_id set
```

## Why Systems Are Not Linked to Lots

::: danger Design Decision — Read This Before Suggesting Changes
We evaluated linking `maintenance.equipment` to `stock.lot` for full inventory traceability. We decided against it. Here's why:

**The core problem:** A system's product variant changes when its configuration changes. You buy a STAR with an 8-channel head, then upgrade it to a 96-channel head (via MO or field service). Odoo does not allow changing the product on a lot — you get: *"You are not allowed to change the product linked to a serial or lot number if some stock moves have already been created."*

This means every reconfig creates a new lot. The system record would need to chase lot changes, and the old lot's financial history disconnects from the new lot. The "traceability" you wanted is broken anyway.

**What a lot actually represents:** A lot is the thing we *sold* — a specific SKU at a specific cost, tracked through inventory. Once the system ships to a customer, the lot sits in a virtual customer location and never moves again (unless RMA). It's an inventory concept, not a service concept.

**What a system actually represents:** A persistent physical machine that gets reconfigured, serviced, and moved between customers over its lifetime. Its identity is the serial number stamped on the chassis, not an Odoo lot record.

**The right model:**
- `serial_no` (text, on `maintenance.equipment`) = the physical identity. Never changes.
- `product_id` (Many2one) = the *current* variant/configuration. Changes on reconfig.
- `stock.lot` = a financial record that exists in the inventory world. Not linked to the system record.

If you need to answer "what did we sell to Acme?" — look at the sale order and delivery. If you need to answer "what system does Acme have and what's its current config?" — look at the system registry. They're different questions answered by different records.
:::

## What It Does NOT Own

- **Service requests** — `nugget_service_requests` owns the link between tasks and requests. It references systems but doesn't define them.
- **Service terminology** — "Systems" vs "Equipment" relabeling stays in `nugget_service_requests` since it's part of the broader Maintenance → Service rebrand.
- **Inventory/BOMs** — System components and stock levels are handled by `nugget_component_inventory`.
- **Lot/serial traceability** — Inventory lot records are managed by Odoo's stock module. See "Why Systems Are Not Linked to Lots" above.

## Data Model

```
maintenance.equipment (System)
  ├── serial_no → built-in Odoo field (the physical label, never changes)
  ├── product_id → product.product (current variant/configuration)
  ├── partner_id → res.partner (customer)
  └── subscription_id → sale.order (contract, where is_subscription=True)

res.partner (Customer)
  └── equipment_ids ← One2many (Systems at this customer)

sale.order (Subscription)
  └── equipment_ids ← One2many (Systems covered by this contract)
```

## Key Views

- **System form** — Customer, Product, and Subscription fields
- **System list** — Optional columns for customer, product, contract status
- **Contact form** — "Systems" tab (companies only)
- **Subscription form** — "Systems" tab showing covered equipment

## Configuration

No settings required. Fields and views apply on install.

## Test Plan

### System → Customer

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Create a system, assign a customer | Customer saved on system record |
| 02 | Open the customer's contact, check Systems tab | System appears in the list |
| 03 | Assign a product variant to the system | Product saved on system record |

### System → Subscription

| # | Test | Expected Result |
|---|------|-----------------|
| 04 | Create a subscription, link a system to it | System shows subscription on its form |
| 05 | Open the subscription, check Systems tab | System appears in the covered list |
| 06 | Check a system with no subscription | Subscription field is blank, no errors |

### Blank state

| # | Test | Expected Result |
|---|------|-----------------|
| 07 | Create a system with no customer and no subscription | Record saves, no errors, both fields blank |

### Auto-creation from receipt

| # | Test | Expected Result |
|---|------|-----------------|
| 08 | Receive a serialized product into inventory | System record auto-created with product, serial number, no customer |
| 09 | Receive a non-serialized product | No system record created |

### Cross-module

| # | Test | Expected Result |
|---|------|-----------------|
| 10 | Create a service request, pick a system | Customer auto-fills from the system's partner_id |

## Cross-Module Dependencies

| Module | Relationship |
|--------|-------------|
| `nugget_service_requests` | Depends on this module. References systems when creating service requests. |
| `maintenance` (Odoo core) | Provides `maintenance.equipment` base model with `serial_no` field. |
| `stock` (Odoo core) | Provides `stock.picking` for auto-creation trigger on receipt. |
| `sale_subscription` or `sale` | Provides subscription model for contract mapping. |
