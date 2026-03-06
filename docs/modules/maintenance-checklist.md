# Maintenance Checklist Report

**Technical name:** `maintenance_checklist_report`
**Depends on:** `base`, `maintenance`, `worksheet`, `maintenance_worksheet`

Custom maintenance worksheet template system with 100+ dynamic fields for PM (preventive maintenance) checklists. Covers equipment inspection, damage assessment, lubrication, calibration, and volume verification. Includes PDF report generation and email distribution.

## How It Works

1. Set a **Worksheet Template** on the maintenance request that has "Maintenance Checklist Worksheet" enabled
2. Click the worksheet button on the request to open or create the checklist
3. Fill in inspection results, pass/fail fields, and technician notes
4. Use the **Print Worksheet Report** button to generate a PDF or email it to a contact

## Checklist Sections

The PM worksheet covers these areas (Hamilton-specific):

- **Header** — Department, owner, revision, instrument info, service engineer, date, service type
- **Equipment Components** — 1000uL channel, 5mL channel, iSWAP, tube gripper, imaging, CO-RE heads, autoload, HEPA hood, etc.
- **Modules** — Heat shaker, cooling/heating modules, temperature carrier, CAT shaker, BVS/CVS, decapper
- **Maintenance Actions** — Save system config, save instrument data, run daily maintenance
- **Physical Inspection** — Covers, deck, waste station, autoload, iSWAP, 96-head condition
- **Damage Checks** — Insertion guides, loading trays, torpedoes, stop hooks
- **Lubrication & Calibration** — PX adjustments, HO/RO checks, autoload calibration
- **Final Verification** — Volume verification, daily maintenance results

## Key Views

- **Maintenance request form** — "Print Worksheet Report" header button, opens send/print wizard
- **Worksheet template form** — Hidden "Maintenance Checklist Worksheet" flag
