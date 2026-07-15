# TV Ops Board

Operational wallboard for the office TVs, showing live Wyatt data across
three dark, glanceable boards that rotate every 30 seconds: **Operations**
(map + stage overview), **Service Detail** (queues, FSE workload, week
agenda, bottleneck funnel, client response times), and **Logistics**
(warehouse pipeline, SKU audit, shipments).

- **URL:** `https://nugops.com` (fallback: `https://nugget-tv.noah-321.workers.dev`)
- **Code:** [github.com/NoahTheWeaver/nugget-tv](https://github.com/NoahTheWeaver/nugget-tv) (private)
- **Hosting:** Cloudflare Workers (not Odoo.sh; fully separate from Wyatt)

## What it shows

All data comes from Wyatt production, read-only. There is no sample data.

| Section | Contents | Source |
|---|---|---|
| Ticket map | Every open service ticket plotted on a US map. Color = service project, size = service-call count (0–1 / 2–3 / 4+), pulsing ring = Escalated to SME. Work scheduled more than 2 weeks out fades. | Service Tasks board (`project.task`) + planned dates |
| Service Tasks by Stage | Open ticket count per stage (terminal "Closed" hidden) plus the average age of the tickets currently in each stage. Typical 90-day pass-through times live in the Service Detail funnel. | Stage history from chatter tracking |
| Working now | Tickets in the Working Now stage with client, assignees, and timesheeted hours. | `project.task` + timesheets |
| Schedule strip | Where open work piles up in time: now (window includes today), each of the next 8 weeks, following months, later — plus red "past" (working window fully elapsed, still in an active phase — slipped work) and "no date"; close-out-stage tickets are excluded since their dates describe the finished working period. | Planned dates |
| Tickets by priority | Open counts per P1–P4 tag, with a callout for tickets carrying no P tag. | `project.tags` |
| Client response times | Median first-reply and follow-up-reply times, last 7 days vs prior 7. Measured in **business hours** (8:00–18:00 Central, Mon–Fri) per the Communication & Scheduling Policy — time outside the window does not accrue, so a 2 a.m. email answered at 7 a.m. reads 0.0h. Same numbers as the Response Times report in Wyatt. | `nugget.service.response` |

(The warehouse ribbon and SKU-audit meter are dormant in the code, reserved
for a future warehouse board.)

## How it stays current

A scheduled job inside the Cloudflare Worker pulls fresh numbers from Wyatt
every 2 minutes over JSON-RPC and caches the result. The page itself
re-fetches every 2 minutes, so TVs update without touching them.

If a refresh fails, the board keeps showing the last good data and the
header chip flips from LIVE to STALE after 24 hours. It never goes blank.

Manual refresh options:

1. Unlock the board in a browser, then `POST /api/refresh` with the same
   session cookie.
2. From the `odoo-playground` repo:
   `./venv/bin/python nugget-tv/snapshot.py && cd nugget-tv && npx wrangler deploy`

## Access and the PIN

The page layout is public but carries no data; the data itself requires a
PIN. Each device enters the PIN once and stays unlocked for 90 days. Five
wrong attempts lock that device out for 15 minutes.

- The current PIN lives in `nugget-tv/.pin-note.txt` on the dev machine
  (never committed).
- To change it: `npx wrangler secret put BOARD_PIN` from `nugget-tv/`,
  then update the note file. Existing unlocked devices stay unlocked
  (their cookies remain valid); only new unlocks use the new PIN.

## TV setup

1. Point a kiosk browser (Fire Stick, Chromecast, or a Pi in kiosk mode is
   more reliable than built-in TV browsers) at the URL.
2. Enter the PIN once.
3. Optional URL params: `?board=service` pins a board; `&norotate=1`
   disables rotation. Rotation is dormant while there is only one board;
   it revives automatically when a second board (e.g. a visitor welcome
   banner) is added.

## Maintenance notes

- Every number on the board is computed in exactly one function in
  `src/refresh.js`, named after its card. Wrong number → one place to look.
- The frontend only formats a snapshot JSON; it never queries Odoo. Odoo
  upgrades only ever touch the query layer.
- The SKU audit metric counts the plain `Audited` tag. If the team starts
  date-stamping audit tags (an `Audited 22MAY2026` tag already exists),
  the metric will undercount until the convention is settled.
