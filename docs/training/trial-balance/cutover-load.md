---
title: Cutover Load Mechanics
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Cutover Load Mechanics

How we move the books from QuickBooks to Wyatt on May 1, 2026, in a way that lets Andrea close every subsequent month cleanly. This page is the *what happens at cutover*; the [walkthrough](./walkthrough) is the *what happens at every monthly close after*.

The cutover is the single highest-stakes accounting event in the Wyatt project. The discipline below is the contract.

## What we're loading

Three buckets, in order:

1. **Opening balance sheet** as of 2026-04-30 (everything QuickBooks shows on April 30 close).
2. **YTD P&L activity** for January 1 through April 30, 2026 (so full-year reports in Wyatt tie back to a Jan 1 origin).
3. **Inventory rebuild** — separate from the JE-driven load above, because inventory in Wyatt is driven by stock moves, not journal entries.

Each bucket has its own JE structure, its own tie-out target, and its own failure mode. We treat them as three loads, not one.

## Pre-cutover preparation

Before May 1 we need:

| Artifact | Owner | Source | Confirmed by |
|---|---|---|---|
| Final QuickBooks Trial Balance as-of 2026-04-30 | Andrea | QuickBooks | Cooper |
| Final Aged Receivable as-of 2026-04-30 | Andrea | QuickBooks | Cooper |
| Final Aged Payable as-of 2026-04-30 | Andrea | QuickBooks | Cooper |
| Final QuickBooks Inventory Valuation as-of 2026-04-30 | Andrea + Bo | QuickBooks | Cooper |
| Final Bank Reconciliation for each account as-of 2026-04-30 | Andrea | QuickBooks + bank statements | Cooper |
| Final Avalara liability balance as-of 2026-04-30 | Andrea | Avalara | Cooper |
| Final QB Payroll liability balance as-of 2026-04-30 | Andrea | QB Payroll | Cooper |
| Final Deferred Revenue schedule (contract-by-contract) as-of 2026-04-30 | Andrea | Drive: Finance/DeferredRevenue.xlsx | Mykle (new contracts), Cooper (review) |
| Chart of Accounts mapping (QB → Wyatt) | Noah + Andrea | COA migration spreadsheet | Cooper |
| Inventory pre-flush JE on QuickBooks side | Andrea | (drafted; see below) | Cooper |

If any of these is incomplete on April 30, the cutover slips. There is no partial cutover.

### The inventory pre-flush

Per Justin's recommendation: on the QuickBooks side at the end of April, we journal-entry the entire inventory-asset balance into a clearing account (Inventory Adjustments). The April 30 QB Trial Balance then shows inventory at $0 and the Adjustments account holding the value.

**Why:** when we rebuild inventory in Wyatt via stock adjustments, every adjustment posts to the inventory account on the Wyatt side. If QuickBooks still shows non-zero inventory carried over via the cutover JE, then *Wyatt's rebuild plus the carryover* doubles the inventory asset.

**JE pattern** (QuickBooks-side, dated 2026-04-30):

| Account | Debit | Credit |
|---|---|---|
| 1500 Inventory Adjustments (clearing) | $X | |
| 1300 Inventory | | $X |

Memo: "Pre-cutover inventory flush; rebuild on Wyatt side as of 2026-05-01."

After this entry, the QB Trial Balance pulled for cutover loading has Inventory = $0 and Inventory Adjustments = $X. The cutover JE carries over the $X balance into a Wyatt-side Migration Suspense (3900). Wyatt's inventory rebuild (next section) writes to the Wyatt inventory account, balanced against 3900. When the rebuild completes correctly, 3900 zeros out.

### The cutover JE structure

A single journal entry on the Wyatt side, dated 2026-05-01, with one line per QB GL account, balanced via Migration Suspense (3900) for any temporary plug. The structure:

| Line | Account | Debit | Credit |
|---|---|---|---|
| Cash — Operating opening | 1000 | $X | |
| Cash — Payroll opening | 1010 | $X | |
| AR opening | 1200 | $X | |
| AP opening | 2000 | | $X |
| Deferred Revenue opening | 2400 | | $X |
| ... (every other balance-sheet account) | ... | | |
| Common Stock | 3000 | | $X |
| Retained Earnings (cumulative through 2025-12-31) | 3100 | | $X |
| YTD Net Income — mid-year cutover (Jan–Apr 2026) | 3110 | | $X |
| Migration Suspense (plug) | 3900 | | (zero if everything reconciled; non-zero if we still have a plug) |

Reference: `CUTOVER-2026-05-01`. Memo: "QB → Wyatt opening balances + YTD activity load."

**Critical:** Migration Suspense (3900) MUST equal $0.00 after the cutover JE posts. If non-zero, we have not balanced; do not lock the period until 3900 reconciles to zero.

**Why split RE into 3100 and 3110?** The cumulative-through-2025 retained earnings sit in 3100 (the standard RE account). Jan–April 2026 YTD net income sits in a transitional **3110 YTD Net Income (mid-year cutover)** account. This way, between May and December 2026, the GL alone can answer "what was Jan–Apr P&L?" by looking at 3110 in isolation. On December 31, 2026, the year-end close-the-books JE rolls 3110 into 3100 along with the rest of the year's net income. Without this split, the two numbers commingle and we lose the ability to attribute YTD activity by GL alone.

### Should the cutover JE use reversing-entry logic?

Justin recommended reversing entries on TB uploads so subsequent uploads are clean re-loads. For Nugget's cutover, **we don't reverse**. Reasoning:

- Reversing-entry logic on a TB upload makes sense if you're loading the *same* TB month after month and want each load to be a complete re-statement. We're loading the cutover JE *once*. From May 1 forward, Wyatt is the system of record.
- If we did reverse, the May 31 close would re-load the QB May TB, which makes Wyatt May activity invisible. That's the opposite of what we want.

The cutover JE is a one-time entry. Subsequent activity is real Wyatt activity captured by Wyatt's normal flows.

The only reversal we use is the prepaid/accrual reversal pattern for the QB-side accruals that exist on April 30 — those reverse on May 1 in the normal way (see [Reversing Entries](./reversing-entries)).

## Inventory rebuild

Wyatt drives inventory through stock moves, not journal entries. Loading inventory via the cutover JE alone would create the asset balance on the GL but no quantities or locations on the operations side, breaking everything downstream (no picking, no manufacturing, no valuation report).

Process:

1. **Confirm product master is configured.** Each product/SKU exists in Wyatt with its product category, valuation account, and unit cost set. Bo owns this; Andrea confirms valuation accounts roll to the right GL.
2. **Set product unit costs.** Justin's average-cost-across-everything approach: for legacy items where we never tracked cost properly, set an average cost based on best available data. For items we have purchase history for, use weighted-average. This number is the standard cost going forward.
3. **Run stock adjustments per location.** For each (product, location, quantity) tuple from the QB inventory valuation report, post a stock adjustment in Wyatt that moves the quantity to that location. Each adjustment writes to: inventory asset (debit) / Migration Suspense 3900 (credit).
4. **Confirm.** After all adjustments post, Wyatt's Inventory Valuation report should equal the inventory dollars we flushed out of QB. Migration Suspense 3900 net activity from inventory should equal $0.00 (the inventory asset moves from 3900 into 1300/1310/1320 as adjustments post).
5. **Tie-out.** Run Wyatt's Inventory Valuation report; sum should equal QB's pre-flush inventory balance.

### Inventory cost rebuild philosophy

Per Justin: don't try to retroactively reapportion historical costs. Set the average cost as of cutover, and from May forward we have proper cost tracking. Year-one data will stabilize; year-two is when the cost tracking becomes useful.

If anyone (auditor, investor) later asks why margins shifted in 2026, the defensible explanation: implementation of the ERP system surfaced real cost data we couldn't track before. Margin compression in 2026 reflects accuracy, not deterioration.

## Pre-cutover checklist (April 30)

- [ ] All April 2026 activity posted in QuickBooks (no drafts, no late bills).
- [ ] April 2026 close completed in QuickBooks: bank rec done, AR/AP tied, deferred revenue schedule current, payroll tied, sales tax filed.
- [ ] **Negative inventory resolved.** Tori's gotcha: QuickBooks won't let you set a closing date with negative inventory; Odoo's `hard_lock_date` won't apply cleanly either if stock state is broken. Pull the inventory report, find every product with on-hand < 0, resolve each before lock.
- [ ] Inventory pre-flush JE posted on QB side.
- [ ] Final QB TB exported as-of 2026-04-30.
- [ ] All artifact spreadsheets in the pre-cutover table above complete.
- [ ] Cooper has signed off on the April close.
- [ ] Wyatt-side COA mapping confirmed in writing with Cooper.
- [ ] **Production-vs-staging master-data parity confirmed.** Diff Wyatt production's COA, product categories with valuation accounts, customers, vendors, and journals against staging. Confirm zero deltas. The dress rehearsal proves load mechanics; this confirms production has the same target shape.
- [ ] **Compliance in-flight check.** All filings with deadlines on or before April 30 confirmed Filed in source-of-truth systems (sales tax per Avalara → Returns → Filed Returns; payroll tax per QB Payroll → Taxes → Payments). Q1 941 was due April 30 — confirm filed. No filings in Pending or Failed state. If any pending, resolve before cutover starts.
- [ ] **Deferred-revenue mode verified.** On `res.company`, confirm `generate_deferred_revenue_entries_method = on_validation` (full schedule of drafts created at invoice validation). If set to `manual`, the post-cutover deferred-revenue tie-out workflow needs the alternate path (recognition via the Deferred Revenue report's "Generate Entries" button). Same for deferred expense if used.

If anything on this list is incomplete, the cutover does not proceed. Slipping by 24-48 hours is dramatically cheaper than a partial cutover that has to be unwound.

## Cutover day (May 1) — hour-by-hour runbook

The single highest-stakes accounting day of the project. Owners explicit; cut-offs explicit; comms explicit.

| Time (Pacific) | Step | Owner | Notes |
|---|---|---|---|
| **April 30, 5pm** | QB cut-off: stop posting transactions to QuickBooks | Andrea | Comms to whole team day-of: "QB closes for new transactions at 5pm Pacific April 30." Anything received after lands in Wyatt on May 1. |
| April 30, 5pm | Pause Plaid sync on Wyatt-staging-replica that becomes prod | Noah | Prevents bank statements from auto-arriving with no GL state to reconcile against. Resume after May 1 smoke test passes. |
| April 30, 5pm–7pm | Post inventory pre-flush JE on QB side (dated April 30) | Andrea | See "Inventory pre-flush" section above |
| April 30, 7pm | Export final QB TB as-of April 30; final AR/AP/inventory/bank/Avalara/QB Payroll artifacts | Andrea | Last QB-side action of the migration |
| **May 1, 8am** | Take backup snapshot of Wyatt DB pre-cutover | Noah | Keep until May 31 sign-off |
| May 1, 8am–9am | Andrea drafts the cutover JE in Wyatt (status = Draft, not Posted) | Andrea | Reference `CUTOVER-2026-05-01`; one line per QB account |
| **May 1, 9am** | **Cooper countersigns the cutover JE draft.** Andrea exports the draft JE to PDF; Cooper reviews; Cooper returns signed PDF | Cooper | Signed PDF retained in `/Drive/Cutover/2026-05-01/CutoverJE_signed.pdf`. This is the gate. Andrea does not post until signed. |
| May 1, 9:30am | Post the cutover JE | Andrea | Confirm Migration Suspense (3900) = $0.00 immediately after post |
| May 1, 9:30am–12pm | Run inventory adjustments | Bo + Andrea | One per (product, location, qty) tuple. Order each location's adjustments to go positive first, then negative if any (avoid transient negative state). After all post, 3900 net inventory activity = $0.00. |
| May 1, 12pm | Set Sales / Purchase / Tax locks at 2026-04-30 | Andrea | Block back-posts to pre-cutover Wyatt periods. Global Lock waits for May 31 close. |
| May 1, 12pm–1pm | **Smoke test** | Andrea | Confirm AR aging, AP aging, inventory valuation, deferred revenue, payroll liabilities all match the pre-cutover artifacts within $0.02 |
| May 1, 1pm | Resume Plaid sync | Noah | After smoke test passes |
| May 1, 1pm | **Bo restarts receiving in Wyatt.** Comms to team: "Wyatt is live; route all new transactions to Wyatt." | Bo + Noah | This is the operational go-live signal |
| May 1, 1pm | Document: file cutover JE PDF, pre-cutover artifacts, smoke test results, signed cutover JE | Andrea | `/Drive/Cutover/2026-05-01/` |
| May 1, 1pm onward | Standby roster on call until end of day | Andrea, Noah, Bo, Cooper available | First questions from team users will arrive within hours |

**Standby roster:** Andrea (lead), Noah (engineering escalation), Bo (operations), Cooper (accounting escalation). All four available May 1 from 8am to end-of-day.

**Comms plan (sent to whole team April 28):**

> Subject: Wyatt cutover — what to expect April 30 to May 1
>
> - Stop entering transactions in QuickBooks at 5pm Pacific Thursday April 30. Anything you have between 5pm Thursday and end-of-day Friday: hold until Wyatt opens.
> - Wyatt opens for transactions at approximately 1pm Pacific Friday May 1. Bo will send the all-clear in #wyatt.
> - Receiving / shipping pauses 5pm Thursday through 1pm Friday. Plan accordingly.
> - Questions during cutover: Andrea, Noah, Bo. We're all on call.

**If cutover slips by 24-48 hours:** the cutover JE date shifts to the actual cutover date (May 3, May 4, etc.). The YTD activity coverage extends to cover the additional days (e.g., Jan 1 – May 2 if cutting over May 3). The QB pre-flush JE date also shifts to be one day before the new cutover. Comms updates go out same-day. The dress rehearsal must have validated that the load mechanics work for the shifted date range; if not, slip again rather than improvise.

## Post-cutover reconciliation (May 1–May 31)

The proof that cutover succeeded is the May 31 close. For the first six closes (May–October 2026), we run an additional roll-forward proof at every close:

```
Cutover JE balances per account (loaded May 1)
+ Wyatt activity from May 1 through period close
= Expected period-end TB balance per account
```

Compare to actual TB. Any account where the math doesn't roll forward indicates a posting error during cutover or during the period. Resolve before locking.

Migration Suspense (3900) is the canary. It must equal $0.00 on every close from May through October. If 3900 ever shows a balance > $0.01 after May 31, we have a residual cutover error to track down.

By the November 2026 close, the cutover JE roll-forward is no longer needed; standard period-to-period roll-forward applies.

## Dress rehearsal proof: Feb and March 2026 in Wyatt

Cutover is high-stakes enough that we don't run it cold. We dress-rehearse it in a staging replica using a known historical period:

1. **Build a staging replica DB** from production Wyatt seed data + the cutover scripts.
2. **Run the cutover load** as if it were May 1, 2026 — but using QB data as-of 2026-02-29 (or 2026-03-31).
3. **Close the period** in the staging replica using the [walkthrough](./walkthrough). Apply every tie-out per the [matrix](./tie-out-matrix).
4. **Compare results.** Wyatt's Feb (or March) Trial Balance should equal the QuickBooks Feb (or March) Trial Balance, account by account, within $0.02.
5. **If the dress rehearsal closes clean,** the production cutover is approved. If it doesn't, fix the load mechanics and dress rehearse again.

This is the proof Cooper signs off before May 1. The dress rehearsal is the single most informative validation of the cutover process.

## What the cutover does NOT do

- **It does not move payroll** to Wyatt. QB Payroll stays as the system of record. The recurring summary JE from QB Payroll into Wyatt is a *post-cutover* recurring activity; it doesn't run as part of the cutover JE.
- **It does not move 1099 or W-9 records.** Vendor master data carries over via the customer/vendor migration, but the 1099-eligible flag and YTD running tally need to be set in Wyatt for the year-end filing. **By the May 31 close**, Andrea has set `is_1099_eligible` on every vendor record in Wyatt and reconciled YTD payments against QB-side payments through April 30. Owner: Andrea. Tied: into the May 31 close package as a sign-off line item.
- **It does not address sales tax filings.** Avalara's data carries over; ongoing filing cadence resumes per the [Compliance Calendar](./compliance-calendar).
- **It does not fix prior-period errors.** If something was wrong in QuickBooks pre-cutover, it carries over wrong. Resolve in QuickBooks before April 30 close, not in Wyatt after May 1.

## Failure modes and recovery

| Failure | Detection | Recovery |
|---|---|---|
| Cutover JE doesn't balance | Post fails with `UserError` from Odoo | Fix the JE; re-post |
| Migration Suspense ≠ $0 after JE posts | Visible immediately on TB | Find the missing or extra line; correct via second JE |
| Inventory valuation ≠ pre-flush amount | Tie-out at end of inventory rebuild | Identify missing or extra adjustments; correct |
| AR / AP aging doesn't match pre-cutover | Tie-out check on May 1 smoke test | Find the missed customer/vendor; post a correcting JE |
| Negative inventory blocks the May 31 lock | Tori's QB pattern; Odoo equivalent on lock attempt | Resolve negative quantities; relock |
| Bank rec doesn't close in May | Standard variance triage | Most likely: a Plaid sync gap; manual import the missing transactions |
| 3900 non-zero on May 31 close | RE roll-forward fails | Drill into 3900 GL; find the residual entry; correct |

If any failure is detected before May 31 close, fix it. If detected after lock: the lock can be lifted via exception (Lock Everything is reversible); document the override and re-tie.

## Cutover roll-back

If the May 1 cutover demonstrably went wrong (rare, but possible), the recovery path:

1. Restore the pre-cutover Wyatt DB snapshot from step 1 of cutover day.
2. Reverse the inventory pre-flush JE on the QuickBooks side (so QB is back to its pre-flush state).
3. Continue operating in QuickBooks until the issue is fixed and re-cutover is scheduled.

We don't expect to use this. It's documented so the option exists.

## Sign-off

Cutover is complete when:

- All cutover-day steps executed.
- May 1 smoke test passes for AR/AP/inventory/deferred revenue.
- May 31 close completes via the [walkthrough](./walkthrough).
- Migration Suspense (3900) = $0.00 on May 31 TB.
- Cooper has reviewed and signed off on the May close.
- Sales / Purchase / Tax locks set at 2026-04-30; Global Lock set at 2026-05-31.

Everything before May 1 stays in QuickBooks as the historical system of record. Wyatt becomes the system of record from May 1 forward.
