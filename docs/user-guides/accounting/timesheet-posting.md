---
title: Posting Timesheets to the GL
---

# Posting Timesheets to the GL

Every month, you post validated timesheets to the GL as direct labor costs. This allocates labor to the right projects so it shows up in client-level P&L reports.

::: danger Direct Labor Only
This process is for direct labor — time logged against customer projects. Overhead labor is a separate process. Payroll runs through QuickBooks; this module allocates the labor cost to projects.
:::

## Monthly Process

### 1. Open the review queue

**Accounting > Review > Projects > Timesheets**

By default, this shows **validated, unposted** timesheets — exactly what's ready to post.

### 2. Review what's there

| Column | What it tells you |
|--------|------------------|
| **Employee** | Who logged the time |
| **Project / Task** | Where they logged it |
| **Hours** | How many |
| **Cost** | Hours x employee's hourly rate |
| **Validated** | Manager approved this timesheet |

Use the filter buttons to toggle views:
- **Posted** — see what's already been journaled
- **Draft** — see unvalidated timesheets (can't post these)

### 3. Select and create journal entry

1. Check the timesheets you want to post
2. Click **Create Journal Entry**
3. If anything's wrong, you'll get a clear error:
   - Unvalidated timesheets → tells you to have the manager validate in Timesheets > To Validate
   - Missing hourly cost → names the employees who need rates set

### 4. Review and post the journal entry

::: warning The journal entry is created in Draft
It is **not on the GL yet.** You must click **Post** to finalize it.
:::

Check the draft JE:
- Each timesheet becomes a debit (labor expense with analytic account) and credit (clearing account)
- Totals balance
- If it looks right, click **Post**

## Fixing Mistakes

**Wrong timesheets posted:** Open the JE, click **Cancel Entry** or **Reset to Draft**. The timesheets automatically unlink and reappear in the review queue. No developer needed.

**Wrong hourly rate:** Rates are locked in when the timesheet is created. Fix the rate in Employees > Settings > Hourly Cost (affects future timesheets only). For old timesheets, cancel the JE, adjust amounts, re-post.

**Timesheet shouldn't have been validated:** That's the ops manager's domain. They handle it in the Timesheets app.

## The Clearing Account

The credit side of every posting hits a clearing account. This represents "labor cost we've recognized in Odoo but pay through QuickBooks payroll." When payroll costs are journaled into Odoo, the clearing account nets out.

## Setup

| What | Where | Notes |
|------|-------|-------|
| Employee hourly cost | Employees > Settings > Hourly Cost | **Required** for every employee who logs time |
| Timesheet Posting journal | Accounting > Configuration > Journals | Must have a default account (the clearing account) |
| Default debit account | Settings > Accounting > Timesheet Posting | The labor expense account |
