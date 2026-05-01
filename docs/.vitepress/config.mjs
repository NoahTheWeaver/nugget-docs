import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Wyatt Documentation',
  description: 'Developer and user documentation for Wyatt (Odoo 19)',
  base: '/',

  lastUpdated: true,

  themeConfig: {
    // Trimmed nav: Home, the 3 Getting Started articles, Technical, Feedback.
    // User guides still build (URLs work for direct links / Hypothesis
    // annotations) but are not surfaced in the nav and are excluded from
    // local search via the _render filter below.
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Getting Started',
        items: [
          { text: 'Why Wyatt', link: '/why-wyatt' },
          { text: 'Core Concepts', link: '/core-concepts' },
          { text: 'The Wyatt Toolbox', link: '/user-guides/apps' },
        ],
      },
      { text: 'Technical Docs', link: '/technical/' },
      { text: 'Feedback', link: '/feedback' },
    ],

    sidebar: {
      '/technical/': [
        {
          text: 'Technical',
          items: [
            { text: 'Overview', link: '/technical/' },
            { text: 'Risk Assessment', link: '/technical/risk-assessment' },
          ],
        },
        {
          text: 'Custom Modules',
          items: [
            { text: 'Service Requests', link: '/technical/modules/service-requests' },
            { text: 'System Registry', link: '/technical/modules/systems' },
            { text: 'Task Analytics', link: '/technical/modules/task-analytics' },
            { text: 'Timesheet Posting', link: '/technical/modules/timesheet-posting' },
            { text: 'Per Diem Tracking', link: '/technical/modules/per-diem' },
            { text: 'Purchase Configurator', link: '/technical/modules/purchase-configurator' },
            { text: 'Inventory Status', link: '/technical/modules/inventory-status' },
            { text: 'Component Inventory', link: '/technical/modules/component-inventory' },
            { text: 'Variant Name', link: '/technical/modules/variant-name' },
            { text: 'Track Location Analytics', link: '/technical/modules/track-location-analytics' },
            { text: 'Maintenance Checklist', link: '/technical/modules/maintenance-checklist' },
            { text: 'Google Sheet Integration', link: '/technical/modules/google-sheet-integration' },
            { text: 'Gantt View', link: '/technical/modules/gantt' },
            { text: '[Coming Soon] AI Assistant', link: '/technical/modules/ai-assistant' },
          ],
        },
        {
          text: 'End-to-End Testing',
          items: [
            { text: 'Overview', link: '/technical/e2e-testing/' },
            { text: 'System Procurement', link: '/technical/e2e-testing/system-procurement' },
            { text: 'System Sale', link: '/technical/e2e-testing/system-sale' },
            { text: 'Service Contract Onboarding', link: '/technical/e2e-testing/service-contract' },
            { text: 'Emergency Dispatch', link: '/technical/e2e-testing/emergency-dispatch' },
          ],
        },
        {
          text: 'Developer Guides',
          items: [
            { text: 'Dev Environment Setup', link: '/technical/dev-setup' },
            { text: 'Odoo Docs Tile', link: '/technical/odoo-docs-tile' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NoahTheWeaver/nugget-docs' },
    ],

    // Local search excludes user-guides paths so trimmed-but-still-built
    // pages don't surface in the in-site search box. Apps Overview is
    // an exception — it's surfaced in the Getting Started nav.
    search: {
      provider: 'local',
      options: {
        _render(src, env, md) {
          const html = md.render(src, env)
          if (env.frontmatter?.search === false) return ''
          const path = env.relativePath || ''
          if (path.startsWith('user-guides/') && path !== 'user-guides/apps.md') {
            return ''
          }
          return html
        },
      },
    },

    footer: {
      message: 'Nugget Scientific internal documentation',
    },
  },
})
