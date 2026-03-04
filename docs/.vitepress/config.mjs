import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Wyatt Docs',
  description: 'Developer and user documentation for Wyatt (Odoo 19)',
  base: '/',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Why Wyatt', link: '/why-wyatt' },
      { text: 'Modules', link: '/modules/' },
      { text: 'User Guide', link: '/user-guide/' },
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
      '/user-guide/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Overview', link: '/user-guide/' },
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
