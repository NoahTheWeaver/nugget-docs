---
title: Reversing Entries
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Reversing Entries

How accruals come back out in the next period without manual re-keying.

## When a reversing entry is the right tool

Use a reversing entry when:

1. We're booking an accrual at period end (an expense incurred but not yet billed; revenue earned but not yet invoiced).
2. The actual transaction will land in the next period through a normal source (a vendor bill, a customer invoice).
3. We want the actual transaction to *replace* the accrual, not double-up with it.

Classic examples:

- Utility bill for February that arrives March 5. Accrue $5,000 to utility expense on Feb 28. Reverse the accrual on March 1. When the actual bill ($5,247) lands March 5 and gets coded to utility expense, the books show $5,247 in March (correct) and $5,000 in Feb (correct estimate).
- Subscription revenue earned in Feb but invoiced March 1. Accrue revenue Feb 28. Reverse March 1. When the invoice posts, revenue is recognized correctly in Feb (via the accrual) and AR is correct in March (via the invoice).

## When *not* to use a reversing entry

- **The actual transaction won't post via a source document.** If we're paying cash for something not invoiced, the accrual doesn't reverse; it gets *consumed* by a specific de-accrual JE when the cash goes out.
- **The accrual is for a multi-period prepaid or deferred.** That's a recognition schedule, not a reversing entry.

## Accrual policy

We accrue any expense > **$1,000** that we know about but haven't been billed for by period-end. Smaller items roll naturally into the next period. The threshold ensures we accrue what's material to monthly P&L without spending hours on $50 line items.

Year-end accruals are different. Bonuses, profit-sharing, audit fees, year-end legal: all accrued regardless of size, with Cooper's review.

## Posting an accrual in Wyatt

Standard JE pattern:

| Account | Debit | Credit |
|---|---|---|
| 6500 Utility Expense | 5,000.00 | |
| 2100 Accrued Expenses | | 5,000.00 |

Post date: 2026-02-28.

Memo: "Estimated Feb utility expense; reverses 2026-03-01."

Reference: `ACCR-2026-02-Utility`

The reference field uses a consistent prefix (`ACCR-YYYY-MM-...`) to make the entry easy to find later.

## Reversing in Wyatt

Click-by-click:

**1. Open the original accrual JE.**

Top nav → **Accounting** → **Accounting** → **Transactions** → **Journal Entries**. Filter to your reference prefix (e.g., type `ACCR-2026-02` in the search). Click the entry to open it.

**2. Click Reverse Entry.**

On the posted JE form, the action menu (top, near "Cog ⚙" or three-dot menu) shows a button labeled **Reverse Entry** (singular). Click it.

**3. The wizard layout.**

A modal opens, window title "Reverse Journal Entry". The form is small: two input fields and two buttons.

- **Date** field with a calendar-icon picker. This is the date the reversing JE will post.
- **Journal** dropdown (defaults to the same journal as the original; leave it).
- **Cancel** button and **Reverse** button at the bottom.

That's all. No Auto Post checkbox, no Refund Method dropdown, no Reason field (Reason exists on the model but is invisible for `move_type='entry'`). Two fields, one button.

**4. Set the Date.**

For routine accruals: first day of the next period (March 1, 2026 for a Feb 28 accrual). **Always the first of next period, regardless of when you click the wizard.** If you're closing late and clicking on March 15, the reversal date is still March 1.

**5. Click Reverse.**

What happens depends on the date:

- **Date strictly later than today** → Wyatt creates a Draft reversal with the **Auto Post: At Date** flag set on the new JE. The cron `account.ir_cron_auto_post_draft_entry` flips it to Posted on the chosen date.
- **Date today or earlier** → Wyatt posts the reversal immediately. No auto-post involved.

Model: `account.move.reversal`.

For an accrual JE (`move_type = 'entry'`), the wizard shows two fields:

- **Date** — the date the reversing JE posts. For routine accruals, set this to the first day of the next period (e.g., March 1, 2026 for a Feb 28 accrual). **The reversal date is always the first day of the next period, regardless of when you click the button.** If you're closing late and clicking the wizard on March 15, the reversal date is still March 1.
- **Journal** — defaults to the same journal as the original. Leave it unless you have a reason.

There is no Auto Post checkbox to toggle. Behavior depends on the date you enter:

- If the date is **strictly later than today**, Wyatt creates the reversal as a Draft entry with `auto_post = at_date`. The scheduled action `account.ir_cron_auto_post_draft_entry` (visible in Settings → Technical → Scheduled Actions as "Account: Post draft entries with auto_post enabled and accounting date up to today") posts it on the chosen date.
- If the date is **today or earlier**, Wyatt posts the reversal immediately. There's no auto-post involved; the reversal goes straight to Posted.

Click **Reverse**.

JEs only have three states: `draft`, `posted`, `cancel`. There is no separate "Auto-Posted" state. While auto-post is pending, the reversing JE shows status **Draft** with the **Auto Post: At Date** flag set on its form. After the cron runs, the status flips to **Posted**.

Verify:
- Original JE shows Posted, with a link to the reversing JE.
- Reversing JE shows Draft + Auto Post: At Date (if scheduled for the future) or Posted (if same-day or past).
- After the reversal date, both JEs together net to zero.

## Maintaining the accrual schedule

Accruals are a list. The schedule lives at `/Drive/Finance/Accruals.xlsx` with columns:

| Period | Reference | Description | Amount | Status | Reversed in |
|---|---|---|---|---|---|
| 2026-02 | ACCR-2026-02-Utility | Feb utility | 5,000.00 | Reversed | 2026-03 |
| 2026-02 | ACCR-2026-02-Legal | Feb legal services | 2,500.00 | Reversed | 2026-03 |

Every accrual posted at month-end gets a row. Every reversal updates Status and Reversed in. At every close, the schedule is the source of truth for which accruals were active during the period.

Tie-out: sum of "active" accruals at period-end = TB balance for **2100 Accrued Expenses**.

## Reversing entries vs. specific de-accruals

Sometimes the actual transaction differs from the accrual amount and we want the variance in the *expense* account, not in the accrual. Two patterns:

**Pattern A: Reverse + actual** (default)

- Feb 28: Accrue $5,000 to expense / accrued.
- Mar 01: Reverse — $5,000 to accrued / expense (auto-posted).
- Mar 05: Actual bill — $5,247 to expense / AP.

Net March expense = $5,247 - $5,000 = $247. February expense = $5,000. Total Feb+Mar = $5,247.

**Pattern B: Specific de-accrual** (occasionally cleaner)

- Feb 28: Accrue $5,000 to expense / accrued.
- Mar 05: Actual bill — $5,000 to accrued / AP, $247 to expense / AP. (Two-line bill, hits the accrual directly.)

Net March expense = $247. February expense = $5,000. Total Feb+Mar = $5,247.

Pattern A is mechanical: every accrual gets a reversal. Easier to reason about, easier to audit. We default to A.

## Reversal across the lock

Reversing entries are *new* JEs posted on a date in the next period, after the lock for the period being reversed. Wyatt enforces this correctly: the original is locked, the reversal posts in an open period.

If we ever need to *modify* a JE that's already locked (the accrual was for the wrong amount):

- Don't unlock to fix the original. Audit-trail integrity matters more than the convenience.
- Post a correcting JE in the next open period with a clear memo referencing the original.
- The variance will show up in the tie-out next period; document the cause.

If the prior-period error is **material** (above the escalation threshold defined in [Variance Triage](./variance-triage)), notify Cooper before posting the correction. A material correction may require a Cooper-supervised restatement, not just a JE in the next open period.

## Common mistakes

- **Reversal date set to last day of prior period instead of first day of next.** Result: both JEs net to zero in the wrong period. Wyatt accepts this; Andrea catches it on review. Always set reversal date to first day of next period.
- **Forgetting to reverse.** Accrual posts, period closes, March arrives, the actual bill lands and gets expensed, but the accrual sits on the books. Result: expenses double-count in March. Catch: the accrual schedule audit at every close.
- **Posting both the reversal and a duplicate accrual.** Happens when someone is unsure if the reversal already happened and posts another. Catch: Wyatt links each JE to its reversal; check the link before posting.
- **Letting auto-post run unsupervised.** With `auto_post=at_date` Wyatt fires the reversal silently. If the accrual was wrong, the reversal compounds the mistake. Andrea's monthly accrual schedule audit is the catch.

## Year-end accruals

At year-end, accruals expand:

- Bonuses (incentive comp earned in current year, paid in following year).
- Profit-sharing.
- Audit fees (Cooper's annual fee, accrued before the bill arrives).
- Year-end legal (any matter where work was performed in current year, billed later).

These are reviewed jointly with Cooper before posting. The schedule is reviewed and re-baselined annually.
