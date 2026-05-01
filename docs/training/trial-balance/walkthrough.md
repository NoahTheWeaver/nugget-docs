---
title: Walkthrough — Feb 2026 Close
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Walkthrough: February 2026 Close

A worked example, end to end. The numbers below are illustrative; the actual February close uses the figures Wyatt produces. The shape of the work is what matters.

## Close calendar

A monthly close has dependencies on external sources of truth. Plan accordingly.

| Day after period end | Activity | Owner |
|---|---|---|
| 1 | Period closes. Pull bank statements (operating, payroll). Final Ramp activity available. | Andrea |
| 2–3 | Confirm all in-period invoices/bills posted (no drafts). Confirm cutoff. Post any final accruals. | Andrea |
| 3 | Avalara liability worksheet available. QB Payroll close. | Andrea |
| 4 | Run all five reports as-of period end. Open audit working file. Begin tie-outs. | Andrea |
| 5 | Tie-outs complete. Variances investigated and resolved. Adjusting JEs posted. | Andrea |
| 5 | Re-run TB. Confirm reviewed-status on every account. Lock the period. | Andrea |
| 5–6 | Sign off. Email Cooper. Close folder bundle uploaded to Drive. | Andrea |

If any external source slips (bank statement late, Avalara delay), close slips proportionally. If close slips by more than two business days, escalate to Noah.

## Pre-flight (day 1–2)

Before opening Wyatt, three things on the desk:

1. **Bank statements** for both operating and payroll accounts, downloaded for the period (Feb 1–28, 2026).
2. **Ramp statement** for February.
3. **Avalara liability worksheet** for the period (login → Returns → Liability Worksheet).

If any of these aren't ready, stop. The close depends on external sources of truth being closed first.

Also confirm the **Plaid bank feed is current**. From the Accounting Dashboard, each bank journal tile shows a "last refresh" timestamp under its sync status badge. If a tile shows a stale or failed-sync state, click the tile to drill in or use the manual sync button. The Configuration → Online Synchronization menu is dev-mode only by default; the dashboard tile is the user-facing path.

## Step 1 — Confirm activity is posted

Open: **Accounting → Accounting → Transactions → Journal Entries**.

Filter to:

- Date >= 2026-02-01
- Date <= 2026-02-28
- Status = Draft

Any results: decide for each whether to post or move to next period intentionally. Result list must be empty before proceeding.

Then check for back-dated entries (entries with create_date well after period end):

- Same screen, switch to Journal Items view (Accounting → Accounting → Transactions → Journal Items).
- Group by Date.
- Inspect the Create Date column for any line where create_date is more than 5 days after the line's posting date.

Each back-dated line is either (a) a legitimate late-arriving bill that needed an explicit accrual decision, or (b) a backdated entry that may need a memo. Document findings.

## Step 2 — Confirm recurring JEs posted

Three monthly recognition activities at Nugget:

- Depreciation (asset).
- Deferred revenue recognition.
- Prepaid amortization (where applicable).

In Odoo 19, these are **not** driven by monthly recognition crons. When a deferrable invoice (or asset) is validated, Odoo creates the full schedule of draft JEs upfront with `auto_post=at_date` set on each. The single cron `account.ir_cron_auto_post_draft_entry` (Settings → Technical → Scheduled Actions, search "Post draft entries with auto_post") posts them when their accounting date arrives. So the close-time check is "did the auto-post cron flip the period's drafts to Posted?" not "did a recognition cron run."

Confirm by reference prefix in the Journal Entries list (Accounting → Accounting → Transactions → Journal Entries):

- `DEP-2026-02` → depreciation entry for the period.
- `DEFREV-2026-02` → deferred revenue recognition.
- `PREPAID-2026-02` → prepaid amortization.

Each should show status **Posted**, not Draft.

If anything is still Draft, the auto-post cron may have failed. Check `last_run` on `account.ir_cron_auto_post_draft_entry` in Scheduled Actions. If the cron ran but the entry stayed Draft, the entry's date may be in the future or the entry has a validation error; open it and investigate.

If the entry doesn't exist at all, no schedule was created during invoice/asset validation. Post manually for the period and document in the close summary so Cooper sees it.

## Step 3 — Pull the trial balance

**Accounting → Review → Audit → Working Files**. Click **New**. Set period to 2026-02. Name it `2026-02 Close`. Save.

Open the Trial Balance from inside the audit working file (the working file shows links to supported reports; click Trial Balance there).

Filter:
- Date: As-of 2026-02-28
- Period Comparison: off (turn on later if needed for triage)
- Hierarchy: by default
- Hide 0 lines: yes

Confirm at the bottom: **Total Debits = Total Credits**. Wyatt won't normally allow an unbalanced TB (it rejects unbalanced JEs at posting), so this should always pass; if it doesn't, stop everything and call Cooper.

Export to XLSX. Save as `2026-02_TrialBalance.xlsx` in the close folder.

## Step 4 — Tie cash

For each bank account:

1. **Accounting → Dashboard.**
2. Click the bank journal tile (e.g., "Bank — Operating").
3. Click **Report** in the journal tile (top-right of the tile).
4. As-of 2026-02-28.
5. Confirm: Reconciled Balance equals the bank statement closing balance.
6. Confirm: Outstanding Items is reasonable (any uncleared check older than 30 days gets a note).
7. Cross-check: TB balance for the cash account = Reconciled Balance + Outstanding Items.

For Nugget at Feb-end, expectations:
- Operating cash GL matches operating bank statement to the penny after Feb 28-dated payments not yet cleared.
- Payroll cash GL matches payroll bank statement.

Mark both cash accounts **Reviewed** in the audit working file's Trial Balance view.

## Step 5 — Tie GRNI

Stock 19 doesn't ship a single canonical "GRNI report." We construct it from two sources:

1. **TB balance for 1330 GRNI / Stock Interim Received**: drill the General Ledger filtered to account 1330 as-of 2026-02-28.
2. **Open receipts not yet billed**: **Inventory → Operations → Receipts**, filter to Status = Done, Date <= 2026-02-28, then group by Vendor. Cross-reference against Accounting → Vendors → Bills filtered to "Bill Reference contains [PO number]" for each open receipt. Anything received but not yet billed lands on this list.

Sum of the open-receipt values should equal the GL 1330 balance. Threshold: $0.00.

If non-zero with a real reason (genuine open receipts at month-end), document each open receipt. Confirm each will be billed in March. Mark Reviewed.

If the construction doesn't tie, the receipt-to-bill matching has drifted. Drill into individual receipts to find the missing or duplicate bill.

## Step 6 — Tie AR

Open: **Accounting → Reporting → Partner Reports → Aged Receivable**.

As-of 2026-02-28.

Bottom-line total = TB balance for **1200 Accounts Receivable**? Mark Reviewed.

If not, drill:
- Sort by partner name. Look for any negative balance (customer overpaid; investigate).
- Sort by amount descending. Top 10 customers should match expectations.
- Click the largest balance to see open invoices. Each open invoice should have a clear PO/SO behind it.
- For any direct-GL JE to AR (a JE without a partner_id on the AR line), drill the GL filtered to 1200, sort by partner, and inspect any blank-partner rows.

Export aging to XLSX as `2026-02_ARAging.xlsx`.

## Step 7 — Tie AP

Same drill on Aged Payable.

**Accounting → Reporting → Partner Reports → Aged Payable**.

As-of 2026-02-28. Bottom-line = TB balance for **2000 Accounts Payable**? Mark Reviewed.

Watch for: vendor bills coded to the wrong vendor (creates an aging line on the wrong partner; total is correct but detail wrong). Sample-check three large vendors against the AP detail.

Export as `2026-02_APAging.xlsx`.

## Step 8 — Tie inventory

**Accounting → Review → Inventory → Inventory Valuation**.

As-of 2026-02-28.

The valuation report aggregates by **Stock Valuation Account** (set on the product category). Confirm with Bo before the first close that:

- Sellable products are in a category whose valuation account is **1300**.
- Awaiting QC products are in a category whose valuation account is **1310**.
- Non-Sellable products are in a category whose valuation account is **1320**.

If any of these are misconfigured, the GL split won't happen — all inventory hits 1300 regardless of location.

Once configured: total inventory valuation should equal sum of TB balances for 1300 + 1310 + 1320. Filter the valuation report by category to confirm each component matches its GL account.

If a category exists in stock but doesn't have a configured valuation account, the GL won't pick up the value. Confirm at every close that all stock locations have a configured valuation account on their products' categories.

Mark all three Reviewed.

If valuation doesn't tie:
- Look for a manufacturing order or stock move that posted in March but should have been Feb.
- Look for receiving that landed Feb 28 but the bill isn't booked yet (this is fine; the value is in inventory and the offset is in GRNI, which we tied in step 5).

Export as `2026-02_InventoryValuation.xlsx`.

## Step 9 — Tie sales tax

Compare:
- TB balance for **2200 Sales Tax Payable** as-of 2026-02-28.
- Avalara liability worksheet for the period (all jurisdictions Nugget is registered in; verify the registered list at Avalara → Settings → Jurisdictions).

Match within $0.01. Variances usually come from:
- Tax-affecting credit memos posted in Feb but Avalara hasn't seen yet (Avalara feeds on a delay).
- Tax adjustments posted manually to GL without an Avalara source.

Confirm Nugget's nexus list against Avalara's registered list. If sales mix has expanded into a new state, that's a registration gap to flag to Cooper, not a tie-out failure.

Mark Reviewed.

## Step 10 — Tie payroll liabilities

QB Payroll is the source of truth.

Compare:
- TB balance for **2300 Payroll Liabilities**.
- QB Payroll → Reports → Payroll Liability Balances as-of 2026-02-28.

Match within $0.01. The recurring summary JE that posts payroll from QB into Wyatt creates this balance. If it's wrong, the JE didn't run or pulled the wrong period.

Also confirm payroll tax filings are current: QB Payroll → Taxes → Payments. 941, 940, state UI, state withholding for every period for every state. If anything is past-due, escalate immediately.

## Step 11 — Tie deferred revenue

Open the deferred revenue schedule (Drive: Finance/DeferredRevenue.xlsx).

For each open service contract:
- Total contract amount.
- Recognition method (straight-line over contract term, default).
- Amount recognized through 2026-02-28.
- Remaining deferred balance.

Sum remaining deferred balances. Compare to TB balance for **2400 Deferred Revenue**. Threshold: $0.00.

Variances always investigated. Common causes:
- New contract started in Feb, not added to schedule.
- Contract terminated, unrecognized portion not released.
- Recurring recognition JE posted on a different schedule than the worksheet expects.
- Modification to a contract (term extension, scope change) that updated invoicing but not the schedule.

Mark Reviewed only after variance is zero.

## Step 12 — Tie prepaids, accruals, depreciation

Smaller schedules; same pattern.

- Prepaid Schedule (Drive: Finance/Prepaids.xlsx) → 1500.
- Accrual Schedule (Drive: Finance/Accruals.xlsx) → 2100. Reversing entries are listed in this schedule (see [Reversing Entries](./reversing-entries)).
- Fixed-Asset Depreciation Schedule (Drive: Finance/FixedAssets.xlsx) → 1700 Accumulated Depreciation.

For 1700: prior-period 1700 + current period depreciation expense (per the recurring JE) = current 1700. Threshold $0.01.

Mark Reviewed.

## Step 13 — Tie equity, RE, Migration Suspense

- **3000 Common Stock**: confirm no movement. Should equal prior period unless an equity event occurred.
- **3100 Retained Earnings**: run the roll-forward proof from [Tie-Out Matrix](./tie-out-matrix).
- **3900 Migration Suspense**: must equal $0.00. Non-zero means the cutover JE has unreconciled residual; investigate immediately.

Mark Reviewed.

## Step 14 — Cutover roll-forward (May–Oct 2026 only)

For the first six closes after cutover, run an additional proof: cutover JE balances + period activity = period-end GL balances by account. Resolve any account where the roll-forward doesn't match before locking.

For Feb 2026 (the dress-rehearsal close), this step is N/A — Feb is pre-cutover.

## Step 15 — Sample-tie revenue, COGS, expenses

For 4xxx, 5xxx, 6xxx accounts: sample, don't tie every line.

Pick:
- Top 5 revenue accounts by activity.
- Top 5 expense accounts by activity.
- Any account with month-over-month variance > 30%.
- **Any account that didn't exist last month** (new accounts hide mis-coding).

For each sample, drill into the GL and confirm activity makes sense. Look for:
- A single large JE that explains variance.
- Out-of-period entry.
- Coding error (revenue posted to expense or vice versa).

Mark Reviewed.

## Step 16 — Compliance confirmations

Per the [Compliance Calendar](./compliance-calendar):

- **Sales tax filings:** for every registered jurisdiction with a filing due in the period, confirm Avalara → Returns → Filed Returns shows status "Filed" with a confirmation number for the prior period.
- **Payroll tax filings:** confirmed current in Step 10. No past-due 941, 940, state UI, or state withholding.
- **1099 vendor running tally:** confirm all new vendors paid in the period have a W-9 on file before the payment was issued. At quarter-end closes only, run the full quarterly 1099 review per the Compliance Calendar.
- **Nexus check:** at quarter-end closes only, pull Avalara nexus exposure report and flag any new state to Cooper.

Anything past-due or missing escalates immediately.

## Step 17 — Adjusting entries

If anything in prior steps surfaced a variance, post the correcting JE now. Date it 2026-02-28. Reference the close as the memo. Attach source document.

Re-run the trial balance after posting. Re-tie any account the JE touched.

## Step 18 — Lock

When every control account is Reviewed and no variance exceeds threshold:

**Accounting → Accounting → Closing → Lock Dates…**

Set **Lock Everything** = 2026-02-28. Click Save / Confirm.

Confirm: try to post a JE dated 2026-02-15. It should error and present the inline exception alert. Discard the test draft.

For Feb 2026, do *not* set Hard Lock yet. Hard lock comes at year-end after Cooper's annual review.

## Sign off

Final artifact bundle in /Drive/Close/2026-02/:

- `2026-02_TrialBalance.xlsx`
- `2026-02_ARAging.xlsx`
- `2026-02_APAging.xlsx`
- `2026-02_InventoryValuation.xlsx`
- `2026-02_GRNI.xlsx`
- `2026-02_BankReconciliation_Op.xlsx`
- `2026-02_BankReconciliation_Payroll.xlsx`
- `2026-02_RERollforward.xlsx`
- `2026-02_TieOutWorkpaper.xlsx` (the matrix from [Tie-Out Matrix](./tie-out-matrix), filled in with actuals and signed)
- `2026-02_VarianceLog.md` (one paragraph per variance investigated)

Email Cooper a one-line summary:

> "Feb 2026 close complete. Lock set 2026-02-28 (fiscalyear). Workpaper bundle in /Drive/Close/2026-02/. Material variances: none. — Andrea"

Or if material variances exist, list them with the resolution.

## What went wrong, and what to remember

This section grows over time. As issues arise during closes, they're documented here so the next closer doesn't trip on the same thing.

- *(Empty for now. To be populated after the first three closes.)*

## March 2026

Same exercise, dates shifted. Run it the week after Feb is signed off so the muscle memory is still warm. The first time takes longer; once familiar, the run is shorter.

Time estimates: not yet measured. After the first three closes, time-stamps for each step will be added to the calendar at the top of this page.
