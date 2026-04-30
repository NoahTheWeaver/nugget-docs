---
title: Gantt View
---

# Gantt View

Customizes Odoo's built-in project Gantt view so the operations team can plan and schedule all field service work from a single screen. Replaces the Google Sheets resource calendar.

## What It Does

Two changes to the standard Gantt view:

1. **Colors bars by project color.** The default Gantt assigns colors based on the project's database ID (arbitrary). This module reads the color you pick from the project's dot picker, so you control which color each work type gets.

2. **Stage icons on pills.** Adds a configurable icon field to task stages. The icon prepends to the task name on Gantt pills, giving at-a-glance status without clicking into the task.

## How It Works

### Project color

Adds a `project_color` related field on `project.task` that reads `project_id.color`. The Gantt view's `color` attribute is overridden from `project_id` to `project_color`. Odoo's 12-color palette maps to the project's dot picker selection.

### Stage icons

Adds a `stage_icon` selection field to `project.task.type` (stages). Options are a curated set of emoji. The task's `_compute_display_name` is overridden to prepend the icon when set, so it appears on the Gantt pill text.

## How to Use It

### Setting up projects as work types

Each project represents a type of work. Set a distinct color on each:

| Project | Color | What it covers |
|---|---|---|
| Installs | Green | New system installations |
| Preventive Maintenance | Violet | Scheduled PM visits |
| Repairs | Orange | Break-fix and emergency service |
| Refurb & QC | Blue | In-house refurbishment and QC |
| Training | Light Blue | FSE training and shadowing |
| Emergency Callouts | Red | Unplanned emergency dispatch |
| Shipping & Packing | Gray | Packing and logistics |

Set the color from the project list: three-dot menu on the project card, pick a dot.

### Setting up stages

All projects share the same scheduling stages:

| Stage | Icon | Meaning |
|---|---|---|
| Open | 📋 | Needs scheduling |
| Pencilled In | ✏️ | Dates penciled in, not confirmed |
| Confirmed with Client | 🤝 | Client confirmed, dates locked |
| Fully Scheduled | ✈️ | Travel and resources booked |
| In Progress | 🔧 | FSE actively working |
| Completed - Awaiting Closeout | 📝 | Work done, reports pending |
| Closed | ✅ | Fully closed (folded) |
| On Hold | ⏸️ | Blocked |

Set icons from Project > Configuration > Stages > edit a stage > Icon field.

### Reading the Gantt

- **Rows** = team members (group by Assignees, the default)
- **Bars** = tasks, colored by project (work type)
- **Icons on bars** = stage status
- **Empty slots** = click to create or assign a task
- **Drag and drop** = reschedule or reassign

### The scheduling workflow

1. Tasks start in **Open** (the unscheduled pile)
2. Dispatcher opens the Gantt, clicks an empty slot on an FSE's row
3. Assigns the task, sets dates
4. Moves stage to **Pencilled In**
5. After client confirms: **Confirmed with Client**
6. After booking travel: **Fully Scheduled**
7. FSE starts work: **In Progress**
8. FSE finishes: **Completed - Awaiting Closeout**
9. Reports filed, parts accounted for: **Closed**

## Key Files

| File | Purpose |
|---|---|
| `models/project_task.py` | `project_color` related field, `stage_icon` on stages, `display_name` override |
| `views/project_task_views.xml` | Gantt view color override |
| `views/project_task_type_views.xml` | Icon field on stage form |

## Configuration

No settings. Install the module, set colors on projects, set icons on stages.

## Test Plan

| # | Test | Expected Result |
|---|---|---|
| 01 | Set different colors on two projects, check Gantt | Bars match the project dot picker colors |
| 02 | Set an icon on a stage, check Gantt | Icon appears before task name on the pill |
| 03 | Change a task's stage, check Gantt | Icon updates on the pill |
| 04 | Create a task from an empty Gantt slot | Task created with correct assignee and dates |
| 05 | Drag a task to a different date | Task dates update |
| 06 | Drag a task to a different FSE row | Task assignee updates |

## Cross-Module Dependencies

| Module | Relationship |
|---|---|
| `project_enterprise` (Odoo) | Provides the base Gantt view that this module overrides |
