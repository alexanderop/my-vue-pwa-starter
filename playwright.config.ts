import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

// Steps look up text with vue-i18n in Node, where no bundler defines its flags.
Object.assign(globalThis, { __VUE_I18N_LEGACY_API__: false })

const testDir = defineBddConfig({
  features: 'e2e/*.feature',
  steps: 'e2e/*.steps.ts',
})

export default defineConfig({
  testDir,
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:42785',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      testIgnore: '**/mobile.feature.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: { ignoreDefaultArgs: ['--disable-back-forward-cache'] },
      },
    },
    {
      name: 'chrome-mobile',
      testMatch: '**/mobile.feature.spec.js',
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'node scripts/serve-e2e.mjs',
    url: 'http://127.0.0.1:42785',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
