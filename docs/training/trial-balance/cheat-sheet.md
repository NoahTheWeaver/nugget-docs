---
title: Cheat Sheet
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Close Cheat Sheet

The one-pager. Print or pin. Assumes you've read the rest at least once.

## Pre-flight (day 1–2 after period end)

- [ ] Bank statements downloaded (operating + payroll)
- [ ] Ramp statement closed for the period
- [ ] Avalara liability worksheet pulled
- [ ] Plaid bank feed current (check each bank journal tile on the Dashboard for fetching/error/reconnect indicators; drill into the journal for `last_sync` if needed)
- [ ] Period's recognition entries posted: in Journal Entries, filter by Journal (Asset Depreciation, Deferred Revenue) + period date + State = Posted. Confirm expected counts. Anything still Draft = check `account.ir_cron_auto_post_draft_entry` last_run.
- [ ] All in-period invoices/bills posted (no drafts)
- [ ] Cutoff confirmed: nothing dated next-period sitting in this period (or vice versa)
- [ ] Back-dated entries reviewed (any JE create_date well after period end gets a memo)

## Open the audit working file

- [ ] Accounting → Review → Audit → Working Files → New, period = current close
- [ ] Run all reports from inside the working file (so Reviewed/Supervised/Anomaly icons appear)

## Run reports as-of period end

- [ ] Trial Balance → export `YYYY-MM_TrialBalance.xlsx`
- [ ] Aged Receivable → `YYYY-MM_ARAging.xlsx`
- [ ] Aged Payable → `YYYY-MM_APAging.xlsx`
- [ ] Inventory Valuation (Accounting → Review → Inventory) → `YYYY-MM_InventoryValuation.xlsx`
- [ ] GRNI / Stock Interim Received → `YYYY-MM_GRNI.xlsx`
- [ ] Bank Reconciliation per bank journal (from Accounting → Dashboard → journal tile → Report) → `YYYY-MM_BankRec_<acct>.xlsx`

Save all in `/Drive/Close/YYYY-MM/`.

## Tie out (in order)

- [ ] **Cash** (1000, 1010) — to bank reconciliation. $0.00.
- [ ] **GRNI** (1330) — to open receipts not yet invoiced. $0.00.
- [ ] **AR** (1200) — to Aged Receivable. $0.01.
- [ ] **AP** (2000) — to Aged Payable. $0.01.
- [ ] **Inventory** (1300, 1310, 1320) — to Inventory Valuation by category. $0.01.
- [ ] **Sales Tax** (2200) — to Avalara liability worksheet, all jurisdictions. $0.01.
- [ ] **Sales tax filings** — every due-in-period return shows "Filed" in Avalara → Returns → Filed Returns. ([Compliance Calendar](./compliance-calendar))
- [ ] **Payroll Liab** (2300) — to QB Payroll Liability Balances. $0.01.
- [ ] **Payroll tax filings current** — confirmed in QB Payroll → Taxes → Payments. No past-due 941/940/state UI/state withholding.
- [ ] **1099 vendor + W-9 review** — confirmed for new vendors paid in period. (Quarterly closes: full 1099 review per Compliance Calendar.)
- [ ] **Nexus check** (quarter-end closes only) — Avalara exposure report pulled, new states flagged to Cooper.
- [ ] **Deferred Revenue** (2400) — to deferred schedule. $0.00.
- [ ] **Prepaids** (1500) — to prepaid schedule. $0.01.
- [ ] **Accruals** (2100) — to accrual schedule + reversing JE list. $0.01.
- [ ] **Accumulated Depreciation** (1700) — to fixed-asset schedule. $0.01.
- [ ] **Migration Suspense** (3900) — must equal $0.00. (First six months post-cutover.)
- [ ] **Common Stock** (3000) — confirm no unexpected movement.
- [ ] **Retained Earnings** (3100) — RE roll-forward proof. $0.01.
- [ ] **Cutover JE roll-forward** — for May–Oct 2026 only.
- [ ] **Revenue / COGS / Expense** — sample-tie top 5 + any >30% MoM variance + any new account.

Mark each account **Reviewed** in the audit working file as you go.

## Resolve variances

For each account that doesn't tie:

- [ ] Drill from larger side, find the cause
- [ ] Post correcting JE (date = period end)
- [ ] Re-pull TB; re-tie that account
- [ ] Document in `VarianceLog.md` (one paragraph per variance)
- [ ] Variances above $5K / 5% threshold: **stop**, escalate to Noah, notify Cooper

## Adjusting entries

- [ ] Accrual JEs for period (utilities, legal, etc., per accrual schedule)
- [ ] Reversing JEs for *prior* period accruals (auto-posted on first of period; verify they fired)
- [ ] Deferred revenue recognition entries posted (filter Journal Entries by Deferred Revenue journal + period; State = Posted)
- [ ] Depreciation entries posted (filter by Asset Depreciation journal + period; Posted)
- [ ] Prepaid amortization entries posted (filter by Prepaid journal + period; Posted)

## Lock

- [ ] **Accounting → Accounting → Closing → Lock Dates…** (wizard; window titled "Lock Journal Entries")
- [ ] Set **Lock Everything** = period end (e.g., 2026-02-28)
- [ ] Save / Confirm
- [ ] Test: try to post a JE dated within the period. Inline exception alert appears. Discard the test draft.

(Hard Lock at year-end only, after Cooper review.)

## Sign off

- [ ] Final tie-out workpaper saved (`YYYY-MM_TieOutWorkpaper.xlsx`)
- [ ] Variance log saved
- [ ] One-line email to Cooper: "[Period] close complete. Lock set. Bundle in Drive. Material variances: [none / list]."

Andrea's signature/initial:  _____________  Date: ___________

## When something is wrong

- TB doesn't balance → critical, GL is corrupt, stop everything and call Cooper. (Wyatt should never let this happen.)
- **Sub-ledger doesn't tie** → variance triage; never plug; see [Variance Triage](./variance-triage).
- Lock date won't accept → check if you're trying to lock back too far; locks must move forward.
- Reversing JE didn't post → check Settings → Technical → Scheduled Actions for "Account: Post draft entries with auto_post enabled..." (`account.ir_cron_auto_post_draft_entry`) and look at last_run.
- Audit-status icons missing → you opened the TB outside the working file. Open from inside Working Files.
- Avalara filing missing for a registered jurisdiction → escalate immediately; do not lock until resolved.
- 1099-eligible vendor with no W-9 → stop new payments to that vendor; chase W-9; document in close.

## First-time use

This cheat sheet assumes you've read all seven training pages. If you're seeing this for the first time, start at [Overview](./).
