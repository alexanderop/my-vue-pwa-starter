import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { list, t } from '../../../i18n/testing'
import { closeSettingsRepositories, renderSettings } from './testing'
import { sectionTitle, settingsSections } from './sections'

describe('given the Settings hub', () => {
  afterEach(closeSettingsRepositories)

  it('should link to a page for every section', async () => {
    await renderSettings('/settings')
    expect(settingsSections).toHaveLength(6)
    for (const section of settingsSections)
      await expect
        .element(
          page.getByRole('link', {
            name: t(sectionTitle(section)),
            exact: false,
          }),
        )
        .toBeVisible()
  })

  it('should summarise the current choices on the rows', async () => {
    await renderSettings('/settings', { theme: 'dark', accent: 'pink' })
    await expect
      .element(
        page.getByText(
          t('settings.appearance.summary', {
            theme: t('settings.appearance.themes.dark'),
            accent: t('settings.appearance.accents.pink'),
          }),
          { exact: true },
        ),
      )
      .toBeVisible()
    await expect.element(page.getByText('test', { exact: true })).toBeVisible()
  })

  it('should show Installed once the app is installed', async () => {
    await renderSettings('/settings', {
      pwa: {
        installed: { value: true },
        canInstall: { value: false },
        offlineSupported: { value: true },
        offlineReady: { value: false },
        updateAvailable: { value: false },
        checking: { value: false },
        status: { value: null },
        install: async () => {},
        checkForUpdates: async () => {},
      },
    })
    await expect
      .element(page.getByText(t('settings.install.installed'), { exact: true }))
      .toBeVisible()
    await expect
      .element(page.getByText(t('settings.preparing'), { exact: true }))
      .toBeVisible()
  })

  it('should show Unavailable instead of Preparing when offline use is not supported', async () => {
    await renderSettings('/settings', {
      pwa: {
        installed: { value: false },
        canInstall: { value: false },
        offlineSupported: { value: false },
        offlineReady: { value: false },
        updateAvailable: { value: false },
        checking: { value: false },
        status: { value: null },
        install: async () => {},
        checkForUpdates: async () => {},
      },
    })
    await expect
      .element(page.getByText(t('settings.unavailable'), { exact: true }))
      .toBeVisible()
    await expect
      .element(page.getByText(t('settings.preparing'), { exact: true }))
      .not.toBeInTheDocument()
  })

  describe('when opening a row', () => {
    it('should open its page, and the back link should return to the hub', async () => {
      const { router } = await renderSettings('/settings')
      const appearance = t('settings.appearance.title')
      await page.getByRole('link', { name: appearance, exact: false }).click()
      await expect
        .element(page.getByRole('heading', { name: appearance }))
        .toBeVisible()
      expect(router.currentRoute.value.path).toBe('/settings/appearance')
      await page.getByRole('link', { name: t('settings.back') }).click()
      await expect
        .element(page.getByRole('heading', { name: t('settings.title') }))
        .toBeVisible()
      expect(router.currentRoute.value.name).toBe('settings')
    })

    it.each([
      [t('settings.install.title'), t('settings.install.heading')],
      [
        t('settings.updates.title'),
        t('settings.updates.version', { version: 'test' }),
      ],
      [t('settings.export.title'), t('settings.export.heading')],
      [t('settings.import.title'), t('settings.import.heading')],
      [t('settings.language.title'), t('settings.language.help')],
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
        offlineSupported: { value: true },
        offlineReady: { value: true },
        updateAvailable: { value: false },
        checking: { value: false },
        status: { value: 'upToDate' },
        install: async () => {},
        checkForUpdates: async () => {
          checks += 1
        },
      },
    })
    await page
      .getByRole('button', { name: t('settings.updates.check') })
      .click()
    expect(checks).toBe(1)
    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent(t('settings.updates.status.upToDate'))
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
        offlineSupported: { value: true },
        offlineReady: { value: true },
        updateAvailable: { value: false },
        checking: { value: false },
        status: { value: null },
        install: async () => {
          installs += 1
        },
        checkForUpdates: async () => {},
      },
    })
    await page
      .getByRole('button', { name: t('settings.install.action') })
      .click()
    expect(installs).toBe(1)
  })

  it('should show steps for the platform picked by hand', async () => {
    await renderSettings('/settings/install')
    await page
      .getByRole('radio', { name: t('settings.install.platforms.android') })
      .click()
    for (const step of list('settings.install.steps.android'))
      await expect.element(page.getByText(step)).toBeVisible()
  })
})
