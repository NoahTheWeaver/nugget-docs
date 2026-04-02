---
title: "E2E: System Procurement"
---

# System Procurement

**Charter process:** New procurement lead to stocked inventory.

**Scenario:** Nugget buys a used Hamilton STAR. We create the PO, receive it, the system record auto-creates, we QC it, refurb it, and it's ready for sale or storage.

## Phase 1: Purchase

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 1 | Procurement | Create a Purchase Order for the system (select the serialized product variant) | |
| 2 | Procurement | Confirm the PO | |

Note: CRM is optional for procurement. Some deals will have a CRM opportunity, some won't. The PO is the system of record.

## Phase 2: Receive

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 3 | Warehouse | Validate the incoming receipt. Enter the serial number for each system. | |
| 4 | System | System record auto-created in Service > Systems | |
| 5 | Warehouse | Verify: open Service > Systems, find the new record. Serial number and product variant should be set. Customer should be blank. | |

**Multi-system test:** If the PO has 3 systems with 3 different serials, all 3 should auto-create as separate system records.

## Phase 3: QC and Refurb

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 6 | Warehouse Sup | Create a task in the Refurb & QC project, assign the FSE | |
| 7 | Warehouse Sup | Move system to QC room (internal transfer) | |
| 8 | | Verify: no duplicate system record created by the internal transfer | |
| 9 | FSE | Toggle Service Task on. Create a service request linked to the system. Service type: Repair or Other. | |
| 10 | FSE | Execute refurb work, log time | |
| 11 | FSE | Mark task Completed - Awaiting Closeout | |

**Key check:** The service request works even though the system has no customer yet (customer_id is blank). The system is still in-house.

## Phase 4: Ready for Sale or Storage

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 12 | Warehouse Sup | Move refurbed system back to stock (internal transfer) | |
| 13 | | Verify: Inventory Status Report shows the system in RTS | |
| 14 | | Verify: Gantt view shows the refurb task completed in the Refurb & QC project color | |

## What to Watch For

- Does auto-creation fire correctly for each serial number on a multi-system receipt?
- Does the internal transfer to QC room create a duplicate system record? (It must not.)
- Can service requests be created against systems with no customer assigned?
- Does the Inventory Status Report update correctly after each transfer?
- If the system is reconfigured during refurb (MO), does the system record's product_id update?
