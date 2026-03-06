# Service Requests

**Technical name:** `nugget_service_requests`
**Depends on:** `project`, `maintenance`, `product`

Links maintenance requests to project tasks, enabling service requests to be tracked against specific engagements. Uses "Service Request" terminology in the UI instead of "Maintenance Request" to align with Nugget's field service model.

## Key Views

- **Service Requests list** — All service requests
- **Task form** — "Service Requests" tab on service tasks

## Data Notes

The `task_id` field is optional (not required) because legacy maintenance requests exist in the database without a linked task.
