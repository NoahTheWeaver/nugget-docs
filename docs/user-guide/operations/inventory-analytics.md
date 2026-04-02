# Tracking Costs on Inventory Moves

When parts move through the warehouse, we need to know which project or customer those costs belong to. This is how analytic tracking works on inventory transfers.

## When It Applies

Not every transfer needs analytics. Only transfers involving flagged locations. The following locations are currently flagged for analytic tracking:

::: tip Flagged Locations
This list is maintained by Noah. If a location should be tracked and isn't here, let him know.

*(List to be finalized before launch)*
:::

If you don't see an "Analytic Account" field on a transfer, the locations involved aren't flagged. That means the cost doesn't need project-level allocation for that move.

## Setting the Analytic Account on a Transfer

1. Open the transfer (Inventory > Operations > Transfers, or from a service request's Pickings button)
2. If the "Analytic Account" field is visible, set it to the project or cost center this transfer belongs to
3. The distribution automatically copies to every line item on the transfer
4. If one line needs a different account, edit it directly in the operations grid

## Linking Transfers to Service Requests

When parts are consumed on a service call, the transfer should be linked to the service request.

1. On the transfer form, find the **Maintenance Request** field
2. Select the service request this transfer is for
3. The service request now shows a truck icon with the count of linked transfers

You can also create transfers directly from the service request: open the request, click the truck stat button, and create a new transfer from there.

## What Happens to the Numbers

When the transfer is validated, the analytic distribution flows through to the journal entry. The debit side of the GL entry carries the analytic account you set. This is how parts costs show up on project-level P&L reports.

## Finding Transfers by Analytic Account

On the transfer list view, click the **Search Moves** button. A dialog opens where you can select one or more analytic accounts. The list filters to show only transfers that have moves tagged with those accounts.
