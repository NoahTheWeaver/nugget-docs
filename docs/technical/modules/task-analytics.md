# Task Analytics

**Technical name:** `nugget_task_analytics`
**Depends on:** `hr_timesheet`, `analytic`

Extends Odoo to support analytic accounts at the task level, not just project level. When a task has an analytic account set, timesheets logged against it use that account instead of the project's default.

## Business Context

- Standard Odoo: all timesheets in a project hit the same analytic account
- This module: different tasks within a project can track costs to different accounts
- Enables per-engagement or per-job profitability analysis within a single project

## Key Views

- **Task form** — "Analytic Account" field on the task
- **Timesheets list** — "Analytic Account" column
