import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Result } from '@starter/result'
import { StorageQuotaExceeded, StorageUnavailable } from '@starter/composables'
import { closeSettingsRepositories, renderSettings } from './testing'

const quota = new StorageQuotaExceeded({ key: 'k' })
const unavailable = new StorageUnavailable({ key: 'k' })
const failures = [
  [quota, 'Storage is full. This theme lasts until you close the app.'],
  [
    unavailable,
    'This browser blocks saving. This theme lasts until you close the app.',
  ],
] as const

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
      await page.getByRole('radio', { name: 'Dark' }).click()
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
        await page.getByRole('radio', { name: 'Dark' }).click()
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
      await page.getByRole('radio', { name: 'Violet' }).click()
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
        await page.getByRole('radio', { name: 'Pink' }).click()
        await expect.element(page.getByText(message)).toBeVisible()
      },
    )

    it('should offer every accent as a named radio', async () => {
      await renderSettings('/settings/appearance', { accent: 'teal' })
      for (const name of ['Blue', 'Teal', 'Violet', 'Pink', 'Sand'])
        await expect
          .element(page.getByRole('radio', { name, exact: true }))
          .toBeInTheDocument()
      await expect
        .element(page.getByRole('radio', { name: 'Teal' }))
        .toBeChecked()
    })
  })
})
