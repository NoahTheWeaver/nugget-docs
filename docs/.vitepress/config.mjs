import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Wyatt Docs',
  description: 'Developer and user documentation for Wyatt (Odoo 19)',
  base: '/',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Modules', link: '/modules/' },
      { text: 'Guides', link: '/guides/' },
    ],

    sidebar: {
      '/modules/': [
        {
          text: 'Custom Modules',
          items: [
            { text: 'Overview', link: '/modules/' },
            { text: 'Variant Name', link: '/modules/variant-name' },
            { text: 'Inventory Status', link: '/modules/inventory-status' },
            { text: 'Task Analytics', link: '/modules/task-analytics' },
            { text: 'Component Inventory', link: '/modules/component-inventory' },
            { text: 'Purchase Configurator', link: '/modules/purchase-configurator' },
            { text: 'Service Requests', link: '/modules/service-requests' },
            { text: 'Per Diem Tracking', link: '/modules/per-diem' },
          ],
        },
      ],
      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'Overview', link: '/guides/' },
            { text: 'Dev Environment Setup', link: '/guides/dev-setup' },
            { text: 'Odoo Docs Tile', link: '/guides/odoo-docs-tile' },
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
