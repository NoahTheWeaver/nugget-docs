# Wyatt Docs

Documentation site for Wyatt, Nugget Scientific's Odoo 19 instance. Built with [VitePress](https://vitepress.dev).

Live at [wyatt-docs.nuggetscientific.com](https://wyatt-docs.nuggetscientific.com). Auto-deploys to GitHub Pages on push to `main`.

## Running Locally

```bash
npm install
npm run dev
```

Default dev port is `5173` (or the next free port). VitePress prints the URL on startup.

## Inline Comments (Hypothesis)

The site embeds the [Hypothesis](https://web.hypothes.is) client so readers can highlight any passage and leave an anchored annotation.

### To leave a comment

1. Create a free Hypothesis account at [hypothes.is/signup](https://hypothes.is/signup) if you don't have one.
2. Visit any page on this site. Click the tab on the right edge of the viewport to open the Hypothesis sidebar.
3. Sign in inside the sidebar.
4. Select text on the page and click **Annotate** (or **Highlight** for a personal bookmark).

### To view everyone's annotations

Either:

- Sign in to Hypothesis and search `url:https://wyatt-docs.nuggetscientific.com/*` in the Hypothesis web app, or
- Subscribe to the RSS feed: `https://hypothes.is/stream.rss?wildcard_uri=https://wyatt-docs.nuggetscientific.com/*`

### To disable Hypothesis on a specific page

Add a frontmatter flag:

```markdown
---
title: Some Page
hypothesis: false
---
```

On a hard page load the Hypothesis client won't be injected. Note: if a reader lands on an annotation-enabled page first, then navigates to a `hypothesis: false` page in the same session, the client will still show until the next refresh. Good enough for keeping commenting off the home page / overview pages.

## Project Layout

```
docs/
  .vitepress/
    config.mjs          # Nav, sidebars, site metadata
    theme/
      index.mjs         # Theme extension (Hypothesis injection, custom CSS import)
      custom.css        # Brand colors, theme tweaks
  public/
    screenshots/        # Icons and UI screenshots referenced by content
  core-concepts.md      # Site-wide orientation page
  why-wyatt.md
  user-guides/
    index.md
    apps.md
    field-service/
    sales/
    operations/
    accounting/
  technical/
    modules/
    e2e-testing/
```
