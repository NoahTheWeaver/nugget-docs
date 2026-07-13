# TV Ops Board

Operational wallboard for the office TVs, showing live Wyatt data on one
dark, glanceable page.

- **URL:** `https://nugops.com` (fallback: `https://nugget-tv.noah-321.workers.dev`)
- **Code:** [github.com/NoahTheWeaver/nugget-tv](https://github.com/NoahTheWeaver/nugget-tv) (private)
- **Hosting:** Cloudflare Workers (not Odoo.sh; fully separate from Wyatt)

## What it shows

All data comes from Wyatt production, read-only. There is no sample data.

| Section | Contents | Source |
|---|---|---|
| Ticket map | Every open service ticket plotted on a US map. Color = service project, size = ticket age, pulsing ring = Escalated to SME. | Service Tasks board (`project.task`) |
| Stage pipeline | Open ticket count per stage plus the average days a ticket spends in each stage (trailing 90 days). | Stage history from chatter tracking |
| Opened vs closed | Tickets opened and closed per week, last 6 completed weeks. | Task create dates + stage history |
| Longest in stage | The tickets that have sat longest in their current stage. | `date_last_stage_update` |
| Client leaderboard | Most tickets opened in the last 30 days, by company. | Tasks grouped by commercial partner |
| Warehouse ribbon | Houston Receipts / Pick / Delivery: ready, waiting on stock, and late counts. Matches the Inventory Overview kanban. | `stock.picking` |
| SKU audit | Products tagged `Audited` over products tagged `Top 80%`. | Product tags |
| Ticker | Latest ticket opens and closes. | Task history |

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
