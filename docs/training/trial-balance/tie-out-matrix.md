---
title: Tie-Out Matrix
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Tie-Out Matrix

The full list of control accounts that must tie at every close, the report that backs each one, the variance threshold, and the playbook when something's off.

This page is the contract. If a new account doesn't tie, we caught it during close, not at year-end.

## The matrix

| GL account | Sub-ledger / source | Threshold | Owner | Backup | Source path |
|---|---|---|---|---|---|
| 1000 Cash — Operating | Bank Reconciliation Report (operating bank journal tile) | $0.00 | Andrea | Noah | `/Drive/Close/YYYY-MM/BankRec_Op.xlsx` |
| 1010 Cash — Payroll | Bank Reconciliation Report (payroll bank journal tile) | $0.00 | Andrea | Noah | `/Drive/Close/YYYY-MM/BankRec_Payroll.xlsx` |
| 1100 Credit Cards Payable (Ramp) | Ramp statement balance + outstanding feed activity | $0.00 | Andrea | Noah | Ramp statement export |
| 1200 Accounts Receivable | Aged Receivable | $0.01 | Andrea | Noah | `/Drive/Close/YYYY-MM/ARAging.xlsx` |
| 1300 Inventory — Sellable | Inventory Valuation, filtered by product category Sellable | $0.01 | Andrea (with Bo) | Noah | `/Drive/Close/YYYY-MM/InventoryValuation.xlsx` |
| 1310 Inventory — Awaiting QC | Inventory Valuation, filtered by product category Awaiting QC | $0.01 | Andrea (with Bo) | Noah | same workbook |
| 1320 Inventory — Non-Sellable | Inventory Valuation, filtered by product category Non-Sellable | $0.01 | Andrea (with Bo) | Noah | same workbook |
| 1330 GRNI / Stock Interim Received | Open receipts not yet invoiced report | $0.00 | Andrea | Noah | `/Drive/Close/YYYY-MM/GRNI.xlsx` |
| 1500 Prepaid Expenses | Prepaid schedule (Drive: Finance/Prepaids.xlsx) | $0.01 | Andrea | Noah | Finance/Prepaids.xlsx |
| 1700 Accumulated Depreciation | Fixed-asset depreciation schedule (Drive: Finance/FixedAssets.xlsx) | $0.01 | Andrea | Noah | Finance/FixedAssets.xlsx |
| 2000 Accounts Payable | Aged Payable | $0.01 | Andrea | Noah | `/Drive/Close/YYYY-MM/APAging.xlsx` |
| 2100 Accrued Expenses | Accrual schedule + reversing JE list | $0.01 | Andrea | Noah | Finance/Accruals.xlsx |
| 2200 Sales Tax Payable | Avalara liability worksheet, all registered jurisdictions | $0.01 | Andrea | Noah | Avalara export |
| 2300 Payroll Liabilities | QB Payroll → Reports → Liability Balances | $0.01 | Andrea | Noah | QB Payroll export |
| 2400 Deferred Revenue | Deferred revenue schedule (contract-by-contract) | $0.00 | Andrea (Mykle confirms new contracts) | Noah | Finance/DeferredRevenue.xlsx |
| 3000 Common Stock | Beginning balance + any equity events | $0.00 | Andrea | Noah | Cap table |
| 3100 Retained Earnings | RE roll-forward proof (see below) | $0.01 | Andrea | Noah | Finance/RERollforward.xlsx |
| 3900 Migration Suspense / Opening Balance Equity | Cutover JE residual | $0.00 | Andrea (with Cooper) | Noah | Finance/CutoverJE.xlsx |
| 4xxx Revenue accounts | Sales Report (gross sales by account) | $0.01 | Andrea | Noah | TB drill |
| 5xxx COGS accounts | Inventory Valuation consumption + MO labor | $0.01 | Andrea | Noah | TB drill |
| 6xxx Expense accounts | Bill detail by account (drill from TB) | $0.01 | Andrea (sample-based) | Noah | TB drill |

In addition, the close confirms two compliance activities (not control-account tie-outs but mandatory):

| Activity | Source | Owner | Backup |
|---|---|---|---|
| 1099 vendor running tally + W-9 on file | Vendor master + tag in Wyatt | Andrea | Noah |
| Payroll tax filings current | QB Payroll → Taxes → Payments | Andrea | Noah |

## Threshold philosophy

- **$0.00 must match** for cash, credit card, GRNI, Common Stock, deferred revenue, and Migration Suspense. These are statement-exact (cash/cards), schedule-exact (deferred), or must-be-zero (Migration Suspense). Any variance is real.
- **$0.01 (one cent)** is the rounding allowance for everything else. JE-line rounding and currency conversion can produce fractional pennies. One cent is acceptable.
- **Anything larger** is a real variance and gets triaged. See [Variance Triage](./variance-triage). If the variance exceeds Cooper's materiality threshold (lesser of $5K or 5% of pre-tax income for any single line item), escalate to Noah immediately and notify Cooper.

## Order of operations

Don't tie alphabetically. Tie in this order; each step depends on the previous one being correct:

1. **Cash first.** If cash is wrong, anything else built on top of it is wrong. Reconcile each bank statement, then tie GL cash to reconciled balance.
2. **GRNI.** If GRNI is wrong, inventory and AP individually look fine but unrecorded liability is hidden between them.
3. **AR and AP.** Largest sub-ledgers, most likely to drift.
4. **Inventory** (1300, 1310, 1320). Depends on receiving and shipping cutoff being clean.
5. **Sales tax and payroll liabilities.** External sources of truth (Avalara, QB Payroll).
6. **Deferred revenue.** Largest accrual at Nugget.
7. **Prepaids and accruals.** Smaller schedules, same pattern.
8. **Accumulated depreciation.** Tied to fixed-asset schedule.
9. **Migration Suspense (3900).** For the first six months post-cutover. If non-zero, the cutover JE has unreconciled residual.
10. **Equity (3xxx).** Should rarely move. If it moved, ask why.
11. **Retained earnings (3100).** Roll-forward proof (see below).
12. **Revenue and COGS (4xxx, 5xxx).** Sample-tie; full tie if a number looks wrong.
13. **Operating expenses (6xxx).** Sample-tie. Drill on outliers (any account with month-over-month variance over 30%, plus any account that didn't exist last month).

## Retained earnings roll-forward proof

Each close, prove RE:

```
Prior period close TB Retained Earnings (3100):                 $X
+ Current YTD Net Income (per Wyatt P&L, period start to close): $Y
= Expected Retained Earnings at close:                          $X+Y

Compare to: Current period TB Retained Earnings (3100):          $Z
Variance = Z - (X+Y)
```

Threshold: $0.01. Anything larger means a JE hit RE directly (which should never happen) or the prior-period close was wrong. Drill into JEs against 3100 in the period for the cause.

For the first close after cutover, the prior-period RE is the cutover JE's RE balance, not a Wyatt-native value. Document the source.

## Cutover JE roll-forward (first six months post-cutover only)

For May 2026 through October 2026, run an additional proof:

```
Cutover JE balances (Jan-April 2026 YTD activity, loaded May 1):   per cutover workpaper
+ May 2026 Wyatt activity:                                          per Wyatt P&L
= Expected May 31 GL balances by account
```

Match to TB. Any account where the cutover JE's balance doesn't roll forward correctly indicates a posting error. Resolve before locking May.

By the November 2026 close, the cutover JE roll-forward is no longer needed; standard period-to-period roll-forward applies.

## What "tied" means in writing

A tied account looks like this in the workpaper:

```
1200 Accounts Receivable
  TB balance:           142,837.50
  Aged Receivable:      142,837.50
  Variance:             0.00
  Tied by:              Andrea
  Tied on:              2026-03-05
  Audit-status:         Reviewed (in working file 2026-02)
  Source:               AR_Aging_2026-02-28.xlsx (in /Drive/Close/2026-02/)
```

That's the artifact Cooper will look for. Make it easy to find.

## What's *not* on this list

- **Accounts that don't have sub-ledgers.** Manual JEs to expense accounts (e.g., a one-off legal accrual) don't have a sub-ledger. They live in the JE itself with attached documentation. Sample-review on the expense pass; don't tie.
- **Inter-company.** N/A; single entity.
- **Foreign currency.** N/A; USD only. (If this changes, the multi-currency revaluation report becomes a tie-out target.)

## Adding a new GL account

When a new control-style account is added (anything that aggregates underlying activity), Andrea sets up the tie-out path *before* the next close:

1. What's the source of truth for this balance?
2. Is there a Wyatt report that produces it?
3. If not, what's the workpaper?
4. What's the threshold?
5. Add a row to this matrix.
6. Note the addition in the close summary email to Cooper.

The matrix is the contract. New account, new row.

## Matrix versioning

Last reviewed: 2026-05-01 by Andrea (anticipated; will be confirmed post-cutover).

The matrix gets re-validated against the actual Wyatt chart of accounts at each year-end close. Any account on the COA without a matrix row is added or explicitly noted as out-of-scope.
