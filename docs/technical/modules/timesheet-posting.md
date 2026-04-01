---
title: Timesheet Posting
---

# Timesheet Posting

Converts validated timesheets into accounting journal entries for direct labor cost allocation. Adds a review queue where accounting can select unposted timesheet lines and generate balanced journal entries.

::: danger Direct Labor Only
This module posts timesheets to a **Direct Labor** GL account. It is not used for overhead labor (time not tied to a customer project).

**Payroll is not run through Odoo.** Payroll runs through QuickBooks (or a future payroll provider).
:::

## Why This Exists

Nugget needs to allocate direct labor costs to projects and tasks for gross profit reporting. Timesheets capture hours, but hours alone don't hit the GL. This module bridges that gap: it takes validated timesheets, multiplies hours by the employee's hourly rate, and creates journal entries with the correct analytic distribution so costs show up in client-level P&L reports.

## How It Works

### The posting flow

```
FSE/employee logs time on a project task
  → EVERY WEEK Manager validates the timesheet (Timesheets app > To Validate)
    → EVERY MONTH Accounting navigates to review queue (Accounting > Review > Projects > Timesheets)
      → Selects validated, unposted timesheet lines
        → Clicks "Create Journal Entry"
          → Module validates: all lines validated? all employees have hourly cost?
            → Balanced JE created in Timesheet Posting journal (DRAFT)
              → Timesheets linked to JE, removed from queue
                → Accounting reviews draft JE and clicks "Post" to finalize to GL
```

### Three gates before posting

The module enforces three checks in order before creating a journal entry:

1. **Validation gate** — All selected timesheets must be validated by a manager. Unvalidated timesheets are rejected with an error that directs the user to Timesheets > To Validate.
2. **Hourly cost gate** — All employees on the selected timesheets must have an hourly cost configured. Missing rates are rejected with an error naming the specific employees.
3. **Journal gate** — The Timesheet Posting journal must exist and have a default account set.

### Journal entry structure

For each timesheet line, two journal entry lines are created:

| Line | Account | Amount | Analytic |
|------|---------|--------|----------|
| **Debit** | Expense account (see hierarchy below) | Employee hourly cost x hours | Yes — from timesheet's analytic distribution |
| **Credit** | Timesheet Posting journal's default account (clearing/contra) | Employee hourly cost x hours | No |

The entry is balanced (debit = credit). The analytic distribution on the debit line is what captures the cost allocation for client-level reporting.

The credit side hits a **clearing account** — this represents labor costs recognized in Odoo but paid through the payroll system (QuickBooks or successor). When payroll costs are journaled into Odoo, the clearing account nets out.

::: tip Journal entries are created in Draft
The module creates the JE in **draft** state. Accounting must click **Post** on the journal entry to finalize it to the GL. This gives a chance to review before it becomes permanent.
:::

::: danger Hourly Cost Required
Every employee must have an hourly cost configured before their timesheets can be posted. The module will reject posting with a clear error naming the employees who are missing rates. Set hourly costs in **Employees > [Employee] > Settings tab > Hourly Cost**.
:::

### How the debit account is determined

The module checks for an expense account in this order:

1. Employee's `hourly_cost_product_id` → product's expense account
2. Product category's expense account
3. Employee's direct `account_id` field
4. Config parameter: `account_timesheet_posting.timesheet_posting_account_id` (set in Settings)
5. Fallback: Timesheet Posting journal's default account

::: tip Simplification opportunity
Steps 1-3 (product-based account lookup) were built by J2E and may be more complexity than Nugget needs. For most employees, the debit account will come from step 4 (the Settings default). Evaluate whether the product-based hierarchy is worth keeping before launch.
:::

### How the cost amount is determined

The cost comes from the `amount` field on `account.analytic.line`, which is computed at **timesheet creation** from:

**Employees > [Employee] > Settings tab > Hourly Cost** x hours logged

Changing an employee's hourly cost affects future timesheets only. Existing unposted timesheets keep their original rate. This is intentional — it prevents retroactive cost changes from silently altering pending entries.

### Analytic distribution

The debit line uses the timesheet's own `analytic_distribution` field. This means task-level analytic overrides from `nugget_task_analytics` flow correctly through to journal entries.

If the timesheet has no analytic distribution set, the module falls back to the project's analytic account.

### Reversal behavior

When a posted journal entry is **cancelled or reset to draft**, the module automatically clears the `timesheet_move_id` link on all associated timesheets. This means:

- The timesheets reappear in the review queue
- They can be re-posted to a new journal entry
- No manual database intervention is needed

## The Review Queue

**Location:** Accounting > Review > Projects > Timesheets

This is a custom list view (not a standard Odoo view) that shows all timesheets with a project. It includes:

**Columns:** Date, Employee, Customer, Project, Task, Description, Hours, Cost, Validated, Journal Entry

**Search filters:**
- **Unposted** (default on) — timesheets not yet linked to a JE
- **Posted** — timesheets already linked to a JE (toggle this to see what's been processed)
- **Validated** (default on) — timesheets approved by a manager
- **Draft** — timesheets not yet validated

The default view opens with "Unposted" + "Validated" active, showing the accounting team exactly what's ready to post.

**"Validate" vs "Create Journal Entry":** Both buttons appear in the review queue. "Validate" is standard Odoo (manager approval of hours). "Create Journal Entry" is this module (posting to the GL). Validate first, then post.

## Configuration

| Setting | Location | Notes |
|---------|----------|-------|
| Timesheet Posting journal | Created automatically at install (code: `TSPOST`) | Must have a default account set — this is the credit (clearing/contra) account for all entries |
| Default debit account | Settings > Accounting > Timesheet Posting | Fallback debit account when no product or employee account is configured |
| Employee hourly cost | Employees > [Employee] > Settings > Hourly Cost | **Required.** Determines the dollar value per hour. Must be set for every employee who logs time. |

## Key Files

| File | Purpose |
|------|---------|
| `models/account_analytic_line.py` | Core posting logic, validation gates, review queue field |
| `models/account_move.py` | Reversal logic — clears timesheet links on cancel/draft |
| `models/res_config_settings.py` | Default debit account setting |
| `views/account_analytic_line_views.xml` | Review queue list view, search filters, menu |
| `data/account_journal_data.xml` | Auto-creates TSPOST journal |
| `data/server_action_data.xml` | "Create Journal Entry" button binding |

## Open Questions

1. **Product-based debit account hierarchy** — J2E built a 5-level account lookup that starts with the employee's hourly cost product. Nugget may not need this. Evaluate whether a single default debit account is sufficient.
2. **Success notification** — The "Create Journal Entry" action shows a generic Odoo server action toast ("timesheet created successfully") which is misleading. Cosmetic fix needed.

## Test Plan

### Core flow

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 01 | Log timesheets on a project, navigate to review queue | Unposted timesheets appear in the list | PASS |
| 02 | Select an unvalidated timesheet and click Create Journal Entry | Error: "Cannot post unvalidated timesheets" with directions to Timesheets > To Validate | PASS |
| 03 | Validate the timesheet, then click Create Journal Entry | Balanced JE created in Timesheet Posting journal with correct debit/credit | PASS |
| 04 | Verify posted timesheets disappear from review queue | Posted lines no longer appear (toggle "Posted" filter to see them) | PASS |

### Cost and accounts

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 05 | Verify journal entry amounts match employee hourly cost x hours | Dollar amounts are correct | PASS |
| 06 | Employee with no hourly cost set — post timesheet | Error naming the employee(s) with missing rates, with directions to fix | PASS |
| 07 | Verify debit account comes from correct source (product → employee → default → journal) | Correct account hierarchy is followed | Deferred |

### Analytic distribution

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 08 | Post timesheet for project with analytic account (no task override) | Debit line has analytic distribution matching project account | PASS |
| 09 | Post timesheet for task with task-level analytic override | Debit line uses task's analytic account, not project's | PASS |
| 10 | Post timesheets across multiple projects in one batch | Single JE with correct per-line analytic distribution | PASS |
| 11 | Post timesheets with mixed task-level analytic overrides | Each debit line gets its own analytic distribution | Skipped (variation of 09/10) |
| 12 | Post timesheet with no project analytic and no task analytic | Debit line has no analytic distribution, no crash | Skipped |

### Hourly cost propagation

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 13 | Change employee hourly cost, log new timesheet | New timesheet uses new rate | PASS |
| 14 | Change employee hourly cost, check existing unposted timesheets | Existing timesheets keep old rate | Skipped |

### Edge cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 15 | Post a timesheet, then check review queue | Posted timesheet no longer appears | PASS |
| 16 | Cancel or reset a posted JE to draft | Timesheet link is cleared, timesheet reappears in review queue and can be re-posted | PASS |
| 17 | Post 50+ timesheets in one batch | Single JE created, no errors or timeouts | Skipped (perf test) |

### Results: 12 PASS, 1 Deferred, 4 Skipped

## Cross-Module Dependencies

| Module | Relationship |
|--------|-------------|
| `nugget_task_analytics` | Provides task-level analytic overrides that flow through to the debit line's analytic distribution |
| `nugget_per_diem` | Separate module — per diem journal entries are NOT created by this module |
| `timesheet_grid` | Provides the `validated` field used by the validation gate |

## Changes Made by Nugget (vs. original J2E code)

1. **Validation gate** — Added check requiring timesheets to be validated before posting
2. **Hourly cost gate** — Added check requiring all employees to have hourly cost configured
3. **Reversal logic** — Added `account_move.py` to clear timesheet links on JE cancel/draft
4. **Review queue filters** — Added Unposted/Posted and Validated/Draft search filters
5. **Journal Entry column** — Made `timesheet_move_id` visible in the review queue
6. **Validated column** — Added to review queue for at-a-glance status
7. **Form view link** — Added `timesheet_move_id` to the analytic line form (ACCOUNTING section)
8. **Removed amount filter** — $0 timesheets now visible in queue so missing rates are surfaced
9. **Added `timesheet_grid` dependency** — Required for the `validated` field
10. **Analytic distribution fix** — (Previous session) Fixed bug where distribution was read from project instead of timesheet line
