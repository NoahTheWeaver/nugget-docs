---
title: Portal Terminology
---

# Portal Terminology

Customer-facing pages say "Service Contract" wherever Odoo says "Subscription". Module: `nugget_portal_terminology`. Depends on `sale_subscription` only.

**Status (27 August 2026):** live on production. Installed the same day it was built; verified on the sandbox (S2400) and on production (S2430).

## Why This Exists

Nugget sells annual service contracts. Odoo's Subscriptions app is the billing engine behind them, and its customer portal calls every contract a "subscription": the browser tab, the breadcrumb, the "Your Subscription" block, the buttons, the dialogs. A customer who bought a service contract and opens the link to `/my/subscriptions/362` should read "Service Contract" on every line, the same words that are on their quote and in our emails. The backend app tile was already renamed by `nugget_app_terminology`; this module does the customer side.

## How It Works

Wording only. No routes, models, fields, or workflow change. The URLs stay `/my/subscriptions/...` because the portal JavaScript posts to them.

### Why not translations

Odoo treats `en_US` as the source language: `get_translation()` returns the source string untouched for `en_US`, so there is no `.po` override for English wording. Every string has to be replaced where it lives.

### Template text (`views/`)

Odoo's view inheritance cannot edit a text node in place, so the smallest element that contains the wording is replaced with a verbatim copy of the 19.1.9 markup (its `t-if`, classes and all) with only the words changed. Each `xpath` is written to match exactly one element, because Odoo applies a spec to the first match only. Source of truth for every copy is `sale_subscription/views/sale_subscription_portal_templates.xml` and `payment_form_templates.xml`; on an Odoo upgrade, re-diff each replaced element against them.

The browser tab title is the odd one out. `website.layout` falls back to the rendered view's record name ("Subscription") when nothing sets a title, so the module sets `additional_title` inside the `portal.portal_layout` call body rather than renaming the view record. A renamed record would be reset by the next `sale_subscription` update.

### Labels that come from Python (`models/`)

| Label | Where it surfaces | Override |
|---|---|---|
| `sale.order.type_name` = "Subscription" | Breadcrumb ("Service Contract S2430"), header on renewal and upsell quotes, PDF download filename | `_compute_type_name` calls super, then relabels confirmed subscriptions |
| `model_description` = "Subscription" | Record label in the notification-email layout | `_notify_thread` sets it before `sale_subscription` gets the chance |

Quotations keep their stock labels ("Quotation", "Renewal Quotation") because they are still quotations.

## Where Customers See It

| Page | What changed |
|---|---|
| `/my/subscriptions/<id>` (the contract page) | Tab title and `og:title`, breadcrumb, "Your Service Contract" block, "Service Contract Manager:", Pause / Resume / Close buttons and their dialogs, the paused / expiring / expired / closed / pending-payment banners, the address-change dialog |
| `/my/subscriptions` (list) | Tab title, search-bar heading, empty-state message, first column header |
| `/my/home` | "Service Contracts" card, "Manage your service contracts" |
| Renewal and upsell quotes (`/my/orders/<id>`) | "Back to your service contract" banner, "Service Contract:" reference row |
| Payment form (`/my/payment_method`, Pay Now) | "Set payment method for service contract", "Automate payments for the linked service contracts" |
| PDF download | Filename `Service Contract S####.pdf` |
| Notification emails | Record label above the record name |

One sentence was repaired while it was being replaced: "Your subscription is expired, will be closed soon" became "Your service contract has expired and will be closed soon".

### Not covered (master data, not templates)

- **Close reasons** (Subscriptions > Configuration > Close Reasons). Two stock records, "Subscription is too expensive" and "Subscription does not meet my requirements", are marked visible in portal. They only render inside the Close dialog, and no plan on production lets customers close a contract, so nobody sees them today. Rename them in the UI if that changes.
- **Subscription email templates** (payment failure, payment reminder, alert). Their subjects say "subscription". They are data records under Settings > Technical > Email Templates.

## Key Files

| File | Purpose |
|---|---|
| `models/sale_order.py` | `type_name` and `model_description` overrides |
| `views/subscription_portal_templates.xml` | Every portal page element that carried the word |
| `views/payment_form_templates.xml` | Payment form wording |

## Configuration

No settings. Install the module.

## Test Plan

Run on the local dev database (seeded contract, renewal quote, portal user), on the sandbox build against S2400, and on production against S2430, all on 27 August 2026.

| # | Test | Expected Result |
|---|---|---|
| 01 | Open a contract page from its share link, logged out | Tab title "Service Contract \| Nugget Scientific"; breadcrumb "Service Contracts > Service Contract S####"; "Your Service Contract"; "Service Contract Manager:" |
| 02 | Same page logged in as the customer | Same wording; Pause / Resume / Close buttons (when the plan allows them) and their dialogs say "service contract" |
| 03 | Open `/my/subscriptions` logged in | Heading and first column read "Service Contract(s)"; tab title "Service Contracts" |
| 04 | Open `/my/home` logged in | Card reads "Service Contracts", "Manage your service contracts" |
| 05 | Open a renewal quote created from a contract | "Back to your service contract" banner; "Service Contract:" reference row; header still "Renewal Quotation" |
| 06 | Download the PDF from the contract page | Filename "Service Contract S####.pdf" |
| 07 | Search the page source for "subscription" | Only URLs, element ids, and close-reason names remain |

## Cross-Module Dependencies

| Module | Relationship |
|---|---|
| `sale_subscription` (Odoo) | Owns the portal templates and labels this module overrides |
| `nugget_app_terminology` | Renames the backend app tile to Service Contracts; keep the two in step |
