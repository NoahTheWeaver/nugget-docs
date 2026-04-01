import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Wyatt Docs',
  description: 'Developer and user documentation for Wyatt (Odoo 19)',
  base: '/',

  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Why Wyatt', link: '/why-wyatt' },
      { text: 'Technical', link: '/technical/' },
      { text: 'User Guide', link: '/user-guide/' },
    ],

    sidebar: {
      '/technical/': [
        {
          text: 'Technical',
          items: [
            { text: 'Overview', link: '/technical/' },
          ],
        },
        {
          text: 'Custom Modules',
          items: [
            { text: '☐ Service Requests', link: '/technical/modules/service-requests' },
            { text: '☐ Task Analytics', link: '/technical/modules/task-analytics' },
            { text: '☐ Timesheet Posting', link: '/technical/modules/timesheet-posting' },
            { text: '☑ Per Diem Tracking', link: '/technical/modules/per-diem' },
            { text: '☐ Purchase Configurator', link: '/technical/modules/purchase-configurator' },
            { text: '☐ Inventory Status', link: '/technical/modules/inventory-status' },
            { text: '☐ Component Inventory', link: '/technical/modules/component-inventory' },
            { text: '☐ Variant Name', link: '/technical/modules/variant-name' },
            { text: '☐ Track Location Analytics', link: '/technical/modules/track-location-analytics' },
            { text: '☐ Maintenance Checklist', link: '/technical/modules/maintenance-checklist' },
            { text: '☐ Google Sheet Integration', link: '/technical/modules/google-sheet-integration' },
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
      '/user-guide/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Overview', link: '/user-guide/' },
          ],
        },
        {
          text: 'Field Service',
          items: [
            { text: 'Overview', link: '/user-guide/field-service/' },
            { text: 'Per Diem Tracking', link: '/user-guide/field-service/per-diem' },
          ],
        },
        {
          text: 'Accounting & Finance',
          items: [
            { text: 'Overview', link: '/user-guide/accounting/' },
            { text: 'Per Diem Administration', link: '/user-guide/accounting/per-diem' },
          ],
        },
        {
          text: 'Operations',
          items: [
            { text: 'Overview', link: '/user-guide/operations/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NoahTheWeaver/nugget-docs' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Nugget Scientific internal documentation',
    },
  },
})
