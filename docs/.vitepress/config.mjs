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
            { text: '[Coming Soon] AI Assistant', link: '/technical/modules/ai-assistant' },
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
          text: 'Sales',
          items: [
            { text: 'Overview', link: '/user-guide/sales/' },
            { text: '[TODO] Quoting & Proposals', link: '/user-guide/sales/quoting' },
            { text: '[TODO] System Sale End-to-End', link: '/user-guide/sales/system-sale' },
            { text: '[TODO] Service Contract Sale', link: '/user-guide/sales/service-contract-sale' },
            { text: '[TODO] Pipeline & Forecasting', link: '/user-guide/sales/pipeline' },
          ],
        },
        {
          text: 'Field Service',
          items: [
            { text: 'Overview', link: '/user-guide/field-service/' },
            { text: 'Time Tracking & Per Diem', link: '/user-guide/field-service/time-tracking' },
            { text: '[TODO] Service Requests', link: '/user-guide/field-service/service-requests' },
            { text: '[TODO] Logging Parts & Materials', link: '/user-guide/field-service/parts' },
          ],
        },
        {
          text: 'Operations',
          items: [
            { text: 'Overview', link: '/user-guide/operations/' },
            { text: 'Weekly Timesheet Validation', link: '/user-guide/operations/timesheet-management' },
            { text: '[TODO] Dispatch & Scheduling', link: '/user-guide/operations/dispatch' },
            { text: '[TODO] System Registry', link: '/user-guide/operations/system-registry' },
            { text: '[TODO] Service Request Management', link: '/user-guide/operations/service-requests' },
            { text: '[TODO] Contract Management', link: '/user-guide/operations/contracts' },
            { text: '[TODO] Receiving & System Intake', link: '/user-guide/operations/receiving' },
            { text: '[In Progress] Inventory Status Report', link: '/user-guide/operations/inventory-status-report' },
          ],
        },
        {
          text: 'Accounting & Finance',
          items: [
            { text: 'Overview', link: '/user-guide/accounting/' },
            { text: 'Posting Timesheets to GL', link: '/user-guide/accounting/timesheet-posting' },
            { text: 'Task-Level Cost Tracking', link: '/user-guide/accounting/task-analytics' },
            { text: 'Per Diem Administration', link: '/user-guide/accounting/per-diem' },
            { text: '[TODO] Service Contract Revenue', link: '/user-guide/accounting/contract-revenue' },
            { text: '[TODO] Monthly Financial Close', link: '/user-guide/accounting/financial-close' },
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
