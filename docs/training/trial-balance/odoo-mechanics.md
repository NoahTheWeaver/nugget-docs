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

Wyatt has a passive audit-status feature that the documentation makes look easy. It isn't passive. Click-by-click:

**1. Open the Audit menu.**

In the top navigation, click **Accounting**. Hover the menu bar; you'll see top-level menu items like *Customers*, *Vendors*, *Accounting*, *Reporting*, *Review*, *Configuration*. Click **Review**.

**2. Drill to Working Files.**

The Review menu opens a sub-tree. Hover **Audit** (it's a sub-menu, not a leaf). The Audit sub-menu shows: *Working Files*, *Logs*, and a few others. Click **Working Files**.

**3. Create the working file for the period.**

You're now on the Working Files list view. Click the purple **New** button (top-left). The new-record form has a header area with a Type field (defaults to Account Audit), a Date From field, a Date To field, and a Company field (Nugget Scientific). Below the header is a tab strip with Reports / Status / Notes tabs. The Reports tab is the one you'll use most: it shows clickable links to Trial Balance, Balance Sheet, Profit & Loss, Aged Receivable, Aged Payable, and General Ledger.

Set Type = Account Audit (default). Date From = first day of period. Date To = last day. Save (Cmd+S, or click the cloud-save icon in the breadcrumb).

The working file is now persistent and you can return to it later.

**4. Open the Trial Balance from inside the working file.**

On the saved working file's Reports tab, click **Trial Balance**. The TB opens *with audit-status icons* immediately to the left of each account name. The icons render as small colored dots: gray = To Review, green = Reviewed, blue = Supervised, red = Anomaly.

**5. Working with the badges.**

- Click the dot next to an account row. A small dropdown menu appears with the four status choices (To Review / Reviewed / Supervised / Anomaly).
- Click **Reviewed**. The dropdown closes and the dot turns green. The change saves immediately (no Save button needed).
- Status persists across sessions, tied to the working file. Closing the browser doesn't reset it.

**6. Coming back the next day.**

Repeat step 1–2 to navigate to Working Files. Click the *2026-02 Close* working file in the list. Click Trial Balance from its Reports tab. The badges from yesterday are still set. Continue marking the rest.

**Critical:** if you open the TB from **Accounting → Reporting → Ledgers → Trial Balance** (the regular path), the audit-status icons **do not appear**. They're working-file-context-only. This is the single most-misunderstood thing about Wyatt's audit feature.

## Exporting

Every report has an Export button (top-right, downward arrow icon). Three formats:

- **PDF** — for sending to Cooper or attaching to a JE.
- **XLSX** — for variance investigation in Excel.
- **XML** — for tax filings; not relevant here.

Export to XLSX at every close as the audit trail. File-naming convention: `YYYY-MM_<report>.xlsx` (e.g., `2026-02_TrialBalance.xlsx`). The whole bundle goes in `/Drive/Close/YYYY-MM/`.

## Lock dates

Click-by-click:

**1. Open the wizard.**

Top nav → **Accounting** → **Accounting** (the second-level "Accounting" menu inside the app, not the app launcher) → **Closing** → **Lock Dates…**

The menu label uses a Unicode ellipsis (U+2026), not three ASCII dots. Cmd+F searches against the Unicode form, so type "Lock Dates" and stop before the dot to find it.

**2. The wizard layout.**

A modal dialog opens, window title "Lock Journal Entries". The form has five date-input fields stacked vertically, each with a calendar-icon picker:

- **Lock Everything**
- **Lock Tax Return**
- **Lock Sales**
- **Lock Purchases**
- **Hard Lock**

Below the fields are **Cancel** and **Confirm** buttons.

Set the dates you want. The most common monthly close action is **Lock Everything = period-end date**. Leave the other four blank unless Cooper directs.

**3. The exception alert (if you set a date that blocks a needed back-post).**

If your input date would block a needed back-post (rare in normal close, common during cutover cleanups), the wizard expands to show an inline yellow alert below the date fields. The alert contains three additional inputs:

- **Applies To** — dropdown with two options: "Just me" or "Everyone".
- **Duration** — dropdown constrained to: 5 minutes, 15 minutes, 1 hour, 24 hours, or forever.
- **Reason** — single-line text field.

The Confirm button text changes to **Confirm with Exception**.

For a typical Cooper-supervised correction: set Applies To = "Just me", Duration = "24 hours", Reason = "Cooper-approved correction to April [details]". This creates an `account.lock_exception` record that auto-expires after 24 hours.

**Edge case to remember:** Applies To = "Everyone" combined with Duration = "forever" does *not* create an exception record. Wyatt treats that combination as a normal lock-date adjustment and silently moves the lock backward with no audit row. Avoid that combo unless you genuinely intend to roll the lock back permanently for everyone.

For Hard Lock, the alert never offers an exception. That's the point.

Model: `account.change.lock.date`. The Settings page does *not* expose these fields directly in 19.1.

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

The drill is the most important triage tool in Wyatt. Step-by-step:

**1. Start at the Trial Balance**, opened from inside an audit working file (so you have audit badges visible as you go).

The TB layout is a list view: leftmost column is the audit-status dot, then Code, Account name, Debit, Credit. The header strip shows the as-of date filter and Comparison / Filters / Export buttons on the right. Numeric balance cells are clickable links.

**2. Click any balance cell** (say, the AR balance row 1200, $142,837.50).

The view drills to the **General Ledger**, filtered to account 1200 for the period. You see every journal item that posted to the account: opening balance row, then one row per journal item (date, JE reference, partner, memo, debit, credit), then total and ending-balance rows at the bottom.

**3. Click any journal item** (say, INV/2026/0001 for Acme Labs).

The view jumps to the parent journal entry (`account.move`). The form shows the JE header (Status, Date, Journal, Partner, Reference) and a journal-items table with each debit and credit line. Near the Reference field there's typically a chip-link back to the source document (Sale Order, Vendor Bill, etc.).

**4. Click the source link.** You're now on the originating sale order, vendor bill, or customer invoice. Inspect to confirm the posting matches reality.

**5. Use breadcrumbs** (top-left of the form view, the chevron-separated path) to walk back up: source ← JE ← GL ← TB ← working file. Each click in the breadcrumb returns you to the prior view without losing your place in the audit working file.

Top-down, click-through, never speculative. Spend twenty minutes practicing this drill before the first real close.

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
