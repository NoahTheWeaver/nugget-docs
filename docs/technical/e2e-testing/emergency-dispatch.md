---
title: "E2E: Emergency Dispatch"
---

# Emergency Dispatch

**Charter process:** Outreach from client to repair report sent.

**Scenario:** A client calls in with a system down. Dispatch determines the system is under contract, creates a task, assigns an FSE, sends them out, they fix it, and we close out the service request.

## Phase 1: Intake

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 1 | Dispatcher | Client calls. Look up the client in Contacts, check Systems tab. | |
| 2 | Dispatcher | Find the system. Check is_under_contract. | |
| 3 | Dispatcher | Covered or billable? This determines whether we invoice separately. | |

**Key check:** Can the dispatcher answer "is this system under contract?" in under 30 seconds?

## Phase 2: Task and Service Request Creation

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 4 | Dispatcher | Create a task in the Emergency Callouts project (or Repairs) | |
| 5 | Dispatcher | Toggle Service Task on | |
| 6 | Dispatcher | Create a service request from the task. Set service type to Repair, select the system. | |
| 7 | Dispatcher | Name auto-generates: "Repair - [serial]" | |
| 8 | Dispatcher | Assign FSE, set dates | |

**Key check:** Does the system's customer auto-fill on the service request? Does the auto-name work?

## Phase 3: Scheduling

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 9 | Dispatcher | Check FSE availability on the Gantt view | |
| 10 | Dispatcher | Move task to Confirmed with Client (emergency, so likely immediate) | |
| 11 | Dispatcher | Book travel if needed, move to Travel Booked | |

**Key check:** Does the Gantt view show the emergency callout in the right project color (red for Emergency Callouts)?

## Phase 4: On-Site Repair

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 12 | FSE | Travel to site, move task to In Progress | |
| 13 | FSE | Log time on the task (timesheets) | |
| 14 | FSE | Consume parts if needed (inventory transfer linked to service request, analytic account set to contract) | |
| 15 | FSE | Diagnose and fix the issue | |
| 16 | FSE | Fill out the repair report (Google Sheet via report template URL) | |
| 17 | FSE | Mark task Completed - Awaiting Closeout | |

**Key check:** Does per diem calculate correctly (service task, so service per diem GL account)? Does the parts transfer carry the contract's analytic account?

## Phase 5: Closeout

| Step | Who | What happens in Odoo | Check |
|------|-----|---------------------|-------|
| 18 | Dispatcher | Review: repair report filed, parts accounted for, customer notified | |
| 19 | Dispatcher | Move task to Closed | |
| 20 | Manager | Validate timesheets | |
| 21 | Accounting | Post timesheets to GL | |
| 22 | Accounting | If billable: create invoice for the service call | |

**Key check:** Can you trace all costs (labor + parts) for this repair back to the contract's analytic account?

## What to Watch For

- Speed of intake: can the dispatcher identify the system and contract status within 30 seconds of the call?
- Does the emergency dispatch flow differ from a planned repair? (It shouldn't, except for urgency and scheduling.)
- Does per diem GL routing work correctly (service task uses service per diem account)?
- Does the Gantt view help the dispatcher find an available FSE quickly?
- For billable calls (no contract): is the invoicing path clear?
- Can you generate a report showing all emergency callouts by system, by customer, by FSE?
