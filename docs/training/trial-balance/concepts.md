---
title: Concepts
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Concepts

The eight ideas this training rests on. None of them are new to Andrea. They're written down so the language is the same across Wyatt, Cooper, and any future controller.

## Trial balance

A list of every general-ledger account, with its debit and credit balance as of a date. Total debits equal total credits. If they don't, the GL is corrupt and nothing else can be trusted.

The trial balance is run **as-of** a single date (e.g., 2026-02-28). Wyatt interprets the date filter as inclusive of all journal entries posted on or before that date, in the company's configured timezone (Nugget = America/Los_Angeles per `res.company.tz`). For period closes the time-of-day rounding doesn't matter because the close runs after period-end. For mid-period balance pulls, time-zone semantics do matter; record the timestamp on the workpaper.

In Wyatt: **Accounting → Reporting → Ledgers → Trial Balance**.

## Sub-ledger and control account

A **control account** is a single GL account that holds the aggregate balance for a category of activity. Examples:

- AR control account = "Accounts Receivable" on the GL. One number.
- AR sub-ledger = the list of every customer with what they owe. Many lines.

The sub-ledger total *must* equal the control-account balance on the same date. When it doesn't, either the sub-ledger is wrong or a journal entry hit the control account directly without going through a customer invoice.

Direct GL postings to control accounts are the **primary failure mode** for AR/AP integrity. They are the most common cause of a sub-ledger that won't tie. We forbid them as a matter of policy. Every entry to AR must go through a customer invoice; every entry to AP must go through a vendor bill. The only exceptions are migration JEs (cutover, opening balances) and they get a memo.

## GRNI: Goods Received Not Invoiced

When inventory is received but the vendor bill hasn't yet posted, the value sits in a GRNI account (also called Stock Interim — Received in Odoo's anglo-saxon flow). On the GL: inventory goes up, GRNI goes up, AP stays flat until the bill arrives. When the bill arrives: GRNI goes down, AP goes up.

Why it matters: at month-end, receiving cutoff often happens before the vendor bill arrives. Without a GRNI account on the matrix, an inventory tie that "passes" can hide $X of unrecorded liability. We tie GRNI to the open-receipts report, $0.00 expected.

## Tie-out

The act of proving a control account equals its sub-ledger as of a given date. A tie-out is documented as:

| Account | TB balance | Sub-ledger balance | Variance | Source |
|---|---|---|---|---|
| 1200 Accounts Receivable | 142,837.50 | 142,837.50 | 0.00 | Aged Receivable as-of 2026-02-28 |

A variance of $0.00 is the goal. A variance under $0.02 is rounding (acceptable). Anything larger is investigated and resolved before we sign off the close.

**Materiality.** Two thresholds operate side by side:

- **Investigation threshold:** $0.02 per account (above which we triage).
- **Financial-statement materiality:** the amount above which a variance, if uncorrected, would change the conclusion a reader draws from the financial statements. Per Cooper's standard for an entity at Nugget's scale, this is roughly the lesser of $5,000 or 5% of pre-tax income for any single line item. Variances above this threshold trigger an escalation (see [Variance Triage](./variance-triage)) regardless of whether we resolve them in close.

## Period close

The set of activities that finish the books for a month:

1. Confirm all activity is posted (invoices, bills, payroll, payments, accruals).
2. Confirm recurring JEs ran (depreciation, deferred revenue recognition, prepaid amortization).
3. Reverse prior-period accruals (typically already automated; verify).
4. Run sub-ledger reports as-of the last day.
5. Run the trial balance as-of the last day.
6. Tie out every control account.
7. Investigate and resolve variances.
8. Make adjusting entries (reclasses, accruals).
9. Re-run the trial balance and re-tie any account that moved.
10. Lock the period.
11. Sign off and notify Cooper.

Close is done when the lock is set and Cooper is notified. Not before.

## Deferred revenue recognition mode

Wyatt has two modes for recognizing deferred revenue, set on `res.company`:

- **`on_validation`** (recommended): when a deferrable invoice is validated, Wyatt creates the full schedule of recognition draft JEs upfront with `auto_post=at_date`. The `account.ir_cron_auto_post_draft_entry` cron flips them to Posted on their accounting date. Andrea sees recognition entries appear automatically every period.
- **`manual`**: no draft schedule is created at validation time. Recognition is generated on-demand by clicking "Generate Entries" inside the Deferred Revenue report (Accounting → Review → Regularization Entries → Deferred Revenues).

Nugget runs `on_validation`. The cutover preflight verifies this. If it gets switched to `manual` accidentally, the close-time check for "did the recognition entries post?" silently misses entries that were never created. Confirm `generate_deferred_revenue_entries_method = on_validation` on every cutover preflight and quarterly.

## Lock dates

Wyatt has five lock-date fields on `res.company`. The wizard exposes them with these labels (which differ from the underlying field strings on the model):

| Field (technical) | Wizard label | Effect | Reversible? |
|---|---|---|---|
| `fiscalyear_lock_date` | Lock Everything | Blocks any JE on or before the date | Yes, via inline exception in the wizard |
| `tax_lock_date` | Lock Tax Return | Blocks tax-affecting entries only | Yes, via inline exception |
| `sale_lock_date` | Lock Sales | Blocks customer invoices and credit notes only | Yes, via inline exception |
| `purchase_lock_date` | Lock Purchases | Blocks vendor bills only | Yes, via inline exception |
| `hard_lock_date` | Hard Lock | Blocks any JE on or before the date | **No.** Cannot be lifted by any user, ever |

Andrea sets Lock Everything at sign-off each month. At year-end, after Cooper's review and adjustments, she sets Hard Lock to the year-end date. The hard lock protects the audit trail; Lock Everything allows Cooper-supervised corrections during interim review.

Set via **Accounting → Accounting → Closing → Lock Dates…** This opens the Lock Journal Entries wizard (`account.change.lock.date`) where you set any of the five dates and confirm. The Settings page does *not* expose these fields directly in 19. Lock-date exceptions are *not* a separate wizard; they appear as an inline alert inside the same Lock Dates wizard when you set a lock date that would block a needed back-post.

## Reversing entries

Accruals exist in one period to recognize an expense or revenue we know about but haven't yet billed or paid. The matching JE has to come back out in the next period when the actual transaction lands.

Two patterns:

- **Reversal entry**: Post the accrual on Feb 28. Set the reversal to auto-post on March 1. When the real bill arrives in March and gets coded to expense, the books balance.
- **Specific de-accrual**: Post the accrual on Feb 28. When the actual bill lands in March, code the offset directly to the accrual account.

Wyatt's **Reverse Entry** button (on a posted accrual JE) opens a wizard that supports dated auto-reversal (see [Reversing Entries](./reversing-entries)) and we default to that. Specific de-accruals are reserved for cases where the actual amount differs materially from the accrual.

## Audit trail

Every journal entry has, at minimum:

- A date (posting date, *not* the date the bill arrived).
- A reference (invoice number, bill number, or descriptive label).
- A memo (one sentence; what this is and why).
- Source documentation (attached PDF or a link to the source record).

Wyatt enforces the date, reference, and memo. Source documentation is on us. Andrea's standard: a cold reader six months from now should find the source for any JE in 30 seconds.

The Reviewed badge on the trial balance is a *soft* control. It's stored on an `account.audit.account.status` record with only `write_uid` and `write_date` for the most recent change. The model has no `mail.thread`, no message_post hook, and no tracking on the status field — status flips are direct ORM writes from JS with no audit entry. If Andrea flips an account from Reviewed to Anomaly back to Reviewed, only the last write is visible in-app. The **signed PDF workpaper bundle in Drive is the archival record**; the in-app badge is a working tool, not the audit trail.

## What "closed" means

For Nugget, **closed** means:

1. Andrea has run all tie-outs.
2. All variances are resolved or documented as accepted variances.
3. `fiscalyear_lock_date` is set.
4. The close folder bundle is in Drive.
5. Cooper has been notified.

**Reviewed by Cooper** is a separate state. It happens quarterly and at year-end. Cooper signs off on the workpaper bundle and may post adjusting entries via lock exception. Once Cooper signs off on the year, Andrea sets `hard_lock_date`.

## What's *not* in scope

This training is about **proving the period closed correctly**. It does not cover:

- The journal entries themselves (debits and credits for specific scenarios).
- Chart of accounts design.
- Tax filings (sales tax, 1099, payroll tax). Those are continuous, not period-close. The close *confirms* they're current; it doesn't prepare them.
- Financial statement preparation (P&L, Balance Sheet) beyond using them as tie-out targets.

Andrea has those covered today. They don't change with Wyatt.
