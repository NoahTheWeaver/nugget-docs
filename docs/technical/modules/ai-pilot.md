---
title: AI Pilot (Claude)
---

# AI Pilot (Claude)

Odoo 19's built-in AI app, running on Anthropic Claude, limited to a pilot group, and wired to Doc (our Hamilton STAR service-manual assistant). Three modules: `nugget_ai_access`, `nugget_ai_claude`, `nugget_ai_doc`.

**Status (24 August 2026):** live on production. All three modules installed; pilot roster is Noah, Bo and Gabrielle; every agent runs on Claude Opus 5; the AI tile sits last on the home menu. The Anthropic API key must be present in AI > Configuration > Settings for chats to answer. (History: the stock AI app was installed for everyone on 18 August, uninstalled on 21 August, and returned on the 24th gated behind the pilot group.) Earlier plan for this page (Gemini + Wyatt docs as a knowledge source, no custom code) is superseded by what follows.

## Why This Exists

The AI app (`ai_app`) was installed on production in mid-August 2026. It ships with no access group: the moment it is installed every internal user gets the AI tile, an "Ask AI" button in the top bar, an "AI" command in every rich-text editor and an Ask AI button in the full mail composer, all pointing at a provider nobody had configured. Odoo also only speaks to OpenAI and Google.

We want three things from it before deciding whether it earns a place in Wyatt: a small group sees it, it runs on Claude, and it knows Hamilton STAR service the way Doc does. Each is one module, so they can be installed, removed or replaced independently.

## How It Works

### `nugget_ai_access` — who sees it

Adds one group, **Nugget AI / User**, and puts every AI surface behind it.

| Surface | How it is gated |
|---|---|
| AI app tile, Agents, Topics, Configuration menus | Group on the `ai_app` root menu (XML, no code) |
| "Ask AI" button in the top bar | The systray entry is re-registered with an `isDisplayed` guard keyed on a session flag |
| Command palette "Ask AI" (`/` namespace) | Server: `get_ask_ai_agent` returns nothing for non-members, so the client never draws it |
| Editor "AI" command (toolbar button, `/AI` powerbox, power button) | `UserCommandPlugin.getCommand` patch marks the command unavailable |
| Ask AI button in the full mail composer / scheduled message | Template `t-if` on the button |

Those are cosmetic. The fence is server-side: `ai.agent._create_ai_chat_channel` and `ai.agent._generate_response` raise an AccessError for anyone outside the group, so a hidden button reached by URL or RPC still does nothing. Every chat entry point in the `ai` module reaches one of those two methods, often through `sudo()`, which is why the check keys off the real user (`env.user`) and not the superuser flag. OdooBot is exempt so scheduled AI actions keep working.

Deliberately not an `ir.rule` on `ai.agent`: the stock module reads agents in several sudo-less internal paths and a deny rule would surface as AccessErrors in unrelated places. A non-member who guesses the Agents URL sees a read-only list and nothing else.

The session flag (`nugget_ai_user`) rides along in `session_info`, the same way the `ai` module ships its own session identifier, because the systray and editor registries decide visibility synchronously, before any RPC can complete.

### `nugget_ai_claude` — which model answers

Odoo's `LLMApiService` chooses a provider with an `if/elif` on a provider string (OpenAI via the Responses API, Google via `generateContent`) and fills the agent's **LLM Model** dropdown from a module-level `PROVIDERS` list. Neither is an extension point, and Anthropic's OpenAI-compatibility endpoint does not serve the Responses API, so this module adds a third branch the only way available: it appends an `anthropic` entry to `PROVIDERS` and wraps the six service methods that switch on provider. Applied once at import; idempotent; every wrapper forwards arguments untouched for the stock providers.

- Models offered: **Claude Opus 5** (default for new agents), Claude Sonnet 5, Claude Haiku 4.5.
- Key: **AI > Configuration > Settings > "Use your own Anthropic (Claude) account"** (config parameter `ai.anthropic_key`, or `ODOO_AI_ANTHROPIC_TOKEN` in the environment), shaped exactly like the stock OpenAI/Google settings.
- Messages API, raw HTTP through the service's own `_request`, so Odoo's error mapping, request logging and timeouts keep working and Odoo.sh needs no extra pip dependency. Request timeout is 120s (Opus with adaptive thinking can exceed the service's 30s default).
- Tool loop: the assistant turn (text, `tool_use` and any thinking blocks) is echoed back verbatim and tool results go back as `tool_result` blocks, matching the contract the stock loop expects.
- No sampling parameters are sent: Claude 5-family models reject `temperature`, so the agent's **Response Style** has no effect on Claude agents (the control still shows).
- Reasoning effort is sent as `output_config.effort` on Opus 5 / Sonnet 5 (not Haiku, which rejects it). The API default, `high`, produced 20-30s chat replies on the pilot; the module defaults to **Medium** and exposes it as **Claude reasoning effort** in the same settings block (config parameter `ai.anthropic_effort`: low, medium, high, xhigh, max).
- Chat rendering: Odoo converts replies with `markdown2`, which (like classic Markdown) needs a blank line before a list, table or heading that follows a sentence. Claude writes them tight, so bullets collapsed into one paragraph and `**` pairs mis-nested (stray `*` in the chat). `ai.agent._post_ai_response` is overridden to normalize the Markdown first (`utils/markdown_normalize.py`: blank lines around lists, tables, headings, quotes and fences; fenced code left alone; idempotent). Provider-agnostic, but lives here because Claude's compact Markdown exposed it. Two more pieces of the same problem: Odoo's mail styles give chat tables no borders, padding or spacing (a Markdown table rendered as one blob), so the module ships a small SCSS for `.o-mail-Message-body table`; and the Odoo.sh platform image carries an old `markdown2` that mis-nests emphasis next to a quote (`**"x"**` left a stray `*`), so the repo's root `requirements.txt` pins `markdown2>=2.5.5` for Odoo.sh to install. Finally, `_post_ai_response` is replaced outright (same `message_post` call as stock) so the rendered HTML gets a finishing pass: every `<a>` opens in a new tab (`target="_blank" rel="noopener noreferrer"`), and bare `https://` URLs in the text become links (Odoo's client only linkifies what people type in the composer, not server-posted HTML). Odoo's chat click handler only intercepts its own `o_channel_redirect` / `o_mail_redirect` / `o_message_redirect` anchors, so ordinary links honour the target.
- Opus 5 requests carry `fallbacks: "default"` (beta): a safety-classifier refusal is re-run on Anthropic's recommended fallback model instead of returning an empty reply.
- Installing the module switches the two stock agents (Odoo Agent, Ask AI) to Claude Opus 5 once; admins can change them afterwards without a module update reverting it. AI server actions default to Claude too.
- Embeddings: Anthropic has none. Claude agents borrow Google's `gemini-embedding-001`, so an agent with **Sources** (RAG uploads) needs a Google key as well. Chat does not. Studio AI fields and voice transcription stay on OpenAI (hard-coded in core).

### `nugget_ai_doc` — what it knows about Hamilton STAR

Doc (doc.nuggetscientific.com) already indexes the official STAR service manual, addendums, Service News bulletins, the Venus programmer's manuals and 25 years of field knowledge mined from team chat and email, behind a Cloudflare Worker. That corpus is about 843,000 words: too big to put in a prompt, and re-embedding it inside Odoo would need a Google key and duplicate an index Doc already maintains. So agents get Doc as a **tool** instead:

- `ask_doc` AI tool (an `ir.actions.server` of type code) posts the question to Doc's worker and returns the answer plus a **Sources:** Markdown list of `[Title](absolute link)` entries (a real list with the blank line Markdown wants, and Markdown links rather than bare URLs after a dash, because the first pilot replies dropped bare URLs entirely when relaying). The topic and the Doc agent prompt both say to reproduce that list verbatim.
- "Hamilton STAR service knowledge (Doc)" AI topic teaches agents when to call it (any STAR hardware/firmware/error-code/procedure question, before answering from general knowledge) and how to relay citations.
- A **Doc** agent (Claude Opus 5, Doc's field-engineer voice), and the topic is also attached to the stock **Ask AI** agent so the top-bar chat can answer STAR questions.
- Doc's worker URL is the config parameter `nugget_ai_doc.worker_url` (default `https://star-manual-chat.noah-321.workers.dev/`); a redeploy of Doc needs no change here. Doc itself runs Haiku behind the worker, so a Doc answer is Haiku's synthesis relayed by the Wyatt agent. A retrieval-only endpoint on the worker (so Claude composes from raw sections) is the obvious next step if the pilot sticks.

## Key Views

- **Home menu** — AI tile (pilot members only)
- **Top bar** — Ask AI button (pilot members only); also `/` then "Ask AI" in the command palette
- **Any rich-text field** — "AI" toolbar button and `/AI` powerbox command (pilot members only)
- **AI > Agents** — Ask AI, Odoo Agent, Doc; **AI > Configuration > Settings** for provider keys
- **Settings > Users > Access Rights > Nugget AI** — the pilot roster

## Configuration

| Setting | Where | Value |
|---|---|---|
| Pilot roster | User form, Access Rights, **Nugget AI** = User | Data, not module XML; change without a deploy |
| Anthropic API key | AI > Configuration > Settings | Required before any chat answers |
| Google API key | same page | Only if an agent gets Sources (embeddings) |
| Agent model | AI > Agents > agent form > LLM Model | Opus 5 default; Sonnet 5 if speed or cost matters |
| Claude reasoning effort | AI > Configuration > Settings (Anthropic block) | Medium by default; Low for snappier chat |
| Doc worker URL | config parameter `nugget_ai_doc.worker_url` | Defaults to the live worker |

Install/roster/verify is scripted: `scripts/_sandbox_ai_pilot_setup.py sandbox|prod` in the playground repo (idempotent; the `prod` variant asks before writing). `nugget_ai_access` is not a dependency of the other two; the script installs all three explicitly.

## Test Plan

| # | Test | Expected Result |
|---|------|-----------------|
| 01 | Log in as a pilot member | AI tile on the home menu; Ask AI button in the top bar |
| 02 | Log in as a non-member | No AI tile; no Ask AI button; `/` palette has no "Ask AI" |
| 03 | Non-member selects text in a rich-text field | No "AI" toolbar button; `/AI` not in the powerbox |
| 04 | Non-member opens the full mail composer | No Ask AI button |
| 05 | Non-member calls `ai.agent.action_ask_ai` by RPC | "No configured Ask AI agent" (nothing created) |
| 06 | Member asks Ask AI a question with the Anthropic key set | Answer from Claude; `ai.agent` LLM Model shows `claude-opus-5` |
| 07 | Member asks Ask AI a Hamilton STAR question ("autoload init procedure?") | Answer relayed from Doc with a Sources list linking to doc.nuggetscientific.com |
| 08 | Remove the key, ask again | Clear "No API key set for provider 'Anthropic'" error, nothing crashes |
| 09 | Open an agent form | LLM Model dropdown lists Claude Opus 5 / Sonnet 5 / Haiku 4.5 next to the stock models |
| 09b | Ask a question whose answer is a breakdown ("how many STARs does Vibrant have, by contract status?") | Bullets render as a real list, bold labels intact, no stray `*`; a table renders as a table |
| 09c | Change Claude reasoning effort to Low and ask again | Noticeably faster reply |
| 09d | Any Doc-backed answer | Sources list present with clickable links; every link opens in a new tab |
| 10 | Uninstall `nugget_ai_access` | AI tile and buttons return for everyone (menu group row goes with the group) |

Automated: 56 unit tests across the three modules (`--test-tags nugget_ai`), plus `scripts/_e2e_ai_access_local.py`, a headless browser check of surfaces 01-04 against a local dev DB.

## Cross-Module Dependencies

- `nugget_ai_access` and `nugget_ai_claude` depend on `ai_app` (and through it `ai`); `nugget_ai_doc` depends on `nugget_ai_claude` (its agent is a Claude agent).
- `nugget_ai_claude` patches `odoo.addons.ai.utils.llm_api_service.LLMApiService` and appends to `odoo.addons.ai.utils.llm_providers.PROVIDERS`; it also styles `.o-mail-Message-body table` (mail) and relies on the repo-root `requirements.txt` (`markdown2>=2.5.5`) on Odoo.sh. Re-verify on every Odoo update: the `Provider` tuple already grew a field (`deprecated_models`) between our local checkout and the Odoo.sh build, which is why the registration is built from `Provider._fields` and every override forwards `*args/**kwargs`.
- `nugget_ai_access` patches `UserCommandPlugin` (html_editor), the `ai` systray entry and `MailComposerChatGPT`; overrides `ai.agent` and `ir.http.session_info`.
- `nugget_ai_doc` calls out to Doc's worker over HTTPS (no auth on that endpoint) and reads `ai.agent`, `ai.topic`, `ir.actions.server`.
- Odoo.sh runs newer `ai` code than the local `odoo-enterprise` checkout and there is no SSH into builds, so the sandbox is the compatibility test for this set.
