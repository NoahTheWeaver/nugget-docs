---
title: Module Risk Assessment
---

# Module Risk Assessment

At-a-glance view of maturity, risk, and technical debt across all custom modules. Updated as modules are smoke-tested and documented.

**Last reviewed:** April 2, 2026

| Module | Maturity | Risk | Tech Debt | Biggest Concern | Dev Smoke Test | Staging Smoke Test |
|--------|----------|------|-----------|-----------------|:---:|:---:|
| Timesheet Posting | High | Low | Low | Validation gate and hourly cost enforcement added. J2E-authored code with Nugget modifications. | ☑ | ☐ |
| Task Analytics | High | Low | Low | `account_id` field name confusion (fixed) | ☑ | ☐ |
| Per Diem Tracking | High | Medium | Low | Complex cascade chain. Real-time triggers on every timesheet save. | ☑ | ☐ |
| Service Requests | Medium | Medium | Low | Resolution codes and required-fields-by-stage designed but not built. Service types and auto-naming done. | ☑ | ☐ |
| System Registry | Medium | Medium | Low | Subscription linking deferred (needs subscription setup). MO reconfig untested. | ☑ | ☐ |
| Gantt View | Medium | Low | Low | New module. Project color and stage icons working in dev. Needs staging validation. | ☑ | ☐ |
| Purchase Configurator | High | Low | Low | OWL 2 JS components. Fragile across upgrades but fully tested in dev. | ☑ | ☐ |
| Inventory Status | Medium | Low | Medium | **Hardcoded warehouse location names.** Waiting on Bo for location mapping. | ☑ | ☐ |
| Component Inventory | High | Low | Medium | Complex raw SQL. Same hardcoded location issue. All 9 tests passed. | ☑ | ☐ |
| Variant Name | High | Low | None | Simple. All tests passed. | ☑ | ☐ |
| Track Location Analytics (J2E) | Medium | Medium | Medium | Cascade delete fixed. Test plan written (13 tests). Docs reframed around contract cost tracking. Not yet smoke tested. | ☐ | ☐ |
| Maintenance Checklist (J2E) | Cut | - | - | Cut from launch. Using existing Google Sheets workflow. | - | - |
| Google Sheet Integration (J2E) | Cut | - | - | Cut from launch. Using Google Sheets directly. | - | - |

## Risk Definitions

- **High maturity:** Code reviewed, tests written and passed, documentation complete. Confident in production readiness.
- **Medium maturity:** Code exists and works in dev, but not fully tested or documented. May have gaps.
- **Low maturity:** Stub or early implementation. Needs significant work before launch.
- **Cut:** Removed from launch scope.

## Top Risks for Launch

1. **Resolution codes and stage-required fields not yet built.** Designed and spec'd but no code. Resolution codes feed two charter metrics (Resolution time, # Emergency Callouts). Required-fields-by-stage is XML-only work. Both are launch-critical. Estimated 2 hours.

2. **Subscription setup not done.** System registry supports subscription mapping but subscriptions haven't been configured in dev or staging. Blocks contract coverage visibility for dispatch and the E2E testing of two charter processes.

3. **Hardcoded locations in inventory modules.** Email sent to Bo on Apr 1 requesting location mapping. Report breaks silently if locations are renamed. Must finalize before launch.

4. **Per diem rate policy unresolved.** Geographic ($100 continental/$50 Houston) vs hour-based ($100 for 8+ hrs/$50 for 4-8). Different models produce different amounts. Decision needed.

5. **Track location analytics not smoke tested.** Test plan written (13 tests), cascade delete fixed, but no smoke testing done yet. Module is J2E code. One bug already found (cascade delete). More may exist.

6. **Staging deployment fragile.** Three failed builds today from optional module XML ID references. All fixed, but any new xpaths referencing non-dependency modules will crash staging. Pre-push checklist documented in memory.

7. **E2E testing not started.** Module-level smoke tests are nearly complete. End-to-end testing of the five charter processes has not begun. This is where integration bugs will surface.
