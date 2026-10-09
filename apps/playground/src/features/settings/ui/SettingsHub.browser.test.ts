import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { closeSettingsRepositories, renderSettings } from './testing'
import { settingsSections } from './sections'

describe('given the Settings hub', () => {
  afterEach(closeSettingsRepositories)

  it('should link to a page for every section', async () => {
    await renderSettings('/settings')
    expect(settingsSections).toHaveLength(5)
    for (const { title } of settingsSections)
      await expect
        .element(page.getByRole('link', { name: title, exact: false }))
        .toBeVisible()
  })

  it('should summarise the current choices on the rows', async () => {
    await renderSettings('/settings', { theme: 'dark', accent: 'pink' })
    await expect
      .element(page.getByText('Dark · Pink', { exact: true }))
      .toBeVisible()
    await expect.element(page.getByText('test', { exact: true })).toBeVisible()
  })

  it('should show Installed once the app is installed', async () => {
    await renderSettings('/settings', {
      pwa: {
        installed: { value: true },
        canInstall: { value: false },
        offlineReady: { value: false },
        updateAvailable: { value: false },
        checking: { value: false },
        status: { value: '' },
        install: async () => {},
        checkForUpdates: async () => {},
      },
    })
    await expect
      .element(page.getByText('Installed', { exact: true }))
      .toBeVisible()
    await expect
      .element(page.getByText('Preparing', { exact: true }))
      .toBeVisible()
  })

  describe('when opening a row', () => {
    it('should open its page, and the back link should return to the hub', async () => {
      const { router } = await renderSettings('/settings')
      await page.getByRole('link', { name: 'Appearance', exact: false }).click()
      await expect
        .element(page.getByRole('heading', { name: 'Appearance' }))
        .toBeVisible()
      expect(router.currentRoute.value.path).toBe('/settings/appearance')
      await page.getByRole('link', { name: 'Settings' }).click()
      await expect
        .element(page.getByRole('heading', { name: 'Settings' }))
        .toBeVisible()
      expect(router.currentRoute.value.name).toBe('settings')
    })

    it.each([
      ['Add to Home Screen', 'Keep Fieldnotes close'],
      ['Updates & offline', 'Version test'],
      ['Export backup', 'Back up your notes'],
      ['Import backup', 'Restore from a backup'],
    ])('should show the %s page', async (row, text) => {
      await renderSettings('/settings')
      await page.getByRole('link', { name: row, exact: false }).click()
      await expect.element(page.getByText(text, { exact: true })).toBeVisible()
    })
  })
})

describe('given the Updates page', () => {
  afterEach(closeSettingsRepositories)

  it('should check for updates on request and relay the status', async () => {
    let checks = 0
    await renderSettings('/settings/updates', {
      pwa: {
        installed: { value: false },
        canInstall: { value: false },
        offlineReady: { value: true },
        updateAvailable: { value: false },
        checking: { value: false },
        status: { value: 'You are up to date.' },
        install: async () => {},
        checkForUpdates: async () => {
          checks += 1
        },
      },
    })
    await page.getByRole('button', { name: 'Check for updates' }).click()
    expect(checks).toBe(1)
    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent('You are up to date.')
  })
})

describe('given the Add to Home Screen page', () => {
  afterEach(closeSettingsRepositories)

  it('should offer the install prompt when the browser provides one', async () => {
    let installs = 0
    await renderSettings('/settings/install', {
      pwa: {
        installed: { value: false },
        canInstall: { value: true },
        offlineReady: { value: true },
        updateAvailable: { value: false },
        checking: { value: false },
        status: { value: '' },
        install: async () => {
          installs += 1
        },
        checkForUpdates: async () => {},
      },
    })
    await page.getByRole('button', { name: 'Install Fieldnotes' }).click()
    expect(installs).toBe(1)
  })

  it('should show steps for the platform picked by hand', async () => {
    await renderSettings('/settings/install')
    await page.getByRole('radio', { name: 'Android' }).click()
    await expect
      .element(page.getByText('Open this page in Chrome.'))
      .toBeVisible()
  })
})
