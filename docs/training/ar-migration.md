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

## Meeting outcomes (2026-05-06 with Andrea Swords + Justin Werth)

The plan below incorporates Justin's preferred patterns and Andrea's commitments. Prior versions are superseded.

| Question | Decision |
|---|---|
| Past-due / current invoices | **Single stub line, tax included in rollup** |
| Future-dated unsent invoices | **Manual line-item drafts in Odoo, not in script** |
| Offset account | **New "QBO Migration Clearing" income account, accessed via stub product**, NOT 39000 Migration Suspense |
| Snapshot date | 2026-04-30 (Andrea closes April in QBO first — must be exquisite) |
| Two old A/R adjustment JEs ($11,045) | Andrea will resolve in QBO before snapshot. Falls off naturally. |
| Onepot.ai unapplied payment | `account.move` type=entry posted to AR |
| Active service contracts (renewal management) | **`$0` Odoo subscriptions** for legacy contracts; renewal logic kicks in at next cycle. **Out of scope for AR script.** |
| Paid-in-advance contract revenue recognition | **Excel rev-rec spreadsheet** with monthly JEs (Noah builds, Andrea posts). **Out of scope for AR script.** |
| Sales tax | No re-recognition in Odoo; QBO already filed |

## Goal

Carry forward Nugget's open Accounts Receivable from QuickBooks Online to Odoo 19, post-cutover, in a way that:

- Ties out **to the penny** with the QBO trial balance AR control account as of the snapshot date.
- Preserves per-invoice aging, original invoice number, and original date so customer payments can be reconciled against the right invoice in Odoo.
- Does **not** re-recognize 2025/2026 revenue or sales tax. Uses an interim income clearing account; Andrea washes it inside her opening-balance JE.
- Splits cleanly between machine-migrated past-due/current AR and manually-created future-dated drafts, so each invoice is in the right state for its workflow.

## Source of truth

`data/qbo_imports/ar_migration/AR_Aging_Detail_2026-05-06.xlsx` — QBO **A/R Aging Detail Report**, run "as of Jan 1, 2028" so it captures every open item.

| Bucket | Count | Open balance | Path |
|---|---:|---:|---|
| Past-due / current open invoices (date ≤ 2026-04-30) | 66 | $960,013.12 | **A — script** |
| Future-dated unsent invoices (date > 2026-04-30) | 40 | $232,155.32 | **B — manual draft** |
| A/R adjustment journal entries | 2 | $11,045.00 | **Andrea sweeps in QBO** |
| Onepot.ai unapplied payment | 1 | $(2,746.88) | **A — script (credit move)** |
| **Total open AR (current QBO Aging Detail)** | **109** | **$1,200,466.56** | |
| **Net Odoo posted AR target after Path A migration** | | **$957,266.24** | (Path A invoices + Onepot credit) |

The two A/R adjustment JEs and the future-dated invoices come off the QBO AR control account before the migration runs, so the migration script's tie-out target is $957,266.24, matching what Andrea's cleaned-up QBO TB will show on 4/30.

`Open_AR_PDFs_2026-05-06.pdf` — 106 individual invoice PDFs. Pre-split offline. Used as chatter attachments on Path A invoices and as the source for Path B drafts.

**QBO TB control account tie-out (mandatory pre-V3 step):** After Andrea closes April in QBO, sweeps the two old JEs, and excludes the future-dated unsent installments from AR, the QBO TB AR control account = $957,266.24. This is the script's lock-in target.

## Real chart-of-accounts codes

| Purpose | Code | Name | Account type | Status |
|---|---|---|---|---|
| AR control account (Dr side) | `10020` | Accounts Receivable (A/R) | asset_receivable | exists |
| **NEW** — Path A offset (stub product income account) | `40090` | QBO AR Migration Clearing | income | **create as part of cutover** |
| Equity holding for opening JE balancing | `39000` | Migration Suspense | equity | exists |
| Deferred revenue (for paid-in-advance contracts via Excel JE) | `20510` | Unearned Revenue | liability_current | exists |

Justin's pattern: the stub product carries the **income** account, not equity. The migration's net effect is Dr `10020` AR / Cr `40090` Clearing on each invoice. After all invoices post, Andrea's opening JE washes `40090` against equity, zeroing the Clearing account.

Code `40090` is a placeholder — Andrea picks the actual code in the income range during creation.

## Design decisions

### 1. Two paths

**Path A — past-due / current open invoices (script):**

- Migrated as posted `account.move` of type `out_invoice` with a **single stub line**.
- Stub line uses a dedicated stub product (`QBO Migrated Invoice`) whose income account is `40090 QBO AR Migration Clearing`.
- Net GL effect: Dr `10020` AR / Cr `40090` Clearing — at the **gross open balance** (tax already-recognized in QBO is included in the stub price; no `tax_ids` on the line).
- Original QBO PDF attached to chatter for line-item archive.
- One run, idempotent, rollback-able.

**Path B — future-dated unsent invoices (manual):**

- 40 invoices with `invoice_date > 2026-04-30`. Currently sit on QBO AR but haven't been sent to customers.
- **Created manually in Odoo by Noah/Andrea** as DRAFT customer invoices (`out_invoice` in state `draft`) with full line-item detail copied from the QBO PDFs.
- Drafts are NOT on AR until confirmed. They wait in Odoo's Invoices list for their original date, then are confirmed and emailed to the customer.
- Andrea voids / removes these from QBO AR before snapshot so QBO TB doesn't double-count.
- ~3 hours of data entry. Quicker than parsing PDFs and less error-prone than auto-mapping QBO line items to Odoo products.

**Why split:**

- Past-due/current invoices have already been sent. Customer holds a copy. Single-stub line is fine — they won't see Odoo's version unless we re-send. Plaid reconciliation matches by amount + ref + customer.
- Future-dated invoices haven't been sent. When their date arrives, Odoo will email them to the customer. Customer needs to see real line items, real product names, real prices — so the draft in Odoo must look like a normal Odoo invoice.

### 2. Field mapping — Path A invoices

| Odoo field | Source | Notes |
|---|---|---|
| `move_type` | `'out_invoice'` | All Path A rows are positive open balances |
| `partner_id` | resolved from QBO Customer full name via mapping | preflight halts on any unresolved name |
| `journal_id` | `ARMIG` (sale journal) | dedicated for filterability and rollback |
| `ref` | `QBO-{invoice#}` (e.g., `QBO-10712`) | primary cash-app match key, prefixed to avoid Odoo sequence collision |
| `payment_reference` | bare QBO invoice number | what shows on customer-facing invoice as Reference |
| `invoice_date` | QBO invoice date | preserves aging |
| `invoice_date_due` | QBO due date | from Aging Detail Due date column |
| `date` | post-date flag (default `2026-05-01`) | accounting date; keeps debit on the migration period |
| `fiscal_position_id` | `False` (explicit) | prevents tax injection via partner default |
| `invoice_payment_term_id` | `False` | suppresses dunning automation on migrated invoices |
| `narration` | QBO memo + sub-customer designation + `"Migrated from QuickBooks YYYY-MM-DD. See attached PDF for line detail."` | free-form; preserves Bach-style sub-customer traceability |
| `invoice_line_ids` (single) | `product_id` = stub product `QBO Migrated Invoice`, `name` = `"Migrated from QuickBooks — Invoice #{QBO#}"`, `quantity` = 1, `price_unit` = open balance, `tax_ids` = `[(6, 0, [])]` | stub product income account = `40090` Clearing; explicit empty tax list |

**Net GL effect per Path A invoice:** Dr `10020` AR / Cr `40090` Clearing — at the gross open balance. AR-side line is auto-derived by Odoo from `partner_id.property_account_receivable_id`. Defensive read-back asserts AR line resolves to code `10020`; halts on mismatch.

### 3. Field mapping — Path B drafts (manual)

Created manually in Odoo Invoicing UI:

- `move_type = 'out_invoice'`, state stays `draft`
- `partner_id` = customer
- `ref` = QBO invoice number for traceability
- `invoice_date` = original QBO date
- `invoice_date_due` = original due date
- `invoice_line_ids` = real product references with `product_id`, `quantity`, `price_unit`, and any applicable `tax_ids` from the product config
- Source data: per-invoice PDFs in `data/qbo_imports/ar_migration/pdfs/`

When the invoice's date arrives, Andrea/sales team confirms it (`button_post`), Odoo creates the AR + revenue + tax entries, and the customer receives the email.

**No script logic for Path B.** Manual entry is the right tool for 40 records when the cost of script + product mapping + tax configuration audit exceeds the data-entry hours.

### 4. Stub product `QBO Migrated Invoice`

Created once as part of cutover prep. Not used for new business.

- `name` = "QBO Migrated Invoice"
- `default_code` = `QBO-MIG`
- `type` = service
- `taxes_id` = empty
- `property_account_income_id` = `40090` QBO AR Migration Clearing
- `sale_ok` = False
- `purchase_ok` = False
- After migration: archived so nobody mistakenly invoices a customer with it.

### 5. Onepot.ai unapplied payment — `account.move` type=entry

`-$2,746.88` dated 2025-12-22. Real customer credit on AR.

Modeled as a posted `account.move` of `move_type = 'entry'` with two lines:

- Line 1: `account_id = 10020` AR, `partner_id` = Onepot.ai, `credit = $2,746.88`
- Line 2: `account_id = 40090` Clearing, `debit = $2,746.88`
- `journal_id = ARMIG`

The AR-side line is `reconciled = False` initially. When Onepot.ai's next invoice arrives in Odoo, Andrea reconciles the new invoice against this credit line via the partner reconciliation widget (Accounting → Customers → *partner* → reconcile).

**Why not `account.payment`:** journal-type conflict — payments require bank/cash, ARMIG is sale.

**Why not `out_refund`:** would create negative revenue; we're not recognizing anything.

Read-back asserts AR-side line `reconciled=False` and `amount_residual_signed = -2746.88`.

### 6. A/R adjustment journal entries — Andrea resolves in QBO

| Date | Num | Amount | Memo |
|---|---|---:|---|
| 2024-01-31 | `2024.12.44VNADJ` | $10,825.00 | "Ar Adjustment for prior period adjustments and or received payments after 1/31/2024" |
| 2024-12-31 | `2025.08.VN ADJ` | $220.00 | "Tie back to Trial Balance" |

Andrea will investigate and resolve in QBO (reattribute / reverse / write off) before snapshot. They fall off the AR Aging naturally. **No `--include-jes` path in the script** — removed.

### 7. Customer mapping — preflight halt on any miss

QBO has 43 distinct real customers + 1 sub-customer notation (`Bach Diagnostics:Bach Diagnostics - CO`).

Preflight produces `working/ar_partner_mapping.csv`. Match logic, in order:

1. Exact name match against `res.partner.name` (active, customer rank > 0)
2. Case-insensitive + punctuation-stripped match
3. Manual override CSV at `data/qbo_imports/ar_migration/partner_overrides.csv`

Halts hard on any unresolved name.

### 8. Bach Diagnostics sub-customer — collapse to parent

Both `Bach Diagnostics` and `Bach Diagnostics:Bach Diagnostics - CO` map to the single Bach Diagnostics partner. Sub-customer designation goes into the `narration` field.

### 9. AR Migration journal `ARMIG`

Type `sale` (required for `out_invoice`). Created by the script if missing. Dedicated for filterability and rollback isolation.

### 10. Sequence-collision mitigation

After Path A migration, the Odoo native customer-invoice sequence is bumped past `max(QBO ref) + 1000`. Prevents future Odoo-native invoices from getting reference numbers that collide with migrated QBO invoices.

## Run order — explicit sequence (mandatory)

1. **Andrea closes April in QBO.** Diligently. Reconciles physical inventory variance ($20K Andrea is investigating). Sweeps the two A/R adjustment JEs. Excludes future-dated unsent invoices from the 4/30 AR control account.
2. **Andrea pulls QBO Trial Balance as of 2026-04-30.** Confirms AR control account = $957,266.24. Lock-in for script's `EXPECTED_TOTAL`.
3. **Andrea posts trial balance migration JE in Odoo.** Loads opening balances for non-AR accounts using the cleaned QBO TB.
4. **Andrea creates the `40090` clearing account and stub product.**
5. **Path B drafts created manually** by Noah/Andrea — 40 future-dated unsent invoices, with line items, in `draft` state.
6. **AR migration script run** — creates 66 Path A invoices + the Onepot.ai credit move, posts everything, ties out to $957,266.24.
7. **Andrea reconciles May 2026 Plaid bank lines** against migrated invoices.
8. **Andrea posts the cutover JE that washes `40090` Clearing** to its appropriate equity counter. Net effect: AR has been transferred from QBO to Odoo, the clearing account is zero, equity is unchanged.
9. **Andrea sets Global Lock** = 2026-04-30 once Plaid is fully reconciled.

**Risk if order is violated:** if Plaid reconciles before AR migration, cash receipts on QBO invoices have nothing to match. If clearing account isn't washed, balance sheet has a stray $957K Cr balance.

## Related workstreams (out of scope for this plan)

- **`$0` subscriptions for legacy active service contracts.** For renewal management. Do NOT use for revenue recognition. Owner: Noah, before May close.
- **Excel rev-rec spreadsheet for paid-in-advance contracts.** 12 monthly tabs through 2027-04. Each tab has the JE for that month. Owner: Noah builds, Andrea posts.
- **Inventory migration.** Average-cost approach: import on-hand quantities via inventory adjustments hitting an Inventory Adjustment expense; trial balance carries the total against an Interim Inventory account; final JE washes interim against adjustment expense. Most parts get $0 cost initially; serialized STAR systems get specific costs. Average gradually catches up over a year. Owner: Noah + Bo, before May close.
- **AP migration.** Same shape as AR: interim clearing account, stub product or per-bill JE. Owner: TBD.
- **1099 handling at year-end.** Either consolidate manually from both systems, or load YTD QBO vendor bills into Odoo and let Odoo run year-end. Owner: Andrea, decision before December.
- **Avalara state nexus tracking.** Andrea confirms Avalara tracks new economic nexus. Tori transfers existing-state management to Avalara. Owner: Tori + Andrea.

## Sales tax filing footnote

Odoo's tax reports cover **May 2026 forward only**. For any sales-tax filing covering periods where QBO was the system of record, pull from QBO. Path A migrated invoices have no `tax_ids` (intentional — tax was already recognized and filed in QBO). Path B drafts get real `tax_ids` from product config and will recognize tax when confirmed in Odoo.

## Script structure

`scripts/cutover/14_import_qbo_ar.py`. Path A only (Path B is manual).

### CLI

```
python 14_import_qbo_ar.py --dry-run
python 14_import_qbo_ar.py --as-of 2026-04-30 --post-date 2026-05-01
python 14_import_qbo_ar.py --rollback working/ar_state_pre_<ts>.json
```

Flags:

- `--dry-run` — print every move that would be created with totals + tie-out report. No writes.
- `--as-of YYYY-MM-DD` — snapshot date.
- `--post-date YYYY-MM-DD` — accounting date for migrated moves.
- `--source PATH` — path to Aging Detail xlsx.
- `--rollback FILE` — undo by reverting moves to draft and unlinking.
- `--only-customer NAME` — debug flag.

### Phases

1. **Preflight** (read-only, halts on FAIL):
   1. ARMIG sale journal exists or can be created.
   2. AR account `10020` exists, `account_type='asset_receivable'`.
   3. Clearing account `40090` exists, `account_type='income'`.
   4. Stub product `QBO Migrated Invoice` exists with `40090` as income account.
   5. Customer mapping resolves 100%.
   6. Journal-scoped duplicate check on ARMIG.
   7. Onepot.ai partner exists, active, valid `property_account_receivable_id`.
   8. Path A total from xlsx = `EXPECTED_TOTAL = 957_266.24`.
   9. Period containing post-date is open.
   10. Snapshot date sanity check.
   11. Every resolved partner is `active=True` and `customer_rank > 0`.
   12. Pre-split PDFs exist in `data/qbo_imports/ar_migration/pdfs/` for all 66 Path A invoices.

2. **Snapshot pre-state** to `working/ar_state_pre_{UTC}.json`.

3. **Migrate Path A invoices** (66 rows):
   - Build payload with stub product, single line, no tax.
   - Create in batches of 25, post immediately.
   - Attach PDF to chatter.
   - Read back: assert AR-side `account_id` resolves to `10020`.

4. **Migrate Onepot.ai unapplied payment** (1 row).

5. **Bump customer-invoice sequence** past `max(QBO ref) + 1000`.

6. **Tie-out report** to `working/ar_tieout_{UTC}.json`:
   - Per-customer subtotals: QBO open balance vs Odoo posted AR.
   - Grand total: $957,266.24 ± rounding.
   - Halts on tie-out failure.

7. **Audit log** to `data/cutover-runs/{UTC}-ar_migration.log`:
   - One line per created move + per-move chatter line.

### Idempotency

Existence check: `(ref, journal_id)` only. Mismatched amount or partner → halt.

### Rollback

`--rollback working/ar_state_pre_{UTC}.json`:

1. Iterate move lines; `remove_move_reconcile()` on any with `full_reconcile_id`.
2. `button_draft` on the move.
3. `unlink`.
4. Halt with explicit Plaid statement line ID if reconciliation can't be broken.
5. Restore Odoo's customer-invoice sequence to pre-bump value, only if `number_next_actual` hasn't advanced past it.

## Test plan

### Stage 0 — Pre-snapshot work in QBO (Andrea)

1. April close in QBO; reconcile physical inventory variance.
2. Resolve the two A/R adjustment JEs.
3. Exclude future-dated unsent invoices from 4/30 AR control account.
4. Pull QBO TB; confirm AR control = $957,266.24.
5. Re-export AR Aging Detail to repo if anything changed; update `EXPECTED_TOTAL`.

### Stage 1 — V3 dress rehearsal

1. Confirm V3 is a clean clone of post-cutover prod.
2. Switch `scripts/.env` to V3 block.
3. Andrea creates `40090` clearing + stub product on V3.
4. Run `--dry-run` — inspect: 66 Path A rows resolved, customer mapping 43/43, tie-out matches `EXPECTED_TOTAL`, no tax lines.
5. Run for real.
6. Andrea spot-checks 5 customers in V3:
   - Single-invoice customer (Copia Scientific)
   - Multi-invoice past-due customer (LabCorp Calabasas — covers partner-mapping typo)
   - Bach Diagnostics — sub-customer collapse + narration shows original designation
   - Onepot.ai — credit appears in partner reconciliation widget
   - One Path B test: manually create one draft invoice with line items in V3; verify it stays in draft and doesn't hit AR
7. Andrea pulls Odoo Aged Receivable. Grand total = `EXPECTED_TOTAL`. Path B drafts should NOT appear.
8. Cash-application test: post a fake $1,666 bank statement line to S&G Clinical; reconcile; confirm Odoo suggests `QBO-10712`.
9. Credit-application test: post a fake Onepot.ai invoice for $5,000; reconcile against the credit; confirm $2,253.12 residual.
10. Path B confirmation test: confirm one draft on its date; verify it posts cleanly, hits AR, recognizes revenue + tax in Odoo.
11. Rollback test: `--rollback`. All Path A moves gone; Onepot credit gone; sequence restored. Path B draft untouched.

### Stage 2 — Production

Only after V3 passes and design review approval.

1. PG dump + filestore tarball of prod.
2. Switch `.env` to PRODUCTION block.
3. Andrea creates `40090` + stub product on prod.
4. Andrea creates Path B drafts in prod (manual, ~3 hours).
5. `--dry-run` — re-confirm tie-out.
6. Run for real.
7. Andrea verifies AR Aging in prod equals `EXPECTED_TOTAL`.
8. Andrea reconciles May Plaid lines.
9. Andrea posts opening JE washing `40090` clearing.
10. Andrea sets Global Lock to 2026-04-30.

## Open follow-ups (post-meeting)

- Andrea: confirm `40090` (or chosen code) for the QBO Migration Clearing income account.
- Andrea: pull QBO TB on 4/30 (after sweep + future-dated exclusion); confirm AR control = $957,266.24 or update `EXPECTED_TOTAL` accordingly.
- Andrea: Odoo training (10 hours + certification).
- Tori: Avalara state-nexus transfer process.
- Justin: thumbs-up on this v3 plan via email Friday.
- Noah: deferred-revenue Excel spreadsheet for paid-in-advance contracts.
- Noah: `$0` subscriptions for active service contracts.
- Noah: inventory migration plan (separate doc).

## Out of scope

- Migrating closed/paid QBO invoices. QBO remains the historical archive.
- Migrating QBO sales tax detail. Tax was already filed.
- Recreating Path A line items. PDFs serve as line-detail archive via chatter.
- A/P, vendor bills, or any non-customer balance.
- Historical MRR / churn dashboards. `$0` subscriptions break MRR for the migration window; that's accepted — pre-cutover MRR comes from QBO.
- Setting up Odoo-native recurring billing on customers whose Path B drafts are in flight. Until each Path B draft is consumed (sent + paid), do NOT enable native recurring on those customers — risk of double-invoicing.
