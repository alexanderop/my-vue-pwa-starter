import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { t, translator } from '../apps/playground/src/i18n/testing'
import { openSetting } from './settings'

const { When, Then } = createBdd()
const { t: de } = translator('de')

When('I switch the language to German and reload', async ({ page }) => {
  await openSetting(page, t('settings.language.title'))
  await page.getByRole('radio', { name: 'Deutsch', exact: true }).check()
  await page.reload()
})

Then('the notebook is shown in German', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(
    page.getByRole('radio', { name: 'Deutsch', exact: true }),
  ).toBeChecked()
  await page
    .getByRole('button', { name: de('app.nav.notes'), exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: de('notes.title'), exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: de('notes.newNote'), exact: true }),
  ).toBeVisible()
})
