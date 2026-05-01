---
title: Variance Triage
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Variance Triage

What to do when the trial balance doesn't tie to a sub-ledger. Decision tree because that's how it actually plays out.

## Variance severity

Three levels of response, scaled by size:

| Variance size | Response |
|---|---|
| Under $0.02 per account | Rounding. Log it, don't investigate. (See "When to plug" below.) |
| $0.02 to $5,000 (or 5% of pre-tax income), whichever is lower | Triage during close. Resolve before sign-off. |
| Above $5,000 / 5% threshold | **Stop the close.** Escalate to Noah. Notify Cooper. Don't lock until resolved or a documented accepted variance is signed off by Cooper. |

The escalation threshold is Cooper's general materiality posture for an entity at Nugget's scale. Cooper may revise. Confirm with her annually.

## The general method

When a control account's TB balance doesn't equal its sub-ledger:

1. **Don't reconcile by force.** Don't post a plug JE to make them match. The variance has a cause; find it.
2. **Drill from the bigger side.** Whichever balance is larger, drill into it first. The extra activity is on that side.
3. **Look at recent first.** Most variances are caused by something posted in the last week of the period (cutoff issues) or in the first day or two of the next period (date-error issues).
4. **Check direct postings.** Open the GL filtered to the control account. Any JE that hit it without a matching customer/vendor/product line is a direct posting and is the most likely cause.

## Symptoms and likely causes

### TB AR > Aged Receivable

GL has more AR than the aging shows. Possible causes:

- **A direct JE was posted to AR.** Open General Ledger → 1200 → click any line → look for any JE with a missing partner. To find them faster: open the GL, sort by Partner column, blank-partner rows float to the top. Anything found is a manual JE that bypassed an invoice. Either reverse it and post via an invoice, or reclass to a different account if it wasn't really AR.
- **A customer record was archived after invoicing.** The aging report sometimes hides archived partners; the GL still has the balance. Un-archive briefly, re-pull aging, re-archive.

### TB AR < Aged Receivable

Aging shows more than GL. Causes:

- **A payment was applied to an invoice but the JE is in draft.** Aging shows what the invoice says; GL only counts posted JEs. Find the draft payment and post it.
- **A credit memo was issued but not yet applied.** Aging treats it as outstanding; GL sees the offset. Apply the credit.

### TB AP > Aged Payable

Same pattern as AR-too-high, on AP side. Direct JE to AP, archived vendor.

### TB AP < Aged Payable

Draft payment, unapplied credit. Same playbook.

### Bank GL ≠ Reconciled Balance

Most common variance, easiest to investigate.

- **Outstanding deposits or checks.** Bank rec shows them as outstanding; GL has them already. Confirm: TB cash = Reconciled + Outstanding. If yes, you're tied; the report is showing the right thing.
- **A bank fee was deducted by the bank but not yet posted to GL.** Find on the bank statement, post the JE, re-run rec.
- **A duplicate payment was posted to GL.** Less common; happens when a Ramp transaction is also entered manually. Find one and reverse.

### Inventory GL ≠ Inventory Valuation

- **A stock move posted in the wrong period.** Most common at month-end. Identify the move, reverse, repost in correct period.
- **A manufacturing order's labor JE didn't post.** MO consumed components but labor cost didn't roll. Re-trigger or post manually.
- **A receiving was done but the vendor bill didn't book.** Inventory went up, AP didn't. The variance flows to GRNI (1330), not directly to inventory. Tie GRNI separately. If GRNI doesn't tie either, you have a real problem; trace each open receipt to a real receiving record.
- **A product category exists without a configured valuation account.** All products in that category aggregate to the default inventory account regardless of intent. Bo and Andrea jointly review the product category configuration.

### Deferred Revenue GL ≠ Schedule

The most-investigated variance at Nugget because it's the largest accrual. The walkthrough makes deferred revenue $0.00-must-match for a reason.

- **New contract not on schedule.** Mykle signed a contract; schedule didn't get updated; the recurring JE recognizes only what it knows about. Update the schedule.
- **Contract terminated, unrecognized balance not released.** Customer cancelled mid-term; schedule still shows future recognition. Release the unrecognized portion to revenue (or refund liability) and remove from schedule.
- **Recognition JE ran on wrong schedule.** Worksheet says straight-line over 12 months; JE posted as one-time recognition. Reconcile and re-post differential.
- **Contract modified.** Term extension, scope change, or partial refund. Invoicing updated but schedule didn't. Update.

## A worked example

**Scenario:** Feb 2026 close. TB shows 1200 Accounts Receivable = 142,837.50. Aged Receivable as-of 2026-02-28 sums to 142,603.00. Variance = 234.50, TB > Aging.

**Triage:**

1. Drill from the bigger side. TB has the extra. Open GL filtered to 1200, period 2026-02-01 to 2026-02-28.
2. Sort by Partner. Three lines have blank partner.
3. The three blank-partner lines: 100.00 (Feb 5), 50.00 (Feb 10), 84.50 (Feb 15). Sum: 234.50. That's our variance.
4. Click each. All three are manual JEs labeled "Legal settlement adjustment" with no source document attached.
5. Find Andrea's notes from Feb. Yes, three legal-settlement items expected to be invoiced. The JEs were posted to AR directly instead of via customer invoice.

**Resolution:**

- Reverse the three direct JEs (date 2026-02-28, memo "Reversing direct JE; replacing with invoice").
- Issue a customer invoice for the legal client, $234.50, dated 2026-02-15.
- Re-run TB and aging. Both now show $234.50 less in AR than before; new invoice adds $234.50 to aging. Net: matched.

**Documentation:**

```
Variance: 1200 AR, $234.50 (TB > Aging)
Cause: Three direct JEs to AR for legal settlement; no invoice issued.
Resolution: Reversed the three JEs and re-posted via a customer invoice.
Investigated by: Andrea, 2026-03-04
```

## When the variance won't reveal itself

After 30 minutes of drilling without finding the cause:

1. **Run a Period Comparison.** Trial Balance → Period Comparison filter → Previous Period. The variance for the suspect account should equal period activity. If it doesn't, something pre-period changed (a back-dated JE).
2. **Check for back-dated postings.** Accounting → Accounting → Transactions → Journal Items, group by Date, look for any line whose create_date is well after period end.
3. **Check the lock-exceptions log.** No user-friendly menu exists in stock 19; with developer mode enabled, navigate to Settings → Technical → Database Structure → Models → `account.lock_exception` to view the records. Any exception in the period is a back-dated post that someone made knowingly. Read the reason.
4. **Audit-trail the suspect account.** If the company has Restrictive Audit Trail enabled (Accounting → Configuration → Settings → Reporting block → Restrictive Audit Trail), every JE modification is recorded as an immutable mail tracking entry. The user-friendly entry point is the dedicated **Audit Trail** report at **Accounting → Review → Logs → Audit Trail** (better than reading chatter on individual JEs because it cross-cuts every change in the period). For a single JE's history, open the JE and scroll to the chatter. If Restrictive Audit Trail is *not* enabled, standard mail tracking still records changes but they can be deleted by an admin; coverage is partial.
5. **Reverse-engineer.** Pull all JEs touching the suspect account, sorted by amount descending. The largest unfamiliar entry is your starting point.
6. **Ask Cooper.** If 30 minutes hasn't cracked it, the next 30 won't either. A 5-minute call to Cooper saves the morning.

## When to plug

Almost never. Two narrow exceptions:

- **$0.02 or less per account.** Rounding. Acceptable; log it but don't investigate.
- **A previously-documented accepted variance** signed off by Cooper. Even then, the plug should clear in the next period, not stay open.

A plug JE that grows month over month is books drifting. We catch that pattern at year-end retrospective and unwind it. **If the same account has rounding variances in the same direction three months running, investigate the source even if each individual variance is below threshold.** That's evidence of a systematic issue (a rate, a rounding rule, a JE template) and waiting for it to become material is irresponsible.

## Lock exceptions: how to use them, who approves

Sometimes you need to post into a closed period. Examples:

- A cutover JE error discovered after lock.
- A vendor bill arriving in May dated April 28, after April is locked.
- A correcting JE Cooper requires after quarterly review.

The procedure:

1. **Try not to.** First option: post a correcting JE in the current open period with a memo referencing the source period.
2. **If you must post into the closed period:** open the Lock Dates wizard (Accounting → Accounting → Closing → Lock Dates…). When you adjust the lock date in a way that would block a needed back-post, an inline exception alert appears with three fields: Applies To (set to "Just me" / Andrea), Duration (set to `24h` so it auto-expires), Reason (one sentence referencing Cooper's approval). Avoid Duration = `forever` with Applies To = "Everyone" — that combination silently moves the lock without creating an `account.lock_exception` record.
3. **Approver:** Cooper, in writing (email, ticket, Drive comment) before the exception is created.
4. **Memo on the JE:** "Posted under lock exception [exception ID]; approved by Cooper [date]; reason: [one sentence]."
5. **Audit trail:** the exception is logged automatically. Andrea reviews the lock-exceptions list at every quarterly close and reports any unexpected exceptions to Cooper.
6. **Materiality:** if the prior-period error is material (above the escalation threshold), notify Cooper *before* posting the correction. A material correction may require a Cooper-supervised restatement, not just a JE in the next open period.

## Documentation requirement

Every variance investigated, even a "found it and fixed it" case, gets a note in the close folder:

```
Variance: 1200 AR, $234.50 (TB > Aging)
Cause: Manual JE 2026-02-15 to AR for legal settlement; no invoice issued.
Resolution: Reversed and re-posted via customer invoice.
Investigated by: Andrea, 2026-03-04
```

Three lines. Same format every time. Stored as `VarianceLog.md` in the close folder. After three months of closes, the file becomes its own knowledge base.

The `VarianceLog.md` is also useful as a JE chatter attachment. Each correcting JE links the variance log entry, so the JE itself carries the audit trail.
