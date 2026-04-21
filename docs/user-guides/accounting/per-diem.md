# Per Diem Administration

::: tip Required Permissions
**Timesheets > User: all timesheets** to view per diem records. **Accounting > Invoicing** or higher to mark as paid and create journal entries.
:::

## How per diem works

Per diem is a flat daily cash payment to field service engineers for time spent away from home or office on Nugget-related work. It's calculated automatically from time entries — no manual computation, no expense reports, no trip logging.

When an FSE logs time against an per-diem-eligible task, the system creates (or updates) a per diem record for that employee and date. Records appear in real time as time is logged.

```
FSE logs time on offsite job
        ↓
Per diem record auto-created
(one per employee per calendar day)
        ↓
Admin reviews pending per diems
        ↓
Mark as Paid → journal entry created
```

## Per diem rates

| Hours worked offsite (per day) | Type | Amount |
|-------------------------------|------|--------|
| 8 or more hours | Full day | $100 |
| 4 to 8 hours | Half day | $50 |
| Less than 4 hours | — | No record |

Hours are summed across all per-diem-eligible tasks for the same employee on the same day. Two 4-hour jobs = one full-day per diem.

These thresholds and amounts are configurable in **Settings > Accounting > Per Diem Tracking**.

## Reviewing per diems

Navigate to **Accounting > Reporting > Management > Per Diems**.

The list defaults to the **Pending** filter — these are per diems that haven't been paid yet. Each record shows:

- Employee name and date
- Total offsite hours
- Per diem type (full or half day)
- Amount
- Whether it's a service task (Service Task column)

Use the filters and group-by options to slice the data:
- **This Month / Last Month** — time-based review
- **Employee** — review by person
- **Service Tasks / Non-Service** — separate by job type
- **Status** — pending vs. paid

## Marking as paid

1. Open a pending per diem record
2. Review the source timesheets in the **Source Timesheets** tab
3. Click **Mark as Paid**

This creates a journal entry with:
- **Debit** to the per diem GL account (with analytic distribution)
- **Credit** to the per diem GL account (no analytic)

The GL account is selected automatically based on the task type:
- **Service tasks** → Per Diem Account (Service)
- **All other per-diem-eligible tasks** → Per Diem Account (standard)

If you need to reverse a payment, open the record and click **Reset to Pending**. This only works if the linked journal entry has been reversed or cancelled first.

## GL account routing

Per diem journal entries post to different accounts depending on whether the work was a service task:

| Task type | Account used |
|-----------|-------------|
| Service task (`is_service_task = True`) | Per Diem Account (Service) |
| Non-service task | Per Diem Account |

If the Service account is not configured, the system falls back to the standard account.

## What happens when things change

Per diem follows a simple rule: **pending records always reflect current state; paid records are frozen.**

| Event | Effect on per diems |
|-------|-------------------|
| FSE edits timesheet hours | Pending per diem updates automatically |
| FSE deletes a timesheet | Pending per diem recalculates (or deletes if below threshold) |
| Admin changes task's analytic account | Unvalidated timesheets update, pending per diem rebuilds distribution |
| Admin toggles task Per Diem Eligible flag | Pending per diems created or removed |
| Per diem is already paid | No changes — the journal entry is the audit trail |

## Configuration

::: tip Required Permissions
**Settings** access required to configure per diem.
:::

All settings are at **Settings > Accounting > Per Diem Tracking**:

| Setting | Purpose | Default |
|---------|---------|---------|
| Per Diem Account | GL account for non-service per diem entries | _(must be set)_ |
| Per Diem Account (Service) | GL account for service task per diem entries | _(falls back to standard)_ |
| Full Day Amount | Payment for a full day | $100.00 |
| Half Day Amount | Payment for a half day | $50.00 |
| Full Day Threshold | Minimum hours for full day | 8.0 hours |
| Half Day Threshold | Minimum hours for half day | 4.0 hours |

::: warning
The Per Diem Account must be configured before "Mark as Paid" will work. Without it, the journal entry has no account to post to.
:::
