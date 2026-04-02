---
title: "E2E: Emergency Dispatch"
---

# Emergency Dispatch

**Charter process:** Outreach from client to repair report sent.

**Scenario:** A client calls with a system down. Dispatch checks contract status, creates a task, sends an FSE, they fix it, and we close out.

## Phase 1: Intake (Target: under 30 seconds)

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 1 | Dispatcher | Look up the client in Contacts. Open the Systems tab. | |
| 2 | Dispatcher | Find the system by serial number. Check is_under_contract. | |
| 3a | (If covered) | Proceed normally. Costs post to the contract's analytic account. | |
| 3b | (If NOT covered) | This is a billable call. Note it. Costs still need an analytic account (use the client's default or a one-time service analytic). | |

Time this. If the dispatcher can't answer "covered or billable?" in 30 seconds, the system registry isn't working as designed.

## Phase 2: Create Task and Service Request

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 4 | Dispatcher | Create a task in Emergency Callouts project | |
| 5 | Dispatcher | Toggle Service Task on. Create service request: type = Repair, select the system. | |
| 6 | | Verify: name auto-generates ("Repair - [serial]"), customer auto-fills from system | |
| 7 | Dispatcher | Assign FSE, set dates | |

## Phase 3: Scheduling

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 8 | Dispatcher | Check Gantt for FSE availability | |
| 9 | Dispatcher | Move to Confirmed with Client (emergency = likely immediate) | |
| 10 | Dispatcher | Book travel if needed, move to Travel Booked | |
| 11 | | Verify: Gantt shows the callout in red (Emergency Callouts project color) | |

## Phase 4: On-Site Repair

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 12 | FSE | Move task to In Progress. Log time. | |
| 13 | FSE | If parts consumed: create inventory transfer linked to the service request | |
| 14 | FSE | On the transfer, manually set the Analytic Account to the contract's analytic account | |
| 15 | FSE | Click report template URL, fill out repair report in Google Sheets | |
| 16 | FSE | Mark task Completed - Awaiting Closeout | |

Step 14 is manual. The analytic account does not auto-fill. For covered calls, use the contract's analytic. For billable calls, use the client's default analytic or a general service revenue analytic. This needs to be defined before launch.

Per diem should calculate using the service per diem GL account (because is_service_task = True).

## Phase 5: Closeout

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 17 | Dispatcher | Review: repair report filed, parts accounted for | |
| 18 | Dispatcher | Move task to Closed | |
| 19 | Manager | Validate timesheets | |
| 20 | Accounting | Post timesheets to GL | |

### If billable (no contract)

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 21 | Accounting | Create a standalone sales order for the service call (time + parts) | |
| 22 | Accounting | Create and send invoice from the SO | |

The invoicing path for billable calls needs to be defined. Options: standalone SO per call, or a running SO per client that accumulates billable service. Decision needed before launch.

## What to Watch For

- 30-second intake test: contact > systems tab > is_under_contract. Can it be done?
- Covered vs billable branching: does the dispatcher know what to do for each?
- Analytic account on parts transfers is MANUAL for both covered and billable calls
- Per diem GL routing: service task should use the service per diem account
- Billable call invoicing path: not yet defined. Needs a decision.
- Emergency callouts should be countable by system, customer, FSE for charter metrics
