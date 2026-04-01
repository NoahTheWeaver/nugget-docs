---
title: Task-Level Analytics
---

# Task-Level Analytics

**Technical name:** `nugget_task_analytics`\
**Author:** Noah Weaver

Extends Odoo to support analytic accounts at the task level, not just project level. When a task has an analytic account set, timesheets logged against it use that account instead of the project's default.

## Why this exists

Standard Odoo assigns all timesheets in a project to the same analytic account — the one set on the project. This makes it impossible to track costs by job, engagement, or task within a single project.

This module adds an optional `analytic_account_id` field to tasks. When set, timesheets on that task use the task's account. When blank, they fall back to the project default. This enables per-job profitability analysis within a single project.

## How it works

### At timesheet creation

When a timesheet is created on a task, the system checks for an analytic account in this order:

1. **Task analytic account** — if set, use it
2. **Project analytic account** — if the task has no account, fall back to the project default

This is handled by overriding `_timesheet_preprocess_get_accounts` in `account_analytic_line.py`, which is Odoo's standard hook for this purpose.

### When a task's analytic account changes

When someone changes the analytic account on a task:

1. All **unvalidated** timesheets on the task update their `analytic_distribution` to match the new account
2. All **validated** timesheets are untouched — they reflect the account that was active when the work was approved
3. If the analytic account is removed (cleared), unvalidated timesheets fall back to the project's default analytic account

This propagation is handled by a `write` override on `project.task`.

### Interaction with per diems

The timesheet `write` triggered by analytic propagation cascades into `nugget_per_diem`'s real-time computation:

```
Task analytic account changes
  → Unvalidated timesheets update analytic_distribution
    → Timesheet write triggers per diem recompute
      → Pending per diem rebuilds its analytic distribution
```

Paid per diems are not affected. This is the "pending = live, paid = frozen" principle shared with the per diem module.

## What happens when no analytic account is set

If **neither** the task nor the project has an analytic account, timesheets are created without any analytic distribution. The time gets logged and hours are tracked, but the cost won't appear in analytic reports or be allocated to any cost center.

For launch, every project should have a default analytic account to ensure all time is captured for cost reporting.

::: warning
Timesheets without analytic distribution will not flow into profitability reports. If you see missing costs in analytics, check for projects or tasks with no analytic account set.
:::

## Employee hourly cost

The cost per hour used in timesheet journal entries is set on each employee record:

**Employees > [Employee] > Settings tab > Hourly Cost**

This value is stamped onto the `amount` field of each timesheet line at creation time. If the hourly cost is not set (or is $0), journal entries from `account_timesheet_posting` will post at $0 — the hours will be tracked but with no dollar value.

## Key Views

- **Task form** — "Analytic Account" field (with tracking enabled for audit trail)
- **Timesheets list** — "Analytic Account" column (added by this module's view extension)

## Configuration

No settings required for the analytics override. The module works as soon as it's installed. Just set an analytic account on a task — if the field is blank, the project default applies.

For cost tracking to work end-to-end, ensure:
1. Every project has a default analytic account
2. Every employee has an hourly cost set
3. The `account_timesheet_posting` module is configured with a TSPOST journal and default accounts

## Test Plan

### Core flow

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Project has Account A, task has Account B. Log timesheet. | Timesheet uses Account B |
| 02 | Project has Account A, task has no analytic. Log timesheet. | Timesheet uses Account A (project default) |

### Change propagation

| # | Test | Expected Result |
|---|------|-----------------|
| 03 | Task has Account A with timesheets. Change to Account B. | Unvalidated timesheets update to Account B |
| 04 | Task has Account A with timesheets. Clear the analytic field. | Unvalidated timesheets fall back to project default |
| 05 | Log timesheet with Account A, validate it, change task to Account B. | Validated timesheet still shows Account A |

### Edge cases

| # | Test | Expected Result |
|---|------|-----------------|
| 06 | Project and task both have no analytic. Log timesheet. | No crash, timesheet creates normally |
| 07 | Per-diem-eligible task with Account A, 8h logged. Change task to Account B. | Pending per diem distribution updates to Account B |

## Cross-Module Dependencies

- **`nugget_per_diem`** — Depends on this module for analytic propagation. Per diem records inherit their analytic distribution from timesheets, which inherit from tasks.
- **`timesheet_grid`** (Enterprise) — Provides the `validated` field on timesheets. Used to protect approved timesheets from analytic propagation.
