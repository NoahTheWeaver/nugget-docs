---
title: "E2E: Service Contract Onboarding"
---

# Service Contract Onboarding

**Charter process:** New service contract lead to completion of first PM.

**Scenario:** A client with existing Hamilton STARs buys a service contract. We sell the subscription, register their systems, schedule the first PM, execute it, and close out.

## Phase 1: Contract Sale

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 1 | Sales | Create opportunity in CRM for the service contract | |
| 2 | Sales | Create a subscription (recurring sales order) with PM service product | |
| 3 | Sales | Confirm the subscription | |
| 4 | | Verify: SO shows is_subscription=True, subscription_state is "In Progress" | |

## Phase 2: System Registration

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 5 | Ops | Register the client's systems in Service > Systems (manual creation for existing field systems) | |
| 6 | Ops | Set customer_id to the client, set subscription_id to the new contract | |
| 7 | | Verify: is_under_contract shows True on each system | |
| 8 | | Verify: client's contact form shows systems in the Systems tab | |

## Phase 3: Schedule First PM

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 9 | Dispatcher | Create a task in the Preventive Maintenance project | |
| 10 | Dispatcher | Toggle Service Task on. Create a service request, select the system, set type to PM. | |
| 11 | | Verify: name auto-generates ("Preventive Maintenance - [serial]") | |
| 12 | Dispatcher | Assign FSE, set dates, move through stages on Gantt | |

## Phase 4: Execute PM

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 13 | FSE | Move task to In Progress. Log time on the task. | |
| 14 | FSE | If parts consumed: create inventory transfer linked to the service request | |
| 15 | FSE | On the transfer, manually set the Analytic Account to the contract's analytic account | |
| 16 | FSE | Click the report template URL on the service request to open the PM checklist in Google Sheets | |
| 17 | FSE | Fill out the checklist in Google Sheets. (No auto-fill from Odoo. FSE enters system info manually.) | |
| 18 | FSE | Mark task Completed - Awaiting Closeout | |

Step 15 is manual and easy to forget. The analytic account does not auto-fill from the contract. The FSE or dispatcher has to select the right one. If it's wrong or missing, parts costs won't show up on the contract's P&L.

Step 17: the report template URL is a plain link. It does not pre-fill any data from the service request. The FSE fills in system serial, date, and results manually in Google Sheets.

## Phase 5: Closeout

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 19 | Dispatcher | Review: report filed, parts accounted for | |
| 20 | Dispatcher | Move task to Closed | |
| 21 | Manager | Validate timesheets for the week | |
| 22 | Accounting | Post timesheets to GL at month end | |
| 23 | | Verify: JE has correct analytic distribution. Trace cost back to contract. | |

## What to Watch For

- Subscription creation: does Odoo handle recurring PM products correctly?
- System registration: does is_under_contract compute correctly from subscription_state?
- Service request auto-naming with the PM service type
- Analytic account on parts transfers is MANUAL. This is the weakest link in cost tracking.
- Google Sheets PM checklist has no data auto-fill from Odoo. Manual entry.
- Timesheet posting traces labor cost to the contract via analytic distribution
- Gantt shows PM in the Preventive Maintenance project color
