---
title: AI Assistant [Coming Soon]
---

# AI Assistant [Coming Soon]

**Target:** Phase 2, post-launch\
**Estimated effort:** ~2-4 hours (configuration, not development)

Use Odoo 19's built-in AI features to give every user an in-app assistant that answers questions using Nugget's own documentation (Wyatt docs) as its knowledge base.

## Why This Matters

Odoo 19 ships with AI features built in — agents, prompts, knowledge sources, and a chat interface already wired into every form. Right now it uses generic Odoo knowledge. By connecting it to our Wyatt docs, every user gets an assistant that actually knows how things work at Nugget.

Instead of reading documentation, users ask the AI button and get answers grounded in our specific setup — in context of whatever record they're looking at.

## How It Would Work

Odoo 19 natively supports **Google Gemini** and **ChatGPT** as AI providers. The plan is to use Gemini with Odoo's built-in AI Agent framework, configured with Wyatt docs as a knowledge source. No custom module needed.

### Setup steps

1. **Get a Gemini API key** from Google AI Studio
2. **Configure the API key** in Odoo (Settings > AI)
3. **Add Wyatt docs as a knowledge source** using Odoo's AI Agent source/topic configuration
4. **Test across key views** — timesheets, tasks, accounting, inventory

### Examples

| User is on... | Asks... | AI answers using... |
|---|---|---|
| Timesheet form | "How does per diem work?" | Time Tracking & Per Diem guide — responds with Nugget's rates ($100/$50), door-to-door definition |
| Review queue | "What happens if I cancel this journal entry?" | Timesheet Posting doc — explains reversal behavior, timesheets reappear in queue |
| Task form | "Can I close this task?" | Service Requests doc — explains stage gating, open service requests must be closed first |
| Employee settings | "What is hourly cost used for?" | Timesheet Posting doc — explains it drives the dollar amount on journal entries |

## Odoo 19 AI Features We'll Use

Odoo 19's AI stack is more capable than expected. Relevant built-in features:

| Feature | What it does | How we'd use it |
|---|---|---|
| **AI Agents** | Configurable agents with topics, tools, and knowledge sources | Main assistant — configure with Wyatt docs as source |
| **AI Default Prompts** | Customizable prompt templates with buttons | Tailor prompts to Nugget's terminology and processes |
| **AI Server Actions** | Manager/worker pattern with custom tools | Potentially automate routine tasks (e.g., "create a service request for this task") |
| **AI Fields** | Auto-computed fields using AI | Could auto-generate task summaries or service report drafts |

## What We're Not Building

- No custom Odoo module
- No provider swap (using Gemini as Odoo natively supports it)
- No vector database or embedding pipeline
- No custom API integration

The entire value is in **configuring** the existing framework with our documentation, not building new infrastructure.

## Open Questions

1. **Knowledge source format** — Can Odoo's AI agent ingest markdown files directly, or do we need to paste content into Odoo's knowledge base? Needs investigation in the source code.
2. **Context awareness** — How much record context does the AI button pass to the agent? Field values, model name, user role?
3. **Cost** — Gemini API pricing at Nugget's scale (15 users, occasional questions) should be negligible, but worth tracking.
4. **Branding** — Can we name the agent "Wyatt" in the UI? Fits the existing documentation branding.
