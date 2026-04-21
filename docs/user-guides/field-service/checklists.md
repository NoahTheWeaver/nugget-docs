---
title: Completing Service Checklists
---

# Completing Service Checklists

Every service visit has a checklist — a PM worksheet, a repair report, an installation qualification — and right now those checklists live in Google Sheets. Wyatt opens the right sheet for the job; you fill it out on your laptop or tablet; then it attaches back to the service request as an XLSX so the record is complete.

Eventually the checklist will live inside Wyatt natively. For now, the Sheets hand-off is the workflow.

## The Flow

1. Open your task and click into the linked service request.
2. Click the **Report URL** field on the request — it opens the correct Google Sheet in a new tab.
3. Fill in the sheet (system serial, date, findings, pass/fail items, your name).
4. Download the completed sheet as **XLSX** (File > Download > Microsoft Excel).
5. Back in Wyatt, open the service request's **chatter** and drag the XLSX onto the attachments area.
6. Toggle **Post-service checklist completed** on the service request.

That's the whole loop. Two to five minutes if the sheet is short; longer for a full PM worksheet.

::: tip Work offline, upload later
If you don't have connectivity on-site, save the Google Sheet offline in your browser before you go. Fill it out on the instrument, then download and attach once you're back online.
:::

## Finding the Right Sheet

The **Report URL** on the service request is set by the dispatcher when they create the task. It points to the right template for the service type (PM, Repair, IQ/OQ, VV, etc.).

If the Report URL is blank or points to the wrong template, leave a [log note](/core-concepts#_10-chatter) for the dispatcher. Don't start filling in the wrong sheet — it'll have the wrong fields for what you're doing.

## What to Fill Out

Every checklist has a few universal fields plus content specific to the service type. Universals:

- **System serial number** — copy from the service request (or from the instrument's label)
- **Date** — the visit date
- **Service engineer** — your name
- **Customer / site** — from the service request

Then the service-type-specific content: inspection items, pass/fail toggles, measurements, photos (for visual checks), notes.

::: warning Fields don't auto-fill
Today, the Google Sheet is a plain link. None of your service request data pre-fills into the sheet — you enter the serial, date, customer, and your name manually every time. If the Sheets template ever starts pre-filling, you'll see fields already populated when you first open the sheet. Let the dispatcher know if that happens and isn't working.
:::

## Attaching the Completed Sheet

Wyatt needs the filled-out worksheet on the service request so it's part of the permanent record. The attachment path:

1. In Google Sheets, **File > Download > Microsoft Excel (.xlsx)**.
2. In Wyatt, open the service request.
3. Scroll to the chatter at the bottom.
4. Drag the XLSX file onto the chatter's attachment area, or click the paperclip icon and select the file.
5. Add a one-line comment ("PM worksheet attached") and send.

The attachment is now visible to anyone who opens the service request. Dispatch and accounting see it during closeout review.

## What If There's a Spreadsheet Report Button?

Some templates may support a **Spreadsheet Report** button in the request header that generates a pre-filled sheet directly. If you see it:

1. Click **Spreadsheet Report**.
2. Pick the template from the wizard.
3. Fill in anything the system didn't pre-fill.
4. Download as XLSX — it attaches back to the chatter automatically.

If you don't see a Spreadsheet Report button, the plain Report URL flow above is the one to use. Both end in the same place: a filled XLSX on the service request's chatter.

## Closing the Loop

Once the XLSX is attached:

1. Open the service request.
2. Toggle **Post-service checklist completed** to confirm the sheet is done and attached.
3. Proceed to closeout (Resolution Code, Notes, move the task forward — see [Service Requests](/user-guides/field-service/service-requests#at-closeout)).

If you close out without attaching the sheet, dispatch will bounce the task back to you. One of the first things they check.

## Related

- [Your Daily Workflow](/user-guides/field-service/daily-workflow) — where checklists fit in a visit
- [Service Requests](/user-guides/field-service/service-requests) — the request is where the URL and attachment live
- [Logging Parts & Materials](/user-guides/field-service/parts) — parts you installed should also show up on the worksheet
