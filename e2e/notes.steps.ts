import { expect, test } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { openSetting } from './settings'
import { t } from '../apps/playground/src/i18n/testing'

const { Given, When, Then } = createBdd()

Given('I open a fresh notebook', async ({ page, request }) => {
  await request.post('/__test/version?value=1')
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: t('notes.newNote'), exact: true }),
  ).toBeVisible()
})

When(
  'I create a note titled {string} with body {string}',
  async ({ page }, title: string, body: string) => {
    await page
      .getByRole('button', { name: t('notes.newNote'), exact: true })
      .click()
    const dialog = page.getByRole('dialog', {
      name: t('notes.editor.newTitle'),
      exact: true,
    })
    await dialog
      .getByRole('textbox', { name: t('notes.editor.title'), exact: true })
      .fill(title)
    await dialog
      .getByRole('textbox', { name: t('notes.editor.body'), exact: true })
      .fill(body)
    await dialog
      .getByRole('button', { name: t('notes.editor.save'), exact: true })
      .click()
    await expect(dialog).not.toBeVisible()
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible()
  },
)

When(
  'I edit {string} to {string} with body {string}',
  async ({ page }, oldTitle: string, title: string, body: string) => {
    await page
      .getByRole('button', {
        name: t('notes.card.edit', { title: oldTitle }),
        exact: true,
      })
      .click()
    const dialog = page.getByRole('dialog', {
      name: t('notes.editor.editTitle'),
      exact: true,
    })
    await dialog
      .getByRole('textbox', { name: t('notes.editor.title'), exact: true })
      .fill(title)
    await dialog
      .getByRole('textbox', { name: t('notes.editor.body'), exact: true })
      .fill(body)
    await dialog
      .getByRole('button', { name: t('notes.editor.save'), exact: true })
      .click()
    await expect(dialog).not.toBeVisible()
  },
)
When('I reload the notebook', async ({ page }) => {
  await page.reload()
})
Then(
  'I see the note {string} with body {string}',
  async ({ page }, title: string, body: string) => {
    await page
      .getByRole('button', { name: t('app.nav.notes'), exact: true })
      .click()
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible()
    await expect(page.getByText(body, { exact: true })).toBeVisible()
  },
)
When('I search for {string}', async ({ page }, query: string) => {
  await page
    .getByRole('searchbox', { name: t('notes.search.label'), exact: true })
    .fill(query)
})
Then('I see no matching notes', async ({ page }) => {
  await expect(
    page.getByText(t('notes.noResults.title'), { exact: true }),
  ).toBeVisible()
})
When('the notebook is ready offline', async ({ page }) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
})
When(
  'I disconnect from the network and reopen the notebook',
  async ({ page, context }) => {
    await context.setOffline(true)
    await page.goto('/')
  },
)
When('I start an unsaved note', async ({ page }) => {
  await page
    .getByRole('button', { name: t('notes.newNote'), exact: true })
    .click()
  await page
    .getByRole('textbox', { name: t('notes.editor.title'), exact: true })
    .fill('Unfinished thought')
  await page
    .getByRole('textbox', { name: t('notes.editor.body'), exact: true })
    .fill('Do not reload this draft.')
})

When('I pin {string}', async ({ page }, title: string) => {
  await page
    .getByRole('button', {
      name: t('notes.card.pin', { title }),
      exact: true,
    })
    .click()
})
Then('{string} is pinned', async ({ page }, title: string) => {
  await expect(
    page.getByRole('button', {
      name: t('notes.card.unpin', { title }),
      exact: true,
    }),
  ).toBeVisible()
})
Then('the mobile notebook fits the screen', async ({ page }) => {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: test.info().outputPath('mobile-notes.png'),
    fullPage: true,
  })
  await page
    .getByRole('button', { name: t('notes.newNote'), exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: test.info().outputPath('mobile-editor.png'),
    fullPage: true,
  })
  await page
    .getByRole('button', { name: t('notes.editor.cancel'), exact: true })
    .click()
})
When('I choose the dark theme and reload', async ({ page }) => {
  await openSetting(page, t('settings.appearance.title'))
  await page
    .getByRole('radio', {
      name: t('settings.appearance.themes.dark'),
      exact: true,
    })
    .check()
  await page.reload()
})
Then('the dark theme is remembered', async ({ page }) => {
  await expect(
    page.getByRole('radio', {
      name: t('settings.appearance.themes.dark'),
      exact: true,
    }),
  ).toBeChecked()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.screenshot({
    path: test.info().outputPath('mobile-settings-dark.png'),
    fullPage: true,
  })
})
When('I delete {string}', async ({ page }, title: string) => {
  await page
    .getByRole('button', { name: t('app.nav.notes'), exact: true })
    .click()
  await page
    .getByRole('button', {
      name: t('notes.card.delete', { title }),
      exact: true,
    })
    .click()
  await page
    .getByRole('button', { name: t('notes.remove.trashAction'), exact: true })
    .click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})
Then('the notebook is empty', async ({ page }) => {
  await expect(
    page.getByRole('heading', {
      name: t('notes.empty.title'),
      exact: true,
    }),
  ).toBeVisible()
})

When('I visit another page and return with browser Back', async ({ page }) => {
  await page.evaluate(() => {
    window.addEventListener('pageshow', (event) => {
      document.documentElement.dataset.restoredFromCache = String(
        event.persisted,
      )
    })
  })
  await page.goto('http://127.0.0.1:42786/')
  await expect(
    page.getByRole('heading', { name: 'Another page' }),
  ).toBeVisible()
  await page.goBack({ waitUntil: 'commit' })
})
Then('the notebook was restored from the browser cache', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute(
    'data-restored-from-cache',
    'true',
  )
})

Then('swiping the sheet cannot silently discard my draft', async ({ page }) => {
  const handle = page.locator('.ui-dialog__handle')
  const bounds = await handle.boundingBox()
  if (!bounds) throw new Error('Sheet handle is missing')
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 130, {
    steps: 8,
  })
  await page.mouse.up()
  await expect(
    page.getByRole('dialog', {
      name: t('notes.editor.newTitle'),
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('textbox', { name: t('notes.editor.title'), exact: true }),
  ).toHaveValue('Unfinished thought')
  await expect(page.locator('.ui-dialog')).not.toHaveAttribute(
    'style',
    /translateY/,
  )
  await page
    .getByRole('textbox', { name: t('notes.editor.body'), exact: true })
    .focus()
  await page.keyboard.press('Control+Enter')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Unfinished thought', exact: true }),
  ).toBeVisible()
})
