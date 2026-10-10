import { expect, type Page } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { t, translator } from '../apps/playground/src/i18n/testing'
import { openSetting } from './settings'

const { When, Then } = createBdd()
const { t: de } = translator('de')

async function expectGermanNotebook(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await page
    .getByRole('button', { name: de('app.nav.notes'), exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: de('notes.title'), exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: de('notes.newNote'), exact: true }),
  ).toBeVisible()
}

When('I switch the language to German', async ({ page }) => {
  await openSetting(page, t('settings.language.title'))
  await page.getByRole('radio', { name: 'Deutsch', exact: true }).check()
})

Then('the notebook is shown in German without reloading', async ({ page }) => {
  await expect(
    page.getByRole('heading', {
      name: de('settings.language.title'),
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: de('settings.back') }),
  ).toBeVisible()
  await expectGermanNotebook(page)
})

Then('the notebook is still shown in German', async ({ page }) => {
  await expectGermanNotebook(page)
})

Then(
  'a German browser shows the notebook in German without a stored choice',
  async ({ browser, baseURL }) => {
    if (!baseURL) throw new Error('The e2e config sets no baseURL')
    const context = await browser.newContext({
      locale: 'de-DE',
      baseURL,
    })
    const page = await context.newPage()
    await page.goto('/')
    expect(
      await page.evaluate(() => localStorage.getItem('fieldnotes-language')),
    ).toBeNull()
    await expectGermanNotebook(page)
    await context.close()
  },
)
