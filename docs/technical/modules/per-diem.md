# Per Diem Tracking

**Technical name:** `nugget_per_diem`
**Depends on:** `hr_timesheet`, `account`, `project`

Extends timesheets with per diem allowance tracking for field service engineers. FSEs log time against offsite tasks, and the system calculates per diem eligibility based on configurable hour thresholds.

## Business Rules

- **Full day:** >= 8 hours offsite = $100 (configurable)
- **Half day:** >= 4 hours offsite = $50 (configurable)
- **Below threshold:** No per diem record created
- Calculation is **per employee per calendar day**, not per task
- Travel time counts toward the threshold (door-to-door)

## Two Payment Paths

1. **Journal entry** — `action_mark_paid` creates a zero-net journal entry with analytic distribution for cost allocation
2. **Vendor bill** — The "Create Vendor Bills" wizard groups per diems by employee and creates one `in_invoice` per employee

Both paths link back to the per diem record via `move_id`.

## Key Views

- **Per Diems list** — Accounting > Reporting > Management > Per Diems
- **Compute Per Diems** — Menu action that generates records for the last 30 days
- **Timesheets list** — "Per Diem Eligible" filter
- **Task form** — "Offsite" checkbox
- **Settings** — Accounting > Per Diem Tracking (thresholds, amounts, account)

## Configuration

| Setting | Location | Default |
|---------|----------|---------|
| Full Day Amount | Settings > Accounting > Per Diem Tracking | $100.00 |
| Half Day Amount | Settings > Accounting > Per Diem Tracking | $50.00 |
| Full Day Threshold | Settings > Accounting > Per Diem Tracking | 8.0 hours |
| Half Day Threshold | Settings > Accounting > Per Diem Tracking | 4.0 hours |
| Per Diem Account | Settings > Accounting > Per Diem Tracking | _(must be set)_ |
