---
title: "E2E: Service Contract Onboarding"
---

# Service Contract Onboarding

**Charter process:** New service contract lead to completion of first PM.

**Scenario:** A client with existing Hamilton STARs wants to buy a service contract. We sell the subscription, register their systems, schedule the first PM, execute it, and close out.

## Phase 1: Contract Sale

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 1 | Sales | Create opportunity in CRM for the service contract | |
| 2 | Sales | Create a subscription (recurring sales order) with PM service product | |
| 3 | Sales | Confirm the subscription | |

**Key check:** Does the sales order show `is_subscription=True`? Is the subscription status `3_progress`?

## Phase 2: System Registration

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 4 | Ops | Register the client's systems in Service > Systems (manual creation for existing field systems) | |
| 5 | Ops | Set customer_id on each system to the client | |
| 6 | Ops | Set subscription_id on each system to the new contract | |
| 7 | Ops | Verify is_under_contract shows True | |

**Key check:** Does the client's contact form show the systems in the Systems tab? Does each system show "Under Contract"?

## Phase 3: Schedule First PM

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 8 | Dispatcher | Create a task in the Preventive Maintenance project | |
| 9 | Dispatcher | Toggle Service Task on | |
| 10 | Dispatcher | Create a service request from the task, select the system, set service type to PM | |
| 11 | Dispatcher | Assign FSE, set dates, move to Tentatively Scheduled | |
| 12 | Dispatcher | Confirm with client, move to Confirmed with Client | |
| 13 | Dispatcher | Book travel, move to Travel Booked | |

**Key check:** Does the service request auto-name correctly ("Preventive Maintenance - [serial]")? Does the Gantt show the PM in the right project color?

## Phase 4: Execute PM

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 14 | FSE | Travel to site, move task to In Progress | |
| 15 | FSE | Log time on the task (timesheets) | |
| 16 | FSE | Consume parts if needed (inventory transfer linked to service request) | |
| 17 | FSE | Complete the PM checklist (Google Sheets via report template URL) | |
| 18 | FSE | Mark task Completed - Awaiting Closeout | |

**Key check:** Does per diem calculate correctly? Does the parts transfer have the contract's analytic account set?

## Phase 5: Closeout

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 19 | Dispatcher | Review closeout: service report filed, parts accounted for | |
| 20 | Dispatcher | Move task to Closed | |
| 21 | Manager | Validate timesheets for the week | |
| 22 | Accounting | Post timesheets to GL at month end | |

**Key check:** Does timesheet posting create a JE with the correct analytic distribution? Can you trace the cost back to the contract?

## What to Watch For

- Does the subscription creation flow work? Can you set up a recurring PM contract?
- Does the system registry correctly track contract coverage (is_under_contract)?
- Does the service request flow smoothly from task creation through closeout?
- Does the report template URL open the right Google Sheet?
- Can you trace costs from timesheets + parts all the way to the contract's analytic account?
- Does the Gantt view give the dispatcher a clear picture of the PM schedule?
