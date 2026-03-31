# Per Diem Tracking

**Technical name:** `nugget_per_diem`
**Depends on:** `hr_timesheet`, `account`, `project`, `project`

Extends timesheets with per diem tracking for field service engineers. Per diem records are computed automatically in real time when timesheets are saved on offsite tasks.

## Architecture

### Data flow

```
Task (is_per_diem_eligible flag)
  → Timesheet (is_per_diem_eligible, computed from task)
    → Per Diem record (one per employee per calendar day)
      → Journal Entry (on Mark as Paid)
```

### Real-time triggers

Per diem records are created, updated, or deleted automatically by overrides on `account.analytic.line`:

- **create** — new timesheet on offsite task → per diem created/updated
- **write** — hours changed, date moved, task reassigned → per diem recalculated
- **unlink** — timesheet deleted → per diem recalculated or deleted

Additional triggers:
- **Task `is_per_diem_eligible` toggled** → all timesheets on the task recomputed
- **Task `analytic_account_id` changed** (via `nugget_task_analytics`) → unvalidated timesheets update analytic distribution → per diem distribution rebuilds

### Design principle

Pending records always reflect current state (live reference). Paid records are frozen (audit trail). Validated timesheets are never modified by analytic propagation.

## Business Rules

- **Full day:** >= 8 hours offsite = $100 (configurable)
- **Half day:** >= 4 hours offsite = $50 (configurable)
- **Below threshold:** No per diem record created (or existing pending record deleted)
- Calculation is **per employee per calendar day**, not per task
- Travel time counts toward the threshold (door-to-door)
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

## Cross-Module Dependencies

- **`nugget_task_analytics`** — Owns the `analytic_account_id` field on tasks and propagates analytic changes to unvalidated timesheets. The timesheet write then cascades into per diem recomputation via `nugget_per_diem`'s triggers.
- **`timesheet_grid`** (Enterprise) — Provides `validated` field on timesheets. Used to protect approved timesheets from analytic propagation.
