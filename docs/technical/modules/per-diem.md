---
title: Per Diem Tracking
---

# Per Diem Tracking

Extends timesheets with per diem tracking for field service engineers. Per diem records are computed automatically in real time when timesheets are saved on eligible tasks.

## Why this exists

Nugget pays a flat daily cash payment to field service engineers who travel for work. Before Odoo, per diem was tracked manually through trip logs in the CRM. This module automates the entire flow: time gets logged, per diem records appear, accounting reviews and posts journal entries.

## How it works

### Data flow

```
Task (is_per_diem_eligible flag)
  → Timesheet (is_per_diem_eligible, computed from task)
    → Per Diem record (one per employee per calendar day)
      → Journal Entry (on Mark as Paid)
```

### Real-time triggers

Per diem records are created, updated, or deleted automatically by overrides on `account.analytic.line`:

- **create** — new timesheet on eligible task → per diem created/updated
- **write** — hours changed, date moved, task reassigned → per diem recalculated
- **unlink** — timesheet deleted → per diem recalculated or deleted

Additional triggers:
- **Task `is_per_diem_eligible` toggled** → all timesheets on the task recomputed
- **Task `analytic_account_id` changed** (via `nugget_task_analytics`) → unvalidated timesheets update analytic distribution → per diem distribution rebuilds

### Design principle

Pending records always reflect current state (live reference). Paid records are frozen (audit trail). Validated timesheets are never modified by analytic propagation.

## Business Rules

- **Full day:** >= 8 hours = $100 (configurable)
- **Half day:** >= 4 hours = $50 (configurable)
- **Below threshold:** No per diem record created (or existing pending record deleted)
- Calculation is **per employee per calendar day**, not per task
- Per diem is calculated **door-to-door** — travel time counts, hotel downtime does not
- Only timesheets on tasks marked "Per Diem Eligible" are eligible
- Multiple eligible tasks on the same day sum together

## GL Account Routing

Journal entries post to different GL accounts based on task type:

| Task type | Account |
|-----------|---------|
| Service task (`is_service_task = True`) | `company.per_diem_service_account_id` |
| Non-service task | `company.per_diem_account_id` |

Falls back to the standard account if the service account is not configured. The `is_service_task` flag is stored on the per diem record for filtering.

## Key Views

- **Per Diems list** — Accounting > Reporting > Management > Per Diems
- **Timesheets list** — "Per Diem Eligible" filter
- **Task form** — "Per Diem Eligible" and "Service Task" toggles
- **Settings** — Accounting > Per Diem Tracking (thresholds, amounts, accounts)

## Configuration

| Setting | Config Parameter / Field | Default |
|---------|------------------------|---------|
| Full Day Amount | `nugget_per_diem.full_day_amount` | $100.00 |
| Half Day Amount | `nugget_per_diem.half_day_amount` | $50.00 |
| Full Day Threshold | `nugget_per_diem.full_day_threshold` | 8.0 hours |
| Half Day Threshold | `nugget_per_diem.half_day_threshold` | 4.0 hours |
| Per Diem Account | `res.company.per_diem_account_id` | _(must be set)_ |
| Per Diem Account (Service) | `res.company.per_diem_service_account_id` | _(falls back to standard)_ |

## Test Plan

### Core flow

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Create per-diem-eligible task, log 8+ hours | Per diem appears at $100 |
| 02 | Log 5 hours on per-diem-eligible task | Per diem appears at $50 |
| 03 | Log 3 hours on per-diem-eligible task | No per diem record created |
| 04 | Log 4h on task A + 4h on task B (different analytics, same employee, same day) | Single per diem at $100, distribution splits 50/50 |

### Edits and deletes

| # | Test | Expected Result |
|---|------|-----------------|
| 05 | Start at 8h ($100), reduce to 5h | Per diem updates to $50 |
| 06 | Start at 5h ($50), reduce to 2h | Per diem record deleted |
| 07 | Delete a timesheet entirely | Per diem record deleted |

### Paid record protection

| # | Test | Expected Result |
|---|------|-----------------|
| 08 | Mark per diem as paid, edit source timesheet hours | Paid record unchanged |
| 09 | Mark per diem as paid, try to delete source timesheet | Error: cannot delete |

### Toggle behavior

| # | Test | Expected Result |
|---|------|-----------------|
| 10 | Toggle Per Diem Eligible off on task | Pending per diems removed |
| 11 | Toggle Per Diem Eligible on (task has existing timesheets) | Per diems created |

### GL account routing

| # | Test | Expected Result |
|---|------|-----------------|
| 12 | Log time on service task and non-service task, mark both as paid | Different GL accounts on journal entries |
| 13 | 4h service + 4h non-service, same day, mark as paid | is_service_task = True, uses service account |

### List view actions

| # | Test | Expected Result |
|---|------|-----------------|
| 14 | Select pending per diems, gear > Mark as Paid | Journal entries created, status moves to Paid |

## Cross-Module Dependencies

- **`nugget_task_analytics`** — Owns the `analytic_account_id` field on tasks and propagates analytic changes to unvalidated timesheets. The timesheet write then cascades into per diem recomputation via `nugget_per_diem`'s triggers.
- **`nugget_service_requests`** — Owns the `is_service_task` field on tasks. Used for GL account routing on per diem journal entries.
- **`timesheet_grid`** (Enterprise) — Provides `validated` field on timesheets. Used to protect approved timesheets from analytic propagation.
