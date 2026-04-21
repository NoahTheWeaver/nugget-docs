---
title: Your Daily Workflow
---

# Your Daily Workflow

Every service day follows the same shape — pick up an assigned task, work through it, close it out. Wyatt is designed so the same six moves cover a PM, a repair, an install, or an emergency callout. Learn the flow once and it applies everywhere.

## The Flow at a Glance

A normal day looks like this:

1. **Find** your assigned task
2. **Move it to In Progress** when you start
3. **Log time** as you work (or at the end of the day)
4. **Fill the service checklist** in Google Sheets while on-site (checklists still live in Sheets for now, not inside Wyatt)
5. **Log parts** used, if any
6. **Mark it Completed – Awaiting Closeout** when you're done

The dispatcher closes it out from there. Once they've reviewed your report and parts, they move the task to **Closed** and it's off your plate.

## Stages on the Board

Every task moves through the same stages. You'll see the current stage as a colored band at the top of the task form, and as an icon on the Gantt.

| Icon | Stage | Who moves it |
|------|-------|--------------|
| 📋 | Open | Dispatcher (creates task) |
| ✏️ | Tentatively Scheduled | Dispatcher |
| ✅ | Confirmed with Client | Dispatcher |
| ✈️ | Travel Booked | Dispatcher |
| 🔧 | In Progress | **You**, when you start work |
| 📦 | Completed – Awaiting Closeout | **You**, when you finish |
| ✔️ | Closed | Dispatcher |
| ⏸️ | On Hold | Dispatcher |

You own two transitions: **→ In Progress** and **→ Completed – Awaiting Closeout**. Everything else is dispatch.

## Finding Your Task

Open the **Field Service** app. You'll land on your own tasks by default, filtered to what's scheduled this week. Two views to know:

- **Kanban** — cards grouped by stage. Best for seeing what's coming up.
- **Gantt** — your week as a timeline. Best for seeing how your days line up.

::: tip
Star the **"My Tasks – This Week"** filter as your favorite. You'll land on it every time you open the app.
:::

If you can't find a task you know you were assigned, check the search bar for active filters — sometimes a saved filter hides it. Or jump straight to it with global search (⌘K / Ctrl-K) and type the task name or customer.

## Starting the Task

1. Open the task from Kanban or Gantt.
2. In the [statusbar](/core-concepts#_6-records) (the row of stage buttons across the top of the task form), click **In Progress**.
3. Go to the **Time Entries** tab and log your start time — or wait and log hours at the end of the day. See [Time Tracking](/user-guides/field-service/time-tracking).

That's it to start. The task is now yours and shows the In Progress stage on the dispatch board.

## While You're Working

Three things might happen during the job:

- **Fill the service checklist.** On the task, open the **Service Requests** tab, click the linked request, and click the report URL. It opens the Google Sheet for your PM or repair checklist. See [Completing Service Checklists](/user-guides/field-service/checklists).
- **Log parts used.** If you pulled parts from the truck, record them on the service request. On the task form, open the **Service Requests** tab, click into the linked request, and add them under *Parts Used*. See [Logging Parts & Materials](/user-guides/field-service/parts).
- **Drop notes in [chatter](/core-concepts#_10-chatter).** If something came up that matters for closeout — unexpected findings, client questions, a revisit needed — leave a log note on the task so the dispatcher sees it.

::: warning Analytic account on parts
When you log parts, you have to pick the **Analytic Account** manually. That's the contract code that traces the cost back to the customer on the P&L. It doesn't auto-fill. If you skip it, the parts cost floats free and won't show up on the contract. Details in [Logging Parts & Materials](/user-guides/field-service/parts).
:::

## Finishing Up

When the work's done:

1. Log your final hours (if you haven't already).
2. Confirm the checklist is filled out and attached to the service request.
3. Confirm any parts you logged are on the service request with the right **Analytic Account** (open the request, scroll to *Parts Used*, check the Analytic column).
4. Fill the **Resolution Code** and **Notes** on the service request — the task won't close without them.
5. Move the task to **Completed – Awaiting Closeout**.

An activity lands in the dispatcher's inbox that the task is ready for closeout. They review, accept, and move it to **Closed**. If anything's missing, they'll leave you a log note in chatter.

## What Happens After You're Done

You don't have to do anything for any of these:

- Your **per diem** is calculated automatically from your logged hours. It shows up in your next paycheck. See [Time Tracking](/user-guides/field-service/time-tracking).
- Your **timesheet is validated** weekly by your manager. If they need a correction, they'll message you.
- Your **labor cost is posted to the GL** monthly by accounting, traced back to the contract via the task's analytic account.

If the manager sends your timesheet back for a fix, you'll see it as an [activity](/core-concepts#_10-chatter) in your inbox (the clock icon in the top bar).

← Back to [User Guides](/user-guides/)
