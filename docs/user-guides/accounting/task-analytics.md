---
title: Task-Level Cost Tracking
---

# Task-Level Cost Tracking

::: tip Required Permissions
**Project > User** or higher to set analytic accounts on tasks. **Timesheets > User: all timesheets** or higher to view analytic distribution on timesheets.
:::

## What this does

By default, Odoo tracks all time logged in a project against a single analytic account — the one set on the project. This means you can see total costs per project, but you can't break it down by job or task within that project.

With task-level analytics, you can assign a different analytic account to individual tasks. Time logged against that task will be tracked to its own account, giving you per-job profitability within a single project.

## How projects and analytic accounts work

When you create a new project, Odoo automatically creates an analytic account with the same name and links it to the project. You can see this on the project's **Settings** tab under **Analytic Account**.

This project-level account is the default. Any timesheet logged in the project will use this account unless the task specifies something different.

## Setting an analytic account on a task

1. Open the task
2. Find the **Analytic Account** field (in the left column of the form)
3. Select an existing analytic account, or create a new one

If the field is blank, timesheets on that task use the project's default account. If you set an account, timesheets on that task use the task's account instead.

## What happens when you change it

If you change the analytic account on a task that already has timesheets:

- **Unvalidated timesheets** update automatically to the new account
- **Validated timesheets** stay on the old account — they're locked

This means you can fix a miscategorized task without worrying about rewriting approved history.

## When to use this

Use task-level analytics when you need to track costs at a finer level than the project. Common examples:

- A project covers multiple client engagements — each task gets the client's analytic account
- You want to compare profitability across different job types within the same project
- A single project has tasks billed to different cost centers

If every task in a project uses the same account, you don't need to set anything — the project default handles it.

## Tips

- Every project must have an analytic account to log timesheets. Odoo creates one automatically when you create a project, so this is rarely an issue. If you somehow end up without one, Odoo will block timesheet entry until it's set.
- Every employee should have an **Hourly Cost** set (**Employees > [Employee] > Settings tab > Hourly Cost**). Without it, time is tracked in hours but with a $0 value — the hours show up in reports but with no dollar amount.
- Clearing a task's analytic account doesn't delete the timesheets — it just moves them back to the project's default account.
