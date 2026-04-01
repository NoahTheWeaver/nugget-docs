---
title: Module Risk Assessment
---

# Module Risk Assessment

At-a-glance view of maturity, risk, and technical debt across all custom modules. Updated as modules are smoke-tested and documented.

**Last reviewed:** April 1, 2026

| Module | Maturity | Risk | Tech Debt | Biggest Concern | Dev Smoke Test | Staging Smoke Test |
|--------|----------|------|-----------|-----------------|:---:|:---:|
| Service Requests | Medium | Medium | Low | Open design questions: stage gating, checklists, resolution codes | ☐ | ☐ |
| System Registry | Not built | Medium | N/A | New module. Needs to be built before service requests testing. | ☐ | ☐ |
| Task Analytics | High | Low | Low | `account_id` field name confusion between project and task models (fixed) | ☑ | ☐ |
| Timesheet Posting | High | Low | Low | Validation gate and hourly cost enforcement added. J2E-authored code with Nugget modifications. | ☑ | ☐ |
| Per Diem Tracking | High | Medium | Low | Complex cascade chain (task > timesheet > per diem > JE). Real-time triggers on every timesheet save. | ☑ | ☐ |
| Purchase Configurator | Medium | Medium | Low | OWL 2 JavaScript components. Fragile across Odoo upgrades. | ☐ | ☐ |
| Inventory Status | Low-Medium | Low | Medium | **Hardcoded warehouse location names.** Report breaks silently if locations are renamed. | ☐ | ☐ |
| Component Inventory | Low-Medium | Medium | Medium | Complex raw SQL query. Same hardcoded location problem as Inventory Status. | ☐ | ☐ |
| Variant Name | High | Low | None | Simple. Only risk is display_name override conflicting with other modules. | ☐ | ☐ |
| Track Location Analytics (J2E) | Unknown | Low | Unknown | J2E module, not yet reviewed. | ☐ | ☐ |
| Maintenance Checklist (J2E) | Unknown | Low | Unknown | J2E module, not yet reviewed. | ☐ | ☐ |
| Google Sheet Integration (J2E) | Unknown | Medium | Unknown | J2E module, external API dependency. May need credentials. | ☐ | ☐ |

## Risk Definitions

- **High maturity:** Code reviewed, tests written and passed, documentation complete. Confident in production readiness.
- **Medium maturity:** Code exists and works in dev, but not fully tested or documented. May have gaps.
- **Low maturity:** Stub or early implementation. Needs significant work before launch.
- **Unknown:** J2E-authored modules not yet reviewed by Nugget team.

## Top Risks for Launch

1. **Hardcoded locations in inventory modules.** If warehouse locations are renamed or new warehouses added, `nugget_inventory_status` and `nugget_component_inventory` will silently return wrong data. Refactor to configurable location references, or finalize location names before launch.

2. **System registry not yet built.** New module identified during Apr 1 session. Needs to be built before service requests can be properly tested. Blocks system-to-customer and system-to-subscription mapping.

3. **Service request workflow not designed.** Stage gating, checklists, and resolution codes are open design questions. These will be addressed during E2E testing but are launch-critical for the Emergency Dispatch and Service Contract processes.

4. **Per diem cascade performance.** Every timesheet create/write/unlink triggers per diem recomputation. Fine at current scale (~10 FSEs). Monitor after launch.

5. **Purchase configurator JS fragility.** OWL 2 components extending the sale module's configurator. If Odoo changes the configurator API in a point release, this breaks.

6. **J2E modules are black boxes.** Three modules authored by J2E have not been reviewed. Code quality and upgrade readiness unknown.
