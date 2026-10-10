import type { Page } from '@playwright/test'
import { t } from '../apps/playground/src/i18n/testing'

// Settings is a hub of rows, so every settings step goes hub first, then row.
export async function openSetting(page: Page, row: string) {
  await page
    .getByRole('button', { name: t('app.nav.settings'), exact: true })
    .click()
  await page.getByRole('link', { name: row }).click()
}
