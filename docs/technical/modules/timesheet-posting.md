---
title: Timesheet Posting
---

# Timesheet Posting

**Technical name:** `account_timesheet_posting`\
**Author:** J2E ERP

Converts validated timesheets into accounting journal entries. Adds a review interface where accounting can select unposted timesheet lines and generate a balanced journal entry.

## How it works

### The posting flow

```
Timesheets logged by FSEs/employees
  → Accounting navigates to review queue
    → Selects unposted timesheet lines
      → Clicks "Create Journal Entry"
        → Balanced JE created in Timesheet Posting journal
```

### Journal entry structure

For each timesheet line, two journal entry lines are created:

| Line | Account | Amount | Analytic |
|------|---------|--------|----------|
| **Debit** | Expense account (from product, employee, or default) | Timesheet cost | Yes — from project's analytic account |
| **Credit** | Timesheet Posting journal's default account | Timesheet cost | No |

The net GL impact is zero. The analytic distribution on the debit line is what captures the cost allocation for reporting.

### How the debit account is determined

The module checks for an expense account in this order:

1. Employee's `hourly_cost_product_id` → product's expense account
2. Product category's expense account
3. Employee's direct `account_id` field
4. Config parameter: `account_timesheet_posting.timesheet_posting_account_id` (set in Settings)
5. Fallback: Timesheet Posting journal's default account

### How the cost amount is determined

The cost comes from the `amount` field on `account.analytic.line`, which is computed at timesheet creation from:

**Employees > [Employee] > Settings tab > Hourly Cost** x hours logged

If the employee's hourly cost is $0 or not set, the journal entry will post at $0. The hours are tracked but no dollar value is captured.

### Analytic distribution

The debit line uses the timesheet's own `analytic_distribution` field. This means task-level analytic overrides from `nugget_task_analytics` flow correctly through to journal entries.

If the timesheet has no analytic distribution set, the module falls back to the project's analytic account.

## Key Views

- **Review queue** — Accounting > Review > Projects > Timesheets
- **Settings** — Accounting > Timesheet Posting section (default debit account)

## Configuration

| Setting | Location | Notes |
|---------|----------|-------|
| Timesheet Posting journal | Created automatically at install (journal code: `TSPOST`) | Must have a default account set (used for credit lines) |
| Default debit account | Settings > Accounting > Timesheet Posting | Fallback when no product/employee account found |
| Employee hourly cost | Employees > [Employee] > Settings > Hourly Cost | Determines the dollar value per hour |

## Known Issues

1. **No validation gate.** The module doesn't require timesheets to be validated before posting. Any unposted timesheet with a project and non-zero cost can be posted.

## Test Plan

### Core flow

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Log timesheets on a project, navigate to review queue | Unposted timesheets appear in the list |
| 02 | Select timesheet lines and click Create Journal Entry | Balanced JE created in Timesheet Posting journal with correct debit/credit |
| 03 | Verify posted timesheets disappear from review queue | Posted lines no longer appear |

### Cost and accounts

| # | Test | Expected Result |
|---|------|-----------------|
| 04 | Verify journal entry amounts match employee hourly cost x hours | Dollar amounts are correct |
| 05 | Employee with no hourly cost set — post timesheet | JE posts at $0 (no crash) |
| 06 | Verify debit account comes from correct source (product → employee → default → journal) | Correct account hierarchy is followed |

### Analytic distribution

| # | Test | Expected Result |
|---|------|-----------------|
| 07 | Post timesheet for project with analytic account (no task override) | Debit line has analytic distribution matching project account |
| 08 | Post timesheet for task with task-level analytic override | Debit line uses task's analytic account, not project's |
| 09 | Post timesheets across multiple projects in one batch | Single JE with correct per-line analytic distribution |
| 10 | Post timesheets with mixed task-level analytic overrides | Each debit line gets its own analytic distribution |
| 11 | Post timesheet with no project analytic and no task analytic | Debit line has no analytic distribution, no crash |

### Hourly cost propagation

| # | Test | Expected Result |
|---|------|-----------------|
| 12 | Change employee hourly cost, log new timesheet | New timesheet uses new rate |
| 13 | Change employee hourly cost, check existing unposted timesheets | Existing timesheets keep old rate |

### Edge cases

| # | Test | Expected Result |
|---|------|-----------------|
| 14 | Post a timesheet, then check review queue | Posted timesheet no longer appears |
| 15 | Reverse/cancel a posted JE, check if timesheet can be re-posted | Timesheet reappears in review queue (or document actual behavior) |
| 16 | Post 50+ timesheets in one batch | Single JE created, no errors or timeouts |
