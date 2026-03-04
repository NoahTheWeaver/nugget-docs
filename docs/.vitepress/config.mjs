import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Wyatt Docs',
  description: 'Developer and user documentation for Wyatt (Odoo 19)',
  base: '/',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Why Wyatt', link: '/why-wyatt' },
      { text: 'User Guide', link: '/user-guide/' },
    ],

    sidebar: {
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
          ],
        },
        {
          text: 'Accounting & Finance',
          items: [
            { text: 'Overview', link: '/user-guide/accounting/' },
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
