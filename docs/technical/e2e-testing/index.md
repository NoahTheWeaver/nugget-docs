---
title: End-to-End Testing
---

# End-to-End Testing

Module smoke tests verify that each piece works in isolation. E2E tests verify that the pieces work together as complete business processes.

These four tests map to the charter's five key processes (Financial Close is tested separately during the July close cycle). Each test walks through a realistic scenario from start to finish, crossing module boundaries and checking that data flows correctly between systems.

| Process | Charter Description | Modules Involved |
|---|---|---|
| [System Procurement](./system-procurement) | New procurement lead to stocked inventory | Purchase, Inventory, System Registry, Service Requests (refurb) |
| [System Sale](./system-sale) | Outreach from client to install report sent | CRM, Sales, Inventory, Purchase Configurator, System Registry, Project, Gantt |
| [Service Contract Onboarding](./service-contract) | New service contract lead to completion of first PM | Sales (subscriptions), System Registry, Service Requests, Timesheets, Per Diem |
| [Emergency Dispatch](./emergency-dispatch) | Outreach from client to repair report sent | Service Requests, System Registry, Timesheets, Per Diem, Timesheet Posting, Track Location Analytics |

## How to Use These Pages

Walk through each step in Odoo. At each step, note:
- Did it work as described?
- Was anything confusing or missing?
- Did data from the previous step carry forward correctly?

Where issues are found, fix them or document them. Where user documentation is needed, create it in the relevant user guide section.
