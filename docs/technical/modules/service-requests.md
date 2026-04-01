---
title: Service Requests
---

# Service Requests

Links service requests (Odoo's maintenance requests) to project tasks, renames all Maintenance terminology to Service terminology, and adds the `is_service_task` flag used by per diem GL routing.

## Why This Exists

Nugget's field service work involves service requests tied to client systems (instruments). Odoo's Maintenance module has the right data model — equipment, requests, teams, stages — but the terminology doesn't match how Nugget talks about the work. This module rebrands Maintenance as Service and connects requests to project tasks for cost tracking and profitability analysis.

## How It Works

### Terminology changes

| Odoo Default | Nugget Term |
|-------------|-------------|
| Maintenance (menu) | Service |
| Maintenance Requests | Service Requests |
| Equipment | Systems |
| Equipment Categories | System Categories |
| Maintenance Teams | Service Teams |

### Service task flag

The `is_service_task` boolean on `project.task` controls:
- Whether the Service Requests tab appears on the task form
- Whether the service request smart button is visible
- GL account routing in `nugget_per_diem` (service tasks post to a different per diem account)

### Customer systems

The module extends `maintenance.equipment` (Systems) with:
- `partner_id` — links a system to a customer company
- `product_id` — links a system to a product variant

This lets you see all systems installed at a customer from their contact record (Systems tab on the company contact form).

## Key Views

- **Service menu** — replaces the Maintenance app menu
- **Service Requests list** — all service requests with optional task/project columns
- **Task form** — "Service Task" toggle, Service Requests tab, smart button with request count
- **Task kanban** — service request count badge on cards
- **System form** — Customer and Product fields added
- **Contact form** — "Systems" tab showing installed equipment

## Configuration

No settings required. Terminology changes and view modifications apply on install.

## Open Design Questions

::: warning Pre-launch decisions needed — NONE OF THIS IS BUILT YET
These are significant workflow questions that will be designed and built during end-to-end testing:

1. **Stage gating and checklists** — Before a service request can move to certain stages (e.g., "Scheduled," "Closed"), what must be completed first? Options include checklist fields on the request, required field validation, or sub-tasks. This also relates to the L10 audit requirement (remote solve check, post-service checklists). Stage gating code has been removed from this module pending a design decision.

2. **Resolution/repair codes** — Service requests need a way to capture why we were called out (e.g., "Component failure," "Preventive maintenance," "User error"). This drives reporting on callout reasons and helps identify recurring issues. Could be a selection field or a configurable many2one.

3. **Contract routes** — How service contracts flow through the system. TBD.
:::

## Test Plan

### Terminology

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Open the Service app from the main menu | Menu says "Service" not "Maintenance" |
| 02 | Navigate to Service > Service Requests | List header says "Service Requests" |
| 03 | Navigate to Service > Systems | List header says "Systems" not "Equipment" |

### Service task integration

| # | Test | Expected Result |
|---|------|-----------------|
| 04 | Create a task, toggle Service Task on | Service Requests tab and smart button appear |
| 05 | Add a service request from the task's Service Requests tab | Request created with task and customer pre-filled |
| 06 | Open smart button on task with service requests | Opens list of linked requests |
| 07 | Toggle Service Task off | Service Requests tab and smart button disappear |

### Service requests from the Service app

| # | Test | Expected Result |
|---|------|-----------------|
| 08 | Create a service request directly in Service > Service Requests | Request created, task field is blank |
| 09 | Link the request to a task after creation | Task and project populate on the request |
| 10 | Filter service requests by "Has Service Task" | Only requests linked to tasks appear |

### Cross-module

| # | Test | Expected Result |
|---|------|-----------------|
| 11 | Per-diem-eligible service task: log time, mark per diem as paid | Journal entry uses service per diem GL account |
| 12 | Per-diem-eligible non-service task: log time, mark per diem as paid | Journal entry uses standard per diem GL account |

## Cross-Module Dependencies

- **`nugget_per_diem`** — reads `is_service_task` for GL account routing on per diem journal entries.
- **`maintenance`** (Odoo core) — provides the underlying equipment and request models that this module extends and rebrands.
