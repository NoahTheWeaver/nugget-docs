---
title: Odoo Mechanics
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Odoo Mechanics

Where the buttons are. Confirmed against Odoo 19.1 source. Three things to know up front:

1. The top-level audit menu is labeled **"Review"** in 19 (the technical id is `account_audit_menu` but the visible name is "Review").
2. Lock dates are set via a **wizard**, not the Settings page. The path is `Accounting → Accounting → Closing → Lock Dates...`
3. The Reviewed/Supervised/Anomaly badges on the Trial Balance only render when you open the TB from inside an *audit working file*, not from the regular Reporting menu.

When 20 ships, the Review menu may reorganize and the wizard path may move. Re-validate this page on every major-version upgrade.

## Permission groups required

To run all the close reports and set lock dates, the user needs:

- `account.group_account_manager` (Accountant) **or** `account.group_account_user` (Billing) — for invoices and bills.
- `account.group_account_user` (Billing) — minimum for read-only reporting access on standard reports.
- `account.group_account_readonly` (Auditor / Read-only Accountant) — for the audit reports.

Andrea is in `account.group_account_manager`. Noah is in the same. The backup user must be in the same group; "I'll just give them admin" is not the answer (admin grants extra power but doesn't grant the accounting group needed for some of the reporting actions).

To set lock dates: `account.group_account_manager` (Accountant). Lock exceptions also require Accountant.

## The five reports we run every close

| Report | Where | What it answers |
|---|---|---|
| **Trial Balance** | Accounting → Reporting → Ledgers → Trial Balance | What's the GL balance for every account as-of date X? |
| **Aged Receivable** | Accounting → Reporting → Partner Reports → Aged Receivable | Which customers owe what, by aging bucket? |
| **Aged Payable** | Accounting → Reporting → Partner Reports → Aged Payable | Which vendors are we due to pay, by aging bucket? |
| **Bank Reconciliation Report** | Accounting → Dashboard → click the bank journal tile → Report (top-right) | What's the reconciled bank balance, and what's outstanding? |
| **Inventory Valuation** | Accounting → Review → Inventory → Inventory Valuation | What's our stock worth as-of date X? |

A couple of these are *not* where you'd expect. The Bank Reconciliation Report is reached per-journal from the dashboard tile, not from the Reporting menu (the action `account_reports.action_account_report_bank_reconciliation` is exposed only as a journal-tile action). The Inventory Valuation lives under the **Accounting → Review** menu, not Inventory's Reporting menu, in 19 with the `stock_accountant` module installed.

Every one of these reports accepts an as-of date filter at the top. Set all five to the same date and they should reconcile.

## How to set the as-of date

Each report has a date filter at the top. Click it. The default for the Trial Balance is **Month** showing the current calendar month. To get last month (the routine close case), click the **left-caret** to step back one period. For a specific date (e.g., 2026-02-28 when running the Feb close in May), choose **Specific Date** from the filter dropdown and enter the date directly.

The Trial Balance also has an **All Time** option. Don't use this for a period close; it includes opening-balance JEs that distort current-activity readouts.

## Comparison

The Trial Balance has a **Comparison** filter (top-right). Enable it to add a second column for prior period or prior year. Useful for variance triage, not strictly required for tie-out.

A caveat for the May 2026 cutover: comparison columns that span the QB→Wyatt boundary may not show prior-period data the way you expect, since pre-cutover months exist in Wyatt only as the YTD JE. The comparison column will show the full pre-cutover YTD on whichever month it lands on. Don't trust comparisons across the cutover boundary until June 2026.

## Audit working files (the real audit-status mechanism)

Wyatt has a passive audit-status feature that the documentation makes look easy. It isn't passive. To use it:

1. **Accounting → Review → Audit → Working Files** (intermediate menu is "Audit", final list is "Working Files"). Click **New** to create a working file for the period (e.g., 2026-02).
2. Open the Trial Balance from inside the audit working file (the working file shows links to the supported reports).
3. Inside the working-file context, every TB row now has an audit-status icon with four states (technical key → UI label):
   - `todo` → **To Review**
   - `reviewed` → **Reviewed**
   - `supervised` → **Supervised**
   - `anomaly` → **Anomaly**
4. Click the status to set it. The status is stored on `account.audit.account.status`, which is timestamped and tied to the working file.
5. Coming back the next day, re-open the TB *from inside the same working file* to see what's marked.

If you open the TB from the regular Reporting menu, the audit-status icons do not appear. The feature is real and useful; the access path is non-obvious.

## Exporting

Every report has an Export button (top-right, downward arrow icon). Three formats:

- **PDF** — for sending to Cooper or attaching to a JE.
- **XLSX** — for variance investigation in Excel.
- **XML** — for tax filings; not relevant here.

Export to XLSX at every close as the audit trail. File-naming convention: `YYYY-MM_<report>.xlsx` (e.g., `2026-02_TrialBalance.xlsx`). The whole bundle goes in `/Drive/Close/YYYY-MM/`.

## Lock dates

Set via the wizard at **Accounting → Accounting → Closing → Lock Dates…** The wizard window title is "Lock Journal Entries"; the menu label is "Lock Dates…" (with a Unicode ellipsis U+2026, not three ASCII dots; Cmd+F searches against the Unicode form). Model: `account.change.lock.date`. The Settings page does *not* expose these fields directly in 19.1.

The wizard exposes all five fields with the labels Andrea will actually see:

- **Lock Everything** (`fiscalyear_lock_date`) — the routine close lock. Reversible via inline exception.
- **Lock Tax Return** (`tax_lock_date`) — tax-affecting entries only.
- **Lock Sales** (`sale_lock_date`) — customer invoices and credit notes only.
- **Lock Purchases** (`purchase_lock_date`) — vendor bills only.
- **Hard Lock** (`hard_lock_date`) — irreversible. Set at year-end after Cooper's review.

After setting any of these, attempting to post a blocked JE raises a `UserError`. For the four reversible locks, the same wizard shows an **inline alert** with three exception fields (Applies To, Duration, Reason) when the date you're entering would block a needed back-post. There is no separate "Add Exception" wizard.

Exception duration is constrained to: **5 minutes**, **15 minutes**, **1 hour**, **24 hours**, or **forever**. Pick `24 hours` for a typical Cooper-supervised correction; pick `forever` only when the change is permanent (in which case Wyatt skips the exception record entirely and just moves the lock — see below).

**Edge case to know:** if you set Applies To = "Everyone" and Duration = "forever", Wyatt does not create an `account.lock_exception` record. It treats the change as a normal lock-date adjustment. So "loosen the lock for everyone forever" is silent — no audit row. If Cooper says "just unlock April for me," set Duration = `24h` and Applies To = "Just me" to ensure a logged exception.

For Hard Lock, there is no exception path. That's the point.

Best practice: lock the period the day Andrea signs off the close. Not earlier. Not later. A lock-day slip means the period sat open longer than it should have. Treat that as an exception.

## Drilling into a balance

Every cell on the Trial Balance is clickable. Click a balance to open the General Ledger filtered to that account, in that period, with all the underlying journal items. From there:

- Click a journal item to see the JE that posted it.
- Click the JE to see the source document (invoice, bill, payment).
- Drill into the source document to see the original posting.

This is the primary tool for variance triage. Top-down, click-through, never speculative. Spend time learning the GL drill before the first real close.

## Finding draft journal entries

To check that all activity is posted before running tie-outs:

**Accounting → Accounting → Transactions → Journal Entries**.

Filter:
- Date >= period start
- Date <= period end
- Status = Draft

If there are draft entries, decide for each whether to post or move to next period. For the period to be considered closed, no in-period drafts may remain.

To find back-dated entries (entries with a post date earlier than their create date by more than a few days):

**Accounting → Accounting → Transactions → Journal Items**, then group by Date and inspect the create_date column. Anything with create_date well after period end suggests a late-entry that needs an explicit accrual review.

## Audit log of admin overrides

To see who lifted a lock or posted into a locked period: stock 19 doesn't ship a user-friendly Lock Exceptions list view (the model `account.lock_exception` exists but no menu item is defined for it in core).

Two ways to access:

- **With developer mode** enabled (Settings → Activate Developer Mode), navigate to **Settings → Technical → Database Structure → Models**, find `account.lock_exception`, view records.
- **From the wizard:** the same Lock Dates wizard shows the active exception list when you scope it to a date that already has an exception.

This is a known UX gap. We track it as a Nugget custom-module candidate (one-line `ir.ui.menu` add); until then, dev-mode is the access path.

Review the lock exceptions list at every quarterly close. Any unexplained exception goes on the close report to Cooper.

## What this looks like in practice

A close run takes 60 to 90 minutes once you know the buttons (estimate; not yet measured against actual closes). The first close in Wyatt will take longer. The walkthrough page steps through one in detail.

Time estimates will be updated after the first three closes are measured.
