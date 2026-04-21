---
title: Logging Parts & Materials
---

# Logging Parts & Materials

When you install, replace, or consume a part on a service call, log it on the service request. Two things happen behind the scenes: the part comes out of inventory (your truck or the warehouse), and its cost traces back to the contract so the P&L stays accurate.

The whole workflow takes about 60 seconds per part. The only step that matters beyond picking the part is setting the **Analytic Account** — skip it and the cost floats free.

## When to Log Parts

Any time you physically touch inventory on a job:

- Installed a new component
- Replaced a broken part
- Consumed a consumable (gaskets, lamps, filters)
- Handed a spare to the client

If you carried a part to the site and brought it back unused, don't log it — nothing changed.

## How to Log Parts

1. On the task form, open the **Service Requests** tab and click into the linked request.
2. Scroll to **Parts Used**.
3. Click **Add a line**.
4. Pick the part (start typing the part number or description — Wyatt autocompletes against the product catalog).
5. Enter the quantity.
6. Pick the **Source Location** — usually your truck (e.g. *FSE Truck – [Your Name]*) or the main warehouse if the part shipped direct to site.
7. Pick the **Analytic Account** — see the next section. **This is the step to get right.**
8. Save.

The inventory transfer posts on save. You don't need to confirm anything separately.

::: tip Part not in the catalog?
Leave a log note on the service request describing the part (manufacturer, part number, quantity) and flag a dispatcher. They'll add it to the catalog and reconcile the inventory after closeout.
:::

## The Analytic Account

The **Analytic Account** is the contract code that traces parts cost back to a specific customer on the P&L. Every dollar of parts, labor, and per diem routes to an analytic. If you pick the wrong one, the cost lands on the wrong contract. If you leave it blank, the cost never ties to any contract at all.

### Picking the right one

| Situation | Analytic Account to use |
|-----------|------------------------|
| Work covered by a service contract | The contract's analytic (usually matches the client + contract number) |
| Billable service call (no contract) | The client's default analytic, or the general service analytic if the client has none |
| Internal work (training, R&D, truck stock refill) | The matching internal analytic — not a customer analytic |

If you're unsure which account matches the contract, check the task — the dispatcher sets the task-level analytic at scheduling. Open the task and look for the **Analytic Account** field in the header. Use the same one on the parts transfer.

::: warning This does not auto-fill
Wyatt does not copy the task's analytic to the parts transfer automatically. You have to pick it manually every time. If your part shows up with a blank Analytic column in *Parts Used*, go back and fix it before closing out.
:::

### Verifying before closeout

Before you move the task to Completed – Awaiting Closeout, open the service request and scan the *Parts Used* table. The **Analytic** column should be populated on every line and should match the contract.

Missing analytics are the single most common closeout finding. A 10-second scan here saves a 30-minute fix from accounting at month end.

## Requesting Parts You Don't Have

If you need a part shipped to you or to the client site:

1. On the service request, leave a log note with the part number, quantity, ship-to, and needed-by date.
2. Tag your dispatcher (@ their name) so it lands in their inbox as an activity.
3. If the client is okay standing down, move the task to **On Hold** (dispatcher will do this if needed).

Dispatch handles the PO or internal transfer from there.

## What Happens After

Once the transfer posts:

- Inventory reflects the new on-hand in your truck or the warehouse
- The part's cost posts to the contract's analytic account (if you set it right)
- The System Registry updates if the part is a trackable component on the instrument
- Accounting picks up the cost in the month-end close

You don't need to touch any of this. Your job is to log the part and pick the analytic. Everything downstream runs off those two inputs.

## Related

- [Your Daily Workflow](/user-guides/field-service/daily-workflow) — where parts fit in the day
- [Service Requests](/user-guides/field-service/service-requests) — the record parts attach to
- [Completing Service Checklists](/user-guides/field-service/checklists) — parts you installed should also show up on the worksheet
