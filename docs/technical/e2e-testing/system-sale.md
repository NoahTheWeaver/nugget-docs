---
title: "E2E: System Sale"
---

# System Sale

**Charter process:** Outreach from client to install report sent.

**Scenario:** A client wants to buy a Hamilton STAR. We quote it, take a deposit, prep and ship the system, install it at the client site, send the install report, and close with the final invoice.

## Phase 1: Quote and Feasibility

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 1 | Sales | Create opportunity in CRM | |
| 2 | Sales | Create a quote (sales order) with the STAR configured via purchase configurator | |
| 3 | Warehouse Sup | Confirm system availability (check Inventory Status Report) | |
| 4 | PM + Accounting | Mini kickoff: feasibility check | |
| 5 | Sales | Send quote to client | |

## Phase 2: PO and First Invoice

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 6 | Client | Approves quote | |
| 7 | Sales | Confirm the sales order | |
| 8 | Accounting | Send Invoice 1 of 2 (deposit) | |
| 9 | Accounting | Record deposit payment | |

## Phase 3: Internal Kickoff and System Prep

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 10 | PM | Create project task for the install (Installs project) | |
| 11 | PM | Schedule on Gantt view, assign FSE | |
| 12 | Warehouse Sup | Check: is there an RTS unit? | |
| 13a | (If no RTS) Warehouse Sup | Create refurb task in Refurb & QC project | |
| 13b | (If wrong config) FSE | Reconfig via MO, system record product_id updates | |
| 14 | Warehouse Assoc | Prep system for shipping | |

**Key check:** If a reconfig MO runs, does the system record's product_id update automatically?

## Phase 4: Client Kickoff and Scheduling

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 15 | PM | Hold client kickoff, document in task notes | |
| 16 | FSE | Confirm availability | |
| 17 | PM | Move task to Confirmed with Client on Gantt | |
| 18 | PM | Book travel, move task to Travel Booked | |

**Key check:** Do the Gantt stage icons update correctly?

## Phase 5: Ship and Install

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 19 | Warehouse Assoc | Create delivery order, ship system | |
| 20 | Warehouse Assoc | Validate delivery (outgoing picking) | |
| 21 | FSE | Install on site, move task to In Progress | |
| 22 | FSE | Log time on the task (timesheets) | |
| 23 | FSE | Mark task Completed - Awaiting Closeout | |

**Key check:** After delivery, update system record's customer_id to the client.

## Phase 6: Post-Install and Financial Close

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 24 | FSE | Send install report to client | |
| 25 | Accounting | Set contract start date (if service contract sold) | |
| 26 | FSE | Set next service date (first PM) | |
| 27 | Accounting | Send Invoice 2 of 2 (final balance) | |
| 28 | Accounting | Set revenue recognition dates | |
| 29 | PM | Close the task | |

**Key check:** If a service contract was sold with the system, is the subscription created and linked to the system record?

## What to Watch For

- Does the quote use the purchase configurator correctly for system config?
- Does the Inventory Status Report show the right RTS quantities?
- Does the Gantt view track the install through all scheduling stages?
- Does timesheet posting work for the FSE's install time?
- Does per diem calculate correctly for the install trip?
- Is the system record updated with the customer after delivery?
- Does two-part invoicing work cleanly in Odoo?
