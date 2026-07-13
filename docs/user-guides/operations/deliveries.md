---
title: Linking Deliveries to Tasks
---

# Linking Deliveries to Tasks

When we ship something for a job (parts to a site, a loaner, a replacement system), the delivery order and the task live in different corners of Wyatt. The **Task** field on the delivery ties them together, so anyone looking at the task can see what shipped without digging through Inventory.

## On the delivery: set the Task

1. Open the delivery order (**Inventory > Delivery Orders**).
2. In the **Task** field, start typing the task reference (like `T-01234`) or any part of the task name.
3. Pick the task and save.

The picker shows tasks as `T-01234 Task name`, so you can confirm you have the right one before saving. The task reference is printed on the task itself, top of the form.

A few things worth knowing:

- The field only appears on outgoing deliveries. Receipts and internal transfers don't have it.
- Status doesn't matter. If a delivery already shipped last week and nobody linked it, link it now. The task picks it up either way.
- Every change to the field is logged in the delivery's chatter, so there's a record of who linked what.

## On the task: the Deliveries button

Open the task and look at the button row at the top. If the task has linked deliveries, a **Deliveries** button shows the count. Click it for the list, or if there's exactly one, Wyatt takes you straight to it.

No button means nothing is linked yet.

## Why this is worth 10 seconds

- Dispatch can answer "did the part ship?" from the task, without switching apps and guessing at reference numbers.
- FSEs heading to a site can see what's en route versus delivered before they leave.
- When a client calls about a job, the task tells the whole story in one place: the work, the tickets, and the shipments.

## What happened to the Maintenance Request field?

Deliveries used to offer a "Maintenance Request" link in the same spot. It's retired. Use **Task** instead; the task already connects to everything else.

## Related

- [Receiving & System Intake](/user-guides/operations/receiving) — the inbound side
- [Logging Parts & Materials](/user-guides/field-service/parts) — parts consumed on a job, which is a different record than a shipment
