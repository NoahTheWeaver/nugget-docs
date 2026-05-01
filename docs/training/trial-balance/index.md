---
title: Trial Balance with Tie-Outs
search: false
description: Internal training. Not linked from the public nav.
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Trial Balance with Tie-Outs

A walkthrough for closing each month in Wyatt the way Andrea closes them today: trial balance first, then prove every control account against its sub-ledger, then lock the period.

## Executive summary

Andrea can close the May 2026 books in Wyatt with the same discipline she uses today in QuickBooks. The mechanics are the same. The buttons are different. The discipline is identical. This guide is the proof.

Three things stay non-negotiable:

1. **The trial balance is the source of truth.** We don't sign off until total debits equal total credits and every control account ties to the report that backs it.
2. **Tie-outs prove the books are real.** AR control = AR aging detail. AP control = AP aging detail. Inventory GL = inventory valuation. Bank GL = bank reconciliation.
3. **Once tied, we lock.** Andrea sets the period lock the day she signs off. Wyatt enforces it.

**Mykle action: none.** This doc is for Andrea. Noah and Andrea own the rollout. Read on if you want the depth.

## What's specific to Nugget

Three Nugget-specific notes that shape the work:

- **Succession-proof by design.** The training is written so any successor controller can pick this up cold and run it. Andrea owns the close end-to-end. Cooper CPA does reconciliations.
- **Mid-year cutover.** May 1, 2026. Jan–April 2026 P&L activity loaded as a single year-to-date journal entry, so Feb and March 2026 closes are dress rehearsals proving Wyatt's roll-forward of months that originated in QuickBooks.
- **Deferred revenue is the largest accrual.** Prepaid service contracts make this the schedule with the highest stakes. It lives contract-by-contract and ties to the GL every period.

## How to read this guide

| If you want… | Read |
|---|---|
| The vocabulary and the reasoning | [Concepts](./concepts) |
| The exact buttons in Wyatt | [Odoo Mechanics](./odoo-mechanics) |
| Which subsidiary report ties to which GL account | [Tie-Out Matrix](./tie-out-matrix) |
| Filing deadlines for sales tax, payroll tax, 1099 | [Compliance Calendar](./compliance-calendar) |
| A worked example, start to finish | [Walkthrough: Feb 2026 Close](./walkthrough) |
| What to do when something doesn't tie | [Variance Triage](./variance-triage) |
| How reversing accruals work in Wyatt | [Reversing Entries](./reversing-entries) |
| The one-pager Andrea actually uses | [Cheat Sheet](./cheat-sheet) |

## What's different from QuickBooks

Five things that bite if you assume parity. Read this once, even if you skip the rest.

1. **Five lock dates, not one.** Wyatt has Lock Everything, Lock Tax Return, Lock Sales, Lock Purchases, and Hard Lock (the wizard's labels for `fiscalyear_lock_date`, `tax_lock_date`, `sale_lock_date`, `purchase_lock_date`, `hard_lock_date`). Of these, only Hard Lock is irreversible. Lock Everything can be lifted via an inline exception. We use both: Lock Everything at monthly sign-off, Hard Lock at year-end. Set them via **Accounting → Accounting → Closing → Lock Dates…** (a wizard, not the Settings page).
2. **Audit status lives in a working file.** The Reviewed / Supervised / Anomaly badges on the trial balance only render when you open the TB from inside an active audit working file. Create the working file first, then run the TB from inside it.
3. **Inventory tied by valuation account, not location.** The valuation report aggregates by the *Stock Valuation Account* set on the product category. Splitting inventory across multiple GL accounts (1300 sellable, 1310 awaiting QC, 1320 non-sellable) requires distinct product categories with distinct valuation accounts. Confirm with Bo that this is configured before the first close.
4. **Bank Reconciliation Report is per-journal.** Reach it from the bank journal's dashboard tile, not from Accounting → Reporting.
5. **Reverse Entry schedules itself.** Set the reversal Date to the first day of next period; Wyatt creates a draft reversal with `auto_post=at_date` and the cron `account.ir_cron_auto_post_draft_entry` posts it automatically when that date arrives. No second click on March 1.

## Document control

| Field | Value |
|---|---|
| Owner | Andrea (Cooper CPA) |
| Author | Noah Weaver |
| Last reviewed | 2026-05-01 |
| Next review | First close after each Odoo major-version upgrade, or annually, whichever comes first |
| Status | Final for May 2026 cutover. Adjust as we learn. |
