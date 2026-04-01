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

### Resolution/repair codes

Many2one to `nugget.resolution.code` (simple model with `name` and `active` fields). Dropdown on the service request form, required at closeout. Ops team can manage codes from the menu without a developer. Seed with 5-8 initial codes from the team.

This is required for launch. Two charter metrics depend on it: "Resolution time" and "# Emergency Callouts."

### Required fields by stage

Instead of Python stage gating, use `required` attrs on the form view tied to the stage. XML-only, no Python logic.

- Moving to "Scheduled": service plan must be documented
- Moving to "Closed": `resolution_code_id` and `notes` are required
- L10 audit items (remote solve attempted, post-service checklist): boolean fields on the request form, required at the appropriate stage

### Required fields for reporting

`equipment_id` (system) and `task_id` (project task) are required on every service request. If either is missing, the gross-profit-by-contract report breaks because the join path from cost (timesheets) to revenue (subscription) relies on both links being present.

### Contract routes

Not building for launch. The `is_under_contract` computed field on the system record (from `nugget_system_registry`) gives dispatch enough info to determine covered vs billable. Automated routing is Phase 2.

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
