---
title: The Wyatt Toolbox
sidebar: false
---

# The Wyatt Toolbox

Wyatt is a toolbox. Each app is one tool. Here's what each one is for and who reaches for it most.

::: warning You won't use all of these
Most people use four or five apps a day, not twenty. The rest are here so you can recognize them when you see them referenced elsewhere.
:::

## Start Here

| App | What it's for | Used most by |
|:-:|---|---|
| <img src="/screenshots/apps/01_dashboards.png" alt="Dashboards" width="140" /> | Cross-cutting metric and KPI views. Pinned widgets from other apps roll up here. | Leadership, managers |

## Customers and Sales

Finding, selling to, and staying in touch with customers.

| App | What it's for | Used most by |
|:-:|---|---|
| <img src="/screenshots/apps/02_sales.png" alt="Sales" width="140" /> | Quotations and sales orders. System sales and one-time service deals. | Sales, operations |
| <img src="/screenshots/apps/03_crm.png" alt="CRM" width="140" /> | Leads and opportunities. Pipeline from first contact to deal. | Sales, leadership |
| <img src="/screenshots/apps/04_contacts.png" alt="Contacts" width="140" /> | Customers, vendors, and internal people. The master address book. | Everyone (read), sales + ops (write) |
| <img src="/screenshots/apps/17_subscriptions.png" alt="Subscriptions" width="140" /> | Recurring sales orders. Service contracts (PM programs) live here. | Sales, accounting |

## Field Work and Service

Where the FSE and dispatch team spend most of their time. Project holds the Field Service tasks; Service holds the per-visit service request.

| App | What it's for | Used most by |
|:-:|---|---|
| <img src="/screenshots/apps/09_project.png" alt="Project" width="140" /> | Service tasks, scheduling, Gantt view. The FSE's daily workspace. | Field service engineers, dispatchers |
| <img src="/screenshots/apps/21_service.png" alt="Service" width="140" /> | Service requests tied to customer systems. Links field work to contracts for cost tracking. | Dispatchers, operations, FSEs |
| <img src="/screenshots/apps/08_helpdesk.png" alt="Helpdesk" width="140" /> | Customer tickets and issue tracking. Triage, assign, resolve. | Support, operations |
| <img src="/screenshots/apps/15_timesheets.png" alt="Timesheets" width="140" /> | Log hours against tasks and projects. Drives labor cost, per diem, and payroll. | Everyone who logs time |

## Warehouse and Operations

Inventory, purchasing, assembly, and quality control.

| App | What it's for | Used most by |
|:-:|---|---|
| <img src="/screenshots/apps/06_inventory.png" alt="Inventory" width="140" /> | On-hand stock, transfers, receiving, shipping, truck stock. | Warehouse, operations |
| <img src="/screenshots/apps/05_purchase.png" alt="Purchase" width="140" /> | Vendor RFQs, purchase orders, vendor bills. | Purchasing, operations |
| <img src="/screenshots/apps/07_manufacturing.png" alt="Manufacturing" width="140" /> | Bills of materials, manufacturing orders, assembly workflows for multi-level systems. | Operations, assembly |
| <img src="/screenshots/apps/11_quality.png" alt="Quality" width="140" /> | Quality checks and inspection points attached to manufacturing and receiving. | Ops, assembly, receiving |

## Accounting and People

| App | What it's for | Used most by |
|:-:|---|---|
| <img src="/screenshots/apps/10_accounting.png" alt="Accounting" width="140" /> | General ledger, journal entries, analytic accounts, financial statements. | Accounting, leadership |
| <img src="/screenshots/apps/23_employees.png" alt="Employees" width="140" /> | The HR record for each person: hourly cost, manager, department, employment type. | HR, accounting, managers |

## Everyday Tools

Smaller apps you'll pull up as needed, not daily.

| App | What it's for | Used most by |
|:-:|---|---|
| <img src="/screenshots/apps/13_surveys.png" alt="Surveys" width="140" /> | Internal and external forms. Used for feedback, intake, and structured questionnaires. | Ops, HR |
| <img src="/screenshots/apps/22_sign.png" alt="Sign" width="140" /> | Electronic signature on contracts, quotes, and other documents. | Sales, leadership, operations |

## Admin

Reserved for system administrators.

| App | What it's for | Used most by |
|:-:|---|---|
| <img src="/screenshots/apps/27_apps.png" alt="Apps" width="140" /> | Install, update, and remove apps. Controls which modules are active. | Admins only |
| <img src="/screenshots/apps/28_settings.png" alt="Settings" width="140" /> | System configuration, users and access, company details, feature toggles. | Admins only |

## Apps We Don't Use at Nugget

These apps ship with Odoo and you'll see them referenced in Odoo's standard documentation or in third-party guides. We don't use them at Nugget. Listed here so you can recognize them.

<details>
<summary>Click to see apps that ship with Odoo but aren't part of Nugget's workflow</summary>

| App | What it's for (in standard Odoo) | Why we don't use it |
|:-:|---|---|
| <img src="/screenshots/apps/12_calendar.png" alt="Calendar" width="140" /> | Meeting calendar with event invites. | Team uses Google Calendar as the source of truth for meetings. |
| <img src="/screenshots/apps/14_to_do.png" alt="To-Do" width="140" /> | Personal to-do list inside Odoo, separate from record activities. | Activities attached to records (chatter) are the canonical to-do mechanism in Wyatt. A second personal-list app creates duplicate tracking with no link back to the work it's about. |
| <img src="/screenshots/apps/16_knowledge.png" alt="Knowledge" width="140" /> | Internal wiki and knowledge base. | Wyatt's documentation site (this one) serves that purpose. |
| <img src="/screenshots/apps/18_documents.png" alt="Documents" width="140" /> | Centralized file repository with folders, tags, and workflows. | Files live on Google Drive or attached directly to records. |
| <img src="/screenshots/apps/19_shop_floor.png" alt="Shop Floor" width="140" /> | Tablet-optimized MO workstation interface for assembly workers. | Assembly team works from the standard Manufacturing app. |
| <img src="/screenshots/apps/20_barcode.png" alt="Barcode" width="140" /> | Mobile barcode scanning for inventory transfers, picking, and receipts. | Not part of the current warehouse process. |
| <img src="/screenshots/apps/24_discuss.png" alt="Discuss" width="140" /> | In-app chat and channels. | Team communication happens in Google Chat. |
| <img src="/screenshots/apps/25_attendances.png" alt="Attendances" width="140" /> | Clock-in / clock-out attendance tracking. | Hourly tracking happens via Timesheets, not dedicated attendance. |
| <img src="/screenshots/apps/26_time_off.png" alt="Time Off" width="140" /> | PTO, sick leave, and other absence requests. | PTO is tracked outside of Wyatt. |

</details>

## How These Connect

The apps aren't isolated. A normal piece of work touches four or five of them:

- A **sale** (Sales) confirms into an **inventory delivery** (Inventory) and generates a **customer invoice** (Accounting).
- A **subscription** (Subscriptions) creates recurring **service tasks** (Project) that FSEs log **hours** on (Timesheets), posting **labor cost** to the contract's analytic (Accounting).
- A **purchase** (Purchase) receives into **inventory** (Inventory) and drops a **vendor bill** into Accounting.
- A **service request** (Service) ties a field visit to a specific customer system and the contract that covers it.

The apps share data through a single underlying database. Every task, customer, invoice, and stock move is one record stored once and referenced everywhere.

## Where to Go Next

- For the building blocks every tool shares (records, tables, chatter, search), see [Core Concepts](/core-concepts).
- For technical module documentation, see [Technical Docs](/technical/).
