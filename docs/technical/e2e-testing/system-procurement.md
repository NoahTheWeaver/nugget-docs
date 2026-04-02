---
title: "E2E: System Procurement"
---

# System Procurement

**Charter process:** New procurement lead to stocked inventory.

**Scenario:** Nugget identifies a used Hamilton STAR for sale. We evaluate the deal, purchase it, arrange pickup, receive it, QC it, and either refurb it or crate it for storage.

## Phase 1: Deal Evaluation

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 1 | Procurement | Create a lead or opportunity in CRM for the used system | |
| 2 | F&A | Evaluate financial viability ("3 turns" gate) | |
| 3 | Procurement | Create a Purchase Order for the system | |
| 4 | F&A | Approve the PO | |

## Phase 2: Logistics and Pickup

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 5 | Warehouse Sup | Create project task for pickup logistics (Shipping & Packing project) | |
| 6 | Warehouse Assoc | Get freight quotes, arrange shipment of packing supplies | |
| 7 | Warehouse Assoc | Travel to seller, perform pack-up | |
| 8 | Warehouse Assoc | Arrange return freight to Nugget warehouse | |

## Phase 3: Receive and Intake

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 9 | Warehouse Assoc | Receive the PO (validate incoming picking) | |
| 10 | System | System record auto-created in Service > Systems with serial number and product | |
| 11 | Warehouse Assoc | Separate accessories, count and clean parts | |
| 12 | Warehouse Sup | Enter parts into inventory, stock on shelves | |

**Key check:** After step 10, verify the system record exists in Service > Systems with the correct serial number and product variant.

## Phase 4: QC and Refurb Decision

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 13 | QC | Advisory on asset condition | |
| 14 | Warehouse Sup | Decision: refurb candidate or parts only? | |
| 15 | Warehouse Sup | If refurb: create task in Refurb & QC project, assign FSE | |
| 16 | Warehouse Sup | Move system to QC room (internal transfer) | |
| 17 | FSE | Execute refurb (service request linked to system) | |
| 18 | Warehouse Sup | Move refurbed system back to stock | |

**Key check:** After step 17, verify the service request is linked to the correct system record. After step 16, verify no duplicate system record was created by the internal transfer.

## Phase 5: Disposition and Financial Close

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 19 | F&A | Assign book value to the system | |
| 20 | F&A | Confirm inventory valuation is correct | |
| 21 | Warehouse Sup | Decision: sell now (RTS procedure) or crate and store? | |

## What to Watch For

- Does the system record auto-create on receipt with the right product and serial?
- Does the internal transfer to QC room trigger a duplicate system record? (It shouldn't.)
- Can the FSE create a service request linked to the system while it's still in-house (no customer yet)?
- Does the Gantt view show the refurb task in the Refurb & QC project with the right color?
- Is inventory valuation correct after receiving a used system?
