---
title: Screenshots TODO
search: false
head:
  - - meta
    - name: robots
      content: noindex,nofollow
---

# Screenshots TODO

Internal capture list. The training pages have ASCII mockups + click-by-click sequences; this list says which real screenshots to add when someone has a few minutes in front of a logged-in Wyatt session. Each entry: filename + what to capture.

Drop captured PNGs into `nugget-docs/docs/public/screenshots/training/` with the listed filenames. The pages already reference these via `<img src="/screenshots/training/<name>.png">` placeholders in the markdown (commented out until the file exists).

## Priority 1 — these matter most for the first close

| Filename | What to capture |
|---|---|
| `01_review_menu_open.png` | The top nav with **Accounting → Review** menu open, showing the Audit sub-menu and Working Files. |
| `02_working_file_form.png` | A new working file form, filled in for 2026-02 close (Type, Date From, Date To, Reports tab visible). |
| `03_tb_with_audit_badges.png` | The Trial Balance opened from inside a working file, showing the audit-status badges (gray/green/blue/red dots) at the start of each row. |
| `04_audit_status_dropdown.png` | The To Review/Reviewed/Supervised/Anomaly dropdown after clicking a badge. |
| `05_lock_dates_wizard.png` | The Lock Journal Entries wizard, blank, showing all five lock-date fields (Lock Everything / Lock Tax Return / Lock Sales / Lock Purchases / Hard Lock). |
| `06_lock_dates_exception_alert.png` | The same wizard with the inline exception alert visible (Applies To / Duration / Reason fields). To trigger: enter a lock date that would block a needed back-post. |
| `07_reverse_entry_wizard.png` | The Reverse Journal Entry wizard for an accrual JE, showing only the Date and Journal fields (no Refund Method, no Auto Post checkbox). |
| `08_bank_rec_journal_tile.png` | The Accounting Dashboard with the bank journal tile expanded, showing the Report button (top-right of the tile). |
| `09_inventory_valuation_menu.png` | The Accounting → Review → Inventory menu open, showing the Inventory Valuation entry. |

## Priority 2 — useful but not first-close-critical

| Filename | What to capture |
|---|---|
| `10_tb_drill_to_gl.png` | TB → click an account balance → opens General Ledger filtered to that account. |
| `11_gl_drill_to_je.png` | GL → click a journal item → opens the parent JE form. |
| `12_je_to_source.png` | A JE form showing the "Source: Sale Order" link or similar. |
| `13_avalara_filed_returns.png` | (Avalara, not Wyatt) the Filed Returns list showing status = Filed for a recent period. |
| `14_qb_payroll_taxes_payments.png` | (QB Payroll, not Wyatt) the Taxes → Payments page showing recent confirmations. |

## Priority 3 — nice-to-have polish

| Filename | What to capture |
|---|---|
| `15_audit_trail_report.png` | The Accounting → Review → Logs → Audit Trail report showing recent JE modifications. |
| `16_lock_exception_dev_mode.png` | The `account.lock_exception` model accessed via dev-mode Settings → Technical → Database Structure → Models. |

## How to embed once captured

For each captured screenshot, add a Markdown image tag at the relevant section in the corresponding training page. Example for the working-file form:

```markdown
![Working file form for 2026-02 close](/screenshots/training/02_working_file_form.png)
```

The pages currently have ASCII mockups in those positions; replace them with the image tag (or keep both — the ASCII is search-friendly text, the screenshot is human-friendly visual). I'd recommend keeping both: ASCII first as a quick reference, screenshot below as confirmation.

## Maintenance

Re-capture on any major Wyatt UI change:

- Odoo upgrade (19 → 20).
- Custom Nugget module that changes how the apps page renders.
- A theme or branding change that affects the visual layout.

If a screenshot becomes stale, the ASCII mockup beside it usually still describes the layout correctly. Update both when re-shooting.
