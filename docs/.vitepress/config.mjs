import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Wyatt Docs',
  description: 'Developer and user documentation for Wyatt (Odoo 19)',
  base: '/',

  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Getting Started',
        items: [
          { text: 'Why Wyatt', link: '/why-wyatt' },
          { text: 'Core Concepts', link: '/core-concepts' },
          { text: 'Apps Overview', link: '/user-guides/apps' },
        ],
      },
      {
        text: 'User Guides',
        items: [
          { text: 'Overview', link: '/user-guides/' },
          { text: 'Field Service', link: '/user-guides/field-service/' },
          { text: 'Sales', link: '/user-guides/sales/' },
          { text: 'Operations', link: '/user-guides/operations/' },
          { text: 'Accounting & Finance', link: '/user-guides/accounting/' },
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

      '/user-guides/field-service/': [
        {
          text: 'Field Service',
          items: [
            { text: 'Overview', link: '/user-guides/field-service/' },
            { text: 'Your Daily Workflow', link: '/user-guides/field-service/daily-workflow' },
            { text: 'Viewing Your Schedule', link: '/user-guides/field-service/schedule' },
            { text: 'Service Requests', link: '/user-guides/field-service/service-requests' },
            { text: 'Time Tracking & Per Diem', link: '/user-guides/field-service/time-tracking' },
            { text: 'Logging Parts & Materials', link: '/user-guides/field-service/parts' },
            { text: 'Completing Service Checklists', link: '/user-guides/field-service/checklists' },
            { text: 'Emergency Dispatch (FSE View)', link: '/user-guides/field-service/emergency-dispatch' },
          ],
        },
      ],

      '/user-guides/sales/': [
        {
          text: 'Sales',
          items: [
            { text: 'Overview', link: '/user-guides/sales/' },
            { text: '[TODO] Quoting & Proposals', link: '/user-guides/sales/quoting' },
            { text: '[TODO] System Sale End-to-End', link: '/user-guides/sales/system-sale' },
            { text: '[TODO] Service Contract Sale', link: '/user-guides/sales/service-contract-sale' },
            { text: '[TODO] Pipeline & Forecasting', link: '/user-guides/sales/pipeline' },
          ],
        },
      ],

      '/user-guides/operations/': [
        {
          text: 'Operations',
          items: [
            { text: 'Overview', link: '/user-guides/operations/' },
            { text: 'Weekly Timesheet Validation', link: '/user-guides/operations/timesheet-management' },
            { text: 'Dispatch & Scheduling', link: '/user-guides/operations/dispatch' },
            { text: '[TODO] System Registry', link: '/user-guides/operations/system-registry' },
            { text: '[TODO] Service Request Management', link: '/user-guides/operations/service-requests' },
            { text: '[TODO] Contract Management', link: '/user-guides/operations/contracts' },
            { text: '[TODO] Receiving & System Intake', link: '/user-guides/operations/receiving' },
            { text: '[In Progress] Inventory Status Report', link: '/user-guides/operations/inventory-status-report' },
            { text: 'Tracking Parts Costs to Contracts', link: '/user-guides/operations/inventory-analytics' },
          ],
        },
      ],

      '/user-guides/accounting/': [
        {
          text: 'Accounting & Finance',
          items: [
            { text: 'Overview', link: '/user-guides/accounting/' },
            { text: 'Posting Timesheets to GL', link: '/user-guides/accounting/timesheet-posting' },
            { text: 'Task-Level Cost Tracking', link: '/user-guides/accounting/task-analytics' },
            { text: 'Per Diem Administration', link: '/user-guides/accounting/per-diem' },
            { text: '[TODO] Service Contract Revenue', link: '/user-guides/accounting/contract-revenue' },
            { text: '[TODO] Monthly Financial Close', link: '/user-guides/accounting/financial-close' },
          ],
        },
      ],

      // Overview — matched only when on /user-guides/ exactly (shortest prefix).
      // Each role's sidebar takes over for deeper paths above.
      '/user-guides/': [
        {
          text: 'User Guides',
          items: [
            { text: 'Overview', link: '/user-guides/' },
            { text: 'Field Service', link: '/user-guides/field-service/' },
            { text: 'Sales', link: '/user-guides/sales/' },
            { text: 'Operations', link: '/user-guides/operations/' },
            { text: 'Accounting & Finance', link: '/user-guides/accounting/' },
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
