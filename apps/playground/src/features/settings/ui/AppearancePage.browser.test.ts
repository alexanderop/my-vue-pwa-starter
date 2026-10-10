import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Result } from '@starter/result'
import { StorageQuotaExceeded, StorageUnavailable } from '@starter/composables'
import { t } from '../../../i18n/testing'
import { accents } from '../domain/appearance'
import { closeSettingsRepositories, renderSettings } from './testing'

const quota = new StorageQuotaExceeded({ key: 'k' })
const unavailable = new StorageUnavailable({ key: 'k' })
const failures = [
  [quota, t('settings.saveErrors.StorageQuotaExceeded')],
  [unavailable, t('settings.saveErrors.StorageUnavailable')],
] as const
const dark = t('settings.appearance.themes.dark')

describe('given the Appearance page', () => {
  afterEach(closeSettingsRepositories)

  describe('when choosing a mode', () => {
    it('should save it and stay silent', async () => {
      const chosen: string[] = []
      await renderSettings('/settings/appearance', {
        setTheme: (theme) => {
          chosen.push(theme)
          return Result.ok()
        },
      })
      await page.getByRole('radio', { name: dark }).click()
      expect(chosen).toEqual(['dark'])
      await expect
        .element(page.getByTestId('theme-status'))
        .toBeEmptyDOMElement()
    })

    it.each(failures)(
      'should explain a failed save (%s)',
      async (error, message) => {
        await renderSettings('/settings/appearance', {
          setTheme: () => Result.err(error),
        })
        await page.getByRole('radio', { name: dark }).click()
        await expect.element(page.getByText(message)).toBeVisible()
      },
    )
  })

  describe('when choosing an accent colour', () => {
    it('should save the chosen id and stay silent', async () => {
      const chosen: string[] = []
      await renderSettings('/settings/appearance', {
        setAccent: (accent) => {
          chosen.push(accent)
          return Result.ok()
        },
      })
      await page
        .getByRole('radio', { name: t('settings.appearance.accents.violet') })
        .click()
      expect(chosen).toEqual(['violet'])
      await expect
        .element(page.getByTestId('theme-status'))
        .toBeEmptyDOMElement()
    })

    it.each(failures)(
      'should explain a failed save (%s)',
      async (error, message) => {
        await renderSettings('/settings/appearance', {
          setAccent: () => Result.err(error),
        })
        await page
          .getByRole('radio', { name: t('settings.appearance.accents.pink') })
          .click()
        await expect.element(page.getByText(message)).toBeVisible()
      },
    )

    it('should offer every accent as a named radio', async () => {
      await renderSettings('/settings/appearance', { accent: 'teal' })
      for (const id of accents)
        await expect
          .element(
            page.getByRole('radio', {
              name: t(`settings.appearance.accents.${id}`),
              exact: true,
            }),
          )
          .toBeInTheDocument()
      await expect
        .element(
          page.getByRole('radio', {
            name: t('settings.appearance.accents.teal'),
          }),
        )
        .toBeChecked()
    })
  })
})
