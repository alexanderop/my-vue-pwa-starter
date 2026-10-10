import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Result } from '@starter/result'
import { StorageUnavailable } from '@starter/composables'
import { t } from '../../../i18n/testing'
import { closeSettingsRepositories, renderSettings } from './testing'

describe('given the Language page', () => {
  afterEach(closeSettingsRepositories)

  it('should offer System and each language by its own name', async () => {
    await renderSettings('/settings/language', { language: 'de' })
    for (const name of [t('settings.language.system'), 'English', 'Deutsch'])
      await expect
        .element(page.getByRole('radio', { name, exact: true }))
        .toBeInTheDocument()
    await expect
      .element(page.getByRole('radio', { name: 'Deutsch' }))
      .toBeChecked()
  })

  describe('when choosing a language', () => {
    it('should save its id and stay silent', async () => {
      const chosen: string[] = []
      await renderSettings('/settings/language', {
        setLanguage: (language) => {
          chosen.push(language)
          return Result.ok()
        },
      })
      await page.getByRole('radio', { name: 'Deutsch' }).click()
      expect(chosen).toEqual(['de'])
      await expect
        .element(page.getByTestId('language-status'))
        .toBeEmptyDOMElement()
    })

    it('should explain a failed save', async () => {
      await renderSettings('/settings/language', {
        setLanguage: () => Result.err(new StorageUnavailable({ key: 'k' })),
      })
      await page.getByRole('radio', { name: 'English' }).click()
      await expect
        .element(page.getByText(t('settings.saveErrors.StorageUnavailable')))
        .toBeVisible()
    })
  })
})
