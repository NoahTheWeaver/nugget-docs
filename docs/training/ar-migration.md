---
title: AR Migration Plan — QuickBooks Online → Odoo 19
search: false
description: Internal cutover plan for the open AR import. Not linked from the public nav.
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# AR Migration Plan — QuickBooks Online → Odoo 19

Single source of truth for the design of the open A/R import. The operational runbook will live at `AR_MIGRATION_RUNBOOK.md` (written after this plan is approved).

## Goal

Carry forward Nugget's open Accounts Receivable from QuickBooks Online to Odoo 19, post-cutover, in a way that:

- Ties out **to the penny** with the QBO trial balance AR control account as of the snapshot date.
- Preserves per-invoice aging, original invoice number, and original date so customer payments can be reconciled against the right invoice in Odoo (manually or via Plaid auto-suggest).
- Does **not** re-recognize 2025/2026 revenue or sales tax. The credit side of every entry hits a migration clearing account; Andrea collapses it inside her opening-balance JE.
- Is idempotent and rollback-able, matching the discipline of the existing `scripts/cutover/` suite.

## Source of truth

`data/qbo_imports/ar_migration/AR_Aging_Detail_2026-05-06.xlsx` — QBO **A/R Aging Detail Report**, run "as of Jan 1, 2028" so it captures every open item including future-dated installments.

| Population | Count | Open balance |
|---|---:|---:|
| Open invoices | 106 | $1,192,168.44 |
| A/R adjustment journal entries | 2 | $11,045.00 |
| Unapplied customer payments (negative AR) | 1 | $(2,746.88) |
| **Total open AR** | **109** | **$1,200,466.56** |

Two supporting exports kept for cross-reference:

- `Open_AR_All_Time_2026-05-06.xls` — confirms the invoice + JE total ($1,278,542.38) ties to Aging Detail Amount column ($1,275,795.50) plus the unapplied payment ($2,746.88).
- `Open_AR_PDFs_2026-05-06.pdf` — 106 individual invoice PDFs. Pre-split offline to `data/qbo_imports/ar_migration/pdfs/<invoice>.pdf` and used as chatter attachments on migrated invoices.

**QBO TB control account tie-out (mandatory pre-V3 step):** Andrea pulls QBO Trial Balance as of the snapshot date and confirms the AR control account = $1,200,466.56. If TB and Aging Detail disagree, the snapshot is invalid and we resolve in QBO before proceeding. This step is non-negotiable — without it we're tying the source to itself.

## Real chart-of-accounts codes (post-cutover, verified 2026-05-06)

| Purpose | Code | Name | Account type | id |
|---|---|---|---|---|
| AR control account (Dr side) | `10020` | Accounts Receivable (A/R) | asset_receivable | 5 |
| Migration clearing (Cr side, recommended) | `39000` | Migration Suspense | equity | 258 |
| Deferred revenue (for future-dated overlay in Andrea's opening JE) | `20510` | Unearned Revenue | liability_current | 17 |

**The earlier draft referenced `121000`, `30100`, `19999`, and `21500`. None of those exist on the prod chart.** Using only existing accounts.

## Design decisions

### 1. Per-invoice migration, single stub line

Each open QBO invoice becomes one posted `account.move` of type `out_invoice` in Odoo. Single line per invoice. No product reference, no tax, no multi-line breakdown.

**Why not line items:**

- Credit goes to a migration clearing account, not revenue. Line-level revenue accounts would be cosmetic.
- Re-applying QBO sales tax in Odoo would either double-count or require per-line tax suppression. Neither is clean.
- Product mapping for 106 invoices' line items is unnecessary scope. The estimate importer (cutover step 11) demonstrated how brittle PDF-driven product matching is.
- The original QBO invoice PDF is attached to the move's chatter, so anyone investigating a balance has one-click access to full line detail.

**Why per-invoice (not per-customer JE or single bulk JE):**

- Plaid bank-line reconciliation matches invoice-by-invoice. A per-customer JE forces Andrea to manually allocate every cash receipt. A bulk JE makes cash application impossible.
- Aging only works at the invoice level.
- Audit trail and customer dispute resolution both need per-invoice records.

### 2. Field mapping (out_invoice)

| Odoo field | Source | Notes |
|---|---|---|
| `move_type` | `'out_invoice'` | All current rows are positive open balances |
| `partner_id` | resolved from QBO "Customer full name" via mapping table | mapping built in preflight; halts on any unresolved name |
| `journal_id` | `ARMIG` (sale journal, see #11) | |
| `ref` | QBO invoice number prefixed `QBO-` (e.g., `QBO-10712`) | **primary cash-app match key.** Prefix prevents collision with future Odoo-native invoice sequences |
| `payment_reference` | bare QBO invoice number (e.g., `10712`) | what shows on the customer-facing invoice as "Reference" — customers know the bare number |
| `invoice_date` | QBO invoice date | preserves aging; can be future-dated |
| `invoice_date_due` | QBO due date (Aging Detail "Due date" column) | |
| `date` | post-date flag (default `2026-05-01`) | accounting/post date — keeps the AR debit on the migration period regardless of `invoice_date` |
| `fiscal_position_id` | `False` (explicit) | prevents partner-default fiscal position from injecting taxes via onchange |
| `narration` | QBO memo + sub-customer designation (if any) + `"Migrated from QuickBooks YYYY-MM-DD. See attached PDF for line detail."` | free-form; preserves Bach-style sub-customer traceability |
| `invoice_payment_term_id` | `False` | prevents Odoo from generating any payment-schedule line that would be due before snapshot. Combined with `invoice_date_due` carrying QBO's due date, dunning/follow-up automation will not fire on migrated invoices unless explicitly enabled. |
| `invoice_line_ids` (single) | `account_id` = `39000`, `name` = `"Migrated from QuickBooks — Invoice #<QBO#>"`, `quantity` = 1, `price_unit` = open balance, `tax_ids` = `[(6, 0, [])]` | explicit empty tax list |

**Net GL effect per invoice:** Dr `10020` Accounts Receivable / Cr `39000` Migration Suspense — at the **open balance**, not the original amount. The AR-side line is auto-derived by Odoo from `partner_id.property_account_receivable_id`; the script does not write to it directly. Defensive read-back asserts that the auto-derived AR line resolves to code `10020` for every move; halts on any mismatch.

### 3. Offset account: `39000 Migration Suspense` (existing)

Already on the chart, account_type=equity, semantically correct. Andrea's opening JE collapses it against equity. No new account creation required.

The earlier draft offered `30100 OBE` (doesn't exist) and `19999` (would need to be created). Both are dropped. If Andrea has a strong preference for a dedicated AR-only line for audit clarity, we can create one — but the default is `39000`.

### 4. Snapshot as-of date — assumed 2026-04-30

Aligns with Andrea's opening-balance JE dated 2026-05-01. The script accepts an `--as-of` flag so the date is explicit rather than implicit. Awaiting Andrea's confirmation.

### 5. Future-dated invoices — Policy A with deferred-revenue overlay

37 of 106 invoices are dated after the snapshot (latest: 2027-12-23). These are pre-cut recurring service-contract installments QBO has on AR.

**Default policy: Policy A (mirror QBO) plus deferred-revenue overlay in Andrea's opening JE.**

Mechanics:

- The script migrates all 106 invoices regardless of invoice date. Operational simplicity preserved (no need to remember to re-invoice mid-year).
- Andrea's opening JE adds two lines for the future-dated portion of AR: Dr `39000` Migration Suspense / Cr `20510` Unearned Revenue, in the amount of the future-dated AR.
- As each service period rolls forward, Andrea (or a recurring JE) recognizes revenue: Dr `20510` Unearned Revenue / Cr revenue.

Why this and not Policy A raw: booking AR for unperformed services with no offsetting deferred-revenue liability fails the basic AR definition (unconditional right to consideration for performance rendered or in progress). It overstates AR and overstates retained earnings on the balance sheet. The deferred-revenue overlay corrects this without changing the migration script — the entire correction lives inside Andrea's opening JE.

Fallback: Policy B (truncate at snapshot, only migrate `invoice_date <= snapshot`). Operational cost: someone has to remember to invoice S&G in June, July, August, etc. Acceptable but more failure modes.

The script supports both via `--policy {A,B}`. Awaiting Andrea's call. Plan default: A.

### 6. Partial-payment invoices

Two invoices have partial payments already applied in QBO:

| Invoice | Customer | Original | Open balance | Action |
|---|---|---:|---:|---|
| 10724 | Method Testing Labs | $21,616.50 | $10,906.50 | migrate at $10,906.50, narration: "$10,710.00 paid prior to migration" |
| 10852 | Vibrant America | $64,966.13 | $347.19 | migrate at $347.19, narration: "$64,618.94 paid prior to migration" |

Migrate at **open balance only**. The historical partial payment stays in QBO. Do NOT recreate the original invoice + a separate payment record — that re-recognizes revenue and tax.

### 7. A/R adjustment journal entries — resolve in QBO before snapshot, do not migrate

| Date | Num | Amount | Memo |
|---|---|---:|---|
| 2024-01-31 | `2024.12.44VNADJ` | $10,825.00 | "Ar Adjustment for prior period adjustments and or received payments after 1/31/2024" |
| 2024-12-31 | `2025.08.VN ADJ` | $220.00 | "Tie back to Trial Balance" |

The "customer" on both is QBO's placeholder ("Accounts Receivable Adjustment"), not a real customer. Both entries are 1.5+ years old.

**Recommendation: Andrea investigates and resolves both in QBO before snapshot.** Three outcomes only:

- (a) Real customer money mis-attributed to the placeholder → reattribute in QBO to the right customer, re-run the AR Aging, re-snapshot. Migrate as a normal customer invoice.
- (b) TB plug with no real customer → reverse in QBO with a JE dated in an open QBO period, the bad-debt expense (or other adjustment) hits the right period in QBO. Falls off the snapshot naturally.
- (c) Real but uncollectible → write off in QBO (Dr Bad Debt Expense / Cr AR) with proper period attribution. Falls off the snapshot naturally.

**Do NOT migrate these as JEs in Odoo.** Two reasons:

1. The original dates (2024-01-31, 2024-12-31) are inside the Odoo hard-locked period (lock = 2025-12-31). Posting at original dates would fail. Posting at the snapshot date would put a 2024-period adjustment in May 2026, which obscures the audit trail.
2. The "customer" is a placeholder, not a real partner. Carrying a non-customer AR balance forward into a fresh ledger is the kind of thing that becomes an audit headache in three years.

**Do NOT write off inside Andrea's Odoo opening JE.** A bad-debt write-off is a P&L event and belongs in QBO (the system that recognized the original revenue) in the right period — not in Andrea's Odoo opening JE which is a pure balance-sheet transition.

The script supports `--include-jes` for the rare case Andrea decides to migrate them anyway (e.g., reattribution path). When set, JEs post at the snapshot date (not original date) with original date in the narration. **`--include-jes` requires interactive `yes` confirmation even in non-interactive mode** — it's an escape hatch, not a default path. Default: `--skip-jes`.

If Andrea's chosen resolution path is reattribution (decision #7 outcome a), the re-snapshot will introduce a new "real customer" invoice number. After re-snapshot, `EXPECTED_TOTAL` must be re-confirmed and updated in the script before V3 runs.

### 8. Onepot.ai unapplied payment — `account.move` type=entry, posted to AR

`-$2,746.88` dated 2025-12-22. Real customer credit on AR.

**Model: a posted `account.move` of `move_type = 'entry'` with two lines:**

- Line 1: `account_id = 10020` (AR), `partner_id` = Onepot.ai, `credit = $2,746.88` (this is the customer-credit side, sitting on AR as a negative balance — exactly what QBO shows)
- Line 2: `account_id = 39000` (Migration Suspense), `debit = $2,746.88`
- `journal_id = ARMIG`

The AR-side line is `reconciled = False` initially. When Onepot.ai's next invoice arrives in Odoo, Andrea reconciles the new invoice against this credit line via the standard partner-reconciliation widget (Accounting → Customers → *partner* → reconcile).

**Why not `account.payment`:** would require a journal of type bank/cash, but ARMIG is type=sale (required for `out_invoice`). Routing through a bank journal would imply cash hit our accounts, which it didn't (the cash hit in 2025; we're just carrying the customer credit forward). Modeling as a posted move with the credit on AR mirrors what QBO actually has — a negative AR line for that customer.

**Why not `out_refund`:** would credit revenue (or whatever account the line maps to). We're not recognizing negative revenue.

V3 dress rehearsal must validate end-to-end: post a fake Onepot.ai invoice for $5,000, reconcile against the $2,746.88 credit, confirm $2,253.12 residual is open and a clean partial-reconciliation record is created.

### 9. Customer mapping — preflight halt on any miss

QBO has 43 distinct real customers + 1 sub-customer notation (`Bach Diagnostics:Bach Diagnostics - CO`).

Preflight produces `working/ar_partner_mapping.csv`:

| QBO customer name | Odoo res.partner ID | Match method | Confidence |
|---|---|---|---|

Match logic, in order:

1. Exact name match against `res.partner.name` (active, customer rank > 0)
2. Case-insensitive + punctuation-stripped match (handles "LabCorp (Calabsas)" vs "LabCorp Calabasas")
3. Manual override CSV at `data/qbo_imports/ar_migration/partner_overrides.csv`

**Halts hard on any unresolved name.** No fuzzy auto-match — too risky for AR posting.

### 10. Bach Diagnostics sub-customer — collapse to parent, designation in narration

Both `Bach Diagnostics` and `Bach Diagnostics:Bach Diagnostics - CO` map to the single Bach Diagnostics `res.partner`. The sub-customer designation goes into each migrated move's `narration` field for traceability:

```
QBO sub-customer: Bach Diagnostics:Bach Diagnostics - CO
[QBO memo if any]
Migrated from QuickBooks 2026-05-XX. See attached PDF for line detail.
```

Future project-level segmentation can use Analytic Accounts if needed, separately from this migration.

### 11. AR Migration journal `ARMIG`

Type `sale` (required for `out_invoice`). Created by the script if missing. Dedicated for filterability and rollback isolation. Acknowledged side effect: ARMIG entries appear in "Sales by Journal" reports — filterable by journal name.

### 12. Sequence-collision mitigation

After migration, the Odoo native customer-invoice sequence is bumped past `max(QBO ref) + 1000`. Prevents any future Odoo-native invoice from getting a reference number that collides with a migrated QBO invoice's `payment_reference`. One-time bump, recorded in audit log.

## Run order — explicit sequence (mandatory)

The migration must happen in this order, with each step gating the next:

1. **Andrea resolves the two A/R adjustment JEs in QBO.** They fall off the snapshot. Re-run AR Aging Detail; total may change.
2. **Andrea ties QBO TB AR control account to AR Aging Detail** as of the snapshot date. Both must equal the same number.
3. **AR Aging Detail re-export** to `data/qbo_imports/ar_migration/AR_Aging_Detail_<YYYY-MM-DD>.xlsx`.
4. **V3 dress rehearsal** runs the script. Andrea spot-checks 5 customers + grand total. Cash-application and credit-application tests pass.
5. **Production run** — script executes against prod.
6. **Andrea reconciles May 2026 Plaid bank lines** against the now-existing migrated invoices. Cash receipts on migrated invoices land cleanly because the invoices exist.
7. **Andrea posts her opening-balance JE** dated 2026-05-01. Includes:
   - Sweep of `39000` Migration Suspense against equity (collapses the AR migration credit)
   - Deferred-revenue overlay: Dr `39000` / Cr `20510` for the future-dated AR portion (per Policy A+)
   - All non-AR balance-sheet items (AR is already represented by migrated invoices, so opening JE excludes AR)
8. **Andrea sets Global Lock** = 2026-04-30 once Plaid is fully reconciled.

Steps 1–3 happen in QBO, before any Odoo writes. Steps 4–8 happen in Odoo.

**Risk if order is violated:** if Andrea reconciles Plaid lines before AR migration runs, cash receipts on QBO invoices land in suspense with no Odoo invoice to apply against, and have to be re-reconciled later. If the opening JE is posted before AR migration, AR ends up double-stated.

## Sales tax filing footnote

Odoo's tax reports cover **May 2026 forward only**. For any sales-tax filing covering periods where QBO was the system of record (any period ending ≤ 2026-04-30), pull from QBO. Migrated AR records have no `tax_ids` (intentional — tax was already recognized and remitted in QBO), so they return zero tax on Odoo's tax reports. Avalara / Justin: be aware of the QBO-vs-Odoo split for any May-period filings.

This goes in `AR_MIGRATION_RUNBOOK.md` and on Andrea's May tax-filing checklist.

## Script structure

`scripts/cutover/14_import_qbo_ar.py` (numbered after the existing 13 cutover steps so it sits in the same suite, even though it runs post-cutover).

### CLI

```
python 14_import_qbo_ar.py --dry-run
python 14_import_qbo_ar.py --as-of 2026-04-30 --post-date 2026-05-01
python 14_import_qbo_ar.py --policy A --include-jes
python 14_import_qbo_ar.py --rollback working/ar_state_pre_<ts>.json
```

Flags:

- `--dry-run` — print every move that would be created, with totals and tie-out report. No writes.
- `--as-of YYYY-MM-DD` — snapshot date (defaults to constant in script).
- `--post-date YYYY-MM-DD` — `account.move.date` for all migrated moves (defaults to snapshot date + 1).
- `--source PATH` — path to the Aging Detail xlsx (defaults to the file in `data/qbo_imports/ar_migration/`).
- `--policy {A,B}` — A=mirror (default), B=truncate at snapshot date.
- `--include-jes / --skip-jes` — controls whether the two A/R adjustment JEs are migrated. Default `--skip-jes` (per decision #7).
- `--rollback FILE` — read a rollback bundle and undo. Reverses moves to draft and deletes them.
- `--only-customer NAME` — debug flag to migrate one customer's invoices in isolation.

### Phases

1. **Preflight** (read-only, halts on FAIL):
   1. ARMIG sale journal exists or can be created.
   2. AR account `10020` exists and has `account_type='asset_receivable'`.
   3. Migration Suspense `39000` exists and has `account_type='equity'`.
   4. Customer mapping resolves 100% — no unresolved names.
   5. **Journal-scoped** duplicate check: no `account.move` exists in `ARMIG` journal with a `ref` matching any QBO invoice number from this run.
   6. Onepot.ai partner exists, is active, has a valid `property_account_receivable_id`.
   7. Total open balance from xlsx ties to constant `EXPECTED_TOTAL = 1_200_466.56` (hardcoded in script, not CLI flag — tie-out invariant). Halts on mismatch.
   8. Period containing `--post-date` is open: post date > 2025-12-31 (hard lock), post date <= today + 7 days (catches typo'd far-future post dates), and not inside any soft lock.
   9. Snapshot date sanity check (warn if > 7 days old).
   10. Every resolved partner is `active=True` and `customer_rank > 0`. A partner archived between preflight and run will resolve by id but post will fail unhelpfully — halt early.
   11. Pre-split PDFs exist in `data/qbo_imports/ar_migration/pdfs/<invoice>.pdf` for all 106 invoices (script does not split PDFs at runtime).

2. **Snapshot pre-state** to `working/ar_state_pre_<UTC>.json`:
   - List of existing `account.move` IDs in `ARMIG` journal.
   - List of existing `account.move` IDs touching Onepot.ai's AR (for credit rollback).
   - Used by `--rollback`.

3. **Migrate invoices** (106 rows, or fewer if `--policy B`):
   - Build `account.move` payload, create in batches of 25, post immediately after create.
   - Attach the corresponding pre-split PDF to the move's chatter as `ir.attachment`.
   - Read back the posted move; assert AR-side line `account_id` resolves to `10020`. Halt on mismatch.

4. **Migrate JEs** (0 rows by default; 2 only if `--include-jes`):
   - Create `account.move` of type `entry` with two lines: Dr `10020` / Cr `39000`.
   - Date = snapshot date (NOT original 2024 dates — those are hard-locked).
   - Narration carries original date.

5. **Migrate Onepot.ai unapplied payment** (1 row):
   - Create posted `account.move` type=entry per #8.
   - Validate that the AR-side line is `reconciled=False`, `amount_residual_signed = -2746.88` (negative because it's a credit balance from the company's perspective), and visible in the partner reconciliation widget.

6. **Bump customer-invoice sequence** past `max(QBO ref) + 1000` (per #12).

7. **Tie-out report** to `working/ar_tieout_<UTC>.json`:
   - Per-customer subtotals: QBO open balance vs Odoo posted AR (sum of `account.move.line` on `10020`, filtered by partner).
   - Grand total: must equal $1,200,466.56 ± rounding.
   - Aging-bucket spec: includes "future / not due" bucket so Andrea's tie-out works at $1.2M, not ~$880K.
   - Halts with non-zero exit if tie-out fails.

8. **Audit log** to `data/cutover-runs/<UTC>-ar_migration.log` (matches existing per-run log naming convention used by the cutover suite, e.g. `20260502T040421Z-production.log`):
   - One line per created move: QBO invoice #, customer, amount, Odoo move ID, attachment ID.
   - Per-move chatter line on the move itself: same content (so an auditor pulling the move sees the source ref without grepping log files).

### Idempotency

Existence check: `(ref, journal_id)` only. If a move with `ref = 'QBO-10712'` exists in `ARMIG`, skip. If it exists with mismatched `partner_id` or `amount`, halt with explicit error — operator must investigate.

Dropped from the v1 match key: `amount` and `partner_id`. Including them would create duplicates if anything changes between dry-run and live (e.g., a payment lands and the open balance drops).

### Rollback

`--rollback working/ar_state_pre_<UTC>.json` reads pre-state, finds delta moves in `ARMIG` journal, and undoes them safely:

1. For each move, iterate `account.move.line`. For any line with `full_reconcile_id` set, call `remove_move_reconcile()` (breaks any Plaid auto-applied reconciliation).
2. After reconciliation is broken, call `button_draft` on the move.
3. After draft, call `unlink`.
4. If `remove_move_reconcile()` fails (e.g., rec involves a locked period), halt and surface which Plaid statement line is blocking. Do not force.
5. Restore Odoo's customer-invoice sequence to its pre-bump value, **only if** `ir.sequence.number_next_actual` has not advanced past the pre-bump value. If it has (someone created an Odoo-native invoice between bump and rollback), halt and let the operator decide whether to leave the bumped sequence in place.

Rollback failure modes are surfaced explicitly: `"Move QBO-10712 is reconciled against bank statement line {id} dated {date}. Break reconciliation in Accounting → Bank → {statement} before retrying rollback."`

## Test plan

### Stage 0 — Pre-snapshot work in QBO (Andrea)

1. Investigate and resolve the two A/R adjustment JEs (decision #7).
2. Pull QBO Trial Balance as of snapshot date. Confirm AR control account ties to AR Aging Detail open balance grand total.
3. Re-export AR Aging Detail to repo. Update `EXPECTED_TOTAL` constant in script if total changed.

### Stage 1 — V3 dress rehearsal (`stage-dress-rehearsal-v3`)

1. Confirm V3 is a clean clone of post-cutover prod. If drifted, request Odoo.sh re-clone before proceeding.
2. Switch `scripts/.env` to V3 block.
3. Run `python 14_import_qbo_ar.py --dry-run`. Inspect output:
   - All rows resolved; customer mapping 43/43.
   - Tie-out: matches `EXPECTED_TOTAL`.
   - No tax lines on any move.
4. Run for real.
5. Andrea spot-checks 5 customers in V3:
   - One simple single-invoice customer (Copia Scientific)
   - One multi-invoice service-contract customer (S&G Clinical, 4 installments) — verify aging buckets put future-dated installments in "future / not due"
   - LabCorp (Calabsas) — verify partner mapping handled the typo
   - Bach Diagnostics — verify sub-customer collapse + narration shows the original sub-customer designation
   - Onepot.ai — verify the credit appears in the partner reconciliation widget
6. Andrea pulls Odoo AR Aging via **Accounting → Reporting → Partner Reports → Aged Receivable**. Filter: As-of date = `--post-date`, "Not Due" bucket included. Confirms grand total = `EXPECTED_TOTAL`. (Filtering only "Due" buckets returns ~$880K because future-dated installments sit in "Not Due" — must include all buckets.)
7. Cash-application test: post a fake bank statement line for $1,666 to S&G Clinical; run reconciliation; confirm Odoo suggests `QBO-10712` (or whichever installment).
8. Credit-application test: post a fake Onepot.ai invoice for $5,000; reconcile against the migrated credit; confirm $2,746.88 credit applies and $2,253.12 residual is open on the new invoice.
9. Rollback test: run `--rollback` against the V3 pre-state. Confirm all migrated moves are gone, the credit move is gone, the sequence bump is reverted.

### Stage 2 — Production

Only after V3 passes and design review approval.

1. PG dump + filestore tarball of prod (per existing CUTOVER_RUNBOOK rollback section).
2. Switch `.env` to PRODUCTION block.
3. Run `--dry-run` first. Re-confirm tie-out.
4. Run for real.
5. Andrea verifies AR Aging in prod equals `EXPECTED_TOTAL`.
6. Andrea reconciles May Plaid lines (per run-order #6).
7. Andrea posts opening-balance JE with deferred-revenue overlay (per run-order #7).
8. Andrea sets Global Lock to 2026-04-30 (per run-order #8).

## Open decisions (Andrea + Justin checkin)

1. **Two A/R adjustment JEs** ($11,045): which path — reattribute, reverse, or write off in QBO? (None of those touch Odoo.)
2. **Future-dated invoice policy**: A with deferred-revenue overlay (default) or B (truncate)?
3. **Offset account confirmation**: `39000 Migration Suspense` (recommended, exists) is fine?
4. **Snapshot as-of date**: 2026-04-30?
5. **QBO TB tie-out**: AR control account = $1,200,466.56 as of snapshot date?

For Justin: aware of the QBO-vs-Odoo sales-tax filing split for May filings?

## Post-migration recurring obligations (owners)

- **Recurring revenue recognition for the deferred-revenue overlay.** Each future-dated installment is sitting in `20510 Unearned Revenue` after Andrea's opening JE. As each service period rolls forward, the recognition entry is `Dr 20510 / Cr <revenue account>`. **Owner: Andrea.** Schedule: monthly recurring JE, set up before the first post-migration month-end (May 31, 2026). Without this, future-period revenue is understated and `20510` grows indefinitely.
- **Global Lock advance.** After May Plaid lines are reconciled, Andrea sets `fiscalyear_lock_date = 2026-04-30`. If any May Plaid line remains unreconciled at lock time, document the stragglers with reason and proceed with Andrea's judgment — the lock is not gated on 100% Plaid reconciliation, but the unreconciled lines must be tracked so they don't get forgotten.

## Out of scope

- Migrating closed/paid QBO invoices. QBO remains the historical archive for closed periods.
- Migrating QBO sales tax detail. Tax was already recognized and remitted in QBO.
- Recreating QBO invoice line items in Odoo. PDFs serve as line-detail archive via chatter.
- Migrating customer statements. Statements are generated on-demand from Odoo's AR ledger post-migration.
- A/P, vendor bills, or any non-customer balance. Vendor open bills are a separate migration.
- Setting up Odoo Subscriptions for the recurring customers whose installments we migrated. **Until each migrated future-dated installment is consumed (paid + reconciled), do NOT enable Odoo-native recurring billing for those customers** — risk of double-invoicing the same service period. Out of scope for this script; flag for Andrea + Bo.
