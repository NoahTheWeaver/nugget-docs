---
title: Service Requests
---

# Service Requests

A **service request** is the record of a single visit to a single system. Every PM, repair, install, and callout has one. It's where we track what system was serviced, what we did, what we found, and how we resolved it.

The dispatcher creates the service request when they create your task. You own it from the moment you arrive on-site until you mark it resolved.

## What's on the Request

Every service request links three things together:

- **System** — the instrument or equipment you're working on (serial number, model, location)
- **Task** — the scheduled work on the Gantt (your assignment)
- **Service Type** — the kind of work: PM, Repair, Install, IQ/OQ, VV, or Pack-Up (these are Nugget's service-type codes — PM is preventive maintenance, IQ/OQ is installation/operational qualification, VV is validation & verification)

Everything else — the checklist, the parts used, the resolution notes — attaches to this one record.

::: tip Why it matters
If you skip the Resolution Code or leave the system/task links blank, your manager will be back at you during closeout review asking you to fill them in. The monthly reports that run off these fields won't work if any of them are missing.
:::

## Finding the Request on Your Task

Open any service task and you'll see a **Service Requests** tab on the form. Click it to see the linked request. A second path: the **Service Requests** [smart button](/core-concepts#_9-smart-buttons) (a count tile in the top-right of the task form) jumps straight to the list.

Usually there's one request per task. A single visit can carry multiple — for example, a PM that turns into a repair after you spot a broken part.

::: warning Service Requests tab missing or empty?
The tab only shows when the task is flagged as a service task. If you open a task and there's no Service Requests tab, or the tab is empty when you expected a request there, the dispatcher didn't flag it correctly. Leave a log note for them before starting work — don't try to add a request yourself on an unflagged task, it won't link correctly.
:::

## What to Do at Each Stage

### At the Start of the Visit

Before you dig in, open the service request and confirm:

- The **system** matches what's actually in front of you — serial number, model, and location.
- The **service type** is correct. If it's wrong, leave a [log note](/core-concepts#_10-chatter) in chatter for the dispatcher. Don't close the task out under the wrong service type, and don't change the type yourself — either wait for dispatch to fix it or move the task to *On Hold* until they do.

If the wrong system is selected, fix it before doing anything else. Every downstream report keys off this field.

### During the Visit

As you work, use the request to capture the story of the visit:

- **Findings** — what did you see? Out-of-spec readings, worn parts, unexpected conditions. These go in the **Notes** field on the request, or in chatter if they're conversational.
- **Remote solve attempted** — toggle this if you or ops tried to solve it remotely before rolling a truck. It's an audit field for the monthly L10 review.
- **Photos** — drag to the attachments area (paperclip icon). Before/after photos are gold for PMs and make closeout faster.

### At Closeout

When the work is done, fill the closeout fields *before* you touch the task stage:

1. From the task form, open the **Service Requests** tab and click into the linked request.
2. Fill **Resolution Code** (dropdown).
3. Fill **Notes** (a few sentences summarizing what you did).
4. Toggle **Post-service checklist completed** once the Google Sheet is filled and attached to the request.
5. Save the request.
6. Go back to the task (use the breadcrumb) and move it to **Completed – Awaiting Closeout**.

All three fields — Resolution Code, Notes, and checklist toggle — are required at the Closed stage.

::: warning What happens if you skip a required field
When you try to move the task to a stage that requires Resolution Code or Notes, Wyatt highlights the missing field in red at the top of the service request and blocks the save. Scroll up, fill what's highlighted, and try again.
:::

## Adding a Request Yourself

Most of the time the dispatcher has already created the request. But if you arrive and find an additional issue that deserves its own record — say, you're doing a PM and discover a broken sensor — add one:

1. On the task form, open the **Service Requests** tab.
2. Click the add button (typically **Add a line** or the **+** icon at the bottom of the list).
3. Pick the system, set the service type to **Repair**, and add a short description.
4. Save.

The task and customer pre-fill from the task. You'll still need to pick the system manually.

The new request links to the same task, so your time and parts still roll up correctly.

## What You Won't Do

- You won't create a service request from scratch without a task — dispatch creates those as part of scheduling.
- You won't move the request through its own stages — the task's stage drives everything.
- You won't edit the service type or contract linkage after the fact. If those are wrong, leave a log note for dispatch.

## Related

- [Your Daily Workflow](/user-guides/field-service/daily-workflow) — how the request fits into the day
- [Logging Parts & Materials](/user-guides/field-service/parts) — parts attach to the service request
- [Completing Service Checklists](/user-guides/field-service/checklists) — the report URL on the request opens the Google Sheet
