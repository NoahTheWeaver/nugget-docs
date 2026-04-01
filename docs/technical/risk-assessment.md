---
title: Module Risk Assessment
---

# Module Risk Assessment

At-a-glance view of maturity, risk, and technical debt across all custom modules. Updated as modules are smoke-tested and documented.

**Last reviewed:** March 31, 2026

| Module | Maturity | Risk | Tech Debt | Biggest Concern | Smoke Tested |
|--------|----------|------|-----------|-----------------|:---:|
| Service Requests | Medium | Medium | Low | Stage gating logic untested in production; terminology changes touch many views | ☐ |
| Task Analytics | High | Low | Low | `account_id` field name confusion between project and task models (fixed) | ☑ |
| Timesheet Posting | Medium | High | Medium | No validation gate — unvalidated timesheets can be posted to GL. Analytic bypass bug was fixed but needs smoke testing. J2E-authored code. | ☐ |
| Per Diem Tracking | High | Medium | Low | Complex cascade chain (task → timesheet → per diem → JE). Real-time triggers on every timesheet save — performance untested at scale. | ☑ |
| Purchase Configurator | Medium | Medium | Low | OWL 2 JavaScript components — fragile across Odoo upgrades. Depends on sale module's configurator assets. | ☐ |
| Inventory Status | Low-Medium | Low | Medium | **Hardcoded warehouse location names.** If HOU/Stock or Reno/Stock are renamed, the report breaks silently (shows zeros, no error). | ☐ |
| Component Inventory | Low-Medium | Medium | Medium | Complex raw SQL query. Same hardcoded location problem as Inventory Status. Depends on BOMs being correctly defined. | ☐ |
| Variant Name | High | Low | None | Simple and clean. Only risk is the `display_name` override conflicting with other modules that also override it. | ☐ |
| Track Location Analytics (J2E) | Unknown | Low | Unknown | J2E module, not yet reviewed in detail. | ☐ |
| Maintenance Checklist (J2E) | Unknown | Low | Unknown | J2E module, not yet reviewed in detail. | ☐ |
| Google Sheet Integration (J2E) | Unknown | Medium | Unknown | J2E module, external API dependency. May need credentials to test. | ☐ |

## Risk Definitions

- **High maturity:** Code reviewed, tests written and passed, documentation complete. Confident in production readiness.
- **Medium maturity:** Code exists and works in dev, but not fully tested or documented. May have gaps.
- **Low maturity:** Stub or early implementation. Needs significant work before launch.
- **Unknown:** J2E-authored modules not yet reviewed by Nugget team.

## Top Risks for Launch

1. **Hardcoded locations in inventory modules.** If warehouse locations are renamed or new warehouses added, `nugget_inventory_status` and `nugget_component_inventory` will silently return wrong data. This should be refactored to use configurable location references, but is acceptable for launch if location names are finalized.

2. **Timesheet posting has no validation gate.** Any timesheet with a project and non-zero cost can be posted to the GL, regardless of whether it's been approved. This could lead to premature cost recognition. Mitigation: train accounting to only post validated timesheets.

3. **Per diem cascade performance.** Every timesheet create/write/unlink triggers per diem recomputation. At Nugget's current scale (~10 FSEs) this is fine. At 50+ concurrent users logging time, it could slow down. Monitor after launch.

4. **Purchase configurator JS fragility.** OWL 2 components that extend the sale module's configurator. If Odoo changes the configurator API in a point release, this module breaks. Low probability but high impact.

5. **J2E modules are black boxes.** Three modules authored by J2E have not been reviewed in detail. Their code quality and upgrade readiness is unknown. Recommend a focused review before launch.
