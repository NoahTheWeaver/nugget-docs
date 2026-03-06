# Timesheet Posting

**Technical name:** `account_timesheet_posting`
**Depends on:** `account`, `hr_timesheet`, `project`

Converts validated project timesheets into journal entries with paired debit/credit lines, enabling cost allocation through the general ledger.

## How It Works

1. Navigate to **Accounting > Review > Timesheets** to see unposted timesheet lines
2. Select one or more lines and run the **Create Journal Entry** server action
3. The module creates a single journal entry in the **TSPOST** (Timesheet Posting) journal with one debit/credit pair per timesheet line
4. Each timesheet line is linked back to the journal entry via `timesheet_move_id`

## Account Selection (Debit Side)

The module uses a fallback hierarchy for the debit account on each line:

1. Employee's hourly cost product expense account
2. Default account from Settings > Accounting > Timesheet Posting
3. Journal's default account

The credit side always uses the TSPOST journal's default account.

## Analytic Distribution

Each journal entry line carries 100% analytic distribution to the project's analytic account, enabling cost reporting by project.

## Key Views

- **Timesheets to Review** — Accounting > Review > Projects > Timesheets (filtered to unposted, non-zero lines)
- **Settings** — Accounting > Timesheet Posting > Default Debit Account

## Configuration

| Setting | Location | Default |
|---------|----------|---------|
| Default Debit Account | Settings > Accounting > Timesheet Posting | _(must be set)_ |

The TSPOST journal is created automatically on module install.
