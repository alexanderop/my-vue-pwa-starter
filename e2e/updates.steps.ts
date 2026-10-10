import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { t } from '../apps/playground/src/i18n/testing'
import { openSetting } from './settings'

const { When, Then } = createBdd()

When('a new version becomes available', async ({ page, request }) => {
  await request.post('/__test/version?value=2')
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready
    await registration.update()
  })
  await page.waitForFunction(async () =>
    Boolean((await navigator.serviceWorker.getRegistration())?.waiting),
  )
})
Then('I can postpone the update', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: t('app.update.now'), exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: t('app.update.later'), exact: true })
    .click()
  await openSetting(page, t('settings.updates.title'))
  await expect(
    page.getByText(t('settings.updates.version', { version: '1' }), {
      exact: true,
    }),
  ).toBeVisible()
})
When('I accept the update', async ({ page }) => {
  await openSetting(page, t('settings.updates.title'))
  await page
    .getByRole('button', { name: t('settings.updates.check'), exact: true })
    .click()
  await page
    .getByRole('button', { name: t('app.update.now'), exact: true })
    .click()
})
Then(
  'the notebook runs version {string}',
  async ({ page }, version: string) => {
    await openSetting(page, t('settings.updates.title'))
    await expect(
      page.getByText(t('settings.updates.version', { version }), {
        exact: true,
      }),
    ).toBeVisible()
  },
)
Then(
  'the draft is preserved and the update cannot reload it',
  async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: t('notes.editor.title'), exact: true }),
    ).toHaveValue('Unfinished thought')
    await expect(
      page.getByRole('textbox', { name: t('notes.editor.body'), exact: true }),
    ).toHaveValue('Do not reload this draft.')
    const update = page.getByRole('button', {
      name: t('app.update.now'),
      exact: true,
      includeHidden: true,
    })
    await expect(update).toBeDisabled()
  },
)

When(
  'another tab installs a new version',
  async ({ page, context, request }) => {
    const updater = await context.newPage()
    await updater.goto('/#/settings')
    await openSetting(updater, t('settings.updates.title'))
    await expect(
      updater.getByText(t('settings.updates.version', { version: '1' }), {
        exact: true,
      }),
    ).toBeVisible()
    await request.post('/__test/version?value=2')
    await updater
      .getByRole('button', { name: t('settings.updates.check'), exact: true })
      .click()
    await updater
      .getByRole('button', { name: t('app.update.now'), exact: true })
      .click()
    await expect(
      updater.getByText(t('settings.updates.version', { version: '2' }), {
        exact: true,
      }),
    ).toBeVisible()
    await page.bringToFront()
    await updater.close()
  },
)
When('I save the preserved draft and update this tab', async ({ page }) => {
  await page
    .getByRole('button', { name: t('notes.editor.save'), exact: true })
    .click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await openSetting(page, t('settings.updates.title'))
  await expect(
    page.getByText(t('settings.updates.version', { version: '1' }), {
      exact: true,
    }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: t('app.update.now'), exact: true })
    .click()
})
