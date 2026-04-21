# Tracking Parts Costs to Service Contracts

When we use parts on a service call, the cost needs to land on the customer's service contract. That's how we know the true cost of servicing each contract and whether it's profitable.

## How It Works

Every service contract has an analytic account. When parts are consumed on a service call (shipped to a customer, swapped during a PM, installed during a repair), the inventory transfer gets tagged with that contract's analytic account. When the transfer posts to the GL, the parts cost shows up on the contract's P&L.

## When You Need to Set the Analytic Account

Transfers involving flagged warehouse locations show an "Analytic Account" field. Set it to the customer's service contract analytic account.

::: tip Flagged Locations
This list is maintained by Noah. If a location should be tracked and isn't here, let him know.

*(List to be finalized before launch)*
:::

If you don't see the field, the locations involved aren't flagged and the parts aren't being consumed on contract work.

## Step by Step

1. Open the transfer (from Inventory > Operations > Transfers, or from the service request's truck icon)
2. Set the **Analytic Account** to the customer's service contract account
3. The distribution copies to every line item automatically
4. If one line belongs to a different contract, edit it directly in the operations grid
5. Validate the transfer. The cost posts to the GL under that contract.

## Linking Transfers to Service Requests

Every parts transfer for a service call should be linked to the service request. This is how we trace which parts were used on which job.

1. On the transfer form, set the **Maintenance Request** field to the service request
2. The service request's truck icon now shows the count of linked transfers
3. You can also create transfers from the service request directly by clicking the truck icon

## Finding Transfers by Contract

On the transfer list view, click **Search Moves**. Select one or more analytic accounts (contracts) and the list filters to show only transfers tagged to those contracts. Use this to review all parts consumed on a specific contract.
