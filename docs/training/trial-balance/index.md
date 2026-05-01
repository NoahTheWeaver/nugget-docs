---
title: Cutover & Trial Balance Training
search: false
description: Internal training. Not linked from the public nav.
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Cutover & Trial Balance Training

## Executive summary

Andrea can close the May 2026 books in Wyatt with the same discipline she uses today in QuickBooks. The cutover is the high-stakes event; once landed, monthly close is the same job with different buttons. The path from "QB as system of record" to "Wyatt as system of record" runs through three artifacts:

1. **The cutover JE** — a single Wyatt-side journal entry on May 1, 2026 that loads opening balance sheet (April 30 closing balances), YTD P&L (Jan–April activity), and a Migration Suspense plug (3900) that must zero out before the period locks.
2. **The inventory rebuild** — done separately from the cutover JE because Wyatt drives inventory through stock moves, not journal entries. Pre-flush QB inventory to zero on April 30, then rebuild via stock adjustments on May 1.
3. **The dress rehearsal is the gate.** Two staging Trial Balances must match QB account-by-account before May 1: Feb 2026 in Wyatt-staging vs Feb 2026 in QB, and March 2026 in Wyatt-staging vs March 2026 in QB. If they don't match, we don't cut over.

After May 1, monthly close is the [tie-out matrix](./tie-out-matrix) executed against [Wyatt's reports](./odoo-mechanics) inside an [audit working file](./odoo-mechanics#audit-working-files-the-real-audit-status-mechanism), with the period [locked](./odoo-mechanics#lock-dates) when every control account is Reviewed.

**Mykle action: none.** This doc is for Andrea (and Noah by her side). Cooper signs off cutover before May 1 and reviews each close after.

## What's specific to Nugget

- **Mid-year cutover.** May 1, 2026. Jan–April 2026 P&L activity loaded as a YTD journal entry; full-year reports tie because of it.
- **Deferred revenue is the largest accrual.** Prepaid service contracts make this the schedule with the highest stakes. It lives contract-by-contract and ties to GL every period.
- **Succession-proof by design.** The training is written so a successor controller can pick this up cold. Andrea owns the close end-to-end. Cooper CPA does reconciliations.

## How to read this guide

The pages are written so you can read in order or jump straight to whichever artifact you need.

| If you want… | Read |
|---|---|
| The vocabulary and the reasoning | [Concepts](./concepts) |
| **How to load the cutover on May 1, 2026** | **[Cutover Load Mechanics](./cutover-load)** |
| The exact buttons in Wyatt | [Odoo Mechanics](./odoo-mechanics) |
| Which subsidiary report ties to which GL account | [Tie-Out Matrix](./tie-out-matrix) |
| Filing deadlines for sales tax, payroll tax, 1099 | [Compliance Calendar](./compliance-calendar) |
| A worked example of a post-cutover monthly close | [Walkthrough: Feb 2026 in Wyatt](./walkthrough) |
| What to do when something doesn't tie | [Variance Triage](./variance-triage) |
| How reversing accruals work in Wyatt | [Reversing Entries](./reversing-entries) |
| The one-pager Andrea actually uses each month | [Cheat Sheet](./cheat-sheet) |

## What's different from QuickBooks

Five things that bite if you assume parity. Read this once, even if you skip the rest.

1. **Five lock dates, not one.** Wyatt has Lock Everything, Lock Tax Return, Lock Sales, Lock Purchases, and Hard Lock (the wizard's labels for `fiscalyear_lock_date`, `tax_lock_date`, `sale_lock_date`, `purchase_lock_date`, `hard_lock_date`). Of these, only Hard Lock is irreversible. Lock Everything can be lifted via an inline exception. We use both: Lock Everything at monthly sign-off, Hard Lock at year-end. Set them via **Accounting → Accounting → Closing → Lock Dates…** (a wizard, not the Settings page).
2. **Audit status lives in a working file.** The Reviewed / Supervised / Anomaly badges on the trial balance only render when you open the TB from inside an active audit working file. Create the working file first, then run the TB from inside it.
3. **Inventory tied by valuation account, not location.** The valuation report aggregates by the *Stock Valuation Account* set on the product category. Splitting inventory across multiple GL accounts (1300 sellable, 1310 awaiting QC, 1320 non-sellable) requires distinct product categories with distinct valuation accounts. Confirm with Bo that this is configured before the first close.
4. **Bank Reconciliation Report is per-journal.** Reach it from the bank journal's dashboard tile, not from Accounting → Reporting.
5. **Reverse Entry schedules itself.** Set the reversal Date to the first day of next period; Wyatt creates a draft reversal with `auto_post=at_date` and the cron `account.ir_cron_auto_post_draft_entry` posts it automatically when that date arrives. No second click on March 1.

## What the cutover does NOT change

Some things stay outside Wyatt on purpose, even after cutover:

- **Payroll** stays in QB Payroll. Recurring summary JE from QB → Wyatt every pay run.
- **Bank statements** still come from the bank; Plaid syncs them into Wyatt.
- **Sales tax filings** still happen via Avalara. Cadence and registered jurisdictions don't change.
- **Cooper's review process.** Andrea owns the close; Cooper reviews and posts adjusting entries via lock exception. Same model as today.

The cutover changes *where the close runs*, not *who does the close* or *who reviews it*.

## Document control

| Field | Value |
|---|---|
| Owner | Andrea (Cooper CPA) |
| Author | Noah Weaver |
| Last reviewed | 2026-05-01 |
| Next review | First close after each Odoo major-version upgrade, or annually, whichever comes first |
| Status | Final for May 2026 cutover. |
