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

- `customer_id` on `maintenance.equipment` — which customer company owns/hosts this system
- "Systems" tab on the company contact form — reverse view of all systems at that customer


### System → Product mapping

- `product_id` on `maintenance.equipment` — which product variant this system currently is


### System → Subscription mapping

- `subscription_id` on `maintenance.equipment` — which subscription covers this system
- Contract status visibility — is this system under contract, expired, or not covered?
- "Systems" tab on the subscription form — all systems covered by that contract

Subscriptions in Odoo 19 are `sale.order` records with `is_subscription=True` (module: `sale_subscription`). The `subscription_id` field is a Many2one to `sale.order` with a domain filtering to active subscriptions.

**Contract status:** A computed boolean `is_under_contract` checks `subscription_id.subscription_state` for active states (e.g., `3_progress`). A churned or expired subscription means the system is not covered, even if `subscription_id` is still populated. This is what dispatch checks when the phone rings.

**One contract per system.** `subscription_id` is Many2one, not Many2many. If a customer upgrades, the old contract churns and a new one replaces it. Two active contracts on one system would be a data error.

**Renewal re-link:** When a subscription renews and Odoo creates a new `sale.order`, the ops manager must re-link each covered system to the new subscription. This is documented as a step in the contract renewal checklist (see Operations > Contract Management user guide). Missing this step means dispatch sees a covered system as uncovered. At ~20 renewals/year, automation is not justified, but the process step is mandatory.

### Auto-creation from inventory receipt

When a serialized product is received into inventory, the module automatically creates a `maintenance.equipment` record linked to that product variant, with the serial number copied to the equipment's built-in `serial_no` field.

This means systems exist as trackable records from the moment they arrive, before they're sold or assigned to a customer. This is important because Nugget works on systems immediately after receipt (refurbishment, QC, configuration).

**Trigger conditions:**
- Fires on `stock.picking` validation (`button_validate` or `_action_done`)
- Only on incoming pickings (`picking_type_code == 'incoming'`), not internal transfers
- Only for products tracked by serial number (`tracking == 'serial'`)

**Dedup logic:** Before creating, search for an existing system with matching `serial_no`. If found, skip. This handles RMA returns (system already in registry) and cancel/re-validate flows.

**Cancel behavior:** If a receipt is validated then cancelled, the system record is NOT deleted. It may already have service requests linked. Orphaned records are harmless.

**Lifecycle:**

```
Serialized product received into inventory
  → System record auto-created (product_id + serial_no, no customer yet)
    → Refurb, QC, configuration work happens (service requests reference this system)
      → System sold and delivered to customer → customer_id set
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

### Reconfig process

When a system is reconfigured (component swap, upgrade), the `product_id` on the system record must be updated to reflect the new variant.

**In-house reconfigs (MO):** Automated. When a manufacturing order completes and the finished product has a serial number matching an existing system record, the system's `product_id` updates to the new variant automatically. Override on `mrp.production` post-inventory.

**Field service reconfigs:** Manual. When an FSE upgrades a system on-site, the ops manager updates the system record's product variant. No clean automation trigger exists for this case. It happens rarely.

### Serial number uniqueness

The module enforces a unique constraint on `serial_no` via `_sql_constraints`. Two systems cannot share a serial number. This prevents silent data corruption downstream.

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
  ├── customer_id → res.partner (customer)
  ├── subscription_id → sale.order (contract, where is_subscription=True)
  └── is_under_contract → computed boolean (True if subscription_state is active)

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

### Field naming

The base `maintenance.equipment` model already has a `partner_id` field labeled "Vendor" (the equipment supplier). Our customer field is `customer_id` to avoid collision. Do not rename or repurpose the existing `partner_id`.

### System ownership transfer

When a system changes hands (trade-in, resale between customers): update `customer_id` to the new customer, clear `subscription_id` (the contract belongs to the old customer, not the system). Open service requests keep their original customer since they reference the task, not the system's current owner. This will look odd in service history (old customer name on requests for a system now owned by someone else). Cover this in training so the ops team knows it's expected, not a bug.

### Reporting join path

Gross profit by contract requires joining two chains:
- **Revenue:** `sale.order` (subscription) invoices
- **Cost:** `service_request.task_id` > `task.timesheet_ids` (labor) + parts consumed on service requests

The join: `maintenance.request.equipment_id` > `maintenance.equipment.subscription_id` > `sale.order`. Both `equipment_id` and `task_id` are required fields on service requests (enforced in `nugget_service_requests`). Without both links, this report breaks.

### Archive/deactivation

Decommissioned systems can be archived using Odoo's built-in `active` field. Archived systems should not appear in service request dropdowns or the contact's Systems tab.

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
| 10 | Receive a system that was previously returned (same serial exists in registry) | No duplicate created, existing record unchanged |
| 11 | Validate an internal transfer of a serialized product | No system record created (only incoming pickings trigger creation) |

### Contract status

| # | Test | Expected Result |
|---|------|-----------------|
| 12 | System with active subscription | is_under_contract shows True |
| 13 | System with churned/expired subscription | is_under_contract shows False |

### Reconfig

| # | Test | Expected Result |
|---|------|-----------------|
| 14 | Complete an MO that produces a new variant with an existing serial number | System record's product_id updates to the new variant automatically |

### Archive

| # | Test | Expected Result |
|---|------|-----------------|
| 15 | Archive a system, check service request dropdown | Archived system does not appear in dropdown |
| 16 | Archive a system, check contact's Systems tab | Archived system does not appear in the tab |

### Cross-module

| # | Test | Expected Result |
|---|------|-----------------|
| 17 | Create a service request, pick a system | Customer auto-fills from the system's customer_id |

## Cross-Module Dependencies

| Module | Relationship |
|--------|-------------|
| `nugget_service_requests` | Depends on this module. References systems when creating service requests. |
| `maintenance` (Odoo core) | Provides `maintenance.equipment` base model with `serial_no` field. |
| `stock` (Odoo core) | Provides `stock.picking` for auto-creation trigger on receipt. |
| `sale_subscription` or `sale` | Provides subscription model for contract mapping. |
