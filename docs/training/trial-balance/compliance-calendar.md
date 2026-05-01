---
title: Compliance Calendar
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Compliance Calendar

Filing deadlines for sales tax, payroll tax, and 1099 tracking. The close confirms the *prior period's filing was completed* — not just that the current balance ties.

A jurisdiction with a clean Avalara worksheet but no return filed has all the appearance of compliance and none of the substance. The calendar below is the catch.

## Sales tax filings

Nugget files in every jurisdiction where it has nexus. Cadence varies by state. Avalara handles the mechanics; we own the cadence and the proof of filing.

| Jurisdiction | Cadence | Filing deadline (relative to period end) | Filer | Backup | Confirmed in close |
|---|---|---|---|---|---|
| Texas | Monthly | 20th of following month | Avalara (auto) | Andrea (manual override) | Yes |
| California | Quarterly | Last day of month following quarter end | Avalara (auto) | Andrea | Yes |
| New York | Quarterly | 20th of month following quarter end | Avalara (auto) | Andrea | Yes |
| Other registered jurisdictions | Per Avalara → Returns → Filing Schedule | Per Avalara | Avalara (auto) | Andrea | Yes |

The actual list of registered jurisdictions lives in **Avalara → Settings → Jurisdictions**. Andrea pulls this list at the start of every quarter and reconciles it against the calendar above. New jurisdictions added → calendar updated.

**Close-time check** for each registered jurisdiction with a filing due in the period being closed:

1. Open Avalara → Returns → Filed Returns.
2. Confirm the prior-period return shows status "Filed" with a confirmation number.
3. If status is "Pending" or "Failed" or "Not Filed": escalate immediately. Do not lock the close until resolved.

This check is in addition to the Sales Tax Payable tie-out (which proves the *balance* is correct as-of period-end).

## Nexus monitoring

Sales mix changes; nexus does too. Quarterly check:

| Activity | Cadence | Owner |
|---|---|---|
| Pull Avalara nexus exposure report | Quarterly (close week) | Andrea |
| Compare to registered jurisdictions list | Same | Andrea |
| Any new state with sales > $10K (or threshold per state) | Flag to Cooper | Andrea → Cooper |
| Cooper confirms registration trigger | Within 30 days | Cooper |
| Register if triggered | Cooper-led with Andrea | Cooper |

The state-by-state economic-nexus thresholds vary ($100K to $500K of sales, sometimes a transaction-count test). Avalara's exposure report flags these automatically. We trust it but verify quarterly.

## Payroll tax filings

| Filing | Cadence | Deadline | Filer |
|---|---|---|---|
| Form 941 (federal payroll quarterly) | Quarterly | Last day of month following quarter end (Apr 30, Jul 31, Oct 31, Jan 31) | QB Payroll (auto) |
| Form 940 (federal unemployment annual) | Annual | January 31 | QB Payroll (auto) |
| State unemployment (UI) | Quarterly | Per state (varies) | QB Payroll (auto) |
| State income tax withholding | Per state cadence | Per state | QB Payroll (auto) |
| W-2 to employees | Annual | January 31 | QB Payroll |
| W-2 to SSA | Annual | January 31 | QB Payroll |

**Close-time check:** open QB Payroll → Taxes → Payments. Filter to the period being closed plus any prior period with a deadline in the period being closed. Every entry must show status "Paid" or "Filed" with confirmation. Anything past-due escalates immediately to Cooper.

QB Payroll generally handles auto-filing, but auto-filing fails silently when:

- A state withholding registration is incomplete (a new hire in a new state that's not yet set up in QB Payroll).
- A bank account has insufficient funds and the auto-debit fails.
- A QB Payroll subscription lapses or auto-pay is disabled.

The close-time confirmation catches these.

## 1099 tracking and W-9 control

The risk we manage: a contractor gets paid via Ramp or AP without a W-9 collected at vendor onboarding, year ends, and Andrea is chasing W-9s in late January under deadline pressure. We prevent it with:

### Vendor onboarding (the prevent)

For any new vendor that may be 1099-eligible (any non-corporate U.S.-based vendor providing services):

1. **No payment processed until W-9 is on file.** Ramp request, AP bill, or Wyatt vendor record — same rule.
2. **W-9 attached to vendor record** in Wyatt. Use the vendor record's chatter to attach the PDF.
3. **`is_1099_eligible` flag** set on the vendor record (custom field if not already present).
4. **TIN matching** through QuickBooks Payroll's e-services or IRS TIN matching (do this for any new 1099 vendor before the first payment).

The first three items are Andrea's gate. The fourth is Cooper's recommended quarterly verification.

### Quarterly review (the catch)

Once per quarter, in the close week of the quarter-end month:

1. Open the Vendors list in Wyatt, filter to `is_1099_eligible = True`, group by Vendor.
2. For each, sum YTD payments (across Ramp + AP).
3. Cross-reference to W-9-on-file flag.
4. Any vendor with YTD payments > $0 and no W-9: escalate immediately. Stop new payments. Email vendor for W-9.
5. Any vendor approaching $600 YTD without a W-9: same urgency.

### Year-end (the produce)

In January:

1. Pull final YTD payments per 1099-eligible vendor as of December 31.
2. Issue 1099-NEC for any vendor with $600+ in non-employee compensation.
3. File 1099 to IRS by January 31; copies to vendors by January 31.
4. QB Payroll may handle this if Nugget is on the relevant subscription tier; otherwise it's a manual filing through Wyatt's vendor reports + a third-party 1099 filer.

## Annual filings

For the calendar's sake:

| Filing | Deadline | Owner |
|---|---|---|
| Form 940 (FUTA) | January 31 | QB Payroll |
| W-2 batch | January 31 | QB Payroll |
| 1099-NEC batch | January 31 | Andrea (with QB Payroll or 3rd-party filer) |
| Federal corporate income tax (Form 1120 or 1065 depending on entity election) | March 15 (S-corp/partnership) or April 15 (C-corp) | Cooper |
| State franchise / income tax | Varies by state | Cooper |
| Annual Report (state of incorporation) | Per state | Andrea (with Cooper) |
| Insurance audits (workers' comp, GL) | As scheduled | Andrea (with HR) |

Annual filings are out of scope for the monthly close. They're listed here so the calendar is complete.

## Close-time compliance checklist

The walkthrough's Step 16 references this calendar. The actual check list at close is:

- [ ] Sales tax: every registered jurisdiction with a filing due in the period shows "Filed" in Avalara.
- [ ] Payroll tax: 941, 940, state UI, state withholding, all due-in-period filings show "Paid" or "Filed" in QB Payroll.
- [ ] 1099 quarterly review (only at quarter-end closes): completed and any flagged vendors escalated.
- [ ] Nexus check (only at quarter-end closes): Avalara exposure report pulled, new states flagged to Cooper.

## Calendar maintenance

This page is reviewed at the start of each quarter:

- Andrea pulls the current Avalara registered-jurisdictions list and reconciles against the table above.
- Andrea pulls the current QB Payroll state list and reconciles against the payroll filings table.
- Any new entity event (new state nexus, new payroll state, new vendor type) triggers a calendar update.
- Cooper sees the updated calendar each quarter as part of the close-summary email.

Last reviewed: 2026-05-01 (anticipated; will be confirmed at first quarterly close after cutover).
