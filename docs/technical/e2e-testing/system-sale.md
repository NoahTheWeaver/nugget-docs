---
title: "E2E: System Sale"
---

# System Sale

**Charter process:** Outreach from client to install report sent.

**Scenario:** A client buys a Hamilton STAR. We quote, take a deposit, ship, install, send the report, and close with the final invoice.

## Phase 1: Quote

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 1 | Sales | Create opportunity in CRM | |
| 2 | Sales | Create a quote (sales order). Select the STAR product template. Odoo's standard sales configurator opens for variant selection. | |
| 3 | Warehouse Sup | Check Inventory Status Report for RTS availability | |
| 4 | Sales | Send quote to client | |

Note: the purchase configurator (nugget_purchase_configurator) is for Purchase Orders. Sales orders use Odoo's built-in product configurator.

## Phase 2: Deposit and Confirmation

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 5 | Sales | Confirm the sales order | |
| 6 | Accounting | Create a down payment invoice from the SO (Sales Order > Create Invoice > Down Payment) | |
| 7 | Accounting | Record the deposit payment | |

## Phase 3: System Prep

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 8 | PM | Create task in the Installs project, assign FSE | |
| 9 | PM | Schedule on Gantt, move to Tentatively Scheduled | |
| 10 | Warehouse Sup | Is there an RTS unit with the right config? | |
| 11a | (If no/wrong config) | Create refurb task. If MO reconfig needed, verify system record product_id updates after MO completes. | |
| 11b | (If RTS) | Proceed to shipping | |

## Phase 4: Scheduling

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 12 | PM | Confirm with client, move task to Confirmed with Client | |
| 13 | PM | Book travel, move task to Travel Booked | |
| 14 | | Verify: Gantt icons update at each stage change | |

## Phase 5: Ship and Install

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 15 | Warehouse | Create delivery order from the SO, ship system | |
| 16 | Warehouse | Validate the delivery (outgoing picking) | |
| 17 | Ops | Update the system record: set customer_id to the client | |
| 18 | FSE | Install on site, move task to In Progress | |
| 19 | FSE | Log time on the task (timesheets) | |
| 20 | FSE | Mark task Completed - Awaiting Closeout | |

Step 17 is manual and critical. If customer_id isn't set, the system won't show on the client's contact form and dispatch won't find it later.

## Phase 6: Closeout

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 21 | FSE | Send install report to client | |
| 22 | Accounting | If service contract sold: create subscription, link system to it | |
| 23 | FSE | Set next service date (first PM) | |
| 24 | Accounting | Create final invoice from the SO (remaining balance) | |
| 25 | PM | Close the task | |

## What to Watch For

- Sales configurator (not purchase configurator) for system config on quotes
- Inventory Status Report accuracy for RTS check
- System record customer_id must be set manually after delivery
- Two-part invoicing: down payment first, final balance after install
- Per diem calculates correctly for install trip
- If a subscription is created, system shows is_under_contract = True
- Gantt tracks the install through all scheduling stages with correct project color
